"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Bookmark,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  AlertTriangle,
  Check,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Home,
  X,
  Languages,
  Loader2,
} from "lucide-react";
import { getExam, getExamQuestions, submitExam, type ExamResult, type Exam } from "@/app/actions/getExamData";
import { translateWithDeepL } from "@/app/actions/translate";

// ============================================
// SECURITY MIDDLEWARE
// ============================================
const applySecurityMeasures = () => {
  if (typeof window === "undefined") return;

  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("selectstart", (e) => e.preventDefault());
  document.addEventListener("mousedown", (e) => {
    if (e.detail > 1) e.preventDefault();
  });

  const devtoolsCheck = setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      console.clear?.();
      window.location.href = "about:blank";
    }
  }, 500);

  document.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
      (e.ctrlKey && e.shiftKey && e.keyCode === 67) ||
      (e.ctrlKey && e.shiftKey && e.keyCode === 75) ||
      (e.keyCode === 123)
    ) {
      e.preventDefault();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.keyCode === 44 || e.key === "PrintScreen") {
      e.preventDefault();
    }
  });

  document.addEventListener(
    "copy",
    (e) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", "Content cannot be copied");
      }
    },
    true
  );

  document.addEventListener("dragstart", (e) => e.preventDefault());
  document.addEventListener("drop", (e) => e.preventDefault());

  return () => clearInterval(devtoolsCheck);
};

// Client-side question type — NO correct_answer field
type Question = {
  id: string;
  question_number: number;
  question_en: string;
  question_hi: string;
  options: Array<{
    text: string;
    value: string;
  }>;
};

