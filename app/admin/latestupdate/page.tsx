"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Announcement = {
  id: number
  type: "link" | "pdf"
  title: string
  description: string
  link: string
}

export default function AnnouncementsPage() {
  const [data, setData] = useState<Announcement[]>([])
  const [type, setType] = useState<"link" | "pdf">("link")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /* FETCH */
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/latestup")
      if (!res.ok) throw new Error("Failed to fetch data")
      const result = await res.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* RESET */
  const resetForm = () => {
    setEditingId(null)
    setTitle("")
    setDescription("")
    setLink("")
    setFile(null)
    setType("link")
  }

  /* CREATE / UPDATE */
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("type", type)
      formData.append("title", title)
      formData.append("description", description)

      if (type === "link") formData.append("link", link)
      if (type === "pdf" && file) formData.append("file", file)

      const res = await fetch(
        editingId
          ? `/api/admin/latestup/${editingId}`
          : "/api/admin/latestup",
        {
          method: editingId ? "PUT" : "POST",
          body: formData,
        }
      )

      if (!res.ok) throw new Error("Operation failed")

      setMessage(editingId ? "Updated successfully" : "Created successfully")
      resetForm()
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* DELETE */
  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      const res = await fetch(`/api/admin/latestup/${deleteId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Delete failed")

      setMessage("Deleted successfully")
      fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleteId(null)
    }
  }

  const openEditModal = (item: Announcement) => {
    setEditingId(item.id)
    setType(item.type)
    setTitle(item.title)
    setDescription(item.description)
    setLink(item.link)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-25">
      <div className="max-w-5xl mx-auto space-y-12">


        {/* CREATE FORM */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border dark:border-zinc-800">
         
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-5">
         Latest Updates
        </h1> <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid md:grid-cols-2 gap-6">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="p-3 rounded-xl border dark:bg-zinc-800 cursor-pointer"
              >
                <option value="link">Link</option>
                <option value="pdf">PDF</option>
              </select>

              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-3 rounded-xl border dark:bg-zinc-800"
                required
              />
            </div>

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-xl border dark:bg-zinc-800"
              required
            />

            {type === "link" && (
              <input
                placeholder="https://example.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full p-3 rounded-xl border dark:bg-zinc-800"
                required
              />
            )}

            {type === "pdf" && (
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                required={!editingId}
                className="cursor-pointer"
              />
            )}

            <button
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              {editingId ? "Update Announcement" : "Create Announcement"}
            </button>
          </form>
        </div>

        {/* CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 -mt-5">
          {data.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border dark:border-zinc-800"
            >
              <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-400 rounded-full">
                {item.type.toUpperCase()}
              </span>

              <h2 className="font-semibold mt-3 text-gray-900 dark:text-gray-200">
                {item.title}
              </h2>

              <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                {item.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">

                {/* LIVE PREVIEW */}
                {item.type === "link" ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400 text-xs font-medium cursor-pointer"
                  >
                    Live Preview
                  </a>
                ) : (
                  <a
                    href={`/api/admin/latestup/${item.id}?pdf=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400 text-xs font-medium cursor-pointer"
                  >
                    Preview PDF
                  </a>
                )}

                <button
                  onClick={() => openEditModal(item)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-400 text-xs font-medium cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={() => setDeleteId(item.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 text-xs font-medium cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl w-96 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">
                Confirm Delete?
              </h3>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-zinc-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
                >
                  Yes Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl w-[500px] shadow-xl">
              <h3 className="text-lg font-semibold mb-6">
                Edit Announcement
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg dark:bg-zinc-800"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border rounded-lg dark:bg-zinc-800"
                />

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}