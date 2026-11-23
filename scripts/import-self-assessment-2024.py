"""Import native questions, red answer keys, commentaries and figures from the supplied PDF."""
import argparse
import collections
import hashlib
import json
import pathlib
import re

import fitz

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', nargs='?', default='/Users/farahs/Desktop/Final Exam Material/01 Final Written Exam/06 Board Review Self Assessment and Other MCQs/Self Assessment 2024 .pdf')
source = pathlib.Path(parser.parse_args().source)
doc = fitz.open(source)
COLLECTION = 'Self Assessment 2024'
SOURCE = 'Advanced Knowledge Assessment in Pediatric Critical Care 2024'
assets_dir = ROOT / 'public/images/self-assessment-2024'


def compact(text):
    return re.sub(r'\s+', ' ', text).strip()


def prose(lines):
    """Reflow PDF lines, retaining paragraph, list and calculation boundaries."""
    result = ''
    previous = None
    for line in lines:
        value = compact(line['text'])
        if not value:
            continue
        boundary = previous and (
            (line['page'] == previous['page'] and line['bbox'][1] - previous['bbox'][1] > 23)
            or re.match(r'^(?:\d+\.\s|=\s|Sodium Deficit\s*=|\(30 mEq)', value)
        )
        separator = '\n\n' if boundary else ' '
        if result.endswith('-') and not boundary:
            separator = ''
        result += (separator if result else '') + value
        previous = line
    return result.strip()


groups = []
current = None
excluded_text = []
for page_no, page in enumerate(doc, 1):
    lines = []
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            value = ''.join(span['text'] for span in line['spans']).strip()
            if value:
                lines.append({'page': page_no, 'text': value, 'bbox': line['bbox'], 'red': any(span['color'] == 0xFF0000 and span['text'].strip() for span in line['spans'])})
    lines.sort(key=lambda line: (round(line['bbox'][1] / 3), line['bbox'][0]))
    for line in lines:
        heading = re.match(r'^(\d+)\.\s*(.*)$', line['text'])
        if heading and int(heading[1]) == len(groups) + 1 and line['bbox'][0] < 100:
            current = {'number': int(heading[1]), 'start': (page_no, line['bbox'][1]), 'lines': []}
            groups.append(current)
            if heading[2]:
                current['lines'].append({**line, 'text': heading[2]})
        elif current:
            # A stray two-letter printing artifact beside the V/Q image, not clinical text.
            if page_no == 38 and line['text'] == 'zz':
                excluded_text.append(line)
            else:
                current['lines'].append(line)

assert len(doc) == 79 and len(groups) == 100
questions = []
items = []
for group in groups:
    lines = group['lines']
    commentary, = [i for i, line in enumerate(lines) if line['text'] == 'Commentary']
    group['commentaryStart'] = (lines[commentary]['page'], lines[commentary]['bbox'][1])
    labels = []
    for i, line in enumerate(lines[:commentary]):
        # Q31's printed C label has no period; preserve its visible option text.
        match = re.match(r'^([A-E])(?:\.\s*|\s{2,})(.*)$', line['text'])
        if match:
            labels.append((i, match[1], match[2], line['red']))
    assert [label[1] for label in labels] == list('ABCDE')[:len(labels)]
    assert 4 <= len(labels) <= 5
    answer, = [label[1] for label in labels if label[3]]
    choices = {}
    for position, (index, key, value, _) in enumerate(labels):
        end = labels[position + 1][0] if position + 1 < len(labels) else commentary
        option_lines = ([{**lines[index], 'text': value}] if value else []) + lines[index + 1:end]
        choices[key] = prose(option_lines)
        assert choices[key]
    scenario = prose(lines[:labels[0][0]])
    explanation = prose(lines[commentary + 1:])
    assert scenario and explanation
    question = {'id': 14000 + group['number'], 'title': f'{COLLECTION} — Question {group["number"]}', 'scenario': scenario, 'choices': choices, 'correctAnswer': answer, 'correctAnswerText': choices[answer], 'explanation': explanation, 'source': SOURCE, 'category': COLLECTION}
    questions.append(question)
    items.append({'number': group['number'], 'id': question['id'], 'pages': sorted({group['start'][0], *[line['page'] for line in lines]}), 'answer': answer, 'answerEvidence': 'Red option label in the supplied PDF', 'choices': list(choices), 'scenarioCharacters': len(scenario), 'explanationCharacters': len(explanation), 'sourceTextLines': len(lines), 'figures': []})

