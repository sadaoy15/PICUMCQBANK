import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const sourcePdf = process.argv[2] ?? "/Users/farahs/Downloads/20206086-fc19-4edf-a442-ad01affe3928.pdf";
const outputFile = resolve(projectRoot, "data/pass-machine-questions.ts");

const swiftExtractor = String.raw`
import Foundation
import PDFKit
import AppKit

struct UnderlinedLine: Codable { let start: Int; let length: Int }
struct PageText: Codable { let page: Int; let text: String; let underlinedLines: [UnderlinedLine] }

func underlinedLines(for page: PDFPage, text: String) -> [UnderlinedLine] {
  guard text.range(of: "Answer Key", options: .caseInsensitive) != nil else { return [] }
  let pageBox = page.bounds(for: .cropBox)
  let image = page.thumbnail(of: NSSize(width: 2400, height: 3200), for: .cropBox)
  guard let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return [] }
  let bitmap = NSBitmapImageRep(cgImage: cgImage)
  guard let data = bitmap.bitmapData else { return [] }
  let width = bitmap.pixelsWide
  let height = bitmap.pixelsHigh
  let bytesPerRow = bitmap.bytesPerRow
  let bytesPerPixel = bitmap.bitsPerPixel / 8

  func isUnderlined(_ range: NSRange) -> Bool {
    guard let selection = page.selection(for: range) else { return false }
    let rect = selection.bounds(for: page)
    guard rect.width >= 10 else { return false }
    let x1 = Int((rect.minX - pageBox.minX) / pageBox.width * CGFloat(width))
    let x2 = Int((rect.maxX - pageBox.minX) / pageBox.width * CGFloat(width))
    let top = Int((pageBox.maxY - rect.maxY) / pageBox.height * CGFloat(height))
    let bottom = Int((pageBox.maxY - rect.minY) / pageBox.height * CGFloat(height))
    let threshold = Int(Double(max(1, x2 - x1)) * 0.70)
    for y in max(0, top - 2)...min(height - 1, bottom + 4) {
      var darkPixels = 0
      for x in max(0, x1)..<min(width, x2) {
        let pixel = data + y * bytesPerRow + x * bytesPerPixel
        // The rendered bitmap uses alpha-first RGBA storage.
        if Int(pixel[1]) < 90 && Int(pixel[2]) < 90 && Int(pixel[3]) < 90 { darkPixels += 1 }
      }
      if darkPixels >= threshold { return true }
    }
    return false
  }

  let nsText = text as NSString
  let fullRange = NSRange(location: 0, length: nsText.length)
  var lines: [UnderlinedLine] = []
  nsText.enumerateSubstrings(in: fullRange, options: .byLines) { _, range, _, _ in
    if isUnderlined(range) { lines.append(UnderlinedLine(start: range.location, length: range.length)) }
  }
  return lines
}

let path = CommandLine.arguments[1]
guard let document = PDFDocument(url: URL(fileURLWithPath: path)) else { fatalError("Cannot open PDF") }
let pages = (0..<document.pageCount).compactMap { index -> PageText? in
  guard let page = document.page(at: index), let text = page.string, !text.isEmpty else { return nil }
  return PageText(page: index + 1, text: text, underlinedLines: underlinedLines(for: page, text: text))
}
let data = try! JSONEncoder().encode(pages)
FileHandle.standardOutput.write(data)
`;

