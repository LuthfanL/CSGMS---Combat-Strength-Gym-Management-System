import { useState, useEffect } from 'react';
import { Printer, Filter, Calendar } from 'lucide-react';

const Reports = () => {
  useEffect(() => {
    document.title = "Laporan Operasional - CSGMS";
  }, []);

  const [activeTab, setActiveTab] = useState('kehadiran');

  const handlePrint = () => {
    alert('Simulasi mencetak laporan ke PDF...');
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Laporan Operasional</h1>
          <p className="text-foreground/70 text-xs">Lihat dan cetak laporan kehadiran dan pendapatan gym.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Cetak PDF
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-card p-3 rounded-xl border border-border flex flex-col md:flex-row gap-3 items-end shadow-sm">
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-foreground mb-1">Dari Tanggal</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
            <input type="date" className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground" />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-foreground mb-1">Sampai Tanggal</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
            <input type="date" className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground" />
          </div>
        </div>
        <button className="bg-background border border-border hover:bg-border/50 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('kehadiran')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'kehadiran' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
            }`}
          >
            Laporan Kehadiran
          </button>
          <button
            onClick={() => setActiveTab('pendapatan')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pendapatan' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
            }`}
          >
            Laporan Pendapatan
          </button>
        </nav>
      </div>

      {/* Table Content */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === 'kehadiran' && (
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-2">Tanggal & Waktu</th>
                  <th className="px-4 py-2">Tipe</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Member ID / No HP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2">2023-10-27 08:15</td>
                  <td className="px-4 py-2"><span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full text-[10px] font-medium">Member</span></td>
                  <td className="px-4 py-2 font-medium">Budi Santoso</td>
                  <td className="px-4 py-2 text-foreground/60">CSG-00123</td>
                </tr>
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2">2023-10-27 09:30</td>
                  <td className="px-4 py-2"><span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full text-[10px] font-medium">Guest</span></td>
                  <td className="px-4 py-2 font-medium">Andi Hidayat</td>
                  <td className="px-4 py-2 text-foreground/60">081234567890</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'pendapatan' && (
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-2">Invoice</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Tipe Pembayaran</th>
                  <th className="px-4 py-2">Metode</th>
                  <th className="px-4 py-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2 font-medium">INV-231027-001</td>
                  <td className="px-4 py-2">2023-10-27</td>
                  <td className="px-4 py-2">New Membership (1 Bulan)</td>
                  <td className="px-4 py-2"><span className="bg-purple-500/10 text-purple-500 px-2 py-1 rounded-md text-[10px] font-medium">QRIS</span></td>
                  <td className="px-4 py-2 text-right font-medium">Rp 250.000</td>
                </tr>
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2 font-medium">INV-231027-002</td>
                  <td className="px-4 py-2">2023-10-27</td>
                  <td className="px-4 py-2">Guest Harian</td>
                  <td className="px-4 py-2"><span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-[10px] font-medium">Cash</span></td>
                  <td className="px-4 py-2 text-right font-medium">Rp 35.000</td>
                </tr>
              </tbody>
              <tfoot className="bg-background font-bold text-foreground">
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-right">Total Pendapatan:</td>
                  <td className="px-4 py-2 text-right text-primary">Rp 285.000</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
        <div className="p-2 border-t border-border flex justify-center">
          <p className="text-[10px] text-foreground/50">Menampilkan simulasi data laporan terbaru.</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
