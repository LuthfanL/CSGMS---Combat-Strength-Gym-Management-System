import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Edit, Archive, X, Save, CheckCircle, Loader2, PackageOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const Packages = () => {
  const { token } = useAuth();
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [guestPrice, setGuestPrice] = useState('');
  const [isEditingGuestPrice, setIsEditingGuestPrice] = useState(false);
  const [guestPriceInput, setGuestPriceInput] = useState('');
  const [isSavingGuestPrice, setIsSavingGuestPrice] = useState(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`${API_URL}/admin/packages?${params}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Gagal memuat data');

      const data = await res.json();
      setPackages(data);

      const settingsRes = await fetch(`${API_URL}/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setGuestPrice(settingsData.settings?.guest_price || 15000);
      }
    } catch {
      toast.error('Gagal memuat data paket membership.');
    } finally {
      setIsLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const formatRupiahCustom = (numberStr) => {
    const num = parseInt(numberStr, 10);
    const formatted = new Intl.NumberFormat('id-ID').format(num);
    return `${formatted},-`;
  };

  const openModal = (type, data = null) => {
    setModalConfig({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null, data: null });
  };

  return (
    <div className="flex flex-col space-y-4 pb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Paket Membership</h1>
          <p className="text-foreground/70 text-xs">Kelola daftar paket membership yang ditawarkan kepada member.</p>
        </div>
        <button onClick={() => openModal('add')} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)]">
          <Plus className="w-4 h-4" />
          Tambah Paket
        </button>
      </div>

      {/* --- PENGATURAN HARGA GUEST --- */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-foreground">Harga Guest Harian</h2>
          <p className="text-xs text-foreground/70">Harga yang akan dikenakan untuk setiap check-in guest harian.</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditingGuestPrice ? (
            <>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-foreground/50 font-medium">Rp</span>
                <input 
                  type="text" 
                  value={guestPriceInput}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    setGuestPriceInput(formatRupiahCustom(rawValue).replace(',-', ''));
                  }}
                  className="pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-sm w-32 focus:ring-primary focus:border-primary text-foreground transition-colors font-medium"
                />
              </div>
              <button 
                onClick={async () => {
                  setIsSavingGuestPrice(true);
                  try {
                    const rawPrice = parseInt(guestPriceInput.replace(/\./g, ''), 10);
                    const res = await fetch(`${API_URL}/admin/settings/guest-price`, {
                      method: 'POST',
                      headers: { 
                        'Authorization': `Bearer ${token}`, 
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ guest_price: rawPrice })
                    });
                    if (!res.ok) throw new Error('Gagal menyimpan harga');
                    const data = await res.json();
                    setGuestPrice(data.guest_price);
                    setIsEditingGuestPrice(false);
                    toast.success('Harga Guest Harian berhasil diperbarui!');
                  } catch (e) {
                    toast.error(e.message);
                  } finally {
                    setIsSavingGuestPrice(false);
                  }
                }}
                disabled={isSavingGuestPrice}
                className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 h-[34px]"
                title="Simpan"
              >
                {isSavingGuestPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Simpan
              </button>
              <button 
                onClick={() => setIsEditingGuestPrice(false)}
                disabled={isSavingGuestPrice}
                className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 h-[34px]"
                title="Batal"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-1.5 bg-foreground/5 border border-border rounded-lg text-sm font-bold text-primary flex items-center h-[34px]">
                Rp {formatRupiahCustom(guestPrice)}
              </div>
              <button 
                onClick={() => {
                  setGuestPriceInput(formatRupiahCustom(guestPrice).replace(',-', ''));
                  setIsEditingGuestPrice(true);
                }}
                className="px-3 py-1.5 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors h-[34px]"
              >
                <Edit className="w-4 h-4" /> Ubah Harga
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Cari nama paket..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-sm text-foreground/50">Memuat data paket...</span>
                    </div>
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <PackageOpen className="w-10 h-10 text-foreground/20" />
                      <span className="text-sm text-foreground/50">
                        {search ? 'Tidak ada paket yang sesuai pencarian.' : 'Belum ada data paket membership.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.idPackage} className={`hover:bg-background/50 transition-colors`}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {pkg.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/80">{pkg.facilities}</td>
                    <td className="px-4 py-3 text-xs text-center">{pkg.duration} Bulan</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-between w-full text-xs font-medium text-primary max-w-[120px] mx-auto">
                        <span>Rp</span>
                        <span>{formatRupiahCustom(pkg.price)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${
                        pkg.is_active 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openModal('edit', pkg)} className="p-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded transition-colors" title="Edit Paket">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openModal(pkg.is_active ? 'deactivate' : 'activate', pkg)} 
                          className={`p-1.5 rounded transition-colors ${
                            pkg.is_active 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                              : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                          }`}
                          title={pkg.is_active ? "Nonaktifkan Paket" : "Aktifkan Paket"}
                        >
                          {pkg.is_active ? <Archive className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      {modalConfig.isOpen && (modalConfig.type === 'add' || modalConfig.type === 'edit') && createPortal(
        <PackageFormModal 
          type={modalConfig.type}
          pkg={modalConfig.data}
          token={token}
          onClose={closeModal}
          onSaved={() => {
            closeModal();
            fetchPackages();
          }}
        />,
        document.body
      )}

      {modalConfig.isOpen && (modalConfig.type === 'deactivate' || modalConfig.type === 'activate') && createPortal(
        <TogglePackageModal
          type={modalConfig.type}
          pkg={modalConfig.data}
          token={token}
          onClose={closeModal}
          onConfirmed={() => {
            closeModal();
            fetchPackages();
          }}
        />,
        document.body
      )}

    </div>
  );
};

// ── Package Form Modal (Add / Edit) ──
const PackageFormModal = ({ type, pkg, token, onClose, onSaved }) => {
  const isEdit = type === 'edit';

  const formatNumberToDots = (value) => {
    if (!value) return '';
    const numericStr = value.toString().replace(/[^0-9]/g, '');
    return numericStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    facilities: pkg?.facilities || '',
    duration: pkg?.duration || '',
    price: pkg?.price ? formatNumberToDots(Math.floor(pkg.price)) : '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama paket wajib diisi.';
    if (!formData.facilities.trim()) errs.facilities = 'Benefit paket wajib diisi.';
    if (!formData.duration) errs.duration = 'Durasi paket wajib diisi.';
    else if (parseInt(formData.duration) <= 0) errs.duration = 'Durasi harus lebih dari 0.';
    
    const rawPrice = formData.price.toString().replace(/\./g, '');
    if (rawPrice === '') errs.price = 'Harga wajib diisi.';
    else if (parseInt(rawPrice) < 0) errs.price = 'Harga tidak boleh negatif.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const url = isEdit ? `${API_URL}/admin/packages/${pkg.idPackage}` : `${API_URL}/admin/packages`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = {
        name: formData.name.trim(),
        facilities: formData.facilities.trim(),
        duration: parseInt(formData.duration),
        price: parseInt(formData.price.toString().replace(/\./g, '')),
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        onSaved();
      } else {
        if (data.errors) {
          const serverErrs = {};
          Object.keys(data.errors).forEach(k => serverErrs[k] = data.errors[k][0]);
          setErrors(serverErrs);
        }
        toast.error(data.message || 'Gagal menyimpan paket.');
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
        <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            {isEdit ? <Edit className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
            {isEdit ? 'Edit Paket Membership' : 'Tambah Paket Baru'}
          </h3>
          <button onClick={onClose} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nama Paket</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                placeholder="Misal: Paket Pelajar 1 Bulan" 
                className={inputClass('name')} 
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Benefit Paket (Pisahkan dengan koma)</label>
              <input 
                type="text" 
                value={formData.facilities}
                onChange={e => setFormData(p => ({...p, facilities: e.target.value}))}
                placeholder="Misal: Akses Gym, Loker" 
                className={inputClass('facilities')} 
              />
              {errors.facilities && <p className="text-[10px] text-red-500 mt-1">{errors.facilities}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Durasi (Bulan)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={formData.duration}
                  onChange={e => setFormData(p => ({...p, duration: e.target.value}))}
                  placeholder="Berapa bulan?" 
                  className={inputClass('duration')} 
                />
                {errors.duration && <p className="text-[10px] text-red-500 mt-1">{errors.duration}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Harga (Rp)</label>
                <input 
                  type="text" 
                  value={formData.price}
                  onChange={e => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(p => ({...p, price: formatNumberToDots(rawValue)}));
                  }}
                  placeholder="Misal: 150000" 
                  className={inputClass('price')} 
                />
                {errors.price && <p className="text-[10px] text-red-500 mt-1">{errors.price}</p>}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)] disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Paket')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Toggle Package Modal ──
const TogglePackageModal = ({ type, pkg, token, onClose, onConfirmed }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDeactivate = type === 'deactivate';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/packages/${pkg.idPackage}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        onConfirmed();
      } else {
        toast.error(data.message || 'Gagal mengubah status paket.');
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
          <h3 className={`font-bold flex items-center gap-2 ${isDeactivate ? 'text-red-500' : 'text-green-500'}`}>
            {isDeactivate ? <Archive className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} 
            Konfirmasi {isDeactivate ? 'Nonaktif' : 'Aktifkan'}
          </h3>
          <button onClick={onClose} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground/80 text-center">
            Apakah Anda yakin ingin {isDeactivate ? 'menonaktifkan' : 'mengaktifkan kembali'} <strong className="text-foreground">{pkg.name}</strong>?
          </p>
          {isDeactivate ? (
            <p className="text-[10px] text-foreground/50 text-center bg-red-500/10 text-red-500 p-2 rounded-lg border border-red-500/20">
              Member baru tidak akan bisa mendaftar paket ini lagi hingga diaktifkan kembali.
            </p>
          ) : (
            <p className="text-[10px] text-foreground/50 text-center bg-green-500/10 text-green-500 p-2 rounded-lg border border-green-500/20">
              Paket ini akan kembali muncul dan dapat dibeli oleh member baru.
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
            className={`px-4 py-2 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)] disabled:opacity-50 ${isDeactivate ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isDeactivate ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Packages;