assets = []
excluded_images = collections.Counter()
assets_dir.mkdir(parents=True, exist_ok=True)
for page_no, page in enumerate(doc, 1):
    for image in page.get_image_info(xrefs=True):
        rect = fitz.Rect(image['bbox'])
        if image['width'] == 512 and image['height'] == 512:
            excluded_images['backgroundTiles'] += 1
            continue
        if abs(rect.width - page.rect.width) < 1 and abs(rect.height - page.rect.height) < 1:
            # Pages 7 and 53 contain full-page flattened markup duplicates over native text.
            assert page_no in (7, 53)
            excluded_images['fullPageMarkupDuplicates'] += 1
            continue
        anchor = (page_no, rect.y0)
        group_index = max(i for i, group in enumerate(groups) if group['start'] <= anchor)
        group = groups[group_index]
        role = 'explanation' if anchor >= group['commentaryStart'] else 'question'
        original = doc.extract_image(image['xref'])
        assert not original['smask'], 'Masked source image needs compositing review'
        sequence = len(items[group_index]['figures']) + 1
        raw = original['image']
        source_image_hash = hashlib.sha256(raw).hexdigest()
        extraction = 'Original embedded image bytes'
        extension = original['ext']
        if page_no == 10:
            # The CT's yellow pointer is a separate PDF drawing, so retain the visible composite.
            raw = page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=rect, alpha=False).tobytes('png')
            extension = 'png'
            extraction = 'Rendered source figure bounds at 144 dpi, including the supplied yellow pointer'
        filename = f'q{group["number"]:03}-{role}-p{page_no:03}-{sequence}.{extension}'
        (assets_dir / filename).write_bytes(raw)
        figure = {'src': f'/PICUMCQBANK/images/self-assessment-2024/{filename}', 'label': f'Question {group["number"]} — Figure {sequence}', 'caption': f'Original figure or table supplied with {COLLECTION}, Question {group["number"]}.'}
        questions[group_index].setdefault('visuals', {}).setdefault(role, []).append(figure)
        asset = {'filename': filename, 'questionNumber': group['number'], 'page': page_no, 'role': role, 'xref': image['xref'], 'sha256': hashlib.sha256(raw).hexdigest(), 'sourceImageSha256': source_image_hash, 'extraction': extraction, 'width': image['width'], 'height': image['height'], 'sourceBounds': list(rect)}
        items[group_index]['figures'].append(asset)
        assets.append(asset)

assert len(assets) == 17
assert sum(asset['role'] == 'explanation' for asset in assets) == 2
assert {asset['questionNumber'] for asset in assets if asset['role'] == 'explanation'} == {9, 58}
assert len(questions[45]['visuals']['question']) == 2
assert len(questions[58]['visuals']['question']) == 2
assert len(questions[20]['visuals']['question']) == 1
assert len(questions[76]['visuals']['question']) == 1

summary = {'name': COLLECTION, 'source': SOURCE, 'sourceFile': source.name, 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'pages': len(doc), 'questions': len(questions), 'withSourceAnswerKeys': len(questions), 'withExplanations': len(questions), 'figuresAndTables': len(assets), 'questionVisuals': sum(asset['role'] == 'question' for asset in assets), 'explanationVisuals': sum(asset['role'] == 'explanation' for asset in assets), 'provenance': 'Native question text and complete commentaries; keyed choices taken from red option labels; 16 original image files and one source-rendered CT figure preserving its separately drawn yellow pointer. No clinical answers or explanations generated.'}
audit = {**summary, 'excludedNonContentImages': dict(excluded_images), 'excludedPrintingArtifacts': excluded_text, 'items': items, 'assets': assets}
(ROOT / 'data/self-assessment-2024-audit.json').write_text(json.dumps(audit, indent=2, ensure_ascii=False) + '\n')
(ROOT / 'data/self-assessment-2024-questions.ts').write_text('// Generated by scripts/import-self-assessment-2024.py from the supplied PDF.\nimport type { Question } from "@/types/question";\n\nexport const selfAssessment2024Questions: Question[] = ' + json.dumps(questions, indent=2, ensure_ascii=False) + ';\n')
print(json.dumps(summary, indent=2, ensure_ascii=False))
