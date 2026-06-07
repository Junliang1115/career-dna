export type Dimension = 'BS' | 'EA' | 'TG' | 'CD';

export interface Archetype {
  code: string; // 4-letter e.g. "BEST"
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  idealEnvironments: string[];
  growthAreas: string[];
}

export const archetypes: Archetype[] = [
  // BEST — Builder + Enterprise + Technical + Creative
  {
    code: 'BEST',
    name: 'The Visionary Engineer',
    tagline: 'I build products companies haven\'t imagined yet.',
    description: 'Spans architecture and product. You see both the system and the vision. Rare combination of technical depth and creative ambition.',
    strengths: ['Systems thinking', 'Technical leadership', 'Creative problem-solving', 'End-to-end ownership'],
    idealEnvironments: ['Early-stage startups', 'Engineering-led companies', 'Innovation labs'],
    growthAreas: ['Stakeholder communication', 'Business trade-offs'],
  },
  // BEST variant
  {
    code: 'BECT',
    name: 'The Productive Engineer',
    tagline: 'I ship fast and learn faster.',
    description: 'Relentless builder with applied focus. You ship and iterate, treating production as your laboratory.',
    strengths: ['Rapid delivery', 'Customer-centric', 'Adaptable', 'Cross-functional'],
    idealEnvironments: ['Agile startups', 'Growth teams', 'E-commerce'],
    growthAreas: ['Technical depth', 'Long-term architecture'],
  },
  // More archetypes...
  {
    code: 'BSST',
    name: 'The Security Specialist',
    tagline: 'I find the bugs before the hackers do.',
    description: 'Builder mindset with systems thinking and attention to detail. You understand how things break.',
    strengths: ['Threat modelling', 'Systems analysis', 'Detail-oriented', 'Methodical'],
    idealEnvironments: ['Cybersecurity firms', 'Banks', 'Government tech'],
    growthAreas: ['Communication skills', 'Applied security'],
  },
  {
    code: 'BEGT',
    name: 'The Full-Stack Founder',
    tagline: 'I build, launch, and sell.',
    description: 'Builder + Applied + Creative. You ship complete products that look good and work.',
    strengths: ['Full-stack execution', 'Product intuition', 'Speed to market', 'Visual thinking'],
    idealEnvironments: ['Startups', 'Freelance', 'SaaS products'],
    growthAreas: ['Scale engineering', 'Team leadership'],
  },
  {
    code: 'SEGT',
    name: 'The Strategy Lead',
    tagline: 'I connect data, customers, and roadmaps.',
    description: 'Studies deeply, applies strategically. You turn research into product direction.',
    strengths: ['Analytical thinking', 'Communication', 'Research', 'Product sense'],
    idealEnvironments: ['Product companies', 'Consulting', 'Tech strategy'],
    growthAreas: ['Technical execution', 'Technical depth'],
  },
  {
    code: 'SEST',
    name: 'The Data Architect',
    tagline: 'I make sense of complexity at scale.',
    description: 'Studious and technical. You understand systems deeply and build robust pipelines.',
    strengths: ['Data modelling', 'Systems design', 'Deep analysis', 'Methodical'],
    idealEnvironments: ['Data-intensive companies', 'Banks', 'Enterprise'],
    growthAreas: ['Business communication', 'Applied ML'],
  },
  {
    code: 'BSSD',
    name: 'The DevOps Guardian',
    tagline: 'I build the infrastructure others ship on.',
    description: 'Builder + Systems thinker + Detail. You care about reliability, automation, and scale.',
    strengths: ['Infrastructure as code', 'CI/CD', 'Monitoring', 'Automation'],
    idealEnvironments: ['Cloud platforms', 'DevOps teams', 'SaaS companies'],
    growthAreas: ['Business context', 'Customer-facing skills'],
  },
  {
    code: 'SSGT',
    name: 'The Business Analyst',
    tagline: 'I translate between business and tech.',
    description: 'Studies applied + Group orientation. Bridge between what business needs and tech delivers.',
    strengths: ['Requirements gathering', 'Data analysis', 'Stakeholder management', 'Process design'],
    idealEnvironments: ['Banks', 'Enterprises', 'Consulting'],
    growthAreas: ['Technical implementation', 'Negotiation'],
  },
  {
    code: 'BSCT',
    name: 'The AI Innovator',
    tagline: 'I build intelligence that didn\'t exist yesterday.',
    description: 'Builder + Creative + Technical. You create new capabilities that haven\'t been productized yet.',
    strengths: ['ML engineering', 'Innovation', 'Research-to-production', 'Creative applications'],
    idealEnvironments: ['AI labs', 'Big tech', 'Research teams'],
    growthAreas: ['Product-market fit', 'Business communication'],
  },
  {
    code: 'BSGT',
    name: 'The Solutions Architect',
    tagline: 'I design the blueprint for systems that serve millions.',
    description: 'Builder + Enterprise + Systems thinker. You design for scale, reliability, and enterprise needs.',
    strengths: ['Enterprise architecture', 'Cloud design', 'Technical leadership', 'Trade-off analysis'],
    idealEnvironments: ['Cloud providers', 'Enterprise tech', 'System integrators'],
    growthAreas: ['Applied experimentation', 'Speed over perfection'],
  },
  {
    code: 'BESD',
    name: 'The Reliability Engineer',
    tagline: 'I keep the lights on at scale.',
    description: 'Builder + Enterprise + Systems thinker + Detail. You care about uptime, monitoring, and incident response.',
    strengths: ['SRE practices', 'Performance tuning', 'Incident management', 'Automation'],
    idealEnvironments: ['Cloud platforms', 'High-scale services', 'Banks'],
    growthAreas: ['Customer product thinking', 'Applied creativity'],
  },
  {
    code: 'SSCT',
    name: 'The UX Researcher',
    tagline: 'I understand users better than they understand themselves.',
    description: 'Studies deeply + Creative + Group. You translate user behaviour into product decisions.',
    strengths: ['User research', 'Empathy', 'Qualitative analysis', 'Design thinking'],
    idealEnvironments: ['Product companies', 'Design studios', 'E-commerce'],
    growthAreas: ['Technical systems', 'Quantitative rigor'],
  },
  {
    code: 'SSST',
    name: 'The Technical Writer',
    tagline: 'I make complex things understandable.',
    description: 'Studies deeply + Systems thinker + Detail. You close the gap between engineers and everyone else.',
    strengths: ['Clear writing', 'API documentation', 'Developer experience', 'Detail orientation'],
    idealEnvironments: ['Developer tools', 'Enterprise software', 'Open source'],
    growthAreas: ['Creative writing', 'Visual communication'],
  },
  {
    code: 'SESD',
    name: 'The Operations Analyst',
    tagline: 'I find the inefficiency hiding in plain sight.',
    description: 'Studies applied + Enterprise + Detail. You improve processes and measure everything.',
    strengths: ['Process optimization', 'Data analysis', 'SQL', 'Business metrics'],
    idealEnvironments: ['Banks', 'Logistics', 'Operations teams'],
    growthAreas: ['Technical building', 'Creative problem-finding'],
  },
  {
    code: 'SSCD',
    name: 'The Product Designer',
    tagline: 'I design experiences people love.',
    description: 'Studies deeply + Creative + Detail. You combine user research with visual craft.',
    strengths: ['Visual design', 'User research', 'Prototyping', 'Design systems'],
    idealEnvironments: ['Design-led companies', 'Startups', 'Agencies'],
    growthAreas: ['Technical constraints', 'Engineering collaboration'],
  },
  {
    code: 'SEGP',
    name: 'The Growth Analyst',
    tagline: 'I turn data into growth experiments.',
    description: 'Studies deeply + Applied + Group. You design experiments and translate data into action.',
    strengths: ['A/B testing', 'SQL', 'Growth mindset', 'Cross-functional influence'],
    idealEnvironments: ['Growth teams', 'E-commerce', 'Consumer apps'],
    growthAreas: ['Deep technical systems', 'Long-term architecture'],
  },
];

export function getArchetype(code: string): Archetype {
  return archetypes.find(a => a.code === code) || archetypes[0];
}
