<?php

namespace Database\Seeders;

use App\Models\MembershipPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MembershipPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Paket 1 Bulan',
                'duration' => 1,
                'facilities' => 'Akses Gym',
                'price' => 150000,
            ],
            [
                'name' => 'Paket 3 Bulan',
                'duration' => 3,
                'facilities' => 'Akses Gym, Loker',
                'price' => 400000,
            ],
            [
                'name' => 'Paket 6 Bulan',
                'duration' => 6,
                'facilities' => 'Akses Gym, Loker, Handuk',
                'price' => 750000,
            ],
            [
                'name' => 'Paket 1 Tahun',
                'duration' => 12,
                'facilities' => 'Akses Gym, Loker, Handuk, Personal Trainer',
                'price' => 1400000,
            ],
        ];

        foreach ($packages as $pkg) {
            MembershipPackage::create([
                'idPackage' => Str::uuid()->toString(),
                'name' => $pkg['name'],
                'duration' => $pkg['duration'],
                'facilities' => $pkg['facilities'],
                'price' => $pkg['price'],
                'is_active' => true,
            ]);
        }
    }
}
