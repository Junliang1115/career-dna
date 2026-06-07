// Legacy file — field graph now generated from careerTaxonomy.ts
// This file kept for backwards compatibility; map page uses careerTaxonomy.ts directly

import { careerFields, CareerField } from './careerTaxonomy';

// Circular layout — 37 nodes in 2 concentric rings organized by cluster
// ViewBox: 1000 x 520, center at (500, 260)
// Inner ring (r=135): engineering + data clusters
// Outer ring (r=235): all remaining clusters
const CX = 500, CY = 260;
const INNER_R = 135, OUTER_R = 235;

// Ordered field IDs by cluster, starting from top, going clockwise
const orderedFields: Array<{ id: string; ring: 'inner' | 'outer'; angleOffsetDeg: number }> = [
  // Inner ring — Engineering (9 nodes, evenly at ~40° each, starting at 280°)
  { id: 'frontend',      ring: 'inner', angleOffsetDeg: 290 },
  { id: 'backend',       ring: 'inner', angleOffsetDeg: 325 },
  { id: 'fullstack',     ring: 'inner', angleOffsetDeg: 0 },
  { id: 'mobile',        ring: 'inner', angleOffsetDeg: 35 },
  { id: 'games',         ring: 'inner', angleOffsetDeg: 70 },
  { id: 'embedded',      ring: 'inner', angleOffsetDeg: 105 },
  { id: 'devops',        ring: 'inner', angleOffsetDeg: 140 },
  { id: 'qa',            ring: 'inner', angleOffsetDeg: 175 },
  { id: 'platform',      ring: 'inner', angleOffsetDeg: 210 },
  // Data (8 nodes, continuing clockwise on outer ring starts at 245°)
  // Outer ring — Data cluster (starts at 250°)
  { id: 'dataeng',       ring: 'outer', angleOffsetDeg: 255 },
  { id: 'datascience',   ring: 'outer', angleOffsetDeg: 282 },
  { id: 'mlai',          ring: 'outer', angleOffsetDeg: 309 },
  { id: 'deeplearning',  ring: 'outer', angleOffsetDeg: 336 },
  { id: 'nlp',           ring: 'outer', angleOffsetDeg: 363 },
  { id: 'datavis',       ring: 'outer', angleOffsetDeg: 390 },
  { id: 'analytics',     ring: 'outer', angleOffsetDeg: 417 },
  // Infrastructure (3)
  { id: 'cloud',         ring: 'outer', angleOffsetDeg: 444 },
  { id: 'sre',           ring: 'outer', angleOffsetDeg: 471 },
  { id: 'networking',    ring: 'outer', angleOffsetDeg: 498 },
  // Security (3)
  { id: 'cybersec',      ring: 'outer', angleOffsetDeg: 525 },
  { id: 'appsec',        ring: 'outer', angleOffsetDeg: 547 },
  { id: 'secops',        ring: 'outer', angleOffsetDeg: 569 },
  // Product (4)
  { id: 'product',       ring: 'outer', angleOffsetDeg: 591 },
  { id: 'techsales',     ring: 'outer', angleOffsetDeg: 613 },
  { id: 'techwriting',   ring: 'outer', angleOffsetDeg: 635 },
  { id: 'techconsult',   ring: 'outer', angleOffsetDeg: 657 },
  { id: 'engineeringm',  ring: 'outer', angleOffsetDeg: 679 },
  // Design (3)
  { id: 'ux',            ring: 'outer', angleOffsetDeg: 701 },
  { id: 'ui',            ring: 'outer', angleOffsetDeg: 723 },
  { id: 'productdesign', ring: 'outer', angleOffsetDeg: 745 },
  // Science (4)
  { id: 'systems',       ring: 'outer', angleOffsetDeg: 767 },
  { id: 'csp',           ring: 'outer', angleOffsetDeg: 789 },
  { id: 'blockchain',    ring: 'outer', angleOffsetDeg: 811 },
  // Emerging (4)
  { id: 'iot',           ring: 'outer', angleOffsetDeg: 833 },
  { id: 'robotics',      ring: 'outer', angleOffsetDeg: 855 },
  { id: 'autonomous',    ring: 'outer', angleOffsetDeg: 877 },
];

