import { useEffect } from 'react';
import { Users, UserPlus, CreditCard, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

// Dummy Data
const attendanceData = [
  { name: 'Senin', Member: 45, Guest: 12 },
  { name: 'Selasa', Member: 52, Guest: 8 },
  { name: 'Rabu', Member: 38, Guest: 15 },
  { name: 'Kamis', Member: 60, Guest: 10 },
  { name: 'Jumat', Member: 65, Guest: 20 },
  { name: 'Sabtu', Member: 85, Guest: 30 },
  { name: 'Minggu', Member: 70, Guest: 25 },
];

const revenueData = [
  { name: 'Jan', Total: 4000000 },
  { name: 'Feb', Total: 3000000 },
  { name: 'Mar', Total: 5000000 },
  { name: 'Apr', Total: 4500000 },
  { name: 'Mei', Total: 6000000 },
  { name: 'Jun', Total: 7500000 },
];

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
  useEffect(() => {
    document.title = "Dashboard Owner - CSGMS";
  }, []);

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
          value="Rp 1.250.000" 
          subtitle="Dari 5 member baru & 12 guest"
          icon={CreditCard}
          trend="up"
          trendValue="15%"
        />
        <StatCard 
          title="Kehadiran Member" 
          value="45" 
          subtitle="Orang check-in hari ini"
          icon={Users}
          trend="up"
          trendValue="5%"
        />
        <StatCard 
          title="Kehadiran Guest" 
          value="12" 
          subtitle="Orang check-in hari ini"
          icon={UserPlus}
          trend="down"
          trendValue="2%"
        />
        <StatCard 
          title="Total Member Aktif" 
          value="128" 
          subtitle="5 member akan expired dalam 3 hari"
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
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
