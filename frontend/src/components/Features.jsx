import { QrCode, LayoutDashboard, CreditCard, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Check-in dengan QR Code',
    description: 'Akses gym lebih cepat dan mudah dengan memindai QR Code unik Anda di meja resepsionis.',
    icon: QrCode,
  },
  {
    name: 'Dashboard Personal',
    description: 'Pantau status membership, riwayat kehadiran, dan riwayat pembayaran Anda dalam satu tempat terpadu.',
    icon: LayoutDashboard,
  },
  {
    name: 'Pembayaran Fleksibel',
    description: 'Dukung pembayaran via QRIS statis dan tunai untuk perpanjangan membership yang praktis.',
    icon: CreditCard,
  },
  {
    name: 'Pengingat Otomatis',
    description: 'Terima notifikasi email H-3 sebelum masa aktif membership Anda berakhir, agar tidak terputus.',
    icon: BellRing,
  },
];

const Features = () => {
  return (
    <div id="features" className="py-24 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Fitur Unggulan</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
            Semuanya dalam Satu Genggaman
          </p>
          <p className="mt-4 max-w-2xl text-xl text-foreground/70 mx-auto">
            Sistem kami dirancang khusus untuk memberikan kenyamanan maksimal bagi aktivitas gym Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background border border-border p-6 rounded-xl hover:border-primary/50 hover:shadow-[0_0_15px_rgba(255,42,42,0.15)] transition-all group"
            >
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.name}</h3>
              <p className="text-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
