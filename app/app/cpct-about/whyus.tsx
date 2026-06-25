"use client";

import { motion } from "framer-motion";
import { CheckSquare, BookOpen, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function WhyChooseUsSection() {
  const [loading, setLoading] = useState(true);

  // fake loading demo — replace with real data loading if needed
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const cards = [
    {
      icon: CheckSquare,
      title: "Interactive Practice Modules",
      desc: "Practice sessions designed to mimic the actual CPCT exam format, helping you get accustomed to the test environment and pace.",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Study Material",
      desc: "Variety of study resources including tutorials, tips, and sample questions covering all areas of the CPCT exam for effective preparation.",
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      desc: "Track your progress through score reports and analytics, enabling you to identify strengths and weaknesses to focus your efforts.",
    },
  ];

  return (
    <section className="w-full -mt-15 py-10 px-6 bg-gradient-to-b from-sky-200 to-sky-300 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto text-center">

        {/* Heading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-blue-700 dark:text-blue-400 font-semibold text-lg mb-4"
        >
          Why Choose Us
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6"
        >
          Features That Make Us Stand Out
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300 mb-14"
        >
          Choose us for your CPCT preparation because we provide an all-inclusive
          platform with everything you need to succeed.
        </motion.p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : cards.map((card, i) => {
                const Icon = card.icon;

                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    className="group bg-white dark:bg-slate-900 rounded-3xl shadow-lg p-10 text-center border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:bg-[#0d6efd] hover:shadow-2xl cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-900 dark:bg-blue-700 flex items-center justify-center transition-colors duration-300 group-hover:bg-white">
                      <Icon className="w-9 h-9 text-white transition-colors duration-300 group-hover:text-[#0d6efd]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 transition-colors duration-300 group-hover:text-white">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300 group-hover:text-white/90">
                      {card.desc}
                    </p>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg p-10 border border-gray-100 dark:border-slate-700 animate-pulse">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-300 dark:bg-slate-700" />

      <div className="h-6 w-3/4 mx-auto mb-4 bg-gray-300 dark:bg-slate-700 rounded" />

      <div className="space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded" />
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-5/6 mx-auto" />
        <div className="h-4 bg-gray-300 dark:bg-slate-700 rounded w-2/3 mx-auto" />
      </div>
    </div>
  );
}
