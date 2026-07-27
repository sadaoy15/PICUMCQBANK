"use client";

import { useState, useEffect, useCallback } from "react";
import { questions as builtInQuestions } from "@/data/questions";
import { inlineClinicalData } from "@/lib/inline-clinical-data";
import { ClinicalDataBlock, Question } from "@/types/question";

const STORAGE_KEY = "picu_custom_questions";
const SESSIONS_KEY = "picu_sessions";

type AnswerState = "unanswered" | "correct" | "incorrect" | "revealed";
type QuizMode = "sequential" | "random";
type ViewMode = "study" | "test";
type DeviceMode = "phone" | "computer";
type ActiveTab = "question" | "explanation" | "notes";

interface Progress {
  [questionId: number]: { selected: string; state: AnswerState };
}

interface QuizSession {
  id: string;
  title: string;
  examId: string;
  examLabel: string;
  subCat: string;
  quizMode: QuizMode;
  viewMode: ViewMode;
  questionIds: number[];
  currentIndex: number;
  progress: Progress;
  markedQuestionIds?: number[];
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface ExamGroup {
  id: string;
  label: string;
  description: string;
  accent: string;
  match: (q: Question) => boolean;
  subCategoryPrefix?: string;
}

const prepExamGroups: ExamGroup[] = [
  { id: "prep-picu-2019", label: "PREP PICU 2019", description: "Monthly cases Jan–Dec 2019", accent: "emerald", match: (q) => q.category.startsWith("PREP PICU 2019"), subCategoryPrefix: "PREP PICU 2019" },
  { id: "prep-picu-2020", label: "PREP PICU 2020", description: "Monthly cases Jan–Dec 2020", accent: "emerald", match: (q) => q.category.startsWith("PREP PICU 2020"), subCategoryPrefix: "PREP PICU 2020" },
  { id: "prep-picu-2021", label: "PREP PICU 2021", description: "Monthly cases Jan–Dec 2021", accent: "emerald", match: (q) => q.category.startsWith("PREP PICU 2021"), subCategoryPrefix: "PREP PICU 2021" },
  { id: "prep-icu-2022", label: "PREP ICU 2022", description: "Monthly cases Jan–Dec 2022", accent: "emerald", match: (q) => q.category.startsWith("PREP ICU 2022"), subCategoryPrefix: "PREP ICU 2022" },
  { id: "prep-icu-2023", label: "PREP ICU 2023", description: "Monthly cases Jan–Dec 2023", accent: "emerald", match: (q) => q.category.startsWith("PREP ICU 2023"), subCategoryPrefix: "PREP ICU 2023" },
  { id: "prep-icu-2024", label: "PREP ICU 2024", description: "Monthly cases Jan–Dec 2024", accent: "emerald", match: (q) => q.category.startsWith("PREP ICU 2024"), subCategoryPrefix: "PREP ICU 2024" },
  { id: "prep-2025", label: "PREP 2025", description: "Monthly cases Jan–Dec 2025", accent: "emerald", match: (q) => q.category === "PREP 2025" },
];

const sccmExamGroups: ExamGroup[] = [
  { id: "sccm-book", label: "SCCM Self-Assessment", description: "243 questions across 11 chapters (Dalton et al., 2010)", accent: "blue", match: (q) => q.category.startsWith("SCCM Self-Assessment"), subCategoryPrefix: "SCCM Self-Assessment" },
];

const zimmermanExamGroups: ExamGroup[] = [
  { id: "zimmerman-book", label: "Zimmerman MCQs", description: "716 questions across 112 chapters (Zimmerman PICU Board Review)", accent: "indigo", match: (q) => q.category.startsWith("Zimmerman MCQs"), subCategoryPrefix: "Zimmerman MCQs" },
];

const studyGuideExamGroups: ExamGroup[] = [
  { id: "studyguide-book", label: "Study Guide", description: "425 questions across 50 chapters (Pediatric Critical Care Text and Study Guide, 2nd Ed.)", accent: "blue", match: (q) => q.category.startsWith("Study Guide"), subCategoryPrefix: "Study Guide" },
];

const picumcqExamGroups: ExamGroup[] = [
  { id: "picumcq-book", label: "PICU MCQ Review", description: "279 questions with explanations and figures (PICU MCQ Review)", accent: "indigo", match: (q) => q.category === "PICU MCQ Review" },
];

const specialExamGroups: ExamGroup[] = [
  { id: "study-prep", label: "Study All PREP",   description: "All PREP questions combined (2019–2025)", accent: "violet", match: (q) => q.category.startsWith("PREP") },
  { id: "study-all",  label: "Study Everything", description: "All questions from all sources combined", accent: "slate",  match: () => true },
];

const examGroups: ExamGroup[] = [...prepExamGroups, ...sccmExamGroups, ...zimmermanExamGroups, ...studyGuideExamGroups, ...picumcqExamGroups, ...specialExamGroups];

const accentClasses: Record<string, { card: string; badge: string; btn: string }> = {
  blue:    { card: "border-slate-200 hover:border-teal-300 hover:bg-teal-50/60",       badge: "bg-teal-50 text-teal-700 border border-teal-100",       btn: "bg-teal-700 hover:bg-teal-800" },
  indigo:  { card: "border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/60",       badge: "bg-cyan-50 text-cyan-700 border border-cyan-100",        btn: "bg-teal-700 hover:bg-teal-800" },
  emerald: { card: "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60", badge: "bg-emerald-50 text-emerald-700 border border-emerald-100", btn: "bg-teal-700 hover:bg-teal-800" },
  violet:  { card: "border-slate-200 hover:border-teal-300 hover:bg-teal-50/60",       badge: "bg-teal-50 text-teal-700 border border-teal-100",       btn: "bg-teal-700 hover:bg-teal-800" },
  slate:   { card: "border-slate-200 hover:border-teal-300 hover:bg-slate-50",         badge: "bg-slate-50 text-slate-600 border border-slate-200",    btn: "bg-slate-700 hover:bg-slate-800" },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MedicalIcon({ name, className = "h-5 w-5" }: { name: "heart" | "clipboard" | "stethoscope" | "book" | "timer" | "vial" | "bookmark"; className?: string }) {
  const c = { className, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24", "aria-hidden": true };
  if (name === "heart") return <svg {...c}><path d="M19 14c1.5-1.4 2-3.9.8-5.8-1.3-2.1-4.2-2.5-6-1L12 8.8l-1.8-1.6c-1.8-1.5-4.7-1.1-6 1C3 10.1 3.5 12.6 5 14l7 6 7-6Z" /><path d="M3 13h4l2-4 3 8 2-4h7" /></svg>;
  if (name === "stethoscope") return <svg {...c}><path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M6 3H4" /><path d="M14 3h2" /><path d="M10 12v2a5 5 0 0 0 10 0v-1" /><circle cx="20" cy="10" r="2" /></svg>;
  if (name === "book") return <svg {...c}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 19a2.5 2.5 0 0 1 2.5-2H20" /><path d="M9 7h6" /></svg>;
  if (name === "timer") return <svg {...c}><circle cx="12" cy="13" r="7" /><path d="M12 13V9" /><path d="M12 13h3" /><path d="M9 2h6" /></svg>;
  if (name === "vial") return <svg {...c}><path d="M10 2h4" /><path d="M11 2v6l-5.5 9.5A3 3 0 0 0 8.1 22h7.8a3 3 0 0 0 2.6-4.5L13 8V2" /><path d="M8 16h8" /></svg>;
  if (name === "bookmark") return <svg {...c}><path d="M7 4.5A2.5 2.5 0 0 1 9.5 2h5A2.5 2.5 0 0 1 17 4.5V22l-5-3-5 3V4.5Z" /></svg>;
  return <svg {...c}><path d="M9 11h6" /><path d="M9 15h6" /><path d="M10 3h4" /><path d="M8 5h8" /><rect x="6" y="5" width="12" height="16" rx="2" /></svg>;
}

function iconForExam(exam: ExamGroup): "heart" | "clipboard" | "book" | "stethoscope" {
  if (exam.id.includes("final")) return "stethoscope";
  if (exam.id.includes("promo")) return "heart";
  if (exam.id.includes("prep")) return "book";
  if (exam.id.includes("sccm") || exam.id.includes("zimmerman")) return "stethoscope";
  return "clipboard";
}

function ClinicalData({ blocks }: { blocks?: ClinicalDataBlock[] }) {
  if (!blocks?.length) return null;

  return (
    <div className="my-5 space-y-4">
      {blocks.map((block, blockIndex) => (
        <section key={`${block.title}-${blockIndex}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">
          <p className="border-b border-slate-200 bg-slate-100 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {block.title}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-xs leading-relaxed text-slate-700 sm:text-sm">
              {block.columns && (
                <thead className="bg-white text-slate-500">
                  <tr>
                    {block.columns.map((column) => (
                      <th key={column} scope="col" className="border-b border-slate-200 px-3 py-2 font-bold">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${block.title}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => cellIndex === 0 ? (
                      <th key={cellIndex} scope="row" className="break-words px-3 py-2 font-semibold text-slate-800">
                        {cell}
                      </th>
                    ) : (
                      <td key={cellIndex} className="break-words px-3 py-2 text-slate-600">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function ModeVisualIcon({ type, small = false }: { type: "practice" | "test"; small?: boolean }) {
  const sz = small ? "h-14 w-14" : "h-[72px] w-[72px]";
  if (type === "practice") return (
    <svg viewBox="0 0 96 96" aria-hidden="true" className={`${sz} flex-shrink-0 drop-shadow-sm`}>
      <circle cx="48" cy="48" r="43" fill="#d9f7f1" />
      <rect x="22" y="19" width="52" height="58" rx="10" fill="#ffffff" stroke="#0f766e" strokeWidth="3" />
      <path d="M32 33.5c5.5-3.5 10.5-3.5 16 0v24c-5.5-3.5-10.5-3.5-16 0v-24Zm32 0c-5.5-3.5-10.5-3.5-16 0v24c5.5-3.5 10.5-3.5 16 0v-24Z" fill="#e6fffa" stroke="#0f766e" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 37v14M41 44h14" stroke="#0f766e" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M30 66h36" stroke="#99f6e4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" className={`${sz} flex-shrink-0 drop-shadow-sm`}>
      <circle cx="48" cy="48" r="43" fill="#ffeadf" />
      <rect x="25" y="18" width="42" height="58" rx="8" fill="#ffffff" stroke="#c2412d" strokeWidth="3" />
      <rect x="37" y="14" width="18" height="10" rx="4" fill="#fed7cc" stroke="#c2412d" strokeWidth="3" />
      <path d="m34 38 4 4 7-8M34 52h16M34 61h10" stroke="#c2412d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="66" cy="65" r="15" fill="#fff7f3" stroke="#c2412d" strokeWidth="3" />
      <path d="M66 56v9l6 3M60 49l-3-4M72 49l3-4" stroke="#c2412d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Style tokens (auto-applied based on detected screen size) ─────────────────
function makeStyles(isPhone: boolean) {
  return {
    quizWrap: isPhone
      ? "-mx-4 overflow-hidden bg-white shadow-xl shadow-slate-200/60 ring-1 ring-white/80 sm:mx-0 sm:rounded-2xl"
      : "mx-auto max-w-[1080px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50",
    headerPad: isPhone ? "border-b border-slate-200 bg-white px-5 py-5" : "border-b border-slate-200 bg-white px-7 py-5",
    backBtn: isPhone
      ? "mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-800"
      : "mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-800",
    examTitle: isPhone ? "text-xl font-black tracking-tight text-slate-950" : "text-xl font-black tracking-tight text-slate-950",
    questionMeta: isPhone ? "mt-2 text-sm font-medium text-slate-500" : "mt-1.5 text-sm font-medium text-slate-500",
    questionBadge: isPhone
      ? "rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-black text-teal-800"
      : "rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-black text-teal-800",
    tabBtn: isPhone ? "py-3.5 text-base" : "py-3 text-base",
    questionBodyPad: isPhone ? "px-5 py-6" : "relative px-7 py-7",
    questionText: isPhone
      ? "mb-6 max-w-[850px] text-xl font-bold leading-relaxed text-slate-950"
      : "mb-6 max-w-[850px] text-[19px] font-bold leading-relaxed text-slate-950",
    choiceSpace: isPhone ? "space-y-3" : "space-y-3",
    choiceBase: isPhone
      ? "w-full text-left rounded-xl border px-4 py-4 text-[15px] font-semibold leading-relaxed text-slate-700 shadow-sm shadow-slate-200/60 transition-all cursor-pointer flex items-center gap-3 "
      : "w-full text-left rounded-xl border px-5 py-3.5 text-[15px] font-semibold leading-relaxed text-slate-700 shadow-sm shadow-slate-200/60 transition-all cursor-pointer flex items-center gap-3 ",
    choiceLetterBase: isPhone
      ? "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-black "
      : "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black ",
    submitBtn: isPhone
      ? "mt-6 w-full rounded-xl bg-teal-700 py-3.5 text-base font-black text-white shadow-md shadow-teal-200 transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
      : "mt-5 w-full rounded-xl bg-teal-700 py-3.5 text-sm font-black text-white shadow-md shadow-teal-200 transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40",
    navGrid: isPhone ? "mt-5 grid grid-cols-2 gap-3" : "mt-4 grid grid-cols-2 gap-2.5",
    prevBtn: isPhone
      ? "rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors"
      : "rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors",
    nextBtn: isPhone
      ? "rounded-xl bg-teal-700 py-3.5 text-sm font-black text-white transition-colors hover:bg-teal-800"
      : "rounded-xl bg-teal-700 py-3 text-sm font-black text-white transition-colors hover:bg-teal-800",
    progressWrap: isPhone ? "mt-6 flex items-center justify-center" : "mt-4 flex items-center justify-center",
    progressPill: isPhone
      ? "rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-xl shadow-slate-200"
      : "rounded-full bg-white px-5 py-2 text-sm font-black text-slate-700 shadow-lg shadow-slate-200",
    progressDot: "mr-2 inline-block h-2 w-2 rounded-full bg-teal-500",
    scoreBubble: isPhone
      ? "absolute bottom-20 right-4 hidden h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-center text-xs font-bold text-white shadow-xl sm:flex"
      : "absolute bottom-16 right-3 hidden h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-center text-xs font-bold text-white shadow-lg sm:flex",
    explanationBox: (state: AnswerState) =>
      (isPhone ? "rounded-xl border-2 p-4 text-[15px] space-y-2 " : "rounded-xl border p-4 text-sm space-y-2 ") +
      (state === "correct" ? "bg-green-50 border-green-200" : state === "revealed" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"),
    revealBtn: isPhone
      ? "mt-3 w-full rounded-2xl border-2 border-amber-300 bg-amber-50 py-3.5 text-base font-black text-amber-700 transition-colors hover:bg-amber-100"
      : "mt-3 w-full rounded-xl border-2 border-amber-300 bg-amber-50 py-3 text-sm font-black text-amber-700 transition-colors hover:bg-amber-100",
    homeModeGrid: isPhone ? "space-y-5" : "grid grid-cols-2 gap-5",
    modeCardPad: isPhone ? "p-6 sm:p-7" : "p-5",
    modeCardMinH: isPhone ? "min-h-[260px]" : "min-h-[230px]",
    modeAvailBadge: isPhone ? "rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-600" : "rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-600",
    modeHeading: isPhone ? "text-2xl font-black tracking-tight text-slate-950" : "text-2xl font-black tracking-tight text-slate-950",
    modeDesc: isPhone ? "mt-3 text-sm font-semibold leading-relaxed text-slate-600" : "mt-3 text-sm font-semibold leading-relaxed text-slate-600",
    modeStartPractice: isPhone ? "relative mt-6 inline-flex items-center gap-2 text-lg font-black text-blue-600 hover:text-blue-700 transition-colors" : "relative mt-5 inline-flex items-center gap-2 text-base font-black text-blue-600 hover:text-blue-700 transition-colors",
    modeStartTest: isPhone ? "relative mt-6 inline-flex items-center gap-2 text-lg font-black text-red-600 hover:text-red-700 transition-colors" : "relative mt-5 inline-flex items-center gap-2 text-base font-black text-red-600 hover:text-red-700 transition-colors",
    modeArrow: isPhone ? "text-2xl leading-none" : "text-2xl leading-none",
    examGridCols: isPhone ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-3",
    sectionHeading: "text-xs font-black text-slate-500 uppercase tracking-wider mb-3",
  };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>(builtInQuestions);
  const [selectedExam, setSelectedExam] = useState<ExamGroup | null>(null);
  const [activeSubCat, setActiveSubCat] = useState<string>("all");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState<Progress>({});
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [markedQuestionIds, setMarkedQuestionIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>("sequential");
  const [viewMode, setViewMode] = useState<ViewMode>("study");
  const [pendingMode, setPendingMode] = useState<ViewMode | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("question");
  // Auto-detected: phone/tablet < 1024px, computer >= 1024px
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("phone");

  useEffect(() => {
    // Detect device type from screen width; update on resize
    const detect = () => setDeviceMode(window.innerWidth >= 1024 ? "computer" : "phone");
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { try { const c: Question[] = JSON.parse(stored); setAllQuestions([...builtInQuestions, ...c]); } catch {} }
    const saved = localStorage.getItem(SESSIONS_KEY);
    if (saved) { try { setSessions(JSON.parse(saved)); } catch {} }
  }, []);

  const s = makeStyles(deviceMode === "phone");

  const loadQuiz = useCallback((questions: Question[], randomize: boolean) => {
    const ordered = randomize ? shuffle(questions) : [...questions];
    setQuizQuestions(ordered);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setShowSummary(false);
    setActiveTab("question");
  }, []);

  const getExamQuestions = useCallback((exam: ExamGroup, subCat: string, qs: Question[]) => {
    let filtered = qs.filter(exam.match);
    if (subCat !== "all" && exam.subCategoryPrefix) filtered = filtered.filter((q) => q.category === subCat);
    return filtered;
  }, []);

  useEffect(() => {
    if (selectedExam && allQuestions.length > 0 && !activeSessionId) {
      loadQuiz(getExamQuestions(selectedExam, activeSubCat, allQuestions), quizMode === "random");
    }
  }, [selectedExam, activeSubCat, allQuestions, activeSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSessions = (updated: QuizSession[]) => {
    setSessions(updated);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  };

  const updateActiveSession = (patch: Partial<QuizSession>) => {
    if (!activeSessionId) return;
    saveSessions(sessions.map((s) => s.id === activeSessionId ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s));
  };

  const handleSelect = (letter: string) => {
    if (revealed) return;
    setActiveTab("question");
    setSelected(letter);
  };

  const handleSubmit = () => {
    if (!selected || !quizQuestions[current]) return;
    const q = quizQuestions[current];
    const state: AnswerState = selected === q.correctAnswer ? "correct" : "incorrect";
    const updatedProgress = { ...progress, [q.id]: { selected, state } };
    setProgress(updatedProgress);
    updateActiveSession({ progress: updatedProgress });
    setRevealed(true);
    setActiveTab("explanation");
  };

  const handleReveal = () => {
    const q = quizQuestions[current];
    if (!q || revealed) return;
    const correctLetter = q.correctAnswer ?? "";
    const updatedProgress = { ...progress, [q.id]: { selected: correctLetter, state: "revealed" as AnswerState } };
    setProgress(updatedProgress);
    setSelected(correctLetter);
    updateActiveSession({ progress: updatedProgress });
    setRevealed(true);
    setActiveTab("explanation");
  };

  const toggleQuestionMark = () => {
    const questionId = quizQuestions[current]?.id;
    if (!questionId) return;
    const updatedMarks = markedQuestionIds.includes(questionId)
      ? markedQuestionIds.filter((id) => id !== questionId)
      : [...markedQuestionIds, questionId];
    setMarkedQuestionIds(updatedMarks);
    updateActiveSession({ markedQuestionIds: updatedMarks });
  };

  const handleNext = () => {
    if (current + 1 >= quizQuestions.length) {
      updateActiveSession({ currentIndex: current, status: "completed" });
      setShowSummary(true);
    } else {
      const next = current + 1;
      const nextQ = quizQuestions[next];
      const prev = progress[nextQ.id];
      setCurrent(next);
      updateActiveSession({ currentIndex: next });
      setSelected(prev?.selected ?? null);
      setRevealed(!!prev);
      setActiveTab(prev ? "explanation" : "question");
    }
  };

  const handlePrev = () => {
    if (current === 0) return;
    const prev = current - 1;
    const prevQ = quizQuestions[prev];
    const saved = progress[prevQ.id];
    setCurrent(prev);
    updateActiveSession({ currentIndex: prev });
    setSelected(saved?.selected ?? null);
    setRevealed(!!saved);
    setActiveTab(saved ? "explanation" : "question");
  };

  const handleJump = (idx: number) => {
    const q = quizQuestions[idx];
    const saved = progress[q.id];
    setCurrent(idx);
    updateActiveSession({ currentIndex: idx });
    setSelected(saved?.selected ?? null);
    setRevealed(!!saved);
    setShowSummary(false);
    setActiveTab(saved ? "explanation" : "question");
  };

  const resetProgress = () => {
    setProgress({});
    setMarkedQuestionIds([]);
    updateActiveSession({ progress: {}, markedQuestionIds: [], currentIndex: 0, status: "active" });
    if (selectedExam) {
      const ordered = quizMode === "random"
        ? shuffle(getExamQuestions(selectedExam, activeSubCat, allQuestions))
        : getExamQuestions(selectedExam, activeSubCat, allQuestions);
      setQuizQuestions(ordered);
      setCurrent(0);
      setSelected(null);
      setRevealed(false);
      setShowSummary(false);
      setActiveTab("question");
      updateActiveSession({ questionIds: ordered.map((q) => q.id) });
    }
  };

  const toggleQuizMode = () => {
    const next: QuizMode = quizMode === "sequential" ? "random" : "sequential";
    setQuizMode(next);
    if (selectedExam) {
      const ordered = next === "random"
        ? shuffle(getExamQuestions(selectedExam, activeSubCat, allQuestions))
        : getExamQuestions(selectedExam, activeSubCat, allQuestions);
      setQuizQuestions(ordered);
      setCurrent(0);
      setSelected(null);
      setRevealed(false);
      setShowSummary(false);
      setActiveTab("question");
      updateActiveSession({ quizMode: next, questionIds: ordered.map((q) => q.id), currentIndex: 0 });
    }
  };

  const handleSelectExam = (exam: ExamGroup, preferredViewMode: ViewMode = pendingMode ?? viewMode, preferredQuizMode: QuizMode = quizMode) => {
    const questions = getExamQuestions(exam, "all", allQuestions);
    const ordered = preferredQuizMode === "random" ? shuffle(questions) : questions;
    const now = new Date().toISOString();
    const session: QuizSession = {
      id: `session-${Date.now()}`, title: `${exam.label} session`,
      examId: exam.id, examLabel: exam.label, subCat: "all",
      quizMode: preferredQuizMode, viewMode: preferredViewMode,
      questionIds: ordered.map((q) => q.id), currentIndex: 0, progress: {},
      markedQuestionIds: [],
      status: "active", createdAt: now, updatedAt: now,
    };
    saveSessions([session, ...sessions]);
    setActiveSessionId(session.id);
    setSelectedExam(exam);
    setActiveSubCat("all");
    setQuizMode(preferredQuizMode);
    setViewMode(preferredViewMode);
    setQuizQuestions(ordered);
    setCurrent(0);
    setProgress({});
    setMarkedQuestionIds([]);
    setSelected(null);
    setRevealed(false);
    setShowSummary(false);
    setActiveTab("question");
  };

  const handleStartAllPrep = (nextViewMode: ViewMode) => { setPendingMode(nextViewMode); setViewMode(nextViewMode); };

  const handleResumeSession = (session: QuizSession) => {
    const exam = examGroups.find((g) => g.id === session.examId);
    if (!exam) return;
    const byId = new Map(allQuestions.map((q) => [q.id, q]));
    let ordered = session.questionIds.map((id) => byId.get(id)).filter(Boolean) as Question[];
    if (ordered.length === 0) ordered = getExamQuestions(exam, session.subCat, allQuestions);
    const safeIndex = Math.min(session.currentIndex, Math.max(ordered.length - 1, 0));
    const q = ordered[safeIndex];
    const saved = q ? session.progress[q.id] : undefined;
    setActiveSessionId(session.id);
    setSelectedExam(exam);
    setActiveSubCat(session.subCat);
    setQuizMode(session.quizMode);
    setViewMode(session.viewMode);
    setQuizQuestions(ordered);
    setCurrent(safeIndex);
    setProgress(session.progress);
    setMarkedQuestionIds(session.markedQuestionIds ?? []);
    setSelected(saved?.selected ?? null);
    setRevealed(!!saved);
    setShowSummary(session.status === "completed");
    setActiveTab(saved ? "explanation" : "question");
    saveSessions(sessions.map((item) => item.id === session.id ? { ...item, status: "active" as const, updatedAt: new Date().toISOString() } : item));
  };

  const handleBackToSelection = () => {
    if (activeSessionId) updateActiveSession({ currentIndex: current, progress, quizMode, viewMode, status: "paused" });
    setSelectedExam(null);
    setActiveSessionId(null);
    setPendingMode(null);
    setSelected(null);
    setRevealed(false);
    setMarkedQuestionIds([]);
    setShowSummary(false);
    setActiveTab("question");
  };

  const handleDeleteSession = (sessionId: string) => { saveSessions(sessions.filter((s) => s.id !== sessionId)); };

  const handleChangeSubCat = (subCat: string) => {
    if (!selectedExam) return;
    const ordered = quizMode === "random"
      ? shuffle(getExamQuestions(selectedExam, subCat, allQuestions))
      : getExamQuestions(selectedExam, subCat, allQuestions);
    setActiveSubCat(subCat);
    setQuizQuestions(ordered);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setShowSummary(false);
    setActiveTab("question");
    updateActiveSession({ subCat, questionIds: ordered.map((q) => q.id), currentIndex: 0, status: "active" });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!selectedExam || showSummary || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      const activeQuestion = quizQuestions[current];
      if (!activeQuestion) return;

      if (/^[1-9]$/.test(event.key) && !revealed) {
        const letter = Object.keys(activeQuestion.choices).sort()[Number(event.key) - 1];
        if (letter) {
          event.preventDefault();
          handleSelect(letter);
        }
      }
      if (event.key === "Enter" && !revealed && selected) {
        event.preventDefault();
        handleSubmit();
      }
      if (event.key === "ArrowRight" && revealed) {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "ArrowLeft" && revealed && current > 0) {
        event.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, quizQuestions, revealed, selected, selectedExam, showSummary, progress, sessions]); // Session updates keep shortcuts aligned with saved state.

  // ── Selection screen ───────────────────────────────────────────────────────
  if (!selectedExam) {
    const availableExamIds = new Set(examGroups.map((e) => e.id));
    const visibleSessions = sessions.filter((ses) => ses.status !== "completed" && availableExamIds.has(ses.examId));
    const prepTotal = allQuestions.filter((q) => q.category.startsWith("PREP")).length;
    const totalQuestionCount = allQuestions.length;
    const sourceCount = examGroups.length;
    const latestSession = [...sessions].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
    const latestAnswered = latestSession ? Object.keys(latestSession.progress).length : 0;
    const latestTotal = latestSession?.questionIds.length ?? 0;
    const latestProgress = latestTotal > 0 ? Math.round((latestAnswered / latestTotal) * 100) : 0;

    const progressFor = (exam: ExamGroup) => {
      const total = allQuestions.filter(exam.match).length;
      const latest = sessions.filter((ses) => ses.examId === exam.id)[0];
      const answered = latest ? Object.keys(latest.progress).length : 0;
      const correct = latest ? Object.values(latest.progress).filter((p) => p.state === "correct").length : 0;
      return { total, answered, correct };
    };

    const ExamCard = ({ exam }: { exam: ExamGroup }) => {
      const ac = accentClasses[exam.accent];
      const { total, answered, correct } = progressFor(exam);
      const pct = total > 0 ? (correct / total) * 100 : 0;
      const isTest = pendingMode === "test";
      return (
        <button onClick={() => handleSelectExam(exam)} className={`group w-full rounded-2xl border border-white/80 bg-white p-4 text-left shadow-lg shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:shadow-xl ${ac.card}`}>
          <div className="flex items-start gap-3">
            <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${ac.badge}`}>
              <MedicalIcon name={iconForExam(exam)} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-black text-slate-900 group-hover:text-slate-950 sm:text-base">{exam.label}</h3>
                <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500 sm:text-xs">{total} Qs</span>
              </div>
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500 sm:text-xs">{exam.description}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-black ${isTest ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
              {isTest ? "Start Test" : "Start Practice"}
            </span>
            <span className="text-xl font-black text-slate-300 transition-colors group-hover:text-slate-500">→</span>
          </div>
          {answered > 0 && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <div className="mb-2 flex justify-between text-xs font-bold text-slate-400">
                <span>Latest: {answered}/{total} answered</span>
                <span className="text-teal-700 font-medium">{correct} correct</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200">
                <div className="h-1.5 rounded-full bg-teal-600 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </button>
      );
    };

    return (
      <div className="space-y-4 lg:space-y-5">
        <section className="relative isolate overflow-hidden rounded-[30px] border border-white/80 bg-[#f6fcfc] shadow-xl shadow-slate-200/70">
          <img src="/PICUMCQBANK/images/picu-hero-illustration.png" alt="Pediatric critical care monitor and bedside learning tools" className="absolute inset-0 -z-20 h-full w-full object-cover object-[67%_center]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/95 to-white/25 lg:via-white/78" />
          <div className="grid min-h-[460px] gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center lg:p-10">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-teal-100/85 px-3 py-1.5 text-[11px] font-black tracking-wide text-teal-800">
                <span className="text-base leading-none">✦</span> WELCOME TO PICU MCQ BANK
              </p>
              <h1 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-4xl lg:text-[48px]">
                Focused practice.<br />
                Stronger <span className="text-teal-700">critical care.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                High-yield MCQs for pediatric critical care. Build knowledge, track progress, and prepare with confidence.
              </p>
              <div className="mt-7 flex items-center gap-3 text-sm text-slate-700">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-teal-200 bg-white/85 text-teal-700 shadow-sm"><MedicalIcon name="stethoscope" className="h-6 w-6" /></span>
                <span><span className="block font-bold text-slate-900">Pediatric critical care review</span><span className="block text-xs text-slate-500">Structured PREP learning sessions</span></span>
              </div>
            </div>

            <aside className="w-full rounded-[24px] border border-white/90 bg-white/90 p-5 shadow-xl shadow-slate-300/30 backdrop-blur-md sm:p-6">
              <div className="grid grid-cols-3 divide-x divide-slate-200">
                <div className="pr-3 text-center sm:pr-4">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700"><MedicalIcon name="book" className="h-5 w-5" /></span>
                  <p className="mt-2 text-2xl font-black text-teal-800 sm:text-3xl">{prepTotal}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">PREP MCQs</p>
                </div>
                <div className="px-3 text-center sm:px-4">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><MedicalIcon name="clipboard" className="h-5 w-5" /></span>
                  <p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{totalQuestionCount}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Questions</p>
                </div>
                <div className="pl-3 text-center sm:pl-4">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><MedicalIcon name="vial" className="h-5 w-5" /></span>
                  <p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{sourceCount}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Sets</p>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700"><span>Continue your journey</span><span className="font-black text-teal-700">{latestProgress}%</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${latestProgress}%` }} /></div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">{latestSession ? `${latestAnswered} of ${latestTotal} questions answered in your latest session.` : "Start a practice or test session to track your progress."}</p>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600"><span className="mr-2 text-xl font-black text-teal-700">“</span>Continuous learning is the key to better care.</div>
            </aside>
          </div>
        </section>

        {/* Practice / Test mode choices */}
        {pendingMode === null ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="relative min-h-[260px] overflow-hidden rounded-[26px] border border-white bg-[#eefcf9] p-6 shadow-lg shadow-slate-200/60 sm:p-7">
              <div className="absolute -right-7 -bottom-9 h-48 w-48 rounded-full border-[22px] border-teal-100/80" />
              <div className="absolute right-8 top-7"><ModeVisualIcon type="practice" small={deviceMode === "computer"} /></div>
              <div className="relative max-w-[62%] sm:max-w-[65%]">
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Available</span>
                <h2 className="mt-5 text-2xl font-black tracking-tight text-teal-800 sm:text-3xl">Practice Mode</h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">Study at your own pace with explanations, PREP pearls, and progress tracking.</p>
                <button onClick={() => handleStartAllPrep("study")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white shadow-md shadow-teal-200 transition-colors hover:bg-teal-700">Start Practicing <span className="text-xl leading-none">→</span></button>
              </div>
            </section>

            <section className="relative min-h-[260px] overflow-hidden rounded-[26px] border border-white bg-[#fff6f0] p-6 shadow-lg shadow-slate-200/60 sm:p-7">
              <div className="absolute -right-7 -bottom-9 h-48 w-48 rounded-full border-[22px] border-orange-100/90" />
              <div className="absolute right-8 top-7"><ModeVisualIcon type="test" small={deviceMode === "computer"} /></div>
              <div className="relative max-w-[62%] sm:max-w-[65%]">
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Available</span>
                <h2 className="mt-5 text-2xl font-black tracking-tight text-[#d73a2c] sm:text-3xl">Test Mode</h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">Simulated exam with scoring and no explanations during the test.</p>
                <button onClick={() => handleStartAllPrep("test")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#dc3b2d] px-5 py-3 text-sm font-black text-white shadow-md shadow-orange-200 transition-colors hover:bg-[#bd3025]">Start Test <span className="text-xl leading-none">→</span></button>
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-[28px] border border-white bg-white/90 p-5 shadow-2xl shadow-slate-200/70 sm:p-6">
            <button onClick={() => setPendingMode(null)} className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-200 transition-colors">
              ← Back
            </button>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{pendingMode === "study" ? "Practice Mode" : "Test Mode"}</p>
                <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">Choose your question set</h1>
                <p className="mt-2 text-xs font-semibold text-slate-500 sm:text-sm">Select a PREP year, self-assessment book, or combined question bank.</p>
              </div>
              <span className={`rounded-full px-4 py-2 text-sm font-black ${pendingMode === "study" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}>
                {pendingMode === "study" ? "Practice" : "Test"}
              </span>
            </div>
          </div>
        )}

        {pendingMode === null && (
          <>
            <section className="grid overflow-hidden rounded-[24px] border border-white bg-white shadow-lg shadow-slate-200/50 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "heart" as const, title: "High-yield content", text: "Focused on what matters in PICU exams." },
                { icon: "book" as const, title: "Detailed explanations", text: "Understand the why, not only the answer." },
                { icon: "timer" as const, title: "Track progress", text: "Monitor performance across each session." },
                { icon: "stethoscope" as const, title: "Flexible sessions", text: "Pause and continue when you are ready." },
              ].map((item, index) => (
                <div key={item.title} className={`flex items-start gap-3 px-5 py-5 ${index > 0 ? "border-t border-slate-100 sm:border-t-0 lg:border-l" : ""} ${index === 2 ? "sm:border-t lg:border-t-0" : ""}`}>
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700"><MedicalIcon name={item.icon} className="h-5 w-5" /></span>
                  <span><span className="block text-sm font-black text-slate-800">{item.title}</span><span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{item.text}</span></span>
                </div>
              ))}
            </section>

            <footer className="flex flex-col gap-4 rounded-[24px] bg-[#075d69] px-5 py-5 text-white shadow-lg shadow-teal-950/20 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10"><MedicalIcon name="heart" className="h-5 w-5" /></span>
                <span><span className="block text-sm font-black">PICU MCQ Bank</span><span className="block text-xs text-teal-100">Pediatric critical care review</span></span>
              </div>
              <p className="text-sm font-semibold text-teal-50">Knowledge. Compassion. Excellence.</p>
            </footer>
          </>
        )}

        {/* Paused sessions — shown prominently above exam picker */}
        {pendingMode !== null && visibleSessions.length > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700">
              <MedicalIcon name="timer" className="h-4 w-4" />
              Paused Sessions
              <span className="ml-1 rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">{visibleSessions.length}</span>
            </h2>
            <div className="flex flex-col gap-2">
              {visibleSessions.map((ses) => {
                const answered = Object.keys(ses.progress).length;
                const correct = Object.values(ses.progress).filter((p) => p.state === "correct").length;
                const pct = ses.questionIds.length > 0 ? (answered / ses.questionIds.length) * 100 : 0;
                return (
                  <div key={ses.id} className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
                    <span className="hidden sm:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <MedicalIcon name="timer" className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-slate-800 truncate">{ses.examLabel}</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                          {ses.viewMode === "study" ? "Study" : "Test"} · {ses.quizMode}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs text-slate-400 mb-2">
                        <span>Q {Math.min(ses.currentIndex + 1, ses.questionIds.length)} of {ses.questionIds.length}</span>
                        <span>{answered} answered · {correct} correct</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <button onClick={() => handleResumeSession(ses)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm">
                        <MedicalIcon name="clipboard" className="h-4 w-4" /> Resume
                      </button>
                      <button onClick={() => handleDeleteSession(ses.id)} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-500 text-sm hover:bg-red-50 hover:text-red-600 transition-colors">
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Exam grid */}
        {pendingMode !== null && (
          <div className="space-y-5">
            <section>
              <h2 className={s.sectionHeading}>PREP Exams</h2>
              <div className={`grid ${s.examGridCols} gap-3`}>{prepExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div>
            </section>
            <section>
              <h2 className={s.sectionHeading}>Self-Assessment Books</h2>
              <div className={`grid ${s.examGridCols} gap-3`}>
                {sccmExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
                {zimmermanExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
                {studyGuideExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
                {picumcqExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
              </div>
            </section>
            <section>
              <h2 className={s.sectionHeading}>Combined Study</h2>
              <div className={`grid ${s.examGridCols} gap-3`}>{specialExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div>
            </section>
          </div>
        )}
      </div>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────
  const ac = accentClasses[selectedExam.accent];
  const totalCount = quizQuestions.length;
  const answeredInView = quizQuestions.filter((q) => progress[q.id]).length;
  const correctInView = quizQuestions.filter((q) => progress[q.id]?.state === "correct").length;
  const remainingInView = totalCount - answeredInView;
  const isCurrentQuestionMarked = markedQuestionIds.includes(quizQuestions[current]?.id);
  const subCats = selectedExam.subCategoryPrefix
    ? Array.from(new Set(allQuestions.filter(selectedExam.match).map((q) => q.category))).sort()
    : [];

  if (showSummary) {
    return (
      <div className="space-y-6">
        <button onClick={handleBackToSelection} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-lg shadow-slate-200 hover:text-slate-950">← Back to exams</button>
        <div className="rounded-[28px] border border-white bg-white p-8 text-center shadow-2xl shadow-slate-200/70">
          <p className="mb-1 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{selectedExam.label}</p>
          <div className="mb-2 text-6xl font-black tracking-tight text-slate-950">{correctInView} / {totalCount}</div>
          <div className="mb-6 font-semibold text-slate-500">Questions correct</div>
          <div className="mb-6 h-3 w-full rounded-full bg-slate-100">
            <div className="h-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all" style={{ width: `${(correctInView / totalCount) * 100}%` }} />
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={resetProgress} className={`rounded-2xl px-6 py-3 text-sm font-black text-white transition-colors ${ac.btn}`}>Restart</button>
            <button onClick={() => handleJump(0)} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-700 hover:bg-slate-200 transition-colors">Review Answers</button>
            <button onClick={handleBackToSelection} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-700 hover:bg-slate-200 transition-colors">Change Exam</button>
          </div>
        </div>
        <QuestionGrid questions={quizQuestions} progress={progress} onJump={handleJump} />
      </div>
    );
  }

  if (quizQuestions.length === 0) return <div className="text-center py-20 text-slate-400">Loading questions…</div>;

  const q = quizQuestions[current];
  const savedState = progress[q.id];
  const choiceLetters = Object.keys(q.choices).sort();
  const clinicalPresentation = inlineClinicalData(q);
  const questionText = clinicalPresentation.text;

  const tabs: { id: ActiveTab; icon: "clipboard" | "book" | "bookmark"; label: string }[] = [
    { id: "question",    icon: "clipboard", label: "Question" },
    { id: "explanation", icon: "book", label: "Explanation" },
    { id: "notes",       icon: "bookmark", label: "Review" },
  ];

  return (
    <div className={s.quizWrap}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className={s.headerPad}>
        <button onClick={handleBackToSelection} className={s.backBtn}>
          ← Back to sessions
        </button>
        <div className="flex items-start justify-between gap-3 mt-1">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm shadow-teal-200">
                <MedicalIcon name={iconForExam(selectedExam)} className="h-5 w-5" />
              </span>
              <h1 className={s.examTitle}>{selectedExam.label}</h1>
            </div>
            <p className={s.questionMeta}>
              Question <span className="font-semibold text-slate-700">{current + 1}</span> of {totalCount}
            </p>
          </div>
          <span className={s.questionBadge}>Q{current + 1}</span>
        </div>
        <div className="mt-5 h-2 w-full rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-teal-600 transition-all" style={{ width: `${((current + 1) / totalCount) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 border-b border-slate-200 bg-slate-50 sm:grid-cols-4 sm:divide-y-0">
        <div className="px-5 py-3 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Answered</p>
          <p className="mt-0.5 text-sm font-black text-slate-800">{answeredInView} <span className="font-semibold text-slate-400">/ {totalCount}</span></p>
        </div>
        <div className="px-5 py-3 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Accuracy</p>
          <p className="mt-0.5 text-sm font-black text-teal-700">{answeredInView ? `${Math.round((correctInView / answeredInView) * 100)}%` : "--"}</p>
        </div>
        <div className="px-5 py-3 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Marked</p>
          <p className="mt-0.5 text-sm font-black text-amber-700">{markedQuestionIds.length}</p>
        </div>
        <div className="px-5 py-3 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Remaining</p>
          <p className="mt-0.5 text-sm font-black text-slate-700">{remainingInView}</p>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 border-b border-slate-200 bg-white/95">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isLocked = tab.id === "explanation" && !revealed;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 ${s.tabBtn} border-b-2 transition-colors ${
                isActive
                  ? "border-teal-600 text-teal-800 bg-teal-50/70"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              } ${isLocked ? "opacity-40" : ""}`}
            >
              <MedicalIcon name={tab.icon} className="h-4 w-4" />
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Sub-category filter ──────────────────────────────────────── */}
      {activeTab === "question" && subCats.length > 0 && (() => {
        const isSccm = selectedExam.id.startsWith("sccm");
        const isZimm = selectedExam.id.startsWith("zimmerman");
        const filterLabel = isSccm ? "Filter chapters" : isZimm ? "Filter parts" : "Filter months";
        const allLabel    = isSccm ? "All chapters"   : isZimm ? "All parts"    : "All months";
        return (
          <details className="border-b border-slate-100 bg-white">
            <summary className="cursor-pointer list-none px-5 py-3 text-sm font-semibold text-slate-500 marker:hidden">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-500" />{filterLabel}
              </span>
            </summary>
            <div className="flex gap-2 overflow-x-auto px-5 pb-3">
              <button onClick={() => handleChangeSubCat("all")} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${activeSubCat === "all" ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-500"}`}>{allLabel}</button>
              {subCats.map((cat) => (
                <button key={cat} onClick={() => handleChangeSubCat(cat)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${activeSubCat === cat ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-500"}`}>
                  {cat.replace(selectedExam.subCategoryPrefix! + " - ", "")}
                </button>
              ))}
            </div>
          </details>
        );
      })()}

      {/* ── Tab: Question ────────────────────────────────────────────── */}
      {activeTab === "question" && (
        <div className={s.questionBodyPad}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${ac.badge}`}>
              <MedicalIcon name="clipboard" className="h-3 w-3" />{q.category}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleQuestionMark}
                aria-pressed={isCurrentQuestionMarked}
                title={isCurrentQuestionMarked ? "Remove from review" : "Mark for review"}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${isCurrentQuestionMarked ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:text-amber-700"}`}
              >
                <MedicalIcon name="bookmark" className="h-4 w-4" />
              </button>
              <button onClick={toggleQuizMode} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-teal-200 hover:text-teal-700 transition-colors">
                {quizMode === "sequential" ? "Sequential" : "Random"}
              </button>
              <button onClick={resetProgress} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-red-200 hover:text-red-600 transition-colors">Reset</button>
            </div>
          </div>

          <h2 className={`${s.questionText} whitespace-pre-line`}>{questionText}</h2>

          <ClinicalData blocks={clinicalPresentation.blocks} />

          {q.images && q.images.length > 0 && (
            <div className="my-4 flex flex-col gap-3">
              {q.images.map((img, i) => (
                <img
                  key={i}
                  src={`/PICUMCQBANK${img}`}
                  alt={`Figure ${i + 1}`}
                  className="max-w-full rounded-xl border border-slate-200 shadow-sm object-contain mx-auto"
                  style={{ maxHeight: "400px" }}
                />
              ))}
            </div>
          )}

          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Select one answer</p>
          <div className={s.choiceSpace}>
            {choiceLetters.map((letter) => {
              const isSelected = selected === letter;
              const isCorrect = letter === q.correctAnswer;
              let style = s.choiceBase;
              const isRevealedState = savedState?.state === "revealed";
              if (!revealed) {
                style += isSelected ? "border-teal-600 bg-teal-50 text-teal-950" : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/40";
              } else if (isRevealedState) {
                if (isCorrect) style += "border-amber-400 bg-amber-50 text-amber-900";
                else style += "border-slate-200 bg-white text-slate-400";
              } else {
                if (isCorrect) style += "border-green-500 bg-green-50 text-green-900";
                else if (isSelected) style += "border-red-400 bg-red-50 text-red-800";
                else style += "border-slate-200 bg-white text-slate-400";
              }
              return (
                <button key={letter} className={style} onClick={() => handleSelect(letter)}>
                  <span className={`${s.choiceLetterBase}${
                    !revealed
                      ? isSelected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-500"
                      : isRevealedState
                      ? isCorrect ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-400"
                      : isCorrect ? "bg-green-500 text-white"
                      : isSelected ? "bg-red-400 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}>{letter}</span>
                  <span>{q.choices[letter]}</span>
                </button>
              );
            })}
          </div>

          {!revealed ? (
            <>
              <button onClick={handleSubmit} disabled={!selected} className={s.submitBtn}>Check answer</button>
              {viewMode === "study" && <button onClick={handleReveal} className={s.revealBtn}>Show Answer</button>}
            </>
          ) : (
            <div className={s.navGrid}>
              {current > 0 && <button onClick={handlePrev} className={s.prevBtn}>⬅ Previous</button>}
              <button onClick={handleNext} className={`${s.nextBtn} ${current === 0 ? "col-span-2" : ""}`}>
                {current + 1 >= totalCount ? "See results" : "Next question →"}
              </button>
            </div>
          )}

          <div className={s.progressWrap}>
            <span className={s.progressPill}>
              <span className={s.progressDot} />
              {current + 1} of {totalCount}
              {answeredInView > 0 && <span className="ml-2 text-teal-600 font-semibold">· {Math.round((correctInView / answeredInView) * 100)}% correct</span>}
            </span>
          </div>
        </div>
      )}

      {/* ── Tab: Explanation ─────────────────────────────────────────── */}
      {activeTab === "explanation" && (
        <div className={s.questionBodyPad}>
          {!revealed ? (
            <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><MedicalIcon name="book" className="h-7 w-7" /></span>
              <p className="text-base font-semibold text-slate-500">Answer the question first</p>
              <p className="text-sm text-slate-400">Select an answer and tap Submit to see the explanation.</p>
              <button onClick={() => setActiveTab("question")} className="mt-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors">
                Go to question →
              </button>
            </div>
          ) : (
            <>
              {q.images && q.images.length > 0 && (
                <div className="mb-4 flex flex-col gap-3">
                  {q.images.map((img, i) => (
                    <img
                      key={i}
                      src={`/PICUMCQBANK${img}`}
                      alt={`Figure ${i + 1}`}
                      className="max-w-full rounded-xl border border-slate-200 shadow-sm object-contain mx-auto"
                      style={{ maxHeight: "400px" }}
                    />
                  ))}
                </div>
              )}

              <div className={s.explanationBox(savedState?.state ?? "incorrect")}>
                <div className={`font-semibold flex items-start gap-2 ${savedState?.state === "correct" ? "text-green-800" : savedState?.state === "revealed" ? "text-amber-800" : "text-red-800"}`}>
                  <MedicalIcon name={savedState?.state === "correct" ? "heart" : savedState?.state === "revealed" ? "book" : "vial"} className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{savedState?.state === "correct" ? "Correct!" : savedState?.state === "revealed" ? "Answer Revealed" : "Incorrect"} — Correct answer: {q.correctAnswer}. {q.correctAnswerText}</span>
                </div>
                {viewMode === "study" && (
                  <>
                    {q.explanation && (() => {
                      const pearlMatch = /\bPREP\s+Pearls?\s*:/i.exec(q.explanation!);
                      const pearlIdx = pearlMatch?.index ?? -1;
                      const mainText = pearlIdx >= 0 ? q.explanation!.slice(0, pearlIdx).trim() : q.explanation;
                      const pearlText = pearlMatch ? q.explanation!.slice(pearlIdx + pearlMatch[0].length).trim() : null;
                      return (
                        <>
                          {mainText && <p className="text-slate-700 leading-relaxed mt-2">{mainText}</p>}
                          {pearlText && (
                            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">PREP Pearls</p>
                              <ul className="space-y-1">
                                {pearlText.split(/\s*(?:\||•|¢)\s*/).filter(Boolean).map((pearl, i) => (
                                  <li key={i} className="text-sm text-amber-900 flex gap-2">
                                    <span className="text-amber-500 flex-shrink-0">•</span><span>{pearl}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    {!q.explanation && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        The imported source does not include an explanation for this question.
                      </p>
                    )}
                    {q.source && <p className="text-xs text-slate-400 italic border-t border-slate-200 pt-2 mt-2">Source: {q.source}</p>}
                  </>
                )}
                {viewMode === "test" && savedState?.state === "incorrect" && (
                  <p className="text-xs text-slate-500 mt-1">Switch to Study mode to see the explanation.</p>
                )}
              </div>

              <div className={s.navGrid}>
                {current > 0 && <button onClick={handlePrev} className={s.prevBtn}>⬅ Previous</button>}
                <button onClick={handleNext} className={`${s.nextBtn} ${current === 0 ? "col-span-2" : ""}`}>
                  {current + 1 >= totalCount ? "See results" : "Next question →"}
                </button>
              </div>

              <div className={s.progressWrap}>
                <span className={s.progressPill}>
                  <span className={s.progressDot} />
                  {current + 1} of {totalCount}
                  {answeredInView > 0 && <span className="ml-2 text-teal-600 font-semibold">· {Math.round((correctInView / answeredInView) * 100)}% correct</span>}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: Notes ───────────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <div className="p-4">
          <QuestionGrid questions={quizQuestions} progress={progress} markedQuestionIds={markedQuestionIds} onJump={(idx) => { handleJump(idx); setActiveTab("question"); }} currentIdx={current} />
        </div>
      )}
    </div>
  );
}

// ── Question grid ─────────────────────────────────────────────────────────────
function QuestionGrid({ questions, progress, markedQuestionIds = [], onJump, currentIdx }: {
  questions: Question[]; progress: Progress; markedQuestionIds?: number[]; onJump: (idx: number) => void; currentIdx?: number;
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "marked" | "incorrect" | "unanswered">("all");
  const groups: { category: string; items: { q: Question; idx: number }[] }[] = [];
  const seen = new Map<string, { q: Question; idx: number }[]>();
  questions.forEach((q, idx) => {
    const state = progress[q.id]?.state;
    const isMarked = markedQuestionIds.includes(q.id);
    const matchesFilter = filter === "all"
      || (filter === "marked" && isMarked)
      || (filter === "incorrect" && state === "incorrect")
      || (filter === "unanswered" && !state);
    if (!matchesFilter) return;
    if (!seen.has(q.category)) { seen.set(q.category, []); groups.push({ category: q.category, items: seen.get(q.category)! }); }
    seen.get(q.category)!.push({ q, idx });
  });
  const currentCategory = currentIdx !== undefined ? questions[currentIdx]?.category : undefined;
  const toggleGroup = (cat: string) => setOpenGroups((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  const isOpen = (cat: string) => openGroups.has(cat) || cat === currentCategory;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-wider text-teal-700">Review questions ({groups.reduce((count, group) => count + group.items.length, 0)})</p>
          <div className="hidden gap-3 text-xs font-semibold text-slate-400 sm:flex">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" /> Correct</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" /> Incorrect</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full" /> Revealed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-200 rounded-full" /> Unanswered</span>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          {(["all", "marked", "incorrect", "unanswered"] as const).map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold capitalize transition-colors ${filter === item ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:text-teal-700"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {groups.length === 0 && <p className="px-4 py-10 text-center text-sm font-medium text-slate-400">No questions match this review filter.</p>}
        {groups.map(({ category, items }) => {
          const correct = items.filter(({ q }) => progress[q.id]?.state === "correct").length;
          const incorrect = items.filter(({ q }) => progress[q.id]?.state === "incorrect").length;
          const revealedCount = items.filter(({ q }) => progress[q.id]?.state === "revealed").length;
          const answered = correct + incorrect + revealedCount;
          const pct = items.length > 0 ? (correct / items.length) * 100 : 0;
          const open = isOpen(category);
          return (
            <div key={category}>
              <button onClick={() => toggleGroup(category)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-teal-50/50 transition-colors text-left">
                <span className={`transition-transform text-slate-400 text-xs ${open ? "rotate-90" : ""}`}>▶</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="truncate text-sm font-bold text-slate-700">{category}</span>
                    <span className="ml-2 flex-shrink-0 text-xs font-bold text-slate-400">
                      {answered}/{items.length}{answered > 0 && <span className="text-green-600 ml-1">({correct} ✓)</span>}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="flex h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-600 transition-all" style={{ width: `${pct}%` }} />
                      <div className="bg-red-400 transition-all" style={{ width: `${(incorrect / items.length) * 100}%` }} />
                      <div className="bg-amber-400 transition-all" style={{ width: `${(revealedCount / items.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </button>
              {open && (
                <div className="border-t border-slate-100 max-h-64 overflow-y-auto">
                  {items.map(({ q, idx }) => {
                    const state = progress[q.id]?.state;
                    const isCurrent = idx === currentIdx;
                    const isMarked = markedQuestionIds.includes(q.id);
                    return (
                      <button key={q.id} onClick={() => onJump(idx)} className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors hover:bg-slate-50 ${isCurrent ? "bg-teal-50 border-l-2 border-teal-600" : "border-l-2 border-transparent"}`}>
                        <span className={`flex-shrink-0 w-2 h-2 rounded-full ${state === "correct" ? "bg-teal-600" : state === "incorrect" ? "bg-red-400" : state === "revealed" ? "bg-amber-400" : "bg-slate-200"}`} />
                        <span className="text-xs font-mono text-slate-400 flex-shrink-0 w-6">{idx + 1}</span>
                        <span className={`truncate ${isCurrent ? "text-teal-900 font-bold" : "text-slate-600"}`}>{q.title}</span>
                        {isMarked && <MedicalIcon name="bookmark" className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
