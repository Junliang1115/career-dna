'use client';
// Polyfill Promise.try if not supported (needed for pdfjs-dist in some environments)
if (typeof Promise.try !== 'function') {
  (Promise as any).try = function (fn: Function, ...args: any[]) {
    return new Promise((resolve, reject) => {
      try {
        resolve(fn(...args));
      } catch (err) {
        reject(err);
      }
    });
  };
}

/**
 * Resume Parser — extracts raw text from PDF/image files
 * and calls the LLM for structured data parsing.
 *
 * Pipeline:
 *  1. PDF (text-based)  → pdfjs-dist for direct text extraction
 *  2. PDF (scanned/img) → tesseract.js for OCR
 *  3. Raw text          → LLM API → structured { skills, workExperience, projects, awards, certifications }
 */

import type { WorkExperience, Project } from './context';

// ──────────────────────────────────────────────────────────────
// 1. PDF text extraction (pdfjs)
// ──────────────────────────────────────────────────────────────
async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamically import pdfjs to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  // Use the legacy build for Node-free PDF.js usage in browser
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s{2,}/g, '\n')
      .trim();
    pageTexts.push(text);
  }

  return pageTexts.join('\n\n');
}

// ──────────────────────────────────────────────────────────────
// 2. OCR via Tesseract.js
// ──────────────────────────────────────────────────────────────
async function extractTextViaOCR(file: File): Promise<string> {
  const Tesseract = await import('tesseract.js');
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = await canvas.convertToBlob({ type: file.type || 'image/png' });
  const result = await Tesseract.recognize(
    imageData,
    'eng',
    {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // progress callback — handled externally via onProgress
        }
      },
    },
  );
  return result.data.text;
}

// ──────────────────────────────────────────────────────────────
// 3. Detect if a PDF is image-based (scanned)
// ──────────────────────────────────────────────────────────────
/**
 * Returns true if the PDF has no extractable text (scanned/image PDF).
 * We do a quick check on the first page.
 */
async function isScannedPDF(file: File): Promise<boolean> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const arrayBuffer = await file.slice(0, 1024 * 1024).arrayBuffer(); // first 1MB
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const content = await page.getTextContent();
    const hasText = content.items.some((item: any) => (item.str ?? '').trim().length > 0);
    return !hasText;
  } catch {
    return true; // assume scanned on error
  }
}

// ──────────────────────────────────────────────────────────────
// 4. Main entry point
// ──────────────────────────────────────────────────────────────
export interface ExtractionResult {
  rawText: string;
}

export interface ParsedResume {
  skills: string[];
  certifications: string[];
  workExperience: WorkExperience[];
  projects: Project[];
  awards: string[];
  cgpa?: number | null;
}

export interface ParseProgress {
  stage: 'pdf' | 'ocr' | 'llm' | 'done' | 'error';
  progress: number; // 0–100
  message: string;
}

export async function extractTextFromFile(
  file: File,
  onProgress?: (p: ParseProgress) => void,
): Promise<string> {
  const isPDF = file.type === 'application/pdf';

  if (isPDF) {
    onProgress?.({ stage: 'pdf', progress: 20, message: 'Reading PDF…' });
    const isScanned = await isScannedPDF(file);

    if (isScanned) {
      // Scanned PDF — use OCR on each page rendered as image
      onProgress?.({ stage: 'ocr', progress: 30, message: 'Scanned PDF detected — running OCR…' });
      const Tesseract = await import('tesseract.js');
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const pageTexts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx as any, viewport } as any).promise;
        const blob = await canvas.convertToBlob({ type: 'image/png' });
        const result = await Tesseract.recognize(blob, 'eng');
        pageTexts.push(result.data.text);
        onProgress?.({
          stage: 'ocr',
          progress: 30 + Math.round((i / pdf.numPages) * 50),
          message: `OCR page ${i}/${pdf.numPages}…`,
        });
      }
      return pageTexts.join('\n\n');
    } else {
      const text = await extractTextFromPDF(file);
      onProgress?.({ stage: 'pdf', progress: 80, message: 'Text extracted.' });
      return text;
    }
  } else {
    // Image file → direct OCR
    onProgress?.({ stage: 'ocr', progress: 30, message: 'Running OCR on image…' });
    const text = await extractTextViaOCR(file);
    onProgress?.({ stage: 'ocr', progress: 80, message: 'Text extracted.' });
    return text;
  }
}

