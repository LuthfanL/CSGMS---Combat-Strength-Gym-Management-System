<?php

namespace App\Http\Controllers;

use App\Models\GymSetting;
use App\Models\GymOperatingHour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SettingController extends Controller
{
    /**
     * Get public settings.
     * GET /api/settings
     */
    public function index()
    {
        $settings = GymSetting::first();
        $operatingHours = GymOperatingHour::orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")->get();

        return response()->json([
            'settings' => $settings,
            'operating_hours' => $operatingHours
        ]);
    }

    /**
     * Update settings.
     * POST /api/owner/settings
     */
    public function update(Request $request)
    {
        $settings = GymSetting::first();
        if (!$settings) {
            $settings = new GymSetting();
            $settings->idGym = Str::uuid();
        }

        // Handle settings fields
        if ($request->has('gym_name')) $settings->gym_name = $request->input('gym_name');
        if ($request->has('description')) $settings->description = $request->input('description');
        if ($request->has('address')) $settings->address = $request->input('address');
        if ($request->has('phone')) $settings->phone = $request->input('phone');
        if ($request->has('email')) $settings->email = $request->input('email');
        if ($request->has('instagram')) $settings->instagram = $request->input('instagram');
        if ($request->has('tiktok')) $settings->tiktok = $request->input('tiktok');

        // Handle Logo Upload
        if ($request->hasFile('logo')) {
            $request->validate([
                'logo' => 'image|mimes:jpeg,png,jpg|max:2048'
            ]);

            // Delete old logo if exists
            if ($settings->logo && Storage::disk('public')->exists($settings->logo)) {
                Storage::disk('public')->delete($settings->logo);
            }

            $path = $request->file('logo')->store('logos', 'public');
            $settings->logo = $path;
        }

        $old_data = [];
        $new_data = [];

        if ($settings->isDirty()) {
            foreach ($settings->getDirty() as $key => $value) {
                $old_data[$key] = $settings->getOriginal($key);
                $new_data[$key] = $value;
            }
        }

        $settings->save();

        // Handle Operating Hours
        if ($request->has('operating_hours')) {
            $hours = json_decode($request->input('operating_hours'), true);
            if (is_array($hours)) {
                foreach ($hours as $hour) {
                    if (isset($hour['day'])) {
                        $opHour = GymOperatingHour::where('day', $hour['day'])->first();
                        if ($opHour) {
                            $opHour->open_time = $hour['open_time'] ?: null;
                            $opHour->close_time = $hour['close_time'] ?: null;
                            $opHour->is_closed = filter_var($hour['is_closed'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

                            if ($opHour->isDirty()) {
                                foreach ($opHour->getDirty() as $key => $value) {
                                    $old_data["{$hour['day']}_{$key}"] = $opHour->getOriginal($key);
                                    $new_data["{$hour['day']}_{$key}"] = $value;
                                }
                                $opHour->save();
                            }
                        }
                    }
                }
            }
        }

        if (!empty($old_data) || !empty($new_data)) {
            \App\Models\AuditLog::create([
                'idUser' => $request->user()->idUser,
                'action' => 'update',
                'module' => 'setting',
                'description' => 'Mengubah Pengaturan Gym dan Jam Operasional',
                'old_data' => $old_data,
                'new_data' => $new_data
            ]);
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings,
            'operating_hours' => GymOperatingHour::orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")->get()
        ]);
    }

    /**
     * Update guest price (Admin).
     * POST /api/admin/settings/guest-price
     */
    public function updateGuestPrice(Request $request)
    {
        $request->validate([
            'guest_price' => 'required|integer|min:0'
        ]);

        $settings = GymSetting::first();
        if (!$settings) {
            $settings = new GymSetting();
            $settings->idGym = Str::uuid();
            $settings->gym_name = 'Gym Baru';
            $settings->description = '-';
            $settings->address = '-';
            $settings->phone = '-';
            $settings->email = '-';
        }

        $oldPrice = $settings->guest_price;
        $settings->guest_price = $request->input('guest_price');
        $settings->save();

        \App\Models\AuditLog::create([
            'idUser' => $request->user()->idUser,
            'action' => 'update',
            'module' => 'setting',
            'description' => "Mengubah Harga Guest Harian dari {$oldPrice} menjadi {$settings->guest_price}",
            'old_data' => ['guest_price' => $oldPrice],
            'new_data' => ['guest_price' => $settings->guest_price],
        ]);

        return response()->json([
            'message' => 'Harga guest harian berhasil diperbarui.',
            'guest_price' => $settings->guest_price
        ]);
    }
}
