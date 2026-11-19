"""Import the supplied PREP 2026 question/answer PDFs without reconstructing content."""
import collections
import hashlib
import json
import pathlib
import re

import fitz

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE_ROOT = pathlib.Path('/Users/farahs/Downloads')
ASSETS = ROOT / 'public/images/prep-2026'
ASSETS.mkdir(parents=True, exist_ok=True)
DOCS = {}
FILES = {}
for block in (1, 2):
    for kind in ('Questions', 'Answers'):
        filename = f'PREP_2026_Block{block:02}_{kind}' + (' 2' if (block, kind) == (1, 'Answers') else '') + '.pdf'
        source = SOURCE_ROOT / filename
        DOCS[block, kind] = fitz.open(source)
        FILES[block, kind] = {'filename': filename, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'pages': len(DOCS[block, kind])}


def native_lines(page):
    lines = []
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            value = ''.join(span['text'] for span in line['spans']).strip()
            if not value:
                continue
            if re.match(r'^PREP\s+2026\s*[|/]', value, re.I) or value == 'Answers • PREP Pearls • Critiques':
                continue
            if re.match(r'^Figure\s*[•·].*supplied with Question', value):
                continue
            if re.match(r'^Clinical figure relevant to Question', value):
                continue
            if line['bbox'][1] >= page.rect.height - 38:
                continue
            lines.append({'text': value, 'bbox': tuple(line['bbox'])})
    return sorted(lines, key=lambda line: (round(line['bbox'][1], 1), line['bbox'][0]))


def compact(text):
    return re.sub(r'\s+', ' ', re.sub(r'(?<=\w)-\s+(?=\w)', '-', text)).strip()


def group_answers(block):
    groups = collections.defaultdict(list)
    current = None
    for page_index, page in enumerate(DOCS[block, 'Answers']):
        lines = native_lines(page)
        heading = next((re.match(r'^Question\s+(\d+)\s*(?:/\s*20|\||$)', line['text']) for line in lines if re.match(r'^Question\s+(\d+)\s*(?:/\s*20|\||$)', line['text'])), None)
        if heading:
            current = int(heading[1])
        if current is not None:
            groups[current].append({'page': page_index + 1, 'lines': lines})
    assert sorted(groups) == list(range(1, 21))
    return groups


def laboratory_table(page, lines, option_heading):
    header = next((line for line in lines if line['text'] == 'Laboratory test'), None)
    if not header:
        return None, None
    result = next(line for line in lines if line['text'] == 'Result' and abs(line['bbox'][1] - header['bbox'][1]) < 4)
    clip = fitz.Rect(header['bbox'][0] - 6, header['bbox'][3] + 1, page.rect.width - 35, option_heading['bbox'][1] - 5)
    words = sorted(page.get_text('words', clip=clip), key=lambda word: (word[1], word[0]))
    groups = []
    for word in words:
        center = (word[1] + word[3]) / 2
        row = next((row for row in groups if abs(row['center'] - center) < 3), None)
        if row is None:
            row = {'center': center, 'left': [], 'right': []}
            groups.append(row)
        row['left' if word[0] < result['bbox'][0] - 10 else 'right'].append(word)
    rows = []
    for row in sorted(groups, key=lambda row: row['center']):
        left = compact(' '.join(word[4] for word in sorted(row['left'], key=lambda word: word[0])))
        right = compact(' '.join(word[4] for word in sorted(row['right'], key=lambda word: word[0])))
        assert left and right, ('Incomplete table row', left, right)
        rows.append([left, right])
    assert rows
    region = (header['bbox'][1] - 2, option_heading['bbox'][1] - 5)
    return {'title': 'Laboratory results', 'columns': ['Laboratory test', 'Result'], 'rows': rows}, region


