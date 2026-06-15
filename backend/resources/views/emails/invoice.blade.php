<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Invoice</title>
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
            margin: 0 auto;
            background-color: #18181b; /* zinc-900 */
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #27272a; /* zinc-800 */
        }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .text-gray { color: #a1a1aa; /* zinc-400 */ }
        .text-red { color: #ef4444; /* red-500 */ }
        .font-bold { font-weight: bold; }
        .text-sm { font-size: 14px; }
        .text-xs { font-size: 12px; }
        .text-lg { font-size: 18px; }
        .text-xl { font-size: 22px; }
        .uppercase { text-transform: uppercase; }
        
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px 0; }
        
        .header { padding: 30px 20px 10px 20px; }
        .gym-name { color: #ef4444; font-size: 24px; font-weight: 800; margin-bottom: 10px; letter-spacing: 1px; }
        .gym-info { font-size: 12px; color: #e4e4e7; line-height: 1.6; }
        
        .subtitle { font-size: 16px; font-weight: bold; padding: 15px 0 25px 0; color: #ffffff; }
        
        .content { padding: 0 25px 25px 25px; }
        
        .divider { border-bottom: 1px solid #27272a; margin: 15px 0; }
        
        .badge {
            background-color: transparent;
            border: 1px solid #52525b; /* zinc-600 */
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .total-box {
            border: 1px solid #3f3f46; /* zinc-700 */
            border-radius: 12px;
            padding: 15px 20px;
            margin-top: 25px;
            background-color: #18181b;
        }
        
        .lunas-badge {
            display: inline-block;
            color: #22c55e; /* green-500 */
            border: 1px solid #166534; /* green-800 */
            background-color: rgba(22, 101, 52, 0.2);
            padding: 8px 24px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin-top: 25px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 11px;
            color: #71717a;
            background-color: #09090b;
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
            
            <div class="subtitle">
                Bukti Pembayaran Lunas
            </div>
        </div>

        <div class="content">
            <!-- Invoice & Date -->
            <table style="margin-bottom: 20px;">
                <tr>
                    <td class="text-left text-xs text-gray font-bold uppercase" style="padding-bottom: 4px;">Nomor Invoice</td>
                    <td class="text-right text-xs text-gray font-bold uppercase" style="padding-bottom: 4px;">Tanggal</td>
                </tr>
                <tr>
                    <td class="text-left font-bold text-lg" style="color: #ffffff;">{{ $payment->invoice }}</td>
                    <td class="text-right text-sm" style="color: #ffffff;">{{ \Carbon\Carbon::parse($payment->paid_at)->translatedFormat('d F Y, H:i') }}</td>
                </tr>
            </table>

            <div class="divider"></div>

            <!-- Details -->
            <table>
                <tr>
                    <td class="text-left text-sm text-gray" style="padding: 12px 0;">Nama Member</td>
                    <td class="text-right text-sm font-bold" style="color: #ffffff;">
                        {{ $payment->member ? $payment->member->user->name : ($payment->guest ? $payment->guest->name : 'Unknown') }}
                    </td>
                </tr>
                <tr>
                    <td class="text-left text-sm text-gray" style="padding: 12px 0;">Tipe Transaksi</td>
                    <td class="text-right text-sm font-bold" style="color: #ffffff;">
                        @if($payment->payment_type === 'new_membership' || $payment->payment_type === 'renew_membership')
                            {{ $payment->package ? $payment->package->name : 'Membership' }}
                        @else
                            Guest Harian
                        @endif
                    </td>
                </tr>
                <tr>
                    <td class="text-left text-sm text-gray" style="padding: 12px 0;">Metode Pembayaran</td>
                    <td class="text-right text-sm" style="padding: 12px 0;">
                        <span class="badge" style="color: #ffffff;">{{ strtoupper($payment->payment_method) }}</span>
                    </td>
                </tr>
            </table>

            <!-- Total Box -->
            <div class="total-box">
                <table>
                    <tr>
                        <td class="text-left font-bold" style="font-size: 16px; color: #ffffff; border: none; padding: 0;">Total Pembayaran</td>
                        <td class="text-right font-bold text-red" style="font-size: 24px; border: none; padding: 0;">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                    </tr>
                </table>
            </div>

            <!-- Status Lunas -->
            <div class="text-center">
                <div class="lunas-badge">LUNAS</div>
            </div>
            
            <div class="text-center text-xs text-gray" style="margin-top: 30px;">
                Terima kasih atas pembayaran Anda. Email ini berfungsi sebagai tanda terima yang sah.
            </div>
        </div>
    </div>
</body>
</html>
