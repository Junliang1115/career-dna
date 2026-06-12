import { questions } from './questions';

export type Answers = Record<number, number>; // Maps questionId -> pointValue (0-4)

export interface Score {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
  total: number;
}

export interface DimensionPercent {
  letterA: string;
  letterB: string;
  percentA: number;
  label: string;
  descA: string;
  descB: string;
}

export function calculateScore(answers: Answers): Score {
  const score: Score = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0, total: Object.keys(answers).length };

  for (const [qIdStr, val] of Object.entries(answers)) {
    const qId = Number(qIdStr);
    const question = questions.find(q => q.id === qId);
    if (!question) continue;

    score[question.dimension] += val; // Add the selected point value (0-4)
  }

  return score;
}

export function scoreToType(score: Score): string {
  const categories: { key: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'; value: number }[] = [
    { key: 'R', value: score.R },
    { key: 'I', value: score.I },
    { key: 'A', value: score.A },
    { key: 'S', value: score.S },
    { key: 'E', value: score.E },
    { key: 'C', value: score.C },
  ];

  // Sort descending by score. Tie-breaker: original order R > I > A > S > E > C
  categories.sort((a, b) => b.value - a.value);

  // Return the top 3 categories as a 3-letter Holland Code
  return categories.slice(0, 3).map(c => c.key).join('');
}

export function getDimensionPercents(score: Score): DimensionPercent[] {
  // Max score per category is 5 questions * 4 points = 20 points
  const getPct = (val: number) => Math.round((val / 20) * 100);

  return [
    {
      letterA: 'R',
      letterB: '',
      percentA: getPct(score.R),
      label: 'Realistic (Doer)',
      descA: 'Hands-on tasks, equipment setup, hardware, and physical configurations.',
      descB: '',
    },
    {
      letterA: 'I',
      letterB: '',
      percentA: getPct(score.I),
      label: 'Investigative (Thinker)',
      descA: 'Intellectual analysis, algorithms, ML models, and security research.',
      descB: '',
    },
    {
      letterA: 'A',
      letterB: '',
      percentA: getPct(score.A),
      label: 'Artistic (Creator)',
      descA: 'Visual design, UI/UX aesthetics, animations, and frontend layouts.',
      descB: '',
    },
    {
      letterA: 'S',
      letterB: '',
      percentA: getPct(score.S),
      label: 'Social (Helper)',
      descA: 'Teaching, technical mentoring, developer relations, and team support.',
      descB: '',
    },
    {
      letterA: 'E',
      letterB: '',
      percentA: getPct(score.E),
      label: 'Enterprising (Persuader)',
      descA: 'Product management, strategic roadmaps, pitching, and business growth.',
      descB: '',
    },
    {
      letterA: 'C',
      letterB: '',
      percentA: getPct(score.C),
      label: 'Conventional (Organizer)',
      descA: 'Databases, data engineering, quality compliance, and documentation.',
      descB: '',
    },
  ];
}
