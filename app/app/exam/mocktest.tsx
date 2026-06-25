"use client";

export const dynamic = "force-dynamic";
import {  useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CalendarDays, Clock } from "lucide-react";
import { Settings } from "lucide-react";
import { getOldExamsId } from "@/app/actions/getOldExamsId";
 

interface Exam {
  id: number;
  title: string;
  examDate: string;
  status: string;
  d_hour?: string;
  d_minut?: string;
}

export default function MockTestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

/*  useEffect(() => {
    const fetchExam = async () => {
      try {
        if (!year || !month) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/examlist?year=${year}&month=${month}`
        );

        const data = await res.json();
        setExam(data);
      } catch (error) {
        console.error("Error fetching exam:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [year, month]);*/
  useEffect(() => {
  if (!year || !month) return;

  const fetchExam = async () => {
    try {
      setLoading(true);
      const data = await getOldExamsId(year, month);
      setExam(data);
    } catch (error) {
      console.error("Error fetching exam:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchExam();
}, [year, month]);

 if (loading) {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-gray-950 transition-colors duration-300 px-4">
      
      <Settings className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />

      <p className="mt-6 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Loading exam...
      </p>
    </div>
  );
}

  if (!exam) {
    return (
      <div  className="flex justify-center items-center h-screen bg-gradient-to-r from-[#cbe5ea] to-[#d6eef3] dark:from-gray-900 dark:to-gray-950 transition-colors duration-300 px-4">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Exam not found.
        </p>
      </div>
    );
  }
 return (
  <div className="min-h-screen py-30 bg-gradient-to-r from-[#cbe5ea] to-[#d6eef3] dark:from-gray-900 dark:to-gray-950 transition-colors duration-300 px-4 sm:px-10 py-10">

    <div  className="max-w-7xl mx-auto">
 
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md dark:shadow-black/40 p-5 w-full max-w-sm transition-all duration-300">

 
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white leading-snug">
          {exam.title}
        </h2>

 
        <div className="flex items-center text-gray-600 dark:text-gray-300 mt-2 text-sm">
          <CalendarDays size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
          {new Date(exam.examDate).toLocaleDateString()}
        </div>
 
        <div className="flex items-center justify-between mt-4">

          <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
            <Clock size={16} className="mr-2 text-green-600 dark:text-green-400" />
            {exam.d_hour ?? "01"} : {exam.d_minut ?? "60"} Hrs
          </div>

          <button
            onClick={() => router.push(`/exam/${exam.id}`)}
            className="bg-blue-700 cursor-pointer  hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-md transition active:scale-95"
          >
            Take Exam
          </button>

        </div>
      </div>

    </div>
  </div>
);
}