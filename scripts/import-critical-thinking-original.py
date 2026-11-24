"""Reconcile all 342 Critical Thinking items with the original journal compilation.
Native two-column text is parsed in reading order; reviewed OCR covers nine scanned
pages. Supplied PPTX supplements remain explicitly labelled where the journal has
only a key. Source-key errata remain separate from the original printed key.
"""
import argparse
import collections
import hashlib
import json
import pathlib
import re
import unicodedata

import fitz

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('source',nargs='?',default='/Users/farahs/Desktop/Final Exam Material/01 Final Written Exam/06 Board Review Self Assessment and Other MCQs/PICU QUIZ.pdf')
parser.add_argument('--previous',type=pathlib.Path,help='Optional previous question JSON for the reconciliation report')
args=parser.parse_args()
SOURCE_FILE=pathlib.Path(args.source)
DOC=fitz.open(SOURCE_FILE)
REVIEW=json.loads((ROOT/'data/critical-thinking-original-reviewed.json').read_text())
assert hashlib.sha256(SOURCE_FILE.read_bytes()).hexdigest()==REVIEW['sourceSha256']
assert len(DOC)==151
OCR_LINES=collections.defaultdict(list)
for line in REVIEW['scanLines']:
    OCR_LINES[line['page'],line['col']].append({**line,'ocr':True})
COUNTS={i:(20 if i in (19,21) else 15 if i==20 else 14 if i==27 else 13 if i==28 else 10) for i in range(1,32)}
# These panels are copied as readable source crops instead of interleaving their columns in prose.
PANELS=[
 (3,(315,142,558,217),1,8,'question','PEEP measurements',False),
 (136,(312,128,547,249),27,8,'question','Brain-death observation periods',False),
 (105,(65,142,303,480),20,2,'explanation','HLH diagnostic criteria',True),
 (108,(312,556,548,680),20,10,'explanation','Brain abscess: predisposing conditions and organisms',True),
 (109,(64,93,300,227),20,10,'explanation','Brain abscess table (continued)',True),
 (111,(65,158,548,313),20,15,'explanation','CSF findings in different types of meningitis',True),
 (126,(312,437,548,559),24,9,'explanation','Mean airway pressure formula and definitions',True),
]

def in_panel(line):
    x0,y0,x1,y1=line['bbox']
    return any(p==line['page'] and x0>=r[0]-2 and x1<=r[2]+2 and y0>=r[1]-2 and y0<r[3] for p,r,*_ in PANELS)

RANGES=[(2,6),(7,9),(10,13),(14,18),(19,22),(23,26),(28,31),(33,36),(37,40),(42,46),(54,58),(59,65),(66,68),(70,74),(75,78),(80,82),(83,87),(94,99),(100,101),(102,111),(112,119),(120,121),(122,124),(125,126),(127,131),(132,134),(135,137),(138,139),(140,143),(144,146),(147,151)]

def clean(s):
 s=re.sub(r'([\ufb01\ufb02\uf0de\uf0df])\s+(?=[a-z])',r'\1',s)
 return unicodedata.normalize('NFKC',s).replace('\uf0de','fi').replace('\uf0df','fl').replace('\u00ad','').replace('\u2011','-').replace('\u2010','-').replace('\xa0',' ')

