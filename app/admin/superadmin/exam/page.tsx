'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { fetchExamsAction, getRealtimeConfigAction } from '@/app/actions/getMainExam';
import { getSmartExamData } from '@/app/actions/getOldExams';
import { FcCheckmark } from "react-icons/fc";
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

interface Topic {
  id: string;
  name: string;
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
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 rounded-2xl border border-blue-100 dark:border-gray-800 p-6 sm:p-8 mb-6 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10" >
        <div className="flex-1 space-y-4" >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900 text-[11px] font-semibold text-blue-700 dark:text-blue-400 shadow-sm">
            <IconAward className="w-3 h-3" />
            Welcome to CPCT Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            Prepare Smart.<br />
            <span className="text-blue-700 dark:text-blue-400">Score Higher.</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed max-w-md">
            Latest CPCT papers, topic-wise practice and helpful resources for your success.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Link href="/#takeone">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-950/40 hover:shadow-blue-300 dark:hover:shadow-blue-900/50">
                Start Practicing
                <IconArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/cpct-notes">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 text-[13px] font-semibold hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 transition-all">
                <IconFileText className="w-4 h-4" />
                View Notes
              </button>
            </Link>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="hidden lg:flex flex-1 justify-center relative" >
          <div className="relative w-64 h-48" >
            {/* Monitor */}
            <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-200 dark:border-blue-900 shadow-xl shadow-blue-100 dark:shadow-none flex flex-col overflow-hidden">
              <div className="h-5 bg-blue-50 dark:bg-gray-900 border-b border-blue-100 dark:border-gray-700 flex items-center px-2 gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="h-10 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner">
                <span className="text-2xl font-black tracking-wide text-blue-400">
                  CPCT
                </span>
              </div>

              {/* Content */}
             <div className="flex items-center justify-between gap-4 p-8">
  {/* Skeleton Content */}
  <div className="flex-1 space-y-3">
    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
    <div className="h-2 w-4/5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
    <div className="h-2 w-3/5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
  </div>

  {/* Check Badge */}
  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 shadow-md ">
    <FcCheckmark className="text-xl" />
  </div>
</div>
            </div>
            {/* Stand <FcCheckmark /> */}
             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-4 bg-blue-200 dark:bg-gray-700 rounded-b-lg" />
          
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-3 bg-blue-200 dark:bg-gray-700 rounded-b-lg" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-blue-200 dark:bg-gray-800 rounded-full" />
            {/* Floating elements */}
            <div style={{
              mixBlendMode: "multiply",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              filter: "contrast(1.15) brightness(1.02)",
              pointerEvents: "none",
            }} className="absolute top-29 -right-12 w-12 h-12 bg-white dark:bg-blue-950/40   rounded-full flex items-center justify-center  ">
              <span className="text-lg leading-none select-none ">
                <img style={{
                  mixBlendMode: isDark ? "darken" : "multiply",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  pointerEvents: "none",
                }} className="w-10 h-15  dark:mix-blend-screen m-1 " src="/light.png">
                </img></span>
            </div>
            <div style={{
              mixBlendMode: "multiply",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              filter: "contrast(1.15) brightness(1.02)",
              pointerEvents: "none",
            }} className="absolute top-1/2 -left-19 w-12 h-12 bg-white dark:bg-blue-950/40   rounded-full flex items-center justify-center  ">
              <IconFileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="absolute top-6 -left-20 w-10 h-10 bg-white dark:bg-blue-950/40 rounded-full flex items-center justify-center">
              <span className="text-lg leading-none select-none ">
                <img style={{
                  mixBlendMode: isDark ? "darken" : "multiply",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  pointerEvents: "none",
                }} className="w-9 h-12  dark:mix-blend-screen m-1 " src="/bars.png">
                </img></span>
            </div>
            <div className="absolute -bottom-3 -left-8 flex flex-col items-center">
              <span className="text-lg leading-none select-none">
                <img style={{
                  mixBlendMode: "multiply",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  filter: "contrast(1.15) brightness(1.02)",
                  pointerEvents: "none",
                  
                }} className="w-10 h-15 priority" src="/plant.png">
                </img></span>

            </div>

