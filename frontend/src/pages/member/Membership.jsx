import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000/api';

const MemberMembership = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/packages/active`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });

        if (!res.ok) throw new Error('Gagal memuat paket');

        const data = await res.json();
        
        const formattedPackages = data.map(pkg => ({
          ...pkg,
          formattedPrice: `Rp ${new Intl.NumberFormat('id-ID').format(pkg.price)}`,
          formattedDuration: `${pkg.duration} Bulan`,
          features: pkg.facilities ? pkg.facilities.split(',').map(f => f.trim()) : [],
          popular: pkg.duration === 3, // Dummy logic to highlight 3 months package as popular
        }));

        setPackages(formattedPackages);
      } catch {
        toast.error('Gagal memuat paket membership.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [token]);

  const handleSelectPackage = (pkg) => {
    navigate('/member/checkout', { state: { pkg } });
  };

  return (
    <div className="space-y-6 relative pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Beli / Perpanjang Membership</h1>
        <p className="text-foreground/60">Pilih durasi paket yang sesuai dengan target kebugaran Anda.</p>
      </div>

      {/* Packages Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-foreground/50">Memuat daftar paket...</span>
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <PackageOpen className="w-12 h-12 text-foreground/20" />
          <span className="text-foreground/50">Belum ada paket membership yang aktif.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.idPackage}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative rounded-2xl border ${pkg.popular ? 'border-primary dark:border-primary/50 bg-primary/5 dark:bg-primary/[0.05]' : 'border-border bg-card'} p-6 flex flex-col backdrop-blur-sm group z-0 hover:z-10 cursor-pointer shadow-sm`}
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
                  {pkg.formattedPrice}
                </div>
                <p className="text-foreground/50 text-xs mt-1 font-medium">/ {pkg.formattedDuration}</p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
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
      )}
    </div>
  );
};

export default MemberMembership;
