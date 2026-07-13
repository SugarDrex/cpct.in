'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  FiCalendar, FiClock, FiBookOpen, FiRefreshCw, FiChevronRight,
  FiArrowLeft, FiCheckCircle, FiWifi, FiWifiOff, FiMenu, FiX,
  FiHome, FiFileText, FiType, FiPhone, FiLogOut, FiSun, FiMoon,
  FiGrid,
} from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { fetchExamsAction } from '@/app/actions/getMainExam';

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

// ── Helpers ───────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(d: string) {
  const [year, month, day] = d.split('-').map(Number);
  const dt = new Date(year, month - 1, day);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function extractShiftNumber(title: string): number {
  const match = title.match(/shift\s*0*(\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /><line x1="12" x2="12" y1="2" y2="4" /><line x1="12" x2="12" y1="20" y2="22" /><line x1="2" x2="4" y1="12" y2="12" /><line x1="20" x2="22" y1="12" y2="12" /></svg>
  );
}

// ── Right Sidebar (as shown in image) ──────────────────────────────────────
function RightSidebar() {
  const studyResources = [
    {
      icon: FiBookOpen,
      title: 'Practice Questions',
      subtitle: 'Topic-wise practice sets',
      href: '/#takeone',
      iconBg: 'bg-blue-500/15 text-blue-400',
    },
    {
      icon: FiFileText,
      title: 'Important Notes',
      subtitle: 'Key points & summaries',
      href: '/cpct-notes',
      iconBg: 'bg-amber-500/15 text-amber-400',
    },
    {
      icon: FiGrid,
      title: 'Tips & Tricks',
      subtitle: 'Smart strategies to crack',
      href: '/cpct-tips',
      iconBg: 'bg-rose-500/15 text-rose-400',
    },
    {
      icon: FiType,
      title: 'Typing Test',
      subtitle: 'Improve your speed',
      href: '/cpct-practice',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
    },
  ];

  return (
    <aside className="hidden xl:flex flex-col gap-5 w-80 shrink-0 mt-20">
      {/* ── Study Resources Card ── */}
      <div className="rounded-2xl border dark:border-slate-700/50 dark:bg-[#0f1629] p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiBookOpen size={18} className="text-blue-400" />
          <h3 className="dark:text-white font-semibold text-base">Study Resources</h3>
        </div>
        <div className="space-y-1">
          {studyResources.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl group transition-all duration-200 hover:bg-white/5"
            >
              <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${item.iconBg} shrink-0`}>
                <item.icon size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="dark:text-white font-medium text-sm">{item.title}</p>
                <p className="dark:text-slate-400 text-xs leading-tight">{item.subtitle}</p>
              </div>
              <FiChevronRight size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── CPCT Exam Preparation Card ── */}
      <div className="rounded-2xl border dark:border-slate-700/50 dark:bg-[#0f1629] p-5 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="dark:text-white font-semibold text-base mb-1">CPCT Exam Preparation</h3>
          <p className="text-slate-400 text-xs mb-4">Consistent Practice. Better Results.</p>
          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors duration-200">
            Stay Consistent
          </button>
        </div>
        {/* Decorative target icon */}
        <div className="absolute right-3 bottom-3 opacity-30">
            <IconTarget className="w-12 h-12" />
        </div>
      </div>

      {/* ── About CPCT Card ── */}
      <div className="rounded-2xl border dark:border-slate-700/50 dark:bg-[#0f1629] p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h3 className="dark:text-white font-semibold text-base">About CPCT</h3>
        </div>
        <p className="dark:text-slate-400 text-sm leading-relaxed mb-3">
          Computer Proficiency Certification Test conducted by NIC/MP Government.
        </p>
        <Link
          href="/about-cpct"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Learn More
          <FiChevronRight size={14} />
        </Link>
      </div>
    </aside>
  );
}

// ── Realtime badge ─────────────────────────────────────────────────────────
function RealtimeBadge({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-300
      ${connected
        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
        : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30'
      }`}>
      {connected
        ? <FiWifi size={11} className="animate-pulse" />
        : <FiWifiOff size={11} />}
      {connected ? 'Live' : 'Offline'}
    </span>
  );
}

// ── Shift Card Component ───────────────────────────────────────────────────
const CARD_THEMES = [
  { badge: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400', ring: 'hover:border-blue-400/50 hover:shadow-blue-500/10', btn: 'from-blue-600 to-blue-700' },
  { badge: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400', ring: 'hover:border-orange-400/50 hover:shadow-orange-500/10', btn: 'from-orange-500 to-orange-600' },
  { badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', ring: 'hover:border-emerald-400/50 hover:shadow-emerald-500/10', btn: 'from-emerald-600 to-emerald-700' },
  { badge: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400', ring: 'hover:border-purple-400/50 hover:shadow-purple-500/10', btn: 'from-purple-600 to-purple-700' },
];

function ShiftCard({ shift, index }: { shift: Shift; index: number }) {
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  return (
    <div className={`group relative flex flex-col gap-4 rounded-2xl
      border border-slate-200 dark:border-white/10
      bg-white dark:bg-white/[0.03]
      p-6 shadow-sm hover:shadow-xl ${theme.ring}
      transition-all duration-300 ease-out
      hover:-translate-y-1`}>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg mb-1 leading-snug">
            {shift.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5">
            <FiCalendar size={14} />
            {formatDate(shift.exam_date)}
          </p>
        </div>
        <span className={`inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-full font-bold text-sm ${theme.badge}`}>
          {shift.shift_number}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <FiBookOpen size={14} className="text-blue-500 dark:text-blue-400" />
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs">Questions</p>
            <p className="text-slate-900 dark:text-white font-semibold text-sm">{shift.total_questions}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FiClock size={14} className="text-amber-500 dark:text-amber-400" />
          <div>
            <p className="text-slate-400 dark:text-slate-500 text-xs">Duration</p>
            <p className="text-slate-900 dark:text-white font-semibold text-sm">{formatDuration(shift.duration_minutes)} hour</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30">
        <FiCheckCircle size={14} className="text-emerald-500 dark:text-emerald-400" />
        <span className="text-emerald-600 dark:text-emerald-300 text-xs font-medium">Ready to attempt</span>
      </div>

      <Link
        href={`/cpct/exam/take-exam?examId=${shift.id}`}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${theme.btn}
          text-white rounded-xl font-semibold shadow-md hover:shadow-lg
          transition-all duration-300 group-hover:translate-y-[-1px]`}>
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
    <div className="animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 h-48" />
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
    </div>
  );
}

// ── Full-page loading fallback (shown while Suspense resolves search params) ─
function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full">
        <Skeleton />
      </div>
    </div>
  );
}

// ── Page content (uses useSearchParams / useParams) ────────────────────────
function ExamShiftsPageContent() {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const allExams = await fetchExamsAction();

      const filteredExams = allExams.filter((exam: Exam) => {
        const [eYear, eMonth] = exam.exam_date.split('-').map(Number);
        return eYear === year && eMonth === month;
      });

      const newShifts: Shift[] = filteredExams
        .map((exam: Exam) => ({
          id: exam.id,
          title: exam.title,
          exam_date: exam.exam_date,
          duration_minutes: 60,
          total_questions: exam.mquestions?.length || 0,
          shift_number: extractShiftNumber(exam.title),
        }))
        .sort((a: Shift, b: Shift) =>
          new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime() ||
          a.shift_number - b.shift_number
        );

      setShifts(newShifts);
      setLastUpdated(new Date());
      setMonthLabel(MONTH_NAMES[month] || `Month ${month}`);
    } catch (error) {
      // Silently fail — no data leaks to console in production
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error loading shifts:', error);
      }
    }

    setLoading(false);
    setRefreshing(false);
  }, [year, month]);

  // Secure polling instead of exposing Supabase credentials client-side
  useEffect(() => {
    load();
    setRtConnected(true);

    const interval = setInterval(() => {
      load(true);
    }, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0f1e] transition-colors duration-300">
   
      {/* Main content area with right sidebar */}
      <div className="flex-1 min-w-0 flex">
        <div className="flex-1 min-w-0">
          {/* ── Top bar ── */}
          <header className="sticky top-0 z-30 flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8
            bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <FiMenu size={20} />
            </button>

            <Link
              href="/cpct-exams"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400
                hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200 text-sm font-medium">
              <FiArrowLeft size={16} />
              <span className="hidden sm:inline">All Exams</span>
            </Link>

            <div className="ml-auto flex items-center gap-3">
              <RealtimeBadge connected={rtConnected} />
              {lastUpdated && (
                <span className="text-slate-400 dark:text-slate-500 text-xs hidden sm:inline">
                  Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button
                onClick={() => load(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10
                  hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-medium
                  transition-all duration-200 disabled:opacity-50">
                <FiRefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </header>

          {/* ── Page header ── */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-400/20 flex items-center justify-center">
                <HiOutlineAcademicCap size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{monthLabel} {year}</h1>
                <p className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">
                  {shifts.length} shift{shifts.length !== 1 ? 's' : ''} available for practice
                </p>
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
            {loading ? (
              <Skeleton />
            ) : shifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400 dark:text-slate-500">
                <HiOutlineAcademicCap size={48} className="opacity-30" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">No shifts found.</p>
                <p className="text-sm">Check back later or try another exam date.</p>
                <Link
                  href="/cpct-exams"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
                    rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg">
                  <FiArrowLeft size={14} />
                  Back to Exams
                </Link>
              </div>
            ) : (
              <div>
                {/* Info card */}
                <div className="mb-8 rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-4">
                  <p className="text-blue-700 dark:text-blue-200 text-sm">
                    <span className="font-semibold">Tip:</span> Each exam is timed at{' '}
                    <span className="font-bold">60 minutes</span>. Attempt in a distraction-free environment for best results.
                  </p>
                </div>

                {/* Shifts grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shifts.map((shift, i) => (
                    <ShiftCard key={shift.id} shift={shift} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="hidden xl:block py-25 p-6 pl-0">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

// ── Default export — wraps content in Suspense ──────────────────────────────
// Required because ExamShiftsPageContent uses useSearchParams()
export default function ExamShiftsPage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <ExamShiftsPageContent />
    </Suspense>
  );
}