"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

type Question = {
  id: string;
  question_number: number;
  question: string;
  options: string[];
  correct_answer: string;
};

type Props = {
  title: string;
  topic: string;
  questions: Question[];
};

function cleanText(text: string = "") {
  return text.replace(/\*\*/g, "").replace(/`/g, "").replace(/\s+/g, " ").trim();
}

function normalizeText(text: string = "") {
  return cleanText(text).toLowerCase();
}

export default function ExamPage({ title, topic, questions }: Props) {
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [marked, setMarked] = useState<number[]>([]);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentQuestion = questions[current];

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center select-none">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin mx-auto text-blue-800 dark:text-blue-200" size={32} />
          <p className="text-slate-600 dark:text-slate-400 font-bold text-xs tracking-widest uppercase">Loading Examination</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RESULT PAGE
  // ============================================
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none">
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50">
          <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-900 dark:bg-blue-700 flex items-center justify-center">
                <Trophy className="text-white dark:text-slate-100" size={14} />
              </div>
              <div>
                <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">Examination Result</h1>
                <p className="text-[9px] text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider mt-0.5">{title}</p>
              </div>
            </div>
            <Link href="/cpct" className="h-7 px-3 rounded bg-blue-900 dark:bg-blue-700 hover:bg-blue-950 dark:hover:bg-blue-800 text-white dark:text-slate-100 text-[10px] font-bold flex items-center gap-1.5 transition">
              <Home size={12} /> Exit
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 mb-6 shadow-sm dark:shadow-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <span className="text-xl font-black text-blue-900 dark:text-blue-100">{percentage}%</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {score}<span className="text-base text-slate-400 dark:text-slate-600 font-medium"> / {questions.length}</span>
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Total Score</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="rounded border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-4 py-2 text-center">
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Correct</p>
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{score}</p>
                </div>
                <div className="rounded border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 px-4 py-2 text-center">
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Wrong</p>
                  <p className="text-lg font-black text-red-700 dark:text-red-300">{questions.length - score}</p>
                </div>
                <div className="rounded border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 px-4 py-2 text-center">
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Status</p>
                  <p className={`text-sm font-black ${percentage >= 60 ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>{percentage >= 60 ? "PASS" : "FAIL"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => {
              const selected = answers[index] || "";
              const isCorrect = normalizeText(selected) === normalizeText(question.correct_answer);
              return (
                <div key={question.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-slate-900/50">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded bg-blue-900 dark:bg-blue-700 text-white dark:text-slate-100 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {question.question_number}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">{cleanText(question.question)}</h3>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"}`}>
                      {isCorrect ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <div className="space-y-1.5 ml-8">
                    {question.options.map((option, i) => {
                      const isOptCorrect = normalizeText(option) === normalizeText(question.correct_answer);
                      const isOptSelected = normalizeText(option) === normalizeText(selected);
                      return (
                        <div key={i} className={`rounded border p-2 flex items-center gap-2 text-sm ${isOptCorrect ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/50" : isOptSelected && !isOptCorrect ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/50" : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"}`}>
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${isOptCorrect ? "bg-emerald-700 dark:bg-emerald-500 text-white dark:text-slate-900" : isOptSelected ? "bg-red-500 dark:bg-red-400 text-white dark:text-slate-900" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <p className={`text-xs font-medium flex-1 ${isOptCorrect ? "text-emerald-900 dark:text-emerald-100" : isOptSelected ? "text-red-900 dark:text-red-100" : "text-slate-600 dark:text-slate-400"}`}>{cleanText(option)}</p>
                          {isOptCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          {isOptSelected && !isOptCorrect && <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />}
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
  // EXAM PAGE - 12" COMPACT LAYOUT
  // ============================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none overflow-hidden flex flex-col py-20 relative">
      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-slate-900/50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-amber-700 dark:text-amber-300" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Submit Examination?</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">Please review your progress before confirming</p>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Answered</p>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{answeredCount}</p>
                </div>
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Pending</p>
                  <p className="text-xl font-black text-amber-700 dark:text-amber-300">{notAnsweredCount}</p>
                </div>
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Marked</p>
                  <p className="text-xl font-black text-blue-700 dark:text-blue-300">{marked.length}</p>
                </div>
              </div>

              {notAnsweredCount > 0 && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/50 p-3 flex items-start gap-2">
                  <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={14} />
                  <p className="text-[11px] text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                    You have <span className="font-bold">{notAnsweredCount}</span> unanswered question{notAnsweredCount > 1 ? "s" : ""}. Are you sure you want to submit?
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={cancelSubmit}
                  className="flex-1 h-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <XCircle size={14} /> Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 h-9 rounded-lg bg-blue-900 dark:bg-blue-700 hover:bg-blue-950 dark:hover:bg-blue-800 text-white dark:text-slate-100 text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm dark:shadow-slate-900/50"
                >
                  <Send size={14} /> Confirm Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50 shrink-0">
        <div className="max-w-5xl mx-auto px-4 h-11 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
             
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-[9px] font-bold ml-3 text-slate-900 dark:text-slate-100 truncate leading-none uppercase tracking-wider">{title}</h1>
            
            </div>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs font-bold tracking-wider ${isTimeCritical ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 animate-pulse" : isTimeLow ? "bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300" : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"}`}>
            <Clock size={13} />
            <span>{formattedTime}</span>
          </div>

          <button onClick={openSubmitModal} className="h-7 px-3 rounded bg-blue-900 dark:bg-blue-700 hover:bg-blue-950 dark:hover:bg-blue-800 text-white dark:text-slate-100 text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 shrink-0 shadow-sm dark:shadow-slate-900/50">
            <Send size={12} />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[220px_1fr] gap-3 px-4 py-3">
          
          {/* Left Sidebar - Compact Palette */}
          <aside className="space-y-3">
            <div className="hidden lg:block rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={12} className="text-blue-700 dark:text-blue-300" />
                  Question Palette
                </h3>
              </div>
              <div className="p-3">
                <CompactPalette
                  questions={questions}
                  current={current}
                  answers={answers}
                  marked={marked}
                  visited={visited}
                  answeredCount={answeredCount}
                  notAnsweredCount={notAnsweredCount}
                  onJump={jumpToQuestion}
                />
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden">
              <button onClick={() => setShowPalette(!showPalette)} className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-3 shadow-sm dark:shadow-slate-900/50">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                  <Eye size={12} className="text-blue-700 dark:text-blue-300" />
                  Palette
                </span>
                {showPalette ? <ChevronLeft size={12} className="rotate-90 text-slate-900 dark:text-slate-100" /> : <ChevronRight size={12} className="rotate-90 text-slate-900 dark:text-slate-100" />}
              </button>
              {showPalette && (
                <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm dark:shadow-slate-900/50">
                  <CompactPalette
                    questions={questions}
                    current={current}
                    answers={answers}
                    marked={marked}
                    visited={visited}
                    answeredCount={answeredCount}
                    notAnsweredCount={notAnsweredCount}
                    onJump={jumpToQuestion}
                  />
                </div>
              )}
            </div>
          </aside>

          {/* Right Main - Question Card */}
          <main className="space-y-3 pb-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50 overflow-hidden">
              {/* Card Header */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-900 dark:bg-blue-700 text-white dark:text-slate-100 text-[10px] font-bold flex items-center justify-center">
                    {currentQuestion.question_number}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                    Question {current + 1} of {questions.length}
                  </span> 
                </div><div className="flex justify-center">
  <div className="px-4 py-1 rounded-md bg-gradient-to-r from-green-800 via-emerald-700 to-green-800 border border-yellow-400 dark:border-yellow-600 shadow-lg">
    <p className="text-[10px] text-yellow-100 dark:text-yellow-900 font-extrabold uppercase tracking-wider text-center">
      {topic}
    </p>
  </div>
</div>
                <div className="flex items-center gap-1.5">
                  {answers[current] ? (
                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={9} /> Answered
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      <Circle size={9} /> Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Question Body */}
              <div className="p-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed mb-4">
                  {cleanText(currentQuestion.question)}
                </h2>

                {/* Options - Screenshot Style */}
                <div className="space-y-2">
                  {currentQuestion.options.map((option, i) => {
                    const selected = answers[current] === option;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(option)}
                        className={`w-full rounded-lg border p-3 text-left transition-all duration-150 group ${selected ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950 shadow-sm" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-[11px] transition-colors shrink-0 ${selected ? "bg-blue-900 dark:bg-blue-700 text-white dark:text-slate-100" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"}`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <p className={`text-sm font-medium leading-snug flex-1 ${selected ? "text-blue-900 dark:text-blue-100" : "text-slate-700 dark:text-slate-300"}`}>
                            {cleanText(option)}
                          </p>
                          {selected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Action Bar - Screenshot Style */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReview(current)}
                      className={`h-8 px-3 rounded border flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition ${marked.includes(current) ? "border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      <Bookmark size={12} className={marked.includes(current) ? "fill-current" : ""} />
                      Mark Review
                    </button>

                    <button
                      onClick={clearAnswer}
                      disabled={!answers[current]}
                      className="h-8 px-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40"
                    >
                      <RotateCcw size={12} /> Clear
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={current === 0}
                      onClick={() => setCurrent((prev) => prev - 1)}
                      className="h-8 px-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>

                    {current === questions.length - 1 ? (
                      <button
                        onClick={openSubmitModal}
                        className="h-8 px-4 rounded bg-blue-900 dark:bg-blue-700 hover:bg-blue-950 dark:hover:bg-blue-800 text-white dark:text-slate-100 text-[10px] font-bold uppercase tracking-wider shadow-sm dark:shadow-slate-900/50 transition flex items-center gap-1.5"
                      >
                        <Send size={12} /> Finish
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrent((prev) => prev + 1)}
                        className="h-8 px-4 rounded bg-blue-900 dark:bg-blue-700 hover:bg-blue-950 dark:hover:bg-blue-800 text-white dark:text-slate-100 text-[10px] font-bold uppercase tracking-wider shadow-sm dark:shadow-slate-900/50 transition flex items-center gap-1.5"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="lg:hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm dark:shadow-slate-900/50">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Answered</p>
                  <p className="text-base font-black text-emerald-700 dark:text-emerald-300">{answeredCount}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Remaining</p>
                  <p className="text-base font-black text-amber-700 dark:text-amber-300">{notAnsweredCount}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Marked</p>
                  <p className="text-base font-black text-blue-700 dark:text-blue-300">{marked.length}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPACT PALETTE - MATCHES SCREENSHOT
// ============================================
function CompactPalette({
  questions,
  current,
  answers,
  marked,
  visited,
  answeredCount,
  notAnsweredCount,
  onJump,
}: {
  questions: Question[];
  current: number;
  answers: Record<number, string>;
  marked: number[];
  visited: Set<number>;
  answeredCount: number;
  notAnsweredCount: number;
  onJump: (index: number) => void;
}) {
  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 p-2">
          <p className="text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Answered</p>
          <p className="text-base font-black text-emerald-700 dark:text-emerald-300 leading-none mt-0.5">{answeredCount}</p>
        </div>
        <div className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 p-2">
          <p className="text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Pending</p>
          <p className="text-base font-black text-amber-700 dark:text-amber-300 leading-none mt-0.5">{notAnsweredCount}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3 text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-900 dark:bg-blue-700" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
          <span>Review</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full border border-slate-400 dark:border-slate-500" />
          <span>Not Visited</span>
        </div>
      </div>

      {/* Small Square Grid - Screenshot Style */}
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((_, index) => {
          const isAnswered = !!answers[index];
          const isMarked = marked.includes(index);
          const isCurrent = current === index;
          const isVisited = visited.has(index);

          let btnClass = "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800";
          if (isCurrent) {
            btnClass = "bg-blue-900 dark:bg-blue-700 text-white dark:text-slate-100 border-blue-900 dark:border-blue-700 shadow-sm";
          } else if (isMarked && isAnswered) {
            btnClass = "bg-emerald-500 dark:bg-emerald-600 text-white dark:text-slate-100 border-emerald-500 dark:border-emerald-600";
          } else if (isMarked) {
            btnClass = "bg-amber-500 dark:bg-amber-600 text-white dark:text-slate-100 border-amber-500 dark:border-amber-600";
          } else if (isAnswered) {
            btnClass = "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-400 dark:border-emerald-600";
          } else if (isVisited) {
            btnClass = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600";
          }

          return (
            <button
              key={index}
              onClick={() => onJump(index)}
              className={`h-8 rounded text-xs font-bold transition-all border ${btnClass}`}
              title={`Q${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}