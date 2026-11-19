"""Import native text, keyed answers, notes, figures, and tables from PICU_MCQ_quiz.pptx."""
import argparse
import collections
import hashlib
import json
import pathlib
import posixpath
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', nargs='?', default='/Users/farahs/Desktop/PPt/PICU_MCQ_quiz.pptx')
args = parser.parse_args()
SOURCE_FILE = pathlib.Path(args.source)
COLLECTION = 'PICU Critical Thinking Quiz'
ASSETS = ROOT / 'public/images/critical-thinking-quiz'
NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main', 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
R = '{' + NS['r'] + '}'
z = zipfile.ZipFile(SOURCE_FILE)
rels = {r.attrib['Id']: posixpath.normpath(posixpath.join('ppt', r.attrib['Target'])) for r in ET.fromstring(z.read('ppt/_rels/presentation.xml.rels'))}
slide_paths = [rels[s.attrib[R + 'id']] for s in ET.fromstring(z.read('ppt/presentation.xml')).findall('p:sldIdLst/p:sldId', NS)]


def shape_text(shape):
    return '\n'.join(''.join(t.text or '' for t in p.findall('.//a:t', NS)) for p in shape.findall('.//a:p', NS)).strip()


def norm(text):
    return re.sub(r'\W', '', text).lower()


groups = collections.defaultdict(list)
quiz_number = None
quiz_metadata = {}
media = []
for slide_no, slide_path in enumerate(slide_paths, 1):
    root = ET.fromstring(z.read(slide_path))
    shapes = [text for shape in root.findall('.//p:sp', NS) if (text := shape_text(shape))]
    if not shapes:
        continue
    divider = re.fullmatch(r'Quiz (\d+)', shapes[0])
    if divider:
        quiz_number = int(divider[1])
        quiz_metadata[quiz_number] = {'title': shapes[0], 'citation': shapes[1], 'slide': slide_no}
        continue
    header = re.fullmatch(r'Question (\d+)(?: · (Answer ([A-F])|Figure))?', shapes[0])
    if not header:
        assert slide_no in (1, 2), ('Unassigned slide', slide_no, shapes[:2])
        continue
    assert quiz_number
    question_number = int(header[1])
    role = 'answer' if header[3] else ('figure' if header[2] == 'Figure' else 'question')
    body = shapes[2:]
    if body and body[-1] == str(slide_no):
        body.pop()
    tables = []
    for table in root.findall('.//a:tbl', NS):
        rows = [[shape_text(cell) for cell in row.findall('a:tc', NS)] for row in table.findall('a:tr', NS)]
        assert rows and all(len(row) == len(rows[0]) for row in rows)
        columns = rows[0]
        if not columns[0]:
            columns[0] = 'Set'
        tables.append({'title': 'Source table', 'columns': columns, 'rows': rows[1:]})
    rel_path = posixpath.join(posixpath.dirname(slide_path), '_rels', posixpath.basename(slide_path) + '.rels')
    picture_rels = {r.attrib['Id']: posixpath.normpath(posixpath.join(posixpath.dirname(slide_path), r.attrib['Target'])) for r in ET.fromstring(z.read(rel_path))} if rel_path in z.namelist() else {}
    figures = []
    for index, picture in enumerate(root.findall('.//p:pic', NS), 1):
        assert picture.find('.//a:srcRect', NS) is None
        transform = picture.find('.//a:xfrm', NS)
        assert transform is None or not transform.attrib, 'Picture rotation/crop requires review'
        target = picture_rels[picture.find('.//a:blip', NS).attrib[R + 'embed']]
        assert target.endswith('.png')
        data = z.read(target)
        # Standalone figure slides follow the answer and contain teaching annotations.
        figure_role = 'question' if role == 'question' else 'explanation'
        filename = f'quiz{quiz_number:02}-q{question_number:02}-{figure_role}-s{slide_no:03}-{index}.png'
        figures.append({'src': f'/PICUMCQBANK/images/critical-thinking-quiz/{filename}', 'label': f'Quiz {quiz_number}, Q{question_number} — Figure {index}', 'caption': f'Figure supplied with {COLLECTION}, Quiz {quiz_number}, Question {question_number}.'})
        media.append({'filename': filename, 'bytes': data, 'sha256': hashlib.sha256(data).hexdigest(), 'quiz': quiz_number, 'questionNumber': question_number, 'slide': slide_no, 'role': figure_role})
    groups[quiz_number, question_number].append({'slide': slide_no, 'role': role, 'body': body, 'answer': header[3], 'citation': shapes[1], 'figures': figures, 'tables': tables})