function cleanText(text: string = "") {
  return text.replace(/\*\*/g, "").replace(/`/g, "").replace(/\s+/g, " ").trim();
}

// ============================================
// TRANSLATOR — languages, cache, hook, selector
// ============================================
type LangCode = "en" | "hi" | "gu" | "bn" | "pa";

const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "bn", label: "বাংলা" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];

// In-memory cache shared across the whole session: `${lang}:${text}` -> translated text
const translationCache = new Map<string, string>();

type TranslateResult = { text: string; quotaExceeded: boolean };

async function translateText(text: string, targetLang: LangCode): Promise<TranslateResult> {
  if (!text) return { text, quotaExceeded: false };
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return { text: translationCache.get(cacheKey)!, quotaExceeded: false };
  }

  // Call server action instead of direct fetch
  try {
    const { translations, quotaExceeded } = await translateWithDeepL([text], targetLang);
    const translated = translations[0] || text;

    if (!translated || translated === text) {
      return { text, quotaExceeded: false };
    }

    translationCache.set(cacheKey, translated);
    return { text: translated, quotaExceeded };
  } catch (err: any) {
    console.error("Translation failed:", err.message);
    return { text, quotaExceeded: false };
  }
}

type TranslatedQuestion = {
  question: string;
  options: string[];
};

// Translates one question's text + options into the target language.
// English and Hindi come straight from the DB fields (no API calls, never fails).
// Gujarati / Bangla / Punjabi are machine-translated via DeepL server action and cached.
function useTranslatedQuestion(question: Question | undefined, targetLang: LangCode) {
  const [translated, setTranslated] = useState<TranslatedQuestion | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    if (!question) {
      setTranslated(null);
      setQuotaExceeded(false);
      return;
    }

    if (targetLang === "en") {
      setTranslated({
        question: cleanText(question.question_en),
        options: question.options.map((o) => cleanText(o.text)),
      });
      setIsTranslating(false);
      setQuotaExceeded(false);
      return;
    }

    if (targetLang === "hi") {
      setTranslated({
        question: cleanText(question.question_hi || question.question_en),
        options: question.options.map((o) => cleanText(o.text)),
      });
      setIsTranslating(false);
      setQuotaExceeded(false);
      return;
    }

    let cancelled = false;
    setIsTranslating(true);

    async function run() {
      const sourceQuestion = cleanText(question!.question_en);
      const sourceOptions = question!.options.map((o) => cleanText(o.text));

      // Batch translate all texts in one server call for efficiency
      const allTexts = [sourceQuestion, ...sourceOptions];
      try {
        const { translations, quotaExceeded } = await translateWithDeepL(allTexts, targetLang);

        if (!cancelled) {
          const [qText, ...optTexts] = translations;
          setTranslated({
            question: qText || sourceQuestion,
            options: sourceOptions.map((_, i) => optTexts[i] || sourceOptions[i]),
          });
          setQuotaExceeded(quotaExceeded);
          setIsTranslating(false);
        }
      } catch (err) {
        if (!cancelled) {
          setTranslated({
            question: sourceQuestion,
            options: sourceOptions,
          });
          setIsTranslating(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, targetLang]);

  return { translated, isTranslating, quotaExceeded };
}

function LanguageSelector({ lang, setLang }: { lang: LangCode; setLang: (l: LangCode) => void }) {
  return (
    <div className="relative">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as LangCode)}
        aria-label="Select language"
        className="h-9 pl-8 pr-7 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer select-none appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <Languages size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <ChevronRight size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
    </div>
  );
}

function QuotaNotice() {
  return (
    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
      <AlertTriangle size={12} />
      Translation limit reached — showing English
    </span>
  );
}

// ============================================
// LUX LOADING ANIMATION COMPONENT
// ============================================
function LuxLoader() {
  return (
    <div
      className="min-h-screen bg-[#f0f0e8] dark:bg-gray-950 flex items-center justify-center select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" } as any}
    >
      <div className="text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-1 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-[spin_2s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full border-2 border-purple-400/30 animate-[spin_2.5s_linear_infinite_reverse]" />
          <div className="absolute inset-4 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-[spin_1.5s_linear_infinite]" />
          <div className="absolute inset-6 rounded-full border-2 border-emerald-400/30 animate-[spin_2s_linear_infinite]" />
          <div className="absolute inset-7 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-[spin_1s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-blue-600 dark:text-blue-400 animate-pulse" size={20} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[#1e293b] dark:text-white font-bold text-sm tracking-[0.3em] uppercase animate-pulse">
            Loading Examination
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
        <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full animate-[shimmer_2s_ease-in-out_infinite]"
            style={{ width: "60%" }}
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

// ============================================
// REVIEW QUESTION CARD (used inside ResultsPage)
// ============================================
function ReviewQuestionCard({
  question,
  index,
  status,
  breakdown,
  lang,
}: {
  question: Question;
  index: number;
  status: "correct" | "incorrect" | "skipped";
  breakdown: { selected?: string; correctAnswer?: string } | undefined;
  lang: LangCode;
}) {
  const { translated, isTranslating, quotaExceeded } = useTranslatedQuestion(question, lang);
  const userAnswer = breakdown?.selected ?? "";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {index + 1}
          </div>
          <h3 className="text-sm font-bold text-[#1e293b] dark:text-white leading-relaxed max-w-xl flex items-center gap-2">
            {translated ? translated.question : cleanText(question.question_en)}
            {isTranslating && <Loader2 size={12} className="animate-spin text-gray-400 shrink-0" />}
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
          status === "correct"
            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            : status === "incorrect"
              ? "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800"
              : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
        }`}>
          {status === "correct" ? (
            <><CheckCircle2 size={14} /> CORRECT</>
          ) : status === "incorrect" ? (
            <><XCircle size={14} /> INCORRECT</>
          ) : (
            <><AlertCircle size={14} /> SKIPPED</>
          )}
        </span>
      </div>

      {quotaExceeded && <div className="mb-3"><QuotaNotice /></div>}

      <div className="space-y-2 ml-13">
        {question.options.map((option, optIdx) => {
          const isCorrect = option.value === breakdown?.correctAnswer;
          const isSelected = userAnswer === option.value;
          const letter = ["A", "B", "C", "D"][optIdx] || String(optIdx + 1);
          const displayText = translated ? translated.options[optIdx] ?? cleanText(option.text) : cleanText(option.text);

          return (
            <div
              key={optIdx}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm ${
                isCorrect
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
                  : isSelected && status === "incorrect"
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                isCorrect
                  ? "bg-emerald-500 dark:bg-emerald-600 text-white"
                  : isSelected && status === "incorrect"
                    ? "bg-red-500 dark:bg-red-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}>
                {letter}
              </div>
              <p className={`font-medium flex-1 ${
                isCorrect
                  ? "text-emerald-700 dark:text-emerald-400"
                  : isSelected
                    ? "text-red-700 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-300"
              }`}>
                {displayText}
              </p>
              {isCorrect && <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400 shrink-0" />}
              {isSelected && status === "incorrect" && <XCircle size={18} className="text-red-500 dark:text-red-400 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// RESULTS PAGE COMPONENT
// ============================================
function ResultsPage({
    result,
  questions,
  examTitle,
  examId,
  year,
  month,
  onRetry,
  lang,
  setLang,
}: {
  result: ExamResult;
  questions: Question[];
  examTitle: string;
  examId: string;
  year: string;
  month: string;
  onRetry: () => void;
  lang: LangCode;
  setLang: (l: LangCode) => void;
}) {
  const percentage = Math.round(result.score);
  const resultMap = new Map(result.breakdown.map((b) => [b.questionNumber - 1, b]));

  const getAnswerStatus = (index: number) => {
    const breakdown = resultMap.get(index);
    if (!breakdown || !breakdown.selected) return "skipped" as const;
    if (breakdown.isCorrect) return "correct" as const;
    return "incorrect" as const;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0e8] dark:bg-gray-950 text-[#1e293b] dark:text-white select-none">
      <div className="max-w-[1400px] mx-auto px-4 pt-4 flex justify-end">
        <LanguageSelector lang={lang} setLang={setLang} />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 mt-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{percentage}%</span>
              </div>
              <div>
                <p className="text-2xl font-black text-[#1e293b] dark:text-white">{result.correct} <span className="text-gray-400 dark:text-gray-500 text-lg font-normal">/ {result.total}</span></p>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">TOTAL SCORE</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="px-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-center min-w-[90px]">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Correct</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{result.correct}</p>
              </div>
              <div className="px-6 py-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-center min-w-[90px]">
                <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1">Wrong</p>
                <p className="text-2xl font-black text-red-500 dark:text-red-400">{result.incorrect}</p>
              </div>
              <div className="px-6 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-center min-w-[90px]">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Status</p>
                <p className={`text-2xl font-black ${percentage >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  {percentage >= 60 ? "PASS" : "FAIL"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 mt-4 grid grid-cols-2 gap-4">
        <button
          onClick={onRetry}
          className="h-14 rounded-xl bg-gradient-to-b from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 transition flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <RotateCcw size={18} />
          RETAKE
        </button>
      <button
  onClick={() => {
    const base = `/exam/${encodeURIComponent(examTitle)}${encodeURIComponent(month||year)}`;
    const qs = new URLSearchParams();
    if (year && year !== "0") qs.set("year", year);
    if (month && month !== "0") qs.set("month", month);
    const url = qs.toString() ? `${base}?${qs.toString()}` : base;
    window.location.href = url;
  }}
  className="h-14 rounded-xl bg-gradient-to-b from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 transition flex items-center justify-center gap-2 cursor-pointer select-none"
>
  <Home size={18} />
 Try Old {month || "EXAM papers"}
</button>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 mt-4 pb-8 space-y-4">
        {questions.map((question, index) => (
          <ReviewQuestionCard
            key={index}
            question={question}
            index={index}
            status={getAnswerStatus(index)}
            breakdown={resultMap.get(index)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// QUESTION BODY
// ============================================
function QuestionBody({
  currentQuestion,
  lang,
  current,
  answers,
  handleSelect,
}: {
  currentQuestion: Question;
  lang: LangCode;
  current: number;
  answers: Record<number, string>;
  handleSelect: (value: string) => void;
}) {
  const { translated, isTranslating, quotaExceeded } = useTranslatedQuestion(currentQuestion, lang);

  return (
    <div className="px-6 pb-2 pt-4">
      <h2 className="text-base font-bold text-[#1e293b] dark:text-white leading-relaxed mb-1 flex items-start gap-2">
        <span>{translated ? translated.question : cleanText(currentQuestion.question_en)}</span>
        {isTranslating && <Loader2 size={14} className="animate-spin text-gray-400 shrink-0 mt-0.5" />}
      </h2>
      {lang === "en" && (
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
          {cleanText(currentQuestion.question_hi)}
        </p>
      )}
      {quotaExceeded && (
        <div className="mb-3">
          <QuotaNotice />
        </div>
      )}
      {lang === "en" ? null : !quotaExceeded && <div className="mb-6" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {currentQuestion.options.map((option, i) => {
          const selected = answers[current] === option.value;
          const letter = ["A", "B", "C", "D"][i] || String(i + 1);
          const displayText = translated ? translated.options[i] ?? cleanText(option.text) : cleanText(option.text);
          return (
            <button
              key={i}
              onClick={() => handleSelect(option.value)}
              className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer select-none ${
                selected
                  ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-100 dark:border-gray-700 bg-[#f8fafc] dark:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-600"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                selected
                  ? "bg-blue-500 dark:bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}>
                {letter}
              </div>
              <p className={`text-sm font-medium ${
                selected ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
              }`}>
                {displayText}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// MAIN EXAM PAGE CONTENT
// ============================================
function NewExamPageContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") || "";
  const year = searchParams.get("year") || "";
  const month = searchParams.get("month") || "";

  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<LangCode>("en");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [marked, setMarked] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    applySecurityMeasures();
    setMounted(true);

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    if (!examId) {
      setLoadError("No exam ID provided");
      setLoading(false);
      return;
    }

    async function loadExam() {
      try {
        const [examData, questionsData] = await Promise.all([
          getExam(examId),
          getExamQuestions(examId),
        ]);

        if (!examData || questionsData.length === 0) {
          setLoadError("Exam not found or has no questions");
          setLoading(false);
          return;
        }

        setExam(examData);
        setQuestions(questionsData as Question[]);
        setTimeLeft(3600);
        setLoading(false);
      } catch (err) {
        setLoadError("Failed to load exam");
        setLoading(false);
      }
    }

    loadExam();
  }, [examId]);

  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, timeLeft]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const isTimeLow = timeLeft < 300;
  const isTimeCritical = timeLeft < 60;

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current]: value }));
  };

  const toggleReview = (index: number) => {
    setMarked((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const jumpToQuestion = (index: number) => {
    setCurrent(index);
  };

  const openSubmitModal = () => {
    setShowSubmitModal(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !examId) return;
    setIsSubmitting(true);

    const submittedAnswers = Object.entries(answers).map(([index, selected]) => ({
      questionId: questions[parseInt(index)].id,
      selected,
    }));

    const examResult = await submitExam(examId, submittedAnswers);

    if (examResult) {
      setResult(examResult);
      setSubmitted(true);
    }
    setShowSubmitModal(false);
    setIsSubmitting(false);
  };

  const handleAutoSubmit = async () => {
    await handleSubmit();
  };

  const handleRetry = () => {
    setAnswers({});
    setMarked([]);
    setCurrent(0);
    setTimeLeft(3600);
    setSubmitted(false);
    setResult(null);
  };

  if (!mounted || loading) {
    return <LuxLoader />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#f0f0e8] dark:bg-gray-950 flex items-center justify-center select-none">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-[#1e293b] dark:text-white">Error</h1>
          <p className="text-gray-500 dark:text-gray-400">{loadError}</p>
        </div>
      </div>
    );
  }

 if (submitted && result) {
  return (
    <ResultsPage
      result={result}
      questions={questions}
      examTitle={exam?.title || ""}
      examId={examId}
      year={year || String(year || "")}
      month={month || String(month || "")}
      onRetry={handleRetry}
      lang={lang}
      setLang={setLang}
    />
  );
}

  const currentQuestion = questions[current];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#f0f0e8] dark:bg-gray-950 flex items-center justify-center select-none">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-[#1e293b] dark:text-white">No Questions</h1>
          <p className="text-gray-500 dark:text-gray-400">This exam has no questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f0f0e8] dark:bg-gray-950 text-[#1e293b] dark:text-white select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" } as any}
    >
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-[#fffef5] dark:bg-gray-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-amber-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1e293b] dark:text-white">Submit Examination?</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">Please review your progress before confirming</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 my-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-emerald-200 dark:border-emerald-800">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Answered</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{answeredCount}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-red-200 dark:border-red-800">
                <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2">Pending</p>
                <p className="text-3xl font-black text-red-500 dark:text-red-400">{unansweredCount}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border border-blue-200 dark:border-blue-800">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Marked</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{marked.length}</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  You have <span className="font-bold">{unansweredCount}</span> unanswered questions. Are you sure you want to submit?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold text-sm uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                <X size={16} />
                CANCEL
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer select-none"
              >
                <Send size={16} />
                {isSubmitting ? "SUBMITTING..." : "CONFIRM SUBMIT"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto p-4 lg:p-6 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="bg-[#1e293b] dark:bg-gray-950 px-4 py-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Indicators</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-slate-400 dark:bg-slate-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Unanswered</span>
                  </div>
                  <span className="text-lg font-bold text-slate-400 dark:text-slate-500">{unansweredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-emerald-500 dark:bg-emerald-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Answered</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-500 dark:text-emerald-400">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-amber-400 dark:bg-amber-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Marked for Review</span>
                  </div>
                  <span className="text-lg font-bold text-amber-400 dark:text-amber-500">{marked.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="bg-[#1e293b] dark:bg-gray-950 px-4 py-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Counting</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Questions</span>
                  <span className="text-lg font-bold text-[#1e293b] dark:text-white">{questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Marked for Review</span>
                  <span className="text-lg font-bold text-amber-400 dark:text-amber-500">{marked.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Questions Answered</span>
                  <span className="text-lg font-bold text-emerald-500 dark:text-emerald-400">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Questions Unanswered</span>
                  <span className="text-lg font-bold text-red-500 dark:text-red-400">{unansweredCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-start gap-3">
                <Check size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Review all answers before submitting</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={16} className="text-amber-400 dark:text-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Mark difficult questions for later review</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={16} className="text-blue-400 dark:text-blue-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Time is limited — manage wisely</span>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              
              <div className="px-6 pt-3 pb-2 text-center">
                <h1 className="text-xl font-black text-purple-500 dark:text-purple-400 uppercase tracking-wider">
                  {exam?.title || "Examination"}
                </h1>
              </div>

              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
                  Question {current + 1} of {questions.length}
                </span>  <span className=" ">
                 <LanguageSelector lang={lang} setLang={setLang} />
                </span> 

                <button 
                  onClick={() => toggleReview(current)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition border cursor-pointer select-none ${
                    marked.includes(current)
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                      : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600 dark:hover:text-amber-400"
                  }`}
                >
                  <Bookmark
                    size={14}
                    className={marked.includes(current) ? "fill-current" : ""}
                  />
                  Mark for review
                </button>
              </div>

              <QuestionBody
                currentQuestion={currentQuestion}
                lang={lang}
                current={current}
                answers={answers}
                handleSelect={handleSelect}
              />

              <div className="px-6 pb-6">
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                       <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {answeredCount}/{questions.length} Answered
                  </span>
                    <button
                      disabled={current === 0}
                      onClick={() => setCurrent((prev) => prev - 1)}
                      className="h-10 px-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer select-none"
                    >
                      <ChevronLeft size={14} /> PREVIOUS
                    </button>

                    {current === questions.length - 1 ? (
                      <button
                        onClick={openSubmitModal}
                        className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer select-none"
                      >
                        <Send size={13} /> FINISH
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrent((prev) => prev + 1)}
                        className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition flex items-center gap-2 cursor-pointer select-none"
                      >
                        NEXT <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center">
                <Clock size={22} className="text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <p className={`text-3xl font-black font-mono tracking-wider ${
                  isTimeCritical ? "text-red-500 dark:text-red-400" : isTimeLow ? "text-amber-500 dark:text-amber-400" : "text-[#1e293b] dark:text-white"
                }`}>
                  {formattedTime}
                </p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  TIME REMAINING
                </p>
              </div>
            </div>

            <div className="bg-white h-auto  dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="px-4 py-1 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-bold text-[#1e293b] dark:text-white">Questions</h3>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-5 gap-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {questions.map((_, index) => {
                    const isAnswered = !!answers[index];
                    const isMarked = marked.includes(index);
                    const isCurrent = current === index;

                    let btnClass = "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700";
                    if (isCurrent) {
                      btnClass = "bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700";
                    } else if (isMarked && isAnswered) {
                      btnClass = "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700";
                    } else if (isMarked) {
                      btnClass = "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700";
                    } else if (isAnswered) {
                      btnClass = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => jumpToQuestion(index)}
                        className={`h-10 rounded-xl text-sm font-bold transition-all border cursor-pointer select-none ${btnClass}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={openSubmitModal}
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white text-sm font-extrabold uppercase tracking-[0.2em] shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer select-none"
            >
              <ArrowRight size={20} />
              <span>SUBMIT EXAM</span>
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function NewExamPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewExamPageContent />
    </Suspense>
  );
}