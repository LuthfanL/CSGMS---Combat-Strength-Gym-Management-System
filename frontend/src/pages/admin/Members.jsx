import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Edit, UserX, Eye, X, Save, MapPin, Phone, Mail, Calendar } from 'lucide-react';

const dummyMembers = [
  {
    id: 1,
    name: "Budi Santoso",
    code: "MBR-00123",
    phone: "081234567890",
    email: "budi@email.com",
    address: "Jl. Sudirman No. 12, Jakarta",
    status: "Aktif",
    expired: "15 Nov 2023",
    joinDate: "15 Nov 2022"
  },
  {
    id: 2,
    name: "Siti Aminah",
    code: "MBR-00124",
    phone: "089876543210",
    email: "siti@email.com",
    address: "Jl. Thamrin No. 99, Jakarta Selatan",
    status: "Expired",
    expired: "01 Okt 2023",
    joinDate: "01 Okt 2022"
  }
];

const Members = () => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleView = (member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleDeactivate = (member) => {
    setSelectedMember(member);
    setIsDeactivateModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeactivateModalOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  return (
    <div className="flex flex-col space-y-4 pb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kelola Member</h1>
          <p className="text-foreground/70 text-xs">Daftar semua member gym Anda beserta status keaktifannya.</p>
        </div>
        {/* Tombol Tambah Member telah dihapus sesuai permintaan */}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Cari nama atau kode member..." 
              className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors">
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="expired">Expired</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center">Member</th>
                <th className="px-4 py-3 text-center">Kontak</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">TGL EXPIRED</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {dummyMembers.map(member => (
                <tr key={member.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{member.name}</div>
                        <div className="text-[10px] text-foreground/50">{member.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-xs">{member.phone}</div>
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
                  <td className={`px-4 py-3 text-xs text-center ${member.status === 'Expired' ? 'text-red-500 font-medium' : ''}`}>
                    {member.expired.replace(/ /g, '-')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleView(member)} className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded transition-colors" title="Lihat Profil">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(member)} className="p-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded transition-colors" title="Edit Data">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeactivate(member)} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors" title="Nonaktifkan">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-foreground/50">Menampilkan 1 hingga 2 dari 2 data</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-background border border-border rounded text-xs text-foreground/50 disabled:opacity-50" disabled>Sebelumnya</button>
            <button className="px-3 py-1 bg-primary text-white rounded text-xs font-medium">1</button>
            <button className="px-3 py-1 bg-background border border-border rounded text-xs hover:bg-border/50 text-foreground transition-colors disabled:opacity-50" disabled>Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* --- MODAL VIEW MEMBER --- */}
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

      {/* --- MODAL EDIT MEMBER --- */}
      {isEditModalOpen && selectedMember && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" /> Edit Data Member
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={(e) => { e.preventDefault(); alert('Perubahan data disimpan!'); closeModal(); }}>
              <div className="p-6 space-y-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nama Lengkap</label>
                  <input type="text" defaultValue={selectedMember.name} required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nomor Handphone</label>
                  <input type="tel" defaultValue={selectedMember.phone} required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Email</label>
                  <input type="email" defaultValue={selectedMember.email} required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Alamat Lengkap</label>
                  <textarea rows="3" defaultValue={selectedMember.address} required className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors resize-none"></textarea>
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

      {/* --- MODAL DEACTIVATE MEMBER --- */}
      {isDeactivateModalOpen && selectedMember && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-red-500 flex items-center gap-2">
                <UserX className="w-4 h-4" /> Konfirmasi Nonaktif
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground/80 text-center">
                Apakah Anda yakin ingin menonaktifkan member <strong className="text-foreground">{selectedMember.name}</strong>?
              </p>
              <p className="text-[10px] text-foreground/50 text-center bg-red-500/10 text-red-500 p-2 rounded-lg border border-red-500/20">
                Aksi ini akan mencabut seluruh akses {selectedMember.name} ke fasilitas gym.
              </p>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Batal
              </button>
              <button onClick={() => { alert(`Member ${selectedMember.name} berhasil dinonaktifkan!`); closeModal(); }} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)]">
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

export default Members;
