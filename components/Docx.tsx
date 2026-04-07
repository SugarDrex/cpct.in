"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import mammoth from "mammoth"

interface DocxViewerProps {
  fileUrl: string
  fileType: string
}

const DocxViewer: React.FC<DocxViewerProps> = ({
  fileUrl,
  fileType
}) => {
  const [html, setHtml] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true)
        setError(null)
        setDownloadProgress(0)

        if (fileType === "application/pdf") {
          setLoading(false)
          return
        }

        if (
          fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const response = await fetch(fileUrl)

          if (!response.body) {
            throw new Error("No response body")
          }

          const reader = response.body.getReader()
          const contentLength = Number(
            response.headers.get("Content-Length")
          )

          let receivedLength = 0
          const chunks: Uint8Array[] = []

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            if (value) {
              chunks.push(value)
              receivedLength += value.length

              if (contentLength) {
                const percent = Math.round(
                  (receivedLength / contentLength) * 100
                )
                setDownloadProgress(percent)
              }
            }
          }

          const combined = new Uint8Array(receivedLength)
          let position = 0

          for (const chunk of chunks) {
            combined.set(chunk, position)
            position += chunk.length
          }

          const arrayBuffer = combined.buffer

          const result = await mammoth.convertToHtml({
            arrayBuffer
          })

          setHtml(result.value)
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load document")
      } finally {
        setLoading(false)
      }
    }

    loadFile()
  }, [fileUrl, fileType])

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <motion.div
          className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </div>
    )

  if (error)
    return <div className="text-red-600">{error}</div>

  if (fileType === "application/pdf") {
    return (
      <iframe
        src={fileUrl}
        className="w-full h-[80vh] rounded-xl"
      />
    )
  }

  return (
    <div className="prose max-w-none bg-white p-6 rounded-xl shadow">
      {downloadProgress > 0 && downloadProgress < 100 && (
        <div className="mb-3">
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-600 rounded"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Downloading {downloadProgress}%
          </p>
        </div>
      )}

      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

export default DocxViewer