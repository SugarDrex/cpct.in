"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TopicsPage() {
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    const { data } = await supabase
      .from("exams")
      .select("topic");

    const uniqueTopics = [
      ...new Set(
        data?.map((item) => item.topic)
      ),
    ];

    setTopics(uniqueTopics);
  }

  return (
    <>
<div className="mt-12">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
              Topic Wise Paper
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {topics.map((topic) => (
                <Link
                 key={topic}
                href={`/cpct-mcq/${encodeURIComponent(
                  topic
                )}`}
                  className="bg-[#cfe3ec] dark:bg-gray-800 
                             hover:bg-[#bcd9e6] dark:hover:bg-gray-700
                             transition rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                      📘
                    </div>
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-400">
                   {topic}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
  
      
  </>);
}