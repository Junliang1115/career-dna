// Legacy file — field graph now generated from careerTaxonomy.ts
// This file kept for backwards compatibility; map page uses careerTaxonomy.ts directly

import { careerFields, CareerField } from './careerTaxonomy';

// Circular layout — 37 nodes in 2 concentric rings organized by cluster
// ViewBox: 1000 x 520, center at (500, 260)
// Inner ring (r=135): engineering + data clusters
// Outer ring (r=235): all remaining clusters
const semanticLayout: Record<string, { x: number, y: number }> = {
  // Core Web & Software (Center Left)
  'fullstack': { x: 444, y: 400 },
  'backend': { x: 388, y: 330 },
  'frontend': { x: 388, y: 470 },
  
  // Design (Far Left)
  'ui': { x: 276, y: 512 },
  'ux': { x: 192, y: 540 },
  'productdesign': { x: 136, y: 596 },

  // Product & Management (Bottom Left)
  'techsales': { x: 220, y: 666 },
  'techwriting': { x: 164, y: 708 },
  'techconsult': { x: 304, y: 722 },

  // Mobile & Games (Top Left)
  'mobile': { x: 290, y: 274 },
  'games': { x: 192, y: 204 },

  // Infra & Platform (Top)
  'devops': { x: 500, y: 260 },
  'platform': { x: 430, y: 176 },
  'sre': { x: 542, y: 162 },
  'cloud': { x: 570, y: 78 },
  'networking': { x: 668, y: 106 },

  // Security (Top Right)
  'appsec': { x: 682, y: 218 },
  'cybersec': { x: 752, y: 148 },
  'secops': { x: 836, y: 190 },

  // Data & AI (Center Right & Far Right)
  'dataeng': { x: 584, y: 344 },
  'datascience': { x: 696, y: 330 },
  'analytics': { x: 626, y: 428 },
  'datavis': { x: 542, y: 484 },
  'mlai': { x: 808, y: 316 },
  'nlp': { x: 864, y: 386 },
  'deeplearning': { x: 920, y: 274 },

  // Hardware, Systems, Emerging (Bottom Right)
  'embedded': { x: 528, y: 568 },
  'systems': { x: 584, y: 624 },
  'iot': { x: 668, y: 680 },
  'robotics': { x: 752, y: 596 },
  'autonomous': { x: 864, y: 638 },
  'qa': { x: 444, y: 652 },

  // Science & Blockchain (Bottom / Far Bottom Right)
  'csp': { x: 752, y: 498 },
  'blockchain': { x: 500, y: 750 }
};

function getNodePos(id: string): { x: number; y: number } {
  const pos = semanticLayout[id];
  if (!pos) return { x: 500, y: 400 };
  return pos;
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
  return {
    id: field.id,
    label: field.label,
    x: pos.x,
    y: pos.y,
    radius: 6,
    color: field.color,
    kind: 'field',
    ring: 'outer',
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
  { source: 'techsales',     target: 'cloud',              skill: 'Solutions',     strength: 2 },
  { source: 'techconsult',   target: 'cloud',              skill: 'Architecture',  strength: 2 },
  { source: 'datavis',        target: 'analytics',          skill: 'Visualization', strength: 3 },
  { source: 'nlp',           target: 'datascience',         skill: 'ML',             strength: 2 },
  { source: 'cloud',         target: 'platform',            skill: 'Terraform',     strength: 2 },
];

// Maps career type → field IDs that match that type
const fieldsByRiasec: Record<string, string[]> = {
  R: ['backend', 'mobile', 'games', 'embedded', 'devops', 'platform', 'sre', 'networking', 'iot', 'robotics', 'autonomous', 'systems', 'qa'],
  I: ['datascience', 'mlai', 'deeplearning', 'nlp', 'cybersec', 'appsec', 'secops', 'csp', 'systems'],
  A: ['frontend', 'fullstack', 'ui', 'ux', 'productdesign', 'games'],
  S: ['techconsult', 'techsales', 'ux'],
  E: ['techsales', 'blockchain'],
  C: ['dataeng', 'analytics', 'datavis', 'techwriting', 'qa'],
};

export const fieldByType: Record<string, string[]> = new Proxy<Record<string, string[]>>({}, {
  get(target, key) {
    if (typeof key !== 'string') return undefined;

    const fields = new Set<string>();
    for (const char of key) {
      const uChar = char.toUpperCase();
      if (fieldsByRiasec[uChar]) {
        fieldsByRiasec[uChar].forEach(f => fields.add(f));
      }
    }
    return Array.from(fields);
  }
});
