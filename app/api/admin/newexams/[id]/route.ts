import { NextResponse } from "next/server";
import newdb from "@/lib/newdb";


// =============================
// CREATE (Optional Single Exam Create)
// =============================
export async function POST(req: Request) {
  try {
    const { title, exam_date, duration_minutes } = await req.json();

    const [result]: any = await newdb.query(
      `INSERT INTO cpct_new_exams 
       (title, exam_date, duration_minutes)
       VALUES (?, ?, ?)`,
      [title, exam_date, duration_minutes || 60]
    );

    return NextResponse.json({
      success: true,
      examId: result.insertId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}


// =============================
// READ SINGLE EXAM (FULL DATA)
// =============================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [exam]: any = await newdb.query(
      `SELECT * FROM cpct_new_exams WHERE id=?`,
      [id]
    );

    if (!exam.length) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    const [questions]: any = await newdb.query(
      `SELECT * FROM cpct_new_questions 
       WHERE exam_id=? 
       ORDER BY question_number ASC`,
      [id]
    );

    for (let q of questions) {
      const [options]: any = await newdb.query(
        `SELECT * FROM cpct_new_options 
         WHERE question_id=? 
         ORDER BY option_value ASC`,
        [q.id]
      );

      q.options = options;
    }

    return NextResponse.json({
      success: true,
      exam: exam[0],
      questions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}


// =============================
// UPDATE EXAM
// =============================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const connection = await newdb.getConnection();
  await connection.beginTransaction();

  try {
    const body = await req.json();
    const { exam, questions } = body;

    // =============================
    // UPDATE EXAM
    // =============================
    await connection.query(
      `UPDATE cpct_new_exams 
       SET title=?, exam_date=?, duration_minutes=?
       WHERE id=?`,
      [
        exam.title,
        exam.exam_date?.split("T")[0],
        Number(exam.duration_minutes),
        id
      ]
    );

    // =============================
    // UPDATE QUESTIONS
    // =============================
    for (const q of questions) {
      await connection.query(
        `UPDATE cpct_new_questions 
         SET question=?
         WHERE id=?`,
        [q.question, q.id]
      );

      // =============================
      // UPDATE OPTIONS
      // =============================
      for (const opt of q.options) {
        await connection.query(
          `UPDATE cpct_new_options 
           SET option_text=?, is_correct=?
           WHERE id=?`,
          [opt.option_text, opt.is_correct ? 1 : 0, opt.id]
        );
      }
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Full exam updated successfully",
    });

  } catch (err: any) {
    await connection.rollback();
    console.error("PUT ERROR:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// =============================
// DELETE (YOUR ORIGINAL - UNCHANGED)
// =============================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;   // ✅ FIXED
  const connection = await newdb.getConnection();
  await connection.beginTransaction();

  try {
    // delete options
    await connection.query(
      `DELETE o FROM cpct_new_options o
       JOIN cpct_new_questions q ON o.question_id = q.id
       WHERE q.exam_id = ?`,
      [id]
    );

    // delete questions
    await connection.query(
      `DELETE FROM cpct_new_questions WHERE exam_id=?`,
      [id]
    );

    // delete exam
    await connection.query(
      `DELETE FROM cpct_new_exams WHERE id=?`,
      [id]
    );

    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await connection.rollback();
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

