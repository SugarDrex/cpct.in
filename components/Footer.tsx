"use client"

import { motion } from "framer-motion"
import { Instagram, Facebook, Twitter, Linkedin, Mail, MapPin } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/20 dark:bg-slate-700/50 ${className}`}
    />
  )
}

function FooterSkeleton() {
  return (
    <footer className="bg-[#0f2a78] dark:bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* About skeleton */}
        <div className="space-y-4">
          <SkeletonBox className="h-6 w-40" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-5/6" />
          <div className="flex gap-3 pt-2">
            <SkeletonBox className="h-9 w-9" />
            <SkeletonBox className="h-9 w-9" />
            <SkeletonBox className="h-9 w-9" />
            <SkeletonBox className="h-9 w-9" />
          </div>
        </div>

        {/* Links skeleton */}
        <div className="space-y-3">
          <SkeletonBox className="h-6 w-32" />
          <SkeletonBox className="h-4 w-40" />
          <SkeletonBox className="h-4 w-36" />
          <SkeletonBox className="h-4 w-44" />
          <SkeletonBox className="h-4 w-32" />
        </div>

        {/* Contact skeleton */}
        <div className="space-y-4">
          <SkeletonBox className="h-6 w-36" />
          <SkeletonBox className="h-4 w-56" />
          <SkeletonBox className="h-4 w-48" />
        </div>
      </div>

      <div className="border-t border-white/10 dark:border-slate-700" />
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between">
        <SkeletonBox className="h-4 w-48" />
        <SkeletonBox className="h-4 w-40" />
      </div>
    </footer>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const [loading, setLoading] = useState(true)

  // simulate loading — replace with real data loading if needed
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <FooterSkeleton />

  return (
    <footer className="bg-[#0f2a78] z-10 dark:bg-slate-950 text-white relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-semibold mb-4">About CPCT</h3>
          <p className="text-blue-200 dark:text-slate-400 leading-relaxed mb-6">
            We provide comprehensive preparation resources to help you
            succeed in your CPCT examination with confidence.
          </p>

          <div className="flex gap-4">
            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
              <div
                key={i}
                className="border border-blue-300/40 dark:border-slate-700 p-2 rounded-md 
                hover:bg-white hover:text-[#0f2a78] 
                dark:hover:bg-slate-800 dark:hover:text-white
                transition cursor-pointer"
              >
                <Icon size={18} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-blue-200 dark:text-slate-400">
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "/cpct-about" },
              { label: "Terms & Conditions", href: "/cpct-terms" },
              { label: "Privacy Policy", href: "/cpct-privacy" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="hover:text-white transition flex items-center gap-2"
                >
                  <span className="text-lg">›</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="text-2xl font-semibold mb-4">Contact Info</h3>
          <div className="space-y-4 text-blue-200 dark:text-slate-400">
            <div className="flex gap-3 items-start">
              <MapPin size={20} className="mt-1 shrink-0" />
              <p>Narmadapuram, Madhya Pradesh</p>
            </div>
            <div className="flex gap-3 items-center">
              <Mail size={20} />
              <p>
                cpcttypingtest@gmail.com</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-blue-300/20 dark:border-slate-700" />

      <div className="max-w-7xl mx-auto px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-blue-200 dark:text-slate-500 text-sm">
        <p>©{year} cpct.in. All rights reserved.</p>
        <p>
          Designed with ❤️ By{" "}
          <span className="text-white font-medium">Orionode</span>
        </p>
      </div>
    </footer>
  )
}
