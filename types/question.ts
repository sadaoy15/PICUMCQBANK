export interface ClinicalDataBlock {
  title: string;
  columns?: string[];
  rows: string[][];
}

export interface QuestionFigure {
  src: string;
  label: string;
  caption: string;
}

export interface QuestionVisuals {
  question?: QuestionFigure[];
  choices?: Partial<Record<string, QuestionFigure[]>>;
  explanation?: QuestionFigure[];
}

export interface Question {
  id: number;
  title: string;
  scenario: string;
  choices: Record<string, string>;
  correctAnswer: string | null;
  correctAnswerText: string | null;
  explanation: string | null;
  source: string | null;
  category: string;
  images?: string[];
  visuals?: QuestionVisuals;
  displayScenario?: string;
  clinicalData?: ClinicalDataBlock[];
  explanationData?: ClinicalDataBlock[];
}
