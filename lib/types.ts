export type Dimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface Archetype {
  code: string; // e.g. "R"
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  idealEnvironments: string[];
  growthAreas: string[];
}

export const archetypes: Archetype[] = [
  {
    code: 'R',
    name: 'The Technical Craftsman',
    tagline: 'Building the digital and physical infrastructure of tomorrow.',
    description: 'You excel at hands-on creation, system configuration, hardware, and networking. You value practical results and direct control over systems.',
    strengths: ['Infrastructure automation', 'System administration', 'Hardware integration', 'Reliable execution'],
    idealEnvironments: ['DevOps & SRE teams', 'Embedded systems labs', 'High-performance computing environments'],
    growthAreas: ['User empathy', 'Business stakeholder communication'],
  },
  {
    code: 'I',
    name: 'The Analytical Thinker',
    tagline: 'Uncovering truth and patterns in complex systems.',
    description: 'You are driven by curiosity and intellectual challenge. You love analyzing data, designing algorithms, researching machine learning, and solving security puzzles.',
    strengths: ['Algorithm design', 'Data analysis', 'Security auditing', 'Root cause diagnosis'],
    idealEnvironments: ['AI research labs', 'Cybersecurity teams', 'Data science departments'],
    growthAreas: ['Pragmatic prototyping', 'Action-oriented delivery'],
  },
  {
    code: 'A',
    name: 'The Creative Innovator',
    tagline: 'Shaping digital experiences with design and code.',
    description: 'You value self-expression, visual aesthetics, and original design. You love crafting user interfaces, designing product flows, and creating interactive experiences.',
    strengths: ['UI/UX design', 'Frontend development', 'Design systems', 'Visual storytelling'],
    idealEnvironments: ['Product design teams', 'Frontend engineering teams', 'Creative tech agencies'],
    growthAreas: ['Technical optimization', 'Standardized process execution'],
  },
  {
    code: 'S',
    name: 'The Collaborative Catalyst',
    tagline: 'Empowering teams and bridging the human-tech gap.',
    description: 'You thrive on helping, teaching, and collaborating. You enjoy mentoring other developers, consulting clients, and building active developer communities.',
    strengths: ['Technical mentoring', 'Cross-team collaboration', 'Developer relations', 'Client consulting'],
    idealEnvironments: ['Developer experience teams', 'Agile consulting firms', 'Engineering leadership tracks'],
    growthAreas: ['Deep independent focus', 'Mathematical analysis'],
  },
  {
    code: 'E',
    name: 'The Strategic Leader',
    tagline: 'Leading products and teams to high-impact success.',
    description: 'You are business-minded, persuasive, and leadership-oriented. You excel at managing product roadmaps, starting new ventures, and pitching technical visions.',
    strengths: ['Product management', 'Strategic roadmap design', 'Technical leadership', 'Business development'],
    idealEnvironments: ['Product management offices', 'Tech startups', 'Solutions architecture teams'],
    growthAreas: ['Detailed technical specifications', 'Independent coding tasks'],
  },
  {
    code: 'C',
    name: 'The Systems Organizer',
    tagline: 'Creating order, reliability, and precision.',
    description: 'You value structure, detail, and organized pipelines. You excel at database management, data engineering, quality assurance (QA) testing, and writing documentation.',
    strengths: ['Data engineering pipelines', 'Quality assurance', 'Technical documentation', 'Standard operational procedures'],
    idealEnvironments: ['Data engineering teams', 'QA & release operations', 'Enterprise backend governance'],
    growthAreas: ['Navigating extreme ambiguity', 'Creative experimentation'],
  },
];

export function getArchetype(code: string): Archetype {
  const primaryLetter = code.charAt(0).toUpperCase();
  return archetypes.find(a => a.code === primaryLetter) || archetypes[0];
}
