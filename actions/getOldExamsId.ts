"use server";

import pool from "@/lib/db";

export async function getOldExamsId(year: string, month: string) {
  try {
    const formattedMonth = month.padStart(2, "0");

    const [rows]: any = await pool.query(
      `
      SELECT *
      FROM smart_exam
      WHERE YEAR(examDate) = ?
      AND MONTH(examDate) = ?
      AND status = 'Active'
      `,
      [year, formattedMonth]
    );

    return rows?.[0] || null;
  } catch (error) {
    console.error("DB ERROR:", error);
    throw new Error("Failed to fetch exam");
  }
}