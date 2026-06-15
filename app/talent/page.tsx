"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import TalentPoolMap from "@/components/employer/TalentPoolMap";
import ShortlistPanel from "@/components/employer/ShortlistPanel";
import {
  mockCandidates,
  mockJobs,
  MockCandidate,
  MockJobDescription,
  getCareerType,
  getPersonalitySummary,
} from "@/lib/mockCandidates";
import {
  FileText,
  CheckCircle,
  Star,
  Menu,
  ChevronRight,
  Briefcase,
  Users,
} from "lucide-react";

const ACCENT = "#2D6A4F";

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

// Simple keyword extraction from job description text
function extractSkillsFromJD(text: string): string[] {
  const skillKeywords = [
    "React",
    "Vue",
    "Angular",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Python",
    "Django",
    "Flask",
    "FastAPI",
    "Java",
    "Spring",
    "Go",
    "Rust",
    "C++",
    "C#",
    ".NET",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "SQL",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Terraform",
    "GraphQL",
    "REST",
    "Git",
    "Linux",
    "TensorFlow",
    "PyTorch",
    "ML",
    "AI",
    "Figma",
    "HTML",
    "CSS",
    "Tailwind",
    "Flutter",
    "React Native",
    "Swift",
    "Kotlin",
    "CI/CD",
    "Jenkins",
    "Agile",
  ];
  const lower = text.toLowerCase();
  return skillKeywords.filter((s) => lower.includes(s.toLowerCase()));
}

