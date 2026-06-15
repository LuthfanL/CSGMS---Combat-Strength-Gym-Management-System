<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Kata Sandi</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #09090b; /* zinc-950 */
            margin: 0;
            padding: 20px 0;
            color: #ffffff;
        }
        .container {
            max-width: 500px;
            margin: 0 auto 30px auto;
            background-color: #18181b; /* zinc-900 */
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #27272a; /* zinc-800 */
        }
        .text-center { text-align: center; }
        .text-gray { color: #a1a1aa; /* zinc-400 */ }
        .text-sm { font-size: 14px; }
        .uppercase { text-transform: uppercase; }
        
        table { width: 100%; border-collapse: collapse; }
        
        .header { padding: 30px 20px 10px 20px; }
        .gym-name { color: #ef4444; font-size: 24px; font-weight: 800; margin-bottom: 10px; letter-spacing: 1px; }
        .gym-info { font-size: 12px; color: #e4e4e7; line-height: 1.6; }
        
        .subtitle { font-size: 18px; font-weight: bold; padding: 15px 0 25px 0; color: #ffffff; border-bottom: 1px solid #27272a; margin-bottom: 25px; }
        
        .content { padding: 0 30px 30px 30px; line-height: 1.6; color: #e4e4e7; font-size: 15px; text-align: center; }
        
        .btn-wrapper {
            margin: 35px 0;
            text-align: center;
        }
        
        .btn {
            display: inline-block;
            background-color: #ef4444; /* red-500 */
            color: #ffffff !important;
            text-decoration: none !important;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
        }
        
        .divider { border-bottom: 1px solid #27272a; margin: 30px 0 20px 0; }
        
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 11px;
            color: #71717a;
            background-color: #09090b;
        }

        .raw-link {
            color: #60a5fa !important;
            word-break: break-all;
            font-size: 12px;
            line-height: 1.4;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    @php
        $gym = \App\Models\GymSetting::first();
    @endphp
    
    <div class="container">
        <!-- Header -->
        <div class="text-center header">
            <div class="gym-name uppercase">{{ $gym ? $gym->gym_name : 'COMBAT STRENGTH GYM' }}</div>
            @if($gym)
                <div class="gym-info">
                    {{ $gym->address }}<br>
                    Telp: {{ $gym->phone }} | Email: {{ $gym->email }}
                </div>
            @endif
        </div>

        <div class="content">
            <div class="subtitle">
                Permintaan Reset Kata Sandi
            </div>
            
            <p style="margin-top: 0;">Halo Member Setia,</p>
            <p style="color: #a1a1aa; margin-bottom: 10px;">Anda menerima email ini karena kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.</p>
            
            <div class="btn-wrapper">
                <a href="{{ $resetUrl }}" class="btn">Atur Ulang Kata Sandi</a>
            </div>
            
            <p style="color: #a1a1aa; font-size: 13px;">Tautan ini hanya berlaku selama <strong>60 menit</strong> ke depan demi keamanan akun Anda.</p>
            <p style="color: #71717a; font-size: 13px;">Jika Anda tidak pernah merasa meminta pengaturan ulang kata sandi, abaikan saja email ini. Akun Anda tetap aman.</p>
            
            <div class="divider"></div>
            
            <p style="font-size: 12px; color: #71717a; text-align: left;">
                Jika tombol merah di atas tidak berfungsi, Anda bisa menyalin dan menempelkan tautan berikut ke peramban (*browser*) Anda:<br>
                <a href="{{ $resetUrl }}" class="raw-link">{{ $resetUrl }}</a>
            </p>
        </div>
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} {{ $gym ? $gym->gym_name : 'Combat Strength Gym' }}. Hak Cipta Dilindungi.
    </div>
</body>
</html>
