import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);

function loadModule(fileName) {
  const source = readFileSync(resolve(projectRoot, fileName), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {}, require };
  vm.runInNewContext(javascript, context, { filename: fileName });
  return context.exports;
}

const passMachine = loadModule("data/pass-machine-questions.ts");
const prep2021 = loadModule("data/prep-2021-figures.ts");
const prep2022 = loadModule("data/prep-2022-figures.ts");
const picuMcqVisuals = loadModule("data/picumcq-figures.ts");
const enrichments = loadModule("data/question-enrichments.ts");
const mcckap2023 = loadModule("data/mcckap-2023-questions.ts");
const questionSource = readFileSync(resolve(projectRoot, "data/questions.ts"), "utf8");
const questionJavascript = ts.transpileModule(questionSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const questionContext = {
  exports: {},
  require: (moduleName) => {
    if (moduleName === "./pass-machine-questions") return passMachine;
    if (moduleName === "./prep-2021-figures") return prep2021;
    if (moduleName === "./prep-2022-figures") return prep2022;
    if (moduleName === "./picumcq-figures") return picuMcqVisuals;
    if (moduleName === "./question-enrichments") return enrichments;
    if (moduleName === "./mcckap-2023-questions") return mcckap2023;
    return require(moduleName);
  },
};
vm.runInNewContext(questionJavascript, questionContext, { filename: "data/questions.ts" });

const reviewQuestions = questionContext.exports.questions.filter(
  (question) => question.category === "PICU MCQ Review",
);

const rows = reviewQuestions
  .map((question, index) => ({
    number: index + 1,
    id: question.id,
    refersToVisual: /\b(?:figure|image|radiograph|tracing|curve|diagram|table)\b/i.test(question.scenario),
    images: [
      ...(question.images ?? []),
      ...(question.visuals?.question ?? []).map((figure) => figure.src),
      ...(question.visuals?.explanation ?? []).map((figure) => figure.src),
      ...Object.values(question.visuals?.choices ?? {}).flat().map((figure) => figure.src),
    ],
    title: question.title,
  }))
  .filter((row) => row.refersToVisual || row.images.length);

const missing = rows.flatMap((row) => row.images
  .filter((src) => !existsSync(resolve(projectRoot, "public", src.replace(/^\/PICUMCQBANK\//, "/").replace(/^\//, ""))))
  .map((src) => ({ number: row.number, src })));
const choiceLeakage = reviewQuestions
  .map((question, index) => ({ number: index + 1, id: question.id, scenario: question.displayScenario ?? question.scenario }))
  .filter((row) => /(?:^|\s)[A-E]\)\s+/.test(row.scenario));

console.log(JSON.stringify({
  total: reviewQuestions.length,
  withLegacyImages: reviewQuestions.filter((question) => question.images?.length).length,
  withCuratedVisuals: reviewQuestions.filter((question) => question.visuals && (
    question.visuals.question?.length
    || question.visuals.explanation?.length
    || Object.values(question.visuals.choices ?? {}).some((figures) => figures?.length)
  )).length,
  referringToVisual: reviewQuestions.filter((question) => /\b(?:figure|image|radiograph|tracing|curve|diagram|table)\b/i.test(question.scenario)).length,
  missing,
  choiceLeakage,
  rows: rows.map((row) => ({ ...row, images: row.images.map((src) => basename(src)) })),
}, null, 2));
