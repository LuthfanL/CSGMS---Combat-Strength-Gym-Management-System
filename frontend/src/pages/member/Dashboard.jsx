import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, Calendar, QrCode, Download, Printer, AlertCircle, Edit2, X, Mail, Phone, MapPin, Hash, Eye, EyeOff, Lock, Camera, Upload, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;
const API_URL = import.meta.env.VITE_API_URL;

const MemberDashboard = () => {
  const { user, token, setUser: setAuthUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);

  const fetchPendingPayment = async () => {
    try {
      const res = await fetch(`${API_URL}/member/payments`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const pending = data.payments.find(p => p.status === 'Menunggu' || p.status === 'pending');
        if (pending) {
          setPendingPayment(pending);
        }
      }
    } catch (error) {
      console.error("Failed to fetch pending payments", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPendingPayment();
  }, [token]);

  const activeMemberships = user?.member?.active_memberships || [];
  const currentActivePackage = activeMemberships.length > 0 ? activeMemberships[0].package : null;
  const isMembershipActive = !!currentActivePackage;

  let displayPackageName = "Belum ada paket";
  if (isMembershipActive) {
    if (activeMemberships.length > 1) {
      displayPackageName = `${currentActivePackage.name} (+${activeMemberships.length - 1} Antrean)`;
    } else {
      displayPackageName = currentActivePackage.name;
    }
  }

  // Derive member profile from auth context
  const member = {
    name: user?.name || '-',
    memberCode: user?.member?.member_code || null,
    email: user?.email || '-',
    phone: user?.phone || '-',
    address: user?.address || '-',
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-',
    photo: user?.member?.photo ? `${STORAGE_URL}/${user.member.photo}` : null,
    status: isMembershipActive ? "ACTIVE" : "INACTIVE",
    package: displayPackageName,
    validUntil: user?.member?.active_membership?.end_date 
      ? new Date(user.member.active_membership.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) 
      : "-"
  };

  // QR Code
  const qrCodeUrl = member.memberCode 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${member.memberCode}&margin=10`
    : null;

  const handleDownloadQR = async () => {
    if (!qrCodeUrl) return;
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-CSGMS-${member.memberCode}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('QR Code berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh QR Code');
    }
  };

  const handlePrintQR = () => {
    if (!qrCodeUrl) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak QR Code Member</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9f9f9; }
            .card { background-color: white; border: 2px solid #ccc; padding: 2.5rem; border-radius: 1rem; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            img { width: 300px; height: 300px; margin: 1rem 0; }
            h2 { margin: 0; color: #111; font-size: 1.5rem; }
            p { font-size: 1.25rem; font-weight: bold; margin: 0; letter-spacing: 2px; color: #333; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>CSGMS Member Check-in</h2>
            <img src="${qrCodeUrl}" onload="window.print();window.close()" />
            <p>${member.memberCode}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Avatar: use uploaded photo, fallback to initials
  const avatarUrl = member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=200`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Member</h1>
        <p className="text-foreground/60">Selamat datang kembali, {member.name}!</p>
      </div>

      {/* Pending Payment Alert */}
      {pendingPayment && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500 text-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full hidden sm:block">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Pembayaran belum diselesaikan!</p>
              <p className="text-orange-100 text-xs">Lunasi tagihan {pendingPayment.id} ({pendingPayment.package})</p>
            </div>
          </div>
          <Link 
            to={`/member/invoice/${pendingPayment.id}`}
            state={{ 
              pkg: { name: pendingPayment.package, duration: pendingPayment.package, price: pendingPayment.amount },
              paymentMethod: pendingPayment.method.toLowerCase()
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-orange-600 font-bold rounded-lg text-sm hover:bg-orange-50 transition-colors text-center whitespace-nowrap"
          >
            Selesaikan Pembayaran
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Profile & Status */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Glowing Status Card - Modern Redesign */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${
              isMembershipActive 
                ? 'bg-gradient-to-br from-emerald-600 via-emerald-800 to-emerald-950 border border-emerald-500/30' 
                : 'bg-gradient-to-br from-red-600 via-red-800 to-red-950 border border-red-500/30'
            }`}
          >
            {/* Background Glow Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="relative flex h-3 w-3">
                      {isMembershipActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${isMembershipActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    </span>
                    <p className="text-sm text-white/80 font-bold tracking-wider uppercase">Status Member</p>
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md mb-4">
                    {member.status}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm font-medium">
                    <button 
                      onClick={() => activeMemberships.length > 0 && setShowPackageModal(true)}
                      className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 text-left hover:bg-black/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white/60 block text-[10px] uppercase">Paket Aktif</span>
                        {activeMemberships.length > 0 && (
                          <Eye className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
                        )}
                      </div>
                      <span className="text-white">{member.package}</span>
                    </button>
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2">
                      <span className="text-white/60 block text-[10px] uppercase mb-0.5">Berlaku Hingga</span>
                      <span className="text-white">{member.validUntil}</span>
                    </div>
                  </div>
                </div>
                
                <Link 
                  to="/member/membership" 
                  className={`relative overflow-hidden group w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-sm transition-all text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                    isMembershipActive 
                      ? 'bg-white text-emerald-800 hover:bg-emerald-50' 
                      : 'bg-white text-red-800 hover:bg-red-50'
                  }`}
                >
                  <span className="relative z-10">{isMembershipActive ? 'Perpanjang Paket' : 'Beli Paket Sekarang'}</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Profile Card - Modern Redesign */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-2xl shadow-xl flex-1 flex flex-col relative overflow-hidden"
          >
            {/* Subtle Background Glow */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
            
            <div className="p-8 flex-1 flex flex-col justify-center relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                  <User className="h-4 w-4" />
                  Profil Personal
                </div>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 text-foreground bg-background hover:bg-primary/10 hover:text-primary border border-border rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm"
                  title="Edit Profil"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Ubah Data</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full">
                {/* Avatar with dynamic ring */}
                <div className="relative group cursor-pointer" onClick={() => setShowEditModal(true)}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary to-orange-500 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500 transform scale-110" />
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-primary to-orange-500">
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-background object-cover flex-shrink-0 z-10"
                    />
                    <div className="absolute bottom-2 right-2 p-2 bg-background border border-border rounded-full shadow-lg text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 w-full flex flex-col gap-4 justify-center">
                  <div className="text-center sm:text-left">
                    <h4 className="text-3xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">{member.name}</h4>
                    {member.memberCode ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-bold shadow-sm">
                        <Hash className="h-4 w-4" />
                        ID: {member.memberCode}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/5 border border-border text-foreground/50 text-sm font-bold">
                        <Hash className="h-4 w-4" />
                        Belum Memiliki ID
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="group flex items-center gap-3 p-3.5 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 hover:border-primary/30 transition-all shadow-sm">
                      <div className="p-2.5 bg-card rounded-lg shadow-sm text-primary border border-border/50 group-hover:scale-110 transition-transform">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider mb-0.5">Email</p>
                        <p className="text-sm font-bold truncate" title={member.email}>{member.email}</p>
                      </div>
                    </div>

                    <div className="group flex items-center gap-3 p-3.5 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 hover:border-primary/30 transition-all shadow-sm">
                      <div className="p-2.5 bg-card rounded-lg shadow-sm text-primary border border-border/50 group-hover:scale-110 transition-transform">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider mb-0.5">Nomor HP</p>
                        <p className="text-sm font-bold">{member.phone}</p>
                      </div>
                    </div>

                    <div className="group flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-border/50 sm:col-span-2 hover:bg-background/80 hover:border-primary/30 transition-all shadow-sm">
                      <div className="p-2.5 bg-card rounded-lg shadow-sm text-primary border border-border/50 mt-0.5 group-hover:scale-110 transition-transform">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider mb-0.5">Alamat Lengkap</p>
                        <p className="text-sm font-medium leading-relaxed">{member.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column: QR Code - Modern Redesign */}
        <div className="h-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center h-full relative overflow-hidden"
          >
            {/* Animated Scanning Line Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 p-0.5 mb-6 shadow-lg shadow-primary/20">
              <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <h3 className="text-xl font-black mb-2">Akses Gym</h3>
            <p className="text-sm text-foreground/60 mb-8 max-w-[250px]">
              Tunjukkan QR Code ini kepada resepsionis untuk Check-in.
            </p>

            {/* QR Code Container */}
            {qrCodeUrl ? (
              <>
                <div className="relative group">
                  <div className="relative bg-white p-4 rounded-xl shadow-sm border border-border mb-6 transform transition-transform group-hover:scale-[1.02]">
                    <img 
                      src={qrCodeUrl} 
                      alt="Member QR Code" 
                      className="w-40 h-40 object-contain"
                    />
                    {/* Scanner line animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan hidden group-hover:block" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}></div>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border mb-8 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-sm font-bold tracking-widest">{member.memberCode}</p>
                </div>
              </>
            ) : (
              <div className="bg-foreground/5 border-2 border-dashed border-border rounded-2xl p-8 mb-8 text-center w-full max-w-[220px]">
                <QrCode className="h-16 w-16 text-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-foreground/50 font-medium">QR Code Belum Tersedia</p>
                <p className="text-xs text-foreground/40 mt-1">Selesaikan pembayaran membership Anda.</p>
              </div>
            )}

            <div className="flex gap-3 w-full mt-auto">
              <button 
                onClick={handleDownloadQR} 
                disabled={!qrCodeUrl} 
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-background border border-border hover:bg-foreground/5 hover:border-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all shadow-sm"
              >
                <Download className="h-4 w-4" />
                Simpan
              </button>
              <button 
                onClick={handlePrintQR} 
                disabled={!qrCodeUrl} 
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
              >
                <Printer className="h-4 w-4" />
                Cetak
              </button>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showEditModal && (
            <EditProfileModal 
              member={member}
              avatarUrl={avatarUrl}
              token={token}
              onClose={() => setShowEditModal(false)}
              onSaved={(updatedUser) => {
                setAuthUser(updatedUser);
                setShowEditModal(false);
              }}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Active Packages Detail Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showPackageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPackageModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-background/50 sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold">Detail Paket Aktif</h3>
                  <p className="text-sm text-foreground/60">Rincian masa aktif membership Anda</p>
                </div>
                <button 
                  onClick={() => setShowPackageModal(false)}
                  className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4">
                {activeMemberships.map((am, idx) => {
                  const startDate = new Date(am.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                  const endDate = new Date(am.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                  const isCurrentlyRunning = new Date(am.start_date) <= new Date() && new Date(am.end_date) >= new Date();
                  
                  return (
                    <div key={idx} className={`p-4 rounded-xl border ${isCurrentlyRunning ? 'border-primary/50 bg-primary/5' : 'border-border bg-background'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-foreground">{am.package.name}</h4>
                        {isCurrentlyRunning ? (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">Sedang Berjalan</span>
                        ) : (
                          <span className="px-2 py-1 bg-foreground/10 text-foreground/70 text-[10px] font-bold rounded-full uppercase tracking-wider">Mengantre</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-xs text-foreground/60 mb-0.5">Mulai Aktif</p>
                          <p className="font-medium">{startDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/60 mb-0.5">Berakhir Pada</p>
                          <p className="font-medium">{endDate}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 border-t border-border bg-background/50 flex justify-end">
                <button 
                  onClick={() => setShowPackageModal(false)}
                  className="px-6 py-2.5 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all text-sm"
                >
                  Tutup
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

// ── Edit Profile Modal Component ──
const EditProfileModal = ({ member, avatarUrl, token, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: member.name,
    phone: member.phone,
    address: member.address,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [wantsPasswordChange, setWantsPasswordChange] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleNameInput = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
    setFormData(p => ({ ...p, name: e.target.value }));
  };

  const handlePhoneInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(p => ({ ...p, phone: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Format foto harus JPEG, PNG, atau JPG.');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};

    // Name
    if (!formData.name.trim()) errs.name = 'Nama lengkap wajib diisi.';
    else if (formData.name.trim().length < 3) errs.name = 'Nama minimal 3 karakter.';
    else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name)) errs.name = 'Nama hanya boleh berisi huruf, spasi, titik, dan tanda petik.';

    // Phone
    if (!formData.phone.trim()) errs.phone = 'Nomor HP wajib diisi.';
    else if (!/^[0-9]{10,15}$/.test(formData.phone)) errs.phone = 'Nomor HP harus berupa angka dengan panjang 10-15 digit.';

    // Address
    if (!formData.address.trim()) errs.address = 'Alamat wajib diisi.';
    else if (formData.address.trim().length < 10) errs.address = 'Alamat minimal 10 karakter.';

    // Password (optional)
    if (wantsPasswordChange) {
      if (!currentPassword) errs.currentPassword = 'Password saat ini wajib diisi.';
      if (!newPassword) {
        errs.newPassword = 'Password baru wajib diisi.';
      } else {
        if (newPassword.length < 8) errs.newPassword = 'Password minimal 8 karakter.';
        else if (!/[A-Z]/.test(newPassword)) errs.newPassword = 'Harus mengandung minimal 1 huruf besar.';
        else if (!/[a-z]/.test(newPassword)) errs.newPassword = 'Harus mengandung minimal 1 huruf kecil.';
        else if (!/[0-9]/.test(newPassword)) errs.newPassword = 'Harus mengandung minimal 1 angka.';
        else if (!/[@$!%*?&#]/.test(newPassword)) errs.newPassword = 'Harus mengandung minimal 1 karakter spesial (@$!%*?&#).';
      }
      if (!confirmPassword) errs.confirmPassword = 'Konfirmasi password wajib diisi.';
      else if (confirmPassword !== newPassword) errs.confirmPassword = 'Password tidak cocok.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[a-z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[@$!%*?&#]/.test(pw)) s++;
    const levels = [
      { label: '', color: '' },
      { label: 'Sangat Lemah', color: 'bg-red-500' },
      { label: 'Lemah', color: 'bg-orange-500' },
      { label: 'Cukup', color: 'bg-yellow-500' },
      { label: 'Kuat', color: 'bg-blue-500' },
      { label: 'Sangat Kuat', color: 'bg-green-500' },
    ];
    return { score: s, ...levels[s] };
  };

  const pwStrength = getPasswordStrength(newPassword);

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const body = new FormData();
      body.append('name', formData.name.trim());
      body.append('phone', formData.phone);
      body.append('address', formData.address.trim());
      if (photoFile) body.append('photo', photoFile);
      if (wantsPasswordChange) {
        body.append('current_password', currentPassword);
        body.append('new_password', newPassword);
      }

      const res = await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Profil berhasil diperbarui!');
        onSaved(data.user);
      } else {
        // Handle server-side validation errors
        if (data.errors) {
          const serverErrors = {};
          if (data.errors.name) serverErrors.name = data.errors.name[0];
          if (data.errors.phone) serverErrors.phone = data.errors.phone[0];
          if (data.errors.address) serverErrors.address = data.errors.address[0];
          if (data.errors.current_password) serverErrors.currentPassword = data.errors.current_password[0];
          if (data.errors.new_password) serverErrors.newPassword = data.errors.new_password[0];
          if (data.errors.photo) serverErrors.photo = data.errors.photo[0];
          setErrors(serverErrors);
        }
        toast.error(data.message || 'Gagal memperbarui profil.');
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 bg-background border ${errors[field] ? 'border-red-500' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80"
      />
    
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-card w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-background/50 flex-shrink-0">
          <h3 className="text-lg font-bold">Edit Profil</h3>
          <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Photo Upload */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative group cursor-pointer">
              <img 
                src={photoPreview || avatarUrl} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border-4 border-background shadow-md object-cover group-hover:opacity-70 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white drop-shadow-md" />
              </div>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/jpg" 
                className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                onChange={handlePhotoChange}
              />
            </div>
            <p className="text-xs text-foreground/50 mt-2">Klik untuk ubah foto</p>
            {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nama Lengkap</label>
            <input 
              type="text" 
              value={formData.name}
              onInput={handleNameInput}
              className={inputClass('name')}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email (Hanya Baca)</label>
            <input 
              type="email" 
              defaultValue={member.email}
              disabled
              className="w-full px-4 py-2 bg-foreground/5 border border-border rounded-xl focus:outline-none text-foreground/50 cursor-not-allowed text-sm"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nomor HP</label>
            <input 
              type="tel" 
              value={formData.phone}
              onInput={handlePhoneInput}
              maxLength={15}
              className={inputClass('phone')}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Alamat Lengkap</label>
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
              rows="2"
              className={inputClass('address') + ' resize-none'}
            />
            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
          </div>

          {/* Password Change Toggle */}
          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={wantsPasswordChange}
                onChange={(e) => {
                  setWantsPasswordChange(e.target.checked);
                  if (!e.target.checked) {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setErrors(p => {
                      const { currentPassword, newPassword, confirmPassword, ...rest } = p;
                      return rest;
                    });
                  }
                }}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
              />
              <span className="text-sm font-medium">Ubah Password</span>
            </label>
          </div>

          {wantsPasswordChange && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password Saat Ini</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-foreground/40" />
                  </div>
                  <input 
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className={`${inputClass('currentPassword')} pl-9 pr-10`}
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground/70">
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword}</p>}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-foreground/40" />
                  </div>
                  <input 
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 karakter, huruf besar, kecil, angka, spesial"
                    className={`${inputClass('newPassword')} pl-9 pr-10`}
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground/70">
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
                {newPassword && (
                  <div className="mt-1.5">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? pwStrength.color : 'bg-foreground/10'}`} />
                      ))}
                    </div>
                    <p className={`text-[10px] ${pwStrength.score <= 2 ? 'text-red-400' : pwStrength.score <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                      Kekuatan: {pwStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Konfirmasi Password Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-foreground/40" />
                  </div>
                  <input 
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className={`${inputClass('confirmPassword')} pl-9 pr-10`}
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground/70">
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-background/50 flex gap-3 flex-shrink-0">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 border border-border font-bold rounded-xl hover:bg-foreground/5 transition-colors text-sm disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : 'Simpan'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MemberDashboard;
