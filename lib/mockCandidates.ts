export interface MockCandidate {
  id: string;
  name: string;
  avatar: string; // initials
  mbti: string;
  university: string;
  cgpa: number;           // 0.0 - 4.0
  yearsExp: number;
  topSkills: string[];
  skillLevels: Record<string, number>; // skill name -> proficiency 1-10
  coursesCovered: number;
  totalCourses: number;
  softSkillScore: number;   // 0-100
  technicalSkillScore: number; // 0-100
  overallScore: number;      // 0-100 composite match
  vector: [number, number]; // x, y position in 2D space
  projects: Array<{ name: string; description: string; tech: string[] }>;
  workExperience: Array<{ role: string; company: string; duration: string; description?: string }>;
  certifications: string[];
}

export interface MockJobDescription {
  id: string;
  title: string;
  field: string;
  focusSoftSkills: boolean; // if true, weight soft skills higher
  focusTechnical: boolean;  // if true, weight technical higher
  vector: [number, number]; // center position
  description: string;
  requiredSkills: string[];
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

const mbtiPositions: Record<string, [number, number]> = {
  'INTJ': [-0.8, 0.6], 'INTP': [-0.9, 0.3], 'ENTJ': [-0.6, 0.8],
  'ENTP': [-0.5, 0.7], 'INFJ': [0.3, 0.8],  'INFP': [0.4, 0.6],
  'ENFJ': [0.5, 0.9],  'ENFP': [0.6, 0.7], 'ISTJ': [-0.7, -0.3],
  'ISFJ': [0.2, -0.5], 'ESTJ': [-0.4, -0.4],'ESFJ': [0.5, -0.3],
  'ISTP': [-0.6, 0.1], 'ISFP': [0.3, -0.1], 'ESTP': [-0.3, 0.2],
  'ESFP': [0.5, 0.1],
};

export const mockJobs: MockJobDescription[] = [
  {
    id: 'jd-1',
    title: 'Full Stack Engineer',
    field: 'Fintech',
    focusSoftSkills: false,
    focusTechnical: true,
    vector: [0, 0],
    description: "We are looking for a Full Stack Engineer with experience in React, Node.js, TypeScript, PostgreSQL, and cloud infrastructure (AWS or GCP). Strong problem-solving skills and ability to work in an agile team.",
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'GCP', 'JavaScript']
  },
  {
    id: 'jd-2',
    title: 'Data Scientist / ML Engineer',
    field: 'Data & AI',
    focusSoftSkills: false,
    focusTechnical: true,
    vector: [0, 0],
    description: "Looking for a Data Scientist or Machine Learning Engineer proficient in Python, SQL, TensorFlow, and PyTorch. Experience in predictive modeling, data scraping, pipelines, and building analytics dashboards is required.",
    requiredSkills: ['Python', 'SQL', 'TensorFlow', 'PyTorch', 'ML', 'Django', 'PostgreSQL', 'Celery']
  },
  {
    id: 'jd-3',
    title: 'Mobile DevOps Engineer',
    field: 'Telecommunications',
    focusSoftSkills: true,
    focusTechnical: false,
    vector: [0, 0],
    description: "Hiring a Mobile DevOps Engineer skilled in Flutter, Dart, Firebase, Docker, and AWS. Experience in setting up CI/CD pipelines, automation, and orchestrating mobile app releases is essential.",
    requiredSkills: ['Flutter', 'Dart', 'Firebase', 'Docker', 'AWS', 'gRPC', 'Terraform', 'Linux']
  },
  {
    id: 'jd-4',
    title: 'UI/UX Product Designer',
    field: 'EdTech',
    focusSoftSkills: true,
    focusTechnical: false,
    vector: [0, 0],
    description: "Seeking a UI/UX Designer to create user-centric designs. Proficiency in Figma, HTML, CSS, user research, wireframing, and interactive prototyping is required.",
    requiredSkills: ['Figma', 'CSS', 'HTML', 'JavaScript', 'Vue.js', 'React', 'Storybook']
  }
];

export const mockJob: MockJobDescription = mockJobs[0];