function readPages() {
  if (!existsSync(sourcePdf)) throw new Error(`Source PDF not found: ${sourcePdf}`);
  const result = spawnSync("swift", ["-", sourcePdf], {
    cwd: projectRoot,
    input: swiftExtractor,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(result.stderr || "Unable to extract PDF text.");
  return JSON.parse(result.stdout);
}

const normalizeWhitespace = (value = "") => value
  .replace(/\r/g, "")
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, " ")
  .replace(/[\t ]+/g, " ")
  .replace(/ *\n */g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const compactText = (value = "") => normalizeWhitespace(value)
  .replace(/\n+/g, " ")
  .replace(/\s{2,}/g, " ")
  .trim();

// These are unambiguous text-extraction defects visible in the course material.
// They restore spacing only; no medical content is added or inferred.
const mechanicalTextRepairs = [
  [/\uF020/g, " "],
  [/\uF061/g, "α"],
  [/\uF062/g, "β"],
  [/\uF06E|\uF0A7/g, "•"],
  [/\uF0B0/g, "°"],
  [/\uF0E0|\uF0E8/g, "→"],
  [/\uF0E2|\uF0EA/g, "↓"],
  [/\uF0E9/g, "↑"],
  [/\bAbundantmicrospherocytes\b/g, "Abundant microspherocytes"],
  [/\bAconsultationwithhematology\b/g, "A consultation with hematology"],
  [/\bAconsultationwith\b/g, "A consultation with"],
  [/\bACTHstimulationtest\b/g, "ACTH stimulation test"],
  [/\bActivatedprotein\b/g, "Activated protein"],
  [/\bAcuteCMVinfection\b/g, "Acute CMV infection"],
  [/\bAdministermethyleneblue\b/g, "Administer methylene blue"],
  [/\bAggressivehydration\b/g, "Aggressive hydration"],
  [/\bAlbuterolnebulizeddaily\b/g, "Albuterol nebulized daily"],
  [/\bAlesionintheperipheralnerves\b/g, "A lesion in the peripheral nerves"],
  [/\bAlloftheabove\b/g, "All of the above"],
  [/\bAngiotensinconvertingenzyme\b/g, "Angiotensin-converting enzyme"],
  [/\bAnincreasedurinaryeosinophils\b/g, "Increased urinary eosinophils"],
  [/\bAntiveninimmediately\b/g, "Antivenin immediately"],
  [/\bAprospectivestudywhichinvolves\b/g, "A prospective study that involves"],
  [/\bAprospectivetrialwhichteststhe\b/g, "A prospective trial that tests the"],
  [/\bAreasofthelungswithhigh\b/g, "Areas of the lungs with high"],
  [/\bBolusfluidtoincreasestrokevolume\b/g, "Bolus fluid to increase stroke volume"],
  [/\bChlorothiazidebyincreasingthe\b/g, "Chlorothiazide by increasing the"],
  [/\bChlorothiazidetoaugmentdiuresis\b/g, "Chlorothiazide to augment diuresis"],
  [/\bCreducesmortality\b/g, "C reduces mortality"],
  [/\bDecreasetherateontheventilator\b/g, "Decrease the rate on the ventilator"],
  [/\bDiabeticketoacidosiswithsevere\b/g, "Diabetic ketoacidosis with severe"],
  [/\bDiagnosticparacentesis\b/g, "Diagnostic paracentesis"],
  [/\bDorsalispedis\b/g, "Dorsalis pedis"],
  [/\bDrugaccumulation\b/g, "Drug accumulation"],
  [/\bDuringthefirstyearoflifethe\b/g, "During the first year of life, the"],
  [/\bECHOcardiogram\b/g, "Echocardiogram"],
  [/\bElevateandassessfrequently\b/g, "Elevate and assess frequently"],
  [/\bEmergentlargevolumeplasma\b/g, "Emergent large-volume plasma"],
  [/\bExcessofamphetamineonlywill\b/g, "Excess of amphetamine only will"],
  [/\bFailureoftheforamenovaletoclose\b/g, "Failure of the foramen ovale to close"],
  [/\bGlucoseandoxygen\b/g, "Glucose and oxygen"],
  [/\bHalvethedosewhenswitchingfrom\b/g, "Halve the dose when switching from"],
  [/\bHeightenedinteractionbetween\b/g, "Heightened interaction between"],
  [/\bHisbleedingandthrombosis\b/g, "His bleeding and thrombosis"],
  [/\bHiscurrentbodytemperaturemay\b/g, "His current body temperature may"],
  [/\bHypothyroidismfromchronicillness\b/g, "Hypothyroidism from chronic illness"],
  [/\bHypoxiainducedcardiomyopathy\b/g, "Hypoxia-induced cardiomyopathy"],
  [/\bIfthevalueofnofthetrialissmaller\b/g, "If the value of n for the trial is smaller"],
  [/\bIncreasingherdoseofparalytic\b/g, "Increasing her dose of paralytic"],
  [/\bInitiateinsulindripat\b/g, "Initiate insulin drip at"],
  [/\bIntubationandmechanical\b/g, "Intubation and mechanical"],
  [/\bIsasecretoryproductofthelungs\b/g, "Is a secretory product of the lungs"],
  [/\bItispositionedlowerinthechest\b/g, "It is positioned lower in the chest"],
  [/\bkgfluidbolus\b/g, "kg fluid bolus"],
  [/\bLargepatentductusarteriosus\b/g, "Large patent ductus arteriosus"],
  [/\bLesionoflowermotorneuron\b/g, "Lesion of lower motor neuron"],
  [/\bLocalanesthetics\b/g, "Local anesthetics"],
  [/\bLowdosenitroglycerin\b/g, "Low-dose nitroglycerin"],
  [/\bLowermotorneurondisease\b/g, "Lower motor neuron disease"],
  [/\bLungoverdistensionlimitingvenous\b/g, "Lung overdistension limiting venous"],
  [/\bLymphaticobstruction\b/g, "Lymphatic obstruction"],
  [/\bMacrophageactivationsyndrome\b/g, "Macrophage activation syndrome"],
  [/\bMaintainsthestabilityofepiglottis\b/g, "Maintains the stability of the epiglottis"],
  [/\bMalignanthyperthermiasusceptibility\b/g, "Malignant hyperthermia susceptibility"],
  [/\bmeaninhibitory\b/g, "mean inhibitory"],
  [/\bmediatedreflexbradycardia\b/g, "mediated reflex bradycardia"],
  [/\bmediatedvasoconstriction\b/g, "mediated vasoconstriction"],
  [/\bMetabolicacidosis\b/g, "Metabolic acidosis"],
  [/\bMetabolicalkalosis\b/g, "Metabolic alkalosis"],
  [/\bNorephinephrine\b/g, "Norepinephrine"],
  [/\boxygenconsumptionby\b/g, "oxygen consumption by"],
  [/\bPersistentvegetativestate\b/g, "Persistent vegetative state"],
  [/\bPhaseVclinicaltrial\b/g, "Phase V clinical trial"],
  [/\bPlaceanarteriallineforbetter\b/g, "Place an arterial line for better"],
  [/\bPosteriorcerebralcirculation\b/g, "Posterior cerebral circulation"],
  [/\bProductionofanti\b/g, "Production of anti-"],
  [/\bProvideanalgesiafortheneckpain\b/g, "Provide analgesia for the neck pain"],
  [/\bProvidesupportuntilher\b/g, "Provide support until her"],
  [/\bPulseoximetryreadingof\b/g, "Pulse oximetry reading of"],
  [/\bRapidsequenceintubation\b/g, "Rapid-sequence intubation"],
  [/\bResultsinformationofmorealveoli\b/g, "Results in formation of more alveoli"],
  [/\bSalicylatetoxicity\b/g, "Salicylate toxicity"],
  [/\bSeptationoflungsacculesgivesrise\b/g, "Septation of lung saccules gives rise"],
  [/\bShehasperitonitis\b/g, "She has peritonitis"],
  [/\bSmalleralveolarsurfacearea\b/g, "Smaller alveolar surface area"],
  [/\bSodiumloadinginthecardiomyocyte\b/g, "Sodium loading in the cardiomyocyte"],
  [/\bStartIVMilrinoneinfusion\b/g, "Start IV milrinone infusion"],
  [/\bStressgastritisorpepticulcer\b/g, "Stress gastritis or peptic ulcer"],
  [/\bTheobservedeventhas\b/g, "The observed event has"],
  [/\bThrombinisnotcriticalinthis\b/g, "Thrombin is not critical in this"],
  [/\bTidalvolumewilldecrease\b/g, "Tidal volume will decrease"],
  [/\bTransfusebloodtoahemoglobinof\b/g, "Transfuse blood to a hemoglobin of"],
  [/\bTransfusionrelatedacutelunginjury\b/g, "Transfusion-related acute lung injury"],
  [/\bUnrecognizedkidneyfailure\b/g, "Unrecognized kidney failure"],
  [/\bUrinaryalkalinizationforsalicylate\b/g, "Urinary alkalinization for salicylate"],
  [/\bUrinetoxicologyscreen\b/g, "Urine toxicology screen"],
  [/\bVascularendothelium\b/g, "Vascular endothelium"],
  [/\bVasodilationandinotropy\b/g, "Vasodilation and inotropy"],
  [/\bVolvulusfrom\b/g, "Volvulus from"],
  [/\bWhentherearefewerthan\b/g, "When there are fewer than"],
  [/\bWilcoxonsignranktest\b/g, "Wilcoxon signed-rank test"],
  [/\bYouhavearesponsibilitytoprovide\b/g, "You have a responsibility to provide"],
  [/\bYouhavenotattemptedtopersuade\b/g, "You have not attempted to persuade"],
  [/\bphospho-\s*lamban\b/gi, "phospholamban"],
  [/\bRenin-Angiotensin-\s*Aldosterone\b/g, "Renin-Angiotensin-Aldosterone"],
  [/\bischemia-\s*reperfusion\b/gi, "ischemia-reperfusion"],
  [/\bpre-\s*oxygenate\b/gi, "preoxygenate"],
  [/\banti-\s*diuretic\b/gi, "antidiuretic"],
  [/\bSyndromeofInappropriateAnti-\s*Diuretic\s+Hormone\s+Secretion\b/g, "Syndrome of Inappropriate Antidiuretic Hormone Secretion"],
  [/\bObtainCTpulmonaryangiogram\b/g, "Obtain CT pulmonary angiogram"],
  [/\bFentanylIV\b/g, "Fentanyl IV"],
  [/\bCirculatingBcells\b/g, "Circulating B cells"],
  [/\bObtainanMRIofthebrain\b/g, "Obtain an MRI of the brain"],
  [/\bWilcoxonSignedRankTest\b/g, "Wilcoxon Signed Rank Test"],
  [/\bInterquartileRange\b/g, "Interquartile Range"],
  [/\bStandardDeviation\b/g, "Standard Deviation"],
  [/\bMean±StandarderroroftheMean\b/g, "Mean ± Standard error of the mean"],
  [/\bFirst-passmetabolismandIV\s*administration\b/g, "First-pass metabolism and IV administration"],
  [/\bInhibitsPDEV,increasescGMP\b/g, "Inhibits PDE V, increases cGMP"],
  [/\bWeanFiO\s*asthepatientiswell\s*saturated2andexcessiveO\s*could lead to lung injury\s*2\b/g, "Wean FiO2 as the patient is well saturated and excessive O2 could lead to lung injury"],
  [/\bSheshouldgototheORdespiteher\s*fever\b/g, "She should go to the OR despite her fever"],
  [/\bDehydrationduetoprongedNPOtime\b/g, "Dehydration due to prolonged NPO time"],
  [/\bSlowerrateofLVpressuredevelopment\b/g, "Slower rate of LV pressure development"],
  [/\bIncreasesHR\b/g, "Increases HR"],
  [/\bCheckaCBC\b/g, "Check a CBC"],
  [/\bHepaticveinsenterIVC\b/g, "Hepatic veins enter IVC"],
  [/\bObtainCToftheneckto\s*investigatevascularinjury\b/g, "Obtain CT of the neck to investigate vascular injury"],
  [/ObtainCToftheneckto\s+investigate\s+vascular injury/g, "Obtain CT of the neck to investigate vascular injury"],
  [/\bObtainCTtoassessforlungabscess\b/g, "Obtain CT to assess for lung abscess"],
  [/\bAchildwhoisoozingaroundIVsites,hasatempof\b/g, "A child who is oozing around IV sites, has a temperature of"],
  [/hasatempof/g, "has a temperature of"],
  [/andapHof/g, "and a pH of"],
  [/\bAchildwithgradeIliverinjuryandelevatedtransaminases\b/g, "A child with grade II liver injury and elevated transaminases"],
  [/AchildwithgradeIliverinjuryand\s+elevated transaminases/g, "A child with grade II liver injury and elevated transaminases"],
];

function repairPdfText(value = "") {
  return mechanicalTextRepairs.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), compactText(value));
}

