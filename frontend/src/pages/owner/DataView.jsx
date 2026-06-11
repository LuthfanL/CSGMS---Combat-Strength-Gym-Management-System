import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Eye, X, Phone, Mail, MapPin, Calendar, FileSpreadsheet, Download } from 'lucide-react';

const dummyMembers = [
  {
    id: 1,
    name: "Budi Santoso",
    code: "CSG-00123",
    phone: "081234567890",
    email: "budi@example.com",
    address: "Jl. Sudirman No. 12, Jakarta",
    status: "Aktif",
    expired: "15-Nov-2026",
    joinDate: "15-Nov-2025"
  },
  {
    id: 2,
    name: "Siti Aminah",
    code: "CSG-00124",
    phone: "089876543210",
    email: "siti@example.com",
    address: "Jl. Thamrin No. 99, Jakarta Selatan",
    status: "Expired",
    expired: "01-Oct-2026",
    joinDate: "01-Oct-2025"
  }
];

const dummyTransactions = [
  {
    id: 1,
    invoice: "INV-231027-001",
    date: "27-Oct-2026",
    member: "Budi Santoso",
    method: "QRIS",
    status: "Lunas",
    amount: "250000"
  },
  {
    id: 2,
    invoice: "INV-231027-003",
    date: "27-Oct-2026",
    member: "Bambang (Guest)",
    method: "Cash",
    status: "Menunggu",
    amount: "35000"
  }
];

const dummyAttendances = [
  {
    id: 1,
    time: "27-Oct-2026, 08:15:22",
    type: "Member",
    name: "Budi Santoso",
    code: "CSG-00123",
    phone: "081234567890"
  },
  {
    id: 2,
    time: "27-Oct-2026, 09:30:05",
    type: "Guest",
    name: "Andi Hidayat",
    code: "-",
    phone: "081234567890"
  }
];

