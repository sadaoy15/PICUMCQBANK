"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Bookmark, ClipboardCheck, HeartPulse, Stethoscope, TestTube2, Timer, type LucideIcon } from "lucide-react";
import { questions as builtInQuestions } from "@/data/questions";
import { inlineClinicalData } from "@/lib/inline-clinical-data";
import { ClinicalDataBlock, Question, QuestionFigure } from "@/types/question";

const STORAGE_KEY = "picu_custom_questions";
const SESSIONS_KEY = "picu_sessions";

type AnswerState = "unanswered" | "correct" | "incorrect" | "revealed" | "unkeyed";
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
  { id: "picumcq-book", label: "PICU MCQ Review", description: "280 questions with explanations and figures (PICU MCQ Review)", accent: "indigo", match: (q) => q.category === "PICU MCQ Review" },
];

const passMachineExamGroups: ExamGroup[] = [
  { id: "passmachine-pediatrics", label: "American Physician Institute 2012-2020", description: "Clinical review questions arranged by source chapter", accent: "blue", match: (q) => q.category.startsWith("American Physician Institute 2012-2020"), subCategoryPrefix: "American Physician Institute 2012-2020" },
];

const mcckapExamGroups: ExamGroup[] = [
  { id: "mcckap-2023", label: "MCCKAP 2023", description: "191 multidisciplinary pediatric critical care questions with source commentaries and figures", accent: "emerald", match: (q) => q.source === "Pediatric Multidisciplinary Critical Care Knowledge Assessment Program 2023" },
];

const specialExamGroups: ExamGroup[] = [
  { id: "study-prep", label: "Study All PREP",   description: "All PREP questions combined (2019–2025)", accent: "violet", match: (q) => q.category.startsWith("PREP") },
  { id: "study-all",  label: "Study Everything", description: "All questions from all sources combined", accent: "slate",  match: () => true },
];

const examGroups: ExamGroup[] = [...prepExamGroups, ...mcckapExamGroups, ...sccmExamGroups, ...zimmermanExamGroups, ...studyGuideExamGroups, ...picumcqExamGroups, ...passMachineExamGroups, ...specialExamGroups];

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

type MedicalIconName = "heart" | "clipboard" | "stethoscope" | "book" | "timer" | "vial" | "bookmark";

const medicalIcons: Record<MedicalIconName, LucideIcon> = {
  heart: HeartPulse,
  clipboard: ClipboardCheck,
  stethoscope: Stethoscope,
  book: BookOpen,
  timer: Timer,
  vial: TestTube2,
  bookmark: Bookmark,
};

function MedicalIcon({ name, className = "h-5 w-5" }: { name: MedicalIconName; className?: string }) {
  const Icon = medicalIcons[name];
  return <Icon aria-hidden="true" className={className} strokeWidth={1.9} />;
}

function iconForExam(exam: ExamGroup): "heart" | "clipboard" | "book" | "stethoscope" {
  if (exam.id.includes("final")) return "stethoscope";
  if (exam.id.includes("promo")) return "heart";
  if (exam.id.includes("prep")) return "book";
  if (exam.id.includes("sccm") || exam.id.includes("zimmerman")) return "stethoscope";
  return "clipboard";
}

function markerForExam(exam: ExamGroup) {
  const year = exam.label.match(/\b(20\d{2})\b/)?.[1];
  if (year) return year.slice(-2);
  if (exam.id.startsWith("sccm")) return "SC";
  if (exam.id.startsWith("zimmerman")) return "ZM";
  if (exam.id.startsWith("studyguide")) return "SG";
  if (exam.id.startsWith("picumcq")) return "MC";
  if (exam.id.startsWith("passmachine")) return "AP";
  if (exam.id.startsWith("study-")) return "ALL";
  return "QB";
}

