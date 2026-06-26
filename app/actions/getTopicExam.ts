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

export async function getTopicExams(topic: string): Promise<{
  exams: Exam[];
  error: string | null;
}> {
  try {
    const { data, error: supaError } = await supabase
      .from("exams")
      .select("id, exam_title, topic, total_questions, created_at, exam_code")
      .eq("topic", topic)
      .order("created_at", { ascending: false });

    if (supaError) throw supaError;

    return { exams: data || [], error: null };
  } catch (err) {
    console.error("Failed to fetch exams:", err);
    return { exams: [], error: "Failed to load exams. Please try again later." };
  }
}