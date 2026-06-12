import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { QrCode, Banknote, AlertCircle, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000/api';

const MemberCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const pkg = location.state?.pkg; // Get package from navigation state

  const [paymentMethod, setPaymentMethod] = useState(''); // 'qris' or 'cash'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If directly accessed without package, redirect back
  useEffect(() => {
    if (!pkg) {
      navigate('/member/membership');
    }
  }, [pkg, navigate]);

  const handleConfirmPayment = async () => {
    if (!paymentMethod) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/member/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          idPackage: pkg.idPackage,
          payment_method: paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memproses pembayaran');

      toast.success('Pesanan berhasil dibuat!');
      setShowConfirmModal(false);
      navigate(`/member/invoice/${data.invoice}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pkg) return null; // Avoid render errors before redirect

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 border-b border-border pb-3">
        <Link to="/member/membership" className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Formulir Pembayaran</h1>
          <p className="text-sm text-foreground/60">Selesaikan pembayaran untuk mengaktifkan paket Anda.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Package Summary */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <p className="text-xs font-medium text-primary mb-1">Ringkasan Pesanan</p>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <p className="text-foreground/60 text-xs mt-0.5">{pkg.formattedDuration || `${pkg.duration} Bulan`}</p>
                </div>
                <p className="text-2xl font-black text-primary tracking-tight">
                  {pkg.formattedPrice || `Rp ${new Intl.NumberFormat('id-ID').format(pkg.price || 0)}`}
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-base font-bold">Pilih Metode Pembayaran</h3>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-primary bg-primary/[0.02] shadow-sm shadow-primary/10' : 'border-border hover:border-primary/30'}`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="qris"
                    className="flex-shrink-0"
                    onChange={() => setPaymentMethod('qris')}
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === 'qris' ? 'bg-primary text-white' : 'bg-background border border-border text-foreground/60'}`}>
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">QRIS</p>
                    <p className="text-xs text-foreground/60 mt-0.5 leading-relaxed">
                      Bayar dengan scan kode QR menggunakan aplikasi e-Wallet (Gopay, OVO, Dana) atau M-Banking Anda.
                    </p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/[0.02] shadow-sm shadow-primary/10' : 'border-border hover:border-primary/30'}`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="cash"
                    className="flex-shrink-0"
                    onChange={() => setPaymentMethod('cash')}
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === 'cash' ? 'bg-primary text-white' : 'bg-background border border-border text-foreground/60'}`}>
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Tunai (Cash)</p>
                    <p className="text-xs text-foreground/60 mt-0.5 leading-relaxed">
                      Lakukan pembayaran langsung di meja resepsionis gym. Transaksi akan dikonfirmasi oleh admin saat Anda membayar.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              disabled={!paymentMethod}
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              Konfirmasi & Buat Pesanan
            </button>
          </motion.div>
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border p-6 text-center"
            >
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Konfirmasi Pesanan</h3>
              <p className="text-foreground/60 text-sm mb-6">
                Anda akan membuat pesanan untuk paket <strong>{pkg.name}</strong> dengan metode pembayaran <strong>{paymentMethod.toUpperCase()}</strong>. Lanjutkan?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold hover:bg-foreground/5 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                    </>
                  ) : (
                    'Ya, Lanjutkan'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberCheckout;
