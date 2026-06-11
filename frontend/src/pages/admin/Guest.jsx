import React, { useState } from 'react';
import { UserPlus, Save, QrCode, Banknote } from 'lucide-react';

const Guest = () => {
  const [paymentMethod, setPaymentMethod] = useState('cash');

  return (
    <div className="flex flex-col h-full space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pembayaran Guest Harian</h1>
        <p className="text-foreground/70 text-xs">Catat kehadiran guest harian dan pilih metode pembayaran.</p>
      </div>

      <div className="bg-card p-4 sm:p-5 rounded-xl border border-border shadow-sm">
        <form className="max-w-4xl mx-auto flex flex-col" onSubmit={(e) => { e.preventDefault(); alert('Guest berhasil didaftarkan dan check-in.'); }}>
          
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
                    placeholder="Masukkan nama guest"
                    className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Nomor Handphone</label>
                  <input
                    type="tel"
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
                <span className="text-lg font-bold text-primary">Rp 50.000</span>
              </div>
            </div>

          </div>

          <div className="pt-4 mt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm rounded-lg font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)]"
            >
              <UserPlus className="w-4 h-4" />
              Daftarkan & Check-in
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Guest;
