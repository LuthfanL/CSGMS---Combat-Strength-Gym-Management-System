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

        $settings->save();

        // Handle Operating Hours
        if ($request->has('operating_hours')) {
            $hours = json_decode($request->input('operating_hours'), true);
            if (is_array($hours)) {
                foreach ($hours as $hour) {
                    if (isset($hour['day'])) {
                        // Translate indonesian day to english day if necessary, 
                        // but better handle english day in backend.
                        // We will map it properly.
                        GymOperatingHour::where('day', $hour['day'])->update([
                            'open_time' => $hour['open_time'] ?: null,
                            'close_time' => $hour['close_time'] ?: null,
                            'is_closed' => filter_var($hour['is_closed'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0,
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings,
            'operating_hours' => GymOperatingHour::orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")->get()
        ]);
    }
}
