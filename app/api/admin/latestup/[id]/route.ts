import { NextRequest, NextResponse } from "next/server"
import newdb from "@/lib/newdb"

 

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const url = new URL(req.url)
  const viewPdf = url.searchParams.get("pdf")

  // 👉 If ?pdf=true → return file
  if (viewPdf === "true") {
    const [rows]: any = await newdb.query(
      "SELECT pdf_data, pdf_mime FROM announcements WHERE id = ?",
      [id]
    )

    if (!rows.length || !rows[0].pdf_data) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 })
    }

    return new NextResponse(rows[0].pdf_data, {
      headers: {
        "Content-Type": rows[0].pdf_mime,
        "Content-Disposition": "inline; filename=file.pdf",
      },
    })
  }

  // 👉 Otherwise return JSON record
  const [rows]: any = await newdb.query(
    "SELECT id, type, title, description, link, created_at FROM announcements WHERE id = ?",
    [id]
  )

  if (!rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}

 
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
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

  if (type === "pdf" && pdfBuffer) {
    await newdb.query(
      `UPDATE announcements 
       SET type=?, title=?, description=?, link=NULL, pdf_data=?, pdf_mime=? 
       WHERE id=?`,
      [type, title, description, pdfBuffer, pdfMime, id]
    )
  } else {
    await newdb.query(
      `UPDATE announcements 
       SET type=?, title=?, description=?, link=?, pdf_data=NULL, pdf_mime=NULL 
       WHERE id=?`,
      [type, title, description, link || null, id]
    )
  }

  return NextResponse.json({ message: "Updated successfully" })
}

 

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  await newdb.query("DELETE FROM announcements WHERE id = ?", [id])

  return NextResponse.json({ message: "Deleted successfully" })
}