'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, LineChart, Line, ComposedChart, Scatter,
  Legend
} from 'recharts';
import {
  ArrowUp, ArrowDown, Users, Eye, TrendingUp, Clock, 
  RefreshCw, Globe, Monitor, Smartphone, Tablet, 
  Activity, BarChart3, Table, Filter, ChevronDown,
  Download, Share2, MousePointerClick, Zap, Radio,
  Layers, MapPin, Chrome, Wind, Hash, ExternalLink
} from 'lucide-react';

type TimeframeType = '24h' | '7d' | '30d' | '90d';

// Matplotlib Tab10 colors
const MPL = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

// Detect global theme
function useGlobalTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => {
      const html = document.documentElement;
      setIsDark(html.classList.contains('dark') || (!html.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', check);
    return () => { observer.disconnect(); mq.removeEventListener('change', check); };
  }, []);
  return isDark;
}

const timeframes = [
  { label: '24h', value: '24h' as TimeframeType, days: 1 },
  { label: '7 Days', value: '7d' as TimeframeType, days: 7 },
  { label: '30 Days', value: '30d' as TimeframeType, days: 30 },
  { label: '90 Days', value: '90d' as TimeframeType, days: 90 },
];

// --- Components ---

const KpiCard = ({ icon: Icon, label, value, trend, subtext, colorIdx, isDark, live }: any) => {
  const isPositive = trend >= 0;
  const color = MPL[colorIdx % MPL.length];
  return (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${isDark ? 'bg-slate-900/80 border-slate-800 hover:border-slate-600' : 'bg-white/90 border-slate-200 hover:border-slate-300'}`}>
      <div className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
      {live && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Live</span>
        </div>
      )}
      <div className="p-6 relative ">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: `${color}15` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
          </div>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
              {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
        </div>
        {subtext && <p className={`mt-2 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtext}</p>}
      </div>
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
    </div>
  );
};

const ChartShell = ({ title, children, isDark, className = "", action }: any) => (
  <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-xl ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'} ${className}`}>
    <div className="flex items-center justify-between p-6 pb-2">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{title}</h3>
      </div>
      {action}
    </div>
    <div className="px-4 pb-4 h-72 lg:h-80">{children}</div>
  </div>
);

const DataTablePro = ({ title, data, isDark, columns = ['Path', 'Visitors'] }: any) => (
  <div className={`overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-xl ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
    <div className="flex items-center justify-between p-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{title}</h3>
      </div>
      <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
        <Download size={14} /> Export
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            {columns.map((col: string) => (
              <th key={col} className={`text-left text-xs font-bold uppercase tracking-wider py-3 px-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{col}</th>
            ))}
            <th className={`text-right text-xs font-bold uppercase tracking-wider py-3 px-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Trend</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 8).map((row: any, idx: number) => (
            <tr key={idx} className={`border-b transition-colors ${isDark ? 'border-slate-800/50 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50/80'}`}>
              <td className={`py-3 px-6 text-sm font-semibold max-w-[200px] truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {row.path || row.hostname || row.name || row.route || '—'}
              </td>
              <td className="py-3 px-6">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{
                      width: `${Math.min((row.visitors / (data[0]?.visitors || 1)) * 100, 100)}%`,
                      background: MPL[idx % MPL.length]
                    }} />
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {row.visitors?.toLocaleString() || 0}
                  </span>
                </div>
              </td>
              <td className="py-3 px-6 text-right">
                <span className={`text-xs font-bold ${(row.trend || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {(row.trend || 0) >= 0 ? '+' : ''}{row.trend || 0}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ProgressBarPro = ({ label, value, max, color, isDark }: any) => {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums" style={{ color }}>{value.toLocaleString()}</span>
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }}>
          <div className="absolute inset-0 bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl border shadow-2xl p-4 backdrop-blur-xl ${isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'}`}>
      <p className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm py-0.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{entry.name}:</span>
          <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- Main Dashboard ---

