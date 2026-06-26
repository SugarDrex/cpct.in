"use client";

import { use, useEffect, useState } from "react";
import Exams from "@/app/cpct/exams";
import { getExamData, type Exam, type Question } from "@/app/actions/getTopicData";

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExam();
  }, [id]);

  async function fetchExam() {
    try {
      setLoading(true);
      setError("");

      const { exam: examData, questions: questionsData, error: fetchError } = await getExamData(id);

      if (fetchError) {
        setError(fetchError);
        setExam(null);
        setQuestions([]);
      } else {
        setExam(examData);
        setQuestions(questionsData);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load exam data. Please try again later.");
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

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Exam not found"}</p>
          <button
            onClick={fetchExam}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Retry
          </button>
        </div>
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