def native(pg,pn,col):
 r=fitz.Rect(45 if col==0 else 306,55,306 if col==0 else 570,738)
 spans=[span for block in pg.get_text('dict',clip=r)['blocks'] for line in block.get('lines',[]) for span in line['spans'] if span['text'].strip()]
 rows=[]
 # Construct normal text rows first, then attach small chemical subscripts to their parent baseline.
 for span in sorted((s for s in spans if s['size']>=9),key=lambda s:(s['origin'][1],s['bbox'][0])):
  baseline=span['origin'][1]
  row=next((r for r in rows if abs(r['baseline']-baseline)<3.5),None)
  if row is None:row={'baseline':baseline,'spans':[]};rows.append(row)
  row['spans'].append(span)
 for span in (s for s in spans if s['size']<9):
  baseline=span['origin'][1]
  row=min(rows,key=lambda r:abs(r['baseline']-baseline),default=None)
  if row is None or abs(row['baseline']-baseline)>6:
   row={'baseline':baseline,'spans':[]};rows.append(row)
  row['spans'].append(span)
 lines=[]
 for row in sorted(rows,key=lambda r:r['baseline']):
  ordered=sorted(row['spans'],key=lambda s:s['bbox'][0]);text='';previous=None
  for span in ordered:
   value=clean(span['text'])
   separator=' ' if previous and span['bbox'][0]-previous['bbox'][2]>1.5 and not text.endswith((' ','\t')) and not value.startswith((' ','\t')) else ''
   text+=separator+value;previous=span
  boxes=[s['bbox'] for s in ordered]
  lines.append({'page':pn,'col':col,'bbox':[min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes)],'text':text.strip(),'font':max(s['size'] for s in ordered)})
 return lines

ALL=[]
for quiz,(start,end) in enumerate(RANGES,1):
 lines=[]
 for pn in range(start,end+1):
  pg=DOC[pn-1]
  for col in (0,1):
   ls=OCR_LINES.get((pn,col)) or native(pg,pn,col)
   ls.sort(key=lambda l:(l['bbox'][1],l['bbox'][0]))
   for line in ls:
    t=clean(line['text']);
    if pn == 138 and t.startswith('S. Intravenous administration'):t='5.'+t[2:]
    line['text']=t
    if line['bbox'][1]<55 or line['bbox'][1]>725:continue
    if pn==151 and line['bbox'][1]>395:continue
    if re.search(r'(?i)(Downloaded free|JOURNAL OF PEDIATRIC CRITICAL CARE|^Vol(?:ume)?\.?\s*\d|CRITICAL THINKING|PICU Quiz)',t):continue
    if line.get('font',12)<8.5 and not re.match(r'\d+[. ]',t):continue
    if in_panel(line):continue
    lines.append(line)
 ALL.append({'quiz':quiz,'pages':[start,end],'lines':lines})


header=re.compile(r'^(?:Q(?:uestion)?\.?\s*|(?=\d+\s*[.:)]))(\d+)\s*[.:)]?\s*(.*)',re.I)
parsed=[]
for quiz in ALL:
 n=quiz['quiz'];qs=[];current=None;cut=None
 for i,l in enumerate(quiz['lines']):
  h=header.match(l['text'])
  if h and int(h[1])==len(qs)+1 and len(qs)<COUNTS[n]:
   current={'number':int(h[1]),'start':i,'lines':[]};qs.append(current)
   if h[2]:current['lines'].append({**l,'text':h[2]})
  elif current:current['lines'].append(l)
 # Find the answers section inside the last question.
 answer_start=next((i for i,l in enumerate(qs[-1]['lines']) if re.match(r'(?i)^(?:ANSWERS|EXPLANATIONS|QUIZ Answers|Answer:|Answer Q|Answers?:?$|Q(?:UIZ)?\.?\s*1[.:]?\s*ANS|Ans(?:wer)?\s*1[:. ]|1\s*\.\s*(?:Answer|Ans\s|[A-Fa-f]\s*[:.]|Correct))',l['text'])),None) if qs else None
 if answer_start is None:
  tail=[(i,l['text']) for i,l in enumerate(qs[-1]['lines']) if re.search('(?i)ans|correct',l['text'])] if qs else []
  raise AssertionError(('Missing answer section', n))
 else:
  answers=qs[-1]['lines'][answer_start:];qs[-1]['lines']=qs[-1]['lines'][:answer_start]
  parsed.append({'quiz':n,'questions':qs,'answerLines':answers})
 assert len(qs)==COUNTS[n], (n,len(qs))

