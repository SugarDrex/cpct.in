'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
    FiChevronLeft, FiChevronRight, FiClock, FiCheckCircle,
    FiAlertCircle, FiBookmark, FiHome, FiArrowRight,
} from 'react-icons/fi';
import { MdReportProblem } from 'react-icons/md';

interface Question {
    id: string;
    exam_id: string;
    question_number: number;
    question_en: string;
    question_hi: string ;
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
    total_questions: number;
}

type AnswerStatus = 'unanswered' | 'answered' | 'marked' | 'answered_marked';

interface UserAnswer {
    questionId: string;
    selected: string;
    status: AnswerStatus;
    markedForReview: boolean;
}

// ── Initialize Supabase ────────────────────────────────────────────────────
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// ── Utility Functions ──────────────────────────────────────────────────────
function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ── Indicator Badge Component ──────────────────────────────────────────────
function IndicatorBadge({
    label,
    count,
    color,
    icon,
}: {
    label: string;
    count: number;
    color: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10">
            <span className={`text-lg ${color}`}>{icon}</span>
            <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-sm font-bold text-white">{count}</p>
            </div>
        </div>
    );
}

// ── Sidebar Indicators ─────────────────────────────────────────────────────
function IndicatorsSidebar({ answers }: { answers: Record<string, UserAnswer> }) {
    const unanswered = Object.values(answers).filter(a => a.status === 'unanswered').length;
    const answered = Object.values(answers).filter(a => a.status === 'answered').length;
    const marked = Object.values(answers).filter(a => a.markedForReview).length;
    const total = Object.keys(answers).length;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-4">
            {/* Indicators Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-4 py-3 rounded-lg font-bold text-sm">
                Indicators
            </div>

            {/* Status Badges */}
            <div className="space-y-2.5">
                <IndicatorBadge
                    label="Unanswered"
                    count={unanswered}
                    color="text-gray-400"
                    icon={<div className="w-3 h-3 rounded-sm bg-gray-400" />}
                />
                <IndicatorBadge
                    label="Answered"
                    count={answered}
                    color="text-emerald-500"
                    icon={<div className="w-3 h-3 rounded-sm bg-emerald-500" />}
                />
                <IndicatorBadge
                    label="Marked for Review"
                    count={marked}
                    color="text-yellow-500"
                    icon={<div className="w-3 h-3 rounded-sm bg-yellow-500" />}
                />
            </div>

            {/* Counting Section */}
            <div className="border-t border-white/10 pt-4">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-4 py-3 rounded-lg font-bold text-sm mb-3">
                    Counting
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Total Questions</span>
                        <span className="font-bold text-white text-sm">{total}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Questions Answered</span>
                        <span className="font-bold text-emerald-400 text-sm">{answered}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Questions Unanswered</span>
                        <span className="font-bold text-red-400 text-sm">{unanswered}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Question Navigator ─────────────────────────────────────────────────────
function QuestionNavigator({
    totalQuestions,
    currentQuestion,
    onSelectQuestion,
    answers,
}: {
    totalQuestions: number;
    currentQuestion: number;
    onSelectQuestion: (qNum: number) => void;
    answers: Record<string, UserAnswer>;
}) {
    const getButtonColor = (qNum: number) => {
        const answer = answers[`q${qNum}`];
        if (!answer) return 'bg-gray-400 text-white';
        if (answer.markedForReview && answer.selected) return 'bg-cyan-500 text-white';
        if (answer.markedForReview) return 'bg-yellow-500 text-white';
        if (answer.selected) return 'bg-emerald-500 text-white';
        return 'bg-gray-400 text-white';
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
            <h3 className="text-white font-bold text-sm mb-4">Questions</h3>
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(qNum => (
                    <button
                        key={qNum}
                        onClick={() => onSelectQuestion(qNum)}
                        className={`w-full h-10 rounded-lg font-semibold text-sm transition-all ${currentQuestion === qNum
                            ? 'ring-2 ring-blue-400 ' + getButtonColor(qNum)
                            : getButtonColor(qNum)
                            } hover:shadow-lg`}>
                        {qNum}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── Main Exam Portal ───────────────────────────────────────────────────────
export default function ExamPortal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const examId = searchParams.get('examId') || '';

    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
    const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour
    const [loading, setLoading] = useState(true);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    // Load data from Supabase
    useEffect(() => {
        async function loadExam() {
            try {
                // Fetch exam details
                const { data: examData } = await supabase
                    .from('mexams')
                    .select('*')
                    .eq('id', examId)
                    .single();

                if (examData) {
                    setExam(examData);

                    // Fetch questions
                    const { data: questionsData } = await supabase
                        .from('mquestions')
                        .select('*')
                        .eq('exam_id', examId)
                        .order('id');

                    if (questionsData) {
                        setQuestions(questionsData);

                        // Initialize answers from localStorage
                        const storedAnswers = localStorage.getItem(`exam_${examId}`);
                        if (storedAnswers) {
                            setAnswers(JSON.parse(storedAnswers));
                        } else {
                            const initialAnswers: Record<string, UserAnswer> = {};
                            questionsData.forEach((_, idx) => {
                                initialAnswers[`q${idx + 1}`] = {
                                    questionId: questionsData[idx].id,
                                    selected: '',
                                    status: 'unanswered',
                                    markedForReview: false,
                                };
                            });
                            setAnswers(initialAnswers);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading exam:', error);
            } finally {
                setLoading(false);
            }
        }

        if (examId) loadExam();
    }, [examId]);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Save answers to localStorage
    useEffect(() => {
        if (examId && Object.keys(answers).length > 0) {
            localStorage.setItem(`exam_${examId}`, JSON.stringify(answers));
        }
    }, [answers, examId]);

    const currentQ = questions[currentQuestion - 1];

    const handleSelectAnswer = (option: string) => {
        const key = `q${currentQuestion}`;
        setAnswers(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                selected: option,
                status: 'answered' as AnswerStatus,
            },
        }));
    };

    const handleMarkForReview = () => {
        const key = `q${currentQuestion}`;
        setAnswers(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                markedForReview: !prev[key].markedForReview,
            },
        }));
    };

    const handleSubmitExam = () => {
        localStorage.setItem(`exam_${examId}_completed`, JSON.stringify(answers));
        router.push(`/admin/superadmin/exam/result?examId=${examId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-white font-medium">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (!currentQ) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 flex items-center justify-center">
                <div className="text-center text-white">
                    <MdReportProblem size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Exam not found</p>
                </div>
            </div>
        );
    }

    const answeredCount = Object.values(answers).filter(a => a.selected).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white">
            {/* Header */}
            <div className=" top-0 z-40 border-b border-white/10 bg-blue-950/80 backdrop-blur-md">
                <div className="max-w-full px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{exam?.title}</h1>
                            <p className="text-slate-400 text-sm mt-1">Shift {currentQuestion}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-900 rounded-lg border border-blue-700">
                                <FiClock size={16} className="text-amber-400" />
                                <span className="font-bold">{formatTime(timeRemaining)}</span>
                            </div>
                            <Link
                                href="/cpct-exams"
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                                <FiHome size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <IndicatorsSidebar answers={answers} />
                        {/* Instructions */}
                        <div className=" bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
                            <p className="text-xs text-slate-300 leading-relaxed">
                                ✓ Review all answers before submitting<br />
                                ✓ Mark difficult questions for later review<br />
                                ✓ Time is limited — manage wisely
                            </p>
                        </div>
                    </div>

                    {/* Main Question Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            {/* Question Header */}
                            <div className="mb-6 pb-6 border-b-2 border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                        Question {currentQuestion} of {questions.length}
                                    </span>
                                    <button
                                        onClick={handleMarkForReview}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all ${answers[`q${currentQuestion}`]?.markedForReview
                                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}>
                                        <FiBookmark size={14} />
                                        {answers[`q${currentQuestion}`]?.markedForReview ? 'Marked' : 'Mark'}
                                    </button>
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    {currentQ.question_en } <br />{currentQ.question_hi}
                                </h2>
                            </div>

                            {currentQ.options?.map((option, index) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelectAnswer(option.value)}
                                    className={`w-full p-4  rounded-xl border-2 text-left transition-all ${answers[`q${currentQuestion}`]?.selected === option.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                                        }`}
                                >
                                    <span className="font-bold text-blue-600 mr-4">
                                        {String.fromCharCode(65 + index)}.
                                    </span>

                                    <span className="text-gray-800">
                                        {option.text}
                                    </span>
                                </button>
                            ))}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between gap-4 py-5">
                                <button
                                    onClick={() => currentQuestion > 1 && setCurrentQuestion(currentQuestion - 1)}
                                    disabled={currentQuestion === 1}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-all">
                                    <FiChevronLeft size={18} />
                                    Previous
                                </button>

                                <span className="text-sm text-gray-600 font-medium">
                                    {answeredCount}/{questions.length} Answered
                                </span>

                                <button
                                    onClick={() => currentQuestion < questions.length && setCurrentQuestion(currentQuestion + 1)}
                                    disabled={currentQuestion === questions.length}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all">
                                    Next
                                    <FiChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Action Panel */}
                    <div className="lg:col-span-1 space-y-4 h-fit sticky top-32">
                        {/* Stats Card */}
                        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-5">
                            <h3 className="text-white font-bold text-sm mb-3">Progress</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">Completed</span>
                                    <span className="font-bold text-emerald-400">{answeredCount}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all"
                                        style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={() => setShowSubmitConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                            <FiArrowRight size={18} />
                            Submit Exam
                        </button>
                        <div className="lg:col-span-1 space-y-4 ">

                            <QuestionNavigator
                                totalQuestions={questions.length}
                                currentQuestion={currentQuestion}
                                onSelectQuestion={setCurrentQuestion}
                                answers={answers}
                            />
                        </div>

                    </div>
                </div>
            </div>


            {showSubmitConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                        <div className="text-center mb-6">
                            <FiAlertCircle size={48} className="mx-auto mb-3 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-800">Submit Exam?</h2>
                            <p className="text-gray-600 text-sm mt-2">
                                Are you sure you want to submit? You cannot change your answers after submission.
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Questions Answered:</span> {answeredCount}/{questions.length}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitExam}
                                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all">
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}   