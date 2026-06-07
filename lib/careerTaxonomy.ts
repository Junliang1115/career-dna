// ─── Career Fields ───────────────────────────────────────────────────────────
// Each field: id, label, color, cluster (for layout grouping)

export interface CareerField {
  id: string;
  label: string;
  color: string;
  cluster: 'engineering' | 'data' | 'product' | 'infrastructure' | 'security' | 'design' | 'science' | 'emerging';
}

export const careerFields: CareerField[] = [
  // ── Engineering ─────────────────────────────────────────────────────────────
  { id: 'frontend',      label: 'Frontend Engineering',      color: '#818CF8', cluster: 'engineering' },
  { id: 'backend',       label: 'Backend Engineering',       color: '#6366F1', cluster: 'engineering' },
  { id: 'fullstack',     label: 'Full-Stack Engineering',    color: '#7C3AED', cluster: 'engineering' },
  { id: 'mobile',        label: 'Mobile Engineering',         color: '#8B5CF6', cluster: 'engineering' },
  { id: 'games',         label: 'Game Engineering',           color: '#A78BFA', cluster: 'engineering' },
  { id: 'embedded',      label: 'Embedded Systems',           color: '#6D28D9', cluster: 'engineering' },
  { id: 'devops',        label: 'DevOps / SRE',               color: '#0EA5E9', cluster: 'infrastructure' },
  { id: 'platform',      label: 'Platform Engineering',       color: '#06B6D4', cluster: 'infrastructure' },
  { id: 'qa',            label: 'QA & Test Engineering',      color: '#14B8A6', cluster: 'engineering' },

  // ── Data & AI ─────────────────────────────────────────────────────────────
  { id: 'dataeng',       label: 'Data Engineering',            color: '#10B981', cluster: 'data' },
  { id: 'datascience',   label: 'Data Science',                color: '#059669', cluster: 'data' },
  { id: 'mlai',          label: 'Machine Learning & AI',       color: '#047857', cluster: 'data' },
  { id: 'deeplearning',  label: 'Deep Learning / Research',    color: '#065F46', cluster: 'data' },
  { id: 'nlp',           label: 'NLP / Computational Ling.',  color: '#047857', cluster: 'data' },
  { id: 'datavis',       label: 'Data Visualization',          color: '#34D399', cluster: 'data' },
  { id: 'analytics',     label: 'Analytics & Intelligence',   color: '#6EE7B7', cluster: 'data' },

  // ── Cloud & Infrastructure ────────────────────────────────────────────────
  { id: 'cloud',         label: 'Cloud Architecture',         color: '#0EA5E9', cluster: 'infrastructure' },
  { id: 'sre',           label: 'Site Reliability Eng.',     color: '#0284C7', cluster: 'infrastructure' },
  { id: 'networking',    label: 'Network Engineering',        color: '#0891B2', cluster: 'infrastructure' },

  // ── Security ───────────────────────────────────────────────────────────────
  { id: 'cybersec',      label: 'Cybersecurity',              color: '#EF4444', cluster: 'security' },
  { id: 'appsec',        label: 'Application Security',       color: '#DC2626', cluster: 'security' },
  { id: 'secops',        label: 'Security Operations',         color: '#B91C1C', cluster: 'security' },

  // ── Product & Design ──────────────────────────────────────────────────────
  { id: 'product',       label: 'Product Management',         color: '#F59E0B', cluster: 'product' },
  { id: 'ux',            label: 'UX Design',                   color: '#D97706', cluster: 'design' },
  { id: 'ui',            label: 'UI Design',                   color: '#B45309', cluster: 'design' },
  { id: 'productdesign', label: 'Product Design',              color: '#92400E', cluster: 'design' },

  // ── Computer Science ──────────────────────────────────────────────────────
  { id: 'systems',       label: 'Systems Engineering',         color: '#8B5CF6', cluster: 'engineering' },
  { id: 'csp',           label: 'CS Research / Academia',     color: '#7C3AED', cluster: 'science' },
  { id: 'blockchain',    label: 'Blockchain Engineering',      color: '#06B6D4', cluster: 'emerging' },
  { id: 'iot',           label: 'IoT Engineering',             color: '#0D9488', cluster: 'emerging' },
  { id: 'robotics',      label: 'Robotics Engineering',        color: '#115E59', cluster: 'emerging' },
  { id: 'autonomous',    label: 'Autonomous Systems',          color: '#134E4A', cluster: 'emerging' },

  // ── Specialized ────────────────────────────────────────────────────────────
  { id: 'techsales',     label: 'Technical Sales / SE',       color: '#F97316', cluster: 'product' },
  { id: 'techwriting',   label: 'Technical Writing',          color: '#EA580C', cluster: 'product' },
  { id: 'techconsult',   label: 'Technology Consulting',      color: '#C2410C', cluster: 'product' },
  { id: 'engineeringm',  label: 'Engineering Management',      color: '#F59E0B', cluster: 'engineering' },
];

