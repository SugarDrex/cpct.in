"use server";

import pool from "@/lib/db";

export async function getSmartExamResult(examId: string) {
  try {
    // 1️⃣ Get questions
    const [questions]: any = await pool.query(
      `
      SELECT * FROM smart_exam_questions
      WHERE exam_ref = ?
      ORDER BY id ASC
      `,
      [examId]
    );

    if (!questions.length) return {};

    const resultMap: any = {};

    // 2️⃣ For each question, get choices
    for (const question of questions) {
      const [choices]: any = await pool.query(
        `
        SELECT * FROM smart_exam_choices
        WHERE question_ref = ?
        ORDER BY id ASC
        `,
        [question.id]
      );

      // ans is numeric index (like 1,2,3,4)
      const correctChoice =
        choices?.[Number(question.ans) - 1] ?? null;

      resultMap[question.id] = {
        correctChoiceId: correctChoice?.id ?? null,
        correctValue: correctChoice?.val ?? "",
      };
    }

    return resultMap;

  } catch (error) {
    console.error("Smart Exam Server Action Error:", error);
    return {};
  }
}