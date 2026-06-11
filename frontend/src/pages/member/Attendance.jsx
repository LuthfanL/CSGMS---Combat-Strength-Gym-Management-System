import { motion } from 'framer-motion';
import { History, CalendarDays, Clock, MapPin, Activity, CalendarCheck } from 'lucide-react';

const MemberAttendance = () => {
  const attendances = [
    { id: 1, date: "10 Jun 2026", time: "16:45 WIB", status: "Hadir" },
    { id: 2, date: "08 Jun 2026", time: "17:10 WIB", status: "Hadir" },
    { id: 3, date: "05 Jun 2026", time: "09:30 WIB", status: "Hadir" },
    { id: 4, date: "03 Jun 2026", time: "18:05 WIB", status: "Hadir" },
    { id: 5, date: "01 Jun 2026", time: "16:20 WIB", status: "Hadir" },
  ];

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
            <p className="text-2xl font-bold">42 <span className="text-sm font-normal text-foreground/60">kali</span></p>
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
            <p className="text-2xl font-bold">3<span className="text-sm font-normal text-foreground/60">x / minggu</span></p>
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
            <p className="text-lg font-bold mt-1">10 Jun 2026</p>
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
