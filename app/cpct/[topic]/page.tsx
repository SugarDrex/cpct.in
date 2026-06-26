"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock3,
  ArrowRight,
  Eye,
  Layers3,
  Loader2,
  AlertCircle,
  BookOpen,
  BarChart3,
  Calendar,
} from "lucide-react";
import { getTopicExams, type Exam } from "@/app/actions/getTopicExam";

export default function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = use(params);
  const decodedTopic = decodeURIComponent(topic);

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExams();
  }, [topic]);

  async function fetchExams() {
    try {
      setLoading(true);
      setError("");

      const { exams: data, error: fetchError } = await getTopicExams(decodedTopic);

      if (fetchError) {
        setError(fetchError);
        setExams([]);
      } else {
        setExams(data);
      }
    } catch (err) {
      console.error("Failed to fetch exams:", err);
      setError("Failed to load exams. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Topic color mapping
  const topicColors: Record<string, string> = {
    Email: "from-blue-500 to-cyan-500",
    Word: "from-indigo-500 to-purple-500",
    Excel: "from-emerald-500 to-teal-500",
    Database: "from-amber-500 to-orange-500",
    PowerPoint: "from-rose-500 to-pink-500",
    Networking: "from-cyan-500 to-blue-600",
    Hardware: "from-slate-500 to-gray-600",
    General: "from-blue-600 to-indigo-600",
  };

  const gradient = topicColors[decodedTopic] || topicColors.General;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-700" size={40} />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading {decodedTopic} exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Exams</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchExams}
            className="h-10 px-6 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] relative">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 dark:from-[#050b18] dark:via-[#081120] dark:to-[#030712]">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Glow Effect */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/15 blur-[120px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/cpct" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">{decodedTopic}</span>
          </div>

          {/* Title */}
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Master{" "}
              <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {decodedTopic}
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl leading-relaxed">
              Real exam experience with detailed practice sets, instant performance analysis and smart preparation tools.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-3">
              <div className="flex items-center gap-2">
                <Layers3 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-slate-200">
                  {exams.length} Exam Sets Available
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-3">
              <p className="text-xl font-bold text-white">
                {exams.reduce((acc, e) => acc + (e.total_questions || 0), 0)}
              </p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Questions</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-3">
              <p className="text-xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Exam Focused</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 -mt-6 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {exams.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {exams.map((exam, index) => (
                <Link
                  key={exam.id}
                  href={`/cpct/exam/${exam.id}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-300 dark:hover:border-blue-800">
                    
                    {/* Top Accent Line */}
                    <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${gradient}`} />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {exam.topic}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-4 line-clamp-2 min-h-[3.5rem]">
                      {exam.exam_title}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm mb-6">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4" />
                        <span className="font-medium">{exam.total_questions || 0} Qs</span>
                      </div>
                      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {new Date(exam.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Practice Mode</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        Take Exam
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none">
                      <div className={`absolute -top-10 right-0 w-32 h-32 bg-gradient-to-r ${gradient} opacity-10 blur-3xl rounded-full`} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/40 py-24 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <BookOpen className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                No Exam Papers Found
              </h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Exams for <span className="font-bold text-slate-700 dark:text-slate-300">{decodedTopic}</span> will appear here once added by the administrator.
              </p>
              <Link
                href="/cpct"
                className="inline-flex items-center gap-2 mt-6 h-10 px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Topics
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}