"use client"

import { motion } from "framer-motion"
import { Instagram, Facebook, Twitter, Linkedin, Mail, MapPin, Search, FileText, Target, Users, ShieldCheck, ChevronRight, Monitor } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700/50 ${className}`}
    />
  )
}

function FooterSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Feature bar skeleton */}
      <div className="border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <SkeletonBox className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <footer className="text-slate-800 dark:text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <SkeletonBox className="h-8 w-40" />
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-5/6" />
            <div className="flex gap-3 pt-2">
              <SkeletonBox className="h-9 w-9 rounded-lg" />
              <SkeletonBox className="h-9 w-9 rounded-lg" />
              <SkeletonBox className="h-9 w-9 rounded-lg" />
              <SkeletonBox className="h-9 w-9 rounded-lg" />
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
  { label: "Mock Test", href: "/mock-test" },
  { label: "Typing Test", href: "/typing-test" },
  { label: "Typing Practice", href: "/typing-practice" },
  { label: "CPCT Old Papers", href: "/old-papers" },
  { label: "New Papers", href: "/new-papers" },
  { label: "Recent Exams", href: "/recent-exams" },
  { label: "CPCT Notes", href: "/cpct-notes" },
  { label: "Topics Based Exams", href: "/topic-exams" },
  { label: "MCQ Practice", href: "/mcq-practice" },
]

const features = [
  {
    icon: Search,
    title: "Mock Tests",
    subtitle: "Practice & Improve",
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-800/30",
  },
  {
    icon: FileText,
    title: "Study Material",
    subtitle: "Notes, Papers & More",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-800/30",
  },
  {
    icon: Target,
    title: "Topic Wise",
    subtitle: "Exams & MCQ",
    color: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    iconBg: "bg-rose-100 dark:bg-rose-800/30",
  },
  {
    icon: Users,
    title: "Trusted by Aspirants",
    subtitle: "Across India",
    color: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-800/30",
  },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <FooterSkeleton />

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors">
       
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
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center">
                <Monitor size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                  CPCT Portal
                </h3>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm max-w-xs">
              Your trusted platform for CPCT exam preparation. Practice smart, learn better and score higher.
            </p>

            <div className="flex gap-3 pt-1">
              {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800/30 transition-all duration-200"
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
              <span className="w-8 h-0.5 bg-emerald-500 rounded-full" />
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1"
                >
                  <ChevronRight size={14} className="text-emerald-500/60 group-hover:translate-x-0.5 transition-transform" />
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
              <span className="w-8 h-0.5 bg-emerald-500 rounded-full" />
              Contact Info
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-start group">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Narmadapuram,<br />Madhya Pradesh
                </p>
              </div>
              
              <div className="flex gap-3 items-center group">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-emerald-600 dark:text-emerald-400" />
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
               {/* Trust Badge */}
            <div className="mt-6 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/60 dark:border-emerald-800/20">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    cpct.in – Best Platform for CPCT
                  </p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                    Your trusted partner for CPCT exam preparation and success.
                  </p>
                </div>
              </div>
            </div><p>© {year} cpct.in. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Designed with <span className="text-rose-400 mx-0.5">♥</span> By <span className="text-slate-600 dark:text-slate-300 font-medium">Orionode</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}