"use client"
import type { Metadata } from "next";
import { motion } from "framer-motion"
import Image from "next/image"
import { Check } from "lucide-react"
export const metadata: Metadata = {
  title: "About CPCT.IN | CPCT Mock Test & Exam Preparation Platform",
  description:
    "Learn about CPCT.IN – India's trusted CPCT exam preparation platform offering mock tests, typing practice, previous year papers and expert study materials to help you crack the CPCT exam with confidence.",

keywords: [
  "CPCT mock test 2026",
  "CPCT exam preparation 2026",
  "Free CPCT mock test online",
  "CPCT typing practice Hindi",
  "CPCT typing practice English",
  "CPCT previous year question papers", 
  "CPCT study material 2026",
  "CPCT online practice test", 
  "How to prepare for CPCT exam",
  "Best CPCT coaching in Madhya Pradesh",
  "CPCT coaching in Narmadapuram",
  "CPCT exam guide 2026",
  "CPCT result improvement tips"
],
  alternates: {
    canonical: "https://cpct.in/about",
  },

  openGraph: {
    title: "About CPCT.IN – Your CPCT Exam Success Partner",
    description:
      "Discover how CPCT.IN helps students prepare for CPCT exam with real mock tests, typing practice and structured study material.",
    url: "https://cpct.in/about",
    siteName: "CPCT.IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "About CPCT.IN – CPCT Exam Preparation",
    description:
      "India's trusted CPCT mock test and typing practice platform.",
  },
};

export default function AboutMSection() {

  return (<><script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is CPCT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CPCT is a computer proficiency certification test conducted in Madhya Pradesh to assess computer skills and typing speed."
          }
        },
        {
          "@type": "Question",
          name: "How does CPCT.IN help students?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CPCT.IN provides mock tests, typing practice, study material and exam strategies to help students improve their CPCT score."
          }
        }
      ]
    })
  }}
/>
    <section className="bg-[#f3f4f6] dark:bg-slate-900 py-16 md:py-24 transition-colors -mt-22">
      <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
 
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden"
        >
          <Image
            src="/cpct/about.jpg"    
            alt="CPCT Students"
            fill
            className="object-cover"
          />
        </motion.div>

        {/* RIGHT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          {/* ABOUT US LABEL */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-8 bg-[#0f2a78] dark:bg-blue-400 rounded-full" />
            <span className="text-[#0f2a78] dark:text-blue-400 font-semibold text-xl">
              About Us
            </span>
          </div>

          {/* HEADING */}
          <h2 className="text-[36px] md:text-[48px] leading-tight font-bold text-gray-700 dark:text-white mb-6">
            Welcome to Your CPCT
            <br />
            Exam Success Journey!
          </h2>

          {/* SUBTEXT */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Unlock Your Potential with Comprehensive CPCT Preparation
          </p>

          {/* CHECK LIST */}
          <div className="space-y-6">
            <Feature text="Get Ready to Conquer the CPCT Exam with Confidence!" />
            <Feature text="Expertly Crafted Study Materials Tailored for Your Success" />
            <Feature text="Interactive Practice Tests to Assess Your Skills and Progress" />
          </div>
        </motion.div>

      </div>
    </section>
  </>)
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex gap-5 items-start">
      <div className="bg-[#0f2a78] dark:bg-blue-500 text-white rounded-full p-3 shrink-0 transition-colors">
        <Check size={18} />
      </div>

      <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
        {text}
      </p>
    </div>
  )
}
