'use server';

import { createClient } from '@supabase/supabase-js';

// ── Supabase client (server-side) ──────────────────────────────────────────────
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase     = createClient(supabaseUrl, supabaseKey);

// ── Shared Types ───────────────────────────────────────────────────────────────
export interface QuestionInput {
  question_number : number;
  question_en     : string;
  question_hi?    : string;
  options         : { value: string; text: string }[];
  correct_answer  : string;
}

export interface ExamPayload {
  title     : string;
  exam_date : string;
  questions : QuestionInput[];
}

export interface ActionResult<T = null> {
  success : boolean;
  data?   : T;
  error?  : string;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CREATE  — upload a full exam + questions in one atomic batch
// ══════════════════════════════════════════════════════════════════════════════
export async function uploadExamAction(
  payload: ExamPayload
): Promise<ActionResult<{ exam_id: string; question_count: number }>> {
  try {
    if (!payload.title?.trim())      throw new Error('Exam title is required.');
    if (!payload.exam_date)          throw new Error('Exam date is required.');
    if (!payload.questions?.length)  throw new Error('At least one question is required.');

    // 1. Insert exam header
    const { data: examData, error: examError } = await supabase
      .from('mexams')
      .insert([{ title: payload.title.trim(), exam_date: payload.exam_date }])
      .select()
      .single();

    if (examError) throw new Error(`Exam insert failed: ${examError.message}`);

    // 2. Validate + map questions
    const formatted = payload.questions.map((q, idx) => {
      if (!q.question_en?.trim())
        throw new Error(`Question ${idx + 1} has no English text.`);
      if (!q.options?.length)
        throw new Error(`Question ${idx + 1} has no options.`);

      return {
        exam_id         : examData.id,
        question_number : q.question_number ?? idx + 1,
        question_en     : q.question_en.trim(),
        question_hi     : q.question_hi?.trim() || '',
        options         : q.options,
        correct_answer  : String(q.correct_answer),
      };
    });

    // 3. Batch insert questions
    const { error: qError } = await supabase
      .from('mquestions')
      .insert(formatted);

    if (qError) throw new Error(`Questions insert failed: ${qError.message}`);

    return {
      success : true,
      data    : { exam_id: examData.id, question_count: formatted.length },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  CREATE  — add a single question to an existing exam
//  (this is what the "Add New Question to This Exam" form in EditExamModal calls)
// ══════════════════════════════════════════════════════════════════════════════
export async function addQuestionToExamAction(
  examId  : string,
  question: QuestionInput
): Promise<ActionResult<{ question_id: string; question_number: number }>> {
  try {
    if (!examId) throw new Error('Exam ID is required.');
    if (!question.question_en?.trim()) throw new Error('Question text is required.');
    if (!question.options?.length)     throw new Error('At least one option is required.');
    if (question.correct_answer === undefined || question.correct_answer === null || question.correct_answer === '')
      throw new Error('A correct answer must be selected.');

    // Figure out the next question_number for this exam (server is source of truth,
    // so the client can always pass 0 / omit it and we compute it here).
    let nextNumber = question.question_number;
    if (!nextNumber) {
      const { data: existing, error: numErr } = await supabase
        .from('mquestions')
        .select('question_number')
        .eq('exam_id', examId)
        .order('question_number', { ascending: false })
        .limit(1);

      if (numErr) throw new Error(`Failed to determine question number: ${numErr.message}`);
      nextNumber = (existing?.[0]?.question_number ?? 0) + 1;
    }

    const { data, error } = await supabase
      .from('mquestions')
      .insert([{
        exam_id         : examId,
        question_number : nextNumber,
        question_en     : question.question_en.trim(),
        question_hi     : question.question_hi?.trim() || '',
        options         : question.options,
        correct_answer  : String(question.correct_answer),
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to add question: ${error.message}`);

    return {
      success : true,
      data    : { question_id: data.id, question_number: data.question_number },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  READ  — fetch all exams with nested questions (descending)
// ══════════════════════════════════════════════════════════════════════════════
export async function fetchExamsAction(): Promise<any[]> {
  const { data, error } = await supabase
    .from('mexams')
    .select(`
      id, title, exam_date, created_at,
      mquestions (
        id, question_number, question_en, question_hi,
        options, correct_answer, created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchExamsAction error:', error);
    return [];
  }
  return data ?? [];
}

// ══════════════════════════════════════════════════════════════════════════════
//  READ  — fetch a single exam by id
// ══════════════════════════════════════════════════════════════════════════════
export async function fetchExamByIdAction(
  examId: string
): Promise<ActionResult<any>> {
  try {
    const { data, error } = await supabase
      .from('mexams')
      .select(`
        id, title, exam_date, created_at,
        mquestions (
          id, question_number, question_en, question_hi,
          options, correct_answer, created_at
        )
      `)
      .eq('id', examId)
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  UPDATE  — update exam title / date
// ══════════════════════════════════════════════════════════════════════════════
export async function updateExamAction(
  examId  : string,
  updates : { title?: string; exam_date?: string }
): Promise<ActionResult> {
  try {
    if (!examId) throw new Error('Exam ID is required.');

    const patch: Record<string, any> = {};
    if (updates.title?.trim())  patch.title     = updates.title.trim();
    if (updates.exam_date)      patch.exam_date = updates.exam_date;
    if (!Object.keys(patch).length) throw new Error('No fields to update.');

    const { error } = await supabase
      .from('mexams')
      .update(patch)
      .eq('id', examId);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  UPDATE  — update a single question
// ══════════════════════════════════════════════════════════════════════════════
export async function updateQuestionAction(
  questionId : string,
  updates    : Partial<QuestionInput>
): Promise<ActionResult> {
  try {
    if (!questionId) throw new Error('Question ID is required.');

    const patch: Record<string, any> = {};
    if (updates.question_en !== undefined)     patch.question_en     = updates.question_en.trim();
    if (updates.question_hi !== undefined)     patch.question_hi     = updates.question_hi?.trim() || '';
    if (updates.options     !== undefined)     patch.options         = updates.options;
    if (updates.correct_answer !== undefined)  patch.correct_answer  = String(updates.correct_answer);
    if (updates.question_number !== undefined) patch.question_number = updates.question_number;

    const { error } = await supabase
      .from('mquestions')
      .update(patch)
      .eq('id', questionId);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  DELETE  — delete an exam (cascades to questions via FK)
// ══════════════════════════════════════════════════════════════════════════════
export async function deleteExamAction(
  examId: string
): Promise<ActionResult> {
  try {
    if (!examId) throw new Error('Exam ID is required.');

    // Delete questions first (in case FK cascade is not set)
    const { error: qErr } = await supabase
      .from('mquestions')
      .delete()
      .eq('exam_id', examId);

    if (qErr) throw new Error(`Failed to delete questions: ${qErr.message}`);

    const { error: eErr } = await supabase
      .from('mexams')
      .delete()
      .eq('id', examId);

    if (eErr) throw new Error(`Failed to delete exam: ${eErr.message}`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  DELETE  — delete a single question
// ══════════════════════════════════════════════════════════════════════════════
export async function deleteQuestionAction(
  questionId: string
): Promise<ActionResult> {
  try {
    if (!questionId) throw new Error('Question ID is required.');

    const { error } = await supabase
      .from('mquestions')
      .delete()
      .eq('id', questionId);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  REALTIME  — returns the Supabase URL & anon key so the CLIENT can subscribe
//  (server actions cannot hold open sockets; the client does that via SDK)
// ══════════════════════════════════════════════════════════════════════════════
export async function getRealtimeConfigAction(): Promise<{
  url: string;
  anonKey: string;
}> {
  return { url: supabaseUrl, anonKey: supabaseKey };
}

// ══════════════════════════════════════════════════════════════════════════════
//  STATS  — lightweight aggregate counts for the dashboard chips
// ══════════════════════════════════════════════════════════════════════════════
export async function fetchDashboardStatsAction(): Promise<
  ActionResult<{ total_exams: number; total_questions: number; recent_exam_title: string }>
> {
  try {
    const [examRes, qRes] = await Promise.all([
      supabase
        .from('mexams')
        .select('id, title', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('mquestions')
        .select('id', { count: 'exact' }),
    ]);

    if (examRes.error) throw new Error(examRes.error.message);
    if (qRes.error)    throw new Error(qRes.error.message);

    return {
      success : true,
      data    : {
        total_exams      : examRes.count ?? 0,
        total_questions  : qRes.count   ?? 0,
        recent_exam_title: examRes.data?.[0]?.title ?? '—',
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}