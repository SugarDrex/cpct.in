'use client';

 

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  FiCalendar, FiClock, FiBookOpen, FiRefreshCw, FiChevronRight,
  FiArrowLeft, FiCheckCircle, FiWifi, FiWifiOff,
} from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { fetchExamsAction, getRealtimeConfigAction } from '@/app/actions/getMainExam';

// ── Types ──────────────────────────────────────────────────────────────────
interface Shift {
  id: string;
  title: string;
  exam_date: string;
  duration_minutes: number;
  total_questions: number;
  shift_number: number;
}

interface Exam {
  id: string;
  title: string;
  exam_date: string;
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

// ── Helpers ───────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(d: string) {
  // Parse ISO date string (YYYY-MM-DD) without timezone issues
  const [year, month, day] = d.split('-').map(Number);
  const dt = new Date(year, month - 1, day);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Helper to format date for shift title without timezone issues
function formatShiftDate(d: string) {
  const [year, month, day] = d.split('-').map(Number);
  const dt = new Date(year, month - 1, day);
  return dt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();
}

// ── Realtime badge ─────────────────────────────────────────────────────────
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

// ── Shift Card Component ───────────────────────────────────────────────────
function ShiftCard({ shift, examId }: { shift: Shift; examId: string }) {
  const colors = [
    'from-blue-600/30 to-blue-800/20',
    'from-purple-600/30 to-purple-800/20',
  ];
  const gradient = colors[shift.shift_number % colors.length];
  const buttonGradient = shift.shift_number === 1
    ? 'from-blue-600 to-blue-700'
    : 'from-purple-600 to-purple-700';

  return (
    <div className={`group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br ${gradient}
      backdrop-blur-sm p-6 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10
      transition-all duration-300`}>
      
      {/* Shift header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">{shift.title}</h3>
          <p className="text-slate-400 text-sm flex items-center gap-1.5">
            <FiCalendar size={14} />
            {formatDate(shift.exam_date)}
          </p>
        </div>
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20">
          <span className="text-white font-bold text-sm">{shift.shift_number}</span>
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <FiBookOpen size={14} className="text-blue-400" />
          <div>
            <p className="text-slate-500 text-xs">Questions</p>
            <p className="text-white font-semibold text-sm">{shift.total_questions}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FiClock size={14} className="text-amber-400" />
          <div>
            <p className="text-slate-500 text-xs">Duration</p>
            <p className="text-white font-semibold text-sm">{formatDuration(shift.duration_minutes)}</p>
          </div>
        </div>
      </div>

      {/* Ready to attempt badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
        <FiCheckCircle size={14} className="text-emerald-400" />
        <span className="text-emerald-300 text-xs font-medium">Ready to attempt</span>
      </div>

      {/* Take Exam button */}
      <Link
        href={`/admin/superadmin/exam/take-exam?examId=${shift.id}`}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${buttonGradient}
          text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/40
          transition-all duration-300 group-hover:translate-y-[-2px]`}>
        <FiCheckCircle size={16} />
        Take Exam
        <FiChevronRight size={16} />
      </Link>
    </div>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white/5 border border-white/10 p-6 h-48" />
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map(i => <SkeletonCard key={i} />)}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ExamShiftsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id as string;
  const year = parseInt(searchParams.get('year') || '0', 10);
  const month = parseInt(searchParams.get('month') || '0', 10);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [rtConnected, setRtConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [monthLabel, setMonthLabel] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      // Fetch all exams
      const allExams = await fetchExamsAction();
      
      // Filter by year and month
      const filteredExams = allExams.filter(exam => {
        const [eYear, eMonth] = exam.exam_date.split('-').map(Number);
        return eYear === year && eMonth === month;
      });

      // Transform to shifts (grouped by date)
      const shiftsMap = new Map<string, Shift>();
      filteredExams.forEach((exam, index) => {
        const key = exam.exam_date;
        if (!shiftsMap.has(key)) {
          shiftsMap.set(key, {
            id: exam.id,
            title: `${formatShiftDate(exam.exam_date)} SHIFT 01`,
            exam_date: exam.exam_date,
            duration_minutes: 60,
            total_questions: exam.mquestions?.length || 0,
            shift_number: 1,
          });
        } else {
          // If multiple exams on same date, increment shift number
          const existing = shiftsMap.get(key)!;
          shiftsMap.set(`${key}-${index}`, {
            id: exam.id,
            title: existing.title.replace('SHIFT 01', `SHIFT ${String(index + 1).padStart(2, '0')}`),
            exam_date: exam.exam_date,
            duration_minutes: 60,
            total_questions: exam.mquestions?.length || 0,
            shift_number: index + 1,
          });
        }
      });

      setShifts(Array.from(shiftsMap.values()).sort((a, b) => 
        new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
      ));
      
      setLastUpdated(new Date());
      setMonthLabel(MONTH_NAMES[month] || `Month ${month}`);
    } catch (error) {
      console.error('Error loading shifts:', error);
    }

    setLoading(false);
    setRefreshing(false);
  }, [year, month]);

  // Initial load + realtime subscription
  useEffect(() => {
    load();

    let channel: any = null;
    getRealtimeConfigAction().then(({ url, anonKey }) => {
      const sb = createClient(url, anonKey);
      channel = sb
        .channel('mexams-public')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mexams' }, () => load(true))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mquestions' }, () => load(true))
        .subscribe(status => {
          setRtConnected(status === 'SUBSCRIBED');
        });
    }).catch(error => console.error('Realtime config error:', error));

    return () => { channel?.unsubscribe(); };
  }, [load]);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* ── Top accent bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        {/* Back button */}
        <Link
          href="/cpct-exams"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
          <FiArrowLeft size={16} />
          All Exams
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
              <HiOutlineAcademicCap size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{monthLabel} {year}</h1>
              <p className="text-slate-500 text-xs mt-0.5">{shifts.length} shift{shifts.length !== 1 ? 's' : ''} available for practice</p>
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
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
        {loading ? (
          <Skeleton />
        ) : shifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
            <HiOutlineAcademicCap size={48} className="opacity-30" />
            <p className="font-semibold">No shifts found.</p>
            <p className="text-sm">Check back later or try another exam date.</p>
            <Link
              href="/cpct-exams"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all text-sm font-medium">
              <FiArrowLeft size={14} />
              Back to Exams
            </Link>
          </div>
        ) : (
          <div>
            {/* Info card */}
            <div className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-sm">
              <p className="text-blue-200 text-sm">
                <span className="font-semibold">Tip:</span> Each exam is timed at <span className="font-bold">60 minutes</span>. Attempt in a distraction-free environment for best results.
              </p>
            </div>

            {/* Shifts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shifts.map(shift => (
                <ShiftCard key={shift.id} shift={shift} examId={examId} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 