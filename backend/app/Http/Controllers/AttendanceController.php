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
}
