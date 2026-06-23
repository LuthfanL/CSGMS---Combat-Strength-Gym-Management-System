import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileJson, Loader2, History, X, ChevronLeft, ChevronRight, FilterX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const AuditLogs = () => {
  const { token } = useAuth();
  
  // Data states
  const [logs, setLogs] = useState([]);
  const [modules, setModules] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    document.title = "Audit Logs - CSGMS";
  }, []);

  // Fetch unique modules for the dropdown filter
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await fetch(`${API_URL}/owner/audit-logs/modules`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          setModules(data);
        }
      } catch (err) {
        console.error("Failed to load modules:", err);
      }
    };
    fetchModules();
  }, [token]);

  // Fetch logs based on filters & pagination
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      if (search) params.append('search', search);
      if (moduleFilter) params.append('module', moduleFilter);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetch(`${API_URL}/owner/audit-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Gagal memuat audit log');

      const data = await res.json();
      setLogs(data.data || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
      });
    } catch {
      toast.error('Gagal memuat data audit log.');
    } finally {
      setIsLoading(false);
    }
  }, [token, search, moduleFilter, startDate, endDate, currentPage]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchLogs();
    }, 500); 

    return () => clearTimeout(debounce);
  }, [fetchLogs]);

  // Handle filter changes (reset page to 1)
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setModuleFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('id-ID', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('id-ID', { hour12: false });
    return `${day}-${month}-${year}, ${time}`;
  };

  const getModuleStyle = (moduleName) => {
    const map = {
      'pembayaran': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'pengaturan': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'membership': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'admin': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      'package': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      'auth': 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return map[moduleName?.toLowerCase()] || 'bg-foreground/10 text-foreground border-border';
  };

  return (
    <div className="space-y-4 relative pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Riwayat Audit (Audit Logs)</h1>
        <p className="text-foreground/70 text-xs">Lacak semua aktivitas dan perubahan data yang dilakukan di dalam sistem.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Cari Aktivitas</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
              <input 
                type="text" 
                placeholder="Cari kata kunci..." 
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                className="pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-xs w-full focus:ring-primary focus:border-primary text-foreground"
              />
            </div>
          </div>
          
          {/* Module Filter */}
          <div className="w-full md:w-48">
            <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Modul</label>
            <select 
              value={moduleFilter}
              onChange={(e) => handleFilterChange(setModuleFilter, e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-xs w-full focus:ring-primary focus:border-primary text-foreground"
            >
              <option value="">Semua Modul</option>
              {modules.map((m, i) => (
                <option key={i} value={m} className="capitalize">{m}</option>
              ))}
            </select>
          </div>

          {/* Date Filters */}
          <div className="w-full md:w-40">
            <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-xs w-full focus:ring-primary focus:border-primary text-foreground dark:[color-scheme:dark]"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-[10px] font-bold text-foreground/70 mb-1 uppercase tracking-wider">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-xs w-full focus:ring-primary focus:border-primary text-foreground dark:[color-scheme:dark]"
            />
          </div>

          {/* Clear Filters */}
          <button 
            onClick={clearFilters}
            className="p-2 bg-background hover:bg-foreground/5 border border-border rounded-lg text-foreground/70 hover:text-foreground transition-colors flex items-center justify-center shrink-0"
            title="Reset Filter"
          >
            <FilterX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline/Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center">Waktu</th>
                <th className="px-4 py-3 text-center">Pengguna</th>
                <th className="px-4 py-3 text-center">Modul</th>
                <th className="px-4 py-3 text-center">Aktivitas</th>
                <th className="px-4 py-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-sm text-foreground/50">Memuat data audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <History className="w-10 h-10 text-foreground/20" />
                      <span className="text-sm text-foreground/50">
                        Belum ada data audit log yang sesuai.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.idAudit} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-center text-foreground">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{log.user?.name || 'Sistem'}</div>
                      <div className="text-[10px] text-foreground/50">{log.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`${getModuleStyle(log.module)} px-2 py-0.5 rounded text-[10px] font-medium border capitalize`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(log.old_data || log.new_data) && (
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="text-foreground/50 hover:text-primary transition-colors p-1" 
                          title="Lihat Data JSON"
                        >
                          <FileJson className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && pagination.last_page > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-background/50">
            <span className="text-xs text-foreground/60">
              Halaman <strong className="text-foreground">{pagination.current_page}</strong> dari <strong className="text-foreground">{pagination.last_page}</strong>
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={pagination.current_page === 1}
                className="p-1.5 rounded bg-card border border-border text-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Pagination Numbers (simplified for demo: showing all or up to 5) */}
              {Array.from({ length: Math.min(5, pagination.last_page) }).map((_, idx) => {
                let pageNum = idx + 1;
                // Shift window if current page is far
                if (pagination.last_page > 5 && pagination.current_page > 3) {
                  pageNum = pagination.current_page - 2 + idx;
                  if (pageNum > pagination.last_page) pageNum = pagination.last_page - (4 - idx);
                }
                
                if (pageNum > pagination.last_page) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                      pagination.current_page === pageNum
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-card border border-border text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                disabled={pagination.current_page === pagination.last_page}
                className="p-1.5 rounded bg-card border border-border text-foreground hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Viewer Modal */}
      {selectedLog && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-black/70" onClick={() => setSelectedLog(null)}></div>
          <div className="relative bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-black/5 dark:bg-white/5 shrink-0">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <FileJson className="w-4 h-4 text-primary" />
                Detail Log: <span className="capitalize">{selectedLog.action}</span>
              </h3>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {selectedLog.old_data && Object.keys(selectedLog.old_data).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-red-500 mb-2 uppercase tracking-wider">Data Lama (Old Data)</h4>
                  <pre className="bg-background border border-border p-4 rounded-lg text-xs text-foreground/80 overflow-x-auto">
                    {JSON.stringify(selectedLog.old_data, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.new_data && Object.keys(selectedLog.new_data).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-green-500 mb-2 uppercase tracking-wider">Data Baru (New Data)</h4>
                  <pre className="bg-background border border-border p-4 rounded-lg text-xs text-foreground/80 overflow-x-auto">
                    {JSON.stringify(selectedLog.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AuditLogs;
