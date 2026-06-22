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
  FiDownload, FiPlus, FiCode, FiCopy, FiInfo,
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
  addQuestionToExamAction,
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

interface ParsedQ {
  question_number : number;
  question_en     : string;
  question_hi     : string;
  options         : Option[];
  correct_answer  : string;
  difficulty?     : string;
  detectionMethod?: string;
}

// ── Professional Government Color Palette ──────────────────────────────────────
const C = {
  // Primary - Deep Navy (Government Official)
  primary: '#1a365d',
  primaryDark: '#0f2847',
  primaryLight: '#2d5a8c',
  
  // Accent - Saffron (Indian Government)
  accent: '#d4691a',
  accentLight: '#f59e0b',
  
  // Secondary - Deep Green
  secondary: '#166534',
  secondaryLight: '#16a34a',
  
  // Neutrals - Professional Gray
  white: '#ffffff',
  offWhite: '#f8fafc',
  lightGray: '#f1f5f9',
  gray: '#e2e8f0',
  mediumGray: '#94a3b8',
  darkGray: '#475569',
  textDark: '#1e293b',
  textMuted: '#64748b',
  
  // Status colors
  success: '#10b981',
  successBg: '#d1fae5',
  error: '#ef4444',
  errorBg: '#fee2e2',
  warning: '#f59e0b',
  warningBg: '#fef3c7',
  info: '#3b82f6',
  infoBg: '#dbeafe',
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
//  DOCX Download — client-side generation
// ══════════════════════════════════════════════════════════════════════════════
async function downloadExamAsDocx(exam: Exam): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
    LevelFormat,
  } = await import('docx');

  const border  = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: border, bottom: border, left: border, right: border };

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };

  const children: any[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: exam.title.toUpperCase(),
          bold: true, size: 36, font: 'Calibri', color: '1a365d',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `Exam Date: ${exam.exam_date}  |  Total Questions: ${exam.mquestions?.length ?? 0}`,
          size: 22, font: 'Calibri', color: '64748b',
        }),
      ],
    }),
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1a365d', space: 1 } },
      spacing: { after: 280 },
      children: [new TextRun({ text: '' })],
    })
  );

  const questions = [...(exam.mquestions ?? [])].sort(
    (a, b) => a.question_number - b.question_number
  );

  questions.forEach((q, qi) => {
    children.push(
      new Paragraph({
        spacing: { before: qi === 0 ? 0 : 220, after: 80 },
        children: [
          new TextRun({
            text: `Q${q.question_number}. `,
            bold: true, size: 24, font: 'Calibri', color: '1a365d',
          }),
          new TextRun({
            text: q.question_en,
            bold: true, size: 24, font: 'Calibri', color: '1e293b',
          }),
        ],
      })
    );

    if (q.question_hi) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: q.question_hi,
              italics: true, size: 22, font: 'Calibri', color: '64748b',
            }),
          ],
        })
      );
    }

    const opts = q.options ?? [];
    const rows: any[] = [];
    for (let i = 0; i < opts.length; i += 2) {
      const leftOpt  = opts[i];
      const rightOpt = opts[i + 1];
      const leftCorr  = String(q.correct_answer) === String(leftOpt?.value);
      const rightCorr = rightOpt && String(q.correct_answer) === String(rightOpt?.value);

      const makeCell = (opt: Option | undefined, isCorrect: boolean) => {
        if (!opt) {
          return new TableCell({
            borders: noBorder,
            width: { size: 4680, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: '' })] })],
          });
        }
        return new TableCell({
          borders: noBorder,
          width: { size: 4680, type: WidthType.DXA },
          shading: isCorrect ? { fill: 'd1fae5', type: ShadingType.CLEAR } : undefined,
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `(${opt.value}) ${opt.text}${isCorrect ? ' ✓' : ''}`,
                  size: 22,
                  font: 'Calibri',
                  bold: isCorrect,
                  color: isCorrect ? '166534' : '475569',
                }),
              ],
            }),
          ],
        });
      };

      rows.push(
        new TableRow({
          children: [
            makeCell(leftOpt, leftCorr),
            makeCell(rightOpt, rightCorr ?? false),
          ],
        })
      );
    }

    if (rows.length > 0) {
      children.push(
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows,
        })
      );
    }

    const correctOpt = opts.find(o => String(o.value) === String(q.correct_answer));
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 60 },
        children: [
          new TextRun({
            text: `Answer: (${q.correct_answer}) ${correctOpt?.text ?? ''}`,
            size: 20, font: 'Calibri', bold: true, color: '166534',
          }),
        ],
      })
    );

    if (qi < questions.length - 1) {
      children.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'e2e8f0', space: 1 } },
          spacing: { before: 60, after: 60 },
          children: [new TextRun({ text: '' })],
        })
      );
    }
  });

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'd4691a', space: 1 } },
      children: [
        new TextRun({
          text: 'Generated by Competitive Exam Portal  |  Government Examination Database Management System',
          size: 18, font: 'Calibri', color: '94a3b8', italics: true,
        }),
      ],
    })
  );

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Calibri', size: 24 } } },
    },
    numbering: { config: [] },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const bytes  = new Uint8Array(buffer);
  const blob   = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `${exam.title.replace(/[^a-z0-9]/gi, '_')}_exam.docx`;
  link.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════════════════════════
