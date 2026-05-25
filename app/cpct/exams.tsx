"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Home,
  AlertCircle,
  Eye,
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

// ============================================
// CLEAN TEXT
// ============================================
function cleanText(text: string = "") {
  return text
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================
// NORMALIZE TEXT
// ============================================
function normalizeText(text: string = "") {
  return cleanText(text).toLowerCase();
}

export default function ExamPage({
  title,
  topic,
  questions,
}: Props) {
  const [current, setCurrent] = useState(0);

  const [answers, setAnswers] = useState<
    Record<number, string>
  >({});

  const [marked, setMarked] = useState<number[]>(
    []
  );

  const [submitted, setSubmitted] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(60 * 60);

  const currentQuestion =
    questions[current];

  // ============================================
  // TIMER
  // ============================================
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

  // ============================================
  // FORMAT TIME
  // ============================================
  const formattedTime = `${String(
    Math.floor(timeLeft / 3600)
  ).padStart(2, "0")}:${String(
    Math.floor((timeLeft % 3600) / 60)
  ).padStart(2, "0")}:${String(
    timeLeft % 60
  ).padStart(2, "0")}`;

  // ============================================
  // SELECT ANSWER
  // ============================================
  function handleSelect(option: string) {
    setAnswers((prev) => ({
      ...prev,
      [current]: option,
    }));
  }

  // ============================================
  // REVIEW
  // ============================================
  function toggleReview(index: number) {
    if (marked.includes(index)) {
      setMarked(
        marked.filter((item) => item !== index)
      );
    } else {
      setMarked([...marked, index]);
    }
  }

  // ============================================
  // CLEAR ANSWER
  // ============================================
  function clearAnswer() {
    const updated = { ...answers };

    delete updated[current];

    setAnswers(updated);
  }

  // ============================================
  // SCORE
  // ============================================
  const score = useMemo(() => {
    return questions.reduce(
      (acc, question, index) => {
        return normalizeText(
          answers[index]
        ) ===
          normalizeText(
            question.correct_answer
          )
          ? acc + 1
          : acc;
      },
      0
    );
  }, [answers, questions]);

  const percentage = Math.round(
    (score / questions.length) * 100
  );

  const answeredCount =
    Object.keys(answers).length;

  // ============================================
  // RESULT PAGE
  // ============================================
  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        
        {/* HEADER */}
        <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 h-[72px] flex items-center justify-between">
            
            <div>
              <h1 className="text-2xl font-black">
                Exam Result
              </h1>

              <p className="text-xs text-muted-foreground mt-1">
                {title}
              </p>
            </div>

            <Link
              href="/"
              className="h-11 px-5 rounded-2xl bg-primary text-primary-foreground flex items-center gap-2 text-sm font-semibold"
            >
              <Home className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          
          {/* SCORE CARD */}
          <div className="rounded-3xl border border-border bg-card p-6">
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              
              {/* LEFT */}
              <div className="flex items-center gap-4">
                
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>

                <div>
                  <h2 className="text-4xl font-black">
                    {score}/{questions.length}
                  </h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Final Score
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-wrap gap-3">
                
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4">
                  <p className="text-xs text-muted-foreground">
                    Correct
                  </p>

                  <h3 className="text-2xl font-black text-green-500">
                    {score}
                  </h3>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4">
                  <p className="text-xs text-muted-foreground">
                    Wrong
                  </p>

                  <h3 className="text-2xl font-black text-red-500">
                    {questions.length - score}
                  </h3>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4">
                  <p className="text-xs text-muted-foreground">
                    Percentage
                  </p>

                  <h3 className="text-2xl font-black text-blue-500">
                    {percentage}%
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="space-y-5 mt-6">
            {questions.map((question, index) => {
              const selected =
                answers[index] || "";

              const correct =
                normalizeText(selected) ===
                normalizeText(
                  question.correct_answer
                );

              return (
                <div
                  key={question.id}
                  className="rounded-3xl border border-border bg-card p-5"
                >
                  
                  {/* QUESTION */}
                  <div className="flex items-start justify-between gap-4">
                    
                    <h2 className="text-xl font-bold leading-relaxed">
                      Q
                      {
                        question.question_number
                      }
                      .{" "}
                      {cleanText(
                        question.question
                      )}
                    </h2>

                    {correct ? (
                      <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-500">
                        Correct
                      </div>
                    ) : (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-500">
                        Wrong
                      </div>
                    )}
                  </div>

                  {/* OPTIONS */}
                  <div className="space-y-3 mt-5">
                    {question.options.map(
                      (option, i) => {
                        const cleanedOption =
                          cleanText(option);

                        const cleanedCorrect =
                          cleanText(
                            question.correct_answer
                          );

                        const cleanedSelected =
                          cleanText(selected);

                        const isCorrect =
                          normalizeText(
                            option
                          ) ===
                          normalizeText(
                            question.correct_answer
                          );

                        const isSelected =
                          normalizeText(
                            option
                          ) ===
                          normalizeText(selected);

                        return (
                          <div
                            key={i}
                            className={`rounded-2xl border p-4 transition-all

                            ${
                              isCorrect
                                ? "border-green-500/30 bg-green-500/10"
                                : isSelected
                                ? "border-red-500/30 bg-red-500/10"
                                : "border-border bg-background"
                            }
                            `}
                          >
                            <div className="flex items-center justify-between gap-4">
                              
                              {/* LEFT */}
                              <div className="flex items-center gap-4">
                                
                                {/* LETTER */}
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm

                                  ${
                                    isCorrect
                                      ? "bg-green-500 text-white"
                                      : isSelected
                                      ? "bg-red-500 text-white"
                                      : "bg-muted"
                                  }
                                  `}
                                >
                                  {String.fromCharCode(
                                    65 + i
                                  )}
                                </div>

                                {/* TEXT */}
                                <div>
                                  <p className="text-base font-semibold leading-relaxed">
                                    {cleanedOption}
                                  </p>

                                  {/* TAGS */}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    
                                    {/* CORRECT */}
                                    {isCorrect && (
                                      <div className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Correct Answer
                                      </div>
                                    )}

                                    {/* WRONG */}
                                    {isSelected &&
                                      !isCorrect && (
                                        <>
                                          {/* USER */}
                                          <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                                            <XCircle className="w-3 h-3" />
                                            Your Answer
                                          </div>

                                          {/* CORRECT */}
                                          <div className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Correct:
                                            <span className="font-black">
                                              {
                                                cleanedCorrect
                                              }
                                            </span>
                                          </div>
                                        </>
                                      )}

                                    {/* USER CORRECT */}
                                    {isSelected &&
                                      isCorrect && (
                                        <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500 flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          You Selected This
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>

                              {/* RIGHT ICON */}
                              {isCorrect ? (
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                              ) : isSelected ? (
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                  <XCircle className="w-5 h-5 text-red-500" />
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // EXAM PAGE
  // ============================================
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* BG */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_30%)]" />
      </div>

      {/* HEADER */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
          
          {/* LEFT */}
          <div className="flex items-center gap-3">
            
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black">
              {current + 1}
            </div>

            <div>
              <h2 className="text-lg font-black">
                Question {current + 1}
              </h2>

              <p className="text-xs text-muted-foreground">
                {answeredCount} Answered
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            
            {/* TIMER */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 flex items-center gap-3">
              <Clock3 className="w-4 h-4 text-red-500" />

              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  Time
                </p>

                <h3 className="text-sm font-bold text-red-500">
                  {formattedTime}
                </h3>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              onClick={() =>
                setSubmitted(true)
              }
              className="h-11 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold shadow-lg"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[260px_1fr] gap-5 px-4 py-5">
        
        {/* SIDEBAR */}
        <div className="rounded-3xl border border-border bg-card p-4 h-fit sticky top-[90px]">
          
          {/* TITLE */}
          <div className="flex items-center justify-between mb-5">
            
            <div>
              <h2 className="text-lg font-black">
                Navigator
              </h2>

              <p className="text-xs text-muted-foreground mt-1">
                Questions
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            
            <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-3">
              <p className="text-[11px] text-muted-foreground">
                Done
              </p>

              <h3 className="text-xl font-black text-green-500">
                {answeredCount}
              </h3>
            </div>

            <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-3">
              <p className="text-[11px] text-muted-foreground">
                Review
              </p>

              <h3 className="text-xl font-black text-yellow-500">
                {marked.length}
              </h3>
            </div>
          </div>

          {/* QUESTION GRID */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => {
              const answered =
                answers[index];

              const isMarked =
                marked.includes(index);

              return (
                <button
                  key={index}
                  onClick={() =>
                    setCurrent(index)
                  }
                  className={`h-11 rounded-xl text-sm font-bold transition-all border

                  ${
                    current === index
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-400 scale-105"
                      : isMarked
                      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                      : answered
                      ? "bg-green-500/10 border-green-500/30 text-green-500"
                      : "bg-background border-border"
                  }
                  `}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN */}
        <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
          
          {/* TOP */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                CPCT EXAM
              </p>

              <h1 className="text-2xl md:text-3xl font-black mt-2">
                {title}
              </h1>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              
              {/* REVIEW */}
              <button
                onClick={() =>
                  toggleReview(current)
                }
                className={`h-11 px-4 rounded-2xl border flex items-center gap-2 text-sm font-medium

                ${
                  marked.includes(current)
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                    : "border-border bg-background"
                }
                `}
              >
                <Bookmark className="w-4 h-4" />
                Review
              </button>

              {/* CLEAR */}
              <button
                onClick={clearAnswer}
                className="h-11 px-4 rounded-2xl border border-border bg-background flex items-center gap-2 text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          {/* QUESTION */}
          <div className="rounded-3xl border border-border bg-background p-6">
            
            <div className="flex gap-4">
              
              <div className="min-w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-black">
                Q{current + 1}
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-black leading-[1.6]">
                  {cleanText(
                    currentQuestion.question
                  )}
                </h2>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="space-y-4 mt-8">
              {currentQuestion.options.map(
                (option, i) => {
                  const selected =
                    answers[current] ===
                    option;

                  return (
                    <button
                      key={i}
                      onClick={() =>
                        handleSelect(option)
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition-all

                      ${
                        selected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-border bg-card hover:border-blue-500/40"
                      }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm

                          ${
                            selected
                              ? "bg-blue-500 text-white"
                              : "bg-muted"
                          }
                          `}
                        >
                          {String.fromCharCode(
                            65 + i
                          )}
                        </div>

                        <p className="text-base font-semibold">
                          {cleanText(option)}
                        </p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
              
              {/* PREVIOUS */}
              <button
                disabled={current === 0}
                onClick={() =>
                  setCurrent(
                    (prev) => prev - 1
                  )
                }
                className="h-12 px-5 rounded-2xl border border-border bg-card disabled:opacity-40 flex items-center gap-2 text-sm font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* STATUS */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {answers[current] ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Selected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Not Answered
                  </>
                )}
              </div>

              {/* NEXT */}
              {current ===
              questions.length - 1 ? (
                <button
                  onClick={() =>
                    setSubmitted(true)
                  }
                  className="h-12 px-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold"
                >
                  Finish Exam
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrent(
                      (prev) => prev + 1
                    )
                  }
                  className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}