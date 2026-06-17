'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  FiUploadCloud, FiDatabase, FiBarChart2, FiTrendingUp,
  FiUser, FiCheckCircle, FiArrowRight, FiZap, FiBookOpen, FiAward, FiCpu,
  FiActivity, FiClock, FiUsers, FiSettings, FiCode,
} from 'react-icons/fi';
import { HiOutlineAcademicCap, HiOutlineSparkles } from 'react-icons/hi';

type UserToken = { username: string; email: string; exp?: number };

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
    glass: 'rgba(30, 41, 59, 0.6)',
    shadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    shadowHover: '0 30px 90px rgba(59, 130, 246, 0.3)',
  },
};

export default function LuxeAdminDashboard() {
  const [user, setUser] = useState<UserToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

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
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (!mounted || loading || !user) return null;

  const isDark = theme === 'dark';
  const T = isDark ? luxeThemes.dark : luxeThemes.light;

  const stats = [
    { icon: '📊', label: 'Total Exams', value: '48', trend: '+12%' },
    { icon: '📚', label: 'Study Materials', value: '156', trend: '+8%' },
    { icon: '👥', label: 'Active Students', value: '15K', trend: '+24%' },
    { icon: '🏆', label: 'Completion Rate', value: '87%', trend: '+5%' },
  ];

  const modules = [
    {
      id: 'smart-import',
      title: 'Smart Exam Import',
      desc: 'CPCT bilingual parsing • Auto-answer detection • TensorFlow scoring',
      icon: '🤖',
      href: '/admin/smart-import',
      color: '#003087',
      colorLight: '#3b82f6',
    },
    {
      id: 'notes',
      title: 'Study Materials',
      desc: 'Version control • Categorization • Access tracking',
      icon: '📄',
      href: '/admin/notesupload',
      color: '#FF6B00',
      colorLight: '#ff8c42',
    },
    {
      id: 'updates',
      title: 'Latest Updates',
      desc: 'Announcements • Real-time alerts • Notifications',
      icon: '⚡',
      href: '/admin/latestupdate',
      color: '#10b981',
      colorLight: '#34d399',
    },
    {
      id: 'exams',
      title: 'Exam Management',
      desc: 'CRUD operations • Analytics • Performance tracking',
      icon: '🎯',
      href: '/admin/newexams',
      color: '#7c3aed',
      colorLight: '#a855f7',
    },
    {
      id: 'questions',
      title: 'Question Bank',
      desc: 'Topic organization • Difficulty levels • Analytics',
      icon: '📋',
      href: '/admin/topic-mcq',
      color: '#06b6d4',
      colorLight: '#22d3ee',
    },
    {
      id: 'analytics',
      title: 'AI Analytics',
      desc: 'TensorFlow insights • Performance metrics • Predictions',
      icon: '📈',
      href: '/admin/analytics',
      color: '#f43f5e',
      colorLight: '#fb7185',
    },
  ];

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
        transition: 'background 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Premium animated gradients */}
      {[
        { size: 500, top: '-20%', left: '-10%', delay: '0s', colors: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0, 48, 135, 0.06)' },
        { size: 400, bottom: '-15%', right: '-5%', delay: '2s', colors: isDark ? 'rgba(124, 58, 237, 0.06)' : 'rgba(255, 107, 0, 0.06)' },
        { size: 350, bottom: '10%', left: '5%', delay: '4s', colors: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.04)' },
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

      <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '40px 28px' }}>
        {/* Welcome Card - Ultra Premium */}
        <div
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(124, 58, 237, 0.3))'
              : 'linear-gradient(135deg, rgba(0, 48, 135, 0.5), rgba(59, 130, 246, 0.3))',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '44px 40px',
            color: '#fff',
            marginBottom: 40,
            border: `1px solid ${isDark ? 'rgba(226, 232, 240, 0.15)' : 'rgba(255, 255, 255, 0.3)'}`,
            boxShadow: T.shadow,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <HiOutlineSparkles size={28} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }} />
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                Welcome back, {user.username}
              </h2>
            </div>
            <p style={{ margin: '0 0 28px 0', fontSize: '0.98rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
              Manage sophisticated exam systems with AI insights. Your admin hub is configured and optimized for peak performance.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {[
                { label: 'Account', value: user.email, emoji: '📧' },
                { label: 'Status', value: '🟢 Active Premium', emoji: '⚡' },
                { label: 'Mode', value: isDark ? '🌙 Dark Mode' : '☀️ Light Mode', emoji: '🎨' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {item.label}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, wordBreak: 'break-all' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats - Premium Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
            marginBottom: 48,
          }}
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: T.glass,
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '24px',
                border: `1px solid ${T.border}`,
                boxShadow: T.shadow,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: '28px' }}>{stat.icon}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '6px' }}>
                  {stat.trend}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: T.textMuted, fontWeight: 600 }}>
                {stat.label}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '1.7rem', fontWeight: 700, color: T.text }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Modules - Luxury Grid */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: 700, color: T.text, letterSpacing: '-0.5px' }}>
            Management Suite
          </h2>
          <p style={{ margin: '0 0 28px 0', fontSize: '0.95rem', color: T.textMuted }}>
            Professional tools for modern exam administration
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 24,
            }}
          >
            {modules.map((mod) => (
              <Link key={mod.id} href={mod.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: T.glass,
                    backdropFilter: 'blur(20px)',
                    borderRadius: '18px',
                    padding: '28px',
                    border: `1.5px solid ${T.border}`,
                    boxShadow: T.shadow,
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px)';
                    e.currentTarget.style.boxShadow = T.shadowHover;
                    e.currentTarget.style.borderColor = isDark ? mod.colorLight : mod.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = T.shadow;
                    e.currentTarget.style.borderColor = T.border;
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${mod.color}, ${mod.colorLight})`,
                    }}
                  />

                  {/* Icon */}
                  <div style={{ fontSize: '40px', marginBottom: 16 }}>{mod.icon}</div>

                  {/* Title */}
                  <h3
                    style={{
                      margin: '0 0 10px 0',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: T.text,
                      letterSpacing: '-0.3px',
                    }}
                  >
                    {mod.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      margin: '0 0 20px 0',
                      fontSize: '0.85rem',
                      color: T.textMuted,
                      lineHeight: 1.7,
                      flex: 1,
                    }}
                  >
                    {mod.desc}
                  </p>

                  {/* CTA */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: isDark ? mod.colorLight : mod.color,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    Access
                    <FiArrowRight size={16} style={{ marginLeft: 'auto' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Features Section */}
        <div
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(59, 130, 246, 0.2))'
              : 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.15))',
            backdropFilter: 'blur(20px)',
            borderRadius: '18px',
            padding: '36px',
            color: T.text,
            border: `1px solid ${isDark ? 'rgba(226, 232, 240, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: T.shadow,
            marginBottom: 40,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: '24px' }}>🚀</span>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                TensorFlow AI Engine
              </h2>
            </div>
            <p style={{ margin: '0 0 20px 0', color: T.textMuted, lineHeight: 1.8 }}>
              Intelligent question parsing, difficulty prediction, student analytics, and adaptive learning recommendations powered by advanced machine learning.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {['🧠 Smart Parsing', '📊 Analytics', '🎯 Predictions', '📈 Insights'].map((f, i) => (
                <div
                  key={i}
                  style={{
                    background: T.glass,
                    backdropFilter: 'blur(10px)',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${T.border}`,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: T.text,
                  }}
                >
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div
          style={{
            background: T.glass,
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${T.border}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 20,
            boxShadow: T.shadow,
          }}
        >
          {[
            { icon: '⏱️', label: 'Last Updated', value: 'Just now' },
            { icon: '✅', label: 'System Status', value: 'Online' },
            { icon: '⚡', label: 'Data Sync', value: 'Real-time' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: '20px' }}>{item.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: T.textMuted, fontWeight: 600 }}>
                  {item.label}
                </p>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.9rem', fontWeight: 700, color: T.text }}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes drift {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-30px) translateX(20px); }
          66% { transform: translateY(20px) translateX(-30px); }
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