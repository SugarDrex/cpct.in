"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiFileText, FiAlertTriangle } from "react-icons/fi"
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

type Category = "all" | "computers" | "tech" | "network" | "email" | "inter" | "anti" | "other"

const CATEGORIES: { key: Category; label: string; color: string }[] = [
  { key: "all", label: "All", color: "bg-blue-600" },
  { key: "computers", label: "Computers", color: "bg-indigo-500" },
  { key: "tech", label: "Tech", color: "bg-emerald-500" },
  { key: "network", label: "Network", color: "bg-amber-500" },
  { key: "email", label: "Email", color: "bg-pink-500" },
  { key: "inter", label: "Inter", color: "bg-cyan-500" },
  { key: "anti", label: "Anti", color: "bg-red-500" },
  { key: "other", label: "Other", color: "bg-gray-500" },
]

function getCategory(note: Note): Category {
  const text = `${note.title} ${note.description}`.toLowerCase()

  if (text.includes("anti")) return "anti"
  if (text.includes("inter")) return "inter"
  if (text.includes("email") || text.includes("mail")) return "email"
  if (text.includes("network")) return "network"
  if (
    text.includes("tech") ||
    text.includes("technology") ||
    text.includes("cloud") ||
    text.includes("office") ||
    text.includes("suite")
  ) return "tech"
  if (text.includes("computer")) return "computers"

  return "other"
}

function getCategoryColor(category: Category): string {
  return CATEGORIES.find(c => c.key === category)?.color ?? "bg-gray-500"
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [previewNote, setPreviewNote] = useState<Note | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<Category>("all")

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

  const sortedNotes = useMemo(() => {
    const priority: Record<Category, number> = {
      all: 0, computers: 1, tech: 2, network: 3,
      email: 4, inter: 5, anti: 6, other: 7,
    }
    return [...notes].sort((a, b) => {
      const catA = getCategory(a)
      const catB = getCategory(b)
      if (priority[catA] !== priority[catB]) {
        return priority[catA] - priority[catB]
      }
      return a.title.localeCompare(b.title)
    })
  }, [notes])

  const filteredNotes = useMemo(() => {
    if (activeCategory === "all") return sortedNotes
    return sortedNotes.filter(n => getCategory(n) === activeCategory)
  }, [sortedNotes, activeCategory])

  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      all: notes.length, computers: 0, tech: 0, network: 0,
      email: 0, inter: 0, anti: 0, other: 0,
    }
    notes.forEach(n => {
      counts[getCategory(n)]++
    })
    return counts
  }, [notes])

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
      >
        Expertly Crafted Study Materials Tailored for Your Success
        Interactive Practice Tests to Assess Your Skills and Progress
      </motion.p>
    </div>

    <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-neutral-800 px-4 py-4">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2">
        {CATEGORIES.map(({ key, label, color }) => {
          const isActive = activeCategory === key
          const count = categoryCounts[key]
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 cursor-pointer border-2
                ${isActive
                  ? `${color} text-white border-transparent shadow-lg scale-105`
                  : "bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 hover:shadow"
                }
              `}
            >
              <span>{label}</span>
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                ${isActive ? "bg-white/30 text-white" : "bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400"}
              `}>
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>

    <div className="min-h-screen px-6 md:px-12 py-12 bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
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
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FiAlertTriangle className="mx-auto text-5xl mb-4 text-yellow-500" />
          <p className="text-lg">No notes available in this category</p>
          {activeCategory !== "all" && (
            <button
              onClick={() => setActiveCategory("all")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Show All Notes
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {filteredNotes.map((note) => {
            const category = getCategory(note)
            const badgeColor = getCategoryColor(category)
            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                onClick={() => setPreviewNote(note)}
                className="cursor-pointer"
              >
                <div className="bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition">
                  <div className="h-64 bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative">
                    {note.file_type?.includes("pdf") ? (
                      <iframe
                        src={`/api/notes/${note.id}`}
                        className="w-full h-full pointer-events-none"
                      />
                    ) : (
                      <FiFileText className="text-6xl opacity-60" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`${badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow`}>
                        {category === "inter" ? "INTER" : category}
                      </span>
                    </div>
                  </div>
                  <div className="py-5 text-center px-4">
                    <h2 className="text-xl font-semibold line-clamp-2">
                      {note.title}
                    </h2>
                    {note.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {note.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
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
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    {previewNote.title}
                  </h2>
                  <span className={`${getCategoryColor(getCategory(previewNote))} text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase`}>
                    {getCategory(previewNote) === "inter" ? "INTER" : getCategory(previewNote)}
                  </span>
                </div>
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
                    className="p-2 bg-red-300 text-white cursor-pointer rounded-md"
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
