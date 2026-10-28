'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────
// SUPABASE CLIENT (single instance)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─────────────────────────────────────────────────────────────
// TYPES
interface ParagraphData {
  [language: string]: {
    [duration: number]: {
      [topic: string]: string[];
    };
  };
}

interface TestStats {
  nwpm: number;
  gwpm: number;
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  totalTypedWords: number;
  missingWords: number;
  timeTaken: number;
  passed: boolean;
  passThreshold: number;
}

const WORD_COUNTS: Record<number, number> = {
  5: 280,
  10: 380,
  15: 480,
  20: 530
};

const PARAGRAPH_NUMBER_MAP: Record<number, number> = {
  5: 1,
  10: 2,
  15: 3,
  20: 4
};

// ─────────────────────────────────────────────────────────────
// HELPER: Split source text into passages of exact word limits
// Works for English and Hindi (both split on whitespace).
// For each duration, the full word pool is cut into consecutive
// passages of exactly WORD_COUNTS[duration] words. If the pool is
// shorter than the limit, it wraps around so every duration always
// has a full-length passage.
function buildPassagesForDuration(words: string[], limit: number): string[] {
  if (words.length === 0) return [];
  const total = words.length;
  const count = Math.max(1, Math.ceil(total / limit));
  const passages: string[] = [];
  for (let k = 0; k < count; k++) {
    const chunk: string[] = [];
    for (let j = 0; j < limit; j++) {
      chunk.push(words[(k * limit + j) % total]);
    }
    passages.push(chunk.join(' '));
  }
  return passages;
}

