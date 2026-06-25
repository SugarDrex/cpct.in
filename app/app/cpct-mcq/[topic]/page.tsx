"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  FileText,
  Clock3,
  ArrowRight,
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
    const decodedTopic =
      decodeURIComponent(topic);

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
    <div className="min-h-screen bg-[#f5f7fb] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[35px] shadow-sm border border-[#e8edf5] p-8 md:p-10">
          
          <h1 className="text-5xl font-bold text-[#0f172a] mb-3">
            {decodeURIComponent(topic)}
          </h1>

          <p className="text-[#64748b] mb-12">
            Select exam paper
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/cpct-mcq/exam/${exam.id}`}
              >
                <div className="bg-[#dbeaf3] rounded-[28px] p-7 hover:bg-[#cfe4f0] transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                        <FileText className="w-8 h-8 text-[#2563eb]" />
                      </div>

                      <div>
                        <h3 className="text-[22px] font-semibold text-[#1e3a8a]">
                          {exam.exam_title}
                        </h3>

                        <div className="flex items-center gap-2 text-[#475569] text-sm mt-1">
                          <Clock3 className="w-4 h-4" />
                          {exam.total_questions} Questions
                        </div>
                      </div>
                    </div>

                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-[#1e3a8a]" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {exams.length === 0 && (
            <div className="text-center py-20 text-[#64748b]">
              No exam papers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}