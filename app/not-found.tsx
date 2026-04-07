"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">

    
      <main className="flex flex-1 items-center justify-center px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-10 text-center max-w-xl border border-gray-200 dark:border-gray-700"
        >

          {/* 404 */}
          <motion.h1
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-7xl font-bold text-blue-900 dark:text-blue-400"
          >
            404
          </motion.h1>

          <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Page Not Found
          </h2>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">

            <Link
              href="/"
              className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition font-medium"
            >
              Return to Home
            </Link>

            <Link
              href="/cpct-in-contact"
              className="px-6 py-3 border border-blue-900 text-blue-900 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition font-medium"
            >
              Contact Support
            </Link>

          </div>      
        

        </motion.div>
      </main>

    

    </div>
  )
}
