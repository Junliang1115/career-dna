export interface MockCandidate {
  id: string;
  name: string;
  avatar: string; // initials
  mbti: string;
  university: string;
  yearsExp: number;
  topSkills: string[];
  coursesCovered: number;
  totalCourses: number;
  softSkillScore: number;   // 0-100
  technicalSkillScore: number; // 0-100
  overallScore: number;      // 0-100 composite match
  vector: [number, number]; // x, y position in 2D space
}

export interface MockJobDescription {
  id: string;
  title: string;
  company: string;
  industry: string;
  focusSoftSkills: boolean; // if true, weight soft skills higher
  focusTechnical: boolean;  // if true, weight technical higher
  vector: [number, number]; // center position
}

// Generate stable pseudo-random positions
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const rand = seededRandom(42);

function randBetween(min: number, max: number, r: () => number): number {
  return min + r() * (max - min);
}

// MBTI to vector position (personality dimensions)
const mbtiPositions: Record<string, [number, number]> = {
  'INTJ': [-0.8, 0.6], 'INTP': [-0.9, 0.3], 'ENTJ': [-0.6, 0.8],
  'ENTP': [-0.5, 0.7], 'INFJ': [0.3, 0.8],  'INFP': [0.4, 0.6],
  'ENFJ': [0.5, 0.9],  'ENFP': [0.6, 0.7], 'ISTJ': [-0.7, -0.3],
  'ISFJ': [0.2, -0.5], 'ESTJ': [-0.4, -0.4],'ESFJ': [0.5, -0.3],
  'ISTP': [-0.6, 0.1], 'ISFP': [0.3, -0.1], 'ESTP': [-0.3, 0.2],
  'ESFP': [0.5, 0.1],
};

function mbtiToVector(mbti: string): [number, number] {
  return mbtiPositions[mbti] ?? [randBetween(-0.8, 0.8, rand), randBetween(-0.5, 0.8, rand)];
}

// Job description vector (employer's ideal candidate)
export const mockJob: MockJobDescription = {
  id: 'jd-1',
  title: 'Full Stack Engineer',
  company: 'TechCorp Malaysia',
  industry: 'Fintech',
  focusSoftSkills: false,
  focusTechnical: true,
  vector: [0, 0], // center of map
};