media = []
questions = []
items = []
for block in (1, 2):
    answers = group_answers(block)
    qdoc = DOCS[block, 'Questions']
    assert len(qdoc) == 20
    for number, page in enumerate(qdoc, 1):
        lines = native_lines(page)
        heading = next(line for line in lines if re.fullmatch(rf'Question\s+0?{number}(?:\s*/\s*20)?', line['text']))
        option_heading = next(line for line in lines if line['text'] in ('Select one answer:', 'Answer choices'))
        table, table_region = laboratory_table(page, lines, option_heading)
        scenario_lines = [line['text'] for line in lines if line['bbox'][1] > heading['bbox'][3] and line['bbox'][3] < option_heading['bbox'][1] and not (table_region and table_region[0] <= line['bbox'][1] <= table_region[1])]
        scenario = compact(' '.join(scenario_lines))
        options_text = '\n'.join(line['text'] for line in lines if line['bbox'][1] > option_heading['bbox'][3])
        choice_matches = list(re.finditer(r'(?m)^([A-D])\.\s*', options_text))
        assert [match[1] for match in choice_matches] == list('ABCD'), (block, number, options_text)
        choices = {match[1]: compact(options_text[match.end(): choice_matches[index + 1].start() if index + 1 < len(choice_matches) else len(options_text)]) for index, match in enumerate(choice_matches)}
        answer_pages = answers[number]
        answer_text = '\n'.join(line['text'] for answer_page in answer_pages for line in answer_page['lines'])
        answer = re.search(r'Correct answer\s*:?\s*([A-D])\.\s*([^\n]+)', answer_text)
        assert answer, (block, number, 'No source answer')
        pearl_marker = re.search(r'(?m)^PREP Pearls\s*$', answer_text)
        critique_marker = re.search(r'(?m)^Critique\s*$', answer_text)
        assert pearl_marker and critique_marker and critique_marker.start() > pearl_marker.end()
        pearl_text = answer_text[pearl_marker.end():critique_marker.start()].strip()
        pearls = [compact(text) for text in re.split(r'[•]', pearl_text) if compact(text)]
        critique = compact(answer_text[critique_marker.end():])
        explanation_data = []
        if (block, number) == (2, 18):
            answer_page = DOCS[block, 'Answers'][answer_pages[-1]['page'] - 1]
            triage, _ = laboratory_table(answer_page, answer_pages[-1]['lines'], {'bbox': (0, answer_page.rect.height - 38, 0, 0)})
            assert triage and len(triage['rows']) == 4
            triage.update(title='JumpSTART: category summary', columns=['Category', 'Description'])
            explanation_data.append(triage)
            critique = critique.split('JumpSTART: category summary')[0].strip()
        if (block, number) == (2, 19):
            marker = 'HLH-2004 criteria (5 of 8)'
            criteria_text = answer_text.split(marker, 1)[1]
            criteria = [compact(value) for value in criteria_text.split('•') if compact(value)]
            assert len(criteria) == 8
            explanation_data.append({'title': marker, 'columns': ['Criterion'], 'rows': [[criterion] for criterion in criteria]})
            critique = critique.split(marker)[0].strip()
        source_notes = []
        if (block, number) == (1, 15):
            note = re.search(r'The marked answer in the source is C.*?rather than hidden\.', critique)
            assert note
            source_notes.append(note[0])
            critique = compact(critique.replace(note[0], ''))
        assert scenario and all(choices.values()) and critique and pearls
        question = {'id': 9000 + (block - 1) * 20 + number, 'title': f'PREP 2026 Block {block} Question {number}', 'scenario': scenario, 'choices': choices, 'correctAnswer': answer[1], 'correctAnswerText': choices[answer[1]], 'explanation': critique + '\n\nPREP Pearls:\n' + '\n'.join('• ' + pearl for pearl in pearls), 'source': f'PREP 2026 — ICU Block {block}', 'category': f'PREP 2026 - Block {block}'}
        if table:
            question['clinicalData'] = [table]
        if explanation_data:
            question['explanationData'] = explanation_data
        if source_notes:
            question['sourceNotes'] = source_notes
        visuals = collections.defaultdict(list)
        question_image_hashes = set()
        for kind, source_pages in [('Questions', [number]), ('Answers', [item['page'] for item in answer_pages])]:
            for page_number in source_pages:
                source_page = DOCS[block, kind][page_number - 1]
                for index, image in enumerate(source_page.get_images(), 1):
                    pixmap = fitz.Pixmap(DOCS[block, kind], image[0])
                    pixel_hash = hashlib.sha256(pixmap.samples).hexdigest()
                    if kind == 'Answers' and pixel_hash in question_image_hashes:
                        media.append({'block': block, 'question': number, 'kind': kind, 'page': page_number, 'duplicateQuestionFigure': True, 'pixelSha256': pixel_hash})
                        continue
                    if kind == 'Questions':
                        question_image_hashes.add(pixel_hash)
                    extracted = DOCS[block, kind].extract_image(image[0])
                    role = 'question' if kind == 'Questions' else 'explanation'
                    filename = f'block{block}-q{number:02}-{role}-{index}.{extracted["ext"]}'
                    data = extracted['image']
                    (ASSETS / filename).write_bytes(data)
                    figure_number = len(visuals[role]) + 1
                    visuals[role].append({'src': f'/PICUMCQBANK/images/prep-2026/{filename}', 'label': f'Block {block}, Q{number} — {"Figure" if role == "question" else "Explanation figure"} {figure_number}', 'caption': f'Figure supplied with PREP 2026 Block {block}, Question {number}.'})
                    media.append({'block': block, 'question': number, 'kind': kind, 'page': page_number, 'filename': filename, 'sha256': hashlib.sha256(data).hexdigest(), 'pixelSha256': pixel_hash})
        if visuals:
            question['visuals'] = dict(visuals)
        questions.append(question)
        items.append({'block': block, 'questionNumber': number, 'id': question['id'], 'questionPage': number, 'answerPages': [answer_page['page'] for answer_page in answer_pages], 'answer': answer[1], 'sourceAnswerText': answer[2], 'tableRows': len(table['rows']) if table else 0, 'pearls': len(pearls), 'critiqueCharacters': len(critique), 'sourceNotes': source_notes, 'questionFigures': len(visuals['question']), 'explanationFigures': len(visuals['explanation'])})

