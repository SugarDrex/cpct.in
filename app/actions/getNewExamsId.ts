"use server";

import newdb from "@/lib/newdb";
import { RowDataPacket } from "mysql2";

interface Exam extends RowDataPacket {
  id: number;
  title: string;
  exam_date: string;
  duration_minutes: number;
}

interface Question extends RowDataPacket {
  id: number;
  exam_id: number;
  question_number: number;
  question: string;
  question_hindi?: string;
  marks: number;
  negative_marks: number;
  choices?: Choice[];
  correct_choice_id?: number | null;
}

interface Choice {
  id: number;
  val: string;
  is_correct: number;
}

// ==============================
// GET SINGLE EXAM WITH QUESTIONS
// ==============================
export async function getNewExamById(id: string) {
  try {
    // 1️⃣ Get exam
    const [examRows] = await newdb.query<Exam[]>(
      `SELECT * FROM cpct_new_exams WHERE id=?`,
      [id]
    );

    if (!examRows.length) {
      return { success: false, error: "Exam not found" };
    }

    // 2️⃣ Get questions
    const [questions] = await newdb.query<Question[]>(
      `SELECT * FROM cpct_new_questions
       WHERE exam_id=?
       ORDER BY question_number ASC`,
      [id]
    );

    // 3️⃣ Attach options
    for (let q of questions) {
      const [options] = await newdb.query<RowDataPacket[]>(
        `SELECT id, option_text, is_correct
         FROM cpct_new_options
         WHERE question_id=?
         ORDER BY id ASC`,
        [q.id]
      );

      q.choices = options.map((opt: any) => ({
        id: opt.id,
        val: opt.option_text,
        is_correct: opt.is_correct,
      }));

      const correct = options.find((opt: any) => opt.is_correct === 1);
      q.correct_choice_id = correct ? correct.id : null;
    }

    return {
      success: true,
      exam: examRows[0],
      questions,
    };

  } catch (err: any) {
    console.error("SERVER ACTION ERROR:", err);
    return { success: false, error: err.message };
  }
}