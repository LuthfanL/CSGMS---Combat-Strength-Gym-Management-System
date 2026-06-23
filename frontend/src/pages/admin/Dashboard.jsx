import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, CreditCard, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, alert = false }) => (
  <div className={`bg-card p-4 rounded-xl border ${alert ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-border shadow-sm'}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-medium text-foreground/70 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${alert ? 'text-red-500' : 'text-foreground'}`}>{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${alert ? 'bg-red-500/10' : 'bg-primary/10'}`}>
        <Icon className={`w-5 h-5 ${alert ? 'text-red-500' : 'text-primary'}`} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      {trend && (
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
          trend === 'up' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
        }`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </span>
      )}
      <p className="text-[10px] text-foreground/50">{subtitle}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();

    // Polling every 10 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [token]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-foreground/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p>Memuat data dashboard...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col h-full space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-foreground/70 text-xs">Ringkasan operasional dan tugas yang memerlukan perhatian Anda hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Member Check-in" 
          value={data.metrics.member_checkin} 
          subtitle="Hari ini"
          icon={Users}
        />
        <StatCard 
          title="Guest Check-in" 
          value={data.metrics.guest_checkin} 
          subtitle="Hari ini"
          icon={UserPlus}
        />
        <StatCard 
          title="Pendapatan Lunas" 
          value={`Rp ${Number(data.metrics.revenue_today).toLocaleString('id-ID')}`} 
          subtitle="Hari ini"
          icon={CreditCard}
        />
        <StatCard 
          title="Peringatan Expired" 
          value={data.metrics.expiring_count} 
          subtitle="Member expired dalam 7 hari"
          icon={AlertCircle}
          alert={data.metrics.expiring_count > 0}
        />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        
        {/* Pending Payments */}
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              Menunggu Konfirmasi Pembayaran
            </h3>
            {data.pending_payments.length > 0 && (
              <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/20 animate-pulse">
                {data.pending_payments.length} Transaksi Baru
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-auto">
            {data.pending_payments.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead className="text-foreground/70 border-b border-border">
                  <tr>
                    <th className="pb-2 font-medium text-center">Invoice</th>
                    <th className="pb-2 font-medium text-center">Member</th>
                    <th className="pb-2 font-medium text-center">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.pending_payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-background/50 transition-colors">
                      <td className="py-2.5 font-medium text-foreground">{payment.invoice}</td>
                      <td className="py-2.5 text-foreground/80">{payment.member}</td>
                      <td className="py-2.5 font-medium text-primary">
                        <div className="flex justify-between w-full">
                          <span>Rp</span>
                          <span>{Number(payment.amount).toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-foreground/50 text-xs">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2 opacity-50" />
                <p>Tidak ada transaksi yang menunggu konfirmasi</p>
              </div>
            )}
          </div>
          <Link to="/admin/payments" className="mt-2 block w-full text-center text-[10px] text-foreground/50 hover:text-primary transition-colors">Lihat Semua Transaksi →</Link>
        </div>

        {/* Expiring Memberships */}
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Membership Segera Expired
            </h3>
          </div>
          
          <div className="flex-1 overflow-auto">
            {data.expiring_members.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead className="text-foreground/70 border-b border-border">
                  <tr>
                    <th className="pb-2 font-medium text-center">Member</th>
                    <th className="pb-2 font-medium text-center">NOMOR HP</th>
                    <th className="pb-2 font-medium text-center">Tgl Expired</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.expiring_members.map((member) => (
                    <tr key={member.id} className="hover:bg-background/50 transition-colors">
                      <td className="py-2.5 font-medium text-foreground flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold uppercase">
                          {member.name.charAt(0)}
                        </div>
                        {member.name}
                      </td>
                      <td className="py-2.5 text-foreground/80 text-center">{member.phone}</td>
                      <td className={`py-2.5 text-center font-bold ${
                        member.diff_days === 0 || member.diff_days === 1 ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        {member.status_days}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-foreground/50 text-xs">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2 opacity-50" />
                <p>Semua member dalam masa aktif yang aman</p>
              </div>
            )}
          </div>
          <Link to="/admin/members" className="mt-2 block w-full text-center text-[10px] text-foreground/50 hover:text-primary transition-colors">Lihat Semua Member →</Link>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
