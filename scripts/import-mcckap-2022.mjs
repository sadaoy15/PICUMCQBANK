// Source-faithful import: no answers or clinical rationales are inferred.
// Input: 2.5x JPEG page renders, Tesseract TSV JSON, and 4x PNG figure pages in tmp/pdfs/mcckap-2022.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const ROOT = process.cwd();
const TMP = path.join(ROOT, 'tmp/pdfs/mcckap-2022');
const ASSETS = path.join(ROOT, 'public/images/mcckap-2022');
const SOURCE = 'Pediatric Multidisciplinary Critical Care Knowledge Assessment Program 2022';
const clean = s => s.replace(/\bH[,;]0\b/g,'H2O').replace(/\bFIO[,;]\b/g,'FIO2').replace(/\bFI0[,;]/g,'FIO2').replace(/\bFIO[,;]/g,'FIO2').replace(/\bSpO[,;]/g,'SpO2').replace(/\bmm\?/g,'mm^3').replace(/\bmL\/m\?/g,'mL/m^2').replace(/\b([A-Z])(?=\d+-year)/g,'$1 ').replace(/^AA (?=\d)/,'A ').replace(/\bAd-year-old/g,'A 4-year-old').replace(/A12:year-old gir\b/g,'A 12-year-old girl').replace(/\bLivertransaminase/g,'Liver transaminase').replace(/\bArterialblood/g,'Arterial blood').replace(/\bfollowing ii the/g,'following is the').replace(/\bleft eg\b/g,'left leg').replace(/\s+/g, ' ').trim();
const figurePages = new Set([21,23,29,43,50,69,71,82,85,103,105,106,109,115,116,125,135,141,144,156,160,167,173,183,185]);
// Reviewed bounds as fractions of the full PDF page height.
const figureBounds = new Map([[23,[.15,.675]],[43,[.402,.568]],[103,[.402,.584]],[125,[.12,.42]],[135,[.355,.537]],[185,[.215,.375]]]);
// Source option centers on pages whose screenshot margins or clipped border defeat row detection.
const reviewedOptionCenters = new Map([[23,[1460,1523,1587,1650,1714]],[85,[859,923,986,1050,1115]],[125,[933,997,1060,1124,1188]],[185,[826,890,954,1017,1080]],[43,[1225,1304,1382,1460,1539]]]);
const overrides = new Map([
 [50,{choicePatches:{E:'Ependymoma'}}],
 [163,{choicePatches:{D:'Carbon monoxide inhalation'}}],
 [168,{choicePatches:{D:'Thrombocytopenia'}}],
 [175,{choicePatches:{D:'Reverse triggering occurs when the mode set on the ventilator induces an asynchronous patient response.'}}],
 [23,{choicePatches:{D:'Clobazam'}}],
 [43,{choicePatches:{E:'Increased circulating levels of bradykinin'}}],
 [87,{choicePatches:{D:'The curvilinear array probe uses higher frequency ranges and a fan-shaped probe for sector-shaped images.'}}],
 [195,{choicePatches:{C:'Pericardial effusion'}}],
 [62,{choicePatches:{E:'CBC'}}],
 [71,{choicePatches:{A:'Magnesium sulfate'}}],
 [139,{scenario:'Which of the following immunosuppressants is matched correctly with its mechanism of action and adverse events?'}],
]);
const pages = JSON.parse(await fs.readFile(path.join(TMP, 'tesseract.json'), 'utf8'));
function tsvLines(page, width, height) {
 const groups=new Map();
 for(const row of page.tsv.trim().split('\n').slice(1)){
  const f=row.split('\t');if(Number(f[0])!==5 || !f[11])continue;
  const key=f.slice(1,5).join(':');if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push({x:Number(f[6])/width,top:Number(f[7])/height,right:(Number(f[6])+Number(f[8]))/width,bottom:(Number(f[7])+Number(f[9]))/height,text:f.slice(11).join('\t'),confidence:Number(f[10])/100});
 }
 return [...groups.values()].map(words=>({x:Math.min(...words.map(w=>w.x)),top:Math.min(...words.map(w=>w.top)),bottom:Math.max(...words.map(w=>w.bottom)),text:words.map(w=>w.text).join(' '),confidence:Math.min(...words.map(w=>w.confidence)),words})).sort((a,b)=>a.top-b.top||a.x-b.x);
}
if(pages.length !== 190) throw new Error(`Expected 190 pages; OCR has ${pages.length}`);
await fs.mkdir(ASSETS, {recursive:true});
const PAGE_DIRECTORY=path.join(TMP,'pages');
const groupConsecutiveRows = (rows) => {
  const segments = [];
  for (const row of rows) {
    const previous = segments.at(-1);
    if (previous && row <= previous[1] + 1) previous[1] = row;
    else segments.push([row, row]);
  }
  return segments;
};

