"""Import the supplied American Physician Institute question/answer deck.

Uses native Open XML text and original embedded PNGs; does not infer answers.
Usage: python3 scripts/import-pass-machine-pptx.py [source.pptx]
"""
import collections
import argparse
import difflib
import hashlib
import json
import pathlib
import posixpath
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', nargs='?', default='/Users/farahs/Desktop/PPt/PICU_Board_Review the American MCQ_Bank.pptx')
parser.add_argument('--legacy', type=pathlib.Path, help='Previous question data used to retain stable question IDs')
args = parser.parse_args()
SOURCE = pathlib.Path(args.source)
COLLECTION = 'American Physician Institute 2012-2020'
ASSET_ROOT = ROOT / 'public/images/pass-machine'
NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main', 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
REL = '{' + NS['r'] + '}'

def text_of(shape):
    return '\n'.join(''.join(t.text or '' for t in p.findall('.//a:t', NS)) for p in shape.findall('.//a:p', NS)).strip()

def compact(value):
    return re.sub(r'\s+', ' ', value).strip()

def norm(value):
    return re.sub(r'[^a-z0-9]', '', value.lower())

def read_questions(path):
    text = path.read_text()
    return json.loads(text.split('export const passMachineQuestions: Question[] = ', 1)[1].rstrip().removesuffix(';'))

old_questions = read_questions(args.legacy or ROOT / 'data/pass-machine-questions.ts')
old_by_stem = collections.defaultdict(list)
for q in old_questions:
    old_by_stem[norm(q['scenario'])].append(q)
# Prefer IDs already visible in the bank, preserving saved answers where possible.
public_ids = set()
before = ROOT / 'tmp/pptx/api/before-bank.json'
if before.exists():
    public_ids = {q['id'] for q in json.loads(before.read_text())['published']}

z = zipfile.ZipFile(SOURCE)
rels = {r.attrib['Id']: posixpath.normpath(posixpath.join('ppt', r.attrib['Target'])) for r in ET.fromstring(z.read('ppt/_rels/presentation.xml.rels'))}
pres = ET.fromstring(z.read('ppt/presentation.xml'))
slide_paths = [rels[s.attrib[REL + 'id']] for s in pres.findall('p:sldIdLst/p:sldId', NS)]
groups = collections.defaultdict(list)
chapters = []
current_chapter = None
all_pictures = []
for slide_no, slide_path in enumerate(slide_paths, 1):
    root = ET.fromstring(z.read(slide_path))
    shapes = [text_of(s) for s in root.findall('.//p:sp', NS)]
    shapes = [t for t in shapes if t]
    if any(re.match(r'^Chapter \d+\s*·', t) for t in shapes):
        current_chapter = shapes[0]
        chapters.append(current_chapter)
    q_label = next((t for t in shapes if re.fullmatch(r'Q\d+', t)), None)
    pictures = root.findall('.//p:pic', NS)
    if not q_label:
        assert not pictures, f'Unassigned pictures on slide {slide_no}'
        continue
    number = int(q_label[1:])
    q_index = shapes.index(q_label)
    body = shapes[q_index + 1:]
    if body and body[-1] == str(slide_no):
        body.pop()
    role = 'answer' if any(t.startswith('Correct answer\n') or t == 'Correct answer' for t in body) else ('images' if body[0] == 'Case images' else 'question')
    slide_rels_path = posixpath.join(posixpath.dirname(slide_path), '_rels', posixpath.basename(slide_path) + '.rels')
    slide_rels = {}
    if slide_rels_path in z.namelist():
        slide_rels = {r.attrib['Id']: posixpath.normpath(posixpath.join(posixpath.dirname(slide_path), r.attrib['Target'])) for r in ET.fromstring(z.read(slide_rels_path))}
    media = []
    for index, picture in enumerate(pictures, 1):
        assert picture.find('.//a:srcRect', NS) is None, 'Cropped image needs review'
        blip = picture.find('.//a:blip', NS)
        target = slide_rels[blip.attrib[REL + 'embed']]
        image_bytes = z.read(target)
        assert target.lower().endswith('.png')
        kind = 'explanation' if role == 'answer' else 'question'
        filename = f'q{number:03}-{kind}-s{slide_no:03}-fig{index}.png'
        media.append({'filename': filename, 'bytes': image_bytes, 'target': target, 'sha256': hashlib.sha256(image_bytes).hexdigest(), 'role': kind, 'slide': slide_no})
        all_pictures.append(media[-1])
    groups[number].append({'slide': slide_no, 'role': role, 'body': body, 'chapter': current_chapter or shapes[0], 'media': media})