assert len(slide_paths) == 720 and len(groups) == 342 and len(quiz_metadata) == 31
assert len(media) == 17
questions = []
items = []
for sequence, ((quiz, number), slides) in enumerate(sorted(groups.items()), 1):
    prompt, = [slide for slide in slides if slide['role'] == 'question']
    answer_slide, = [slide for slide in slides if slide['role'] == 'answer']
    first_choice = next(i for i, text in enumerate(prompt['body']) if re.fullmatch('[A-F]', text))
    scenario = '\n'.join(prompt['body'][:first_choice])
    choice_parts = prompt['body'][first_choice:]
    assert len(choice_parts) % 2 == 0
    choices = dict(zip(choice_parts[::2], choice_parts[1::2]))
    assert list(choices) == list('ABCDEF')[:len(choices)] and 2 <= len(choices) <= 6
    assert scenario and all(choices.values())
    key = answer_slide['answer']
    assert key in choices
    marked_text, = [text for text in answer_slide['body'] if re.match(rf'^{key}\.\s+', text)]
    assert norm(re.sub(rf'^{key}\.\s+', '', marked_text)) == norm(choices[key]), (quiz, number, 'Answer text mismatch')
    explanation_index = answer_slide['body'].index('Explanation')
    note_index = answer_slide['body'].index('Note') if 'Note' in answer_slide['body'] else len(answer_slide['body'])
    explanation = '\n\n'.join(answer_slide['body'][explanation_index + 1:note_index]).strip()
    notes = answer_slide['body'][note_index + 1:] if note_index < len(answer_slide['body']) else []
    assert explanation
    question = {'id': 10000 + quiz * 100 + number, 'title': f'{COLLECTION} — Quiz {quiz}, Question {number}', 'scenario': scenario, 'choices': choices, 'correctAnswer': key, 'correctAnswerText': choices[key], 'explanation': explanation, 'source': COLLECTION, 'category': f'{COLLECTION} - Quiz {quiz:02}', 'references': [prompt['citation']]}
    if notes:
        question['sourceNotes'] = notes
    visuals = collections.defaultdict(list)
    for slide in slides:
        if slide['figures']:
            visuals['question' if slide['role'] == 'question' else 'explanation'].extend(slide['figures'])
        if slide['tables']:
            question.setdefault('explanationData' if slide['role'] == 'answer' else 'clinicalData', []).extend(slide['tables'])
    if visuals:
        question['visuals'] = dict(visuals)
    questions.append(question)
    items.append({'quiz': quiz, 'questionNumber': number, 'id': question['id'], 'sourceSlides': [s['slide'] for s in slides], 'citation': prompt['citation'], 'choices': list(choices), 'answer': key, 'explanationCharacters': len(explanation), 'sourceNotes': notes, 'questionFigures': len(visuals['question']), 'explanationFigures': len(visuals['explanation']), 'tables': sum(len(s['tables']) for s in slides)})

# Keep explicitly linked cases usable when reviewing in random order.
by_key = {(item['quiz'], item['questionNumber']): (question, item) for question, item in zip(questions, items)}
for followup, original in { (4, 2): (4, 1), (4, 3): (4, 1), (11, 2): (11, 1) }.items():
    question, item = by_key[followup]
    context, _ = by_key[original]
    question['displayScenario'] = f'Shared case from Quiz {original[0]}, Question {original[1]}: {context["scenario"]}\n\nCurrent question: {question["scenario"]}'
    if not question.get('visuals', {}).get('question') and context.get('visuals', {}).get('question'):
        question.setdefault('visuals', {})['question'] = context['visuals']['question']
    item['contextQuestion'] = list(original)

ASSETS.mkdir(parents=True, exist_ok=True)
for image in media:
    (ASSETS / image['filename']).write_bytes(image['bytes'])
output = '// Generated by scripts/import-critical-thinking-quiz.py from the supplied deck.\n// Answers, explanations and caveats are retained from that deck.\nimport type { Question } from "@/types/question";\n\nexport const criticalThinkingQuestions: Question[] = ' + json.dumps(questions, indent=2, ensure_ascii=False) + ';\n'
(ROOT / 'data/critical-thinking-questions.ts').write_text(output)
summary = {'name': COLLECTION, 'sourceFile': SOURCE_FILE.name, 'sourceSha256': hashlib.sha256(SOURCE_FILE.read_bytes()).hexdigest(), 'slides': 720, 'questions': len(questions), 'quizSets': len(quiz_metadata), 'withExplanations': sum(bool(q['explanation']) for q in questions), 'figures': len(media), 'tables': sum(item['tables'] for item in items), 'itemsWithSourceNotes': sum(bool(item['sourceNotes']) for item in items), 'provenance': 'Native text, marked answers, explanations (including supplied standard summaries), caveats, tables and all available figures are copied from the supplied compilation. No clinical answers or missing images are reconstructed.'}
audit = {**summary, 'quizSetsMetadata': quiz_metadata, 'items': items, 'assets': [{key: value for key, value in image.items() if key != 'bytes'} for image in media]}
(ROOT / 'data/critical-thinking-audit.json').write_text(json.dumps(audit, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(summary, indent=2, ensure_ascii=False))
