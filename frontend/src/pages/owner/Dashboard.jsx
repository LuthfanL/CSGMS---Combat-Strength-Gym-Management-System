import { useState, useEffect } from 'react';
import { Users, UserPlus, CreditCard, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

// Reusable Stat Card
const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }) => (
  <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-primary/10 text-primary rounded-xl">
        <Icon className="h-6 w-6" />
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
      <p className="text-sm font-medium text-foreground/80 mb-1">{title}</p>
      <p className="text-xs text-foreground/50">{subtitle}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard Owner - CSGMS";
    
    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/owner/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchDashboard();
  }, [token]);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col h-full space-y-6 pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ringkasan Hari Ini</h1>
          <p className="text-foreground/70 text-xs">Overview operasional gym Anda hari ini.</p>
        </div>
        <div className="flex justify-center items-center h-[200px] text-foreground/50">
          Memuat data dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Ringkasan Hari Ini</h1>
        <p className="text-foreground/70 text-xs">Overview operasional gym Anda hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Pendapatan Hari Ini" 
          value={`Rp ${Number(data.summary.revenue.value).toLocaleString('id-ID')}`} 
          subtitle={`Dari ${data.summary.revenue.memberTransactions} member & ${data.summary.revenue.guestTransactions} guest`}
          icon={CreditCard}
          trend={data.summary.revenue.trend}
          trendValue={`${data.summary.revenue.trendValue}%`}
        />
        <StatCard 
          title="Kehadiran Member" 
          value={data.summary.memberAttendance.value} 
          subtitle="Orang check-in hari ini"
          icon={Users}
          trend={data.summary.memberAttendance.trend}
          trendValue={`${data.summary.memberAttendance.trendValue}%`}
        />
        <StatCard 
          title="Kehadiran Guest" 
          value={data.summary.guestAttendance.value} 
          subtitle="Orang check-in hari ini"
          icon={UserPlus}
          trend={data.summary.guestAttendance.trend}
          trendValue={`${data.summary.guestAttendance.trendValue}%`}
        />
        <StatCard 
          title="Total Member Aktif" 
          value={data.summary.activeMembers.value} 
          subtitle={`${data.summary.activeMembers.expiringSoon} member akan expired dalam 3 hari`}
          icon={Activity}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[280px]">
        {/* Attendance Chart */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-foreground mb-2">Grafik Kehadiran (7 Hari Terakhir)</h3>
          <div className="w-full flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.attendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                <Bar dataKey="Member" fill="var(--accent-neon)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Guest" fill="#71717a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-foreground mb-2">Tren Pendapatan Bulanan</h3>
          <div className="w-full flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.revenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-neon)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-neon)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `Rp ${value/1000000}M`}
                />
                <Tooltip 
                  formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="Total" stroke="var(--accent-neon)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
