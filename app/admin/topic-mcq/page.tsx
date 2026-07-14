"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mammoth from "mammoth";
import {
  Upload, Loader2, CheckCircle2, AlertCircle, RefreshCcw,
  Trash2, Plus, RotateCcw, RotateCw, Save, Eye, X,
  Search, Filter, FileJson, ShieldAlert, Download, Zap,
  FileText, BarChart3, TrendingUp, Clock, BookOpen,
  ArrowRightLeft, Hash, ChevronDown, ChevronUp,
  LayoutList, Edit3, Check, ChevronRight, Flag,
  User, Lock, Menu, PanelLeftClose,
  PanelLeft, Shield, BadgeCheck, AlertTriangle,
  FileSpreadsheet, Layers, GripVertical, Sparkles, FileDown
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase Client ────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

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

type EditorMode = "view" | "edit" | "add";
type ConverterMode = "json-to-exam" | "word-to-json";
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const TOPIC_OPTIONS = ["Fundamental", "Email", "Word", "Excel", "Database", "Power Point", "Network", "Other"];

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  "Email": "📧",
  "Word": "📄",
  "Excel": "📊",
  "Database": "🗄️",
  "PowerPoint": "🎯",
  "Network": "🌐",
  "Hardware": "⚙️",
  "Fundamental": "📚",
  "Other": "⭐"
};

// ── Utility: Unique ID ─────────────────────────────────
const uid = () => Math.random().toString(36).substring(2, 9);

