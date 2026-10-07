"""Reproduce verified Study Guide crops: python extract-study-guide-figures.py SOURCE.pdf.

Requires PyMuPDF. Page numbers and crop rectangles refer to the original
1602-page Study guide-1.pdf; rectangles use PDF points, not screenshot pixels.
"""
import argparse
import json
from pathlib import Path
import fitz

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('pdf', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'data/studyguide-figure-manifest.json').read_text())
with fitz.open(args.pdf) as document:
    if len(document) != 1602:
        raise ValueError('Expected the original 1602-page Study Guide PDF.')
    for figure in manifest:
        destination = root / 'public' / figure['src'].lstrip('/')
        destination.parent.mkdir(parents=True, exist_ok=True)
        document[figure['page'] - 1].get_pixmap(
            matrix=fitz.Matrix(3, 3), clip=fitz.Rect(figure['rect']), alpha=False
        ).save(destination)
print(f'Extracted {len(manifest)} verified source figures.')
