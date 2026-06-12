<?php

namespace App\Http\Controllers;

use App\Models\MembershipPackage;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PackageController extends Controller
{
    /**
     * Get list of packages.
     * GET /api/admin/packages
     */
    public function index(Request $request)
    {
        $query = MembershipPackage::query();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $query->orderBy('price', 'asc');

        $packages = $query->get();

        return response()->json($packages);
    }

    /**
     * Get list of active packages for members.
     * GET /api/packages/active
     */
    public function active()
    {
        $packages = MembershipPackage::where('is_active', true)
            ->orderBy('price', 'asc')
            ->get();

        return response()->json($packages);
    }

    /**
     * Store a newly created package.
     * POST /api/admin/packages
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'facilities' => 'required|string',
            'price' => 'required|numeric|min:0',
        ]);

        $package = null;

        DB::transaction(function () use ($request, &$package) {
            $package = MembershipPackage::create([
                'idPackage' => Str::uuid()->toString(),
                'name' => $request->name,
                'duration' => $request->duration,
                'facilities' => $request->facilities,
                'price' => $request->price,
                'is_active' => true,
            ]);

            AuditLog::create([
                'idUser' => $request->user()->idUser,
                'action' => 'create',
                'module' => 'package',
                'description' => "Menambahkan paket membership: {$package->name}",
                'new_data' => $package->toArray(),
            ]);
        });

        return response()->json([
            'message' => 'Paket berhasil ditambahkan.',
            'data' => $package,
        ], 201);
    }

    /**
     * Update an existing package.
     * PUT /api/admin/packages/{id}
     */
    public function update(Request $request, $id)
    {
        $package = MembershipPackage::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'facilities' => 'required|string',
            'price' => 'required|numeric|min:0',
        ]);

        $oldData = $package->toArray();

        DB::transaction(function () use ($request, $package, $oldData) {
            $package->update([
                'name' => $request->name,
                'duration' => $request->duration,
                'facilities' => $request->facilities,
                'price' => $request->price,
            ]);

            AuditLog::create([
                'idUser' => $request->user()->idUser,
                'action' => 'update',
                'module' => 'package',
                'description' => "Mengubah paket membership: {$package->name}",
                'old_data' => $oldData,
                'new_data' => $package->toArray(),
            ]);
        });

        return response()->json([
            'message' => 'Paket berhasil diperbarui.',
            'data' => $package,
        ]);
    }

    /**
     * Toggle active status of a package.
     * PATCH /api/admin/packages/{id}/toggle-active
     */
    public function toggleActive(Request $request, $id)
    {
        $package = MembershipPackage::findOrFail($id);

        $oldStatus = $package->is_active;
        $newStatus = ! $oldStatus;

        DB::transaction(function () use ($request, $package, $oldStatus, $newStatus) {
            $package->update(['is_active' => $newStatus]);

            $action = $newStatus ? 'activate' : 'deactivate';
            $description = $newStatus
                ? "Mengaktifkan kembali paket: {$package->name}"
                : "Menonaktifkan paket: {$package->name}";

            AuditLog::create([
                'idUser' => $request->user()->idUser,
                'action' => $action,
                'module' => 'package',
                'description' => $description,
                'old_data' => ['is_active' => $oldStatus],
                'new_data' => ['is_active' => $newStatus],
            ]);
        });

        return response()->json([
            'message' => $newStatus
                ? 'Paket berhasil diaktifkan.'
                : 'Paket berhasil dinonaktifkan.',
            'is_active' => $newStatus,
        ]);
    }
}
