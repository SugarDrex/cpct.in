'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { fetchExamsAction, getRealtimeConfigAction } from '@/app/actions/getMainExam';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Exam {
  id: string;
  title: string;
  exam_date: string;
  created_at: string;
  mquestions: { id: string }[];
}

interface GroupedYear {
  year: number;
  months: {
    month: number;
    label: string;
    exams: Exam[];
  }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function groupByYearMonth(exams: Exam[]): GroupedYear[] {
  const map = new Map<number, Map<number, Exam[]>>();
  for (const e of exams) {
    const [y, m] = e.exam_date.split('-').map(Number);
    if (!map.has(y)) map.set(y, new Map());
    const ym = map.get(y)!;
    if (!ym.has(m)) ym.set(m, []);
    ym.get(m)!.push(e);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({
      year,
      months: Array.from(months.entries())
        .sort(([a], [b]) => b - a)
        .map(([month, exams]) => ({ month, label: MONTH_NAMES[month], exams })),
    }));
}

// ── Inline Icons ───────────────────────────────────────────────────────────────
function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  );
}
function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  );
}
function IconFileText({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
  );
}
function IconKeyboard({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="M6 8h.001" /><path d="M10 8h.001" /><path d="M14 8h.001" /><path d="M18 8h.001" /><path d="M8 12h.001" /><path d="M12 12h.001" /><path d="M16 12h.001" /><path d="M7 16h10" /></svg>
  );
}
function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
  );
}
function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
  );
}
function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
  );
}
function IconLogOut({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
  );
}
function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  );
}
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
  );
}
function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
  );
}
function IconBookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
  );
}
function IconLightbulb({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
  );
}
function IconBarChart({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
  );
}
function IconAward({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
  );
}
function IconRefresh({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
  );
}
function IconWifi({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01" /><path d="M2 12.83a23 23 0 0 1 20 0" /><path d="M5 16.22a15 15 0 0 1 14 0" /><path d="M8.5 19.14a7 7 0 0 1 7 0" /></svg>
  );
}
function IconWifiOff({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22" /><path d="M8.5 16.5a7 7 0 0 0 7 0" /><path d="M5 12.83a15 15 0 0 1 14 0" /><path d="M2 8.82a23 23 0 0 1 20 0" /></svg>
  );
}
function IconMonitor({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
  );
}
function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  );
}
function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /><line x1="12" x2="12" y1="2" y2="4" /><line x1="12" x2="12" y1="20" y2="22" /><line x1="2" x2="4" y1="12" y2="12" /><line x1="20" x2="22" y1="12" y2="12" /></svg>
  );
}
function IconCpu({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
  );
}
function IconLayers({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
  );
}
function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
  );
}


