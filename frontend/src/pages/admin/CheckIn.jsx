import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, Keyboard, UserCheck, Loader2, CheckCircle2, AlertCircle, Calendar, Eye, X, Hash, Phone, Mail, MapPin, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;

const CheckIn = () => {
  const { token } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode;

    const initScanner = () => {
      // Create instance of Html5Qrcode
      html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      // Start scanning using the environment/default camera
      html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
        .catch(err => {
          console.error("Error starting scanner", err);
          // Ignore error on UI to avoid spamming toast if no camera is available
        });
    };

    // Small delay to ensure the div is rendered
    const timeoutId = setTimeout(initScanner, 250);

    return () => {
      clearTimeout(timeoutId);
      if (html5QrCode) {
        // Try to stop and clear safely
        try {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
              html5QrCode.clear();
            }).catch(console.error);
          } else {
            html5QrCode.clear();
          }
        } catch (e) {
          console.error("Cleanup error", e);
        }
      }
    };
  }, []);

  const onScanSuccess = (decodedText, decodedResult) => {
    if (isLoadingSearch || isCheckingIn || searchResult) return;
    
    setKeyword(decodedText);
    
    if (scannerRef.current) {
      try { scannerRef.current.pause(); } catch (e) {}
    }
    
    executeSearch(decodedText);
  };

  const onScanFailure = (error) => {
    // Ignore frequent scan failures (e.g., when no QR is in frame)
  };

  const executeSearch = async (searchKeyword) => {
    if (!searchKeyword.trim()) {
      toast.error('Masukkan kode, nama, atau email member terlebih dahulu.');
      return;
    }

    setIsLoadingSearch(true);
    setSearchResult(null);

    try {
      const res = await fetch(`${API_URL}/admin/checkin/search?keyword=${encodeURIComponent(searchKeyword)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSearchResult(data);
      } else {
        toast.error(data.message || 'Member tidak ditemukan.');
        if (scannerRef.current) {
          try { scannerRef.current.resume(); } catch (e) {}
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mencari data.');
      if (scannerRef.current) {
        try { scannerRef.current.resume(); } catch (e) {}
      }
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (scannerRef.current) {
      try { scannerRef.current.pause(); } catch (e) {}
    }
    executeSearch(keyword);
  };

  const handleCheckIn = async () => {
    if (!searchResult) return;
    
    setIsCheckingIn(true);
    try {
      const res = await fetch(`${API_URL}/admin/checkin/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ idMember: searchResult.idMember })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message);
        setSearchResult(null);
        setKeyword('');
        if (scannerRef.current) {
          try { scannerRef.current.resume(); } catch (e) {}
        }
      } else {
        toast.error(data.message || 'Gagal melakukan check-in.');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memproses check-in.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const resetScanner = () => {
    setSearchResult(null);
    setKeyword('');
    if (scannerRef.current) {
      try { scannerRef.current.resume(); } catch (e) {}
    }
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const map = {
      'Aktif': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Expired': 'bg-red-500/10 text-red-500 border-red-500/20',
      'Nonaktif': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      'Belum Aktif': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };
    return map[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Check-in Member</h1>
        <p className="text-foreground/70 text-xs">Pindai QR Code member atau masukkan kode secara manual untuk check-in.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        
        {/* QR Scanner */}
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center min-h-[350px]">
          <h2 className="text-sm font-bold text-foreground mb-4 w-full flex items-center justify-between border-b border-border pb-2">
            <span className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-primary" />
              Kamera Pemindai
            </span>
            {searchResult && (
              <button 
                onClick={resetScanner}
                className="flex items-center gap-1.5 text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Pindai Ulang
              </button>
            )}
          </h2>
          
          <div className="w-full flex-1 flex flex-col justify-center">
            {/* The html5-qrcode will render inside this div */}
            <div id="reader" className="w-full rounded-xl overflow-hidden border border-border/50 [&_img]:hidden"></div>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-xs text-green-500/80 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
            <span className={`w-2 h-2 rounded-full ${searchResult ? 'bg-orange-500' : 'bg-green-500 animate-pulse'}`} />
            {searchResult ? 'Kamera Dijeda' : 'Mencari QR Code...'}
          </div>
        </div>

        {/* Manual Input */}
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-2">
            <Keyboard className="w-4 h-4 text-primary" />
            Input Manual
          </h2>
          
          <div className="space-y-4 flex-1">
            <form onSubmit={handleSearch}>
              <label className="block text-xs font-medium text-foreground mb-1">Pencarian Member</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Kode / Nama / Email"
                  className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground"
                />
                <button 
                  type="submit"
                  disabled={isLoadingSearch}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)] whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
                </button>
              </div>
            </form>

            {/* Dynamic Result Area */}
            <div className="mt-6 p-4 border border-border rounded-xl bg-background/50 flex flex-col min-h-[220px]">
              {isLoadingSearch ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <p className="text-xs text-foreground/50 text-center">Mencari data member...</p>
                </div>
              ) : searchResult ? (
                <div className="flex flex-col h-full justify-between animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={searchResult.photo ? `${STORAGE_URL}/${searchResult.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(searchResult.name)}&background=random&size=100`} 
                        alt={searchResult.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-border shadow-sm"
                      />
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{searchResult.name}</h3>
                        <p className="text-xs text-foreground/60">{searchResult.member_code || 'Belum ada kode'}</p>
                        <p className="text-xs text-foreground/60">{searchResult.email}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsViewModalOpen(true)} className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors shadow-sm" title="Lihat Profil">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-card p-3 rounded-lg border border-border mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-0.5">Status Membership</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(searchResult.membership_status)}`}>
                        {searchResult.membership_status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-0.5">Berlaku Sampai</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {formatDate(searchResult.end_date)}
                      </div>
                    </div>
                  </div>

                  {searchResult.membership_status === 'Aktif' ? (
                    <button 
                      onClick={handleCheckIn}
                      disabled={isCheckingIn}
                      className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
                    >
                      {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {isCheckingIn ? 'Memproses...' : 'Konfirmasi Check-in'}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Tidak dapat check-in (Status tidak aktif)
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  <UserCheck className="w-12 h-12 text-foreground/20 mb-2" />
                  <p className="text-xs text-foreground/50 text-center">Hasil pencarian member akan muncul di sini</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(250px); }
          100% { transform: translateY(0); }
        }
      `}} />

      {/* --- MODAL VIEW MEMBER --- */}
      {isViewModalOpen && searchResult && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-foreground">Profil Member</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-2 text-center pb-2">
                <img
                  src={searchResult.photo ? `${STORAGE_URL}/${searchResult.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(searchResult.name)}&background=random&size=200`}
                  alt={searchResult.name}
                  className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover shadow-inner mb-2"
                />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{searchResult.name}</h2>
                  {searchResult.member_code ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold mt-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      {searchResult.member_code}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/50 font-medium mt-1">Belum ada kode member</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm bg-background/50 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-3 text-foreground/80">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{searchResult.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/80">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{searchResult.email}</span>
                </div>
                <div className="flex items-start gap-3 text-foreground/80">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{searchResult.address}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/80 pt-2 border-t border-border">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Bergabung: <strong className="text-foreground">{formatDate(searchResult.join_date)}</strong></span>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Status Membership</p>
                  <p className={`text-sm font-bold ${getStatusBadge(searchResult.membership_status).includes('green') ? 'text-green-500' : searchResult.membership_status === 'Expired' ? 'text-red-500' : searchResult.membership_status === 'Nonaktif' ? 'text-zinc-400' : 'text-orange-500'}`}>
                    {searchResult.membership_status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                    {searchResult.membership_status === 'Aktif' ? 'Berlaku Sampai' : searchResult.end_date ? 'Terakhir Expired' : 'Paket'}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {searchResult.end_date ? formatDate(searchResult.end_date) : '-'}
                  </p>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-background/50 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
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

export default CheckIn;