const fingerprint = (value) => repairPdfText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
// PDFKit occasionally emits adjacent options on the same visual line. Requiring
// only whitespace before the label keeps those choices separate without matching
// ordinary text inside an option.
const optionPattern = /(?:^|\s)([A-E])\.\s+(?=[A-Z0-9αβγδ])/g;
const footerPattern = /\n?Pediatric Critical Care Medicine:[\s\S]*$/i;
const collectionName = "American Physician Institute 2012-2020";
const moduleTitleRepairs = new Map([
  ["ANTIARRHYTHMICS", "Antiarrhythmics"],
  ["ANTICONVULSANTS", "Anticonvulsants"],
  ["AUTONOMIC DRUGS", "Autonomic Drugs"],
  ["PHARMACOKINETIC CONCEPTS", "Pharmacokinetic Concepts"],
]);

function moduleEntries(page) {
  return [...page.text.matchAll(/Module:\s*([^\n]+)/gi)]
    .map((match) => ({
      index: match.index ?? 0,
      title: moduleTitleRepairs.get(repairPdfText(match[1])
        .replace(/\s+(?:Module:|Notes:)[\s\S]*$/i, "")
        .replace(/\s{2,}/g, " ")
        .trim()) ?? repairPdfText(match[1])
        .replace(/\s+(?:Module:|Notes:)[\s\S]*$/i, "")
        .replace(/\s{2,}/g, " ")
        .trim(),
    }))
    .filter((entry) => entry.title.length >= 3 && !/^answer key$/i.test(entry.title));
}