// ──────────────────────────────────────────────────────────────
// 5. Call LLM to parse structured data
// ──────────────────────────────────────────────────────────────
export async function parseResumeWithLLM(
  rawText: string,
  onProgress?: (p: ParseProgress) => void,
): Promise<ParsedResume> {
  onProgress?.({ stage: 'llm', progress: 85, message: 'Sending to AI parser…' });

  const prompt = `You are an expert resume parser. Given the raw text of a resume below, extract and return a JSON object with the following fields ONLY — no explanation, no markdown, just valid JSON:

{
  "skills": ["skill1", "skill2", ...],
  "certifications": ["cert1", "cert2", ...],
  "workExperience": [
    { "company": "Company Name", "role": "Job Title", "duration": "e.g. Jan 2020 – Mar 2023", "description": "Brief description of responsibilities and achievements" },
    ...
  ],
  "projects": [
    { "name": "Project Name", "description": "What it does / your contribution", "technologies": ["Tech1", "Tech2"] },
    ...
  ],
  "awards": ["Award 1", "Award 2", ...],
  "cgpa": 3.82
}

Rules:
- Only include fields that have actual content in the resume
- skills: technical skills, tools, languages, frameworks — NOT soft skills
- workExperience: include company, role, duration, and a 1-2 sentence description
- projects: include name, a brief description, and the technologies used
- awards: include competition wins, scholarships, Dean's List, certificates of achievement
- cgpa: extract the academic CGPA / GPA (usually a decimal between 0.0 and 4.0). If not found on the resume, return null.
- If a section is empty, return an empty array []
- Be specific with technology names (e.g. "React" not "JavaScript framework")

RESUME TEXT:
${rawText.slice(0, 8000)}
`;

  // Try OpenRouter first (free models available)
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Free models on OpenRouter don't require API key for limited usage
        // 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY ?? ''}`,
      },
      body: JSON.stringify({
        model: 'google/gemma-3n-e4b-it-remakeri@itu-001', // free model
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      onProgress?.({ stage: 'llm', progress: 98, message: 'AI parsing complete.' });
      return parseJSONResponse(content);
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: heuristic extraction (rule-based, no LLM)
  onProgress?.({ stage: 'llm', progress: 95, message: 'AI unavailable — using pattern extraction…' });
  return heuristicExtract(rawText);
}

function parseJSONResponse(content: string): ParsedResume {
  // Try to extract JSON from the response (handles markdown code blocks)
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) ?? content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in LLM response');
  const jsonStr = jsonMatch[0].replace(/```(?:json)?/, '').replace(/```$/, '').trim();
  return JSON.parse(jsonStr) as ParsedResume;
}

/**
 * Fallback rule-based extraction when LLM is unavailable.
 */
function cleanCertName(name: string): string {
  let clean = name;
  // 1. Remove parenthesized blocks containing a 4-digit year (e.g., "(Issued 2022)", "(2022)", "(Grants: 2022)")
  clean = clean.replace(/\s*[\(\[][^\]\)]*?\b\d{4}\b[^\]\)]*?[\)\]]/g, '');
  
  // 2. Remove trailing separators and dates (e.g., "| 2023", "- 2021", "— 2022")
  clean = clean.replace(/\s*[\-\–\—|]\s*(?:issued|obtained|date|active|expires|since|valid)?\s*\b\d{4}\b.*$/i, '');
  
  // 3. Remove standalone trailing 4-digit years (e.g., "AWS Developer 2023")
  clean = clean.replace(/\s+\b\d{4}\b\s*$/g, '');
  
  // 4. Remove leading/trailing punctuation and list bullets/symbols
  clean = clean.replace(/^[\s•\-\*–—\t,;.]+/, '').replace(/[\s•\-\*–—\t,;.]+$/, '');
  
  return clean.trim();
}

