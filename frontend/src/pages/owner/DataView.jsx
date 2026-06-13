import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Eye, X, Phone, Mail, MapPin, Calendar, FileSpreadsheet, Download } from 'lucide-react';
import { toast } from 'sonner';

// Dummy data removed. Using real APIs.

import { useAuth } from '../../context/AuthContext';

const DataView = () => {
  const { token } = useAuth();
  useEffect(() => {
    document.title = "Data Master Operasional - CSGMS";
  }, []);

  const [activeTab, setActiveTab] = useState('members');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // States for general listing
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // States specific to transactions
  const [trxPeriod, setTrxPeriod] = useState('');
  const [trxMethod, setTrxMethod] = useState('');

  // States specific to attendances
  const [attStartDate, setAttStartDate] = useState('');
  const [attEndDate, setAttEndDate] = useState('');
  const [attType, setAttType] = useState('');

  // States specific to export modal
  const [exportMemberStatus, setExportMemberStatus] = useState('all');
  const [exportPeriod, setExportPeriod] = useState('month');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  // Automatically calculate dates when exportPeriod changes
  useEffect(() => {
    if (exportPeriod === 'custom') return;
    
    if (exportPeriod === 'all') {
      setExportStartDate('');
      setExportEndDate('');
      return;
    }

    const today = new Date();
    let start = new Date();

    if (exportPeriod === 'today') {
      // start is today
    } else if (exportPeriod === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
      start.setDate(diff);
    } else if (exportPeriod === 'month') {
      start.setDate(1);
    } else if (exportPeriod === '6months') {
      start.setMonth(today.getMonth() - 5);
      start.setDate(1);
    } else if (exportPeriod === 'year') {
      start.setMonth(0);
      start.setDate(1);
    }

    const formatYMD = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    setExportStartDate(formatYMD(start));
    setExportEndDate(formatYMD(today));
  }, [exportPeriod]);

  // Handle tab change synchronously to prevent render crashes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    setStatus('');
    setTrxPeriod('');
    setTrxMethod('');
    setAttStartDate('');
    setAttEndDate('');
    setAttType('');
    setDataList([]);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async (isBackground = false) => {
      if (!isBackground) setIsLoading(true);
      try {
        let endpoint = '';
        const params = new URLSearchParams({ page });

        if (search) params.append('search', search);

        if (activeTab === 'members') {
          endpoint = '/api/owner/members';
          if (status) params.append('status', status);
        } else if (activeTab === 'transactions') {
          endpoint = '/api/owner/payments';
          if (status) params.append('status', status);
          if (trxPeriod) params.append('period', trxPeriod);
          if (trxMethod) params.append('method', trxMethod);
        } else if (activeTab === 'attendances') {
          endpoint = '/api/owner/attendances';
          if (attType) params.append('type', attType);
          if (attStartDate) params.append('start_date', attStartDate);
          if (attEndDate) params.append('end_date', attEndDate);
        }

        const res = await fetch(`http://localhost:8000${endpoint}?${params.toString()}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (res.ok) {
          const resData = await res.json();
          setDataList(resData.data);
          setTotalPages(resData.last_page);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        if (!isBackground) setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    const intervalId = setInterval(() => {
      if (!isViewModalOpen && !isExportModalOpen) fetchData(true);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, [activeTab, page, search, status, trxPeriod, trxMethod, attStartDate, attEndDate, attType, isViewModalOpen, isExportModalOpen, token]);

  const handleView = async (member) => {
    try {
      const res = await fetch(`http://localhost:8000/api/owner/members/${member.idMember}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedMember(data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch member details:', err);
    }
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsExportModalOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  const formatRupiahCustom = (numberStr) => {
    const num = parseInt(numberStr, 10);
    const formatted = new Intl.NumberFormat('id-ID').format(num);
    return `${formatted},-`;
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleDownload = async () => {
    let url = '';
    const params = new URLSearchParams();
    
    if (activeTab === 'members') {
      url = 'http://localhost:8000/api/owner/export/members';
      if (exportMemberStatus && exportMemberStatus !== 'all') {
        params.append('status', exportMemberStatus);
      }
    } else if (activeTab === 'transactions') {
      url = 'http://localhost:8000/api/owner/export/transactions';
      if (exportStartDate && exportPeriod !== 'all') params.append('start_date', exportStartDate);
      if (exportEndDate && exportPeriod !== 'all') params.append('end_date', exportEndDate);
    } else if (activeTab === 'attendances') {
      url = 'http://localhost:8000/api/owner/export/attendances';
      if (exportStartDate && exportPeriod !== 'all') params.append('start_date', exportStartDate);
      if (exportEndDate && exportPeriod !== 'all') params.append('end_date', exportEndDate);
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    try {
      const toastId = toast.loading('Memproses Laporan Excel...');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        let filename = `Laporan_${activeTab}.xlsx`;
        const disposition = res.headers.get('Content-Disposition');
        if (disposition && disposition.indexOf('filename=') !== -1) {
          filename = disposition.split('filename=')[1].replace(/['"]/g, '');
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        toast.success('Laporan Excel berhasil diunduh!', { id: toastId });
        closeModal();
      } else {
        toast.error('Gagal mengunduh laporan. Periksa koneksi Anda.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat mengunduh laporan.', { id: toastId });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Data Master Operasional</h1>
        <p className="text-foreground/70 text-xs">Lihat seluruh data member, transaksi, dan log kehadiran.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-4 sm:space-x-6 overflow-x-auto">
          <button
            onClick={() => handleTabChange('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'members' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
            }`}
          >
            Data Member
          </button>
          <button
            onClick={() => handleTabChange('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'transactions' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
            }`}
          >
            Data Transaksi
          </button>
          <button
            onClick={() => handleTabChange('attendances')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'attendances' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-foreground/70 hover:text-foreground hover:border-border'
            }`}
          >
            Data Kehadiran
          </button>
        </nav>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
          <input 
            type="text" 
            placeholder={`Cari data ${activeTab}...`} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground shadow-sm transition-colors"
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2 w-full sm:w-auto">
          {activeTab === 'attendances' && (
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-2 py-1 shadow-sm">
              <span className="text-xs text-foreground/70 font-medium">Dari:</span>
              <input type="date" value={attStartDate} onChange={e => setAttStartDate(e.target.value)} className="bg-transparent border-none p-1 text-sm text-foreground focus:ring-0 w-32 outline-none dark:[color-scheme:dark]" />
              <span className="text-xs text-foreground/70 font-medium border-l border-border pl-2">Sampai:</span>
              <input type="date" value={attEndDate} onChange={e => setAttEndDate(e.target.value)} className="bg-transparent border-none p-1 text-sm text-foreground focus:ring-0 w-32 outline-none dark:[color-scheme:dark]" />
            </div>
          )}
          {activeTab === 'transactions' && (
            <>
              <select value={trxPeriod} onChange={e => setTrxPeriod(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors shadow-sm w-full sm:w-auto">
                <option value="">Bulan Ini</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="year">Tahun Ini</option>
                <option value="all">Semua Waktu</option>
              </select>
              <select value={trxMethod} onChange={e => setTrxMethod(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors shadow-sm w-full sm:w-auto">
                <option value="">Semua Metode</option>
                <option value="qris">QRIS/E-Wallet</option>
                <option value="cash">Cash (Tunai)</option>
              </select>
            </>
          )}

          <select 
            value={activeTab === 'attendances' ? attType : status}
            onChange={(e) => {
              if (activeTab === 'attendances') setAttType(e.target.value);
              else setStatus(e.target.value);
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-primary focus:border-primary transition-colors shadow-sm w-full sm:w-auto"
          >
            {activeTab === 'members' && (
              <>
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="expired">Expired</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="belum_aktif">Belum Aktif</option>
              </>
            )}
            {activeTab === 'transactions' && (
              <>
                <option value="">Semua Status</option>
                <option value="pending">Menunggu Konfirmasi</option>
                <option value="lunas">Lunas</option>
                <option value="batal">Dibatalkan</option>
              </>
            )}
            {activeTab === 'attendances' && (
              <>
                <option value="">Semua Tipe</option>
                <option value="member">Member</option>
                <option value="guest">Guest</option>
              </>
            )}
          </select>

          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
            title="Cetak Laporan Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak Laporan Excel</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === 'members' && (
            <>
              <table className="w-full text-xs text-left text-foreground/80">
                <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-center">Member</th>
                    <th className="px-4 py-3 text-center">Kontak</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Expired</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border relative">
                  {isLoading && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-foreground/50">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!isLoading && dataList.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-foreground/50">
                        Data tidak ditemukan
                      </td>
                    </tr>
                  )}
                  {!isLoading && dataList.map(member => (
                    <tr key={member.idMember} className="hover:bg-background/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {member.photo ? (
                            <img src={`http://localhost:8000/storage/${member.photo}`} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-foreground text-sm">{member.name}</div>
                            <div className="text-[10px] text-foreground/50">{member.member_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-xs text-foreground">{member.phone}</div>
                        <div className="text-[10px] text-foreground/50">{member.email}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          member.membership_status === 'Aktif' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : member.membership_status === 'Expired'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {member.membership_status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-center text-xs ${member.membership_status === 'Expired' ? 'text-red-500 font-medium' : ''}`}>
                        {member.end_date ? new Date(member.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <button onClick={() => handleView(member)} className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded transition-colors" title="Lihat Profil">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              <div className="flex justify-between items-center px-4 py-3 bg-background border-t border-border">
                <span className="text-xs text-foreground/60">
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={page === 1}
                    className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50 hover:bg-border/50 transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button 
                    onClick={handleNextPage} 
                    disabled={page === totalPages}
                    className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50 hover:bg-border/50 transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'transactions' && (
            <>
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-center">Invoice</th>
                  <th className="px-4 py-2 text-center">Tanggal</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-center">Tipe</th>
                  <th className="px-4 py-2 text-center">Metode</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                  {isLoading && (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-foreground/50">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!isLoading && dataList.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-foreground/50">
                        Data tidak ditemukan
                      </td>
                    </tr>
                  )}
                {!isLoading && dataList.map(trx => (
                  <tr key={trx.idPayment} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{trx.invoice}</td>
                    <td className="px-4 py-3 text-center text-foreground">{trx.created_at}</td>
                    <td className="px-4 py-3 text-left text-foreground">{trx.member_name}</td>
                    <td className="px-4 py-3 text-center text-foreground">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        trx.customer_type === 'Member' 
                        ? 'bg-primary/10 text-primary border-primary/20' 
                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                        {trx.customer_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {trx.method}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        trx.status === 'Lunas' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : trx.status === 'Dibatalkan'
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-between w-full font-medium text-foreground">
                        <span>Rp</span>
                        <span>{formatRupiahCustom(trx.amount)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-4 py-3 bg-background border-t border-border">
              <span className="text-xs text-foreground/60">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={handlePrevPage} 
                  disabled={page === 1}
                  className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50 hover:bg-border/50 transition-colors"
                >
                  Sebelumnya
                </button>
                <button 
                  onClick={handleNextPage} 
                  disabled={page === totalPages}
                  className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50 hover:bg-border/50 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
            </>
          )}

          {activeTab === 'attendances' && (
            <>
            <table className="w-full text-xs text-left text-foreground/80">
              <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-4 py-2 text-center">Nama</th>
                  <th className="px-4 py-2 text-center">Nomor HP</th>
                  <th className="px-4 py-2 text-center">Tipe</th>
                  <th className="px-4 py-2 text-center">Member Code</th>
                  <th className="px-4 py-2 text-center">Waktu Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                  {isLoading && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-foreground/50">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!isLoading && dataList.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-foreground/50">
                        Data tidak ditemukan
                      </td>
                    </tr>
                  )}
                {!isLoading && dataList.map(att => (
                  <tr key={att.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-2 text-left">{att.name}</td>
                    <td className="px-4 py-2 text-center text-foreground/60">{att.phone}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        att.type === 'Member' 
                        ? 'bg-blue-500/10 text-blue-500' 
                        : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {att.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-foreground/60">{att.code}</td>
                    <td className="px-4 py-2 text-left">{att.checkin_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-4 py-3 bg-background border-t border-border">
              <span className="text-xs text-foreground/60">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={handlePrevPage} 
                  disabled={page === 1}
                  className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50 hover:bg-border/50 transition-colors"
                >
                  Sebelumnya
                </button>
                <button 
                  onClick={handleNextPage} 
                  disabled={page === totalPages}
                  className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50 hover:bg-border/50 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
            </>
          )}
        </div>
      </div>

      {/* --- MODAL VIEW MEMBER (Read-Only) --- */}
      {isViewModalOpen && selectedMember && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold text-foreground">Profil Member</h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-2 text-center pb-2">
                {selectedMember.photo ? (
                  <img src={`http://localhost:8000/storage/${selectedMember.photo}`} alt={selectedMember.name} className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-inner mb-2" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary font-bold text-4xl shadow-inner mb-2">
                    {selectedMember.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedMember.name}</h2>
                  <p className="text-sm text-foreground/50 font-medium">{selectedMember.member_code}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm bg-background/50 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-3 text-foreground/80">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{selectedMember.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/80">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{selectedMember.email}</span>
                </div>
                <div className="flex items-start gap-3 text-foreground/80">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{selectedMember.address}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/80 pt-2 border-t border-border">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Bergabung: <strong className="text-foreground">{selectedMember.join_date ? new Date(selectedMember.join_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</strong></span>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Status Membership</p>
                  <p className={`text-sm font-bold ${
                    selectedMember.membership_status === 'Aktif' 
                    ? 'text-green-500' 
                    : selectedMember.membership_status === 'Expired' 
                    ? 'text-red-500' 
                    : 'text-yellow-500'
                  }`}>
                    {selectedMember.membership_status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Berlaku Sampai</p>
                  <p className="text-sm font-bold text-foreground">
                    {selectedMember.end_date ? new Date(selectedMember.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-background/50 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL EXPORT EXCEL --- */}
      {isExportModalOpen && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={closeModal}></div>
          <div className="relative bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-green-500/10">
              <h3 className="font-bold text-green-500 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" /> Cetak Excel
              </h3>
              <button onClick={closeModal} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground/70">Pilih filter untuk data <strong className="text-foreground">{activeTab === 'members' ? 'Member' : activeTab === 'transactions' ? 'Transaksi' : 'Kehadiran'}</strong> yang ingin dicetak:</p>
              
              <div className="space-y-3">
                {activeTab === 'members' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Status Member</label>
                    <select 
                      value={exportMemberStatus}
                      onChange={(e) => setExportMemberStatus(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="all">Semua Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="expired">Expired</option>
                      <option value="nonaktif">Nonaktif</option>
                      <option value="belum_aktif">Belum Aktif</option>
                    </select>
                  </div>
                )}

                {(activeTab === 'transactions' || activeTab === 'attendances') && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">Periode</label>
                      <select 
                        value={exportPeriod}
                        onChange={(e) => setExportPeriod(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                        <option value="today">Hari Ini</option>
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                        <option value="6months">6 Bulan Terakhir</option>
                        <option value="year">Tahun Ini</option>
                        <option value="all">Semua Data</option>
                        <option value="custom">Custom Tanggal</option>
                      </select>
                    </div>
                    {exportPeriod === 'custom' && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-foreground/70 uppercase">Dari Tanggal</label>
                          <input 
                            type="date" 
                            value={exportStartDate}
                            onChange={(e) => setExportStartDate(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:ring-green-500 focus:border-green-500 transition-colors dark:[color-scheme:dark]" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-foreground/70 uppercase">Sampai Tanggal</label>
                          <input 
                            type="date" 
                            value={exportEndDate}
                            onChange={(e) => setExportEndDate(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:ring-green-500 focus:border-green-500 transition-colors dark:[color-scheme:dark]" 
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-border bg-background/50 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 bg-background border border-border text-foreground hover:bg-border/50 rounded-lg text-sm font-medium transition-colors">
                Batal
              </button>
              <button 
                onClick={handleDownload} 
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              >
                <Download className="w-4 h-4" /> Unduh Laporan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default DataView;
