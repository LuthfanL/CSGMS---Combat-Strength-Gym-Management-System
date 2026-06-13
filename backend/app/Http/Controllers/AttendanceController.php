<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function indexOwner(Request $request)
    {
        $query = Attendance::with(['member.user', 'guest']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('member.user', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%");
                })->orWhereHas('guest', function ($q3) use ($search) {
                    $q3->where('name', 'like', "%{$search}%");
                });
            });
        }

        if ($type = $request->input('type')) {
            $query->where('attendance_type', $type);
        }

        if ($startDate = $request->input('start_date')) {
            $query->whereDate('checkin_time', '>=', $startDate);
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereDate('checkin_time', '<=', $endDate);
        }

        $attendances = $query->orderBy('checkin_time', 'desc')->paginate(10);

        $attendances->getCollection()->transform(function ($attendance) {
            return [
                'id' => $attendance->idAttendance,
                'type' => $attendance->attendance_type === 'member' ? 'Member' : 'Guest',
                'checkin_time' => $attendance->checkin_time->format('d-M-Y, H:i:s'),
                'name' => $attendance->attendance_type === 'member' ? ($attendance->member->user->name ?? 'Unknown') : ($attendance->guest->name ?? 'Unknown'),
                'phone' => $attendance->attendance_type === 'member' ? ($attendance->member->user->phone ?? '-') : ($attendance->guest->phone ?? '-'),
                'code' => $attendance->attendance_type === 'member' ? $attendance->member->member_code : '-',
            ];
        });

        return response()->json($attendances);
    }

    public function indexMember(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->member) {
            return response()->json(['message' => 'Data member tidak ditemukan.'], 403);
        }

        $idMember = $user->member->idMember;

        $attendances = Attendance::where('idMember', $idMember)
            ->where('attendance_type', 'member')
            ->orderBy('checkin_time', 'desc')
            ->get();

        $totalKunjungan = $attendances->count();
        $terakhirHadir = $attendances->first() ? $attendances->first()->checkin_time : null;
        
        // Rata-rata kunjungan per minggu
        $firstAttendance = $attendances->last();
        $avgPerWeek = 0;
        if ($firstAttendance && $totalKunjungan > 1) {
            $weeks = max(1, $firstAttendance->checkin_time->diffInWeeks(now()));
            $avgPerWeek = round($totalKunjungan / $weeks, 1);
        } elseif ($totalKunjungan == 1) {
            $avgPerWeek = 1;
        }

        return response()->json([
            'attendances' => $attendances->map(function ($a) {
                return [
                    'id' => $a->idAttendance,
                    'date' => $a->checkin_time->format('d M Y'),
                    'time' => $a->checkin_time->format('H:i') . ' WIB',
                    'status' => 'Hadir'
                ];
            }),
            'stats' => [
                'total' => $totalKunjungan,
                'avg_per_week' => $avgPerWeek,
                'last_visit' => $terakhirHadir ? $terakhirHadir->format('d M Y') : '-'
            ]
        ]);
    }

    public function indexAdmin()
    {
        $attendances = Attendance::with(['member.user', 'guest'])
            ->orderBy('checkin_time', 'desc')
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->idAttendance,
                    'type' => $attendance->attendance_type,
                    'checkin_time' => $attendance->checkin_time->format('Y-m-d H:i:s'),
                    'member' => $attendance->member ? [
                        'id' => $attendance->member->idMember,
                        'name' => $attendance->member->user->name ?? 'Unknown',
                        'phone' => $attendance->member->user->phone ?? '-',
                        'code' => $attendance->member->member_code
                    ] : null,
                    'guest' => $attendance->guest ? [
                        'id' => $attendance->guest->idGuest,
                        'name' => $attendance->guest->name,
                        'phone' => $attendance->guest->phone ?? '-',
                    ] : null,
                ];
            });

        return response()->json([
            'attendances' => $attendances
        ]);
    }

    public function searchMemberCheckin(Request $request)
    {
        $keyword = $request->input('keyword');

        if (!$keyword) {
            return response()->json(['message' => 'Keyword pencarian wajib diisi.'], 400);
        }

        $member = \App\Models\Member::with(['user', 'activeMembership', 'memberships'])
            ->where('member_code', $keyword)
            ->orWhereHas('user', function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('email', 'like', "%{$keyword}%");
            })
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Member tidak ditemukan.'], 404);
        }

        return response()->json([
            'idMember' => $member->idMember,
            'member_code' => $member->member_code,
            'name' => $member->user->name,
            'email' => $member->user->email,
            'phone' => $member->user->phone,
            'address' => $member->user->address,
            'is_active' => $member->user->is_active,
            'photo' => $member->photo,
            'membership_status' => $member->membership_status ?? 'Belum Aktif',
            'join_date' => $member->user->created_at,
            'end_date' => $member->end_date,
        ]);
    }

    public function storeMemberCheckin(Request $request)
    {
        $request->validate([
            'idMember' => 'required|exists:members,idMember'
        ]);

        $member = \App\Models\Member::with('user')->findOrFail($request->idMember);

        if (!$member->user->is_active) {
            return response()->json(['message' => 'Gagal: Akun member ini telah dinonaktifkan.'], 403);
        }

        if ($member->membership_status !== 'Aktif') {
            return response()->json(['message' => 'Gagal: Membership belum aktif atau sudah expired.'], 403);
        }

        $alreadyCheckedIn = Attendance::where('idMember', $member->idMember)
            ->whereDate('checkin_time', now()->toDateString())
            ->exists();

        if ($alreadyCheckedIn) {
            return response()->json(['message' => 'Gagal: Member ini sudah melakukan check-in hari ini.'], 403);
        }

        Attendance::create([
            'idAttendance' => (string) \Illuminate\Support\Str::uuid(),
            'attendance_type' => 'member',
            'idMember' => $member->idMember,
            'idGuest' => null,
            'checkin_time' => now()
        ]);

        return response()->json(['message' => 'Check-in member berhasil dicatat.']);
    }
}
