"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getNewExams } from "@/app/actions/getNewExams";
import { getSmartExamData } from "@/app/actions/getOldExams";

// ─── Type Interfaces ─────────────────────────────────

interface Exam {
  exam_year: number;
  exam_month: number;
  latest_exam_date: string;
}

interface Announcement {
  id: number;
  title: string;
  type: "pdf" | "link" | string;
  message: string;
  link?: string | null;
  file_path?: string | null;
}

interface NewExam {
  id: number;
  title: string;
  exam_date: string;
  duration_minutes: number;
}

interface MonthGroup {
  year: number;
  month: number;
  monthName: string;
}

interface Topic {
  id: string;
  name: string;
}



// ─── Icon Components (SVG) ─────────────────────────────────────

function CalendarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function FileTextIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function BookOpenIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

function LightbulbIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z" />
    </svg>
  );
}

function KeyboardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function UsersIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function TargetIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function GraduationCapIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M22 10l-10-6-10 6 10 6 10-6z" />
      <path d="M6 12v5a6 6 0 0012 0v-5" />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function ExamPage() {
  const [exams2024, setExams2024] = useState<Exam[]>([]);
  const [exams2023, setExams2023] = useState<Exam[]>([]);
  const [exams2022, setExams2022] = useState<Exam[]>([]);
  const [exams2021, setExams2021] = useState<Exam[]>([]);
  const [exams2020, setExams2020] = useState<Exam[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newExams, setNewExams] = useState<NewExam[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "2024" | "2023" | "2022" | "2021" | "2020">("all");
  const router = useRouter();

  // ─── Data Loading ───────────────────────────────────────────
  useEffect(() => {
    async function loadExams() {
      try {
        const data = await getNewExams();
        if (!Array.isArray(data) && typeof data === "object") {
          const allExams = Object.values(data).flat() as NewExam[];
          setNewExams(allExams);
        } else {
          setNewExams(data as NewExam[]);
        }
      } catch (err: any) {
        console.error(err);
        setDbError(err?.message ?? "Failed to load exams");
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSmartExamData();
        setExams2024(data.exams2024 || []);
        setExams2023(data.exams2023 || []);
    
        setTopics(data.topics || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // ─── Month Grouping for New Exams ───────────────────────────
  const monthGroups: MonthGroup[] = Array.from(
    new Map(
      newExams.map((exam) => {
        const date = new Date(exam.exam_date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthName = date.toLocaleString("default", { month: "long" });
        return [`${year}-${month}`, { year, month, monthName }];
      })
    ).values()
  );

  const uniqueYears = [...new Set(monthGroups.map((group) => group.year))].sort((a, b) => b - a);

  // ─── All Old Exams Combined (2020–2025) ─────────────────────
  const allOldExams = [
    ...exams2024.map((e) => ({ ...e, label: "2024" })),
    ...exams2023.map((e) => ({ ...e, label: "2023" })),
    ...exams2022.map((e) => ({ ...e, label: "2022" })),
    ...exams2021.map((e) => ({ ...e, label: "2021" })),
    ...exams2020.map((e) => ({ ...e, label: "2020" })),
  ];

  const filteredExams = activeTab === "all" 
    ? allOldExams 
    : allOldExams.filter((e) => e.label === activeTab);

  // ─── Render Functions ───────────────────────────────────────

  const renderOldExamCard = (exam: Exam & { label: string }) => {
    const monthName = new Date(0, exam.exam_month - 1).toLocaleString("default", { month: "long" });
    const isRecent = exam.label === "2024" || exam.label === "2023";

    return (
      <Link
        key={`${exam.exam_year}-${exam.exam_month}`}
        href={`/cpct-exams?year=${exam.exam_year}&month=${exam.exam_month}`}
        className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 
                   shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      >
        {/* Top accent bar */}
        <div className={`h-1.5 w-full ${isRecent ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-slate-200 dark:bg-slate-600"}`} />

        <div className="p-6 flex-1 ">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isRecent ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
              <CalendarIcon className="w-6 h-6" />
            </div>
            {isRecent && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                Popular
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {monthName} {exam.exam_year}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            CPCT Previous Year Paper
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {exam.label} Session
            </span>
            <span className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              View Papers <ArrowRightIcon className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  const renderNewExamCard = (group: MonthGroup) => {
    const examDate = new Date(group.year, group.month - 1);
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const isNew = examDate >= thirtyDaysAgo;

    return (
      <div
        key={`new-${group.year}-${group.month}`}
        onClick={() => router.push(`/cpct-new-exams?year=${group.year}&month=${group.month}`)}
        className="group cursor-pointer flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 
                   shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-pink-500" />

        <div className="p-6 flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
            {isNew && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 animate-pulse">
                NEW
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {group.monthName} {group.year}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Latest CPCT Exam Paper
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Recent Session
            </span>
            <span className="inline-flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
              View Papers <ArrowRightIcon className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
      </div>
    );
  };


  // ─── Study Resources (from screenshot sidebar) ────────────────
  const resources = [
    {
      icon: <BookOpenIcon className="w-5 h-5" />,
      title: "CPCT latest Papers",
      desc: "Topic-wise practice sets",
      href: "/#takeone",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30",
    },
    {
      icon: <FileTextIcon className="w-5 h-5" />,
      title: "Important Notes",
      desc: "Key points & summaries",
      href: "/cpct-notes",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30",
    },
    {
      icon: <LightbulbIcon className="w-5 h-5" />,
      title: "Tips & Tricks",
      desc: "Smart strategies to crack",
      href: "/cpct-tips",
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30",
    },
    {
      icon: <KeyboardIcon className="w-5 h-5" />,
      title: "Typing Test",
      desc: "Improve your speed",
      href: "/typing-test",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30",
    },
  ];

  // ─── Year Tabs ────────────────────────────────────────────────
  const yearTabs = [
    { id: "all" as const, label: "All Years", count: allOldExams.length },
    { id: "2024" as const, label: "2024", count: exams2024.length },
    { id: "2023" as const, label: "2023", count: exams2023.length },
    { id: "2022" as const, label: "2022", count: exams2022.length },
    { id: "2021" as const, label: "2021", count: exams2021.length },
    { id: "2020" as const, label: "2020", count: exams2020.length },
  ];

  return (<>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

      
      <section id="takeone" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-23">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ─── LEFT: Old Papers Grid ────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Previous Year Question Papers (2020–2025) — MP CPCT Exam Archive
                </p>
              </div>
            </div>

            {/* Year Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {yearTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse">
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full mb-6" />
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mt-4" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {dbError && !loading && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                <p className="text-red-600 dark:text-red-400 font-medium">{dbError}</p>
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                  Please try refreshing the page or check back later.
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !dbError && filteredExams.length === 0 && monthGroups.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileTextIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No papers found</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  CPCT old papers for {activeTab === "all" ? "selected years" : activeTab} will be available soon.
                </p>
              </div>
            )}

            {/* Old Papers Grid */}
            {!loading && !dbError && filteredExams.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((exam) => renderOldExamCard(exam))}
              </div>
            )}

            {/* New Exams Section (2025+) */}
            {monthGroups.length > 0 && (
              <div className="pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Latest CPCT Exams <span className="text-purple-600 dark:text-purple-400">2025</span>
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uniqueYears.map((year) => (
                    monthGroups
                      .filter((group) => group.year === year)
                      .map((group) => renderNewExamCard(group))
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ─── RIGHT SIDEBAR ────────────────────────────────── */}
          <div className="space-y-6">

            {/* Study Resources Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Study Resources
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {resources.map((resource, idx) => (
                  <Link
                    key={idx}
                    href={resource.href}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resource.color}`}>
                      {resource.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{resource.desc}</p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-4">CPCT Exam Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Total Papers</span>
                  <span className="font-bold">{allOldExams.length + monthGroups.length}</span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Years Covered</span>
                  <span className="font-bold">2020–2025</span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Languages</span>
                  <span className="font-bold">Hindi + English</span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Exam Mode</span>
                  <span className="font-bold">Online CBT</span>
                </div>
              </div>
            </div>

            {/* Official Link Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Official Resources</h3>
              <a 
                href="https://cpct.mp.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <GraduationCapIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    cpct.mp.gov.in
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Official MP CPCT Portal</div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500" />
              </a>
            </div>

          </div>
        </div>
      </section>
    </div>
 </> );
}
