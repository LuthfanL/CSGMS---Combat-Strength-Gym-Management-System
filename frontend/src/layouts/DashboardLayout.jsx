import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Database, 
  Settings, 
  Users, 
  History, 
  LogOut, 
  Menu, 
  X,
  Dumbbell,
  Sun,
  Moon
} from 'lucide-react';

const DashboardLayout = ({ toggleTheme, isDarkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { name: 'Laporan', path: '/owner/reports', icon: FileText },
    { name: 'Data', path: '/owner/data', icon: Database },
    { name: 'Pengaturan Gym', path: '/owner/settings', icon: Settings },
    { name: 'Akun Admin', path: '/owner/admins', icon: Users },
    { name: 'Audit Log', path: '/owner/audit-logs', icon: History },
  ];

  const handleLogout = () => {
    alert('Logout disimulasikan. Mengalihkan ke halaman utama.');
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
            <div className="fixed inset-0 top-16 bg-black/50 z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
            <div className="bg-card border-b border-border shadow-xl flex flex-col absolute top-16 left-0 w-full max-h-[calc(100dvh-64px)] overflow-y-auto z-50">
              <div className="px-4 py-3 border-b border-border bg-background/30">
                <p className="text-xs text-foreground/60">Login sebagai:</p>
                <p className="font-medium text-sm text-primary">Owner</p>
              </div>
              <nav className="flex flex-col py-2 px-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
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
                    onClick={handleLogout}
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
          <p className="font-semibold text-lg text-primary">Owner</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
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
            onClick={handleLogout}
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

    </div>
  );
};

export default DashboardLayout;
