<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Attendance;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ExportController extends Controller
{
    private function styleHeader($sheet, $lastCol)
    {
        $styleArray = [
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF1F2937'] // Dark gray
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ];
        $sheet->getStyle('A1:' . $lastCol . '1')->applyFromArray($styleArray);
        $sheet->getRowDimension(1)->setRowHeight(25);
    }

    private function autoSizeCols($sheet, $lastCol)
    {
        foreach (range('A', $lastCol) as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    // ====================================================================
    // EXPORT MEMBERS
    // ====================================================================
    public function exportMembers(Request $request)
    {
        $status = $request->query('status', 'all'); // all, aktif, expired, nonaktif

        $query = Member::with(['user' => function($q) {
            $q->select('idUser', 'name', 'email', 'phone', 'address', 'is_active');
        }, 'activeMembership', 'memberships' => function($q) {
            $q->orderBy('end_date', 'desc');
        }]);

        if ($status === 'aktif') {
            $query->whereHas('user', function($q) { $q->where('is_active', true); })
                  ->whereHas('activeMembership');
        } else if ($status === 'expired') {
            $query->whereDoesntHave('activeMembership')
                  ->whereHas('memberships');
        } else if ($status === 'belum_aktif') {
            $query->whereDoesntHave('memberships');
        } else if ($status === 'nonaktif') {
            $query->whereHas('user', function($q) { $q->where('is_active', false); });
        }

        $members = $query->get();

        $spreadsheet = new Spreadsheet();
        
        // Sheet 1: Data Detail
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Data Detail');
        
        $headers = [
            'ID Member', 'Kode Member', 'Nama', 'Email', 'No HP', 'Alamat', 
            'Paket Membership', 'Status Membership (Aktif/Expired)', 
            'Tanggal Bergabung', 'Tanggal Mulai Membership', 'Tanggal Berakhir Membership'
        ];
        
        foreach ($headers as $index => $header) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
            $sheet1->setCellValue($col . '1', $header);
        }
        $this->styleHeader($sheet1, 'K');

        $rowNum = 2;
        $totalMember = $members->count();
        $aktif = 0;
        $expired = 0;
        $nonaktif = 0;
        $baruBulanIni = 0;
        
        $currentMonth = date('Y-m');

        foreach ($members as $member) {
            $user = $member->user;
            if (!$user) continue;

            $statusText = $member->membership_status;
            if ($statusText === 'Aktif') $aktif++;
            else if ($statusText === 'Expired') $expired++;
            else if ($statusText === 'Nonaktif') $nonaktif++;

            if ($member->join_date && str_starts_with($member->join_date, $currentMonth)) {
                $baruBulanIni++;
            }

            $activeMemb = $member->activeMembership;
            $paket = $activeMemb ? $activeMemb->package->name : '-';
            $startDate = $activeMemb ? date('d-m-Y', strtotime($activeMemb->start_date)) : '-';
            $endDate = $activeMemb ? date('d-m-Y', strtotime($activeMemb->end_date)) : '-';
            
            $joinDate = $member->join_date ? date('d-m-Y', strtotime($member->join_date)) : '-';

            $sheet1->setCellValue('A' . $rowNum, $member->idMember);
            $sheet1->setCellValue('B' . $rowNum, $member->member_code);
            $sheet1->setCellValue('C' . $rowNum, $user->name);
            $sheet1->setCellValue('D' . $rowNum, $user->email);
            // Prepend a space or quote to phone number so Excel doesn't strip leading zero
            $sheet1->setCellValueExplicit('E' . $rowNum, $user->phone, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet1->setCellValue('F' . $rowNum, $user->address);
            $sheet1->setCellValue('G' . $rowNum, $paket);
            $sheet1->setCellValue('H' . $rowNum, $statusText);
            $sheet1->setCellValue('I' . $rowNum, $joinDate);
            $sheet1->setCellValue('J' . $rowNum, $startDate);
            $sheet1->setCellValue('K' . $rowNum, $endDate);
            
            $rowNum++;
        }
        $this->autoSizeCols($sheet1, 'K');

        // Sheet 2: Analisis
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Analisis - Summary');
        
        $sheet2->setCellValue('A1', 'Analisis Data Member');
        $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        
        $summaryData = [
            ['Total Member', $totalMember],
            ['Jumlah Member Aktif', $aktif],
            ['Jumlah Member Expired', $expired],
            ['Jumlah Member Nonaktif', $nonaktif],
            ['Member Baru Bulan Ini', $baruBulanIni],
        ];
        
        $rowNum = 3;
        foreach ($summaryData as $data) {
            $sheet2->setCellValue('A' . $rowNum, $data[0]);
            $sheet2->setCellValue('B' . $rowNum, $data[1]);
            $sheet2->getStyle('A'.$rowNum)->getFont()->setBold(true);
            $rowNum++;
        }
        $this->autoSizeCols($sheet2, 'B');

        // Output to browser
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Laporan_Member_' . date('Ymd_His') . '.xlsx';
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    // ====================================================================
    // EXPORT TRANSACTIONS
    // ====================================================================
    public function exportTransactions(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = Payment::with(['member.user', 'guest', 'package', 'verifier']);

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        $spreadsheet = new Spreadsheet();
        
        // Sheet 1: Data Detail
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Data Detail');
        
        $headers = [
            'Invoice', 'Tanggal', 'Nama Pelanggan', 'Tipe Transaksi', 
            'Paket Membership', 'Metode Pembayaran', 'Status Pembayaran', 
            'Nominal (Rp)', 'Diverifikasi Oleh'
        ];
        
        foreach ($headers as $index => $header) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
            $sheet1->setCellValue($col . '1', $header);
        }
        $this->styleHeader($sheet1, 'I');

        $rowNum = 2;
        
        $totalLunas = 0;
        $totalPendapatan = 0;
        $pendapatanBaru = 0;
        $pendapatanPerpanjang = 0;
        $pendapatanGuest = 0;
        $pendapatanCash = 0;
        $pendapatanQris = 0;
        $transaksiLunasCount = 0;

        foreach ($payments as $payment) {
            $namaPelanggan = '-';
            $tipeTransaksi = '-';
            
            if ($payment->idMember) {
                $namaPelanggan = $payment->member && $payment->member->user ? $payment->member->user->name : '-';
                if ($payment->member && $payment->member->memberships->count() <= 1) {
                    $tipeTransaksi = 'New Membership';
                } else {
                    $tipeTransaksi = 'Renew Membership';
                }
            } else {
                $namaPelanggan = $payment->guest ? $payment->guest->name : '-';
                $tipeTransaksi = 'Guest';
            }

            $paket = $payment->package ? $payment->package->name : '-';
            if (!$payment->idPackage) {
                $paket = 'Guest Pass Harian';
            }
            
            $metode = strtoupper($payment->payment_method);
            
            $statusLabel = 'Menunggu';
            if ($payment->status === 'paid') $statusLabel = 'Lunas';
            if ($payment->status === 'cancel') $statusLabel = 'Dibatalkan';
            
            $nominal = $payment->amount;
            
            $verifiedBy = $payment->verifier ? $payment->verifier->name : '-';

            $sheet1->setCellValue('A' . $rowNum, $payment->invoice);
            $sheet1->setCellValue('B' . $rowNum, date('d-m-Y H:i', strtotime($payment->created_at)));
            $sheet1->setCellValue('C' . $rowNum, $namaPelanggan);
            $sheet1->setCellValue('D' . $rowNum, $tipeTransaksi);
            $sheet1->setCellValue('E' . $rowNum, $paket);
            $sheet1->setCellValue('F' . $rowNum, $metode);
            $sheet1->setCellValue('G' . $rowNum, $statusLabel);
            $sheet1->setCellValue('H' . $rowNum, $nominal);
            $sheet1->setCellValue('I' . $rowNum, $verifiedBy);
            
            $sheet1->getStyle('H' . $rowNum)->getNumberFormat()->setFormatCode('_-"Rp"* #,##0_-;\-"Rp"* #,##0_-;_-"Rp"* "-"_-;_-@_-');
            
            if ($payment->status === 'paid') {
                $totalLunas++;
                $totalPendapatan += $nominal;
                $transaksiLunasCount++;
                
                if ($tipeTransaksi === 'New Membership') $pendapatanBaru += $nominal;
                else if ($tipeTransaksi === 'Renew Membership') $pendapatanPerpanjang += $nominal;
                else if ($tipeTransaksi === 'Guest') $pendapatanGuest += $nominal;
                
                if (strtolower($payment->payment_method) === 'cash') $pendapatanCash += $nominal;
                else if (strtolower($payment->payment_method) === 'qris') $pendapatanQris += $nominal;
            }
            
            $rowNum++;
        }
        $this->autoSizeCols($sheet1, 'I');

        // Sheet 2: Analisis
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Analisis - Summary');
        
        $sheet2->setCellValue('A1', 'Analisis Data Transaksi');
        $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        
        $rataRata = $transaksiLunasCount > 0 ? ($totalPendapatan / $transaksiLunasCount) : 0;
        
        $summaryData = [
            ['Total Transaksi Lunas', $totalLunas],
            ['Total Pendapatan', $totalPendapatan],
            ['Pendapatan Membership Baru', $pendapatanBaru],
            ['Pendapatan Perpanjangan', $pendapatanPerpanjang],
            ['Pendapatan Guest', $pendapatanGuest],
            ['Pendapatan Cash', $pendapatanCash],
            ['Pendapatan QRIS', $pendapatanQris],
            ['Rata-rata Nilai Transaksi', $rataRata],
        ];
        
        $rowNum = 3;
        foreach ($summaryData as $data) {
            $sheet2->setCellValue('A' . $rowNum, $data[0]);
            $sheet2->setCellValue('B' . $rowNum, $data[1]);
            $sheet2->getStyle('A'.$rowNum)->getFont()->setBold(true);
            
            if (is_numeric($data[1]) && $data[0] !== 'Total Transaksi Lunas') {
                $sheet2->getStyle('B' . $rowNum)->getNumberFormat()->setFormatCode('_-"Rp"* #,##0_-;\-"Rp"* #,##0_-;_-"Rp"* "-"_-;_-@_-');
            }
            $rowNum++;
        }
        $this->autoSizeCols($sheet2, 'B');

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Laporan_Transaksi_' . date('Ymd_His') . '.xlsx';
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    // ====================================================================
    // EXPORT ATTENDANCES
    // ====================================================================
    public function exportAttendances(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = Attendance::with(['member.user', 'guest']);

        if ($startDate && $endDate) {
            $query->whereBetween('checkin_time', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        $attendances = $query->orderBy('checkin_time', 'desc')->get();

        $spreadsheet = new Spreadsheet();
        
        // Sheet 1: Data Detail
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Data Detail');
        
        $headers = [
            'Tanggal', 'Nama', 'No HP', 'Tipe (Member/Guest)', 'Kode Member', 'Waktu Check-in'
        ];
        
        foreach ($headers as $index => $header) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
            $sheet1->setCellValue($col . '1', $header);
        }
        $this->styleHeader($sheet1, 'F');

        $rowNum = 2;
        
        $totalHadir = $attendances->count();
        $hadirMember = 0;
        $hadirGuest = 0;
        
        $daysCount = [];

        foreach ($attendances as $att) {
            $isMember = !empty($att->idMember);
            
            $nama = $isMember && $att->member && $att->member->user ? $att->member->user->name : ($att->guest ? $att->guest->name : '-');
            $hp = $isMember && $att->member && $att->member->user ? $att->member->user->phone : ($att->guest ? $att->guest->phone : '-');
            $tipe = $isMember ? 'Member' : 'Guest';
            $kode = $isMember && $att->member ? $att->member->member_code : '-';
            
            if ($isMember) $hadirMember++; else $hadirGuest++;
            
            $dateOnly = date('Y-m-d', strtotime($att->checkin_time));
            if (!isset($daysCount[$dateOnly])) $daysCount[$dateOnly] = 0;
            $daysCount[$dateOnly]++;

            $sheet1->setCellValue('A' . $rowNum, date('d-m-Y', strtotime($att->checkin_time)));
            $sheet1->setCellValue('B' . $rowNum, $nama);
            $sheet1->setCellValueExplicit('C' . $rowNum, $hp, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet1->setCellValue('D' . $rowNum, $tipe);
            $sheet1->setCellValue('E' . $rowNum, $kode);
            $sheet1->setCellValue('F' . $rowNum, date('H:i:s', strtotime($att->checkin_time)));
            
            $rowNum++;
        }
        $this->autoSizeCols($sheet1, 'F');

        // Sheet 2: Analisis
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Analisis - Summary');
        
        $sheet2->setCellValue('A1', 'Analisis Data Kehadiran');
        $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        
        $totalDays = count($daysCount);
        $rataRataHarian = $totalDays > 0 ? ($totalHadir / $totalDays) : 0;
        
        $highestDay = '-';
        $highestCount = 0;
        foreach ($daysCount as $day => $count) {
            if ($count > $highestCount) {
                $highestCount = $count;
                $highestDay = date('d-m-Y', strtotime($day));
            }
        }
        if ($highestCount > 0) {
            $highestDay .= " ($highestCount kehadiran)";
        }
        
        $summaryData = [
            ['Total Kehadiran', $totalHadir],
            ['Total Kehadiran Member', $hadirMember],
            ['Total Kehadiran Guest', $hadirGuest],
            ['Rata-rata Kehadiran Harian', round($rataRataHarian, 2)],
            ['Hari dengan Kehadiran Tertinggi', $highestDay],
        ];
        
        $rowNum = 3;
        foreach ($summaryData as $data) {
            $sheet2->setCellValue('A' . $rowNum, $data[0]);
            $sheet2->setCellValue('B' . $rowNum, $data[1]);
            $sheet2->getStyle('A'.$rowNum)->getFont()->setBold(true);
            $rowNum++;
        }
        $this->autoSizeCols($sheet2, 'B');

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Laporan_Kehadiran_' . date('Ymd_His') . '.xlsx';
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
