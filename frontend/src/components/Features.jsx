import { QrCode, LayoutDashboard, CreditCard, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Check-in Cepat via QR Code',
    description: 'Tinggalkan kartu fisik. Akses fasilitas gym secara instan hanya dengan memindai kode QR dinamis langsung dari layar ponsel Anda.',
    icon: QrCode,
    color: 'from-blue-500/20 to-transparent',
    iconColor: 'text-blue-500'
  },
  {
    name: 'Dashboard Personal Terpadu',
    description: 'Satu pusat kendali untuk memantau status keanggotaan, grafik riwayat kehadiran, dan rekap pembayaran dengan visualisasi data yang menawan.',
    icon: LayoutDashboard,
    color: 'from-orange-500/20 to-transparent',
    iconColor: 'text-orange-500'
  },
  {
    name: 'Pembayaran Fleksibel & Pintar',
    description: 'Dukung perpanjangan keanggotaan tanpa hambatan melalui QRIS otomatis maupun tunai. Semua transaksi tercatat rapi secara real-time.',
    icon: CreditCard,
    color: 'from-emerald-500/20 to-transparent',
    iconColor: 'text-emerald-500'
  },
  {
    name: 'Pengingat Otomatis Cerdas',
    description: 'Tidak ada lagi keanggotaan yang kedaluwarsa tanpa sadar. Sistem akan mengirimkan notifikasi elegan H-3 sebelum masa aktif Anda berakhir.',
    icon: BellRing,
    color: 'from-rose-500/20 to-transparent',
    iconColor: 'text-rose-500'
  },
];

const Features = () => {
  return (
    <div id="features" className="relative py-24 bg-zinc-50 dark:bg-[#121212] overflow-hidden border-y border-border dark:border-white/5 transition-colors">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block py-1.5 px-5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 border border-primary/20 tracking-widest"
          >
            FITUR UNGGULAN
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black tracking-tight text-foreground dark:text-white mb-4 leading-tight"
          >
            Semuanya dalam <span className="text-primary">Satu Genggaman</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-foreground/60 dark:text-white/60 font-medium"
          >
            Infrastruktur digital canggih yang dirancang secara spesifik untuk membebaskan Anda dari kerumitan administrasi gym.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
              className="group relative bg-card dark:bg-white/[0.02] border border-border dark:border-white/5 rounded-2xl p-6 overflow-hidden hover:bg-foreground/[0.02] dark:hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-full shadow-sm hover:shadow-md dark:shadow-none"
            >
              {/* Card internal gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-background dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center ${feature.iconColor} shadow-sm dark:shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground dark:text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-foreground/60 dark:group-hover:from-white dark:group-hover:to-white/60 transition-all duration-300">
                  {feature.name}
                </h3>
                <p className="text-foreground/70 dark:text-white/60 leading-relaxed text-sm flex-grow">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
