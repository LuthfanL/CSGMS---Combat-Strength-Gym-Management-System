<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Member;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Owner
        User::create([
            'idUser' => Str::uuid()->toString(),
            'name' => 'Owner Gym',
            'email' => 'owner@combatstrength.com',
            'password' => Hash::make('Owner@12345'),
            'role' => 'owner',
            'phone' => '081111111111',
            'address' => 'Jl. Owner No. 1',
            'is_active' => 1,
        ]);

        // Admin
        User::create([
            'idUser' => Str::uuid()->toString(),
            'name' => 'Admin Gym',
            'email' => 'admin@combatstrength.com',
            'password' => Hash::make('Admin@12345'),
            'role' => 'admin',
            'phone' => '082222222222',
            'address' => 'Jl. Admin No. 2',
            'is_active' => 1,
        ]);

        // Member
        $memberUser = User::create([
            'idUser' => Str::uuid()->toString(),
            'name' => 'Member Gym',
            'email' => 'member@combatstrength.com',
            'password' => Hash::make('Member@12345'),
            'role' => 'member',
            'phone' => '083333333333',
            'address' => 'Jl. Member No. 3',
            'is_active' => 1,
        ]);

        Member::create([
            'idMember' => Str::uuid()->toString(),
            'idUser' => $memberUser->idUser,
            'member_code' => 'CSGMS-001',
            'photo' => 'default.jpg',
        ]);
    }
}