// ── Hero Section ───────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 rounded-2xl border border-blue-100 p-6 sm:p-8 mb-6 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10">
        <div className="flex-1 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-blue-200 text-[11px] font-semibold text-blue-700 shadow-sm">
            <IconAward className="w-3 h-3" />
            Welcome to CPCT Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Prepare Smart.<br />
            <span className="text-blue-700">Score Higher.</span>
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md">
            Latest CPCT papers, topic-wise practice and helpful resources for your success.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Link href="/#takeone">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300">
                Start Practicing
                <IconArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/cpct-notes">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[13px] font-semibold hover:border-blue-300 hover:text-blue-700 transition-all">
                <IconFileText className="w-4 h-4" />
                View Notes
              </button>
            </Link>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="hidden lg:flex flex-1 justify-center relative">
          <div className="relative w-64 h-48">
            {/* Monitor */}
            <div className="absolute inset-0 bg-white rounded-xl border-2 border-blue-200 shadow-xl shadow-blue-100 flex flex-col overflow-hidden">
              <div className="h-5 bg-blue-50 border-b border-blue-100 flex items-center px-2 gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
                <span className="text-3xl font-black text-blue-700 tracking-wider">CPCT</span>
              </div>
              <div className="h-1 bg-blue-600" />
            </div>
            {/* Stand */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-3 bg-blue-200 rounded-b-lg" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-blue-100 rounded-full" />
            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-lg border border-blue-200 flex items-center justify-center shadow-sm">
              <IconFileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="absolute top-1/2 -right-6 w-8 h-8 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-center shadow-sm">
              <IconLightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <div className="absolute bottom-4 -left-4 w-8 h-8 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center shadow-sm">
              <IconBarChart className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Realtime Badge ─────────────────────────────────────────────────────────────
function RealtimeBadge({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${connected
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-red-50 text-red-700 border-red-200'
      }`}>
      {connected ? <IconWifi className="w-3 h-3" /> : <IconWifiOff className="w-3 h-3" />}
      {connected ? 'Live' : 'Offline'}
    </span>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-slate-100 border border-slate-200 p-4 h-24" />
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 w-32 bg-slate-200 rounded-md animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

// ── Exam Month Card ────────────────────────────────────────────────────────────
function ExamMonthCard({ month, year, count }: { month: { label: string; month: number; exams: Exam[] }; year: number; count: number }) {
  const href = `/admin/superadmin/exam/${month}?year=${year}&month=${month.month}`;
  const iconColors = [
    'text-blue-600 bg-blue-50 border-blue-200',
    'text-emerald-600 bg-emerald-50 border-emerald-200',
    'text-violet-600 bg-violet-50 border-violet-200',
    'text-amber-600 bg-amber-50 border-amber-200',
    'text-rose-600 bg-rose-50 border-rose-200',
    'text-cyan-600 bg-cyan-50 border-cyan-200',
  ];
  const colorClass = iconColors[month.month % iconColors.length];

  return (
    <Link
      href={href}
      className="group relative flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-200">
      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${colorClass}`}>
        <IconCalendar className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-[13px] font-bold text-slate-900 leading-tight">{month.label} {year}</h3>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">NEW</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-2">CPCT Exam {year}</p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">{count} shift{count !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:underline">
            View Papers <IconChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Topic Card ─────────────────────────────────────────────────────────────────
function TopicCard({ title, icon: Icon, color }: { title: string; icon: React.FC<{ className?: string }>; color: string }) {
  return (
    <Link
      href={`/topics/${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-200">
      <div className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1 text-[13px] font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{title}</span>
      <IconChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
    </Link>
  );
}

// ── Study Resources Sidebar ────────────────────────────────────────────────────
function StudyResources() {
  const items = [
    { icon: IconBookOpen, label: 'Practice Questions', desc: 'Topic-wise practice sets', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { icon: IconFileText, label: 'Important Notes', desc: 'Key points & summaries', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { icon: IconLightbulb, label: 'Tips & Tricks', desc: 'Smart strategies to crack', color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { icon: IconKeyboard, label: 'Typing Test', desc: 'Improve your speed', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  ];

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2">
        <IconBookOpen className="w-4 h-4 text-blue-600" />
        Study Resources
      </h3>
      <ul className="space-y-1">
        {items.map(it => (
          <li key={it.label}>
            <Link href="/" className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200 group">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${it.color}`}>
                <it.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{it.label}</p>
                <p className="text-[11px] text-slate-400">{it.desc}</p>
              </div>
              <IconChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ── Preparation Card ─────────────────────────────────────────────────────────────
function PreparationCard() {
  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 relative overflow-hidden">
      <h3 className="text-slate-900 font-bold text-sm mb-1">CPCT Exam Preparation</h3>
      <p className="text-[11px] text-slate-500 mb-3">Consistent Practice. Better Results.</p>
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
        Stay Consistent
      </button>
      <div className="absolute right-2 bottom-2 text-blue-200">
        <IconTarget className="w-12 h-12" />
      </div>
    </div>
  );
}

// ── About CPCT Sidebar ───────────────────────────────────────────────────────────
function AboutCpct() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <IconShield className="w-4 h-4 text-emerald-600" />
        <span className="text-slate-900 text-sm font-bold">About CPCT</span>
      </div>
      <p className="text-[12px] text-slate-500 leading-relaxed mb-2">
        Computer Proficiency Certification Test conducted by NIC/MP Government.
      </p>
      <Link href="/about" className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline">
        Learn More <IconChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CpctExamsPage() {
  const [grouped, setGrouped] = useState<GroupedYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [rtConnected, setRtConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const exams = await fetchExamsAction();
    setGrouped(groupByYearMonth(exams));
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();

    let channel: RealtimeChannel | null = null;
    getRealtimeConfigAction().then(({ url, anonKey }) => {
      const sb = createClient(url, anonKey);
      channel = sb
        .channel('mexams-public')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mexams' }, () => load(true))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mquestions' }, () => load(true))
        .subscribe(status => {
          setRtConnected(status === 'SUBSCRIBED');
        });
    });

    return () => { channel?.unsubscribe(); };
  }, [load]);

  const totalExams = grouped.reduce((a, g) => a + g.months.reduce((b, m) => b + m.exams.length, 0), 0);

  // Topic data
  const topics = [
    { title: 'Fundamental', icon: IconCpu, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { title: 'Word', icon: IconFileText, color: 'text-blue-700 bg-blue-50 border-blue-300' },
    { title: 'Excel', icon: IconBarChart, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { title: 'Power Point', icon: IconLayers, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { title: 'DataBase', icon: IconLayers, color: 'text-violet-600 bg-violet-50 border-violet-200' },
    { title: 'Internet', icon: IconGlobe, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-22 pb-12">
        {/* Hero */}
        <HeroSection />

        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCalendar className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">CPCT Exams</h2>
              </div>
              <div className="flex items-center gap-2">
                <RealtimeBadge connected={rtConnected} />
                {lastUpdated && (
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <button
                  onClick={() => load(true)}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-medium hover:border-blue-300 hover:text-blue-700 transition-all disabled:opacity-50">
                  <IconRefresh className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                  <IconAward className="w-3 h-3" />
                  {totalExams} Exams
                </span>
              </div>
            </div>

            {/* Exams Grid */}
            {loading ? (
              <Skeleton />
            ) : grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 bg-white rounded-xl border border-slate-200">
                <IconFileText className="w-10 h-10 opacity-30" />
                <p className="text-sm font-semibold">No exams found.</p>
                <p className="text-[11px]">Check back later or contact your administrator.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {grouped.map(({ year, months }) => (
                  <section key={year}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent" />
                      <h3 className="text-[13px] font-extrabold text-slate-700 tracking-wide px-1">
                        CPCT Exam {year}
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-l from-blue-200 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {months.map(m => (
                        <ExamMonthCard key={m.month} month={m} year={year} count={m.exams.length} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* Topic Wise Section */}
            <section className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <IconFileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Topic Wise Paper</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topics.map(t => (
                  <TopicCard key={t.title} title={t.title} icon={t.icon} color={t.color} />
                ))}
              </div>
            </section>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-4">
            <StudyResources />
            <PreparationCard />
            <AboutCpct />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">© 2026 CPCT.IN. All rights reserved.</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            Designed for your success <span className="text-rose-400">♡</span>
          </p>
        </div>
      </footer>
    </div>
  );
}