// Build id → position map
const positionMap = new Map(orderedFields.map(f => [f.id, f]));

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function getNodePos(id: string): { x: number; y: number } {
  const entry = positionMap.get(id);
  if (!entry) return { x: CX, y: CY };
  const r = entry.ring === 'inner' ? INNER_R : OUTER_R;
  const rad = degToRad(entry.angleOffsetDeg);
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

export interface FieldNode {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  kind: 'field' | 'skill';
  ring: 'inner' | 'outer'; // which ring this node belongs to
}

export interface FieldEdge {
  source: string;
  target: string;
  skill: string;
  strength: number; // 1-3, used for edge thickness
}

export const fieldNodes: FieldNode[] = careerFields.map(field => {
  const pos = getNodePos(field.id);
  const entry = positionMap.get(field.id);
  return {
    id: field.id,
    label: field.label,
    x: pos.x,
    y: pos.y,
    radius: 6,
    color: field.color,
    kind: 'field',
    ring: entry?.ring ?? 'outer',
  };
});

// Cross-cluster edges — fields that share skills / are commonly transitioned between
export const fieldEdges: FieldEdge[] = [
  { source: 'frontend',       target: 'fullstack',     skill: 'JavaScript',       strength: 3 },
  { source: 'backend',        target: 'fullstack',      skill: 'API Design',        strength: 3 },
  { source: 'backend',        target: 'dataeng',         skill: 'SQL',              strength: 2 },
  { source: 'backend',        target: 'devops',          skill: 'Docker',           strength: 2 },
  { source: 'frontend',      target: 'ui',              skill: 'CSS',              strength: 3 },
  { source: 'frontend',       target: 'ux',              skill: 'User Research',    strength: 2 },
  { source: 'dataeng',       target: 'datascience',     skill: 'Python',          strength: 3 },
  { source: 'datascience',    target: 'mlai',            skill: 'ML',              strength: 3 },
  { source: 'mlai',          target: 'deeplearning',    skill: 'Neural Nets',     strength: 2 },
  { source: 'mlai',          target: 'nlp',            skill: 'NLP',             strength: 2 },
  { source: 'mlai',          target: 'analytics',        skill: 'Statistics',      strength: 2 },
  { source: 'devops',         target: 'sre',              skill: 'Reliability',     strength: 3 },
  { source: 'devops',         target: 'cloud',           skill: 'Cloud',           strength: 3 },
  { source: 'devops',         target: 'platform',         skill: 'IaC',            strength: 2 },
  { source: 'cybersec',      target: 'appsec',           skill: 'AppSec',          strength: 3 },
  { source: 'cybersec',      target: 'secops',           skill: 'SIEM',            strength: 2 },
  { source: 'appsec',        target: 'devops',           skill: 'Shift-Left',      strength: 2 },
  { source: 'sre',           target: 'platform',          skill: 'Kubernetes',     strength: 2 },
  { source: 'networking',    target: 'cloud',            skill: 'VPC',             strength: 2 },
  { source: 'mobile',        target: 'frontend',          skill: 'TypeScript',      strength: 2 },
  { source: 'mobile',        target: 'games',             skill: 'Unity',           strength: 2 },
  { source: 'games',         target: 'frontend',          skill: 'WebGL',          strength: 2 },
  { source: 'embedded',      target: 'iot',               skill: 'C/C++',          strength: 2 },
  { source: 'iot',           target: 'autonomous',        skill: 'Sensors',        strength: 2 },
  { source: 'robotics',      target: 'autonomous',        skill: 'Control Theory', strength: 2 },
  { source: 'systems',       target: 'embedded',           skill: 'C',              strength: 3 },
  { source: 'systems',       target: 'games',              skill: 'C++',           strength: 2 },
  { source: 'systems',       target: 'csp',               skill: 'Algorithms',     strength: 2 },
  { source: 'blockchain',    target: 'backend',            skill: 'Backend',        strength: 2 },
  { source: 'product',       target: 'analytics',          skill: 'Data',           strength: 2 },
  { source: 'product',       target: 'ux',                skill: 'User-Centric',  strength: 2 },
  { source: 'techsales',     target: 'cloud',              skill: 'Solutions',     strength: 2 },
  { source: 'techconsult',   target: 'cloud',              skill: 'Architecture',  strength: 2 },
  { source: 'engineeringm',  target: 'product',            skill: 'Roadmap',       strength: 2 },
  { source: 'datavis',        target: 'analytics',          skill: 'Visualization', strength: 3 },
  { source: 'nlp',           target: 'datascience',         skill: 'ML',             strength: 2 },
  { source: 'cloud',         target: 'platform',            skill: 'Terraform',     strength: 2 },
];

// Maps career type → field IDs that match that type
export const fieldByType: Record<string, string[]> = {
  SEGC: ['frontend', 'fullstack', 'ui'],
  SEGP: ['frontend', 'fullstack', 'ux', 'ui', 'productdesign'],
  SEGX: ['frontend', 'mobile', 'games', 'ui', 'ux'],
  SEGXc: ['frontend', 'mobile', 'games', 'nlp', 'datavis'],
  SAGC: ['datascience', 'analytics', 'datavis'],
  SAGP: ['datascience', 'mlai', 'analytics', 'datavis'],
  SAGX: ['mlai', 'deeplearning', 'nlp', 'datascience'],
  SAXC: ['datascience', 'mlai', 'nlp', 'csp', 'research'],
  TAAC: ['dataeng', 'analytics', 'datavis'],
  TAAP: ['dataeng', 'cloud', 'datavis'],
  TAXC: ['dataeng', 'mlai', 'deeplearning', 'blockchain'],
  TACC: ['dataeng', 'dataeng', 'sre', 'platform'],
  TACP: ['cloud', 'platform', 'sre'],
  TECX: ['backend', 'devops', 'cloud', 'sre', 'networking'],
  TECP: ['backend', 'fullstack', 'platform'],
  TEPX: ['backend', 'mobile', 'games', 'embedded', 'iot'],
  TEPc: ['backend', 'mobile', 'systems', 'robotics'],
  BEXC: ['backend', 'fullstack', 'blockchain'],
  BEXP: ['backend', 'fullstack', 'techsales', 'techconsult'],
  BECX: ['cybersec', 'appsec', 'secops', 'backend'],
  BECP: ['cybersec', 'appsec', 'product'],
};