patterns={
 (1,2,3):r'^(\d+)\.\s*([A-F]):',
 (4,):r'^Ans\s*(\d+)\.\s*([a-f])',
 (5,6):r'^(\d+)\.\s*Answer\s*([A-F])',
 (7,8,11):r'^Q\.?\s*(\d+)[. :]*([A-F])\b',
 (9,):r'^Ans\s*(\d+):\s*([a-f])',
 (10,):r'^Q\.?\s*(\d+)[. :]*ANS[- :]*([A-F])',
 (12,15,16,17):r'^Q\.?\s*(\d+)[. :]*Answer[. :]*([A-F])',
 (13,):r'^Questions?\s*(\d+)[. :]*([A-F])',
 (14,):r'^Answer\s+Q\s*\.\s*(\d+)[ :]*([A-F])',
 (18,):r'^(\d+)\.\s*Answer[: ]*\(\s*([A-F])\s*\)',
 (20,):r'^(\d+)\.\s*(?:Answer:\s*)?([A-F])\b',
 (21,):r'^(\d+)\.\s*(?:Q\d+\.\s*)?Answer[ :\-]*([A-F])',
 (22,28):r'^(\d+)\.\s*Correct Answer:\s*([A-F])',
 (23,):r'^(\d+)\.\s*Ans\s*([A-F])',
 (24,):r'^(\d+)\.\s*([A-F])$',
 (25,):r'^(\d+)\.\s*Answer[ :]*([A-F])',
 (26,):r'^Answer\s*(\d+)[:.]\s*([a-f])\.',
 (29,30):r'^(\d+)\.\s*Answer[ :]*([a-f¢])',
 (31,):r'^(\d+)\.?\s*Answer[ :]*([A-F])',
}
PUBLISHING_TOP={}
for collection in ALL:
 for line in collection['lines']:
  if re.match(r'(?i)^How to cite',line['text']):
   PUBLISHING_TOP[line['page']]=min(PUBLISHING_TOP.get(line['page'],999),line['bbox'][1])

answer_headers={}
for quiz in parsed:
 n=quiz['quiz'];ls=quiz['answerLines'];heads=[]
 if n==19:
  for i,l in enumerate(ls):
   for m in re.finditer(r'(\d+)\s*\.\s*Ans\s*:\s*([a-f])',l['text'],re.I):heads.append((int(m[1]),m[2].upper(),i))
 elif n==27:
  for i,l in enumerate(ls):
   m=re.match(r'^(?:\d+\.\s*)?Ans\s*([A-F]|4)(?:[.\s]|$)',l['text'])
   if m:heads.append((len(heads)+1,'D' if m[1]=='4' else m[1],i))
 else:
  pattern=next(v for ns,v in patterns.items() if n in ns)
  for i,l in enumerate(ls):
   m=re.match(pattern,l['text'],re.I)
   if m:heads.append((int(m[1]),m[2].upper().replace('¢','C'),i))
   elif n==26 and l['text'].startswith('Answer 3:'):heads.append((3,'B',i))
 heads.sort();expected=len(quiz['questions'])
 assert len(heads)==expected and {h[0] for h in heads}==set(range(1,expected+1)), (n,len(heads),expected)
 answer_headers[n]=heads

OPTION=re.compile(r'^(?:\(([A-Fa-f])\)|([A-Fa-f])\s*[.)])\s*(.*)')
def prose(lines):
 s='';prev=None
 for l in lines:
  t=l['text'].strip()
  if not t:continue
  gap=prev and l['page']==prev['page'] and l['col']==prev['col'] and l['bbox'][1]-prev['bbox'][3]>8
  sep='\n' if gap else ' '
  if s.endswith('-'):sep=''
  s+=(sep if s else '')+t;prev=l
 return re.sub(r'[ \t]+',' ',s).strip()
