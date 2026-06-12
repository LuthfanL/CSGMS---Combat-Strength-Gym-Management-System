import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Download, Home, X, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000/api';

const PaymentInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetchPayment = async () => {
    try {
      const res = await fetch(`${API_URL}/member/payments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Gagal memuat detail pembayaran');
      const data = await res.json();
      setPayment(data.payment);
    } catch (error) {
      toast.error(error.message);
      navigate('/member/membership');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id, token]);

  useEffect(() => {
    fetchPayment();
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!payment) return null;

  const pkg = payment.package || {};
  const paymentMethod = payment.payment_method;
  const status = payment.status;

  const currentDate = new Date(payment.created_at).toLocaleString('id-ID', { 
    day: 'numeric', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
  
  const formattedPrice = `Rp ${new Intl.NumberFormat('id-ID').format(payment.amount)}`;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 pb-4">
      {/* Top Header Section */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row items-center p-4 gap-6">
        <div className="flex-1 flex flex-col items-center text-center space-y-3">
          <h1 className="text-lg font-bold tracking-tight">
            Pembayaran {paymentMethod.toUpperCase()}
          </h1>
          <p className="text-foreground/70 font-medium text-sm">Selesaikan pembayaran</p>
          
          {paymentMethod === 'qris' ? (
            <>
              <div className="bg-white p-2 rounded-xl shadow-inner border border-border/50 inline-block mt-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=CSGMS-PAY-${id}`} 
                  alt="QR Code" 
                  className="w-32 h-32"
                />
              </div>
            </>
          ) : (
            <div className="py-4 px-4 bg-primary/5 rounded-xl border border-primary/20 max-w-sm">
              <p className="font-bold mb-1">Segera ke Resepsionis!</p>
              <p className="text-xs text-foreground/70">
                Tunjukkan nomor pesanan ini kepada staf kami di meja resepsionis untuk melakukan pembayaran secara tunai.
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-foreground/60 mb-0.5">Total Pembayaran</p>
            <p className="text-2xl font-black">{formattedPrice}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button 
              onClick={() => setShowStatusModal(true)}
              className="px-5 py-2 bg-foreground text-background font-bold rounded-full hover:bg-foreground/90 transition-all text-xs"
            >
              Cek Status Pembayaran
            </button>
            {paymentMethod === 'qris' && (
              <button className="px-5 py-2 border border-border font-bold rounded-full hover:bg-foreground/5 transition-all text-xs">
                Unduh
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 w-full space-y-4">
          {/* Informasi Pesanan & Cara Pembayaran in one column if side-by-side */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-base mb-3">Informasi Pesanan</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start border-b border-border/50 pb-1.5">
                <span className="text-foreground/60">Nomor Invoice</span>
                <span className="font-medium text-right">{id}</span>
              </div>
              <div className="flex justify-between items-start border-b border-border/50 pb-1.5">
                <span className="text-foreground/60">Tanggal Pesan</span>
                <span className="font-medium text-right">{currentDate}</span>
              </div>
              <div className="flex justify-between items-start border-b border-border/50 pb-1.5">
                <span className="text-foreground/60">Nama Member</span>
                <span className="font-medium text-right">{user?.name}</span>
              </div>
              <div className="flex justify-between items-start border-b border-border/50 pb-1.5">
                <span className="text-foreground/60">Tipe Pesanan</span>
                <span className="font-medium text-right">{payment.payment_type === 'guest' ? 'Guest Harian' : 'Membership Gym'}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-foreground/60">Metode Pembayaran</span>
                <span className="font-medium text-right">{paymentMethod.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Detail Pembayaran */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-base mb-3">Detail Pembayaran</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-foreground/60 uppercase bg-background/50 border-b border-border/50">
                  <tr>
                    <th className="px-3 py-2 font-medium">Nama Item</th>
                    <th className="px-3 py-2 font-medium text-center">Durasi</th>
                    <th className="px-3 py-2 font-medium text-right">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="px-3 py-3 font-bold">{pkg.name || 'Paket Gym'}</td>
                    <td className="px-3 py-3 text-center">{pkg.duration ? `${pkg.duration} Bulan` : '-'}</td>
                    <td className="px-3 py-3 text-right font-medium">{formattedPrice}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className="px-3 py-3 font-bold text-sm">Total</td>
                    <td className="px-3 py-3 text-right font-black text-sm text-primary">{formattedPrice}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Cara Pembayaran (Moved to bottom to save vertical space on QR area) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-base mb-2">
          Cara Pembayaran {paymentMethod.toUpperCase()}
        </h3>
        {paymentMethod === 'qris' ? (
          <ol className="list-decimal list-outside ml-4 space-y-1.5 text-xs text-foreground/70">
            <li>Klik <strong className="text-foreground">Unduh</strong> untuk menyimpan gambar / screenshot kode QRIS.</li>
            <li>Buka fitur pembayaran QR di aplikasi m-banking atau e-wallet Anda.</li>
            <li>Unggah / pindai gambar kode QR yang telah disimpan.</li>
            <li>Periksa transaksi Anda dan lakukan pembayaran.</li>
            <li>Setelah selesai, klik <strong className="text-foreground">Cek Status Pembayaran</strong> untuk melihat status pesanan.</li>
          </ol>
        ) : (
          <ol className="list-decimal list-outside ml-4 space-y-1.5 text-xs text-foreground/70">
            <li>Kunjungi meja resepsionis Combat Strength Gym.</li>
            <li>Sebutkan nama atau nomor invoice <strong>{id}</strong> Anda.</li>
            <li>Serahkan uang tunai sesuai dengan total pembayaran.</li>
            <li>Admin akan mengonfirmasi pembayaran Anda di sistem.</li>
            <li>Paket membership Anda akan otomatis aktif.</li>
          </ol>
        )}
      </div>

      {/* Cek Status Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatusModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
                <div>
                  <h3 className="text-xl font-bold">Cek Status Pembayaran</h3>
                  <p className="text-sm text-foreground/60">Kode: {id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground/60">Status Pembayaran</p>
                  <p className="font-bold text-orange-500">Pending</p>
                </div>
              </div>
              
              <div className="p-8">
                {/* Timeline */}
                <div className="relative flex justify-between items-center w-full max-w-md mx-auto mb-10">
                  {/* Lines */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10" />
                  
                  {/* Step 1: Menunggu Pembayaran */}
                  <div className="flex flex-col items-center bg-card px-2">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 ${status === 'pending' ? 'border-primary bg-primary/10 text-primary' : 'border-green-500 bg-green-500/10 text-green-500'}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Pembayaran Dibuat</p>
                      <p className="text-xs text-foreground/60 max-w-[140px] mx-auto mt-1">
                        Selesaikan transaksi Anda
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Status Akhir */}
                  <div className="flex flex-col items-center bg-card px-2">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 ${status === 'paid' ? 'border-green-500 bg-green-500/10 text-green-500' : status === 'cancel' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-border bg-background text-foreground/30'}`}>
                      {status === 'cancel' ? <X className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    </div>
                    <div className={`text-center ${status === 'pending' ? 'opacity-50' : ''}`}>
                      <p className="font-bold text-sm">Status Akhir</p>
                      <p className="text-xs text-foreground/60 max-w-[140px] mx-auto mt-1">
                        {status === 'paid' ? 'Pesanan berhasil terkonfirmasi' : status === 'cancel' ? 'Pesanan telah dibatalkan' : 'Pesanan terkonfirmasi atau hangus'}
                      </p>
                    </div>
                  </div>
                </div>

                {status === 'pending' && (
                  <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 p-4 rounded-xl text-sm font-medium mb-6">
                    ⚠️ Silakan segera lakukan pembayaran sebelum batas waktu habis agar pesanan tidak dibatalkan otomatis.
                  </div>
                )}
                {status === 'paid' && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-medium mb-6 flex justify-between items-center">
                    <span>✅ Pembayaran Anda telah dikonfirmasi!</span>
                    <Link to="/member/dashboard" className="underline font-bold text-green-700 dark:text-green-300">Ke Dashboard</Link>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-border/50 pt-6">
                  <div className="flex gap-4 items-center">
                    <p className="text-sm text-foreground/60">Dipesan: {currentDate}</p>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${status === 'paid' ? 'bg-green-500/10 text-green-500' : status === 'cancel' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {status === 'paid' ? 'Lunas' : status === 'cancel' ? 'Dibatalkan' : 'Belum Dibayar'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setShowStatusModal(false);
                      fetchPayment(); // Refresh just in case
                    }}
                    className="px-6 py-2.5 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all text-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentInvoice;
