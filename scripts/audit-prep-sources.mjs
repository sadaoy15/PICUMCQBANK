import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const sourceRoot = "/Users/farahs/Desktop/old exames after correction/PREP";
const sourceDocs = [
  { year: 2019, file: "PICU PREP 2019.docx", prefix: "PREP PICU 2019" },
  { year: 2020, file: "PICU PREP 2020.docx", prefix: "PREP PICU 2020" },
  { year: 2021, file: "PREP PICU 2021.docx", prefix: "PREP PICU 2021" },
  { year: 2022, file: "PREP ICU 2022.docx", prefix: "PREP ICU 2022" },
  { year: 2023, file: "PREP ICU 2023.docx", prefix: "PREP ICU 2023" },
  { year: 2024, file: "PREP ICU 2024.docx", prefix: "PREP ICU 2024" },
  { year: 2025, file: "PREP 2025.docx", prefix: "PREP 2025" },
];

const xmlDecode = (value) => value
  .replace(/<w:tab\/>/g, "\t")
  .replace(/<w:br(?: [^>]*)?\/>/g, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/\s+/g, " ")
  .trim();

const textOf = (xml) => xmlDecode((xml.match(/<w:t(?: [^>]*)?>[\s\S]*?<\/w:t>/g) ?? []).join(""));
const paragraphStyle = (xml) => xml.match(/<w:pStyle w:val="([^"]+)"\/>/)?.[1] ?? "";
const imageRefs = (xml) => [...xml.matchAll(/r:embed="(rId\d+)"/g)].map((match) => match[1]);

function tableRows(tableXml) {
  return [...tableXml.matchAll(/<w:tr(?: [^>]*)?>([\s\S]*?)<\/w:tr>/g)].map((row) =>
    [...row[1].matchAll(/<w:tc(?: [^>]*)?>([\s\S]*?)<\/w:tc>/g)].map((cell) =>
      xmlDecode((cell[1].match(/<w:t(?: [^>]*)?>[\s\S]*?<\/w:t>/g) ?? []).join("")),
    ).filter(Boolean),
  ).filter((row) => row.length > 0);
}

function isClinicalTable(rows) {
  if (rows.length < 2 || rows.every((row) => row.length < 2)) return false;
  const firstColumn = rows.map((row) => row[0]?.trim() ?? "");
  if (firstColumn.length <= 5 && firstColumn.every((cell) => /^[A-D][.)]?$/i.test(cell))) return false;
  const text = rows.flat().join(" ").toLowerCase();
  return /(lab|laboratory|hemoglobin|haemoglobin|platelet|white blood|wbc|sodium|potassium|chloride|bicarbonate|calcium|magnesium|phosph|glucose|creatinine|urea|bilirubin|albumin|lactate|ph\b|pco|po2|base excess|inr|ptt|prothrombin|vital sign|heart rate|blood pressure|respiratory rate|temperature|ventilat|fio2|peep|urine output|weight|dose|day\s*\d|parameter|value)/i.test(text);
}

function documentBlocks(xml) {
  const body = xml.match(/<w:body>([\s\S]*)<w:sectPr[\s\S]*?<\/w:sectPr><\/w:body>/)?.[1] ?? xml;
  return [...body.matchAll(/<w:p(?: [^>]*)?>[\s\S]*?<\/w:p>|<w:tbl(?: [^>]*)?>[\s\S]*?<\/w:tbl>/g)].map((match) => {
    const value = match[0];
    if (value.startsWith("<w:tbl")) return { type: "table", rows: tableRows(value), refs: imageRefs(value) };
    return { type: "paragraph", text: textOf(value), style: paragraphStyle(value), refs: imageRefs(value) };
  });
}

