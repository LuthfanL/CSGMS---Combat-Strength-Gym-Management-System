import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-background pt-16 sm:pt-24 lg:pt-32 pb-16">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Bangun Kekuatan Anda Bersama <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
              Combat Strength Gym
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-foreground/70 mb-10">
            Sistem manajemen gym terpadu yang memudahkan pendaftaran, check-in dengan QR Code, dan pelacakan perkembangan kebugaran Anda.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(255,42,42,0.4)] hover:shadow-[0_0_30px_rgba(255,42,42,0.6)]"
            >
              Daftar Sekarang
            </Link>
            <a
              href="#features"
              className="inline-flex justify-center items-center px-8 py-3 border border-border text-base font-medium rounded-md text-foreground bg-card hover:bg-background transition-colors"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 relative max-w-5xl mx-auto"
        >
          <div className="aspect-[16/9] bg-card border border-border rounded-xl shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10" />
            <img 
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
              alt="Gym environment" 
              className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
