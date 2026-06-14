// ─────────────────────────────────────────────────────────────
// CareerScope — Archetype Types (v5-compatible)
//
// Delegates to the 24 v5 CareerArchetypes from questions.ts
// while maintaining backward-compatible surface for results page.
// ─────────────────────────────────────────────────────────────

import {
  careerArchetypes,
  type CareerArchetype,
} from './questions';

export type Dimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

// ─────────────────────────────────────────────────────────────
// Archetype — extended shape used by the results page.
// Wraps v5 CareerArchetype with backward-compatible fields.
// ─────────────────────────────────────────────────────────────

export interface Archetype {
  code: string;             // e.g. "D-R"
  name: string;             // e.g. "The Execution Engineer"
  tagline: string;
  description: string;
  strengths: string[];
  idealEnvironments: string[];  // derived from workStyle + fields
  growthAreas: string[];        // derived from description
  topJobs: string[];            // from v5 archetype
  fields: string[];             // from v5 archetype
  workStyle: string;            // from v5 archetype
}

// ─────────────────────────────────────────────────────────────
// Derive idealEnvironments and growthAreas from v5 data
// ─────────────────────────────────────────────────────────────

function deriveIdealEnvironments(arch: CareerArchetype): string[] {
  const envs: string[] = [];

  // Derive from fields
  const fieldEnvMap: Record<string, string> = {
    'Software Engineering': 'Product engineering teams',
    'Cloud Engineering': 'Cloud-native infrastructure teams',
    'DevOps': 'DevOps & SRE teams',
    'Data Science': 'Data science & analytics departments',
    'AI / Machine Learning': 'AI research & ML engineering teams',
    'UI/UX Design': 'Product design & frontend teams',
    'Product Management': 'Product-led organizations',
    'Business Analysis': 'Strategy & business intelligence teams',
    'Cybersecurity': 'Security operations & red teams',
    'Technical Writing': 'Developer experience & documentation teams',
    'Mobile Development': 'Mobile-first engineering teams',
  };

  for (const field of arch.fields) {
    if (fieldEnvMap[field]) {
      envs.push(fieldEnvMap[field]);
    }
  }

  // Derive from DISC component
  const discLetter = arch.type.charAt(0);
  const discEnvMap: Record<string, string> = {
    'D': 'Fast-paced, high-autonomy environments',
    'I': 'Collaborative, creative team environments',
    'S': 'Stable, supportive team cultures',
    'C': 'Structured, process-driven organizations',
  };
  if (discEnvMap[discLetter]) {
    envs.push(discEnvMap[discLetter]);
  }

  return envs.slice(0, 3);
}

function deriveGrowthAreas(arch: CareerArchetype): string[] {
  const areas: string[] = [];

  // Derive from DISC — suggest complementary skills
  const discLetter = arch.type.charAt(0);
  const discGrowthMap: Record<string, string[]> = {
    'D': ['Patience and active listening', 'Detailed documentation'],
    'I': ['Deep independent focus', 'Systematic analysis'],
    'S': ['Assertive decision-making', 'Comfort with rapid change'],
    'C': ['Creative experimentation', 'Navigating ambiguity'],
  };
  if (discGrowthMap[discLetter]) {
    areas.push(...discGrowthMap[discLetter]);
  }

  // Derive from RIASEC — suggest adjacent skills
  const riasecLetter = arch.type.charAt(2);
  const riasecGrowthMap: Record<string, string> = {
    'R': 'User empathy and stakeholder communication',
    'I': 'Pragmatic prototyping and shipping velocity',
    'A': 'Technical depth and performance optimization',
    'S': 'Individual technical contribution',
    'E': 'Technical specification writing',
    'C': 'Creative problem solving under ambiguity',
  };
  if (riasecGrowthMap[riasecLetter]) {
    areas.push(riasecGrowthMap[riasecLetter]);
  }

  return areas.slice(0, 3);
}

// ─────────────────────────────────────────────────────────────
// Convert a v5 CareerArchetype to the Archetype shape
// ─────────────────────────────────────────────────────────────

function toArchetype(arch: CareerArchetype): Archetype {
  return {
    code: arch.type,
    name: arch.name,
    tagline: arch.tagline,
    description: arch.description,
    strengths: arch.strengths,
    idealEnvironments: deriveIdealEnvironments(arch),
    growthAreas: deriveGrowthAreas(arch),
    topJobs: arch.topJobs,
    fields: arch.fields,
    workStyle: arch.workStyle,
  };
}

// ─────────────────────────────────────────────────────────────
// Pre-build lookup of all 24 archetypes
// ─────────────────────────────────────────────────────────────

const archetypeLookup: Record<string, Archetype> = {};
for (const [key, arch] of Object.entries(careerArchetypes)) {
  archetypeLookup[key] = toArchetype(arch);
}

export const archetypes: Archetype[] = Object.values(archetypeLookup);

// ─────────────────────────────────────────────────────────────
// getArchetype — main lookup used by results page
//
// Accepts:
//   - v5 career type: "D-R", "C-I", etc.
//   - legacy single letter: "R", "I", etc. (fallback)
// ─────────────────────────────────────────────────────────────

export function getArchetype(code: string): Archetype {
  // Direct v5 lookup (e.g. "D-R")
  if (archetypeLookup[code]) {
    return archetypeLookup[code];
  }

  // Fallback: single RIASEC letter — find the first archetype
  // with that RIASEC component and D (Dominant) as default DISC
  const upper = code.charAt(0).toUpperCase();
  const fallbackKey = `D-${upper}`;
  if (archetypeLookup[fallbackKey]) {
    return archetypeLookup[fallbackKey];
  }

  // Ultimate fallback
  return archetypeLookup['D-R'] || archetypes[0];
}
