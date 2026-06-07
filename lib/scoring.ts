export type Answers = Record<number, 'A' | 'B'>;

export interface Score {
  B: number; // Building
  S: number; // Studying
  E: number; // Enterprise
  A: number; // Applied
  T: number; // Technical
  G: number; // Group
  C: number; // Creative
  D: number; // Detail
  total: number;
}

export interface DimensionPercent {
  letterA: string; // e.g. "B"
  letterB: string; // e.g. "S"
  percentA: number; // 0-100
  label: string; // e.g. "Builder vs Studier"
  descA: string;
  descB: string;
}

// Maps question ID → which dimension and which letter is "A"
const DIMENSION_MAP: Record<number, { dim: 'BS' | 'EA' | 'TG' | 'CD'; aIsFirst: boolean }> = {
  1:  { dim: 'BS', aIsFirst: true  }, // A = Build
  2:  { dim: 'BS', aIsFirst: true  },
  3:  { dim: 'BS', aIsFirst: true  },
  4:  { dim: 'BS', aIsFirst: true  },
  5:  { dim: 'BS', aIsFirst: false },
  6:  { dim: 'EA', aIsFirst: true  }, // A = Enterprise
  7:  { dim: 'EA', aIsFirst: false },
  8:  { dim: 'EA', aIsFirst: false },
  9:  { dim: 'EA', aIsFirst: false },
  10: { dim: 'EA', aIsFirst: true  },
  11: { dim: 'TG', aIsFirst: true  }, // A = Technical
  12: { dim: 'TG', aIsFirst: true  },
  13: { dim: 'TG', aIsFirst: false },
  14: { dim: 'TG', aIsFirst: false },
  15: { dim: 'TG', aIsFirst: true  },
  16: { dim: 'CD', aIsFirst: true  }, // A = Creative
  17: { dim: 'CD', aIsFirst: false },
  18: { dim: 'CD', aIsFirst: true  },
  19: { dim: 'CD', aIsFirst: false },
  20: { dim: 'CD', aIsFirst: false },
};

export function calculateScore(answers: Answers): Score {
  const score: Score = { B: 0, S: 0, E: 0, A: 0, T: 0, G: 0, C: 0, D: 0, total: Object.keys(answers).length };

  for (const [qIdStr, answer] of Object.entries(answers)) {
    const qId = Number(qIdStr);
    const mapping = DIMENSION_MAP[qId];
    if (!mapping) continue;

    const { dim, aIsFirst } = mapping;
    if (answer === 'A') {
      if (dim === 'BS') score.B += 1;
      else if (dim === 'EA') score.E += 1;
      else if (dim === 'TG') score.T += 1;
      else if (dim === 'CD') score.C += 1;
    } else {
      if (dim === 'BS') score.S += 1;
      else if (dim === 'EA') score.A += 1;
      else if (dim === 'TG') score.G += 1;
      else if (dim === 'CD') score.D += 1;
    }
  }

  return score;
}

export function scoreToType(score: Score): string {
  const first  = score.B >= score.S ? 'B' : 'S';
  const second = score.E >= score.A ? 'E' : 'A';
  const third  = score.T >= score.G ? 'T' : 'G';
  const fourth = score.C >= score.D ? 'C' : 'D';
  return `${first}${second}${third}${fourth}`;
}

export function getDimensionPercents(score: Score): DimensionPercent[] {
  const dims: DimensionPercent[] = [];

  // B/S
  const bPct = Math.round((score.B / (score.B + score.S || 1)) * 100);
  dims.push({
    letterA: 'B', letterB: 'S',
    percentA: bPct,
    label: 'How You Build',
    descA: 'Hands-on. Ship fast, learn fast.',
    descB: 'Thoughtful. Understand before you build.',
  });

  // E/A
  const ePct = Math.round((score.E / (score.E + score.A || 1)) * 100);
  dims.push({
    letterA: 'E', letterB: 'A',
    percentA: ePct,
    label: 'Where You Thrive',
    descA: 'Structured environments with clear paths.',
    descB: 'Fast-moving environments with high ownership.',
  });

  // T/G
  const tPct = Math.round((score.T / (score.T + score.G || 1)) * 100);
  dims.push({
    letterA: 'T', letterB: 'G',
    percentA: tPct,
    label: 'Your Professional Scope',
    descA: 'Deep expertise in one domain.',
    descB: 'Broad skills across many areas.',
  });

  // C/D
  const cPct = Math.round((score.C / (score.C + score.D || 1)) * 100);
  dims.push({
    letterA: 'C', letterB: 'D',
    percentA: cPct,
    label: 'How You Decide',
    descA: 'Creative and intuitive.',
    descB: 'Data-driven and directed.',
  });

  return dims;
}
