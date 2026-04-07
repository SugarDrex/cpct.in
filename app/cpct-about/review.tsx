"use client";

import { motion } from "framer-motion";
import { BsStarFill } from "react-icons/bs";
import { BiSolidQuoteAltLeft } from "react-icons/bi";

const testimonials = [
  {
    name: "Rahul Sharma",
    badge: "RS",
    year: "CPCT Qualified 2023",
    text:
      "The practice tests on this platform were incredibly similar to the actual CPCT exam. I felt well-prepared and confident during my test.",
  },
  {
    name: "Priya Kumar",
    badge: "PK",
    year: "CPCT Qualified 2023",
    text:
      "The topic-wise practice helped me focus on my weak areas. The performance tracking feature was particularly useful in my preparation.",
  },
  {
    name: "Amit Verma",
    badge: "AV",
    year: "CPCT Qualified 2024",
    text:
      "I cleared the CPCT exam in my first attempt thanks to this platform. The comprehensive study materials and practice tests made all the difference.",
  },
];

export default function SuccessStoriesSection() {
  return (
    <section className="w-full -mt-24 py-20 bg-gray-100 dark:bg-[#0b1220] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
    
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-[18px] font-semibold text-blue-700 dark:text-blue-400 tracking-wide mb-3">
            Success Stories
          </p>

          <h2 className="text-[44px] md:text-[52px] font-extrabold text-gray-800 dark:text-gray-100 leading-tight">
            What Our Students Say
          </h2>
        </motion.div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -8 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group rounded-2xl bg-white dark:bg-[#111827] shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-800 p-8 transition-all duration-300"
            >
       
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <BsStarFill
                    key={idx}
                    className="text-yellow-400 text-[18px] group-hover:scale-110 transition-transform"
                  />
                ))}
              </div>

              {/* Quote */}
              <div className="relative">
                <BiSolidQuoteAltLeft className="absolute -top-2 -left-1 text-[28px] text-blue-600/20 dark:text-blue-400/20" />

                <p className="text-[17px] leading-[28px] text-gray-700 dark:text-gray-300 mb-8 pl-6">
                  "{item.text}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-900 dark:bg-blue-700 flex items-center justify-center text-white font-bold text-[18px] shadow-md">
                  {item.badge}
                </div>

                <div>
                  <p className="text-[20px] font-semibold text-gray-900 dark:text-gray-100">
                    {item.name}
                  </p>
                  <p className="text-[15px] text-gray-500 dark:text-gray-400">
                    {item.year}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
