import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
function loadBank(mainSource, entry = 'data/questions.ts') {
  const cache = new Map();
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const context = { exports: {}, require: name => {
      assert(name.startsWith('./'), `Unexpected runtime import: ${name}`);
      return load(resolve(dirname(path), `${name}.ts`));
    } };
    const source = path === resolve(root, 'data/questions.ts') ? mainSource : readFileSync(path, 'utf8');
    const js = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(js, context, { filename: path });
    cache.set(path, context.exports);
    return context.exports;
  }
  return load(resolve(root, entry));
}
const current = loadBank(readFileSync(resolve(root, 'data/questions.ts'), 'utf8'));
const studyGuide = current.importedQuestions.filter(q => q.category.startsWith('Study Guide'));
assert.equal(studyGuide.length, 425, 'All imported Study Guide questions must remain present');
const byId = new Map(current.questions.map(q => [q.id, q]));
const { inlineClinicalData } = loadBank(undefined, 'lib/inline-clinical-data.ts');
const contamination = /\b(?:Fig\.\s*\d|Table\s+\d+\.\d+|For questions\s+\d|Undersensing results|The goal is optimization|The largest study of tight glucose control)\b/i;
const authorFooter = /(?:\b(?:[A-Z]\. ){2,}[A-Z][a-z]+|Maffei|LynShue|Bunchman|Khazal)/;
const splitWord = /\b[a-z]+-\s+[a-z]+/;
for (const q of studyGuide) {
  for (const [field, value] of Object.entries({ title: q.title, scenario: q.scenario, ...q.choices })) {
    assert(value.trim(), `${q.id} ${field}: empty text`);
    assert(!contamination.test(value), `${q.id} ${field}: leaked source material`);
    assert(!authorFooter.test(value), `${q.id} ${field}: author footer`);
    assert(!splitWord.test(value), `${q.id} ${field}: split word`);
    assert(!/[\x00-\x1f\u00ad\ufeff]/.test(value), `${q.id} ${field}: extraction control character`);
    assert(!/\bcm H20\b/.test(value), `${q.id} ${field}: malformed pressure unit`);
  }
  const keys = Object.keys(q.choices);
  assert.deepEqual(keys, Array.from({ length: keys.length }, (_, i) => String.fromCharCode(65 + i)), `${q.id}: missing/merged option label`);
  const effective = byId.get(q.id);
  if (effective) {
    const presentation = inlineClinicalData(effective);
    assert(!/\b(?:An?|His|Her|Their|The)(?: (?:most recent|initial|only))?\. Laboratory data/i.test(presentation.text), `${q.id}: incomplete display sentence`);
  }
  if (effective?.correctAnswer) {
    assert(effective.choices[effective.correctAnswer], `${q.id}: missing keyed choice`);
    assert.equal(effective.correctAnswerText, effective.choices[effective.correctAnswer], `${q.id}: stale answer text`);
  }
}
assert.equal(byId.get(3053).choices.E, 'Short inspiratory time allowing prolonged expiration');
assert.equal(byId.get(3101).choices.B, 'Qpul = CAoO2 / (CpvO2 − CpaO2)');
assert.equal(byId.get(3101).choices.E, 'Qsyst = VO2 / (CAoO2 − CpaO2)');
assert(byId.get(3110).choices.D.endsWith('PASP = 4 × (TRVmax)²'));
assert.equal(Object.keys(byId.get(3127).choices).length, 6);
assert.equal(byId.get(3127).correctAnswer, 'F');
assert(byId.get(3137).choices.A.includes('increased intracranial pressure'));
assert(!byId.get(3137).choices.A.includes('adrenoceptor'));
assert(byId.get(3176).scenario.includes('mean 83 mm Hg'));
assert(byId.get(3176).scenario.includes('intracranial pressure: 22 mm Hg'));
assert(byId.get(3176).scenario.endsWith('cerebral perfusion pressure?'));
for (const id of [2978, 3231]) assert(!/same data|described in question/.test(byId.get(id).scenario));
for (let id = 3257; id <= 3261; id++) assert(!/\([a-d]\)/.test(byId.get(id).scenario));
const examplePresentation = inlineClinicalData(byId.get(3053));
assert(examplePresentation.blocks?.[0].rows.some(([label, value]) => label === 'PaCO2' && value === '21 mmHg'));
const narrativePresentation = inlineClinicalData(byId.get(3245));
assert.equal(narrativePresentation.text, byId.get(3245).scenario, 'Keep the diagnosis and subsequent clinical course in the stem');

// Optional baseline ref verifies the scope and saved-progress identifiers of a change.
if (process.argv[2]) {
  const baselineSource = execFileSync('git', ['show', `${process.argv[2]}:data/questions.ts`], { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  const baseline = loadBank(baselineSource);
  const before = new Map(baseline.importedQuestions.map(q => [q.id, q]));
  assert.equal(JSON.stringify(current.importedQuestions.map(q => q.id)), JSON.stringify(baseline.importedQuestions.map(q => q.id)));
  for (const q of current.importedQuestions) {
    const old = before.get(q.id);
    if (!q.category.startsWith('Study Guide')) {
      assert.equal(JSON.stringify(q), JSON.stringify(old), `${q.id}: changed outside Study Guide`);
    } else {
      for (const field of ['id', 'source', 'category', 'correctAnswer', 'explanation', 'images']) {
        assert.equal(JSON.stringify(q[field]), JSON.stringify(old[field]), `${q.id}: unexpected ${field} change`);
      }
    }
  }
  console.log('Baseline scope check passed: IDs, answer keys and other question sets preserved.');
}
console.log(`PASS: reviewed ${studyGuide.length} imported Study Guide questions; ${current.questions.filter(q => q.category.startsWith('Study Guide')).length} unique questions available after existing deduplication.`);
