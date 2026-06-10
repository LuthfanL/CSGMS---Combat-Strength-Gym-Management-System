import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';

// Owner Pages
import DashboardLayout from './layouts/DashboardLayout';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerReports from './pages/owner/Reports';
import OwnerDataView from './pages/owner/DataView';
import OwnerSettings from './pages/owner/Settings';
import OwnerAdmins from './pages/owner/Admins';
import OwnerAuditLogs from './pages/owner/AuditLogs';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Layout untuk halaman publik
  const PublicLayout = () => (
    <>
      <Navbar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </>
  );

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-300 bg-background text-foreground">
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Owner Dashboard Routes */}
          <Route path="/owner" element={<DashboardLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="reports" element={<OwnerReports />} />
            <Route path="data" element={<OwnerDataView />} />
            <Route path="settings" element={<OwnerSettings />} />
            <Route path="admins" element={<OwnerAdmins />} />
            <Route path="audit-logs" element={<OwnerAuditLogs />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
