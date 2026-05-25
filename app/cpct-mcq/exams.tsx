"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Trophy,
  CheckCircle2,
  XCircle,
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

export default function Exam({
  title,
  topic,
  questions,
}: Props) {
  const [current, setCurrent] = useState(0);

  const [answers, setAnswers] = useState<
    Record<number, string>
  >({});

  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(3600);

  // TIMER
  useEffect(() => {
    if (submitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSubmitted(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted]);

  // ANTI DEVTOOLS
  useEffect(() => {
    const disable = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["I", "J", "C"].includes(
            e.key.toUpperCase()
          )) ||
        (e.ctrlKey &&
          e.key.toLowerCase() === "u")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", disable);

    return () =>
      document.removeEventListener(
        "keydown",
        disable
      );
  }, []);

  function handleSelect(option: string) {
    setAnswers({
      ...answers,
      [current]: option,
    });
  }

  const score = useMemo(() => {
    return questions.reduce((acc, q, index) => {
      return answers[index] === q.correct_answer
        ? acc + 1
        : acc;
    }, 0);
  }, [answers, questions]);

  const percentage = Math.round(
    (score / questions.length) * 100
  );

  const currentQuestion = questions[current];

  // RESULT PAGE
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#030712] text-white px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#111827] rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-green-400" />
              </div>

              <div>
                <h1 className="text-4xl font-bold">
                  {title}
                </h1>

                <p className="text-gray-400 mt-1">
                  {topic}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mb-10">
              <div className="bg-[#0f172a] rounded-2xl p-6">
                <p className="text-gray-400">
                  Score
                </p>

                <h2 className="text-5xl font-bold mt-2">
                  {score}/{questions.length}
                </h2>
              </div>

              <div className="bg-[#0f172a] rounded-2xl p-6">
                <p className="text-gray-400">
                  Percentage
                </p>

                <h2 className="text-5xl font-bold mt-2">
                  {percentage}%
                </h2>
              </div>

              <div className="bg-[#0f172a] rounded-2xl p-6">
                <p className="text-gray-400">
                  Status
                </p>

                <h2
                  className={`text-4xl font-bold mt-2 ${
                    percentage >= 50
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {percentage >= 50
                    ? "PASS"
                    : "FAIL"}
                </h2>
              </div>
            </div>

            {/* REVIEW */}
            <div className="space-y-5">
              {questions.map((q, index) => {
                const correct =
                  answers[index] ===
                  q.correct_answer;

                return (
                  <div
                    key={q.id}
                    className="bg-[#0f172a] rounded-2xl p-6 border border-white/5"
                  >
                    <div className="flex justify-between">
                      <h2 className="font-semibold text-lg">
                        Q{q.question_number}.{" "}
                        {q.question}
                      </h2>

                      {correct ? (
                        <CheckCircle2 className="text-green-400" />
                      ) : (
                        <XCircle className="text-red-400" />
                      )}
                    </div>

                    <div className="mt-5 space-y-3">
                      {q.options.map(
                        (option, i) => {
                          const isCorrect =
                            option ===
                            q.correct_answer;

                          const isSelected =
                            option ===
                            answers[index];

                          return (
                            <div
                              key={i}
                              className={`p-4 rounded-xl border
                              ${
                                isCorrect
                                  ? "border-green-500 bg-green-500/10"
                                  : isSelected
                                  ? "border-red-500 bg-red-500/10"
                                  : "border-white/10"
                              }
                            `}
                            >
                              {option}
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
      </div>
    );
  }

  // EXAM UI
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* HEADER */}
        <div className="bg-[#111827] rounded-3xl border border-white/10 p-5 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {title}
            </h1>

            <p className="text-gray-400 mt-1">
              {topic}
            </p>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/20">
            <Clock className="w-5 h-5 text-red-400" />

            <span className="font-bold text-lg">
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(
                2,
                "0"
              )}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* LEFT */}
          <div className="bg-[#111827] rounded-3xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold leading-relaxed">
              {currentQuestion.question}
            </h2>

            <div className="mt-8 space-y-4">
              {currentQuestion.options.map(
                (option, i) => {
                  const selected =
                    answers[current] === option;

                  return (
                    <button
                      key={i}
                      onClick={() =>
                        handleSelect(option)
                      }
                      className={`w-full text-left p-5 rounded-2xl border transition
                      ${
                        selected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 bg-white/[0.03]"
                      }
                    `}
                    >
                      {option}
                    </button>
                  );
                }
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between mt-10">
              <button
                disabled={current === 0}
                onClick={() =>
                  setCurrent((p) => p - 1)
                }
                className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 disabled:opacity-30 flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {current === questions.length - 1 ? (
                <button
                  onClick={() =>
                    setSubmitted(true)
                  }
                  className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrent((p) => p + 1)
                  }
                  className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-[#111827] rounded-3xl border border-white/10 p-6 h-fit">
            <h2 className="text-xl font-bold mb-5">
              Questions
            </h2>

            <div className="grid grid-cols-5 gap-3">
              {questions.map((_, index) => {
                const answered =
                  answers[index];

                return (
                  <button
                    key={index}
                    onClick={() =>
                      setCurrent(index)
                    }
                    className={`h-12 rounded-xl font-semibold
                    ${
                      current === index
                        ? "bg-blue-500"
                        : answered
                        ? "bg-green-500/20 border border-green-500/20 text-green-300"
                        : "bg-white/5 border border-white/10"
                    }
                  `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}