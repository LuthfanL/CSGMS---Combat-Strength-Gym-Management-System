import { useEffect } from 'react';
import { History, Search, FileJson } from 'lucide-react';

const AuditLogs = () => {
  useEffect(() => {
    document.title = "Audit Logs - CSGMS";
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Riwayat Audit (Audit Logs)</h1>
        <p className="text-foreground/70 text-xs">Lacak semua aktivitas dan perubahan data yang dilakukan di dalam sistem.</p>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-card p-3 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2 h-4 w-4 text-foreground/50" />
          <input 
            type="text" 
            placeholder="Cari aktivitas atau modul..." 
            className="pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs w-full focus:ring-primary focus:border-primary text-foreground"
          />
        </div>
      </div>

      {/* Timeline/Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center">Waktu</th>
                <th className="px-4 py-3 text-center">Pengguna</th>
                <th className="px-4 py-3 text-center">Modul</th>
                <th className="px-4 py-3 text-center">Aktivitas</th>
                <th className="px-4 py-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-center text-foreground">
                  27-Oct-2023, 10:23:45
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">Admin Satu</div>
                  <div className="text-[10px] text-foreground/50">admin1@...</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded text-[10px] font-medium border border-purple-500/20">Pembayaran</span>
                </td>
                <td className="px-4 py-3 text-foreground">
                  Memverifikasi pembayaran invoice <strong>INV-231027-001</strong>
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-foreground/50 hover:text-primary transition-colors p-1" title="Lihat Data JSON">
                    <FileJson className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-center text-foreground">
                  27-Oct-2023, 09:15:12
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">Owner (Anda)</div>
                  <div className="text-[10px] text-foreground/50">owner@...</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-500/20">Pengaturan</span>
                </td>
                <td className="px-4 py-3 text-foreground">
                  Mengubah jam operasional gym untuk hari <strong>Minggu</strong>
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-foreground/50 hover:text-primary transition-colors p-1" title="Lihat Data JSON">
                    <FileJson className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-center text-foreground">
                  26-Oct-2023, 16:45:30
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">Admin Satu</div>
                  <div className="text-[10px] text-foreground/50">admin1@...</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded text-[10px] font-medium border border-orange-500/20">Membership</span>
                </td>
                <td className="px-4 py-3 text-foreground">
                  Membuat paket membership baru: <strong>Promo 6 Bulan</strong>
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-foreground/50 hover:text-primary transition-colors p-1" title="Lihat Data JSON">
                    <FileJson className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-center text-foreground">
                  26-Oct-2023, 14:20:05
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">Sistem</div>
                  <div className="text-[10px] text-foreground/50">auto-scheduler</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-medium border border-green-500/20">Email Notif</span>
                </td>
                <td className="px-4 py-3 text-foreground">
                  Mengirim 5 email notifikasi pengingat H-3 expired otomatis.
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-foreground/50 hover:text-primary transition-colors p-1" title="Lihat Data JSON">
                    <FileJson className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