// Realistic mock candidates clustered around the job vector with variation
export const mockCandidates: MockCandidate[] = [
  {
    id: 'c1', name: 'Alicia Tan', avatar: 'AT', mbti: 'INTP', university: 'UM',
    yearsExp: 3, topSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    coursesCovered: 18, totalCourses: 24, softSkillScore: 55, technicalSkillScore: 92, overallScore: 94,
    vector: [-0.15, 0.18],
  },
  {
    id: 'c2', name: 'Wei Kit Leong', avatar: 'WL', mbti: 'ENTP', university: 'USM',
    yearsExp: 4, topSkills: ['Python', 'FastAPI', 'React', 'AWS', 'Redis'],
    coursesCovered: 20, totalCourses: 24, softSkillScore: 70, technicalSkillScore: 88, overallScore: 91,
    vector: [-0.22, 0.32],
  },
  {
    id: 'c3', name: 'Nadia Rahman', avatar: 'NR', mbti: 'INFJ', university: 'UPM',
    yearsExp: 2, topSkills: ['Vue.js', 'Node.js', 'MongoDB', 'Figma'],
    coursesCovered: 15, totalCourses: 24, softSkillScore: 85, technicalSkillScore: 72, overallScore: 82,
    vector: [0.28, 0.45],
  },
  {
    id: 'c4', name: 'Ravi Kumar', avatar: 'RK', mbti: 'ISTP', university: 'UTM',
    yearsExp: 5, topSkills: ['Java', 'Spring Boot', 'Kubernetes', 'PostgreSQL', 'GraphQL'],
    coursesCovered: 22, totalCourses: 24, softSkillScore: 48, technicalSkillScore: 95, overallScore: 89,
    vector: [-0.38, 0.12],
  },
  {
    id: 'c5', name: 'Sophie Chuah', avatar: 'SC', mbti: 'ENFP', university: 'Sunway',
    yearsExp: 1, topSkills: ['React', 'CSS', 'Figma', 'JavaScript'],
    coursesCovered: 12, totalCourses: 24, softSkillScore: 90, technicalSkillScore: 58, overallScore: 68,
    vector: [0.52, 0.15],
  },
  {
    id: 'c6', name: 'Jason Phoon', avatar: 'JP', mbti: 'ENTJ', university: 'UM',
    yearsExp: 6, topSkills: ['Go', 'gRPC', 'AWS', 'Terraform', 'Python'],
    coursesCovered: 21, totalCourses: 24, softSkillScore: 62, technicalSkillScore: 97, overallScore: 93,
    vector: [-0.28, 0.08],
  },
  {
    id: 'c7', name: 'Mei Ling Chan', avatar: 'MC', mbti: 'ISFJ', university: 'Taylor\'s',
    yearsExp: 2, topSkills: ['PHP', 'Laravel', 'MySQL', 'Vue.js'],
    coursesCovered: 14, totalCourses: 24, softSkillScore: 78, technicalSkillScore: 65, overallScore: 71,
    vector: [0.18, -0.28],
  },
  {
    id: 'c8', name: 'Arif Zulkifli', avatar: 'AZ', mbti: 'INTJ', university: 'UKM',
    yearsExp: 4, topSkills: ['Rust', 'WebAssembly', 'C++', 'Linux', 'SQL'],
    coursesCovered: 19, totalCourses: 24, softSkillScore: 52, technicalSkillScore: 91, overallScore: 87,
    vector: [-0.45, 0.42],
  },
  {
    id: 'c9', name: 'Priya Sharma', avatar: 'PS', mbti: 'ENFJ', university: 'UM',
    yearsExp: 3, topSkills: ['React', 'TypeScript', 'GraphQL', 'Storybook'],
    coursesCovered: 16, totalCourses: 24, softSkillScore: 88, technicalSkillScore: 80, overallScore: 84,
    vector: [0.12, 0.55],
  },
  {
    id: 'c10', name: 'Darren Foo', avatar: 'DF', mbti: 'ISTJ', university: 'UTM',
    yearsExp: 7, topSkills: ['C#', '.NET', 'Azure', 'SQL Server', 'Docker'],
    coursesCovered: 20, totalCourses: 24, softSkillScore: 45, technicalSkillScore: 85, overallScore: 78,
    vector: [-0.62, -0.18],
  },
  {
    id: 'c11', name: 'Ying Chen', avatar: 'YC', mbti: 'INTP', university: 'Sunway',
    yearsExp: 2, topSkills: ['Python', 'Django', 'React', 'PostgreSQL', 'Celery'],
    coursesCovered: 17, totalCourses: 24, softSkillScore: 60, technicalSkillScore: 83, overallScore: 86,
    vector: [-0.08, 0.38],
  },
  {
    id: 'c12', name: 'Hafiz Ali', avatar: 'HA', mbti: 'ESFP', university: 'USM',
    yearsExp: 1, topSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    coursesCovered: 10, totalCourses: 24, softSkillScore: 82, technicalSkillScore: 55, overallScore: 62,
    vector: [0.65, -0.05],
  },
  {
    id: 'c13', name: 'Lisa Wong', avatar: 'LW', mbti: 'ENTP', university: 'UPM',
    yearsExp: 4, topSkills: ['Next.js', 'Prisma', 'PostgreSQL', 'AWS', 'TypeScript'],
    coursesCovered: 19, totalCourses: 24, softSkillScore: 72, technicalSkillScore: 90, overallScore: 92,
    vector: [-0.18, 0.52],
  },
  {
    id: 'c14', name: 'Mohd Faiz', avatar: 'MF', mbti: 'ISFP', university: 'UM',
    yearsExp: 3, topSkills: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
    coursesCovered: 13, totalCourses: 24, softSkillScore: 75, technicalSkillScore: 70, overallScore: 74,
    vector: [0.35, 0.22],
  },
  {
    id: 'c15', name: 'Grace Lee', avatar: 'GL', mbti: 'ENFP', university: 'Taylor\'s',
    yearsExp: 5, topSkills: ['Vue.js', 'Node.js', 'Python', 'ML', 'TensorFlow'],
    coursesCovered: 21, totalCourses: 24, softSkillScore: 80, technicalSkillScore: 86, overallScore: 88,
    vector: [0.05, 0.62],
  },
  {
    id: 'c16', name: 'Ben Tan', avatar: 'BT', mbti: 'INTJ', university: 'UTM',
    yearsExp: 6, topSkills: ['Java', 'Spring', 'Kafka', 'Kubernetes', 'PostgreSQL'],
    coursesCovered: 23, totalCourses: 24, softSkillScore: 50, technicalSkillScore: 96, overallScore: 91,
    vector: [-0.52, 0.22],
  },
  {
    id: 'c17', name: 'Aina Hasan', avatar: 'AH', mbti: 'INFP', university: 'UKM',
    yearsExp: 1, topSkills: ['Figma', 'CSS', 'HTML', 'JavaScript'],
    coursesCovered: 9, totalCourses: 24, softSkillScore: 85, technicalSkillScore: 48, overallScore: 58,
    vector: [0.72, 0.38],
  },
  {
    id: 'c18', name: 'Caleb Lim', avatar: 'CL', mbti: 'ESTP', university: 'UM',
    yearsExp: 4, topSkills: ['React Native', 'TypeScript', 'GraphQL', 'Firebase'],
    coursesCovered: 17, totalCourses: 24, softSkillScore: 68, technicalSkillScore: 84, overallScore: 85,
    vector: [-0.02, 0.28],
  },
  {
    id: 'c19', name: 'Danial Nasir', avatar: 'DN', mbti: 'ENTJ', university: 'USM',
    yearsExp: 3, topSkills: ['AWS', 'Docker', 'Python', 'Flask', 'SQL'],
    coursesCovered: 16, totalCourses: 24, softSkillScore: 58, technicalSkillScore: 81, overallScore: 80,
    vector: [-0.32, 0.02],
  },
  {
    id: 'c20', name: 'Siti Aisyah', avatar: 'SA', mbti: 'ISFJ', university: 'UPM',
    yearsExp: 2, topSkills: ['PHP', 'CodeIgniter', 'MySQL', 'jQuery'],
    coursesCovered: 11, totalCourses: 24, softSkillScore: 76, technicalSkillScore: 60, overallScore: 65,
    vector: [0.42, -0.12],
  },
];

// Sort by overall score (best match first)
export const topCandidates = [...mockCandidates]
  .sort((a, b) => b.overallScore - a.overallScore)
  .slice(0, 10);

export const TOP_N = 10;
export const CANVAS_SIZE = 600;
export const CENTER = CANVAS_SIZE / 2;
export const SCALE = 240; // pixels per unit
