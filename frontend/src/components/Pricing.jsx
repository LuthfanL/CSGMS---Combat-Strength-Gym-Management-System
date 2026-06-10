import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

const Pricing = () => {
  return (
    <div id="pricing" className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Paket Membership</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
            Pilih Paket Sesuai Target Anda
          </p>
          <p className="mt-4 max-w-2xl text-xl text-foreground/70 mx-auto">
            Dapatkan hasil maksimal dengan memilih durasi membership yang tepat untuk Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl shadow-xl border ${pkg.popular ? 'border-primary shadow-[0_0_30px_rgba(255,42,42,0.15)]' : 'border-border'} p-8 flex flex-col hover:-translate-y-2 transition-transform duration-300`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Terpopuler
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{pkg.name}</h3>
                <div className="flex items-baseline text-4xl font-extrabold text-foreground">
                  {pkg.price}
                </div>
                <p className="text-foreground/50 mt-1">/ {pkg.duration}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <p className="ml-3 text-base text-foreground/70">{feature}</p>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`w-full py-3 px-4 rounded-md shadow text-center font-medium transition-colors ${
                  pkg.popular 
                    ? 'bg-primary text-white hover:bg-primary-hover shadow-[0_0_15px_rgba(255,42,42,0.3)]' 
                    : 'bg-background text-foreground border border-border hover:border-primary hover:text-primary'
                }`}
              >
                Pilih Paket
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
