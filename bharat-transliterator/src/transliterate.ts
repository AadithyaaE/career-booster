import Sanscript from 'sanscript';

export type IndicScript =
  | 'devanagari'
  | 'bengali'
  | 'gurmukhi'
  | 'gujarati'
  | 'oriya'
  | 'tamil'
  | 'telugu'
  | 'kannada'
  | 'malayalam'
  | 'itrans'
  | 'iast';

const unicodeBlockToScript: Array<{ range: [number, number]; script: IndicScript }> = [
  { range: [0x0900, 0x097f], script: 'devanagari' },
  { range: [0x0980, 0x09ff], script: 'bengali' },
  { range: [0x0a00, 0x0a7f], script: 'gurmukhi' },
  { range: [0x0a80, 0x0aff], script: 'gujarati' },
  { range: [0x0b00, 0x0b7f], script: 'oriya' },
  { range: [0x0b80, 0x0bff], script: 'tamil' },
  { range: [0x0c00, 0x0c7f], script: 'telugu' },
  { range: [0x0c80, 0x0cff], script: 'kannada' },
  { range: [0x0d00, 0x0d7f], script: 'malayalam' },
];

export function detectScript(text: string): IndicScript | null {
  let best: { script: IndicScript; score: number } | null = null;
  for (const { range: [start, end], script } of unicodeBlockToScript) {
    const score = [...text].reduce((acc, ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return acc + (code >= start && code <= end ? 1 : 0);
    }, 0);
    if (score > 0 && (!best || score > best.score)) best = { script, score };
  }
  return best?.script ?? null;
}

export function transliterate(text: string, to: IndicScript): string {
  const from = detectScript(text) ?? 'devanagari';
  if (from === to) return text;
  try {
    return Sanscript.t(text, from, to);
  } catch (e) {
    return text;
  }
}
