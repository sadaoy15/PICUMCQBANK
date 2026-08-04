import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);

function loadQuestions() {
  const passMachineSource = readFileSync(resolve(projectRoot, "data/pass-machine-questions.ts"), "utf8");
  const passMachineJavaScript = ts.transpileModule(passMachineSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const passMachineContext = { exports: {}, require };
  vm.runInNewContext(passMachineJavaScript, passMachineContext, { filename: "pass-machine-questions.ts" });

  const prep2022VisualSource = readFileSync(resolve(projectRoot, "data/prep-2022-figures.ts"), "utf8");
  const prep2022VisualJavaScript = ts.transpileModule(prep2022VisualSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const prep2022VisualContext = { exports: {}, require };
  vm.runInNewContext(prep2022VisualJavaScript, prep2022VisualContext, { filename: "prep-2022-figures.ts" });

  const enrichmentSource = readFileSync(resolve(projectRoot, "data/question-enrichments.ts"), "utf8");
  const enrichmentJavaScript = ts.transpileModule(enrichmentSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const enrichmentContext = { exports: {}, require };
  vm.runInNewContext(enrichmentJavaScript, enrichmentContext, { filename: "question-enrichments.ts" });

  const questionSource = readFileSync(resolve(projectRoot, "data/questions.ts"), "utf8");
  const questionJavaScript = ts.transpileModule(questionSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const questionContext = {
    exports: {},
    require: (module) => {
      if (module === "./question-enrichments") return enrichmentContext.exports;
      if (module === "./pass-machine-questions") return passMachineContext.exports;
      if (module === "./prep-2022-figures") return prep2022VisualContext.exports;
      return require(module);
    },
  };
  vm.runInNewContext(questionJavaScript, questionContext, { filename: "questions.ts" });
  return {
    questions: questionContext.exports.questions,
    importedQuestions: questionContext.exports.importedQuestions,
  };
}

function loadInlineClinicalData() {
  const source = readFileSync(resolve(projectRoot, "lib/inline-clinical-data.ts"), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {}, require };
  vm.runInNewContext(javascript, context, { filename: "inline-clinical-data.ts" });
  return context.exports.inlineClinicalData;
}

const normalize = (value = "") => value
  .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const sourceLabelledLab = /\b(?:laboratory|lab)\s+(?:test\s+)?(?:data|result|results|values)\b|\b(?:arterial|venous)\s+blood\s+gas(?:\s+(?:analysis|values?))?\b/i;
const textFields = ["title", "scenario", "explanation", "source", "category"];
const { questions, importedQuestions } = loadQuestions();
const importedById = new Map(importedQuestions.map((question) => [question.id, question]));
const presentationFor = loadInlineClinicalData();
const exactDuplicates = new Map();
const scenarioDuplicates = new Map();
const report = {
  generatedAt: new Date().toISOString(),
  totalQuestions: questions.length,
  invalidAnswers: [],
  invalidChoiceCounts: [],
  missingRequiredFields: [],
  answerTextMismatches: [],
  importedAnswerKeyMismatches: [],
  answerKeyChoiceConflicts: [],
  truncatedCorrectChoices: [],
  suspiciousChoiceEndings: [],
  controlCharacters: [],
  hyphenatedLineWraps: [],
  sourceLabelledLabsWithoutTables: [],
  missingImageAssets: [],
  questionsWithoutSourceAnswerKey: [],
  questionsWithoutExplanation: [],
  questionsWithoutSource: [],
};

for (const question of questions) {
  const imported = importedById.get(question.id);
  const choiceText = Object.entries(question.choices ?? {}).map(([key, value]) => `${key}:${value}`).join("|");
  const exactKey = `${normalize(question.scenario)}|${normalize(choiceText)}`;
  const scenarioKey = normalize(question.scenario);
  exactDuplicates.set(exactKey, [...(exactDuplicates.get(exactKey) ?? []), question]);
  scenarioDuplicates.set(scenarioKey, [...(scenarioDuplicates.get(scenarioKey) ?? []), question]);

  for (const field of textFields) {
    const value = question[field];
    if ((field === "title" || field === "scenario" || field === "category") && !String(value ?? "").trim()) {
      report.missingRequiredFields.push({ id: question.id, category: question.category, field });
    }
    if (typeof value === "string" && /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/.test(value)) {
      report.controlCharacters.push({ id: question.id, category: question.category, field });
    }
    if (typeof value === "string" && /\b[A-Za-z]{3,}-\s+[a-z]{2,}\b/.test(value)) {
      report.hyphenatedLineWraps.push({ id: question.id, category: question.category, field });
    }
  }

  const choiceEntries = Object.entries(question.choices ?? {});
  if (choiceEntries.length < 2 || choiceEntries.some(([letter, text]) => !/^[A-Z]$/.test(letter) || !String(text ?? "").trim())) {
    report.invalidChoiceCounts.push({ id: question.id, category: question.category, choices: choiceEntries.map(([letter]) => letter) });
  }

  if (!question.correctAnswer) {
    report.questionsWithoutSourceAnswerKey.push({ id: question.id, category: question.category });
  } else if (!question.choices?.[question.correctAnswer]) {
    report.invalidAnswers.push({ id: question.id, category: question.category, correctAnswer: question.correctAnswer });
  } else if (question.correctAnswerText && normalize(question.correctAnswerText) !== normalize(question.choices[question.correctAnswer])) {
    report.answerTextMismatches.push({
      id: question.id,
      category: question.category,
      correctAnswer: question.correctAnswer,
      answerText: question.correctAnswerText,
      choiceText: question.choices[question.correctAnswer],
    });
  }

  if (imported?.correctAnswer && imported.choices?.[imported.correctAnswer] && imported.correctAnswerText
    && normalize(imported.correctAnswerText) !== normalize(imported.choices[imported.correctAnswer])) {
    report.importedAnswerKeyMismatches.push({
      id: question.id,
      category: question.category,
      correctAnswer: imported.correctAnswer,
      answerText: imported.correctAnswerText,
      choiceText: imported.choices[imported.correctAnswer],
    });

    const matchingChoice = Object.entries(imported.choices).find(([letter, choice]) => (
      letter !== imported.correctAnswer && normalize(choice) === normalize(imported.correctAnswerText)
    ));
    if (matchingChoice) {
      report.answerKeyChoiceConflicts.push({
        id: question.id,
        category: question.category,
        correctAnswer: imported.correctAnswer,
        matchingChoice: matchingChoice[0],
        answerText: imported.correctAnswerText,
      });
    }
  }

  for (const [letter, choice] of choiceEntries) {
    const normalizedChoice = normalize(choice);
    const normalizedAnswerText = letter === question.correctAnswer ? normalize(question.correctAnswerText) : "";
    if (normalizedAnswerText && normalizedAnswerText.startsWith(normalizedChoice) && normalizedAnswerText.length > normalizedChoice.length) {
      report.truncatedCorrectChoices.push({
        id: question.id,
        category: question.category,
        letter,
        choice,
        answerText: question.correctAnswerText,
      });
    }
    if (/\b(?:a|an|and|at|by|for|from|in|of|on|or|the|to|with)$/i.test(String(choice).trim())) {
      report.suspiciousChoiceEndings.push({ id: question.id, category: question.category, letter, choice });
    }
  }

  if (sourceLabelledLab.test(question.scenario) && !presentationFor(question).blocks?.length) {
    report.sourceLabelledLabsWithoutTables.push({ id: question.id, category: question.category, title: question.title });
  }
  if (!question.explanation?.trim()) report.questionsWithoutExplanation.push({ id: question.id, category: question.category });
  if (!question.source?.trim()) report.questionsWithoutSource.push({ id: question.id, category: question.category });

  for (const image of question.images ?? []) {
    const localPath = image.replace(/^\/PICUMCQBANK\//, "/").replace(/^\//, "");
    if (!existsSync(resolve(projectRoot, "public", localPath))) {
      report.missingImageAssets.push({ id: question.id, category: question.category, image });
    }
  }
}

report.exactDuplicateGroups = [...exactDuplicates.values()]
  .filter((group) => group.length > 1)
  .map((group) => ({ ids: group.map((question) => question.id), categories: group.map((question) => question.category) }));
report.scenarioDuplicateGroups = [...scenarioDuplicates.values()]
  .filter((group) => group.length > 1)
  .map((group) => ({ ids: group.map((question) => question.id), categories: group.map((question) => question.category) }));

const outputPath = resolve(projectRoot, "tmp/question-bank-audit.json");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

const summary = Object.fromEntries(Object.entries(report)
  .filter(([, value]) => Array.isArray(value))
  .map(([key, value]) => [key, value.length]));
console.log(JSON.stringify({ outputPath, totalQuestions: questions.length, ...summary }, null, 2));
