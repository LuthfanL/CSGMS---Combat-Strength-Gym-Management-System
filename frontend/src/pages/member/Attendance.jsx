import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, CalendarDays, Clock, MapPin, Activity, CalendarCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const MemberAttendance = () => {
  const { token } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [stats, setStats] = useState({ total: 0, avg_per_week: 0, last_visit: '-' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const res = await fetch(`${API_URL}/member/attendances`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await res.json();
        
        if (res.ok) {
          setAttendances(data.attendances || []);
          setStats(data.stats || { total: 0, avg_per_week: 0, last_visit: '-' });
        } else {
          setError(data.message || 'Gagal mengambil data kehadiran');
        }
      } catch (err) {
        setError('Terjadi kesalahan koneksi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendances();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-foreground/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p>Memuat riwayat kehadiran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl">
        <p className="font-bold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Kehadiran</h1>
          <p className="text-foreground/60">Catatan aktivitas kunjungan Anda di gym.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Kunjungan */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-foreground/60">Total Kunjungan</p>
            <p className="text-2xl font-bold">{stats.total} <span className="text-sm font-normal text-foreground/60">kali</span></p>
          </div>
        </motion.div>

        {/* Rata-rata Kunjungan */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Activity className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-foreground/60">Rata-rata Latihan</p>
            <p className="text-2xl font-bold">{stats.avg_per_week}<span className="text-sm font-normal text-foreground/60">x / minggu</span></p>
          </div>
        </motion.div>

        {/* Kunjungan Terakhir */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CalendarCheck className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-foreground/60">Terakhir Hadir</p>
            <p className="text-lg font-bold mt-1">{stats.last_visit}</p>
          </div>
        </motion.div>
      </div>

      {/* List/Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl shadow-sm p-6"
      >
        <h3 className="font-bold text-lg mb-6">Aktivitas Terakhir</h3>
        
        <div className="relative border-l-2 border-border ml-3 space-y-8">
          {attendances.map((record, index) => (
            <div key={record.id} className="relative pl-6">
              {/* Dot */}
              <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 border-4 border-card"></div>
              
              <div className="bg-background border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-base">Combat Strength Gym</p>
                      <p className="text-sm text-foreground/60">Check-in Berhasil</p>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 mt-2 sm:mt-0 text-sm">
                    <div className="flex items-center gap-1.5 font-medium">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {record.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground/60">
                      <Clock className="h-4 w-4" />
                      {record.time}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {attendances.length === 0 && (
            <p className="text-center text-foreground/50 py-8">Belum ada riwayat kehadiran.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MemberAttendance;