function ClinicalData({ blocks }: { blocks?: ClinicalDataBlock[] }) {
  if (!blocks?.length) return null;

  return (
    <div className="db-clinical-stack my-6 space-y-4">
      {blocks.map((block, blockIndex) => (
        <section key={`${block.title}-${blockIndex}`} className="db-clinical-table">
          <div className="db-table-caption">
            <span><i aria-hidden="true" />{block.title}</span>
            <small>{block.rows.length} {block.rows.length === 1 ? "item" : "items"}</small>
          </div>
          <div className="db-table-scroll">
            <table className="db-data-table min-w-full border-collapse text-left">
              {block.columns && (
                <thead>
                  <tr>
                    {block.columns.map((column) => (
                      <th key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${block.title}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => cellIndex === 0 ? (
                      <th key={cellIndex} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={cellIndex}>{cell}</td>
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

function assetUrl(src: string) {
  return src.startsWith("/PICUMCQBANK/")
    ? src
    : `/PICUMCQBANK${src.startsWith("/") ? src : `/${src}`}`;
}

function FigureGallery({ figures, title }: { figures?: QuestionFigure[]; title: string }) {
  if (!figures?.length) return null;

  return (
    <section className="db-figure-gallery my-6" aria-label={title}>
      <div className="db-figure-heading mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <MedicalIcon name="stethoscope" className="h-4 w-4 text-teal-700" />
        <span>{title}</span>
      </div>
      <div className={`grid gap-4 ${figures.length > 1 ? "md:grid-cols-2" : ""}`}>
        {figures.map((figure) => (
          <figure key={figure.src} className="db-figure-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
              {figure.label}
            </div>
            <div className="flex min-h-32 items-center justify-center bg-white p-3">
              <img
                src={assetUrl(figure.src)}
                alt={`${figure.label}: ${figure.caption}`}
                className="max-h-[460px] max-w-full object-contain"
              />
            </div>
            <figcaption className="border-t border-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-600">
              {figure.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ── Style tokens (auto-applied based on detected screen size) ─────────────────
function makeStyles(isPhone: boolean) {
  return {
    quizWrap: isPhone
      ? "db-quiz-shell -mx-4 overflow-hidden bg-white shadow-xl ring-1 ring-white/80 sm:mx-0 sm:rounded-[32px]"
      : "db-quiz-shell mx-auto max-w-[1160px] overflow-hidden rounded-[32px] border border-white bg-white shadow-xl",
    headerPad: isPhone ? "db-quiz-head border-b border-slate-200/70 bg-white px-5 py-5" : "db-quiz-head border-b border-slate-200/70 bg-white px-8 py-7",
    backBtn: isPhone
      ? "mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-teal-300 hover:text-teal-800"
      : "mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-teal-300 hover:text-teal-800",
    examTitle: isPhone ? "text-xl font-black tracking-[-0.035em] text-slate-950" : "text-2xl font-black tracking-[-0.04em] text-slate-950",
    questionMeta: isPhone ? "mt-2 text-sm font-medium text-slate-500" : "mt-1.5 text-sm font-medium text-slate-500",
    questionBadge: isPhone
      ? "rounded-full border border-teal-100 bg-teal-50 px-3.5 py-1.5 text-sm font-black text-teal-800"
      : "rounded-full border border-teal-100 bg-teal-50 px-3.5 py-1.5 text-sm font-black text-teal-800",
    tabBtn: isPhone ? "py-3.5 text-base" : "py-3 text-base",
    questionBodyPad: isPhone ? "px-5 py-7" : "relative px-8 py-9",
    questionText: isPhone
      ? "mb-6 max-w-[850px] text-xl font-bold leading-relaxed text-slate-950"
      : "mb-7 max-w-[900px] text-[20px] font-bold leading-[1.65] tracking-[-0.012em] text-slate-950",
    choiceSpace: "",
    choiceBase: isPhone
      ? "w-full text-left rounded-2xl border px-4 py-4 text-[15px] font-semibold leading-relaxed text-slate-700 shadow-sm shadow-slate-200/40 transition-all cursor-pointer flex items-start gap-3 "
      : "w-full text-left rounded-2xl border px-5 py-4 text-[15px] font-semibold leading-relaxed text-slate-700 shadow-sm shadow-slate-200/40 transition-all cursor-pointer flex items-start gap-3 ",
    choiceLetterBase: isPhone
      ? "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-black "
      : "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black ",
    submitBtn: isPhone
      ? "mt-6 w-full rounded-2xl bg-[#182126] py-3.5 text-base font-black text-white shadow-lg shadow-slate-300 transition-all hover:bg-[#26363e] disabled:cursor-not-allowed disabled:opacity-40"
      : "mt-6 w-full rounded-2xl bg-[#182126] py-4 text-sm font-black text-white shadow-lg shadow-slate-300 transition-all hover:bg-[#26363e] disabled:cursor-not-allowed disabled:opacity-40",
    navGrid: isPhone ? "mt-5 grid grid-cols-2 gap-3" : "mt-4 grid grid-cols-2 gap-2.5",
    prevBtn: isPhone
      ? "rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors"
      : "rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors",
    nextBtn: isPhone
      ? "rounded-xl bg-[#182126] py-3.5 text-sm font-black text-white transition-colors hover:bg-[#26363e]"
      : "rounded-xl bg-[#182126] py-3 text-sm font-black text-white transition-colors hover:bg-[#26363e]",
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
      (state === "correct" ? "bg-green-50 border-green-200" : state === "revealed" ? "bg-amber-50 border-amber-200" : state === "unkeyed" ? "bg-sky-50 border-sky-200" : "bg-red-50 border-red-200"),
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
    sectionHeading: "mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500",
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
    const state: AnswerState = q.correctAnswer ? (selected === q.correctAnswer ? "correct" : "incorrect") : "unkeyed";
    const updatedProgress = { ...progress, [q.id]: { selected, state } };
    setProgress(updatedProgress);
    updateActiveSession({ progress: updatedProgress });
    setRevealed(true);
    setActiveTab("explanation");
  };

  const handleReveal = () => {
    const q = quizQuestions[current];
    if (!q || revealed) return;
    if (!q.correctAnswer) {
      const updatedProgress = { ...progress, [q.id]: { selected: selected ?? "", state: "unkeyed" as AnswerState } };
      setProgress(updatedProgress);
      updateActiveSession({ progress: updatedProgress });
      setRevealed(true);
      setActiveTab("explanation");
      return;
    }
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
        <button onClick={() => handleSelectExam(exam)} className={`db-exam-card group w-full rounded-2xl border border-white/80 bg-white p-4 text-left shadow-lg shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:shadow-xl ${ac.card}`}>
          <div className="db-exam-card-top">
            <span className={`db-source-beacon ${isTest ? "is-test" : ""}`} aria-hidden="true">
              <span className="db-source-lens" />
              <span className="db-source-code">{markerForExam(exam)}</span>
            </span>
            <span className="db-exam-count">{total} questions</span>
          </div>
          <div className="db-exam-card-copy">
            <span className="db-exam-overline">{exam.id.includes("prep") ? "PREP collection" : exam.id.includes("sccm") ? "Critical care" : "Question bank"}</span>
            <h3>{exam.label}</h3>
            <p>{exam.description}</p>
          </div>
          <div className="db-exam-card-footer">
            <span className={`db-exam-action ${isTest ? "is-test" : ""}`}>{isTest ? "Start test" : "Start practice"}</span>
            <span className="db-exam-arrow" aria-hidden="true">→</span>
          </div>
          <div className={`db-exam-card-progress ${answered > 0 ? "has-progress" : ""}`}>
            {answered > 0 ? (
              <>
                <div className="db-exam-progress-copy"><span>{answered}/{total} answered</span><strong>{correct} correct</strong></div>
                <div className="db-exam-progress-track"><div style={{ width: `${pct}%` }} /></div>
              </>
            ) : (
              <span className="db-exam-new">Ready when you are</span>
            )}
          </div>
        </button>
      );
    };

    const SessionRow = ({ ses, compact = false }: { ses: QuizSession; compact?: boolean }) => {
      const answered = Object.keys(ses.progress).length;
      const correct = Object.values(ses.progress).filter((p) => p.state === "correct").length;
      const pct = ses.questionIds.length > 0 ? (answered / ses.questionIds.length) * 100 : 0;
      return (
        <article className={`db-saved-session ${compact ? "is-compact" : "is-primary"}`}>
          <span className="db-session-signal"><MedicalIcon name="timer" className="h-5 w-5" /></span>
          <div className="db-session-copy">
            <div className="db-session-title-line">
              <h3>{ses.examLabel}</h3>
              <span>{ses.viewMode === "study" ? "Practice" : "Test"} · {ses.quizMode}</span>
            </div>
            <div className="db-session-meta"><span>Question {Math.min(ses.currentIndex + 1, ses.questionIds.length)} of {ses.questionIds.length}</span><span>{answered} answered · {correct} correct</span></div>
            <div className="db-session-progress"><div style={{ width: `${pct}%` }} /></div>
          </div>
          <div className="db-session-actions">
            <button onClick={() => handleResumeSession(ses)} className="db-session-resume"><MedicalIcon name="clipboard" className="h-4 w-4" /> Resume</button>
            <button onClick={() => handleDeleteSession(ses.id)} className="db-session-delete" aria-label={`Delete ${ses.examLabel} session`}>×</button>
          </div>
        </article>
      );
    };

    return (
      <div className="db-home">
        <section className="db-overview">
          <div className="db-hero">
            <p className="db-eyebrow">Your board review, in motion</p>
            <h1 className="db-title">Know what<br />comes next.</h1>
            <p className="db-hero-copy">Practice high-stakes pediatric critical care questions with clear explanations and focused review.</p>
            <div className="db-resume-row">
              {latestSession ? (
                <>
                  <button onClick={() => handleResumeSession(latestSession)} className="db-primary">Continue question {Math.min(latestSession.currentIndex + 1, latestTotal)} <span aria-hidden="true">→</span></button>
                  <span className="db-resume-note"><strong>{latestSession.examLabel}</strong>{latestAnswered} of {latestTotal} questions completed</span>
                </>
              ) : (
                <>
                  <button onClick={() => handleStartAllPrep("study")} className="db-primary">Start practicing <span aria-hidden="true">→</span></button>
                  <button onClick={() => handleStartAllPrep("test")} className="db-secondary">Explore test mode</button>
                </>
              )}
            </div>
          </div>

          <aside className="db-progress-card" aria-label="Question bank overview">
            <div className="db-stats">
              <div className="db-stat"><strong>{totalQuestionCount.toLocaleString()}</strong><span>Questions</span></div>
              <div className="db-stat"><strong>{sourceCount}</strong><span>Study sets</span></div>
            </div>
            <div className="db-progress-main">
              <p>Latest progress</p>
              <div className="db-progress-value"><strong>{latestProgress}%</strong><span>{latestSession ? latestSession.examLabel : `${prepTotal.toLocaleString()} PREP questions ready`}</span></div>
              <div className="db-progress-track"><div className="db-progress-fill transition-all" style={{ width: `${latestProgress}%` }} /></div>
            </div>
          </aside>
        </section>

        {/* Practice / Test mode choices */}
        {pendingMode === null ? (
          <>
            <div className="db-section-line"><h2>Choose how you review.</h2><p>Two focused paths. One clear goal.</p></div>
            <div className="db-mode-layout">
              <button onClick={() => handleStartAllPrep("study")} className="db-mode-card">
                <span className="db-lens teal" aria-hidden="true" />
                <span className="db-card-arrow" aria-hidden="true">→</span>
                <span className="db-mode-kicker">01 / Learn</span>
                <h3>Practice Mode</h3>
                <p>Learn as you go with instant explanations, PREP pearls, and progress tracking.</p>
              </button>

              <button onClick={() => handleStartAllPrep("test")} className="db-mode-card test">
                <span className="db-lens red" aria-hidden="true" />
                <span className="db-card-arrow" aria-hidden="true">→</span>
                <span className="db-mode-kicker">02 / Assess</span>
                <h3>Test Mode</h3>
                <p>Simulate exam conditions with scoring and explanations held until the end.</p>
              </button>

              <button onClick={latestSession ? () => handleResumeSession(latestSession) : () => handleStartAllPrep("study")} className="db-mode-card db-session-card">
                <span className="db-card-arrow" aria-hidden="true">→</span>
                <span className="db-mode-kicker">Recent session</span>
                <h3>{latestSession ? latestSession.examLabel : "Build your streak"}</h3>
                <p>{latestSession ? `Question ${Math.min(latestSession.currentIndex + 1, latestTotal)} · ${latestAnswered} completed` : "Your current question and progress will be saved automatically."}</p>
              </button>
            </div>
          </>
        ) : (
          <div className="db-picker-head rounded-[28px] border border-white bg-white/90 p-5 shadow-2xl shadow-slate-200/70 sm:p-6">
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
          <section aria-label="Popular question sources">
            <div className="db-section-line"><h2>Continue by source.</h2><p>Start in Practice Mode. Switch anytime.</p></div>
            <div className="db-source-shelf">
              {[prepExamGroups[prepExamGroups.length - 1], mcckapExamGroups[0], sccmExamGroups[0]].map((exam, index) => {
                const count = allQuestions.filter(exam.match).length;
                return (
                  <button key={exam.id} onClick={() => handleSelectExam(exam, "study")} className="db-source-card">
                    <span>{index === 0 ? "AAP · Current" : index === 1 ? "Knowledge assessment" : "Critical care"}</span>
                    <strong>{exam.label}</strong>
                    <small>{count.toLocaleString()} questions</small>
                  </button>
                );
              })}
              <button onClick={() => handleStartAllPrep("study")} className="db-source-card all">
                <span>Full library</span><strong>Browse all sources →</strong><small>{sourceCount} focused study sets</small>
              </button>
            </div>
          </section>
        )}

        {/* Paused sessions — shown prominently above exam picker */}
        {pendingMode !== null && visibleSessions.length > 0 && (
          <section className="db-paused-panel rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm sm:p-5">
            <div className="db-sessions-heading">
              <div><span>Continue learning</span><h2>Resume your latest session.</h2><p>Your place, answers, and review marks are saved automatically.</p></div>
              <strong>{visibleSessions.length} saved</strong>
            </div>
            <SessionRow ses={visibleSessions[0]} />
            {visibleSessions.length > 1 && (
              <details className="db-session-older">
                <summary><span>Older sessions</span><span>Show {visibleSessions.length - 1} more <b aria-hidden="true">↓</b></span></summary>
                <div className="db-session-older-list">
                  {visibleSessions.slice(1).map((ses) => <SessionRow key={ses.id} ses={ses} compact />)}
                </div>
              </details>
            )}
          </section>
        )}

        {/* Exam grid */}
        {pendingMode !== null && (
          <div className="db-exam-library space-y-7">
            <section className="db-exam-section">
              <h2 className={s.sectionHeading}>PREP Exams</h2>
              <div className={`grid ${s.examGridCols} gap-3`}>{prepExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div>
            </section>
            <section className="db-exam-section">
              <h2 className={s.sectionHeading}>Knowledge Assessment</h2>
              <div className={`grid ${s.examGridCols} gap-3`}>{mcckapExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div>
            </section>
            <section className="db-exam-section">
              <h2 className={s.sectionHeading}>Self-Assessment Books</h2>
              <div className={`grid ${s.examGridCols} gap-3`}>
                {sccmExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
                {zimmermanExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
                {studyGuideExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
                {picumcqExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
                {passMachineExamGroups.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
              </div>
            </section>
            <section className="db-exam-section">
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
  const scoredAnsweredInView = quizQuestions.filter((q) => {
    const state = progress[q.id]?.state;
    return state === "correct" || state === "incorrect" || state === "revealed";
  }).length;
  const remainingInView = totalCount - answeredInView;
  const isCurrentQuestionMarked = markedQuestionIds.includes(quizQuestions[current]?.id);
  const unsortedSubCats = selectedExam.subCategoryPrefix
    ? Array.from(new Set(allQuestions.filter(selectedExam.match).map((q) => q.category)))
    : [];
  const subCats = selectedExam.id.startsWith("passmachine") ? unsortedSubCats : [...unsortedSubCats].sort();

  if (showSummary) {
    return (
      <div className="db-summary space-y-6">
        <button onClick={handleBackToSelection} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-lg shadow-slate-200 hover:text-slate-950">← Back to exams</button>
        <div className="db-summary-card rounded-[32px] border border-white bg-white p-8 text-center shadow-2xl shadow-slate-200/70">
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
  const questionCategoryLabel = selectedExam.subCategoryPrefix
    ? q.category.replace(selectedExam.subCategoryPrefix + " - ", "")
    : q.category;

  const tabs: { id: ActiveTab; icon: "clipboard" | "book" | "bookmark"; label: string }[] = [
    { id: "question",    icon: "clipboard", label: "Question" },
    { id: "explanation", icon: "book", label: "Explanation" },
    { id: "notes",       icon: "bookmark", label: "Review" },
  ];

  return (
    <div className={s.quizWrap}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className={`${s.headerPad} db-command-head`}>
        <div className="db-command-row">
          <button onClick={handleBackToSelection} className="db-back-control" aria-label="Back to sessions">
            <span aria-hidden="true">←</span><span>Sessions</span>
          </button>
          <div className="db-exam-identity">
            <span className="db-exam-icon">
              <MedicalIcon name={iconForExam(selectedExam)} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className={`${s.examTitle} truncate`}>{selectedExam.label}</h1>
              <p className="db-question-position">Question <strong>{current + 1}</strong> of {totalCount}</p>
            </div>
          </div>
          <span className={`${s.questionBadge} db-question-badge`}>Q{current + 1}</span>
        </div>
        <div className="db-progress-copy">
          <span>Session progress</span>
          <strong>{Math.round(((current + 1) / totalCount) * 100)}%</strong>
        </div>
        <div className="db-question-track">
          <div className="db-question-fill transition-all" style={{ width: `${((current + 1) / totalCount) * 100}%` }} />
        </div>
      </div>

      <div className="db-metric-strip grid grid-cols-2 divide-x divide-y divide-slate-200 border-b border-slate-200 bg-slate-50 sm:grid-cols-4 sm:divide-y-0">
        <div className="db-metric-cell">
          <span className="db-metric-signal teal" aria-hidden="true" />
          <div><p>Answered</p><strong>{answeredInView}<small> / {totalCount}</small></strong></div>
        </div>
        <div className="db-metric-cell">
          <span className="db-metric-signal cyan" aria-hidden="true" />
          <div><p>Accuracy</p><strong className="text-teal-700">{scoredAnsweredInView ? `${Math.round((correctInView / scoredAnsweredInView) * 100)}%` : "—"}</strong></div>
        </div>
        <div className="db-metric-cell">
          <span className="db-metric-signal yellow" aria-hidden="true" />
          <div><p>Marked</p><strong className="text-amber-700">{markedQuestionIds.length}</strong></div>
        </div>
        <div className="db-metric-cell">
          <span className="db-metric-signal muted" aria-hidden="true" />
          <div><p>Remaining</p><strong>{remainingInView}</strong></div>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="db-tabbar grid grid-cols-3 border-b border-slate-200 bg-white/95">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isLocked = tab.id === "explanation" && !revealed;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`db-tab-button flex items-center justify-center gap-2 ${s.tabBtn} border-b-2 transition-colors ${
                isActive
                  ? "border-teal-600 text-teal-800 bg-teal-50/70"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              } ${isLocked ? "opacity-40" : ""}`}
            >
              <MedicalIcon name={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Sub-category filter ──────────────────────────────────────── */}
      {activeTab === "question" && subCats.length > 0 && (() => {
        const isSccm = selectedExam.id.startsWith("sccm");
        const isZimm = selectedExam.id.startsWith("zimmerman");
        const isPassMachine = selectedExam.id.startsWith("passmachine");
        const filterLabel = isSccm ? "Filter chapters" : isZimm ? "Filter parts" : "Filter months";
        const allLabel    = isSccm ? "All chapters"   : isZimm ? "All parts"    : "All months";
        if (isPassMachine) {
          const chapterCount = (chapter: string) => allQuestions.filter((question) => question.category === chapter).length;
          return (
            <section className="border-b border-slate-100 bg-white px-5 py-3">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-teal-800">
                  <span className="h-2 w-2 rounded-full bg-teal-500" /> Navigate by chapter
                </span>
                <select
                  aria-label="Navigate by chapter"
                  value={activeSubCat}
                  onChange={(event) => handleChangeSubCat(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-teal-500"
                >
                  <option value="all">All chapters</option>
                  {subCats.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(selectedExam.subCategoryPrefix! + " - ", "")} ({chapterCount(cat)})
                    </option>
                  ))}
                </select>
              </label>
            </section>
          );
        }
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
        <div key={`question-${q.id}`} className={`${s.questionBodyPad} db-question-enter`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${ac.badge}`}>
              <MedicalIcon name="clipboard" className="h-3 w-3" />{questionCategoryLabel}
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

          <FigureGallery figures={q.visuals?.question} title="Question figures and tables" />

          {q.images && q.images.length > 0 && (
            <div className="my-4 flex flex-col gap-3">
              {q.images.map((img, i) => (
                <img
                  key={i}
                  src={assetUrl(img)}
                  alt={`Figure ${i + 1}`}
                  className="max-w-full rounded-xl border border-slate-200 shadow-sm object-contain mx-auto"
                  style={{ maxHeight: "400px" }}
                />
              ))}
            </div>
          )}

          <div className="db-choice-heading"><p>Select one answer</p><span>{choiceLetters.length} options</span></div>
                  <div className={`${s.choiceSpace} db-choice-grid`}>
            {choiceLetters.map((letter) => {
              const isSelected = selected === letter;
              const isCorrect = letter === q.correctAnswer;
              const isUnkeyedState = savedState?.state === "unkeyed";
              let style = s.choiceBase;
              let visualState = "idle";
              const isRevealedState = savedState?.state === "revealed";
              if (!revealed) {
                style += isSelected ? "border-teal-600 bg-teal-50 text-teal-950" : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/40";
                visualState = isSelected ? "selected" : "idle";
              } else if (isUnkeyedState) {
                style += isSelected ? "border-sky-400 bg-sky-50 text-sky-950" : "border-slate-200 bg-white text-slate-500";
                visualState = isSelected ? "unkeyed" : "muted";
              } else if (isRevealedState) {
                if (isCorrect) style += "border-amber-400 bg-amber-50 text-amber-900";
                else style += "border-slate-200 bg-white text-slate-400";
                visualState = isCorrect ? "revealed" : "muted";
              } else {
                if (isCorrect) style += "border-green-500 bg-green-50 text-green-900";
                else if (isSelected) style += "border-red-400 bg-red-50 text-red-800";
                else style += "border-slate-200 bg-white text-slate-400";
                visualState = isCorrect ? "correct" : isSelected ? "incorrect" : "muted";
              }
              const statusSymbol = revealed ? (isCorrect ? "✓" : isSelected ? "×" : "") : isSelected ? "✓" : "";
              return (
                <button key={letter} className={`db-choice ${style}`} onClick={() => handleSelect(letter)} aria-pressed={isSelected} data-state={visualState}>
                  <span className={`${s.choiceLetterBase}${
                    !revealed
                      ? isSelected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-500"
                      : isUnkeyedState
                      ? isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"
                      : isRevealedState
                      ? isCorrect ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-400"
                      : isCorrect ? "bg-green-500 text-white"
                      : isSelected ? "bg-red-400 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}>{letter}</span>
                  <span className="min-w-0 flex-1">
                    <span>{q.choices[letter]}</span>
                    {q.visuals?.choices?.[letter]?.map((figure) => (
                      <span key={figure.src} className="mt-3 block overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <img
                          src={assetUrl(figure.src)}
                          alt={`${figure.label}: ${figure.caption}`}
                          className="mx-auto max-h-72 max-w-full object-contain p-2"
                        />
                        <span className="block border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                          {figure.caption}
                        </span>
                      </span>
                    ))}
                  </span>
                  <span className="db-choice-state" aria-hidden="true">{statusSymbol}</span>
                </button>
              );
            })}
          </div>

          {!revealed ? (
            <div className="db-answer-actions">
              <button onClick={handleSubmit} disabled={!selected} className={s.submitBtn}>Check answer</button>
              {viewMode === "study" && <button onClick={handleReveal} className={`${s.revealBtn} db-reveal-action`}>{q.correctAnswer ? "Show answer" : "Review course notes"}</button>}
            </div>
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
              {scoredAnsweredInView > 0 && <span className="ml-2 text-teal-600 font-semibold">· {Math.round((correctInView / scoredAnsweredInView) * 100)}% correct</span>}
            </span>
          </div>
        </div>
      )}

      {/* ── Tab: Explanation ─────────────────────────────────────────── */}
      {activeTab === "explanation" && (
        <div key={`explanation-${q.id}`} className={`${s.questionBodyPad} db-question-enter`}>
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
              <FigureGallery figures={q.visuals?.explanation} title="Explanation figures and tables" />

              {q.images && q.images.length > 0 && (
                <div className="mb-4 flex flex-col gap-3">
                  {q.images.map((img, i) => (
                    <img
                      key={i}
                      src={assetUrl(img)}
                      alt={`Figure ${i + 1}`}
                      className="max-w-full rounded-xl border border-slate-200 shadow-sm object-contain mx-auto"
                      style={{ maxHeight: "400px" }}
                    />
                  ))}
                </div>
              )}

              <div className={s.explanationBox(savedState?.state ?? "incorrect")}>
                <div className={`font-semibold flex items-start gap-2 ${savedState?.state === "correct" ? "text-green-800" : savedState?.state === "revealed" ? "text-amber-800" : savedState?.state === "unkeyed" ? "text-sky-800" : "text-red-800"}`}>
                  <MedicalIcon name={savedState?.state === "correct" ? "heart" : savedState?.state === "revealed" || savedState?.state === "unkeyed" ? "book" : "vial"} className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {q.correctAnswer
                    ? <span>{savedState?.state === "correct" ? "Correct!" : savedState?.state === "revealed" ? "Answer Revealed" : "Incorrect"} — Correct answer: {q.correctAnswer}. {q.correctAnswerText}</span>
                    : <span>No answer key is available for this question. Your response is saved for review and excluded from scoring.</span>}
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
                          {mainText && (() => {
                            const noteLines = mainText.split(/\n+/).map((line) => line.trim()).filter(Boolean);
                            return (
                              <section className="mt-3 rounded-lg border border-sky-100 bg-white/70 p-3.5">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">Course Notes</p>
                                <div className="mt-2.5 space-y-2 text-sm leading-relaxed text-slate-700">
                                  {noteLines.map((line, index) => {
                                    const bullet = line.match(/^[•◦]\s*(.*)$/);
                                    return bullet ? (
                                      <div key={`${index}-${bullet[1]}`} className="flex gap-2.5">
                                        <span className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${line.startsWith("◦") ? "bg-sky-300" : "bg-sky-600"}`} />
                                        <span>{bullet[1]}</span>
                                      </div>
                                    ) : <p key={`${index}-${line}`} className="font-semibold text-slate-800">{line}</p>;
                                  })}
                                </div>
                              </section>
                            );
                          })()}
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
                        {q.correctAnswer ? "No explanatory note is available for this item." : "No course notes are available for this item."}
                      </p>
                    )}
                    {q.source && <p className="text-xs text-slate-400 italic border-t border-slate-200 pt-2 mt-3">Reference: {q.source}</p>}
                  </>
                )}
                {viewMode === "test" && savedState?.state === "incorrect" && (
                  <p className="text-xs text-slate-500 mt-1">Switch to Study mode to see the explanation.</p>
                )}
                {viewMode === "test" && savedState?.state === "unkeyed" && (
                  <p className="text-xs text-sky-700 mt-1">This item has no answer key and is excluded from scoring.</p>
                )}
              </div>

              {viewMode === "study" && <ClinicalData blocks={q.explanationData} />}

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
                  {scoredAnsweredInView > 0 && <span className="ml-2 text-teal-600 font-semibold">· {Math.round((correctInView / scoredAnsweredInView) * 100)}% correct</span>}
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
