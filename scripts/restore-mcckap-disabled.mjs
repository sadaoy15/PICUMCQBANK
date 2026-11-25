// Restore source-disabled questions from the reviewed MCCKAP 2024-named PDF.
// Also run after import-mcckap-2023.mjs so a fresh import cannot drop them again.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const reviewed = JSON.parse(fs.readFileSync(path.join(root, "data/mcckap-2024-reviewed.json"), "utf8"));
const output = path.join(root, "data/mcckap-2023-questions.ts");
const sha = value => createHash("sha256").update(value).digest("hex");
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: name => load(path.resolve(path.dirname(file), `${name}.ts`)) });
  return exports;
}
const bank = load(path.join(root, "data/questions.ts")).questions;
const existing = load(output).mcckap2023Questions;
const source = "Pediatric Multidisciplinary Critical Care Knowledge Assessment Program 2023";
const restoredNumbers = new Set(reviewed.questions.map(q => q.questionNumber));
if (restoredNumbers.size !== 9) throw new Error("Expected nine reviewed source-disabled questions");
const questions = existing.filter(q => !restoredNumbers.has(q.id - 6000));
if (questions.length !== 191) throw new Error("Existing keyed collection unexpectedly changed");

for (const item of reviewed.questions) {
  const q = {
    id: 6000 + item.questionNumber,
    title: `MCCKAP 2023 Question ${item.questionNumber}`,
    scenario: item.scenario, choices: item.choices,
    correctAnswer: null, correctAnswerText: null, explanation: null,
    source, category: "MCCKAP 2023",
    sourceNotes: ["Restored from the supplied MCCKAP 2024.pdf, internally labeled MCCKAP 2023. This question is marked disabled in the PDF, with no printed answer or commentary."],
    references: [`Supplied MCCKAP 2024.pdf, page ${item.page}, question ${item.questionNumber}.`],
  };
  if (item.recovery) {
    const recovery = item.recovery;
    const donor = bank.find(q => q.id === recovery.donorId);
    if (!donor || sha(donor.scenario) !== recovery.donorScenarioSha256
      || donor.source !== recovery.donorSource || donor.correctAnswer !== recovery.donorAnswer
      || donor.correctAnswerText !== recovery.donorAnswerText) {
      throw new Error(`Recovery evidence changed for question ${item.questionNumber}; re-review the match`);
    }
    q.correctAnswer = recovery.targetAnswer;
    q.correctAnswerText = q.choices[q.correctAnswer];
    if (!q.correctAnswerText || !donor.explanation) throw new Error("Incomplete recovery evidence");
    q.explanation = item.supplementaryExplanation
      ?? `Supplementary explanation from ${donor.title} (${donor.source}): ${donor.explanation}`;
    q.sourceNotes.push(recovery.type === "related-variant-rationale"
      ? "Answer and supplementary explanation adapted from PICU Critical Thinking Quiz, Quiz 31 Question 1. That version asks for the least likely effect and has different direct/indirect wording; the answer here is based on its explanation."
      : `Answer and supplementary explanation recovered from a matching case in ${donor.source}, after checking the case details and matching the answer text to this version's choices.`);
    q.references.push(`Existing bank question ${donor.id}: ${donor.title} (${donor.source}).`);
  } else {
    q.sourceNotes.push("No verified matching keyed question was found elsewhere in the bank. Retained for study with all source choices; excluded from scoring until an answer can be verified.");
  }
  if (item.questionNumber === 20) q.sourceNotes.push("The source has an empty Fahrenheit-temperature placeholder; the supplied 37.2 °C value is retained.");
  if (item.figure) {
    const figure = item.figure;
    const directory = path.join(root, "public/images/mcckap-2024-restored");
    fs.mkdirSync(directory, { recursive: true });
    const asset = path.join(directory, figure.filename);
    const pdf = process.argv[2] ?? "/Users/farahs/Downloads/MCCKAP 2024.pdf";
    if (fs.existsSync(pdf)) {
      if (sha(fs.readFileSync(pdf)) !== reviewed.suppliedSha256) throw new Error("Supplied PDF changed; review it before importing");
      execFileSync("python3", ["-c", `import fitz,sys,json
d=fitz.open(sys.argv[1]);p=d[int(sys.argv[2])-1];c=json.loads(sys.argv[3]);r=p.rect
p.get_pixmap(matrix=fitz.Matrix(3,3),clip=fitz.Rect(r.width*c[0],r.height*c[1],r.width*c[2],r.height*c[3])).save(sys.argv[4])`, pdf, String(figure.page), JSON.stringify(figure.displayCrop), asset]);
    } else if (!fs.existsSync(asset)) throw new Error("Source PDF required to restore ECG");
    q.visuals = { question: [{ src: `/PICUMCQBANK/images/mcckap-2024-restored/${figure.filename}`, label: figure.label, caption: figure.caption }] };
  }
  questions.push(q);
}
questions.sort((a, b) => a.id - b.id);
if (questions.length !== 200 || questions.some((q, i) => q.id !== 6001 + i)) throw new Error("Source numbering is incomplete");
for (const q of questions) {
  if (!q.scenario || Object.keys(q.choices).length < 3 || (q.correctAnswer && q.correctAnswerText !== q.choices[q.correctAnswer])) throw new Error(`Invalid question ${q.id}`);
}
const assets = questions.flatMap(q => Object.values(q.visuals ?? {}).flatMap(value => Array.isArray(value) ? value : Object.values(value).flat()))
  .map(figure => {
    const file = path.join(root, "public", figure.src.replace(/^\/PICUMCQBANK\//, "/"));
    return { src: figure.src, sha256: sha(fs.readFileSync(file)) };
  });
const audit = {
  suppliedFile: reviewed.suppliedFile, suppliedSha256: reviewed.suppliedSha256,
  internalExamLabel: reviewed.internalExamLabel, comparison: reviewed.comparison,
  total: 200, previouslyImported: 191, restored: 9,
  recoveredAnswers: reviewed.questions.filter(q => q.recovery).map(q => q.questionNumber),
  unscored: questions.filter(q => !q.correctAnswer).map(q => q.id - 6000),
  scored: questions.filter(q => q.correctAnswer).length,
  explanations: questions.filter(q => q.explanation).length,
  assets,
  questions: questions.map(q => {
    const number = q.id - 6000;
    const item = reviewed.questions.find(q => q.questionNumber === number);
    return { questionNumber: number, id: q.id, pages: reviewed.sourcePageMap[number],
      status: item ? (item.recovery ? "restored-recovered-answer" : "restored-intentionally-unscored") : "original-keyed",
      answer: q.correctAnswer, choices: Object.keys(q.choices).length,
      recovery: item?.recovery ?? null, explanation: Boolean(q.explanation) };
  }),
};
fs.writeFileSync(output, `// Generated by import-mcckap-2023.mjs and restore-mcckap-disabled.mjs.\nimport type { Question } from "@/types/question";\n\nexport const mcckap2023Questions: Question[] = ${JSON.stringify(questions, null, 2)};\n`);
fs.writeFileSync(path.join(root, "data/mcckap-2024-audit.json"), `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify({ total: audit.total, restored: audit.restored, recoveredAnswers: audit.recoveredAnswers, unscored: audit.unscored, scored: audit.scored }, null, 2));