function relationships(path) {
  const xml = execFileSync("unzip", ["-p", path, "word/_rels/document.xml.rels"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  return Object.fromEntries([...xml.matchAll(/<Relationship Id="([^"]+)"[^>]*Target="([^"]+)"/g)]
    .filter((match) => match[2].startsWith("media/"))
    .map((match) => [match[1], `word/${match[2]}`]));
}

function extractSourceQuestions(source) {
  const path = resolve(sourceRoot, source.file);
  const xml = execFileSync("unzip", ["-p", path, "word/document.xml"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const refs = relationships(path);
  const questions = [];
  let month = "";
  let current = null;

  for (const block of documentBlocks(xml)) {
    if (block.type === "paragraph") {
      const monthMatch = block.text.match(/^(?:PREP\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s*(?:[—-]\s*Questions\s+\d+[–-]\d+|\d{4}))?$/i);
      if (monthMatch) {
        month = `${monthMatch[1][0].toUpperCase()}${monthMatch[1].slice(1).toLowerCase()}`;
        continue;
      }
      const questionNumber = block.style === "Heading2" ? block.text.match(/^Question\s+(\d+)/i)?.[1] : undefined;
      if (questionNumber) {
        if (current) questions.push(current);
        current = { month, number: Number(questionNumber), stem: "", choices: {}, activeChoice: null, tables: [], media: [] };
        continue;
      }
      if (!current) continue;
      const choiceMatch = block.text.match(/^([A-E])[.)]\s*(.*)$/i);
      if (choiceMatch) {
        const letter = choiceMatch[1].toUpperCase();
        current.choices[letter] = choiceMatch[2].trim();
        current.activeChoice = letter;
      } else if (/^correct answer\s*:/i.test(block.text) || /^explanation\b/i.test(block.text)) {
        current.activeChoice = null;
      } else if (current.activeChoice && !current.choices[current.activeChoice] && block.text) {
        current.choices[current.activeChoice] = block.text.trim();
      } else if (current.activeChoice && block.style === "QuestionText"
        && (!current.choices[current.activeChoice] || /^[a-z]/.test(block.text))
        && !/^[a-e]\./i.test(block.text)) {
        // The DOCX source sometimes wraps one answer option into a following lower-case QuestionText paragraph.
        // Captions and explanations are separate paragraphs and must not become answer text.
        current.choices[current.activeChoice] = `${current.choices[current.activeChoice]} ${block.text}`.trim();
      } else if (block.style === "QuestionStem" || block.style === "QuestionText") {
        current.stem = `${current.stem} ${block.text}`.trim();
      }
      current.media.push(...block.refs.map((id) => refs[id]).filter(Boolean));
    } else if (current) {
      const choiceRows = block.rows.filter((row) => row.length >= 2 && /^[A-E][.)]?$/i.test(row[0].trim()));
      if (choiceRows.length >= 2) {
        for (const row of choiceRows) current.choices[row[0].trim()[0].toUpperCase()] = row.slice(1).join(" ").trim();
        current.activeChoice = null;
      } else if (isClinicalTable(block.rows)) current.tables.push(block.rows);
      current.media.push(...block.refs.map((id) => refs[id]).filter(Boolean));
    }
  }
  if (current) questions.push(current);
  return questions;
}

function loadQuestions() {
  const passMachineSource = readFileSync(resolve(projectRoot, "data/pass-machine-questions.ts"), "utf8");
  const passMachineJavascript = ts.transpileModule(passMachineSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const passMachineContext = { exports: {}, require };
  vm.runInNewContext(passMachineJavascript, passMachineContext, { filename: "pass-machine-questions.ts" });

  const prep2022VisualSource = readFileSync(resolve(projectRoot, "data/prep-2022-figures.ts"), "utf8");
  const prep2022VisualJavascript = ts.transpileModule(prep2022VisualSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const prep2022VisualContext = { exports: {}, require };
  vm.runInNewContext(prep2022VisualJavascript, prep2022VisualContext, { filename: "prep-2022-figures.ts" });

  const source = readFileSync(resolve(projectRoot, "data/questions.ts"), "utf8");
  const enrichmentSource = readFileSync(resolve(projectRoot, "data/question-enrichments.ts"), "utf8");
  const enrichmentJavascript = ts.transpileModule(enrichmentSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const enrichmentContext = { exports: {}, require };
  vm.runInNewContext(enrichmentJavascript, enrichmentContext, { filename: "question-enrichments.ts" });
  const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = {
    exports: {},
    require: (module) => {
      if (module === "./question-enrichments") return enrichmentContext.exports;
      if (module === "./pass-machine-questions") return passMachineContext.exports;
      if (module === "./prep-2022-figures") return prep2022VisualContext.exports;
      return require(module);
    },
  };
  vm.runInNewContext(javascript, context, { filename: "questions.ts" });
  return context.exports.importedQuestions.map((question) => ({
    ...question,
    ...(enrichmentContext.exports.questionEnrichments[question.id] ?? {}),
  }));
}

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const scoreMatch = (a, b) => {
  const left = new Set(normalize(a).split(" ").filter((word) => word.length > 3));
  const right = new Set(normalize(b).split(" ").filter((word) => word.length > 3));
  const shared = [...left].filter((word) => right.has(word)).length;
  return left.size + right.size === 0 ? 0 : (2 * shared) / (left.size + right.size);
};

const questions = loadQuestions();
const report = { generatedAt: new Date().toISOString(), sources: [] };

for (const source of sourceDocs) {
  const extracted = extractSourceQuestions(source);
  const bankQuestions = questions.filter((question) => question.category.startsWith(source.prefix));
  const mapped = extracted.map((item, index) => {
    const expectedCategory = source.year === 2025 ? "PREP 2025" : `${source.prefix} - ${item.month}`;
    const candidates = source.year === 2025
      ? bankQuestions
      : bankQuestions.filter((question) => question.category === expectedCategory || question.category === `${expectedCategory} ${source.year}`);
    // Some source files skip a printed question number. The bank is imported in
    // source order, so use the item's position within its month rather than its label.
    const sourcePosition = source.year === 2025
      ? index
      : extracted.slice(0, index).filter((previous) => previous.month === item.month).length;
    const question = candidates[sourcePosition];
    const bankStem = question?.displayScenario || question?.scenario || "";
    const sourceChoices = item.choices;
    const choiceMismatches = question ? Object.entries(sourceChoices)
      .filter(([letter, choice]) => normalize(question.choices?.[letter] ?? "") !== normalize(choice))
      .map(([letter, sourceChoice]) => ({ letter, sourceChoice, bankChoice: question.choices?.[letter] ?? null })) : [];
    return {
      month: item.month,
      number: item.number,
      questionId: question?.id ?? null,
      category: question?.category ?? expectedCategory,
      matchScore: question ? Number(scoreMatch(item.stem, bankStem).toFixed(3)) : 0,
      sourceTables: item.tables,
      sourceChoices,
      choiceMismatches,
      sourceMedia: [...new Set(item.media)],
      existingTables: question?.clinicalData?.length ?? 0,
      existingImages: question?.images ?? [],
      missingImageAssets: (question?.images ?? []).filter((image) => {
        const localPath = image.replace(/^\/PICUMCQBANK\//, "/").replace(/^\//, "");
        return !existsSync(resolve(projectRoot, "public", localPath));
      }),
    };
  });
  report.sources.push({
    year: source.year,
    document: source.file,
    sourceQuestions: extracted.length,
    bankQuestions: bankQuestions.length,
    mapped,
  });
}

const outputPath = resolve(projectRoot, "tmp/prep-source-audit.json");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

const summaries = report.sources.map((source) => ({
  year: source.year,
  sourceQuestions: source.sourceQuestions,
  bankQuestions: source.bankQuestions,
    sourceTables: source.mapped.reduce((sum, question) => sum + question.sourceTables.length, 0),
  sourceMedia: source.mapped.reduce((sum, question) => sum + question.sourceMedia.length, 0),
  unmapped: source.mapped.filter((question) => !question.questionId).length,
  lowStemSimilarity: source.mapped.filter((question) => question.questionId && question.matchScore < 0.45).length,
  missingTables: source.mapped.filter((question) => question.sourceTables.length > 0 && question.existingTables === 0).length,
  missingMedia: source.mapped.filter((question) => question.sourceMedia.length > 0 && question.existingImages.length === 0).length,
  missingImageAssets: source.mapped.reduce((sum, question) => sum + question.missingImageAssets.length, 0),
  choiceMismatches: source.mapped.reduce((sum, question) => sum + question.choiceMismatches.length, 0),
}));
console.log(JSON.stringify({ outputPath, summaries }, null, 2));
