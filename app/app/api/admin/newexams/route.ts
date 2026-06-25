import { NextResponse } from "next/server";
import newdb from "@/lib/newdb";

// ========================
// CREATE EXAM (JSON Upload)
// ========================
export async function POST(req: Request) {
  const connection = await newdb.getConnection();
  await connection.beginTransaction();

  try {
    const data = await req.json();

    if (!data.examTitle || !data.examDate || !data.questions?.length) {
      throw new Error("Invalid exam data");
    }

    const [examResult]: any = await connection.query(
      `INSERT INTO cpct_new_exams 
       (title, exam_date, duration_minutes)
       VALUES (?, ?, ?)`,
      [data.examTitle, data.examDate, data.duration_minutes || 60]
    );

    const examId = examResult.insertId;

    for (const q of data.questions) {
      const [questionResult]: any = await connection.query(
        `INSERT INTO cpct_new_questions 
        (exam_id, question_number, question, question_hindi, marks, negative_marks)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          examId,
          q.questionNumber,
          q.question,
          q.question_hindi || null,
          q.marks || 1,
          q.negative_marks || 0.25,
        ]
      );

      const questionId = questionResult.insertId;

      for (const opt of q.options) {
        await connection.query(
          `INSERT INTO cpct_new_options
          (question_id, option_value, option_text, is_correct)
          VALUES (?, ?, ?, ?)`,
          [
            questionId,
            opt.value,
            opt.text,
            opt.value === q.correctAnswer ? 1 : 0,
          ]
        );
      }
    }

    await connection.commit();
    return NextResponse.json({ success: true, examId });
  } catch (err: any) {
    await connection.rollback();
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

 
// ========================
// GET ALL EXAMS (OPTIONAL FILTER)
// ========================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    let query = `SELECT * FROM cpct_new_exams`;
    let values: any[] = [];

    if (year && month) {
      const y = Number(year);
      const m = Number(month);

      const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
      const nextMonth = m === 12 ? 1 : m + 1;
      const nextYear = m === 12 ? y + 1 : y;

      const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

      query += `
        WHERE exam_date >= ?
        AND exam_date < ?
      `;

      values.push(startDate, endDate);
    }

    query += ` ORDER BY exam_date DESC`;

    const [rows] = await newdb.query(query, values);

    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}