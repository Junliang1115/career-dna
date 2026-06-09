"use client";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context";
import { useAuth } from "@/lib/auth-context";
import { universities } from "@/lib/universities";
import { getCoursesForUniversity } from "@/lib/hooks/useCourseData";
import { Check, Upload, FileText, Trash2, Plus, X, LogOut, Link2 } from "lucide-react";
import { extractGithubUsername, fetchGithubSkills } from "@/lib/github";
import Link from "next/link";

const ACCENT = "var(--accent-green)";
const ACCENT_SUBTLE = "var(--accent-green-subtle)";
const ACCENT_BORDER = "var(--accent-green-border)";

// Custom inline SVG icons because the installed lucide-react package does not export Github/Linkedin
const LinkedinIcon = ({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
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

const GithubIcon = ({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
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
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [uni, setUni] = useState(profile.university);
  const [major, setMajor] = useState(profile.major);
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

  // GitHub / LinkedIn Verification States
  const [githubInput, setGithubInput] = useState("");
  const [githubError, setGithubError] = useState("");
  const [isVerifyingGithub, setIsVerifyingGithub] = useState(false);
  const [linkedinInput, setLinkedinInput] = useState("");

  // GitHub Repositories, Commits and READMEs States
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [readmes, setReadmes] = useState<Record<string, string>>({});
  const [loadingReadme, setLoadingReadme] = useState<Record<string, boolean>>({});
  const [commits, setCommits] = useState<Record<string, any[]>>({});
  const [loadingCommits, setLoadingCommits] = useState<Record<string, boolean>>({});

  const currentUni = universities.find((u) => u.name === uni);
  const availableCourses = getCoursesForUniversity(uni, major);

  // Load repos when GitHub account is linked
  useEffect(() => {
    if (github) {
      const loadRepos = async () => {
        setLoadingRepos(true);
        try {
          const res = await fetch(`https://api.github.com/users/${github}/repos?sort=updated&per_page=10`);
          if (res.ok) {
            const data = await res.json();
            setRepos(data);
          }
        } catch (err) {
          console.error('Failed to load repositories:', err);
        } finally {
          setLoadingRepos(false);
        }
      };
      loadRepos();
    } else {
      setRepos([]);
    }
  }, [github]);

  const fetchRepoReadme = async (repoName: string) => {
    if (readmes[repoName]) return;
    setLoadingReadme(prev => ({ ...prev, [repoName]: true }));
    try {
      const res = await fetch(`https://api.github.com/repos/${github}/${repoName}/readme`);
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          const decoded = atob(data.content.replace(/\s/g, ''));
          setReadmes(prev => ({ ...prev, [repoName]: decoded }));
        } else {
          setReadmes(prev => ({ ...prev, [repoName]: "No README content." }));
        }
      } else {
        setReadmes(prev => ({ ...prev, [repoName]: "No README found." }));
      }
    } catch (err) {
      console.error(err);
      setReadmes(prev => ({ ...prev, [repoName]: "Failed to load README." }));
    } finally {
      setLoadingReadme(prev => ({ ...prev, [repoName]: false }));
    }
  };

  const fetchRepoCommits = async (repoName: string) => {
    if (commits[repoName]) return;
    setLoadingCommits(prev => ({ ...prev, [repoName]: true }));
    try {
      const res = await fetch(`https://api.github.com/repos/${github}/${repoName}/commits?author=${github}&per_page=5`);
      if (res.ok) {
        const data = await res.json();
        setCommits(prev => ({ ...prev, [repoName]: data }));
      } else {
        setCommits(prev => ({ ...prev, [repoName]: [] }));
      }
    } catch (err) {
      console.error(err);
      setCommits(prev => ({ ...prev, [repoName]: [] }));
    } finally {
      setLoadingCommits(prev => ({ ...prev, [repoName]: false }));
    }
  };

  const handleVerifyGithub = async () => {
    const username = extractGithubUsername(githubInput);
    if (!username) {
      setGithubError("Please enter a valid GitHub username or profile link.");
      return;
    }
    
    setIsVerifyingGithub(true);
    setGithubError("");
    
    try {
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
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
        setSkills(prev => Array.from(new Set([...prev, ...result.skills])));
      }
      if (result.repos.length > 0) {
        setRepos(result.repos);
      }
    } catch (err) {
      console.error(err);
      setGithubError("Failed to verify account due to a network error. Please try again.");
    } finally {
      setIsVerifyingGithub(false);
    }
  };

  // Sync state when profile loads (e.g. from localStorage)
  useEffect(() => {
    if (profile) {
      setUni(profile.university || "");
      setMajor(profile.major || "");
      setCourses(profile.courses || []);
      setSkills(profile.skills || []);
      setCertifications(profile.certifications || []);
      setLinkedin(profile.linkedin || "");
      setGithub(profile.github || "");
    }
  }, [profile]);

  const toggleCourse = (course: string) => {
    setCourses((prev) =>
      prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]
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

  const toggleCert = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert],
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTranscript(file);
  };

  const handleSave = () => {
    setProfile({
      university: uni,
      major,
      courses,
      transcriptFile: transcript,
      skills,
      certifications,
      linkedin,
      github,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const hasCareerType = !!profile.careerType;

  // ── Employer profile state ─────────────────────────────────
  const isEmployer = profile.role === 'employer';
  const [editCompany, setEditCompany] = useState(false);
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [industry, setIndustry] = useState(profile.industry || '');
  const [companySize, setCompanySize] = useState(profile.companySize || '');
  const [hiringFor, setHiringFor] = useState(profile.hiringFor || '');

  const handleSaveEmployer = () => {
    setProfile({ companyName, industry, companySize, hiringFor });
    setEditCompany(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const INDUSTRIES = [
    'Fintech', 'E-commerce', 'Cybersecurity', 'Consulting', 'Healthcare',
    'Education', 'Media & Entertainment', 'Logistics & Supply Chain',
    'Real Estate', 'Manufacturing', 'Telecommunications', 'Government', 'Other',
  ];

  const COMPANY_SIZES = ['Startup', 'Mid-size', 'Enterprise'];

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
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          EMPLOYER PROFILE  (shown when role === 'employer')
      ══════════════════════════════════════════════════════ */}
      {isEmployer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── Company Header ─────────────────────────────────── */}
          <div style={{
            padding: '28px 32px',
            borderRadius: 16,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {industry && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: 'var(--accent-green-subtle)',
                    border: '1px solid var(--accent-green-border)',
                    color: 'var(--accent-green)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase' as const,
                    width: 'fit-content',
                  }}>
                    {industry}
                  </span>
                )}
                <h1 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontFamily: "'Newsreader', serif",
                  lineHeight: 1.2,
                }}>
                  {companyName || 'Your Company'}
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Employer Profile
                </p>
              </div>

              {!editCompany ? (
                <button
                  onClick={() => setEditCompany(true)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                    e.currentTarget.style.color = 'var(--accent-green)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSaveEmployer}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--accent-green)',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {saved ? '✓ Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditCompany(false); setCompanyName(profile.companyName || ''); setIndustry(profile.industry || ''); setCompanySize(profile.companySize || ''); setHiringFor(profile.hiringFor || ''); }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* ── Info Grid ────────────────────────────────────── */}
            {editCompany ? (
              /* Inline edit form */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Company Name</label>
                  <input
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. TechCorp Malaysia"
                    style={{ ...inputStyle }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Industry</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)} style={inputStyle}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Company Size</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {COMPANY_SIZES.map(size => (
                      <button
                        key={size}
                        onClick={() => setCompanySize(size)}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: 8,
                          border: `1.5px solid ${companySize === size ? 'var(--accent-green)' : 'var(--border)'}`,
                          background: companySize === size ? 'var(--accent-green-subtle)' : 'transparent',
                          color: companySize === size ? 'var(--accent-green)' : 'var(--text-secondary)',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Hiring For</label>
                  <input
                    value={hiringFor}
                    onChange={e => setHiringFor(e.target.value)}
                    placeholder="e.g. Full Stack Engineers"
                    style={{ ...inputStyle }}
                  />
                </div>
              </div>
            ) : (
              /* Read-only info grid */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 20 }}>
                {[
                  { label: 'Company Size', value: companySize || '—' },
                  { label: 'Industry', value: industry || '—' },
                  { label: 'Hiring For', value: hiringFor || '—' },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 5 }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Quick Actions ─────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <a href="/employer" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '20px 24px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'var(--accent-green)';
                e.currentTarget.style.background = 'var(--accent-green-subtle)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface)';
              }}
              >
                <span style={{ fontSize: 22 }}>🔍</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Talent Pool</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Browse & shortlist candidates</p>
              </div>
            </a>
            <div style={{
              padding: '20px 24px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <span style={{ fontSize: 22 }}>📋</span>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Posted Roles</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>0 active job listings</p>
            </div>
          </div>
        </div>
      )}

      {/* ── MBTI Result Header (candidates only) ─────────────── */}
      <div
        style={{
          padding: "32px",
          borderRadius: 16,
          background: hasCareerType ? ACCENT_SUBTLE : "var(--surface)",
          border: `1px solid ${hasCareerType ? ACCENT_BORDER : "var(--border)"}`,
          marginBottom: 36,
          textAlign: "center",
        }}
      >
        {hasCareerType ? (
          <>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: ACCENT,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                marginBottom: 8,
              }}
            >
              Your Career Type
            </p>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                fontFamily: "'Newsreader', serif",
                color: ACCENT,
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {profile.careerType}
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 20,
              }}
            >
              Based on your work behaviour and preferences
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
              View full results →
            </Link>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-tertiary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                marginBottom: 8,
              }}
            >
              Career Type
            </p>
            <div
              style={{
                fontSize: 26,
                fontFamily: "'Newsreader', serif",
                color: "var(--text-tertiary)",
                lineHeight: 1,
                marginBottom: 12,
              }}
            >
              Not yet discovered
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 20,
              }}
            >
              Complete the quiz to reveal your career type
            </p>
            <Link
              href="/quiz"
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
              Take the quiz →
            </Link>
          </>
        )}
      </div>

      {/* ── Sections (candidates only) ─────────────────────────── */}
      {!isEmployer && (
      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        {/* University */}
        <section>
          <SectionHeader label="University & Major" />
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
          </div>
        </section>


        {/* Skills */}
        <section>
          <SectionHeader label="Skills" />
          {skills.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 12,
              }}
            >
              {skills.map((skill) => (
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
              ))}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              marginBottom: 10,
            }}
          >
            {COMMON_SKILLS.filter((s) => !skills.includes(s))
              .slice(0, 10)
              .map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Plus size={9} /> {skill}
                </button>
              ))}
          </div>
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


        {/* Social Links */}
        <section>
          <SectionHeader label="Social Links" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* LinkedIn */}
            <div style={{ padding: "16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <LinkedinIcon size={18} style={{ color: "#0A66C2" }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>LinkedIn Profile</p>
                    <p style={{ fontSize: 11, color: linkedin ? "var(--accent-green)" : "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                      {linkedin ? (
                        <>
                          <Check size={12} style={{ color: "var(--accent-green)" }} /> Verified as linkedin.com/in/{linkedin}
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
                    style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--accent-red)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
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
                        const parts = linkedinInput.trim().split('linkedin.com/in/');
                        const handle = parts[1] ? parts[1].split('/')[0] : linkedinInput.trim();
                        setLinkedin(handle.toLowerCase());
                        setLinkedinInput("");
                      }
                    }}
                    disabled={!linkedinInput.trim()}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: !linkedinInput.trim() ? "var(--border)" : "#0A66C2",
                      color: !linkedinInput.trim() ? "var(--text-secondary)" : "white",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: !linkedinInput.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>

            {/* GitHub */}
            <div style={{ padding: "16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <GithubIcon size={18} style={{ color: "var(--text)" }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>GitHub Profile</p>
                    <p style={{ fontSize: 11, color: github ? "var(--accent-green)" : "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                      {github ? (
                        <>
                          <Check size={12} style={{ color: "var(--accent-green)" }} /> Verified as @{github}
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
                    style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--accent-red)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                  >
                    Disconnect
                  </button>
                )}
              </div>

              {!github && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                        background: (isVerifyingGithub || !githubInput.trim()) ? "var(--border)" : "var(--text)",
                        color: (isVerifyingGithub || !githubInput.trim()) ? "var(--text-secondary)" : "var(--bg)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: (isVerifyingGithub || !githubInput.trim()) ? "not-allowed" : "pointer",
                      }}
                    >
                      {isVerifyingGithub ? "Verifying..." : "Verify & Sync"}
                    </button>
                  </div>
                  {githubError && (
                    <p style={{ fontSize: 11, color: "var(--accent-red)", marginTop: 2 }}>
                      ⚠️ {githubError}
                    </p>
                  )}
                </div>
              )}

              {github && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>Synced Repositories ({repos.length})</p>
                  {loadingRepos ? (
                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Loading repositories...</p>
                  ) : repos.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>No public repositories found.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {repos.map((repo) => {
                        const isExpanded = !!loadingReadme[repo.name] || !!readmes[repo.name] || !!commits[repo.name];
                        return (
                          <div key={repo.name} style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                              <div>
                                <a href={repo.html_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-green)", textDecoration: "none" }}>
                                  {repo.name}
                                </a>
                                <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{repo.description || "No description provided."}</p>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {repo.language && (
                                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                                    {repo.language}
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    if (isExpanded) {
                                      setReadmes(prev => {
                                        const next = { ...prev };
                                        delete next[repo.name];
                                        return next;
                                      });
                                      setCommits(prev => {
                                        const next = { ...prev };
                                        delete next[repo.name];
                                        return next;
                                      });
                                    } else {
                                      fetchRepoReadme(repo.name);
                                      fetchRepoCommits(repo.name);
                                    }
                                  }}
                                  style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 11, color: "var(--text)", cursor: "pointer" }}
                                >
                                  {isExpanded ? "Collapse" : "View Commits & README"}
                                </button>
                              </div>
                            </div>
                            
                            {/* Expanded Commits & README */}
                            {isExpanded && (
                              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
                                {/* User Commits */}
                                <div>
                                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Your Recent Commits</p>
                                  {loadingCommits[repo.name] ? (
                                    <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>Loading commits...</p>
                                  ) : !commits[repo.name] || commits[repo.name].length === 0 ? (
                                    <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>No commits found by you.</p>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                      {commits[repo.name].map((c: any) => (
                                        <div key={c.sha} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, background: "var(--surface)", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", gap: 8 }}>
                                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.commit?.message}</span>
                                          <span style={{ fontSize: 9, opacity: 0.8, flexShrink: 0 }}>{new Date(c.commit?.author?.date).toLocaleDateString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {/* README Content */}
                                <div>
                                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>README.md</p>
                                  {loadingReadme[repo.name] ? (
                                    <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>Loading README...</p>
                                  ) : (
                                    <pre style={{ fontSize: 10, padding: 8, borderRadius: 4, background: "var(--surface)", border: "1px solid var(--border)", overflowX: "auto", whiteSpace: "pre-wrap", maxHeight: 150, overflowY: "auto", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                                      {readmes[repo.name] || "No README content found."}
                                    </pre>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Resume / CV */}
        <section>
          <SectionHeader label="Resume / CV" />
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {transcript ? (
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
              <FileText size={18} style={{ color: ACCENT, flexShrink: 0 }} />
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
                onClick={() => setTranscript(null)}
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
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
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
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = ACCENT)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              <Upload size={18} />
              <span style={{ fontSize: 13 }}>Click to upload Resume / CV (PDF)</span>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                Supports PDF format up to 10MB
              </span>
            </button>
          )}
        </section>
      </div>
      )}

      {/* ── Sticky Save Button (candidates only) ─────────────────── */}
      {!isEmployer && (
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
            border: "none",
            background: saved ? ACCENT : "var(--primary)",
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
            "Save Profile"
          )}
        </button>
      </div>
      )}
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <h2
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: "var(--text)",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: ACCENT,
          display: "inline-block",
        }}
      />
      {label}
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
