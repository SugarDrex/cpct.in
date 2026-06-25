import { NextResponse } from "next/server";
import   newdb  from "@/lib/newdb";

export async function POST(req: Request) {
  const { answers } = await req.json();

  let score = 0;

  for (const questionId in answers) {
    const [rows]: any = await newdb.query(
      `SELECT is_correct FROM cpct_new_options
       WHERE question_id = ? AND option_value = ?`,
      [questionId, answers[questionId]]
    );

    if (rows.length && rows[0].is_correct) {
      score += 1;
    } else {
      score -= 0.25;
    }
  }

  return NextResponse.json({ score });
}