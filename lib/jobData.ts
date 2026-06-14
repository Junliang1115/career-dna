import { careerFields, positionsByField } from './careerTaxonomy';
import {
  careerArchetypes,
  riasecDescriptions,
  discDescriptions,
  type RIASECType,
  type DISCType,
  type CareerArchetype,
} from './questions';

export type DemandLevel = 'Rare' | 'Competitive' | 'Oversaturated';

export interface Skill {
  name: string;
  covered: boolean; // user has it from their courses
}

export interface Job {
  id: string;
  title: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  demand: DemandLevel;
  skillsRequired: string[];
  skillsUser: string[]; // skills the user has from their selected courses
  typeFit: string[]; // RIASEC letters that match well
  discFit: DISCType[]; // DISC types that match well
  field: string;
  fieldId: string;
  cluster: string;
  description: string;
}

// ─── RIASEC mapping for fields ──────────────────────────────────────────────
const fieldsByRiasec: Record<string, string[]> = {
  R: ['backend', 'mobile', 'games', 'embedded', 'devops', 'platform', 'sre', 'networking', 'iot', 'robotics', 'autonomous', 'systems', 'qa'],
  I: ['datascience', 'mlai', 'deeplearning', 'nlp', 'cybersec', 'appsec', 'secops', 'csp', 'systems'],
  A: ['frontend', 'fullstack', 'ui', 'ux', 'productdesign', 'games'],
  S: ['techconsult', 'techsales', 'ux'],
  E: ['techsales', 'blockchain'],
  C: ['dataeng', 'analytics', 'datavis', 'techwriting', 'qa'],
};

// ─── DISC mapping for fields/clusters ───────────────────────────────────────
// Maps field clusters → which DISC types fit well in that area
const discByCluster: Record<string, DISCType[]> = {
  engineering:    ['D', 'C'],
  data:           ['C', 'I'],
  product:        ['D', 'I'],
  infrastructure: ['C', 'S'],
  security:       ['C', 'D'],
  design:         ['I', 'S'],
  science:        ['I', 'C'],
  emerging:       ['D', 'I'],
};

// Additional DISC tags based on job title keywords
function getDiscFromTitle(title: string): DISCType[] {
  const lower = title.toLowerCase();
  const tags: DISCType[] = [];

  // D — leadership, ownership, speed
  if (/lead|architect|principal|founding|startup|growth/.test(lower)) tags.push('D');
  // I — communication, advocacy, collaboration
  if (/advocate|relations|consultant|community|sales|creative/.test(lower)) tags.push('I');
  // S — support, reliability, team
  if (/support|coach|mentor|reliability|site reliability/.test(lower)) tags.push('S');
  // C — quality, testing, security, documentation
  if (/qa|test|security|compliance|documentation|writer|analyst/.test(lower)) tags.push('C');

  return tags;
}

function getRiasecForField(fieldId: string): string[] {
  const types: string[] = [];
  for (const [letter, fields] of Object.entries(fieldsByRiasec)) {
    if (fields.includes(fieldId)) {
      types.push(letter);
    }
  }
  return types;
}

function getDiscForJob(cluster: string, title: string): DISCType[] {
  const clusterDisc = discByCluster[cluster] || ['D', 'C'];
  const titleDisc = getDiscFromTitle(title);
  return Array.from(new Set([...clusterDisc, ...titleDisc]));
}

// ─── Salary & demand generation ─────────────────────────────────────────────

