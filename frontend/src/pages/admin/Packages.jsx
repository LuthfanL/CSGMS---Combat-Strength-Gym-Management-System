import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Edit, Archive, X, Save } from 'lucide-react';

const dummyPackages = [
  { id: 1, name: "Paket 1 Bulan", benefits: "Akses Gym", duration: "1 Bulan", price: "150000", status: "Aktif" },
  { id: 2, name: "Paket 3 Bulan", benefits: "Akses Gym, Loker", duration: "3 Bulan", price: "400000", status: "Aktif" },
  { id: 3, name: "Paket 6 Bulan", benefits: "Akses Gym, Loker, Handuk", duration: "6 Bulan", price: "750000", status: "Aktif" },
  { id: 4, name: "Paket 1 Tahun", benefits: "Akses Gym, Loker, Handuk, Personal Trainer", duration: "12 Bulan", price: "1400000", status: "Aktif" }
];

const Packages = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatRupiahCustom = (numberStr) => {
    const num = parseInt(numberStr, 10);
    const formatted = new Intl.NumberFormat('id-ID').format(num);
    return `${formatted},-`;
  };

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setIsEditModalOpen(true);
  };

  const handleDeactivate = (pkg) => {
    setSelectedPackage(pkg);
    setIsDeactivateModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeactivateModalOpen(false);
    setTimeout(() => setSelectedPackage(null), 300);
  };

  return (
    <div className="flex flex-col space-y-4 pb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Paket Membership</h1>
          <p className="text-foreground/70 text-xs">Kelola daftar paket membership yang ditawarkan kepada member.</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)]">
          <Plus className="w-4 h-4" />
          Tambah Paket
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Cari nama paket..." 
              className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center">Nama Paket</th>
                <th className="px-4 py-3 text-center">Benefit</th>
                <th className="px-4 py-3 text-center">Durasi</th>
                <th className="px-4 py-3 text-center">Harga</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {dummyPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{pkg.name}</td>
                  <td className="px-4 py-3 text-xs text-foreground/80">{pkg.benefits}</td>
                  <td className="px-4 py-3 text-xs text-center">{pkg.duration}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-between w-full text-xs font-medium text-primary">
                      <span>Rp</span>
                      <span>{formatRupiahCustom(pkg.price)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEdit(pkg)} className="p-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded transition-colors" title="Edit Paket">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeactivate(pkg)} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors" title="Nonaktifkan Paket">
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL TAMBAH PAKET --- */}
      {isAddModalOpen && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Tambah Paket Baru
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={(e) => { e.preventDefault(); alert('Paket berhasil ditambahkan!'); closeModal(); }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nama Paket</label>
                  <input type="text" placeholder="Misal: Paket Pelajar 1 Bulan" required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Benefit Paket</label>
                  <input type="text" placeholder="Misal: Akses Gym, Loker" required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Durasi Paket (Bulan)</label>
                  <input type="number" min="1" placeholder="Berapa bulan?" required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Harga (Rp)</label>
                  <input type="number" min="0" placeholder="Misal: 150000" required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>
              </div>
              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)]">
                  <Save className="w-4 h-4" /> Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL EDIT PAKET --- */}
      {isEditModalOpen && selectedPackage && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" /> Edit Paket Membership
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={(e) => { e.preventDefault(); alert('Perubahan paket disimpan!'); closeModal(); }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nama Paket</label>
                  <input type="text" defaultValue={selectedPackage.name} required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Benefit Paket</label>
                  <input type="text" defaultValue={selectedPackage.benefits} required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Durasi Paket (Bulan)</label>
                  <input type="text" defaultValue={selectedPackage.duration.replace(' Bulan', '')} required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Harga (Rp)</label>
                  <input type="number" defaultValue={selectedPackage.price} required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>
              </div>
              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)]">
                  <Save className="w-4 h-4" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL NONAKTIFKAN PAKET --- */}
      {isDeactivateModalOpen && selectedPackage && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-red-500 flex items-center gap-2">
                <Archive className="w-4 h-4" /> Konfirmasi Nonaktif
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground/80 text-center">
                Apakah Anda yakin ingin menonaktifkan <strong className="text-foreground">{selectedPackage.name}</strong>?
              </p>
              <p className="text-[10px] text-foreground/50 text-center bg-red-500/10 text-red-500 p-2 rounded-lg border border-red-500/20">
                Member baru tidak akan bisa mendaftar paket ini lagi hingga diaktifkan kembali.
              </p>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Batal
              </button>
              <button onClick={() => { alert(`Paket ${selectedPackage.name} berhasil dinonaktifkan!`); closeModal(); }} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)]">
                Ya, Nonaktifkan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Packages;