results=[];issues=[]
for quiz in parsed:
 n=quiz['quiz'];heads=answer_headers[n];headby={h[0]:h for h in heads};answerlines=quiz['answerLines'];orig=next(q for q in ALL if q['quiz']==n);q1=orig['lines'][quiz['questions'][0]['start']];firstpage=q1['page'];firsty=q1['bbox'][1]
 for group in quiz['questions']:
  number=group['number'];ls=[];skipcol=None
  for l in group['lines']:
   if l['page']==firstpage and l['bbox'][1]<firsty-3:continue
   if re.match(r'(?i)^Correspondence',l['text']):skipcol=(l['page'],l['col'])
   if skipcol==(l['page'],l['col']):continue
   if re.match(r'(?i)^How to cite',l['text']):skipcol=(l['page'],l['col']);continue
   ls.append(l)
  if (n,number)==(11,7):
   caption_index=next(i for i,l in enumerate(ls) if l['text'].startswith('Figure 1A'))
   ls=ls[:caption_index]
   if ls[-1]['text']=='.':ls.pop()
  labels=[]
  for i,l in enumerate(ls):
   m=OPTION.match(l['text'])
   if (n,number)==(4,7) and l['text'].startswith('e Magnesium'):m=OPTION.match('e. Magnesium')
   if m and (m[1] or m[2]).upper()==chr(65+len(labels)):
    labels.append((i,(m[1] or m[2]).upper(),m[3]))
  choices={}
  if (n,number)==(27,8):
   first=next(i for i,l in enumerate(ls) if l['text'].startswith('1. Set A'))
   ls=ls[:first]+ls[first:];labels=[(i,chr(65+j),re.sub(r'^\d+\.\s*','',ls[i]['text'])) for j,i in enumerate(range(first,len(ls)))];labels=labels[:5]
  if labels:
   scenario=prose(ls[:labels[0][0]])
   for j,(i,key,txt) in enumerate(labels):
    end=labels[j+1][0] if j+1<len(labels) else len(ls)
    choices[key]=prose(([{**ls[i],'text':txt}] if txt else [])+ls[i+1:end])
  else:scenario=prose(ls)
  assert list(choices)==list('ABCDEF')[:len(choices)] and 2 <= len(choices)<=6, (n,number,choices)
  h=headby[number];ai=h[2];nextidx=min((z[2] for z in heads if z[2]>ai),default=len(answerlines));seg=answerlines[ai:nextidx]
  results.append({'quiz':n,'number':number,'scenario':scenario,'choices':choices,'key':h[1],'answerHeader':seg[0]['text'],'answerLines':seg,'questionLines':ls,'sourceQuestionStart':orig['lines'][group['start']],'sourceAnswerStart':seg[0]})


# Quiz 3 prints three choice groups under the wrong questions. Retain their full source
# wording while relocating the groups exactly as identified in the supplied deck.
choice_groups={item['number']:dict(item['choices']) for item in results if item['quiz']==3}
for item in results:
 if item['quiz']==3 and item['number'] in (3,4,6):
  item['choices']=choice_groups[{3:6,4:3,6:4}[item['number']]]

COLLECTION='PICU Critical Thinking Quiz'
ASSETS=ROOT/'public/images/critical-thinking-original'
ASSETS.mkdir(parents=True,exist_ok=True)
KEY_ONLY={19,22,23,24,27,28}
KEY_ONLY_ITEMS={10105,10207,10208,10209,10210,10908}
# The source's own rationale or duplicated question resolves these three printed-key errata.
KEY_ERRATA={(2,7):'B',(10,1):'B',(15,7):'B'}
metadata=REVIEW['quizMetadata']
questions=[]
audit_items=[]
assets=[]


