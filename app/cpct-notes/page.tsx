"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiEye, FiFileText, FiAlertTriangle } from "react-icons/fi"
import { RiFolderDownloadFill } from "react-icons/ri"
import { MdFullscreen, MdFullscreenExit, MdOutlineClose } from "react-icons/md"
import Docx from "@/components/Docx"

type Note = {
  id: number
  title: string
  description: string
  file_name: string
  file_type: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [previewNote, setPreviewNote] = useState<Note | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const fetchNotes = async () => {
    try {
      setLoading(true)

      const res = await fetch("/api/notes")
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Something went wrong")

      setNotes(Array.isArray(data.notes) ? data.notes : [])
    } catch (error: any) {
      console.error(error)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewNote(null)
        setIsFullScreen(false)
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (<>
  <div className="mt-20 p-5 text-center bg-[#0b1b6f] text-white dark:bg-gray-900 dark:text-gray-100">
    <motion.h1
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="text-4xl md:text-5xl font-bold"
    >
      Notes
    </motion.h1>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="max-w-4xl mx-auto text-md leading-relaxed text-indigo-100 dark:text-indigo-200 py-1"
    >Expertly Crafted Study Materials Tailored for Your Success
     Interactive Practice Tests to Assess Your Skills and Progress
    </motion.p>
  </div>
    <div className="min-h-screen px-6 md:px-12 py-20 bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
     {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden shadow-md animate-pulse"
            >
              <div className="h-64 bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-300 dark:bg-neutral-700 rounded-lg" />
              </div>
              <div className="py-5 px-6 text-center space-y-3">
                <div className="h-5 bg-gray-300 dark:bg-neutral-700 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FiAlertTriangle className="mx-auto text-5xl mb-4 text-yellow-500" />
          No notes available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {notes.map((note) => (

            <motion.div
              key={note.id}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              onClick={() => setPreviewNote(note)}
              className="cursor-pointer"
            >
              <div className="bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition">

                <div className="h-64 bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                  {note.file_type?.includes("pdf") ? (
                    <iframe
                      src={`/api/notes/${note.id}`}
                      className="w-full h-full pointer-events-none"
                    />
                  ) : (
                    <FiFileText className="text-6xl opacity-60" />
                  )}
                </div>

                <div className="py-5 text-center">
                  <h2 className="text-xl font-semibold">
                    {note.title}
                  </h2>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {previewNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`${isFullScreen
                ? "w-screen h-screen rounded-none"
                : "w-[95%] max-w-6xl h-[90vh] rounded-3xl"
                } bg-white dark:bg-neutral-900 shadow-2xl flex flex-col`}
            >
              <div className="flex justify-between p-5 border-b">
                <h2 className="text-lg font-semibold">
                  {previewNote.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <a
                    href={`/api/notes/${previewNote.id}`}
                    download
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer text-xs sm:text-sm rounded-lg bg-blue-600 text-white whitespace-nowrap"
                  >
                    <RiFolderDownloadFill />
                    <span className="hidden sm:inline">Download</span>
                  </a>

                  <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="p-2 bg-gray-200 rounded cursor-pointer"
                  >
                    {isFullScreen ? (
                      <MdFullscreenExit size={20} />
                    ) : (
                      <MdFullscreen size={20} />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setPreviewNote(null)
                      setIsFullScreen(false)
                    }}
                    className="p-2 bg-red-500 text-white cursor-pointer rounded"
                  >
                    <MdOutlineClose size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <Docx
                  fileUrl={`/api/notes/${previewNote.id}`}
                  fileType={previewNote.file_type}
                />
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  </>)
}


