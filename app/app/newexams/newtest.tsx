"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CalendarDays, Clock, Settings } from "lucide-react";
import { getNewExams } from "../actions/getNewExams";

interface NewExam {
  id: number;
  title: string;
  exam_date: string;
  d_hour?: string;
  d_minut?: string;
}

export default function NewExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const [newexams, setNewExams] = useState<NewExam[]>([]);
  const [loading, setLoading] = useState(true);

  /*useEffect(() => {
    const fetchExams = async () => {
      try {
        if (!year || !month) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/newexams?year=${year}&month=${month}`
        );

        const data = await res.json();

        console.log("API RESPONSE:", data);

        if (Array.isArray(data)) {
          setNewExams(data);
        } else {
          setNewExams([]);
        }

      } catch (error) {
        console.error("Error fetching exams:", error);
        setNewExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [year, month]);
  */
 useEffect(() => {
  const fetchExams = async () => {
    try {
      if (!year || !month) {
        setLoading(false);
        return;
      }

      const data = await getNewExams(year, month);

      setNewExams(data); // ✅ No error now

    } catch (error) {
      console.error("Error fetching exams:", error);
      setNewExams([]);
    } finally {
      setLoading(false);
    }
  };

  fetchExams();
}, [year, month]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-gray-950 transition-colors duration-300 px-4">
        <Settings className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="mt-6 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Loading exams...
        </p>
      </div>
    );
  }

  if (newexams.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen 
        bg-gradient-to-r from-[#cbe5ea] to-[#d6eef3] 
        dark:from-gray-900 dark:to-gray-950 py-20">
        <p className="text-gray-600 dark:text-gray-400">
          No exams found for this month.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-25 
      bg-gradient-to-r from-[#cbe5ea] to-[#d6eef3] 
      dark:from-gray-900 dark:to-gray-950 px-4">

      <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 md:grid-cols-3">

        {newexams.map((exam) => {
          const formattedDate = exam.exam_date
            ? new Date(exam.exam_date).toLocaleDateString()
            : "Date Not Available";

          return (
            <div
              key={exam.id}
              className="bg-white dark:bg-gray-700 
                rounded-xl shadow-md p-6 w-full">

              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {exam.title}
              </h2>

              <div className="flex items-center text-gray-600 dark:text-gray-300 mt-3 text-sm">
                <CalendarDays size={16} className="mr-2 text-blue-600" />
                {formattedDate}
              </div>

              <div className="flex items-center justify-between mt-6">

                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                  <Clock size={16} className="mr-2 text-green-600" />
                  {exam.d_hour ?? "01"} : {exam.d_minut ?? "00"} Hrs
                </div>

                <button
                  onClick={() => router.push(`/newexams/${exam.id}`)}
                  className="bg-blue-700 hover:bg-blue-800 
                    text-white text-sm px-4 py-2 rounded-md 
                    transition active:scale-95 cursor-pointer"
                >
                  Take Exam
                </button>

              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}