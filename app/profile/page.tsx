"use client";
import { useState, useRef } from "react";
import { useApp } from "@/lib/context";
import { useAuth } from "@/lib/auth-context";
import { universities, allCourses } from "@/lib/universities";
import { Check, Upload, FileText, Trash2, Plus, X, LogOut } from "lucide-react";
import Link from "next/link";

const ACCENT = "var(--accent-green)";
const ACCENT_SUBTLE = "var(--accent-green-subtle)";
const ACCENT_BORDER = "var(--accent-green-border)";

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
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");

  const currentUni = universities.find((u) => u.name === uni);

  const toggleCourse = (course: string) => {
    setCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : prev.length < 5
          ? [...prev, course]
          : prev,
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
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const hasCareerType = !!profile.careerType;

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

      {/* ── MBTI Result Header ─────────────────────────────── */}
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

      {/* ── Sections ───────────────────────────────────────── */}
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

        {/* Courses */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <SectionHeader label="Top 5 Courses" />
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {courses.length}/5
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {allCourses.map((course) => {
              const isSelected = courses.includes(course);
              return (
                <button
                  key={course}
                  onClick={() => toggleCourse(course)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1.5px solid ${isSelected ? ACCENT : "var(--border)"}`,
                    background: isSelected ? ACCENT_SUBTLE : "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: isSelected ? 500 : 400,
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.1s",
                  }}
                >
                  {course}
                  {isSelected && <Check size={13} style={{ color: ACCENT }} />}
                </button>
              );
            })}
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

        {/* Certifications */}
        <section>
          <SectionHeader label="Certifications" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {COMMON_CERTS.map((cert) => {
              const isSelected = certifications.includes(cert);
              return (
                <button
                  key={cert}
                  onClick={() => toggleCert(cert)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1.5px solid ${isSelected ? ACCENT : "var(--border)"}`,
                    background: isSelected ? ACCENT_SUBTLE : "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: isSelected ? 500 : 400,
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.1s",
                  }}
                >
                  {cert}
                  {isSelected && <Check size={13} style={{ color: ACCENT }} />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Transcript */}
        <section>
          <SectionHeader label="Transcript" />
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
              <span style={{ fontSize: 13 }}>Click to upload PDF</span>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                Parsing coming soon
              </span>
            </button>
          )}
        </section>
      </div>

      {/* ── Sticky Save Button ──────────────────────────────── */}
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
