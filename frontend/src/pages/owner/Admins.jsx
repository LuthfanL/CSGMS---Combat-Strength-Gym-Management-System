import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, UserX, UserCheck, Search, X, Camera } from 'lucide-react';

const Admins = () => {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

  useEffect(() => {
    document.title = "Manajemen Admin - CSGMS";
  }, []);

  const openModal = (type, data = null) => {
    setModalConfig({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null, data: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Akun Admin</h1>
          <p className="text-foreground/70 text-xs">Kelola akun admin cabang yang dapat mengakses sistem.</p>
        </div>
        <button onClick={() => openModal('add')} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm shadow-[0_0_15px_rgba(255,42,42,0.3)]">
          <Plus className="w-3 h-3" />
          Tambah Admin
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center bg-card p-3 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2 h-4 w-4 text-foreground/50" />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            className="pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs w-full focus:ring-primary focus:border-primary text-foreground"
          />
        </div>
        <div className="w-full sm:w-auto flex justify-end">
          <select className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:ring-primary focus:border-primary transition-colors shadow-sm w-full sm:w-40">
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3 text-center">Kontak</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Bergabung Sejak</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Admin Satu</div>
                      <div className="text-[10px] text-foreground/50 mt-0.5">
                        ID: ADM-001
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">admin1@combatstrength.com</div>
                  <div className="text-foreground/60 text-[10px]">081234567891</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-medium border border-green-500/20">Aktif</span>
                </td>
                <td className="px-4 py-3 text-center text-foreground/70">
                  15-Jan-2023
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openModal('edit', { name: 'Admin Satu', email: 'admin1@combatstrength.com' })} className="text-blue-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors" title="Edit">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => openModal('deactivate', { name: 'Admin Satu' })} className="text-red-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Nonaktifkan">
                      <UserX className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-background/50 transition-colors opacity-75">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/50 font-bold">
                      R
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Rudi (Eks Admin)</div>
                      <div className="text-[10px] text-foreground/50 mt-0.5">
                        ID: ADM-002
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">rudi@combatstrength.com</div>
                  <div className="text-foreground/60 text-[10px]">081234567892</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-foreground/10 text-foreground/60 px-2 py-0.5 rounded text-[10px] font-medium border border-border">Nonaktif</span>
                </td>
                <td className="px-4 py-3 text-center text-foreground/70">
                  01-Mar-2023
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openModal('edit', { name: 'Rudi (Eks Admin)', email: 'rudi@combatstrength.com' })} className="text-blue-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors" title="Edit">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => openModal('activate', { name: 'Rudi (Eks Admin)' })} className="text-green-500 hover:text-green-400 p-1.5 rounded-lg hover:bg-green-500/10 transition-colors" title="Aktifkan Kembali">
                      <UserCheck className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      {modalConfig.isOpen && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                {modalConfig.type === 'add' && <Plus className="w-5 h-5 text-primary" />}
                {modalConfig.type === 'edit' && <Edit2 className="w-5 h-5 text-blue-500" />}
                {modalConfig.type === 'deactivate' && <UserX className="w-5 h-5 text-red-500" />}
                {modalConfig.type === 'activate' && <UserCheck className="w-5 h-5 text-green-500" />}
                {modalConfig.type === 'add' && 'Tambah Admin Baru'}
                {modalConfig.type === 'edit' && 'Edit Akun Admin'}
                {modalConfig.type === 'deactivate' && 'Konfirmasi Penonaktifan'}
                {modalConfig.type === 'activate' && 'Konfirmasi Pengaktifan'}
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {(modalConfig.type === 'add' || modalConfig.type === 'edit') ? (
                <div className="space-y-4">
                  {/* Photo Upload */}
                  <div className="flex flex-col items-center justify-center mb-2">
                    <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-background/50 hover:bg-background transition-colors cursor-pointer overflow-hidden group">
                      <div className="text-center text-foreground/50 group-hover:text-primary transition-colors flex flex-col items-center">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium">Upload Foto</span>
                      </div>
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Nama Admin</label>
                    <input type="text" defaultValue={modalConfig.data?.name || ''} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors" placeholder="Masukkan nama admin..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Email</label>
                    <input type="email" defaultValue={modalConfig.data?.email || ''} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors" placeholder="Masukkan email..." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Password {modalConfig.type === 'edit' && '(Kosongkan jika tetap)'}</label>
                      <input type="password" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors" placeholder="***" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Konfirmasi Password</label>
                      <input type="password" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors" placeholder="***" />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground/80">
                  Apakah Anda yakin ingin {modalConfig.type === 'deactivate' ? <span className="text-red-500 font-bold">menonaktifkan</span> : <span className="text-green-500 font-bold">mengaktifkan kembali</span>} akun admin <strong>{modalConfig.data?.name}</strong>?
                </p>
              )}
            </div>

            <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Batal
              </button>
              <button 
                onClick={() => {
                  alert(`Aksi ${modalConfig.type} berhasil disimulasikan.`);
                  closeModal();
                }} 
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors shadow-sm ${
                  modalConfig.type === 'deactivate' ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-primary hover:bg-primary-hover shadow-[0_0_10px_rgba(255,42,42,0.3)]'
                }`}
              >
                {modalConfig.type === 'add' && 'Simpan'}
                {modalConfig.type === 'edit' && 'Simpan Perubahan'}
                {modalConfig.type === 'deactivate' && 'Ya, Nonaktifkan'}
                {modalConfig.type === 'activate' && 'Ya, Aktifkan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Admins;
