<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MemberController extends Controller
{
    /**
     * Get list of members.
     * GET /api/admin/members
     */
    public function index(Request $request)
    {
        $query = Member::with(['user' => function ($q) {
            $q->select('idUser', 'name', 'email', 'phone', 'address', 'is_active', 'created_at');
        }, 'activeMembership', 'memberships']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('member_code', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($status = $request->input('status')) {
            if ($status === 'aktif') {
                $query->whereHas('user', function ($q) {
                    $q->where('is_active', true);
                })->whereHas('activeMembership');
            } elseif ($status === 'nonaktif') {
                $query->whereHas('user', function ($q) {
                    $q->where('is_active', false);
                });
            } elseif ($status === 'expired') {
                $query->whereDoesntHave('activeMembership')
                      ->whereHas('memberships', function ($q) {
                          $q->where('end_date', '<', now()->toDateString());
                      });
            } elseif ($status === 'belum_aktif') {
                $query->whereDoesntHave('memberships');
            }
        }

        $query->orderBy('created_at', 'desc');

        $members = $query->paginate(10);

        // Map data to match frontend expectations
        $members->getCollection()->transform(function ($member) {
            return [
                'idMember' => $member->idMember,
                'idUser' => $member->user->idUser,
                'member_code' => $member->member_code,
                'name' => $member->user->name,
                'email' => $member->user->email,
                'phone' => $member->user->phone,
                'address' => $member->user->address,
                'is_active' => $member->user->is_active,
                'photo' => $member->photo,
                'membership_status' => $member->membership_status ?? 'Belum Aktif',
                'end_date' => $member->end_date,
                'created_at' => $member->user->created_at,
            ];
        });

        return response()->json($members);
    }

    /**
     * Get member details.
     * GET /api/admin/members/{id}
     */
    public function show($id)
    {
        $member = Member::with('user')->findOrFail($id);

        return response()->json([
            'idMember' => $member->idMember,
            'idUser' => $member->user->idUser,
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

    /**
     * Update member details.
     * POST /api/admin/members/{id}
     */
    public function update(Request $request, $id)
    {
        $member = Member::findOrFail($id);
        $user = $member->user;

        $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s.\']+$/'],
            'phone' => ['required', 'string', 'regex:/^[0-9]{10,15}$/'],
            'address' => 'required|string|min:10',
        ], [
            'name.regex' => 'Nama hanya boleh berisi huruf, spasi, titik, dan tanda petik.',
            'phone.regex' => 'Nomor HP harus berupa angka dengan panjang 10-15 digit.',
            'address.min' => 'Alamat minimal 10 karakter.',
        ]);

        $oldData = [
            'name' => $user->name,
            'phone' => $user->phone,
            'address' => $user->address,
        ];

        DB::transaction(function () use ($request, $user, $oldData) {
            $user->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'address' => $request->address,
            ]);

            AuditLog::create([
                'idUser' => $request->user()->idUser,
                'action' => 'update',
                'module' => 'member',
                'description' => "Mengubah data member: {$user->name}",
                'old_data' => $oldData,
                'new_data' => [
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'address' => $user->address,
                ],
            ]);
        });

        return response()->json(['message' => 'Data member berhasil diperbarui.']);
    }

    /**
     * Toggle active status of a member.
     * PATCH /api/admin/members/{id}/toggle-active
     */
    public function toggleActive(Request $request, $id)
    {
        $member = Member::findOrFail($id);
        $user = $member->user;

        $oldStatus = $user->is_active;
        $newStatus = ! $oldStatus;

        DB::transaction(function () use ($request, $user, $oldStatus, $newStatus) {
            $user->update(['is_active' => $newStatus]);

            $action = $newStatus ? 'activate' : 'deactivate';
            $description = $newStatus
                ? "Mengaktifkan kembali member: {$user->name}"
                : "Menonaktifkan member: {$user->name}";

            AuditLog::create([
                'idUser' => $request->user()->idUser,
                'action' => $action,
                'module' => 'member',
                'description' => $description,
                'old_data' => ['is_active' => $oldStatus],
                'new_data' => ['is_active' => $newStatus],
            ]);
        });

        return response()->json([
            'message' => $newStatus
                ? 'Member berhasil diaktifkan kembali.'
                : 'Member berhasil dinonaktifkan.',
            'is_active' => $newStatus,
        ]);
    }
}