//  Smart Import parser (unchanged)
// ══════════════════════════════════════════════════════════════════════════════
function parseSmartText(raw: string): ParsedQ[] {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const qs: ParsedQ[] = [];
  let cur: Partial<ParsedQ> | null = null;
  let optCount = 0;

  const flushCurrent = () => {
    if (!cur || !cur.question_en || !cur.options?.length) return;
    if (!cur.correct_answer || cur.correct_answer === '0') {
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

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

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

    const optMatch = line.match(/^[\(]?([A-Da-d1-4])[\)\.\s]\s*(.+)/);
    if (optMatch && cur) {
      optCount++;
      let optText = optMatch[2].trim();
      const val   = String(optCount);
      let isCorrect = false;
      let method    = 'manual';

      if (/^\*\*(.+)\*\*$/.test(optText)) {
        optText   = optText.replace(/^\*\*|\*\*$/g, '').trim();
        isCorrect = true;
        method    = 'asterisk';
      } else if (/^\[(.+)\]$/.test(optText)) {
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

    const ansMatch = line.match(/^(?:Ans(?:wer)?|Correct(?:\s+Answer)?)\s*[:\-=]\s*([A-Da-d1-4])/i);
    if (ansMatch && cur) {
      const raw2 = ansMatch[1].toUpperCase();
      const map: Record<string, string> = { A:'1', B:'2', C:'3', D:'4' };
      cur.correct_answer  = map[raw2] ?? raw2;
      cur.detectionMethod = 'explicit-ans-line';
      continue;
    }

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
    const val  = String(optCount);
    let optTxt = text.replace(/^[\(]?[A-Da-d1-4][\)\.\s]\s*/, '').trim();
    let isCorrect = false;
    let method    = 'none';

    const boldEl = el.querySelector('strong, b');
    if (boldEl && boldEl.textContent?.trim()) { isCorrect = true; method = 'bold'; }

    const allSpans = Array.from(el.querySelectorAll('span'));
    if (!isCorrect && allSpans.some(s =>
      s.style.fontWeight === 'bold' || parseInt(s.style.fontWeight) >= 600)) {
      isCorrect = true; method = 'bold';
    }

    if (!isCorrect && allSpans.some(s => {
      const bg = s.style.backgroundColor;
      return bg && bg !== 'transparent' && bg !== 'rgba(0,0,0,0)' && bg !== 'white' && bg !== '#ffffff';
    })) { isCorrect = true; method = 'highlight'; }

    if (!isCorrect) {
      if (/^\*\*(.+)\*\*$/.test(optTxt)) {
        optTxt = optTxt.replace(/^\*\*|\*\*$/g, '').trim();
        isCorrect = true; method = 'asterisk';
      } else if (/^\[(.+)\]$/.test(optTxt)) {
        optTxt = optTxt.replace(/^\[|\]$/g, '').trim();
        isCorrect = true; method = 'bracket';
      }
    }

    cur.options!.push({ value: val, text: optTxt || text });
    if (isCorrect) { cur.correct_answer = val; cur.detectionMethod = method; }
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
//  Professional Badge/Chip Component
// ══════════════════════════════════════════════════════════════════════════════
const Chip = ({
  label, color = C.primary, bg = C.infoBg, icon,
}: { label: string; color?: string; bg?: string; icon?: React.ReactNode }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:5,
    padding:'5px 12px', borderRadius:'6px',
    backgroundColor:bg, color, fontSize:'0.75rem',
    fontWeight:600, letterSpacing:'0.03em', border:`1px solid ${color}20`,
    whiteSpace:'nowrap', transition:'all 0.2s ease',
  }}>
    {icon}{label}
  </span>
);

const DiffChip = ({ level }: { level?: string }) => {
  const map: Record<string,{bg:string;color:string}> = {
    Easy  :{bg:'#dbeafe',color:'#0369a1'},
    Medium:{bg:'#fef3c7',color:'#92400e'},
    Hard  :{bg:'#fee2e2',color:'#991b1b'},
    'N/A' :{bg:'#f1f5f9',color:'#475569'},
  };
  const s = map[level ?? 'N/A'] ?? map['N/A'];
  return <Chip label={level ?? 'N/A'} color={s.color} bg={s.bg} />;
};

const DetectBadge = ({ method }: { method?: string }) => {
  const cfg: Record<string,{label:string;bg:string;color:string}> = {
    bold          :{label:'Bold',           bg:'#f3e8ff',color:'#7c3aed'},
    highlight     :{label:'Highlight',     bg:'#fef3c7',color:'#d97706'},
    asterisk      :{label:'Marked',        bg:'#e0f2fe',color:'#0284c7'},
    bracket       :{label:'Bracketed',     bg:'#dcfce7',color:'#16a34a'},
    'explicit-ans-line':{label:'Answer',   bg:'#fff7ed',color:'#d4691a'},
    'caps-fallback':{label:'Caps',         bg:'#fee2e2',color:'#dc2626'},
    fallback      :{label:'Default',       bg:'#fee2e2',color:'#dc2626'},
    none          :{label:'Undetected',    bg:'#f1f5f9',color:'#64748b'},
    manual        :{label:'Manual',        bg:'#d1fae5',color:'#166534'},
  };
  const c = cfg[method ?? 'manual'] ?? cfg.manual;
  return <Chip label={c.label} color={c.color} bg={c.bg}/>;
};

const Toast = ({ status }: { status: Status }) => {
  if (!status.message) return null;
  const cfg = {
    success : { bg:C.successBg, color:C.success, icon:<FiCheckCircle/> },
    error   : { bg:C.errorBg,  color:C.error,  icon:<FiAlertCircle/> },
    info    : { bg:C.infoBg,   color:C.info,   icon:<FiZap/>         },
    ''      : { bg:C.lightGray, color:C.textMuted, icon:<FiZap/>      },
  };
  const s = cfg[status.type] ?? cfg[''];
  return (
    <div style={{
      padding:'12px 16px',borderRadius:'8px',background:s.bg,color:s.color,
      display:'flex',alignItems:'center',gap:10,fontSize:'0.82rem',fontWeight:600,
      border:`1px solid ${s.color}30`, boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {s.icon} {status.message}
    </div>
  );
};

const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: any; accent: string }) => (
  <div style={{
    background:C.white, borderRadius:'12px', padding:'20px',
    border:`1px solid ${C.gray}`, boxShadow:'0 2px 12px rgba(26,54,93,0.08)',
    display:'flex', alignItems:'center', gap:16, minWidth:0,
    transition:'all 0.3s ease',
    position:'relative',
    overflow:'hidden',
  }}>
    <div style={{
      position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px',
      borderRadius:'50%', background:`${accent}10`, zIndex:0
    }}/>
    <div style={{width:48, height:48, borderRadius:'10px', background:`${accent}15`, color:accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0, zIndex:1}}>
      {icon}
    </div>
    <div style={{minWidth:0, flex:1, zIndex:1}}>
      <p style={{margin:0, fontSize:'0.7rem', color:C.textMuted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em'}}>{label}</p>
      <p style={{margin:'4px 0 0 0', fontSize:'1.4rem', fontWeight:800, color:C.textDark, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{String(value).slice(0, 40)}</p>
    </div>
  </div>
);

const IconBtn = ({icon,title,color,onClick,disabled=false}:{icon:React.ReactNode;title:string;color:string;onClick:()=>void;disabled?:boolean}) => (
  <button onClick={onClick} title={title} disabled={disabled} style={{
    width:36,height:36,borderRadius:'8px',border:`1.5px solid ${color}30`,
    background:`${color}08`,color,cursor:disabled?'not-allowed':'pointer',
    display:'flex',alignItems:'center',justifyContent:'center',
    opacity:disabled?0.5:1,flexShrink:0, transition:'all 0.2s ease',
  }}>{icon}</button>
);

// Shared form styles - Professional
const labelStyle:React.CSSProperties={display:'block',marginBottom:6,fontSize:'0.78rem',fontWeight:700,color:C.textDark, textTransform:'uppercase', letterSpacing:'0.05em'};
const inputStyle:React.CSSProperties={width:'100%',padding:'10px 14px',borderRadius:'8px',border:`1.5px solid ${C.gray}`,marginBottom:14,fontSize:'0.85rem',color:C.textDark,background:C.offWhite,boxSizing:'border-box' as any, transition:'all 0.2s ease'};
const btnPrimary:React.CSSProperties={flex:1,padding:'11px',background:`linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,color:'#fff',border:'none',borderRadius:'8px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:'0.87rem', transition:'all 0.3s ease', boxShadow:'0 4px 12px rgba(26,54,93,0.25)'};
const btnSecondary:React.CSSProperties={flex:1,padding:'11px',background:C.lightGray,color:C.textDark,border:`1.5px solid ${C.gray}`,borderRadius:'8px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:'0.87rem', transition:'all 0.2s ease'};

// ══════════════════════════════════════════════════════════════════════════════
//  Question Form Component
// ══════════════════════════════════════════════════════════════════════════════
interface QuestionFormData {
  question_en: string;
  question_hi: string;
  options: Option[];
  correct_answer: string;
}

const emptyQuestion = (): QuestionFormData => ({
  question_en: '',
  question_hi: '',
  options: [
    { value: '1', text: '' },
    { value: '2', text: '' },
    { value: '3', text: '' },
    { value: '4', text: '' },
  ],
  correct_answer: '1',
});

function QuestionForm({
  data,
  onChange,
}: {
  data: QuestionFormData;
  onChange: (d: QuestionFormData) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>Question (English) *</label>
      <textarea rows={2} value={data.question_en}
        onChange={e => onChange({ ...data, question_en: e.target.value })}
        style={{ ...inputStyle, resize: 'vertical', fontFamily:'inherit' }}
        placeholder="Enter question in English"
      />
      <label style={labelStyle}>Question (Hindi / Optional)</label>
      <textarea rows={2} value={data.question_hi}
        onChange={e => onChange({ ...data, question_hi: e.target.value })}
        style={{ ...inputStyle, resize: 'vertical', fontFamily:'inherit' }}
        placeholder="प्रश्न हिंदी में (वैकल्पिक)"
      />
      <label style={labelStyle}>Options *</label>
      {data.options.map((opt, i) => (
        <div key={i} className="option-row" style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            minWidth: 32, height: 32, borderRadius:'50%',
            background: data.correct_answer === opt.value ? `linear-gradient(135deg, ${C.secondary}, ${C.secondaryLight})` : C.primary,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, boxShadow:'0 2px 8px rgba(0,0,0,0.15)'
          }}>{opt.value}</span>
          <input value={opt.text}
            onChange={e => {
              const opts = [...data.options];
              opts[i] = { ...opts[i], text: e.target.value };
              onChange({ ...data, options: opts });
            }}
            style={{ ...inputStyle, marginBottom: 0, flex: '1 1 140px', minWidth: 0 }}
            placeholder={`Option ${opt.value}`}
          />
          <button
            onClick={() => onChange({ ...data, correct_answer: opt.value })}
            title="Mark as correct"
            style={{
              padding: '6px 12px', borderRadius: '8px', border: `1.5px solid ${data.correct_answer === opt.value ? C.secondary : C.gray}`,
              background: data.correct_answer === opt.value ? C.successBg : C.offWhite,
              color: data.correct_answer === opt.value ? C.secondary : C.textMuted,
              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
              minWidth: 90, textAlign: 'center', transition:'all 0.2s ease'
            }}
          >{data.correct_answer === opt.value ? '✓ Correct' : 'Set ✓'}</button>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  Smart Import Panel
// ══════════════════════════════════════════════════════════════════════════════
function SmartImportPanel({
  onUploaded, toast,
}: {
  onUploaded: () => void;
  toast: (msg: string, type: Status['type']) => void;
}) {
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
Answer: C`;

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

  const handleDocFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast('Parsing document…', 'info');
    try {
      const buf    = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: buf });
      const data   = parseDocxHtmlSmart(result.value, file.name);
      if (!examTitle) setExamTitle(data.examTitle);
      const scored = await Promise.all(
        data.questions.map(async q => ({
          ...q, difficulty: await scoreQuestionDifficulty(q.question_en),
        }))
      );
      setParsed(scored);
      setPreviewOpen(true);
      toast(`Extracted ${scored.length} questions from "${file.name}"`, 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to parse document.', 'error');
    }
  };

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

  const updateParsed = (idx: number, field: keyof ParsedQ, val: string) => {
    setParsed(prev => prev.map((q, i) => i === idx ? { ...q, [field]: val } : q));
  };

  const detected = parsed.filter(q => q.correct_answer !== '0' && q.detectionMethod !== 'fallback' && q.detectionMethod !== 'none').length;
  const missing  = parsed.filter(q => q.detectionMethod === 'none').length;

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:24,background:C.lightGray,borderRadius:'10px',padding:6,width:'fit-content'}}>
        {(['text','file'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:'10px 20px',border:'none',cursor:'pointer',borderRadius:'8px',
            background: mode===m ? C.primary : 'transparent',
            color: mode===m ? '#fff' : C.textMuted,
            fontWeight:700,fontSize:'0.84rem',
            display:'flex',alignItems:'center',gap:8,transition:'all 0.2s',
          }}>
            {m==='text' ? <><FiType size={14}/>Text Input</> : <><FiUploadCloud size={14}/>Document</>}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:28,alignItems:'start'}}>
        {/* LEFT: Input */}
        <div>
          <div style={{background:C.white,borderRadius:'12px',padding:24,border:`1px solid ${C.gray}`,boxShadow:'0 2px 12px rgba(26,54,93,0.08)'}}>
            {mode === 'text' ? (
              <>
                <h3 style={{margin:'0 0 6px 0',color:C.textDark,fontSize:'1rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
                  <FiType color={C.accent}/> Paste Questions
                </h3>
                <p style={{margin:'0 0 16px 0',fontSize:'0.78rem',color:C.textMuted}}>
                  Answers auto-detected from <strong>**bold**</strong>, <strong>[brackets]</strong>, or <code>Answer: B</code> lines.
                </p>
                <textarea
                  rows={16} value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={PLACEHOLDER}
                  style={{
                    width:'100%',padding:14,fontFamily:'inherit',fontSize:'0.82rem',
                    borderRadius:'10px',border:`1.5px solid ${C.gray}`,resize:'vertical',
                    background:C.offWhite,color:C.textDark,boxSizing:'border-box',lineHeight:1.6,
                    transition:'all 0.2s ease'
                  }}
                />
              </>
            ) : (
              <>
                <h3 style={{margin:'0 0 6px 0',color:C.textDark,fontSize:'1rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
                  <HiOutlineDocumentText color={C.accent}/> Upload Document
                </h3>
                <p style={{margin:'0 0 16px 0',fontSize:'0.78rem',color:C.textMuted}}>
                  Supports <strong>.docx</strong> (Word) and Google Docs exported as .docx.
                </p>
                <label style={{
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  border:`2px dashed ${C.accent}`,borderRadius:'12px',padding:'40px 20px',
                  textAlign:'center',cursor:'pointer',background:'#fff8f3',marginBottom:16,gap:10,
                  transition:'all 0.2s ease'
                }}>
                  <FiUploadCloud size={40} color={C.accent}/>
                  <span style={{fontWeight:700,color:C.accent,fontSize:'0.92rem'}}>Click to choose .docx file</span>
                  <span style={{fontSize:'0.75rem',color:C.textMuted,lineHeight:1.5}}>
                    Correct answer = <b>bold</b> or highlighted option
                  </span>
                  <input type="file" ref={fileRef}
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleDocFile} style={{display:'none'}}/>
                </label>
                <div style={{background:C.successBg,borderRadius:'10px',padding:14,fontSize:'0.76rem',color:C.secondary,lineHeight:1.8,borderLeft:`4px solid ${C.secondary}`}}>
                  <strong>Format Guide:</strong><br/>
                  • Number questions: <code>1.</code> or <code>Q1.</code><br/>
                  • Options as: <code>A.</code> <code>B.</code> <code>C.</code> <code>D.</code><br/>
                  • <strong>Bold</strong> the correct option in Word<br/>
                  • Separate EN / HI with " / "
                </div>
              </>
            )}
            <div style={{marginTop:20,paddingTop:18,borderTop:`1px solid ${C.gray}`}}>
              <label style={labelStyle}>Exam Title *</label>
              <input value={examTitle} onChange={e => setExamTitle(e.target.value)}
                placeholder="e.g. SSC CGL 2024 – General Awareness" style={inputStyle}/>
              <label style={labelStyle}>Exam Date</label>
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                style={{...inputStyle,marginBottom:0}}/>
            </div>
          </div>

          {parsed.length > 0 && (
            <div style={{marginTop:14,background:C.white,borderRadius:'10px',padding:'14px 16px',border:`1px solid ${C.gray}`,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
              <span style={{fontSize:'0.76rem',fontWeight:700,color:C.textMuted}}>STATUS:</span>
              <Chip label={`${parsed.length} questions`} color={C.primary} bg={C.infoBg} icon={<FiList size={11}/>}/>
              <Chip label={`${detected} detected`} color={C.secondary} bg={C.successBg} icon={<FiCheckCircle size={11}/>}/>
              {missing > 0 && <Chip label={`${missing} missing`} color={C.error} bg={C.errorBg} icon={<FiAlertCircle size={11}/>}/>}
              {tfScoring && <Chip label="Scoring…" color={C.accent} bg='#fff7ed' icon={<FiCpu size={11}/>}/>}
            </div>
          )}

          <button onClick={handleUpload} disabled={loading || !parsed.length || !examTitle.trim()} style={{
            marginTop:16,width:'100%',padding:'13px',
            background: (loading || !parsed.length || !examTitle.trim()) ? C.mediumGray : `linear-gradient(135deg,${C.accent},#e07c22)`,
            color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,
            cursor:(loading || !parsed.length || !examTitle.trim()) ? 'not-allowed' : 'pointer',
            fontSize:'0.92rem',letterSpacing:'0.03em',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            boxShadow:'0 4px 14px rgba(212,105,26,0.3)',
            transition:'all 0.3s ease'
          }}>
            {loading ? <><FiRefreshCw style={{animation:'spin 1s linear infinite'}}/> Uploading…</>
              : <><FiSend/> Upload {parsed.length} Questions</>}
          </button>
        </div>

        {/* RIGHT: Preview */}
        <div>
          <div style={{background:C.white,borderRadius:'12px',border:`1px solid ${C.gray}`,boxShadow:'0 2px 12px rgba(26,54,93,0.08)',overflow:'hidden'}}>
            <div style={{padding:'14px 18px',background:`linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{color:'#fff',fontWeight:700,fontSize:'0.88rem',display:'flex',alignItems:'center',gap:8}}>
                <FiEye/> Live Preview
                {tfScoring && <span style={{fontSize:'0.72rem',color:'#a5c4ea',fontWeight:400}}>· Scoring…</span>}
              </span>
              <button onClick={() => setPreviewOpen(p => !p)} style={{background:'none',border:'none',color:'#a5c4ea',cursor:'pointer',fontSize:18}}>
                {previewOpen ? <FiChevronUp/> : <FiChevronDown/>}
              </button>
            </div>
            {previewOpen && (
              <div style={{maxHeight:'62vh',overflowY:'auto',padding:'16px 16px'}}>
                {parsed.length === 0 ? (
                  <div style={{textAlign:'center',padding:'50px 16px',color:C.textMuted}}>
                    <HiOutlineLightBulb size={36} style={{marginBottom:10,color:C.gray}}/>
                    <p style={{margin:0,fontSize:'0.85rem',fontWeight:600}}>
                      {mode==='text' ? 'Start typing to see preview' : 'Upload document to parse questions'}
                    </p>
                  </div>
                ) : (
                  parsed.map((q, qi) => (
                    <div key={qi} style={{marginBottom:16,padding:14,borderRadius:'10px',border:`1px solid ${C.gray}`,background:C.offWhite}}>
                      <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
                        <span style={{minWidth:30,height:30,background:C.primary,color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:700,flexShrink:0}}>
                          {q.question_number}
                        </span>
                        <div style={{flex:1}}>
                          <textarea rows={2} value={q.question_en}
                            onChange={e => updateParsed(qi, 'question_en', e.target.value)}
                            style={{width:'100%',border:`1px solid ${C.gray}`,borderRadius:'8px',padding:'8px 10px',fontSize:'0.82rem',color:C.textDark,background:'#fff',resize:'vertical',fontFamily:'inherit',boxSizing:'border-box'}}/>
                          {q.question_hi && (
                            <p style={{margin:'4px 0 0 0',fontSize:'0.76rem',color:C.textMuted,fontStyle:'italic'}}>{q.question_hi}</p>
                          )}
                        </div>
                      </div>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                        <DetectBadge method={q.detectionMethod}/>
                        <DiffChip level={q.difficulty}/>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                        {q.options.map((opt, oi) => {
                          const correct = String(q.correct_answer) === String(opt.value);
                          return (
                            <div key={oi} onClick={() => updateParsed(qi, 'correct_answer', opt.value)}
                              title="Click to mark correct"
                              style={{padding:'6px 10px',borderRadius:'8px',fontSize:'0.78rem',cursor:'pointer',
                                border: correct ? `2px solid ${C.secondary}` : `1px solid ${C.gray}`,
                                background: correct ? C.successBg : '#fff',
                                color: correct ? C.secondary : C.textDark,fontWeight: correct ? 700 : 500,transition:'all 0.15s'}}>
                              <span style={{fontWeight:700,marginRight:4}}>{opt.value}.</span>
                              {opt.text}
                            </div>
                          );
                        })}
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
//  JSON Converter Panel
// ══════════════════════════════════════════════════════════════════════════════
const JSON_FORMATS = [
  {
    id: 'standard',
    label: 'Standard Format',
    badge: 'Recommended',
    badgeColor: C.secondary,
    badgeBg: C.successBg,
    example: JSON.stringify({
      examTitle: "SSC CGL 2024 – General Awareness",
      examDate: "2024-06-15",
      questions: [
        {
          question_number: 1,
          question_en: "What is the capital of India?",
          question_hi: "भारत की राजधानी क्या है?",
          options: [
            { value: "1", text: "Mumbai" },
            { value: "2", text: "New Delhi" },
            { value: "3", text: "Kolkata" },
            { value: "4", text: "Chennai" },
          ],
          correct_answer: "2",
        },
      ],
    }, null, 2),
  },
  {
    id: 'legacy',
    label: 'Legacy Array Format',
    badge: 'Supported',
    badgeColor: '#7c3aed',
    badgeBg: '#f3e8ff',
    example: JSON.stringify([
      {
        title: "My Exam",
        questions: [
          {
            question_number: 1,
            question: "What is the capital of India?",
            options: ["Mumbai", "**New Delhi**", "Kolkata", "Chennai"],
            correct_answer: "2",
          },
        ],
      },
    ], null, 2),
  },
  {
    id: 'batch',
    label: 'Batch Upload Format',
    badge: 'Multiple Exams',
    badgeColor: C.accent,
    badgeBg: '#fff7ed',
    example: JSON.stringify([
      {
        title: "Exam 1 – History",
        exam_date: "2024-06-01",
        questions: [
          {
            question_number: 1,
            question_en: "Who was the first Prime Minister?",
            question_hi: "भारत के पहले प्रधानमंत्री कौन थे?",
            options: [
              { value: "1", text: "Mahatma Gandhi" },
              { value: "2", text: "Jawaharlal Nehru" },
            ],
            correct_answer: "2",
          },
        ],
      },
    ], null, 2),
  },
];

function JsonConverterPanel({
  onUploaded,
  toast,
}: {
  onUploaded: () => void;
  toast: (msg: string, type: Status['type']) => void;
}) {
  const [selectedFormat, setSelectedFormat] = useState('standard');
  const [rawJson,        setRawJson]        = useState('');
  const [loading,        setLoading]        = useState(false);
  const [copied,         setCopied]         = useState<string|null>(null);
  const [activeFormatTab, setActiveFormatTab] = useState<'formats'|'upload'>('formats');
  const fileRef = useRef<HTMLInputElement>(null);

  const fmt = JSON_FORMATS.find(f => f.id === selectedFormat) ?? JSON_FORMATS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast('Reading file…', 'info');
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        setRawJson(text);
        setActiveFormatTab('upload');
        toast(`Loaded: "${file.name}"`, 'success');
      } else if (file.name.endsWith('.docx')) {
        const buf    = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buf });
        const parsed = parseDocxHtmlSmart(result.value, file.name);
        setRawJson(JSON.stringify(parsed, null, 2));
        setActiveFormatTab('upload');
        toast(`Extracted ${parsed.questions.length} questions`, 'success');
      } else throw new Error('Only .json and .docx supported.');
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const handleUseTemplate = () => {
    setRawJson(fmt.example);
    setActiveFormatTab('upload');
    toast('Template loaded!', 'info');
  };

  const handleSubmit = async () => {
    if (!rawJson.trim()) { toast('Nothing to upload.', 'error'); return; }
    setLoading(true);
    toast('Uploading…', 'info');
    try {
      const parsed = JSON.parse(rawJson);
      let payload: any;

      if (parsed.examTitle && parsed.questions) {
        payload = {
          title: parsed.examTitle,
          exam_date: parsed.examDate || new Date().toISOString().split('T')[0],
          questions: parsed.questions.map((q: any) => ({
            question_number: q.question_number,
            question_en: q.question_en || q.question?.split(/\s+\/\s+/)[0] || '',
            question_hi: q.question_hi || q.question?.split(/\s+\/\s+/)[1] || '',
            options: q.options,
            correct_answer: String(q.correct_answer),
          })),
        };
      }
      else if (Array.isArray(parsed)) {
        const first = parsed[0];
        if (first?.title && first?.questions) {
          payload = {
            title: first.title,
            exam_date: first.exam_date || new Date().toISOString().split('T')[0],
            questions: first.questions.map((q: any, i: number) => {
              let ans = '1';
              const opts = Array.isArray(q.options)
                ? q.options.map((o: any, idx: number) => {
                    if (typeof o === 'string') {
                      const clean = o.replace(/\*\*/g, '');
                      if (o.startsWith('**') && o.endsWith('**')) ans = String(idx + 1);
                      return { value: String(idx + 1), text: clean };
                    }
                    return o;
                  })
                : [];
              return {
                question_number: q.question_number || i + 1,
                question_en: q.question_en || q.question?.split(/\s+\/\s+/)[0] || q.question || '',
                question_hi: q.question_hi || q.question?.split(/\s+\/\s+/)[1] || '',
                options: opts,
                correct_answer: q.correct_answer ? String(q.correct_answer) : ans,
              };
            }),
          };
        } else {
          payload = {
            title: 'IMPORTED BATCH',
            exam_date: new Date().toISOString().split('T')[0],
            questions: parsed.map((item: any, i: number) => {
              let ans = '1';
              const opts = (item.options || []).map((o: any, idx: number) => {
                if (typeof o === 'string') {
                  const clean = o.replace(/\*\*/g, '');
                  if (o.startsWith('**') && o.endsWith('**')) ans = String(idx + 1);
                  return { value: String(idx + 1), text: clean };
                }
                return o;
              });
              return {
                question_number: item.question_number || i + 1,
                question_en: item.question_en || item.question?.split(/\s+\/\s+/)[0] || item.question || '',
                question_hi: item.question_hi || item.question?.split(/\s+\/\s+/)[1] || '',
                options: opts,
                correct_answer: item.correct_answer ? String(item.correct_answer) : ans,
              };
            }),
          };
        }
      } else throw new Error('Unrecognised JSON structure.');

      const res = await uploadExamAction(payload);
      if (!res.success) throw new Error(res.error);
      toast(`Saved! ${res.data?.question_count} questions uploaded.`, 'success');
      setRawJson('');
      if (fileRef.current) fileRef.current.value = '';
      onUploaded();
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{maxWidth:950}}>
      <div style={{display:'flex',gap:8,marginBottom:24,background:C.lightGray,borderRadius:'10px',padding:6,width:'fit-content'}}>
        {([
          { id:'formats', label:'Format Guide', icon:<FiInfo size={14}/> },
          { id:'upload',  label:'Upload JSON',  icon:<FiUploadCloud size={14}/> },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setActiveFormatTab(t.id)} style={{
            padding:'10px 20px',border:'none',cursor:'pointer',borderRadius:'8px',
            background: activeFormatTab===t.id ? C.primary : 'transparent',
            color: activeFormatTab===t.id ? '#fff' : C.textMuted,
            fontWeight:700,fontSize:'0.84rem',display:'flex',alignItems:'center',gap:8,
            transition:'all 0.2s ease'
          }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeFormatTab === 'formats' && (
        <div>
          <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
            {JSON_FORMATS.map(f => (
              <button key={f.id} onClick={() => setSelectedFormat(f.id)} style={{
                padding:'10px 18px',border:`2px solid ${selectedFormat===f.id ? C.primary : C.gray}`,
                borderRadius:'8px',background: selectedFormat===f.id ? C.infoBg : C.white,
                color: selectedFormat===f.id ? C.primary : C.textDark,
                fontWeight:700,fontSize:'0.84rem',cursor:'pointer',
                display:'flex',alignItems:'center',gap:8,
                transition:'all 0.2s ease'
              }}>
                {f.label}
                <span style={{padding:'2px 8px',borderRadius:'5px',background:f.badgeBg,color:f.badgeColor,fontSize:'0.66rem',fontWeight:700}}>
                  {f.badge}
                </span>
              </button>
            ))}
          </div>

          <div style={{background:C.white,borderRadius:'12px',border:`1px solid ${C.gray}`,overflow:'hidden',boxShadow:'0 2px 12px rgba(26,54,93,0.08)'}}>
            <div style={{padding:'14px 18px',background:`linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <FiCode color="#fff" size={18}/>
                <span style={{color:'#fff',fontWeight:700,fontSize:'0.88rem'}}>{fmt.label}</span>
                <Chip label={fmt.badge} color={fmt.badgeColor} bg={fmt.badgeBg}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={() => handleCopy(fmt.example, fmt.id)} style={{
                  padding:'6px 14px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.2)',
                  background:'rgba(255,255,255,0.1)',color:'#fff',cursor:'pointer',
                  fontSize:'0.78rem',display:'flex',alignItems:'center',gap:6,fontWeight:700,
                  transition:'all 0.2s ease'
                }}>
                  <FiCopy size={13}/>{copied===fmt.id ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleUseTemplate} style={{
                  padding:'6px 14px',borderRadius:'8px',border:'none',
                  background:C.accent,color:'#fff',cursor:'pointer',
                  fontSize:'0.78rem',display:'flex',alignItems:'center',gap:6,fontWeight:700,
                  transition:'all 0.2s ease'
                }}>
                  <FiSend size={13}/>Use Template
                </button>
              </div>
            </div>
            <pre style={{
              margin:0,padding:'20px',fontFamily:'monospace',fontSize:'0.75rem',
              color:C.textDark,background:C.offWhite,overflowX:'auto',
              lineHeight:1.7,maxHeight:'50vh',overflowY:'auto',
              borderRadius:'0 0 12px 12px'
            }}>
              {fmt.example}
            </pre>
          </div>

          <div style={{marginTop:18,background:'#fff8f3',borderRadius:'10px',padding:'14px 16px',border:`1px solid ${C.accent}40`,display:'flex',gap:10}}>
            <FiInfo color={C.accent} size={16} style={{flexShrink:0,marginTop:2}}/>
            <div style={{fontSize:'0.78rem',color:C.textDark,lineHeight:1.8}}>
              <strong style={{color:C.accent}}>Key Rules:</strong><br/>
              • <code>correct_answer</code> must be the option value (e.g. <code>"2"</code>)<br/>
              • Optional: <code>question_hi</code> for Hindi translations<br/>
              • Date format: <code>YYYY-MM-DD</code>
            </div>
          </div>
        </div>
      )}

      {activeFormatTab === 'upload' && (
        <div style={{background:C.white,borderRadius:'12px',padding:28,border:`1px solid ${C.gray}`,boxShadow:'0 2px 12px rgba(26,54,93,0.08)'}}>
          <h3 style={{margin:'0 0 16px 0',color:C.textDark,fontSize:'1rem',fontWeight:700,display:'flex',alignItems:'center',gap:10}}>
            <FiUploadCloud color={C.accent} size={20}/> Upload JSON or .docx
          </h3>
          <label style={{
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            border:`2px dashed ${C.accent}`,borderRadius:'12px',padding:'40px 20px',
            textAlign:'center',cursor:'pointer',background:'#fff8f3',marginBottom:18,gap:8,
            transition:'all 0.2s ease'
          }}>
            <FiUploadCloud size={40} color={C.accent}/>
            <p style={{margin:'8px 0 2px 0',fontWeight:700,color:C.accent,fontSize:'0.92rem'}}>Click to upload or drag file</p>
            <p style={{margin:0,fontSize:'0.74rem',color:C.textMuted}}>.json or .docx supported</p>
            <input type="file" ref={fileRef}
              accept=".json,.docx,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFile} style={{display:'none'}}/>
          </label>
          <div style={{textAlign:'center',color:C.textMuted,fontSize:'0.78rem',fontWeight:700,margin:'12px 0',textTransform:'uppercase',letterSpacing:'0.05em'}}>Or Paste JSON</div>
          <textarea rows={14} value={rawJson} onChange={e => setRawJson(e.target.value)}
            placeholder={`Paste exam JSON here…`}
            style={{width:'100%',padding:14,fontFamily:'monospace',fontSize:'0.78rem',borderRadius:'10px',border:`1.5px solid ${C.gray}`,resize:'vertical',background:C.offWhite,color:C.textDark,boxSizing:'border-box', transition:'all 0.2s ease'}}/>
          <div style={{display:'flex',gap:10,marginTop:16}}>
            <button onClick={handleSubmit} disabled={loading} style={{
              flex:1,padding:'13px',
              background:loading ? C.mediumGray : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
              color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,
              cursor:loading ? 'not-allowed' : 'pointer',fontSize:'0.92rem',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              boxShadow:'0 4px 14px rgba(26,54,93,0.25)',
              transition:'all 0.3s ease'
            }}>
              {loading ? <><FiRefreshCw style={{animation:'spin 1s linear infinite'}}/> Processing…</> : <><FiSave/> Parse & Upload</>}
            </button>
            {rawJson && (
              <button onClick={() => { setRawJson(''); if (fileRef.current) fileRef.current.value = ''; }} style={btnSecondary}>
                <FiX/> Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  Edit Exam Modal
// ══════════════════════════════════════════════════════════════════════════════
function EditExamModal({
  exam,
  onSave,
  onClose,
  loading,
  onQuestionAdded,
}: {
  exam: { id: string; title: string; exam_date: string };
  onSave: (title: string, date: string) => void;
  onClose: () => void;
  loading: boolean;
  onQuestionAdded?: () => void;
}) {
  const [title, setTitle]   = useState(exam.title);
  const [date,  setDate]    = useState(exam.exam_date);
  const [showAddQ, setShowAddQ] = useState(false);
  const [newQ, setNewQ]       = useState<QuestionFormData>(emptyQuestion());
  const [addingQ, setAddingQ] = useState(false);
  const [addStatus, setAddStatus] = useState<Status>({ type: '', message: '' });

  const handleAddQuestion = async () => {
    if (!newQ.question_en.trim()) { setAddStatus({ type: 'error', message: 'Question text is required.' }); return; }
    const filledOpts = newQ.options.filter(o => o.text.trim());
    if (filledOpts.length === 0) { setAddStatus({ type: 'error', message: 'Fill in at least one option.' }); return; }
    const correctStillValid = filledOpts.some(o => o.value === newQ.correct_answer);
    if (!correctStillValid) { setAddStatus({ type: 'error', message: 'Mark one filled option as the correct answer.' }); return; }

    setAddingQ(true);
    setAddStatus({ type: 'info', message: 'Adding question…' });
    try {
      const res = await addQuestionToExamAction(exam.id, {
        question_number: 0,
        question_en: newQ.question_en.trim(),
        question_hi: newQ.question_hi.trim(),
        options: filledOpts,
        correct_answer: newQ.correct_answer,
      });
      if (!res.success) throw new Error(res.error);
      setAddStatus({ type: 'success', message: '✓ Question added!' });
      setNewQ(emptyQuestion());
      onQuestionAdded?.();
    } catch (err: any) {
      setAddStatus({ type: 'error', message: err.message });
    } finally {
      setAddingQ(false);
    }
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:16,overflowY:'auto'}}>
      <div className="modal-card" style={{background:C.white,borderRadius:'14px',width:'100%',maxWidth:640,boxShadow:'0 12px 48px rgba(26,54,93,0.25)',maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{padding:'18px 24px',borderBottom:`1px solid ${C.gray}`,background:`linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,borderRadius:'14px 14px 0 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <HiOutlineAcademicCap size={22} color="#fff"/>
            <span style={{color:'#fff',fontWeight:700,fontSize:'1rem'}}>Edit Exam</span>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.7)',cursor:'pointer',fontSize:20,display:'flex'}}>
            <FiX/>
          </button>
        </div>

        <div style={{padding:24}}>
          <div style={{background:C.offWhite,borderRadius:'10px',padding:18,border:`1px solid ${C.gray}`,marginBottom:22}}>
            <h4 style={{margin:'0 0 14px 0',color:C.textDark,fontSize:'0.84rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>Exam Metadata</h4>
            <label style={labelStyle}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Exam title"/>
            <label style={labelStyle}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{...inputStyle,marginBottom:0}}/>
          </div>

          <div style={{display:'flex',gap:10,marginBottom:10}}>
            <button onClick={() => onSave(title, date)} disabled={loading || !title.trim()} style={{...btnPrimary, opacity: (loading || !title.trim()) ? 0.6 : 1, cursor: (loading || !title.trim()) ? 'not-allowed' : 'pointer'}}>
              {loading ? <><FiRefreshCw style={{animation:'spin 1s linear infinite'}}/> Saving…</> : <><FiSave/> Save Details</>}
            </button>
            <button onClick={onClose} style={btnSecondary}><FiX/> Cancel</button>
          </div>

          <div style={{borderTop:`1px solid ${C.gray}`,paddingTop:20,marginTop:14}}>
            <button onClick={() => setShowAddQ(p => !p)} style={{
              width:'100%',padding:'12px',border:`2px dashed ${showAddQ ? C.primary : C.gray}`,
              borderRadius:'8px',background: showAddQ ? C.infoBg : C.offWhite,
              color: showAddQ ? C.primary : C.textMuted,cursor:'pointer',
              fontWeight:700,fontSize:'0.87rem',
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              transition:'all 0.15s',
            }}>
              <FiPlus size={16}/> {showAddQ ? 'Cancel' : 'Add Question'}
            </button>

            {showAddQ && (
              <div style={{marginTop:16,background:C.offWhite,borderRadius:'10px',padding:16,border:`1px solid ${C.gray}`}}>
                <h4 style={{margin:'0 0 14px 0',color:C.textDark,fontSize:'0.88rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
                  <FiPlus color={C.accent}/> New Question
                </h4>
                <QuestionForm data={newQ} onChange={setNewQ}/>
                {addStatus.message && <div style={{marginBottom:12}}><Toast status={addStatus}/></div>}
                <div style={{display:'flex',gap:8}}>
                  <button onClick={handleAddQuestion} disabled={addingQ} style={btnPrimary}>
                    {addingQ ? <><FiRefreshCw style={{animation:'spin 1s linear infinite'}}/> Adding…</> : <><FiPlus/> Add</>}
                  </button>
                  <button onClick={() => { setNewQ(emptyQuestion()); setAddStatus({type:'',message:''}); }} style={btnSecondary}>
                    <FiRefreshCw/> Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  Edit Question Modal
// ══════════════════════════════════════════════════════════════════════════════
function EditQuestionModal({
  question,
  onSave,
  onClose,
  loading,
}: {
  question: Question;
  onSave: (q: Question) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [q, setQ] = useState<Question>({ ...question });
  const [formError, setFormError] = useState('');

  const handleSave = () => {
    if (!q.question_en.trim()) { setFormError('Question text is required.'); return; }
    const filled = q.options.filter(o => o.text.trim());
    if (filled.length === 0) { setFormError('Fill in at least one option.'); return; }
    if (!filled.some(o => o.value === q.correct_answer)) {
      setFormError('Mark one filled option as the correct answer.');
      return;
    }
    setFormError('');
    onSave({ ...q, options: filled });
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div className="modal-card" style={{background:C.white,borderRadius:'14px',width:'100%',maxWidth:620,boxShadow:'0 12px 48px rgba(26,54,93,0.25)',maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{padding:'18px 24px',borderBottom:`1px solid ${C.gray}`,background:`linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,borderRadius:'14px 14px 0 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{color:'#fff',fontWeight:700,fontSize:'1rem'}}>Edit Question #{q.question_number}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.7)',cursor:'pointer',fontSize:20}}><FiX/></button>
        </div>
        <div style={{padding:24}}>
          <QuestionForm
            data={{ question_en: q.question_en, question_hi: q.question_hi, options: q.options, correct_answer: q.correct_answer }}
            onChange={d => setQ({ ...q, ...d })}
          />
          {formError && <div style={{marginBottom:12}}><Toast status={{type:'error', message:formError}}/></div>}
          <div style={{display:'flex',gap:10}}>
            <button onClick={handleSave} disabled={loading} style={btnPrimary}>
              {loading ? <><FiRefreshCw style={{animation:'spin 1s linear infinite'}}/> Saving…</> : <><FiSave/> Save</>}
            </button>
            <button onClick={onClose} style={btnSecondary}><FiX/> Cancel</button>
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
  const [status,    setStatus]    = useState<Status>({type:'',message:''});
  const [loading,   setLoading]   = useState(false);
  const [rtStatus,  setRtStatus]  = useState<'live'|'off'>('off');
  const [tfReady,   setTfReady]   = useState(false);
  const [diffMap,   setDiffMap]   = useState<Record<string,string>>({});
  const [expanded,  setExpanded]  = useState<Record<string,boolean>>({});
  const [editExam,  setEditExam]  = useState<{id:string;title:string;exam_date:string}|null>(null);
  const [editQ,     setEditQ]     = useState<Question|null>(null);
  const [activeTab, setActiveTab] = useState<'smart'|'json'|'list'>('smart');
  const [dlLoading, setDlLoading] = useState<string|null>(null);

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
        .on('postgres_changes',{event:'*',schema:'public',table:'mexams'},  ()=>{loadAll();toast('Database updated','info');})
        .on('postgres_changes',{event:'*',schema:'public',table:'mquestions'},()=>{loadAll();})
        .subscribe(state => setRtStatus(state==='SUBSCRIBED'?'live':'off'));
      channelRef.current = channel;
    } catch { setRtStatus('off'); }
  };

  const handleUpdateExam = async (title: string, date: string) => {
    if (!editExam) return;
    setLoading(true);
    const res = await updateExamAction(editExam.id, { title, exam_date: date });
    setLoading(false);
    if (res.success) { toast('Exam updated.', 'success'); setEditExam(null); await loadAll(); }
    else toast(res.error ?? 'Update failed.', 'error');
  };

  const handleUpdateQuestion = async (q: Question) => {
    setLoading(true);
    const res = await updateQuestionAction(q.id, {
      question_en: q.question_en, question_hi: q.question_hi,
      options: q.options, correct_answer: q.correct_answer,
    });
    setLoading(false);
    if (res.success) { toast('Question updated.', 'success'); setEditQ(null); await loadAll(); }
    else toast(res.error ?? 'Update failed.', 'error');
  };

  const handleDeleteExam = async (id: string, title: string) => {
    if (!confirm(`Delete exam "${title}" and all its questions?`)) return;
    setLoading(true);
    const res = await deleteExamAction(id);
    setLoading(false);
    if (res.success) { toast('Exam deleted.', 'success'); await loadAll(); }
    else toast(res.error ?? 'Delete failed.', 'error');
  };

  const handleDeleteQuestion = async (qid: string) => {
    if (!confirm('Delete this question?')) return;
    setLoading(true);
    const res = await deleteQuestionAction(qid);
    setLoading(false);
    if (res.success) { toast('Question deleted.', 'success'); await loadAll(); }
    else toast(res.error ?? 'Delete failed.', 'error');
  };

  const handleDownloadDocx = async (exam: Exam) => {
    setDlLoading(exam.id);
    toast(`Generating "${exam.title}.docx"…`, 'info');
    try {
      await downloadExamAsDocx(exam);
      toast('✓ DOCX downloaded!', 'success');
    } catch (err: any) {
      toast(`Download failed: ${err.message}`, 'error');
    } finally {
      setDlLoading(null);
    }
  };

  const TABS = [
    {id:'smart', label:'Smart Import',    icon:<HiOutlineLightBulb size={16}/>},
    {id:'json',  label:'JSON Converter',  icon:<FiCode size={15}/>},
    {id:'list',  label:'Exam Records',    icon:<FiDatabase size={15}/>},
  ] as const;

  return (
    <div style={{minHeight:'100vh',background:C.lightGray,fontFamily:"'Segoe UI','Trebuchet MS',system-ui,sans-serif"}}>

      {/* ── Government Header ─────────────────────────────────────────────────── */}
      <div style={{background:`linear-gradient(135deg,${C.primaryDark} 0%,${C.primary} 100%)`,color:C.white,boxShadow:'0 4px 16px rgba(26,54,93,0.3)'}}>
        <div style={{height:4,background:`linear-gradient(90deg,${C.accent} 0%,#e07c22 50%,${C.secondary} 100%)`}}/>
        <div style={{maxWidth:1420,margin:'0 auto',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:52,height:52,borderRadius:'12px',background:`linear-gradient(135deg,${C.accent},#e07c22)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,boxShadow:'0 4px 16px rgba(212,105,26,0.3)'}}>
              <HiOutlineAcademicCap/>
            </div>
            <div>
              <p style={{margin:0,fontSize:'1.08rem',fontWeight:800,letterSpacing:'0.02em'}}>Competitive Exam Portal</p>
              <p className="header-subtitle" style={{margin:'2px 0 0 0',fontSize:'0.68rem',color:'#a5c4ea',letterSpacing:'0.07em',textTransform:'uppercase',fontWeight:600}}>Government Examination System</p>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <Chip label={rtStatus==='live'?'Live':'Offline'} color={rtStatus==='live'?'#065f46':'#64748b'} bg={rtStatus==='live'?'#d1fae5':'#f1f5f9'} icon={<FiWifi size={12}/>}/>
            <Chip label={tfReady?'Ready':'Loading'} color={tfReady?C.accent:'#64748b'} bg={tfReady?'#fff7ed':'#f1f5f9'} icon={<FiCpu size={12}/>}/>
            <Chip label="Secure" color={C.secondary} bg={C.successBg} icon={<FiShield size={12}/>}/>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1420,margin:'0 auto',padding:'28px 24px'}}>

        {/* ── Stats Grid ────────────────────────────────────────────────────────── */}
        <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:28}}>
          <StatCard icon={<FiDatabase/>}  label="Total Exams"     value={stats?.total_exams     ??'—'} accent={C.primary}/>
          <StatCard icon={<FiBarChart2/>} label="Total Questions" value={stats?.total_questions  ??'—'} accent={C.accent}/>
          <StatCard icon={<FiClock/>}     label="Latest Exam"     value={stats?.recent_exam_title??'—'} accent={C.secondary}/>
          <StatCard icon={<FiCpu/>}       label="Difficulty AI"   value={tfReady?'Active':'Loading'} accent="#7c3aed"/>
        </div>

        {/* ── Tab Navigation ────────────────────────────────────────────────────── */}
        <div style={{display:'flex',gap:0,marginBottom:24,borderBottom:`2.5px solid ${C.gray}`,overflowX:'auto'}}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding:'12px 28px',border:'none',cursor:'pointer',background:'transparent',
              fontWeight:700,fontSize:'0.88rem',letterSpacing:'0.03em',whiteSpace:'nowrap',
              color: activeTab===tab.id ? C.primary : C.textMuted,
              borderBottom: activeTab===tab.id ? `3.5px solid ${C.accent}` : '3.5px solid transparent',
              marginBottom:-2.5,display:'flex',alignItems:'center',gap:8,
              transition:'all 0.3s ease'
            }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Toast notification */}
        {status.message && !editExam && !editQ && (
          <div style={{marginBottom:18}}>
            <Toast status={status}/>
          </div>
        )}

        {/* ── SMART IMPORT TAB ─────────────────────────────────────────────── */}
        {activeTab === 'smart' && (
          <SmartImportPanel onUploaded={loadAll} toast={toast}/>
        )}

        {/* ── JSON CONVERTER TAB ───────────────────────────────────────────── */}
        {activeTab === 'json' && (
          <JsonConverterPanel onUploaded={() => { loadAll(); setActiveTab('list'); }} toast={toast}/>
        )}

        {/* ── EXAM RECORDS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'list' && (
          <div>
            {exams.length === 0 ? (
              <div style={{textAlign:'center',padding:'70px 24px',color:C.textMuted,border:`2px dashed ${C.gray}`,borderRadius:'14px',background:C.white,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <FiDatabase size={44} style={{marginBottom:14,color:C.gray}}/>
                <p style={{margin:0,fontWeight:700,fontSize:'0.96rem'}}>No exams yet</p>
                <p style={{margin:'6px 0 0 0',fontSize:'0.82rem'}}>Use Smart Import to add your first exam</p>
              </div>
            ) : exams.map(exam => {
              const isOpen = expanded[exam.id];
              return (
                <div key={exam.id} style={{background:C.white,borderRadius:'12px',marginBottom:16,border:`1px solid ${C.gray}`,boxShadow:'0 2px 8px rgba(26,54,93,0.08)',overflow:'hidden',transition:'all 0.3s ease'}}>
                  {/* Exam header */}
                  <div style={{display:'flex',alignItems:'center',gap:12,padding:'16px 20px',borderBottom:isOpen?`1px solid ${C.gray}`:'none',background:isOpen?'linear-gradient(90deg,#f0f4ff,#fff)':'#fff',flexWrap:'wrap'}}>
                    <HiOutlineAcademicCap size={22} color={C.primary} style={{flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{margin:0,fontWeight:800,color:C.textDark,fontSize:'0.96rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{exam.title}</p>
                      <div style={{display:'flex',gap:8,marginTop:6,flexWrap:'wrap'}}>
                        <Chip label={exam.exam_date}                           icon={<FiClock size={11}/>}      color={C.primary}   bg={C.infoBg}/>
                        <Chip label={`${exam.mquestions?.length??0} Q`}        icon={<FiFileText size={11}/>}   color={C.secondary} bg={C.successBg}/>
                        {diffMap && exam.mquestions?.length > 0 && (() => {
                          const diffs = exam.mquestions.map(q => diffMap[q.id]).filter(Boolean);
                          const hard   = diffs.filter(d => d === 'Hard').length;
                          const medium = diffs.filter(d => d === 'Medium').length;
                          if (hard > 0)   return <Chip label={`${hard} Hard`}   color='#991b1b' bg='#fee2e2'/>;
                          if (medium > 0) return <Chip label={`${medium} Medium`} color='#92400e' bg='#fef3c7'/>;
                          return null;
                        })()}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8,flexShrink:0}}>
                      <button
                        onClick={() => handleDownloadDocx(exam)}
                        disabled={dlLoading === exam.id}
                        title="Download as Word"
                        style={{
                          display:'flex',alignItems:'center',gap:6,padding:'6px 14px',
                          borderRadius:'8px',border:`1.5px solid ${C.primary}20`,
                          background:`${C.primary}08`,color:C.primary,cursor:'pointer',
                          fontSize:'0.75rem',fontWeight:700,
                          opacity: dlLoading === exam.id ? 0.6 : 1,
                          transition:'all 0.2s ease'
                        }}
                      >
                        {dlLoading === exam.id
                          ? <FiRefreshCw size={13} style={{animation:'spin 1s linear infinite'}}/>
                          : <FiDownload size={13}/>}
                        {dlLoading === exam.id ? 'Gen…' : '.docx'}
                      </button>
                      <IconBtn icon={<FiEdit2 size={14}/>} title="Edit" color={C.primary} onClick={() => setEditExam({id:exam.id,title:exam.title,exam_date:exam.exam_date})}/>
                      <IconBtn icon={<FiTrash2 size={14}/>} title="Delete" color={C.error} onClick={() => handleDeleteExam(exam.id, exam.title)}/>
                      <IconBtn icon={isOpen?<FiChevronUp size={14}/>:<FiChevronDown size={14}/>} title="Expand" color={C.textMuted} onClick={() => setExpanded(p => ({...p,[exam.id]:!p[exam.id]}))}/>
                    </div>
                  </div>

                  {/* Expanded questions list */}
                  {isOpen && (
                    <div style={{padding:'18px 20px',background:C.offWhite,borderTop:`1px solid ${C.gray}`}}>
                      {(exam.mquestions??[]).length === 0 ? (
                        <p style={{color:C.textMuted,fontSize:'0.82rem',margin:0}}>No questions in this exam.</p>
                      ) : [...(exam.mquestions??[])].sort((a,b) => a.question_number - b.question_number).map((q,qi) => (
                        <div key={q.id} style={{marginBottom:qi < (exam.mquestions?.length ?? 0) - 1 ? 14 : 0,padding:'14px 16px',border:`1px solid ${C.gray}`,borderRadius:'10px',background:C.white}}>
                          <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                            <span style={{minWidth:32,height:32,background:C.primary,color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:800,flexShrink:0}}>
                              {q.question_number}
                            </span>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{margin:'0 0 4px 0',fontWeight:700,color:C.textDark,fontSize:'0.87rem'}}>{q.question_en}</p>
                              {q.question_hi && <p style={{margin:'0 0 8px 0',color:C.textMuted,fontSize:'0.79rem',fontStyle:'italic'}}>{q.question_hi}</p>}
                              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                                <DiffChip level={diffMap[q.id]}/>
                                <Chip label={`Ans: ${q.correct_answer}`} color={C.secondary} bg={C.successBg} icon={<FiCheckCircle size={11}/>}/>
                              </div>
                              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:6}}>
                                {q.options?.map((opt, oi) => {
                                  const correct = String(q.correct_answer) === String(opt.value);
                                  return (
                                    <div key={oi} style={{
                                      padding:'6px 10px',borderRadius:'8px',fontSize:'0.78rem',
                                      border: correct ? `1.5px solid ${C.secondary}` : `1px solid ${C.gray}`,
                                      background: correct ? C.successBg : C.offWhite,
                                      color: correct ? C.secondary : C.textDark,fontWeight: correct ? 700 : 500,
                                    }}>
                                      <span style={{fontWeight:800,marginRight:3}}>{opt.value}.</span>{opt.text}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div style={{display:'flex',gap:6,flexShrink:0}}>
                              <IconBtn icon={<FiEdit2 size={13}/>} title="Edit" color={C.primary} onClick={() => setEditQ({...q})}/>
                              <IconBtn icon={<FiTrash2 size={13}/>} title="Delete" color={C.error} onClick={() => handleDeleteQuestion(q.id)}/>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setEditExam({id:exam.id,title:exam.title,exam_date:exam.exam_date})}
                        style={{
                          marginTop:10,width:'100%',padding:'10px',border:`2px dashed ${C.gray}`,
                          borderRadius:'8px',background:'transparent',color:C.textMuted,cursor:'pointer',
                          fontSize:'0.82rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                          transition:'all 0.2s ease'
                        }}
                      >
                        <FiPlus size={15}/> Add Question
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Exam Modal ─────────────────────────────────────────────────── */}
      {editExam && (
        <EditExamModal
          exam={editExam}
          onSave={handleUpdateExam}
          onClose={() => setEditExam(null)}
          loading={loading}
          onQuestionAdded={loadAll}
        />
      )}

      {/* ── Edit Question Modal ─────────────────────────────────────────────── */}
      {editQ && (
        <EditQuestionModal
          question={editQ}
          onSave={handleUpdateQuestion}
          onClose={() => setEditQ(null)}
          loading={loading}
        />
      )}

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer style={{marginTop:48,padding:'20px 24px',textAlign:'center',borderTop:`1px solid ${C.gray}`,color:C.textMuted,fontSize:'0.74rem',background:C.white,fontWeight:600}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,flexWrap:'wrap',marginBottom:8}}>
          <Chip label="Supabase Realtime" color={C.primary} bg={C.infoBg}/>
          <Chip label="TensorFlow.js" color='#7c3aed' bg='#f3e8ff'/>
          <Chip label="Next.js 14" color={C.textDark} bg='#b691de'/>
          <Chip label="Smart Import" color={C.accent} bg='#fff7ed'/>
        </div>
        <p style={{margin:0}}>Competitive Exam Portal — Government Examination Database Management System</p>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        textarea::placeholder { color: #cbd5e1; }
        input:focus, textarea:focus { outline: none; border-color: #1a365d !important; box-shadow: 0 0 0 3px rgba(26,54,93,0.1) !important; }
        
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .header-subtitle { display: none; }
          .modal-card { border-radius: 0 !important; max-height: 100vh !important; }
        }
      `}</style>
    </div>
  );
}