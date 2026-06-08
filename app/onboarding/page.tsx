'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { universities } from '@/lib/universities';
import { getCoursesForUniversity } from '@/lib/hooks/useCourseData';
import { ChevronRight, ChevronLeft, Check, User, Briefcase, Upload, FileText, Trash2 } from 'lucide-react';
import { extractGithubUsername, fetchGithubSkills } from '@/lib/github';

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

type DegreeLevel = 'bachelor' | 'master' | 'phd' | '';
type Step = 'role' | 'employer-info' | 'uni' | 'degree' | 'major' | 'resume' | 'connect';

const STEPS: Step[] = ['role', 'employer-info', 'uni', 'degree', 'major', 'resume', 'connect'];
const ACCENT = '#2D6A4F';

const DEGREE_OPTIONS: { value: DegreeLevel; label: string; desc: string }[] = [
  { value: 'bachelor', label: "Bachelor's Degree", desc: 'Undergraduate — 3 to 4 years' },
  { value: 'master', label: "Master's Degree", desc: 'Postgraduate — 1 to 2 years' },
  { value: 'phd', label: 'PhD / Doctorate', desc: 'Research — 3 to 5+ years' },
];

// Custom inline SVG icons because the installed lucide-react package does not export Github/Linkedin

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile } = useApp();

  const [step, setStep] = useState<Step>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careerscope_profile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.role) return 'uni';
        } catch {}
      }
    }
    return 'role';
  });
  
  const [selectedUni, setSelectedUni] = useState(profile.university || '');
  const [selectedDegree, setSelectedDegree] = useState<DegreeLevel>(profile.degree || '');
  const [selectedMajor, setSelectedMajor] = useState(profile.major || '');
  const [transcript, setTranscript] = useState<File | null>(profile.transcriptFile);
  
  // LinkedIn / GitHub Social Links State
  const [linkedin, setLinkedin] = useState(profile.linkedin || '');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [github, setGithub] = useState(profile.github || '');
  const [githubInput, setGithubInput] = useState('');
  const [githubError, setGithubError] = useState('');
  const [isVerifyingGithub, setIsVerifyingGithub] = useState(false);

  // Employer onboarding fields
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [industry, setIndustry] = useState(profile.industry || '');
  const [companySize, setCompanySize] = useState(profile.companySize || '');
  const [hiringFor, setHiringFor] = useState(profile.hiringFor || '');

  const fileRef = useRef<HTMLInputElement>(null);
  const stepIndex = STEPS.indexOf(step);
  const currentUni = universities.find(u => u.name === selectedUni);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTranscript(file);
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
      
      // Auto-sync skills from GitHub into profile context
      const { skills: gitSkills } = await fetchGithubSkills(username);
      if (gitSkills.length > 0) {
        const existingSkills = profile.skills || [];
        setProfile({
          skills: Array.from(new Set([...existingSkills, ...gitSkills])),
          github: username
        });
      } else {
        setProfile({ github: username });
      }
    } catch (err) {
      console.error(err);
      setGithubError("Failed to verify account due to a network error. Please try again.");
    } finally {
      setIsVerifyingGithub(false);
    }
  };

  const handleNext = () => {
    if (step === 'role') {
      setStep('uni');
    } else if (step === 'employer-info') {
      setProfile({ companyName, industry, companySize, hiringFor });
      router.push('/employer');
    } else if (step === 'uni') {
      if (selectedUni) setProfile({ university: selectedUni });
      setStep('degree');
    } else if (step === 'degree') {
      if (selectedDegree) setProfile({ degree: selectedDegree });
      setStep('major');
    } else if (step === 'major') {
      if (selectedMajor) setProfile({ major: selectedMajor });
      setStep('resume');
    } else if (step === 'resume') {
      setProfile({ transcriptFile: transcript });
      setStep('connect');
    } else {
      setProfile({ linkedin, github });
      router.push('/quiz');
    }
  };

  const handleSkip = () => {
    if (selectedUni) setProfile({ university: selectedUni });
    if (selectedDegree) setProfile({ degree: selectedDegree });
    if (selectedMajor) setProfile({ major: selectedMajor });
    setProfile({ transcriptFile: transcript, linkedin, github });
    router.push('/quiz');
  };

  const handleBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= stepIndex ? ACCENT : 'var(--border)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Step label */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            {step === 'role' && 'Welcome to CareerScope'}
            {step === 'employer-info' && 'Set up your talent search'}
            {step === 'uni' && 'Which university do you attend?'}
            {step === 'degree' && "What's your degree level?"}
            {step === 'major' && "What's your major?"}
            {step === 'resume' && 'Upload your Resume / CV'}
            {step === 'connect' && 'Connect Professional Profiles'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {step === 'role' && 'Choose how you want to use CareerScope'}
            {step === 'employer-info' && 'Help us set up your talent search'}
            {step === 'uni' && 'We\'ll tailor job matches to your university\'s network.'}
            {step === 'degree' && 'This helps us filter opportunities at the right level.'}
            {step === 'major' && `${selectedUni} — select your field of study.`}
            {step === 'resume' && 'Add your resume to automatically parse your skills and experience.'}
            {step === 'connect' && 'Connect LinkedIn and GitHub to verify your professional identity.'}
          </p>
        </div>

        {/* ── Role Selection ─────────────────────────────── */}
        {step === 'role' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Candidate Card */}
            <button
              onClick={() => {
                setProfile({ ...profile, role: 'candidate' });
                setStep('uni');
              }}
              style={{
                padding: '28px 24px',
                borderRadius: 14,
                border: `2px solid ${ACCENT}`,
                background: 'rgba(45,106,79,0.06)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(45,106,79,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={24} style={{ color: ACCENT }} />
              </div>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  I&apos;m a Candidate
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Take our 20-question career quiz and get personalized job matches based on your skills, interests, and career goals.
                </p>
              </div>
            </button>

            {/* Employer Card */}
            <button
              onClick={() => {
                setProfile({ ...profile, role: 'employer' });
                setStep('employer-info');
              }}
              style={{
                padding: '28px 24px',
                borderRadius: 14,
                border: '2px solid var(--border)',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Briefcase size={24} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  I&apos;m an Employer
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Search our talent pool with semantic matching to find the perfect candidates for your open positions.
                </p>
              </div>
            </button>

          </div>
        )}

        {/* ── Employer Info ──────────────────────────────────── */}
        {step === 'employer-info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Company Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                style={{
                  padding: '10px 0',
                  borderRadius: 0,
                  border: 'none',
                  borderBottom: '2px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')}
              />
            </div>

            {/* Industry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  padding: '10px 0',
                  borderRadius: 0,
                  border: 'none',
                  borderBottom: '2px solid var(--border)',
                  background: 'transparent',
                  color: industry ? 'var(--text)' : 'var(--text-tertiary)',
                  fontSize: 14,
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')}
              >
                <option value="" disabled>Select your industry</option>
                <option value="Fintech">Fintech</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Consulting">Consulting</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Media & Entertainment">Media &amp; Entertainment</option>
                <option value="Logistics & Supply Chain">Logistics &amp; Supply Chain</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Government">Government</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Company Size */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Company Size
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'Startup (1-50)', label: 'Startup', sub: '1-50' },
                  { value: 'Mid-size (50-500)', label: 'Mid-size', sub: '50-500' },
                  { value: 'Enterprise (500+)', label: 'Enterprise', sub: '500+' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCompanySize(opt.value)}
                    style={{
                      flex: 1,
                      padding: '12px 8px',
                      borderRadius: 10,
                      border: `2px solid ${companySize === opt.value ? ACCENT : 'var(--border)'}`,
                      background: companySize === opt.value ? 'rgba(45,106,79,0.06)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: companySize === opt.value ? 600 : 500, color: 'var(--text)', marginBottom: 2 }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Hiring For */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                What are you hiring for?
              </label>
              <input
                type="text"
                value={hiringFor}
                onChange={(e) => setHiringFor(e.target.value)}
                placeholder="e.g. Software Engineer, Data Analyst, Marketing Manager"
                style={{
                  padding: '10px 0',
                  borderRadius: 0,
                  border: 'none',
                  borderBottom: '2px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'var(--border)')}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: University ─────────────────────────────── */}
        {step === 'uni' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {universities.map(uni => (
              <button
                key={uni.name}
                onClick={() => setSelectedUni(uni.name)}
                style={{
                  padding: '13px 16px', borderRadius: 10,
                  border: `2px solid ${selectedUni === uni.name ? ACCENT : 'var(--border)'}`,
                  background: selectedUni === uni.name ? 'rgba(45,106,79,0.06)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', fontSize: 14,
                  fontWeight: selectedUni === uni.name ? 600 : 400, color: 'var(--text)',
                  transition: 'all 0.12s',
                }}
              >
                {uni.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Degree ───────────────────────────────── */}
        {step === 'degree' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEGREE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedDegree(opt.value)}
                style={{
                  padding: '14px 16px', borderRadius: 10,
                  border: `2px solid ${selectedDegree === opt.value ? ACCENT : 'var(--border)'}`,
                  background: selectedDegree === opt.value ? 'rgba(45,106,79,0.06)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: selectedDegree === opt.value ? 600 : 500, color: 'var(--text)', marginBottom: 2 }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</p>
                  </div>
                  {selectedDegree === opt.value && <Check size={16} style={{ color: ACCENT }} />}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 3: Major ────────────────────────────────── */}
        {step === 'major' && currentUni && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {currentUni.majors.map(major => (
              <button
                key={major}
                onClick={() => setSelectedMajor(major)}
                style={{
                  padding: '13px 16px', borderRadius: 10,
                  border: `2px solid ${selectedMajor === major ? ACCENT : 'var(--border)'}`,
                  background: selectedMajor === major ? 'rgba(45,106,79,0.06)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', fontSize: 14,
                  fontWeight: selectedMajor === major ? 600 : 400, color: 'var(--text)',
                  transition: 'all 0.12s',
                }}
              >
                {major}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 4: Resume ──────────────────────────────── */}
        {step === 'resume' && (
          <div>
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
                  padding: "48px 28px",
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
                <Upload size={24} style={{ color: ACCENT, marginBottom: 4 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Click to upload PDF</span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  Supports PDF format up to 10MB
                </span>
              </button>
            )}
          </div>
        )}

        {/* ── Step 5: Connect ──────────────────────────────── */}
        {step === 'connect' && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* LinkedIn */}
            <div style={{ padding: "16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <LinkedinIcon size={18} style={{ color: "#0A66C2" }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>LinkedIn Profile</p>
                    <p style={{ fontSize: 11, color: linkedin ? ACCENT : "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                      {linkedin ? (
                        <>
                          <Check size={12} style={{ color: ACCENT }} /> Verified as linkedin.com/in/{linkedin}
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
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                      flex: 1
                    }}
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
                    <p style={{ fontSize: 11, color: github ? ACCENT : "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                      {github ? (
                        <>
                          <Check size={12} style={{ color: ACCENT }} /> Verified as @{github}
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
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--text)",
                        fontSize: 13,
                        outline: "none",
                        flex: 1
                      }}
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
            </div>
          </div>
        )}

        {/* ── Actions ─────────────────────────────────────── */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {step !== 'role' && (
            <button
              onClick={handleNext}
              style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: ACCENT, color: 'white', fontWeight: 600, fontSize: 15,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, transition: 'all 0.15s',
              }}
            >
              {step === 'connect' ? 'Start Quiz' : step === 'employer-info' ? 'Set Up Dashboard' : 'Continue'}
              <ChevronRight size={16} />
            </button>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {stepIndex > 0 && step !== 'role' && (
              <button
                onClick={handleBack}
                style={{
                  flex: '0 0 auto', padding: '14px 16px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step !== 'employer-info' && (
              <button
                onClick={handleSkip}
                style={{
                  flex: 1, padding: '14px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                Skip — go to quiz
              </button>
            )}
          </div>

          {step === 'uni' && (
            <button
              onClick={() => router.push('/quiz')}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                border: 'none', background: 'transparent',
                color: 'var(--text-tertiary)', fontSize: 13,
                cursor: 'pointer', marginTop: 4,
              }}
            >
              Skip all →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
