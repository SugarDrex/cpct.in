import { NextRequest, NextResponse } from "next/server"
import  newdb   from "@/lib/newdb"

export async function GET() {
  const [rows] = await newdb.query(
    "SELECT id, type, title, description, link, pdf_mime, created_at FROM announcements ORDER BY id DESC"
  )

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const type = formData.get("type") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const link = formData.get("link") as string
  const file = formData.get("file") as File | null

  let pdfBuffer = null
  let pdfMime = null

  if (file && type === "pdf") {
    const bytes = await file.arrayBuffer()
    pdfBuffer = Buffer.from(bytes)
    pdfMime = file.type
  }

  await newdb.query(
    `INSERT INTO announcements 
    (type, title, description, link, pdf_data, pdf_mime)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [type, title, description, link || null, pdfBuffer, pdfMime]
  )

  return NextResponse.json({ message: "Created" })
}