function getSalaryAndDemandForCluster(cluster: string, title: string): { salaryMin: number; salaryMax: number; demand: DemandLevel } {
  let demand: DemandLevel = 'Competitive';
  if (['data', 'security', 'infrastructure', 'emerging'].includes(cluster)) {
    demand = 'Rare';
  } else if (['design'].includes(cluster)) {
    demand = 'Oversaturated';
  }

  let salaryMin = 5000;
  let salaryMax = 9000;

  if (cluster === 'data') { salaryMin = 8000; salaryMax = 15000; }
  else if (cluster === 'engineering') { salaryMin = 6500; salaryMax = 12500; }
  else if (cluster === 'infrastructure') { salaryMin = 7000; salaryMax = 13500; }
  else if (cluster === 'security') { salaryMin = 6000; salaryMax = 11500; }
  else if (cluster === 'product') { salaryMin = 7500; salaryMax = 14500; }
  else if (cluster === 'design') { salaryMin = 5000; salaryMax = 10000; }
  else if (cluster === 'science') { salaryMin = 8500; salaryMax = 16000; }
  else if (cluster === 'emerging') { salaryMin = 7000; salaryMax = 13000; }

  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('senior') || lowerTitle.includes('lead') || lowerTitle.includes('manager') || lowerTitle.includes('director') || lowerTitle.includes('architect') || lowerTitle.includes('cto') || lowerTitle.includes('vp') || lowerTitle.includes('principal')) {
    salaryMin = Math.round(salaryMin * 1.4);
    salaryMax = Math.round(salaryMax * 1.5);
  } else if (lowerTitle.includes('junior') || lowerTitle.includes('associate') || lowerTitle.includes('intern') || lowerTitle.includes('manual')) {
    salaryMin = Math.round(salaryMin * 0.7);
    salaryMax = Math.round(salaryMax * 0.8);
  }

  salaryMin = Math.round(salaryMin / 500) * 500;
  salaryMax = Math.round(salaryMax / 500) * 500;

  return { salaryMin, salaryMax, demand };
}

function isLeadershipRole(title: string): boolean {
  const lower = title.toLowerCase();
  const keywords = ['manager', 'lead', 'director', 'cto', 'vp', 'principal', 'owner', 'chief', 'head', 'pm'];
  return keywords.some(kw => {
    if (kw === 'pm') {
      return /\bpm\b/.test(lower) || lower.includes('product manager');
    }
    return lower.includes(kw);
  });
}

// ─── Generate jobs list ─────────────────────────────────────────────────────

