'use client';

 

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  FiCalendar, FiClock, FiBookOpen, FiZap, FiWifi,
  FiWifiOff, FiRefreshCw, FiChevronRight, FiGrid,
  FiList, FiArrowRight, FiShield, FiAward,
} from 'react-icons/fi';
import {
  HiOutlineAcademicCap, HiOutlineLightBulb, HiOutlineDocumentText,
} from 'react-icons/hi';
import { MdOutlineQuiz } from 'react-icons/md';
import { BsBarChartLine } from 'react-icons/bs';
import { fetchExamsAction, getRealtimeConfigAction } from '@/app/actions/getMainExam';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Exam {
  id: string;
  title: string;
  exam_date: string;       // "YYYY-MM-DD"
  created_at: string;
  mquestions: { id: string }[];
}

interface GroupedYear {
  year: number;
  months: {
    month: number;          // 1-12
    label: string;          // "May"
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

function formatDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Realtime badge ─────────────────────────────────────────────────────────────
function RealtimeBadge({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
      ${connected
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-red-500/20 text-red-400 border border-red-500/30'
      }`}>
      {connected
        ? <FiWifi size={11} className="animate-pulse" />
        : <FiWifiOff size={11} />}
      {connected ? 'Live' : 'Offline'}
    </span>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white/5 border border-white/10 p-5 h-28" />
  );
}

function Skeleton() {
  return (
    <div className="space-y-10">
      {[2026, 2025].map(y => (
        <div key={y}>
          <div className="h-7 w-40 bg-white/10 rounded-lg mb-4 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Month card (links to /cpct-new-exams?year=X&month=Y) ──────────────────────
function MonthCard({ month, year, count }: { month: { label: string; month: number; exams: Exam[] }; year: number; count: number }) {
  const href = `/admin/superadmin/exam/${month}?year=${year}&month=${month.month}`;
  const colors = [
    'from-blue-600/30 to-blue-800/20',
    'from-indigo-600/30 to-indigo-800/20',
    'from-violet-600/30 to-violet-800/20',
    'from-cyan-600/30 to-cyan-800/20',
  ];
  const gradient = colors[month.month % colors.length];

  return (
    <Link href={href}
      className={`group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-br ${gradient}
        backdrop-blur-sm p-5 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10
        transition-all duration-300 cursor-pointer`}>
      {/* calendar icon */}
      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
        <FiCalendar className="text-blue-400" size={18} />
      </div>
      <div>
        <p className="text-white font-bold text-lg leading-tight">{month.label}</p>
        <p className="text-slate-400 text-sm">{year}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
        <span className="text-xs text-slate-500 font-medium">{count} shift{count !== 1 ? 's' : ''}</span>
        <FiChevronRight className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" size={15} />
      </div>
    </Link>
  );
}

// ── Study Resources sidebar ────────────────────────────────────────────────────
function StudyResources() {
  const items = [
    { icon: <MdOutlineQuiz size={18} className="text-blue-400" />, label: 'Practice Questions', href: '/practice' },
    { icon: <HiOutlineLightBulb size={18} className="text-amber-400" />, label: 'Important Notes', href: '/notes' },
    { icon: <BsBarChartLine size={18} className="text-emerald-400" />, label: 'Tips & Tricks', href: '/tips' },
  ];
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
        <FiBookOpen size={16} className="text-blue-400" />
        Study Resources
      </h3>
      <ul className="space-y-1">
        {items.map(it => (
          <li key={it.label}>
            <Link href={it.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white
                hover:bg-white/10 transition-all duration-200 text-sm font-medium group">
              {it.icon}
              {it.label}
              <FiArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
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

  // Initial load + realtime subscription
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

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* ── Top accent bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
              <HiOutlineAcademicCap size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">CPCT Exam</h1>
              <p className="text-slate-500 text-xs mt-0.5">Previous year papers — All shifts</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <RealtimeBadge connected={rtConnected} />
            {lastUpdated && (
              <span className="text-slate-500 text-xs hidden sm:inline">
                Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10
                hover:bg-white/10 text-slate-300 text-xs font-medium transition-all disabled:opacity-50">
              <FiRefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            {/* total badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <FiAward size={12} />
              {totalExams} Exams
            </span>
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-8">

          {/* Left: year groups */}
          <main className="flex-1 min-w-0 space-y-10">
            {loading ? (
              <Skeleton />
            ) : grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
                <HiOutlineDocumentText size={48} className="opacity-30" />
                <p className="font-semibold">No exams found.</p>
                <p className="text-sm">Check back later or contact your administrator.</p>
              </div>
            ) : (
              grouped.map(({ year, months }) => (
                <section key={year}>
                  {/* year heading */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent" />
                    <h2 className="text-white font-extrabold text-lg tracking-wide px-1">
                      CPCT Exam {year}
                    </h2>
                    <span className="h-px flex-1 bg-gradient-to-l from-blue-500/40 to-transparent" />
                  </div>

                  {/* month grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {months.map(m => (
                      <MonthCard key={m.month} month={m} year={year} count={m.exams.length} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </main>

          {/* Right sidebar (desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-4 pt-0.5">
            <StudyResources />

            {/* Info card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiShield size={15} className="text-emerald-400" />
                <span className="text-white text-sm font-semibold">About CPCT</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Computer Proficiency Certification Test conducted by NIC/MP Government. 
                Practice with actual previous-year question papers.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}




