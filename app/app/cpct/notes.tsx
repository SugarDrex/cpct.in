"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type Exam = {
  id: number;
  title: string;
  url: string;
};

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
];

function parseMonthYear(title: string) {
  const lower = title.toLowerCase();

  const month =
    months.find(m => lower.includes(m.toLowerCase())) || "Exam";

  const year = title.match(/20\d{2}/)?.[0] || "Other";

  return { month, year };
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-7 bg-slate-200 dark:bg-slate-800 animate-pulse">
      <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded mb-3" />
      <div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
    </div>
  );
}

export default function ExamNPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOld, setShowOld] = useState(false);

  const oldRef = useRef<HTMLDivElement | null>(null);

  /* ---------- Fetch ---------- */

  useEffect(() => {
    fetch("/api/allexams")
      .then(r => r.json())
      .then(data => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- Group ---------- */

  const grouped = useMemo(() => {
    const map: Record<string, Exam[]> = {};

    exams.forEach(e => {
      const { year } = parseMonthYear(e.title);
      if (!map[year]) map[year] = [];
      map[year].push(e);
    });

    return map;
  }, [exams]);

  const visibleYears = useMemo(() => {
    const years = Object.keys(grouped).sort((a,b)=>Number(b)-Number(a));
    if (showOld) return years;
    return years.filter(y => ["2025","2024","2023"].includes(y));
  }, [grouped, showOld]);

  /* ---------- Scroll ---------- */

  const showOldClick = () => {
    setShowOld(true);
    setTimeout(() => {
      oldRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-sky-200 dark:from-slate-900 dark:to-slate-800">

      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-10">

        <h1 className="text-4xl font-bold mb-10 dark:text-white">
          CPCT Exams
        </h1>

        {/* Loading */}
        {loading && (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_,i)=>(
              <SkeletonCard key={i}/>
            ))}
          </div>
        )}

        {/* Years */}
        {!loading && visibleYears.map((year, idx) => {
          const list = grouped[year];
          const isOld = !["2025","2024","2023"].includes(year);

          return (
            <div
              key={year}
              ref={isOld && idx===0 ? oldRef : undefined}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold mb-6 dark:text-slate-200">
                CPCT Exam {year}
              </h2>

              <div className="grid md:grid-cols-3 gap-6">

                {list.map((exam, i) => {
                  const { month } = parseMonthYear(exam.title);

                  return (
                    <motion.a
                      key={exam.id}
                      href={`/start/${exam.url}`}
                      initial={{ opacity:0, y:20 }}
                      animate={{ opacity:1, y:0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y:-6, scale:1.03 }}
                      className="
                        rounded-xl p-6 shadow-md cursor-pointer
                        bg-gradient-to-br from-blue-100 to-sky-200
                        dark:from-slate-800 dark:to-slate-700
                        hover:shadow-xl hover:ring-2 hover:ring-blue-500/40
                      "
                    >
                      <div className="text-xl font-semibold text-blue-900 dark:text-blue-300">
                        {month}
                      </div>

                      <div className="text-slate-600 dark:text-slate-300 mt-2">
                        {exam.title}
                      </div>
                    </motion.a>
                  );
                })}

              </div>
            </div>
          );
        })}

        {/* Toggle */}
        {!loading && !showOld && (
          <div className="text-center">
            <button
              onClick={showOldClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Show Old Papers
            </button>
          </div>
        )}

        {!loading && showOld && (
          <div className="text-center">
            <button
              onClick={()=>setShowOld(false)}
              className="underline text-blue-700"
            >
              Hide Old Papers
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
