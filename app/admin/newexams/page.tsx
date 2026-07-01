"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Exam {
  id: number;
  title: string;
  exam_date: string;
  duration_minutes: number;
  shift?: number;
}

interface MonthGroup {
  month: number;
  year: number;
  exams: Exam[];
}

type OptionItem =
  | string
  | {
      text?: string;
      option_text?: string;
      option?: string;
      label?: string;
      value?: string;
      is_correct?: boolean;
    };

interface Question {
  question?: string;
  question_text?: string;
  question_hi?: string;
  question_text_hi?: string;
  options?: OptionItem[];
  answer?: string | number;
  correct_answer?: string | number;
  correct_option?: number;
}

// ============================================================
// Pure helpers (kept outside the component so they're easy to
// unit test and don't get re-created on every render)
// ============================================================

/** Extract plain display text from an option, regardless of shape. */
const extractOptionTextRaw = (opt: OptionItem): string => {
  if (typeof opt === "string") return opt;
  if (opt && typeof opt === "object") {
    return (
      opt.text ||
      opt.option_text ||
      opt.option ||
      opt.label ||
      opt.value ||
      JSON.stringify(opt)
    );
  }
  return String(opt);
};

/**
 * Normalizes HTML-ish question/option text into clean lines.
 * Handles every realistic <br> variant (upper/lowercase, self-closing,
 * spaced, HTML-entity-encoded) plus stray whitespace, and strips any
 * other tags that might have leaked in from the source document.
 */
const cleanHtml = (text?: string): string => {
  if (!text) return "";
  return text
    .replace(/&lt;br\s*\/?&gt;/gi, "\n") // encoded <br>
    .replace(/<br\s*\/?>/gi, "\n") // <br>, <br/>, <br />, <BR>
    .replace(/<\/br>/gi, "\n")
    .replace(/<[^>]+>/g, "") // strip any remaining tags
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
};

/** Cleaned, comparison-safe display text for an option. */
const extractOptionText = (opt: OptionItem): string =>
  cleanHtml(extractOptionTextRaw(opt)).trim();

/** Determines whether a given option (by index) is the correct answer. */
const isCorrectOption = (
  opt: OptionItem,
  index: number,
  answerRaw: string | number | undefined,
  correctOptionNum?: number | null
): boolean => {
  if (typeof opt === "object" && opt !== null) {
    const flag = (opt as any).is_correct;
    if (flag === true || flag === "true" || flag === 1 || flag === "1") {
      return true;
    }
  }

  if (
    correctOptionNum !== undefined &&
    correctOptionNum !== null &&
    !isNaN(correctOptionNum)
  ) {
    return index + 1 === correctOptionNum;
  }

  if (answerRaw === undefined || answerRaw === null || answerRaw === "") {
    return false;
  }

  const numAnswer = typeof answerRaw === "string" ? parseInt(answerRaw, 10) : answerRaw;
  if (!isNaN(numAnswer as number) && (numAnswer as number) > 0) {
    return index + 1 === numAnswer;
  }

  const optText = extractOptionText(opt);
  const cleanedAnswer =
    typeof answerRaw === "string" ? cleanHtml(answerRaw).trim() : answerRaw;
  return (
    optText === cleanedAnswer ||
    optText.toLowerCase() === String(cleanedAnswer).toLowerCase()
  );
};

