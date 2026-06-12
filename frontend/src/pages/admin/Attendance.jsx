import React, { useState, useEffect } from 'react';
import { Search, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000/api';

const AdminAttendance = () => {
  const { token } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAttendances = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/attendances`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Gagal memuat data kehadiran');
      const data = await res.json();
      setAttendances(data.attendances);
    } catch (error) {
      if (!isBackground) toast.error(error.message);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
    const intervalId = setInterval(() => {
      fetchAttendances(true);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [token]);

  let filteredAttendances = [...attendances];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredAttendances = filteredAttendances.filter(a => {
      const name = a.type === 'member' ? a.member?.name : a.guest?.name;
      const code = a.type === 'member' ? a.member?.code : '';
      return (name?.toLowerCase() || '').includes(q) || (code?.toLowerCase() || '').includes(q);
    });
  }

  if (typeFilter !== 'semua') {
    filteredAttendances = filteredAttendances.filter(a => a.type.toLowerCase() === typeFilter);
  }

  if (startDate) {
    filteredAttendances = filteredAttendances.filter(a => {
      const checkinDate = new Date(a.checkin_time).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      return checkinDate >= start;
    });
  }

  if (endDate) {
    filteredAttendances = filteredAttendances.filter(a => {
      const checkinDate = new Date(a.checkin_time).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);
      return checkinDate <= end;
    });
  }

  const renderTableRows = () => {
    if (filteredAttendances.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="px-6 py-12 text-center text-foreground/50">
            {isLoading ? 'Memuat data...' : 'Belum ada data kehadiran.'}
          </td>
        </tr>
      );
    }

    return filteredAttendances.map((attendance) => {
      const isMember = attendance.type === 'member';
      const name = isMember ? attendance.member?.name : attendance.guest?.name;
      const code = isMember ? attendance.member?.code : 'GUEST';
      const phone = isMember ? attendance.member?.phone : attendance.guest?.phone;
      
      const checkinDate = new Date(attendance.checkin_time);
      const dateStr = checkinDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const timeStr = checkinDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      return (
        <tr key={attendance.id} className="hover:bg-background/50 transition-colors">
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-foreground/50" />
              {dateStr}
            </div>
            <div className="text-xs text-foreground/50 mt-1">{timeStr}</div>
          </td>
          <td className="px-4 py-3">
            <div className="font-medium text-foreground">{name || '-'}</div>
            <div className="text-[10px] text-foreground/50">{code}</div>
          </td>
          <td className="px-4 py-3">
            <div className="text-sm text-foreground">{phone || '-'}</div>
          </td>
          <td className="px-4 py-3 text-center">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
              isMember 
                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            }`}>
              {attendance.type}
            </span>
          </td>
        </tr>
      );
    });
  };

  if (isLoading && attendances.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pb-4">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Data Kehadiran</h1>
          <p className="text-foreground/70 text-xs">Pantau riwayat check-in member dan guest.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-end gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/50" />
              <input
                type="text"
                placeholder="Cari nama atau ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 h-[38px] bg-background border border-border rounded-lg text-sm w-full focus:ring-primary focus:border-primary text-foreground transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 hidden sm:block">Dari:</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border border-border rounded-lg px-2 py-2 h-[38px] text-sm text-foreground focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 hidden sm:block">S/d:</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background border border-border rounded-lg px-2 py-2 h-[38px] text-sm text-foreground focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 h-[38px] text-sm text-foreground focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="semua">Semua Tipe</option>
              <option value="member">Member</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3 text-center">Waktu Check-in</th>
                <th className="px-4 py-3 text-center">Nama Pengunjung</th>
                <th className="px-4 py-3 text-center">No. Handphone</th>
                <th className="px-4 py-3 text-center">Tipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {renderTableRows()}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex justify-between items-center text-xs text-foreground/50">
          <span>Menampilkan {filteredAttendances.length} data kehadiran</span>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
