"use client";
import { useState, useRef } from "react";

import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { universities } from "@/lib/universities";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import { extractTextFromFile, parseResumeWithLLM } from "@/lib/resumeParser";

type DegreeLevel = "bachelor" | "master" | "phd" | "";
type Step = "role" | "uni" | "degree" | "major" | "resume" | "employer-info";

const CANDIDATE_STEPS: Step[] = ["role", "uni", "degree", "major", "resume"];
const EMPLOYER_STEPS: Step[] = ["role", "employer-info"];
const ACCENT = "#2D6A4F";

const DEGREE_OPTIONS: { value: DegreeLevel; label: string; desc: string }[] = [
  {
    value: "bachelor",
    label: "Bachelor's Degree",
    desc: "Undergraduate — 3 to 4 years",
  },
  {
    value: "master",
    label: "Master's Degree",
    desc: "Postgraduate — 1 to 2 years",
  },
  { value: "phd", label: "PhD / Doctorate", desc: "Research — 3 to 5+ years" },
];

// Custom inline SVG icons because the installed lucide-react package does not export Github/Linkedin

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile } = useApp();

  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<
    "candidate" | "employer" | ""
  >((profile.role as "candidate" | "employer") || "");
  const [selectedUni, setSelectedUni] = useState(profile.university || "");
  const [selectedDegree, setSelectedDegree] = useState<DegreeLevel>(
    profile.degree || "",
  );
  const [selectedMajor, setSelectedMajor] = useState(profile.major || "");
  const [transcript, setTranscript] = useState<File | null>(
    profile.transcriptFile,
  );



  const fileRef = useRef<HTMLInputElement>(null);
  const steps = profile.role === "employer" ? EMPLOYER_STEPS : CANDIDATE_STEPS;
  const stepIndex = steps.indexOf(step);
  const currentUni = universities.find((u) => u.name === selectedUni);

  // Resume parsing states
  type ResumeState = "idle" | "parsing" | "done";
  const [resumeState, setResumeState] = useState<ResumeState>("idle");
  const [parseProgress, setParseProgress] = useState(0);
  const [parseMessage, setParseMessage] = useState("");
  const [parsedSummary, setParsedSummary] = useState<string | null>(null);

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

      // Merge parsed details into unified profile context
      setProfile({
        skills: Array.from(
          new Set([...(profile.skills || []), ...parsed.skills]),
        ),
        certifications: Array.from(
          new Set([
            ...(profile.certifications || []),
            ...parsed.certifications,
          ]),
        ),
        awards: Array.from(
          new Set([...(profile.awards || []), ...parsed.awards]),
        ),
        workExperience: [
          ...(profile.workExperience || []),
          ...parsed.workExperience.filter(
            (newWork) =>
              !(profile.workExperience || []).some(
                (w) =>
                  w.company.toLowerCase() === newWork.company.toLowerCase() &&
                  w.role.toLowerCase() === newWork.role.toLowerCase(),
              ),
          ),
        ],
        projects: [
          ...(profile.projects || []),
          ...parsed.projects.filter(
            (newProj) =>
              !(profile.projects || []).some(
                (p) => p.name.toLowerCase() === newProj.name.toLowerCase(),
              ),
          ),
        ],
        transcriptFile: file,
      });

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

  const handleNext = () => {
    if (step === "role") {
      if (selectedRole) {
        setProfile({ role: selectedRole });
        if (selectedRole === "employer") {
          setStep("employer-info");
        } else {
          setStep("uni");
        }
      }
    } else if (step === "uni") {
      if (selectedUni) setProfile({ university: selectedUni });
      setStep("degree");
    } else if (step === "degree") {
      if (selectedDegree) setProfile({ degree: selectedDegree });
      setStep("major");
    } else if (step === "major") {
      if (selectedMajor) setProfile({ major: selectedMajor });
      setStep("resume");
    } else if (step === "resume") {
      router.push("/quiz");
    } else if (step === "employer-info") {
      router.push("/quiz");
    }
  };

  const handleSkip = () => {
    if (selectedUni) setProfile({ university: selectedUni });
    if (selectedDegree) setProfile({ degree: selectedDegree });
    if (selectedMajor) setProfile({ major: selectedMajor });
    setProfile({
      transcriptFile: transcript,
      linkedin: profile.linkedin || "",
      github: profile.github || "",
    });
    router.push("/profile");
  };

  const handleBack = () => {
    const prev = steps[stepIndex - 1];
    if (prev) setStep(prev);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Progress */}
        {step !== "role" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
            {steps.map((s, i) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: i <= stepIndex ? ACCENT : "var(--border)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        )}

        {/* Step label */}
        <div style={{ marginBottom: 28 }}>
          {step !== "role" && (
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: ACCENT,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Step {stepIndex + 1} of {steps.length}
            </p>
          )}
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 6,
            }}
          >
            {step === "role" && "How do you want to use CareerScope?"}
            {step === "uni" && "Which university do you attend?"}
            {step === "degree" && "What's your degree level?"}
            {step === "major" && "What's your major?"}
            {step === "resume" && "Upload your Resume / CV"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            {step === "role" && "Choose the path that fits you."}
            {step === "uni" &&
              "We'll tailor job matches to your university's network."}
            {step === "degree" &&
              "This helps us filter opportunities at the right level."}
            {step === "major" && `${selectedUni} — select your field of study.`}
            {step === "resume" &&
              "We'll auto-extract your skills, experience, and projects to match you with top careers."}
          </p>
        </div>

        {/* ── Step 1: Role ───────────────────────────────────── */}
        {step === "role" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                value: "candidate",
                label: "I'm a Student",
                desc: "Discover my career type, explore fields, and find my path.",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                ),
              },
              {
                value: "employer",
                label: "I'm an Employer",
                desc: "Find talent that fits your company's needs.",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                    <line x1="10" y1="14" x2="14" y2="14" />
                  </svg>
                ),
              },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setSelectedRole(opt.value as "candidate" | "employer")
                }
                style={{
                  padding: "16px",
                  borderRadius: 10,
                  border: `2px solid ${selectedRole === opt.value ? ACCENT : "var(--border)"}`,
                  background:
                    selectedRole === opt.value
                      ? "rgba(45,106,79,0.06)"
                      : "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.12s",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ACCENT,
                    flexShrink: 0,
                  }}
                >
                  {opt.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text)",
                      marginBottom: 2,
                    }}
                  >
                    {opt.label}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {opt.desc}
                  </p>
                </div>
                {selectedRole === opt.value && (
                  <Check
                    size={16}
                    style={{ color: ACCENT, marginLeft: "auto", flexShrink: 0 }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: University ─────────────────────────────── */}
        {step === "uni" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            {universities.map((uni) => (
              <button
                key={uni.name}
                onClick={() => setSelectedUni(uni.name)}
                style={{
                  padding: "13px 16px",
                  borderRadius: 10,
                  border: `2px solid ${selectedUni === uni.name ? ACCENT : "var(--border)"}`,
                  background:
                    selectedUni === uni.name
                      ? "rgba(45,106,79,0.06)"
                      : "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: selectedUni === uni.name ? 600 : 400,
                  color: "var(--text)",
                  transition: "all 0.12s",
                }}
              >
                {uni.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Degree ───────────────────────────────── */}
        {step === "degree" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEGREE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedDegree(opt.value)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `2px solid ${selectedDegree === opt.value ? ACCENT : "var(--border)"}`,
                  background:
                    selectedDegree === opt.value
                      ? "rgba(45,106,79,0.06)"
                      : "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: selectedDegree === opt.value ? 600 : 500,
                        color: "var(--text)",
                        marginBottom: 2,
                      }}
                    >
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {opt.desc}
                    </p>
                  </div>
                  {selectedDegree === opt.value && (
                    <Check size={16} style={{ color: ACCENT }} />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 3: Major ────────────────────────────────── */}
        {step === "major" && currentUni && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            {currentUni.majors.map((major) => (
              <button
                key={major}
                onClick={() => setSelectedMajor(major)}
                style={{
                  padding: "13px 16px",
                  borderRadius: 10,
                  border: `2px solid ${selectedMajor === major ? ACCENT : "var(--border)"}`,
                  background:
                    selectedMajor === major
                      ? "rgba(45,106,79,0.06)"
                      : "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: selectedMajor === major ? 600 : 400,
                  color: "var(--text)",
                  transition: "all 0.12s",
                }}
              >
                {major}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 5: Resume ───────────────────────────────── */}
        {step === "resume" && (
          <div>
            <input
              ref={fileRef}
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
                  padding: "20px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  marginBottom: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    {parseMessage}
                  </span>
                  <span
                    style={{ fontSize: 13, color: ACCENT, fontWeight: 700 }}
                  >
                    {parseProgress}%
                  </span>
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
                      height: "100%",
                      width: `${parseProgress}%`,
                      background: ACCENT,
                      borderRadius: 3,
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
                  gap: 12,
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "rgba(45,106,79,0.08)",
                  border: `1px solid ${ACCENT}`,
                  marginBottom: 16,
                }}
              >
                <Check
                  size={18}
                  color={ACCENT}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 14,
                      color: ACCENT,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    Resume Parsed Successfully!
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.4,
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
                    color: ACCENT,
                    padding: 2,
                    display: "flex",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {transcript ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    border: `2px solid ${ACCENT}`,
                    background: "rgba(45,106,79,0.03)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <FileText
                    size={24}
                    style={{ color: ACCENT, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {transcript.name}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {(transcript.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTranscript(null);
                      setParsedSummary(null);
                      setProfile({ transcriptFile: null });
                    }}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      display: "flex",
                      transition: "background 0.15s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(0,0,0,0.05)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    alignSelf: "flex-start",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor = ACCENT)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                >
                  Upload different resume
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = ACCENT;
                  e.currentTarget.style.backgroundColor =
                    "rgba(45,106,79,0.02)";
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.backgroundColor = "transparent";
                  const f = e.dataTransfer.files[0];
                  if (f) handleResumeFile(f);
                }}
                style={{
                  width: "100%",
                  padding: "40px 20px",
                  borderRadius: 12,
                  border: "2px dashed var(--border)",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "var(--text-secondary)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ACCENT;
                  e.currentTarget.style.backgroundColor =
                    "rgba(45,106,79,0.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(45,106,79,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ACCENT,
                    marginBottom: 4,
                  }}
                >
                  <Upload size={22} />
                </div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Upload Resume / CV
                </span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  Drag & drop or click to browse (PDF or Image up to 10MB)
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────── */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            onClick={handleNext}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 10,
              border: "none",
              background: ACCENT,
              color: "white",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            {stepIndex === steps.length - 1 ? "Start Quiz" : "Continue"}
            <ChevronRight size={16} />
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                style={{
                  flex: "0 0 auto",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step !== "employer-info" && step !== "role" && (
              <button
                onClick={handleSkip}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
