// Title-cases a title for display. Words that already carry a capital
// (AI, CPython, NFTs) are left alone so acronyms and brand names survive.
// Short articles, conjunctions and prepositions stay lowercase unless they
// start the title, end it, or open a new phrase after a colon or dash.
const MINOR_WORDS = new Set([
  'a', 'an', 'the',
  'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
  'as', 'at', 'by', 'from', 'in', 'into', 'of', 'off', 'on', 'onto', 'per',
  'than', 'to', 'up', 'via', 'vs', 'with',
]);

// Names that are styled lowercase and should never be capitalised.
const KEEP_LOWERCASE = new Set(['uv']);

const capitalise = (part, force) => {
  if (/[A-Z]/.test(part) || KEEP_LOWERCASE.has(part.replace(/[^a-z]/g, ''))) return part;
  if (!force && MINOR_WORDS.has(part.replace(/[^a-z]/g, ''))) return part;
  return part.replace(/^([^a-z0-9]*)([a-z])/, (_, lead, letter) => lead + letter.toUpperCase());
};

module.exports = (title) => {
  if (!title) return title;
  const tokens = String(title).split(/(\s+)/);
  const lastWord = tokens.findLastIndex((t) => t.trim());
  let phraseStart = true;

  return tokens
    .map((token, i) => {
      if (!token.trim()) return token;
      const force = phraseStart || i === lastWord;
      phraseStart = /[:–—-]$/.test(token);
      return token
        .split('-')
        .map((part, j) => capitalise(part, force || j > 0))
        .join('-');
    })
    .join('');
};
