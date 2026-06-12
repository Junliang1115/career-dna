export interface Question {
  id: number;
  dimension: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  text: string;
}

export const questions: Question[] = [
  // Realistic (R) - 5 questions
  {
    id: 1,
    dimension: 'R',
    text: 'Assemble, install, or repair hardware components, servers, or physical computer equipment.',
  },
  {
    id: 2,
    dimension: 'R',
    text: 'Build, configure, and maintain local network servers, routers, and physical infrastructure.',
  },
  {
    id: 3,
    dimension: 'R',
    text: 'Work with electronics, microcontrollers, and physical sensors to build IoT devices.',
  },
  {
    id: 4,
    dimension: 'R',
    text: 'Set up hardware cabling, configure server rack configurations, and manage data center operations.',
  },
  {
    id: 5,
    dimension: 'R',
    text: 'Program mechanical movements, build prototypes, or operate physical robotics equipment.',
  },

  // Investigative (I) - 5 questions
  {
    id: 6,
    dimension: 'I',
    text: 'Analyze complex datasets and user logs to identify patterns, trends, or anomalies.',
  },
  {
    id: 7,
    dimension: 'I',
    text: 'Research, design, and train machine learning models or artificial intelligence algorithms.',
  },
  {
    id: 8,
    dimension: 'I',
    text: 'Perform cybersecurity threat analysis, log audits, or reverse-engineer malware.',
  },
  {
    id: 9,
    dimension: 'I',
    text: 'Solve abstract mathematical formulas or build complex logical proofs for optimization problems.',
  },
  {
    id: 10,
    dimension: 'I',
    text: 'Read academic papers, technical documentation, or code specifications to understand system internals.',
  },

  // Artistic (A) - 5 questions
  {
    id: 11,
    dimension: 'A',
    text: 'Design user interfaces (UI) and draft artistic layouts, grids, or mockups in Figma.',
  },
  {
    id: 12,
    dimension: 'A',
    text: 'Develop creative animations, visually rich frontend components, or interactive game graphics.',
  },
  {
    id: 13,
    dimension: 'A',
    text: 'Conduct user research and design thinking sessions to gather feedback on product aesthetics.',
  },
  {
    id: 14,
    dimension: 'A',
    text: 'Create digital branding assets, design custom icons, logos, and select color typography.',
  },
  {
    id: 15,
    dimension: 'A',
    text: 'Brainstorm and prototype experimental product features or creative interface paradigms.',
  },

  // Social (S) - 5 questions
  {
    id: 16,
    dimension: 'S',
    text: 'Teach programming, lead workshops, or mentor junior developers in their career growth.',
  },
  {
    id: 17,
    dimension: 'S',
    text: 'Facilitate team meetings, resolve workplace conflicts, and support group communication.',
  },
  {
    id: 18,
    dimension: 'S',
    text: 'Provide technical support, consult clients, and help users troubleshoot their problems.',
  },
  {
    id: 19,
    dimension: 'S',
    text: 'Write community blogs, run developer meetups, or act as a developer relations advocate.',
  },
  {
    id: 20,
    dimension: 'S',
    text: 'Interview users to understand their qualitative pain points and build empathy guidelines.',
  },

  // Enterprising (E) - 5 questions
  {
    id: 21,
    dimension: 'E',
    text: 'Lead a software development project, assign tasks, and manage timelines from start to finish.',
  },
  {
    id: 22,
    dimension: 'E',
    text: 'Define product roadmaps, prioritize feature backlogs, and drive business growth strategies.',
  },
  {
    id: 23,
    dimension: 'E',
    text: 'Pitch software solutions, demo prototypes, and present ideas to managers or clients.',
  },
  {
    id: 24,
    dimension: 'E',
    text: 'Start a new business venture, build a startup product, or launch SaaS offerings.',
  },
  {
    id: 25,
    dimension: 'E',
    text: 'Negotiate deadlines, budget constraints, or resource allocation with business stakeholders.',
  },

  // Conventional (C) - 5 questions
  {
    id: 26,
    dimension: 'C',
    text: 'Organize relational databases, write SQL queries, and manage data migration pipelines.',
  },
  {
    id: 27,
    dimension: 'C',
    text: 'Write detailed API documentation, system runbooks, and project wiki tutorials.',
  },
  {
    id: 28,
    dimension: 'C',
    text: 'Perform systematic quality assurance (QA) testing and verify code compliance with standards.',
  },
  {
    id: 29,
    dimension: 'C',
    text: 'Audit codebase compliance against security guidelines and industry standards.',
  },
  {
    id: 30,
    dimension: 'C',
    text: 'Track project milestones, record team hours, and manage budget spreadsheets.',
  },
];