# Independently cross-check the Block 1 overview key against the per-item answers.
key_text = DOCS[1, 'Answers'][0].get_text()
key = dict((int(match[0]), match[1]) for match in re.findall(r'Q(\d{2})\s+([A-D])', key_text))
assert len(key) == 20
assert all(key[number] == questions[number - 1]['correctAnswer'] for number in key)
assert len(questions) == 40 and len(set(q['id'] for q in questions)) == 40
output = '// Generated by scripts/import-prep-2026.py from the four supplied study PDFs.\nimport type { Question } from "@/types/question";\n\nexport const prep2026Questions: Question[] = ' + json.dumps(questions, indent=2, ensure_ascii=False) + ';\n'
(ROOT / 'data/prep-2026-questions.ts').write_text(output)
summary = {'questions': 40, 'blocks': 2, 'withExplanations': 40, 'withPrepPearls': 40, 'clinicalTables': sum(bool(q.get('clinicalData')) for q in questions), 'explanationDataBlocks': sum(len(q.get('explanationData', [])) for q in questions), 'questionFigures': sum(i['questionFigures'] for i in items), 'explanationFigures': sum(i['explanationFigures'] for i in items), 'sourceNotes': sum(bool(i['sourceNotes']) for i in items), 'duplicateAnswerFiguresLinkedToQuestion': sum(bool(m.get('duplicateQuestionFigure')) for m in media)}
audit = {**summary, 'sources': [{'block': block, 'kind': kind, **info} for (block, kind), info in FILES.items()], 'items': items, 'media': media, 'provenance': 'Question wording, answer markings, pearls, critiques, figures and table values are from the supplied typeset study editions. The supplied summaries are retained; no new clinical guidance or missing content is generated.'}
(ROOT / 'data/prep-2026-audit.json').write_text(json.dumps(audit, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(summary, indent=2))