export const mockCandidates: MockCandidate[] = [
  {
    id: 'c1', name: 'Alicia Tan', avatar: 'AT', mbti: 'INTP', university: 'UM', cgpa: 3.82,
    yearsExp: 3, topSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    skillLevels: { React: 9, 'Node.js': 8, TypeScript: 9, PostgreSQL: 7, Docker: 8 },
    coursesCovered: 18, totalCourses: 24, softSkillScore: 55, technicalSkillScore: 92, overallScore: 94,
    vector: [-0.15, 0.18],
    projects: [
      { name: "DevConnect Platform", description: "A developer networking portal with live chats, repository sync, and team matching.", tech: ["React", "TypeScript", "Node.js", "WebSockets"] },
      { name: "Microservice Gateway", description: "Custom API gateway for auth and request routing under high traffic.", tech: ["Node.js", "Docker", "Redis"] }
    ],
    workExperience: [
      { role: "Frontend Developer", company: "Axiata Digital", duration: "2024 - Present", description: "Built responsive dashboards using Next.js and optimized page load times by 40%." },
      { role: "Software Intern", company: "Silverlake Axis", duration: "2023 - 2024", description: "Assisted in database migrations and backend API integration." }
    ],
    certifications: ["AWS Certified Solutions Architect", "React Professional Certification"]
  },
  {
    id: 'c2', name: 'Wei Kit Leong', avatar: 'WL', mbti: 'ENTP', university: 'USM', cgpa: 3.65,
    yearsExp: 4, topSkills: ['Python', 'FastAPI', 'React', 'AWS', 'Redis'],
    skillLevels: { Python: 9, FastAPI: 8, React: 7, AWS: 8, Redis: 7 },
    coursesCovered: 20, totalCourses: 24, softSkillScore: 70, technicalSkillScore: 88, overallScore: 91,
    vector: [-0.22, 0.32],
    projects: [
      { name: "Smart Inventory Tracker", description: "Automated warehouse inventory management using FastAPI and SQLite.", tech: ["Python", "FastAPI", "SQLite"] },
      { name: "Cloud Sync Engine", description: "Multi-cloud file sync service deployed with Terraform.", tech: ["Python", "AWS", "Terraform"] }
    ],
    workExperience: [
      { role: "Backend Developer", company: "Carsome", duration: "2022 - Present", description: "Designed scalable RESTful APIs handling 50k daily active users." }
    ],
    certifications: ["AWS Certified Developer - Associate", "Certified Kubernetes Administrator (CKA)"]
  },
  {
    id: 'c3', name: 'Nadia Rahman', avatar: 'NR', mbti: 'INFJ', university: 'UPM', cgpa: 3.71,
    yearsExp: 2, topSkills: ['Vue.js', 'Node.js', 'MongoDB', 'Figma'],
    skillLevels: { 'Vue.js': 8, 'Node.js': 7, MongoDB: 7, Figma: 9 },
    coursesCovered: 15, totalCourses: 24, softSkillScore: 85, technicalSkillScore: 72, overallScore: 82,
    vector: [0.28, 0.45],
    projects: [
      { name: "HealthCare Mobile App", description: "A patient scheduling mobile app with real-time notifications.", tech: ["Vue.js", "Node.js", "MongoDB", "Figma"] }
    ],
    workExperience: [
      { role: "UI/UX & Frontend Developer", company: "Mindvalley", duration: "2024 - Present", description: "Designed user interfaces and implemented frontend modules in Vue.js." }
    ],
    certifications: ["Google UX Design Certificate", "Vue.js Certified Developer"]
  },
  {
    id: 'c4', name: 'Ravi Kumar', avatar: 'RK', mbti: 'ISTP', university: 'UTM', cgpa: 3.90,
    yearsExp: 5, topSkills: ['Java', 'Spring Boot', 'Kubernetes', 'PostgreSQL', 'GraphQL'],
    skillLevels: { Java: 10, 'Spring Boot': 9, Kubernetes: 8, PostgreSQL: 8, GraphQL: 7 },
    coursesCovered: 22, totalCourses: 24, softSkillScore: 48, technicalSkillScore: 95, overallScore: 89,
    vector: [-0.38, 0.12],
    projects: [
      { name: "Finance Ledger Microservice", description: "High-throughput financial transactions processing ledger with spring boot.", tech: ["Java", "Spring Boot", "PostgreSQL", "Kafka"] }
    ],
    workExperience: [
      { role: "Senior Java Engineer", company: "Maybank", duration: "2021 - Present", description: "Maintained core banking systems and scaled ledger microservices." }
    ],
    certifications: ["Oracle Certified Professional Java SE 17", "Spring Professional Cert"]
  },
  {
    id: 'c5', name: 'Sophie Chuah', avatar: 'SC', mbti: 'ENFP', university: 'Sunway', cgpa: 3.45,
    yearsExp: 1, topSkills: ['React', 'CSS', 'Figma', 'JavaScript'],
    skillLevels: { React: 6, CSS: 8, Figma: 9, JavaScript: 7 },
    coursesCovered: 12, totalCourses: 24, softSkillScore: 90, technicalSkillScore: 58, overallScore: 68,
    vector: [0.52, 0.15],
    projects: [
      { name: "Portfolio Website", description: "Beautiful interactive personal portfolio website showcasing designs.", tech: ["React", "CSS", "Figma"] }
    ],
    workExperience: [
      { role: "Junior Frontend Intern", company: "Involve Asia", duration: "2025 - Present", description: "Built landing pages and newsletter templates." }
    ],
    certifications: ["Interaction Design Foundation (IxDF) Cert"]
  },
  {
    id: 'c6', name: 'Jason Phoon', avatar: 'JP', mbti: 'ENTJ', university: 'UM', cgpa: 3.88,
    yearsExp: 6, topSkills: ['Go', 'gRPC', 'AWS', 'Terraform', 'Python'],
    skillLevels: { Go: 10, gRPC: 9, AWS: 9, Terraform: 9, Python: 8 },
    coursesCovered: 21, totalCourses: 24, softSkillScore: 62, technicalSkillScore: 97, overallScore: 93,
    vector: [-0.28, 0.08],
    projects: [
      { name: "Log Aggregator Daemon", description: "High-performance logging daemon built in Go, shipping logs to Elasticsearch.", tech: ["Go", "gRPC", "Docker"] }
    ],
    workExperience: [
      { role: "Cloud Platform Engineer", company: "Grab", duration: "2020 - Present", description: "Automated multi-region infrastructure provisioning using Terraform and AWS." }
    ],
    certifications: ["HashiCorp Certified Terraform Associate", "AWS Solutions Architect Professional"]
  },
  {
    id: 'c7', name: 'Mei Ling Chan', avatar: 'MC', mbti: 'ISFJ', university: 'Taylor\'s', cgpa: 3.55,
    yearsExp: 2, topSkills: ['PHP', 'Laravel', 'MySQL', 'Vue.js'],
    skillLevels: { PHP: 7, Laravel: 8, MySQL: 7, 'Vue.js': 6 },
    coursesCovered: 14, totalCourses: 24, softSkillScore: 78, technicalSkillScore: 65, overallScore: 71,
    vector: [0.18, -0.28],
    projects: [
      { name: "E-Commerce CMS", description: "A customizable content management system for retail shops.", tech: ["PHP", "Laravel", "MySQL"] }
    ],
    workExperience: [
      { role: "Full Stack Engineer", company: "Photobook Worldwide", duration: "2024 - Present", description: "Implemented payment gateway integrations and custom shopping cart." }
    ],
    certifications: ["Laravel Certified Developer"]
  },
  {
    id: 'c8', name: 'Arif Zulkifli', avatar: 'AZ', mbti: 'INTJ', university: 'UKM', cgpa: 3.78,
    yearsExp: 4, topSkills: ['Rust', 'WebAssembly', 'C++', 'Linux', 'SQL'],
    skillLevels: { Rust: 9, WebAssembly: 8, 'C++': 9, Linux: 8, SQL: 7 },
    coursesCovered: 19, totalCourses: 24, softSkillScore: 52, technicalSkillScore: 91, overallScore: 87,
    vector: [-0.45, 0.42],
    projects: [
      { name: "Game Engine WebGL", description: "A retro 2D physics game engine running in the browser.", tech: ["Rust", "WebAssembly", "C++"] }
    ],
    workExperience: [
      { role: "Systems Engineer", company: "Intel Malaysia", duration: "2022 - Present", description: "Worked on low-level firmware optimizations and testing." }
    ],
    certifications: ["Linux Foundation Certified System Administrator (LFCS)"]
  },
  {
    id: 'c9', name: 'Priya Sharma', avatar: 'PS', mbti: 'ENFJ', university: 'UM', cgpa: 3.74,
    yearsExp: 3, topSkills: ['React', 'TypeScript', 'GraphQL', 'Storybook'],
    skillLevels: { React: 8, TypeScript: 8, GraphQL: 7, Storybook: 7 },
    coursesCovered: 16, totalCourses: 24, softSkillScore: 88, technicalSkillScore: 80, overallScore: 84,
    vector: [0.12, 0.55],
    projects: [
      { name: "Team Planner Dashboard", description: "A visual collaborative planner with drag and drop capabilities.", tech: ["React", "TypeScript", "GraphQL"] }
    ],
    workExperience: [
      { role: "Frontend Engineer", company: "AirAsia SuperApp", duration: "2023 - Present", description: "Developed UI features and refactored state management to GraphQL." }
    ],
    certifications: ["React Advanced Practitioner"]
  },
  {
    id: 'c10', name: 'Darren Foo', avatar: 'DF', mbti: 'ISTJ', university: 'UTM', cgpa: 3.62,
    yearsExp: 7, topSkills: ['C#', '.NET', 'Azure', 'SQL Server', 'Docker'],
    skillLevels: { 'C#': 9, '.NET': 9, Azure: 8, 'SQL Server': 8, Docker: 7 },
    coursesCovered: 20, totalCourses: 24, softSkillScore: 45, technicalSkillScore: 85, overallScore: 78,
    vector: [-0.62, -0.18],
    projects: [
      { name: "Enterprise ERP System", description: "A robust ERP system with accounting and supply chain modules.", tech: ["C#", ".NET", "SQL Server"] }
    ],
    workExperience: [
      { role: "Software Architect", company: "Petronas", duration: "2019 - Present", description: "Led development of core enterprise inventory and resource management tools." }
    ],
    certifications: ["Microsoft Certified: Azure Solutions Architect Expert"]
  },
  {
    id: 'c11', name: 'Ying Chen', avatar: 'YC', mbti: 'INTP', university: 'Sunway', cgpa: 3.69,
    yearsExp: 2, topSkills: ['Python', 'Django', 'React', 'PostgreSQL', 'Celery'],
    skillLevels: { Python: 8, Django: 8, React: 6, PostgreSQL: 7, Celery: 7 },
    coursesCovered: 17, totalCourses: 24, softSkillScore: 60, technicalSkillScore: 83, overallScore: 86,
    vector: [-0.08, 0.38],
    projects: [
      { name: "Data Scraping & Analysis", description: "Automatic crawler for property prices with pandas visualizations.", tech: ["Python", "Django", "PostgreSQL"] }
    ],
    workExperience: [
      { role: "Data Engineer", company: "Shopee Malaysia", duration: "2023 - Present", description: "Built data ingestion pipelines and custom analytics dashboards." }
    ],
    certifications: ["Professional Data Engineer Certification"]
  },
  {
    id: 'c12', name: 'Hafiz Ali', avatar: 'HA', mbti: 'ESFP', university: 'USM', cgpa: 3.30,
    yearsExp: 1, topSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    skillLevels: { JavaScript: 7, React: 6, 'Node.js': 6, MongoDB: 5 },
    coursesCovered: 10, totalCourses: 24, softSkillScore: 82, technicalSkillScore: 55, overallScore: 62,
    vector: [0.65, -0.05],
    projects: [
      { name: "Social Chatroom", description: "Real-time chat app using socket.io.", tech: ["React", "Node.js", "MongoDB"] }
    ],
    workExperience: [
      { role: "Junior Web Developer", company: "Juris Technologies", duration: "2025 - Present", description: "Assisted in modernizing web forms and styling UI components." }
    ],
    certifications: ["Meta Front-End Developer Professional Certificate"]
  },
  {
    id: 'c13', name: 'Lisa Wong', avatar: 'LW', mbti: 'ENTP', university: 'UPM', cgpa: 3.80,
    yearsExp: 4, topSkills: ['Next.js', 'Prisma', 'PostgreSQL', 'AWS', 'TypeScript'],
    skillLevels: { 'Next.js': 9, Prisma: 8, PostgreSQL: 8, AWS: 8, TypeScript: 9 },
    coursesCovered: 19, totalCourses: 24, softSkillScore: 72, technicalSkillScore: 90, overallScore: 92,
    vector: [-0.18, 0.52],
    projects: [
      { name: "Booking & Reservation System", description: "SaaS platform for hotel reservations with Stripe payments.", tech: ["Next.js", "Prisma", "PostgreSQL"] }
    ],
    workExperience: [
      { role: "Full Stack Developer", company: "Fave Malaysia", duration: "2022 - Present", description: "Led migration from legacy PHP systems to Next.js and Prisma." }
    ],
    certifications: ["AWS Certified Cloud Practitioner"]
  },
  {
    id: 'c14', name: 'Mohd Faiz', avatar: 'MF', mbti: 'ISFP', university: 'UM', cgpa: 3.52,
    yearsExp: 3, topSkills: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
    skillLevels: { Flutter: 8, Dart: 8, Firebase: 7, 'REST APIs': 7 },
    coursesCovered: 13, totalCourses: 24, softSkillScore: 75, technicalSkillScore: 70, overallScore: 74,
    vector: [0.35, 0.22],
    projects: [
      { name: "RideSharing App UI", description: "Highly interactive mobile dashboard for a ridesharing client.", tech: ["Flutter", "Dart", "Firebase"] }
    ],
    workExperience: [
      { role: "Mobile Developer", company: "Boost", duration: "2023 - Present", description: "Developed cross-platform mobile features and integrated Firebase services." }
    ],
    certifications: ["Google Certified Associate Android Developer"]
  },
  {
    id: 'c15', name: 'Grace Lee', avatar: 'GL', mbti: 'ENFP', university: 'Taylor\'s', cgpa: 3.77,
    yearsExp: 5, topSkills: ['Vue.js', 'Node.js', 'Python', 'ML', 'TensorFlow'],
    skillLevels: { 'Vue.js': 7, 'Node.js': 7, Python: 9, ML: 8, TensorFlow: 8 },
    coursesCovered: 21, totalCourses: 24, softSkillScore: 80, technicalSkillScore: 86, overallScore: 88,
    vector: [0.05, 0.62],
    projects: [
      { name: "Image Classifier API", description: "REST API classifying product images with high confidence.", tech: ["Python", "TensorFlow", "Node.js"] }
    ],
    workExperience: [
      { role: "Junior AI Developer", company: "Aerodyne Group", duration: "2024 - Present", description: "Developed automated drone image classification scripts using TensorFlow." }
    ],
    certifications: ["Google Professional Machine Learning Engineer"]
  },
  {
    id: 'c16', name: 'Ben Tan', avatar: 'BT', mbti: 'INTJ', university: 'UTM', cgpa: 3.92,
    yearsExp: 6, topSkills: ['Java', 'Spring', 'Kafka', 'Kubernetes', 'PostgreSQL'],
    skillLevels: { Java: 9, Spring: 9, Kafka: 9, Kubernetes: 8, PostgreSQL: 8 },
    coursesCovered: 23, totalCourses: 24, softSkillScore: 50, technicalSkillScore: 96, overallScore: 91,
    vector: [-0.52, 0.22],
    projects: [
      { name: "Event-Sourced Order Processing", description: "Distributed order lifecycle manager processing 10k requests/sec.", tech: ["Java", "Kafka", "Kubernetes"] }
    ],
    workExperience: [
      { role: "Senior Engineer", company: "CIMB Bank", duration: "2020 - Present", description: "Designed event-driven messaging architectures and supervised deployment on Kubernetes." }
    ],
    certifications: ["Certified Kubernetes Developer (CKAD)"]
  },
  {
    id: 'c17', name: 'Aina Hasan', avatar: 'AH', mbti: 'INFP', university: 'UKM', cgpa: 3.41,
    yearsExp: 1, topSkills: ['Figma', 'CSS', 'HTML', 'JavaScript'],
    skillLevels: { Figma: 9, CSS: 8, HTML: 8, JavaScript: 6 },
    coursesCovered: 9, totalCourses: 24, softSkillScore: 85, technicalSkillScore: 48, overallScore: 58,
    vector: [0.72, 0.38],
    projects: [
      { name: "Design System UI Kit", description: "Reusable modular custom component library designed in Figma.", tech: ["Figma", "CSS", "HTML"] }
    ],
    workExperience: [
      { role: "UI/UX Designer", company: "Astro", duration: "2024 - Present", description: "Conducted user research and designed prototypes for media streaming apps." }
    ],
    certifications: ["Figma Certified Professional"]
  },
  {
    id: 'c18', name: 'Caleb Lim', avatar: 'CL', mbti: 'ESTP', university: 'UM', cgpa: 3.58,
    yearsExp: 4, topSkills: ['React Native', 'TypeScript', 'GraphQL', 'Firebase'],
    skillLevels: { 'React Native': 9, TypeScript: 8, GraphQL: 7, Firebase: 8 },
    coursesCovered: 17, totalCourses: 24, softSkillScore: 68, technicalSkillScore: 84, overallScore: 85,
    vector: [-0.02, 0.28],
    projects: [
      { name: "Gym Workout Planner", description: "Offline-first mobile app for logging sets, reps, and routines.", tech: ["React Native", "TypeScript", "Firebase"] }
    ],
    workExperience: [
      { role: "Mobile Software Engineer", company: "Maxis", duration: "2023 - Present", description: "Maintained consumer-facing apps and resolved memory leak issues." }
    ],
    certifications: ["Meta React Native Specialization"]
  },
  {
    id: 'c19', name: 'Danial Nasir', avatar: 'DN', mbti: 'ENTJ', university: 'USM', cgpa: 3.60,
    yearsExp: 3, topSkills: ['AWS', 'Docker', 'Python', 'Flask', 'SQL'],
    skillLevels: { AWS: 8, Docker: 8, Python: 8, Flask: 7, SQL: 7 },
    coursesCovered: 16, totalCourses: 24, softSkillScore: 58, technicalSkillScore: 81, overallScore: 80,
    vector: [-0.32, 0.02],
    projects: [
      { name: "Infrastructure monitoring agent", description: "Collects system health metrics and alerts to slack.", tech: ["Python", "Flask", "Docker"] }
    ],
    workExperience: [
      { role: "DevOps Associate", company: "TIME dotCom", duration: "2024 - Present", description: "Set up CI/CD pipelines and managed docker container orchestration." }
    ],
    certifications: ["AWS SysOps Administrator - Associate"]
  },
  {
    id: 'c20', name: 'Siti Aisyah', avatar: 'SA', mbti: 'ISFJ', university: 'UPM', cgpa: 3.38,
    yearsExp: 2, topSkills: ['PHP', 'CodeIgniter', 'MySQL', 'jQuery'],
    skillLevels: { PHP: 6, CodeIgniter: 7, MySQL: 7, jQuery: 6 },
    coursesCovered: 11, totalCourses: 24, softSkillScore: 76, technicalSkillScore: 60, overallScore: 65,
    vector: [0.42, -0.12],
    projects: [
      { name: "Internal Inventory Tracker", description: "Multi-role inventory ledger for logistics tracking.", tech: ["PHP", "CodeIgniter", "MySQL"] }
    ],
    workExperience: [
      { role: "Web Developer", company: "Pos Malaysia", duration: "2023 - Present", description: "Maintained legacy internal portal and updated visual interface." }
    ],
    certifications: ["Zend Certified PHP Engineer"]
  },
  {
    id: 'c21', name: 'Zhi Wei Tan', avatar: 'ZT', mbti: 'ISTP', university: 'UM', cgpa: 3.72,
    yearsExp: 3, topSkills: ['Flutter', 'Dart', 'Firebase', 'Terraform', 'Docker'],
    skillLevels: { Flutter: 9, Dart: 8, Firebase: 8, Terraform: 8, Docker: 8 },
    coursesCovered: 16, totalCourses: 24, softSkillScore: 78, technicalSkillScore: 92, overallScore: 89,
    vector: [0, 0],
    projects: [
      { name: "Boost Mobile Pay", description: "Cross-platform mobile payment app integrated with multi-tenant merchant dashboard.", tech: ["Flutter", "Dart", "Firebase"] }
    ],
    workExperience: [
      { role: "Mobile DevOps Specialist", company: "Axiata Digital", duration: "2023 - Present", description: "Optimized Flutter CI/CD pipelines and automated release management." }
    ],
    certifications: ["Terraform Associate Certification"]
  },
  {
    id: 'c22', name: 'Nurul Huda', avatar: 'NH', mbti: 'INTJ', university: 'UKM', cgpa: 3.95,
    yearsExp: 5, topSkills: ['Python', 'PyTorch', 'TensorFlow', 'SQL', 'ML'],
    skillLevels: { Python: 10, PyTorch: 9, TensorFlow: 9, SQL: 8, ML: 9 },
    coursesCovered: 22, totalCourses: 24, softSkillScore: 62, technicalSkillScore: 98, overallScore: 92,
    vector: [0, 0],
    projects: [
      { name: "Speech Recognition Engine", description: "Deep learning transformer models optimized for local dialect speech classification.", tech: ["Python", "PyTorch", "TensorFlow"] }
    ],
    workExperience: [
      { role: "Senior Machine Learning Architect", company: "AeroAnalytics", duration: "2021 - Present", description: "Built and scaled distributed predictive analytics engines handling large-scale data." }
    ],
    certifications: ["Google Cloud Certified Professional Data Engineer"]
  },
  {
    id: 'c23', name: 'Nicholas Lim', avatar: 'NL', mbti: 'ENFP', university: 'Sunway', cgpa: 3.50,
    yearsExp: 2, topSkills: ['Figma', 'CSS', 'HTML', 'Storybook', 'React'],
    skillLevels: { Figma: 9, CSS: 8, HTML: 8, Storybook: 7, React: 7 },
    coursesCovered: 14, totalCourses: 24, softSkillScore: 94, technicalSkillScore: 72, overallScore: 81,
    vector: [0, 0],
    projects: [
      { name: "PixelPerfect Component Library", description: "Storybook-driven visual system with themes and micro-interactions.", tech: ["Figma", "Storybook", "React"] }
    ],
    workExperience: [
      { role: "UI/UX & Product Designer", company: "Mindvalley", duration: "2024 - Present", description: "Designed user journeys, high-fidelity prototypes, and assets." }
    ],
    certifications: ["Interaction Design Foundation UX Certificate"]
  },
  {
    id: 'c24', name: 'Melissa Yeoh', avatar: 'MY', mbti: 'ENTJ', university: 'UM', cgpa: 3.91,
    yearsExp: 6, topSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
    skillLevels: { React: 10, 'Node.js': 9, TypeScript: 10, AWS: 9, PostgreSQL: 8 },
    coursesCovered: 21, totalCourses: 24, softSkillScore: 84, technicalSkillScore: 96, overallScore: 94,
    vector: [0, 0],
    projects: [
      { name: "Global Billing Service", description: "Transactional API processing millions of invoices with sub-second latency.", tech: ["Node.js", "TypeScript", "PostgreSQL", "AWS"] }
    ],
    workExperience: [
      { role: "Tech Lead", company: "Fave Malaysia", duration: "2020 - Present", description: "Designed and scaled service architectures, migrating database structures to PostgreSQL on AWS." }
    ],
    certifications: ["AWS Certified Solutions Architect - Professional"]
  },
  {
    id: 'c25', name: 'Farhan Syamil', avatar: 'FS', mbti: 'INFJ', university: 'UTM', cgpa: 3.66,
    yearsExp: 3, topSkills: ['Flutter', 'Dart', 'AWS', 'Terraform', 'Linux'],
    skillLevels: { Flutter: 8, Dart: 8, AWS: 8, Terraform: 8, Linux: 7 },
    coursesCovered: 15, totalCourses: 24, softSkillScore: 70, technicalSkillScore: 85, overallScore: 82,
    vector: [0, 0],
    projects: [
      { name: "Secure Mobile Vault", description: "High-security Flutter storage app integrated with AWS KMS.", tech: ["Flutter", "Dart", "AWS"] }
    ],
    workExperience: [
      { role: "DevOps Engineer", company: "Boost Telecom", duration: "2023 - Present", description: "Configured Terraform scripts and automated cloud resources for mobile backends." }
    ],
    certifications: ["AWS Certified Developer - Associate"]
  },
  {
    id: 'c26', name: 'Chloe Lim', avatar: 'CL', mbti: 'INTP', university: 'UPM', cgpa: 3.73,
    yearsExp: 4, topSkills: ['Python', 'SQL', 'ML', 'Django', 'TensorFlow'],
    skillLevels: { Python: 9, SQL: 8, ML: 8, Django: 8, TensorFlow: 7 },
    coursesCovered: 18, totalCourses: 24, softSkillScore: 68, technicalSkillScore: 88, overallScore: 85,
    vector: [0, 0],
    projects: [
      { name: "Recommendation Feed", description: "Collaborative filtering recommender engine with Django server backend.", tech: ["Python", "TensorFlow", "Django"] }
    ],
    workExperience: [
      { role: "Data Scientist", company: "Shopee Malaysia", duration: "2022 - Present", description: "Created scoring metrics and recommendation feeds driving daily customer retention." }
    ],
    certifications: ["TensorFlow Developer Certificate"]
  }
];

