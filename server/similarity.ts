/**
 * Bluff Similarity & Phonetic Merging Engine.
 * Detects similar-sounding or semantically identical bluffs submitted by players
 * using text normalization, phonetic encoding (Soundex/Metaphone), Levenshtein distance,
 * and token-set Jaccard overlap.
 */

// Common abbreviation expansions
const ABBREVIATIONS: Record<string, string> = {
  'mt': 'mount',
  'st': 'saint',
  'dr': 'doctor',
  'pres': 'president',
  'gov': 'governor',
  'gen': 'general',
  'capt': 'captain',
  'no': 'number',
  'vs': 'versus',
  'kg': 'kilogram',
  'km': 'kilometer',
  'cm': 'centimeter',
  'm': 'meter',
  '&': 'and'
};

// Common prefixes & filler words to ignore when comparing core meaning
const FILLER_WORDS = new Set([
  'a', 'an', 'the', 'it', 'was', 'is', 'are', 'were', 'they',
  'he', 'she', 'that', 'this', 'there', 'of', 'in', 'on', 'at',
  'to', 'for', 'with', 'about', 'some', 'just', 'actually', 'really'
]);

/**
 * Standard Soundex algorithm for English phonetic matching.
 * Converts words into a 4-character phonetic code (e.g. "Smith" -> "S530", "Smythe" -> "S530").
 */
export function soundex(word: string): string {
  const clean = word.toUpperCase().replace(/[^A-Z]/g, '');
  if (!clean) return '';

  const firstLetter = clean[0];
  const soundexMap: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6'
  };

  let code = firstLetter;
  let prevCode = soundexMap[firstLetter] || '0';

  for (let i = 1; i < clean.length; i++) {
    const char = clean[i];
    const currentCode = soundexMap[char] || '0';

    if (currentCode !== '0' && currentCode !== prevCode) {
      code += currentCode;
      if (code.length === 4) break;
    }
    prevCode = currentCode;
  }

  return (code + '000').slice(0, 4);
}

/**
 * Normalizes text: lowercase, remove diacritics, strip punctuation,
 * expand abbreviations, strip plural 's'/'es'.
 */
export function normalizeBluffText(text: string): string {
  if (!text) return '';

  let normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/['’]/g, '') // e.g. "don't" -> "dont", "king's" -> "kings"
    .replace(/[^a-z0-9\s]/g, ' ') // Strip punctuation
    .trim();

  // Tokenize & normalize words
  const words = normalized.split(/\s+/).filter(Boolean);
  const processedWords = words.map((w) => {
    // Expand abbreviations
    if (ABBREVIATIONS[w]) return ABBREVIATIONS[w];
    // Simple stem: remove common plural endings for words >= 4 chars
    if (w.length >= 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.length >= 4 && w.endsWith('es') && !w.endsWith('ses')) return w.slice(0, -2);
    if (w.length >= 4 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    return w;
  });

  return processedWords.join(' ');
}

/**
 * Extracts key content tokens excluding common filler/articles.
 */
export function extractContentTokens(text: string): string[] {
  const norm = normalizeBluffText(text);
  const tokens = norm.split(/\s+/).filter((t) => t.length > 0 && !FILLER_WORDS.has(t));
  return tokens.length > 0 ? tokens : norm.split(/\s+/).filter(Boolean);
}

/**
 * Standard Levenshtein distance for string edit distance.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalized Levenshtein similarity [0.0 - 1.0].
 */
export function levenshteinSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(a, b);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Jaccard token overlap similarity between two token sets.
 */
export function tokenJaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 && tokensB.length === 0) return 1.0;
  if (tokensA.length === 0 || tokensB.length === 0) return 0.0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Phonetic similarity between two token arrays using Soundex codes.
 */
export function phoneticOverlapSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 && tokensB.length === 0) return 1.0;
  if (tokensA.length === 0 || tokensB.length === 0) return 0.0;

  const soundexA = tokensA.map(soundex);
  const soundexB = tokensB.map(soundex);

  const setA = new Set(soundexA);
  const setB = new Set(soundexB);

  let intersection = 0;
  for (const code of setA) {
    if (setB.has(code)) intersection++;
  }

  const union = new Set([...soundexA, ...soundexB]).size;
  return union === 0 ? 0 : intersection / union;
}

