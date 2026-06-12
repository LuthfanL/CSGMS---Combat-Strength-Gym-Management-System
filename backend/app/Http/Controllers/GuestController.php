<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Payment;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GuestController extends Controller
{
    public function checkin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'payment_method' => 'required|string|in:cash,qris',
            'amount' => 'required|numeric'
        ]);

        try {
            DB::beginTransaction();

            // 1. Create Guest
            $guest = Guest::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? ''
            ]);

            // 2. Create Payment
            $invoice = 'INV-' . now()->format('Ymd') . '-' . str_pad(Payment::whereDate('created_at', now()->toDateString())->count() + 1, 3, '0', STR_PAD_LEFT);

            $settings = \App\Models\GymSetting::first();
            $guestPrice = $settings ? $settings->guest_price : 15000;

            Payment::create([
                'invoice' => $invoice,
                'idGuest' => $guest->idGuest,
                'payment_type' => 'guest',
                'payment_method' => $validated['payment_method'],
                'amount' => $guestPrice,
                'status' => 'paid',
                'verified_by' => $request->user()->idUser,
                'paid_at' => now(),
            ]);

            // 3. Create Attendance
            Attendance::create([
                'attendance_type' => 'guest',
                'idGuest' => $guest->idGuest,
                'checkin_time' => now()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Guest berhasil didaftarkan dan di-checkin.'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat memproses data guest.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
