import { Dumbbell, MapPin, Mail, Phone } from 'lucide-react';
import { useGym } from '../context/GymContext';

const Footer = () => {
  const { gymSettings, operatingHours } = useGym();

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  return (
    <footer className="bg-card border-t border-border pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {gymSettings?.logo ? (
                <img src={`${import.meta.env.VITE_STORAGE_URL}/${gymSettings.logo}`} alt="Logo" className="h-8 w-8 object-contain filter grayscale opacity-80" />
              ) : (
                <Dumbbell className="h-8 w-8 text-primary" />
              )}
              <span className="font-bold text-xl tracking-wider uppercase">
                {gymSettings?.gym_name || 'CSGMS'}
              </span>
            </div>
            <p className="text-foreground/70 mb-6 max-w-sm">
              {gymSettings?.description || 'Combat Strength Gym Management System. Tingkatkan kebugaran Anda dengan fasilitas terbaik dan program latihan terstruktur.'}
            </p>
            <div className="flex gap-4">
              {gymSettings?.instagram && (
                <a href={`https://instagram.com/${gymSettings.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              )}
              {gymSettings?.tiktok && (
                <a href={`https://tiktok.com/${gymSettings.tiktok}`} target="_blank" rel="noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-foreground/70">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">{gymSettings?.address || 'Jl. Kebugaran No. 1, Jakarta'}</span>
              </li>
              <li className="flex items-center gap-3 text-foreground/70">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">{gymSettings?.phone || '+62 812 3456 7890'}</span>
              </li>
              <li className="flex items-center gap-3 text-foreground/70">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">{gymSettings?.email || 'info@csgms.id'}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Jam Operasional</h3>
            <ul className="space-y-2 text-foreground/70 text-sm">
              {operatingHours && operatingHours.length > 0 ? (
                operatingHours.map((hour, idx) => {
                  const indonesianDays = {
                    'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu', 
                    'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu', 'Sunday': 'Minggu'
                  };
                  return (
                    <li key={idx} className={`flex justify-between ${hour.is_closed ? 'text-primary' : ''}`}>
                      <span className="capitalize">{indonesianDays[hour.day] || hour.day}</span>
                      <span>{hour.is_closed ? 'Tutup' : `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`}</span>
                    </li>
                  );
                })
              ) : (
                <>
                  <li className="flex justify-between">
                    <span>Senin - Jumat</span>
                    <span>06:00 - 22:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sabtu</span>
                    <span>06:00 - 20:00</span>
                  </li>
                  <li className="flex justify-between text-primary">
                    <span>Minggu</span>
                    <span>Tutup</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center text-foreground/50 text-sm">
          &copy; {new Date().getFullYear()} {gymSettings?.gym_name || 'Combat Strength Gym'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
