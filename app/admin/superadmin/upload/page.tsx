 
'use client';
 

import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mammoth from 'mammoth';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

import {
  FiUploadCloud, FiDatabase, FiTrash2, FiEdit2, FiSave, FiX,
  FiCheckCircle, FiAlertCircle, FiRefreshCw, FiZap, FiEye,
  FiFileText, FiBarChart2, FiShield, FiClock, FiChevronDown,
  FiChevronUp, FiCpu, FiWifi, FiSend, FiType, FiList,
} from 'react-icons/fi';
import { HiOutlineAcademicCap, HiOutlineDocumentText, HiOutlineLightBulb } from 'react-icons/hi';

import {
  uploadExamAction,
  fetchExamsAction,
  updateExamAction,
  updateQuestionAction,
  deleteExamAction,
  deleteQuestionAction,
  fetchDashboardStatsAction,
  getRealtimeConfigAction,
} from '@/app/actions/getMainExam';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Option   { value: string; text: string }
interface Question {
  id: string; exam_id: string; question_number: number;
  question_en: string; question_hi: string;
  options: Option[]; correct_answer: string; created_at: string;
}
interface Exam {
  id: string; title: string; exam_date: string; created_at: string;
  mquestions: Question[];
}
interface Stats { total_exams: number; total_questions: number; recent_exam_title: string }
type Status = { type: 'success' | 'error' | 'info' | ''; message: string };

// Parsed question structure coming out of the Smart Import engine
interface ParsedQ {
  question_number : number;
  question_en     : string;
  question_hi     : string;
  options         : Option[];
  correct_answer  : string;  // option value string e.g. "2"
  difficulty?     : string;
  detectionMethod?: string;  // 'bold' | 'highlight' | 'asterisk' | 'bracket' | 'manual'
}

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  navy   : '#003087',
  navyD  : '#00205b',
  saffron: '#FF6B00',
  saffL  : '#ff8c38',
  green  : '#138808',
  white  : '#FFFFFF',
  offWht : '#F5F7FA',
  border : '#D1D5DB',
  text   : '#1A1A2E',
  muted  : '#6B7280',
  danger : '#DC2626',
  dangerL: '#FEE2E2',
  successL:'#D1FAE5',
  infoL  : '#DBEAFE',
  purpleL: '#EDE9FE',
  purple : '#6D28D9',
};