// ─── Specialized Positions per Field ─────────────────────────────────────────
// Maps fieldId → array of specialized job titles

export interface Position {
  title: string;
  keywords: string[]; // for matching with job postings
}

export const positionsByField: Record<string, Position[]> = {
  frontend: [
    { title: 'Frontend Engineer',          keywords: ['javascript', 'typescript', 'react', 'vue', 'css'] },
    { title: 'UI Engineer',                keywords: ['html', 'css', 'sass', 'animation', 'accessibility'] },
    { title: 'JavaScript Developer',        keywords: ['javascript', 'es6', 'nodejs', 'npm', 'webpack'] },
    { title: 'React Developer',             keywords: ['react', 'redux', 'nextjs', 'graphql', 'typescript'] },
    { title: 'Vue Developer',               keywords: ['vue', 'nuxt', 'pinia', 'vuex'] },
    { title: 'Web Performance Engineer',   keywords: ['core web vitals', 'lighthouse', 'performance', 'optimization'] },
    { title: 'Accessibility Engineer',     keywords: ['a11y', 'wcag', 'aria', 'screen reader'] },
    { title: 'Creative Technologist',       keywords: ['webgl', 'threejs', 'canvas', 'creative coding'] },
    { title: 'Cross-Platform UI Dev',      keywords: ['react native', 'flutter', 'electron', 'tauri'] },
  ],
  backend: [
    { title: 'Backend Engineer',            keywords: ['java', 'python', 'golang', 'nodejs', 'api'] },
    { title: 'API Developer',              keywords: ['rest', 'graphql', 'grpc', 'api design', 'openapi'] },
    { title: 'Java Developer',             keywords: ['java', 'spring', 'hibernate', 'maven', 'jvm'] },
    { title: 'Python Developer',           keywords: ['python', 'django', 'flask', 'fastapi', 'asyncio'] },
    { title: 'Go Developer',               keywords: ['golang', 'go', 'microservices', 'grpc', 'docker'] },
    { title: 'Ruby on Rails Developer',    keywords: ['ruby', 'rails', 'activerecord', 'sidekiq'] },
    { title: 'PHP Developer',              keywords: ['php', 'laravel', 'symfony', 'wordpress'] },
    { title: '.NET Developer',             keywords: ['csharp', '.net', 'asp.net', 'azure', 'mssql'] },
    { title: 'Middleware Developer',       keywords: ['nginx', 'apache', 'kafka', 'rabbitmq', 'redis'] },
    { title: 'Serverless Developer',       keywords: ['aws lambda', 'azure functions', 'gcp cloud functions', 'serverless'] },
  ],
  fullstack: [
    { title: 'Full-Stack Engineer',        keywords: ['javascript', 'react', 'nodejs', 'sql', 'api'] },
    { title: 'MERN Stack Developer',       keywords: ['mongodb', 'express', 'react', 'nodejs'] },
    { title: 'Next.js Developer',          keywords: ['nextjs', 'react', 'typescript', 'vercel', 'ssr'] },
    { title: 'MEAN Stack Developer',       keywords: ['mongodb', 'express', 'angular', 'nodejs'] },
    { title: 'JAMstack Developer',         keywords: ['jamstack', 'gatsby', 'netlify', 'static sites', 'headless cms'] },
    { title: 'Isomorphic JS Developer',    keywords: ['isomorphic', 'react', 'nextjs', 'universal js'] },
    { title: 'E-Commerce Developer',       keywords: ['shopify', 'woocommerce', 'ecommerce', 'stripe', 'payment'] },
  ],
  mobile: [
    { title: 'iOS Engineer',               keywords: ['swift', 'objective-c', 'uikit', 'swiftui', 'xcode'] },
    { title: 'Android Engineer',          keywords: ['kotlin', 'java', 'jetpack', 'android studio', 'gradle'] },
    { title: 'React Native Developer',     keywords: ['react native', 'expo', 'typescript', 'mobile'] },
    { title: 'Flutter Developer',          keywords: ['flutter', 'dart', 'cross-platform', 'widgets'] },
    { title: 'Kotlin Multiplatform Dev',  keywords: ['kotlin multiplatform', 'kmp', 'shared code'] },
    { title: 'Mobile DevOps Engineer',    keywords: ['fastlane', 'bitrise', 'codemagic', 'ci/cd', 'app store'] },
    { title: 'Mobile Game Developer',      keywords: ['unity', 'c#', 'mobile games', 'ios', 'android'] },
    { title: 'Cross-Platform Mobile Dev', keywords: ['flutter', 'react native', 'ionic', 'capacitor'] },
  ],
  games: [
    { title: 'Gameplay Programmer',       keywords: ['gameplay', 'unity', 'unreal', 'c#', 'c++'] },
    { title: 'Graphics Programmer',        keywords: ['opengl', 'directx', 'vulkan', 'shaders', 'gpu'] },
    { title: 'Game Engine Developer',      keywords: ['game engine', 'unreal', 'unity', 'physx', 'rendering'] },
    { title: 'Unity Developer',            keywords: ['unity', 'c#', 'game development', 'urp', 'asset pipeline'] },
    { title: 'Unreal Engine Developer',   keywords: ['unreal', 'c++', 'blueprints', 'umg', 'gameplay'] },
    { title: 'Technical Director',         keywords: ['technical direction', 'game architecture', 'team lead'] },
    { title: 'VR/AR Developer',           keywords: ['vr', 'ar', 'unity', 'unreal', ' xr', 'oculus'] },
    { title: 'Multiplayer/Network Engineer', keywords: ['netcode', 'photon', 'mirror', 'networking', 'dedicated server'] },
  ],
  embedded: [
    { title: 'Embedded Software Engineer', keywords: ['c', 'c++', 'rtos', 'arm', 'microcontroller'] },
    { title: 'Firmware Engineer',         keywords: ['firmware', 'embedded c', 'bootloader', 'drivers', 'bsp'] },
    { title: 'Hardware Engineer',          keywords: ['pcb', 'schematics', 'circuit design', 'fpga', 'verilog'] },
    { title: 'IoT Firmware Developer',    keywords: ['iot', 'esp32', 'arduino', 'embedded c', 'mqtt'] },
    { title: 'RTOS Developer',            keywords: ['freertos', 'zephyr', 'rtos', 'real-time', 'embedded linux'] },
    { title: 'AUTOSAR Developer',         keywords: ['autosar', 'automotive', 'can', 'lin', 'embedded'] },
    { title: 'DSP Engineer',              keywords: ['dsp', 'signal processing', 'matlab', 'embedded c', 'audio'] },
    { title: 'Computer Vision Engineer',  keywords: ['opencv', 'embedded vision', 'arm neon', 'edge ai'] },
  ],
  devops: [
    { title: 'DevOps Engineer',            keywords: ['docker', 'kubernetes', 'ci/cd', 'jenkins', 'git'] },
    { title: 'AWS DevOps Engineer',       keywords: ['aws', 'ec2', 'ecs', 'eks', 'lambda', 'terraform'] },
    { title: 'Azure DevOps Engineer',     keywords: ['azure', 'azure devops', 'arm templates', 'pipelines'] },
    { title: 'GCP DevOps Engineer',       keywords: ['gcp', 'google cloud', 'cloud build', 'gke'] },
    { title: 'CI/CD Pipeline Engineer',    keywords: ['jenkins', 'github actions', 'gitlab ci', 'drone', 'pipeline'] },
    { title: 'Kubernetes Engineer',       keywords: ['kubernetes', 'k8s', 'helm', 'docker', 'orchestration'] },
    { title: 'GitOps Engineer',           keywords: ['gitops', 'argocd', 'flux', 'kubernetes', 'iac'] },
    { title: 'Platform Engineer',         keywords: ['platform engineering', 'internal developer platform', 'backstage'] },
    { title: 'MLOps Engineer',            keywords: ['mlops', 'kubeflow', 'airflow', 'ml pipeline', 'experiment tracking'] },
  ],
  platform: [
    { title: 'Platform Engineer',         keywords: ['platform engineering', 'idp', 'developer tools', 'self-service'] },
    { title: 'Internal Tooling Engineer',  keywords: ['internal tools', 'developer experience', 'productivity'] },
    { title: 'Release Engineer',          keywords: ['release management', 'deployment', 'ci/cd', 'automation'] },
    { title: 'Build Engineer',            keywords: ['build systems', 'bazel', 'buck', 'gradle', 'compilation'] },
    { title: 'Developer Experience Eng.',  keywords: ['developer experience', 'dx', 'tooling', 'productivity'] },
  ],
  qa: [
    { title: 'QA Engineer',               keywords: ['qa', 'testing', 'test cases', 'regression', 'test plan'] },
    { title: 'SDET (Software Dev in Test)', keywords: ['sdET', 'test automation', 'selenium', 'playwright', 'python'] },
    { title: 'Test Automation Engineer',   keywords: ['test automation', 'selenium', 'cypress', 'playwright', 'appium'] },
    { title: 'Performance Test Engineer',  keywords: ['performance testing', 'jmeter', 'gatling', 'load testing', 'profiling'] },
    { title: 'QA Lead',                   keywords: ['qa lead', 'test strategy', 'team management', 'test planning'] },
    { title: 'Test Architect',           keywords: ['test architecture', 'test framework', 'automation design'] },
    { title: 'Manual QA Tester',          keywords: ['manual testing', 'test cases', 'bug reporting', 'regression'] },
  ],
  dataeng: [
    { title: 'Data Engineer',             keywords: ['python', 'sql', 'spark', 'airflow', 'etl', 'data pipeline'] },
    { title: 'Big Data Engineer',         keywords: ['hadoop', 'spark', 'kafka', 'hdfs', 'mapreduce'] },
    { title: 'ETL Developer',             keywords: ['etl', 'talend', 'informatica', 'data warehouse', 'sql'] },
    { title: 'Data Pipeline Engineer',     keywords: ['data pipeline', 'airflow', ' Prefect', 'dag', 'python'] },
    { title: 'Streaming Engineer',         keywords: ['kafka', 'flink', 'spark streaming', 'real-time', 'streaming'] },
    { title: 'Data Lake Engineer',        keywords: ['data lake', 'delta lake', 'iceberg', 's3', 'adls'] },
    { title: 'Warehouse Developer',       keywords: ['snowflake', 'bigquery', 'redshift', 'dbt', 'sql warehouse'] },
    { title: 'Data Platform Engineer',     keywords: ['data platform', 'data mesh', 'architecture', 'governance'] },
  ],
  datascience: [
    { title: 'Data Scientist',            keywords: ['python', 'sql', 'statistics', 'machine learning', 'pandas', 'scikit-learn'] },
    { title: 'Applied Scientist',          keywords: ['applied science', 'ml', 'python', 'research', 'production'] },
    { title: 'Research Scientist',         keywords: ['research', 'publications', 'ml', 'statistics', 'python'] },
    { title: 'Statistical Analyst',        keywords: ['statistics', 'r', 'python', 'hypothesis testing', 'regression'] },
    { title: 'Business Intelligence Dev', keywords: ['bi', 'tableau', 'power bi', ' Looker', 'sql', 'dashboard'] },
    { title: 'Quantitative Analyst',      keywords: ['quantitative', 'python', 'r', 'finance', 'statistical modeling'] },
    { title: 'Marketing Data Scientist',  keywords: ['marketing analytics', 'ab testing', ' attribution', 'sql', 'python'] },
  ],
  mlai: [
    { title: 'Machine Learning Engineer', keywords: ['ml', 'python', 'pytorch', 'tensorflow', 'mlops', 'production'] },
    { title: 'AI Engineer',               keywords: ['ai', 'python', 'openai', 'langchain', 'llm', 'api integration'] },
    { title: 'Computer Vision Engineer',   keywords: ['computer vision', 'opencv', 'pytorch', 'image processing', 'cnn'] },
    { title: 'Recommendation Engineer',   keywords: ['recommendation system', 'collaborative filtering', 'tensorflow', 'ml'] },
    { title: 'Search Engineer',            keywords: ['search', 'elasticsearch', 'solr', 'relevance', 'ranking', 'nlp'] },
    { title: 'Ranking Engineer',           keywords: ['ranking', 'learning to rank', 'elasticsearch', 'relevance', 'ml'] },
    { title: 'ML Infrastructure Engineer', keywords: ['ml infrastructure', 'kubeflow', 'mlflow', 'feature store', 'training'] },
    { title: 'Prompt Engineer',           keywords: ['prompt engineering', 'llm', 'openai', 'anthropic', 'prompt design'] },
    { title: 'AI Product Engineer',       keywords: ['ai product', 'llm', 'rag', 'fine-tuning', 'product'] },
  ],
  deeplearning: [
    { title: 'Deep Learning Researcher',   keywords: ['deep learning', 'pytorch', 'tensorflow', 'research', 'papers'] },
    { title: 'AI Research Scientist',      keywords: ['ai research', 'transformers', 'gpt', 'diffusion', 'publications'] },
    { title: 'Speech/Audio AI Engineer',  keywords: ['speech recognition', 'tts', 'audio ai', 'wav2vec', 'kaldi'] },
    { title: 'Multimodal Engineer',       keywords: ['multimodal', 'clip', 'vision language', 'llava', 'image-text'] },
    { title: 'Generative AI Engineer',    keywords: ['generative ai', 'diffusion', 'gan', 'stable diffusion', 'llm'] },
    { title: 'Neural Network Optimizer',  keywords: ['model optimization', 'quantization', 'pruning', 'onnx', 'tensorrt'] },
  ],
  nlp: [
    { title: 'NLP Engineer',              keywords: ['nlp', 'transformers', 'huggingface', 'bert', 'python'] },
    { title: 'Computational Linguist',    keywords: ['computational linguistics', 'morphology', 'syntax', 'phonology', 'corpus'] },
    { title: 'Chatbot Developer',         keywords: ['chatbot', 'dialogue systems', ' rasa', 'conversational ai'] },
    { title: 'LLM Application Developer', keywords: ['llm', 'langchain', 'rag', 'vector db', 'llamaindex', 'chainlit'] },
    { title: 'Machine Translation Eng.',  keywords: ['machine translation', 'nmt', 'transformers', 'opus', 'm2m-100'] },
    { title: 'Text Mining Engineer',       keywords: ['text mining', 'ner', 'topic modeling', 'text classification', 'spacy'] },
  ],
  datavis: [
    { title: 'Data Visualization Engineer', keywords: ['d3.js', 'vega', 'visualization', 'javascript', 'react'] },
    { title: 'BI Developer',               keywords: ['tableau', 'power bi', ' Looker', 'data studio', 'dashboards'] },
    { title: 'Visual Analytics Developer', keywords: ['visual analytics', 'd3', 'observable', 'visualization', '交互'] },
    { title: 'Dashboard Engineer',         keywords: ['dashboard', 'metabase', 'superset', 'grafana', 'react'] },
  ],
  analytics: [
    { title: 'Data Analyst',               keywords: ['sql', 'excel', 'python', 'tableau', 'data analysis'] },
    { title: 'Business Analyst',           keywords: ['business analysis', 'requirements', 'stakeholder', 'sql', 'excel'] },
    { title: 'Product Analyst',            keywords: ['product analytics', 'funnel analysis', 'sql', 'python', 'mixpanel'] },
    { title: 'Growth Analyst',             keywords: ['growth', 'ab testing', 'sql', 'growth hacking', 'funnel'] },
    { title: 'Risk Analyst',               keywords: ['risk analytics', 'fraud', 'python', 'sql', 'modeling'] },
    { title: 'Financial Analyst (Tech)',   keywords: ['financial analysis', 'python', 'sql', 'modeling', 'bi'] },
    { title: 'Operations Analyst',         keywords: ['operations', 'process optimization', 'sql', 'python', 'logistics'] },
  ],
  cloud: [
    { title: 'Cloud Architect',            keywords: ['cloud architecture', 'aws', 'azure', 'gcp', 'iac', 'terraform'] },
    { title: 'AWS Solutions Architect',    keywords: ['aws', 'solutions architect', 'ec2', 's3', 'vpc', 'iam'] },
    { title: 'Azure Solutions Architect',  keywords: ['azure', 'solutions architect', 'arm', 'ad', 'pipelines'] },
    { title: 'GCP Cloud Architect',        keywords: ['gcp', 'google cloud', 'gke', 'cloud run', 'terraform'] },
    { title: 'Cloud Migration Engineer',   keywords: ['cloud migration', 'lift and shift', 're-platforming', 'aws', 'azure'] },
    { title: 'Multi-Cloud Engineer',       keywords: ['multi-cloud', 'aws', 'azure', 'gcp', 'terraform', 'ansible'] },
  ],
  sre: [
    { title: 'Site Reliability Engineer',  keywords: ['sre', 'reliability', 'slo', 'sls', 'on-call', 'incident management'] },
    { title: 'Production Engineer',        keywords: ['production engineering', 'reliability', 'monitoring', 'incident response'] },
    { title: 'Observability Engineer',     keywords: ['observability', 'datadog', 'prometheus', 'grafana', 'tracing'] },
    { title: 'Chaos Engineer',            keywords: ['chaos engineering', 'gremlin', 'litmus', 'failure injection', 'resilience'] },
    { title: 'Incident Manager',           keywords: ['incident management', 'on-call', 'postmortem', 'sre', 'monitoring'] },
  ],
  networking: [
    { title: 'Network Engineer',           keywords: ['networking', 'tcp/ip', 'bgp', 'ospf', 'cisco', 'routing'] },
    { title: 'Network Security Engineer',   keywords: ['network security', 'firewall', 'ids/ips', 'vpn', 'palo alto'] },
    { title: 'Cloud Network Engineer',     keywords: ['cloud networking', 'aws vpc', 'azure vnet', 'sdn', 'overlay networks'] },
    { title: 'Network Automation Eng.',    keywords: ['network automation', 'ansible', 'python', 'napalm', 'sdn'] },
  ],
  cybersec: [
    { title: 'Cybersecurity Engineer',     keywords: ['cybersecurity', 'penetration testing', 'vulnerability', 'siem', 'incident response'] },
    { title: 'Penetration Tester',         keywords: ['penetration testing', 'ethical hacking', 'burp suite', 'owasp', 'kali linux'] },
    { title: 'Malware Analyst',           keywords: ['malware analysis', 'reverse engineering', 'ida pro', 'x64dbg', 'sandbox'] },
    { title: 'Threat Intelligence Analyst', keywords: ['threat intelligence', 'mitre att&ck', 'stix/taxii', 'threat hunting'] },
    { title: 'Digital Forensics Analyst',  keywords: ['digital forensics', 'incident response', 'dfir', 'malware triage'] },
    { title: 'Governance Risk Compliance',  keywords: ['grc', 'compliance', 'iso 27001', 'pci-dss', 'risk assessment'] },
    { title: 'Red Team Operator',          keywords: ['red team', 'apt simulation', 'social engineering', 'lateral movement'] },
    { title: 'Blue Team Defender',         keywords: ['defensive security', 'siem', 'edr', 'threat detection', 'hunting'] },
  ],
  appsec: [
    { title: 'Application Security Eng.', keywords: ['appsec', 'sast', 'dast', 'sca', 'owasp', 'secure coding'] },
    { title: 'Security Champion',         keywords: ['security champion', 'secure development', 'appsec', 'sdLC'] },
    { title: 'API Security Engineer',      keywords: ['api security', 'oauth', 'openid connect', 'jwt', 'burp'] },
    { title: 'DevSecOps Engineer',        keywords: ['devsecops', 'shift left', 'security automation', 'snyk', 'sast'] },
    { title: 'Cloud Security Engineer',    keywords: ['cloud security', 'aws security', 'azure security', 'iam', 'misconfiguration'] },
  ],
  secops: [
    { title: 'SOC Analyst',               keywords: ['soc', 'security operations', 'siem', 'splunk', 'alert triage'] },
    { title: 'Security Operations Eng.',   keywords: ['secops', 'automation', 'soar', 'splunk', 'python'] },
    { title: 'SIEM Engineer',             keywords: ['siem', 'splunk', 'elastic', 'arcsight', 'log analysis'] },
    { title: 'EDR Engineer',              keywords: ['edr', 'crowdstrike', 'carbon black', 'sentinelone', 'endpoint detection'] },
    { title: 'Threat Hunter',             keywords: ['threat hunting', 'mitre att&ck', ' Hypothesis-driven', 'edr', 'siem'] },
  ],
  product: [
    { title: 'Product Manager',           keywords: ['product management', 'roadmap', 'prd', 'stakeholder', 'agile'] },
    { title: 'Technical Product Manager', keywords: ['technical pm', 'technical product', 'engineering background', 'api'] },
    { title: 'Associate Product Manager',  keywords: ['apm', 'product management', 'roadmap', 'stakeholder'] },
    { title: 'Growth Product Manager',    keywords: ['growth pm', 'acquisition', 'activation', 'retention', 'experimentation'] },
    { title: 'AI Product Manager',        keywords: ['ai pm', 'machine learning', 'llm', 'data', 'roadmap'] },
    { title: 'Platform PM',               keywords: ['platform product manager', 'internal platform', 'developer product'] },
    { title: 'Data Product Manager',      keywords: ['data product', 'data platform', 'analytics', 'metadata management'] },
  ],
  ux: [
    { title: 'UX Designer',               keywords: ['ux design', 'user research', 'wireframing', 'prototyping', 'figma'] },
    { title: 'UX Researcher',             keywords: ['ux research', 'user research', 'usability testing', 'interviews', 'surveys'] },
    { title: 'Interaction Designer',       keywords: ['interaction design', 'ixd', 'prototyping', 'micro-interactions', 'figma'] },
    { title: 'UX Engineer',               keywords: ['ux engineering', 'front-end', 'prototyping', 'figma', 'html/css'] },
    { title: 'Conversion Rate Optimizer',  keywords: ['cro', 'ab testing', 'ux', 'funnel optimization', 'analytics'] },
  ],
  ui: [
    { title: 'UI Designer',               keywords: ['ui design', 'visual design', 'figma', 'adobe xd', 'typography'] },
    { title: 'Visual Designer',           keywords: ['visual design', 'branding', 'typography', 'color theory', 'figma'] },
    { title: 'Design Systems Engineer',   keywords: ['design systems', 'component library', 'storybook', 'figma', 'react'] },
    { title: 'UI Developer',              keywords: ['ui development', 'html', 'css', 'javascript', 'react', 'figma'] },
  ],
  productdesign: [
    { title: 'Product Designer',           keywords: ['product design', 'end-to-end design', 'figma', 'research', 'prototyping'] },
    { title: 'UX/UI Designer',            keywords: ['ux/ui', 'figma', 'user research', 'prototyping', 'design systems'] },
    { title: 'Design Lead',               keywords: ['design lead', 'design strategy', 'team management', 'design systems'] },
    { title: 'UX Strategist',             keywords: ['ux strategy', 'user journey', 'business goals', 'research synthesis'] },
  ],
  systems: [
    { title: 'Systems Engineer',           keywords: ['systems engineering', 'linux', 'c', 'c++', 'performance', 'concurrency'] },
    { title: 'Operating Systems Dev.',     keywords: ['operating systems', 'linux kernel', 'kernel development', 'c', 'bsp'] },
    { title: 'Distributed Systems Eng.',  keywords: ['distributed systems', 'consensus', 'raft', 'paxos', 'cap theorem'] },
    { title: 'Database Kernel Engineer',  keywords: ['database engine', 'storage engine', 'query optimization', 'c++', 'b-tree'] },
    { title: 'Compiler Engineer',         keywords: ['compilers', 'llvm', 'gcc', 'parser', 'optimization', 'ir'] },
    { title: 'Graphics Systems Engineer',  keywords: ['graphics', 'opengl', 'vulkan', 'directx', 'gpu', 'shaders'] },
    { title: 'Storage Systems Engineer',   keywords: ['storage systems', 'distributed storage', 'ceph', 'glusterfs', 's3'] },
  ],
  csp: [
    { title: 'CS Researcher',              keywords: ['computer science research', 'publications', 'algorithms', 'theory'] },
    { title: 'PhD Engineer',               keywords: ['phd', 'research engineering', 'machine learning', 'systems', 'applied research'] },
    { title: 'Algorithm Engineer',         keywords: ['algorithms', 'data structures', 'competitive programming', 'optimization'] },
    { title: 'Quantum Computing Engineer', keywords: ['quantum computing', 'qiskit', 'cirq', 'quantum algorithms', 'python'] },
    { title: 'Research Engineer',          keywords: ['research engineering', 'prototyping', 'ml', 'systems', 'publications'] },
  ],
  blockchain: [
    { title: 'Blockchain Developer',       keywords: ['blockchain', 'smart contracts', 'solidity', 'ethereum', 'web3'] },
    { title: 'Solidity Developer',         keywords: ['solidity', 'ethereum', 'smart contracts', 'web3.js', 'hardhat'] },
    { title: 'DeFi Engineer',             keywords: ['defi', 'decentralized finance', 'solidity', 'uniswap', 'ethereum'] },
    { title: 'Web3 Frontend Developer',  keywords: ['web3', 'ethers.js', 'web3.js', 'react', 'wallet integration'] },
    { title: 'Protocol Engineer',         keywords: ['protocol development', 'consensus', 'p2p', 'rust', 'blockchain'] },
    { title: 'NFT Developer',             keywords: ['nft', 'erc-721', 'erc-1155', 'solidity', 'ipfs', 'opensea'] },
  ],
  iot: [
    { title: 'IoT Engineer',              keywords: ['iot', 'mqtt', 'coap', 'embedded c', 'raspberry pi', 'sensors'] },
    { title: 'IoT Cloud Engineer',         keywords: ['iot cloud', 'aws iot', 'azure iot hub', 'google cloud iot', 'device management'] },
    { title: 'Edge Computing Engineer',   keywords: ['edge computing', 'edge ai', 'iot', 'linux', 'arm', 'greengrass'] },
    { title: 'Sensor Integration Eng.',    keywords: ['sensors', 'adc', 'uart', 'spi', 'i2c', 'firmware'] },
  ],
  robotics: [
    { title: 'Robotics Software Engineer', keywords: ['robotics', 'ros', 'c++', 'python', 'perception', 'navigation'] },
    { title: 'ROS Engineer',              keywords: ['ros', 'ros2', 'robot operating system', 'c++', 'python', 'navigation'] },
    { title: 'Motion Planning Engineer',   keywords: ['motion planning', 'path planning', 'ros', 'planners', 'algorithms'] },
    { title: 'Robot Perception Engineer',   keywords: ['robot perception', 'computer vision', 'ros', 'sensor fusion', 'lidar'] },
    { title: 'Robot Control Engineer',     keywords: ['robot control', 'pid', 'control theory', 'embedded', 'actuators'] },
  ],
  autonomous: [
    { title: 'Autonomous Vehicle Eng.',   keywords: ['autonomous vehicles', 'adas', 'sensor fusion', 'lidar', 'radar', 'camera'] },
    { title: 'Perception Engineer',       keywords: ['perception', 'computer vision', 'object detection', 'sensor fusion', 'deep learning'] },
    { title: 'Motion Planning Engineer',   keywords: ['motion planning', 'path planning', ' trajectory optimization', 'control'] },
    { title: 'SLAM Engineer',             keywords: ['SLAM', 'localization', 'mapping', 'ros', 'lidar', 'visual odometry'] },
    { title: 'AV Safety Engineer',         keywords: ['av safety', 'iso 26262', 'functional safety', 'adas', 'automotive'] },
  ],
  techsales: [
    { title: 'Solutions Engineer',          keywords: ['solutions engineering', 'technical sales', 'pre-sales', 'demos', 'architecture'] },
    { title: 'Sales Engineer',             keywords: ['sales engineering', 'technical sales', 'demo', 'rfi/rfp', 'scoping'] },
    { title: 'Technical Account Manager',  keywords: ['tam', 'technical account management', 'customer success', 'onboarding'] },
    { title: 'Pre-Sales Engineer',         keywords: ['pre-sales', 'poc', 'demo', 'rfi', 'technical validation'] },
  ],
  techwriting: [
    { title: 'Technical Writer',           keywords: ['technical writing', 'documentation', 'markdown', 'api docs'] },
    { title: 'Documentation Engineer',     keywords: ['docs engineering', 'docs-as-code', 'docusaurus', 'sphinx', 'api docs'] },
    { title: 'API Documentation Dev.',    keywords: ['api documentation', 'openapi', 'swagger', 'redoc', 'api reference'] },
    { title: 'Developer Experience Writer', keywords: ['developer experience', 'tutorials', 'guides', 'sample code', 'dx'] },
  ],
  techconsult: [
    { title: 'Technology Consultant',      keywords: ['technology consulting', 'digital transformation', 'enterprise', 'architecture'] },
    { title: 'Cloud Consultant',           keywords: ['cloud consulting', 'aws', 'azure', 'gcp', 'cloud migration', 'advisory'] },
    { title: 'Data Strategy Consultant',   keywords: ['data strategy', 'consulting', 'data governance', 'architecture', 'stakeholder'] },
    { title: 'Security Consultant',        keywords: ['security consulting', 'penetration testing', 'appsec', 'grc', 'advisory'] },
    { title: 'Digital Transformation Consultant', keywords: ['digital transformation', 'strategy', 'change management', 'technology'] },
  ],
  engineeringm: [
    { title: 'Engineering Manager',        keywords: ['engineering management', 'team lead', 'people management', 'technical leadership'] },
    { title: 'Tech Lead',                 keywords: ['tech lead', 'technical leadership', 'architecture', 'code review', 'mentoring'] },
    { title: 'VP of Engineering',          keywords: ['vp engineering', 'engineering leadership', 'strategy', 'organization'] },
    { title: 'Director of Engineering',    keywords: ['director engineering', 'engineering management', 'roadmap', 'hiring'] },
    { title: 'CTO',                       keywords: ['cto', 'technology strategy', 'architecture', 'executive', 'vision'] },
    { title: 'Principal Engineer',          keywords: ['principal engineer', 'technical strategy', 'architecture', 'across teams'] },
  ],
};

// ─── Cluster colors for Level 0 grouping ────────────────────────────────────
export const clusterColors: Record<string, string> = {
  engineering:    '#818CF8',
  data:           '#10B981',
  infrastructure: '#0EA5E9',
  security:       '#EF4444',
  product:        '#F59E0B',
  design:         '#D97706',
  science:        '#7C3AED',
  emerging:       '#06B6D4',
};
