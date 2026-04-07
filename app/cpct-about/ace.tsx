 "use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/* COUNT UP METER (trigger based) */
function CountUp({ target, start }: { target: number; start: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let current = 0;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [start, target]);

  return <>{count.toLocaleString()}</>;
}

export default function CpctHeroStats() {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [startCount, setStartCount] = useState(false);

  // 👇 Detect when stats section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCount(true);
        }
      },
      { threshold: 0.4 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

  const stats = [
    { value: 1232, label: "Students" },
    { value: 64, label: "Courses" },
    { value: 42, label: "Events" },
    { value: 15, label: "Trainers" },
  ];

  return (
    <section className="w-full">
      {/* HERO */}
      <div className="w-full bg-[rgb(5,36,129)]">
        <div className="mx-auto max-w-7xl text-gray-100 px-8 lg:px-12 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <h2 className="font-extrabold text-[40px] lg:text-[48px] text-white">
                Ready to Ace Your CPCT Exam?
              </h2>

              <p className="text-[20px] text-white/90">
                Join thousands of successful candidates who prepared with us.
              </p>
            </motion.div>

            <motion.button  
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-200 cursor-pointer text-black rounded-full px-12 py-5 text-[20px] font-medium"
            >
            <a href="#takeone">  Start Now →</a>
            </motion.button>

          </div>
        </div>
      </div>

      {/* STATS */}
      <div
        ref={statsRef}
        className="w-full bg-gray-100 dark:bg-gray-900"
      >
        <div className="mx-auto max-w-7xl px-8 lg:px-12 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12">
            {stats.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="text-center"
              >
                <div className="text-[60px] font-extrabold text-[rgb(5,36,129)] dark:text-blue-400">
                  <CountUp target={item.value} start={startCount} />
                </div>

                <div className="mt-3 text-[20px] font-semibold text-gray-700 dark:text-gray-300">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CpctHeroStatsSkeleton() {
  return (
    <section className="w-full animate-pulse">
      <div className="w-full bg-[rgb(5,36,129)]">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="space-y-5 w-full">
              <div className="h-12 w-[520px] max-w-full bg-white/25 rounded" />
              <div className="h-6 w-[460px] max-w-full bg-white/20 rounded" />
            </div>
            <div className="h-[60px] w-[220px] bg-white/30 rounded-full" />
          </div>
        </div>
      </div>

      <div className="w-full bg-[#e5e5e5] dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 text-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4 flex flex-col items-center">
                <div className="h-16 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

