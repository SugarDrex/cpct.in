import { NextResponse } from "next/server"
import pool from "@/lib/newdb"

export const runtime = "nodejs"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ unwrap params (IMPORTANT for Next 15)
    const { id } = await context.params

    const [rows]: any = await pool.query(
      "SELECT pdf_data, pdf_mime FROM announcements WHERE id = ? AND type = 'pdf'",
      [id]
    )

    if (!rows.length || !rows[0].pdf_data) {
      return new NextResponse("PDF not found", { status: 404 })
    }

    let pdfBuffer = rows[0].pdf_data

    // mysql2 sometimes returns { type: 'Buffer', data: [...] }
    if (pdfBuffer?.type === "Buffer") {
      pdfBuffer = Buffer.from(pdfBuffer.data)
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": rows[0].pdf_mime || "application/pdf",
        "Content-Disposition": "inline",
      },
    })
  } catch (error) {
    console.error("PDF ERROR:", error)
    return new NextResponse("Server error", { status: 500 })
  }
}