import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, CheckCircle2, XCircle, FileText, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const Payments = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [gymSettings, setGymSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [activeTab, setActiveTab] = useState('hari-ini');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('semua');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayments = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/payments`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Gagal memuat data pembayaran');
      const data = await res.json();
      setPayments(data.payments);
      setGymSettings(data.gym);
    } catch (error) {
      if (!isBackground) toast.error(error.message);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    
    // Auto refresh every 5 seconds
    const intervalId = setInterval(() => {
      fetchPayments(true);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [token]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatRupiahCustom = (numberStr) => {
    const num = parseInt(numberStr, 10);
    const formatted = new Intl.NumberFormat('id-ID').format(num);
    return `${formatted},-`;
  };

  const handleConfirm = (payment) => {
    setSelectedPayment(payment);
    setIsConfirmModalOpen(true);
  };

  const handleCancel = (payment) => {
    setSelectedPayment(payment);
    setIsCancelModalOpen(true);
  };

  const handleViewInvoice = (payment) => {
    setSelectedPayment(payment);
    setIsInvoiceModalOpen(true);
  };

  const closeModal = () => {
    setIsConfirmModalOpen(false);
    setIsCancelModalOpen(false);
    setIsInvoiceModalOpen(false);
    setTimeout(() => setSelectedPayment(null), 300);
  };

  let todayPayments = payments.filter(p => {
    if (!p.created_at) return false;
    const paymentDate = new Date(p.created_at).toDateString();
    const today = new Date().toDateString();
    return paymentDate === today;
  });

  if (searchQuery) {
    todayPayments = todayPayments.filter(p => 
      p.invoice.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.member.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (methodFilter !== 'semua') {
    todayPayments = todayPayments.filter(p => p.method.toLowerCase() === methodFilter);
  }

  if (statusFilter !== 'semua') {
    todayPayments = todayPayments.filter(p => p.status.toLowerCase() === statusFilter);
  }
  let historyPayments = payments.filter(p => p.status === "Lunas" || p.status === "Dibatalkan");
  
  if (searchQuery) {
    historyPayments = historyPayments.filter(p => 
      p.invoice.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.member.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (methodFilter !== 'semua') {
    historyPayments = historyPayments.filter(p => p.method.toLowerCase() === methodFilter);
  }

  if (statusFilter !== 'semua') {
    historyPayments = historyPayments.filter(p => p.status.toLowerCase() === statusFilter);
  }

  const renderTableRows = (payments) => {
    if (payments.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="px-4 py-8 text-center text-foreground/50 text-sm">
            Belum ada data pembayaran.
          </td>
        </tr>
      );
    }

    return payments.map((payment) => (
      <tr key={payment.id} className="hover:bg-background/50 transition-colors">
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="font-medium text-foreground">{payment.invoice}</div>
          <div className="text-[10px] text-foreground/50">{payment.date}</div>
        </td>
        <td className="px-4 py-3">
          <div className="font-medium text-foreground">{payment.member}</div>
          <div className="text-[10px] text-foreground/50">{payment.code}</div>
        </td>
        <td className="px-4 py-3 text-xs">{payment.type}</td>
        <td className="px-4 py-3 text-center">
          <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-500/20">{payment.method}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-between w-full font-bold text-primary">
            <span>Rp</span>
            <span>{formatRupiahCustom(payment.amount)}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${payment.status === 'Menunggu'
              ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
              : payment.status === 'Lunas' 
              ? 'bg-green-500/10 text-green-500 border-green-500/20'
              : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
            {payment.status}
          </span>
        </td>
        <td className="px-4 py-3">
          {payment.status === 'Menunggu' ? (
            <div className="flex flex-col justify-center gap-2">
              <button onClick={() => handleConfirm(payment)} className="px-2 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold" title="Konfirmasi & Kirim Invoice">
                <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi
              </button>
              <button onClick={() => handleCancel(payment)} className="px-2 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold" title="Batalkan">
                <XCircle className="w-3.5 h-3.5" /> Batalkan
              </button>
            </div>
          ) : payment.status === 'Lunas' ? (
            <div className="flex flex-col justify-center gap-2">
              <button onClick={() => handleViewInvoice(payment)} className="px-2 py-1.5 bg-background border border-border text-foreground hover:bg-border/50 rounded transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" title="Lihat Invoice">
                <FileText className="w-3.5 h-3.5" /> INVOICE
              </button>
            </div>
          ) : (
             <div className="text-center text-xs text-foreground/50">-</div>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex flex-col space-y-6 pb-4">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-foreground/70 text-xs">Kelola pembayaran hari ini dan riwayat transaksi member.</p>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-border mt-2">
          <nav className="flex space-x-4 sm:space-x-6 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('hari-ini')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'hari-ini' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
              }`}
            >
              Pembayaran Hari Ini
            </button>
            <button 
              onClick={() => setActiveTab('riwayat')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'riwayat' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
              }`}
            >
              Riwayat Pembayaran
            </button>
          </nav>
        </div>
      </div>

      {/* SECTION 1: Pembayaran Hari Ini */}
      {activeTab === 'hari-ini' && (
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Pembayaran Hari Ini</h2>
            <p className="text-xs text-foreground/50">Daftar semua status pembayaran yang terjadi pada hari ini.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
              <input
                type="text"
                placeholder="Cari invoice atau member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 h-[38px] bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground transition-colors"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 h-[38px] text-sm text-foreground focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="lunas">Lunas</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
            <select 
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 h-[38px] text-sm text-foreground focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="semua">Semua Metode</option>
              <option value="qris">QRIS</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center">Tanggal / Invoice</th>
                <th className="px-4 py-3 text-center">Member/Guest</th>
                <th className="px-4 py-3 text-center">Jenis Transaksi</th>
                <th className="px-4 py-3 text-center">Metode</th>
                <th className="px-4 py-3 text-center">Nominal</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {renderTableRows(todayPayments)}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* SECTION 2: Riwayat Pembayaran */}
      {activeTab === 'riwayat' && (
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Riwayat Pembayaran</h2>
            <p className="text-xs text-foreground/50">Daftar riwayat transaksi yang sudah lunas atau dibatalkan.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
              <input
                type="text"
                placeholder="Cari invoice atau member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 h-[38px] bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground transition-colors"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 h-[38px] text-sm text-foreground focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="lunas">Lunas</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
            <select 
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 h-[38px] text-sm text-foreground focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="semua">Semua Metode</option>
              <option value="qris">QRIS</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center">Tanggal / Invoice</th>
                <th className="px-4 py-3 text-center">Member/Guest</th>
                <th className="px-4 py-3 text-center">Jenis Transaksi</th>
                <th className="px-4 py-3 text-center">Metode</th>
                <th className="px-4 py-3 text-center">Nominal</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {renderTableRows(historyPayments)}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-foreground/50">Menampilkan {historyPayments.length} riwayat transaksi</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-background border border-border rounded text-xs text-foreground/50 disabled:opacity-50" disabled>Sebelumnya</button>
            <button className="px-3 py-1 bg-primary text-white rounded text-xs font-medium">1</button>
            <button className="px-3 py-1 bg-background border border-border rounded text-xs hover:bg-border/50 text-foreground transition-colors disabled:opacity-50" disabled>Selanjutnya</button>
          </div>
        </div>
      </div>
      )}

      {/* --- MODAL KONFIRMASI PEMBAYARAN --- */}
      {isConfirmModalOpen && selectedPayment && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-green-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Konfirmasi Pembayaran
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground/80 text-center">
                Apakah Anda telah menerima dana sebesar <strong className="text-foreground">{formatRupiah(selectedPayment.amount)}</strong> untuk <strong className="text-foreground">{selectedPayment.invoice}</strong>?
              </p>
              <div className="bg-background/50 border border-border/50 p-3 rounded-lg text-xs space-y-2 text-foreground/70">
                <div className="flex justify-between">
                  <span>Member:</span>
                  <span className="font-bold text-foreground">{selectedPayment.member}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jenis Transaksi:</span>
                  <span className="font-bold text-foreground">{selectedPayment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span className="font-bold text-foreground">{selectedPayment.method}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Kembali
              </button>
              <button 
                onClick={async () => { 
                  setIsSubmitting(true);
                  try {
                    const res = await fetch(`${API_URL}/admin/payments/${selectedPayment.id}/confirm`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                    });
                    if (!res.ok) throw new Error('Gagal konfirmasi');
                    toast.success(`Pembayaran ${selectedPayment.invoice} berhasil dikonfirmasi!`);
                    closeModal();
                    fetchPayments();
                  } catch (e) {
                    toast.error(e.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }} 
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Konfirmasi Lunas'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL BATALKAN PEMBAYARAN --- */}
      {isCancelModalOpen && selectedPayment && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-red-500 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Batalkan Pembayaran
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground/80 text-center">
                Apakah Anda yakin ingin membatalkan transaksi <strong className="text-foreground">{selectedPayment.invoice}</strong> senilai <strong className="text-foreground">{formatRupiah(selectedPayment.amount)}</strong>?
              </p>
              <p className="text-[10px] text-foreground/50 text-center bg-red-500/10 text-red-500 p-2 rounded-lg border border-red-500/20">
                Aksi ini tidak dapat dibatalkan. Tagihan akan dianggap batal.
              </p>
            </div>
            <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Kembali
              </button>
              <button 
                onClick={async () => { 
                  setIsSubmitting(true);
                  try {
                    const res = await fetch(`${API_URL}/admin/payments/${selectedPayment.id}/cancel`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                    });
                    if (!res.ok) throw new Error('Gagal membatalkan');
                    toast.success(`Pembayaran ${selectedPayment.invoice} dibatalkan!`);
                    closeModal();
                    fetchPayments();
                  } catch (e) {
                    toast.error(e.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }} 
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Batalkan Transaksi'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL INVOICE --- */}
      {isInvoiceModalOpen && selectedPayment && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Detail Invoice
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Kop Invoice */}
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-primary tracking-wider uppercase">Combat Strength Gym</h2>
                <p className="text-xs text-foreground/70">{gymSettings?.address || 'Jl. Raya Kebon Jeruk No. 27, Jakarta Barat'}</p>
                <p className="text-xs text-foreground/70">Telp: {gymSettings?.phone || '0812-3456-7890'} | Email: {gymSettings?.email || 'admin@combatstrength.com'}</p>
                <p className="text-sm font-bold pt-2">Bukti Pembayaran Lunas</p>
              </div>

              <div className="flex justify-between items-end border-b border-dashed border-border pb-4">
                <div>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Nomor Invoice</p>
                  <p className="text-sm font-bold text-foreground">{selectedPayment.invoice}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Tanggal</p>
                  <p className="text-xs text-foreground">{selectedPayment.date}</p>
                </div>
              </div>

              {/* Detail Transaksi */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/70">Nama Member</span>
                  <span className="text-sm font-bold text-foreground">{selectedPayment.member}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/70">Tipe Transaksi</span>
                  <span className="text-sm font-medium text-foreground">{selectedPayment.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/70">Metode Pembayaran</span>
                  <span className="text-xs font-bold bg-background border border-border px-2 py-0.5 rounded text-foreground">{selectedPayment.method}</span>
                </div>
              </div>

              {/* Total Tagihan */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center mt-4">
                <span className="text-sm font-bold text-foreground">Total Pembayaran</span>
                <span className="text-xl font-black text-primary">{formatRupiah(selectedPayment.amount)}</span>
              </div>

              <div className="text-center pt-2">
                <span className="inline-block bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  LUNAS
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
              <button onClick={() => { alert('Memulai pencetakan invoice...'); }} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Cetak Struk
              </button>
              <button onClick={closeModal} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(255,42,42,0.3)]">
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Payments;