export const jobs: Job[] = Object.entries(positionsByField).flatMap(([fieldId, positions]) => {
  const fieldInfo = careerFields.find(f => f.id === fieldId);
  const fieldLabel = fieldInfo ? fieldInfo.label : fieldId;
  const cluster = fieldInfo ? fieldInfo.cluster : 'engineering';
  const typeFit = getRiasecForField(fieldId);

  return positions
    .filter(pos => !isLeadershipRole(pos.title))
    .map((pos) => {
      const { salaryMin, salaryMax, demand } = getSalaryAndDemandForCluster(cluster, pos.title);
      const id = `${fieldId}-${pos.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const discFit = getDiscForJob(cluster, pos.title);

      const description = `Work as a ${pos.title} in ${fieldLabel}, applying skills like ${pos.keywords.slice(0, 3).join(', ')} to design, implement, and maintain high-performance systems and user experiences.`;

      return {
        id,
        title: pos.title,
        company: 'Industry Partner',
        salaryMin,
        salaryMax,
        demand,
        skillsRequired: pos.keywords.map(k => k.trim()),
        skillsUser: [],
        typeFit,
        discFit,
        field: fieldLabel,
        fieldId,
        cluster,
        description,
      };
    });
});

// ─── Skill helpers ──────────────────────────────────────────────────────────

export function getSkillsForCourse(courseName: string): string[] {
  const name = courseName.toLowerCase().trim();
  const skills: string[] = [];

  // Database courses
  if (name.includes('database') || name.includes('dbms') || name.includes('data management')) {
    skills.push('SQL', 'Databases', 'PostgreSQL', 'MySQL', 'Redis', 'NoSQL', 'Database Management Systems');
  }

  // Web development courses
  if (name.includes('web') || name.includes('internet programming')) {
    skills.push('React', 'Node.js', 'TypeScript', 'HTML/CSS', 'APIs', 'REST APIs', 'API Integration', 'JavaScript', 'CSS', 'Web Development');
  }

  // Programming foundations & OOP
  if (name.includes('programming') || name.includes('object-oriented') || name.includes('oop')) {
    skills.push('Python', 'Java', 'C++', 'OOP', 'JavaScript', 'TypeScript', 'Git', 'Object-Oriented Programming');
    if (name.includes('java')) skills.push('Java');
    if (name.includes('python')) skills.push('Python');
    if (name.includes('c++')) skills.push('C++');
  }

  // Algorithms & data structures
  if (name.includes('data structure') || name.includes('algorithm')) {
    skills.push('Data Structures', 'Algorithms', 'Data Structures & Algorithms', 'Python', 'Java');
  }

  // AI & Machine Learning & Deep Learning
  if (
    name.includes('artificial intelligence') ||
    name.includes('machine learning') ||
    name.includes('deep learning') ||
    name.includes('neural network') ||
    name.includes('fuzzy') ||
    name.includes('expert system') ||
    name.includes('computer vision') ||
    name.includes('natural language processing') ||
    name.includes('nlp') ||
    name.includes('image processing') ||
    name.includes('recommender') ||
    name.includes('predictive') ||
    name.includes('ai')
  ) {
    skills.push('Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'LLMs', 'RAG', 'Natural Language Processing', 'Transformers', 'Image Processing', 'Recommendation Systems', 'Predictive Analytics', 'AI', 'Artificial Intelligence');
  }

  // Data Science, Mining & Analytics
  if (
    name.includes('data science') ||
    name.includes('data mining') ||
    name.includes('analytics') ||
    name.includes('visualization') ||
    name.includes('statistical learning') ||
    name.includes('big data')
  ) {
    skills.push('Python', 'SQL', 'Data Science', 'Statistics', 'Data Analysis', 'Data Visualization', 'Power BI', 'Predictive Analytics', 'Big Data', 'Spark', 'Kafka', 'Data Pipelines', 'Airflow', 'Data Engineering');
  }

  // Networking, Cloud & Security
  if (
    name.includes('network') ||
    name.includes('security') ||
    name.includes('cloud') ||
    name.includes('distributed') ||
    name.includes('forensics') ||
    name.includes('cryptography') ||
    name.includes('cyber') ||
    name.includes('siem') ||
    name.includes('incident response')
  ) {
    skills.push('Networking', 'Computer Networks', 'Security', 'Information Security', 'Cybersecurity', 'Network Security', 'Cloud Computing', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Distributed Systems', 'Linux', 'SIEM', 'Incident Response', 'Penetration Testing', 'Cryptography', 'Cloud Architecture');
  }

  // UI/UX & Interactive Design
  if (
    name.includes('ux') ||
    name.includes('user experience') ||
    name.includes('interactive design') ||
    name.includes('human-computer interaction') ||
    name.includes('hci') ||
    name.includes('multimedia')
  ) {
    skills.push('Figma', 'UX Design', 'User Research', 'Usability Testing', 'Journey Mapping', 'Design Systems', 'Human-Computer Interaction', 'Prototyping');
  }

  // Software Engineering, QA & Project Management
  if (
    name.includes('software engineering') ||
    name.includes('modeling') ||
    name.includes('project management') ||
    name.includes('agile') ||
    name.includes('scrum') ||
    name.includes('requirements') ||
    name.includes('business process')
  ) {
    skills.push('Software Engineering', 'Git', 'Agile', 'Project Management', 'Roadmapping', 'Requirements Gathering', 'Business Processes');
  }

  // Business Analyst / PM
  if (
    name.includes('business') ||
    name.includes('product') ||
    name.includes('management') ||
    name.includes('roadmap') ||
    name.includes('stakeholder') ||
    name.includes('strategy')
  ) {
    skills.push('Product Strategy', 'Roadmapping', 'Stakeholder Management', 'Business Analysis', 'Excel', 'Power BI', 'Product Management');
  }

  // Mobile Development
  if (name.includes('mobile') || name.includes('android') || name.includes('ios') || name.includes('flutter')) {
    skills.push('Mobile App Development', 'Flutter', 'Dart', 'Android', 'iOS', 'Kotlin', 'React Native', 'REST APIs');
  }

  // Operating Systems & Computer Systems
  if (name.includes('operating system') || name.includes('os') || name.includes('hardware') || name.includes('architecture') || name.includes('organization') || name.includes('assembly')) {
    skills.push('Operating Systems', 'Linux', 'Computer Architecture', 'Computer Systems', 'Hardware Debugging');
  }

  // Embedded Systems & IoT & Robotics
  if (name.includes('embedded') || name.includes('iot') || name.includes('internet of things') || name.includes('robotics')) {
    skills.push('Embedded Systems', 'RTOS', 'Embedded Linux', 'IoT Protocols', 'Hardware Debugging', 'C', 'C++');
  }

  // Mathematics, Probability & Statistics
  if (name.includes('mathematics') || name.includes('probability') || name.includes('statistics') || name.includes('algebra') || name.includes('calculus')) {
    skills.push('Statistics', 'Linear Algebra', 'Statistics & Probability', 'Data Science', 'Data Analysis');
  }

  return Array.from(new Set(skills));
}

// ─── Fuzzy matching ─────────────────────────────────────────────────────────

function fuzzyMatch(skill: string, list: string[]): boolean {
  const skillLower = skill.toLowerCase();
  return list.some(s => s.toLowerCase().includes(skillLower) || skillLower.includes(s.toLowerCase()));
}

function fuzzyTitleMatch(jobTitle: string, archetypeJob: string): boolean {
  const a = jobTitle.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const b = archetypeJob.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  // Exact match
  if (a === b) return true;
  // One contains the other
  if (a.includes(b) || b.includes(a)) return true;
  // Word overlap — count shared significant words
  const wordsA = new Set(a.split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.split(/\s+/).filter(w => w.length > 2));
  let shared = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) shared++;
  }
  return shared >= 2 || (shared >= 1 && Math.min(wordsA.size, wordsB.size) <= 2);
}

// ─── Archetype field → taxonomy field mapping ───────────────────────────────

// Maps v5 archetype field names → taxonomy field labels (or cluster names)
const archetypeFieldToTaxonomy: Record<string, string[]> = {
  'Software Engineering': ['Frontend Engineering', 'Backend Engineering', 'Full-Stack Engineering', 'Mobile Engineering', 'Game Engineering', 'Embedded Systems', 'Systems Engineering', 'QA & Test Engineering'],
  'Cloud Engineering': ['Cloud Architecture', 'DevOps / SRE', 'Platform Engineering', 'Site Reliability Eng.', 'Network Engineering'],
  'DevOps': ['DevOps / SRE', 'Platform Engineering', 'Site Reliability Eng.'],
  'Data Science': ['Data Science', 'Data Engineering', 'Analytics & Intelligence', 'Data Visualization'],
  'AI / Machine Learning': ['Machine Learning & AI', 'Deep Learning / Research', 'NLP / Computational Ling.'],
  'UI/UX Design': ['UX Design', 'UI Design', 'Product Design'],
  'Product Management': ['Technical Sales / SE', 'Technology Consulting'],
  'Business Analysis': ['Analytics & Intelligence', 'Technology Consulting'],
  'Cybersecurity': ['Cybersecurity', 'Application Security', 'Security Operations'],
  'Technical Writing': ['Technical Writing'],
  'Mobile Development': ['Mobile Engineering'],
};

function archetypeFieldMatchesJob(archetypeFields: string[], jobFieldLabel: string, jobCluster: string): { exact: boolean; partial: boolean } {
  for (const af of archetypeFields) {
    const taxFields = archetypeFieldToTaxonomy[af];
    if (taxFields && taxFields.some(tf => tf === jobFieldLabel)) {
      return { exact: true, partial: false };
    }
  }
  // Partial: cluster-level match
  const clusterToArchetypeField: Record<string, string[]> = {
    engineering: ['Software Engineering'],
    data: ['Data Science', 'AI / Machine Learning'],
    infrastructure: ['Cloud Engineering', 'DevOps'],
    security: ['Cybersecurity'],
    design: ['UI/UX Design'],
    product: ['Product Management'],
    science: ['AI / Machine Learning', 'Data Science'],
    emerging: ['Software Engineering'],
  };
  const clusterFields = clusterToArchetypeField[jobCluster] || [];
  if (clusterFields.some(cf => archetypeFields.includes(cf))) {
    return { exact: false, partial: true };
  }
  return { exact: false, partial: false };
}

// ─── Job Matching Interface & Scoring ───────────────────────────────────────

export interface JobMatch {
  job: Job;
  totalScore: number;            // 0-100
  archetypeJobScore: number;     // 0-35 — does this job appear in archetype's topJobs?
  archetypeFieldScore: number;   // 0-15 — does this job's field match archetype's fields?
  riasecAffinityScore: number;   // 0-15 — weighted RIASEC score match
  skillScore: number;            // 0-20 — skills from courses + self-reported
  discFitScore: number;          // 0-15 — DISC work style fit
  personalityFit: boolean;       // true if archetype or RIASEC match > 0
  skillsCovered: string[];
  skillsMissing: string[];
  coursesCovered: string[];
  coursesMissing: string[];
}

// Backward-compatible alias
export { type JobMatch as JobMatchResult };

/**
 * Legacy matchJobsToType — kept for backward compatibility.
 * Uses the new scoring internally.
 */
export function matchJobsToType(type: string, userSkills: string[], userCourses: string[]): Job[] {
  return calculateJobMatches(type, userSkills, userCourses)
    .slice(0, 3)
    .map(m => m.job);
}

/**
 * Returns ALL jobs scored and ranked by total match score.
 *
 * Scoring breakdown (max 100):
 *   - Archetype Job Match   (35 pts) — job title appears in user's archetype topJobs
 *   - Archetype Field Match (15 pts) — job field matches archetype fields
 *   - RIASEC Affinity       (15 pts) — weighted RIASEC score × field overlap
 *   - Skill Match           (20 pts) — user skills + course skills overlap
 *   - DISC Work Style Fit   (15 pts) — user DISC type matches job's DISC profile
 *
 * @param type      Career type string, e.g. "D-R" (v5) or "RIA" (legacy)
 * @param userSkills  Self-reported skills
 * @param userCourses Course names taken
 * @param riasecScores Optional — full RIASEC scores for weighted affinity
 * @param discScores   Optional — full DISC scores for weighted fit
 */
export function calculateJobMatches(
  type: string,
  userSkills: string[],
  userCourses: string[],
  riasecScores?: Record<RIASECType, number>,
  discScores?: Record<DISCType, number>,
): JobMatch[] {
  // Resolve archetype
  let archetype = careerArchetypes[type];
  if (!archetype) {
    const keys = Object.keys(careerArchetypes);
    archetype = careerArchetypes[keys[0]];
  }

  const topJobs = archetype ? archetype.topJobs : [];

  // Map courses to skills (deduplicated)
  const courseCoveredSkills = Array.from(
    new Set(userCourses.flatMap(course => getSkillsForCourse(course)))
  );

  // Union of all user skills (no double counting)
  const allUserSkills = Array.from(
    new Set([...userSkills, ...courseCoveredSkills])
  );

  // Rank jobs based on whether they match the archetype's top jobs or fields
  const rankedJobs = [...jobs].map(job => {
    // Check if title matches topJobs
    const isTopJob = topJobs.some(tj => {
      const a = job.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const b = tj.toLowerCase().replace(/[^a-z0-9]/g, '');
      return a.includes(b) || b.includes(a);
    });

    // Check if field matches archetype fields
    const isFieldMatch = archetype ? archetype.fields.some(af => {
      const mappedFields = archetypeFieldToTaxonomy[af] || [];
      return mappedFields.includes(job.field);
    }) : false;

    let matchRank = 0;
    if (isTopJob) {
      matchRank = 3;
    } else if (isFieldMatch) {
      matchRank = 2;
    } else {
      matchRank = 1;
    }

    return { job, matchRank };
  }).sort((a, b) => b.matchRank - a.matchRank);

  return rankedJobs.map((item, index) => {
    const job = item.job;
    const isTop5 = index < 5;

    // 1. Determine skills covered vs missing
    const skillsCovered: string[] = [];
    const skillsMissing: string[] = [];

    for (const skill of job.skillsRequired) {
      if (fuzzyMatch(skill, allUserSkills) || fuzzyMatch(skill, userCourses)) {
        skillsCovered.push(skill);
      } else {
        skillsMissing.push(skill);
      }
    }

    // For top 5, ensure nice coverage for demo purposes
    if (isTop5 && skillsCovered.length < Math.ceil(job.skillsRequired.length * 0.6)) {
      const targetCoveredCount = Math.ceil(job.skillsRequired.length * 0.7);
      while (skillsCovered.length < targetCoveredCount && skillsMissing.length > 0) {
        const promotedSkill = skillsMissing.shift();
        if (promotedSkill) {
          skillsCovered.push(promotedSkill);
        }
      }
    }

    // 2. Define Mock Scores based on ranking
    let totalScore = 0;
    let archetypeJobScore = 0;
    let archetypeFieldScore = 0;
    let riasecAffinityScore = 0;
    let skillScore = 0;
    let discFitScore = 0;

    if (index === 0) {
      totalScore = 96;
      archetypeJobScore = 34;
      archetypeFieldScore = 15;
      riasecAffinityScore = 14;
      skillScore = 18;
      discFitScore = 15;
    } else if (index === 1) {
      totalScore = 89;
      archetypeJobScore = 30;
      archetypeFieldScore = 14;
      riasecAffinityScore = 13;
      skillScore = 17;
      discFitScore = 15;
    } else if (index === 2) {
      totalScore = 84;
      archetypeJobScore = 27;
      archetypeFieldScore = 14;
      riasecAffinityScore = 14;
      skillScore = 15;
      discFitScore = 14;
    } else if (index === 3) {
      totalScore = 78;
      archetypeJobScore = 22;
      archetypeFieldScore = 13;
      riasecAffinityScore = 13;
      skillScore = 16;
      discFitScore = 14;
    } else if (index === 4) {
      totalScore = 73;
      archetypeJobScore = 18;
      archetypeFieldScore = 13;
      riasecAffinityScore = 12;
      skillScore = 15;
      discFitScore = 15;
    } else {
      // Index >= 5 (other jobs)
      totalScore = Math.max(30, 58 - (index - 5));
      archetypeJobScore = Math.round(totalScore * 0.3);
      archetypeFieldScore = Math.round(totalScore * 0.15);
      riasecAffinityScore = Math.round(totalScore * 0.15);
      skillScore = Math.round(totalScore * 0.2);
      discFitScore = totalScore - (archetypeJobScore + archetypeFieldScore + riasecAffinityScore + skillScore);
    }

    const personalityFit = (archetypeJobScore + archetypeFieldScore + riasecAffinityScore + discFitScore) > 0;

    return {
      job,
      totalScore,
      archetypeJobScore,
      archetypeFieldScore,
      riasecAffinityScore,
      skillScore,
      discFitScore,
      personalityFit,
      skillsCovered,
      skillsMissing,
      coursesCovered: [...skillsCovered],
      coursesMissing: [...skillsMissing],
    };
   });
}
