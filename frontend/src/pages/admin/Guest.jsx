import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, Save, QrCode, Banknote, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:8000/api';

const Guest = () => {
  const { token } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [guestPrice, setGuestPrice] = useState(15000);

  useEffect(() => {
    setMounted(true);
    
    // Fetch settings for guest price
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.guest_price) {
            setGuestPrice(data.settings.guest_price);
          }
        }
      } catch (e) {
        console.error('Failed to fetch settings', e);
      }
    };
    
    fetchSettings();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/guests/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          payment_method: paymentMethod,
          amount: guestPrice
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mendaftarkan guest');
      }

      toast.success(data.message);
      
      // Reset form
      setName('');
      setPhone('');
      setPaymentMethod('cash');
      setShowConfirmModal(false);

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pembayaran Guest Harian</h1>
        <p className="text-foreground/70 text-xs">Catat kehadiran guest harian dan pilih metode pembayaran.</p>
      </div>

      <div className="bg-card p-4 sm:p-5 rounded-xl border border-border shadow-sm">
        <form className="max-w-4xl mx-auto flex flex-col" onSubmit={handlePreSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Kolom Kiri: Informasi Guest */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">Informasi Guest</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[0-9]/g, ''))}
                    placeholder="Masukkan nama guest"
                    className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nomor Handphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    minLength={10}
                    maxLength={13}
                    placeholder="08xxxxxxxxxx (Opsional)"
                    className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Pembayaran */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">Metode Pembayaran</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Cash Option */}
                <label className={`
                  flex-1 cursor-pointer border rounded-lg px-4 py-3 flex items-center gap-3 transition-all
                  ${paymentMethod === 'cash' 
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/50' 
                    : 'border-border bg-background text-foreground/70 hover:border-primary/50 hover:bg-background/80'
                  }
                `}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cash" 
                    checked={paymentMethod === 'cash'} 
                    onChange={() => setPaymentMethod('cash')}
                    className="sr-only"
                  />
                  <div className={`p-1.5 rounded-md ${paymentMethod === 'cash' ? 'bg-primary/10' : 'bg-foreground/5'}`}>
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Tunai (Cash)</span>
                </label>

                {/* QRIS Option */}
                <label className={`
                  flex-1 cursor-pointer border rounded-lg px-4 py-3 flex items-center gap-3 transition-all
                  ${paymentMethod === 'qris' 
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/50' 
                    : 'border-border bg-background text-foreground/70 hover:border-primary/50 hover:bg-background/80'
                  }
                `}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="qris" 
                    checked={paymentMethod === 'qris'} 
                    onChange={() => setPaymentMethod('qris')}
                    className="sr-only"
                  />
                  <div className={`p-1.5 rounded-md ${paymentMethod === 'qris' ? 'bg-primary/10' : 'bg-foreground/5'}`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">QRIS</span>
                </label>
              </div>

              <div className="bg-background/50 px-4 py-3 rounded-lg border border-border flex justify-between items-center mt-2">
                <span className="text-xs font-medium text-foreground/70">Total Tagihan:</span>
                <span className="text-lg font-bold text-primary">Rp {formatRupiah(guestPrice)}</span>
              </div>
            </div>

          </div>

          <div className="pt-4 mt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm rounded-lg font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)] disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              Daftarkan & Check-in
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showConfirmModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setShowConfirmModal(false)}
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
                <h3 className="text-xl font-bold mb-2">Konfirmasi Check-in</h3>
                <p className="text-foreground/60 text-sm mb-6">
                  Anda akan mendaftarkan guest <strong>{name}</strong> dan mencatat pembayaran lunas sebesar Rp {formatRupiah(guestPrice)},-. Lanjutkan?
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl border border-border font-bold hover:bg-foreground/5 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmSubmit}
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
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default Guest;