// Sort by overall score (best match first)
export const topCandidates = [...mockCandidates]
  .sort((a, b) => b.overallScore - a.overallScore)
  .slice(0, 10);

export const TOP_N = 10;
export const CANVAS_SIZE = 600;
export const CENTER = CANVAS_SIZE / 2;
export const SCALE = 280; // pixels per unit

export const mbtiToCareerType: Record<string, string> = {
  INTJ: "D-I",
  INTP: "C-I",
  ENTJ: "D-E",
  ENTP: "I-E",
  INFJ: "S-I",
  INFP: "I-A",
  ENFJ: "I-S",
  ENFP: "I-A",
  ISTJ: "C-R",
  ISFJ: "S-S",
  ESTJ: "C-C",
  ESFJ: "S-C",
  ISTP: "S-R",
  ISFP: "S-A",
  ESTP: "D-R",
  ESFP: "I-C"
};

export function getCareerType(mbti: string): string {
  return mbtiToCareerType[mbti.toUpperCase()] || "Investigative";
}

/** Generate a short personality summary based on MBTI and soft skill score */
export function getPersonalitySummary(mbti: string, softSkillScore: number): string {
  const type = mbti.toUpperCase();
  const isHighSoft = softSkillScore >= 75;
  const summaries: Record<string, string> = {
    INTJ: isHighSoft
      ? "Strategic architect who combines long-range vision with strong stakeholder alignment."
      : "Independent systems thinker who thrives on complex problem decomposition.",
    INTP: isHighSoft
      ? "Analytical innovator who distils complex ideas into clear, persuasive solutions."
      : "Precise logical thinker who excels at pattern recognition and root-cause analysis.",
    ENTJ: isHighSoft
      ? "Results-driven leader who aligns teams around ambitious goals with high conviction."
      : "Direct executor focused on efficiency, structure, and decisive action under pressure.",
    ENTP: isHighSoft
      ? "Creative connector who turns divergent ideas into compelling strategies through debate."
      : "Energetic innovator who challenges conventional approaches to find clever workarounds.",
    INFJ: isHighSoft
      ? "Empathetic visionary who builds trust and drives meaningful collaboration across teams."
      : "Thoughtful strategist who quietly champions purpose-driven, human-centred solutions.",
    INFP: isHighSoft
      ? "Values-led team player who nurtures team culture and advocates for user empathy."
      : "Imaginative idealist who brings creative depth and personal integrity to every task.",
    ENFJ: isHighSoft
      ? "Inspiring communicator who elevates team performance through mentorship and clarity."
      : "Proactive collaborator who ensures every voice is heard and every deadline is met.",
    ENFP: isHighSoft
      ? "Enthusiastic bridge-builder who sparks engagement and drives creative momentum."
      : "Energetic explorer with a knack for connecting ideas and rallying buy-in quickly.",
    ISTJ: isHighSoft
      ? "Methodical executor who pairs deep reliability with consistent cross-team coordination."
      : "Detail-oriented professional who delivers on commitments with precision and discipline.",
    ISFJ: isHighSoft
      ? "Dependable supporter who maintains team harmony while quietly driving quality output."
      : "Conscientious contributor who follows through on responsibilities with calm consistency.",
    ESTJ: isHighSoft
      ? "Structured organiser who leads with clarity and keeps teams aligned to deliverables."
      : "Process-driven planner who enforces standards and ensures projects stay on track.",
    ESFJ: isHighSoft
      ? "Warm facilitator who builds cohesive teams and fosters a supportive work culture."
      : "People-focused executor who excels at coordinating tasks and maintaining momentum.",
    ISTP: isHighSoft
      ? "Hands-on problem solver who blends deep technical skill with calm cross-team clarity."
      : "Pragmatic technician who dives deep into systems and surfaces elegant fixes fast.",
    ISFP: isHighSoft
      ? "Adaptive creator who reads team dynamics well and delivers thoughtful, polished work."
      : "Quiet achiever who brings careful craftsmanship and a genuine eye for quality.",
    ESTP: isHighSoft
      ? "Dynamic operator who thrives under pressure and brings high energy to collaborative sprints."
      : "Action-oriented realist who adapts rapidly and delivers tangible results in fast-moving environments.",
    ESFP: isHighSoft
      ? "Charismatic team energiser who makes collaboration enjoyable and keeps morale high."
      : "Spontaneous doer who brings infectious enthusiasm and quick adaptability to any team.",
  };
  return summaries[type] ?? "A versatile professional with a strong track record of delivering quality work.";
}
