import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Save, Image as ImageIcon } from 'lucide-react';

const Settings = () => {
  useEffect(() => {
    document.title = "Pengaturan Gym - CSGMS";
  }, []);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      gym_name: 'Combat Strength Gym',
      description: 'Pusat kebugaran terbaik dengan fasilitas lengkap dan pelatih profesional.',
      address: 'Jl. Merdeka No. 123, Kota Bandung, Jawa Barat',
      phone: '081234567890',
      email: 'hello@combatstrength.com',
      instagram: '@combatstrength',
      tiktok: '@combatstrength_gym',
      operating_hours: [
        { day: 'Senin', open_time: '06:00', close_time: '22:00', is_closed: false },
        { day: 'Selasa', open_time: '06:00', close_time: '22:00', is_closed: false },
        { day: 'Rabu', open_time: '06:00', close_time: '22:00', is_closed: false },
        { day: 'Kamis', open_time: '06:00', close_time: '22:00', is_closed: false },
        { day: 'Jumat', open_time: '06:00', close_time: '22:00', is_closed: false },
        { day: 'Sabtu', open_time: '07:00', close_time: '20:00', is_closed: false },
        { day: 'Minggu', open_time: '', close_time: '', is_closed: true },
      ]
    }
  });

  const onSubmit = (data) => {
    console.log(data);
    alert('Pengaturan gym berhasil disimpan (Simulasi)');
  };

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
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('gym_name')}
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-4">
                  <div className="w-16 h-16 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-foreground/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Logo Gym</label>
                    <input type="file" className="text-[10px] text-foreground/70" accept="image/*" />
                    <p className="text-[10px] text-foreground/50 mt-1">Format: JPG, PNG max 2MB</p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('description')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('address')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Nomor Telepon/WA</label>
                  <input
                    type="text"
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('phone')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Email Publik</label>
                  <input
                    type="email"
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
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">TikTok</label>
                  <input
                    type="text"
                    className="bg-background block w-full px-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary text-xs text-foreground"
                    {...register('tiktok')}
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
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, index) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 rounded hover:bg-background/50">
                    <div className="flex items-center gap-2 w-20">
                      <input 
                        type="checkbox" 
                        id={`closed-${index}`}
                        className="rounded border-border text-primary focus:ring-primary bg-background h-3 w-3"
                        {...register(`operating_hours.${index}.is_closed`)}
                      />
                      <label htmlFor={`closed-${index}`} className="text-[10px] font-medium text-foreground">{day}</label>
                      <input type="hidden" value={day} {...register(`operating_hours.${index}.day`)} />
                    </div>
                    
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="time"
                        className="bg-background block w-full px-1.5 py-1 border border-border rounded focus:ring-primary focus:border-primary text-[10px] text-foreground disabled:opacity-50"
                        {...register(`operating_hours.${index}.open_time`)}
                      />
                      <span className="text-foreground/50 text-[10px]">-</span>
                      <input
                        type="time"
                        className="bg-background block w-full px-1.5 py-1 border border-border rounded focus:ring-primary focus:border-primary text-[10px] text-foreground disabled:opacity-50"
                        {...register(`operating_hours.${index}.close_time`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-foreground/50 mt-3">Centang kotak hari untuk menandakan libur.</p>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            className="px-4 py-1.5 border border-border text-foreground text-xs rounded-lg font-medium hover:bg-border/50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs rounded-lg font-medium flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)]"
          >
            <Save className="w-3 h-3" />
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
