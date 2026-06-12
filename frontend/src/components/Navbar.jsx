import { Link } from 'react-router-dom';
import { Dumbbell, Moon, Sun, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useGym } from '../context/GymContext';

const Navbar = ({ toggleTheme, isDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { gymSettings } = useGym();

  const renderGymName = (name) => {
    if (!name) return 'CSGMS';
    return name.split(' ').map((word, index) => {
      if (word.toLowerCase() === 'strength') {
        return <span key={index} className="text-primary">{word} </span>;
      }
      return <span key={index} className="text-foreground/90">{word} </span>;
    });
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3">
              {gymSettings?.logo ? (
                <img src={`http://localhost:8000/storage/${gymSettings.logo}`} alt="Logo" className="h-12 w-12 object-contain" />
              ) : (
                <Dumbbell className="h-10 w-10 text-primary" />
              )}
              <span className="font-bold text-xs md:text-sm tracking-widest uppercase truncate max-w-[180px] md:max-w-[350px]">
                {renderGymName(gymSettings?.gym_name)}
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="/#features" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">Fitur</a>
              <a href="/#pricing" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">Paket</a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-card transition-colors">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Masuk</Link>
            <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-[0_0_15px_rgba(255,42,42,0.4)] hover:shadow-[0_0_20px_rgba(255,42,42,0.6)]">
              Daftar Sekarang
            </Link>
          </div>
          <div className="-mr-2 flex md:hidden items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-card transition-colors">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-card focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/#features" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-background">Fitur</a>
            <a href="/#pricing" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-background">Paket</a>
            <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-background">Masuk</Link>
            <Link to="/register" className="block w-full text-center mt-4 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
