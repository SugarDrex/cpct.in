import { NextResponse } from "next/server"
import  newdb from "@/lib/newdb"
 export async function GET() {
  try {
    const [rows] = await newdb.query(`
      SELECT id, title, description, file_name, file_type, file_size, created_at
      FROM new_cpct_notes
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `)

    return NextResponse.json({
      success: true,
      notes: rows,
    })

  } catch (error: any) {
    console.error("NOTES FETCH ERROR:", error) // 👈 VERY IMPORTANT

    return NextResponse.json(
      {
        success: false,
        error: error.message, // 👈 show real error
      },
      { status: 500 }
    )
  }
}