export interface ReadingAssessmentResult {
  accuracyPercent: number;
  coveragePercent: number;
  targetWordCount: number;
  attemptWordCount: number;
  missingWords: string[];
  extraWords: string[];
  feedback: string;
}

export function assessReadingAttempt(
  targetText: string,
  attemptText: string,
): ReadingAssessmentResult {
  const targetWords = tokenize(targetText);
  const attemptWords = tokenize(attemptText);

  if (targetWords.length === 0) {
    return {
      accuracyPercent: 0,
      coveragePercent: 0,
      targetWordCount: 0,
      attemptWordCount: attemptWords.length,
      missingWords: [],
      extraWords: attemptWords.slice(0, 5),
      feedback: 'O texto alvo desta sessao esta vazio.',
    };
  }

  const targetFreq = toFrequencyMap(targetWords);
  const attemptFreq = toFrequencyMap(attemptWords);

  let overlap = 0;
  for (const [word, count] of Object.entries(targetFreq)) {
    overlap += Math.min(count, attemptFreq[word] ?? 0);
  }

  const positionalMatches = countPositionalMatches(targetWords, attemptWords);
  const weightedScore =
    0.6 * (positionalMatches / targetWords.length) +
    0.4 * (overlap / targetWords.length);

  const accuracyPercent = toPercent(weightedScore);
  const coveragePercent = toPercent(overlap / targetWords.length);

  const missingWords = computeMissingWords(targetFreq, attemptFreq);
  const extraWords = computeMissingWords(attemptFreq, targetFreq);

  return {
    accuracyPercent,
    coveragePercent,
    targetWordCount: targetWords.length,
    attemptWordCount: attemptWords.length,
    missingWords: missingWords.slice(0, 5),
    extraWords: extraWords.slice(0, 5),
    feedback: buildFeedback(accuracyPercent, missingWords, extraWords),
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]+/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function toFrequencyMap(words: string[]): Record<string, number> {
  return words.reduce<Record<string, number>>((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});
}

function computeMissingWords(
  source: Record<string, number>,
  comparison: Record<string, number>,
): string[] {
  const missing: string[] = [];
  for (const [word, count] of Object.entries(source)) {
    const diff = count - (comparison[word] ?? 0);
    if (diff <= 0) {
      continue;
    }
    for (let i = 0; i < diff; i += 1) {
      missing.push(word);
    }
  }
  return missing;
}

function countPositionalMatches(targetWords: string[], attemptWords: string[]) {
  const max = Math.min(targetWords.length, attemptWords.length);
  let count = 0;

  for (let i = 0; i < max; i += 1) {
    if (targetWords[i] === attemptWords[i]) {
      count += 1;
    }
  }

  return count;
}

function toPercent(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return Number((clamped * 100).toFixed(1));
}

function buildFeedback(
  accuracyPercent: number,
  missingWords: string[],
  extraWords: string[],
) {
  if (accuracyPercent >= 90) {
    return 'Excelente acuracia de leitura. Mantenha o ritmo e a clareza na pronuncia.';
  }

  if (accuracyPercent >= 75) {
    const hint =
      missingWords.length > 0
        ? `Revise as palavras faltantes: ${missingWords.join(', ')}.`
        : '';
    return `Boa tentativa com pequenas lacunas. ${hint}`.trim();
  }

  const focusWords = missingWords.slice(0, 3).join(', ');
  const extraHint =
    extraWords.length > 0
      ? `Palavras extras detectadas: ${extraWords.join(', ')}.`
      : '';
  return `Precisa melhorar. Foque na sequencia alvo${
    focusWords ? ` (${focusWords})` : ''
  }. ${extraHint}`.trim();
}
