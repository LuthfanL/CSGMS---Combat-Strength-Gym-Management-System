import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const packages = [
  {
    name: '1 Bulan',
    price: 'Rp 300.000',
    duration: '1 Bulan',
    features: ['Akses Semua Alat', '1x Kelas Gratis', 'Loker Harian', 'Check-in QR Code'],
    popular: false,
  },
  {
    name: '3 Bulan',
    price: 'Rp 800.000',
    duration: '3 Bulan',
    features: ['Akses Semua Alat', '3x Kelas Gratis', 'Loker Harian', 'Check-in QR Code', 'Diskon Merchandise 5%'],
    popular: true,
  },
  {
    name: '6 Bulan',
    price: 'Rp 1.500.000',
    duration: '6 Bulan',
    features: ['Akses Semua Alat', 'Unlimited Kelas Dasar', 'Loker Harian', 'Check-in QR Code', 'Diskon Merchandise 10%'],
    popular: false,
  },
  {
    name: '12 Bulan',
    price: 'Rp 2.800.000',
    duration: '1 Tahun',
    features: ['Akses Semua Alat', 'Unlimited Semua Kelas', 'Loker Pribadi', 'Check-in QR Code', 'Diskon Merchandise 15%', '1x Personal Trainer Session'],
    popular: false,
  },
];

const MemberMembership = () => {
  const navigate = useNavigate();

  const handleSelectPackage = (pkg) => {
    navigate('/member/checkout', { state: { pkg } });
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Beli / Perpanjang Membership</h1>
        <p className="text-foreground/60">Pilih durasi paket yang sesuai dengan target kebugaran Anda.</p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative rounded-2xl border ${pkg.popular ? 'border-primary dark:border-primary/50 bg-primary/5 dark:bg-primary/[0.05]' : 'border-border bg-card'} p-6 flex flex-col backdrop-blur-sm group z-0 hover:z-10 cursor-pointer`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-lg">
                  Terpopuler
                </span>
              </div>
            )}
            
            <div className="mb-5 text-center relative">
              <h3 className="text-lg font-bold text-foreground dark:text-white/90 mb-1">{pkg.name}</h3>
              <div className="flex items-center justify-center text-3xl font-black text-foreground dark:text-white tracking-tight">
                {pkg.price}
              </div>
              <p className="text-foreground/50 text-xs mt-1 font-medium">/ {pkg.duration}</p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {pkg.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
                    </div>
                  </div>
                  <p className="ml-3 text-sm text-foreground/70 leading-snug">{feature}</p>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPackage(pkg)}
              className={`w-full py-2.5 px-4 rounded-xl text-center text-sm font-bold transition-all duration-300 ${
                pkg.popular 
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40' 
                  : 'bg-foreground/5 text-foreground border border-transparent hover:border-border hover:bg-foreground/10'
              }`}
            >
              Pilih Paket
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MemberMembership;
