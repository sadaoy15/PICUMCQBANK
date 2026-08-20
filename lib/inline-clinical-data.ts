import type { ClinicalDataBlock, Question } from "@/types/question";

const dataMarker = /\b(?:laboratory|lab)\s+(?:test\s+)?(?:analysis|data|evaluation|finding|findings|result|results|values)\b|\b(?:arterial|venous)\s+blood\s+gas(?:\s+(?:analysis|values?))?\b/gi;
const questionMarker = /\b(?:Of the following|Which(?: of the following)?\s+(?:is|are)|What\s+(?:is|are)|Based on|The (?:most|best|next|appropriate|diagnosis))/i;

const labelPattern = new RegExp(
  String.raw`\b(?:(?:Serum|Plasma|Whole blood|Urine)\s+)?(?:Complete blood count|WBCs?|WBC count|White blood (?:cell count|cells)|Red blood cells|Hemoglobin|Haemoglobin|Hematocrit|Platelet(?: count|s)?|Neutrophils?|Lymphocytes?|Monocytes?|Eosinophils?|Basophils?|Band forms?|Sodium|Potassium|Chloride|Bicarbonate|Carbon dioxide|Total CO2|CO2|Anion gap|Urea nitrogen|Blood urea nitrogen|BUN|Creatinine|Glucose|Lactate|Calcium|Ionized calcium|Magnesium|Phosph(?:orus|ate)|Albumin|Ammonia|Ferritin|Triglycerides|C-reactive protein|Procalcitonin|Erythrocyte sedimentation rate|Amylase|Lipase|Valproic acid|Creatine kinase myocardial fraction|Aspartate aminotransferase|Alanine aminotransferase|AST|ALT|Alkaline phosphatase|Gamma-glutamyl transferase|Total bilirubin|Direct bilirubin|Conjugated bilirubin|Unconjugated bilirubin|Prothrombin time|Partial thromboplastin time|Activated partial thromboplastin time|International normalized ratio|INR|Fibrinogen|D-dimer|Creatine kinase|Creatinine phosphokinase|Lactate dehydrogenase|Troponin|B-type natriuretic peptide|Uric acid|Serum osmolality|Measured plasma osmolality|Urine osmolality|Urine sodium|Urine creatinine|Specific gravity|Nitrites?|Leukocyte esterase|Urine drug screen|Tacrolimus trough|Free triiodothyronine|Thyroxine|Thyroid-stimulating hormone|COHb|C3|C4|CSF protein|CSF glucose|CSF white blood cell count|CSF red blood cell count|CSF Gram stain|Gram stain|Color|Appearance|FiO2|Fraction of inspired oxygen|Arterial pH|Venous pH|pH|PaCO2|PaO2|PCO2|PO2|Partial pressure of carbon dioxide|Partial pressure of oxygen|Base excess|Base deficit|Oxygen saturation)\b`,
  "gi",
);

const normalizeCell = (value: string) => value
  .replace(/^(?:results?|values?)\s*/i, "")
  .replace(/\s+/g, " ")
  .replace(/^[|:;,-]+\s*/, "")
  .replace(/\s*(?:[|:;,]+(?:\s+(?:and|or))?)\s*$/, "")
  .trim();

const formatLabel = (value: string) => {
  const label = normalizeCell(value).replace(/^(?:and|or)\s+/i, "");
  return label ? `${label[0].toUpperCase()}${label.slice(1)}` : label;
};

const trimTrailingNarrative = (value: string) => normalizeCell(value)
  .replace(/([A-Za-z%)])\.\s+[A-Z][\s\S]*$/, "$1");

const hasNarrative = (value: string) => /\.\s+(?:The|This|A|An|Which|After|Before|While|When|On|At|In|Then|If|He|She|They)\b/i.test(value);

const validRows = (rows: string[][]) => rows.length >= 3
  && rows.every(([label, value]) => label.length > 0 && label.length <= 80 && value.length > 0 && value.length <= 120
    && !hasNarrative(label) && !hasNarrative(value));

const measurementCount = (value: string) => (value.match(/\b\d+(?:\.\d+)?\s*(?:%|[A-Za-z]+(?:\/[A-Za-z]+)?|mm\s*Hg|mEq\/?L|mg\/?dL|U\/?L|IU\/?L)?/g) ?? []).length;

function parseDelimitedRows(source: string): string[][] {
  const rows = source.split(";").map((segment, index) => {
    const cleaned = segment
      .replace(/^\s*(?:and|or)\s+/i, "")
      .replace(/^\s*(?:include(?:s|d)?|are|were|show(?:s|ed)?|reveal(?:s|ed)?|demonstrate(?:s|d)?)\s*(?:the following|as follows)?\s*:\s*/i, "")
      .trim();
    const match = cleaned.match(/^([^,:]{2,100}),\s*(.+)$/);
    if (!match) return null;
    return [formatLabel(match[1]), trimTrailingNarrative(match[2])];
  }).filter(Boolean) as string[][];

  return validRows(rows) ? rows : [];
}

function parseRows(source: string): string[][] {
  const delimitedRows = parseDelimitedRows(source);
  if (delimitedRows.length) return delimitedRows;

  labelPattern.lastIndex = 0;
  const matches = [...source.matchAll(labelPattern)];
  if (matches.length < 3) return [];

  const rows = matches.map((match, index) => {
    const valueStart = (match.index ?? 0) + match[0].length;
    const valueEnd = index + 1 < matches.length ? matches[index + 1].index ?? source.length : source.length;
    return [formatLabel(match[0]), normalizeCell(source.slice(valueStart, valueEnd))];
  }).filter(([, value]) => value.length > 0 && value.length < 180);

  return validRows(rows) ? rows : [];
}

export function inlineClinicalData(question: Question): { text: string; blocks?: ClinicalDataBlock[] } {
  const text = question.displayScenario || question.scenario || question.title;
  if (question.clinicalData?.length) return { text, blocks: question.clinicalData };

  dataMarker.lastIndex = 0;
  const markers = [...text.matchAll(dataMarker)];
  if (markers.length === 0) return { text };

  const candidates = markers.map((marker) => {
    const start = marker.index ?? 0;
    const afterMarker = start + marker[0].length;
    const questionMatch = questionMarker.exec(text.slice(afterMarker));
    if (!questionMatch?.index) return null;
    const end = afterMarker + questionMatch.index;
    const raw = normalizeCell(text.slice(afterMarker, end));
    return { start, end, raw, rows: parseRows(raw), measurements: measurementCount(raw) };
  }).filter(Boolean) as { start: number; end: number; raw: string; rows: string[][]; measurements: number }[];

  const candidate = candidates.sort((left, right) => right.rows.length - left.rows.length || right.measurements - left.measurements)[0];
  if (!candidate || candidate.rows.length < 3) return { text };

  const before = text.slice(0, candidate.start).trimEnd();
  const after = text.slice(candidate.end).trimStart();
  const narrative = `${before}${/[.:]$/.test(before) ? "" : "."} Laboratory data are summarized below. ${after}`.replace(/\s{2,}/g, " ").trim();
  return {
    text: narrative,
    blocks: [{
      title: "Laboratory data",
      columns: ["Test", "Result"],
      rows: candidate.rows,
    }],
  };
}