assert sorted(groups) == list(range(1, 284)), 'Expected exactly Q1-Q283'
assert len(all_pictures) == 73, 'Picture coverage changed'
assert len(chapters) == 31

questions = []
items = []
used_ids = set()
for number, slides in sorted(groups.items()):
    question_slide, = [s for s in slides if s['role'] == 'question']
    answer_slide, = [s for s in slides if s['role'] == 'answer']
    body = question_slide['body']
    scenario = body[0]
    choices = {}
    answer_only = number == 259
    i = 1
    while i < len(body) and not answer_only:
        label = body[i]
        assert re.fullmatch('[A-Z]', label), (number, 'Unexpected choice label', body[i:])
        assert i + 1 < len(body), (number, 'Empty choice')
        choices[label] = body[i + 1]
        i += 2
    assert answer_only or (len(choices) >= 2 and all(choices.values()))
    answer_body = answer_slide['body']
    answer = answer_body[0]
    assert answer_only or answer in choices, (number, 'Invalid answer', answer)
    correct_block = answer_body[1]
    assert correct_block.startswith('Correct answer\n')
    deck_answer_text = correct_block.split('\n', 1)[1]
    explanation_start = answer_body.index('Explanation') + 1
    explanation_parts = []
    notes = []
    references = [f'Supplied PowerPoint: question slide {question_slide["slide"]}; answer slide {answer_slide["slide"]}.']
    i = explanation_start
    while i < len(answer_body):
        text = answer_body[i]
        if text == '!':
            notes.append(answer_body[i + 1])
            i += 2
            continue
        if text.startswith('Source:'):
            references.append(text.removeprefix('Source:').strip())
        else:
            explanation_parts.append(text)
        i += 1
    explanation = '\n\n'.join(explanation_parts).strip()
    assert explanation
    # Exact native-text matches first; fuzzy matching is limited to unchanged choices.
    candidates = [q for q in old_by_stem[norm(scenario)] if q['id'] not in used_ids]
    match_kind = 'exact-stem'
    if not candidates:
        candidates = [q for q in old_questions if q['id'] not in used_ids and norm(' '.join(q['choices'].values())) == norm(' '.join(choices.values())) and (difflib.SequenceMatcher(None, norm(q['scenario']), norm(scenario)).ratio() >= .8 or norm(q['scenario']).endswith(norm(scenario)) or norm(scenario).endswith(norm(q['scenario'])))]
        match_kind = 'same-choices-and-matching-stem'
    def rank(q):
        return (q['id'] in public_ids, norm(' '.join(q['choices'].values())) == norm(' '.join(choices.values())), bool(q['correctAnswer']), -q['id'])
    matched = max(candidates, key=rank) if candidates else None
    question_id = matched['id'] if matched else 8000 + number
    assert question_id not in used_ids
    used_ids.add(question_id)
    question = {'id': question_id, 'title': f'American Physician Institute Q{number}', 'scenario': scenario, 'choices': choices, 'correctAnswer': None if answer_only else answer, 'correctAnswerText': f'{answer} — {deck_answer_text}' if answer_only else choices[answer], 'explanation': explanation, 'source': COLLECTION, 'category': f'{COLLECTION} - {question_slide["chapter"]}', 'references': references}
    if answer_only:
        question['answerOnly'] = True
        notes.append('Answer choices are not printed in the supplied source. The answer key states C (pulsus paradoxus); this item is available for answer review and excluded from scoring.')
    if number == 206:
        notes.append('The supplied slide labels its options A, B, F, C, D. These source labels are retained.')
    if notes:
        question['sourceNotes'] = notes
    visuals = collections.defaultdict(list)
    for slide in slides:
        for picture in slide['media']:
            kind = picture['role']
            visuals[kind].append({'src': f'/PICUMCQBANK/images/pass-machine/{picture["filename"]}', 'label': f'Q{number} — {"Answer" if kind == "explanation" else "Question"} figure {len(visuals[kind]) + 1}', 'caption': f'{question_slide["chapter"]}. Supplied PowerPoint slide {picture["slide"]}.'})
    if visuals:
        question['visuals'] = dict(visuals)
    questions.append(question)
    items.append({'questionNumber': number, 'id': question_id, 'matchedLegacyId': matched['id'] if matched else None, 'idMatch': match_kind if matched else 'new-question', 'chapter': question_slide['chapter'], 'sourceSlides': [s['slide'] for s in slides], 'answer': answer, 'answerOnly': answer_only, 'answerTextMatches': answer_only or norm(deck_answer_text) == norm(choices[answer]), 'deckAnswerText': deck_answer_text, 'sourceNotes': notes, 'questionFigures': len(visuals['question']), 'explanationFigures': len(visuals['explanation'])})

