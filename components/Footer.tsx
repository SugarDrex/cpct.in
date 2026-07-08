"use client"

import { motion } from "framer-motion"
import { Instagram, Facebook, Twitter, Linkedin, Mail, MapPin, Search, FileText, Target, Users, ChevronRight, Monitor } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 ${className}`}
    />
  )
}

function FooterSkeleton() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      {/* Feature bar skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <SkeletonBox className="h-11 w-11 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      <footer className="text-slate-800 dark:text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <SkeletonBox className="h-8 w-40" />
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-5/6" />
            <div className="flex gap-3 pt-2">
              <SkeletonBox className="h-9 w-9 rounded-xl" />
              <SkeletonBox className="h-9 w-9 rounded-xl" />
              <SkeletonBox className="h-9 w-9 rounded-xl" />
              <SkeletonBox className="h-9 w-9 rounded-xl" />
            </div>
          </div>
          <div className="space-y-3">
            <SkeletonBox className="h-6 w-32" />
            <SkeletonBox className="h-4 w-40" />
            <SkeletonBox className="h-4 w-36" />
            <SkeletonBox className="h-4 w-44" />
            <SkeletonBox className="h-4 w-32" />
          </div>
          <div className="space-y-4">
            <SkeletonBox className="h-6 w-36" />
            <SkeletonBox className="h-4 w-56" />
            <SkeletonBox className="h-4 w-48" />
          </div>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800" />
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between">
          <SkeletonBox className="h-4 w-48" />
          <SkeletonBox className="h-4 w-40" />
        </div>
      </footer>
    </div>
  )
}

const quickLinks = [
  { label: "Mock Test", href: "/#takeone" },
  { label: "Typing Test", href: "/cpct-practice" },
  { label: "Typing Practice", href: "/cpct-practice" },
  { label: "CPCT Old Papers", href: "/old-papers" },
  { label: "New Papers", href: "/new-papers" },
  { label: "Recent Exams", href: "/#takeone" },
  { label: "CPCT Notes", href: "/cpct-notes" },
  { label: "Topics Based Exams", href: "/#takeonetopic" },
  { label: "MCQ Practice", href: "/cpct-new-exams?year=2026&month=5" },
]

// Restyled to the same soft icon-chip language as the dashboard's
// "Study Resources" cards: white/dark surface, subtle border, blue-600 accent.
const features = [
  {
    icon: Search,
    title: "Mock Tests",
    subtitle: "Practice & Improve",
  },
  {
    icon: FileText,
    title: "Study Material",
    subtitle: "Notes, Papers & More",
  },
  {
    icon: Target,
    title: "Topic Wise",
    subtitle: "Exams & MCQ",
  },
  {
    icon: Users,
    title: "Trusted by Aspirants",
    subtitle: "Across India",
  },
]

const socials = [Instagram, Facebook, Twitter, Linkedin]

export default function Footer() {
  const year = new Date().getFullYear()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <FooterSkeleton />

  return (
    <div className="bg-slate-50 dark:bg-slate-950 transition-colors select-none">
      {/* ─── Feature Bar ─── */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors"
            >
              <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center shrink-0">
                <feature.icon size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {feature.title}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {feature.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Main Footer ─── */}
      <footer className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand Column */}
          <motion.div
            className="md:col-span-4 space-y-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center">
                <Monitor size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  CPCT<span className="text-blue-600">.IN</span>
                </h3>
                <p className="text-[11px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">
                  Let&apos;s Practice
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                Cpct-MCQ
              </span>
              <span className="rounded-full bg-cyan-500 px-2.5 py-1 text-[10px] font-semibold text-white">
                Mock test
              </span>
              <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                Cpct Exam
              </span>
              <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white">
                Typing-Test
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm max-w-xs">
              Your trusted platform for CPCT exam preparation. Practice smart, learn better and score higher.
            </p>

            <div className="flex gap-3 pt-1">
              {socials.map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800/30 transition-all duration-200"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Quick Links Column */}
          <motion.div
            className="md:col-span-4 md:pl-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-blue-500 rounded-full" />
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                >
                  <ChevronRight
                    size={14}
                    className="text-blue-400/60 group-hover:translate-x-0.5 transition-transform shrink-0"
                  />
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Contact Info Column */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-blue-500 rounded-full" />
              Contact Info
            </h3>

            <div className="space-y-3">
              <div className="flex gap-3 items-start rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-3.5">
                <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1.5">
                  Narmadapuram,<br />Madhya Pradesh
                </p>
              </div>

              <div className="flex gap-3 items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-3.5">
                <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  cpcttypingtest@gmail.com
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
            <p>© {year} cpct.in. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Designed with<span className="text-rose-400 mx-0.5">♥</span>by{" "}
              <Link
                href="https://durgeshmalviya.co.in/"
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Orionode
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