function sourceTopicFrom(value) {
  const topic = normalizeWhitespace(value)
    .replace(/^Notes:\s*/i, "")
    .replace(/\s*Notes:\s*$/i, "")
    .replace(/\n?Source:\s*[\s\S]*$/i, "")
    .trim();
  if (!topic || topic.length < 30) return null;
  const lines = topic
    .split("\n")
    .flatMap((line) => repairPdfText(line)
      .replace(/\s*[•◼]\s*/g, "\n• ")
      .replace(/\s+o\s+/g, "\n◦ ")
      .split("\n"))
    .map((line) => line.trim())
    .filter(Boolean);
  const structured = [];
  for (const line of lines) {
    const previous = structured.at(-1);
    if (!/^[•◦]/.test(line) && /^[a-z(]/.test(line) && previous && /^[•◦]/.test(previous)) {
      structured[structured.length - 1] = `${previous} ${line}`;
    } else {
      structured.push(line);
    }
  }
  return structured.join("\n").replace(/ o /g, "\n◦ ").slice(0, 2200);
}

function splitChoiceFromTopic(value) {
  const raw = normalizeWhitespace(value);
  const candidates = [
    /\s+Source:\s*/i,
    /\s+Notes:\s*/i,
    /\s*\n[•]/,
    /\s+(?:Module:\s*)?[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,5}\s+[•◼]/,
    /\s+Answer:\s*/i,
    /\s+(?:Explanation|Answer Explanation)\b/i,
  ];
  const matches = candidates
    .map((pattern) => pattern.exec(raw))
    .filter((match) => match?.index !== undefined && (match.index > 8 || /^\s+Answer:\s*/i.test(match[0])))
    .sort((left, right) => left.index - right.index);
  const match = matches[0];
  if (match?.index !== undefined) {
    return { choice: repairPdfText(raw.slice(0, match.index)), topic: raw.slice(match.index).trim() };
  }
  return { choice: repairPdfText(raw), topic: "" };
}

function splitQuestionSegments(page) {
  const text = page.text.replace(footerPattern, "");
  const starts = [...text.matchAll(/Question:\s*/gi)];
  return starts.map((match, index) => ({
    page: page.page,
    content: text.slice(match.index + match[0].length, starts[index + 1]?.index ?? text.length),
    pageText: text,
    contentStart: match.index + match[0].length,
    underlinedLines: page.underlinedLines ?? [],
  }));
}

function parseQuestion(segment) {
  const content = normalizeWhitespace(segment.content);
  const candidates = [...content.matchAll(optionPattern)];
  const optionMatches = [];
  let expectedCode = "A".charCodeAt(0);
  for (const candidate of candidates) {
    if (candidate[1] !== String.fromCharCode(expectedCode)) continue;
    optionMatches.push(candidate);
    expectedCode += 1;
    if (expectedCode > "E".charCodeAt(0)) break;
  }
  if (optionMatches.length < 3) return null;

  const stem = repairPdfText(content.slice(0, optionMatches[0].index));
  if (stem.length < 12) return null;

  const choices = {};
  const choiceRanges = {};
  let topic = "";
  for (let index = 0; index < optionMatches.length; index += 1) {
    const current = optionMatches[index];
    const next = optionMatches[index + 1];
    const rawChoice = content.slice(current.index + current[0].length, next?.index ?? content.length);
    // A few slides place an unlabelled second question after the first question's
    // final option. It cannot be safely separated from text alone, so omit it.
    if (!next && (rawChoice.match(/(?:^|\s)[A-E]\.\s/g) ?? []).length >= 2) return null;
    const split = !next ? splitChoiceFromTopic(rawChoice) : { choice: repairPdfText(rawChoice), topic: "" };
    const choice = split.choice;
    if (!choice || choice.length > 420 || /[•◼]/.test(choice)
      || /\b(?:Steps Involved|Classification of|Correlation Parametric|Measure of|Central Tendency|Causes of|Venoarterial Extracorporeal|Central Venous Pressure)\b/i.test(choice)) return null;
    choices[current[1]] = choice;
    choiceRanges[current[1]] = {
      start: segment.contentStart + current.index,
      end: segment.contentStart + (next?.index ?? content.length),
    };
    if (!next) topic = split.topic;
  }

  const choiceValues = Object.values(choices);
  if (choiceValues.every((choice) => /^\d+(?:\.\d+)?(?:\s|$)/.test(choice))
    && !/^\d+(?:\.\d+)?$/.test(choiceValues.at(-1))) return null;

  const answerMatch = content.match(/\bAnswer:\s*([A-E])(?:\s*\(([^)]+)\))?/i);
  const underlinedAnswer = Object.entries(choiceRanges).find(([, range]) => segment.underlinedLines.some((line) => (
    line.start < range.end && line.start + line.length > range.start
  )))?.[0] ?? null;
  const correctAnswer = answerMatch?.[1]?.toUpperCase() ?? underlinedAnswer;
  if (correctAnswer && !choices[correctAnswer]) return null;
  const correctAnswerText = correctAnswer ? choices[correctAnswer] : null;
  const sourceTopic = sourceTopicFrom(topic);

  return {
    sourcePage: segment.page,
    sourceOffset: segment.contentStart,
    title: stem.slice(0, 130),
    scenario: stem,
    choices,
    correctAnswer,
    correctAnswerText,
    explanation: sourceTopic,
    answerFromKey: Boolean(underlinedAnswer),
  };
}