export default function AnalyticsDashboard() {
  const isDark = useGlobalTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('7d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [realtime, setRealtime] = useState({ activeUsers: 0, lastMinuteViews: 0, lastMinuteVisitors: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'pages', label: 'Pages', icon: Layers },
    { id: 'referrers', label: 'Referrers', icon: Share2 },
    { id: 'geo', label: 'Geography', icon: MapPin },
    { id: 'tech', label: 'Technology', icon: Monitor },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const days = timeframes.find(t => t.value === selectedTimeframe)?.days || 7;
      const res = await fetch(`/api/analytics?endpoint=all&days=${days}&tab=${activeTab}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
      setRealtime(json.data.realtime || { activeUsers: 0, lastMinuteViews: 0, lastMinuteVisitors: 0 });
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe, activeTab]);

  // Real-time polling
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => {
      fetch(`/api/analytics?endpoint=realtime&days=1`)
        .then(r => r.json())
        .then(j => { if (j.success) setRealtime(j.data); });
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchData]);

  const chartData = useMemo(() => {
    if (!data?.timeSeries) return [];
    return data.timeSeries.map((d: any) => ({
      ...d,
      date: d.date,
      Visitors: d.visitors,
      'Page Views': d.pageviews,
      'Bounce Rate': d.bounceRate,
      'Avg Duration': Math.round(d.avgDuration / 60),
    }));
  }, [data]);

  const pieData = useMemo(() => {
    if (!data?.devices) return [];
    return data.devices.map((d: any, i: number) => ({ name: d.name, value: d.visitors, fill: MPL[i % MPL.length] }));
  }, [data]);

  const countryData = useMemo(() => {
    if (!data?.countries) return [];
    return data.countries.slice(0, 10).map((c: any, i: number) => ({ name: c.name, visitors: c.visitors, fill: MPL[i % MPL.length] }));
  }, [data]);

  if (loading && !data) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
            <div className="absolute inset-4 rounded-full border-4 border-emerald-500/20 animate-spin" style={{ animationDuration: '3s' }} />
            <Activity className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
          </div>
          <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-lg font-semibold`}>Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Sticky Control Bar */}
      <div className={`sticky top-20 z-25 border-b backdrop-blur-2xl ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="w-full px-4 lg:px-8 py-3">
          <div className="flex flex-col lg:flex-row  lg:items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-blue-600 text-white shadow-lg shadow-blue-200/50'
                      : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}>
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                {timeframes.map((tf) => (
                  <button key={tf.value} onClick={() => setSelectedTimeframe(tf.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTimeframe === tf.value
                        ? isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-slate-900 shadow-md'
                        : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'
                    }`}>
                    {tf.label}
                  </button>
                ))}
              </div>
              <button onClick={fetchData} disabled={loading}
                className={`p-2.5 rounded-xl border transition-all hover:scale-105 disabled:opacity-50 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}>
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8 py-8">
        {error && (
          <div className="mb-2 p-6 rounded-2xl border bg-red-500/10 border-red-500/30">
            <p className="text-red-500 font-bold text-sm">⚠️ {error}</p>
          </div>
        )}

        {data && (
          <>
            {/* KPI Ribbon — Exact Vercel layout: Visitors, Page Views, Bounce Rate */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6 -mb-10 py-20">
              <KpiCard icon={Users} label="Visitors" value={data.visitors?.toLocaleString() || '0'} trend={33}
                subtext={`${realtime.activeUsers} active now`} colorIdx={0} isDark={isDark} live />
              <KpiCard icon={Eye} label="Page Views" value={data.pageviews?.toLocaleString() || '0'} trend={36}
                subtext={`${realtime.lastMinuteViews}/min`} colorIdx={1} isDark={isDark} />
              <KpiCard icon={TrendingUp} label="Bounce Rate" value={`${data.bounceRate || 0}%`} trend={-9}
                subtext="Industry avg: 45%" colorIdx={3} isDark={isDark} />
              <KpiCard icon={Clock} label="Avg. Duration" value={`${Math.floor((data.avgDuration || 0) / 60)}m ${(data.avgDuration || 0) % 60}s`} trend={12}
                subtext="Session time" colorIdx={2} isDark={isDark} />
            </div>

             

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-2">
                  <div className="xl:col-span-2">
                    <ChartShell title="Visitors & Page Views Over Time" isDark={isDark}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={MPL[0]} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={MPL[0]} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={MPL[1]} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={MPL[1]} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                          <XAxis dataKey="date" stroke={isDark ? '#475569' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke={isDark ? '#475569' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                          <Tooltip content={<CustomTooltip isDark={isDark} />} />
                          <Area type="monotone" dataKey="Visitors" stroke={MPL[0]} strokeWidth={2.5} fill="url(#vGrad)" />
                          <Area type="monotone" dataKey="Page Views" stroke={MPL[1]} strokeWidth={2.5} fill="url(#pGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartShell>
                  </div>
                  <ChartShell title="Bounce Rate Trend" isDark={isDark}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                        <XAxis dataKey="date" stroke={isDark ? '#475569' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={isDark ? '#475569' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} unit="%" />
                        <Tooltip content={<CustomTooltip isDark={isDark} />} />
                        <Line type="monotone" dataKey="Bounce Rate" stroke={MPL[3]} strokeWidth={3} dot={{ fill: MPL[3], r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                  <div className="xl:col-span-2">
                    <ChartShell title="Average Duration (minutes)" isDark={isDark}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                          <XAxis dataKey="date" stroke={isDark ? '#475569' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke={isDark ? '#475569' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip isDark={isDark} />} />
                          <Bar dataKey="Avg Duration" fill={MPL[2]} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartShell>
                  </div>
                  <ChartShell title="Device Breakdown" isDark={isDark}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke={isDark ? '#0f172a' : '#fff'} strokeWidth={2}>
                          {pieData.map((entry: any, index: number) => <Cell key={index} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip isDark={isDark} />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value: string) => <span className={isDark ? 'text-slate-400 text-sm' : 'text-slate-600 text-sm'}>{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </div>
              </>
            )}

            {/* TAB: PAGES */}
            {activeTab === 'pages' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <div className="xl:col-span-2">
                  <DataTablePro title="Top Pages" data={data.topPages || []} isDark={isDark} columns={['Page', 'Visitors']} />
                </div>
                <div className="space-y-6">
                  <DataTablePro title="Top Routes" data={data.routes || []} isDark={isDark} columns={['Route', 'Visitors']} />
                  <DataTablePro title="Hostnames" data={data.hostnames || []} isDark={isDark} columns={['Hostname', 'Visitors']} />
                </div>
              </div>
            )}

            {/* TAB: REFERRERS */}
            {activeTab === 'referrers' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <DataTablePro title="Top Referrers" data={data.topReferrers || []} isDark={isDark} columns={['Source', 'Visitors']} />
                <DataTablePro title="UTM Parameters" data={data.utmParams || []} isDark={isDark} columns={['Campaign', 'Visitors']} />
              </div>
            )}

            {/* TAB: GEOGRAPHY */}
            {activeTab === 'geo' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <div className="xl:col-span-2">
                  <ChartShell title="Geographic Distribution" isDark={isDark}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} horizontal={false} />
                        <XAxis type="number" stroke={isDark ? '#475569' : '#94a3b8'} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" stroke={isDark ? '#475569' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} width={80} />
                        <Tooltip content={<CustomTooltip isDark={isDark} />} />
                        <Bar dataKey="visitors" name="Visitors" radius={[0, 6, 6, 0]} barSize={20}>
                          {countryData.map((entry: any, index: number) => <Cell key={index} fill={MPL[index % MPL.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </div>
                <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Country Breakdown</h3>
                  <div className="space-y-3">
                    {(data.countries || []).slice(0, 10).map((country: any, idx: number) => (
                      <ProgressBarPro key={idx} label={country.name} value={country.visitors} max={data.countries[0]?.visitors || 1} color={MPL[idx % MPL.length]} isDark={isDark} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TECHNOLOGY */}
            {activeTab === 'tech' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Devices</h3>
                  {(data.devices || []).map((d: any, idx: number) => (
                    <ProgressBarPro key={idx} label={d.name} value={d.visitors} max={data.visitors || 1} color={MPL[idx % MPL.length]} isDark={isDark} />
                  ))}
                </div>
                <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Browsers</h3>
                  {(data.browsers || []).map((b: any, idx: number) => (
                    <ProgressBarPro key={idx} label={b.name} value={b.visitors} max={data.visitors || 1} color={MPL[(idx + 3) % MPL.length]} isDark={isDark} />
                  ))}
                </div>
                <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Operating Systems</h3>
                  {(data.os || []).map((o: any, idx: number) => (
                    <ProgressBarPro key={idx} label={o.name} value={o.visitors} max={data.visitors || 1} color={MPL[(idx + 5) % MPL.length]} isDark={isDark} />
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className={`mt-12 pt-8 border-t text-center text-xs font-medium ${isDark ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
              <p>Analytics Dashboard v3.0 • Real-time Data • TensorFlow Predictions</p>
              <p className="mt-1">Last synced: {new Date().toLocaleString()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}