export default function ExamsAdmin() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [status, setStatus] = useState<{
    type: "success" | "error" | "loading" | null;
    message: string;
  } | null>(null);

  // ================= FETCH =================
  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/newexams");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setExams(data);
    } catch {
      setStatus({ type: "error", message: "Failed to fetch exams" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Derive month groupings from `exams` instead of re-fetching separately.
  // (The original code fetched the same endpoint twice in two effects —
  // that's removed here; this is just a memoized derivation.)
  const months: MonthGroup[] = useMemo(() => {
    const grouped: Record<string, MonthGroup> = {};
    exams.forEach((exam) => {
      if (!exam.exam_date) return;
      const [yearStr, monthStr] = exam.exam_date.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const key = `${year}-${month}`;
      if (!grouped[key]) grouped[key] = { year, month, exams: [] };
      grouped[key].exams.push(exam);
    });
    return Object.values(grouped).sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.month - a.month
    );
  }, [exams]);

  const monthsByYear = useMemo(() => {
    return months.reduce<Record<number, MonthGroup[]>>((acc, curr) => {
      if (!acc[curr.year]) acc[curr.year] = [];
      acc[curr.year].push(curr);
      return acc;
    }, {});
  }, [months]);

  const monthName = (month: number) =>
    new Date(0, month - 1).toLocaleString("default", { month: "long" });

  // ================= DELETE =================
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeletingId(deleteId);
      setStatus({ type: "loading", message: "Deleting exam..." });
      const res = await fetch(`/api/admin/newexams/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setExams((prev) => prev.filter((e) => e.id !== deleteId));
      setStatus({ type: "success", message: "Exam deleted successfully" });
      setDeleteId(null);
    } catch {
      setStatus({ type: "error", message: "Delete failed. Try again." });
    } finally {
      setDeletingId(null);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // ================= UPDATE =================
  const updateExam = async () => {
    if (!editing) return;
    try {
      setProcessing(true);
      setStatus({ type: "loading", message: "Updating exam..." });
      const res = await fetch(`/api/admin/newexams/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error();
      setExams((prev) => prev.map((e) => (e.id === editing.id ? editing : e)));
      setEditing(null);
      setStatus({ type: "success", message: "Exam updated successfully" });
    } catch {
      setStatus({ type: "error", message: "Update failed. Try again." });
    } finally {
      setProcessing(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!file) return;
    try {
      setProcessing(true);
      setStatus({ type: "loading", message: "Uploading exam..." });
      setUploadProgress(30);
      const text = await file.text();
      const json = JSON.parse(text);
      setUploadProgress(70);
      const res = await fetch("/api/admin/newexams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error();
      setUploadProgress(100);
      await fetchExams();
      setStatus({ type: "success", message: "Exam uploaded successfully" });
      setTimeout(() => {
        setUploadOpen(false);
        setFile(null);
        setUploadProgress(0);
      }, 800);
    } catch {
      setStatus({ type: "error", message: "Upload failed. Invalid JSON?" });
    } finally {
      setProcessing(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // ================= DOWNLOAD DOCX =================
  const handleDownload = async (exam: Exam) => {
    try {
      setDownloadingId(exam.id);
      setStatus({ type: "loading", message: "Generating DOCX..." });

      const res = await fetch(`/api/admin/newexams/${exam.id}`);
      if (!res.ok) throw new Error("Failed to fetch exam details");
      const examData = await res.json();

      const [
        {
          Document,
          Packer,
          Paragraph,
          TextRun,
          Table,
          TableCell,
          TableRow,
          WidthType,
          AlignmentType,
          BorderStyle,
          ShadingType,
          HeadingLevel,
          TableLayoutType,
        },
        { saveAs },
      ] = await Promise.all([import("docx"), import("file-saver")]);

      const questions: Question[] = examData.questions || [];
      const children: any[] = [];

      const noBorder = {
        top: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
      };

      // ---------- Title ----------
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: exam.title,
              bold: true,
              color: "1B3A5C",
              size: 48,
            }),
          ],
        })
      );

      // ---------- Subtitle ----------
      const dateObj = new Date(exam.exam_date);
      const dateStr = isNaN(dateObj.getTime())
        ? exam.exam_date
        : dateObj.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `Exam Date: ${dateStr}  |  Total Questions: ${questions.length}`,
              color: "666666",
              size: 20,
            }),
          ],
        })
      );

      // ---------- Divider ----------
      children.push(
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: "" })],
                  borders: {
                    top: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: "888888" },
                    left: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                    right: { style: BorderStyle.NIL, size: 0, color: "FFFFFF" },
                  },
                  width: { size: 100, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: TableLayoutType.FIXED,
        })
      );
      children.push(new Paragraph({ text: "", spacing: { after: 200 } }));

      // ---------- Questions ----------
      questions.forEach((q, index) => {
        const qNum = index + 1;

        // Clean both the primary field AND the hi field independently —
        // this is the fix: previously a stray <br> sitting *inside* the
        // English text (used as a separator before the Hindi translation
        // that the source data sometimes embeds in the same field) wasn't
        // reliably caught. cleanHtml now normalizes every <br> variant and
        // both fields are always run through it before rendering.
        const questionTextRaw = q.question || q.question_text || "";
        const questionHiRaw = q.question_hi || q.question_text_hi || "";

        const questionLines = cleanHtml(questionTextRaw)
          .split("\n")
          .filter(Boolean);
        const hiLines = cleanHtml(questionHiRaw).split("\n").filter(Boolean);

        const rawOptions = q.options || [];
        const answer = q.answer ?? q.correct_answer ?? undefined;
        const correctOptionNum = q.correct_option ?? null;

        const questionRuns: any[] = [
          new TextRun({ text: `Q${qNum}. `, bold: true }),
        ];
        questionLines.forEach((line, i) => {
          questionRuns.push(new TextRun({ text: line, break: i > 0 ? 1 : 0 }));
        });
        hiLines.forEach((line) => {
          questionRuns.push(new TextRun({ text: line, break: 1 }));
        });

        children.push(
          new Paragraph({
            spacing: { before: 300, after: 150 },
            children: questionRuns,
          })
        );

        // ---------- Options ----------
        // Generalized to support any number of options (not hardcoded to 4):
        // renders two per row, last row gets a single full-width cell if odd.
        const options = rawOptions.map(extractOptionText);

        // Explicit DXA (twip) widths instead of percentage + AUTOFIT.
        // AUTOFIT with no declared widths collapses columns to near-zero
        // in Word, which is what caused every word to wrap onto its own
        // line. FIXED + explicit widths is what Word actually honors
        // reliably. 4680 twips × 2 ≈ 6.5in, matching a standard US Letter
        // page with 1in margins.
        const COL_WIDTH_DXA = 4680;
        const cellMargins = { top: 100, bottom: 100, left: 150, right: 150 };

        const createCell = (num: number, text: string, isCorrect: boolean) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `(${num}) ${text}`,
                    bold: isCorrect,
                    color: isCorrect ? "0F5132" : "000000",
                  }),
                ],
              }),
            ],
            borders: noBorder,
            margins: cellMargins,
            width: { size: COL_WIDTH_DXA, type: WidthType.DXA },
            shading: isCorrect
              ? { fill: "D4EDDA", type: ShadingType.CLEAR, color: "auto" }
              : undefined,
          });

        if (options.length > 0) {
          // Compute correctness/text as plain data first so the odd-cell
          // branch never needs to reach into a built TableCell's internals.
          const cellDefs = rawOptions.map((opt, i) => ({
            num: i + 1,
            text: options[i],
            isCorrect: isCorrectOption(opt, i, answer, correctOptionNum),
          }));

          const fullWidthCell = (def: (typeof cellDefs)[number]) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `(${def.num}) ${def.text}`,
                      bold: def.isCorrect,
                      color: def.isCorrect ? "0F5132" : "000000",
                    }),
                  ],
                }),
              ],
              borders: noBorder,
              margins: cellMargins,
              width: { size: COL_WIDTH_DXA * 2, type: WidthType.DXA },
              columnSpan: 2,
              shading: def.isCorrect
                ? { fill: "D4EDDA", type: ShadingType.CLEAR, color: "auto" }
                : undefined,
            });

          const rows: any[] = [];
          for (let i = 0; i < cellDefs.length; i += 2) {
            const defA = cellDefs[i];
            const defB = cellDefs[i + 1];
            if (defB) {
              rows.push(
                new TableRow({
                  children: [
                    createCell(defA.num, defA.text, defA.isCorrect),
                    createCell(defB.num, defB.text, defB.isCorrect),
                  ],
                })
              );
            } else {
              rows.push(new TableRow({ children: [fullWidthCell(defA)] }));
            }
          }

          children.push(
            new Table({
              rows,
              columnWidths: [COL_WIDTH_DXA, COL_WIDTH_DXA],
              borders: noBorder,
              layout: TableLayoutType.FIXED,
            })
          );

          // Diagnostic: if nothing matched as correct, surface that
          // plainly instead of silently rendering with no highlight.
          // Shows the actual per-option is_correct values (the real
          // schema, confirmed from the edit page: each option object
          // carries its own is_correct/option_text/option_value) so we
          // can see definitively whether the data has it or not.
          const hasAnyCorrect = cellDefs.some((d) => d.isCorrect);
          if (!hasAnyCorrect) {
            const isCorrectFlags = rawOptions.map((o: any) =>
              typeof o === "object" && o !== null ? o.is_correct : undefined
            );
            children.push(
              new Paragraph({
                spacing: { before: 60 },
                children: [
                  new TextRun({
                    text: `⚠ No answer key detected for Q${qNum} (option is_correct values: ${JSON.stringify(
                      isCorrectFlags
                    )}, answer: ${JSON.stringify(
                      answer
                    )}, correct_option: ${JSON.stringify(correctOptionNum)})`,
                    italics: true,
                    size: 16,
                    color: "B45309",
                  }),
                ],
              })
            );
          }
        }

        children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
      });

      // ---------- Footer ----------
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
          children: [
            new TextRun({
              text: "Generated by Competitive Exam Portal | Government Examination Database Management System",
              italics: true,
              size: 18,
              color: "888888",
            }),
          ],
        })
      );

      const doc = new Document({ sections: [{ properties: {}, children }] });
      const blob = await Packer.toBlob(doc);
      const filename = `${exam.title.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
      saveAs(blob, filename);

      setStatus({ type: "success", message: "DOCX downloaded successfully" });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to generate DOCX" });
    } finally {
      setDownloadingId(null);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const Spinner = () => (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
      aria-hidden
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Exams Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage exam papers, upload question sets, and export print-ready DOCX files
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/docx">
                <button className="cursor-pointer inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-sm font-medium">
                  📄 DOCX Converter
                </button>
              </Link>
              <button
                onClick={() => setUploadOpen(true)}
                className="cursor-pointer inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium"
              >
                + Upload Exam
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl px-4 py-3">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">💡</span>
            <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              <span className="font-semibold">Recommended:</span> Convert your DOCX file into
              JSON using the DOCX Converter, download the generated JSON file, then upload it
              here to add the exam.
            </p>
          </div>
        </div>

        {/* ===== STATUS TOAST ===== */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium shadow-md flex items-center gap-2
              ${
                status.type === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : status.type === "error"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              }`}
            >
              {status.type === "loading" && <Spinner />}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== EXAM CARDS GRID ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

          {!loading && exams.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400 dark:text-gray-500">
              No exams yet. Click <span className="font-medium">+ Upload Exam</span> to add one.
            </div>
          )}

          {!loading &&
            exams.map((exam) => (
              <motion.div
                key={exam.id}
                layout
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-[#141f33] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-200 dark:border-white/10 flex flex-col justify-between"
              >
                {deletingId === exam.id ? (
                  <CardSkeleton />
                ) : (
                  <>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 line-clamp-2">
                        {exam.title}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-6 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 font-medium">
                          📅 {new Date(exam.exam_date).toLocaleDateString()}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 font-medium">
                          ⏱ {exam.duration_minutes} mins
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <a
                        href={`/admin/newexams/${exam.id}`}
                        className="cursor-pointer flex-1 text-center text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg transition font-medium"
                      >
                        Edit
                      </a>

                      <button
                        onClick={() => handleDownload(exam)}
                        disabled={downloadingId === exam.id}
                        className="cursor-pointer flex-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-medium"
                      >
                        {downloadingId === exam.id ? (
                          <Spinner />
                        ) : (
                          <>⬇ DOCX</>
                        )}
                      </button>

                      <button
                        onClick={() => setDeleteId(exam.id)}
                        disabled={deletingId === exam.id}
                        className="cursor-pointer text-sm bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
        </div>

        {/* ===== DELETE MODAL ===== */}
        <AnimatePresence>
          {deleteId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-[#141f33] w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Confirm Delete</h2>
                  <button
                    onClick={() => setDeleteId(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                  Are you sure you want to delete this exam? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition text-sm font-medium"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== EDIT MODAL ===== */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-[#141f33] w-full max-w-md rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Edit Exam</h2>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Title
                </label>
                <input
                  className="w-full mb-4 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Exam Date
                </label>
                <input
                  type="date"
                  className="w-full mb-4 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editing.exam_date}
                  onChange={(e) => setEditing({ ...editing, exam_date: e.target.value })}
                />
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  className="w-full mb-6 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editing.duration_minutes}
                  onChange={(e) =>
                    setEditing({ ...editing, duration_minutes: Number(e.target.value) })
                  }
                />
                <button
                  onClick={updateExam}
                  disabled={processing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm font-medium"
                >
                  {processing && <Spinner />}
                  {processing ? "Saving..." : "Save Changes"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== UPLOAD MODAL ===== */}
        <AnimatePresence>
          {uploadOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-[#141f33] w-full max-w-md rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    Upload Exam JSON
                  </h2>
                  <button
                    onClick={() => setUploadOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-6 mb-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition text-center">
                  <span className="text-2xl">📁</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {file ? file.name : "Click to select a JSON file"}
                  </span>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                {processing && (
                  <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full mb-4 overflow-hidden">
                    <motion.div
                      className="bg-green-600 h-2 rounded-full"
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={processing || !file}
                  className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {processing && <Spinner />}
                  {processing ? "Uploading..." : "Upload"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== MONTH GROUPS ===== */}
        {!loading &&
          Object.entries(monthsByYear).map(([year, yearMonths]) => (
            <div key={year} className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                CPCT Exam {year}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {yearMonths.map((m) => (
                  <a
                    key={`${m.year}-${m.month}`}
                    href={`/admin/newexams/month/${m.year}/${m.month}`}
                    className="group bg-white dark:bg-[#141f33] hover:shadow-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm transition-all duration-200 flex items-center gap-4"
                  >
                    <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl text-xl">
                      📅
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {monthName(m.month)}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {m.year} · {m.exams.length} exam{m.exams.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

const CardSkeleton = () => (
  <div className="bg-white dark:bg-[#141f33] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-white/10 animate-pulse">
    <div className="h-5 w-2/3 bg-gray-200 dark:bg-white/10 rounded mb-4"></div>
    <div className="flex gap-2 mb-6">
      <div className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded-full"></div>
      <div className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded-full"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-9 flex-1 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
      <div className="h-9 flex-1 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
      <div className="h-9 w-16 bg-gray-200 dark:bg-white/10 rounded-lg"></div>
    </div>
  </div>
);