const pages = readPages();
const parsed = pages
  .flatMap(splitQuestionSegments)
  .map(parseQuestion)
  .filter(Boolean);

const sourceNotesByPage = new Map();
for (const question of parsed) {
  if (!question.explanation) continue;
  const existing = sourceNotesByPage.get(question.sourcePage);
  if (!existing || question.explanation.length > existing.length) {
    sourceNotesByPage.set(question.sourcePage, question.explanation);
  }
}

const uniqueQuestions = new Map();
for (const question of parsed) {
    const key = `${fingerprint(question.scenario)}|${Object.entries(question.choices).map(([letter, choice]) => `${letter}:${fingerprint(choice)}`).join("|")}`;
    const existing = uniqueQuestions.get(key);
    const preferQuestion = !existing
      || (!existing.correctAnswer && question.correctAnswer)
      || (!existing.answerFromKey && question.answerFromKey)
      || (existing.explanation == null && question.explanation != null);
    if (preferQuestion) {
      uniqueQuestions.set(key, {
        ...question,
        // The earliest occurrence is the original teaching page; later occurrences
        // may be answer-key pages and must not determine the chapter.
        sourcePage: existing?.sourcePage ?? question.sourcePage,
        sourceOffset: existing?.sourceOffset ?? question.sourceOffset,
        explanation: existing?.explanation ?? question.explanation,
      });
    }
}
const deduplicated = [...uniqueQuestions.values()];

