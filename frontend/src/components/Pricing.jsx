import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/packages/active`);
        if (res.ok) {
          const data = await res.json();
          setPackages(data);
        }
      } catch (err) {
        console.error('Failed to fetch packages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Helper to format currency
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  return (
    <div id="pricing" className="bg-background dark:bg-[#0a0a0a] py-20 relative overflow-hidden transition-colors">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block py-1.5 px-5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 border border-primary/20 tracking-widest uppercase">
            Paket Membership
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground dark:text-white mb-4 leading-tight">
            Pilih Paket Sesuai <span className="text-primary">Target Anda</span>
          </h2>
          <p className="max-w-2xl text-sm md:text-base text-foreground/60 dark:text-white/60 mx-auto font-medium">
            Dapatkan hasil maksimal dengan memilih durasi membership yang tepat untuk Anda.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, index) => {
              const isPopular = index === 1; // Mark the second package as popular for aesthetics
              const features = pkg.facilities ? pkg.facilities.split(',').map(f => f.trim()) : [];
              
              return (
                <motion.div
                  key={pkg.idPackage}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    rotateX: 2,
                    rotateY: -2,
                    boxShadow: isPopular ? "0 25px 50px -12px rgba(225,29,72,0.4)" : "0 25px 50px -12px rgba(0,0,0,0.4)"
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`relative rounded-2xl border ${isPopular ? 'border-primary dark:border-primary/50 bg-primary/5 dark:bg-primary/[0.05] shadow-[0_0_20px_rgba(225,29,72,0.15)]' : 'border-border dark:border-white/10 bg-card dark:bg-white/[0.02]'} p-6 flex flex-col backdrop-blur-sm group z-0 hover:z-10`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-lg">
                        Terpopuler
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-5 text-center relative">
                    <h3 className="text-lg font-bold text-foreground dark:text-white/90 mb-1">{pkg.name}</h3>
                    <div className="flex items-center justify-center text-3xl font-black text-foreground dark:text-white tracking-tight">
                      {formatRupiah(pkg.price)}
                    </div>
                    <p className="text-foreground/50 dark:text-white/40 text-xs mt-1 font-medium">/ {pkg.duration} {pkg.duration > 1 ? 'Bulan' : 'Bulan'}</p>
                  </div>

                  <ul className="space-y-3 mb-6 flex-1">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} aria-hidden="true" />
                          </div>
                        </div>
                        <p className="ml-3 text-sm text-foreground/70 dark:text-white/70 leading-snug">{feature}</p>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    to="/register"
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all text-center ${
                      isPopular 
                        ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20' 
                        : 'bg-background dark:bg-white/5 text-foreground dark:text-white border border-border dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 hover:text-primary'
                    }`}
                  >
                    Pilih Paket
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