// ══════════════════════════════════════════════════════════════════════════════
//  TensorFlow — multi-feature difficulty scorer
// ══════════════════════════════════════════════════════════════════════════════
async function scoreQuestionDifficulty(text: string): Promise<string> {
  try {
    await tf.ready();
    const words = text.toLowerCase().split(/\s+/);
    const score = tf.tidy(() => {
      const lengths  = tf.tensor1d(words.map(w => w.length), 'float32');
      const mean     = lengths.mean().dataSync()[0];
      const std      = lengths.sub(mean).square().mean().sqrt().dataSync()[0];
      // vocabulary richness proxy
      const unique   = new Set(words).size;
      const richness = unique / (words.length || 1);
      return mean * 0.5 + std * 0.3 + richness * 10 * 0.2;
    });
    if (score > 7.5) return 'Hard';
    if (score > 5)   return 'Medium';
    return 'Easy';
  } catch {
    return 'N/A';
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  Smart Import Engine  (textarea + .docx / .doc HTML parser)
//
//  Correct answer detection priority:
//    1. HTML <strong>/<b> bold wrapping the option text  (Word / Google Docs)
//    2. HTML background-color highlight on the option span
//    3. Asterisk prefix  **Option text**  in plain text
//    4. Bracket markers  [Option text]   in plain text
//    5. ALL-CAPS option when others are mixed-case (last resort)
// ══════════════════════════════════════════════════════════════════════════════

function parseSmartText(raw: string): ParsedQ[] {
  // Normalise line endings
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const qs: ParsedQ[] = [];
  let cur: Partial<ParsedQ> | null = null;
  let optCount = 0;
  let lineNum  = 0;

  const flushCurrent = () => {
    if (!cur || !cur.question_en || !cur.options?.length) return;
    if (!cur.correct_answer || cur.correct_answer === '0') {
      // Fallback: pick option that is all-caps if others aren't
      const allCaps = cur.options!.findIndex(o => o.text === o.text.toUpperCase() && o.text.length > 2);
      cur.correct_answer = allCaps >= 0 ? String(allCaps + 1) : '1';
      if (allCaps >= 0) cur.detectionMethod = 'caps-fallback';
    }
    qs.push({
      question_number : qs.length + 1,
      question_en     : cur.question_en!.trim(),
      question_hi     : cur.question_hi?.trim() || '',
      options         : cur.options!,
      correct_answer  : cur.correct_answer!,
      detectionMethod : cur.detectionMethod || 'manual',
    } as ParsedQ);
    cur      = null;
    optCount = 0;
  };

  for (const raw of lines) {
    lineNum++;
    const line = raw.trim();
    if (!line) continue;

    // ── Question header: "1." / "Q1." / "Question 1:" / "1)" / "(1)"
    const qMatch = line.match(/^(?:Question\s*)?(?:\(?Q?)\s*(\d+)\s*[\.\:\)]\s*(.+)/i);
    if (qMatch) {
      flushCurrent();
      const content = qMatch[2].trim();
      const parts   = content.split(/\s+\/\s+/);
      cur = {
        question_en    : parts[0].trim(),
        question_hi    : parts[1]?.trim() || '',
        options        : [],
        correct_answer : '0',
        detectionMethod: 'manual',
      };
      optCount = 0;
      continue;
    }

    // ── Option line: "A." "a)" "(A)" "1." etc.  — also detect ** or [] markers
    const optMatch = line.match(/^[\(]?([A-Da-d1-4])[\)\.\s]\s*(.+)/);
    if (optMatch && cur) {
      optCount++;
      let optText = optMatch[2].trim();
      const val   = String(optCount);
      let isCorrect = false;
      let method    = 'manual';

      // ** bold marker **
      if (/^\*\*(.+)\*\*$/.test(optText)) {
        optText   = optText.replace(/^\*\*|\*\*$/g, '').trim();
        isCorrect = true;
        method    = 'asterisk';
      }
      // [bracket] marker
      else if (/^\[(.+)\]$/.test(optText)) {
        optText   = optText.replace(/^\[|\]$/g, '').trim();
        isCorrect = true;
        method    = 'bracket';
      }

      cur.options!.push({ value: val, text: optText });
      if (isCorrect) {
        cur.correct_answer  = val;
        cur.detectionMethod = method;
      }
      continue;
    }

    // ── "Ans: B" / "Answer: 2" / "Correct: C" lines
    const ansMatch = line.match(/^(?:Ans(?:wer)?|Correct(?:\s+Answer)?)\s*[:\-=]\s*([A-Da-d1-4])/i);
    if (ansMatch && cur) {
      const raw = ansMatch[1].toUpperCase();
      const map: Record<string, string> = { A:'1', B:'2', C:'3', D:'4' };
      cur.correct_answer  = map[raw] ?? raw;
      cur.detectionMethod = 'explicit-ans-line';
      continue;
    }

    // ── Continuation of question text (no prefix match)
    if (cur && (!cur.options || cur.options.length === 0)) {
      cur.question_en = (cur.question_en || '') + ' ' + line;
    }
  }
  flushCurrent();
  return qs;
}

function parseDocxHtmlSmart(html: string, fileName: string): { examTitle: string; examDate: string; questions: ParsedQ[] } {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(html, 'text/html');
  const els    = Array.from(doc.querySelectorAll('p, li, td, div'));
  const seen   = new Set<string>();
  const qs: ParsedQ[] = [];
  let cur: Partial<ParsedQ> | null = null;
  let optCount = 0;

  const flush = () => {
    if (!cur || !cur.question_en || !cur.options?.length) return;
    if (!cur.correct_answer || cur.correct_answer === '0') {
      cur.correct_answer  = '1';
      cur.detectionMethod = 'fallback';
    }
    qs.push({
      question_number : qs.length + 1,
      question_en     : cur.question_en!.trim(),
      question_hi     : cur.question_hi?.trim() || '',
      options         : cur.options!,
      correct_answer  : cur.correct_answer!,
      detectionMethod : cur.detectionMethod || 'manual',
    } as ParsedQ);
    cur = null; optCount = 0;
  };

  els.forEach(el => {
    const text = el.textContent?.trim() || '';
    if (!text || seen.has(text)) return;
    if (el.children.length > 0 &&
      Array.from(el.children).every(c => seen.has(c.textContent?.trim() || ''))) return;

    const isQ = /^(?:Question\s+)?(?:\(?Q)?\d+[\.\s:\)]+/i.test(text);
    if (isQ) {
      flush();
      const clean = text.replace(/^(?:Question\s+)?(?:\(?Q)?\d+[\.\s:\)]+/i, '').trim();
      const parts = clean.split(/\s+\/\s+/);
      cur = {
        question_en    : parts[0]?.trim() || clean,
        question_hi    : parts[1]?.trim() || '',
        options        : [],
        correct_answer : '0',
        detectionMethod: 'none',
      };
      optCount = 0;
      seen.add(text);
      return;
    }

    if (!cur) return;

    optCount++;
    const val     = String(optCount);
    let optTxt    = text.replace(/^[\(]?[A-Da-d1-4][\)\.\s]\s*/, '').trim();
    let isCorrect = false;
    let method    = 'none';

    // 1. Bold detection (Word / GDocs → <strong> or <b>)
    const boldEl = el.querySelector('strong, b');
    if (boldEl && boldEl.textContent?.trim()) {
      isCorrect = true;
      method    = 'bold';
    }
    // Check inline font-weight
    const allSpans = Array.from(el.querySelectorAll('span'));
    if (!isCorrect && allSpans.some(s =>
      s.style.fontWeight === 'bold' || parseInt(s.style.fontWeight) >= 600)) {
      isCorrect = true;
      method    = 'bold';
    }

    // 2. Highlight detection (background-color on span)
    if (!isCorrect && allSpans.some(s => {
      const bg = s.style.backgroundColor;
      return bg && bg !== 'transparent' && bg !== 'rgba(0,0,0,0)' && bg !== 'white' && bg !== '#ffffff';
    })) {
      isCorrect = true;
      method    = 'highlight';
    }

    // 3. Text-level ** or [] markers
    if (!isCorrect) {
      if (/^\*\*(.+)\*\*$/.test(optTxt)) {
        optTxt    = optTxt.replace(/^\*\*|\*\*$/g, '').trim();
        isCorrect = true; method = 'asterisk';
      } else if (/^\[(.+)\]$/.test(optTxt)) {
        optTxt    = optTxt.replace(/^\[|\]$/g, '').trim();
        isCorrect = true; method = 'bracket';
      }
    }

    cur.options!.push({ value: val, text: optTxt || text });
    if (isCorrect) {
      cur.correct_answer  = val;
      cur.detectionMethod = method;
    }
    seen.add(text);
  });
  flush();

  return {
    examTitle : fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').toUpperCase(),
    examDate  : new Date().toISOString().split('T')[0],
    questions : qs,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  Micro-components
// ══════════════════════════════════════════════════════════════════════════════

const Chip = ({
  label, color = C.navy, bg = C.infoL, icon,
}: { label: string; color?: string; bg?: string; icon?: React.ReactNode }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:4,
    padding:'3px 10px', borderRadius:999,
    backgroundColor:bg, color, fontSize:'0.72rem',
    fontWeight:600, letterSpacing:'0.03em', border:`1px solid ${color}33`,
  }}>
    {icon}{label}
  </span>
);

const DiffChip = ({ level }: { level?: string }) => {
  const map: Record<string,{bg:string;color:string}> = {
    Easy  :{bg:'#D1FAE5',color:'#065F46'},
    Medium:{bg:'#FEF3C7',color:'#92400E'},
    Hard  :{bg:'#FEE2E2',color:'#991B1B'},
    'N/A' :{bg:'#E5E7EB',color:'#374151'},
  };
  const s = map[level ?? 'N/A'] ?? map['N/A'];
  return <Chip label={level ?? 'N/A'} color={s.color} bg={s.bg} />;
};

const DetectBadge = ({ method }: { method?: string }) => {
  const cfg: Record<string,{label:string;bg:string;color:string}> = {
    bold          :{label:'Bold detected',    bg:'#EDE9FE',color:C.purple},
    highlight     :{label:'Highlight detected',bg:'#FEF9C3',color:'#854D0E'},
    asterisk      :{label:'** marker',         bg:'#E0F2FE',color:'#0369A1'},
    bracket       :{label:'[ ] marker',        bg:'#F0FDF4',color:'#166534'},
    'explicit-ans-line':{label:'Ans: line',   bg:'#FFF7ED',color:C.saffron},
    'caps-fallback':{label:'CAPS guess',      bg:'#FEE2E2',color:C.danger},
    fallback      :{label:'Fallback',          bg:'#F3F4F6',color:C.muted},
    manual        :{label:'Manual',            bg:'#F3F4F6',color:C.muted},
    none          :{label:'No detection',      bg:'#FEE2E2',color:C.danger},
  };
  const c = cfg[method ?? 'none'] ?? cfg['none'];
  return <Chip label={c.label} color={c.color} bg={c.bg} />;
};

const Toast = ({ status }: { status: Status }) => {
  if (!status.message) return null;
  const cfg = {
    success:{bg:C.successL,color:C.green,  icon:<FiCheckCircle/>},
    error  :{bg:C.dangerL, color:C.danger, icon:<FiAlertCircle/>},
    info   :{bg:C.infoL,   color:C.navy,   icon:<FiZap/>},
    ''     :{bg:'#F3F4F6', color:C.muted,  icon:<FiZap/>},
  }[status.type];
  return (
    <div style={{
      display:'flex',alignItems:'center',gap:8,
      padding:'10px 16px',borderRadius:8,background:cfg.bg,
      color:cfg.color,fontSize:'0.82rem',fontWeight:500,
      border:`1px solid ${cfg.color}44`,
    }}>
      {cfg.icon} {status.message}
    </div>
  );
};

const StatCard = ({icon,label,value,accent=C.navy}:{icon:React.ReactNode;label:string;value:string|number;accent?:string}) => (
  <div style={{
    background:C.white,borderRadius:10,padding:'16px 20px',
    border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:14,
    boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
  }}>
    <div style={{
      width:44,height:44,borderRadius:10,
      background:`${accent}18`,color:accent,
      display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
    }}>{icon}</div>
    <div>
      <p style={{margin:0,fontSize:'1.4rem',fontWeight:700,color:C.text,lineHeight:1}}>{value}</p>
      <p style={{margin:'2px 0 0 0',fontSize:'0.75rem',color:C.muted,fontWeight:500}}>{label}</p>
    </div>
  </div>
);

const IconBtn = ({icon,title,color,onClick}:{icon:React.ReactNode;title:string;color:string;onClick:()=>void}) => (
  <button onClick={onClick} title={title} style={{
    width:32,height:32,borderRadius:7,border:`1px solid ${color}33`,
    background:`${color}10`,color,cursor:'pointer',
    display:'flex',alignItems:'center',justifyContent:'center',
  }}>{icon}</button>
);

// Shared form styles
const labelStyle:React.CSSProperties={display:'block',marginBottom:4,fontSize:'0.78rem',fontWeight:600,color:'#374151'};
const inputStyle:React.CSSProperties={width:'100%',padding:'9px 12px',borderRadius:7,border:`1px solid ${C.border}`,marginBottom:12,fontSize:'0.85rem',color:C.text,background:'#F9FAFB'};
const btnPrimary:React.CSSProperties={flex:1,padding:'10px',background:C.navy,color:'#fff',border:'none',borderRadius:7,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:'0.85rem'};
const btnSecondary:React.CSSProperties={flex:1,padding:'10px',background:'#F3F4F6',color:C.text,border:`1px solid ${C.border}`,borderRadius:7,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:'0.85rem'};

// ══════════════════════════════════════════════════════════════════════════════
//  Smart Import Panel  (new dedicated tab)
// ══════════════════════════════════════════════════════════════════════════════
function SmartImportPanel({
  onUploaded, toast,
}: {
  onUploaded: () => void;
  toast: (msg: string, type: Status['type']) => void;
}) {
  // sub-tab: 'text' | 'file'
  const [mode,        setMode]        = useState<'text'|'file'>('text');
  const [rawText,     setRawText]     = useState('');
  const [examTitle,   setExamTitle]   = useState('');
  const [examDate,    setExamDate]    = useState(new Date().toISOString().split('T')[0]);
  const [parsed,      setParsed]      = useState<ParsedQ[]>([]);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [tfScoring,   setTfScoring]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const PLACEHOLDER = `Paste questions here. Supported formats:

1. What is the capital of India?
A. Mumbai
B. **New Delhi**
C. Kolkata
D. Chennai

2. Which planet is closest to the Sun?
A. Venus
B. Earth
C. [Mercury]
D. Mars
Answer: C

3. What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Ans: B

Tips:
• Bold correct option with **double asterisks** OR [square brackets]
• OR add  Answer: B / Ans: C  after options
• In Word / Google Docs: bold or highlight the correct option text directly`;

  // ── Parse on text change (debounced 400ms)
  useEffect(() => {
    if (!rawText.trim()) { setParsed([]); return; }
    const t = setTimeout(() => {
      const qs = parseSmartText(rawText);
      setParsed(qs);
      runTfScoring(qs);
    }, 400);
    return () => clearTimeout(t);
  }, [rawText]);

  const runTfScoring = async (qs: ParsedQ[]) => {
    setTfScoring(true);
    const scored = await Promise.all(
      qs.map(async q => ({ ...q, difficulty: await scoreQuestionDifficulty(q.question_en) }))
    );
    setParsed(scored);
    setTfScoring(false);
  };

  // ── DOCX file handler
  const handleDocFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast('Parsing document…', 'info');
    try {
      const buf    = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: buf });
      const data   = parseDocxHtmlSmart(result.value, file.name);
      // Auto-fill title and date
      if (!examTitle) setExamTitle(data.examTitle);
      const scored = await Promise.all(
        data.questions.map(async q => ({
          ...q,
          difficulty: await scoreQuestionDifficulty(q.question_en),
        }))
      );
      setParsed(scored);
      setPreviewOpen(true);
      toast(`Extracted ${scored.length} questions from "${file.name}"`, 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to parse document.', 'error');
    }
  };

  // ── Upload to DB
  const handleUpload = async () => {
    if (!examTitle.trim()) { toast('Enter an exam title.', 'error'); return; }
    if (!parsed.length)    { toast('No questions to upload.', 'error'); return; }

    const noAns = parsed.filter(q => q.detectionMethod === 'none' || q.detectionMethod === 'fallback');
    if (noAns.length > 0 && !confirm(
      `${noAns.length} question(s) have no detected correct answer and will default to option 1.\nContinue anyway?`
    )) return;

    setLoading(true);
    toast('Uploading to Supabase…', 'info');
    try {
      const res = await uploadExamAction({
        title     : examTitle.trim(),
        exam_date : examDate,
        questions : parsed.map(q => ({
          question_number : q.question_number,
          question_en     : q.question_en,
          question_hi     : q.question_hi,
          options         : q.options,
          correct_answer  : q.correct_answer,
        })),
      });
      if (!res.success) throw new Error(res.error);
      toast(`✓ ${res.data?.question_count} questions saved to database!`, 'success');
      setRawText('');
      setExamTitle('');
      setParsed([]);
      if (fileRef.current) fileRef.current.value = '';
      onUploaded();
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // edit a parsed question before upload
  const updateParsed = (idx: number, field: keyof ParsedQ, val: string) => {
    setParsed(prev => prev.map((q, i) => i === idx ? { ...q, [field]: val } : q));
  };

  const detected = parsed.filter(q => q.correct_answer !== '0' && q.detectionMethod !== 'fallback' && q.detectionMethod !== 'none').length;
  const missing  = parsed.filter(q => q.detectionMethod === 'none').length;

  return (
    <div>
      {/* Mode toggle */}
      <div style={{display:'flex',gap:0,marginBottom:20,background:'#F3F4F6',borderRadius:10,padding:4,width:'fit-content'}}>
        {(['text','file'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:'8px 22px',border:'none',cursor:'pointer',borderRadius:8,
            background: mode===m ? C.navy : 'transparent',
            color: mode===m ? '#fff' : C.muted,
            fontWeight:600,fontSize:'0.84rem',
            display:'flex',alignItems:'center',gap:6,transition:'all 0.15s',
          }}>
            {m==='text' ? <><FiType size={14}/>Text Input</> : <><FiUploadCloud size={14}/>Word / Google Doc</>}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,alignItems:'start'}}>

        {/* ── LEFT: Input panel ────────────────────────────────────────────── */}
        <div>
          <div style={{background:C.white,borderRadius:12,padding:24,border:`1px solid ${C.border}`,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>

            {mode === 'text' ? (
              <>
                <h3 style={{margin:'0 0 4px 0',color:C.navyD,fontSize:'1rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
                  <FiType color={C.saffron}/> Paste Questions
                </h3>
                <p style={{margin:'0 0 14px 0',fontSize:'0.78rem',color:C.muted}}>
                  Answers auto-detected from <strong>**bold**</strong>, <strong>[brackets]</strong>, or <code>Answer: B</code> lines.
                </p>
                <textarea
                  rows={18}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={PLACEHOLDER}
                  style={{
                    width:'100%',padding:14,fontFamily:'monospace',fontSize:'0.78rem',
                    borderRadius:8,border:`1px solid ${C.border}`,resize:'vertical',
                    background:'#F8FAFC',color:C.text,boxSizing:'border-box',
                    lineHeight:1.65,
                  }}
                />
              </>
            ) : (
              <>
                <h3 style={{margin:'0 0 4px 0',color:C.navyD,fontSize:'1rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
                  <HiOutlineDocumentText color={C.saffron}/> Upload Document
                </h3>
                <p style={{margin:'0 0 14px 0',fontSize:'0.78rem',color:C.muted}}>
                  Supports <strong>.docx</strong> (Word) and Google Docs exported as .docx.
                  Bold or highlight the correct option inside the document.
                </p>

                {/* Drop zone */}
                <label style={{
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  border:`2px dashed ${C.saffron}`,borderRadius:10,padding:'36px 20px',
                  textAlign:'center',cursor:'pointer',background:'#FFF7ED',marginBottom:14,
                  gap:8,
                }}>
                  <FiUploadCloud size={36} color={C.saffron}/>
                  <span style={{fontWeight:700,color:C.saffron,fontSize:'0.9rem'}}>
                    Click to choose .docx file
                  </span>
                  <span style={{fontSize:'0.74rem',color:C.muted,lineHeight:1.4}}>
                    Correct answer = <b>bold</b> or <span style={{background:'#fef08a',padding:'1px 4px',borderRadius:3}}>highlighted</span> option in the document
                  </span>
                  <input
                    type="file" ref={fileRef}
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleDocFile}
                    style={{display:'none'}}
                  />
                </label>

                {/* Format guide */}
                <div style={{background:'#F0FDF4',borderRadius:8,padding:12,fontSize:'0.76rem',color:'#166534',lineHeight:1.7}}>
                  <strong>Document format guide:</strong><br/>
                  • Number questions: <code>1.</code> or <code>Q1.</code><br/>
                  • Options as: <code>A.</code> <code>B.</code> <code>C.</code> <code>D.</code><br/>
                  • <strong>Bold</strong> the correct option text in Word<br/>
                  • Or <span style={{background:'#fef08a',padding:'0 3px'}}>highlight</span> it with any color<br/>
                  • Bilingual: separate EN / HI with " / " in the question
                </div>
              </>
            )}

            {/* Exam metadata */}
            <div style={{marginTop:18,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
              <label style={labelStyle}>Exam Title *</label>
              <input
                value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
                placeholder="e.g. SSC CGL 2024 – General Awareness"
                style={inputStyle}
              />
              <label style={labelStyle}>Exam Date</label>
              <input
                type="date" value={examDate}
                onChange={e => setExamDate(e.target.value)}
                style={{...inputStyle,marginBottom:0}}
              />
            </div>
          </div>

          {/* Detection summary chips */}
          {parsed.length > 0 && (
            <div style={{
              marginTop:12,background:C.white,borderRadius:10,
              padding:'12px 16px',border:`1px solid ${C.border}`,
              display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',
            }}>
              <span style={{fontSize:'0.76rem',fontWeight:600,color:C.muted}}>Detection:</span>
              <Chip label={`${parsed.length} questions`} color={C.navy} bg={C.infoL} icon={<FiList size={10}/>}/>
              <Chip label={`${detected} answers found`} color={C.green} bg='#D1FAE5' icon={<FiCheckCircle size={10}/>}/>
              {missing > 0 && <Chip label={`${missing} missing`} color={C.danger} bg={C.dangerL} icon={<FiAlertCircle size={10}/>}/>}
              {tfScoring && <Chip label="TF scoring…" color={C.purple} bg={C.purpleL} icon={<FiCpu size={10}/>}/>}
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={loading || !parsed.length || !examTitle.trim()}
            style={{
              marginTop:12,width:'100%',padding:'13px',
              background: (loading || !parsed.length || !examTitle.trim())
                ? '#93C5FD'
                : `linear-gradient(135deg,${C.saffron},${C.saffL})`,
              color:'#fff',border:'none',borderRadius:8,
              fontWeight:700,cursor:(loading || !parsed.length || !examTitle.trim()) ? 'not-allowed' : 'pointer',
              fontSize:'0.92rem',letterSpacing:'0.03em',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            }}
          >
            {loading
              ? <><FiRefreshCw style={{animation:'spin 1s linear infinite'}}/> Uploading…</>
              : <><FiSend/> Upload {parsed.length} Questions to Database</>}
          </button>
        </div>

        {/* ── RIGHT: Live preview panel ─────────────────────────────────────── */}
        <div>
          <div style={{
            background:C.white,borderRadius:12,border:`1px solid ${C.border}`,
            boxShadow:'0 1px 4px rgba(0,0,0,0.05)',overflow:'hidden',
          }}>
            <div style={{
              padding:'12px 18px',background:`linear-gradient(90deg,${C.navyD},${C.navy})`,
              display:'flex',alignItems:'center',justifyContent:'space-between',
            }}>
              <span style={{color:'#fff',fontWeight:700,fontSize:'0.88rem',display:'flex',alignItems:'center',gap:8}}>
                <FiEye/> Live Preview
                {tfScoring && <span style={{fontSize:'0.72rem',color:'#A8C0E0',fontWeight:400}}>· TF scoring…</span>}
              </span>
              <button
                onClick={() => setPreviewOpen(p => !p)}
                style={{background:'none',border:'none',color:'#A8C0E0',cursor:'pointer',fontSize:18}}
              >
                {previewOpen ? <FiChevronUp/> : <FiChevronDown/>}
              </button>
            </div>

            {previewOpen && (
              <div style={{maxHeight:'62vh',overflowY:'auto',padding:'16px 18px'}}>
                {parsed.length === 0 ? (
                  <div style={{textAlign:'center',padding:'40px 16px',color:C.muted}}>
                    <HiOutlineLightBulb size={32} style={{marginBottom:8,color:C.border}}/>
                    <p style={{margin:0,fontSize:'0.84rem'}}>
                      {mode==='text'
                        ? 'Start typing questions on the left to see a live preview here.'
                        : 'Upload a document to see parsed questions here.'}
                    </p>
                  </div>
                ) : (
                  parsed.map((q, qi) => (
                    <div key={qi} style={{
                      marginBottom:18,padding:14,borderRadius:10,
                      border:`1px solid ${C.border}`,background:'#FAFBFC',
                    }}>
                      {/* Q header */}
                      <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:8}}>
                        <span style={{
                          minWidth:26,height:26,background:C.navy,color:'#fff',
                          borderRadius:'50%',display:'flex',alignItems:'center',
                          justifyContent:'center',fontSize:'0.7rem',fontWeight:700,flexShrink:0,
                        }}>{q.question_number}</span>
                        <div style={{flex:1}}>
                          {/* Inline editable question text */}
                          <textarea
                            rows={2}
                            value={q.question_en}
                            onChange={e => updateParsed(qi, 'question_en', e.target.value)}
                            style={{
                              width:'100%',border:`1px solid ${C.border}`,borderRadius:6,
                              padding:'4px 8px',fontSize:'0.82rem',color:C.text,
                              background:'#fff',resize:'vertical',fontFamily:'inherit',boxSizing:'border-box',
                            }}
                          />
                          {q.question_hi && (
                            <p style={{margin:'2px 0 0 0',fontSize:'0.76rem',color:C.muted,fontStyle:'italic'}}>{q.question_hi}</p>
                          )}
                        </div>
                      </div>

                      {/* Detection + difficulty badges */}
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                        <DetectBadge method={q.detectionMethod}/>
                        <DiffChip level={q.difficulty}/>
                      </div>

                      {/* Options */}
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                        {q.options.map((opt, oi) => {
                          const correct = String(q.correct_answer) === String(opt.value);
                          return (
                            <div
                              key={oi}
                              onClick={() => updateParsed(qi, 'correct_answer', opt.value)}
                              title="Click to mark as correct answer"
                              style={{
                                padding:'5px 9px',borderRadius:6,fontSize:'0.78rem',cursor:'pointer',
                                border: correct ? `2px solid ${C.green}` : `1px solid ${C.border}`,
                                background: correct ? '#D1FAE5' : '#F9FAFB',
                                color: correct ? C.green : C.text,
                                fontWeight: correct ? 700 : 400,
                                transition:'all 0.12s',
                              }}
                            >
                              <span style={{fontWeight:700,marginRight:4}}>{opt.value}.</span>
                              {opt.text}
                              {correct && <FiCheckCircle style={{marginLeft:4,verticalAlign:'middle'}}/>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Correct answer quick-select */}
                      <div style={{marginTop:8,display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:'0.72rem',color:C.muted,fontWeight:600}}>Correct:</span>
                        {q.options.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => updateParsed(qi, 'correct_answer', opt.value)}
                            style={{
                              padding:'2px 8px',fontSize:'0.72rem',borderRadius:4,
                              border: q.correct_answer===opt.value ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                              background: q.correct_answer===opt.value ? '#D1FAE5' : '#F3F4F6',
                              color: q.correct_answer===opt.value ? C.green : C.muted,
                              fontWeight: q.correct_answer===opt.value ? 700 : 400,
                              cursor:'pointer',
                            }}
                          >{opt.value}</button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  Main Dashboard
// ══════════════════════════════════════════════════════════════════════════════
export default function ExamDashboard() {

  const [exams,     setExams]     = useState<Exam[]>([]);
  const [stats,     setStats]     = useState<any>(null);
  const [rawJson,   setRawJson]   = useState('');
  const [status,    setStatus]    = useState<Status>({type:'',message:''});
  const [loading,   setLoading]   = useState(false);
  const [rtStatus,  setRtStatus]  = useState<'live'|'off'>('off');
  const [tfReady,   setTfReady]   = useState(false);
  const [diffMap,   setDiffMap]   = useState<Record<string,string>>({});
  const [expanded,  setExpanded]  = useState<Record<string,boolean>>({});
  const [editExam,  setEditExam]  = useState<{id:string;title:string;exam_date:string}|null>(null);
  const [editQ,     setEditQ]     = useState<Question|null>(null);
  const [activeTab, setActiveTab] = useState<'smart'|'json'|'list'>('smart');

  const fileRef    = useRef<HTMLInputElement>(null);
  const channelRef = useRef<RealtimeChannel|null>(null);

  const toast = useCallback((msg:string, type:Status['type']='info') =>
    setStatus({type,message:msg}), []);

  useEffect(() => {
    tf.ready().then(() => setTfReady(true)).catch(()=>{});
    loadAll();
    setupRealtime();
    return () => { channelRef.current?.unsubscribe(); };
  }, []);

  const loadAll = async () => {
    const [examsData, statsResult] = await Promise.all([
      fetchExamsAction(),
      fetchDashboardStatsAction(),
    ]);
    setExams(examsData);
    if (statsResult.success && statsResult.data) setStats(statsResult.data);
    scoreDifficulties(examsData);
  };

  const scoreDifficulties = async (examsData: Exam[]) => {
    const map: Record<string,string> = {};
    for (const exam of examsData)
      for (const q of exam.mquestions ?? [])
        map[q.id] = await scoreQuestionDifficulty(q.question_en);
    setDiffMap(map);
  };

  const setupRealtime = async () => {
    try {
      const {url, anonKey} = await getRealtimeConfigAction();
      const client  = createClient(url, anonKey);
      const channel = client
        .channel('exam-changes')
        .on('postgres_changes',{event:'*',schema:'public',table:'mexams'},  ()=>{loadAll();toast('Realtime: exam updated','info');})
        .on('postgres_changes',{event:'*',schema:'public',table:'mquestions'},()=>{loadAll();})
        .subscribe(state => setRtStatus(state==='SUBSCRIBED'?'live':'off'));
      channelRef.current = channel;
    } catch { setRtStatus('off'); }
  };

  // JSON tab upload
  const parseDocxHtml = (html: string, fileName: string) => {
    const data = parseDocxHtmlSmart(html, fileName);
    return { examTitle: data.examTitle, examDate: data.examDate, questions: data.questions };
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast('Reading file…','info');
    try {
      if (file.name.endsWith('.json')) {
        setRawJson(await file.text());
        toast(`Loaded: "${file.name}"`, 'success');
      } else if (file.name.endsWith('.docx')) {
        const buf    = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({arrayBuffer:buf});
        const parsed = parseDocxHtml(result.value, file.name);
        setRawJson(JSON.stringify(parsed, null, 2));
        toast(`Extracted ${parsed.questions.length} questions from "${file.name}"`, 'success');
      } else throw new Error('Only .json and .docx supported.');
    } catch (err:any) { toast(err.message,'error'); }
  };

  const handleJsonSubmit = async () => {
    if (!rawJson.trim()) { toast('Nothing to upload.','error'); return; }
    setLoading(true); toast('Uploading…','info');
    try {
      const parsed = JSON.parse(rawJson);
      let payload: any;
      if (parsed.examTitle && parsed.questions) {
        payload = {
          title:parsed.examTitle,
          exam_date:parsed.examDate||new Date().toISOString().split('T')[0],
          questions:parsed.questions.map((q:any)=>({
            question_number:q.question_number,
            question_en:q.question_en||q.question,
            question_hi:q.question_hi||q.question_rich||'',
            options:q.options,
            correct_answer:String(q.correct_answer||q.correctAnswer),
          })),
        };
      } else if (Array.isArray(parsed)) {
        payload = {
          title:parsed[0]?.title||'IMPORTED BATCH',
          exam_date:new Date().toISOString().split('T')[0],
          questions:parsed.map((item:any,i:number)=>{
            let ans='1';
            const opts=item.options.map((o:string,idx:number)=>{
              const clean=o.replace(/\*\*/g,'');
              if(o.startsWith('**')&&o.endsWith('**')) ans=String(idx+1);
              return {value:String(idx+1),text:clean};
            });
            return {question_number:item.question_number||i+1,question_en:item.question?.split(/\s+\/\s+/)[0]||item.question||'',question_hi:item.question?.split(/\s+\/\s+/)[1]||'',options:opts,correct_answer:item.correct_answer?String(item.correct_answer):ans};
          }),
        };
      } else throw new Error('Unrecognised JSON structure.');

      const res = await uploadExamAction(payload);
      if (!res.success) throw new Error(res.error);
      toast(`Saved! ${res.data?.question_count} questions uploaded.`,'success');
      setRawJson('');
      if (fileRef.current) fileRef.current.value='';
      await loadAll(); setActiveTab('list');
    } catch (err:any) { toast(err.message,'error'); }
    finally { setLoading(false); }
  };

  const handleUpdateExam = async () => {
    if (!editExam) return;
    setLoading(true);
    const res = await updateExamAction(editExam.id,{title:editExam.title,exam_date:editExam.exam_date});
    setLoading(false);
    if (res.success) { toast('Exam updated.','success'); setEditExam(null); await loadAll(); }
    else toast(res.error??'Update failed.','error');
  };

  const handleUpdateQuestion = async () => {
    if (!editQ) return;
    setLoading(true);
    const res = await updateQuestionAction(editQ.id,{question_en:editQ.question_en,question_hi:editQ.question_hi,options:editQ.options,correct_answer:editQ.correct_answer});
    setLoading(false);
    if (res.success) { toast('Question updated.','success'); setEditQ(null); await loadAll(); }
    else toast(res.error??'Update failed.','error');
  };

  const handleDeleteExam = async (id:string,title:string) => {
    if (!confirm(`Delete exam "${title}" and all its questions?`)) return;
    setLoading(true);
    const res = await deleteExamAction(id);
    setLoading(false);
    if (res.success) { toast('Exam deleted.','success'); await loadAll(); }
    else toast(res.error??'Delete failed.','error');
  };

  const handleDeleteQuestion = async (qid:string) => {
    if (!confirm('Delete this question?')) return;
    setLoading(true);
    const res = await deleteQuestionAction(qid);
    setLoading(false);
    if (res.success) { toast('Question deleted.','success'); await loadAll(); }
    else toast(res.error??'Delete failed.','error');
  };

  const TABS = [
    {id:'smart', label:'Smart Import',  icon:<HiOutlineLightBulb size={15}/>},
    {id:'json',  label:'JSON / Legacy', icon:<FiFileText size={14}/>},
    {id:'list',  label:'Exam Records',  icon:<FiDatabase size={14}/>},
  ] as const;

  return (
    <div style={{minHeight:'100vh',background:C.offWht,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>

      {/* ── Govt Header ─────────────────────────────────────────────────────── */}
      <div style={{background:`linear-gradient(135deg,${C.navyD} 0%,${C.navy} 100%)`,color:C.white,boxShadow:'0 2px 8px rgba(0,0,0,0.25)'}}>
        <div style={{height:4,background:`linear-gradient(90deg,${C.saffron},${C.saffL})`}}/>
        <div style={{maxWidth:1400,margin:'0 auto',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:46,height:46,borderRadius:'50%',background:C.saffron,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>
              <HiOutlineAcademicCap/>
            </div>
            <div>
              <p style={{margin:0,fontSize:'1.15rem',fontWeight:700,letterSpacing:'0.02em'}}>Competitive Exam Portal</p>
              <p style={{margin:0,fontSize:'0.72rem',color:'#A8C0E0',letterSpacing:'0.04em'}}>GOVERNMENT EXAMINATION DATABASE MANAGEMENT SYSTEM</p>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Chip label={rtStatus==='live'?'Realtime Live':'Offline'} color={rtStatus==='live'?'#065F46':'#374151'} bg={rtStatus==='live'?'#D1FAE5':'#E5E7EB'} icon={<FiWifi size={11}/>}/>
            <Chip label={tfReady?'TF Ready':'TF Loading'} color={tfReady?C.saffron:'#374151'} bg={tfReady?'#FFF7ED':'#E5E7EB'} icon={<FiCpu size={11}/>}/>
            <Chip label="Secure" color={C.green} bg="#D1FAE5" icon={<FiShield size={11}/>}/>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'24px'}}>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:24}}>
          <StatCard icon={<FiDatabase/>}  label="Total Exams"     value={stats?.total_exams     ??'—'} accent={C.navy}/>
          <StatCard icon={<FiBarChart2/>} label="Total Questions" value={stats?.total_questions  ??'—'} accent={C.saffron}/>
          <StatCard icon={<FiClock/>}     label="Latest Exam"     value={stats?.recent_exam_title??'—'} accent={C.green}/>
          <StatCard icon={<FiCpu/>}       label="TF Backend"      value={tfReady?'Active':'Loading'} accent="#7C3AED"/>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:0,marginBottom:20,borderBottom:`2px solid ${C.border}`}}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding:'10px 24px',border:'none',cursor:'pointer',background:'transparent',
              fontWeight:600,fontSize:'0.88rem',letterSpacing:'0.03em',
              color:activeTab===tab.id ? C.navy : C.muted,
              borderBottom:activeTab===tab.id ? `3px solid ${C.saffron}` : '3px solid transparent',
              marginBottom:-2,display:'flex',alignItems:'center',gap:6,
            }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* ── SMART IMPORT TAB ─────────────────────────────────────────────── */}
        {activeTab === 'smart' && (
          <SmartImportPanel onUploaded={loadAll} toast={toast}/>
        )}

        {/* ── JSON / LEGACY TAB ────────────────────────────────────────────── */}
        {activeTab === 'json' && (
          <div style={{background:C.white,borderRadius:12,padding:28,border:`1px solid ${C.border}`,boxShadow:'0 2px 8px rgba(0,0,0,0.06)',maxWidth:680}}>
            <h2 style={{margin:'0 0 20px 0',color:C.navyD,fontSize:'1.1rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
              <HiOutlineDocumentText/> Import via JSON / Legacy Docx
            </h2>
            <label style={{display:'block',border:`2px dashed ${C.saffron}`,borderRadius:10,padding:'28px 20px',textAlign:'center',cursor:'pointer',background:'#FFF7ED',marginBottom:16}}>
              <FiUploadCloud size={32} color={C.saffron}/>
              <p style={{margin:'8px 0 4px 0',fontWeight:600,color:C.saffron}}>Click to upload .json or .docx</p>
              <input type="file" ref={fileRef} accept=".json,.docx,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFile} style={{display:'none'}}/>
            </label>
            <div style={{textAlign:'center',color:C.muted,fontSize:'0.78rem',fontWeight:600,margin:'8px 0'}}>— OR PASTE JSON —</div>
            <textarea rows={12} value={rawJson} onChange={e=>setRawJson(e.target.value)} placeholder="Paste exam JSON here…"
              style={{width:'100%',padding:12,fontFamily:'monospace',fontSize:'0.78rem',borderRadius:8,border:`1px solid ${C.border}`,resize:'vertical',background:'#F8FAFC',color:C.text,boxSizing:'border-box'}}/>
            <button onClick={handleJsonSubmit} disabled={loading} style={{
              marginTop:14,width:'100%',padding:'13px',
              background:loading?'#93C5FD':`linear-gradient(135deg,${C.navy},${C.navyD})`,
              color:C.white,border:'none',borderRadius:8,fontWeight:700,
              cursor:loading?'not-allowed':'pointer',fontSize:'0.92rem',letterSpacing:'0.04em',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            }}>
              {loading?<><FiRefreshCw style={{animation:'spin 1s linear infinite'}}/> Processing…</>:<><FiSave/> Parse & Save to Database</>}
            </button>
            <div style={{marginTop:14}}><Toast status={status}/></div>
          </div>
        )}

        {/* ── EXAM RECORDS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'list' && (
          <div>
            {/* Edit Exam modal */}
            {editExam && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{background:C.white,borderRadius:14,padding:28,width:480,boxShadow:'0 8px 40px rgba(0,0,0,0.2)'}}>
                  <h3 style={{margin:'0 0 16px 0',color:C.navyD}}>Edit Exam</h3>
                  <label style={labelStyle}>Title</label>
                  <input value={editExam.title} onChange={e=>setEditExam({...editExam,title:e.target.value})} style={inputStyle}/>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={editExam.exam_date} onChange={e=>setEditExam({...editExam,exam_date:e.target.value})} style={inputStyle}/>
                  <div style={{display:'flex',gap:10,marginTop:8}}>
                    <button onClick={handleUpdateExam} disabled={loading} style={btnPrimary}><FiSave/> Save</button>
                    <button onClick={()=>setEditExam(null)} style={btnSecondary}><FiX/> Cancel</button>
                  </div>
                </div>
              </div>
            )}
            {/* Edit Question modal */}
            {editQ && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
                <div style={{background:C.white,borderRadius:14,padding:28,width:'100%',maxWidth:600,boxShadow:'0 8px 40px rgba(0,0,0,0.2)',maxHeight:'90vh',overflowY:'auto'}}>
                  <h3 style={{margin:'0 0 16px 0',color:C.navyD}}>Edit Q{editQ.question_number}</h3>
                  <label style={labelStyle}>English</label>
                  <textarea rows={2} value={editQ.question_en} onChange={e=>setEditQ({...editQ,question_en:e.target.value})} style={{...inputStyle,resize:'vertical'}}/>
                  <label style={labelStyle}>Hindi</label>
                  <textarea rows={2} value={editQ.question_hi} onChange={e=>setEditQ({...editQ,question_hi:e.target.value})} style={{...inputStyle,resize:'vertical'}}/>
                  <label style={labelStyle}>Options</label>
                  {editQ.options.map((opt,i)=>(
                    <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'center'}}>
                      <span style={{minWidth:24,fontWeight:600,color:C.muted}}>{opt.value}.</span>
                      <input value={opt.text} onChange={e=>{const opts=[...editQ.options];opts[i]={...opts[i],text:e.target.value};setEditQ({...editQ,options:opts});}} style={{...inputStyle,marginBottom:0,flex:1}}/>
                    </div>
                  ))}
                  <label style={labelStyle}>Correct Answer</label>
                  <select value={editQ.correct_answer} onChange={e=>setEditQ({...editQ,correct_answer:e.target.value})} style={inputStyle}>
                    {editQ.options.map(o=><option key={o.value} value={o.value}>{o.value}. {o.text}</option>)}
                  </select>
                  <div style={{display:'flex',gap:10,marginTop:8}}>
                    <button onClick={handleUpdateQuestion} disabled={loading} style={btnPrimary}><FiSave/> Save</button>
                    <button onClick={()=>setEditQ(null)} style={btnSecondary}><FiX/> Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {status.message && !editExam && !editQ && (
              <div style={{marginBottom:16}}><Toast status={status}/></div>
            )}

            {exams.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px 20px',color:C.muted,border:`2px dashed ${C.border}`,borderRadius:12,background:C.white}}>
                <FiDatabase size={40} style={{marginBottom:12,color:C.border}}/>
                <p style={{margin:0,fontWeight:600}}>No exams found.</p>
                <p style={{margin:'6px 0 0 0',fontSize:'0.82rem'}}>Use Smart Import to add your first exam.</p>
              </div>
            ) : exams.map(exam => {
              const isOpen = expanded[exam.id];
              return (
                <div key={exam.id} style={{background:C.white,borderRadius:12,marginBottom:16,border:`1px solid ${C.border}`,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',borderBottom:isOpen?`1px solid ${C.border}`:'none',background:'linear-gradient(90deg,#EFF6FF,#fff)'}}>
                    <HiOutlineAcademicCap size={20} color={C.navy}/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{margin:0,fontWeight:700,color:C.navyD,fontSize:'0.95rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{exam.title}</p>
                      <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
                        <Chip label={exam.exam_date} icon={<FiClock size={10}/>} color={C.navy} bg={C.infoL}/>
                        <Chip label={`${exam.mquestions?.length??0} Questions`} icon={<FiFileText size={10}/>} color={C.green} bg="#D1FAE5"/>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:6,flexShrink:0}}>
                      <IconBtn icon={<FiEdit2 size={14}/>} title="Edit" color={C.navy} onClick={()=>setEditExam({id:exam.id,title:exam.title,exam_date:exam.exam_date})}/>
                      <IconBtn icon={<FiTrash2 size={14}/>} title="Delete" color={C.danger} onClick={()=>handleDeleteExam(exam.id,exam.title)}/>
                      <IconBtn icon={isOpen?<FiChevronUp size={14}/>:<FiChevronDown size={14}/>} title="Expand" color={C.muted} onClick={()=>setExpanded(p=>({...p,[exam.id]:!p[exam.id]}))}/>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{padding:'16px 20px'}}>
                      {(exam.mquestions??[]).length===0 ? (
                        <p style={{color:C.muted,fontSize:'0.82rem',margin:0}}>No questions.</p>
                      ) : exam.mquestions.map(q => (
                        <div key={q.id} style={{marginBottom:14,padding:'12px 14px',border:`1px solid ${C.border}`,borderRadius:10,background:'#FAFBFC'}}>
                          <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                            <span style={{minWidth:26,height:26,background:C.navy,color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:700,flexShrink:0}}>{q.question_number}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{margin:'0 0 4px 0',fontWeight:600,color:C.text,fontSize:'0.86rem'}}>{q.question_en}</p>
                              {q.question_hi&&<p style={{margin:'0 0 6px 0',color:C.muted,fontSize:'0.8rem',fontStyle:'italic'}}>{q.question_hi}</p>}
                              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                                <DiffChip level={diffMap[q.id]}/>
                                <Chip label={`Ans: ${q.correct_answer}`} color={C.green} bg="#D1FAE5" icon={<FiCheckCircle size={10}/>}/>
                              </div>
                              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                                {q.options?.map((opt,oi)=>{
                                  const correct=String(q.correct_answer)===String(opt.value);
                                  return (
                                    <div key={oi} style={{padding:'5px 9px',borderRadius:6,fontSize:'0.78rem',border:correct?`1.5px solid ${C.green}`:`1px solid ${C.border}`,background:correct?'#D1FAE5':'#F9FAFB',color:correct?C.green:C.text,fontWeight:correct?700:400}}>
                                      <span style={{fontWeight:700,marginRight:3}}>{opt.value}.</span>{opt.text}
                                      {correct&&<FiCheckCircle style={{marginLeft:4,verticalAlign:'middle'}}/>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div style={{display:'flex',gap:5,flexShrink:0}}>
                              <IconBtn icon={<FiEdit2 size={13}/>} title="Edit" color={C.navy} onClick={()=>setEditQ({...q})}/>
                              <IconBtn icon={<FiTrash2 size={13}/>} title="Delete" color={C.danger} onClick={()=>handleDeleteQuestion(q.id)}/>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer style={{marginTop:40,padding:'16px 24px',textAlign:'center',borderTop:`1px solid ${C.border}`,color:C.muted,fontSize:'0.75rem'}}>
        Exam Portal · Supabase Realtime · TensorFlow.js · Next.js · Smart Import Engine
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        textarea::placeholder { color: #9CA3AF; }
      `}</style>
    </div>
  );
}
 