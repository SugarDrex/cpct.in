import { NextResponse } from "next/server"
import pool from "@/lib/newdb"

export const runtime = "nodejs"

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, type, title, description, link, created_at
       FROM announcements
       ORDER BY created_at DESC`
    )

    return NextResponse.json(rows)
  } catch (error) {
    console.error("LIST ERROR:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}