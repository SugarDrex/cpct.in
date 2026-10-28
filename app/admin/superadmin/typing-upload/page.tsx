'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  FiAlertCircle,
  FiAlignLeft,
  FiArrowRight,
  FiCheckCircle,
  FiEdit3,
  FiEye,
  FiLayers,
  FiMonitor,
  FiRefreshCw,
  FiSearch,
  FiTag,
  FiTrash2,
  FiType,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Lang = 'english' | 'hindi';
const DURATIONS = [5, 10, 15, 20];
const WORD_COUNTS: Record<number, number> = { 5: 280, 10: 380, 15: 480, 20: 530 };
const CSV_BATCH_SIZE = 200;
const PAGE_SIZE = 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EDITOR_H = 420;
const LINE_H = 24;
const EN_FONT = `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
const HI_FONT = `system-ui, 'Noto Sans Devanagari', 'Nirmala UI', sans-serif`;
const BLOCK_COLORS = ['#2563eb', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899', '#f97316'];
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type ParagraphRow = {
  id: string;
  language: Lang;
  duration: number;
  topic: string;
  content: string;
};

type CsvResult = {
  rows: ParagraphRow[];
  errors: { row: number; message: string }[];
  fatal: string | null;
};

type Banner = { ok: boolean; msg: string } | null;

type RawTopicRow = { language: string; topic: string; duration: number };

type TopicSummary = {
  key: string;
  language: Lang;
  topic: string;
  count: number;
  durations: number[];
};

type ParagraphRecord = { id: string; duration: number; content: string };

// ─── Theme tokens (match CPCT.IN light and dark styling) ───
const CARD =
  'rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800';
const LABEL = 'mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300';
const INPUT =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500';
const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none dark:shadow-blue-900/20 dark:disabled:bg-slate-600';
const EDITOR_BTN =
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white';
const ROW_ACTION =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

function segmentClass(active: boolean) {
  return `rounded-md px-3 py-2 text-sm font-semibold transition ${
    active
      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
  }`;
}

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function Notice({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
        ok
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
      }`}
    >
      {ok ? (
        <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

// ─── Paragraph text helpers (shared by the editor) ───

// Blank lines separate paragraphs. Returns the paragraph index for each line, or -1 for blank lines.
function computeLineBlocks(lines: string[]): number[] {
  let block = -1;
  let inBlock = false;
  return lines.map((l) => {
    if (l.trim() === '') {
      inBlock = false;
      return -1;
    }
    if (!inBlock) {
      block += 1;
      inBlock = true;
    }
    return block;
  });
}

function buildParagraphStats(lines: string[], lineBlocks: number[]) {
  const out: { words: number; startLine: number }[] = [];
  lines.forEach((l, i) => {
    const b = lineBlocks[i];
    if (b < 0) return;
    if (!out[b]) out[b] = { words: 0, startLine: i + 1 };
    out[b].words += wordCount(l);
  });
  return out;
}

// Each paragraph becomes one line, with one blank line between paragraphs
function formatParagraphs(src: string): string {
  return src
    .replace(/\r\n?/g, '\n')
    .replace(/[\u200B\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

function offsetOfLine(lines: string[], lineNo: number): number {
  let off = 0;
  for (let i = 0; i < lineNo - 1; i++) off += lines[i].length + 1;
  return off;
}

// ─── Editor ───
type CodeEditorProps = {
  value: string;
  onChange: (next: string) => void;
  onSave: () => void;
  language: Lang;
  target: number;
  placeholder?: string;
};

function CodeEditor({ value, onChange, onSave, language, target, placeholder }: CodeEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  const fontFamily = language === 'hindi' ? HI_FONT : EN_FONT;
  const textStyle: CSSProperties = {
    fontFamily,
    fontSize: 14,
    lineHeight: `${LINE_H}px`,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  };

  const lines = useMemo(() => value.split('\n'), [value]);
  const lineBlocks = useMemo(() => computeLineBlocks(lines), [lines]);
  const paragraphStats = useMemo(() => buildParagraphStats(lines, lineBlocks), [lines, lineBlocks]);
  const totalWords = paragraphStats.reduce((n, p) => n + p.words, 0);

  // Track the textarea width so wrapped lines are measured correctly
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    const update = () => setTextWidth(ta.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(ta);
    return () => ro.disconnect();
  }, []);

  // Measure how tall each logical line renders (wrapped lines take several rows)
  useIsoLayoutEffect(() => {
    if (!measureRef.current || textWidth === 0) return;
    setLineHeights(
      Array.from(measureRef.current.children).map((el) => (el as HTMLElement).offsetHeight)
    );
  }, [lines, textWidth, fontFamily]);

  function updateCursor(el: HTMLTextAreaElement) {
    const pos = el.selectionStart ?? 0;
    const before = el.value.slice(0, pos);
    setCursor({ line: before.split('\n').length, col: pos - before.lastIndexOf('\n') });
  }

  // Replace the whole text through execCommand so Ctrl+Z still works
  function replaceAll(next: string) {
    const ta = taRef.current;
    if (!ta) {
      onChange(next);
      return;
    }
    ta.focus();
    ta.select();
    const ok =
      next === ''
        ? document.execCommand('delete')
        : document.execCommand('insertText', false, next);
    if (!ok) onChange(next);
  }

  function format() {
    if (!value.trim()) return;
    replaceAll(formatParagraphs(value));
  }

  function clearAll() {
    if (!value) return;
    if (window.confirm('Clear all paragraph text?')) replaceAll('');
  }

  function jumpToParagraph(startLine: number) {
    const ta = taRef.current;
    if (!ta) return;
    const off = offsetOfLine(lines, startLine);
    ta.focus();
    ta.setSelectionRange(off, off);
    updateCursor(ta);
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === 'enter') {
      e.preventDefault();
      onSave();
    } else if (k === 's') {
      e.preventDefault();
      format();
    }
  }

  const TONE = {
    ok: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    short: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    long: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-inner focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900">
      {/* Tab bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="font-mono">paragraphs.txt</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={format} disabled={!value.trim()} className={EDITOR_BTN} title="Format (Ctrl+S)">
            <FiAlignLeft className="h-3.5 w-3.5" />
            Format
          </button>
          <button type="button" onClick={clearAll} disabled={!value} className={EDITOR_BTN} title="Clear all">
            <FiTrash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Editor body: gutter + textarea */}
      <div className="flex" style={{ height: EDITOR_H }}>
        <div
          className="relative w-14 shrink-0 overflow-hidden border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
          style={{ height: EDITOR_H }}
        >
          <div
            className="font-mono text-[12px] text-slate-400 dark:text-slate-600"
            style={{ transform: `translateY(${-scrollTop}px)`, paddingTop: 12 }}
          >
            {lines.map((_, i) => {
              const block = lineBlocks[i];
              return (
                <div
                  key={i}
                  className="relative pr-3 text-right"
                  style={{ height: lineHeights[i] ?? LINE_H, lineHeight: `${LINE_H}px` }}
                >
                  {block >= 0 && (
                    <span
                      className="absolute bottom-0 left-0 top-0 w-[3px]"
                      style={{ background: BLOCK_COLORS[block % BLOCK_COLORS.length] }}
                    />
                  )}
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative min-w-0 flex-1">
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            onSelect={(e) => updateCursor(e.currentTarget)}
            onKeyUp={(e) => updateCursor(e.currentTarget)}
            onClick={(e) => updateCursor(e.currentTarget)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder={placeholder}
            className="block h-full w-full resize-none bg-transparent text-slate-800 caret-blue-600 placeholder-slate-400 outline-none dark:text-slate-100 dark:caret-blue-400 dark:placeholder-slate-500"
            style={{ ...textStyle, height: EDITOR_H, padding: '12px 16px', tabSize: 2 }}
          />
          {/* Hidden mirror used only to measure wrapped line heights */}
          <div
            ref={measureRef}
            aria-hidden
            className="pointer-events-none invisible absolute left-0 top-0"
            style={{ ...textStyle, width: textWidth, padding: '0 16px', boxSizing: 'border-box' }}
          >
            {lines.map((l, i) => (
              <div key={i}>{l.length ? l : '\u00A0'}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Paragraph outline: word count vs target */}
      <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
        {paragraphStats.length === 0 ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            No paragraphs yet. Blank lines separate them.
          </span>
        ) : (
          paragraphStats.map((p, i) => {
            const diff = p.words - target;
            const tone = Math.abs(diff) <= target * 0.1 ? TONE.ok : diff < 0 ? TONE.short : TONE.long;
            return (
              <button
                key={i}
                type="button"
                onClick={() => jumpToParagraph(p.startLine)}
                title={`Paragraph ${i + 1}: ${p.words} words, target ${target}`}
                className={`rounded-md border px-2 py-0.5 font-mono text-[11px] transition hover:brightness-95 dark:hover:brightness-125 ${tone}`}
              >
                ¶{i + 1} · {p.words}/{target}
              </button>
            );
          })
        )}
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-blue-600 px-3 py-1 font-mono text-[11px] text-white">
        <div className="flex flex-wrap gap-4">
          <span>
            Ln {cursor.line}, Col {cursor.col}
          </span>
          <span>{value.length} chars</span>
          <span>
            {paragraphStats.length} ¶ · {totalWords} words
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          <span>UTF-8</span>
          <span>{language === 'hindi' ? 'Hindi' : 'English'}</span>
          <span className="opacity-80">Ctrl+Enter save · Ctrl+S format</span>
        </div>
      </div>
    </div>
  );
}

// ─── Data helpers ───

// Pages through every row (only the three columns needed for the topic list)
async function fetchAllTopicRows(): Promise<RawTopicRow[]> {
  const out: RawTopicRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('typing_paragraphs')
      .select('language, topic, duration')
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const batch = (data ?? []) as RawTopicRow[];
    out.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return out;
}

function summarizeTopics(rows: RawTopicRow[]): TopicSummary[] {
  const map = new Map<string, TopicSummary>();
  rows.forEach((r) => {
    if (r.language !== 'english' && r.language !== 'hindi') return;
    const key = `${r.language}||${r.topic}`;
    let t = map.get(key);
    if (!t) {
      t = { key, language: r.language, topic: r.topic, count: 0, durations: [] };
      map.set(key, t);
    }
    t.count += 1;
    if (!t.durations.includes(r.duration)) t.durations.push(r.duration);
  });
  return [...map.values()]
    .map((t) => ({ ...t, durations: [...t.durations].sort((a, b) => a - b) }))
    .sort((a, b) => a.language.localeCompare(b.language) || a.topic.localeCompare(b.topic));
}

// ─── CSV parsing ───

// Minimal CSV parser: quoted fields, commas and line breaks inside quotes,
// "" escapes, CRLF or LF line endings. Blank lines are dropped.
function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '');
  const table: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === '') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      table.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    table.push(row);
  }

  return table.filter((r) => r.some((c) => c.trim() !== ''));
}

// Turns CSV text into validated rows. Required: language, duration, topic, content.
// Optional: id (keeps re-imports from duplicating rows). created_at is ignored.
function readParagraphCsv(text: string): CsvResult {
  const table = parseCsv(text);

  if (table.length < 2) {
    return { rows: [], errors: [], fatal: 'The file needs a header row and at least one data row.' };
  }

  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const missing = ['language', 'duration', 'topic', 'content'].filter((n) => col(n) === -1);

  if (missing.length > 0) {
    return { rows: [], errors: [], fatal: `Missing column(s): ${missing.join(', ')}` };
  }

  const rows: ParagraphRow[] = [];
  const errors: { row: number; message: string }[] = [];

  table.slice(1).forEach((cells, i) => {
    const rowNumber = i + 2; // spreadsheet-style: header is row 1
    const get = (name: string) => (cells[col(name)] ?? '').trim();

    const language = get('language').toLowerCase();
    const duration = Number(get('duration'));
    const topic = get('topic');
    const content = get('content').replace(/\s+/g, ' ').trim();
    const idValue = get('id');

    const problems: string[] = [];
    if (language !== 'english' && language !== 'hindi') problems.push('language must be english or hindi');
    if (!DURATIONS.includes(duration)) problems.push('duration must be 5, 10, 15 or 20');
    if (!topic) problems.push('topic is empty');
    if (!content) problems.push('content is empty');

    if (problems.length > 0) {
      errors.push({ row: rowNumber, message: problems.join('; ') });
      return;
    }

    rows.push({
      id: UUID_RE.test(idValue) ? idValue : crypto.randomUUID(),
      language: language as Lang,
      duration,
      topic,
      content,
    });
  });

  return { rows, errors, fatal: null };
}

// ─── Page ───
export default function UploadParagraphPage() {
  // ─── Manual form state ───
  const [language, setLanguage] = useState<Lang>('english');
  const [duration, setDuration] = useState<number>(5);
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Banner>(null);

  // ─── CSV import state ───
  const [csvFileName, setCsvFileName] = useState('');
  const [csvResult, setCsvResult] = useState<CsvResult | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvStatus, setCsvStatus] = useState<Banner>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Topic library state ───
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [listNotice, setListNotice] = useState<Banner>(null);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | Lang>('all');
  const [busyKey, setBusyKey] = useState<string | null>(null);

  // ─── Modal state (view / edit a topic) ───
  const [modal, setModal] = useState<{ mode: 'view' | 'edit'; topic: TopicSummary } | null>(null);
  const [modalRows, setModalRows] = useState<ParagraphRecord[] | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [draftTopic, setDraftTopic] = useState('');
  const [draft, setDraft] = useState<ParagraphRecord[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ─── Load topics from the database ───
  const refreshTopics = useCallback(async () => {
    setTopicsLoading(true);
    try {
      const raw = await fetchAllTopicRows();
      setTopics(summarizeTopics(raw));
      setTopicsError(null);
    } catch (err: any) {
      setTopicsError(err?.message ?? 'Failed to load topics');
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTopics();
  }, [refreshTopics]);

  // ─── Derived values ───
  const topicOptions = useMemo(
    () => topics.filter((t) => t.language === language).map((t) => t.topic),
    [topics, language]
  );

  const visibleTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return topics.filter(
      (t) =>
        (langFilter === 'all' || t.language === langFilter) &&
        (!q || t.topic.toLowerCase().includes(q))
    );
  }, [topics, langFilter, search]);

  const stats = useMemo(() => {
    const out = { topics: topics.length, english: 0, hindi: 0 };
    topics.forEach((t) => {
      out[t.language] += t.count;
    });
    return out;
  }, [topics]);

  const paragraphs = useMemo(
    () => text.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean),
    [text]
  );
  const wordTotal = useMemo(
    () => paragraphs.reduce((n, p) => n + wordCount(p), 0),
    [paragraphs]
  );

  const cleanTopic = topic.trim();
  const canSave = !saving && cleanTopic.length > 0 && paragraphs.length > 0;

  const csvCounts = useMemo(() => {
    const counts: Record<Lang, number> = { english: 0, hindi: 0 };
    csvResult?.rows.forEach((r) => {
      counts[r.language] += 1;
    });
    return counts;
  }, [csvResult]);

  const csvBlocked =
    !csvResult ||
    csvResult.fatal !== null ||
    csvResult.rows.length === 0 ||
    csvResult.errors.length > 0;

  // ─── Manual save (button, form submit, or Ctrl+Enter) ───
  async function handleSave(e?: FormEvent) {
    e?.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setStatus(null);

    const rows = paragraphs.map((content) => ({
      id: crypto.randomUUID(),
      language,
      duration,
      topic: cleanTopic,
      content,
    }));

    const { error } = await supabase.from('typing_paragraphs').insert(rows);
    setSaving(false);

    if (error) {
      setStatus({ ok: false, msg: error.message });
      return;
    }

    setStatus({ ok: true, msg: `Saved ${rows.length} paragraph(s) to "${cleanTopic}".` });
    setText('');
    void refreshTopics();
  }

  // ─── CSV file loading (browse or drop) ───
  async function loadCsvFile(file: File) {
    setCsvStatus(null);
    setCsvFileName(file.name);

    if (!/\.csv$/i.test(file.name)) {
      setCsvResult({ rows: [], errors: [], fatal: 'Please choose a .csv file.' });
      return;
    }

    const content = await file.text();
    setCsvResult(readParagraphCsv(content));
  }

  function handleCsvInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void loadCsvFile(file);
    // Clear so choosing the same file again still fires onChange
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (csvImporting) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void loadCsvFile(file);
  }

  function clearCsv() {
    setCsvFileName('');
    setCsvResult(null);
    setCsvStatus(null);
  }

  // ─── CSV import (English and Hindi rows keep their own language) ───
  async function handleCsvImport() {
    if (csvBlocked || !csvResult) return;

    setCsvImporting(true);
    setCsvStatus(null);

    const allRows = csvResult.rows;
    let inserted = 0;
    let failure: string | null = null;

    for (let i = 0; i < allRows.length; i += CSV_BATCH_SIZE) {
      const batch = allRows.slice(i, i + CSV_BATCH_SIZE);

      // Rows whose id already exists are skipped, so re-importing a file adds nothing twice
      const { data, error } = await supabase
        .from('typing_paragraphs')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: true })
        .select('id');

      if (error) {
        failure = error.message;
        break;
      }
      inserted += data?.length ?? 0;
    }

    setCsvImporting(false);
    void refreshTopics();

    if (failure) {
      setCsvStatus({
        ok: false,
        msg: `Stopped after ${inserted} new row(s) were added: ${failure}. You can retry safely.`,
      });
      return;
    }

    const skipped = allRows.length - inserted;
    setCsvStatus({
      ok: true,
      msg: `Added ${inserted} row(s) from ${csvFileName}. Skipped ${skipped} that already existed.`,
    });
    clearCsv();
  }

  // ─── Topic actions ───
  async function deleteTopic(t: TopicSummary) {
    const ok = window.confirm(
      `Delete "${t.topic}" (${t.language}) and all ${t.count} of its paragraph(s)? This cannot be undone.`
    );
    if (!ok) return;

    setBusyKey(t.key);
    setListNotice(null);

    const { data, error } = await supabase
      .from('typing_paragraphs')
      .delete()
      .eq('language', t.language)
      .eq('topic', t.topic)
      .select('id');

    setBusyKey(null);

    if (error) {
      setListNotice({ ok: false, msg: error.message });
      return;
    }
    if (!data || data.length === 0) {
      setListNotice({ ok: false, msg: 'Delete was blocked (no rows removed). Check your RLS policies.' });
      return;
    }

    setListNotice({ ok: true, msg: `Deleted "${t.topic}" (${data.length} paragraph(s)).` });
    void refreshTopics();
  }

  async function openTopic(mode: 'view' | 'edit', t: TopicSummary) {
    setModal({ mode, topic: t });
    setModalRows(null);
    setModalError(null);
    setEditError(null);
    setDraftTopic(t.topic);
    setDraft([]);
    setModalLoading(true);

    // Paragraph text is fetched only when a topic is opened
    const { data, error } = await supabase
      .from('typing_paragraphs')
      .select('id, duration, content')
      .eq('language', t.language)
      .eq('topic', t.topic)
      .order('duration', { ascending: true })
      .order('id', { ascending: true });

    setModalLoading(false);

    if (error) {
      setModalError(error.message);
      return;
    }

    const rows = (data ?? []) as ParagraphRecord[];
    setModalRows(rows);
    setDraft(rows.map((r) => ({ ...r })));
  }

  function closeModal() {
    setModal(null);
    setModalRows(null);
    setModalError(null);
    setEditError(null);
    setDraft([]);
  }

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  async function deleteParagraph(id: string) {
    if (!window.confirm('Delete this paragraph permanently?')) return;

    const { data, error } = await supabase
      .from('typing_paragraphs')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      setModalError(error.message);
      return;
    }
    if (!data || data.length === 0) {
      setModalError('Delete was blocked (no rows removed). Check your RLS policies.');
      return;
    }

    setModalRows((rows) => (rows ? rows.filter((r) => r.id !== id) : rows));
    setDraft((rows) => rows.filter((r) => r.id !== id));
    void refreshTopics();
  }

  async function saveEdit() {
    if (!modal || !modalRows) return;
    const orig = modal.topic;

    const newTopic = draftTopic.trim().replace(/\s+/g, ' ');
    if (!newTopic) {
      setEditError('Topic name cannot be empty.');
      return;
    }

    const cleaned = draft.map((d) => ({ ...d, content: d.content.replace(/\s+/g, ' ').trim() }));
    if (cleaned.some((d) => !d.content)) {
      setEditError('A paragraph is empty. Add text or delete that paragraph first.');
      return;
    }

    const topicChanged = newTopic !== orig.topic;
    const changed = cleaned.filter((d, i) => {
      const o = modalRows[i];
      return topicChanged || d.content !== o.content || d.duration !== o.duration;
    });

    if (changed.length === 0) {
      setEditError('No changes to save.');
      return;
    }

    setEditSaving(true);
    setEditError(null);

    // One upsert for every changed row. Rows are matched by id, so this updates them in place.
    const payload = changed.map((d) => ({
      id: d.id,
      language: orig.language,
      topic: newTopic,
      duration: d.duration,
      content: d.content,
    }));

    const { error } = await supabase.from('typing_paragraphs').upsert(payload, { onConflict: 'id' });
    setEditSaving(false);

    if (error) {
      setEditError(error.message);
      return;
    }

    closeModal();
    setListNotice({ ok: true, msg: `Saved ${changed.length} paragraph(s) in "${newTopic}".` });
    void refreshTopics();
  }

  // ─── Render ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 transition-colors duration-300 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20">
              <FiMonitor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold tracking-[0.25em] text-slate-900 dark:text-white">CPCT.IN</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Paragraph Studio
              </p>
            </div>
          </div>

          <Link
            href="/admin/paragraphs/manage"
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <FiLayers className="h-4 w-4" />
            Manage library
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Hero strip, matching the Updates bar on the home page */}
        <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg shadow-indigo-500/20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">Typing test content</p>
              <h2 className="mt-1 text-3xl font-bold">
                Upload. Edit. <span className="text-blue-200">Organize.</span>
              </h2>
              <p className="mt-2 max-w-md text-sm text-blue-100">
                Paragraphs for the CPCT typing test in English and Hindi, grouped by topic.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Topics', value: stats.topics },
                { label: 'English ¶', value: stats.english },
                { label: 'Hindi ¶', value: stats.hindi },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur">
                  <p className="text-2xl font-bold">{topicsLoading && topics.length === 0 ? '…' : s.value}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-100">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* ───────── Manual composer ───────── */}
          <section className={`${CARD} p-6 sm:p-8 lg:col-span-3`}>
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Compose paragraphs</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Separate paragraphs with a blank line. Each block is saved as its own entry.
                </p>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 sm:flex">
                <FiType className="h-5 w-5" />
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-7">
              <div className="grid gap-6 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <span className={LABEL}>Language</span>
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
                    {(['english', 'hindi'] as Lang[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLanguage(l)}
                        className={segmentClass(language === l)}
                      >
                        {l === 'english' ? 'English' : 'Hindi'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <span className={LABEL}>Duration</span>
                  <div className="grid grid-cols-4 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={segmentClass(duration === d)}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="topic" className={LABEL}>
                  Topic
                </label>
                <div className="relative">
                  <FiTag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="topic"
                    list="topic-options"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Type a new topic or pick an existing one"
                    className={`${INPUT} pl-11`}
                  />
                  <datalist id="topic-options">
                    {topicOptions.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <span className={LABEL}>Paragraphs</span>
                <CodeEditor
                  value={text}
                  onChange={setText}
                  onSave={() => {
                    if (canSave) void handleSave();
                  }}
                  language={language}
                  target={WORD_COUNTS[duration]}
                  placeholder="Paste paragraph text here…"
                />
              </div>

              {status && <Notice ok={status.ok}>{status.msg}</Notice>}

              <div className="flex flex-col-reverse gap-4 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">{paragraphs.length}</span> paragraph(s)
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">{wordTotal}</span> words
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    Target <span className="font-semibold text-slate-900 dark:text-white">{WORD_COUNTS[duration]}</span>
                  </span>
                </div>

                <button type="submit" disabled={!canSave} className={PRIMARY_BTN}>
                  {saving
                    ? 'Saving…'
                    : `Save ${paragraphs.length || ''} paragraph${paragraphs.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </form>
          </section>

          {/* ───────── CSV import ───────── */}
          <aside className={`${CARD} h-fit p-6 sm:p-8 lg:col-span-2 lg:sticky lg:top-28`}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Import CSV</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Bulk add rows in English and Hindi.</p>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-600 dark:bg-slate-900/40 dark:hover:bg-slate-700/40'
              } ${csvImporting ? 'pointer-events-none opacity-50' : ''}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition group-hover:scale-105 dark:bg-blue-900/40 dark:text-blue-400">
                <FiUploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Drop a CSV here or <span className="font-semibold text-blue-600 underline underline-offset-4 dark:text-blue-400">browse</span>
              </p>
              <p className="text-xs text-slate-400">UTF-8 · .csv only</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvInput}
              className="hidden"
            />

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Columns</p>
              <div className="flex flex-wrap gap-1.5">
                {['language', 'duration', 'topic', 'content'].map((c) => (
                  <code key={c} className="rounded-md bg-white px-2 py-1 text-xs text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-200">
                    {c}
                  </code>
                ))}
                <code className="rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500 dark:border-slate-600 dark:text-slate-400">
                  id (optional)
                </code>
              </div>
            </div>

            {csvStatus && (
              <div className="mt-5">
                <Notice ok={csvStatus.ok}>{csvStatus.msg}</Notice>
              </div>
            )}

            {csvResult && (
              <div className="mt-6 space-y-5">
                {csvResult.fatal ? (
                  <Notice ok={false}>{csvResult.fatal}</Notice>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200" title={csvFileName}>
                        {csvFileName}
                      </p>
                      <button
                        type="button"
                        onClick={clearCsv}
                        disabled={csvImporting}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        aria-label="Clear file"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Valid', value: csvResult.rows.length },
                        { label: 'English', value: csvCounts.english },
                        { label: 'Hindi', value: csvCounts.hindi },
                      ].map((t) => (
                        <div
                          key={t.label}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center dark:border-slate-700 dark:bg-slate-900/50"
                        >
                          <p className="text-xl font-semibold text-slate-900 dark:text-white">{t.value}</p>
                          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {t.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {csvResult.errors.length > 0 && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                        <p className="mb-2 font-semibold">
                          {csvResult.errors.length} row(s) need fixing. Correct the file and choose it again.
                        </p>
                        <ul className="max-h-40 space-y-1 overflow-y-auto">
                          {csvResult.errors.slice(0, 50).map((err) => (
                            <li key={err.row}>
                              <span className="font-semibold">Row {err.row}:</span> {err.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {csvResult.rows.length > 0 && (
                      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="max-h-64 overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
                              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                                <th className="px-3 py-2 font-semibold">Lang</th>
                                <th className="px-3 py-2 font-semibold">Min</th>
                                <th className="px-3 py-2 font-semibold">Topic</th>
                                <th className="px-3 py-2 text-right font-semibold">Words</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {csvResult.rows.slice(0, 50).map((r) => (
                                <tr key={r.id} className="text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/40">
                                  <td className="px-3 py-2">
                                    <span
                                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${
                                        r.language === 'english'
                                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                                          : 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
                                      }`}
                                    >
                                      {r.language}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">{r.duration}</td>
                                  <td className="max-w-[9rem] truncate px-3 py-2" title={r.topic}>
                                    {r.topic}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">{wordCount(r.content)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {csvResult.rows.length > 50 && (
                          <p className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/50">
                            Showing first 50 of {csvResult.rows.length} rows.
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleCsvImport}
                      disabled={csvBlocked || csvImporting}
                      className={`${PRIMARY_BTN} w-full`}
                    >
                      {csvImporting
                        ? 'Importing…'
                        : csvResult.errors.length > 0
                          ? 'Fix errors to import'
                          : `Import ${csvResult.rows.length} row(s)`}
                    </button>
                  </>
                )}
              </div>
            )}
          </aside>
        </div>

        {/* ───────── Topic library ───────── */}
        <section className={`${CARD} mt-8 p-6 sm:p-8`}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Topics in database</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                View, edit or delete a topic. Edits and deletes apply to every paragraph in that topic.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics"
                  className={`${INPUT} w-52 py-2 pl-9 text-sm`}
                />
              </div>

              <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
                {(['all', 'english', 'hindi'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLangFilter(f)}
                    className={`${segmentClass(langFilter === f)} py-1.5 text-xs capitalize`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void refreshTopics()}
                disabled={topicsLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <FiRefreshCw className={`h-4 w-4 ${topicsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {listNotice && (
            <div className="mb-6">
              <Notice ok={listNotice.ok}>{listNotice.msg}</Notice>
            </div>
          )}
          {topicsError && (
            <div className="mb-6">
              <Notice ok={false}>{topicsError}</Notice>
            </div>
          )}

          {topicsLoading && topics.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700/50" />
              ))}
            </div>
          ) : visibleTopics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-14 text-center dark:border-slate-600">
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {topics.length === 0 ? 'No topics yet' : 'No topics match this filter'}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {topics.length === 0
                  ? 'Upload paragraphs above to create your first topic.'
                  : 'Try a different search or language filter.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTopics.map((t) => {
                const busy = busyKey === t.key;
                const isHi = t.language === 'hindi';
                return (
                  <article
                    key={t.key}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500/50"
                  >
                    <div
                      className={`h-1 bg-gradient-to-r ${
                        isHi ? 'from-orange-500 to-amber-400' : 'from-blue-600 to-indigo-500'
                      }`}
                    />
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3
                            className={`truncate text-base font-semibold text-slate-900 dark:text-white ${isHi ? 'font-sans' : ''}`}
                            title={t.topic}
                          >
                            {t.topic}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {t.count} paragraph{t.count === 1 ? '' : 's'}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isHi
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                          }`}
                        >
                          {isHi ? 'Hindi' : 'English'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {DURATIONS.map((d) => {
                          const on = t.durations.includes(d);
                          return (
                            <span
                              key={d}
                              className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                                on
                                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                  : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                              }`}
                            >
                              {d} min
                            </span>
                          );
                        })}
                      </div>

                      <div className="mt-auto grid grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => void openTopic('view', t)}
                          disabled={busy}
                          className={`${ROW_ACTION} border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700`}
                        >
                          <FiEye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => void openTopic('edit', t)}
                          disabled={busy}
                          className={`${ROW_ACTION} bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700 dark:shadow-blue-900/20`}
                        >
                          <FiEdit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteTopic(t)}
                          disabled={busy}
                          className={`${ROW_ACTION} border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20`}
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                          {busy ? '…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ───────── View / Edit modal ───────── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            {/* Modal header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {modal.mode === 'view' ? 'Viewing topic' : 'Editing topic'} · {modal.topic.language}
                </p>
                <h3
                  className={`truncate text-lg font-semibold text-slate-900 dark:text-white ${
                    modal.topic.language === 'hindi' ? 'font-sans' : ''
                  }`}
                >
                  {modal.topic.topic}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {modalLoading && (
                <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">Loading paragraphs…</p>
              )}

              {modalError && <Notice ok={false}>{modalError}</Notice>}

              {!modalLoading && modalRows && modalRows.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  This topic has no paragraphs left.
                </p>
              )}

              {modal.mode === 'view' &&
                modalRows?.map((r, i) => (
                  <article
                    key={r.id}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900/30"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900">
                          {r.duration} min
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ¶{i + 1} · {wordCount(r.content)} words
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void deleteParagraph(r.id)}
                        className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        aria-label="Delete paragraph"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p
                      className={`whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 ${
                        modal.topic.language === 'hindi' ? 'font-sans' : ''
                      }`}
                    >
                      {r.content}
                    </p>
                  </article>
                ))}

              {modal.mode === 'edit' && modalRows && modalRows.length > 0 && (
                <>
                  <div>
                    <label htmlFor="edit-topic" className={LABEL}>
                      Topic name
                    </label>
                    <input
                      id="edit-topic"
                      value={draftTopic}
                      onChange={(e) => setDraftTopic(e.target.value)}
                      className={INPUT}
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Renaming moves every paragraph in this topic to the new name.
                    </p>
                  </div>

                  {draft.map((d, i) => (
                    <div
                      key={d.id}
                      className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900/30"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">¶{i + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {wordCount(d.content)} words
                          </span>
                          <select
                            value={d.duration}
                            onChange={(e) =>
                              setDraft((rows) =>
                                rows.map((r) =>
                                  r.id === d.id ? { ...r, duration: Number(e.target.value) } : r
                                )
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                          >
                            {DURATIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt} min
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <textarea
                        rows={4}
                        value={d.content}
                        onChange={(e) =>
                          setDraft((rows) =>
                            rows.map((r) => (r.id === d.id ? { ...r, content: e.target.value } : r))
                          )
                        }
                        className={`${INPUT} resize-y leading-relaxed ${
                          modal.topic.language === 'hindi' ? 'font-sans' : ''
                        }`}
                      />
                    </div>
                  ))}
                </>
              )}

              {editError && modal.mode === 'edit' && <Notice ok={false}>{editError}</Notice>}
            </div>

            {/* Modal footer */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/50">
              {modal.mode === 'view' ? (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal((m) => (m ? { ...m, mode: 'edit' } : m))}
                    disabled={!modalRows || modalRows.length === 0}
                    className={PRIMARY_BTN}
                  >
                    <FiEdit3 className="h-4 w-4" />
                    Edit topic
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={editSaving}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveEdit()}
                    disabled={editSaving || !modalRows || modalRows.length === 0}
                    className={PRIMARY_BTN}
                  >
                    {editSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}