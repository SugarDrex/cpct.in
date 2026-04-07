import { NextResponse } from "next/server"
import newdb from "@/lib/newdb"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
 
    const { id } = await context.params

    const [rows]: any = await newdb.query(
      `SELECT file_name, file_type, file_data
       FROM new_cpct_notes
       WHERE id = ?`,
      [id]
    )

    if (!rows.length) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    const file = rows[0]

    return new NextResponse(file.file_data, {
      headers: {
        "Content-Type": file.file_type,
        "Content-Disposition": `inline;"`,
      },
    })
  } catch (error) {
    console.error("FILE FETCH ERROR:", error)

    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    )
  }
}