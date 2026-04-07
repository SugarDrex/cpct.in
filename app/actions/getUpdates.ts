"use server"

import pool from "@/lib/newdb"

export async function getAnnouncements() {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, type, title, description, link, created_at
       FROM announcements
       ORDER BY created_at DESC`
    )

    return rows
  } catch (error) {
    console.error("LIST ERROR:", error)
    throw new Error("Failed to fetch announcements")
  }
}