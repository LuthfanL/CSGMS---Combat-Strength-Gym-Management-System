<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GymSetting;
use App\Models\GymOperatingHour;
use Illuminate\Support\Str;

class GymSettingSeeder extends Seeder
{
    public function run(): void
    {
        // Default Gym Setting
        GymSetting::firstOrCreate([], [
            'idGym' => Str::uuid(),
            'gym_name' => 'Combat Strength Gym',
            'description' => 'Pusat kebugaran terbaik dengan fasilitas lengkap dan pelatih profesional. Kami berdedikasi membantu Anda mencapai tujuan kebugaran Anda, baik untuk membangun otot, menurunkan berat badan, atau sekadar menjaga kesehatan.',
            'address' => 'Jl. Merdeka No. 123, Kota Bandung, Jawa Barat',
            'phone' => '081234567890',
            'email' => 'hello@combatstrength.com',
            'instagram' => '@combatstrength',
            'tiktok' => '@combatstrength_gym',
        ]);

        // Default Operating Hours
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        foreach ($days as $index => $day) {
            $isWeekend = in_array($day, ['Saturday', 'Sunday']);
            $isSunday = $day === 'Sunday';

            GymOperatingHour::firstOrCreate(['day' => $day], [
                'idOperatingHour' => Str::uuid(),
                'open_time' => $isSunday ? null : ($isWeekend ? '07:00:00' : '06:00:00'),
                'close_time' => $isSunday ? null : ($isWeekend ? '20:00:00' : '22:00:00'),
                'is_closed' => $isSunday ? 1 : 0,
            ]);
        }
    }
}
