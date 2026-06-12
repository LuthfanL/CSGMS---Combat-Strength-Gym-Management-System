import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, Clock, XCircle, FileText, X, Search, Filter, Loader2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

const API_URL = 'http://localhost:8000/api';

const MemberPayments = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [payments, setPayments] = useState([]);
  const [gymSettings, setGymSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterMethod, setFilterMethod] = useState('Semua');

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/member/payments`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Gagal memuat data pembayaran');
      const data = await res.json();
      setPayments(data.payments);
      setGymSettings(data.gym);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPayments();
  }, [token]);

  const handleDownloadInvoice = () => {
    if (!selectedInvoice) return;
    
    // Create a temporary element for PDF rendering
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: 'Inter', sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; background: white;">
        <!-- Header Section -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px;">
          <div>
            <h1 style="color: #ef4444; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; font-size: 28px; font-weight: 900;">COMBAT STRENGTH GYM</h1>
            <p style="margin: 0; font-size: 13px; color: #666;">${gymSettings?.address || 'Jl. Raya Kebon Jeruk No. 27, Jakarta Barat'}</p>
            <p style="margin: 0; font-size: 13px; color: #666;">Telp: ${gymSettings?.phone || '0812-3456-7890'} | ${gymSettings?.email || 'admin@combatstrength.com'}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #111; font-size: 24px; text-transform: uppercase; font-weight: 900;">INVOICE</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 600; color: #ef4444;">${selectedInvoice.id}</p>
          </div>
        </div>
        
        <!-- Info Section -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div style="background: #f9f9f9; padding: 15px 20px; border-radius: 8px; width: 45%;">
            <p style="margin: 0 0 5px 0; font-size: 11px; font-weight: bold; color: #666; text-transform: uppercase;">Ditagihkan Kepada:</p>
            <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #111;">${user?.name || '-'}</h3>
            <p style="margin: 0; font-size: 13px; color: #666;">Member Combat Strength Gym</p>
          </div>
          <div style="width: 45%;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
              <span style="font-size: 13px; color: #666;">Tanggal Transaksi</span>
              <span style="font-size: 13px; font-weight: bold;">${selectedInvoice.date}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
              <span style="font-size: 13px; color: #666;">Metode Pembayaran</span>
              <span style="font-size: 13px; font-weight: bold; text-transform: uppercase;">${selectedInvoice.method}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 13px; color: #666;">Status</span>
              <span style="font-size: 13px; font-weight: bold; color: #10b981;">LUNAS</span>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #111; color: white;">
              <th style="text-align: left; padding: 12px 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Deskripsi Paket</th>
              <th style="text-align: right; padding: 12px 15px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 15px; border-bottom: 1px solid #eee; font-size: 15px; font-weight: 600;">
                ${selectedInvoice.package}
              </td>
              <td style="text-align: right; padding: 15px; border-bottom: 1px solid #eee; font-size: 15px; font-weight: 600;">
                Rp ${selectedInvoice.amount},-
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Total Section -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
          <div style="width: 50%; background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; font-weight: bold; color: #666; text-transform: uppercase;">Total Pembayaran</span>
              <span style="font-size: 24px; font-weight: 900; color: #ef4444;">Rp ${selectedInvoice.amount},-</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">Terima kasih atas kepercayaan Anda!</p>
          <p style="margin: 0; font-size: 12px; color: #666;">Invoice ini sah dan diterbitkan secara otomatis oleh sistem Combat Strength Gym.</p>
        </div>
      </div>
    `;

    const opt = {
      margin:       0,
      filename:     `Invoice_${selectedInvoice.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
    toast.success('Invoice sedang diunduh...');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Lunas':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5" /> Lunas
          </span>
        );
      case 'Menunggu':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" /> Menunggu
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider">
            <XCircle className="h-3.5 w-3.5" /> Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchSearch = payment.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        payment.package.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'Semua' || payment.status === filterStatus;
    const matchMethod = filterMethod === 'Semua' || payment.method === filterMethod;
    return matchSearch && matchStatus && matchMethod;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Pembayaran</h1>
          <p className="text-foreground/60">Daftar transaksi pembelian dan perpanjangan paket Anda.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-foreground/50" />
          </div>
          <input
            type="text"
            placeholder="Cari Invoice atau Paket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Lunas">Lunas</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow cursor-pointer"
            >
              <option value="Semua">Semua Metode</option>
              <option value="QRIS">QRIS</option>
              <option value="Cash">Cash</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background/50 border-b border-border text-foreground/60 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-center">Invoice</th>
                <th className="px-6 py-4 text-center">Paket</th>
                <th className="px-6 py-4 text-center">Nominal</th>
                <th className="px-6 py-4 text-center">Metode</th>
                <th className="px-6 py-4 text-center">Tanggal</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-foreground/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-primary text-center">
                    {payment.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-center">
                    {payment.package}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    <div className="flex justify-between items-center w-full max-w-[120px] mx-auto">
                      <span>Rp</span>
                      <span>{payment.amount},-</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 text-foreground/60 text-center">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {getStatusBadge(payment.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      {payment.status === 'Lunas' && (
                        <button 
                          onClick={() => setSelectedInvoice(payment)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-foreground/70 hover:text-primary border border-border hover:border-primary/30 hover:bg-primary/5 rounded-lg transition-all font-semibold text-xs" 
                          title="Lihat Invoice"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          INVOICE
                        </button>
                      )}
                      {payment.status === 'Menunggu' && (
                        <button 
                          onClick={() => navigate(`/member/invoice/${payment.id}`, {
                            state: { 
                              pkg: { name: payment.package, duration: payment.package, price: `Rp ${payment.amount}` },
                              paymentMethod: payment.method.toLowerCase()
                            }
                          })}
                          className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Bayar Sekarang
                        </button>
                      )}
                      {payment.status === 'Dibatalkan' && (
                        <span className="text-foreground/50 font-medium px-4">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-foreground/50">
                    Belum ada riwayat pembayaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      )}

      {/* Invoice Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedInvoice && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedInvoice(null)}
                className="absolute inset-0 bg-black/80"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-[#111] text-white w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div className="flex items-center gap-2 text-red-500">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-bold text-white">Detail Invoice</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Body */}
                <div className="p-6 space-y-6">
                  {/* Company Info */}
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-black tracking-wider text-red-500 uppercase">
                      COMBAT STRENGTH GYM
                    </h2>
                    <p className="text-xs text-white/70">{gymSettings?.address || 'Jl. Raya Kebon Jeruk No. 27, Jakarta Barat'}</p>
                    <p className="text-xs text-white/70">Telp: {gymSettings?.phone || '0812-3456-7890'} | Email: {gymSettings?.email || 'admin@combatstrength.com'}</p>
                    <p className="text-sm font-bold pt-2">Bukti Pembayaran Lunas</p>
                  </div>

                  {/* Invoice Date & Number */}
                  <div className="flex justify-between items-start pt-2">
                    <div>
                      <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Nomor Invoice</p>
                      <p className="text-lg font-bold">{selectedInvoice.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Tanggal</p>
                      <p className="text-sm">{selectedInvoice.date}</p>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-white/20"></div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">Nama Member</span>
                      <span className="text-sm font-bold">{user?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">Tipe Transaksi</span>
                      <span className="text-sm font-bold">{selectedInvoice.package}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70">Metode Pembayaran</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md border border-white/20 bg-white/5 uppercase">
                        {selectedInvoice.method}
                      </span>
                    </div>
                  </div>

                  {/* Total Box */}
                  <div className="border border-white/20 rounded-xl p-4 flex justify-between items-center bg-white/5">
                    <span className="font-bold">Total Pembayaran</span>
                    <span className="text-xl font-bold text-red-500">Rp {selectedInvoice.amount},-</span>
                  </div>

                  {/* Lunas Badge */}
                  <div className="flex justify-center pt-2">
                    <div className="px-5 py-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-500 text-sm font-bold uppercase tracking-wider">
                      Lunas
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/10 bg-white/5 flex gap-3 justify-end mt-auto">
                  <button 
                    onClick={handleDownloadInvoice}
                    className="px-5 py-2 border border-white/20 font-bold rounded-xl hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button 
                    onClick={() => setSelectedInvoice(null)}
                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm"
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

export default MemberPayments;
