"use server";

import db from "@/lib/db";

export async function getSmartExamData() {
  try {
    const getExamMonths = async (category_ref: string) => {
      const [rows]: any = await db.query(`
        SELECT YEAR(examDate) AS exam_year, 
               MONTH(examDate) AS exam_month,
               MAX(examDate) AS latest_exam_date
        FROM smart_exam
        WHERE examDate IS NOT NULL
          AND cat_ref = ?
          AND active = 'YES'
        GROUP BY exam_year, exam_month
        ORDER BY exam_year DESC, exam_month DESC
      `, [category_ref]);

      return rows;
    };

    const exams2024 = await getExamMonths("13");
    const exams2023 = await getExamMonths("5");

    const [topics]: any = await db.query(`
      SELECT * 
      FROM smart_catogery 
      WHERE active = 'YES' 
        AND name NOT LIKE 'CPCT Exam%'
    `);

    return {
      exams2024,
      exams2023,
      topics,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}