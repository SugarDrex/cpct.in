'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  FiUsers, FiActivity, FiClock, FiGlobe, FiMonitor, FiLogOut,
  FiArrowRight, FiZap, FiTrendingUp, FiTrendingDown, FiAlertCircle,
  FiCheckCircle, FiDollarSign, FiBarChart2, FiTarget, FiMousePointer,
  FiEye, FiLink2, FiDownload, FiRefreshCw, FiSettings, FiShield, FiLock,
} from 'react-icons/fi';
import { HiOutlineSparkles, HiOutlineGlobeAlt } from 'react-icons/hi';

type UserToken = { username: string; email: string; id: string; exp?: number };

type ActiveSession = {
  id: string;
  username: string;
  email: string;
  device_name: string;
  device_type: string;
  location_city: string;
  location_country: string;
  login_time: string;
  last_activity: string;
  is_active: boolean;
  idle_minutes: number;
  session_duration_minutes: number;
};

type AnalyticsData = {
  total_visitors: number;
  total_pageviews: number;
  bounce_rate: number;
  avg_session_duration: number;
  device_breakdown: { device: string; count: number; percentage: number }[];
  browser_breakdown: { browser: string; count: number; percentage: number }[];
  geo_breakdown: { country: string; city: string; count: number; percentage: number }[];
  traffic_sources: { source: string; count: number; percentage: number }[];
};

type DashboardMetrics = {
  total_active_users: number;
  total_sessions_today: number;
  user_growth: number;
  conversion_rate: number;
  top_page: string;
  total_hits: number;
};

const luxeThemes = {
  light: {
    bg: '#fafbfc',
    bgDark: '#f0f3f7',
    card: '#ffffff',
    text: '#0a0e27',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accentBlue: '#003087',
    accentOrange: '#FF6B00',
    accentGreen: '#10b981',
    accentRed: '#ef4444',
    glass: 'rgba(255, 255, 255, 0.7)',
    shadow: '0 20px 60px rgba(0, 48, 135, 0.12)',
    shadowHover: '0 30px 90px rgba(0, 48, 135, 0.25)',
  },
  dark: {
    bg: '#0a0e27',
    bgDark: '#050812',
    card: '#1a1f3a',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#334155',
    accentBlue: '#3b82f6',
    accentOrange: '#ff8c42',
    accentGreen: '#10b981',
    accentRed: '#ef4444',
    glass: 'rgba(30, 41, 59, 0.6)',
    shadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    shadowHover: '0 30px 90px rgba(59, 130, 246, 0.3)',
  },
};

