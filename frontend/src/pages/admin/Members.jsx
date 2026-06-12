import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Edit, UserX, UserCheck, Eye, X, Save, MapPin, Phone, Mail, Calendar, Hash, Loader2, Users, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000/api';
const STORAGE_URL = 'http://localhost:8000/storage';

const Members = () => {
  const { token } = useAuth();
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailMember, setDetailMember] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Fetch members from API
  const fetchMembers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`${API_URL}/admin/members?${params}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Gagal memuat data');

      const data = await res.json();
      setMembers(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        from: data.from || 0,
        to: data.to || 0,
        total: data.total,
      });
    } catch {
      toast.error('Gagal memuat data member.');
    } finally {
      setIsLoading(false);
    }
  }, [token, search, statusFilter]);

  useEffect(() => {
    fetchMembers(1);
  }, [fetchMembers]);

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
  };

  // Fetch member detail
  const fetchDetail = async (idMember) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/members/${idMember}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Gagal memuat detail');
      const data = await res.json();
      setDetailMember(data);
    } catch {
      toast.error('Gagal memuat detail member.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleView = (member) => {
    setSelectedMember(member);
    setDetailMember(null);
    setIsViewModalOpen(true);
    fetchDetail(member.idMember);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleToggle = (member) => {
    setSelectedMember(member);
    setIsToggleModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsToggleModalOpen(false);
    setTimeout(() => {
      setSelectedMember(null);
      setDetailMember(null);
    }, 300);
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const map = {
      'Aktif': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Expired': 'bg-red-500/10 text-red-500 border-red-500/20',
      'Nonaktif': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      'Belum Aktif': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
    return map[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const { current_page, last_page } = pagination;
    const start = Math.max(1, current_page - 2);
    const end = Math.min(last_page, current_page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex flex-col space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Kelola Member</h1>
        <p className="text-foreground/70 text-xs">Daftar semua member gym Anda beserta status keaktifannya.</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
            <input
              type="text"
              placeholder="Cari nama atau kode member..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="expired">Expired</option>
              <option value="belum_aktif">Belum Aktif</option>
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-sm text-foreground/50">Memuat data member...</span>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-10 h-10 text-foreground/20" />
                      <span className="text-sm text-foreground/50">
                        {search || statusFilter ? 'Tidak ada member yang sesuai filter.' : 'Belum ada data member.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map(member => {
                  const avatarUrl = member.photo
                    ? `${STORAGE_URL}/${member.photo}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=80`;

                  return (
                    <tr key={member.idMember} className="hover:bg-background/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                          />
                          <div>
                            <div className="font-medium text-foreground">{member.name}</div>
                            <div className="text-[10px] text-foreground/50">{member.member_code || 'Belum ada kode'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-xs">{member.phone}</div>
                        <div className="text-[10px] text-foreground/50">{member.email}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadge(member.membership_status)}`}>
                          {member.membership_status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs text-center ${member.membership_status === 'Expired' ? 'text-red-500 font-medium' : ''}`}>
                        {formatDate(member.end_date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleView(member)} className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded transition-colors" title="Lihat Profil">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(member)} className="p-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded transition-colors" title="Edit Data">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(member)}
                            className={`p-1.5 rounded transition-colors ${
                              member.is_active
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            }`}
                            title={member.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {member.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && members.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-foreground/50">
              Menampilkan {pagination.from} hingga {pagination.to} dari {pagination.total} data
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => fetchMembers(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground/50 disabled:opacity-50 hover:bg-border/50 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Sebelumnya
              </button>
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => fetchMembers(page)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    page === pagination.current_page
                      ? 'bg-primary text-white'
                      : 'bg-background border border-border hover:bg-border/50 text-foreground'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => fetchMembers(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.last_page}
                className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground/50 disabled:opacity-50 hover:bg-border/50 transition-colors flex items-center gap-1"
              >
                Selanjutnya <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
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
              {isDetailLoading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-sm text-foreground/50">Memuat profil...</span>
                </div>
              ) : detailMember ? (
                <>
                  <div className="flex flex-col items-center gap-2 text-center pb-2">
                    <img
                      src={detailMember.photo ? `${STORAGE_URL}/${detailMember.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(detailMember.name)}&background=random&size=200`}
                      alt={detailMember.name}
                      className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover shadow-inner mb-2"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{detailMember.name}</h2>
                      {detailMember.member_code ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold mt-1.5">
                          <Hash className="h-3.5 w-3.5" />
                          {detailMember.member_code}
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/50 font-medium mt-1">Belum ada kode member</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm bg-background/50 p-4 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3 text-foreground/80">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{detailMember.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground/80">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>{detailMember.email}</span>
                    </div>
                    <div className="flex items-start gap-3 text-foreground/80">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{detailMember.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground/80 pt-2 border-t border-border">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Bergabung: <strong className="text-foreground">{formatDate(detailMember.join_date)}</strong></span>
                    </div>
                  </div>

                  <div className="bg-background border border-border rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Status Membership</p>
                      <p className={`text-sm font-bold ${getStatusBadge(detailMember.membership_status).includes('green') ? 'text-green-500' : detailMember.membership_status === 'Expired' ? 'text-red-500' : detailMember.membership_status === 'Nonaktif' ? 'text-zinc-400' : 'text-orange-500'}`}>
                        {detailMember.membership_status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        {detailMember.membership_status === 'Aktif' ? 'Berlaku Sampai' : detailMember.end_date ? 'Terakhir Expired' : 'Paket'}
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {detailMember.end_date ? formatDate(detailMember.end_date) : '-'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <span className="text-sm text-foreground/50">Gagal memuat data member.</span>
                </div>
              )}
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
        <EditMemberModal
          member={selectedMember}
          token={token}
          onClose={closeModal}
          onSaved={() => {
            closeModal();
            fetchMembers(pagination.current_page);
            toast.success('Data member berhasil diperbarui.');
          }}
        />,
        document.body
      )}

      {/* --- MODAL TOGGLE ACTIVE --- */}
      {isToggleModalOpen && selectedMember && createPortal(
        <ToggleActiveModal
          member={selectedMember}
          token={token}
          onClose={closeModal}
          onConfirmed={() => {
            closeModal();
            fetchMembers(pagination.current_page);
          }}
        />,
        document.body
      )}
    </div>
  );
};

// ── Edit Member Modal ──
const EditMemberModal = ({ member, token, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: member.name || '',
    phone: member.phone || '',
    address: member.address || '',
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleNameInput = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
    setFormData(p => ({ ...p, name: e.target.value }));
  };

  const handlePhoneInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(p => ({ ...p, phone: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama lengkap wajib diisi.';
    else if (formData.name.trim().length < 3) errs.name = 'Nama minimal 3 karakter.';
    else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name)) errs.name = 'Nama hanya boleh berisi huruf, spasi, titik, dan tanda petik.';

    if (!formData.phone.trim()) errs.phone = 'Nomor HP wajib diisi.';
    else if (!/^[0-9]{10,15}$/.test(formData.phone)) errs.phone = 'Nomor HP harus 10-15 digit angka.';

    if (!formData.address.trim()) errs.address = 'Alamat wajib diisi.';
    else if (formData.address.trim().length < 10) errs.address = 'Alamat minimal 10 karakter.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const body = new FormData();
      body.append('name', formData.name.trim());
      body.append('phone', formData.phone);
      body.append('address', formData.address.trim());

      const res = await fetch(`${API_URL}/admin/members/${member.idMember}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body,
      });

      const data = await res.json();

      if (res.ok) {
        onSaved();
      } else {
        if (data.errors) {
          const serverErrors = {};
          if (data.errors.name) serverErrors.name = data.errors.name[0];
          if (data.errors.phone) serverErrors.phone = data.errors.phone[0];
          if (data.errors.address) serverErrors.address = data.errors.address[0];
          setErrors(serverErrors);
        }
        toast.error(data.message || 'Gagal memperbarui data member.');
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (field) =>
    `bg-background block w-full px-3 py-2 border ${errors[field] ? 'border-red-500' : 'border-border'} rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors`;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={onClose}></div>
      <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Edit className="w-4 h-4 text-primary" /> Edit Data Member
          </h3>
          <button onClick={onClose} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onInput={handleNameInput}
                className={inputClass('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nomor Handphone</label>
              <input
                type="tel"
                value={formData.phone}
                onInput={handlePhoneInput}
                maxLength={15}
                className={inputClass('phone')}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Email (Hanya Baca)</label>
              <input
                type="email"
                defaultValue={member.email}
                disabled
                className="bg-foreground/5 block w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground/50 cursor-not-allowed"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Alamat Lengkap</label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                className={inputClass('address') + ' resize-none'}
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
            </div>
          </div>
          {/* Modal Footer */}
          <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)] disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Toggle Active Modal ──
const ToggleActiveModal = ({ member, token, onClose, onConfirmed }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isActive = member.is_active;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/members/${member.idMember}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        onConfirmed();
      } else {
        toast.error(data.message || 'Gagal mengubah status member.');
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={onClose}></div>
      <div className="relative bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
          <h3 className={`font-bold flex items-center gap-2 ${isActive ? 'text-red-500' : 'text-green-500'}`}>
            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {isActive ? 'Konfirmasi Nonaktif' : 'Konfirmasi Aktifkan'}
          </h3>
          <button onClick={onClose} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground/80 text-center">
            Apakah Anda yakin ingin {isActive ? 'menonaktifkan' : 'mengaktifkan kembali'} member <strong className="text-foreground">{member.name}</strong>?
          </p>
          {isActive ? (
            <p className="text-[10px] text-foreground/50 text-center bg-red-500/10 text-red-500 p-2 rounded-lg border border-red-500/20">
              Aksi ini akan mencabut seluruh akses {member.name} ke fasilitas gym.
            </p>
          ) : (
            <p className="text-[10px] text-foreground/50 text-center bg-green-500/10 text-green-500 p-2 rounded-lg border border-green-500/20">
              Aksi ini akan mengembalikan akses {member.name} ke fasilitas gym.
            </p>
          )}
        </div>
        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_10px_rgba(255,42,42,0.3)]'
                : 'bg-green-500 hover:bg-green-600 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
            }`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isActive ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Members;
