"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX,
  FiFileText,
  FiAlertTriangle
} from "react-icons/fi"
import Docx from "@/components/Docx"
import { BsCloudUploadFill } from "react-icons/bs"

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
  const [actionLoading, setActionLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "large">("grid")
  const [showModal, setShowModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<number | null>(null)
  const [previewNote, setPreviewNote] = useState<Note | null>(null)

  const [toast, setToast] = useState<{ type: string; message: string } | null>(null)
  const [editNote, setEditNote] = useState<Note | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    file: null as File | null
  })

  const [errors, setErrors] = useState<{ title?: string; file?: string }>({})


  const fetchNotes = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/notes")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNotes(data.notes)
    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false)
        setDeleteModal(null)
        setPreviewNote(null)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  /* ================= TOAST ================= */
  const showToast = (type: string, message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  /* ================= FILE SELECT ================= */
  const handleFileSelect = (file: File) => {
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "")
    setForm({
      ...form,
      file,
      title: form.title || cleanTitle
    })
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let validationErrors: any = {}

    if (!form.title) validationErrors.title = "Title is required"
    if (!editNote && !form.file) validationErrors.file = "File is required"

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    const formData = new FormData()
    formData.append("title", form.title)
    formData.append("description", form.description)
    if (form.file) formData.append("file", form.file)

    try {
      setActionLoading(true)

      const method = editNote ? "PUT" : "POST"
      const url = editNote
        ? `/api/admin/notes/${editNote.id}`
        : `/api/admin/notes`

      const res = await fetch(url, { method, body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      showToast("success", editNote ? "Updated successfully" : "Created successfully")

      setShowModal(false)
      setEditNote(null)
      setForm({ title: "", description: "", file: null })
      setErrors({})
      fetchNotes()

    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setActionLoading(false)
    }
  }

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteModal) return
    try {
      setActionLoading(true)
      await fetch(`/api/admin/notes/${deleteModal}`, { method: "DELETE" })
      showToast("success", "Deleted successfully")
      setDeleteModal(null)
      fetchNotes()
    } catch {
      showToast("error", "Delete failed")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-10 py-28 min-h-screen relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0f172a] dark:to-[#1e293b] transition-all duration-500">

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white z-50 shadow-lg ${toast.type === "error" ? "bg-red-500" : "bg-green-600"
              }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
          <FiFileText className="text-blue-600" />
          Notes Management
        </h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition"
        >
          <FiPlus />
          Add Note
        </motion.button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-lg animate-pulse border border-gray-200 dark:border-gray-700">
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-6"></div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <FiAlertTriangle className="mx-auto text-5xl mb-4 text-yellow-500" />
          No notes available
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {notes.map((note) => (
            <motion.div key={note.id} className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-lg border">
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white">{note.title}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                {note.description || "No description provided"}
              </p>
              <div className="flex justify-between mt-6 text-sm font-medium">
                <button onClick={() => setPreviewNote(note)} className="cursor-pointer text-blue-600">
                  <FiEye /> View
                </button>
                <button onClick={() => {
                  setEditNote(note)
                  setForm({ title: note.title, description: note.description, file: null })
                  setShowModal(true)
                }} className="cursor-pointer text-yellow-600">
                  <FiEdit2 /> Edit
                </button>
                <button onClick={() => setDeleteModal(note.id)} className="cursor-pointer text-red-600">
                  <FiTrash2 /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 p-3 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl w-full max-w-md relative shadow-2xl"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-red-500"
              >
                <FiX size={30} />
              </button>

              <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                {editNote ? "Edit Note" : "Create Note"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter Title"
                  className="w-full border p-3 rounded-xl dark:bg-[#0f172a] dark:border-gray-700 dark:text-white"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

                <textarea
                  placeholder="Enter Description"
                  className="w-full border p-3 rounded-xl dark:bg-[#0f172a] dark:border-gray-700 dark:text-white"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                /><span className="flex p-1 gap-2 "> <BsCloudUploadFill size={18} /><input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="dark:text-gray-300"
                />
                  {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
                </span>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 cursor-pointer text-white py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  {actionLoading && (
                    <motion.div
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    />
                  )}
                  {editNote ? "Update Note" : "Create Note"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div className="fixed inset-0  bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div className="bg-white  dark:bg-[#1e293b] p-8 rounded-2xl w-full max-w-sm relative shadow-xl">
              <button
                onClick={() => setDeleteModal(null)}
                className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-red-500"
              >
                <FiX />
              </button>

              <p className="text-lg font-semibold mb-6   text-gray-800 dark:text-white">
                Confirm deletion?
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 cursor-pointer bg-gray-200 dark:bg-gray-700 dark:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded-xl"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewNote && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div className="bg-white dark:bg-[#1e293b] w-[95%] max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col relative">
              <button
                onClick={() => setPreviewNote(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              >
                <FiX />
              </button>

              <div className="p-5 border-b dark:border-gray-700 font-semibold text-gray-800 dark:text-white">
                {previewNote.title}
              </div>

              <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-[#0f172a]">
                <Docx
                  fileUrl={`/api/admin/notes/${previewNote.id}`}
                  fileType={previewNote.file_type}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}