export default function SuperUserAdminPanel() {
  const [user, setUser] = useState<UserToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const T = isDark ? luxeThemes.dark : luxeThemes.light;

  // Load user and data
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const decoded = jwtDecode<UserToken>(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      setUser(decoded);
      fetchDashboardData();
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch active sessions and analytics
  const fetchDashboardData = async () => {
    try {
      // Fetch active sessions
      const sessionsRes = await fetch('/api/admin/active-sessions');
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json();
        setActiveSessions(sessions);
      }

      // Fetch Vercel analytics
      const analyticsRes = await fetch('/api/admin/vercel-analytics');
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      // Fetch dashboard metrics
      const metricsRes = await fetch('/api/admin/metrics');
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (!mounted || loading || !user) return null;

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <div
      style={{
        background: T.glass,
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        transition: 'all 0.4s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = T.shadowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = T.shadow;
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <Icon size={28} color={color} style={{ opacity: 0.8 }} />
        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: trend > 0 ? T.accentGreen : T.accentRed,
              background: trend > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            {trend > 0 ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ margin: '8px 0 0 0', fontSize: '1.8rem', fontWeight: 700, color: T.text }}>
        {value}
      </p>
    </div>
  );

  const SessionCard = ({ session }: { session: ActiveSession }) => (
    <div
      style={{
        background: T.glass,
        backdropFilter: 'blur(20px)',
        borderRadius: '14px',
        padding: '20px',
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        marginBottom: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: session.is_active ? T.accentGreen : T.textMuted,
        }}
      />
      
      <div style={{ flex: 1, paddingLeft: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: session.is_active ? '#10b981' : '#94a3b8',
              animation: session.is_active ? 'pulse 2s infinite' : 'none',
            }}
          />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>
            {session.username}
          </h4>
          <span style={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 600 }}>
            {session.email}
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, fontSize: '0.75rem', color: T.textMuted }}>
          <div>
            <FiMonitor size={12} style={{ marginRight: 4 }} /> {session.device_name}
          </div>
          <div>
            <HiOutlineGlobeAlt size={12} style={{ marginRight: 4 }} /> {session.location_city}, {session.location_country}
          </div>
          <div>
            <FiClock size={12} style={{ marginRight: 4 }} /> {session.idle_minutes}m idle
          </div>
          <div>
            <FiActivity size={12} style={{ marginRight: 4 }} /> {session.session_duration_minutes}m session
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginLeft: 16 }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', color: T.textMuted, fontWeight: 600 }}>
          Last Active
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: T.text }}>
          {new Date(session.last_activity).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #fafbfc 0%, #f0f3f7 50%, #eef2f7 100%)',
        color: T.text,
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.5s ease',
      }}
    >
      {/* Animated background blobs */}
      {[
        { size: 500, top: '-20%', left: '-10%', delay: '0s', colors: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0, 48, 135, 0.06)' },
        { size: 400, bottom: '-15%', right: '-5%', delay: '2s', colors: isDark ? 'rgba(124, 58, 237, 0.06)' : 'rgba(255, 107, 0, 0.06)' },
      ].map((blob, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            width: blob.size,
            height: blob.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${blob.colors} 0%, transparent 70%)`,
            pointerEvents: 'none',
            top: blob.top,
            bottom: blob.bottom,
            left: blob.left,
            right: blob.right,
            animation: `drift 20s ease-in-out ${blob.delay} infinite`,
            filter: 'blur(50px)',
          }}
        />
      ))}

      <div style={{ maxWidth: '2000px', margin: '0 auto', padding: '40px 28px' }}>
        {/* Header with refresh */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 40,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 800, color: T.text }}>
              Super User Control Center
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: T.textMuted }}>
              Real-time admin monitoring & Vercel analytics
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: '10px',
              border: `1px solid ${T.border}`,
              background: T.glass,
              color: T.text,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              opacity: refreshing ? 0.5 : 1,
            }}
            onMouseEnter={(e) => !refreshing && (e.currentTarget.style.background = T.card)}
            onMouseLeave={(e) => (e.currentTarget.style.background = T.glass)}
          >
            <FiRefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* Premium Welcome Card */}
        <div
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(124, 58, 237, 0.3))'
              : 'linear-gradient(135deg, rgba(0, 48, 135, 0.5), rgba(59, 130, 246, 0.3))',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '36px 40px',
            color: '#fff',
            marginBottom: 40,
            border: `1px solid ${isDark ? 'rgba(226, 232, 240, 0.15)' : 'rgba(255, 255, 255, 0.3)'}`,
            boxShadow: T.shadow,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <FiShield size={32} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
                  Welcome back, {user.username}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                  Super Administrator • Email: {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <StatCard
            icon={FiUsers}
            label="Active Users"
            value={metrics?.total_active_users || '0'}
            trend={metrics?.user_growth || 0}
            color={T.accentBlue}
          />
          <StatCard
            icon={FiActivity}
            label="Sessions Today"
            value={metrics?.total_sessions_today || '0'}
            trend={12}
            color={T.accentGreen}
          />
          <StatCard
            icon={FiEye}
            label="Total Visitors"
            value={analytics?.total_visitors || '0'}
            trend={8}
            color={T.accentOrange}
          />
          <StatCard
            icon={FiMousePointer}
            label="Total Pageviews"
            value={analytics?.total_pageviews || '0'}
            trend={15}
            color={T.accentBlue}
          />
          <StatCard
            icon={FiTarget}
            label="Conversion Rate"
            value={`${metrics?.conversion_rate || 0}%`}
            trend={3}
            color={T.accentGreen}
          />
          <StatCard
            icon={FiBarChart2}
            label="Bounce Rate"
            value={`${analytics?.bounce_rate?.toFixed(1) || '0'}%`}
            trend={-5}
            color={T.accentRed}
          />
        </div>

        {/* Two Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
            gap: 24,
            marginBottom: 40,
          }}
        >
          {/* Active Sessions */}
          <div
            style={{
              background: T.glass,
              backdropFilter: 'blur(20px)',
              borderRadius: '18px',
              padding: '28px',
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <FiActivity size={24} color={T.accentGreen} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: T.text }}>
                Live Active Sessions
              </h3>
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
                background: T.accentGreen,
                padding: '4px 10px',
                borderRadius: '6px',
              }}>
                {activeSessions.length} online
              </span>
            </div>

            {activeSessions.length > 0 ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {activeSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <p style={{ color: T.textMuted, textAlign: 'center', padding: '40px 20px', margin: 0 }}>
                No active sessions
              </p>
            )}
          </div>

          {/* Device Breakdown */}
          <div
            style={{
              background: T.glass,
              backdropFilter: 'blur(20px)',
              borderRadius: '18px',
              padding: '28px',
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 700, color: T.text }}>
              Device Breakdown
            </h3>

            {analytics?.device_breakdown && analytics.device_breakdown.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {analytics.device_breakdown.map((device, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: T.text }}>
                        {device.device.charAt(0).toUpperCase() + device.device.slice(1)}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: T.accentBlue }}>
                        {device.percentage.toFixed(1)}% ({device.count})
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        borderRadius: '4px',
                        background: T.border,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${device.percentage}%`,
                          background: `linear-gradient(90deg, ${T.accentBlue}, ${T.accentOrange})`,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: T.textMuted, margin: 0 }}>No device data available</p>
            )}
          </div>
        </div>

        {/* Browser & Traffic Source */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            marginBottom: 40,
          }}
        >
          {/* Top Browsers */}
          <div
            style={{
              background: T.glass,
              backdropFilter: 'blur(20px)',
              borderRadius: '18px',
              padding: '28px',
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 700, color: T.text }}>
              Top Browsers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analytics?.browser_breakdown?.slice(0, 5).map((browser, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: T.text }}>{browser.browser}</span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: T.accentBlue,
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    {browser.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div
            style={{
              background: T.glass,
              backdropFilter: 'blur(20px)',
              borderRadius: '18px',
              padding: '28px',
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 700, color: T.text }}>
              Traffic Sources
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analytics?.traffic_sources?.map((source, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: T.text }}>{source.source}</span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: T.accentGreen,
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    {source.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic */}
          <div
            style={{
              background: T.glass,
              backdropFilter: 'blur(20px)',
              borderRadius: '18px',
              padding: '28px',
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 700, color: T.text }}>
              Top Locations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analytics?.geo_breakdown?.slice(0, 5).map((geo, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: T.text }}>
                    {geo.city}, {geo.country}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: T.accentOrange,
                    background: 'rgba(255, 107, 0, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    {geo.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session Analytics */}
        <div
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(59, 130, 246, 0.2))'
              : 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.15))',
            backdropFilter: 'blur(20px)',
            borderRadius: '18px',
            padding: '36px',
            border: `1px solid ${isDark ? 'rgba(226, 232, 240, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: T.shadow,
            marginBottom: 40,
          }}
        >
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 700, color: T.text }}>
            Session Analytics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Avg Session Duration', value: `${analytics?.avg_session_duration || 0}s`, icon: '⏱️' },
              { label: 'Bounce Rate', value: `${analytics?.bounce_rate?.toFixed(1) || 0}%`, icon: '📊' },
              { label: 'Total Pageviews', value: analytics?.total_pageviews || '0', icon: '👁️' },
              { label: 'Conversion Rate', value: `${metrics?.conversion_rate || 0}%`, icon: '🎯' },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: T.glass,
                  backdropFilter: 'blur(10px)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${T.border}`,
                }}
              >
                <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: T.textMuted, fontWeight: 600 }}>
                  {stat.label}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                  <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: T.text }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drift {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-30px) translateX(20px); }
          66% { transform: translateY(20px) translateX(-30px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb {
          background: ${T.border};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover { background: ${T.textMuted}; }
      `}</style>
    </div>
  );
}