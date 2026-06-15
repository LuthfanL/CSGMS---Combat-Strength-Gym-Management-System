<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\MembershipPackage;
use App\Models\Membership;
use App\Models\GymSetting;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceMail;

class PaymentController extends Controller
{
    // --- Member Endpoints ---

    public function indexMember(Request $request)
    {
        $user = $request->user();
        if (!$user->member) {
            return response()->json(['message' => 'Hanya member yang dapat melihat riwayat transaksi.'], 403);
        }

        $payments = Payment::with('package')
            ->where('idMember', $user->member->idMember)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                $statusLabel = 'Menunggu';
                if ($payment->status === 'paid') $statusLabel = 'Lunas';
                if ($payment->status === 'cancel') $statusLabel = 'Dibatalkan';

                return [
                    'id' => $payment->invoice,
                    'package' => $payment->package ? $payment->package->name : 'Membership',
                    'amount' => number_format($payment->amount, 0, ',', '.'),
                    'method' => strtoupper($payment->payment_method),
                    'status' => $statusLabel,
                    'date' => $this->formatDate($payment->created_at),
                ];
            });

        $gymSettings = GymSetting::first();

        return response()->json([
            'payments' => $payments,
            'gym' => $gymSettings
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'idPackage' => 'required|exists:membership_packages,idPackage',
            'payment_method' => 'required|in:cash,qris',
        ]);

        $user = $request->user();
        if (!$user->member) {
            return response()->json(['message' => 'Hanya member yang dapat membuat transaksi.'], 403);
        }

        $package = MembershipPackage::findOrFail($request->idPackage);

        // Check if member already has a pending payment
        $existingPending = Payment::where('idMember', $user->member->idMember)
            ->where('status', 'pending')
            ->first();

        if ($existingPending) {
            // Determine payment type
            $activeMembership = $user->member->activeMembership;
            $paymentType = $activeMembership ? 'renew_membership' : 'new_membership';

            // Update the existing pending payment instead of creating a new one
            $existingPending->update([
                'idPackage' => $package->idPackage,
                'payment_type' => $paymentType,
                'payment_method' => strtolower($request->payment_method),
                'amount' => $package->price,
            ]);

            return response()->json([
                'message' => 'Pesanan berhasil diperbarui.',
                'invoice' => $existingPending->invoice,
                'payment' => $existingPending
            ], 200);
        }

        // Generate Invoice INV-YYYYMMDD-XXX
        $datePrefix = date('Ymd');
        
        // Find the last payment of today to determine the sequence number
        $lastPaymentToday = Payment::where('invoice', 'like', 'INV-' . $datePrefix . '-%')
            ->orderBy('invoice', 'desc')
            ->first();

        if ($lastPaymentToday) {
            // Extract the last sequence and increment
            $lastSequence = (int) substr($lastPaymentToday->invoice, -3);
            $newSequence = str_pad($lastSequence + 1, 3, '0', STR_PAD_LEFT);
        } else {
            // First transaction of the day
            $newSequence = '001';
        }

        $invoice = 'INV-' . $datePrefix . '-' . $newSequence;

        // Determine payment type
        $activeMembership = $user->member->activeMembership;
        $paymentType = $activeMembership ? 'renew_membership' : 'new_membership';

        $payment = Payment::create([
            'invoice' => $invoice,
            'idMember' => $user->member->idMember,
            'idPackage' => $package->idPackage,
            'payment_type' => $paymentType,
            'payment_method' => strtolower($request->payment_method),
            'amount' => $package->price,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'invoice' => $payment->invoice,
            'payment' => $payment
        ], 201);
    }

    public function show($invoice)
    {
        $payment = Payment::with('package')->where('invoice', $invoice)->firstOrFail();
        
        // Ensure only the owner of the payment can view it (if they are a member)
        if (auth()->user()->role === 'member' && auth()->user()->member->idMember !== $payment->idMember) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'payment' => $payment
        ]);
    }

    // --- Owner Endpoints ---

    public function indexOwner(Request $request)
    {
        $query = Payment::with(['member.user', 'guest', 'package']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice', 'like', "%{$search}%")
                  ->orWhereHas('member.user', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('guest', function ($q3) use ($search) {
                      $q3->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($method = $request->input('method')) {
            $query->where('payment_method', $method);
        }

        if ($period = $request->input('period')) {
            $now = \Carbon\Carbon::now();
            if ($period === 'today') {
                $query->whereDate('created_at', $now->toDateString());
            } elseif ($period === 'week') {
                $query->whereBetween('created_at', [$now->startOfWeek()->toDateString(), $now->endOfWeek()->toDateString()]);
            } elseif ($period === 'month') {
                $query->whereMonth('created_at', $now->month)->whereYear('created_at', $now->year);
            } elseif ($period === 'year') {
                $query->whereYear('created_at', $now->year);
            }
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(10);

        // Transform the collection inside the paginator
        $payments->getCollection()->transform(function ($payment) {
            $typeName = 'Lainnya';
            if ($payment->payment_type === 'new_membership' || $payment->payment_type === 'renew_membership') {
                $typeName = $payment->package ? $payment->package->name : 'Membership';
            } elseif ($payment->payment_type === 'guest') {
                $typeName = 'Guest Harian';
            }

            $statusLabel = 'Menunggu';
            if ($payment->status === 'paid') $statusLabel = 'Lunas';
            if ($payment->status === 'cancel') $statusLabel = 'Dibatalkan';

            return [
                'idPayment' => $payment->idPayment,
                'invoice' => $payment->invoice,
                'member_name' => $payment->member ? $payment->member->user->name : ($payment->guest ? $payment->guest->name : 'Unknown'),
                'customer_type' => $payment->member ? 'Member' : ($payment->guest ? 'Guest' : 'Unknown'),
                'type' => $typeName,
                'method' => strtoupper($payment->payment_method),
                'amount' => $payment->amount,
                'status' => $statusLabel,
                'created_at' => $this->formatDate($payment->created_at),
                'raw_status' => $payment->status
            ];
        });

        return response()->json($payments);
    }

    // --- Admin Endpoints ---

    public function indexAdmin()
    {
        $payments = Payment::with(['member.user', 'guest', 'package'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                
                $typeName = 'Lainnya';
                if ($payment->payment_type === 'new_membership' || $payment->payment_type === 'renew_membership') {
                    $typeName = $payment->package ? $payment->package->name : 'Membership';
                } elseif ($payment->payment_type === 'guest') {
                    $typeName = 'Guest Harian';
                }

                $statusLabel = 'Menunggu';
                if ($payment->status === 'paid') $statusLabel = 'Lunas';
                if ($payment->status === 'cancel') $statusLabel = 'Dibatalkan';

                return [
                    'id' => $payment->idPayment,
                    'invoice' => $payment->invoice,
                    'date' => $this->formatDate($payment->created_at),
                    'member' => $payment->member ? $payment->member->user->name : ($payment->guest ? $payment->guest->name : '-'),
                    'code' => $payment->member ? $payment->member->member_code : 'Guest',
                    'type' => $typeName,
                    'method' => strtoupper($payment->payment_method),
                    'amount' => $payment->amount,
                    'status' => $statusLabel,
                    'created_at' => $payment->created_at,
                    'raw_status' => $payment->status
                ];
            });

        $gymSettings = GymSetting::first();

        return response()->json([
            'payments' => $payments,
            'gym' => $gymSettings
        ]);
    }

    private function formatDate($date)
    {
        Carbon::setLocale('id');
        return Carbon::parse($date)->translatedFormat('d F Y, H:i');
    }

    public function confirm($id)
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'Pembayaran ini tidak dalam status Pending.'], 400);
        }

        $payment->status = 'paid';
        $payment->paid_at = now();
        $payment->verified_by = auth()->id();
        $payment->save();

        // If it's a membership payment, create or extend membership
        if (in_array($payment->payment_type, ['new_membership', 'renew_membership']) && $payment->idMember && $payment->idPackage) {
            $member = $payment->member;
            $package = $payment->package;

            // Generate member_code if they don't have one
            if (!$member->member_code) {
                $lastMember = \App\Models\Member::whereNotNull('member_code')
                    ->orderBy('member_code', 'desc')
                    ->first();
                
                if ($lastMember && preg_match('/CSGMS-(\d+)/', $lastMember->member_code, $matches)) {
                    $newSequence = str_pad((int)$matches[1] + 1, 3, '0', STR_PAD_LEFT);
                } else {
                    $newSequence = '001';
                }
                
                $member->member_code = 'CSGMS-' . $newSequence;
                $member->save();
            }

            $activeMembership = $member->activeMembership;
            $startDate = now();

            if ($activeMembership) {
                $startDate = Carbon::parse($activeMembership->end_date)->addDay();
            }
            
            $endDate = clone $startDate;
            $endDate->addMonths($package->duration);

            Membership::create([
                'idMember' => $member->idMember,
                'idPackage' => $package->idPackage,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'Aktif',
            ]);
        }

        \App\Models\AuditLog::create([
            'idUser' => auth()->id(),
            'action' => 'confirm',
            'module' => 'payment',
            'description' => "Mengonfirmasi pembayaran dengan Invoice: {$payment->invoice}",
            'old_data' => ['status' => 'pending'],
            'new_data' => ['status' => 'paid'],
        ]);

        // Send email to member if it's a member transaction
        if ($payment->member && $payment->member->user && $payment->member->user->email) {
            try {
                Mail::to($payment->member->user->email)->send(new InvoiceMail($payment));
            } catch (\Exception $e) {
                \Log::error('Failed to send invoice email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Pembayaran berhasil dikonfirmasi.',
            'payment' => $payment
        ]);
    }

    public function cancel($id)
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'Pembayaran ini tidak dapat dibatalkan.'], 400);
        }

        $payment->status = 'cancel';
        $payment->save();

        \App\Models\AuditLog::create([
            'idUser' => auth()->id(),
            'action' => 'cancel',
            'module' => 'payment',
            'description' => "Membatalkan pembayaran dengan Invoice: {$payment->invoice}",
            'old_data' => ['status' => 'pending'],
            'new_data' => ['status' => 'cancel'],
        ]);

        return response()->json([
            'message' => 'Pembayaran berhasil dibatalkan.',
            'payment' => $payment
        ]);
    }
}
