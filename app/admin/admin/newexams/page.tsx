"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
 

interface Exam {
  id: number;
  title: string;
  exam_date: string;
  duration_minutes: number;
  shift?: number; // optional shift field

}

 

interface MonthGroup {
  month: number;
  year: number;
  exams: Exam[];
}
export default function ExamsAdmin() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [months, setMonths] = useState<MonthGroup[]>([]);
  const [loadingmonth, setLoadingMonth] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [status, setStatus] = useState<{
    type: "success" | "error" | "loading" | null;
    message: string;
  } | null>(null);

  // ================= FETCH =================
  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/newexams");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setExams(data);
    } catch {
      setStatus({ type: "error", message: "Failed to fetch exams" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // ================= DELETE =================
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeletingId(deleteId);
      setStatus({ type: "loading", message: "Deleting exam..." });

      const res = await fetch(`/api/admin/newexams/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setExams((prev) => prev.filter((e) => e.id !== deleteId));
      setStatus({ type: "success", message: "Exam deleted successfully" });
      setDeleteId(null);
    } catch {
      setStatus({ type: "error", message: "Delete failed. Try again." });
    } finally {
      setDeletingId(null);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // ================= UPDATE =================
  const updateExam = async () => {
    if (!editing) return;

    try {
      setProcessing(true);
      setStatus({ type: "loading", message: "Updating exam..." });

      const res = await fetch(`/api/admin/newexams/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (!res.ok) throw new Error();

      setExams((prev) =>
        prev.map((e) => (e.id === editing.id ? editing : e))
      );

      setEditing(null);
      setStatus({ type: "success", message: "Exam updated successfully" });
    } catch {
      setStatus({ type: "error", message: "Update failed. Try again." });
    } finally {
      setProcessing(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setStatus({ type: "loading", message: "Uploading exam..." });
      setUploadProgress(30);

      const text = await file.text();
      const json = JSON.parse(text);

      setUploadProgress(70);

      const res = await fetch("/api/admin/newexams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (!res.ok) throw new Error();

      setUploadProgress(100);
      fetchExams();

      setStatus({ type: "success", message: "Exam uploaded successfully" });

      setTimeout(() => {
        setUploadOpen(false);
        setFile(null);
        setUploadProgress(0);
      }, 800);
    } catch {
      setStatus({ type: "error", message: "Upload failed. Invalid JSON?" });
    } finally {
      setProcessing(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const Spinner = () => (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
    />
  );

   useEffect(() => {
    fetch("/api/admin/newexams")
      .then((res) => res.json())
      .then((data: Exam[]) => {
        const grouped: { [key: string]: MonthGroup } = {};

        data.forEach((exam) => {
          if (!exam.exam_date) return;

          // ✅ SAFE STRING SPLIT (NO Date timezone issue)
          const [yearStr, monthStr] = exam.exam_date.split("-");
          const year = Number(yearStr);
          const month = Number(monthStr); // 1–12

          const key = `${year}-${month}`;

          if (!grouped[key]) {
            grouped[key] = {
              year,
              month,
              exams: [],
            };
          }

          grouped[key].exams.push(exam);
        });

        // Convert to array
        let monthArray = Object.values(grouped);

        // Sort newest first
        monthArray.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });

        setMonths(monthArray);
      })
      .finally(() => setLoading(false));
  }, []);

  const monthName = (month: number) =>
    new Date(0, month - 1).toLocaleString("default", { month: "long" });

  const formatExamTitle = (exam: Exam) => {
    const formattedDate = new Date(exam.exam_date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

    return `${formattedDate}${exam.shift ? ` - SHIFT ${exam.shift}` : ""}`;
  };
  return (<>
    <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] transition-colors py-25 duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
{/* HEADER + Aside Guide */}
<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">

   <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
    💡 <span className="font-semibold text-blue-700 dark:text-blue-400">
      Recommended:
    </span>{" "}
    First convert your <span className="font-medium">DOCX file</span> into a{" "}
    <span className="font-medium">JSON format</span> Using the DOCX Converter Then Download and Save 
    The Generated JSON File, Then Upload It Here To
    Add The Exam.
  </p> 
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">    
    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">      
      <Link
        href="/admin/docx"
        className="ml-2 text-blue-600 hover:underline"
      >
       <button
        className="cursor-pointer 
                   bg-blue-600 hover:bg-blue-700 
                   text-white 
                   px-5 py-3 
                   rounded-xl 
                   shadow-md 
                   hover:scale-105 
                   transition-all"
      >
        📄 DOCX Converter
      </button>
      </Link>
    </div>

   

  </div>
</div>
 
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Exams Management
          </h1>
  
          <button
            onClick={() => setUploadOpen(true)}
            className="cursor-pointer bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white px-5 py-3 rounded-xl shadow-md hover:scale-105 transition-all"
          >
            + Upload Exam
          </button>
        </div>

        {/* STATUS CHIP */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium shadow-md
                ${
                  status.type === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : status.type === "error"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                }`}
            >
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

{/* GRID */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

  {/* INITIAL PAGE LOADING SKELETON */}
  {loading &&
    Array.from({ length: 6 }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}

  {!loading &&
    exams.map((exam) => (
      <motion.div
        key={exam.id}
        whileHover={{ y: -6 }}
        className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all border border-gray-200 dark:border-white/10 flex flex-col justify-between"
      >

        {/* REAL-TIME DELETE SKELETON */}
        {deletingId === exam.id ? (
          <CardSkeleton />
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {exam.title}
              </h2>

              <div className="flex gap-4 mb-6 text-sm">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  📅 {new Date(exam.exam_date).toLocaleDateString()}
                </span>

                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  ⏱ {exam.duration_minutes} mins
                </span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <a
                href={`/admin/newexams/${exam.id}`}
                className="cursor-pointer flex-1 text-center bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white px-4 py-2 rounded-xl transition"
              >
                Update exam
              </a>

             {/* <button
                onClick={() => setEditing(exam)}
                className="cursor-pointer flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
              >
                Edit
              </button>*/}

              <button
                onClick={() => setDeleteId(exam.id)}
                disabled={deletingId === exam.id}
                className="cursor-pointer flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </motion.div>
    ))}
</div></div>

  {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between mb-4">
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Confirm Delete
                </h2>
                <button onClick={() => setDeleteId(null)}>✕</button>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this exam?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-white py-2 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editing && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between mb-6">
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Edit Exam
                </h2>
                <button onClick={() => setEditing(null)}>✕</button>
              </div>

              <input
                className="w-full mb-3 p-3 rounded-xl border dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white"
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />

              <input
                type="date"
                className="w-full mb-3 p-3 rounded-xl border dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white"
                value={editing.exam_date}
                onChange={(e) =>
                  setEditing({ ...editing, exam_date: e.target.value })
                }
              />

              <input
                type="number"
                className="w-full mb-4 p-3 rounded-xl border dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white"
                value={editing.duration_minutes}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    duration_minutes: Number(e.target.value),
                  })
                }
              />

              <button
                onClick={updateExam}
                disabled={processing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processing && <Spinner />}
                {processing ? "Saving..." : "Save Changes"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {uploadOpen && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between mb-6">
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  Upload Exam JSON
                </h2>
                <button onClick={() => setUploadOpen(false)}>✕</button>
              </div>

              <input
                type="file"
                accept="application/json"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mb-4"
              />

              {processing && (
                <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full mb-4">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={processing}
                className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processing && <Spinner />}
                {processing ? "Uploading..." : "Upload"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {!loading &&
  Object.entries(
    months.reduce<Record<number, MonthGroup[]>>((acc, curr) => {
      if (!acc[curr.year]) acc[curr.year] = [];
      acc[curr.year].push(curr);
      return acc;
    }, {})
  ).map(([year, yearMonths]) => {
    const typedYearMonths = yearMonths as MonthGroup[];

    return (
      <div key={year} className="">
        {/* Year Heading */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-5 px-10 ">
          CPCT Exam {year}
        </h2>      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-10">
          {typedYearMonths.map((m) => (
            <a
              key={`${m.year}-${m.month}`}
              href={`/admin/newexams/month/${m.year}/${m.month}`}
              className="group 
                         bg-[#c7dde4] 
                         hover:bg-[#bcd6de]
                         dark:bg-slate-800 
                         dark:hover:bg-slate-700
                         p-10 
                         rounded-2xl 
                         shadow-sm 
                         hover:shadow-lg 
                         transition-all 
                         duration-300 
                         flex 
                         items-center 
                         gap-6"
            >
              {/* Calendar Icon Box */}
              <div className="bg-white/70 dark:bg-white/10 
                              p-4 
                              rounded-xl 
                              shadow-inner 
                              text-2xl">
                📅
              </div>

              {/* Text Section */}
              <div>
                <h3 className="text-2xl font-semibold text-blue-900 dark:text-white mb-2">
                  {monthName(m.month)}
                </h3>

                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  {m.year}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  })}
    </div>
    
    </>
  );
}

const CardSkeleton = () => (
  <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-md border border-gray-200 dark:border-white/10 animate-pulse">
    <div className="h-6 w-2/3 bg-gray-200 dark:bg-white/10 rounded mb-4"></div>

    <div className="flex gap-4 mb-6">
      <div className="h-6 w-24 bg-gray-200 dark:bg-white/10 rounded-full"></div>
      <div className="h-6 w-24 bg-gray-200 dark:bg-white/10 rounded-full"></div>
    </div>

    <div className="flex gap-3">
      <div className="h-10 flex-1 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
      <div className="h-10 flex-1 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
      <div className="h-10 flex-1 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
    </div>
  </div>
);