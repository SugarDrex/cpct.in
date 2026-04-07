import { NextResponse } from "next/server"
import newdb from "@/lib/newdb"

const MAX_FILE_SIZE = 5 * 1024 * 1024

/* ================= GET ALL NOTES ================= */
export async function GET() {
  try {
    const [rows]: any = await newdb.query(`
      SELECT id, title, description, file_name, file_type, file_size, created_at
      FROM new_cpct_notes
      ORDER BY created_at DESC
    `)

    return NextResponse.json({ notes: rows }, { status: 200 })

  } catch (error) {
    console.error("GET ERROR:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}

/* ================= CREATE NOTE ================= */
export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const file = formData.get("file") as File

    if (!title || !file) {
      return NextResponse.json(
        { error: "Title and file are required" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be under 5MB" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    await newdb.query(
      `INSERT INTO new_cpct_notes
       (title, description, file_name, file_type, file_size, file_data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        file.name,
        file.type,
        file.size,
        buffer
      ]
    )

    return NextResponse.json(
      { message: "Note created successfully" },
      { status: 201 }
    )

  } catch (error) {
    console.error("POST ERROR:", error)
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    )
  }
}