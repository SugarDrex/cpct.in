"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Exam = {
  id: string;
  exam_title: string;
  topic: string;
  total_questions: number;
  created_at: string;
  exam_code?: string;
};

// Match this to what exams.tsx expects
export type Question = {
  id: string;
  exam_id: string;
  question_number: number;
  question: string;        // <-- was question_text, change to this
  options: string[];
  correct_answer: string;
  // add any other fields exams.tsx requires
};

export async function getExamData(examId: string): Promise<{
  exam: Exam | null;
  questions: Question[];
  error: string | null;
}> {
  try {
    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError) throw examError;

    const { data: questionsData, error: questionsError } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("exam_id", examId)
      .order("question_number", { ascending: true });

    if (questionsError) throw questionsError;

    return {
      exam: examData,
      questions: questionsData || [],
      error: null,
    };
  } catch (err) {
    console.error("Failed to fetch exam data:", err);
    return {
      exam: null,
      questions: [],
      error: "Failed to load exam data. Please try again later.",
    };
  }
}