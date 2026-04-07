"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TipsPage() {
  return (
    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 md:px-10 py-25">
      {/* GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        <motion.div
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-white mb-8">
            Tips & Tricks to Crack the CPCT Exam
          </h1>

          {[
            {
              title: "Understand the CPCT Syllabus Thoroughly",
              desc: "Familiarize yourself with all sections: Computer Proficiency, Typing Skills, and General Awareness. This helps you plan your preparation better.",
            },
            {
              title: "Practice Typing Daily",
              desc: "Typing speed and accuracy are crucial. Use free typing tools or previous CPCT typing modules to improve your WPM score.",
            },
            {
              title: "Take Regular Mock Tests",
              desc: "Simulate the real exam environment with time-bound practice tests. This builds your confidence and helps with time management.",
            },
            {
              title: "Focus on Computer Fundamentals",
              desc: "Review topics like MS Office (Word, Excel, PowerPoint), email etiquette, and internet basics. These are often asked in CPCT.",
            },
            {
              title: "Revise General Knowledge & Reasoning",
              desc: "Brush up on current affairs, basic history/geography, and reasoning puzzles. These sections are easy to score with regular revision.",
            },
            {
              title: "Analyze Previous Year Papers",
              desc: "Go through previous CPCT question papers to understand recurring patterns and important topics.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                {index + 1}. {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {item.desc}
              </p>
            </motion.div>
          ))}

          <div className="text-center mt-8">
            <Link href="/#takeone">
              <button className="bg-blue-800 cursor-pointer hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition">
                Start Practice Now
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Study Resources */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Study Resources
            </h2>
            <ul className="space-y-3 text-blue-700 dark:text-blue-400 font-medium">
              <li className="hover:text-blue-900 dark:hover:text-blue-300 cursor-pointer">
                <a href="/notes">📄 CPCT Study Material</a>
              </li>
              <li className="hover:text-blue-900 dark:hover:text-blue-300 cursor-pointer">
                <a href="/#takeone">✏ Practice Questions</a>
              </li>
              <li className="hover:text-blue-900 dark:hover:text-blue-300 cursor-pointer">
                <a href="/tips"> 🔖 Tips & Tricks</a>
              </li>
            </ul>
          </div>

          {/* Latest Updates */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Latest Updates
            </h2>

            <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300 p-4 rounded-lg mb-4">
              New CPCT exam dates announced.
            </div>

            <div className="bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-300 p-4 rounded-lg">
              2023–25 Practice set now available.
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}