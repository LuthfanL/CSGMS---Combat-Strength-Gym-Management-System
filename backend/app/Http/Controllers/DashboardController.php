<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Attendance;
use App\Models\Member;
use Carbon\Carbon;

class DashboardController extends Controller
{
    private function calculateTrend($today, $yesterday)
    {
        if ($yesterday == 0) {
            if ($today == 0) return ['trend' => 'up', 'value' => 0];
            return ['trend' => 'up', 'value' => 100];
        }

        $diff = $today - $yesterday;
        $percent = ($diff / $yesterday) * 100;

        return [
            'trend' => $percent >= 0 ? 'up' : 'down',
            'value' => round(abs($percent))
        ];
    }

    public function getOwnerDashboard(Request $request)
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // 1. Revenue
        $revenueToday = Payment::where('status', 'paid')->whereDate('created_at', $today)->sum('amount');
        $revenueYesterday = Payment::where('status', 'paid')->whereDate('created_at', $yesterday)->sum('amount');
        $revenueTrend = $this->calculateTrend($revenueToday, $revenueYesterday);

        $memberTransactionsToday = Payment::where('status', 'paid')->whereNotNull('idMember')->whereDate('created_at', $today)->count();
        $guestTransactionsToday = Payment::where('status', 'paid')->whereNull('idMember')->whereDate('created_at', $today)->count();

        // 2. Member Attendance
        $memberAttToday = Attendance::whereNotNull('idMember')->whereDate('checkin_time', $today)->count();
        $memberAttYesterday = Attendance::whereNotNull('idMember')->whereDate('checkin_time', $yesterday)->count();
        $memberAttTrend = $this->calculateTrend($memberAttToday, $memberAttYesterday);

        // 3. Guest Attendance
        $guestAttToday = Attendance::whereNull('idMember')->whereDate('checkin_time', $today)->count();
        $guestAttYesterday = Attendance::whereNull('idMember')->whereDate('checkin_time', $yesterday)->count();
        $guestAttTrend = $this->calculateTrend($guestAttToday, $guestAttYesterday);

        // 4. Active Members
        $activeMembersCount = Member::whereHas('activeMembership', function($q) use ($today) {
            $q->whereDate('end_date', '>=', $today);
        })->whereHas('user', function($q) {
            $q->where('is_active', true);
        })->count();

        $expiringSoon = Member::whereHas('activeMembership', function($q) use ($today) {
            $q->whereDate('end_date', '>=', $today)
              ->whereDate('end_date', '<=', $today->copy()->addDays(3));
        })->whereHas('user', function($q) {
            $q->where('is_active', true);
        })->count();

        // 5. 7 Days Attendance Chart
        $attendanceChart = [];
        $dayMap = ['Sunday' => 'Minggu', 'Monday' => 'Senin', 'Tuesday' => 'Selasa', 'Wednesday' => 'Rabu', 'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayNameEn = $date->format('l');
            $dayName = $dayMap[$dayNameEn];
            
            $member = Attendance::whereNotNull('idMember')->whereDate('checkin_time', $date)->count();
            $guest = Attendance::whereNull('idMember')->whereDate('checkin_time', $date)->count();
            
            $attendanceChart[] = [
                'name' => $dayName,
                'Member' => $member,
                'Guest' => $guest
            ];
        }

        // 6. 6 Months Revenue Chart
        $revenueChart = [];
        $monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::today()->startOfMonth()->subMonths($i);
            $monthIndex = $date->month - 1;
            $monthName = $monthMap[$monthIndex];
            
            $total = Payment::where('status', 'paid')
                            ->whereYear('created_at', $date->year)
                            ->whereMonth('created_at', $date->month)
                            ->sum('amount');
                            
            $revenueChart[] = [
                'name' => $monthName,
                'Total' => (int) $total
            ];
        }

        return response()->json([
            'summary' => [
                'revenue' => [
                    'value' => $revenueToday,
                    'trend' => $revenueTrend['trend'],
                    'trendValue' => $revenueTrend['value'],
                    'memberTransactions' => $memberTransactionsToday,
                    'guestTransactions' => $guestTransactionsToday,
                ],
                'memberAttendance' => [
                    'value' => $memberAttToday,
                    'trend' => $memberAttTrend['trend'],
                    'trendValue' => $memberAttTrend['value'],
                ],
                'guestAttendance' => [
                    'value' => $guestAttToday,
                    'trend' => $guestAttTrend['trend'],
                    'trendValue' => $guestAttTrend['value'],
                ],
                'activeMembers' => [
                    'value' => $activeMembersCount,
                    'expiringSoon' => $expiringSoon,
                ]
            ],
            'charts' => [
                'attendance' => $attendanceChart,
                'revenue' => $revenueChart
            ]
        ]);
    }

    public function getAdminDashboard(Request $request)
    {
        $today = Carbon::today();

        // 1. Member Check-in
        $memberCheckinToday = Attendance::whereNotNull('idMember')->whereDate('checkin_time', $today)->count();

        // 2. Guest Check-in
        $guestCheckinToday = Attendance::whereNull('idMember')->whereDate('checkin_time', $today)->count();

        // 3. Pendapatan Lunas Hari Ini
        $pendapatanLunasToday = Payment::where('status', 'paid')
            ->whereDate('created_at', $today)
            ->sum('amount');

        // 4. Peringatan Expired (<= 7 days)
        $expiringIn7DaysCount = Member::whereHas('activeMembership', function($q) use ($today) {
            $q->whereDate('end_date', '>=', $today)
              ->whereDate('end_date', '<=', $today->copy()->addDays(7));
        })->whereHas('user', function($q) {
            $q->where('is_active', true);
        })->count();

        // 5. Menunggu Konfirmasi Pembayaran
        $pendingPayments = Payment::with(['member.user', 'guest'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->idPayment,
                    'invoice' => $payment->invoice,
                    'member' => $payment->member ? $payment->member->user->name : ($payment->guest ? $payment->guest->name . ' (Guest)' : 'Guest'),
                    'amount' => (int) $payment->amount
                ];
            });

        // 6. Membership Segera Expired
        $expiringMembers = Member::with(['user', 'activeMembership'])
            ->whereHas('activeMembership', function($q) use ($today) {
                $q->whereDate('end_date', '>=', $today)
                  ->whereDate('end_date', '<=', $today->copy()->addDays(7));
            })->whereHas('user', function($q) {
                $q->where('is_active', true);
            })
            ->get()
            ->map(function ($member) use ($today) {
                $endDate = Carbon::parse($member->end_date);
                $diffDays = $today->copy()->diffInDays($endDate->copy()->startOfDay(), false);
                
                if ($diffDays < 0) {
                    $diffDays = 0; // fallback if already expired, though shouldn't happen with the query
                }
                
                $diffStr = "";
                if ($diffDays == 0) {
                    $diffStr = "Hari ini";
                } elseif ($diffDays == 1) {
                    $diffStr = "Besok";
                } else {
                    $diffStr = $diffDays . " Hari Lagi";
                }

                return [
                    'id' => $member->idMember,
                    'name' => $member->user->name,
                    'phone' => $member->user->phone,
                    'status_days' => $diffStr,
                    'diff_days' => $diffDays
                ];
            })
            ->sortBy('diff_days')
            ->values();

        return response()->json([
            'metrics' => [
                'member_checkin' => $memberCheckinToday,
                'guest_checkin' => $guestCheckinToday,
                'revenue_today' => (int) $pendapatanLunasToday,
                'expiring_count' => $expiringIn7DaysCount
            ],
            'pending_payments' => $pendingPayments,
            'expiring_members' => $expiringMembers
        ]);
    }
}
