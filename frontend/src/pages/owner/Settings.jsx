import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGym } from '../../context/GymContext';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const Settings = () => {
  const { token } = useAuth();
  const { refreshSettings } = useGym();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      gym_name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      instagram: '',
      tiktok: '',
      operating_hours: []
    }
  });

  useEffect(() => {
    document.title = "Pengaturan Gym - CSGMS";
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        
        // Prepare initial operating hours
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let hours = data.operating_hours || [];
        if (hours.length === 0) {
          hours = days.map(d => ({
            day: d, open_time: '06:00', close_time: '22:00', is_closed: false
          }));
        }

        reset({
          gym_name: data.settings?.gym_name || '',
          description: data.settings?.description || '',
          address: data.settings?.address || '',
          phone: data.settings?.phone || '',
          email: data.settings?.email || '',
          instagram: data.settings?.instagram || '',
          tiktok: data.settings?.tiktok || '',
          operating_hours: hours
        });

        if (data.settings?.logo) {
          setLogoPreview(`${import.meta.env.VITE_STORAGE_URL}/${data.settings.logo}`);
        }
      }
    } catch (err) {
      toast.error('Gagal mengambil pengaturan gym.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('logoFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('gym_name', data.gym_name);
      formData.append('description', data.description);
      formData.append('address', data.address);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      if (data.instagram) formData.append('instagram', data.instagram);
      if (data.tiktok) formData.append('tiktok', data.tiktok);
      
      formData.append('operating_hours', JSON.stringify(data.operating_hours));

      if (data.logoFile) {
        formData.append('logo', data.logoFile);
      }

      const res = await fetch(`${API_URL}/owner/settings`, {
        method: 'POST', // using POST instead of PUT because of FormData
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Gagal menyimpan pengaturan');
      
      toast.success('Pengaturan gym berhasil disimpan!');
      refreshSettings(); // Refresh global gym context
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  const operatingHours = watch('operating_hours');
  const indonesianDays = {
    'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu', 
    'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu', 'Sunday': 'Minggu'
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pengaturan Gym</h1>
        <p className="text-foreground/70 text-xs">Ubah profil gym, kontak, dan jam operasional.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-2">Informasi Utama</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Nama Gym</label>
                  <input
                    type="text"
                    required
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('gym_name')}
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-4">
                  <div className="w-16 h-16 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-foreground/30" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Logo Gym</label>
                    <input type="file" onChange={handleLogoChange} className="text-[10px] text-foreground/70" accept="image/jpeg,image/png,image/jpg" />
                    <p className="text-[10px] text-foreground/50 mt-1">Format: JPG, PNG max 2MB</p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={4}
                    required
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('description')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    required
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('address')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Nomor Telepon/WA</label>
                  <input
                    type="text"
                    required
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('phone')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Email Publik</label>
                  <input
                    type="email"
                    required
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('email')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Instagram</label>
                  <input
                    type="text"
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('instagram')}
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">TikTok</label>
                  <input
                    type="text"
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('tiktok')}
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-2 mb-3">Jam Operasional</h2>
              
              <div className="space-y-2">
                {operatingHours?.map((item, index) => (
                  <div key={item.day} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 rounded hover:bg-background/50 ${item.is_closed ? 'opacity-70' : ''}`}>
                    <div className="flex items-center gap-2 w-20">
                      <input 
                        type="checkbox" 
                        id={`closed-${index}`}
                        className="rounded border-border text-primary focus:ring-primary bg-background h-3 w-3"
                        {...register(`operating_hours.${index}.is_closed`)}
                      />
                      <label htmlFor={`closed-${index}`} className="text-[10px] font-medium text-foreground">
                        {indonesianDays[item.day] || item.day}
                      </label>
                      <input type="hidden" value={item.day} {...register(`operating_hours.${index}.day`)} />
                    </div>
                    
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="time"
                        className="bg-background block w-full px-1.5 py-1 border border-border rounded focus:ring-primary focus:border-primary text-[10px] text-foreground disabled:opacity-50 dark:[color-scheme:dark]"
                        disabled={item.is_closed}
                        {...register(`operating_hours.${index}.open_time`)}
                      />
                      <span className="text-foreground/50 text-[10px]">-</span>
                      <input
                        type="time"
                        className="bg-background block w-full px-1.5 py-1 border border-border rounded focus:ring-primary focus:border-primary text-[10px] text-foreground disabled:opacity-50 dark:[color-scheme:dark]"
                        disabled={item.is_closed}
                        {...register(`operating_hours.${index}.close_time`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-foreground/50 mt-3">Centang kotak untuk menandakan libur/tutup pada hari tersebut.</p>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={isSaving}
            className="w-32 justify-center px-4 py-1.5 border border-border text-foreground text-xs rounded-lg font-medium hover:bg-border/50 transition-colors flex items-center gap-2"
          >
            Batal / Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-32 justify-center px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs rounded-lg font-medium flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)] disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
