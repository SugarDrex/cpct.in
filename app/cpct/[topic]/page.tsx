"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  FileText,
  Clock3,
  ArrowRight,
  Eye,
  Layers3,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = use(params);

  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    const decodedTopic = decodeURIComponent(topic);

    const { data } = await supabase
      .from("exams")
      .select("*")
      .eq("topic", decodedTopic)
      .order("created_at", {
        ascending: false,
      });

    setExams(data || []);
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background relative">
      {/* HERO */}
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-[#07152f] via-[#091c3f] to-[#071327] dark:from-[#050b18] dark:via-[#081120] dark:to-[#030712]">
        
        {/* GRID BACKGROUND */}
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* GLOW */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-500/20 blur-[140px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
           
          {/* TITLE */}
          <div className="mt-10 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Master{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {decodeURIComponent(topic)}
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Real exam experience with detailed practice sets, instant
              performance analysis and smart preparation tools.
            </p>
          </div>

          {/* STATS */}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
               
               
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-sm">
              <Layers3 className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {exams.length} Sets Available
              </span>
            </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
              <p className="text-2xl font-bold text-white">
                100%
              </p>
              <p className="text-sm text-slate-400">
                Exam Focused
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
              <p className="text-2xl font-bold text-white">
                Live
              </p>
              <p className="text-sm text-slate-400">
                Performance Tracking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 -mt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          
          {/* EXAMS GRID */}
          {exams.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {exams.map((exam, index) => (
                <Link
                  key={exam.id}
                  href={`/cpct/exam/${exam.id}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-400/30">
                    
                    {/* TOP LINE */}
                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

                    {/* BADGE */}
                    <div className="flex items-center justify-between mb-7">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">
                          {decodeURIComponent(topic)}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>

                    {/* TITLE */}
                    <h3 className="text-2xl font-bold text-foreground leading-snug mb-6 line-clamp-2">
                      {exam.exam_title}
                    </h3>

                    {/* META */}
                    <div className="flex items-center gap-5 text-muted-foreground text-sm mb-8">
                      <div className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4" />
                        <span>
                          {exam.total_questions || 0} Questions
                        </span>
                      </div>

                      <div className="h-4 w-px bg-border" />

                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Practice Mode</span>
                      </div>
                    </div>

                    {/* BUTTON */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-[1px]">
                      <div className="flex items-center justify-center gap-3 rounded-2xl bg-background/95 px-5 py-4 transition-all duration-300 group-hover:bg-transparent">
                        
                        <FileText className="w-5 h-5 text-emerald-500 group-hover:text-white transition-colors" />

                        <span className="font-semibold text-foreground group-hover:text-white transition-colors">
                          Take Exam
                        </span>

                        <ArrowRight className="w-5 h-5 text-foreground group-hover:text-white transition-all group-hover:translate-x-1" />
                      </div>
                    </div>

                    {/* HOVER GLOW */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none">
                      <div className="absolute -top-20 right-0 w-40 h-40 bg-cyan-500/20 blur-3xl" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 py-24 text-center backdrop-blur-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>

              <h3 className="text-2xl font-bold text-foreground">
                No Exam Papers Found
              </h3>

              <p className="mt-3 text-muted-foreground">
                Exams for this topic will appear here once added.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}