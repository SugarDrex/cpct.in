'use server';

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Types ───────────────────────────────────────────────────────────────────

export interface ExamOption {
    text: string;
    value: string;
}

// Public-facing question shape: NOTE there is no `correct_answer` field here.
// This is intentional — this is the shape sent to the browser.
export interface PublicQuestion {
    id: string;
    exam_id: string;
    question_number: number;
    question_en: string;
    question_hi: string;
    options: ExamOption[];
}

export interface Exam {
    id: string;
    title: string;
    exam_date: string;
    total_questions: number;
}

export interface SubmittedAnswer {
    questionId: string;
    selected: string;
}

export interface ExamResult {
    examId: string;
    total: number;
    attempted: number;
    correct: number;
    incorrect: number;
    score: number;
    breakdown: {
        questionId: string;
        questionNumber: number;
        selected: string;
        correctAnswer: string;
        isCorrect: boolean;
    }[];
}

// ── getExam ──────────────────────────────────────────────────────────────────
export async function getExam(examId: string): Promise<Exam | null> {
    if (!examId) return null;

    const { data, error } = await supabase
        .from('mexams')
        .select('*')
        .eq('id', examId)
        .single();

    if (error) {
        console.error('getExam error:', error.message);
        return null;
    }

    return data as Exam;
}

// ── getExamQuestions ─────────────────────────────────────────────────────────
// Fetches questions server-side and strips `correct_answer` before the data
// ever reaches the client. This is the critical fix: previously the browser
// fetched mquestions.* directly (via the public anon client), which meant
// correct_answer shipped to the client in React state / network responses
// and could be read by anyone with DevTools open, regardless of RLS.
export async function getExamQuestions(examId: string): Promise<PublicQuestion[]> {
    if (!examId) return [];

    const { data, error } = await supabase
        .from('mquestions')
        .select('id, exam_id, question_number, question_en, question_hi, options, correct_answer')
        .eq('exam_id', examId)
        .order('question_number', { ascending: true });

    if (error) {
        console.error('getExamQuestions error:', error.message);
        return [];
    }

    // Strip correct_answer here, server-side, before returning to the caller.
    return (data ?? []).map(({ correct_answer, ...rest }) => rest) as PublicQuestion[];
}

// ── submitExam ───────────────────────────────────────────────────────────────
// Grading happens entirely on the server. correct_answer is fetched fresh
// from the DB and compared here — it never touches the client at any point,
// including during submission.
export async function submitExam(
    examId: string,
    answers: SubmittedAnswer[]
): Promise<ExamResult | null> {
    if (!examId) return null;

    const { data: questions, error } = await supabase
        .from('mquestions')
        .select('id, question_number, correct_answer')
        .eq('exam_id', examId)
        .order('question_number', { ascending: true });

    if (error || !questions) {
        console.error('submitExam error:', error?.message);
        return null;
    }

    const answerMap = new Map(answers.map(a => [a.questionId, a.selected]));

    let correct = 0;
    let attempted = 0;

    const breakdown = questions.map(q => {
        const selected = answerMap.get(q.id) ?? '';
        const isCorrect = !!selected && selected === q.correct_answer;
        if (selected) attempted += 1;
        if (isCorrect) correct += 1;

        return {
            questionId: q.id,
            questionNumber: q.question_number,
            selected,
            correctAnswer: q.correct_answer,
            isCorrect,
        };
    });

    const total = questions.length;
    const incorrect = attempted - correct;
    const score = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;

    const result: ExamResult = {
        examId,
        total,
        attempted,
        correct,
        incorrect,
        score,
        breakdown,
    };

    // Persist the result server-side instead of trusting/storing it in
    // localStorage on the client.
    await supabase.from('mexam_results').insert({
        exam_id: examId,
        total,
        attempted,
        correct,
        incorrect,
        score,
        breakdown,
    });

    return result;
}