const colorRows = (segments) => {
  const rows = [];
  for (let index = 0; index < segments.length; index += 1) {
    let [start, end] = segments[index];
    while (index + 1 < segments.length && segments[index + 1][0] - end <= 25) {
      end = segments[index += 1][1];
    }
    if (
      end - start < 35
      && index + 1 < segments.length
      && segments[index + 1][1] - start <= 135
      && segments[index + 1][0] - end >= 30
    ) {
      end = segments[index += 1][1];
    }
    if (end - start >= 20 && end - start <= 140) rows.push([start, end]);
  }
  return rows;
};

const longestRun = (data, info, y, predicate) => {
  let longest = 0;
  let current = 0;
  for (let x = 0; x < info.width; x += 1) {
    const offset = (y * info.width + x) * info.channels;
    if (predicate(data[offset], data[offset + 1], data[offset + 2])) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
};

const analyzePage = async (pageNumber) => {
  const pagePath = path.join(PAGE_DIRECTORY, `page-${String(pageNumber).padStart(3, "0")}.jpg`);
  const { data, info } = await sharp(pagePath).raw().toBuffer({ resolveWithObject: true });
  const qualifyingRows = { neutral: [], green: [], red: [] };

  const predicates = {
    neutral: (red, green, blue) => {
      const value = (red + green + blue) / 3;
      const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
      return value > 175 && value < 250 && chroma < 18;
    },
    green: (red, green, blue) => green > red + 7 && green > blue + 4 && green > 120,
    red: (red, green, blue) => red > green + 7 && red > blue + 4 && red > 120,
  };

  for (let y = 0; y < info.height; y += 1) {
    for (const [kind, predicate] of Object.entries(predicates)) {
      if (longestRun(data, info, y, predicate) > info.width * 0.72) qualifyingRows[kind].push(y);
    }
  }

  const greenRows = colorRows(groupConsecutiveRows(qualifyingRows.green));
  const redRows = colorRows(groupConsecutiveRows(qualifyingRows.red));
  const coloredRows = [
    ...greenRows.map((range) => ({ range, kind: "green" })),
    ...redRows.map((range) => ({ range, kind: "red" })),
  ];

  let boundaries = groupConsecutiveRows(qualifyingRows.neutral)
    .map(([start, end]) => Math.round((start + end) / 2))
    .filter((y) => y > info.height * 0.12 && y < info.height * 0.94);

  for (const { range } of coloredRows) {
    boundaries = boundaries.filter((y) => y < range[0] - 5 || y > range[1] + 5);
    boundaries.push(...range);
  }
  boundaries = [...new Set(boundaries)].sort((a, b) => a - b);

  const rowCandidates = [];
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const top = boundaries[index];
    const bottom = boundaries[index + 1];
    const height = bottom - top;
    if (height < 20 || height > 140) continue;
    rowCandidates.push({
      top,
      bottom,
      isCorrect: greenRows.some(([greenTop, greenBottom]) => (
        Math.abs(greenTop - top) < 7 && Math.abs(greenBottom - bottom) < 7
      )),
    });
  }

  const rowSequences = [];
  for (let index = 0; index < rowCandidates.length; index += 1) {
    const sequence = [rowCandidates[index]];
    for (let next = index + 1; next < rowCandidates.length && sequence.length < 5; next += 1) {
      const gap = rowCandidates[next].top - sequence.at(-1).bottom;
      if (gap >= 8 && gap <= 38) sequence.push(rowCandidates[next]);
      else if (gap > 38) break;
    }
    rowSequences.push(sequence);
  }

  return {
    height: info.height,
    width: info.width,
    rowSequences,
  };
};


