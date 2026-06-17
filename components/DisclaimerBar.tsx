"use client"

import React, { useState, useCallback } from "react"
import { IoClose } from "react-icons/io5"
import { HiOutlineInformationCircle } from "react-icons/hi2"

export default function DisclaimerBar() {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-16 left-0 w-full z-[999] animate-in fade-in duration-300">
      {/* Gradient Top Border */}
      <div className="h-0.5 bg-gradient-to-r from-blue-600/0 via-blue-500 to-blue-600/0" />

      {/* Main Container */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start sm:items-center justify-between gap-4">
            {/* Left Content */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Icon */}
            

              {/* Text Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-sm font-bold text-white mb-1 truncate">
                Notice
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed mb-2">
                  <span className="text-blue-300 font-semibold">CPCT.IN</span> is an independent learning
                    platform offering mock tests, typing practice, and study
                    notes for CPCT aspirants. It is not affiliated with the
                    Government of Madhya Pradesh or the official CPCT portal,
                    and is not intended to mislead, represent, or substitute any
                    official government website or service. For official.{" "}
                  <a
                    href="https://cpct.mp.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition-colors"
                  >&nbsp;
                    → cpct.mp.gov.in 
                  </a>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close disclaimer"
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600 transition-all duration-200 flex items-center justify-center group active:scale-95"
            >
              <IoClose 
                size={18} 
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Glow */}
      <div className="h-px bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0" />
    </div>
  )
}