# These follow-up prompts explicitly rely on the preceding source vignette.
# Preserve their original stems while making the case available in random review.
context_pairs = {41: 40, 50: 49, 56: 55, 61: 60, 80: 79, 164: 163, 222: 220}
for followup, previous in context_pairs.items():
    target = questions[followup - 1]
    context = questions[previous - 1]
    target['displayScenario'] = f'Shared case from source Q{previous}: {context["scenario"]}\n\nSource Q{followup}: {target["scenario"]}'
    # The linked context may itself contain the source table or tracing needed for the prompt.
    contextual_figures = context.get('visuals', {}).get('question', [])
    existing = target.get('visuals', {}).get('question', [])
    if contextual_figures and not existing:
        target.setdefault('visuals', {})['question'] = contextual_figures
    items[followup - 1]['contextQuestionNumber'] = previous

ASSET_ROOT.mkdir(parents=True, exist_ok=True)
for picture in all_pictures:
    (ASSET_ROOT / picture['filename']).write_bytes(picture['bytes'])
output = '// Generated by scripts/import-pass-machine-pptx.py from the supplied PowerPoint.\n// Source answer-key concerns are preserved in sourceNotes.\nimport type { Question } from "@/types/question";\n\nexport const passMachineQuestions: Question[] = ' + json.dumps(questions, indent=2, ensure_ascii=False) + ';\n'
(ROOT / 'data/pass-machine-questions.ts').write_text(output)
audit = {'sourceFile': SOURCE.name, 'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'slides': len(slide_paths), 'questions': len(questions), 'scoredMcqs': sum(not q.get('answerOnly', False) for q in questions), 'answerOnlyItems': sum(bool(q.get('answerOnly')) for q in questions), 'chapters': len(chapters), 'questionFigures': sum(p['role'] == 'question' for p in all_pictures), 'explanationFigures': sum(p['role'] == 'explanation' for p in all_pictures), 'embeddedPictures': len(all_pictures), 'preservedQuestionIds': sum(i['matchedLegacyId'] is not None for i in items), 'previouslyPublishedIdsRetained': sorted(public_ids & used_ids), 'previouslyPublishedIdsNotMatched': sorted(public_ids - used_ids), 'sourceNotes': sum(bool(i['sourceNotes']) for i in items), 'answerTextDifferences': [i['questionNumber'] for i in items if not i['answerTextMatches']], 'items': items, 'assets': [{k: v for k, v in p.items() if k != 'bytes'} for p in all_pictures]}
(ROOT / 'data/pass-machine-pptx-audit.json').write_text(json.dumps(audit, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({k: v for k, v in audit.items() if k not in ['items', 'assets', 'previouslyPublishedIdsRetained']}, indent=2, ensure_ascii=False))
