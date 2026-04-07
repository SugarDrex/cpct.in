import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await context.params; // ✅ MUST AWAIT

    if (!testId) {
      return NextResponse.json(
        { error: "Invalid test id" },
        { status: 400 }
      );
    }

    const [questions]: any = await pool.query(
      `SELECT * FROM smart_exam_questions 
       WHERE exam_ref = ? 
       ORDER BY id ASC`,
      [testId]
    );

    if (!questions.length) {
      return NextResponse.json({ result: [] });
    }

    const result: any[] = [];

    for (const question of questions) {
      const [choices]: any = await pool.query(
        `SELECT * FROM smart_exam_choices 
         WHERE question_ref = ? 
         ORDER BY id ASC`,
        [question.id]
      );

      result.push({
        id: question.id,
        question: question.question,
        choices,
        ans: question.ans,
      });
    }

    return NextResponse.json({ result });

  } catch (error) {
    console.error("RESULT API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}