const DataView = () => {
  useEffect(() => {
    document.title = "Data Master Operasional - CSGMS";
  }, []);

  const [activeTab, setActiveTab] = useState('members');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleView = (member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsExportModalOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  const formatRupiahCustom = (numberStr) => {
    // format as 250.000,-
    const num = parseInt(numberStr, 10);
    const formatted = new Intl.NumberFormat('id-ID').format(num);
    return `${formatted},-`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Data Master Operasional</h1>
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
            className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground shadow-sm transition-colors"
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2 w-full sm:w-auto">
          {activeTab === 'attendances' && (
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-2 py-1 shadow-sm">
              <span className="text-xs text-foreground/70 font-medium">Dari:</span>
              <input type="date" className="bg-transparent border-none p-1 text-sm text-foreground focus:ring-0 w-32 outline-none dark:[color-scheme:dark]" />
              <span className="text-xs text-foreground/70 font-medium border-l border-border pl-2">Sampai:</span>
              <input type="date" className="bg-transparent border-none p-1 text-sm text-foreground focus:ring-0 w-32 outline-none dark:[color-scheme:dark]" />
            </div>
          )}
          {activeTab === 'transactions' && (
            <>
              <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors shadow-sm w-full sm:w-auto">
                <option value="">Bulan Ini</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="year">Tahun Ini</option>
                <option value="all">Semua Waktu</option>
              </select>
              <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors shadow-sm w-full sm:w-auto">
                <option value="">Semua Metode</option>
                <option value="qris">QRIS/E-Wallet</option>
                <option value="cash">Cash (Tunai)</option>
              </select>
            </>
          )}

          <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors shadow-sm w-full sm:w-auto">
            {activeTab === 'members' && (
              <>
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="expired">Expired</option>
                <option value="nonaktif">Nonaktif</option>
              </>
            )}
            {activeTab === 'transactions' && (
              <>
                <option value="">Semua Status</option>
                <option value="pending">Menunggu Konfirmasi</option>
                <option value="lunas">Lunas</option>
                <option value="batal">Dibatalkan</option>
              </>
            )}
            {activeTab === 'attendances' && (
              <>
                <option value="">Semua Tipe</option>
                <option value="member">Member</option>
                <option value="guest">Guest</option>
              </>
            )}
          </select>

          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
            title="Cetak Laporan Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak Laporan Excel</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === 'members' && (
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-center">Member</th>
                  <th className="px-4 py-3 text-center">Kontak</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Expired</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dummyMembers.map(member => (
                  <tr key={member.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{member.name}</div>
                          <div className="text-[10px] text-foreground/50">{member.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-xs text-foreground">{member.phone}</div>
                      <div className="text-[10px] text-foreground/50">{member.email}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        member.status === 'Aktif' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center text-xs ${member.status === 'Expired' ? 'text-red-500 font-medium' : ''}`}>
                      {member.expired}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button onClick={() => handleView(member)} className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded transition-colors" title="Lihat Profil">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'transactions' && (
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-center">Invoice</th>
                  <th className="px-4 py-2 text-center">Tanggal</th>
                  <th className="px-4 py-2 text-center">Member/Guest</th>
                  <th className="px-4 py-2 text-center">Metode</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dummyTransactions.map(trx => (
                  <tr key={trx.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{trx.invoice}</td>
                    <td className="px-4 py-3 text-center text-foreground">{trx.date}</td>
                    <td className="px-4 py-3 text-foreground">{trx.member}</td>
                    <td className="px-4 py-3 text-center">
                      {trx.method}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        trx.status === 'Lunas' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-between w-full font-medium text-foreground">
                        <span>Rp</span>
                        <span>{formatRupiahCustom(trx.amount)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'attendances' && (
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-center">Nama</th>
                  <th className="px-4 py-2 text-center">Nomor HP</th>
                  <th className="px-4 py-2 text-center">Tipe</th>
                  <th className="px-4 py-2 text-center">Member Code</th>
                  <th className="px-4 py-2 text-center">Waktu Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dummyAttendances.map(att => (
                  <tr key={att.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-2 text-left">{att.name}</td>
                    <td className="px-4 py-2 text-center text-foreground/60">{att.phone}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        att.type === 'Member' 
                        ? 'bg-blue-500/10 text-blue-500' 
                        : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {att.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-foreground/60">{att.code}</td>
                    <td className="px-4 py-2 text-left">{att.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL VIEW MEMBER (Read-Only) --- */}
      {isViewModalOpen && selectedMember && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-foreground">Profil Member</h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-2 text-center pb-2">
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary font-bold text-4xl shadow-inner mb-2">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedMember.name}</h2>
                  <p className="text-sm text-foreground/50 font-medium">{selectedMember.code}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm bg-background/50 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-3 text-foreground/80">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{selectedMember.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/80">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{selectedMember.email}</span>
                </div>
                <div className="flex items-start gap-3 text-foreground/80">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{selectedMember.address}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/80 pt-2 border-t border-border">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Bergabung: <strong className="text-foreground">{selectedMember.joinDate}</strong></span>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Status Membership</p>
                  <p className={`text-sm font-bold ${selectedMember.status === 'Aktif' ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedMember.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Berlaku Sampai</p>
                  <p className="text-sm font-bold text-foreground">{selectedMember.expired}</p>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-background/50 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL EXPORT EXCEL --- */}
      {isExportModalOpen && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-green-500/10">
              <h3 className="font-bold text-green-500 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" /> Cetak Excel
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground/70">Pilih filter untuk data <strong className="text-foreground">{activeTab === 'members' ? 'Member' : activeTab === 'transactions' ? 'Transaksi' : 'Kehadiran'}</strong> yang ingin dicetak:</p>
              
              <div className="space-y-3">
                {activeTab === 'members' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Status Member</label>
                    <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-green-500 focus:border-green-500 transition-colors">
                      <option value="all">Semua Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="expired">Expired</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                )}

                {(activeTab === 'transactions' || activeTab === 'attendances') && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Dari Tanggal</label>
                      <input type="date" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-green-500 focus:border-green-500 transition-colors dark:[color-scheme:dark]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Sampai Tanggal</label>
                      <input type="date" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-green-500 focus:border-green-500 transition-colors dark:[color-scheme:dark]" />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Batal
              </button>
              <button 
                onClick={() => {
                  alert(`Memulai unduh laporan Excel untuk Data ${activeTab === 'members' ? 'Member' : activeTab === 'transactions' ? 'Transaksi' : 'Kehadiran'}...`);
                  closeModal();
                }} 
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              >
                <Download className="w-4 h-4" /> Unduh Laporan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default DataView;