// ── Toast Notification System ────────────────────────────
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-3 right-3 left-3 sm:left-auto sm:top-4 sm:right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`pointer-events-auto w-full sm:min-w-[320px] sm:max-w-md rounded-xl border p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3
              ${toast.type === "success" ? "bg-emerald-50/95 border-emerald-200 dark:bg-emerald-950/90 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200" :
                toast.type === "error" ? "bg-red-50/95 border-red-200 dark:bg-red-950/90 dark:border-red-800 text-red-800 dark:text-red-200" :
                toast.type === "warning" ? "bg-amber-50/95 border-amber-200 dark:bg-amber-950/90 dark:border-amber-800 text-amber-800 dark:text-amber-200" :
                "bg-blue-50/95 border-blue-200 dark:bg-blue-950/90 dark:border-blue-800 text-blue-800 dark:text-blue-200"}`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && <BadgeCheck size={20} className="text-emerald-600 dark:text-emerald-400" />}
              {toast.type === "error" && <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />}
              {toast.type === "warning" && <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />}
              {toast.type === "info" && <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Skeleton Loader ────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-700" />
        <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-6 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700 mb-2" />
      <div className="h-4 w-1/2 rounded-md bg-slate-200 dark:bg-slate-700 mb-4" />
      <div className="flex gap-2">
        <div className="h-9 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ──────────────────────────
function DeleteConfirmModal({
  open, title, description, onConfirm, onCancel, confirmText = "Delete"
}: {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md rounded-2xl border border-red-200 bg-white dark:bg-[#0f172a] p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{title}</h3>
                {description && (
                  <p className="text-slate-500 text-sm mt-0.5">{description}</p>
                )}
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              This action <span className="font-bold text-red-600">cannot be undone</span>. All associated data will be permanently removed from the database.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Topic Badge ────────────────────────────────────────
function TopicBadge({ topic }: { topic: string }) {
  const colorMap: Record<string, string> = {
    Email: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    Word: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    Excel: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    Database: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    PowerPoint: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    Network: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
    Hardware: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
    Fundamental: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    Other: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold border whitespace-nowrap ${colorMap[topic] ?? colorMap.Fundamental}`}>
      {TOPIC_ICONS[topic] && <span className="mr-1">{TOPIC_ICONS[topic]}</span>}
      {topic}
    </span>
  );
}

// ── Confirmation Badge ─────────────────────────────────
function ConfirmationBadge({ count, label, icon: Icon, color = "blue" }: { count: number; label: string; icon: any; color?: "blue" | "emerald" | "amber" | "rose" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800",
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${colors[color]} text-[11px] sm:text-xs font-bold whitespace-nowrap`}
    >
      <Icon size={14} className="shrink-0" />
      <span>{count} {label}</span>
    </motion.div>
  );
}

// ── Live JSON Preview Component ────────────────────────
function JsonLivePreview({ questions, title, onRemove }: {
  questions: QuestionType[];
  title: string;
  onRemove?: (idx: number) => void;
}) {
  const [expanded, setExpanded] = useState<number[]>([]);

  const toggleExpand = (idx: number) => {
    setExpanded((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  };

  if (!questions.length) return null;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Eye size={18} className="text-[#1E6091] shrink-0" />
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mr-1">Live Preview</h3>
          <ConfirmationBadge count={questions.length} label="Questions" icon={FileJson} color="blue" />
          <ConfirmationBadge
            count={questions.filter((q) => q.correct_answer).length}
            label="With Answers"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate sm:max-w-[180px] sm:text-right">{title}</span>
      </div>

      <div className="max-h-[420px] sm:max-h-[500px] overflow-y-auto space-y-2 pr-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 sm:p-3">
        {questions.map((q, idx) => {
          const isExpanded = expanded.includes(idx);
          const hasAnswer = !!q.correct_answer;
          return (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`rounded-lg border bg-white dark:bg-slate-800/50 overflow-hidden transition-all ${
                hasAnswer ? "border-slate-200 dark:border-slate-700" : "border-amber-200 dark:border-amber-900/50"
              }`}
            >
              <div
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                onClick={() => toggleExpand(idx)}
              >
                <GripVertical size={14} className="text-slate-300 shrink-0 hidden sm:block" />
                <span className="w-6 h-6 rounded bg-[#0B2545] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {q.question_number}
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 flex-1">
                  {q.question || "Untitled Question"}
                </p>
                {!hasAnswer && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 hidden sm:inline-block shrink-0">
                    No Answer
                  </span>
                )}
                {isExpanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                {onRemove && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                    className="w-6 h-6 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 transition shrink-0"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1.5 ml-7 sm:ml-8">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`text-xs px-2 py-1.5 rounded border ${
                            opt === q.correct_answer
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300 font-bold"
                              : "bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                          }`}
                        >
                          <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span> {opt || "Empty option"}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Word to JSON Converter Section ─────────────────────
function WordToJsonConverter({ onToast }: { onToast: (msg: string, type: ToastType) => void }) {
  const [converting, setConverting] = useState(false);
  const [wordError, setWordError] = useState("");
  const [wordSuccess, setWordSuccess] = useState("");
  const [convertedJson, setConvertedJson] = useState<QuestionType[]>([]);
  const [wordFileName, setWordFileName] = useState("");
  const [extractedTitle, setExtractedTitle] = useState("");
  const [rawPreview, setRawPreview] = useState("");
  const [showRawPreview, setShowRawPreview] = useState(false);
  const wordInputRef = useRef<HTMLInputElement>(null);

  const resetConverter = () => {
    setConvertedJson([]);
    setWordFileName("");
    setExtractedTitle("");
    setWordError("");
    setWordSuccess("");
    setRawPreview("");
    setShowRawPreview(false);
    if (wordInputRef.current) wordInputRef.current.value = "";
  };

  const parseQuestionsFromHtml = (html: string): QuestionType[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const questions: QuestionType[] = [];
    let currentQuestion: {
      question_number: number;
      question: string;
      options: string[];
      correct_answer: string;
    } | null = null;

    let qNum = 1;
    let inOptions = false;

    const elements = Array.from(doc.querySelectorAll("p, li"));

    for (const el of elements) {
      const text = el.textContent?.trim() || "";
      if (!text) continue;

      const tagName = el.tagName.toLowerCase();

      const qMatch = text.match(/^QUESTION\s+(\d+)[:.]?\s*(.*)/i);
      if (qMatch) {
        if (currentQuestion && currentQuestion.options.length >= 2) {
          questions.push(currentQuestion);
        }

        currentQuestion = {
          question_number: qNum++,
          question: qMatch[2].trim(),
          options: [],
          correct_answer: "",
        };
        inOptions = false;
        continue;
      }

      if (!currentQuestion) continue;

      if (/^Option[s]?:/i.test(text)) {
        inOptions = true;
        continue;
      }

      if (tagName === "li") {
        inOptions = true;
        const isBold = el.querySelector("strong, b") !== null;
        const cleanText = text.replace(/^(\d+)[.)]\s*/, "").trim();
        if (cleanText) {
          currentQuestion.options.push(cleanText);
          if (isBold && !currentQuestion.correct_answer) {
            currentQuestion.correct_answer = cleanText;
          }
        }
        continue;
      }

      const optMatch = text.match(/^(\d+)[.)]\s+(.*)/);
      if (optMatch) {
        inOptions = true;
        const optText = optMatch[2].trim();
        const isBold = el.querySelector("strong, b") !== null;

        if (optText) {
          currentQuestion.options.push(optText);
          if (isBold && !currentQuestion.correct_answer) {
            currentQuestion.correct_answer = optText;
          }
        }
        continue;
      }

      if (inOptions && currentQuestion.options.length > 0) {
        currentQuestion.options[currentQuestion.options.length - 1] += " " + text;
      } else if (!inOptions && text) {
        currentQuestion.question += " " + text;
      }
    }

    if (currentQuestion && currentQuestion.options.length >= 2) {
      questions.push(currentQuestion);
    }

    questions.forEach((q, idx) => {
      q.question_number = idx + 1;
    });

    return questions;
  };

  const handleWordFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setConverting(true);
      setWordError("");
      setWordSuccess("");
      setConvertedJson([]);
      setRawPreview("");
      setShowRawPreview(false);

      const file = e.target.files?.[0];
      if (!file) {
        setConverting(false);
        return;
      }

      if (!file.name.endsWith(".docx") && !file.name.endsWith(".doc")) {
        setWordError("Please upload a .docx or .doc file");
        setConverting(false);
        return;
      }

      setWordFileName(file.name);
      const title = file.name.replace(/\.(docx|doc)$/i, "");
      setExtractedTitle(title);

      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      if (!html || html.trim().length < 50) {
        setWordError("The document appears to be empty or contains no extractable text.");
        setConverting(false);
        return;
      }

      const rawText = html
        .replace(/<p>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      setRawPreview(rawText);

      const doc = new DOMParser().parseFromString(html, "text/html");
      const firstParagraphs = Array.from(doc.querySelectorAll("p")).slice(0, 8);
      for (const p of firstParagraphs) {
        const txt = p.textContent?.trim() || "";
        if (txt.length > 3 && /MCQ|SET|EXAM|QUIZ|TEST|FUNDAMENTAL/i.test(txt)) {
          setExtractedTitle(txt);
          break;
        }
      }

      const parsed = parseQuestionsFromHtml(html);

      if (parsed.length === 0) {
        setWordError("Could not extract questions. Ensure the document contains questions with numbered options (1-4) and bold-marked correct answers.");
        setConverting(false);
        return;
      }

      setConvertedJson(parsed);
      setWordSuccess(`Successfully extracted ${parsed.length} questions from "${file.name}"`);
      onToast(`Extracted ${parsed.length} questions from Word`, "success");
    } catch (err) {
      console.error(err);
      setWordError("Failed to parse the Word document. Please try a different file.");
      onToast("Failed to parse Word document", "error");
    } finally {
      setConverting(false);
    }
  };

  const downloadJson = () => {
    if (!convertedJson.length) return;

    const output = convertedJson.map((q) => ({
      title: extractedTitle,
      question_number: q.question_number,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
    }));

    const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${extractedTitle.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    setWordSuccess("JSON file downloaded!");
    onToast("JSON downloaded successfully", "success");
    setTimeout(() => setWordSuccess(""), 3000);
  };

  const useForUpload = () => {
    window.dispatchEvent(
      new CustomEvent("useConvertedJson", {
        detail: { questions: convertedJson, title: extractedTitle },
      })
    );
    setWordSuccess("Loaded into upload form!");
    onToast("Loaded into upload form", "info");
    setTimeout(() => setWordSuccess(""), 3000);
  };

  const removeQuestion = (idx: number) => {
    setConvertedJson((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E6091] to-[#0B2545] flex items-center justify-center shadow-md shrink-0">
          <ArrowRightLeft className="text-white" size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Word to JSON</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Convert .docx exam papers to structured JSON</p>
        </div>
      </div>

      <label className="flex flex-col items-center justify-center h-36 sm:h-40 rounded-xl border-2 border-dashed border-[#1E6091]/30 dark:border-blue-900/50 cursor-pointer hover:border-[#1E6091] dark:hover:border-blue-700 transition-all bg-[#1E6091]/[0.04] dark:bg-blue-950/10 group px-4">
        <FileText size={32} className="text-[#1E6091] group-hover:scale-110 transition-transform" />
        <h3 className="font-bold text-base sm:text-lg mt-2 text-slate-900 dark:text-white text-center">Upload Word Document</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 text-center">.docx or .doc files with questions &amp; options</p>
        <input ref={wordInputRef} type="file" accept=".docx,.doc" className="hidden" onChange={handleWordFile} />
      </label>

      <AnimatePresence>
        {wordError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 p-4 flex items-start gap-3 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {wordError}
          </motion.div>
        )}
        {wordSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 p-4 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm">
            <CheckCircle2 size={18} className="shrink-0" />
            {wordSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {converting && (
        <div className="mt-6 flex items-center justify-center gap-3 py-8">
          <Loader2 className="animate-spin text-[#1E6091]" size={28} />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Parsing Word document...</p>
        </div>
      )}

      {rawPreview && !converting && (
        <div className="mt-6">
          <button onClick={() => setShowRawPreview(!showRawPreview)}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <Eye size={16} />
            {showRawPreview ? "Hide" : "Show"} Extracted Raw Text
            {showRawPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {showRawPreview && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{wordFileName}</span>
                    <span className="text-xs text-slate-500 shrink-0">{rawPreview.length} chars</span>
                  </div>
                  <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
                    {rawPreview}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {convertedJson.length > 0 && !converting && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              {[
                { label: "Extracted", value: convertedJson.length, icon: FileJson },
                { label: "Options Avg", value: (convertedJson.reduce((a, q) => a + q.options.length, 0) / convertedJson.length).toFixed(1), icon: Hash },
                { label: "With Answer", value: convertedJson.filter((q) => q.correct_answer).length, icon: CheckCircle2 },
                { label: "Need Review", value: convertedJson.filter((q) => !q.correct_answer).length, icon: AlertCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={12} className="text-[#1E6091] shrink-0" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate">{label}</p>
                  </div>
                  <p className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <JsonLivePreview
              questions={convertedJson}
              title={extractedTitle}
              onRemove={removeQuestion}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={downloadJson}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#1E6091] to-[#0B2545] text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition">
                <Download size={18} /> Download JSON
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={useForUpload}
                className="flex-1 h-11 rounded-xl bg-[#0B2545] hover:bg-[#13315C] text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition">
                <Upload size={18} /> Use for Upload
              </motion.button>
            </div>

            <button onClick={resetConverter}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Enhanced Responsive Sidebar with Topic Filter ───────
function ExamSidebar({
  exams,
  filterTopic,
  setFilterTopic,
  search,
  setSearch,
  selectedExamId,
  onSelectExam,
  isOpen,
  onToggle,
  topicStats
}: {
  exams: Exam[];
  filterTopic: string;
  setFilterTopic: (t: string) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedExamId: string | null;
  onSelectExam: (exam: Exam) => void;
  isOpen: boolean;
  onToggle: () => void;
  topicStats: { topic: string; count: number; questions: number }[];
}) {
  const allTopics = useMemo(() => ["All", ...Array.from(new Set(exams.map((e) => e.topic)))], [exams]);
  const filteredByTopic = useMemo(() => 
    filterTopic === "All" ? exams : exams.filter((e) => e.topic === filterTopic), 
    [exams, filterTopic]
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? "Close exam library" : "Open exam library"}
        className="lg:hidden fixed bottom-5 right-4 z-50 w-[52px] h-[52px] rounded-full bg-[#0B2545] text-white shadow-2xl flex items-center justify-center ring-4 ring-[#C9A227]/20 active:scale-95 transition-transform hover:bg-[#13315C]"
      >
        {isOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
<motion.aside
  initial={false}
  animate={{
    x: isOpen ? 0 : -340,
  }}
  transition={{ type: "spring", stiffness: 320, damping: 32 }}
  className={`fixed lg:sticky lg:!transform-none lg:top-0 left-0 top-0 h-screen lg:h-[calc(100vh-2rem)] z-40 lg:z-0 w-[86vw] max-w-[340px] lg:w-[320px] bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-2xl lg:shadow-none overflow-hidden`}
>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-[#0f172a]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#0B2545] flex items-center justify-center">
              <Filter size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Topic Exam Library</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{filteredByTopic.length} exams</p>
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams..."
              className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 outline-none focus:ring-2 focus:ring-[#1E6091]/40 focus:border-[#1E6091] text-sm transition"
            />
          </div>

          {/* Topic Filter Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filter by Topic</p>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {filterTopic === "All" ? allTopics.length - 1 : 1}
              </span>
            </div>
            <div className="space-y-1.5">
              {allTopics.map((t) => {
                const count = t === "All" ? exams.length : exams.filter((e) => e.topic === t).length;
                return (
                  <button
                    key={t}
                    onClick={() => setFilterTopic(t)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between border relative overflow-hidden ${
                      filterTopic === t
                        ? "bg-[#1E6091]/10 text-[#0B2545] dark:bg-blue-900/20 dark:text-blue-300 border-[#1E6091]/30 dark:border-blue-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent"
                    }`}
                  >
                    {filterTopic === t && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#C9A227]" />
                    )}
                    <span className="flex items-center gap-1.5">
                      {t !== "All" && <span className="text-sm">{TOPIC_ICONS[t]}</span>}
                      {t === "All" ? "All Topics" : t}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Breakdown Cards */}
          {topicStats.length > 0 && (
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Topic Breakdown</p>
              <div className="space-y-2">
                {topicStats.slice(0, 5).map(({ topic, count, questions: qCount }) => (
                  <motion.button
                    key={topic}
                    onClick={() => setFilterTopic(topic)}
                    whileHover={{ x: 4 }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border text-xs ${
                      filterTopic === topic
                        ? "bg-[#1E6091]/10 border-[#1E6091]/30 dark:bg-blue-900/20 dark:border-blue-800"
                        : "bg-slate-50 dark:bg-slate-800/30 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">{TOPIC_ICONS[topic]}</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate">{topic}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900 dark:text-white">{count}</p>
                      <p className="text-[10px] text-slate-500">{qCount}Q</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Exam List */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              {filteredByTopic.length} Exams
            </p>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2">
              {filteredByTopic.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <BookOpen size={20} className="mx-auto mb-2 opacity-50" />
                  No exams found
                </div>
              ) : (
                filteredByTopic.map((exam) => (
                  <motion.button
                    key={exam.id}
                    whileHover={{ x: 4 }}
                    onClick={() => { onSelectExam(exam); onToggle(); }}
                    className={`relative w-full text-left p-3 pl-3.5 rounded-lg border transition-all overflow-hidden group ${
                      selectedExamId === exam.id
                        ? "bg-[#1E6091]/[0.06] border-[#1E6091]/30 dark:bg-blue-900/20 dark:border-blue-800"
                        : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-[#1E6091]/40 dark:hover:border-blue-800"
                    }`}
                  >
                    {selectedExamId === exam.id && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#C9A227]" />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 flex-1 leading-tight">{exam.exam_title}</p>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                        {exam.total_questions}Q
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <TopicBadge topic={exam.topic} />
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(exam.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

// ── Download Exam as DOCX Function ───────────────────────
async function downloadExamAsDocx(exam: Exam, questions: Question[], addToast: (msg: string, type: ToastType) => void) {
  try {
    const docContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${exam.exam_title}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Topic: ${exam.topic} | Total Questions: ${questions.length}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Generated on ${new Date().toLocaleDateString()}</w:t></w:r></w:p>
    ${questions.map((q) => `
    <w:p/>
    <w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>Question ${q.question_number}</w:t></w:r></w:p>
    <w:p><w:r><w:t>${q.question}</w:t></w:r></w:p>
    ${q.options.map((opt, optIdx) => `
    <w:p><w:r><w:t>${String.fromCharCode(65 + optIdx)}. ${opt}${opt === q.correct_answer ? " (Correct Answer)" : ""}</w:t></w:r></w:p>
    `).join("")}
    `).join("")}
  </w:body>
</w:document>`;
    
    const blob = new Blob([docContent], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam.exam_title.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addToast(`Downloaded "${exam.exam_title}" as DOCX`, "success");
  } catch (err: any) {
    addToast(`Download failed: ${err.message}`, "error");
  }
}

// ── Main Component ─────────────────────────────────────
export default function ProfessionalExamDashboard() {
  const [mounted, setMounted] = useState(false);
  const [user] = useState<string | null>("admin@cpct.gov.in");
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState("All");
  const [editorMode, setEditorMode] = useState<EditorMode>("view");
  const [converterMode, setConverterMode] = useState<ConverterMode>("json-to-exam");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState("");
  const [examCode, setExamCode] = useState("");
  const [topic, setTopic] = useState("");
  const [uploadQuestions, setUploadQuestions] = useState<QuestionType[]>([]);
  const [uploadPreview, setUploadPreview] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "exam" | "question";
    id: string;
    label: string;
  } | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
  });
  const [topicStats, setTopicStats] = useState<{ topic: string; count: number; questions: number }[]>([]);
  const [downloadingExamId, setDownloadingExamId] = useState<string | null>(null);

  // Toast helper
  const addToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = uid();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      loadExams();
    }
  }, [user]);

  useEffect(() => {
    let data = [...exams];
    if (search)
      data = data.filter((e) => e.exam_title.toLowerCase().includes(search.toLowerCase()));
    if (filterTopic !== "All") data = data.filter((e) => e.topic === filterTopic);
    setFilteredExams(data);
  }, [exams, search, filterTopic]);

  useEffect(() => {
    const stats: Record<string, { count: number; questions: number }> = {};
    exams.forEach((e) => {
      if (!stats[e.topic]) stats[e.topic] = { count: 0, questions: 0 };
      stats[e.topic].count++;
      stats[e.topic].questions += e.total_questions;
    });
    setTopicStats(
      Object.entries(stats)
        .map(([topic, data]) => ({ topic, ...data }))
        .sort((a, b) => b.count - a.count)
    );
  }, [exams]);

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;
    const channel = supabase
      .channel("realtime-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "exams" }, () => loadExams())
      .on("postgres_changes", { event: "*", schema: "public", table: "exam_questions" }, () => {
        if (selectedExam) loadQuestions(selectedExam.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedExam]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.questions && detail?.title) {
        setUploadQuestions(detail.questions);
        setExamTitle(detail.title);
        setExamCode(detail.title.toUpperCase().replace(/[^A-Z0-9]/g, "-"));
        setTopic(detectTopic(detail.title));
        setUploadPreview(true);
        setConverterMode("json-to-exam");
        addToast(`Loaded ${detail.questions.length} questions from Word converter`, "success");
      }
    };
    window.addEventListener("useConvertedJson", handler);
    return () => window.removeEventListener("useConvertedJson", handler);
  }, [addToast]);

  const loadExams = async () => {
    try {
      setRefreshing(true);
      const { data, error: err } = await supabase.from("exams").select("*").order("created_at", { ascending: false });
      if (err) throw err;
      setExams(data || []);
    } catch (err: any) {
      addToast(`Failed to load exams: ${err.message}`, "error");
    } finally {
      setRefreshing(false);
    }
  };

  const loadQuestions = async (examId: string) => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", examId)
        .order("question_number", { ascending: true });
      if (err) throw err;
      setQuestions(data || []);
      if (data && data.length > 0) setActiveQuestionId(data[0].id);
    } catch (err: any) {
      addToast(`Failed to load questions: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const openExamModal = async (exam: Exam) => {
    setSelectedExam(exam);
    setOpenModal(true);
    setEditorMode("view");
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
    addToast("Undo successful", "info");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, questions]);
    setQuestions(next);
    setRedoStack(redoStack.slice(0, -1));
    addToast("Redo successful", "info");
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    saveHistory();
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qid: string, index: number, value: string) => {
    saveHistory();
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qid) {
          const newOptions = [...q.options];
          newOptions[index] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const addOption = (qid: string) => {
    saveHistory();
    setQuestions((prev) => prev.map((q) => (q.id === qid ? { ...q, options: [...q.options, ""] } : q)));
  };

  const deleteOption = (qid: string, index: number) => {
    saveHistory();
    setQuestions((prev) =>
      prev.map((q) => ({ ...q, options: q.id === qid ? q.options.filter((_, i) => i !== index) : q.options }))
    );
  };

  const saveQuestion = async (question: Question) => {
    try {
      setSaving(true);
      const { error: err } = await supabase
        .from("exam_questions")
        .update({ question: question.question, options: question.options, correct_answer: question.correct_answer })
        .eq("id", question.id);
      if (err) throw err;
      addToast("Question saved successfully", "success");
    } catch (err: any) {
      addToast(`Save failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const updateExamTopic = async (newTopic: string) => {
    if (!selectedExam) return;
    try {
      const { error: err } = await supabase.from("exams").update({ topic: newTopic }).eq("id", selectedExam.id);
      if (err) throw err;
      setSelectedExam({ ...selectedExam, topic: newTopic });
      setExams((prev) => prev.map((e) => (e.id === selectedExam.id ? { ...e, topic: newTopic } : e)));
      addToast("Exam topic updated", "success");
    } catch (err: any) {
      addToast(`Failed to update topic: ${err.message}`, "error");
    }
  };

  const addQuestionManually = async () => {
    if (!selectedExam) return;
    if (!newQuestion.question?.trim()) {
      addToast("Question text is required", "warning");
      return;
    }
    if (!newQuestion.correct_answer) {
      addToast("Please mark a correct answer", "warning");
      return;
    }

    try {
      setSaving(true);
      const maxQNum = Math.max(0, ...questions.map((q) => q.question_number));
      const { data, error: err } = await supabase
        .from("exam_questions")
        .insert([{
          exam_id: selectedExam.id,
          question_number: maxQNum + 1,
          question: newQuestion.question,
          options: newQuestion.options,
          correct_answer: newQuestion.correct_answer,
          question_uid: crypto.randomUUID(),
        }])
        .select()
        .single();

      if (err) throw err;

      if (data) {
        setQuestions((prev) => [...prev, data]);
        setActiveQuestionId(data.id);
      }
      setNewQuestion({ question: "", options: ["", "", "", ""], correct_answer: "" });
      setEditorMode("view");
      addToast("Question added successfully", "success");
    } catch (err: any) {
      addToast(`Failed to add question: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteQuestion = (id: string, qNum: number) => {
    setDeleteTarget({ type: "question", id, label: `Question #${qNum}` });
  };

  const confirmDeleteExam = (examId: string, title: string) => {
    setDeleteTarget({ type: "exam", id: examId, label: `"${title}"` });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "question") {
        const { error: err } = await supabase.from("exam_questions").delete().eq("id", deleteTarget.id);
        if (err) throw err;
        setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
        addToast("Question deleted", "success");
      } else {
        const { error: err1 } = await supabase.from("exam_questions").delete().eq("exam_id", deleteTarget.id);
        if (err1) throw err1;
        const { error: err2 } = await supabase.from("exams").delete().eq("id", deleteTarget.id);
        if (err2) throw err2;
        setExams((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        if (selectedExam?.id === deleteTarget.id) setOpenModal(false);
        addToast("Exam and all questions deleted", "success");
      }
    } catch (err: any) {
      addToast(`Delete failed: ${err.message}`, "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const detectTopic = (title: string) => {
    const upper = title.toUpperCase();
    if (upper.includes("EMAIL")) return "Email";
    if (upper.includes("WORD")) return "Word";
    if (upper.includes("EXCEL")) return "Excel";
    if (upper.includes("DATABASE")) return "Database";
    if (upper.includes("POWERPOINT") || upper.includes("PPT") || upper.includes("POWER POINT")) return "Power Point";
    if (upper.includes("NETWORK")) return "Network";
    if (upper.includes("HARDWARE")) return "Hardware";
    return "Fundamental";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError("");
      setSuccess("");
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const parsed = JSON.parse(text);
      setUploadQuestions(parsed);
      const title = parsed?.[0]?.title || file.name.replace(".json", "");
      setExamTitle(title);
      setExamCode(title.toUpperCase().replace(/[^A-Z0-9]/g, "-"));
      setTopic(detectTopic(title));
      setUploadPreview(true);
      addToast(`${parsed.length} questions loaded from JSON`, "success");
    } catch (err: any) {
      addToast("Invalid JSON file — please check the format.", "error");
      setError("Invalid JSON file — please check the format.");
      setTimeout(() => setError(""), 4000);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetUploadForm = () => {
    setExamTitle("");
    setExamCode("");
    setTopic("");
    setUploadQuestions([]);
    setUploadPreview(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!uploadQuestions.length) {
      addToast("Please select a JSON file first.", "warning");
      return;
    }
    if (!examTitle.trim()) {
      addToast("Exam title is required.", "warning");
      return;
    }

    const duplicate = exams.find((e) => e.exam_title.trim().toLowerCase() === examTitle.trim().toLowerCase());
    if (duplicate) {
      addToast(`"${examTitle}" already exists. Delete it first to replace.`, "warning");
      return;
    }

    try {
      setLoading(true);
      setError("");
      // FIX: explicitly generate the primary key here since the "exams" table's
      // "id" column has no DB-level default (gen_random_uuid()) configured yet.
      // Without this, Postgres was receiving NULL for "id" and throwing:
      //   null value in column "id" of relation "exams" violates not-null constraint
      const { data: examData, error: err1 } = await supabase
        .from("exams")
        .insert([{
          id: crypto.randomUUID(),
          exam_title: examTitle,
          exam_code: examCode,
          topic,
          total_questions: uploadQuestions.length,
          raw_json: uploadQuestions,
        }])
        .select()
        .single();

      if (err1) throw err1;

      if (examData) {
        const formatted = uploadQuestions.map((q) => ({
          exam_id: examData.id,
          question_uid: crypto.randomUUID(),
          title: examTitle,
          question_number: q.question_number,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
        }));
        const { error: err2 } = await supabase.from("exam_questions").insert(formatted);
        if (err2) throw err2;
        addToast(`✓ "${examTitle}" uploaded with ${uploadQuestions.length} questions`, "success");
        resetUploadForm();
        loadExams();
      }
    } catch (err: any) {
      addToast(`Upload failed: ${err.message}`, "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const allTopics = useMemo(() => ["All", ...Array.from(new Set(exams.map((e) => e.topic)))], [exams]);
  const totalQuestions = useMemo(() => uploadQuestions.length, [uploadQuestions]);
  const isDuplicate = useMemo(
    () => !!examTitle.trim() && exams.some((e) => e.exam_title.trim().toLowerCase() === examTitle.trim().toLowerCase()),
    [examTitle, exams]
  );

  const activeQuestion = questions.find((q) => q.id === activeQuestionId);
  const activeQuestionIndex = questions.findIndex((q) => q.id === activeQuestionId);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <DeleteConfirmModal
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.label ?? "item"}?`}
        description={deleteTarget?.type === "exam" ? "All questions will be permanently removed." : undefined}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── GOVT OFFICIAL HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
              <Menu size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="w-9 h-9 rounded-lg bg-[#0B2545] flex items-center justify-center shrink-0">
              <BookOpen className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                CPCT <span className="text-[#1E6091] dark:text-blue-400">Admin Hub</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider truncate">Government Exam Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">System Online</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <User size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{user}</span>
            </div>
            <button
              onClick={loadExams}
              className="h-9 w-9 sm:w-auto sm:px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2 text-xs font-bold"
              aria-label="Refresh"
              title="Refresh exams"
            >
              {refreshing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCcw size={14} />}
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        {/* Official ledger rule — signature accent */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#0B2545] via-[#C9A227] to-[#0B2545]" />
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex gap-6">
        {/* ── RESPONSIVE SIDEBAR ── */}
        <ExamSidebar
          exams={exams}
          filterTopic={filterTopic}
          setFilterTopic={setFilterTopic}
          search={search}
          setSearch={setSearch}
          selectedExamId={selectedExam?.id || null}
          onSelectExam={openExamModal}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          topicStats={topicStats}
        />

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 space-y-5 sm:space-y-6">
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3"
          >
            {[
              { label: "Total Exams", value: exams.length, icon: BarChart3 },
              { label: "Total Questions", value: exams.reduce((a, e) => a + e.total_questions, 0), icon: BookOpen },
              { label: "Topics", value: allTopics.length - 1, icon: Layers },
              { label: "Last Updated", value: exams[0] ? new Date(exams[0].created_at).toLocaleDateString() : "—", icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3 sm:p-4 shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Icon size={14} className="text-[#1E6091] shrink-0" />
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{label}</p>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{value}</p>
              </div>
            ))}
          </motion.div>

          {/* ── CONVERTER MODE TOGGLE ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-1.5 shadow-sm">
            <div className="flex gap-1.5">
              <button
                onClick={() => setConverterMode("json-to-exam")}
                className={`flex-1 h-10 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                  converterMode === "json-to-exam"
                    ? "bg-[#0B2545] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Upload size={16} /> <span className="hidden sm:inline">JSON to Exam</span><span className="sm:hidden">JSON</span>
              </button>
              <button
                onClick={() => setConverterMode("word-to-json")}
                className={`flex-1 h-10 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                  converterMode === "word-to-json"
                    ? "bg-[#C9A227] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <ArrowRightLeft size={16} /> <span className="hidden sm:inline">Word to JSON</span><span className="sm:hidden">Word</span>
              </button>
            </div>
          </motion.div>

          {/* ── UPLOAD SECTION ── */}
          <AnimatePresence mode="wait">
            {converterMode === "json-to-exam" && (
              <motion.div key="json-to-exam" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0B2545] flex items-center justify-center shadow-md shrink-0">
                    <Upload className="text-white" size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Upload Exam</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Import JSON to live question bank</p>
                  </div>
                </div>

                {isDuplicate && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
                    <div className="text-sm">
                      <p className="font-bold text-amber-800 dark:text-amber-300">Already uploaded</p>
                      <p className="text-amber-700/80 dark:text-amber-400/80 mt-1">Delete the existing exam first to re-upload.</p>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="Exam Title"
                    className="h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 outline-none focus:ring-2 focus:ring-[#1E6091]/40 focus:border-[#1E6091] text-sm" />
                  <input value={examCode} onChange={(e) => setExamCode(e.target.value)} placeholder="Exam Code"
                    className="h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 outline-none focus:ring-2 focus:ring-[#1E6091]/40 focus:border-[#1E6091] text-sm" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
                  {[
                    { label: "Topic", value: topic || "—" },
                    { label: "Questions", value: totalQuestions },
                    { label: "Total Exams", value: exams.length },
                    { label: "Status", value: "Active" },
                  ].map(({ label, value }) => (
                    <motion.div key={label} whileHover={{ y: -2 }} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700">
                      <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate">{label}</p>
                      <h3 className="font-bold text-lg sm:text-xl mt-1 text-slate-900 dark:text-white truncate">{value}</h3>
                    </motion.div>
                  ))}
                </div>

                <label className="flex flex-col items-center justify-center h-40 sm:h-44 rounded-xl border-2 border-dashed border-[#1E6091]/30 dark:border-blue-900/50 cursor-pointer hover:border-[#1E6091] dark:hover:border-blue-700 transition-all bg-[#1E6091]/[0.04] dark:bg-blue-950/10 group px-4">
                  <Upload size={32} className="text-[#1E6091] group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-base sm:text-lg mt-2 text-slate-900 dark:text-white text-center">Upload JSON</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 text-center">Drag or click to upload exam file</p>
                  <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                </label>

                {uploadPreview && uploadQuestions.length > 0 && (
                  <JsonLivePreview
                    questions={uploadQuestions}
                    title={examTitle}
                    onRemove={(idx) => {
                      setUploadQuestions((prev) => prev.filter((_, i) => i !== idx));
                      addToast("Question removed from preview", "info");
                    }}
                  />
                )}

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleUpload}
                  disabled={loading || isDuplicate || !uploadQuestions.length}
                  className={`mt-6 w-full h-12 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 ${
                    isDuplicate || !uploadQuestions.length
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      : "bg-[#0B2545] hover:bg-[#13315C] text-white shadow-md hover:shadow-lg"
                  }`}>
                  {loading ? <><Loader2 className="animate-spin" /> Uploading...</> :
                   isDuplicate ? <><AlertCircle size={20} /> Already Uploaded</> :
                   <><Upload size={20} /> Upload {uploadQuestions.length} Questions</>}
                </motion.button>
              </motion.div>
            )}

            {converterMode === "word-to-json" && (
              <motion.div key="word-to-json" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <WordToJsonConverter onToast={addToast} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── EXAM GRID ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#1E6091] shrink-0" />
                <span>Uploaded Exams {filterTopic !== "All" && `(${filterTopic})`}</span>
              </h2>
              <button
                onClick={loadExams}
                className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg bg-[#0B2545] hover:bg-[#13315C] text-white font-semibold flex items-center gap-2 shadow-sm transition text-[11px] sm:text-xs shrink-0"
              >
                {refreshing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCcw size={14} />}
                <span className="hidden xs:inline">Refresh</span>
              </button>
            </div>

            {refreshing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-12 text-center bg-white dark:bg-slate-900/30">
                <BookOpen size={40} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm">
                  {search || filterTopic !== "All" ? "No exams match your filters" : "No exams yet. Upload one to get started."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {filteredExams.map((exam, idx) => (
                  <motion.div key={exam.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
                    className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#C9A227]/0 group-hover:bg-[#C9A227] transition-colors" />
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <TopicBadge topic={exam.topic} />
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md shrink-0">
                        <BarChart3 size={12} /> {exam.total_questions} Qs
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2 text-slate-900 dark:text-white line-clamp-2 leading-snug">{exam.exam_title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5 font-medium">
                      <Clock size={12} /> {new Date(exam.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => openExamModal(exam)}
                        className="flex-1 min-w-[120px] h-9 rounded-lg bg-[#0B2545] hover:bg-[#13315C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition">
                        <Edit3 size={14} /> Manage
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.03 }} 
                        whileTap={{ scale: 0.97 }} 
                        onClick={async () => {
                          setDownloadingExamId(exam.id);
                          await downloadExamAsDocx(exam, questions.filter(q => q.id), addToast);
                          setDownloadingExamId(null);
                        }}
                        disabled={downloadingExamId === exam.id}
                        className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-900/30 transition shrink-0"
                        title="Download as DOCX"
                      >
                        {downloadingExamId === exam.id ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => confirmDeleteExam(exam.id, exam.exam_title)}
                        className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 transition shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* ── EDITOR MODAL (rest of the component remains the same as previous version) ── */}
      <AnimatePresence>
        {openModal && selectedExam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-hidden">
            <div className="h-full w-full flex flex-col">
              {/* Modal Header */}
              <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-700 px-3 sm:px-6 py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0B2545] flex items-center justify-center shrink-0">
                    <Flag className="text-white" size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">{selectedExam.exam_title}</h2>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1">
                      <TopicBadge topic={selectedExam.topic} />
                      <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{questions.length} Questions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Topic</span>
                    <select
                      value={selectedExam.topic}
                      onChange={(e) => updateExamTopic(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {TOPIC_OPTIONS.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>

                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block" />

                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleUndo} disabled={history.length === 0}
                    className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center disabled:opacity-40 transition border border-slate-200 dark:border-slate-700">
                    <RotateCcw size={16} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRedo} disabled={redoStack.length === 0}
                    className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center disabled:opacity-40 transition border border-slate-200 dark:border-slate-700">
                    <RotateCw size={16} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                    onClick={async () => {
                      await downloadExamAsDocx(selectedExam, questions, addToast);
                    }}
                    className="h-9 px-3 sm:px-4 rounded-lg bg-[#0B2545] hover:bg-[#13315C] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-sm transition">
                    <Download size={14} /> <span className="hidden sm:inline">Word</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setOpenModal(false)}
                    className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 transition">
                    <X size={18} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Modal Tabs */}
              <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-700 px-3 sm:px-6 py-2 flex gap-2 shrink-0 overflow-x-auto">
                {(["view", "edit", "add"] as EditorMode[]).map((mode) => (
                  <button key={mode} onClick={() => setEditorMode(mode)}
                    className={`h-8 px-3 sm:px-4 rounded-md font-bold text-[11px] sm:text-xs uppercase tracking-wide transition-all whitespace-nowrap shrink-0 ${
                      editorMode === mode
                        ? "bg-[#0B2545] text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}>
                    {mode === "view" ? "View Mode" : mode === "edit" ? "Edit Mode" : "Add Question"}
                  </button>
                ))}
              </div>

              {/* Mobile Question Strip */}
              {editorMode !== "add" && questions.length > 0 && (
                <div className="lg:hidden border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3 py-2 shrink-0 overflow-x-auto">
                  <div className="flex gap-1.5">
                    {questions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => { setActiveQuestionId(q.id); if (editorMode === "view") setEditorMode("edit"); }}
                        className={`w-8 h-8 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 border transition-all relative ${
                          activeQuestionId === q.id
                            ? "bg-[#0B2545] text-white border-[#0B2545]"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {q.question_number}
                        {q.correct_answer && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-[#0f172a]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-[#0a0e1a] flex">
                {/* Left Sidebar - Question Navigator (desktop only) */}
                {editorMode !== "add" && questions.length > 0 && (
                  <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] flex flex-col hidden lg:flex">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <LayoutList size={14} /> Question Navigator
                      </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {questions.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => { setActiveQuestionId(q.id); if (editorMode === "view") setEditorMode("edit"); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${
                            activeQuestionId === q.id
                              ? "bg-[#1E6091]/10 text-[#0B2545] border-[#1E6091]/30 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            activeQuestionId === q.id ? "bg-[#0B2545] text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}>
                            {q.question_number}
                          </span>
                          <span className="line-clamp-1 flex-1">{q.question}</span>
                          {q.correct_answer && <Check size={12} className="text-emerald-500 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                  {editorMode === "view" && (
                    <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
                      {loading ? (
                        <div className="h-[400px] flex items-center justify-center">
                          <Loader2 className="animate-spin text-[#0B2545]" size={40} />
                        </div>
                      ) : questions.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                          <BookOpen size={48} className="mx-auto text-slate-400 mb-4" />
                          <p className="text-slate-600 dark:text-slate-400 font-medium">No questions yet</p>
                        </div>
                      ) : (
                        questions.map((q) => (
                          <div key={q.id} onClick={() => { setActiveQuestionId(q.id); setEditorMode("edit"); }}
                            className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#1E6091]/40 dark:hover:border-blue-800 transition cursor-pointer group">
                            <div className="flex items-start gap-2.5 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#0B2545] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">
                                {q.question_number}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-[#1E6091] dark:group-hover:text-blue-400 transition">
                                  {q.question}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {q.options.map((opt, idx) => (
                                    <div key={idx} className={`text-xs px-3 py-2 rounded-md border ${
                                      opt === q.correct_answer
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300 font-bold"
                                        : "bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                                    }`}>
                                      {String.fromCharCode(65 + idx)}. {opt}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1E6091] transition shrink-0" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {editorMode === "edit" && (
                    <div className="max-w-4xl mx-auto">
                      {loading ? (
                        <div className="h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-[#0B2545]" size={40} /></div>
                      ) : !activeQuestion ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="text-slate-500 font-medium">Select a question from the navigator to edit</p>
                        </div>
                      ) : (
                        <div className="space-y-5 sm:space-y-6">
                          <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <span className="w-7 h-7 rounded bg-[#0B2545] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                  {activeQuestion.question_number}
                                </span>
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">Edit Question</h3>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <button
                                  onClick={() => { if (activeQuestionIndex > 0) setActiveQuestionId(questions[activeQuestionIndex - 1].id); }}
                                  disabled={activeQuestionIndex <= 0}
                                  className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                                  aria-label="Previous question"
                                >
                                  <ChevronRight size={14} className="rotate-180" />
                                </button>
                                <button
                                  onClick={() => { if (activeQuestionIndex < questions.length - 1) setActiveQuestionId(questions[activeQuestionIndex + 1].id); }}
                                  disabled={activeQuestionIndex >= questions.length - 1}
                                  className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                                  aria-label="Next question"
                                >
                                  <ChevronRight size={14} />
                                </button>
                                {activeQuestion.correct_answer ? (
                                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                                    <Check size={12} /> <span className="hidden sm:inline">Answer Set</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                                    <AlertCircle size={12} /> <span className="hidden sm:inline">No Answer</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                              <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Question Text</label>
                                <textarea
                                  value={activeQuestion.question}
                                  onChange={(e) => updateQuestion(activeQuestion.id, "question", e.target.value)}
                                  className="w-full min-h-[100px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 outline-none focus:ring-2 focus:ring-[#1E6091]/40 focus:border-[#1E6091] text-sm font-medium text-slate-900 dark:text-white resize-y"
                                  placeholder="Enter question text..."
                                />
                              </div>

                              <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Options</label>
                                <div className="grid grid-cols-1 gap-2">
                                  {activeQuestion.options.map((option, optIdx) => {
                                    const isCorrect = activeQuestion.correct_answer === option;
                                    return (
                                      <div key={optIdx} className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                                        isCorrect ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-700" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                      }`}>
                                        <span className="w-7 h-7 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        <input
                                          value={option}
                                          onChange={(e) => updateOption(activeQuestion.id, optIdx, e.target.value)}
                                          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-slate-900 dark:text-white"
                                          placeholder={`Option ${optIdx + 1}`}
                                        />
                                        <button
                                          onClick={() => updateQuestion(activeQuestion.id, "correct_answer", option)}
                                          className={`px-2.5 sm:px-3 h-7 rounded-md text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
                                            isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                                          }`}
                                        >
                                          {isCorrect ? "Correct" : "Mark"}
                                        </button>
                                        <button onClick={() => deleteOption(activeQuestion.id, optIdx)}
                                          className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition shrink-0">
                                          <X size={12} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                                <button onClick={() => addOption(activeQuestion.id)}
                                  className="mt-2 h-8 px-3 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700">
                                  <Plus size={14} /> Add Option
                                </button>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button onClick={() => confirmDeleteQuestion(activeQuestion.id, activeQuestion.question_number)}
                                  className="h-9 px-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/30 transition order-2 sm:order-1">
                                  <Trash2 size={14} /> Delete Question
                                </button>
                                <button onClick={() => saveQuestion(activeQuestion)} disabled={saving}
                                  className="h-9 px-6 rounded-lg bg-[#0B2545] hover:bg-[#13315C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 order-1 sm:order-2">
                                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Questions</h3>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[320px] overflow-y-auto">
                              {questions.map((q) => (
                                <button key={q.id} onClick={() => setActiveQuestionId(q.id)}
                                  className={`w-full text-left px-4 sm:px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                                    activeQuestionId === q.id ? "bg-[#1E6091]/[0.06] dark:bg-blue-900/10" : ""
                                  }`}>
                                  <span className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {q.question_number}
                                  </span>
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1 flex-1">{q.question}</span>
                                  {q.correct_answer ? <Check size={14} className="text-emerald-500 shrink-0" /> : <AlertCircle size={14} className="text-amber-500 shrink-0" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {editorMode === "add" && (
                    <div className="max-w-3xl mx-auto">
                      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Plus size={18} className="text-[#1E6091]" /> Add New Question
                          </h3>
                        </div>
                        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Question Text</label>
                            <textarea
                              value={newQuestion.question || ""}
                              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                              className="w-full min-h-[120px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 outline-none focus:ring-2 focus:ring-[#1E6091]/40 focus:border-[#1E6091] text-sm font-medium text-slate-900 dark:text-white resize-y"
                              placeholder="Enter the question..."
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Options</label>
                            <div className="space-y-2">
                              {(newQuestion.options || []).map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <input
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...(newQuestion.options || [])];
                                      newOpts[idx] = e.target.value;
                                      setNewQuestion({ ...newQuestion, options: newOpts });
                                    }}
                                    className="flex-1 min-w-0 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 outline-none focus:ring-2 focus:ring-[#1E6091]/40 focus:border-[#1E6091] text-sm text-slate-900 dark:text-white"
                                    placeholder={`Option ${idx + 1}`}
                                  />
                                  <button onClick={() => {
                                    const newOpts = (newQuestion.options || []).filter((_, i) => i !== idx);
                                    setNewQuestion({ ...newQuestion, options: newOpts });
                                  }}
                                    className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition shrink-0">
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button onClick={() => setNewQuestion({ ...newQuestion, options: [...(newQuestion.options || []), ""] })}
                              className="mt-2 h-8 px-3 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700">
                              <Plus size={14} /> Add Option
                            </button>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Mark Correct Answer</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {(newQuestion.options || []).map((opt, idx) => (
                                <button key={idx} onClick={() => setNewQuestion({ ...newQuestion, correct_answer: opt })}
                                  className={`h-10 rounded-lg font-bold text-sm transition-all border truncate px-2 ${
                                    newQuestion.correct_answer === opt
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  }`}>
                                  {String.fromCharCode(65 + idx)}. {opt || "Empty"}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button onClick={addQuestionManually} disabled={saving || !newQuestion.question?.trim()}
                              className="flex-1 h-11 rounded-lg bg-[#0B2545] hover:bg-[#13315C] text-white font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50">
                              {saving ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                              Add Question
                            </button>
                            <button onClick={() => { setNewQuestion({ question: "", options: ["", "", "", ""], correct_answer: "" }); setEditorMode("view"); }}
                              className="flex-1 h-11 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
