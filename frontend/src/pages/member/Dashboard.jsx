import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CreditCard, Calendar, QrCode, Download, Printer, AlertCircle, Edit2, X, Mail, Phone, MapPin, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock Data
  const member = {
    name: "Ahmad Faisal",
    memberCode: "CSGMS-001",
    email: "ahmad.faisal@example.com",
    phone: "081234567890",
    address: "Jl. Sudirman No. 123, Jakarta Selatan",
    joinDate: "01 Januari 2026",
    status: "Active", // Active, Expired, None
    package: "6 Bulan",
    validUntil: "01 Juli 2026"
  };

  // Mock pending payment data (set to null to hide)
  const pendingPayment = {
    id: "INV-20260611-045",
    package: "3 Bulan",
    price: "Rp 800.000",
    method: "qris"
  };

  // QR Code Image (realistic placeholder)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${member.memberCode}&margin=10`;

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
              pkg: { name: pendingPayment.package, duration: pendingPayment.package, price: pendingPayment.price },
              paymentMethod: pendingPayment.method
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
          
          {/* Status Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm text-foreground/60 font-medium mb-1">Status Membership</p>
              <div className="flex items-center gap-3">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
                <h2 className="text-2xl font-bold text-emerald-500 uppercase tracking-wider">{member.status}</h2>
              </div>
              <p className="text-sm font-medium mt-2">
                Paket: <span className="text-primary">{member.package}</span>
              </p>
              <p className="text-sm text-foreground/60">
                Berlaku hingga: {member.validUntil}
              </p>
            </div>
            
            <Link 
              to="/member/membership" 
              className="w-full md:w-auto px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 rounded-lg text-sm font-bold transition-colors text-center"
            >
              Perpanjang Paket
            </Link>
          </motion.div>

          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col relative overflow-hidden"
          >
            {/* Subtle Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2" />
            
            <div className="p-5 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-5">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profil Member
                </h3>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="px-3 py-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                  title="Edit Profil"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
                {/* Avatar with glowing ring */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md transform scale-110" />
                  <img 
                    src="https://ui-avatars.com/api/?name=Ahmad+Faisal&background=random&size=200" 
                    alt="Profile" 
                    className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-background shadow-xl object-cover flex-shrink-0 z-10"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 w-full flex flex-col gap-3">
                  <div className="text-center sm:text-left">
                    <h4 className="text-xl sm:text-2xl font-bold tracking-tight">{member.name}</h4>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold mt-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      {member.memberCode}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-border/50 transition-colors hover:bg-foreground/[0.04]">
                      <div className="p-2 bg-background rounded-lg shadow-sm text-foreground/60 border border-border/50">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Email</p>
                        <p className="text-sm font-medium truncate" title={member.email}>{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-border/50 transition-colors hover:bg-foreground/[0.04]">
                      <div className="p-2 bg-background rounded-lg shadow-sm text-foreground/60 border border-border/50">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Nomor HP</p>
                        <p className="text-sm font-medium">{member.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-border/50 sm:col-span-2 transition-colors hover:bg-foreground/[0.04]">
                      <div className="p-2 bg-background rounded-lg shadow-sm text-foreground/60 border border-border/50 mt-0.5">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Alamat Lengkap</p>
                        <p className="text-sm font-medium leading-snug mt-0.5">{member.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column: QR Code */}
        <div className="h-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col items-center text-center h-full justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-1">QR Code Check-in</h3>
            <p className="text-sm text-foreground/60 mb-6">
              Tunjukkan QR Code ini kepada admin saat Anda berkunjung ke gym.
            </p>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-xl shadow-inner mb-4 border border-gray-200">
              <img 
                src={qrCodeUrl} 
                alt="Member QR Code" 
                className="w-32 h-32 object-contain"
              />
            </div>
            
            <p className="text-xs font-mono bg-background px-3 py-1 rounded border border-border mb-4">
              {member.memberCode}
            </p>

            <div className="flex gap-3 w-full">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-background border border-border hover:bg-foreground/5 rounded-lg text-sm font-medium transition-colors">
                <Download className="h-4 w-4" /> Unduh
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-background border border-border hover:bg-foreground/5 rounded-lg text-sm font-medium transition-colors">
                <Printer className="h-4 w-4" /> Cetak
              </button>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showEditModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEditModal(false)}
                className="absolute inset-0 bg-black/80"
              />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden"
            >
              <div className="p-5 border-b border-border flex justify-between items-center bg-background/50 flex-shrink-0">
                <h3 className="text-lg font-bold">Edit Profil</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-3 overflow-y-auto">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group cursor-pointer">
                    <img 
                      src="https://ui-avatars.com/api/?name=Ahmad+Faisal&background=random&size=200" 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full border-4 border-background shadow-md object-cover group-hover:opacity-70 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="h-6 w-6 text-white drop-shadow-md" />
                    </div>
                  </div>
                  <p className="text-xs text-foreground/50 mt-2">Klik untuk ubah foto</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nama Lengkap</label>
                  <input 
                    type="text" 
                    defaultValue={member.name}
                    className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email (Hanya Baca)</label>
                  <input 
                    type="email" 
                    defaultValue={member.email}
                    disabled
                    className="w-full px-4 py-2 bg-foreground/5 border border-border rounded-xl focus:outline-none text-foreground/50 cursor-not-allowed text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nomor HP</label>
                  <input 
                    type="tel" 
                    defaultValue={member.phone}
                    className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Alamat Lengkap</label>
                  <textarea 
                    defaultValue={member.address}
                    rows="2"
                    className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-border bg-background/50 flex gap-3 flex-shrink-0">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border font-bold rounded-xl hover:bg-foreground/5 transition-colors text-sm"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    // simulasi simpan
                    setTimeout(() => setShowEditModal(false), 300);
                  }}
                  className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm"
                >
                  Simpan
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

export default MemberDashboard;
