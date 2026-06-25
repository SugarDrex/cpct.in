import { NextResponse } from "next/server"
import newdb from "@/lib/newdb"

const MAX_FILE_SIZE = 5 * 1024 * 1024

/* ================= GET FILE ================= */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const [rows]: any = await newdb.query(
      `SELECT file_data, file_type, file_name
       FROM new_cpct_notes
       WHERE id = ?`,
      [id]
    )

    if (!rows.length) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const file = rows[0]

    return new NextResponse(file.file_data, {
      headers: {
        "Content-Type": file.file_type,
        "Content-Disposition": `inline; filename="${file.file_name}"`
      }
    })

  } catch (error) {
    console.error("GET FILE ERROR:", error)
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    )
  }
}

/* ================= UPDATE ================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const formData = await req.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const file = formData.get("file") as File | null

    if (!title) {
      return NextResponse.json(
        { error: "Title required" },
        { status: 400 }
      )
    }

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())

      await newdb.query(
        `UPDATE new_cpct_notes
         SET title=?, description=?, file_name=?, file_type=?, file_size=?, file_data=?
         WHERE id=?`,
        [
          title,
          description || null,
          file.name,
          file.type,
          file.size,
          buffer,
          id
        ]
      )
    } else {
      await newdb.query(
        `UPDATE new_cpct_notes
         SET title=?, description=?
         WHERE id=?`,
        [title, description || null, id]
      )
    }

    return NextResponse.json({ message: "Updated successfully" })

  } catch (error) {
    console.error("PUT ERROR:", error)
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    )
  }
}

/* ================= DELETE (HARD DELETE) ================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const [result]: any = await newdb.query(
      `DELETE FROM new_cpct_notes WHERE id = ?`,
      [id]
    )

    console.log("Deleted rows:", result.affectedRows)

    return NextResponse.json({ message: "Deleted successfully" })

  } catch (error) {
    console.error("DELETE ERROR:", error)
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    )
  }
}