import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useGym } from '../context/GymContext';

const motivationData = [
  {
    id: 1,
    title: <>Konsistensi adalah <span className="text-primary">Kunci</span></>,
    description: "Tidak ada hasil instan. Bangun rutinitas yang solid dan lihat bagaimana tubuh Anda bertransformasi hari demi hari. Kami menyediakan fasilitas lengkap untuk mendukung komitmen Anda.",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 2,
    title: <>Lampaui <span className="text-primary">Batas Maksimalmu</span></>,
    description: "Ketika Anda merasa lelah, di situlah latihan sesungguhnya dimulai. Didukung oleh pelatih profesional dan lingkungan yang suportif untuk mendorong Anda melewati rintangan terberat.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop",
  },
  {
    id: 3,
    title: <>Kekuatan <span className="text-primary">Mental & Fisik</span></>,
    description: "Gym bukan sekadar tentang mengangkat beban berat, melainkan melatih mental untuk pantang menyerah. Raih keseimbangan sempurna antara raga yang kuat dan pikiran yang fokus.",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop",
  }
];

const Hero = () => {
  const { gymSettings } = useGym();

  return (
    <div className="relative w-full bg-background overflow-hidden">
      {/* FULL BLEED BACKGROUND IMAGE */}
      <div className="absolute top-0 left-0 w-full h-[90vh] md:h-[800px] z-0">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
          alt="Gym Hero Background" 
          className="object-cover w-full h-full opacity-20 dark:opacity-30"
        />
        {/* Gradient fade to background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 pt-32 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left md:text-center min-h-[70vh] flex flex-col justify-center items-start md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 border border-primary/20 tracking-wide uppercase">
            {gymSettings?.gym_name || 'COMBAT STRENGTH GYM'}
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground mb-6 uppercase leading-[1.1]">
            Bangun Kekuatan <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
              Tanpa Batas
            </span>
          </h1>
          <p className="mt-4 max-w-2xl md:mx-auto text-lg md:text-xl text-foreground/80 mb-10 font-medium">
            {gymSettings?.description || 'Sistem manajemen gym terpadu yang memudahkan pendaftaran, check-in, dan pelacakan perkembangan kebugaran Anda.'}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-start md:justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex justify-center items-center gap-2 px-8 py-4 border border-transparent text-base font-bold rounded-lg text-white bg-primary hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_rgba(225,29,72,0.6)] hover:-translate-y-1"
            >
              Daftar Sekarang <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex justify-center items-center px-8 py-4 border-2 border-border text-base font-bold rounded-lg text-foreground bg-background/50 backdrop-blur hover:bg-card hover:border-foreground/40 transition-all hover:-translate-y-1"
            >
              Jelajahi Fitur
            </a>
          </div>
        </motion.div>
      </div>

      {/* ZIG ZAG MOTIVATION GRID */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col gap-32">
        {motivationData.map((item, index) => {
          const isEven = index % 2 === 1;
          return (
            <div 
              key={item.id} 
              className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-16`}
            >
              {/* Image side */}
              <motion.div 
                initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full md:w-5/12 relative flex justify-center"
              >
                <div 
                  className="relative group overflow-hidden max-w-[240px] lg:max-w-[280px] w-full aspect-square rounded-[2rem] shadow-2xl shadow-primary/5 border border-white/5 transition-transform duration-700 hover:-translate-y-2 hover:shadow-primary/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-700 z-10 mix-blend-overlay" />
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-105 group-hover:scale-100 transition-all duration-700"
                  />
                </div>
                {/* Decorative blob behind image */}
                <div className={`absolute -z-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full top-1/2 -translate-y-1/2 ${isEven ? '-left-10' : '-right-10'}`} />
              </motion.div>

              {/* Text side */}
              <motion.div 
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="w-full md:w-6/12 space-y-4 px-4 md:px-0"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary font-black text-xl mb-1">
                  0{item.id}
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-foreground leading-[1.15] tracking-tight">
                  {item.title}
                </h2>
                <p className="text-base md:text-lg text-foreground/70 leading-relaxed font-medium">
                  {item.description}
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Hero;