def source_body(item):
    lines=item['answerLines']
    n=item['quiz']
    first=lines[0]
    pattern=next((v for ns,v in patterns.items() if n in ns),None)
    match=re.match(pattern,first['text'],re.I) if pattern else None
    tail=first['text'][match.end():].lstrip(' .:-') if match else ''
    if n==26 and item['number']==3:
        tail=first['text'].split(':',1)[1].strip()
    if n==20:
        tail=re.sub(r'^Answer\s*:\s*','',tail,flags=re.I)
    if n==27:
        match=re.match(r'^(?:\d+\.\s*)?Ans\s*(?:[A-F]|4)[.\s]*',first['text'])
        tail=first['text'][match.end():] if match else ''
    if n in (19,22,23,24,28):
        return '',[],[]
    body=[]
    refs=[]
    in_refs=False
    blocked_column=None
    for line in ([{**first,'text':tail}] if tail else [])+lines[1:]:
        text=line['text'].strip()
        if line['bbox'][1]>=PUBLISHING_TOP.get(line['page'],999):
            continue
        if re.match(r'(?i)^(?:Financial support|Conflicts? of interest|Source of funding|How to cite|Received:|Accepted:)',text):
            blocked_column=(line['page'],line['col'])
        if blocked_column==(line['page'],line['col']):
            continue
        if re.match(r'(?i)^References?\s*[:.]?\s*$',text):
            in_refs=True
            continue
        if in_refs:
            refs.append(line)
        else:
            body.append(line)
    # Preserve the entire answer statement and rationale; do not reduce it to a summary.
    return prose(body),refs,body


for item in results:
    quiz,number=item['quiz'],item['number']
    ident=10000+quiz*100+number
    supplement=REVIEW['supplements'].get(str(ident),{})
    notes=list(supplement.get('notes',[]))
    notes=[note for note in notes if not note.startswith('The source gives the answer key only')]
    body,refs,body_lines=source_body(item)
    if quiz in KEY_ONLY or ident in KEY_ONLY_ITEMS:
        source_excerpt=body if quiz==27 or ident in KEY_ONLY_ITEMS else ''
        body=(('Original source answer: '+source_excerpt+'\n\n') if source_excerpt else '')+'Supplementary explanation from the supplied PowerPoint: '+supplement['explanation']
        notes.insert(0,'The original PDF provides an answer key only; the supplementary explanation is retained from the supplied PowerPoint.')
        if (quiz,number)==(24,9):
            notes[0]='The original PDF provides an answer key and MAP formula; the supplementary explanation is retained from the supplied PowerPoint.'
        explanation_kind='key-only PDF; separately labelled supplied PowerPoint supplement'
    elif (quiz,number)==(4,1) and not body:
        body='The original source explains this answer with the herniation diagram and table shown above.'
        explanation_kind='original source explanation figure'
    else:
        assert body,(quiz,number,'Missing original rationale')
        explanation_kind='complete original PDF answer statement and rationale'
    answer=KEY_ERRATA.get((quiz,number),item['key'])
    assert answer in item['choices']
    if (quiz,number) in KEY_ERRATA:
        assert notes,'A source-key correction must be explained'
    question={'id':ident,'title':f'{COLLECTION} — Quiz {quiz}, Question {number}','scenario':item['scenario'],'choices':item['choices'],'correctAnswer':answer,'correctAnswerText':item['choices'][answer],'explanation':body,'source':COLLECTION,'category':f'{COLLECTION} - Quiz {quiz:02}'}
    if quiz==3 and number in (3,4,6):
        notes.append(f'The original layout places this option group under Question { {3:6,4:3,6:4}[number] }; it is restored here to match this question and the original rationale.')
    if notes:
        question['sourceNotes']=notes
    if str(ident) in REVIEW['structuredTables']:
        question['clinicalData']=REVIEW['structuredTables'][str(ident)]
    pages=sorted({line['page'] for line in item['questionLines']+item['answerLines']})
    question['references']=[metadata[str(quiz)]['citation'].split('\n')[0],f'Original PICU QUIZ.pdf, PDF pages {", ".join(map(str,pages))}.']
    if refs:
        question['references'].append(prose(refs))
    questions.append(question)
    audit_items.append({'quiz':quiz,'questionNumber':number,'id':ident,'questionPages':sorted({line['page'] for line in item['questionLines']}),'answerPages':sorted({line['page'] for line in item['answerLines']}),'printedAnswer':item['key'],'displayedAnswer':answer,'printedAnswerEvidence':item['answerHeader'],'sourceKeyErratum':(quiz,number) in KEY_ERRATA,'explanationKind':explanation_kind,'questionCharacters':len(question['scenario']),'originalRationaleCharacters':0 if quiz in KEY_ONLY else len(body),'explanationCharacters':len(body),'sourceQuestionTextLines':len(item['questionLines']),'sourceAnswerTextLines':len(item['answerLines']),'usesReviewedScan':any(line.get('ocr') for line in item['questionLines']+item['answerLines']),'sourceNotes':notes,'choiceGroupRestoredFromQuestion':{3:6,4:3,6:4}.get(number) if quiz==3 else None,'figures':[]})

