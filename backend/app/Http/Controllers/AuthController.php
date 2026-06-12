<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.'
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load('member')
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\.\']+$/'],
            'email' => 'required|string|email:rfc,dns|max:255|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',      // minimal 1 huruf besar
                'regex:/[a-z]/',      // minimal 1 huruf kecil
                'regex:/[0-9]/',      // minimal 1 angka
                'regex:/[@$!%*?&#]/', // minimal 1 karakter spesial
            ],
            'phone' => ['required', 'string', 'regex:/^[0-9]{10,15}$/'],
            'address' => 'required|string|min:10',
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ], [
            'name.regex' => 'Nama hanya boleh berisi huruf, spasi, titik, dan tanda petik.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'email.email' => 'Format email tidak valid.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&#).',
            'phone.regex' => 'Nomor HP harus berupa angka dengan panjang 10-15 digit.',
            'address.min' => 'Alamat minimal 10 karakter.',
            'photo.required' => 'Foto wajah wajib diunggah.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.mimes' => 'Format foto harus JPEG, PNG, atau JPG.',
            'photo.max' => 'Ukuran foto maksimal 2MB.',
        ]);

        $photoPath = $request->file('photo')->store('photos/members', 'public');

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'member',
            'phone' => $request->phone,
            'address' => $request->address,
            'is_active' => true,
        ]);

        $user->member()->create([
            'photo' => $photoPath,
            // member_code is automatically created later upon first successful payment per PRD, so we leave it null
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil',
            'token' => $token,
            'user' => $user->load('member')
        ], 201);
    }

    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $exists = User::where('email', $request->email)->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Email ini sudah terdaftar.' : 'Email tersedia.'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load(['member', 'member.activeMembership.package'])
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $rules = [
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\.\']+$/'],
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

        // If user wants to change password
        if ($request->filled('new_password')) {
            $rules['current_password'] = 'required|string';
            $rules['new_password'] = [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*?&#]/',
            ];

            $messages['current_password.required'] = 'Password saat ini wajib diisi.';
            $messages['new_password.min'] = 'Password baru minimal 8 karakter.';
            $messages['new_password.regex'] = 'Password baru harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&#).';
        }

        $request->validate($rules, $messages);

        // Verify current password if changing password
        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Password saat ini salah.',
                    'errors' => ['current_password' => ['Password saat ini salah.']]
                ], 422);
            }
        }

        // Update user fields
        $user->name = $request->name;
        $user->phone = $request->phone;
        $user->address = $request->address;

        if ($request->filled('new_password')) {
            $user->password = Hash::make($request->new_password);
        }

        $user->save();

        // Update photo if provided
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('photos/members', 'public');
            $user->member()->update(['photo' => $photoPath]);
        }

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user->load('member')
        ]);
    }
}
