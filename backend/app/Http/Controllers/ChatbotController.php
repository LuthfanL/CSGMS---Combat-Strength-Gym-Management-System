<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\GymSetting;
use App\Models\GymOperatingHour;
use App\Models\MembershipPackage;
use App\Models\Membership;
use App\Models\Payment;
use App\Models\Attendance;
use Carbon\Carbon;

class ChatbotController extends Controller
{
    public function handleChat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500'
        ]);

        $message = $request->message;
        $user = $request->user('sanctum'); // Might be null if public

        // Get Intent from Gemini
        $intent = $this->getIntentFromGemini($message);
        
        // Route Intent to Response
        $response = $this->generateResponse($intent, $user);

        return response()->json([
            'intent' => $intent,
            'response' => $response
        ]);
    }

    private function getIntentFromGemini($message)
    {
        $apiKey = env('GEMINI_API_KEY');
        
        if (empty($apiKey)) {
            // Fallback gracefully if API key is not set
            return 'SYSTEM_ERROR';
        }

        $systemPrompt = "Tugas Anda HANYA SATU: Mengklasifikasikan pesan pengguna ke dalam SALAH SATU dari kategori berikut.
Daftar Kategori:
1. HARGA_PAKET (nanya harga member bulanan, paket, pricelist)
2. JAM_OPERASIONAL (nanya jam buka, jadwal libur, jam tutup)
3. LOKASI_KONTAK (nanya alamat, lokasi, nomer hp, wa, instagram)
4. HARGA_HARIAN (nanya harga visitor harian, sekali datang)
5. FASILITAS (nanya fasilitas gym, alat apa aja)
6. CARA_DAFTAR (nanya cara daftar jadi member)
7. CEK_STATUS_MEMBER (nanya sisa masa aktif, kapan expired, id member)
8. CEK_TAGIHAN (nanya tagihan, invoice, pembayaran tertunda)
9. RIWAYAT_HADIR (nanya riwayat kehadiran, terakhir ngegym kapan)
10. LAINNYA (pertanyaan umum, sapaan 'halo', 'siang', atau hal di luar konteks)

Balas HANYA DENGAN KODE KATEGORI (misal: HARGA_PAKET), TANPA TANDA BACA LAIN, TANPA PENJELASAN.
Pesan Pengguna: " . $message;

        try {
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-robotics-er-1.6-preview:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $systemPrompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.0,
                    'maxOutputTokens' => 800,
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();
                if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                    $intent = trim($result['candidates'][0]['content']['parts'][0]['text']);
                    // Clean up markdown or newlines just in case
                    $intent = preg_replace('/[^A-Z_]/', '', strtoupper($intent));
                    return $intent ?: 'LAINNYA';
                }
            }
            
            \Log::error('Gemini API Error: ' . $response->body());
            return 'SYSTEM_ERROR';
        } catch (\Exception $e) {
            \Log::error('Gemini API Exception: ' . $e->getMessage());
            return 'SYSTEM_ERROR';
        }
    }

    private function generateResponse($intent, $user)
    {
        Carbon::setLocale('id');

        switch ($intent) {
            case 'HARGA_PAKET':
                $packages = MembershipPackage::where('is_active', true)->orderBy('price', 'asc')->get();
                if ($packages->isEmpty()) return "Saat ini belum ada paket membership yang tersedia.";
                
                $response = "Berikut adalah daftar harga paket membership kami:\n\n";
                foreach ($packages as $pkg) {
                    $price = "Rp " . number_format($pkg->price, 0, ',', '.');
                    $response .= "- **{$pkg->name}** ({$pkg->duration} Bulan): {$price}\n";
                }
                $response .= "\nAnda dapat mendaftar langsung di meja resepsionis atau melalui menu pendaftaran.";
                return $response;

            case 'JAM_OPERASIONAL':
                $hours = GymOperatingHour::orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")->get();
                if ($hours->isEmpty()) return "Maaf, informasi jam operasional sedang tidak tersedia.";
                
                $hariIndo = [
                    'Monday' => 'Senin',
                    'Tuesday' => 'Selasa',
                    'Wednesday' => 'Rabu',
                    'Thursday' => 'Kamis',
                    'Friday' => 'Jumat',
                    'Saturday' => 'Sabtu',
                    'Sunday' => 'Minggu'
                ];
                
                $response = "Jam Operasional Combat Strength Gym:\n\n";
                foreach ($hours as $hour) {
                    $namaHari = $hariIndo[$hour->day] ?? $hour->day;
                    if ($hour->is_closed) {
                        $response .= "- **{$namaHari}**: Libur / Tutup\n";
                    } else {
                        $open = substr($hour->open_time, 0, 5);
                        $close = substr($hour->close_time, 0, 5);
                        $response .= "- **{$namaHari}**: {$open} - {$close}\n";
                    }
                }
                return $response;

            case 'LOKASI_KONTAK':
                $setting = GymSetting::first();
                if (!$setting) return "Maaf, informasi kontak sedang tidak tersedia.";
                
                return "📍 **Alamat:**\n{$setting->address}\n\n📞 **Kontak:**\nTelp/WA: {$setting->phone}\nEmail: {$setting->email}\n\n📱 **Sosial Media:**\nInstagram: @{$setting->instagram}";

            case 'HARGA_HARIAN':
                $setting = GymSetting::first();
                if (!$setting) return "Maaf, informasi harga sedang tidak tersedia.";
                $price = "Rp " . number_format($setting->guest_price, 0, ',', '.');
                return "Untuk pengunjung harian (Visitor/Guest), harga per kedatangannya adalah **{$price}**.\nSilakan langsung datang ke gym dan melakukan pembayaran di resepsionis.";

            case 'FASILITAS':
                return "Fasilitas yang kami sediakan meliputi:\n- Area Angkat Beban (Free Weights)\n- Area Mesin (Machines)\n- Area Kardio\n- Ruang Ganti & Loker\n- Toilet & Shower\n- Parkir luas";

            case 'CARA_DAFTAR':
                return "Cara mendaftar menjadi member sangat mudah!\n1. Klik tombol **Daftar Sekarang** di pojok kanan atas layar.\n2. Isi data diri Anda dengan lengkap.\n3. Masuk (Login) ke Dashboard Anda.\n4. Pilih menu **Beli / Perpanjang** dan pilih paket yang Anda inginkan.\n5. Lakukan pembayaran di resepsionis untuk mengaktifkan membership Anda.";

            case 'CEK_STATUS_MEMBER':
                if (!$user || $user->role !== 'member') {
                    return "Anda harus masuk (login) sebagai Member terlebih dahulu untuk mengecek status membership Anda.";
                }
                
                $member = $user->member;
                if (!$member) return "Data member Anda tidak ditemukan.";
                
                $activeMembership = $member->activeMembership;
                if ($activeMembership) {
                    $endDate = Carbon::parse($activeMembership->end_date)->translatedFormat('d F Y');
                    return "Halo {$user->name}, paket membership Anda saat ini berstatus **AKTIF** dan berlaku hingga tanggal **{$endDate}**.\n\nKode Member Anda: **{$member->member_code}**";
                } else {
                    return "Halo {$user->name}, saat ini Anda **TIDAK MEMILIKI** paket membership yang aktif. Silakan menuju menu Beli/Perpanjang untuk membeli paket.";
                }

            case 'CEK_TAGIHAN':
                if (!$user || $user->role !== 'member') {
                    return "Anda harus masuk (login) sebagai Member terlebih dahulu untuk mengecek tagihan Anda.";
                }
                
                $member = $user->member;
                $pendingPayment = Payment::where('idMember', $member->idMember)
                    ->where('status', 'pending')
                    ->latest()
                    ->first();
                    
                if ($pendingPayment) {
                    $amount = "Rp " . number_format($pendingPayment->amount, 0, ',', '.');
                    return "Anda memiliki tagihan yang belum dibayar sebesar **{$amount}** (Invoice: {$pendingPayment->invoice}).\n\nMohon segera selesaikan pembayaran di resepsionis agar transaksi dapat diproses.";
                }
                
                return "Bagus! Saat ini Anda tidak memiliki tagihan yang tertunda. Semua pembayaran sudah lunas.";

            case 'RIWAYAT_HADIR':
                if (!$user || $user->role !== 'member') {
                    return "Anda harus masuk (login) sebagai Member terlebih dahulu untuk mengecek riwayat kehadiran Anda.";
                }
                
                $member = $user->member;
                $lastAttendance = Attendance::where('idMember', $member->idMember)
                    ->latest('check_in_time')
                    ->first();
                    
                if ($lastAttendance) {
                    $date = Carbon::parse($lastAttendance->check_in_time)->translatedFormat('l, d F Y - H:i');
                    return "Anda terakhir melakukan *check-in* di gym pada:\n**{$date} WIB**.";
                }
                
                return "Anda belum memiliki catatan riwayat kehadiran (*check-in*) di gym kami.";

            case 'SYSTEM_ERROR':
                return "Mohon maaf, sistem Chatbot sedang mengalami gangguan teknis (Sistem AI tidak dapat dihubungi atau API Key belum dikonfigurasi). Silakan hubungi resepsionis langsung.";

            case 'LAINNYA':
            default:
                return "Halo! Saya adalah Asisten Virtual CSGMS.\n\nSaat ini saya hanya dapat membantu menjawab pertanyaan seputar:\n- Harga Paket & Harga Harian\n- Jam Operasional\n- Lokasi & Kontak\n- Cara Pendaftaran\n- Info Status/Tagihan Member Anda\n\nAda yang bisa saya bantu terkait hal tersebut?";
        }
    }
}
