// ─────────────────────────────────────────────────────────────
// CareerScope — Scoring (v5)
// Aligned with questions_v5_final.ts (RIASEC + DISC model)
//
// Backward-compatible surface kept:
//   calculateScore, scoreToType, getDimensionPercents, Score, Answers
// ─────────────────────────────────────────────────────────────

import {
  riasecQuestions,
  discQuestions,
  careerArchetypes,
  riasecDescriptions,
  discDescriptions,
  calculateCareerType,
} from './questions';
import { getArchetype } from './types';

export type {
  RIASECType,
  DISCType,
  CareerArchetype,
} from './questions';

// Re-export core helpers so consumers can import from one place
export {
  calculateCareerType,
  careerArchetypes,
  riasecDescriptions,
  discDescriptions,
};

// ─────────────────────────────────────────────────────────────
// Answers type
//
// v5: key = question id, value = selected option TEXT string
// (The old format used a numeric point value 0-4; that model is
//  no longer used — the v5 quiz picks a typed option, not a
//  Likert rating.)
// ─────────────────────────────────────────────────────────────
export type Answers = Record<number, string>;

// ─────────────────────────────────────────────────────────────
// Score — kept for backward compatibility with existing pages.
// R/I/A/S/E/C counts (max 3 each), plus total questions answered.
// ─────────────────────────────────────────────────────────────
export interface Score {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────
// calculateScore — backward-compatible wrapper around scoring.
// Returns RIASEC counts (0-3 per type) + total answers given.
// ─────────────────────────────────────────────────────────────
export function calculateScore(answers: Answers): Score {
  const { riasecScores } = calculateCareerType(answers);
  return {
    R: riasecScores.R,
    I: riasecScores.I,
    A: riasecScores.A,
    S: riasecScores.S,
    E: riasecScores.E,
    C: riasecScores.C,
    total: Object.keys(answers).length,
  };
}

// ─────────────────────────────────────────────────────────────
// scoreToType — returns the full v5 career type string
// e.g. "D-R", "C-I", "I-A"
// (Previously returned a 3-letter Holland code; callers that
//  only need the archetype key should use this value directly.)
// ─────────────────────────────────────────────────────────────
export function scoreToType(score: Score, answers?: Answers): string {
  // If we have the raw answers we can run the full v5 scoring;
  // otherwise fall back to RIASEC-only dominant type.
  if (answers) {
    return calculateCareerType(answers).careerType;
  }
  // Fallback: determine dominant RIASEC only (no DISC info)
  const riasecOrder = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
  return riasecOrder.reduce((a, b) => (score[a] >= score[b] ? a : b));
}

// ─────────────────────────────────────────────────────────────
// DimensionPercent — shape the results page uses for bar charts
// ─────────────────────────────────────────────────────────────
export interface DimensionPercent {
  letterA: string;
  letterB: string;
  percentA: number;
  label: string;
  descA: string;
  descB: string;
}

// ─────────────────────────────────────────────────────────────
// Max Possible Scores for v5 Questions
// ─────────────────────────────────────────────────────────────
export const RIASEC_MAX = {
  R: 17,
  I: 14,
  A: 8,
  E: 13,
  C: 12,
  S: 8,
};

export const DISC_MAX = {
  D: 12,
  I: 12,
  S: 12,
  C: 12,
};

// ─────────────────────────────────────────────────────────────
// getDimensionPercents — RIASEC breakdown for profile display.
// ─────────────────────────────────────────────────────────────
export function getDimensionPercents(score: Score): DimensionPercent[] {
  const getPct = (val: number, type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C') => {
    const max = RIASEC_MAX[type];
    return Math.round((val / max) * 100);
  };

  return [
    {
      letterA: 'R',
      letterB: '',
      percentA: getPct(score.R, 'R'),
      label: 'Builder (Realistic)',
      descA: riasecDescriptions.R.summary,
      descB: '',
    },
    {
      letterA: 'I',
      letterB: '',
      percentA: getPct(score.I, 'I'),
      label: 'Analyst (Investigative)',
      descA: riasecDescriptions.I.summary,
      descB: '',
    },
    {
      letterA: 'A',
      letterB: '',
      percentA: getPct(score.A, 'A'),
      label: 'Designer (Artistic)',
      descA: riasecDescriptions.A.summary,
      descB: '',
    },
    {
      letterA: 'S',
      letterB: '',
      percentA: getPct(score.S, 'S'),
      label: 'Collaborator (Social)',
      descA: riasecDescriptions.S.summary,
      descB: '',
    },
    {
      letterA: 'E',
      letterB: '',
      percentA: getPct(score.E, 'E'),
      label: 'Driver (Enterprising)',
      descA: riasecDescriptions.E.summary,
      descB: '',
    },
    {
      letterA: 'C',
      letterB: '',
      percentA: getPct(score.C, 'C'),
      label: 'Operator (Conventional)',
      descA: riasecDescriptions.C.summary,
      descB: '',
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// Completion helpers
// ─────────────────────────────────────────────────────────────

/** Total questions in the v5 assessment (18 RIASEC + 12 DISC) */
export const TOTAL_QUESTIONS = riasecQuestions.length + discQuestions.length;

/** How many questions the user has answered */
export function countAnswered(answers: Answers): number {
  return Object.keys(answers).length;
}

/** True when all 30 questions are answered */
export function isComplete(answers: Answers): boolean {
  return countAnswered(answers) >= TOTAL_QUESTIONS;
}

/** Progress as a 0–100 integer */
export function progressPercent(answers: Answers): number {
  return Math.round((countAnswered(answers) / TOTAL_QUESTIONS) * 100);
}

// ─────────────────────────────────────────────────────────────
// Typed score breakdowns (for new components)
// ─────────────────────────────────────────────────────────────

export interface RIASECPercent {
  type: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  label: string;
  roleName: string;
  summary: string;
  score: number;
  percent: number;
  maxScore: number;
}

export function getRIASECPercents(score: Score): RIASECPercent[] {
  const types = (['R', 'I', 'A', 'S', 'E', 'C'] as const);
  return types.map(type => {
    const max = RIASEC_MAX[type];
    return {
      type,
      label: type,
      roleName: riasecDescriptions[type].name,
      summary: riasecDescriptions[type].summary,
      score: score[type],
      percent: Math.round((score[type] / max) * 100),
      maxScore: max,
    };
  });
}

export interface DISCPercent {
  type: 'D' | 'I' | 'S' | 'C';
  label: string;
  roleName: string;
  summary: string;
  score: number;
  percent: number;
  maxScore: number;
}

export function getDISCPercents(discScores: Record<'D' | 'I' | 'S' | 'C', number>): DISCPercent[] {
  const types = (['D', 'I', 'S', 'C'] as const);
  return types.map(type => {
    const max = DISC_MAX[type];
    return {
      type,
      label: type,
      roleName: discDescriptions[type].name,
      summary: discDescriptions[type].summary,
      score: discScores[type],
      percent: Math.round((discScores[type] / max) * 100),
      maxScore: max,
    };
  });
}

interface V5Result {
  riasecScores: Record<string, number>;
  discScores: Record<string, number>;
  dominantRIASEC: string;
  dominantDISC: string;
  careerType: string;
}

export function generateAiSummary(type: string, result: V5Result, answers: Answers) {
  const arch = getArchetype(type);

  // Dominant descriptions
  const riasecName = riasecDescriptions[result.dominantRIASEC as keyof typeof riasecDescriptions]?.name || result.dominantRIASEC;
  const discName = discDescriptions[result.dominantDISC as keyof typeof discDescriptions]?.name || result.dominantDISC;

  // Find secondary RIASEC (2nd highest)
  const riasecEntries = Object.entries(result.riasecScores)
    .sort(([, a], [, b]) => b - a);
  const secondaryRIASEC = riasecEntries.length > 1
    ? riasecDescriptions[riasecEntries[1][0] as keyof typeof riasecDescriptions]?.name || riasecEntries[1][0]
    : '';

  // Find secondary DISC
  const discEntries = Object.entries(result.discScores)
    .sort(([, a], [, b]) => b - a);
  const secondaryDISC = discEntries.length > 1
    ? discDescriptions[discEntries[1][0] as keyof typeof discDescriptions]?.name || discEntries[1][0]
    : '';

  const workingDNAParagraph = `Your Career DNA profile shows a strong alignment with the ${arch.name} archetype. Your primary work preference is ${riasecName} — ${riasecDescriptions[result.dominantRIASEC as keyof typeof riasecDescriptions]?.summary || ''} Your secondary inclination toward ${secondaryRIASEC} adds depth to your professional toolkit.`;

  const secretWeaponParagraph = `Your work personality is predominantly ${discName}, meaning ${discDescriptions[result.dominantDISC as keyof typeof discDescriptions]?.summary || ''} Combined with ${secondaryDISC} tendencies, you bring a distinctive blend of ${arch.workStyle}`;

  // Growth recommendation — find weakest RIASEC area
  const weakestRIASEC = riasecEntries[riasecEntries.length - 1];
  const weakestName = riasecDescriptions[weakestRIASEC[0] as keyof typeof riasecDescriptions]?.name || weakestRIASEC[0];
  const weakestSummary = riasecDescriptions[weakestRIASEC[0] as keyof typeof riasecDescriptions]?.summary || '';
  const weakestMax = RIASEC_MAX[weakestRIASEC[0] as keyof typeof RIASEC_MAX] || 3;

  const growthParagraph = `💡 Growth Recommendation: Your lowest RIASEC dimension is ${weakestName}. To expand your professional range, consider exploring opportunities that develop your ${weakestName.toLowerCase()} instincts. ${weakestSummary.replace('You are energised by', 'This means developing comfort with')}`;

  return {
    workingDNA: workingDNAParagraph,
    secretWeapon: secretWeaponParagraph,
    growth: growthParagraph,
  };
}

export interface MockJobMatch {
  id: string;
  title: string;
  field: string;
  salaryMin: number;
  salaryMax: number;
  demand: "High Demand" | "Growing" | "Competitive";
  companyType: string;
  whyYouFit: string;
  description: string;
  personalityScore: number;
  skillScore: number;
  experienceScore: number;
  totalScore: number;
  keySkills: string[];
  yourStrengths: string[];
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const fieldSkillMap: Record<string, string[]> = {
  "Software Engineering": [
    "React",
    "Node.js",
    "TypeScript",
    "Git",
    "REST APIs",
    "PostgreSQL",
    "Docker",
  ],
  "Cloud Engineering": [
    "AWS",
    "Terraform",
    "Kubernetes",
    "Docker",
    "Linux",
    "CI/CD",
    "Python",
  ],
  DevOps: [
    "Docker",
    "Kubernetes",
    "Jenkins",
    "Terraform",
    "Linux",
    "AWS",
    "Monitoring",
  ],
  "Data Science": [
    "Python",
    "SQL",
    "Pandas",
    "TensorFlow",
    "Statistics",
    "R",
    "Jupyter",
  ],
  "AI / Machine Learning": [
    "Python",
    "PyTorch",
    "TensorFlow",
    "NLP",
    "Deep Learning",
    "Statistics",
    "MLOps",
  ],
  "UI/UX Design": [
    "Figma",
    "User Research",
    "Prototyping",
    "CSS",
    "Design Systems",
    "Wireframing",
  ],
  "Product Management": [
    "Agile",
    "User Stories",
    "Roadmapping",
    "Analytics",
    "Stakeholder Mgmt",
    "Jira",
  ],
  "Mobile Development": [
    "React Native",
    "Swift",
    "Kotlin",
    "Flutter",
    "REST APIs",
    "Firebase",
  ],
  Cybersecurity: [
    "Network Security",
    "Pentesting",
    "SIEM",
    "Python",
    "Risk Assessment",
    "Compliance",
  ],
  "Business Analysis": [
    "SQL",
    "Tableau",
    "Excel",
    "Requirements",
    "Process Mapping",
    "Agile",
  ],
};

const salaryRanges: Record<string, [number, number]> = {
  "Software Engineering": [4000, 8000],
  "Cloud Engineering": [5000, 9000],
  DevOps: [5000, 9500],
  "Data Science": [4500, 8500],
  "AI / Machine Learning": [5500, 10000],
  "UI/UX Design": [3500, 7000],
  "Product Management": [5000, 9000],
  "Mobile Development": [4000, 8000],
  Cybersecurity: [5000, 9500],
  "Business Analysis": [3500, 7000],
};

export function generateMockJobMatches(
  type: string,
  archetype: ReturnType<typeof getArchetype>,
): MockJobMatch[] {
  let seed = 0;
  for (let i = 0; i < type.length; i++) seed += type.charCodeAt(i) * (i + 1);
  const rand = seededRandom(seed);

  const demands: Array<"High Demand" | "Growing" | "Competitive"> = [
    "High Demand",
    "Growing",
    "Competitive",
  ];
  const companyTypes = [
    "Tech Startup",
    "Enterprise",
    "Unicorn Startup",
    "MNC",
    "Digital Agency",
  ];
  const whyTemplates = [
    `Your ${archetype.name.replace("The ", "")} personality thrives in this hands-on role`,
    `Strong alignment with your work style — ${archetype.workStyle.split(".")[0].toLowerCase()}`,
    `Matches your top strength: ${archetype.strengths[0]?.toLowerCase() || "technical depth"}`,
    `Your personality type excels in this collaborative environment`,
    `Great fit for someone who values ${archetype.strengths[1]?.toLowerCase() || "problem-solving"}`,
  ];

  return archetype.topJobs
    .slice(0, 5)
    .map((title, i) => {
      const field =
        archetype.fields[Math.min(i, archetype.fields.length - 1)] ||
        "Software Engineering";
      const skills =
        fieldSkillMap[field] || fieldSkillMap["Software Engineering"];
      const [salMin, salMax] = salaryRanges[field] || [4000, 8000];

      const basePersonality = Math.round(32 + rand() * 8 - i * 2);
      const baseSkill = Math.round(26 + rand() * 9 - i * 2);
      const baseExperience = Math.round(18 + rand() * 7 - i * 1.5);

      const personality = Math.min(40, Math.max(10, basePersonality));
      const skill = Math.min(35, Math.max(8, baseSkill));
      const experience = Math.min(25, Math.max(5, baseExperience));
      const total = personality + skill + experience;

      // Pick 2 strengths relevant to this role
      const strengthPool = [...archetype.strengths];
      const yourStrengths: string[] = [];
      for (let j = 0; j < 2 && strengthPool.length > 0; j++) {
        const idx = Math.floor(rand() * strengthPool.length);
        yourStrengths.push(strengthPool.splice(idx, 1)[0]);
      }

      return {
        id: `mock-${i}`,
        title,
        field,
        salaryMin: salMin,
        salaryMax: salMax,
        demand: demands[i % demands.length],
        companyType: companyTypes[i % companyTypes.length],
        whyYouFit: whyTemplates[i % whyTemplates.length],
        description: `This role aligns with your ${archetype.name} profile. It leverages your strengths in ${archetype.strengths.slice(0, 2).join(" and ").toLowerCase()}, within ${field.toLowerCase()} teams.`,
        personalityScore: personality,
        skillScore: skill,
        experienceScore: experience,
        totalScore: total,
        keySkills: skills.slice(0, 4 + Math.floor(rand() * 2)),
        yourStrengths,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);
}