by_key={(item['quiz'],item['number']):(question,audit) for item,question,audit in zip(results,questions,audit_items)}


def add_figure(quiz,number,page_no,role,rect,label,raw=None):
    question,audit=by_key[quiz,number]
    if raw is None:
        bounds=fitz.Rect(rect)&DOC[page_no-1].rect
        raw=DOC[page_no-1].get_pixmap(matrix=fitz.Matrix(3,3),clip=bounds,alpha=False).tobytes('png')
        extension='png'
    else:
        extension=raw['ext']
        raw=raw['image']
    sequence=len(audit['figures'])+1
    filename=f'quiz{quiz:02}-q{number:02}-{role}-p{page_no:03}-{sequence}.{extension}'
    (ASSETS/filename).write_bytes(raw)
    figure={'src':f'/PICUMCQBANK/images/critical-thinking-original/{filename}','label':label,'caption':('Static pressure-volume curve of the lung during inspiration and expiration. ' if (quiz,number,role)==(11,7,'question') else '')+f'Original source: {COLLECTION}, Quiz {quiz}, Question {number}.'}
    question.setdefault('visuals',{}).setdefault(role,[]).append(figure)
    asset={'filename':filename,'quiz':quiz,'questionNumber':number,'page':page_no,'role':role,'bounds':list(rect),'sha256':hashlib.sha256(raw).hexdigest(),'label':label}
    assets.append(asset)
    audit['figures'].append(asset)


# All seventeen distinct content-image occurrences; publication logos and full-page scan containers are excluded.
image_uses=0
for quiz,(start,end) in enumerate(RANGES,1):
    quiz_items=[item for item in results if item['quiz']==quiz]
    for page_no in range(start,end+1):
        for image in DOC[page_no-1].get_image_info(xrefs=True):
            rect=fitz.Rect(image['bbox'])
            if not(rect.width>70 and rect.height>20 and rect.y0>90 and rect.y1<735 and rect.width<500):
                # Quiz 3's inspiratory-flow waveform begins immediately below the running header.
                if not(page_no==11 and image['xref']==124):
                    continue
            candidates=[item for item in quiz_items if (item['sourceQuestionStart']['page'],item['sourceQuestionStart']['col'],item['sourceQuestionStart']['bbox'][1]) <= (page_no,0 if rect.x0<306 else 1,rect.y0)]
            assert candidates,(quiz,page_no,image['xref'])
            number=candidates[-1]['number']
            role='question'
            if page_no==16:
                number,role=1,'explanation'
                # Split the tall teaching image so the source table remains legible within the bank layout.
                add_figure(quiz,number,page_no,role,(124,91,488,253),'Brain herniation diagram')
                add_figure(quiz,number,page_no,role,(124,253,488,422),'Brain herniation syndromes table: uncal and central'
                )
                add_figure(quiz,number,page_no,role,(124,422,488,602),'Brain herniation syndromes table (continued)')
            else:
                if page_no==57:number,role=7,'explanation'
                if page_no==82:number,role=7,'explanation'
                add_figure(quiz,number,page_no,role,rect,f'Quiz {quiz}, Question {number} — source figure',DOC.extract_image(image['xref']))
            image_uses+=1
assert image_uses==17,image_uses
for page_no,rect,quiz,number,role,label,render in PANELS:
    if render:
        add_figure(quiz,number,page_no,role,rect,label)

