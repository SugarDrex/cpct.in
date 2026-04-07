"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Settings } from "lucide-react";
interface Exam {
  id: number;
  title: string;
  exam_date: string; // ISO format from DB
  duration_minutes: number;
}

export default function ExamsByMonth() {
  const params = useParams();

  const year = Number(params.year);
  const month = Number(params.month); // 1–12

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!year || !month) return;

    const fetchExams = async () => {
      try {
        const res = await fetch("/api/admin/newexams");
        const data: Exam[] = await res.json();

        // ✅ FILTER ONLY BY MONTH & YEAR
        const filtered = data.filter((exam) => {
          if (!exam.exam_date) return false;

          const examDate = new Date(exam.exam_date);

          return (
            examDate.getFullYear() === year &&
            examDate.getMonth() + 1 === month
          );
        });

        setExams(filtered);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [year, month]);

  const monthName = (month: number) =>
    new Date(0, month - 1).toLocaleString("default", { month: "long" });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] py-30 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-5 text-gray-800 dark:text-white">
          Exams for {monthName(month)} {year}
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="text-gray-500">No exams found for this month.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-md hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  {exam.title}
                </h2>

                <div className="flex gap-4 text-sm flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    📅 {new Date(exam.exam_date).toLocaleDateString()}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    ⏱ {exam.duration_minutes} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}