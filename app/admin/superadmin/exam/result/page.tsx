'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  FiChevronLeft, FiDownload, FiBarChart2, FiAward,
  FiHome, FiArrowRight, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiShare2,
} from 'react-icons/fi';

// ── Types ──────────────────────────────────────────────────────────────────
interface Question {
  id: string;
  exam_id: string;
  question_number: number;
  question_en: string;
  question_hi: string;
  options: {
    text: string;
    value: string;
  }[];
  correct_answer: string;
}

interface Exam {
  id: string;
  title: string;
  exam_date: string;
}

interface UserAnswer {
  questionId: string;
  selected: string;
  status: string;
  markedForReview: boolean;
}

// ── Initialize Supabase ────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// ── Result Badge Component ─────────────────────────────────────────────────
function ResultBadge({ status, score, total }: { status: string; score: number; total: number }) {
  const percentage = (score / total) * 100;
  const isPassed = percentage >= 40; // Assuming 40% is passing

  return (
    <div className="text-center mb-8 select-none  ">
      <div className="inline-flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-white/20"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${(percentage / 100) * 339.29} 339.29`}
              className={isPassed ? 'text-emerald-500' : 'text-red-500'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
              {percentage.toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400 mt-1">{score}/{total}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className={`text-4xl font-black tracking-wider ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPassed ? 'PASS' : 'FAIL'}
        </p>
        <p className="text-slate-400 text-sm mt-2">
          {isPassed
            ? `Great! You scored ${percentage.toFixed(1)}% marks`
            : `You need ${(40 - percentage).toFixed(1)}% more marks to pass`}
        </p>
      </div>
    </div>
  );
}

// ── Stats Card Component ───────────────────────────────────────────────────
function StatsCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`${color} rounded-2xl p-6 text-center`}>
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
}

