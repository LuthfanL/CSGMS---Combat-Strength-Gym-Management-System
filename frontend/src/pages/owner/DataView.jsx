import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';

const DataView = () => {
  useEffect(() => {
    document.title = "Data Master - CSGMS";
  }, []);

  const [activeTab, setActiveTab] = useState('members');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Data Master (Read-Only)</h1>
        <p className="text-foreground/70 text-xs">Lihat seluruh data member, transaksi, dan log kehadiran.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-4 sm:space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'members' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
            }`}
          >
            Data Member
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'transactions' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
            }`}
          >
            Data Transaksi
          </button>
          <button
            onClick={() => setActiveTab('attendances')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'attendances' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
            }`}
          >
            Data Kehadiran
          </button>
        </nav>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
          <input 
            type="text" 
            placeholder={`Cari data ${activeTab}...`} 
            className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground shadow-sm"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === 'members' && (
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-2">Kode Member</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2 font-medium">CSG-00123</td>
                  <td className="px-4 py-2">Budi Santoso</td>
                  <td className="px-4 py-2 text-foreground/60">budi@example.com</td>
                  <td className="px-4 py-2">
                    <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-[10px] font-medium border border-green-500/20">Aktif</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-primary hover:text-primary-hover p-1" title="Lihat Detail">
                      <Eye className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2 font-medium">CSG-00124</td>
                  <td className="px-4 py-2">Siti Aminah</td>
                  <td className="px-4 py-2 text-foreground/60">siti@example.com</td>
                  <td className="px-4 py-2">
                    <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-md text-[10px] font-medium border border-red-500/20">Expired</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-primary hover:text-primary-hover p-1" title="Lihat Detail">
                      <Eye className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'transactions' && (
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-2">Invoice</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Member/Guest</th>
                  <th className="px-4 py-2">Metode</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2 font-medium">INV-231027-001</td>
                  <td className="px-4 py-2">2023-10-27</td>
                  <td className="px-4 py-2">Budi Santoso</td>
                  <td className="px-4 py-2">QRIS</td>
                  <td className="px-4 py-2">
                    <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-[10px] font-medium border border-green-500/20">Lunas</span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium">Rp 250.000</td>
                </tr>
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2 font-medium">INV-231027-003</td>
                  <td className="px-4 py-2">2023-10-27</td>
                  <td className="px-4 py-2">Bambang (Guest)</td>
                  <td className="px-4 py-2">Cash</td>
                  <td className="px-4 py-2">
                    <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md text-[10px] font-medium border border-yellow-500/20">Menunggu</span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium">Rp 35.000</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'attendances' && (
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-2">Waktu Check-in</th>
                  <th className="px-4 py-2">Tipe</th>
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">Identitas (Member Code / HP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2">27 Okt 2023, 08:15:22</td>
                  <td className="px-4 py-2"><span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full text-[10px] font-medium">Member</span></td>
                  <td className="px-4 py-2">Budi Santoso</td>
                  <td className="px-4 py-2 text-foreground/60">CSG-00123</td>
                </tr>
                <tr className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-2">27 Okt 2023, 09:30:05</td>
                  <td className="px-4 py-2"><span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full text-[10px] font-medium">Guest</span></td>
                  <td className="px-4 py-2">Andi Hidayat</td>
                  <td className="px-4 py-2 text-foreground/60">081234567890</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataView;