const answerKeyPages = pages.filter((page) => page.underlinedLines?.length);

const chaptersByPage = new Map();
let currentChapter = "Course review";
for (const page of pages) {
  const entries = moduleEntries(page);
  chaptersByPage.set(page.page, { before: currentChapter, entries });
  if (entries.length) currentChapter = entries.at(-1).title;
}

function chapterForQuestion(question) {
  const pageChapters = chaptersByPage.get(question.sourcePage);
  if (!pageChapters) return "Course review";
  const onPage = pageChapters.entries.filter((entry) => entry.index <= question.sourceOffset).at(-1);
  return onPage?.title ?? pageChapters.before;
}

function pageContainsChapter(pageNumber, chapter) {
  const pageChapters = chaptersByPage.get(pageNumber);
  return Boolean(pageChapters && (pageChapters.before === chapter || pageChapters.entries.some((entry) => entry.title === chapter)));
}

const sourceContentPages = pages
  .filter((page) => !/\bAnswer Key\b/i.test(page.text))
  .map((page) => ({ page: page.page, text: fingerprint(page.text) }));

function locateOriginalQuestionPage(question) {
  const stem = fingerprint(question.scenario);
  const probe = stem.slice(0, Math.min(stem.length, 90));
  if (probe.length < 15) return null;
  return sourceContentPages.find((page) => page.text.includes(probe))?.page ?? null;
}