export interface SimilarityResult {
  isSimilar: boolean;
  score: number;
  reason?: 'exact' | 'normalized_match' | 'levenshtein' | 'phonetic' | 'token_overlap';
}

/**
 * Determines whether two bluff statements sound similar or express the same answer.
 * Thresholds calibrated for party game bluffs (e.g. Jackbox / Fibbage style).
 */
export function areBluffsSimilar(rawA: string, rawB: string): SimilarityResult {
  if (!rawA || !rawB) return { isSimilar: false, score: 0 };

  const cleanA = rawA.trim();
  const cleanB = rawB.trim();

  // 1. Direct case-insensitive match
  if (cleanA.toLowerCase() === cleanB.toLowerCase()) {
    return { isSimilar: true, score: 1.0, reason: 'exact' };
  }

  const normA = normalizeBluffText(cleanA);
  const normB = normalizeBluffText(cleanB);

  // 2. Normalized string match (e.g. "The golden pineapple" vs "golden pineapples")
  if (normA === normB && normA.length > 0) {
    return { isSimilar: true, score: 0.98, reason: 'normalized_match' };
  }

  // 3. Normalized Levenshtein similarity
  const levSim = levenshteinSimilarity(normA, normB);
  const maxLen = Math.max(normA.length, normB.length);

  // For short strings (<= 6 chars), allow 1 edit (e.g. "Nairobi" vs "Nairoby")
  // For medium strings (7-15 chars), allow up to 2 edits or levSim >= 0.82
  // For longer strings, levSim >= 0.80
  const levDist = levenshteinDistance(normA, normB);
  if (
    (maxLen <= 6 && levDist <= 1) ||
    (maxLen <= 12 && levDist <= 2) ||
    levSim >= 0.82
  ) {
    return { isSimilar: true, score: levSim, reason: 'levenshtein' };
  }

  // 4. Token & Phonetic Analysis
  const tokensA = extractContentTokens(cleanA);
  const tokensB = extractContentTokens(cleanB);

  const jaccard = tokenJaccardSimilarity(tokensA, tokensB);
  const phonetic = phoneticOverlapSimilarity(tokensA, tokensB);

  // If high word overlap (e.g. "Mount Kenya volcano" vs "Volcano of Mount Kenya")
  if (jaccard >= 0.75) {
    return { isSimilar: true, score: jaccard, reason: 'token_overlap' };
  }

  // If high phonetic overlap (sound-alike words)
  if (phonetic >= 0.85 && tokensA.length === tokensB.length) {
    return { isSimilar: true, score: phonetic, reason: 'phonetic' };
  }

  // If one is a complete substring of another and comprises almost the whole phrase
  if (
    (normA.includes(normB) && normB.length >= 4 && normB.length / normA.length > 0.65) ||
    (normB.includes(normA) && normA.length >= 4 && normA.length / normB.length > 0.65)
  ) {
    return { isSimilar: true, score: 0.85, reason: 'token_overlap' };
  }

  return { isSimilar: false, score: Math.max(levSim, jaccard, phonetic) };
}

/**
 * Chooses the best representative display text among multiple similar bluffs.
 * Prefers:
 * 1. Clean capitalization (proper Title Case or clean sentence case).
 * 2. Medium concise length (not overly abbreviated, not overly bloated).
 * 3. No trailing punctuation or awkward typos.
 */
export function pickBestMergedText(bluffs: string[]): string {
  if (!bluffs || bluffs.length === 0) return '';
  if (bluffs.length === 1) return bluffs[0];

  // Score candidate texts
  const scored = bluffs.map((text) => {
    let score = 0;
    const trimmed = text.trim();

    // Prefer text starting with capital letter
    if (/^[A-Z]/.test(trimmed)) score += 3;

    // Penalize ALL CAPS or all lowercase
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) score -= 2;
    if (trimmed === trimmed.toLowerCase()) score -= 1;

    // Prefer reasonable length (between 10 and 40 characters)
    if (trimmed.length >= 8 && trimmed.length <= 40) score += 2;

    // Penalize trailing punctuation dots/commas
    if (/[.,;]$/.test(trimmed)) score -= 1;

    return { text: trimmed, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].text;
}
