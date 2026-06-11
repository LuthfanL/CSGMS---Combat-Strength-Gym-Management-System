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
import OwnerDataView from './pages/owner/DataView';
import OwnerSettings from './pages/owner/Settings';
import OwnerAdmins from './pages/owner/Admins';
import OwnerAuditLogs from './pages/owner/AuditLogs';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCheckIn from './pages/admin/CheckIn';
import AdminGuest from './pages/admin/Guest';
import AdminMembers from './pages/admin/Members';
import AdminPackages from './pages/admin/Packages';
import AdminPayments from './pages/admin/Payments';

// Member Pages
import MemberLayout from './layouts/MemberLayout';
import MemberDashboard from './pages/member/Dashboard';
import MemberMembership from './pages/member/Membership';
import MemberCheckout from './pages/member/Checkout';
import PaymentInvoice from './pages/member/Invoice';
import MemberPayments from './pages/member/Payments';
import MemberAttendance from './pages/member/Attendance';

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
            <Route path="data" element={<OwnerDataView />} />
            <Route path="settings" element={<OwnerSettings />} />
            <Route path="admins" element={<OwnerAdmins />} />
            <Route path="audit-logs" element={<OwnerAuditLogs />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="checkin" element={<AdminCheckIn />} />
            <Route path="guest" element={<AdminGuest />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

          {/* Member Dashboard Routes */}
          <Route path="/member" element={<MemberLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}>
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="membership" element={<MemberMembership />} />
            <Route path="checkout" element={<MemberCheckout />} />
            <Route path="invoice/:id" element={<PaymentInvoice />} />
            <Route path="payments" element={<MemberPayments />} />
            <Route path="attendance" element={<MemberAttendance />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