            {/* Book stack (bottom-right) */}
            <div className="absolute -bottom-17 -right-2 flex flex-col items-center gap-[2px]">
              <span className="text-lg leading-none select-none ">
                <img style={{
                  mixBlendMode: isDark ? "darken" : "multiply",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  pointerEvents: "none",
                }} className="w-26 h-21  dark:mix-blend-screen " src="/books.png">
                </img></span>


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
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
      }`}>
      {connected ? <IconWifi className="w-3 h-3" /> : <IconWifiOff className="w-3 h-3" />}
      {connected ? 'Live' : 'Offline'}
    </span>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 p-4 h-24" />
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 w-32 bg-slate-200 dark:bg-gray-700 rounded-md animate-pulse" />
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
    'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800',
    'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800',
    'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/40 dark:border-violet-800',
    'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800',
    'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800',
    'text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/40 dark:border-cyan-800',
  ];
  const colorClass = iconColors[month.month % iconColors.length];

  return (
    <Link
      href={href}
      className="group relative flex items-start gap-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3.5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:shadow-blue-100/50 dark:hover:shadow-blue-950/30 transition-all duration-200">
      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${colorClass}`}>
        <IconCalendar className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-gray-100 leading-tight">{month.label} {year}</h3>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">NEW</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-2">CPCT Exam {year}</p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-gray-500 font-medium">{count} shift{count !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
            View Papers <IconChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Topic Card ─────────────────────────────────────────────────────────────────
function TopicCard({ title, href, icon: Icon, color }: { title: string; href: string; icon: React.FC<{ className?: string }>; color: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3.5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:shadow-blue-100/50 dark:hover:shadow-blue-950/30 transition-all duration-200">
      <div className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="flex-1 text-[13px] font-semibold text-slate-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{title}</span>
      <IconChevronRight className="w-4 h-4 text-slate-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
    </Link>
  );
}

// ── Study Resources Sidebar ────────────────────────────────────────────────────
function StudyResources() {
  const items = [
    { icon: IconBookOpen, label: 'Practice Questions', desc: 'Topic-wise practice sets', color: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-900' },
    { icon: IconFileText, label: 'Important Notes', desc: 'Key points & summaries', color: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-900' },
    { icon: IconLightbulb, label: 'Tips & Tricks', desc: 'Smart strategies to crack', color: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-900' },
    { icon: IconKeyboard, label: 'Typing Test', desc: 'Improve your speed', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900' },
  ];

  return (
    <aside className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-slate-900 dark:text-gray-100 font-bold text-sm mb-3 flex items-center gap-2">
        <IconBookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Study Resources
      </h3>
      <ul className="space-y-1">
        {items.map(it => (
          <li key={it.label}>
            <Link href="/" className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200 group">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${it.color}`}>
                <it.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{it.label}</p>
                <p className="text-[11px] text-slate-400 dark:text-gray-500">{it.desc}</p>
              </div>
              <IconChevronRight className="w-4 h-4 text-slate-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
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
    <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 relative overflow-hidden">
      <h3 className="text-slate-900 dark:text-gray-100 font-bold text-sm mb-1">CPCT Exam Preparation</h3>
      <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-3">Consistent Practice. Better Results.</p>
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 dark:shadow-blue-950/40">
        Stay Consistent
      </button>
      <div className="absolute right-2 bottom-2 text-blue-200 dark:text-blue-900/60">
        <IconTarget className="w-12 h-12" />
      </div>
    </div>
  );
}

// ── About CPCT Sidebar ───────────────────────────────────────────────────────────
function AboutCpct() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center gap-2 mb-2">
        <IconShield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-slate-900 dark:text-gray-100 text-sm font-bold">About CPCT</span>
      </div>
      <p className="text-[12px] text-slate-500 dark:text-gray-400 leading-relaxed mb-2">
        Computer Proficiency Certification Test conducted by NIC/MP Government.
      </p>
      <Link href="/about" className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
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

  // Topics fetched from getSmartExamData (same source as the legacy Exam page)
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);

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

  // Load topics (Topic Wise Paper) from the same server action used on the legacy Exam page
  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await getSmartExamData();
        setTopics(data.topics || []);
      } catch (err) {
        console.error(err);
      } finally {
        setTopicsLoading(false);
      }
    }

    loadTopics();
  }, []);

  const totalExams = grouped.reduce((a, g) => a + g.months.reduce((b, m) => b + m.exams.length, 0), 0);

  // Icons/colors are cycled across the dynamically fetched topics
  const topicIcons = [IconCpu, IconFileText, IconBarChart, IconLayers, IconGlobe, IconBookOpen, IconLightbulb, IconMonitor];
  const topicColors = [
    'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800',
    'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800',
    'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800',
    'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/40 dark:border-violet-800',
    'text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/40 dark:border-cyan-800',
    'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-22 pb-12">
        {/* Hero */}
        <HeroSection />

        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCalendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-gray-100">CPCT Exams</h2>
              </div>
              {/*<div className="flex items-center gap-2">
                <RealtimeBadge connected={rtConnected} />
                {lastUpdated && (
                  <span className="text-[11px] text-slate-400 dark:text-gray-500 hidden sm:inline">
                    Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <button
                  onClick={() => load(true)}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 text-[11px] font-medium hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 transition-all disabled:opacity-50">
                  <IconRefresh className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-[11px] font-bold">
                  <IconAward className="w-3 h-3" />
                  {totalExams} Exams
                </span>
              </div>/*/}
            </div>

            {/* Exams Grid */}
            {loading ? (
              <Skeleton />
            ) : grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700">
                <IconFileText className="w-10 h-10 opacity-30" />
                <p className="text-sm font-semibold">No exams found.</p>
                <p className="text-[11px]">Check back later or contact your administrator.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {grouped.map(({ year, months }) => (
                  <section key={year}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-blue-200 dark:from-blue-900 to-transparent" />
                      <h3 className="text-[13px] font-extrabold text-slate-700 dark:text-gray-300 tracking-wide px-1">
                        CPCT Exam {year}
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-l from-blue-200 dark:from-blue-900 to-transparent" />
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
                <IconFileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-gray-100">Topic Wise Paper</h2>
              </div>
              {topicsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400 dark:text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700">
                  <IconFileText className="w-8 h-8 opacity-30" />
                  <p className="text-sm font-semibold">No topics found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topics.map((topic, i) => (
                    <TopicCard
                      key={topic.id}
                      title={topic.name}
                      href={`/cpct/${encodeURIComponent(topic.name)}`}
                      icon={topicIcons[i % topicIcons.length]}
                      color={topicColors[i % topicColors.length]}
                    />
                  ))}
                </div>
              )}
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


    </div>
  );
}
