import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  CreditCard,
  History,
  LogOut, 
  Menu, 
  X,
  Dumbbell,
  Sun,
  Moon
} from 'lucide-react';

const MemberLayout = ({ toggleTheme, isDarkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: 'Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
    { name: 'Beli / Perpanjang', path: '/member/membership', icon: Package },
    { name: 'Riwayat Pembayaran', path: '/member/payments', icon: CreditCard },
    { name: 'Riwayat Kehadiran', path: '/member/attendance', icon: History },
  ];

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/');
  };

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-dashboard flex flex-col md:flex-row text-foreground transition-colors duration-300">
      
      {/* Mobile Header & Dropdown */}
      <div className="md:hidden flex flex-col sticky top-0 z-50 w-full">
        {/* Mobile Header Bar */}
        <div className="bg-card border-b border-border h-16 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-wider">CSGMS</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-background transition-colors">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-background focus:outline-none text-foreground">
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isSidebarOpen && (
          <>
            <div className="fixed inset-0 top-16 bg-black/40 backdrop-blur-md z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
            <div className="bg-card border-b border-border shadow-xl flex flex-col absolute top-16 left-0 w-full max-h-[calc(100dvh-64px)] overflow-y-auto z-50">
              <div className="px-4 py-3 border-b border-border bg-background/30">
                <p className="text-xs text-foreground/60">Login sebagai:</p>
                <p className="font-medium text-sm text-primary">Member</p>
              </div>
              <nav className="flex flex-col py-2 px-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname.includes(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-foreground/70 hover:bg-background hover:text-foreground'
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-foreground/50'}`} />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="border-t border-border mt-2 pt-2 pb-1">
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Sidebar (Desktop Only) */}
      <div className="hidden md:flex sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border flex-col">
        {/* Sidebar Header (Desktop) */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border shadow-sm">
          <Dumbbell className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-wider">CSGMS</span>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-border bg-background/30">
          <p className="text-sm text-foreground/60">Login sebagai:</p>
          <p className="font-semibold text-lg text-primary">Member</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground/70 hover:bg-background hover:text-foreground'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-foreground/50'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-foreground/70">Tema</span>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-background transition-colors">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
          
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* Logout Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLogoutModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border p-6 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                  <LogOut className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Konfirmasi Logout</h3>
                <p className="text-foreground/70 mb-8 text-sm leading-relaxed">
                  Apakah Anda yakin ingin keluar dari aplikasi? Anda harus login kembali untuk masuk.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-foreground hover:bg-background transition-colors font-bold text-sm"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmLogout}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-bold text-sm shadow-lg shadow-red-500/20"
                  >
                    Ya, Logout
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default MemberLayout;
