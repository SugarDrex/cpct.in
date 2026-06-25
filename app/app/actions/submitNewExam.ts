"use server";

import pool from "@/lib/newdb";

export async function getExamResult(examId: string) {
  try {
    const [rows]: any = await pool.query(
      `
      SELECT q.id as question_id,
             o.id as option_id,
             o.option_text,
             o.is_correct
      FROM cpct_new_questions q
      JOIN cpct_new_options o ON o.question_id = q.id
      WHERE q.exam_id = ?
      ORDER BY q.id ASC
      `,
      [examId]
    );

    const map: any = {};

    rows.forEach((row: any) => {
      if (!map[row.question_id]) {
        map[row.question_id] = {
          correctChoiceId: null,
          correctValue: "",
        };
      }

      if (row.is_correct === 1) {
        map[row.question_id] = {
          correctChoiceId: row.option_id,
          correctValue: row.option_text,
        };
      }
    });

    return map;
  } catch (error) {
    console.error("Server Action Error:", error);
    return {};
  }
}