// ─────────────────────────────────────────────────────────────
// HELPER: Toggle Switch Component
interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange, count }) => (
  <div className="flex items-center gap-2">
    <label className="relative inline-block w-11 h-6 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
    </label>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">{label}</span>
    {count !== undefined && (
      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 min-w-[1.5rem] text-center">
        {count}
      </span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// WELCOME MODAL COMPONENT
interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicsByLanguage: {
    english: string[];
    hindi: string[];
  };
  onConfirm: (config: {
    timeLimit: number;
    language: 'english' | 'hindi';
    topic: string;
    backspaceEnabled: boolean;
    autoScroll: boolean;
    showColor: boolean;
    highlighter: boolean;
  }) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, topicsByLanguage, onConfirm }) => {
  const [modalTimeLimit, setModalTimeLimit] = useState<number>(5);
  const [modalLanguage, setModalLanguage] = useState<'english' | 'hindi'>('english');
  const [modalTopic, setModalTopic] = useState<string>('');
  const [modalBackspace, setModalBackspace] = useState<boolean>(true);
  const [modalAutoScroll, setModalAutoScroll] = useState<boolean>(true);
  const [modalShowColor, setModalShowColor] = useState<boolean>(true);
  const [modalHighlighter, setModalHighlighter] = useState<boolean>(true);

  const currentTopics = topicsByLanguage[modalLanguage] || [];

  // Keep topic valid when language changes
  useEffect(() => {
    if (currentTopics.length > 0) {
      if (!currentTopics.includes(modalTopic)) {
        setModalTopic(currentTopics[0]);
      }
    } else {
      setModalTopic('');
    }
  }, [modalLanguage, currentTopics]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-6">
         
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to CPCT Typing Test</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Customize your exam settings before you begin</p>
        </div>

        <div className="space-y-5 mb-6">
          {/* Time Limit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⏱️ Time Limit</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((time) => (
                <button
                  key={time}
                  onClick={() => setModalTimeLimit(time)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition border-2 ${modalTimeLimit === time
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                >
                  {time} Min
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Words: {WORD_COUNTS[modalTimeLimit]}</p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🌐 Language</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModalLanguage('english')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition border-2 ${modalLanguage === 'english'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
              >
                🇮🇳 English
              </button>
              <button
                onClick={() => setModalLanguage('hindi')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition border-2 ${modalLanguage === 'hindi'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
              >
                🇮🇳 Hindi (हिंदी)
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pass Threshold: {modalLanguage === 'english' ? '30 NWPM' : '20 NWPM'}
            </p>
          </div>

          {/* Topic – filtered by language */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📚 Topic</label>
            <select
              value={modalTopic}
              onChange={(e) => setModalTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentTopics.length === 0 ? (
                <option value="">No topics available</option>
              ) : (
                currentTopics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))
              )}
            </select>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⚙️ Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <ToggleSwitch label="Backspace" checked={modalBackspace} onChange={() => setModalBackspace(!modalBackspace)} />
              <ToggleSwitch label="AutoScroll" checked={modalAutoScroll} onChange={() => setModalAutoScroll(!modalAutoScroll)} />
              <ToggleSwitch label="Color Coding" checked={modalShowColor} onChange={() => setModalShowColor(!modalShowColor)} />
              <ToggleSwitch label="Highlighter" checked={modalHighlighter} onChange={() => setModalHighlighter(!modalHighlighter)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onConfirm({
                timeLimit: modalTimeLimit,
                language: modalLanguage,
                topic: modalTopic,
                backspaceEnabled: modalBackspace,
                autoScroll: modalAutoScroll,
                showColor: modalShowColor,
                highlighter: modalHighlighter,
              });
              onClose();
            }}
            disabled={!modalTopic}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
          >
            🚀 Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
export default function TypingTest() {
  // ─── Welcome Modal State ───
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);

  // ─── Configuration State ───
  const [timeLimit, setTimeLimit] = useState<number>(5);
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');
  const [topic, setTopic] = useState<string>('');

  // ─── Paragraph store (loaded once from Supabase) ───
  const [paragraphs, setParagraphs] = useState<ParagraphData>({});
  const [topicsByLanguage, setTopicsByLanguage] = useState<{
    english: string[];
    hindi: string[];
  }>({
    english: [],
    hindi: []
  });
  const [paragraphsLoaded, setParagraphsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ─── Currently selected paragraph text ───
  const [currentParagraph, setCurrentParagraph] = useState<string>('');

  // ─── Test State ───
  const [testState, setTestState] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [backspaceCount, setBackspaceCount] = useState<number>(0);

  // ─── Toggles ───
  const [backspaceEnabled, setBackspaceEnabled] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [showColor, setShowColor] = useState<boolean>(true);
  const [highlighter, setHighlighter] = useState<boolean>(true);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // ─── Display ───
  const [fontSize, setFontSize] = useState<number>(18);

  // ─── Stats ───
  const [stats, setStats] = useState<TestStats | null>(null);

  // ─── Refs ───
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // ─────────────────────────────────────────────────────────────
  // ONE-TIME FETCH FROM SUPABASE (no repeated calls, minimal egress)
  useEffect(() => {
    let cancelled = false;

    async function loadParagraphs() {
      try {
        const { data, error } = await supabase
          .from('typing_paragraphs')
          .select('language, duration, topic, content');

        if (error) throw error;

        if (!data || data.length === 0) {
          if (!cancelled) {
            setLoadError('No paragraphs found in database');
            setParagraphsLoaded(true);
          }
          return;
        }

        // Pool all source text per language + topic, in the order received
        const pools: Record<'english' | 'hindi', Record<string, string[]>> = {
          english: {},
          hindi: {}
        };

        data.forEach((row: any) => {
          const lang = row.language as 'english' | 'hindi';
          const top = row.topic as string;
          if (lang !== 'english' && lang !== 'hindi') return;
          if (typeof row.content !== 'string' || !row.content.trim()) return;

          if (!pools[lang][top]) pools[lang][top] = [];
          pools[lang][top].push(row.content);
        });

        // Build passages for every language, topic and duration (word-limited)
        const grouped: ParagraphData = {};
        const topicsMap = {
          english: new Set<string>(),
          hindi: new Set<string>()
        };

        (['english', 'hindi'] as const).forEach((lang) => {
          Object.keys(pools[lang]).forEach((top) => {
            const words = pools[lang][top]
              .join(' ')
              .split(/\s+/)
              .filter((w) => w.length > 0);

            if (words.length === 0) return;

            topicsMap[lang].add(top);

            Object.keys(WORD_COUNTS).forEach((durKey) => {
              const dur = Number(durKey);
              const passages = buildPassagesForDuration(words, WORD_COUNTS[dur]);
              if (passages.length === 0) return;

              if (!grouped[lang]) grouped[lang] = {};
              if (!grouped[lang][dur]) grouped[lang][dur] = {};
              grouped[lang][dur][top] = passages;
            });
          });
        });

        if (!cancelled) {
          setParagraphs(grouped);
          setTopicsByLanguage({
            english: Array.from(topicsMap.english).sort(),
            hindi: Array.from(topicsMap.hindi).sort()
          });
          setParagraphsLoaded(true);
          setLoadError(null);

          // Set default topic for English
          const defaultTopics = Array.from(topicsMap.english);
          if (defaultTopics.length > 0) {
            setTopic(defaultTopics[0]);
          }
        }
      } catch (err: any) {
        console.error('Failed to load paragraphs from Supabase:', err);
        if (!cancelled) {
          setLoadError(err?.message || 'Failed to load paragraphs');
          setParagraphsLoaded(true);
        }
      }
    }

    loadParagraphs();
    return () => { cancelled = true; };
  }, []);

  // When language changes → keep topic valid for that language
  useEffect(() => {
    const available = topicsByLanguage[language] || [];
    if (available.length === 0) {
      setTopic('');
      return;
    }
    if (!available.includes(topic)) {
      setTopic(available[0]);
    }
  }, [language, topicsByLanguage]);

  // Pick a random paragraph whenever language / timeLimit / topic changes
  useEffect(() => {
    if (!paragraphsLoaded || !topic) return;

    const pool = paragraphs[language]?.[timeLimit]?.[topic] ?? [];
    if (pool.length === 0) {
      setCurrentParagraph('');
      return;
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    setCurrentParagraph(pool[randomIndex]);
  }, [language, timeLimit, topic, paragraphs, paragraphsLoaded]);

  // ─── Derived Data ───
  const displayWords = useMemo(
    () => currentParagraph.split(/\s+/).filter(w => w.length > 0),
    [currentParagraph]
  );
  const userWords = useMemo(
    () => userInput.trim().split(/\s+/).filter(w => w.length > 0),
    [userInput]
  );

  const paragraphDisplayNumber = useMemo(
    () => PARAGRAPH_NUMBER_MAP[timeLimit] || 1,
    [timeLimit]
  );

  // ─── Handle Modal Confirm ───
  const handleModalConfirm = useCallback((config: {
    timeLimit: number;
    language: 'english' | 'hindi';
    topic: string;
    backspaceEnabled: boolean;
    autoScroll: boolean;
    showColor: boolean;
    highlighter: boolean;
  }) => {
    setTimeLimit(config.timeLimit);
    setTimeLeft(config.timeLimit * 60);
    setLanguage(config.language);
    setTopic(config.topic);
    setBackspaceEnabled(config.backspaceEnabled);
    setAutoScroll(config.autoScroll);
    setShowColor(config.showColor);
    setHighlighter(config.highlighter);
  }, []);

  const handleTestComplete = useCallback((auto: boolean = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTestState('finished');

    const actualTimeMinutes = auto ? timeLimit : timeTaken / 60 || timeLimit / 60;
    const totalTypedWords = userWords.length;

    let correctWords = 0;
    let wrongWords = 0;

    userWords.forEach((word, idx) => {
      if (displayWords[idx] === word) correctWords++;
      else wrongWords++;
    });

    const missingWords = Math.max(0, displayWords.length - userWords.length);
    wrongWords += missingWords;

    const nwpm = Math.round((correctWords / actualTimeMinutes) * 10) / 10;
    const gwpm = Math.round((totalTypedWords / actualTimeMinutes) * 10) / 10;
    const accuracy = gwpm > 0 ? Math.round((nwpm * 100 / gwpm) * 10) / 10 : 0;

    const passThreshold = language === 'english' ? 30 : 20;
    const passed = nwpm >= passThreshold;

    setStats({
      nwpm, gwpm, accuracy, correctWords, wrongWords,
      totalTypedWords, missingWords,
      timeTaken: Math.round(actualTimeMinutes * 100) / 100,
      passed, passThreshold
    });
  }, [displayWords, language, timeLimit, timeTaken, userWords]);

  const handleTestCompleteRef = useRef(handleTestComplete);
  useEffect(() => {
    handleTestCompleteRef.current = handleTestComplete;
  }, [handleTestComplete]);

  // ─── Timer Logic ───
  useEffect(() => {
    if (testState === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTestCompleteRef.current(true);
            return 0;
          }
          return prev - 1;
        });
        setTimeTaken((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testState]);

  // ─── Auto Scroll ───
  useEffect(() => {
    if (autoScroll && textDisplayRef.current && testState === 'running') {
      const currentWordIndex = Math.max(0, userWords.length - 1);
      const wordElements = textDisplayRef.current.querySelectorAll('[data-word-index]');
      if (wordElements[currentWordIndex]) {
        wordElements[currentWordIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [userWords.length, autoScroll, testState]);

  // ─── Handlers ───
  const handleStart = useCallback(() => {
    setTestState('running');
    setTimeLeft(timeLimit * 60);
    setTimeTaken(0);
    setUserInput('');
    setBackspaceCount(0);
    setStats(null);
    startTimeRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [timeLimit]);

  const handlePause = useCallback(() => setTestState('paused'), []);
  const handleResume = useCallback(() => {
    setTestState('running');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleReset = useCallback(() => {
    setTestState('idle');
    setTimeLeft(timeLimit * 60);
    setTimeTaken(0);
    setUserInput('');
    setBackspaceCount(0);
    setStats(null);
  }, [timeLimit]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (testState !== 'running') return;
    const newValue = e.target.value;
    const diff = newValue.length - userInput.length;
    if (diff < 0) setBackspaceCount((b) => b + Math.abs(diff));
    setUserInput(newValue);
  }, [testState, userInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!backspaceEnabled && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
    }
  }, [backspaceEnabled]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setFullscreen(false);
    }
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  // ─── Live Stats ───
  const liveCorrect = useMemo(
    () => userWords.filter((w, i) => displayWords[i] === w).length,
    [userWords, displayWords]
  );
  const liveWrong = useMemo(
    () => Math.max(0, userWords.length - liveCorrect),
    [userWords.length, liveCorrect]
  );
  const liveTotal = userWords.length;
  const liveTime = (timeTaken / 60) || 0.1;
  const liveNwpm = useMemo(
    () => Math.round((liveCorrect / liveTime) * 10) / 10,
    [liveCorrect, liveTime]
  );

  // ─── Render Paragraph ───
  const renderParagraph = useCallback(() => {
    if (!currentParagraph) {
      return (
        <span className="text-gray-500 dark:text-gray-400 italic">
          {paragraphsLoaded
            ? (loadError || 'No paragraph available for this language / time / topic')
            : 'Loading paragraphs…'}
        </span>
      );
    }

    if (!showColor) {
      return <span className="text-gray-800 dark:text-gray-200">{currentParagraph}</span>;
    }

    const isMidWord = userInput.length > 0 && !userInput.endsWith(' ');
    const currentWordIdx = isMidWord ? userWords.length - 1 : userWords.length;

    return displayWords.map((word, idx) => {
      let className = 'text-gray-400 dark:text-gray-500';
      let bgClass = '';

      const isCompleted = idx < userWords.length && (idx < currentWordIdx || !isMidWord);

      if (isCompleted) {
        className = userWords[idx] === word
          ? 'text-green-600 dark:text-green-400 font-medium'
          : 'text-red-600 dark:text-red-400 font-medium';
      }

      if (highlighter && testState === 'running' && idx === currentWordIdx) {
        bgClass = 'bg-yellow-200 dark:bg-yellow-600/30';
        if (isMidWord) {
          const typedSoFar = userWords[currentWordIdx] ?? '';
          className = word.startsWith(typedSoFar)
            ? 'text-gray-800 dark:text-gray-200 font-medium'
            : 'text-red-600 dark:text-red-400 font-medium';
        } else {
          className = 'text-gray-800 dark:text-gray-200 font-medium';
        }
      }

      return (
        <span key={idx} data-word-index={idx} className={`${className} ${bgClass} px-0.5 rounded`}>
          {word}
          {idx < displayWords.length - 1 ? ' ' : ''}
        </span>
      );
    });
  }, [showColor, currentParagraph, displayWords, userWords, highlighter, userInput, testState, paragraphsLoaded, loadError]);

  // ═════════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═════════════════════════════════════════════════════════════
  if (testState === 'finished' && stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f4f8ff] via-[#c8ddff] to-[#a8c8f5] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-2 md:p-4 transition-colors duration-300">
        <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center', width: '111.11%', marginLeft: '-5.555%' }}>
          <div className="flex items-center justify-center p-4 mt-19">
            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-blue-300 dark:shadow-blue-900/20 shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="p-8">
                <div className={`flex gap-3 p-5 text-center rounded-xl border-2 mb-8 ${stats.passed ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="text-3xl mb-3">{stats.passed ? '✅' : '😊'}</div>
                  <h2 className={`text-2xl font-bold ${stats.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    {stats.passed ? 'PASSED' : 'better luck next time '}
                  </h2>
                  {!stats.passed && (
                    <p className="text-red-600 dark:text-red-400 mt-2">Required: {stats.passThreshold} NWPM • Scored: {stats.nwpm}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-0">
                  <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 p-6 rounded-xl text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">NET WPM</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-2">{stats.nwpm}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 p-6 rounded-xl text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">GROSS WPM</p>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-2">{stats.gwpm}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 p-6 rounded-xl text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">ACCURACY</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">{stats.accuracy}%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 p-6 rounded-xl text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">TIME TAKEN</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-2">{stats.timeTaken} min</p>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-5 text-center">WORD SUMMARY</h3>
                    <div className="flex justify-between text-center">
                      <div>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.correctWords}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CORRECT</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.wrongWords}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">WRONG</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{stats.totalTypedWords}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">TOTAL</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm bg-slate-50 dark:bg-slate-700/50 p-5 rounded-xl -mt-30 px-1 border border-slate-100 dark:border-slate-600 mb-2">
                  <p><strong>NWPM:</strong> {stats.correctWords} / {stats.timeTaken} = <span className="text-blue-600 dark:text-blue-400 font-medium">{stats.nwpm}</span></p>
                  <p><strong>GWPM:</strong> {stats.totalTypedWords} / {stats.timeTaken} = <span className="text-indigo-600 dark:text-indigo-400 font-medium">{stats.gwpm}</span></p>
                  <p><strong>Accuracy:</strong> ({stats.nwpm} × 100) / {stats.gwpm} = <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.accuracy}%</span></p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-300 transition"
                  >
                    🔄 Try Again
                  </button>
                  <button
                    onClick={() => {
                      handleReset();
                      setShowWelcomeModal(true);
                    }}
                    className="flex-1 py-4 bg-[#0F172A] dark:bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-950 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f8ff] via-[#c8ddff] to-[#a8c8f5] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-2 md:p-4 transition-colors duration-300">
      <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center', width: '111.11%', marginLeft: '-5.555%' }}>
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          topicsByLanguage={topicsByLanguage}
          onConfirm={handleModalConfirm}
        />

        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden mt-17 border border-gray-200 dark:border-slate-700">

            {/* Top Info Bar */}
            <div className="bg-gray-200 dark:bg-slate-700 px-4 py-2 flex justify-between items-center border-b border-gray-300 dark:border-slate-600">
              <div className="w-20"></div>
              <div className="flex gap-4 md:gap-8 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <span>Paragraph-{paragraphDisplayNumber}</span>
                <span>{timeLimit} Min.</span>
                <span className="hidden md:inline">{language === 'english' ? 'English' : 'Hindi'}</span>
                {topic && <span className="hidden lg:inline truncate max-w-[140px]" title={topic}>{topic}</span>}
              </div>
              <div className="w-20 text-right">
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Toggles Bar */}
            <div className="bg-gray-100 dark:bg-slate-800 px-4 py-3 flex flex-wrap gap-4 md:gap-6 border-b border-gray-300 dark:border-slate-600">
              <ToggleSwitch label="Backspace" checked={backspaceEnabled} onChange={() => setBackspaceEnabled(!backspaceEnabled)} count={backspaceCount} />
              <ToggleSwitch label="AutoScroll" checked={autoScroll} onChange={() => setAutoScroll(!autoScroll)} />
              <ToggleSwitch label="Color" checked={showColor} onChange={() => setShowColor(!showColor)} />
              <ToggleSwitch label="Highlighter" checked={highlighter} onChange={() => setHighlighter(!highlighter)} />
              <ToggleSwitch label="Fullscreen" checked={fullscreen} onChange={toggleFullscreen} />
              <ToggleSwitch label="Menu" checked={menuOpen} onChange={() => setMenuOpen(!menuOpen)} />
            </div>

            {/* Menu Panel */}
            {menuOpen && (
              <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 border-b border-gray-300 dark:border-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Time Limit</label>
                    <select
                      value={timeLimit}
                      onChange={(e) => {
                        const t = Number(e.target.value);
                        setTimeLimit(t);
                        setTimeLeft(t * 60);
                      }}
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={testState !== 'idle'}
                    >
                      <option value={5}>5 Minutes ({WORD_COUNTS[5]} words)</option>
                      <option value={10}>10 Minutes ({WORD_COUNTS[10]} words)</option>
                      <option value={15}>15 Minutes ({WORD_COUNTS[15]} words)</option>
                      <option value={20}>20 Minutes ({WORD_COUNTS[20]} words)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Language</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLanguage('english')}
                        className={`flex-1 py-1.5 rounded text-sm font-semibold transition ${language === 'english' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-500'}`}
                        disabled={testState !== 'idle'}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage('hindi')}
                        className={`flex-1 py-1.5 rounded text-sm font-semibold transition ${language === 'hindi' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-500'}`}
                        disabled={testState !== 'idle'}
                      >
                        Hindi
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={testState !== 'idle' || (topicsByLanguage[language] || []).length === 0}
                    >
                      {(topicsByLanguage[language] || []).length === 0 ? (
                        <option value="">No topics</option>
                      ) : (
                        (topicsByLanguage[language] || []).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Font Size</label>
                    <div className="flex gap-2">
                      <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="px-3 py-1 bg-gray-200 dark:bg-slate-600 rounded hover:bg-gray-300 dark:hover:bg-slate-500 text-sm dark:text-gray-200">A-</button>
                      <span className="px-3 py-1 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded text-sm dark:text-gray-200">{fontSize}px</span>
                      <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="px-3 py-1 bg-gray-200 dark:bg-slate-600 rounded hover:bg-gray-300 dark:hover:bg-slate-500 text-sm dark:text-gray-200">A+</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paragraph Display */}
            <div className="px-4 py-4">
              <div
                ref={textDisplayRef}
                className="bg-white dark:bg-slate-900 border border-gray-400 dark:border-slate-600 rounded p-4 h-40 overflow-y-auto"
                style={{ fontSize: `${fontSize}px` }}
              >
                <p className={`leading-relaxed ${language === 'hindi' ? 'font-sans' : ''}`}>
                  {renderParagraph()}
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="px-2 pb-2">
              <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded py-2 px-4 flex justify-center gap-8 md:gap-16">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">K: {liveCorrect}</span>
                <span className="text-red-600 dark:text-red-400 font-bold text-lg">K: {liveWrong}</span>
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">W: {liveTotal}</span>
                <span className="text-red-600 dark:text-red-400 font-bold text-lg">W: {liveNwpm}</span>
              </div>
            </div>

            {/* Input Area */}
            <div className="px-4 py-2">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={testState !== 'running' || !currentParagraph}
                placeholder={
                  !paragraphsLoaded
                    ? 'Loading paragraphs…'
                    : !currentParagraph
                      ? 'No paragraph available for selected topic'
                      : testState === 'idle'
                        ? 'Click Start to begin typing...'
                        : testState === 'paused'
                          ? 'Test Paused - Click Resume to continue'
                          : 'Start typing here...'
                }
                className={`w-full h-32 md:h-40 p-4 border-2 border-gray-400 dark:border-slate-600 rounded resize-none focus:outline-none focus:border-blue-500 text-base ${language === 'hindi' ? 'font-sans' : ''} ${testState !== 'running' || !currentParagraph ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100'}`}
                style={{ fontSize: `${fontSize}px` }}
                spellCheck={false}
              />
            </div>

            {/* Bottom Controls */}
            <div className="px-4 py-4 bg-gray-100 dark:bg-slate-800 border-t border-gray-300 dark:border-slate-600 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                {testState === 'idle' && (
                  <button
                    onClick={handleStart}
                    disabled={!currentParagraph}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded font-semibold transition flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Start
                  </button>
                )}
                {testState === 'running' && (
                  <button onClick={handlePause} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    Pause
                  </button>
                )}
                {testState === 'paused' && (
                  <button onClick={handleResume} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Resume
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="p-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded border border-gray-300 dark:border-slate-600" title="Zoom In">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                </button>
                <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded border border-gray-300 dark:border-slate-600" title="Zoom Out">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                </button>
                <button onClick={handleReset} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                  Reset
                </button>
              </div>

              <button
                onClick={() => handleTestComplete(false)}
                disabled={testState === 'idle' || !currentParagraph}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 text-white rounded font-semibold transition flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                Submit
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-gray-400 dark:text-gray-500 text-sm">
            <p>CPCT Typing Test | {language === 'english' ? 'Min 30 NWPM to Pass' : 'Min 20 NWPM to Pass'} | Topic: {topic || '—'} | Backspace Allowed</p>
          </div>
        </div>
      </div>
    </div>
  );
}