const questions=[], audit=[];
for (const page of pages) {
 const pdfPage = Number(page.file.match(/\d+/)[0]);
 const metadata=await sharp(path.join(TMP,'pages',page.file)).metadata(); page.width=metadata.width;page.height=metadata.height;
 const lines=tsvLines(page,page.width,page.height);
 const header=lines.find(l=>/Question\s+\d+\s+(?:of|ot)\s+200/i.test(l.text));
 if(!header){ audit.push({pdfPage,status:lines.length?'unrecognized-page':'blank-page'}); continue; }
 const n=Number(header.text.match(/Question\s+(\d+)/i)[1]);
 const refMarker=lines.find(l=>l.top>header.bottom && /^(?:References|Reference)$/i.test(l.text));
 const cache=path.join(TMP,`analysis-${pdfPage}.json`);
 let analysis;try{analysis=JSON.parse(await fs.readFile(cache,'utf8'));}catch{analysis=await analyzePage(pdfPage);await fs.writeFile(cache,JSON.stringify(analysis));}
 const sequences=analysis.rowSequences.filter(s=>s.length>=3&&s.length<=5);
 const rows=sequences.filter(s=>s.some(r=>r.isCorrect)).sort((a,b)=>b.length-a.length)[0]??sequences.sort((a,b)=>b.length-a.length)[0];
 const reviewedRows=reviewedOptionCenters.get(pdfPage)?.map(y=>({top:y-28,bottom:y+28,isCorrect:false}));
 const optionLabels=(reviewedRows??rows??[]).map((row,i)=>({top:row.top/page.height,bottom:row.bottom/page.height,key:String.fromCharCode(65+i),isCorrect:row.isCorrect}));
 const fix=overrides.get(n)??{};
 if(optionLabels.length<3) { audit.push({pdfPage,questionNumber:n,status:'missing-options',labels:optionLabels}); continue; }
 const choices={}; const answerScores=[];
 const {data,info}=await sharp(path.join(TMP,'pages',page.file)).removeAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<optionLabels.length;i++){
  const label=optionLabels[i]; const next=optionLabels[i+1];
  const bottom=label.bottom;
  const texts=lines.flatMap(l=>l.words).filter(l=>l.x>.15 && (l.top+l.bottom)/2>=label.top && (l.top+l.bottom)/2<bottom && l.text!=='References');
  choices[label.key]=clean([label.rest,...texts.map(l=>l.text)].filter(Boolean).join(' ')).replace(new RegExp(`^(?:[JXV|]\\s+)?(?:[lI|]?${label.key}|${label.key==='D'?'oo':'___'})[.,:]?\\s+`,'i'),'');
  let green=0;
  for(let y=Math.max(0,Math.floor((label.top-.009)*info.height));y<Math.min(info.height,Math.ceil((label.bottom+.009)*info.height));y++){
   for(let x=Math.floor(info.width*.035);x<info.width*.94;x++){
    const k=(y*info.width+x)*info.channels;const [r,g,b]=[data[k],data[k+1],data[k+2]];
    if(g>r+12 && g>b+12 && g>65)green++;
   }
  }
  answerScores.push({key:label.key,green});
 }
 const sorted=[...answerScores].sort((a,b)=>b.green-a.green);
 const correctAnswer=fix.answer??optionLabels.find(l=>l.isCorrect)?.key??(sorted[0].green>100 && sorted[0].green>sorted[1].green*3?sorted[0].key:null);
 const chrome=l=>/Pediatric Multidisciplinary|Question\s+\d+\s+of|^Notes?$|^AA$|^References$/i.test(l.text)|| (l.x>.8 && l.text.length<8);
 let detectedFigureBounds;
 if(figurePages.has(pdfPage)) {
  const grayRows=[], darkRows=[];
  for(let y=Math.ceil((header.bottom+.02)*info.height);y<Math.floor((optionLabels[0].top-.012)*info.height);y++){
   let gray=0,dark=0;
   for(let x=Math.floor(info.width*.025);x<info.width*.975;x++){
    const k=(y*info.width+x)*info.channels;const r=data[k],g=data[k+1],b=data[k+2];
    if(Math.max(r,g,b)-Math.min(r,g,b)<8 && r>225 && r<250)gray++;
    if(r<180 && g<180 && b<180)dark++;
   }
   if(gray>info.width*.62)grayRows.push(y);
   if(dark>info.width*.52)darkRows.push(y);
  }
  const rows=[43,103,109,135].includes(pdfPage)?darkRows:(grayRows.length>15?grayRows:darkRows);
  if(rows.length)detectedFigureBounds=[(rows[0]-3)/info.height,(rows.at(-1)+4)/info.height];
  if(figureBounds.has(pdfPage))detectedFigureBounds=figureBounds.get(pdfPage);
 }
 let stemLines=lines.filter(l=>l.top>header.bottom+.015 && l.bottom<optionLabels[0].top-.004 && !chrome(l));
 if(figurePages.has(pdfPage)){
  // Figure text is preserved in the source crop; only left-aligned prose is transcribed.
  stemLines=stemLines.filter(l=>detectedFigureBounds ? l.bottom<detectedFigureBounds[0] || l.top>detectedFigureBounds[1] : l.x<.08);
 }
 let scenario=clean(stemLines.filter(l=>l.text.length>8).map(l=>l.text).join(' '));
 let refs=[];
 if(refMarker){
  const refLines=lines.filter(l=>l.top>refMarker.bottom+.003 && l.x<.98 && !chrome(l));
  for(const l of refLines){
   if(!refs.length || l.top-(refLines[refLines.indexOf(l)-1]?.bottom??l.top)>.008)refs.push(l.text);else refs[refs.length-1]+=' '+l.text;
  }
 }
 Object.assign(choices,fix.choicePatches??{});
 const question={id:7000+n,title:`PMCCKAP 2022 Question ${n}`,scenario:fix.scenario??scenario,choices:fix.choices??choices,correctAnswer,correctAnswerText:correctAnswer?(fix.choices??choices)[correctAnswer]:null,explanation:null,source:SOURCE,category:'PMCCKAP 2022'};
 if(refs.length)question.references=refs.map(clean);
 if(figurePages.has(pdfPage)){
  const top=Math.max(...stemLines.filter(l=>l.top<optionLabels[0].top).map(l=>l.bottom))+.008;
  const bottom=optionLabels[0].top-.015;
  const bounds=figureBounds.get(pdfPage)??detectedFigureBounds??[top,bottom];
  const filename=`q${String(n).padStart(3,'0')}-question.jpg`;
  const figurePath=path.join(TMP,'figures',page.file.replace('.jpg','.png'));
  const meta=await sharp(figurePath).metadata();
  const cropTop=Math.max(0,Math.floor(bounds[0]*meta.height));
  const cropBottom=Math.min(meta.height,Math.ceil(bounds[1]*meta.height));
  if(cropBottom<=cropTop)throw new Error(`Invalid figure bounds on PDF page ${pdfPage}`);
  const crop=await sharp(figurePath).extract({left:Math.round(meta.width*.015),top:cropTop,width:Math.round(meta.width*.97),height:cropBottom-cropTop}).toBuffer();
  await sharp(crop).trim({threshold:15}).jpeg({quality:94}).toFile(path.join(ASSETS,filename));
  question.visuals={question:[{src:`/PICUMCQBANK/images/mcckap-2022/${filename}`,label:`Question ${n} source figure or table`,caption:`Figure or table supplied with PMCCKAP 2022 question ${n}.`}]};
 }
 questions.push(question);
 audit.push({pdfPage,questionNumber:n,status:correctAnswer?'ready':'missing-answer',choices:Object.keys(question.choices).length,answer:correctAnswer,answerScores,references:refs.length,explanation:false,figure:figurePages.has(pdfPage),lowConfidence:lines.filter(l=>l.confidence<.7).map(l=>l.text)});
}
const present=new Set(audit.map(a=>a.questionNumber));
if(questions.length!==189 || questions.some(q=>!q.scenario || !q.correctAnswer || Object.values(q.choices).some(c=>!c)))throw new Error('Incomplete import: review the source before publishing.');
const summary={sourceSha256:'073e55c204e3fda1f0449099ea6a86f5f24815349079f2a9bd6a6f08dd68db2c',sourceFile:'PMCCKAP 2022.pdf',source:SOURCE,pdfPages:pages.length,questions:questions.length,missingQuestionNumbers:Array.from({length:200},(_,i)=>i+1).filter(n=>!present.has(n)),blankPages:audit.filter(a=>a.status==='blank-page').map(a=>a.pdfPage),missingAnswers:questions.filter(q=>!q.correctAnswer).map(q=>q.id-7000),withReferences:questions.filter(q=>q.references?.length).length,withExplanations:0,questionVisuals:questions.filter(q=>q.visuals).length,notes:'The supplied scan contains keyed answers and reference lists, but no explanatory commentaries. Missing source questions are not reconstructed.',items:audit};
await fs.writeFile(path.join(ROOT,'data/mcckap-2022-questions.ts'),`// Generated by scripts/import-mcckap-2022.mjs from the supplied PMCCKAP 2022 scan.\nimport type { Question } from '@/types/question';\n\nexport const mcckap2022Questions: Question[] = ${JSON.stringify(questions,null,2)};\n`);
await fs.writeFile(path.join(ROOT,'data/mcckap-2022-audit.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({...summary,items:undefined},null,2));