// ── Question Review Card ───────────────────────────────────────────────────
 function QuestionReviewCard({
  qNum,
  question,
  userAnswer,
  isCorrect,
}: {
  qNum: number;
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md select-none">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-600 font-bold">
          Question {qNum}
        </span>

        {isCorrect ? (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-semibold">
            Correct
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-semibold">
            Incorrect
          </span>
        )}
      </div>

      {/* Question */}
      <div className="mb-5">
         <h3 className="text-lg font-bold text-gray-800">
  {question.question_en}
</h3>

{question.question_hi && (
  <p className="text-gray-600 mt-2">
    {question.question_hi}
  </p>
)}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {question.options?.map((option, index) => {
          const isCorrectOption =
            option.value === question.correct_answer;

          const isUserSelected =
            option.value === userAnswer;

          let classes =
            "border rounded-xl p-4 transition-all";

          if (isCorrectOption) {
            classes +=
              " bg-green-50 border-green-500";
          } else if (
            isUserSelected &&
            !isCorrect
          ) {
            classes +=
              " bg-red-50 border-red-500";
          } else {
            classes +=
              " bg-gray-50 border-gray-200";
          }

          return (
            <div
              key={index}
              className={classes}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-600">
                  {String.fromCharCode(65 + index)}.
                </span>

                <span className="text-gray-700 flex-1">
                  {option.text}
                </span>

                {isCorrectOption && (
                  <span className="text-green-600 font-bold">
                    ✓
                  </span>
                )}

                {isUserSelected &&
                  !isCorrect && (
                    <span className="text-red-600 font-bold">
                      ✗
                    </span>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Answers */}
      <div className="grid md:grid-cols-2 gap-4 bg-gray-50 border rounded-xl p-4">
        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">
            Your Answer
          </p>

          <p className="font-bold text-gray-800 mt-1">
            {userAnswer
              ? `Option ${userAnswer}`
              : "Not Attempted"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500 font-semibold">
            Correct Answer
          </p>

          <p className="font-bold text-green-600 mt-1">
            Option {question.correct_answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Results Page ──────────────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId') || '';

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  // Load exam data and calculate results
  useEffect(() => {
    async function loadResults() {
      try {
        // Load exam details
        const { data: examData } = await supabase
          .from('mexams')
          .select('*')
          .eq('id', examId)
          .single();

        setExam(examData);

        // Load questions
        const { data: questionsData } = await supabase
          .from('mquestions')
          .select('*')
          .eq('exam_id', examId)
          .order('id');

        setQuestions(questionsData || []);

        // Load user answers from localStorage
        const storedAnswers = localStorage.getItem(`exam_${examId}_completed`);
        const userAnswers = storedAnswers ? JSON.parse(storedAnswers) : {};
        setAnswers(userAnswers);

        // Calculate score
        let correctCount = 0;
        if (questionsData && userAnswers) {
          questionsData.forEach((q, idx) => {
            const key = `q${idx + 1}`;
            const userAnswer = userAnswers[key]?.selected;
            if (userAnswer === q.correct_answer) {
              correctCount++;
            }
          });
        }
        setScore(correctCount);
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    }

    if (examId) loadResults();
  }, [examId]);

  const totalQuestions = questions.length;
  const answered = Object.values(answers).filter(a => a.selected).length;
  const notAnswered = totalQuestions - answered;
  const isPassed = (score / totalQuestions) * 100 >= 40;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white font-medium">Calculating results...</p>
        </div>
      </div>
    );
  }

  const incorrectQuestions = questions.filter((q, idx) => {
    const key = `q${idx + 1}`;
    return answers[key]?.selected !== q.correct_answer;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-blue-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{exam?.title}</h1>
            <p className="text-slate-400 text-sm">Results & Analysis</p>
          </div>
          <Link
            href="/cpct-exams"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
            <FiHome size={16} />
            Back to Exams
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Result Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md rounded-3xl p-8 mb-8">
          <ResultBadge status={isPassed ? 'PASS' : 'FAIL'} score={score} total={totalQuestions} />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg transition-all font-medium">
              <FiDownload size={16} />
              Download Report
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg transition-all font-medium">
              <FiShare2 size={16} />
              Share Results
            </button>
            <Link
              href={`/cpct-exams`}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all font-medium">
              Next Paper
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="All Questions"
            value={totalQuestions}
            color="bg-blue-100"
            icon={<FiBarChart2 size={24} className="text-blue-600" />}
          />
          <StatsCard
            title="Answered"
            value={answered}
            color="bg-emerald-100"
            icon={<FiCheckCircle size={24} className="text-emerald-600" />}
          />
          <StatsCard
            title="Not Answered"
            value={notAnswered}
            color="bg-red-100"
            icon={<FiAlertCircle size={24} className="text-red-600" />}
          />
        </div>

        {/* Detailed Review Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Detailed Review</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">
                {incorrectQuestions.length} incorrect {incorrectQuestions.length === 1 ? 'question' : 'questions'}
              </span>
            </div>
          </div>

          {/* Questions Tabs */}
          <div className="flex gap-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
            <button className="flex-shrink-0 px-4 py-2 font-semibold text-blue-400 border-b-2 border-blue-400">
              All Answers
            </button>
            {incorrectQuestions.length > 0 && (
              <button className="flex-shrink-0 px-4 py-2 font-semibold text-slate-400 hover:text-white transition-all">
                Wrong Only ({incorrectQuestions.length})
              </button>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, idx) => {
              const key = `q${idx + 1}`;
              const userAnswer = answers[key]?.selected || '';
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <div key={question.id}>
                  <QuestionReviewCard
                    qNum={idx + 1}
                    question={question}
                    userAnswer={userAnswer}
                    isCorrect={isCorrect}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <FiAward size={28} className="text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold mb-2">Continue Your Practice</h3>
              <p className="text-slate-300 text-sm mb-4">
                {isPassed
                  ? 'Great job! Try more practice papers to strengthen your concepts further.'
                  : 'Review the incorrect answers above and practice similar questions to improve.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/practice"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all font-medium">
                  Practice Questions
                  <FiArrowRight size={14} />
                </Link>
                <Link
                  href="/notes"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all font-medium">
                  Study Notes
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiBarChart2 size={20} className="text-blue-400" />
            Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Accuracy Rate</p>
              <p className="text-2xl font-bold text-emerald-400">
                {totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Attempted Questions</p>
              <p className="text-2xl font-bold text-blue-400">
                {answered}/{totalQuestions}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Time Management</p>
              <p className="text-2xl font-bold text-amber-400">
                {answered === totalQuestions ? 'Good' : 'Could be better'}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Status</p>
              <p className={`text-2xl font-bold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPassed ? 'Passed' : 'Failed'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center py-8 border-t border-white/10">
          <h3 className="text-xl font-bold mb-4">Ready for more practice?</h3>
          <p className="text-slate-400 mb-6">
            Access more exam papers and improve your score
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/cpct-exams"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all">
              <FiChevronLeft size={16} />
              Back to Exams
            </Link>
            <Link
              href="/practice"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-all">
              Practice Mode
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}