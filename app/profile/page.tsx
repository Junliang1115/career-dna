"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useApp, WorkExperience, Project } from "@/lib/context";
import { useAuth } from "@/lib/auth-context";
import { calculateCareerType, generateAiSummary } from "@/lib/scoring";
import { getArchetype } from "@/lib/types";
import { universities } from "@/lib/universities";
import { getCoursesForUniversity } from "@/lib/hooks/useCourseData";
import {
  Check,
  Upload,
  FileText,
  Trash2,
  Plus,
  X,
  LogOut,
  Link2,
  Globe,
  MapPin,
  Building2,
  ExternalLink,
  Briefcase,
  Users,
  ArrowRight,
  Edit2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { extractGithubUsername, fetchGithubSkills } from "@/lib/github";
import {
  extractTextFromFile,
  parseResumeWithLLM,
  ParsedResume,
} from "@/lib/resumeParser";
import { mockCandidates, mockJobs } from "@/lib/mockCandidates";
import Link from "next/link";
import courseData from "@/scripts/courseData.json";

const ACCENT = "var(--accent-green)";
const ACCENT_SUBTLE = "var(--accent-green-subtle)";
const ACCENT_BORDER = "var(--accent-green-border)";

// Generate a deterministic skill rating (1-10) based on skill name
function getSkillRating(skill: string): number {
  let hash = 0;
  for (let i = 0; i < skill.length; i++) {
    const char = skill.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 10) + 1;
}

// Custom inline SVG icons because the installed lucide-react package does not export Github/Linkedin
const LinkedinIcon = ({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const COMMON_SKILLS = [
  "Python",
  "JavaScript",
  "SQL",
  "Java",
  "React",
  "Node.js",
  "Git",
  "Docker",
  "AWS",
  "Data Analysis",
  "Machine Learning",
  "Figma",
  "Communication",
  "Problem Solving",
  "Leadership",
];

const COMMON_CERTS = [
  "AWS Certified Solutions Architect",
  "Google Data Analytics Certificate",
  "Meta Frontend Developer Certificate",
  "Microsoft Azure Fundamentals",
  "Cisco CCNA",
  "CompTIA Security+",
  "IBM Data Science Professional Certificate",
  "DeepLearning.AI TensorFlow Developer",
];

export default function ProfilePage() {
  const { profile, setProfile } = useApp();
  const { user, signOut } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showAllSavedSkills, setShowAllSavedSkills] = useState(false);
  const [showAllEditSkills, setShowAllEditSkills] = useState(false);

  const archetype = useMemo(() => {
    if (!profile.careerType) return null;
    return getArchetype(profile.careerType);
  }, [profile.careerType]);

  // ── Resume OCR state ─────────────────────────────────────────
  type ResumeState = "idle" | "parsing" | "done";
  const [resumeState, setResumeState] = useState<ResumeState>("idle");
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseMessage, setParseMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleResumeFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large — please upload a resume under 10MB.");
      return;
    }
    setResumeState("parsing");
    setParseProgress(5);
    setParseMessage("Starting…");
    setTranscript(file);

    try {
      // Step 1: Extract text (PDF or image OCR)
      const rawText = await extractTextFromFile(file, (p) => {
        setParseProgress(p.progress);
        setParseMessage(p.message);
      });

      if (!rawText.trim()) {
        alert(
          "Could not extract any text from this file. Try a different PDF or image.",
        );
        setResumeState("idle");
        return;
      }

      // Step 2: Parse with LLM
      setParseProgress(82);
      setParseMessage("AI analyzing resume…");
      const parsed = await parseResumeWithLLM(rawText, (p) => {
        setParseProgress(p.progress);
        setParseMessage(p.message);
      });

      // Merge parsed details into unified local state categories immediately
      setSkills((prev) => Array.from(new Set([...prev, ...parsed.skills])));
      setCertifications((prev) =>
        Array.from(new Set([...prev, ...parsed.certifications])),
      );
      setAwards((prev) => Array.from(new Set([...prev, ...parsed.awards])));

      setWorkExperience((prev) => {
        const merged = [...prev];
        parsed.workExperience.forEach((newWork) => {
          const exists = merged.some(
            (w) =>
              w.company.toLowerCase() === newWork.company.toLowerCase() &&
              w.role.toLowerCase() === newWork.role.toLowerCase(),
          );
          if (!exists) merged.push(newWork);
        });
        return merged;
      });

      setProjects((prev) => {
        const merged = [...prev];
        parsed.projects.forEach((newProj) => {
          const exists = merged.some(
            (p) => p.name.toLowerCase() === newProj.name.toLowerCase(),
          );
          if (!exists) merged.push(newProj);
        });
        return merged;
      });

      if (parsed.cgpa !== undefined && parsed.cgpa !== null) {
        setCgpa(String(parsed.cgpa));
      }

      // Construct a nice summary message of what was parsed
      const summaryParts = [];
      if (parsed.skills.length > 0)
        summaryParts.push(`${parsed.skills.length} skills`);
      if (parsed.certifications.length > 0)
        summaryParts.push(`${parsed.certifications.length} certifications`);
      if (parsed.workExperience.length > 0)
        summaryParts.push(`${parsed.workExperience.length} positions`);
      if (parsed.projects.length > 0)
        summaryParts.push(`${parsed.projects.length} projects`);
      if (parsed.awards.length > 0)
        summaryParts.push(`${parsed.awards.length} awards`);
      if (parsed.cgpa !== undefined && parsed.cgpa !== null)
        summaryParts.push(`CGPA: ${parsed.cgpa.toFixed(2)}`);

      if (summaryParts.length > 0) {
        setParsedSummary(
          `Successfully parsed and merged: ${summaryParts.join(", ")}.`,
        );
      } else {
        setParsedSummary(
          "Resume uploaded, but no profile sections were found to import.",
        );
      }

      setResumeState("done");
      setParseProgress(100);
      setParseMessage("Done!");
    } catch (err) {
      console.error("Resume parsing failed:", err);
      alert(
        "Failed to parse resume. Please try again or check the file format.",
      );
      setResumeState("idle");
    }
  };

  const [uni, setUni] = useState(profile.university);
  const [major, setMajor] = useState(profile.major);
  const [cgpa, setCgpa] = useState(profile.cgpa !== undefined ? String(profile.cgpa) : "");
  const [courses, setCourses] = useState<string[]>(profile.courses);
  const [transcript, setTranscript] = useState<File | null>(
    profile.transcriptFile,
  );
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [certifications, setCertifications] = useState<string[]>(
    profile.certifications,
  );
  const [linkedin, setLinkedin] = useState(profile.linkedin);
  const [github, setGithub] = useState(profile.github);
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");

  // Work Experience, Projects, Awards, and parsedSummary States
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(
    profile.workExperience || [],
  );
  const [projects, setProjects] = useState<Project[]>(
    (profile.projects || []).filter((p: any) => p.source === "manual"),
  );
  const [awards, setAwards] = useState<string[]>(profile.awards || []);
  const [parsedSummary, setParsedSummary] = useState<string | null>(null);

  // UI toggles
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Form input states for adding/editing items
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [editingWorkIdx, setEditingWorkIdx] = useState<number | null>(null);
  const [workCompanyInput, setWorkCompanyInput] = useState("");
  const [workRoleInput, setWorkRoleInput] = useState("");
  const [workDurationInput, setWorkDurationInput] = useState("");
  const [workDescInput, setWorkDescInput] = useState("");

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectIdx, setEditingProjectIdx] = useState<number | null>(
    null,
  );
  const [projNameInput, setProjNameInput] = useState("");
  const [projDescInput, setProjDescInput] = useState("");
  const [projTechInput, setProjTechInput] = useState("");

  const [awardInput, setAwardInput] = useState("");

  // GitHub / LinkedIn Verification States
  const [githubInput, setGithubInput] = useState("");
  const [githubError, setGithubError] = useState("");
  const [isVerifyingGithub, setIsVerifyingGithub] = useState(false);
  const [linkedinInput, setLinkedinInput] = useState("");

  // GitHub Repositories States
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const currentUni = universities.find((u) => u.name === uni);
  const availableCourses = getCoursesForUniversity(uni, major);

  const hasChanges = useMemo(() => {
    if (uni !== profile.university) return true;
    if (major !== profile.major) return true;
    const normalizedCgpa = profile.cgpa !== undefined ? String(profile.cgpa) : "";
    if (cgpa !== normalizedCgpa) return true;
    if (linkedin !== profile.linkedin) return true;
    if (github !== profile.github) return true;
    if (transcript !== profile.transcriptFile) return true;

    const arraysMatch = (a: string[], b: string[]) => {
      if (a.length !== b.length) return false;
      return a.every((val, i) => val === b[i]);
    };
    if (!arraysMatch(courses, profile.courses)) return true;
    if (!arraysMatch(skills, profile.skills || [])) return true;
    if (!arraysMatch(certifications, profile.certifications || [])) return true;
    if (!arraysMatch(awards, profile.awards || [])) return true;

    if (workExperience.length !== (profile.workExperience || []).length)
      return true;
    for (let i = 0; i < workExperience.length; i++) {
      const w1 = workExperience[i];
      const w2 = profile.workExperience[i];
      if (
        !w2 ||
        w1.company !== w2.company ||
        w1.role !== w2.role ||
        w1.duration !== w2.duration ||
        w1.description !== w2.description
      )
        return true;
    }

    const pManual = projects;
    const pProfile = (profile.projects || []).filter(
      (p: any) => p.source === "manual",
    );
    if (pManual.length !== pProfile.length) return true;
    for (let i = 0; i < pManual.length; i++) {
      const p1 = pManual[i];
      const p2 = pProfile[i];
      if (
        !p2 ||
        p1.name !== p2.name ||
        p1.description !== p2.description ||
        !arraysMatch(p1.technologies || [], p2.technologies || [])
      )
        return true;
    }

    return false;
  }, [
    uni,
    major,
    courses,
    transcript,
    skills,
    certifications,
    linkedin,
    github,
    workExperience,
    projects,
    awards,
    profile,
  ]);

  // Load repos when GitHub account is linked
  useEffect(() => {
    if (github) {
      const loadRepos = async () => {
        setLoadingRepos(true);
        try {
          const result = await fetchGithubSkills(github);
          if (result.repos) {
            setRepos(result.repos);
          }
        } catch (err) {
          console.error("Failed to load repositories:", err);
        } finally {
          setLoadingRepos(false);
        }
      };
      loadRepos();
    } else {
      setRepos([]);
    }
  }, [github]);

  // Auto-populate all courses when university/major changes
  useEffect(() => {
    if (uni && major) {
      const courses = getCoursesForUniversity(uni, major);
      if (courses.length > 0) {
        setCourses(courses);
      }
    }
  }, [uni, major]);

  const handleVerifyGithub = async () => {
    const username = extractGithubUsername(githubInput);
    if (!username) {
      setGithubError("Please enter a valid GitHub username or profile link.");
      return;
    }

    setIsVerifyingGithub(true);
    setGithubError("");

    try {
      const userResponse = await fetch(
        `https://api.github.com/users/${username}`,
      );
      if (userResponse.status === 404) {
        setGithubError("GitHub account not found. Please check the username.");
        setIsVerifyingGithub(false);
        return;
      }
      if (!userResponse.ok) {
        throw new Error("GitHub API error");
      }

      setGithub(username);
      setGithubInput("");

      const result = await fetchGithubSkills(username);
      if (result.skills.length > 0) {
        setSkills((prev) => Array.from(new Set([...prev, ...result.skills])));
      }
      if (result.repos.length > 0) {
        setRepos(result.repos);
      }
    } catch (err) {
      console.error(err);
      setGithubError(
        "Failed to verify account due to a network error. Please try again.",
      );
    } finally {
      setIsVerifyingGithub(false);
    }
  };

  // Sync state when profile loads (e.g. from localStorage)
  useEffect(() => {
    if (profile) {
      setUni(profile.university || "");
      setMajor(profile.major || "");
      setCgpa(profile.cgpa !== undefined ? String(profile.cgpa) : "");
      setCourses(profile.courses || []);
      setSkills(profile.skills || []);
      setCertifications(profile.certifications || []);
      setLinkedin(profile.linkedin || "");
      setGithub(profile.github || "");
      setCompanyName(profile.companyName || "");
      setIndustry(profile.industry || "");
      setCompanySize(profile.companySize || "");
      setHiringFor(profile.hiringFor || "");
      setCompanyDescription(profile.companyDescription || "");
      setCompanyWebsite(profile.companyWebsite || "");
      setCompanyLinkedin(profile.companyLinkedin || "");
      setCompanyLocation(profile.companyLocation || "");
      setCompanyPerks(profile.companyPerks || []);
      setWorkExperience(profile.workExperience || []);
      setProjects(
        (profile.projects || []).filter((p: any) => p.source === "manual"),
      );
      setAwards(profile.awards || []);
    }
  }, [profile]);

  const toggleCourse = (course: string) => {
    setCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course],
    );
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed))
      setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  // Certification management
  const addCert = (cert: string) => {
    const trimmed = cert.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications((prev) => [...prev, trimmed]);
    }
    setCertInput("");
  };

  const removeCert = (cert: string) => {
    setCertifications((prev) => prev.filter((c) => c !== cert));
  };

  const toggleCert = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert],
    );
  };

  // Work Experience CRUD
  const addWork = () => {
    if (workCompanyInput.trim() && workRoleInput.trim()) {
      setWorkExperience((prev) => [
        ...prev,
        {
          company: workCompanyInput.trim(),
          role: workRoleInput.trim(),
          duration: workDurationInput.trim(),
          description: workDescInput.trim(),
        },
      ]);
      setIsAddingWork(false);
      setWorkCompanyInput("");
      setWorkRoleInput("");
      setWorkDurationInput("");
      setWorkDescInput("");
    }
  };

  const startEditWork = (idx: number) => {
    const item = workExperience[idx];
    setEditingWorkIdx(idx);
    setWorkCompanyInput(item.company);
    setWorkRoleInput(item.role);
    setWorkDurationInput(item.duration);
    setWorkDescInput(item.description);
  };

  const saveEditWork = () => {
    if (
      editingWorkIdx !== null &&
      workCompanyInput.trim() &&
      workRoleInput.trim()
    ) {
      setWorkExperience((prev) => {
        const next = [...prev];
        next[editingWorkIdx] = {
          company: workCompanyInput.trim(),
          role: workRoleInput.trim(),
          duration: workDurationInput.trim(),
          description: workDescInput.trim(),
        };
        return next;
      });
      setEditingWorkIdx(null);
      setWorkCompanyInput("");
      setWorkRoleInput("");
      setWorkDurationInput("");
      setWorkDescInput("");
    }
  };

  const deleteWork = (idx: number) => {
    setWorkExperience((prev) => prev.filter((_, i) => i !== idx));
  };

  // Course composition analysis
  const formatCategoryName = (cat: string): string => {
    if (!cat) return "";
    const mapping: Record<string, string> = {
      "ai-ml": "AI & Machine Learning",
      "data-science": "Data Science",
      "software-engineering": "Software Engineering",
      "hardware-architecture": "Hardware & Architecture",
      "data-structures": "Algorithms & Data Structures",
      "operating-systems": "Operating Systems",
      "final-year-project": "Final Year Project",
      "embedded-systems": "Embedded Systems",
      programming: "Programming Fundamentals",
      networking: "Computer Networks & Security",
      database: "Database Systems",
      mathematics: "Mathematics",
      professional: "Professional Development",
      general: "General / Other",
    };

    if (mapping[cat.toLowerCase()]) return mapping[cat.toLowerCase()];

    return cat
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const analyzeCourseComposition = () => {
    if (!courses || courses.length === 0) return [];

    const categoryMap: Record<string, string> = {};
    if (courseData && Array.isArray(courseData.universities)) {
      courseData.universities.forEach((uni) => {
        if (uni && Array.isArray(uni.programs)) {
          uni.programs.forEach((prog) => {
            if (prog && Array.isArray(prog.courses)) {
              prog.courses.forEach((course) => {
                if (course && course.name) {
                  categoryMap[course.name.trim()] =
                    course.category || "general";
                }
              });
            }
          });
        }
      });
    }

    const counts: Record<string, number> = {};
    courses.forEach((courseName) => {
      const category = categoryMap[courseName.trim()] || "general";
      counts[category] = (counts[category] || 0) + 1;
    });

    const total = courses.length;
    const analysis = Object.keys(counts).map((category) => {
      const count = counts[category];
      const percentage = Math.round((count / total) * 100);
      return {
        category: formatCategoryName(category),
        count,
        percentage,
      };
    });

    return analysis.sort((a, b) => b.percentage - a.percentage);
  };

  // Projects CRUD & Unification
  const getUnifiedProjects = () => {
    const githubProj = repos.map((repo) => ({
      id: `github-${repo.id}`,
      name: repo.name,
      description: repo.description,
      technologies: repo.language ? [repo.language] : [],
      isGithub: true,
      githubUrl: repo.html_url,
      repoName: repo.full_name || repo.name,
      isManual: false,
      index: -1,
    }));

    const manualProj = projects.map((proj, idx) => ({
      id: `manual-${idx}`,
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies || [],
      isGithub: false,
      githubUrl: "",
      repoName: "",
      isManual: true,
      index: idx,
    }));

    return [...githubProj, ...manualProj];
  };

  const deleteRepo = (repoId: number | string) => {
    setRepos((prev) => prev.filter((r) => r.id !== repoId));
  };

  const addProject = () => {
    if (projNameInput.trim()) {
      const techs = projTechInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      setProjects((prev) => [
        ...prev,
        {
          name: projNameInput.trim(),
          description: projDescInput.trim(),
          technologies: techs,
        },
      ]);
      setIsAddingProject(false);
      setProjNameInput("");
      setProjDescInput("");
      setProjTechInput("");
    }
  };

  const startEditProject = (idx: number) => {
    const item = projects[idx];
    setEditingProjectIdx(idx);
    setProjNameInput(item.name);
    setProjDescInput(item.description);
    setProjTechInput(item.technologies.join(", "));
  };

  const saveEditProject = () => {
    if (editingProjectIdx !== null && projNameInput.trim()) {
      const techs = projTechInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      setProjects((prev) => {
        const next = [...prev];
        next[editingProjectIdx] = {
          name: projNameInput.trim(),
          description: projDescInput.trim(),
          technologies: techs,
        };
        return next;
      });
      setEditingProjectIdx(null);
      setProjNameInput("");
      setProjDescInput("");
      setProjTechInput("");
    }
  };

  const deleteProject = (idx: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== idx));
  };

  // Awards CRUD
  const addAward = () => {
    if (awardInput.trim()) {
      setAwards((prev) => [...prev, awardInput.trim()]);
      setAwardInput("");
    }
  };

  const deleteAward = (idx: number) => {
    setAwards((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTranscript(file);
  };

  const handleSave = async () => {
    await doSave();
  };

  const doSave = async () => {
    // Merge GitHub repos + manual projects into one list for the JSON
    const allProjects = [
      ...repos.map((repo) => ({
        name: repo.name,
        description: repo.description || "",
        technologies: repo.language ? [repo.language] : [],
        source: "github",
        githubUrl: repo.html_url,
      })),
      ...projects.map((p) => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies || [],
        source: "manual",
        githubUrl: "",
      })),
    ];

    let quizSummary = null;
    if (profile.answers && Object.keys(profile.answers).length > 0) {
      try {
        const result = calculateCareerType(profile.answers);
        const type = profile.careerType || result.careerType;
        const archetype = getArchetype(type);
        const aiSummary = generateAiSummary(type, result, profile.answers);
        quizSummary = {
          careerType: type,
          archetype,
          riasecScores: result.riasecScores,
          discScores: result.discScores,
          aiSummary,
        };
      } catch (err) {
        console.error("Failed to generate quiz summary for profile JSON:", err);
      }
    } else if (profile.careerType) {
      try {
        const archetype = getArchetype(profile.careerType);
        quizSummary = {
          careerType: profile.careerType,
          archetype,
          riasecScores: null,
          discScores: null,
          aiSummary: null,
        };
      } catch (err) {
        console.error(
          "Failed to generate fallback quiz summary for profile JSON:",
          err,
        );
      }
    }

    const profileData = {
      university: uni,
      major,
      cgpa: cgpa ? parseFloat(cgpa) : undefined,
      courses,
      skills,
      certifications,
      linkedin,
      github,
      workExperience,
      projects: allProjects,
      awards,
      careerType: profile.careerType || "",
      answers: profile.answers || {},
      quizSummary,
      savedAt: new Date().toISOString(),
    };

    setProfile({
      university: uni,
      major,
      cgpa: cgpa ? parseFloat(cgpa) : undefined,
      courses,
      transcriptFile: transcript,
      skills,
      certifications,
      linkedin,
      github,
      workExperience,
      projects,
      awards,
    });

    // Save to public/data/profile.json via API route
    try {
      await fetch("/api/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
    } catch (err) {
      console.error("Failed to save profile JSON:", err);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const hasCareerType = !!profile.careerType;

  // ── Employer profile state ─────────────────────────────────
  const isEmployer = profile.role === "employer";
  const [editCompany, setEditCompany] = useState(false);
  const [companyName, setCompanyName] = useState(profile.companyName || "");
  const [industry, setIndustry] = useState(profile.industry || "");
  const [companySize, setCompanySize] = useState(profile.companySize || "");
  const [hiringFor, setHiringFor] = useState(profile.hiringFor || "");
  const [companyDescription, setCompanyDescription] = useState(
    profile.companyDescription || "",
  );
  const [companyWebsite, setCompanyWebsite] = useState(
    profile.companyWebsite || "",
  );
  const [companyLinkedin, setCompanyLinkedin] = useState(
    profile.companyLinkedin || "",
  );
  const [companyLocation, setCompanyLocation] = useState(
    profile.companyLocation || "",
  );
  const [companyPerks, setCompanyPerks] = useState<string[]>(
    profile.companyPerks || [],
  );

  const handleSaveEmployer = () => {
    setProfile({
      companyName,
      industry,
      companySize,
      hiringFor,
      companyDescription,
      companyWebsite,
      companyLinkedin,
      companyLocation,
      companyPerks,
    });
    setEditCompany(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const INDUSTRIES = [
    "Fintech",
    "E-commerce",
    "Cybersecurity",
    "Consulting",
    "Healthcare",
    "Education",
    "Media & Entertainment",
    "Logistics & Supply Chain",
    "Real Estate",
    "Manufacturing",
    "Telecommunications",
    "Government",
    "Other",
  ];

  const COMPANY_SIZES = ["Startup", "Mid-size", "Enterprise"];

  const AVAILABLE_PERKS = [
    { id: "hybrid", label: "🏡 Remote / Hybrid Work" },
    { id: "flexible", label: "⏰ Flexible Hours" },
    { id: "medical", label: "🏥 Health & Medical" },
    { id: "learning", label: "📚 L&D Budget" },
    { id: "snacks", label: "🍕 Free Snacks & Lunches" },
    { id: "wellness", label: "🧘 Wellness Programs" },
    { id: "equity", label: "💼 Equity / Stock Options" },
    { id: "retreats", label: "✈️ Team Retreats" },
    { id: "devices", label: "💻 Premium Work Devices" },
  ];

  return (
    <div
      style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 120px" }}
    >
      {/* ── Top Bar: email + sign out ─────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          {user?.email && (
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {user.email}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={async () => {
              const newRole =
                profile.role === "employer" ? "candidate" : "employer";
              setProfile({ role: newRole });
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-green)";
              e.currentTarget.style.color = "var(--accent-green)";
              e.currentTarget.style.background = "var(--accent-green-subtle)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Users size={13} />
            Switch to {profile.role === "employer" ? "Candidate" : "Employer"}
          </button>

          {user && (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: signingOut ? "not-allowed" : "pointer",
                opacity: signingOut ? 0.6 : 1,
                transition: "all 0.15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-red)";
                e.currentTarget.style.color = "var(--accent-red)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <LogOut size={13} />
              {signingOut ? "" : "Sign out"}
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          EMPLOYER PROFILE  (shown when role === 'employer')
      ══════════════════════════════════════════════════════ */}
      {isEmployer && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* ── Hero Card with Banner & Floating Logo ───────────────── */}
          <div
            style={{
              borderRadius: 16,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* HSL Dark Green Gradient Banner */}
            <div
              style={{
                height: 160,
                background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
                width: "100%",
              }}
            />

            {/* Avatar container */}
            <div
              style={{
                position: "absolute",
                top: 110,
                left: 32,
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "var(--surface)",
                border: "4px solid var(--surface)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--accent-green-subtle)",
                  color: "var(--accent-green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 700,
                  fontFamily: "'Newsreader', serif",
                }}
              >
                {companyName
                  ? companyName
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "YC"}
              </div>
            </div>

            {/* Card Info Content */}
            <div
              style={{
                padding: "56px 32px 28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <h1
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "var(--text)",
                        fontFamily: "'Newsreader', serif",
                        lineHeight: 1.2,
                      }}
                    >
                      {companyName || "Your Company"}
                    </h1>
                    {industry && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: "var(--accent-green-subtle)",
                          border: "1px solid var(--accent-green-border)",
                          color: "var(--accent-green)",
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {industry}
                      </span>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      flexWrap: "wrap",
                      marginTop: 4,
                    }}
                  >
                    {companyLocation && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <MapPin
                          size={14}
                          style={{ color: "var(--text-tertiary)" }}
                        />
                        {companyLocation}
                      </span>
                    )}
                    {companyWebsite && (
                      <a
                        href={
                          companyWebsite.startsWith("http")
                            ? companyWebsite
                            : "https://" + companyWebsite
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--accent-green)",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.textDecoration = "none")
                        }
                      >
                        <Globe size={14} />
                        {companyWebsite
                          .replace("https://", "")
                          .replace("http://", "")
                          .replace("www.", "")}
                        <ExternalLink size={10} style={{ opacity: 0.7 }} />
                      </a>
                    )}
                    {companyLinkedin && (
                      <a
                        href={
                          companyLinkedin.startsWith("http")
                            ? companyLinkedin
                            : "https://linkedin.com/company/" + companyLinkedin
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "#0A66C2",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.textDecoration = "none")
                        }
                      >
                        <LinkedinIcon size={14} />
                        LinkedIn
                        <ExternalLink size={10} style={{ opacity: 0.7 }} />
                      </a>
                    )}
                  </div>
                </div>

                {!editCompany ? (
                  <button
                    onClick={() => setEditCompany(true)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-green)";
                      e.currentTarget.style.color = "var(--accent-green)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleSaveEmployer}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "var(--accent-green)",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {saved ? "✓ Saved" : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditCompany(false);
                        setCompanyName(profile.companyName || "");
                        setIndustry(profile.industry || "");
                        setCompanySize(profile.companySize || "");
                        setHiringFor(profile.hiringFor || "");
                        setCompanyDescription(profile.companyDescription || "");
                        setCompanyWebsite(profile.companyWebsite || "");
                        setCompanyLinkedin(profile.companyLinkedin || "");
                        setCompanyLocation(profile.companyLocation || "");
                        setCompanyPerks(profile.companyPerks || []);
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--text-secondary)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Company Info Inputs when Editing */}
              {editCompany && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    marginTop: 24,
                    borderTop: "1px solid var(--border)",
                    paddingTop: 24,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Company Name
                      </label>
                      <input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. TechCorp Malaysia"
                        style={{ ...inputStyle }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Industry
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select industry</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Location
                      </label>
                      <input
                        value={companyLocation}
                        onChange={(e) => setCompanyLocation(e.target.value)}
                        placeholder="e.g. Kuala Lumpur, Malaysia"
                        style={{ ...inputStyle }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Hiring For
                      </label>
                      <input
                        value={hiringFor}
                        onChange={(e) => setHiringFor(e.target.value)}
                        placeholder="e.g. Full Stack Engineers"
                        style={{ ...inputStyle }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Website URL
                      </label>
                      <input
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="e.g. https://techcorp.com"
                        style={{ ...inputStyle }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        LinkedIn Company URL
                      </label>
                      <input
                        value={companyLinkedin}
                        onChange={(e) => setCompanyLinkedin(e.target.value)}
                        placeholder="e.g. https://linkedin.com/company/techcorp"
                        style={{ ...inputStyle }}
                      />
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Company Size
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {COMPANY_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setCompanySize(size)}
                          style={{
                            flex: 1,
                            padding: "8px 4px",
                            borderRadius: 8,
                            border: `1.5px solid ${companySize === size ? "var(--accent-green)" : "var(--border)"}`,
                            background:
                              companySize === size
                                ? "var(--accent-green-subtle)"
                                : "transparent",
                            color:
                              companySize === size
                                ? "var(--accent-green)"
                                : "var(--text-secondary)",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      About Us / Mission
                    </label>
                    <textarea
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="Describe your company's mission, culture, and core focus..."
                      rows={4}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        fontFamily: "inherit",
                        lineHeight: 1.5,
                      }}
                    />
                  </div>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Culture & Perks (Select all that apply)
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      {AVAILABLE_PERKS.map((perk) => {
                        const isSelected = companyPerks.includes(perk.id);
                        return (
                          <button
                            key={perk.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setCompanyPerks((prev) =>
                                  prev.filter((p) => p !== perk.id),
                                );
                              } else {
                                setCompanyPerks((prev) => [...prev, perk.id]);
                              }
                            }}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: `1px solid ${isSelected ? "var(--accent-green-border)" : "var(--border)"}`,
                              background: isSelected
                                ? "var(--accent-green-subtle)"
                                : "var(--surface)",
                              color: isSelected
                                ? "var(--accent-green)"
                                : "var(--text-secondary)",
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              textAlign: "left",
                              transition: "all 0.15s",
                            }}
                          >
                            <span>{perk.label}</span>
                            {isSelected && (
                              <Check
                                size={14}
                                style={{ color: "var(--accent-green)" }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Read-only About & Info (hidden in edit mode) ────────── */}
          {!editCompany && (
            <>
              {/* About Us Card */}
              {companyDescription && (
                <div
                  style={{
                    padding: "28px 32px",
                    borderRadius: 16,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--text)",
                      fontFamily: "'Newsreader', serif",
                    }}
                  >
                    About Us & Mission
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {companyDescription}
                  </p>
                </div>
              )}

              {/* Company Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                }}
              >
                {[
                  { label: "Company Size", value: companySize || "—" },
                  { label: "Industry Field", value: industry || "—" },
                  { label: "Hiring Focus", value: hiringFor || "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "16px 20px",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 5,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Active Job Listings Section ─────────────────────────── */}
          {!editCompany && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text)",
                    fontFamily: "'Newsreader', serif",
                  }}
                >
                  Active Job Listings
                </h2>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {mockJobs.length} roles total
                </span>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {mockJobs.map((job) => {
                  // Calculate dynamic matching candidates from the pool
                  const jobSkills = job.requiredSkills.map((s) =>
                    s.toLowerCase(),
                  );
                  const matchingCount = mockCandidates.filter((c) => {
                    const candSkills = c.topSkills.map((s) => s.toLowerCase());
                    const overlap = candSkills.filter((s) =>
                      jobSkills.includes(s),
                    );
                    // Same balanced score calculation
                    const rawTechRatio =
                      overlap.length /
                      Math.min(4, Math.max(jobSkills.length, 1));
                    const techScoreRatio = Math.pow(rawTechRatio, 1.25);
                    const technicalSkillScore = Math.round(
                      techScoreRatio * 100,
                    );
                    const softSkillScore = c.softSkillScore;
                    const overallScore = Math.round(
                      0.5 * technicalSkillScore + 0.5 * softSkillScore,
                    );
                    return overallScore >= 70; // 70%+ match
                  }).length;

                  return (
                    <div
                      key={job.id}
                      style={{
                        padding: "24px 28px",
                        borderRadius: 14,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                        transition: "all 0.2s ease-in-out",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--accent-green-border)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(45, 106, 79, 0.06)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 1px 3px rgba(0,0,0,0.02)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <h3
                              style={{
                                fontSize: 17,
                                fontWeight: 650,
                                color: "var(--text)",
                              }}
                            >
                              {job.title}
                            </h3>
                            <span
                              style={{
                                fontSize: 10,
                                padding: "2px 8px",
                                borderRadius: 10,
                                background: "var(--accent-green-subtle)",
                                color: "var(--accent-green)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                              }}
                            >
                              {job.field}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--text-secondary)",
                              marginTop: 6,
                              lineHeight: 1.5,
                              maxWidth: 520,
                            }}
                          >
                            {job.description.length > 130
                              ? job.description.slice(0, 130) + "..."
                              : job.description}
                          </p>
                        </div>

                        {/* Matching pill */}
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 20,
                            background: "rgba(45, 106, 79, 0.08)",
                            border: "1px solid var(--accent-green-border)",
                            color: "var(--accent-green)",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <span>👥 {matchingCount} matches</span>
                        </div>
                      </div>

                      {/* Required Skills chips */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-tertiary)",
                            fontWeight: 500,
                            marginRight: 4,
                          }}
                        >
                          Skills:
                        </span>
                        {job.requiredSkills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: "var(--background)",
                              border: "1px solid var(--border)",
                              fontSize: 11,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 5 && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-tertiary)",
                            }}
                          >
                            +{job.requiredSkills.length - 5} more
                          </span>
                        )}

                        {/* Talent Map Route Button */}
                        <Link
                          href={"/talent?jobId=" + job.id}
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            textDecoration: "none",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--accent-green)",
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1px solid var(--accent-green-border)",
                            transition: "all 0.15s",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background =
                              "var(--accent-green)";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--accent-green)";
                          }}
                        >
                          Talent Map
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MBTI Result Header (candidates only) ─────────────── */}
      {!isEmployer && (
        <div
          style={{
            position: "relative",
            padding: "40px",
            borderRadius: 20,
            background: hasCareerType
              ? "linear-gradient(135deg, var(--accent-green-subtle) 0%, rgba(45,106,79,0.03) 100%)"
              : "var(--surface)",
            border: `1px solid ${hasCareerType ? "var(--accent-green-border)" : "var(--border)"}`,
            boxShadow: hasCareerType
              ? "0 10px 30px -10px rgba(45,106,79,0.12), 0 1px 3px rgba(45,106,79,0.05)"
              : "none",
            marginBottom: 36,
            overflow: "hidden",
          }}
        >
          {/* Decorative background glow */}
          {hasCareerType && (
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          )}

          {hasCareerType && archetype ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--accent-green)",
                  letterSpacing: "0.1em",
                  marginBottom: 20,
                  textTransform: "uppercase",
                }}
              >
                Your Career Type
              </p>

              {/* Type display letter-by-letter — e.g. "D-R" */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {profile.careerType.split("").map((letter, i) => (
                  <div
                    key={i}
                    style={{
                      width: letter === "-" ? 20 : 48,
                      height: 58,
                      borderRadius: 6,
                      border:
                        letter === "-" ? "none" : "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: letter === "-" ? 16 : 22,
                      fontWeight: 400,
                      color:
                        letter === "-" ? "var(--text-tertiary)" : "var(--text)",
                      background: letter === "-" ? "transparent" : "var(--bg)",
                      fontFamily: "'Newsreader', serif",
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>

              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 400,
                  color: "var(--text)",
                  marginBottom: 8,
                  fontFamily: "'Newsreader', serif",
                }}
              >
                {archetype.name}
              </h2>

              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  fontStyle: "italic",
                  marginBottom: 24,
                }}
              >
                &ldquo;{archetype.tagline}&rdquo;
              </p>

              <Link
                href="/results"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 22px",
                  borderRadius: 8,
                  background: ACCENT,
                  color: "white",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <span>View full results</span>
                <ArrowRight size={14} style={{ marginLeft: 2 }} />
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  marginBottom: 20,
                }}
              >
                You haven't taken the career archetype quiz yet.
              </p>
              <Link
                href="/quiz"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 28px",
                  borderRadius: 10,
                  background: "var(--accent-green)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(45,106,79,0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                <span>Start Personality Quiz</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Sections (candidates only) ─────────────────────────── */}
      {!isEmployer && (
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {/* ── Resume & CV ──────────────────────────────────────── */}
          <section>
            <SectionHeader label="Resume & CV" />
            <input
              ref={resumeFileRef}
              type="file"
              accept=".pdf,image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleResumeFile(f);
              }}
            />

            {resumeState === "parsing" && (
              <div
                style={{
                  padding: "16px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    {parseMessage}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--accent-green)" }}>
                    {parseProgress}%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "var(--border)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${parseProgress}%`,
                      background: ACCENT,
                      borderRadius: 2,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            )}

            {parsedSummary && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "var(--accent-green-subtle)",
                  border: "1px solid var(--accent-green-border)",
                  marginBottom: 12,
                }}
              >
                <Check
                  size={16}
                  color="var(--accent-green)"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--accent-green)",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Resume Parsed Successfully!
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--accent-green)",
                      opacity: 0.9,
                    }}
                  >
                    {parsedSummary}
                  </p>
                </div>
                <button
                  onClick={() => setParsedSummary(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--accent-green)",
                    padding: 2,
                    display: "flex",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {transcript ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div
                  style={{
                    padding: "14px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <FileText
                    size={18}
                    style={{ color: ACCENT, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {transcript.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {(transcript.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTranscript(null);
                      setParsedSummary(null);
                    }}
                    style={{
                      padding: 6,
                      borderRadius: 6,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      display: "flex",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => resumeFileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = ACCENT;
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = "var(--border)";
                  const f = e.dataTransfer.files[0];
                  if (f) handleResumeFile(f);
                }}
                style={{
                  width: "100%",
                  padding: "28px",
                  borderRadius: 10,
                  border: "2px dashed var(--border)",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--text-secondary)",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = ACCENT)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              >
                <Upload size={18} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                  }}
                >
                  Upload Resume / CV
                </span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  Supports PDF format up to 10MB
                </span>
              </div>
            )}
          </section>

          {/* ── University & Major ───────────────────────────────── */}
          <section>
            <SectionHeader
              label="University & Major"
              action={
                uni && major && courses.length > 0 ? (
                  <button
                    onClick={() => setShowCourseDetail((d) => !d)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 20,
                      border: `1px solid ${showCourseDetail ? ACCENT_BORDER : "var(--border)"}`,
                      background: showCourseDetail
                        ? ACCENT_SUBTLE
                        : "transparent",
                      color: showCourseDetail
                        ? ACCENT
                        : "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {showCourseDetail ? "Hide Details" : "View Details"}
                  </button>
                ) : null
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select
                value={uni}
                onChange={(e) => {
                  setUni(e.target.value);
                  setMajor("");
                }}
                style={selectStyle}
              >
                <option value="">Select university...</option>
                {universities.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                disabled={!uni}
                style={{
                  ...selectStyle,
                  borderColor: !uni ? "var(--border)" : "var(--border)",
                  color: !uni ? "var(--text-secondary)" : "var(--text)",
                  cursor: !uni ? "not-allowed" : "pointer",
                }}
              >
                <option value="">Select major...</option>
                {currentUni?.majors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="CGPA (e.g. 3.82)"
                value={cgpa}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val)) {
                    setCgpa(val);
                  }
                }}
                style={{
                  ...selectStyle,
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Course Composition Analysis – shown only when "View Details" is clicked */}
            {uni &&
              major &&
              showCourseDetail &&
              availableCourses.length > 0 &&
              courses.length > 0 &&
              (() => {
                const composition = analyzeCourseComposition();
                return (
                  <div style={{ marginTop: 20 }}>
                    <div
                      style={{
                        padding: "16px 18px",
                        borderRadius: 12,
                        border: "1px solid var(--accent-green-border)",
                        background: "var(--accent-green-subtle)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 14,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--accent-green)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          Course Composition
                        </p>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--accent-green)",
                            opacity: 0.8,
                            fontWeight: 500,
                          }}
                        >
                          {courses.length} courses · {composition.length} fields
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {composition.map((item) => (
                          <div
                            key={item.category}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 5,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "var(--text)",
                                }}
                              >
                                {item.category}
                              </span>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "var(--accent-green)",
                                }}
                              >
                                {item.percentage}%
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 400,
                                    color: "var(--text-secondary)",
                                    marginLeft: 4,
                                  }}
                                >
                                  ({item.count}{" "}
                                  {item.count === 1 ? "course" : "courses"})
                                </span>
                              </span>
                            </div>
                            <div
                              style={{
                                height: 7,
                                borderRadius: 4,
                                background: "rgba(0,0,0,0.07)",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${item.percentage}%`,
                                  background: ACCENT,
                                  borderRadius: 4,
                                  transition:
                                    "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
          </section>

          {/* ── Skills ───────────────────────────────────────────── */}
          <section>
            <SectionHeader label="Skills" />
            {skills.length > 0 &&
              (hasChanges ? (
                /* Unsaved/Edit state: One row of chips, see more button on the right */
                <div
                  style={{
                    display: "flex",
                    flexWrap: showAllEditSkills ? "wrap" : "nowrap",
                    overflow: showAllEditSkills ? "visible" : "hidden",
                    gap: 6,
                    marginBottom: 12,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  {(showAllEditSkills ? skills : skills.slice(0, 5)).map(
                    (skill) => (
                      <span
                        key={skill}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 10px",
                          borderRadius: 20,
                          background: ACCENT_SUBTLE,
                          color: ACCENT,
                          fontSize: 12,
                          fontWeight: 500,
                          border: `1px solid ${ACCENT_BORDER}`,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            color: ACCENT,
                            opacity: 0.6,
                          }}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ),
                  )}

                  {skills.length > 5 && (
                    <button
                      onClick={() => setShowAllEditSkills(!showAllEditSkills)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "5px 12px",
                        borderRadius: 20,
                        border: `1px solid var(--border)`,
                        background: "var(--surface)",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                        fontSize: 11,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {showAllEditSkills ? "See Less" : "See More"}
                    </button>
                  )}
                </div>
              ) : (
                /* Saved state: Full row one skill, top 5, see more button */
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  {(showAllSavedSkills ? skills : skills.slice(0, 5)).map(
                    (skill) => {
                      const level = getSkillRating(skill);
                      return (
                        <div
                          key={skill}
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 12,
                            padding: "12px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--text)",
                              }}
                            >
                              {skill}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: ACCENT,
                                }}
                              >
                                {level}/10
                              </span>
                              <button
                                onClick={() => removeSkill(skill)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 2,
                                  display: "flex",
                                  color: "var(--text-secondary)",
                                  opacity: 0.6,
                                  borderRadius: 4,
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          <div
                            style={{
                              height: 6,
                              borderRadius: 3,
                              background: "var(--border)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${level * 10}%`,
                                height: "100%",
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${ACCENT}, #52B788)`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}

                  {/* See More / See Less Toggle Button */}
                  {skills.length > 5 && (
                    <button
                      onClick={() => setShowAllSavedSkills(!showAllSavedSkills)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: `1px solid var(--border)`,
                        background: "var(--surface)",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                        alignSelf: "flex-start",
                        transition: "all 0.2s",
                      }}
                    >
                      {showAllSavedSkills
                        ? "See Less"
                        : `See ${skills.length - 5} More`}
                    </button>
                  )}
                </div>
              ))}

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                placeholder="Add a custom skill..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => addSkill(skillInput)}
                disabled={!skillInput.trim()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: skillInput.trim() ? ACCENT : "var(--border)",
                  color: "white",
                  fontSize: 13,
                  cursor: skillInput.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </section>

          {/* ── Certifications ───────────────────────────────────── */}
          <section>
            <SectionHeader label="Certifications" />
            {certifications.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                {certifications.map((cert, idx) => (
                  <div
                    key={cert}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: ACCENT,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text)",
                      }}
                    >
                      {cert}
                    </span>
                    <button
                      onClick={() => removeCert(cert)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        color: "var(--text-secondary)",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = "var(--accent-red)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCert(certInput);
                  }
                }}
                placeholder="Add a certification (e.g. AWS Certified Solutions Architect)..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => addCert(certInput)}
                disabled={!certInput.trim()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: certInput.trim() ? ACCENT : "var(--border)",
                  color: "white",
                  fontSize: 13,
                  cursor: certInput.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </section>

          {/* ── Experience ───────────────────────────────────────── */}
          <section>
            <SectionHeader
              label="Experience"
              action={
                !isAddingWork && (
                  <button
                    onClick={() => {
                      setIsAddingWork(true);
                      setWorkCompanyInput("");
                      setWorkRoleInput("");
                      setWorkDurationInput("");
                      setWorkDescInput("");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = ACCENT;
                      e.currentTarget.style.color = ACCENT;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    <Plus size={12} /> Add Experience
                  </button>
                )
              }
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 12,
              }}
            >
              {workExperience.map((work, idx) => {
                const isEditing = editingWorkIdx === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "16px",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    {isEditing ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <label
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                              }}
                            >
                              Company *
                            </label>
                            <input
                              value={workCompanyInput}
                              onChange={(e) =>
                                setWorkCompanyInput(e.target.value)
                              }
                              style={inputStyle}
                              placeholder="e.g. Google"
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <label
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                              }}
                            >
                              Role *
                            </label>
                            <input
                              value={workRoleInput}
                              onChange={(e) => setWorkRoleInput(e.target.value)}
                              style={inputStyle}
                              placeholder="e.g. Software Engineer"
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <label
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Duration
                          </label>
                          <input
                            value={workDurationInput}
                            onChange={(e) =>
                              setWorkDurationInput(e.target.value)
                            }
                            style={inputStyle}
                            placeholder="e.g. Jun 2025 - Present"
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <label
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Description
                          </label>
                          <textarea
                            value={workDescInput}
                            onChange={(e) => setWorkDescInput(e.target.value)}
                            style={{
                              ...inputStyle,
                              minHeight: 80,
                              fontFamily: "inherit",
                              resize: "vertical",
                            }}
                            placeholder="Describe your achievements and responsibilities..."
                          />
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <button
                            onClick={saveEditWork}
                            style={{
                              padding: "8px 14px",
                              borderRadius: 8,
                              border: "none",
                              background: ACCENT,
                              color: "white",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingWorkIdx(null)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: 8,
                              border: "1px solid var(--border)",
                              background: "transparent",
                              color: "var(--text-secondary)",
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <div>
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "var(--text)",
                              }}
                            >
                              {work.role}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--text-secondary)",
                                marginTop: 2,
                              }}
                            >
                              {work.company}{" "}
                              {work.duration && `· ${work.duration}`}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => startEditWork(idx)}
                              style={{
                                padding: 6,
                                borderRadius: 6,
                                border: "1px solid var(--border)",
                                background: "var(--bg)",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                display: "flex",
                              }}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => deleteWork(idx)}
                              style={{
                                padding: 6,
                                borderRadius: 6,
                                border: "1px solid var(--border)",
                                background: "var(--bg)",
                                color: "var(--accent-red)",
                                cursor: "pointer",
                                display: "flex",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        {work.description && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--text-secondary)",
                              marginTop: 8,
                              lineHeight: 1.5,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {work.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {isAddingWork && (
              <div
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: 12,
                  }}
                >
                  Add Experience
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                        }}
                      >
                        Company *
                      </label>
                      <input
                        value={workCompanyInput}
                        onChange={(e) => setWorkCompanyInput(e.target.value)}
                        style={inputStyle}
                        placeholder="e.g. Google"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                        }}
                      >
                        Role *
                      </label>
                      <input
                        value={workRoleInput}
                        onChange={(e) => setWorkRoleInput(e.target.value)}
                        style={inputStyle}
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Duration
                    </label>
                    <input
                      value={workDurationInput}
                      onChange={(e) => setWorkDurationInput(e.target.value)}
                      style={inputStyle}
                      placeholder="e.g. Jun 2023 - Present or 3 months"
                    />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Description
                    </label>
                    <textarea
                      value={workDescInput}
                      onChange={(e) => setWorkDescInput(e.target.value)}
                      style={{
                        ...inputStyle,
                        minHeight: 60,
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                      placeholder="Describe your responsibilities, impact, and projects..."
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      onClick={addWork}
                      disabled={
                        !workCompanyInput.trim() || !workRoleInput.trim()
                      }
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background:
                          workCompanyInput.trim() && workRoleInput.trim()
                            ? ACCENT
                            : "var(--border)",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor:
                          workCompanyInput.trim() && workRoleInput.trim()
                            ? "pointer"
                            : "not-allowed",
                      }}
                    >
                      Add Experience
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingWork(false);
                        setWorkCompanyInput("");
                        setWorkRoleInput("");
                        setWorkDurationInput("");
                        setWorkDescInput("");
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--text-secondary)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Projects ─────────────────────────────────────────── */}
          <section>
            <SectionHeader
              label="Projects"
              action={
                !isAddingProject && (
                  <button
                    onClick={() => {
                      setIsAddingProject(true);
                      setProjNameInput("");
                      setProjDescInput("");
                      setProjTechInput("");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = ACCENT;
                      e.currentTarget.style.color = ACCENT;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    <Plus size={12} /> Add Project
                  </button>
                )
              }
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 12,
              }}
            >
              {(() => {
                const all = getUnifiedProjects();
                const list = showAllProjects ? all : all.slice(0, 3);
                return list.map((proj) => {
                  const isEditing =
                    proj.isManual && editingProjectIdx === proj.index;
                  return (
                    <div
                      key={proj.id}
                      style={{
                        padding: "16px",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                      }}
                    >
                      {isEditing ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <label
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                              }}
                            >
                              Project Name *
                            </label>
                            <input
                              value={projNameInput}
                              onChange={(e) => setProjNameInput(e.target.value)}
                              style={inputStyle}
                              placeholder="e.g. My Portfolio Website"
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <label
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                              }}
                            >
                              Description
                            </label>
                            <textarea
                              value={projDescInput}
                              onChange={(e) => setProjDescInput(e.target.value)}
                              style={{
                                ...inputStyle,
                                minHeight: 60,
                                fontFamily: "inherit",
                                resize: "vertical",
                              }}
                              placeholder="Describe the project goal, your role, and achievements..."
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <label
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                              }}
                            >
                              Technologies (comma separated)
                            </label>
                            <input
                              value={projTechInput}
                              onChange={(e) => setProjTechInput(e.target.value)}
                              style={inputStyle}
                              placeholder="e.g. React, Node.js, Firebase"
                            />
                          </div>
                          <div
                            style={{ display: "flex", gap: 8, marginTop: 4 }}
                          >
                            <button
                              onClick={saveEditProject}
                              style={{
                                padding: "8px 14px",
                                borderRadius: 8,
                                border: "none",
                                background: ACCENT,
                                color: "white",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingProjectIdx(null)}
                              style={{
                                padding: "8px 14px",
                                borderRadius: 8,
                                border: "1px solid var(--border)",
                                background: "transparent",
                                color: "var(--text-secondary)",
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "var(--text)",
                                  }}
                                >
                                  {proj.name}
                                </p>

                                {proj.isGithub && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: 10,
                                      fontWeight: 600,
                                      color: "var(--accent-green)",
                                      background: "var(--accent-green-subtle)",
                                      border:
                                        "1px solid var(--accent-green-border)",
                                      padding: "2px 8px",
                                      borderRadius: 12,
                                    }}
                                  >
                                    <GithubIcon size={10} /> Synced GitHub
                                  </span>
                                )}

                                {!proj.isGithub && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 500,
                                      color: "var(--text-secondary)",
                                      background: "var(--bg)",
                                      border: "1px solid var(--border)",
                                      padding: "2px 8px",
                                      borderRadius: 12,
                                    }}
                                  >
                                    Resume / Manual
                                  </span>
                                )}
                              </div>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-secondary)",
                                  marginTop: 6,
                                  lineHeight: 1.5,
                                }}
                              >
                                {proj.description || "No description provided."}
                              </p>
                            </div>

                            <div
                              style={{ display: "flex", gap: 6, flexShrink: 0 }}
                            >
                              {proj.isGithub && (
                                <>
                                  <a
                                    href={proj.githubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      padding: 6,
                                      borderRadius: 6,
                                      border: "1px solid var(--border)",
                                      background: "var(--bg)",
                                      color: "var(--text-secondary)",
                                      display: "flex",
                                      cursor: "pointer",
                                      transition: "all 0.15s",
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.color =
                                        "var(--accent-green)";
                                      e.currentTarget.style.borderColor =
                                        "var(--accent-green-border)";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.color =
                                        "var(--text-secondary)";
                                      e.currentTarget.style.borderColor =
                                        "var(--border)";
                                    }}
                                  >
                                    <GithubIcon size={12} />
                                  </a>
                                  <button
                                    onClick={() =>
                                      deleteRepo(
                                        repos.find(
                                          (r) => `github-${r.id}` === proj.id,
                                        )?.id,
                                      )
                                    }
                                    style={{
                                      padding: 6,
                                      borderRadius: 6,
                                      border: "1px solid var(--border)",
                                      background: "var(--bg)",
                                      color: "var(--accent-red)",
                                      cursor: "pointer",
                                      display: "flex",
                                    }}
                                    title="Remove from profile"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                              {proj.isManual && (
                                <>
                                  <button
                                    onClick={() => startEditProject(proj.index)}
                                    style={{
                                      padding: 6,
                                      borderRadius: 6,
                                      border: "1px solid var(--border)",
                                      background: "var(--bg)",
                                      color: "var(--text-secondary)",
                                      cursor: "pointer",
                                      display: "flex",
                                    }}
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => deleteProject(proj.index)}
                                    style={{
                                      padding: 6,
                                      borderRadius: 6,
                                      border: "1px solid var(--border)",
                                      background: "var(--bg)",
                                      color: "var(--accent-red)",
                                      cursor: "pointer",
                                      display: "flex",
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Tech Chips */}
                          {proj.technologies.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 4,
                                marginTop: 8,
                              }}
                            >
                              {proj.technologies.map((t) => (
                                <span
                                  key={t}
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    background: "var(--bg)",
                                    border: "1px solid var(--border)",
                                    fontSize: 11,
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
              {getUnifiedProjects().length > 3 && (
                <button
                  onClick={() => setShowAllProjects((s) => !s)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: ACCENT,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    marginTop: 4,
                  }}
                >
                  {showAllProjects
                    ? "Show less"
                    : `See more (${getUnifiedProjects().length - 3} more)`}
                </button>
              )}
            </div>

            {isAddingProject && (
              <div
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: 12,
                  }}
                >
                  Add Project
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Project Name *
                    </label>
                    <input
                      value={projNameInput}
                      onChange={(e) => setProjNameInput(e.target.value)}
                      style={inputStyle}
                      placeholder="e.g. Careerscope App"
                    />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Description
                    </label>
                    <textarea
                      value={projDescInput}
                      onChange={(e) => setProjDescInput(e.target.value)}
                      style={{
                        ...inputStyle,
                        minHeight: 60,
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                      placeholder="Describe the project goal, your role, and achievements..."
                    />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Technologies (comma separated)
                    </label>
                    <input
                      value={projTechInput}
                      onChange={(e) => setProjTechInput(e.target.value)}
                      style={inputStyle}
                      placeholder="e.g. Next.js, TypeScript, PostgreSQL"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      onClick={addProject}
                      disabled={!projNameInput.trim()}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: projNameInput.trim()
                          ? ACCENT
                          : "var(--border)",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: projNameInput.trim()
                          ? "pointer"
                          : "not-allowed",
                      }}
                    >
                      Add Project
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingProject(false);
                        setProjNameInput("");
                        setProjDescInput("");
                        setProjTechInput("");
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--text-secondary)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Awards ─────────────────────────────────────────── */}
          <section>
            <SectionHeader label="Awards" />

            {awards.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {awards.map((award, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: 14 }}>🏆</span>
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--text)",
                          fontWeight: 500,
                        }}
                      >
                        {award}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteAward(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        color: "var(--text-secondary)",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "var(--accent-red)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "var(--text-secondary)")
                      }
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={awardInput}
                onChange={(e) => setAwardInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAward();
                  }
                }}
                placeholder="Add an award, scholarship, or achievement..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={addAward}
                disabled={!awardInput.trim()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: awardInput.trim() ? ACCENT : "var(--border)",
                  color: "white",
                  fontSize: 13,
                  cursor: awardInput.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </section>

          {/* ── Social Links ─────────────────────────────────────── */}
          <section>
            <SectionHeader label="Social Links" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* LinkedIn */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <LinkedinIcon size={18} style={{ color: "#0A66C2" }} />
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        LinkedIn Profile
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: linkedin
                            ? "var(--accent-green)"
                            : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {linkedin ? (
                          <>
                            <Check
                              size={12}
                              style={{ color: "var(--accent-green)" }}
                            />{" "}
                            Verified as linkedin.com/in/{linkedin}
                          </>
                        ) : (
                          "Provide your LinkedIn profile link or username."
                        )}
                      </p>
                    </div>
                  </div>
                  {linkedin && (
                    <button
                      onClick={() => setLinkedin("")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--accent-red)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {!linkedin && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={linkedinInput}
                      onChange={(e) => setLinkedinInput(e.target.value)}
                      placeholder="Enter LinkedIn username or profile link"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        if (linkedinInput.trim()) {
                          const parts = linkedinInput
                            .trim()
                            .split("linkedin.com/in/");
                          const handle = parts[1]
                            ? parts[1].split("/")[0]
                            : linkedinInput.trim();
                          setLinkedin(handle.toLowerCase());
                          setLinkedinInput("");
                        }
                      }}
                      disabled={!linkedinInput.trim()}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: "none",
                        background: !linkedinInput.trim()
                          ? "var(--border)"
                          : "#0A66C2",
                        color: !linkedinInput.trim()
                          ? "var(--text-secondary)"
                          : "white",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: !linkedinInput.trim()
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>

              {/* GitHub */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <GithubIcon size={18} style={{ color: "var(--text)" }} />
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        GitHub Profile
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: github
                            ? "var(--accent-green)"
                            : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {github ? (
                          <>
                            <Check
                              size={12}
                              style={{ color: "var(--accent-green)" }}
                            />{" "}
                            Verified as @{github}
                          </>
                        ) : (
                          "Verify your account to automatically sync repository skills."
                        )}
                      </p>
                    </div>
                  </div>
                  {github && (
                    <button
                      onClick={() => setGithub("")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--accent-red)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {!github && (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        value={githubInput}
                        onChange={(e) => {
                          setGithubInput(e.target.value);
                          setGithubError("");
                        }}
                        placeholder="Enter GitHub username or profile link"
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button
                        onClick={handleVerifyGithub}
                        disabled={isVerifyingGithub || !githubInput.trim()}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 8,
                          border: "none",
                          background:
                            isVerifyingGithub || !githubInput.trim()
                              ? "var(--border)"
                              : "var(--text)",
                          color:
                            isVerifyingGithub || !githubInput.trim()
                              ? "var(--text-secondary)"
                              : "var(--bg)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor:
                            isVerifyingGithub || !githubInput.trim()
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isVerifyingGithub ? "Verifying..." : "Verify & Sync"}
                      </button>
                    </div>
                    {githubError && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--accent-red)",
                          marginTop: 2,
                        }}
                      >
                        ⚠️ {githubError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Sticky Save Button (candidates only) ─────────────────── */}
      {!isEmployer && (hasChanges || saved) && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 24px",
            background: "var(--nav-bg)",
            borderTop: "1px solid var(--border)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            justifyContent: "center",
            zIndex: 40,
          }}
        >
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              maxWidth: 680,
              padding: "15px",
              borderRadius: 10,
              border: saved
                ? "1px solid var(--accent-green-border)"
                : "1px solid var(--border)",
              background: saved ? ACCENT : "var(--surface)",
              color: saved ? "white" : "var(--text)",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
              boxShadow: saved ? "none" : "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            {saved ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  label,
  action,
}: {
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <h2
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: "var(--text)",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <span>{label}</span>
      {action && <span>{action}</span>}
    </h2>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
};