export function heuristicExtract(text: string): ParsedResume {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract skills (simple keyword matching)
  const KNOWN_SKILLS = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Express',
    'Java', 'C++', 'C#', 'Go', 'Rust', 'SQL', 'PostgreSQL', 'MongoDB', 'Firebase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'Linux',
    'TensorFlow', 'PyTorch', 'scikit-learn', 'Keras', 'OpenCV', 'NLTK', 'spaCy',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Next.js', 'FastAPI', 'Django', 'Flask',
    'REST', 'GraphQL', 'JSON', 'XML', 'API', 'Figma', 'Photoshop', 'Illustrator',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Analysis',
    'Agile', 'Scrum', 'Jira', 'CI/CD', 'DevOps',
  ];
  const foundSkills = [...new Set(
    KNOWN_SKILLS.filter(s => {
      const escaped = s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const pattern = `(?:^|\\W)${escaped}(?:\\W|$)`;
      return new RegExp(pattern, 'i').test(text);
    }),
  )];

  const certifications: string[] = [];

  const excludeKeywords = ['skills', 'tools', 'platforms', 'languages', 'development', 'programming', 'frameworks', 'technologies', 'databases', 'operating systems'];
  const isDateOnly = (s: string) => {
    const clean = s.replace(/^(?:issued|obtained|date|active|expires|since|valid)\s*(?:from|to|in|on)?\s*:?/i, '').trim();
    if (/^\d{4}$/.test(clean)) return true;
    if (/^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}$/i.test(clean)) return true;
    if (/^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}$/i.test(clean)) return true;
    return false;
  };

  // Extract awards (lines with award keywords)
  const AWARD_KEYWORDS = ['award', "dean's list", 'scholarship', 'prize', 'winner', 'honour', 'honor'];
  const awardLines = lines.filter(l => AWARD_KEYWORDS.some(k => l.toLowerCase().includes(k)));
  const awards = awardLines.slice(0, 5).map(l => l.replace(/\s+/g, ' '));

  // Parse Work Experience and Projects
  const workExperience: WorkExperience[] = [];
  const projects: Project[] = [];
  
  let currentSection = '';
  let currentWork: WorkExperience | null = null;
  let currentProject: Project | null = null;

  // matches: "June 2022 - Present", "Jan 2021 - June 2021", "06/2022 - 12/2023", etc.
  const dateStr = '(?:(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\b\\s*)?\\b\\d{4}\\b|\\b\\d{1,2}\\/\\d{4}\\b)';
  const dateEndStr = '(?:(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\b\\s*)?\\b\\d{4}\\b|\\b\\d{1,2}\\/\\d{4}\\b|\\bpresent\\b|\\bcurrent\\b)';
  const durationRegex = new RegExp(`${dateStr}\\s*[-–—to\\s]+\\s*${dateEndStr}`, 'i');
  
  const roleKeywords = ['engineer', 'developer', 'analyst', 'intern', 'specialist', 'designer', 'architect', 'lead', 'manager', 'consultant', 'programmer', 'administrator', 'director', 'officer', 'treasurer'];

  let nextIsBullet = false;

  const isSectionHeader = (line: string, keywords: string[]) => {
    const lower = line.toLowerCase();
    return keywords.some(k => lower.includes(k)) && (!line.includes(':') || line.trim().endsWith(':'));
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check if this line is just a bullet symbol
    const isBulletSymbol = line === '•' || line === '-' || line === '–' || line === '—';
    if (isBulletSymbol) {
      nextIsBullet = true;
      continue;
    }

    const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('–') || line.startsWith('—') || nextIsBullet;
    nextIsBullet = false; // Reset for next iteration

    // Section detection - check certifications first to set it correctly
    if (
      (lowerLine === 'certifications' || 
       lowerLine === 'certification' || 
       lowerLine === 'credentials' || 
       lowerLine === 'licenses & certifications' || 
       lowerLine === 'certifications & licenses' ||
       lowerLine === 'licenses and certifications' ||
       lowerLine === 'certifications and licenses') &&
      (!line.includes(':') || line.trim().endsWith(':'))
    ) {
      currentSection = 'certifications';
      continue;
    }

    if (
      isSectionHeader(line, [
        'experience', 'employment', 'work history', 'professional history', 
        'extracurricular', 'leadership', 'activities', 'co-curricular'
      ])
    ) {
      currentSection = 'experience';
      if (currentWork) workExperience.push(currentWork);
      currentWork = null;
      continue;
    }
    if (
      isSectionHeader(line, [
        'projects', 'personal projects', 'academic projects', 'technical projects'
      ])
    ) {
      currentSection = 'projects';
      if (currentProject) projects.push(currentProject);
      currentProject = null;
      continue;
    }
    if (
      isSectionHeader(line, [
        'education', 'skills', 'certifications', 'awards', 'summary'
      ])
    ) {
      currentSection = '';
      continue;
    }

    // Certification line matching
    const headerMatch = line.match(/^(?:certifications|certification|certs|cert)\s*[:\-]\s*(.*)/i);
    if (headerMatch) {
      const content = headerMatch[1].trim();
      const rawParts = content.split(/[,;|•\t]+/).map(p => p.trim()).filter(Boolean);
      const parts: string[] = [];
      for (let j = 0; j < rawParts.length; j++) {
        const p = rawParts[j];
        if (j > 0 && /^(?:associate|professional|expert|specialty|foundations|fundamentals|v\d\.\d)$/i.test(p)) {
          parts[parts.length - 1] = `${parts[parts.length - 1]}, ${p}`;
        } else {
          parts.push(p);
        }
      }
      parts.forEach(part => {
        const cleanPart = cleanCertName(part);
        if (cleanPart.length > 2 && cleanPart.length < 90) {
          if (!certifications.some(c => c.toLowerCase() === cleanPart.toLowerCase())) {
            certifications.push(cleanPart);
          }
        }
      });
      continue;
    }

    if (currentSection === 'certifications') {
      const hasExclude = excludeKeywords.some(w => lowerLine.includes(w));
      if (!hasExclude && !isDateOnly(line) && line.length > 3 && line.length < 90) {
        const cleanLine = cleanCertName(line);
        if (cleanLine.length > 3 && !certifications.some(c => c.toLowerCase() === cleanLine.toLowerCase())) {
          certifications.push(cleanLine);
        }
      }
      continue;
    }

    if (currentSection === '') {
      const hasExclude = excludeKeywords.some(w => lowerLine.includes(w));
      if (!hasExclude) {
        const CERT_KEYWORDS = [
          'certified', 'certificate', 'certification', 'credential', 'licence', 'license', 
          'accredited', 'nanodegree', 'scrummaster', 'pmp', 'comptia', 'ccna', 'hcia', 'hcip', 'hcie'
        ];
        const hasCertKeyword = CERT_KEYWORDS.some(k => lowerLine.includes(k));
        if (hasCertKeyword) {
          if (line.length > 5 && line.length < 100 && !line.includes('.') && !line.includes(';')) {
            const cleanLine = cleanCertName(line);
            if (!certifications.some(c => c.toLowerCase() === cleanLine.toLowerCase())) {
              certifications.push(cleanLine);
            }
          }
        }
      }
    }

    if (currentSection === 'experience') {
      const hasDuration = line.match(durationRegex);
      const isNextDuration = i + 1 < lines.length && lines[i+1].match(durationRegex);
      
      if (hasDuration || (isNextDuration && line.length < 80 && !isBullet)) {
        if (currentWork) {
          workExperience.push(currentWork);
        }
        
        let duration = '';
        let company = 'Company';
        let role = 'Software Engineer';
        
        if (hasDuration) {
          duration = hasDuration[0];
          const cleaned = line.replace(durationRegex, '').replace(/[()|,\s\-\–\—]+$/, '').replace(/^[()|,\s\-\–\—]+/, '').trim();
          if (cleaned) {
            const parts = cleaned.split(/[|,-]/).map(p => p.trim()).filter(Boolean);
            if (parts.length >= 2) {
              const isRole0 = roleKeywords.some(kw => parts[0].toLowerCase().includes(kw));
              const isRole1 = roleKeywords.some(kw => parts[1].toLowerCase().includes(kw));
              if (isRole0 && !isRole1) {
                role = parts[0];
                company = parts[1];
              } else {
                company = parts[0];
                role = parts[1];
              }
            } else {
              role = cleaned;
              if (i > 0 && lines[i-1] && lines[i-1].length < 60 && !lines[i-1].startsWith('-') && !lines[i-1].match(durationRegex)) {
                company = lines[i-1];
              }
            }
          }
        } else {
          const cleaned = line.replace(/[()|,\s\-\–\—]+$/, '').replace(/^[()|,\s\-\–\—]+/, '').trim();
          const parts = cleaned.split(/[|,-]/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            const isRole0 = roleKeywords.some(kw => parts[0].toLowerCase().includes(kw));
            const isRole1 = roleKeywords.some(kw => parts[1].toLowerCase().includes(kw));
            if (isRole0 && !isRole1) {
              role = parts[0];
              company = parts[1];
            } else {
              company = parts[0];
              role = parts[1];
            }
          } else {
            company = cleaned;
          }
          
          const nextDurationMatch = lines[i+1].match(durationRegex);
          if (nextDurationMatch) {
            duration = nextDurationMatch[0];
          }
          
          if (i + 2 < lines.length && lines[i+2].length < 80 && !lines[i+2].startsWith('-') && !lines[i+2].startsWith('•') && !lines[i+2].match(durationRegex)) {
            role = lines[i+2];
            i += 2;
          } else {
            i++;
          }
        }
        
        currentWork = {
          company,
          role,
          duration,
          description: ''
        };
      } else if (isBullet) {
        if (currentWork) {
          const bullet = line.replace(/^[-•\s]+/, '').trim();
          currentWork.description += (currentWork.description ? ' ' : '') + bullet;
        }
      } else if (currentWork && line.length > 10 && line.length < 250) {
        currentWork.description += (currentWork.description ? ' ' : '') + line;
      }
    } else if (currentSection === 'projects') {
      const techMatch = line.match(/^(?:tech|technologies):\s*(.*)/i);
      
      if (techMatch && currentProject) {
        const techs = techMatch[1].split(/[,|/]+/).map(t => t.trim()).filter(Boolean);
        currentProject.technologies = Array.from(new Set([...currentProject.technologies, ...techs]));
      } else if (isBullet) {
        if (currentProject) {
          const bullet = line.replace(/^[-•\s]+/, '').trim();
          currentProject.description += (currentProject.description ? ' ' : '') + bullet;
        }
      } else if (line.length < 60 && !line.includes('.') && !line.includes('?')) {
        const isMetadata = /^(?:group|personal|academic|team)\s+project$/i.test(line);
        const descTrim = currentProject?.description.trim() || '';
        const isContinuation = descTrim.length > 0 && !descTrim.endsWith('.') && !descTrim.endsWith('!') && !descTrim.endsWith('?');
        
        if (isMetadata) {
          if (currentProject) {
            currentProject.description += (currentProject.description ? ' ' : '') + line + '.';
          }
        } else if (isContinuation && currentProject) {
          currentProject.description += ' ' + line;
        } else if (currentProject && currentProject.description.length === 0) {
          currentProject.name += ' - ' + line;
        } else {
          if (currentProject) {
            projects.push(currentProject);
          }
          
          let name = line;
          let technologies: string[] = [];
          const inlineTechMatch = line.match(/\((.*?)\)/);
          if (inlineTechMatch) {
            name = line.replace(/\((.*?)\)/, '').trim();
            technologies = inlineTechMatch[1].split(/[,|/\s]+/).map(t => t.trim()).filter(Boolean);
          }
          
          currentProject = {
            name,
            description: '',
            technologies
          };
        }
      } else if (currentProject) {
        currentProject.description += (currentProject.description ? ' ' : '') + line;
      }
    }
  }

  if (currentWork) workExperience.push(currentWork);
  if (currentProject) projects.push(currentProject);

  let extractedCgpa: number | null = null;
  const cgpaMatch = text.match(/(?:cgpa|gpa)\s*(?:of)?\s*[:\-]?\s*([0-4]\.\d{1,2})/i);
  if (cgpaMatch) {
    const val = parseFloat(cgpaMatch[1]);
    if (val >= 0 && val <= 4.0) {
      extractedCgpa = val;
    }
  }

  return {
    skills: foundSkills,
    certifications,
    workExperience,
    projects,
    awards,
    cgpa: extractedCgpa,
  };
}
