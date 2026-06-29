"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Home,
  AlertCircle,
  Eye,
  Loader2,
  Flag,
  Send,
  Circle,
  AlertTriangle,
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
  Sparkles,
  Award,
  TrendingUp,
  BookOpen,
  Lightbulb,
  ChevronDown,
  BarChart3,
  Target,
  Zap,
  Medal,
  Crown,
  Star,
} from "lucide-react";

type Question = {
  id: string;
  question_number: number;
  question: string;
  options: string[];
  correct_answer: string;
};

type PaperInfo = {
  id: string;
  title: string;
  url: string;
  questionCount: number;
};

type Props = {
  title: string;
  topic: string;
  questions: Question[];
  prevPaper?: PaperInfo | null;
  nextPaper?: PaperInfo | null;
  relatedTopics?: { name: string; url: string }[];
  topicUrl?: string;
};

function cleanText(text: string = "") {
  return text.replace(/\*\*/g, "").replace(/`/g, "").replace(/\s+/g, " ").trim();
}

function normalizeText(text: string = "") {
  return cleanText(text).toLowerCase();
}

// ============================================
// LUX LOADING ANIMATION COMPONENT
// ============================================
function LuxLoader({ isDark }: { isDark: boolean }) {
  const bgClass = isDark ? "bg-[#0f172a]" : "bg-[#f5f5f0]";
  const textClass = isDark ? "text-slate-300" : "text-[#1e293b]";

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center select-none`}>
      <div className="text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className={`absolute inset-0 rounded-full border-2 ${isDark ? "border-blue-500/20" : "border-blue-400/30"} animate-[spin_3s_linear_infinite]`} />
          <div className={`absolute inset-1 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-[spin_2s_linear_infinite]`} />
          <div className={`absolute inset-3 rounded-full border-2 ${isDark ? "border-purple-500/20" : "border-purple-400/30"} animate-[spin_2.5s_linear_infinite_reverse]`} />
          <div className={`absolute inset-4 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-[spin_1.5s_linear_infinite]`} />
          <div className={`absolute inset-6 rounded-full border-2 ${isDark ? "border-emerald-500/20" : "border-emerald-400/30"} animate-[spin_2s_linear_infinite]`} />
          <div className={`absolute inset-7 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-[spin_1s_linear_infinite_reverse]`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className={`${isDark ? "text-blue-400" : "text-blue-600"} animate-pulse`} size={20} />
          </div>
        </div>
        <div className="space-y-2">
          <p className={`${textClass} font-bold text-sm tracking-[0.3em] uppercase animate-pulse`}>
            Loading Examination
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
        <div className={`w-48 h-1 ${isDark ? "bg-slate-800" : "bg-slate-200"} rounded-full mx-auto overflow-hidden`}>
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full animate-[shimmer_2s_ease-in-out_infinite]"
            style={{ width: "60%", animation: "shimmer 2s ease-in-out infinite" }}
          />
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

export default function ExamPage({
  title,
  topic,
  questions: initialQuestions,
  relatedTopics = [],
  topicUrl = "/cpct/",
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [marked, setMarked] = useState<number[]>([]);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [questions] = useState<Question[]>(initialQuestions ?? []);
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);

  const currentQuestion = questions[current];

  // Detect dark mode from document class or localStorage
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDark(isDarkMode);
    };

    checkDarkMode();
    setMounted(true);

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("storage", checkDarkMode);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", checkDarkMode);
    };
  }, []);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  useEffect(() => {
    setVisited((prev) => new Set(prev).add(current));
  }, [current]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isTimeLow = timeLeft < 300;
  const isTimeCritical = timeLeft < 60;

  function handleSelect(option: string) {
    setAnswers((prev) => ({ ...prev, [current]: option }));
  }

  function toggleReview(index: number) {
    setMarked((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  }

  function clearAnswer() {
    const updated = { ...answers };
    delete updated[current];
    setAnswers(updated);
  }

  function jumpToQuestion(index: number) {
    setCurrent(index);
    setShowPalette(false);
  }

  const score = useMemo(() => {
    return questions.reduce((acc, q, index) => {
      return normalizeText(answers[index]) === normalizeText(q.correct_answer) ? acc + 1 : acc;
    }, 0);
  }, [answers, questions]);

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = questions.length - answeredCount;

  function openSubmitModal() {
    setShowSubmitModal(true);
  }

  function confirmSubmit() {
    setShowSubmitModal(false);
    setSubmitted(true);
  }

  function cancelSubmit() {
    setShowSubmitModal(false);
  }

  function handleRetake() {
    setCurrent(0);
    setAnswers({});
    setMarked([]);
    setVisited(new Set([0]));
    setSubmitted(false);
    setTimeLeft(60 * 60);
    setShowPalette(false);
    setShowSubmitModal(false);
  }

  // ============================================
  // NAVIGATE BACK TO TOPIC PAGE
  // (Previously tried to navigate to prevPaper/nextPaper,
  // but those props were never passed in from the parent,
  // so the buttons silently did nothing. Per requirements:
  // "Prev" now always goes back to the topic page, and the
  // "Next" button has been removed entirely.)
  // ============================================
  function goToTopic() {
    try {
      router.push(topicUrl);
    } catch {
      window.location.href = topicUrl;
    }
  }
useEffect(() => {
  document.getElementById("result-card")?.scrollIntoView();
}, []);
  // ============================================
  // THEME CLASSES
  // ============================================
  const theme = {
    pageBg: isDark ? "bg-[#0f172a]" : "bg-[#f5f5f0]",
    cardBg: isDark ? "bg-[#1e293b]" : "bg-white",
    cardBorder: isDark ? "border-slate-700" : "border-[#e8e8e3]",
    cardShadow: isDark ? "shadow-lg" : "shadow-sm",
    textPrimary: isDark ? "text-slate-100" : "text-[#1e293b]",
    textSecondary: isDark ? "text-slate-300" : "text-[#475569]",
    textMuted: isDark ? "text-slate-500" : "text-[#94a3b8]",
    textAccent: isDark ? "text-blue-400" : "text-[#2563eb]",
    sidebarHeaderBg: isDark ? "bg-[#1e3a5f]" : "bg-[#1e293b]",
    sidebarBg: isDark ? "bg-[#1e293b]/70" : "bg-white",
    sidebarBorder: isDark ? "border-slate-700/40" : "border-[#e8e8e3]",
    questionCardBg: isDark ? "bg-white" : "bg-white",
    questionCardBorder: isDark ? "border-slate-200" : "border-[#e8e8e3]",
    questionTitleBg: isDark ? "bg-slate-50" : "bg-[#f8f8f6]",
    questionTitleBorder: isDark ? "border-slate-100" : "border-[#e8e8e3]",
    optionDefault: isDark
      ? "border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100/80"
      : "border-[#dbeafe] bg-[#eff6ff] hover:border-[#93c5fd] hover:bg-[#dbeafe]/50",
    optionSelected: isDark
      ? "border-blue-500 bg-blue-100 shadow-md"
      : "border-[#3b82f6] bg-[#dbeafe] shadow-md",
    optionTextDefault: isDark ? "text-slate-700" : "text-[#334155]",
    optionTextSelected: isDark ? "text-blue-900" : "text-[#1e3a8a]",
    btnPrimary: isDark ? "bg-blue-600 hover:bg-blue-700" : "bg-[#2563eb] hover:bg-[#1d4ed8]",
    btnSecondary: isDark
      ? "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
      : "border-[#d1d5db] bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]",
    btnClear: isDark
      ? "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
      : "border-[#d1d5db] bg-white text-[#6b7280] hover:bg-[#f9fafb]",
    timerBg: isDark ? "bg-[#1e293b]/70" : "bg-white",
    timerBorder: isDark ? "border-slate-700/40" : "border-[#e8e8e3]",
    timerIconBg: isDark ? "bg-amber-500/15 border-amber-500/30" : "bg-[#fef3c7] border-[#fcd34d]",
    timerIcon: isDark ? "text-amber-400" : "text-[#d97706]",
    timerText: isDark ? "text-slate-200" : "text-[#1e293b]",
    timerTextLow: isDark ? "text-amber-400" : "text-[#d97706]",
    timerTextCritical: isDark ? "text-red-500" : "text-[#dc2626]",
    gridBtn: {
      current: isDark ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25" : "bg-[#2563eb] border-[#3b82f6] text-white shadow-md",
      markedAnswered: isDark ? "bg-emerald-600 border-emerald-500 text-white" : "bg-[#059669] border-[#10b981] text-white",
      marked: isDark ? "bg-amber-500 border-amber-400 text-white" : "bg-[#d97706] border-[#f59e0b] text-white",
      answered: isDark ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-[#d1fae5] border-[#6ee7b7] text-[#059669]",
      default: isDark ? "bg-slate-700/40 border-slate-600/50 text-slate-400 hover:bg-slate-700/60" : "bg-[#f1f5f9] border-[#e2e8f0] text-[#64748b] hover:bg-[#e2e8f0]",
    },
    submitBtn: isDark
      ? "from-emerald-500 via-emerald-600 to-emerald-700 border-emerald-400/30 shadow-[0_8px_0_rgb(4,120,87),0_14px_30px_rgba(5,150,105,0.35)] hover:shadow-[0_10px_0_rgb(4,120,87),0_18px_38px_rgba(5,150,105,0.45)]"
      : "from-[#059669] via-[#10b981] to-[#34d399] border-[#6ee7b7]/30 shadow-[0_6px_0_rgb(4,120,87),0_10px_20px_rgba(5,150,105,0.2)] hover:shadow-[0_8px_0_rgb(4,120,87),0_14px_28px_rgba(5,150,105,0.3)]",
    modalOverlay: isDark ? "bg-black/60" : "bg-black/30",
    modalBg: isDark ? "bg-[#1e293b]" : "bg-white",
    modalBorder: isDark ? "border-slate-700" : "border-[#e8e8e3]",
    modalHeader: isDark ? "bg-amber-950 border-amber-800" : "bg-[#fffbeb] border-[#fcd34d]",
    modalIconBg: isDark ? "bg-amber-900 border-amber-700" : "bg-[#fef3c7] border-[#f59e0b]",
    modalIcon: isDark ? "text-amber-300" : "text-[#d97706]",
    resultHeader: isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-[#e8e8e3]",
    resultCard: isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-[#e8e8e3]",
    scoreRing: isDark ? "bg-blue-950 border-blue-800" : "bg-[#eff6ff] border-[#bfdbfe]",
    scoreText: isDark ? "text-blue-300" : "text-[#2563eb]",
    correctBox: isDark ? "bg-emerald-950 border-emerald-700" : "bg-white border-[#bbf7d0]",
    correctText: isDark ? "text-emerald-400" : "text-[#059669]",
    correctLabel: isDark ? "text-emerald-400" : "text-[#10b981]",
    wrongBox: isDark ? "bg-red-950 border-red-700" : "bg-white border-[#fecaca]",
    wrongText: isDark ? "text-red-400" : "text-[#dc2626]",
    wrongLabel: isDark ? "text-red-400" : "text-[#ef4444]",
    statusBox: isDark ? "bg-blue-950 border-blue-700" : "bg-white border-[#bfdbfe]",
    statusLabel: isDark ? "text-blue-400" : "text-[#3b82f6]",
    passText: isDark ? "text-emerald-400" : "text-[#059669]",
    failText: isDark ? "text-red-400" : "text-[#dc2626]",
    retakeBtn: isDark
      ? "from-slate-600 via-slate-700 to-slate-800 border-slate-500/30 shadow-[0_6px_0_rgb(51,65,85),0_10px_25px_rgba(100,116,139,0.3)] hover:shadow-[0_8px_0_rgb(51,65,85),0_14px_32px_rgba(100,116,139,0.4)]"
      : "from-[#475569] via-[#64748b] to-[#94a3b8] border-slate-400/30 shadow-[0_4px_0_rgb(71,85,105),0_6px_15px_rgba(100,116,139,0.15)] hover:shadow-[0_6px_0_rgb(71,85,105),0_10px_22px_rgba(100,116,139,0.25)]",
    prevBtn: isDark
      ? "from-slate-600 via-slate-700 to-slate-800 border-slate-500/30 shadow-[0_6px_0_rgb(51,65,85),0_10px_25px_rgba(100,116,139,0.3)] hover:shadow-[0_8px_0_rgb(51,65,85),0_14px_32px_rgba(100,116,139,0.4)]"
      : "from-[#475569] via-[#64748b] to-[#94a3b8] border-slate-400/30 shadow-[0_4px_0_rgb(71,85,105),0_6px_15px_rgba(100,116,139,0.15)] hover:shadow-[0_6px_0_rgb(71,85,105),0_10px_22px_rgba(100,116,139,0.25)]",
    backBtn: isDark
      ? "bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
      : "bg-white hover:bg-[#f9fafb] text-[#475569] border-[#d1d5db]",
    reviewCard: isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-[#e8e8e3]",
    reviewQNum: isDark ? "bg-blue-600 text-white" : "bg-[#2563eb] text-white",
    reviewQText: isDark ? "text-slate-100" : "text-[#1e293b]",
    correctBadge: isDark ? "bg-emerald-950 border-emerald-700 text-emerald-400" : "bg-[#f0fdf4] border-[#bbf7d0] text-[#059669]",
    wrongBadge: isDark ? "bg-red-950 border-red-700 text-red-400" : "bg-[#fef2f2] border-[#fecaca] text-[#dc2626]",
    optCorrect: isDark ? "border-emerald-700 bg-emerald-950/50" : "border-[#bbf7d0] bg-[#f0fdf4]",
    optWrong: isDark ? "border-red-700 bg-red-950/50" : "border-[#fecaca] bg-[#fef2f2]",
    optDefault: isDark ? "border-slate-800 bg-slate-800/50" : "border-[#e8e8e3] bg-[#fafaf8]",
    optLabelCorrect: isDark ? "bg-emerald-600 text-white" : "bg-[#10b981] text-white",
    optLabelWrong: isDark ? "bg-red-500 text-white" : "bg-[#ef4444] text-white",
    optLabelDefault: isDark ? "bg-slate-700 text-slate-400" : "bg-[#e2e8f0] text-[#64748b]",
    optTextCorrect: isDark ? "text-emerald-300" : "text-[#059669]",
    optTextWrong: isDark ? "text-red-300" : "text-[#dc2626]",
    optTextDefault: isDark ? "text-slate-400" : "text-[#64748b]",
    topicCard: isDark ? "bg-[#1e293b]/60 border-slate-700/50" : "bg-white border-[#e8e8e3]",
    topicItem: isDark ? "bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50" : "bg-[#f8f8f6] hover:bg-[#f1f5f9] border-[#e8e8e3]",
    topicText: isDark ? "text-slate-300" : "text-[#475569]",
  };

  if (!mounted) {
    return <LuxLoader isDark={false} />;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className={`min-h-screen ${theme.pageBg} ${theme.textPrimary} flex items-center justify-center select-none`}>
        <div className="text-center space-y-4 max-w-sm px-4">
          <AlertCircle className={`mx-auto ${theme.wrongText}`} size={32} />
          <p className="text-sm font-bold">No questions available for this exam.</p>
          <Link
            href={topicUrl}
            className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg ${theme.backBtn} border text-xs font-bold transition`}
          >
            <ArrowLeft size={14} /> Back to {topic}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // RESULT PAGE
  // ============================================
  if (submitted) {
    return (
      <div className={`min-h-screen ${theme.pageBg} ${theme.textPrimary} select-none`}>
        {/* Header */}
        <header className={`border-b ${theme.resultHeader} ${theme.cardShadow}`}>
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
                <Trophy className="text-white" size={16} />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-none">Examination Result</h1>
                <p className={`text-[10px] ${theme.textMuted} font-medium uppercase tracking-wider mt-0.5`}>{title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={topicUrl}
                className={`h-8 px-4 rounded-lg ${theme.backBtn} border cursor-pointer  text-xs font-bold flex items-center gap-1.5 transition`}
              >
                <ArrowLeft size={14} /> Back to {topic}
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Score Card */}
          <div className={`rounded-xl border ${theme.resultCard} ${theme.cardShadow} p-6 mb-6`}>
            <div  id="result-card" className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${theme.scoreRing} border-2 flex items-center justify-center`}>
                  <span className={`text-2xl font-black ${theme.scoreText}`}>{percentage}%</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black">
                    {score}<span className={`text-lg ${theme.textMuted} font-medium`}> / {questions.length}</span>
                  </h2>
                  <p className={`text-xs ${theme.textMuted} font-bold uppercase tracking-wider mt-1`}>Total Score</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`rounded-lg border ${theme.correctBox} px-5 py-3 text-center min-w-[80px]`}>
                  <p className={`text-[10px] font-bold ${theme.correctLabel} uppercase tracking-wider`}>Correct</p>
                  <p className={`text-2xl font-black ${theme.correctText} mt-1`}>{score}</p>
                </div>
                <div className={`rounded-lg border ${theme.wrongBox} px-5 py-3 text-center min-w-[80px]`}>
                  <p className={`text-[10px] font-bold ${theme.wrongLabel} uppercase tracking-wider`}>Wrong</p>
                  <p className={`text-2xl font-black ${theme.wrongText} mt-1`}>{questions.length - score}</p>
                </div>
                <div className={`rounded-lg border ${theme.statusBox} px-5 py-3 text-center min-w-[80px]`}>
                  <p className={`text-[10px] font-bold ${theme.statusLabel} uppercase tracking-wider`}>Status</p>
                  <p className={`text-sm font-black mt-1 ${percentage >= 60 ? theme.passText : theme.failText}`}>{percentage >= 60 ? "PASS" : "FAIL"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid - 2 columns: Retake + Back to Topic (Next button removed) */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Retake Exam Button */}
            <button
              onClick={handleRetake}
              className={`
                group h-14 rounded-xl
                bg-gradient-to-b ${theme.retakeBtn}
                text-white text-sm font-extrabold uppercase tracking-[0.12em]
                transition-all duration-200 ease-out
                hover:-translate-y-0.5 hover:scale-[1.01]
                active:translate-y-[2px] active:scale-[0.99]
                focus:outline-none focus:ring-4 focus:ring-slate-500/20
                flex items-center justify-center gap-2 cursor-pointer
              `}
            >
              <RotateCcw size={16} className="transition-transform duration-300 group-hover:-rotate-180" />
              <span>Retake</span>
            </button>

            {/* Back to Topic Button (replaces "Previous Paper" — always works now) */}
            <button
              onClick={() => router.push(`${topicUrl}${topic}`)}
              className={`
                group h-14 rounded-xl
                bg-gradient-to-b ${theme.prevBtn}
                text-white text-sm font-extrabold uppercase tracking-[0.12em]
                transition-all duration-200 ease-out
                hover:-translate-y-0.5 hover:scale-[1.01]
                active:translate-y-[2px] active:scale-[0.99]
                focus:outline-none focus:ring-4 focus:ring-slate-500/20
                flex items-center justify-center gap-2 cursor-pointer
              `}
            >
              <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
              <span className="truncate max-w-[250px]">Back to {topic}</span>
            </button>
          </div>

          {/* Questions Review */}
          <div className="space-y-4">
            {questions.map((question, index) => {
              const selected = answers[index] || "";
              const isCorrect = normalizeText(selected) === normalizeText(question.correct_answer);
              return (
                <div key={question.id} className={`rounded-xl border ${theme.reviewCard} ${theme.cardShadow} p-5`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3">
                      <span className={`w-8 h-8 rounded-lg ${theme.reviewQNum} text-xs font-bold flex items-center justify-center shrink-0 mt-0.5`}>
                        {question.question_number}
                      </span>
                      <h3 className={`text-sm font-bold ${theme.reviewQText} leading-relaxed`}>{cleanText(question.question)}</h3>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${isCorrect ? theme.correctBadge : theme.wrongBadge}`}>
                      {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <div className="space-y-2 ml-11">
                    {question.options.map((option, i) => {
                      const isOptCorrect = normalizeText(option) === normalizeText(question.correct_answer);
                      const isOptSelected = normalizeText(option) === normalizeText(selected);
                      return (
                        <div key={i} className={`rounded-lg border p-3 flex items-center gap-3 text-sm ${isOptCorrect ? theme.optCorrect : isOptSelected && !isOptCorrect ? theme.optWrong : theme.optDefault}`}>
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${isOptCorrect ? theme.optLabelCorrect : isOptSelected ? theme.optLabelWrong : theme.optLabelDefault}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <p className={`text-sm font-medium flex-1 ${isOptCorrect ? theme.optTextCorrect : isOptSelected ? theme.optTextWrong : theme.optTextDefault}`}>{cleanText(option)}</p>
                          {isOptCorrect && <CheckCircle2 className={`w-4 h-4 ${theme.correctText} shrink-0`} />}
                          {isOptSelected && !isOptCorrect && <XCircle className={`w-4 h-4 ${theme.wrongText} shrink-0`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // EXAM PAGE
  // ============================================
  return (
    <div className={`min-h-screen ${theme.pageBg} ${theme.textPrimary} select-none overflow-hidden flex flex-col`}>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${theme.modalOverlay} backdrop-blur-sm p-4`}>
          <div className={`w-full max-w-md rounded-2xl border ${theme.modalBorder} ${theme.modalBg} shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}>
            <div className={`${theme.modalHeader} border-b p-5 flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-full ${theme.modalIconBg} border-2 flex items-center justify-center shrink-0`}>
                <AlertTriangle className={theme.modalIcon} size={24} />
              </div>
              <div>
                <h3 className={`text-base font-bold ${theme.textPrimary}`}>Submit Examination?</h3>
                <p className={`text-xs ${theme.textMuted} font-medium`}>Please review your progress before confirming</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className={`rounded-xl border ${theme.correctBox} p-4 text-center`}>
                  <p className={`text-[10px] font-bold ${theme.correctLabel} uppercase tracking-wider`}>Answered</p>
                  <p className={`text-2xl font-black ${theme.correctText}`}>{answeredCount}</p>
                </div>
                <div className={`rounded-xl border ${theme.wrongBox} p-4 text-center`}>
                  <p className={`text-[10px] font-bold ${theme.wrongLabel} uppercase tracking-wider`}>Pending</p>
                  <p className={`text-2xl font-black ${theme.wrongText}`}>{notAnsweredCount}</p>
                </div>
                <div className={`rounded-xl border ${theme.statusBox} p-4 text-center`}>
                  <p className={`text-[10px] font-bold ${theme.statusLabel} uppercase tracking-wider`}>Marked</p>
                  <p className={`text-2xl font-black ${theme.textAccent}`}>{marked.length}</p>
                </div>
              </div>

              {notAnsweredCount > 0 && (
                <div className={`rounded-xl border ${theme.wrongBox} p-4 flex items-start gap-3`}>
                  <AlertCircle className={theme.wrongText} size={18} />
                  <p className={`text-sm ${theme.wrongText} font-medium leading-relaxed`}>
                    You have <span className="font-bold">{notAnsweredCount}</span> unanswered question{notAnsweredCount > 1 ? "s" : ""}. Are you sure you want to submit?
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={cancelSubmit}
                  className={`flex-1 h-10 rounded-xl cursor-pointer border ${isDark ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-[#d1d5db] bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"} text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2`}
                >
                  <XCircle size={16} /> Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 h-10 rounded-xl cursor-pointer bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send size={16} /> Confirm Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[280px_1fr_280px] gap-5 px-4 py-26">

          {/* LEFT SIDEBAR */}
          <aside className="space-y-4">
            {/* Indicators Section */}
            <div className={`rounded-xl border ${theme.sidebarBorder} ${theme.sidebarBg} backdrop-blur-sm shadow-xl overflow-hidden`}>
              <div className={`px-4 py-3 ${theme.sidebarHeaderBg} rounded-t-xl`}>
                <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Indicators</h3>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between py-2 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5.5 h-5.5 rounded bg-slate-500" />
                    <span className={`text-[11px] font-medium ${theme.textMuted}`}>Unanswered</span>
                  </div>
                  <span className={`text-sm font-black ${theme.textMuted}`}>{notAnsweredCount}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5.5 h-5.5 rounded bg-emerald-500" />
                    <span className={`text-[11px] font-medium ${theme.textMuted}`}>Answered</span>
                  </div>
                  <span className={`text-sm font-black ${theme.correctText}`}>{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5.5 h-5.5 rounded bg-amber-300" />
                    <span className={`text-[11px] font-medium ${theme.textMuted}`}>Marked for Review</span>
                  </div>
                  <span className="text-sm font-black text-amber-300">{marked.length}</span>
                </div>
              </div>
            </div>

            {/* Counting Section */}
            <div className={`rounded-xl border ${theme.sidebarBorder} ${theme.sidebarBg} backdrop-blur-sm shadow-xl overflow-hidden`}>
              <div className={`px-4 py-3 ${theme.sidebarHeaderBg} rounded-t-xl`}>
                <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Counting</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-medium ${theme.textMuted}`}>Total Questions</span>
                  <span className={`text-sm font-black ${theme.textSecondary}`}>{questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-medium ${theme.textMuted}`}>Marked for Review</span>
                  <span className={`text-sm font-black text-amber-300`}>{marked.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-medium ${theme.textMuted}`}>Questions Answered</span>
                  <span className={`text-sm font-black ${theme.correctText}`}>{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-medium ${theme.textMuted}`}>Questions Unanswered</span>
                  <span className={`text-sm font-black ${theme.wrongText}`}>{notAnsweredCount}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className={`rounded-xl border ${theme.sidebarBorder} ${isDark ? "bg-[#1e293b]/50" : "bg-white/50"} backdrop-blur-sm shadow-lg p-4`}>
              <div className="space-y-2.5">
                <p className={`text-[11px] ${theme.textMuted} font-medium flex items-start gap-2`}>
                  <Check size={12} className="shrink-0 mt-0.5 text-emerald-500" />
                  Review all answers before submitting
                </p>
                <p className={`text-[11px] ${theme.textMuted} font-medium flex items-start gap-2`}>
                  <Check size={12} className="shrink-0 mt-0.5 text-amber-500" />
                  Mark difficult questions for later review
                </p>
                <p className={`text-[11px] ${theme.textMuted} font-medium flex items-start gap-2`}>
                  <Check size={12} className="shrink-0 mt-0.5 text-blue-500" />
                  Time is limited — manage wisely
                </p>
              </div>
            </div>
          </aside>

          {/* CENTER - Question Card */}
          <main className="space-y-4 ">
            <div className={`rounded-2xl border ${theme.questionCardBorder} ${theme.questionCardBg} shadow-2xl overflow-hidden`}>
              {/* Card Header with Gradient Title */}
              <div className="px-6 pt-5 pb-3">
                <h1 className="text-center text-xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent uppercase tracking-wider leading-tight">
                  {title}
                </h1>
              </div>

              {/* Question Info Bar */}
              <div className={`px-6 py-3 ${theme.questionTitleBg} border-y ${theme.questionTitleBorder} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-[11px] font-bold">
                    Question {current + 1} of {questions.length}
                  </span>
                </div>
                <button
                  onClick={() => toggleReview(current)}
                  className={`flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition border ${marked.includes(current) ? "bg-amber-100 text-amber-700 border-amber-300" : "text-slate-500 hover:text-amber-600 border-slate-300 hover:border-amber-300 bg-white"}`}
                >
                  <Bookmark size={12} className={marked.includes(current) ? "fill-current" : ""} />
                  Mark for review
                </button>
              </div>

              {/* Question Body */}
              <div className="p-6">
                <h2 className={`text-[15px] font-bold ${theme.optionTextDefault} leading-relaxed mb-6`}>
                  {cleanText(currentQuestion.question)}
                </h2>

                {/* Options - 2 Column Grid Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, i) => {
                    const selected = answers[current] === option;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(option)}
                        className={`rounded-xl cursor-pointer border-2 p-5 text-left transition-all duration-200 ${selected ? theme.optionSelected : theme.optionDefault}`}
                      >
                        <p className={`text-[15px] font-medium leading-snug ${selected ? theme.optionTextSelected : theme.optionTextDefault}`}>
                          {cleanText(option)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                  {/* <button
                    onClick={clearAnswer}
                    disabled={!answers[current]}
                    className={`h-9 px-4 rounded-lg border ${theme.btnClear} text-[11px] font-bold uppercase tracking-wider transition disabled:opacity-40 flex items-center gap-2`}
                  >
                    <RotateCcw size={14} /> Clear
                  </button>*/}

                  <div className={`text-[11px] font-medium ${theme.textMuted}`}>
                    {answeredCount}/{questions.length} Answered
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      disabled={current === 0}
                      onClick={() => setCurrent((prev) => prev - 1)}
                      className={`h-9 px-5 cursor-pointer rounded-lg border ${theme.btnSecondary} text-[11px] font-bold uppercase tracking-wider transition disabled:opacity-40 flex items-center gap-2`}
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>

                    {current === questions.length - 1 ? (
                      <button
                        onClick={openSubmitModal}
                        className={`h-9 px-6 rounded-lg ${theme.btnPrimary} text-white text-[11px] cursor-pointer font-bold uppercase tracking-wider shadow-lg transition flex items-center gap-2`}
                      >
                        <Send size={13} /> Finish
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrent((prev) => prev + 1)}
                        className={`h-9 px-6 rounded-lg ${theme.btnPrimary} text-white text-[11px] cursor-pointer font-bold uppercase tracking-wider shadow-lg transition flex items-center gap-2`}
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-4">
            {/* Timer */}
            <div className={`rounded-xl border ${theme.timerBorder} ${theme.timerBg} backdrop-blur-sm shadow-xl overflow-hidden`}>
              <div className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${theme.timerIconBg} flex items-center justify-center border`}>
                  <Clock size={18} className={theme.timerIcon} />
                </div>
                <div>
                  <p className={`text-2xl font-black font-mono tracking-wider ${isTimeCritical ? theme.timerTextCritical : isTimeLow ? theme.timerTextLow : theme.timerText}`}>
                    {formattedTime}
                  </p>
                  <p className={`text-[9px] font-bold ${theme.textMuted} uppercase tracking-widest mt-0.5`}>Time Remaining</p>
                </div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className={`rounded-xl border ${theme.sidebarBorder} ${theme.sidebarBg} backdrop-blur-sm shadow-xl overflow-hidden`}>
              <div className={`px-4 py-3 border-b ${theme.cardBorder}`}>
                <h3 className={`text-sm font-bold ${theme.textSecondary}`}>Questions</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {questions.map((_, index) => {
                    const isAnswered = !!answers[index];
                    const isMarked = marked.includes(index);
                    const isCurrent = current === index;

                    let btnClass = "";

                    if (isCurrent) {
                      btnClass = theme.gridBtn.current;
                    } else if (isMarked && isAnswered) {
                      btnClass = theme.gridBtn.markedAnswered;
                    } else if (isMarked) {
                      btnClass = theme.gridBtn.marked;
                    } else if (isAnswered) {
                      btnClass = theme.gridBtn.answered;
                    } else {
                      btnClass = theme.gridBtn.default;
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => jumpToQuestion(index)}
                        className={`h-10 cursor-pointer rounded-lg text-sm font-bold transition-all border ${btnClass}`}
                        title={`Q${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Exam Button */}
            <button
              onClick={openSubmitModal}
              className={`
                w-full h-14
                rounded-2xl
                bg-gradient-to-b ${theme.submitBtn}
                text-white text-sm font-extrabold uppercase tracking-[0.22em]
                transition-all duration-200 ease-out
                hover:-translate-y-1
                hover:scale-[1.01]
                active:translate-y-[4px]
                active:scale-[0.99]
                focus:outline-none
                focus:ring-4
                focus:ring-emerald-500/30
                flex items-center justify-center gap-3 cursor-pointer
              `}
            >
              <ArrowRight size={20} className="transition-transform duration-200" />
              <span>Submit Exam</span>
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