# Preserve the full preceding case for questions explicitly linked in the journal.
for followup,original in {(4,2):(4,1),(4,3):(4,1),(11,2):(11,1)}.items():
    question,audit=by_key[followup]
    context,_=by_key[original]
    question['displayScenario']=f'Shared case from Quiz {original[0]}, Question {original[1]}: {context["scenario"]}\n\nCurrent question: {question["scenario"]}'
    audit['sharedCase']=list(original)

assert len(questions)==342
assert len({question['id'] for question in questions})==342
assert all(question['scenario'] and question['explanation'] and question['correctAnswer'] in question['choices'] for question in questions)
assert len(assets)==24
assert len(by_key[11,7][0]['visuals']['question'])==1
assert len(by_key[11,7][0]['visuals']['explanation'])==1
assert len(by_key[20,10][0]['visuals']['explanation'])==2
assert len(by_key[20,15][0]['visuals']['explanation'])==1
assert 'visuals' not in by_key[31,9][0] # The referenced clinical photograph is absent from this original PDF too.

summary={'name':COLLECTION,'sourceFile':SOURCE_FILE.name,'sourceSha256':REVIEW['sourceSha256'],'sourcePages':len(DOC),'questions':len(questions),'quizSets':31,'sourceImageOccurrences':image_uses,'displayedFigureAndTableAssets':len(assets),'structuredQuestionTables':sum(len(question.get('clinicalData',[])) for question in questions),'completeOriginalProseExplanations':sum(item['explanationKind']=='complete original PDF answer statement and rationale' for item in audit_items),'originalFigureExplanations':sum(item['explanationKind']=='original source explanation figure' for item in audit_items),'labelledPowerPointSupplements':sum('labelled' in item['explanationKind'] for item in audit_items),'preservedSourceKeyErrata':len(KEY_ERRATA),'reviewedScanPages':REVIEW['reviewedScanPages'],'excludedSourceSections':{'researchGateCoverPages':[27,32,41,47,53,69,79,88],'unrelatedJournalScan':[48,49,50,51,52],'duplicateSepsisII':[89,90,91,92,93]},'unavailableSourceFigure':{'quiz':31,'question':9,'reason':'The original PDF references a clinical photograph but does not contain that photograph.'}}
if args.previous:
    before={question['id']:question for question in json.loads(args.previous.read_text())}
    summary['comparisonWithPreviousSite']={'questionsChecked':len(before),'restoredOrChangedStems':sum(question['scenario']!=before[question['id']]['scenario'] for question in questions),'restoredOrChangedChoices':sum(question['choices']!=before[question['id']]['choices'] for question in questions),'expandedOriginalExplanations':sum(len(question['explanation'])>len(before[question['id']]['explanation'] or '') and item['quiz'] not in KEY_ONLY for question,item in zip(questions,audit_items)),'displayedAnswerKeysChanged':sum(question['correctAnswer']!=before[question['id']]['correctAnswer'] for question in questions),'previousStemCharacters':sum(len(question['scenario']) for question in before.values()),'restoredStemCharacters':sum(len(question['scenario']) for question in questions),'previousExplanationCharacters':sum(len(question['explanation'] or '') for question in before.values()),'restoredExplanationCharacters':sum(len(question['explanation']) for question in questions)}
output='// Generated from the original PICU QUIZ.pdf by scripts/import-critical-thinking-original.py.\n// Original journal explanations and labelled supplied PowerPoint supplements are kept distinct.\nimport type { Question } from "@/types/question";\n\nexport const criticalThinkingQuestions: Question[] = '+json.dumps(questions,indent=2,ensure_ascii=False)+';\n'
(ROOT/'data/critical-thinking-questions.ts').write_text(output)
(ROOT/'data/critical-thinking-original-audit.json').write_text(json.dumps({**summary,'quizSetsMetadata':metadata,'items':audit_items,'assets':assets},indent=2,ensure_ascii=False)+'\n')
print(json.dumps(summary,indent=2,ensure_ascii=False))
