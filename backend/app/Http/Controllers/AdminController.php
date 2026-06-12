<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * List all admins with search, filter, and pagination.
     * GET /api/owner/admins
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'admin');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            if ($status === 'aktif') {
                $query->where('is_active', true);
            } elseif ($status === 'nonaktif') {
                $query->where('is_active', false);
            }
        }

        $query->orderBy('created_at', 'desc');

        $admins = $query->paginate(10);

        return response()->json($admins);
    }

    /**
     * Store a newly created admin.
     * POST /api/owner/admins
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s.\']+$/'],
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*?&#]/',
            ],
            'phone' => ['required', 'string', 'regex:/^[0-9]{10,15}$/'],
            'address' => 'required|string|min:10',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ], [
            'name.regex' => 'Nama hanya boleh berisi huruf, spasi, titik, dan tanda petik.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&#).',
            'phone.regex' => 'Nomor HP harus berupa angka dengan panjang 10-15 digit.',
            'address.min' => 'Alamat minimal 10 karakter.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.mimes' => 'Format foto harus JPEG, PNG, atau JPG.',
            'photo.max' => 'Ukuran foto maksimal 2MB.',
        ]);

        DB::transaction(function () use ($request) {
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('photos/admins', 'public');
            }

            $admin = User::create([
                'idUser' => Str::uuid()->toString(),
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password, // 'hashed' cast in User model handles hashing
                'role' => 'admin',
                'phone' => $request->phone,
                'address' => $request->address,
                'photo' => $photoPath,
                'is_active' => true,
            ]);

            AuditLog::create([
                'idUser' => $request->user()->idUser,
                'action' => 'create',
                'module' => 'admin',
                'description' => "Menambahkan akun admin baru: {$admin->name}",
                'new_data' => $admin->toArray(),
            ]);
        });

        return response()->json([
            'message' => 'Akun admin berhasil ditambahkan.'
        ], 201);
    }

    /**
     * Update an existing admin.
     * POST /api/owner/admins/{id} (using POST to support file upload)
     */
    public function update(Request $request, string $id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        $rules = [
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s.\']+$/'],
            'phone' => ['required', 'string', 'regex:/^[0-9]{10,15}$/'],
            'address' => 'required|string|min:10',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ];

        $messages = [
            'name.regex' => 'Nama hanya boleh berisi huruf, spasi, titik, dan tanda petik.',
            'phone.regex' => 'Nomor HP harus berupa angka dengan panjang 10-15 digit.',
            'address.min' => 'Alamat minimal 10 karakter.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.mimes' => 'Format foto harus JPEG, PNG, atau JPG.',
            'photo.max' => 'Ukuran foto maksimal 2MB.',
        ];

        if ($request->filled('password')) {
            $rules['password'] = [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*?&#]/',
            ];
            $messages['password.min'] = 'Password minimal 8 karakter.';
            $messages['password.regex'] = 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&#).';
        }

        $request->validate($rules, $messages);

        $oldData = $admin->toArray();

        DB::transaction(function () use ($request, $admin, $oldData) {
            $admin->name = $request->name;
            $admin->phone = $request->phone;
            $admin->address = $request->address;

            if ($request->filled('password')) {
                $admin->password = $request->password;
            }

            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('photos/admins', 'public');
                $admin->photo = $photoPath;
            }

            $admin->save();

            AuditLog::create([
                'idUser' => $request->user()->idUser,
                'action' => 'update',
                'module' => 'admin',
                'description' => "Mengubah data akun admin: {$admin->name}",
                'old_data' => $oldData,
                'new_data' => $admin->toArray(),
            ]);
        });

        return response()->json([
            'message' => 'Data admin berhasil diperbarui.'
        ]);
    }

    /**
     * Toggle active status of an admin.
     * PATCH /api/owner/admins/{id}/toggle-active
     */
    public function toggleActive(Request $request, string $id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        $oldStatus = $admin->is_active;
        $newStatus = ! $oldStatus;

        DB::transaction(function () use ($request, $admin, $oldStatus, $newStatus) {
            $admin->update(['is_active' => $newStatus]);

            $action = $newStatus ? 'activate' : 'deactivate';
            $description = $newStatus
                ? "Mengaktifkan kembali akun admin: {$admin->name}"
                : "Menonaktifkan akun admin: {$admin->name}";

            AuditLog::create([
                'idUser' => $request->user()->idUser,
                'action' => $action,
                'module' => 'admin',
                'description' => $description,
                'old_data' => ['is_active' => $oldStatus],
                'new_data' => ['is_active' => $newStatus],
            ]);
        });

        return response()->json([
            'message' => $newStatus
                ? 'Akun admin berhasil diaktifkan kembali.'
                : 'Akun admin berhasil dinonaktifkan.',
            'is_active' => $newStatus,
        ]);
    }
}
