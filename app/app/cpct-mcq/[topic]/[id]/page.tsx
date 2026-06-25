"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Exams from "../../exams";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ unwrap params
  const { id } = use(params);

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, []);

  async function fetchExam() {
    try {
      // FETCH EXAM
      const { data: examData, error: examError } =
        await supabase
          .from("exams")
          .select("*")
          .eq("id", id)
          .single();

      if (examError) throw examError;

      setExam(examData);

      // FETCH QUESTIONS
      const {
        data: questionsData,
        error: questionsError,
      } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", id)
        .order("question_number", {
          ascending: true,
        });

      if (questionsError) throw questionsError;

      setQuestions(questionsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Exam...
      </div>
    );
  }

  return (
    <Exams
      title={exam.exam_title}
      topic={exam.topic}
      questions={questions}
    />
  );
}