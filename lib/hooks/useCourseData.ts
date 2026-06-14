'use client';

import courseData from '@/scripts/courseData.json';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Course {
  code?: string | null;
  name: string;
  year?: number;
  credits?: number | null;
  category: string;
  isCore: boolean;
  topics?: string[] | null;
}

export interface Program {
  id: string;
  name: string;
  type?: string;
  duration?: string;
  courses: Course[];
}

export interface University {
  universityId: string;
  universityName: string;
  programs: Program[];
  updatedAt?: Date;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getCoursesForUniversity(universityName: string, majorName?: string): string[] {
  if (!universityName) return [];

  const matched = courseData.universities.find(
    (uni) => uni.universityName.toLowerCase().trim() === universityName.toLowerCase().trim()
  );

  if (!matched) return [];

  if (majorName) {
    const majorLower = majorName.toLowerCase().trim();
    const matchedProg = matched.programs.find((prog) => {
      const progLower = prog.name.toLowerCase();
      if (majorLower === 'computer science') {
        const hasOtherSpec = progLower.includes('artificial intelligence') ||
                             progLower.includes('software engineering') ||
                             progLower.includes('data science') ||
                             progLower.includes('information systems') ||
                             progLower.includes('multimedia') ||
                             progLower.includes('network') ||
                             progLower.includes('intelligent') ||
                             progLower.includes('infrastructure') ||
                             progLower.includes('graphics') ||
                             progLower.includes('bioinformatics') ||
                             progLower.includes('data engineering') ||
                             progLower.includes('statistical data');
        return (progLower.includes('computer science') || progLower.includes('computing')) && !hasOtherSpec;
      }
      return progLower.includes(majorLower);
    });

    if (matchedProg) {
      const unique = Array.from(new Set(matchedProg.courses.map((c) => c.name)));
      return unique.sort();
    }
  }

  const coursesSet = new Set<string>();
  matched.programs.forEach((prog) => {
    prog.courses.forEach((course) => {
      coursesSet.add(course.name);
    });
  });
  return Array.from(coursesSet).sort();
}