export default function EmployerPage() {
  const { user, loading } = useAuth();
  const { profile } = useApp();
  const router = useRouter();

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [jobsList, setJobsList] = useState<MockJobDescription[]>(mockJobs);
  const [selectedJob, setSelectedJob] = useState<MockJobDescription>(
    mockJobs[0],
  );
  const [jdText, setJdText] = useState(mockJobs[0].description);
  const [jdParsed, setJdParsed] = useState(true);
  const [isParsing, setIsParsing] = useState(false);

  // Add Job Form states
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobField, setNewJobField] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const jobIdParam = params.get("jobId");
      if (jobIdParam) {
        const found = jobsList.find((j) => j.id === jobIdParam);
        if (found) {
          handleSelectJob(found);
        }
      }
    }
  }, [jobsList]);

  const handleParseJD = () => {
    setIsParsing(true);
    setTimeout(() => {
      const newSkills = extractSkillsFromJD(jdText);
      setSelectedJob((prev) => ({
        ...prev,
        description: jdText,
        requiredSkills: newSkills,
      }));
      setJdParsed(true);
      setIsParsing(false);
    }, 700);
  };

  const handleSelectJob = (job: MockJobDescription) => {
    setSelectedJob(job);
    setJdText(job.description);
    setJdParsed(true);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobDescription.trim()) return;

    const newJob: MockJobDescription = {
      id: `jd-${Date.now()}`,
      title: newJobTitle.trim(),
      field: newJobField.trim() || "Technology",
      focusSoftSkills: false,
      focusTechnical: true,
      vector: [0, 0],
      description: newJobDescription.trim(),
      requiredSkills: extractSkillsFromJD(newJobDescription),
    };

    setJobsList((prev) => [...prev, newJob]);
    setSelectedJob(newJob);
    setJdText(newJob.description);
    setJdParsed(true);

    // Reset Form
    setNewJobTitle("");
    setNewJobField("");
    setNewJobDescription("");
    setIsAddingJob(false);
  };

  const extractedSkills = extractSkillsFromJD(jdText);

  // Stable angle for dynamic vector positioning
  const getStableAngle = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 360) * (Math.PI / 180);
  };

  const dynamicCandidates = useMemo(() => {
    const jobSkills = selectedJob.requiredSkills.map((s) => s.toLowerCase());
    return mockCandidates.map((c) => {
      // Recalculate scores based on selectedJob skills overlap
      const candSkills = c.topSkills.map((s) => s.toLowerCase());
      const overlap = candSkills.filter((s) => jobSkills.includes(s));

      // Boost relevance: normalize technical matching score based on a standard benchmark requirement of 4 skills,
      // and apply a power scale to widen the gap between high-relevance and low-relevance candidates.
      const rawTechRatio =
        overlap.length / Math.min(4, Math.max(jobSkills.length, 1));
      const techScoreRatio = Math.pow(rawTechRatio, 1.25);
      const technicalSkillScore = Math.round(techScoreRatio * 100);

      const softSkillScore = c.softSkillScore;

      const overallScore = Math.max(
        25,
        Math.min(
          99,
          Math.round(0.5 * technicalSkillScore + 0.5 * softSkillScore),
        ),
      );

      // Calculate dynamic 2D vector relative to the job node (0, 0)
      // Apply a power curve (1.4 power) to distance mapping so high-score matches cluster
      // tightly around the center node, while low-score matches are pushed to the outer edges.
      const angle = getStableAngle(c.id);
      const scoreFraction = overallScore / 100;
      const dist = 1.25 * Math.pow(1.0 - scoreFraction, 1.25) + 0.16;
      const vector: [number, number] = [
        dist * Math.cos(angle),
        dist * Math.sin(angle),
      ];

      return {
        ...c,
        technicalSkillScore,
        overallScore,
        vector,
      };
    });
  }, [selectedJob]);

  const dynamicTopCandidates = useMemo(() => {
    return [...dynamicCandidates]
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 10);
  }, [dynamicCandidates]);

  const companyName = (profile as any).companyName || "Your Company";
  const activeCandidate = dynamicCandidates.find(
    (c) => c.id === selectedCandidateId,
  );

  return (
    <div
      style={{
        minHeight: "calc(100vh - 52px)",
        background: "var(--bg)",
        padding: "28px 24px",
      }}
    >
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        {/* Title and Sidebar Toggle Buttons */}
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {/* Toggle Left Sidebar */}
            <button
              onClick={() => setShowLeftSidebar((prev) => !prev)}
              onMouseEnter={() => setLeftHovered(true)}
              onMouseLeave={() => setLeftHovered(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                border: `1.5px solid ${showLeftSidebar ? ACCENT : leftHovered ? "var(--text-secondary)" : "var(--border)"}`,
                background: showLeftSidebar
                  ? "rgba(45, 106, 79, 0.08)"
                  : leftHovered
                    ? "#FAF9F7"
                    : "white",
                color: showLeftSidebar ? ACCENT : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
              title={showLeftSidebar ? "Hide Job Profile" : "Show Job Profile"}
            >
              <Briefcase size={16} />
            </button>

            {/* Toggle Right Sidebar */}
            <button
              onClick={() => setShowRightSidebar((prev) => !prev)}
              onMouseEnter={() => setRightHovered(true)}
              onMouseLeave={() => setRightHovered(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                border: `1.5px solid ${showRightSidebar ? ACCENT : rightHovered ? "var(--text-secondary)" : "var(--border)"}`,
                background: showRightSidebar
                  ? "rgba(45, 106, 79, 0.08)"
                  : rightHovered
                    ? "#FAF9F7"
                    : "white",
                color: showRightSidebar ? ACCENT : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
              title={showRightSidebar ? "Hide Candidates" : "Show Candidates"}
            >
              <Users size={16} />
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              showLeftSidebar && showRightSidebar
                ? "280px 1fr 340px"
                : showLeftSidebar
                  ? "280px 1fr"
                  : showRightSidebar
                    ? "1fr 340px"
                    : "1fr",
            gap: showLeftSidebar || showRightSidebar ? 20 : 0,
            transition: "all 0.3s ease",
            alignItems: "flex-start",
          }}
        >
          {/* Left Column: Job Profile & Description */}
          {showLeftSidebar && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minWidth: 280,
                height: 654,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {/* Job Selector panel */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  <Briefcase size={14} style={{ color: ACCENT }} />
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Job Profile
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    marginBottom: 16,
                  }}
                >
                  {jobsList.map((job) => {
                    const isSelected = selectedJob.id === job.id;
                    return (
                      <button
                        key={job.id}
                        onClick={() => handleSelectJob(job)}
                        style={{
                          padding: "10px",
                          borderRadius: 8,
                          border: `1.5px solid ${isSelected ? ACCENT : "var(--border)"}`,
                          background: isSelected
                            ? "rgba(45,106,79,0.04)"
                            : "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.12s",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--text)",
                            marginBottom: 1,
                          }}
                        >
                          {job.title}
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {job.field}
                        </p>
                      </button>
                    );
                  })}

                  {!isAddingJob ? (
                    <button
                      onClick={() => setIsAddingJob(true)}
                      style={{
                        padding: "8px",
                        borderRadius: 8,
                        border: "1px dashed var(--border)",
                        background: "transparent",
                        color: ACCENT,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "center",
                        marginTop: 4,
                        transition: "all 0.12s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = ACCENT;
                        e.currentTarget.style.background =
                          "rgba(45, 106, 79, 0.02)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      + Add Job Profile
                    </button>
                  ) : (
                    <form
                      onSubmit={handleCreateJob}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "#FAF9F7",
                        marginTop: 6,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--text)",
                        }}
                      >
                        New Job Profile
                      </p>

                      <input
                        type="text"
                        placeholder="Job Title (e.g. Security Specialist)"
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        required
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          fontSize: 10,
                          outline: "none",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Field (e.g. Cyber)"
                        value={newJobField}
                        onChange={(e) => setNewJobField(e.target.value)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          fontSize: 10,
                          outline: "none",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      />
                      <textarea
                        placeholder="Job Description..."
                        value={newJobDescription}
                        onChange={(e) => setNewJobDescription(e.target.value)}
                        required
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          fontSize: 10,
                          minHeight: 60,
                          resize: "vertical",
                          outline: "none",
                          fontFamily: "inherit",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          justifyContent: "flex-end",
                          marginTop: 4,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setIsAddingJob(false)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 4,
                            border: "1px solid var(--border)",
                            background: "white",
                            fontSize: 9,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{
                            padding: "4px 8px",
                            borderRadius: 4,
                            border: "none",
                            background: ACCENT,
                            color: "white",
                            fontSize: 9,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Add Profile
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <FileText size={13} style={{ color: ACCENT }} />
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        Description
                      </p>
                    </div>
                    {jdParsed && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 9,
                          color: "#2D6A4F",
                          fontWeight: 500,
                        }}
                      >
                        <CheckCircle size={9} /> Sync
                      </span>
                    )}
                  </div>
                  <textarea
                    value={jdText}
                    onChange={(e) => {
                      setJdText(e.target.value);
                      setJdParsed(false);
                    }}
                    style={{
                      width: "100%",
                      minHeight: 120,
                      padding: "8px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 11,
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                      marginBottom: 8,
                    }}
                    placeholder="Edit job description details..."
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: 9, color: "var(--text-secondary)" }}
                    >
                      {extractedSkills.length} keywords match
                    </span>
                    <button
                      onClick={handleParseJD}
                      disabled={isParsing}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: isParsing ? "var(--border)" : ACCENT,
                        color: "white",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: isParsing ? "not-allowed" : "pointer",
                      }}
                    >
                      {isParsing ? "Applying..." : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Center Column: Map */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minWidth: 0,
            }}
          >
            {/* Map component */}
            <TalentPoolMap
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={setSelectedCandidateId}
              candidates={dynamicCandidates}
              topCandidates={dynamicTopCandidates}
              job={selectedJob}
            />

            {/* Legend */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                Match score:
              </span>
              {[
                { label: "90%+", color: "#2D6A4F" },
                { label: "80–89%", color: "#40916C" },
                { label: "70–79%", color: "#74C69D" },
                { label: "60–69%", color: "#B7E4C7" },
                { label: "< 60%", color: "#D8F3DC" },
              ].map((l) => (
                <div
                  key={l.label}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: l.color,
                    }}
                  />
                  <span
                    style={{ fontSize: 10, color: "var(--text-secondary)" }}
                  >
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Candidate Profile & Shortlist */}
          {showRightSidebar && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minWidth: 340,
                height: 654,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {/* Top 10 Matches Panel */}
              <ShortlistPanel
                candidates={dynamicTopCandidates}
                selectedCandidateId={selectedCandidateId}
                onSelectCandidate={setSelectedCandidateId}
                job={selectedJob}
              />
            </div>
          )}
        </div>

        {/* Candidate Profile Modal Popup */}
        {activeCandidate && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              animation: "fadeIn 0.15s ease",
            }}
            onClick={() => setSelectedCandidateId(null)}
          >
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "24px",
                width: 580,
                maxWidth: "92vw",
                maxHeight: "85vh",
                overflowY: "auto",
                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                animation: "slideUp 0.2s ease",
                position: "relative",
                color: "var(--text)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: ACCENT,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Candidate Profile
                </span>
                <button
                  onClick={() => setSelectedCandidateId(null)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: 16,
                    cursor: "pointer",
                    fontWeight: 600,
                    padding: "4px",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: `${ACCENT}15`,
                    color: ACCENT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 16,
                    flexShrink: 0,
                    border: `2px solid ${ACCENT}`,
                  }}
                >
                  {activeCandidate.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--text)",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {activeCandidate.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      margin: 0,
                    }}
                  >
                    {activeCandidate.university} · {activeCandidate.yearsExp}{" "}
                    Years Exp · CGPA {activeCandidate.cgpa.toFixed(2)}
                  </p>
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: `${ACCENT}12`,
                    border: `1px solid ${ACCENT}30`,
                    color: ACCENT,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {activeCandidate.overallScore}% match
                </div>
              </div>

              {/* Badges & Social Links */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 20,
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: 16,
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: "rgba(45,106,79,0.1)",
                      color: "#2D6A4F",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {getCareerType(activeCandidate.mbti)}
                  </span>
                  {dynamicTopCandidates.some(
                    (c) => c.id === activeCandidate.id,
                  ) && (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: "#2D6A4F",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      ★ Top 10 Match
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    href={`https://linkedin.com/in/${activeCandidate.name.toLowerCase().replace(/\s+/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: 600,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#0077B5";
                      e.currentTarget.style.color = "#0077B5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    <LinkedinIcon size={12} />
                    LinkedIn
                  </a>
                  <a
                    href={`https://github.com/${activeCandidate.name.toLowerCase().replace(/\s+/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: 600,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--text)";
                      e.currentTarget.style.color = "var(--text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    <GithubIcon size={12} />
                    GitHub
                  </a>
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Personality Summary */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: `${ACCENT}08`,
                    border: `1px solid ${ACCENT}20`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: ACCENT,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    🧠 Personality · {getCareerType(activeCandidate.mbti)}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {getPersonalitySummary(
                      activeCandidate.mbti,
                      activeCandidate.softSkillScore,
                    )}
                  </p>
                </div>

                {/* Skills with Proficiency */}
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 10,
                    }}
                  >
                    Skills Proficiency
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 7 }}
                  >
                    {Object.entries(activeCandidate.skillLevels).map(
                      ([skill, level]) => {
                        const isMatch = selectedJob.requiredSkills
                          .map((s) => s.toLowerCase())
                          .includes(skill.toLowerCase());
                        return (
                          <div key={skill}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 3,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: isMatch ? ACCENT : "var(--text)",
                                  }}
                                >
                                  {skill}
                                </span>
                                {isMatch && (
                                  <span
                                    style={{
                                      fontSize: 8,
                                      padding: "1px 5px",
                                      borderRadius: 4,
                                      background: `${ACCENT}15`,
                                      color: ACCENT,
                                      fontWeight: 700,
                                    }}
                                  >
                                    JD Match
                                  </span>
                                )}
                              </div>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: ACCENT,
                                }}
                              >
                                {level}/10
                              </span>
                            </div>
                            <div
                              style={{
                                height: 5,
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
                                  transition: "width 0.4s ease",
                                }}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 10,
                    }}
                  >
                    Featured Projects
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {activeCandidate.projects.map((proj) => (
                      <div
                        key={proj.name}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 10,
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text)",
                            margin: "0 0 4px 0",
                          }}
                        >
                          {proj.name}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-secondary)",
                            margin: "0 0 10px 0",
                            lineHeight: 1.4,
                          }}
                        >
                          {proj.description}
                        </p>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                        >
                          {proj.tech.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: 9,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: `${ACCENT}10`,
                                color: ACCENT,
                                fontWeight: 600,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 10,
                    }}
                  >
                    Work History
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {activeCandidate.workExperience.map((exp) => (
                      <div key={`${exp.role}-${exp.company}`}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: 4,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--text)",
                              margin: 0,
                            }}
                          >
                            {exp.role}
                          </p>
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {exp.duration}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-secondary)",
                            fontWeight: 500,
                            margin: "0 0 6px 0",
                          }}
                        >
                          {exp.company}
                        </p>
                        {exp.description && (
                          <p
                            style={{
                              fontSize: 11,
                              color: "var(--text-secondary)",
                              lineHeight: 1.4,
                              margin: 0,
                            }}
                          >
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 10,
                    }}
                  >
                    Certifications
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {activeCandidate.certifications.map((cert) => (
                      <div
                        key={cert}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 11,
                          color: "var(--text)",
                        }}
                      >
                        <span style={{ color: ACCENT, fontWeight: "bold" }}>
                          ✓
                        </span>
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

