

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Loader2, CheckCircle2, AlertCircle, RefreshCcw,
  Trash2, Plus, RotateCcw, RotateCw, Save, Eye, X,
  Search, Filter, FileJson, ShieldAlert,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Types ──────────────────────────────────────────────
type Question = {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  question_number: number;
};

type QuestionType = {
  title?: string;
  question_number: number;
  question: string;
  options: string[];
  correct_answer: string;
};

type Exam = {
  id: string;
  exam_title: string;
  topic: string;
  total_questions: number;
  created_at: string;
};

// ── Delete Confirmation Modal ──────────────────────────
function DeleteConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md rounded-3xl border border-red-500/20 bg-white dark:bg-[#111827] p-7 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="text-red-500" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
                {description && (
                  <p className="text-slate-500 text-sm mt-0.5">{description}</p>
                )}
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              This action <span className="font-bold text-red-500">cannot be undone</span>. All associated data will be permanently removed from the database.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-white/10 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black transition flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Topic Chip ─────────────────────────────────────────
function TopicChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const colorMap: Record<string, string> = {
    All:      "bg-slate-900 dark:bg-white text-white dark:text-black",
    Email:    "bg-blue-500 text-white",
    Word:     "bg-indigo-500 text-white",
    Excel:    "bg-emerald-500 text-white",
    Database: "bg-amber-500 text-white",
    General:  "bg-purple-500 text-white",
  };

  const inactiveBase =
    "border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/30";

  return (
    <button
      onClick={onClick}
      className={`h-9 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${
        active ? (colorMap[label] ?? "bg-blue-500 text-white") : inactiveBase
      }`}
    >
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────
export default function CombinedExamDashboard() {
  const [mounted, setMounted]             = useState(false);
  const [exams, setExams]                 = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam]   = useState<Exam | null>(null);
  const [questions, setQuestions]         = useState<Question[]>([]);
  const [openModal, setOpenModal]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [refreshing, setRefreshing]       = useState(false);
  const [history, setHistory]             = useState<any[]>([]);
  const [redoStack, setRedoStack]         = useState<any[]>([]);
  const [search, setSearch]               = useState("");
  const [filterTopic, setFilterTopic]     = useState("All");

  // Upload states
  const [examTitle, setExamTitle]           = useState("");
  const [examCode, setExamCode]             = useState("");
  const [topic, setTopic]                   = useState("");
  const [jsonText, setJsonText]             = useState("");
  const [uploadQuestions, setUploadQuestions] = useState<QuestionType[]>([]);
  const [status, setStatus]                 = useState("Ready");
  const [error, setError]                   = useState("");
  const [success, setSuccess]               = useState("");

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "exam" | "question";
    id: string;
    label: string;
  } | null>(null);

  useEffect(() => { setMounted(true); loadExams(); }, []);

  // Filter
  useEffect(() => {
    let data = [...exams];
    if (search) data = data.filter((e) => e.exam_title.toLowerCase().includes(search.toLowerCase()));
    if (filterTopic !== "All") data = data.filter((e) => e.topic === filterTopic);
    setFilteredExams(data);
  }, [exams, search, filterTopic]);

  // Realtime
  useEffect(() => {
    const channel = supabase.channel("realtime-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "exams" }, () => loadExams())
      .on("postgres_changes", { event: "*", schema: "public", table: "exam_questions" }, () => {
        if (selectedExam) loadQuestions(selectedExam.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedExam]);

  const loadExams = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.from("exams").select("*").order("created_at", { ascending: false });
      if (!error) setExams(data || []);
    } finally { setRefreshing(false); }
  };

  const loadQuestions = async (examId: string) => {
    setLoading(true);
    const { data } = await supabase.from("exam_questions").select("*").eq("exam_id", examId).order("question_number", { ascending: true });
    setQuestions(data || []);
    setLoading(false);
  };

  const openExamModal = async (exam: Exam) => {
    setSelectedExam(exam);
    setOpenModal(true);
    await loadQuestions(exam.id);
  };

  const saveHistory = () => {
    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(questions))]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [...prev, questions]);
    setQuestions(previous);
    setHistory(history.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, questions]);
    setQuestions(next);
    setRedoStack(redoStack.slice(0, -1));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    saveHistory();
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qid: string, index: number, value: string) => {
    saveHistory();
    setQuestions((prev) => prev.map((q) => {
      if (q.id === qid) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (qid: string) => {
    saveHistory();
    setQuestions((prev) => prev.map((q) => q.id === qid ? { ...q, options: [...q.options, ""] } : q));
  };

  const deleteOption = (qid: string, index: number) => {
    saveHistory();
    setQuestions((prev) => prev.map((q) => ({
      ...q,
      options: q.id === qid ? q.options.filter((_, i) => i !== index) : q.options,
    })));
  };

  const saveQuestion = async (question: Question) => {
    try {
      setSaving(true);
      await supabase.from("exam_questions").update({
        question: question.question,
        options: question.options,
        correct_answer: question.correct_answer,
      }).eq("id", question.id);
    } finally { setSaving(false); }
  };

  // ── Guarded deletes via modal ──────────────────────
  const confirmDeleteQuestion = (id: string, qNum: number) => {
    setDeleteTarget({ type: "question", id, label: `Question #${qNum}` });
  };

  const confirmDeleteExam = (examId: string, title: string) => {
    setDeleteTarget({ type: "exam", id: examId, label: `"${title}"` });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "question") {
      await supabase.from("exam_questions").delete().eq("id", deleteTarget.id);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
    } else {
      await supabase.from("exam_questions").delete().eq("exam_id", deleteTarget.id);
      await supabase.from("exams").delete().eq("id", deleteTarget.id);
      setExams((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      if (selectedExam?.id === deleteTarget.id) setOpenModal(false);
    }
    setDeleteTarget(null);
  };

  const detectTopic = (title: string) => {
    const upper = title.toUpperCase();
    if (upper.includes("EMAIL")) return "Email";
    if (upper.includes("WORD")) return "Word";
    if (upper.includes("EXCEL")) return "Excel";
    if (upper.includes("DATABASE")) return "Database";
    return "General";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(""); setSuccess("");
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      setJsonText(text);
      const parsed = JSON.parse(text);
      setUploadQuestions(parsed);
      const title = parsed?.[0]?.title || file.name.replace(".json", "");
      setExamTitle(title);
      setExamCode(title.toUpperCase().replace(/[^A-Z0-9]/g, "-"));
      setTopic(detectTopic(title));
      setSuccess(`${parsed.length} questions loaded`);
    } catch {
      setError("Invalid JSON file — please check the format.");
      setTimeout(() => setError(""), 4000);
    }
  };

  // ref to reset the hidden file input after upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetUploadForm = () => {
    setExamTitle("");
    setExamCode("");
    setTopic("");
    setJsonText("");
    setUploadQuestions([]);
    setStatus("Ready");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!uploadQuestions.length) {
      setError("Please select a JSON file first.");
      setTimeout(() => setError(""), 4000);
      return;
    }
    if (!examTitle.trim()) {
      setError("Exam title is required.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    // ── Duplicate guard ──────────────────────────────────
    const duplicate = exams.find(
      (e) => e.exam_title.trim().toLowerCase() === examTitle.trim().toLowerCase()
    );
    if (duplicate) {
      setError(`"${examTitle}" is already uploaded. Delete the existing one first if you want to re-upload.`);
      setTimeout(() => setError(""), 5000);
      return;
    }
    // ────────────────────────────────────────────────────

    try {
      setLoading(true);
      setError("");
      const { data: examData } = await supabase.from("exams").insert([{
        exam_title: examTitle, exam_code: examCode, topic,
        total_questions: uploadQuestions.length, raw_json: uploadQuestions,
      }]).select().single();
      const formatted = uploadQuestions.map((q) => ({
        exam_id: examData.id, question_uid: crypto.randomUUID(), title: examTitle,
        question_number: q.question_number, question: q.question,
        options: q.options, correct_answer: q.correct_answer,
      }));
      await supabase.from("exam_questions").insert(formatted);

      // Show success, reset form, refresh list
      setSuccess(`✓ "${examTitle}" uploaded with ${uploadQuestions.length} questions`);
      resetUploadForm();
      loadExams();

      // Auto-dismiss success banner after 4 s
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = useMemo(() => uploadQuestions.length, [uploadQuestions]);

  // Flags whether the loaded exam title already exists
  const isDuplicate = useMemo(
    () =>
      !!examTitle.trim() &&
      exams.some(
        (e) => e.exam_title.trim().toLowerCase() === examTitle.trim().toLowerCase()
      ),
    [examTitle, exams]
  );

  // All unique topics for chip bar
  const allTopics = useMemo(() => ["All", ...Array.from(new Set(exams.map((e) => e.topic)))], [exams]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1120] py-20 text-slate-900 dark:text-white transition-colors duration-300">

      {/* Delete confirmation overlay */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.label ?? "item"}?`}
        description={
          deleteTarget?.type === "exam"
            ? "This will also delete all questions in this exam."
            : "This question will be permanently removed."
        }
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-black">CPCT Exam Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Upload, manage, edit and sync exams realtime</p>
          </div>
          <button
            onClick={loadExams}
            className="h-12 px-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold flex items-center gap-2"
          >
            {refreshing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
            Refresh
          </button>
        </div>

        {/* SEARCH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams..."
              className="w-full h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-12 outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="w-full h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-12 outline-none"
            >
              <option>All</option>
              {[...new Set(exams.map((e) => e.topic))].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── TOPIC CHIPS ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allTopics.map((t) => (
            <TopicChip
              key={t}
              label={t}
              active={filterTopic === t}
              onClick={() => setFilterTopic(t)}
            />
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="xl:col-span-2 space-y-6">

            {/* UPLOAD */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="text-blue-500" />
                <h2 className="text-2xl font-black">Upload Exam</h2>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 text-red-500">
                  <AlertCircle size={18} />{error}
                </div>
              )}
              {success && (
                <div className="mb-5 rounded-2xl bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3 text-green-500">
                  <CheckCircle2 size={18} />{success}
                </div>
              )}

              {/* Duplicate warning — shown as soon as title matches */}
              {isDuplicate && !error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3 text-amber-600 dark:text-amber-400"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Already uploaded</p>
                    <p className="text-sm mt-0.5 opacity-80">
                      An exam titled <span className="font-semibold">"{examTitle}"</span> already exists. Delete the existing exam first if you want to replace it.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="Exam Title"
                  className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 outline-none" />
                <input value={examCode} onChange={(e) => setExamCode(e.target.value)} placeholder="Exam Code"
                  className="h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 outline-none" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: "Topic", value: topic || "—" },
                  { label: "Questions", value: totalQuestions },
                  { label: "Exams", value: exams.length },
                  { label: "Status", value: "Live" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl bg-slate-100 dark:bg-white/5 p-4">
                    <p className="text-sm text-slate-500">{label}</p>
                    <h3 className="font-black text-xl mt-1">{value}</h3>
                  </div>
                ))}
              </div>

              <label className="mt-6 flex flex-col items-center justify-center h-[220px] rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 cursor-pointer hover:scale-[1.01] transition bg-slate-50 dark:bg-white/[0.03]">
                <Upload size={40} />
                <h3 className="font-black text-2xl mt-4">Upload JSON</h3>
                <p className="text-slate-500 mt-2">Click to upload exam json</p>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
              </label>

              {jsonText && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileJson size={18} />
                    <h3 className="font-bold">JSON Preview</h3>
                  </div>
                  <textarea readOnly value={jsonText}
                    className="w-full h-[250px] rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-4 font-mono text-sm outline-none" />
                </div>
              )}

              <button onClick={handleUpload} disabled={loading || isDuplicate}
                className={`mt-6 w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                  isDuplicate
                    ? "bg-amber-400/20 border-2 border-amber-400/40 text-amber-600 dark:text-amber-400 cursor-not-allowed"
                    : "bg-black dark:bg-white text-white dark:text-black"
                }`}>
                {loading ? (
                  <><Loader2 className="animate-spin" /> Uploading...</>
                ) : isDuplicate ? (
                  <><AlertCircle size={20} /> Already Uploaded</>
                ) : (
                  <><Upload size={20} /> Upload Questions</>
                )}
              </button>
            </div>

            {/* EXAM CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredExams.map((exam) => (
                <motion.div key={exam.id} whileHover={{ y: -4 }}
                  className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold">{exam.topic}</div>
                    <div className="text-sm text-slate-500">{exam.total_questions} Qs</div>
                  </div>
                  <h2 className="text-2xl font-black mt-5 leading-snug">{exam.exam_title}</h2>
                  <div className="flex items-center gap-3 mt-5">
                    <button onClick={() => openExamModal(exam)}
                      className="flex-1 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center gap-2">
                      <Eye size={18} /> Open
                    </button>
                    <button onClick={() => confirmDeleteExam(exam.id, exam.exam_title)}
                      className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 h-fit sticky top-5">
            <h2 className="text-2xl font-black">System Status</h2>
            <div className="space-y-4 mt-6">
              {[
                { label: "Realtime Sync", value: "Active" },
                { label: "Total Exams", value: exams.length },
                { label: "Upload Status", value: status },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-slate-100 dark:bg-white/5 p-5">
                  <p className="text-slate-500 text-sm">{label}</p>
                  <h3 className="font-black text-xl mt-1">{String(value)}</h3>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── QUESTION EDITOR MODAL ── */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto p-4"
          >
            <div className="max-w-6xl mx-auto">
              <div className="rounded-[32px] bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 p-6">

                {/* TOP */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-black">{selectedExam?.exam_title}</h2>
                    <p className="text-slate-500 mt-2">Realtime CRUD editor</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleUndo} className="h-12 px-5 rounded-2xl bg-slate-100 dark:bg-white/5"><RotateCcw size={18} /></button>
                    <button onClick={handleRedo} className="h-12 px-5 rounded-2xl bg-slate-100 dark:bg-white/5"><RotateCw size={18} /></button>
                    <button onClick={() => setOpenModal(false)}
                      className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center"><X size={18} /></button>
                  </div>
                </div>

                {/* QUESTIONS */}
                <div className="space-y-6">
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Loader2 className="animate-spin" size={40} />
                    </div>
                  ) : (
                    questions.map((q) => (
                      <div key={q.id}
                        className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-5">

                        {/* ── QUESTION HEADER with correct answer badge ── */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black shrink-0">
                            {q.question_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <textarea
                              value={q.question}
                              onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                              className="w-full min-h-[100px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 outline-none"
                            />
                            {/* ── Correct answer badge ── */}
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Correct answer:</span>
                              {q.correct_answer ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-400 text-sm font-semibold max-w-full">
                                  <CheckCircle2 size={13} className="shrink-0" />
                                  <span className="truncate">{q.correct_answer}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-semibold">
                                  <AlertCircle size={13} className="shrink-0" />
                                  Not set
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* OPTIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                          {q.options.map((option, index) => {
                            const isCorrect = q.correct_answer === option;
                            return (
                              <div key={index}
                                className={`rounded-2xl border p-4 flex items-center gap-3 ${isCorrect
                                  ? "border-green-500 bg-green-500/10"
                                  : "border-slate-200 dark:border-white/10"}`}>
                                <input
                                  value={option}
                                  onChange={(e) => updateOption(q.id, index, e.target.value)}
                                  className="flex-1 bg-transparent outline-none"
                                />
                                <button
                                  onClick={() => updateQuestion(q.id, "correct_answer", option)}
                                  className={`px-4 h-10 rounded-xl text-sm font-bold ${isCorrect
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-100 dark:bg-white/10"}`}>
                                  {isCorrect ? "Correct" : "Mark"}
                                </button>
                                <button
                                  onClick={() => deleteOption(q.id, index)}
                                  className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center">
                                  <X size={15} />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* FOOTER */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                          <button onClick={() => addOption(q.id)}
                            className="h-11 px-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold flex items-center gap-2">
                            <Plus size={16} /> Add Option
                          </button>
                          <div className="flex items-center gap-3">
                            <button onClick={() => saveQuestion(q)}
                              className="h-11 px-5 rounded-2xl bg-blue-600 text-white flex items-center gap-2">
                              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                              Save
                            </button>
                            <button
                              onClick={() => confirmDeleteQuestion(q.id, q.question_number)}
                              className="w-11 h-11 rounded-2xl bg-red-500 text-white flex items-center justify-center">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
 
    </div>
  );
}