function nearestSourceNotes(question) {
  const chapter = chapterForQuestion(question);
  for (const offset of [0, 1, -1, 2, -2, 3, -3, 4, -4]) {
    if (!pageContainsChapter(question.sourcePage + offset, chapter)) continue;
    const notes = sourceNotesByPage.get(question.sourcePage + offset);
    if (notes) return notes;
  }
  const chapterNotes = [...sourceNotesByPage.entries()]
    .filter(([page]) => pageContainsChapter(page, chapter))
    .sort(([leftPage], [rightPage]) => Math.abs(leftPage - question.sourcePage) - Math.abs(rightPage - question.sourcePage));
  return chapterNotes[0]?.[1] ?? null;
}

for (const question of deduplicated) {
  const sourcePage = locateOriginalQuestionPage(question);
  if (sourcePage) {
    question.sourcePage = sourcePage;
    question.sourceOffset = Number.MAX_SAFE_INTEGER;
  }
  if (!question.explanation) question.explanation = nearestSourceNotes(question);
}

function markedOptionScore(choice, markedLine) {
  const marked = fingerprint(markedLine.replace(/^[A-E]\.\s*/i, ""));
  const candidate = fingerprint(choice);
  if (marked.length < 12 || candidate.length < 12) return 0;
  if (candidate === marked || marked.includes(candidate)) return 1;
  if (candidate.startsWith(marked)) return marked.length / candidate.length;
  return 0;
}

for (const question of deduplicated) {
  if (question.correctAnswer) continue;
  const stem = fingerprint(question.scenario);
  const stemProbe = stem.slice(0, Math.min(stem.length, 90));
  if (stemProbe.length < 30) continue;
  const matches = [];
  for (const page of answerKeyPages) {
    if (!fingerprint(page.text).includes(stemProbe)) continue;
    const markedLines = page.underlinedLines
      .map((line) => page.text.slice(line.start, line.start + line.length).trim())
      .filter((line) => /^[A-E]\.\s*/i.test(line));
    for (const [letter, choice] of Object.entries(question.choices)) {
      for (const markedLine of markedLines) {
        matches.push({ letter, score: markedOptionScore(choice, markedLine) });
      }
    }
  }
  matches.sort((left, right) => right.score - left.score);
  const best = matches[0];
  const runnerUp = matches.find((match) => match.letter !== best?.letter);
  if (best && best.score >= 0.72 && (!runnerUp || best.score - runnerUp.score >= 0.15)) {
    question.correctAnswer = best.letter;
    question.correctAnswerText = question.choices[best.letter];
    question.answerFromKey = true;
  }
}

const questions = deduplicated.map((question, index) => ({
  id: 5000 + index,
  title: question.title,
  scenario: question.scenario,
  choices: question.choices,
  correctAnswer: question.correctAnswer,
  correctAnswerText: question.correctAnswerText,
  explanation: question.explanation,
  source: collectionName,
  category: `${collectionName} - ${chapterForQuestion(question)}`,
}));

const output = `// Generated by scripts/import-pass-machine-pdf.mjs.\n// Correct answers are included only when explicitly labeled in the course material.\nimport type { Question } from "@/types/question";\n\nexport const passMachineQuestions: Question[] = ${JSON.stringify(questions, null, 2)};\n`;
writeFileSync(outputFile, output);

console.log(JSON.stringify({
  sourcePdf,
  pdfPages: pages.length,
  importedQuestions: questions.length,
  explicitlyKeyed: questions.filter((question) => question.correctAnswer).length,
  answersReadFromChapterKeys: deduplicated.filter((question) => question.answerFromKey).length,
  questionsWithSourceFigures: questions.filter((question) => question.images?.length).length,
  outputFile,
}, null, 2));
