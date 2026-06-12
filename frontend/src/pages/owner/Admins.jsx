import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, UserX, UserCheck, Search, X, Camera, Loader2, Users, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000/api';
const STORAGE_URL = 'http://localhost:8000/storage';

const Admins = () => {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

  useEffect(() => {
    document.title = "Manajemen Admin - CSGMS";
  }, []);

  const fetchAdmins = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`${API_URL}/owner/admins?${params}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Gagal memuat data');

      const data = await res.json();
      setAdmins(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        from: data.from || 0,
        to: data.to || 0,
        total: data.total,
      });
    } catch {
      toast.error('Gagal memuat data admin.');
    } finally {
      setIsLoading(false);
    }
  }, [token, search, statusFilter]);

  useEffect(() => {
    fetchAdmins(1);
  }, [fetchAdmins]);

  const openModal = (type, data = null) => {
    setModalConfig({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null, data: null });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const { current_page, last_page } = pagination;
    const start = Math.max(1, current_page - 2);
    const end = Math.min(last_page, current_page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Akun Admin</h1>
          <p className="text-foreground/70 text-xs">Kelola akun admin cabang yang dapat mengakses sistem.</p>
        </div>
        <button onClick={() => openModal('add')} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,42,42,0.3)]">
          <Plus className="w-3 h-3" />
          Tambah Admin
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border flex flex-col shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3 text-center">Kontak</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Bergabung Sejak</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-sm text-foreground/50">Memuat data admin...</span>
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-10 h-10 text-foreground/20" />
                      <span className="text-sm text-foreground/50">
                        {search || statusFilter ? 'Tidak ada admin yang sesuai filter.' : 'Belum ada data admin.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const avatarUrl = admin.photo 
                    ? `${STORAGE_URL}/${admin.photo}` 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=random&size=80`;

                  return (
                    <tr key={admin.idUser} className={`hover:bg-background/50 transition-colors ${!admin.is_active ? 'opacity-75' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={avatarUrl} 
                            alt={admin.name} 
                            className={`w-8 h-8 rounded-full object-cover flex-shrink-0 ${!admin.photo ? 'opacity-80' : ''}`}
                          />
                          <div>
                            <div className="font-medium text-foreground">{admin.name}</div>
                            <div className="text-[10px] text-foreground/50">{admin.idUser.substring(0, 8).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-xs">{admin.phone}</div>
                        <div className="text-[10px] text-foreground/50">{admin.email}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {admin.is_active ? (
                          <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-medium border border-green-500/20">Aktif</span>
                        ) : (
                          <span className="bg-foreground/10 text-foreground/60 px-2 py-0.5 rounded text-[10px] font-medium border border-border">Nonaktif</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-foreground/70">
                        {formatDate(admin.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openModal('edit', admin)} className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded transition-colors" title="Edit Data">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openModal(admin.is_active ? 'deactivate' : 'activate', admin)} 
                            className={`p-1.5 rounded transition-colors ${
                              admin.is_active 
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                                : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            }`}
                            title={admin.is_active ? 'Nonaktifkan' : 'Aktifkan Kembali'}
                          >
                            {admin.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
        {!isLoading && admins.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-foreground/50">
              Menampilkan {pagination.from} hingga {pagination.to} dari {pagination.total} data
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => fetchAdmins(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground/50 disabled:opacity-50 hover:bg-border/50 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Sebelumnya
              </button>
              {getPageNumbers().map(page => (
                <button 
                  key={page}
                  onClick={() => fetchAdmins(page)}
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
                onClick={() => fetchAdmins(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.last_page}
                className="px-2 py-1 bg-background border border-border rounded text-xs text-foreground/50 disabled:opacity-50 hover:bg-border/50 transition-colors flex items-center gap-1"
              >
                Selanjutnya <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {modalConfig.isOpen && (modalConfig.type === 'add' || modalConfig.type === 'edit') && createPortal(
        <AdminFormModal 
          type={modalConfig.type} 
          admin={modalConfig.data} 
          token={token}
          onClose={closeModal} 
          onSaved={() => {
            closeModal();
            fetchAdmins(pagination.current_page);
          }} 
        />,
        document.body
      )}

      {modalConfig.isOpen && (modalConfig.type === 'deactivate' || modalConfig.type === 'activate') && createPortal(
        <ToggleActiveModal 
          admin={modalConfig.data} 
          token={token}
          onClose={closeModal}
          onConfirmed={() => {
            closeModal();
            fetchAdmins(pagination.current_page);
          }}
        />,
        document.body
      )}
    </div>
  );
};

// ── Admin Form Modal (Add / Edit) ──
const AdminFormModal = ({ type, admin, token, onClose, onSaved }) => {
  const isEdit = type === 'edit';
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || '',
    address: admin?.address || '',
    password: '',
    password_confirmation: ''
  });
  const [photoPreview, setPhotoPreview] = useState(
    admin?.photo ? `${STORAGE_URL}/${admin.photo}` : null
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInput = (field, e) => {
    let val = e.target.value;
    if (field === 'name') val = val.replace(/[^a-zA-Z\s.'-]/g, '');
    if (field === 'phone') val = val.replace(/[^0-9]/g, '');
    setFormData(p => ({ ...p, [field]: val }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama wajib diisi.';
    if (!formData.email.trim()) errs.email = 'Email wajib diisi.';
    if (!formData.phone.trim()) errs.phone = 'Nomor HP wajib diisi.';
    if (!formData.address.trim()) errs.address = 'Alamat wajib diisi.';

    if (!isEdit && !formData.password) errs.password = 'Password wajib diisi.';
    
    if (formData.password) {
      if (formData.password.length < 8) errs.password = 'Password minimal 8 karakter.';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) {
        errs.password = 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial.';
      } else if (formData.password !== formData.password_confirmation) {
        errs.password_confirmation = 'Konfirmasi password tidak cocok.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append('name', formData.name.trim());
      body.append('email', formData.email.trim());
      body.append('phone', formData.phone);
      body.append('address', formData.address.trim());
      
      if (formData.password) {
        body.append('password', formData.password);
      }
      if (photoFile) {
        body.append('photo', photoFile);
      }

      const url = isEdit ? `${API_URL}/owner/admins/${admin.idUser}` : `${API_URL}/owner/admins`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        onSaved();
      } else {
        if (data.errors) {
          const serverErrs = {};
          Object.keys(data.errors).forEach(key => serverErrs[key] = data.errors[key][0]);
          setErrors(serverErrs);
        }
        toast.error(data.message || 'Gagal menyimpan data.');
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) => 
    `bg-background block w-full px-3 py-2 border ${errors[field] ? 'border-red-500' : 'border-border'} rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors`;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={onClose}></div>
      <div className="relative bg-card w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5 shrink-0">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            {isEdit ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-primary" />}
            {isEdit ? 'Edit Akun Admin' : 'Tambah Admin Baru'}
          </h3>
          <button onClick={onClose} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Photo Upload */}
            <div className="flex flex-col items-center justify-center mb-2">
              <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-background/50 hover:bg-background transition-colors cursor-pointer overflow-hidden group">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-foreground/50 group-hover:text-primary transition-colors flex flex-col items-center">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">Upload Foto</span>
                  </div>
                )}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${photoPreview ? '' : 'hidden'}`}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <input type="file" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/jpeg,image/png,image/jpg" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider">Nama Lengkap</label>
              <input type="text" value={formData.name} onChange={(e) => handleInput('name', e)} className={inputClass('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider">Email {isEdit && '(Hanya Baca)'}</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} disabled={isEdit} className={isEdit ? `bg-foreground/5 block w-full px-3 py-2 border border-border rounded-lg text-sm text-foreground/50 cursor-not-allowed` : inputClass('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider">Nomor HP</label>
              <input type="tel" maxLength={15} value={formData.phone} onChange={(e) => handleInput('phone', e)} className={inputClass('phone')} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider">Alamat Lengkap</label>
              <textarea rows={2} value={formData.address} onChange={(e) => setFormData(p => ({...p, address: e.target.value}))} className={inputClass('address') + " resize-none"} />
              {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider min-h-[28px] flex items-end pb-1">
                  Password {isEdit && <span className="normal-case lowercase font-normal opacity-70 ml-1">(kosongkan jika tetap)</span>}
                </label>
                <input type="password" value={formData.password} onChange={(e) => setFormData(p => ({...p, password: e.target.value}))} className={inputClass('password')} />
                {errors.password && <p className="text-[10px] text-red-500 leading-tight mt-1">{errors.password}</p>}
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider min-h-[28px] flex items-end pb-1">
                  Konfirmasi Password
                </label>
                <input type="password" value={formData.password_confirmation} onChange={(e) => setFormData(p => ({...p, password_confirmation: e.target.value}))} className={inputClass('password_confirmation')} />
                {errors.password_confirmation && <p className="text-[10px] text-red-500 leading-tight mt-1">{errors.password_confirmation}</p>}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2 shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)] disabled:opacity-50">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Admin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Toggle Active Modal ──
const ToggleActiveModal = ({ admin, token, onClose, onConfirmed }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isActive = admin.is_active;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/owner/admins/${admin.idUser}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        onConfirmed();
      } else {
        toast.error(data.message || 'Gagal mengubah status.');
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
        <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
          <h3 className={`font-bold flex items-center gap-2 ${isActive ? 'text-red-500' : 'text-green-500'}`}>
            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {isActive ? 'Konfirmasi Nonaktif' : 'Konfirmasi Aktifkan'}
          </h3>
          <button onClick={onClose} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground/80 text-center">
            Apakah Anda yakin ingin {isActive ? 'menonaktifkan' : 'mengaktifkan kembali'} akun admin <strong className="text-foreground">{admin.name}</strong>?
          </p>
          {isActive ? (
            <p className="text-[10px] text-foreground/50 text-center bg-red-500/10 text-red-500 p-2 rounded-lg border border-red-500/20">
              Admin ini tidak akan bisa login atau mengakses sistem lagi.
            </p>
          ) : (
            <p className="text-[10px] text-foreground/50 text-center bg-green-500/10 text-green-500 p-2 rounded-lg border border-green-500/20">
              Admin akan bisa login kembali menggunakan email dan passwordnya.
            </p>
          )}
        </div>
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

export default Admins;
