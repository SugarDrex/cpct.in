'use server'

import pool from "@/lib/db";

export async function getExamOldByIdModel(id: string) {
  try {
    // 1️⃣ Get exam
    const [examRows]: any = await pool.query(
      "SELECT * FROM smart_exam WHERE id = ?",
      [id]
    );

    if (!examRows.length) {
      return {
        error: "Exam not found",
        status: 404,
      };
    }

    // 2️⃣ Get questions (correct column exam_ref)
    const [questions]: any = await pool.query(
      "SELECT * FROM smart_exam_questions WHERE exam_ref = ?",
      [id]
    );

    // 3️⃣ Get choices (correct column question_ref)
    for (let question of questions) {
      const [choices]: any = await pool.query(
        "SELECT * FROM smart_exam_choices WHERE question_ref = ?",
        [question.id]
      );

      question.choices = choices;
    }

    return {
      exam: examRows[0],
      questions,
      status: 200,
    };

  } catch (error) {
    console.error("ACTION ERROR:", error);

    return {
      error: "Internal Server Error",
      status: 500,
    };
  }
}