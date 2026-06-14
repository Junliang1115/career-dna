"use client";
import { useApp } from "@/lib/context";
import { getArchetype } from "@/lib/types";
import {
  calculateCareerType,
  getRIASECPercents,
  getDISCPercents,
  generateAiSummary,
  Answers,
  generateMockJobMatches,
  MockJobMatch,
} from "@/lib/scoring";
import { riasecDescriptions, discDescriptions } from "@/lib/questions";
import { useState } from "react";
import { useRouter } from "next/navigation";

const fieldToIdMap: Record<string, string> = {
  "Software Engineering": "fullstack",
  "Cloud Engineering": "cloud",
  "DevOps": "devops",
  "Data Science": "datascience",
  "AI / Machine Learning": "mlai",
  "UI/UX Design": "ux",
  "Product Management": "productdesign",
  "Mobile Development": "mobile",
  "Cybersecurity": "cybersec",
  "Business Analysis": "analytics",
};

export default function ResultsPage() {
  const router = useRouter();
  const { profile, setProfile } = useApp();
  const [showMap, setShowMap] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const userHasSkill = (skillName: string) => {
    const skills = profile.skills || [];
    const courses = profile.courses || [];
    const lower = skillName.toLowerCase().trim();

    const hasInSkills = skills.some((s) => {
      const sLower = s.toLowerCase().trim();
      return sLower.includes(lower) || lower.includes(sLower);
    });

    const hasInCourses = courses.some((c) => {
      const cLower = c.toLowerCase().trim();
      return cLower.includes(lower) || lower.includes(cLower);
    });

    return hasInSkills || hasInCourses;
  };

  if (!profile.careerType && Object.keys(profile.answers).length === 0) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 56px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--text-secondary)" }}>
          No results yet.{" "}
          <a
            href="/quiz"
            style={{ color: "var(--text)", textDecoration: "underline" }}
          >
            Take the quiz first.
          </a>
        </p>
      </div>
    );
  }

  // Run full scoring
  const result = calculateCareerType(profile.answers);
  const type = profile.careerType || result.careerType;
  const archetype = getArchetype(type);

  // RIASEC + DISC breakdowns
  const riasecPercents = getRIASECPercents({
    R: result.riasecScores.R,
    I: result.riasecScores.I,
    A: result.riasecScores.A,
    S: result.riasecScores.S,
    E: result.riasecScores.E,
    C: result.riasecScores.C,
    total: Object.keys(profile.answers).length,
  });
  const discPercents = getDISCPercents(result.discScores);

  // AI Summary
  const aiSummary = generateAiSummary(type, result, profile.answers);

  // Mock job matches based on archetype
  const mockMatches = generateMockJobMatches(type, archetype);
  const topMatch = mockMatches[0];
  const otherMatches = mockMatches.slice(1);

  const handleShare = () => {
    const text = `My Career Type is ${type} — "${archetype.name}"! Find yours at Career DNA.`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const handleRetake = () => {
    setProfile({ answers: {}, careerType: "" });
    router.push("/quiz");
  };

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: "56px 24px" }}>
      {/* ── Type Reveal ── */}
      <div
        className="animate-fade-up"
        style={{ textAlign: "center", marginBottom: 56 }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-tertiary)",
            letterSpacing: "0.1em",
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          Your Career Type
        </p>

        {/* Type display — e.g. "D-R" */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {type.split("").map((letter, i) => (
            <div
              key={i}
              style={{
                width: letter === "-" ? 24 : 56,
                height: 68,
                borderRadius: 6,
                border: letter === "-" ? "none" : "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: letter === "-" ? 20 : 28,
                fontWeight: 400,
                color: letter === "-" ? "var(--text-tertiary)" : "var(--text)",
                background: letter === "-" ? "transparent" : "var(--bg)",
                fontFamily: "'Newsreader', serif",
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        <h1
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: "var(--text)",
            marginBottom: 8,
            fontFamily: "'Newsreader', serif",
          }}
        >
          {archetype.name}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            fontStyle: "italic",
            marginBottom: 28,
          }}
        >
          &ldquo;{archetype.tagline}&rdquo;
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button
            onClick={handleShare}
            className="btn-secondary"
            style={{ fontSize: 12 }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle
                cx="3"
                cy="3"
                r="1.5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <circle
                cx="10"
                cy="3"
                r="1.5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <circle
                cx="6.5"
                cy="10"
                r="1.5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <path
                d="M3 4.5v1.5M6.5 4.5V8M8.5 6v3"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
            Share My Type
          </button>

          <button
            onClick={handleRetake}
            className="btn-secondary"
            style={{
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Retake Quiz
          </button>
        </div>
      </div>

      {/* ── AI Career DNA Analysis Summary ── */}
      <div
        className="animate-fade-up stagger-1"
        style={{
          padding: "24px",
          borderRadius: 12,
          border: "1px solid var(--accent-green-border)",
          background:
            "linear-gradient(135deg, var(--surface), var(--accent-green-subtle))",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
          marginBottom: 48,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative background glow */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "var(--accent-green-subtle)",
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--accent-green)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            AI Personality Summary
          </h2>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "var(--bg)",
              background: "var(--accent-green)",
              padding: "3px 8px",
              borderRadius: 999,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            AI Analysis
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          <p style={{ margin: 0, fontWeight: 500, color: "var(--text)" }}>
            {aiSummary.workingDNA}
          </p>
          <p style={{ margin: 0 }}>{aiSummary.secretWeapon}</p>
          <div
            style={{
              marginTop: 4,
              padding: "12px 14px",
              borderRadius: 8,
              background: "var(--accent-green-subtle)",
              borderLeft: "3px solid var(--accent-green)",
              fontSize: 12,
              color: "var(--text)",
              fontWeight: 500,
            }}
          >
            {aiSummary.growth}
          </div>
        </div>
      </div>

      {/* ── RIASEC Breakdown ── */}
      <div className="animate-fade-up stagger-2" style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 4,
            letterSpacing: "0.02em",
          }}
        >
          Work Preference Profile
        </h2>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-tertiary)",
            marginBottom: 16,
          }}
        >
          What kind of work energises you (RIASEC)
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {riasecPercents.map((dim) => (
            <div
              key={dim.type}
              style={{
                padding: "16px 18px",
                borderRadius: 6,
                border:
                  dim.type === result.dominantRIASEC
                    ? "1px solid var(--text)"
                    : "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-tertiary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {dim.roleName} ({dim.type})
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "var(--surface)",
                  }}
                >
                  {dim.percent}%
                </span>
              </div>

              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: "var(--border)",
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${dim.percent}%`,
                    background: "var(--text)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {dim.summary}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DISC Breakdown ── */}
      <div className="animate-fade-up stagger-2" style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 4,
            letterSpacing: "0.02em",
          }}
        >
          Work Personality Profile
        </h2>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-tertiary)",
            marginBottom: 16,
          }}
        >
          How you behave and work with others (DISC)
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {discPercents.map((dim) => (
            <div
              key={dim.type}
              style={{
                padding: "16px 18px",
                borderRadius: 6,
                border:
                  dim.type === result.dominantDISC
                    ? "1px solid var(--text)"
                    : "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-tertiary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {dim.roleName} ({dim.type})
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "var(--surface)",
                  }}
                >
                  {dim.percent}%
                </span>
              </div>

              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: "var(--border)",
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${dim.percent}%`,
                    background: "var(--text)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {dim.summary}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Job Position Matches ── */}
      <div className="animate-fade-up stagger-3" style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "0.02em",
            }}
          >
            Top 5 Job Position Matches
          </h2>
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-tertiary)",
            marginBottom: 16,
          }}
        >
          Roles matched to your personality, skills &amp; experience profile
        </p>

        {/* ── #1 Top Match Highlight ── */}
        {topMatch && (
          <div
            style={{
              padding: 22,
              borderRadius: 10,
              border: "2px solid var(--accent-blue)",
              background: "var(--surface)",
              marginBottom: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Best Match badge */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                background: "var(--accent-blue)",
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                padding: "3px 12px 3px 14px",
                borderRadius: "0 0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              ★ Best Match
            </div>

            {/* Header: Title + Score */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 4,
                  }}
                >
                  {topMatch.title}
                </h3>

                {/* Metadata row: field */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 6,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {topMatch.field}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color:
                        topMatch.demand === "High Demand"
                          ? "var(--accent-green)"
                          : "var(--text-secondary)",
                      padding: "1px 6px",
                      borderRadius: 4,
                      background:
                        topMatch.demand === "High Demand"
                          ? "var(--accent-green-subtle)"
                          : "var(--bg)",
                      border: `1px solid ${topMatch.demand === "High Demand" ? "var(--accent-green)" : "var(--border)"}`,
                    }}
                  >
                    {topMatch.demand}
                  </span>
                </div>

                {/* Salary */}
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text)",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  RM {topMatch.salaryMin.toLocaleString()} –{" "}
                  {topMatch.salaryMax.toLocaleString()}
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-tertiary)",
                      fontWeight: 400,
                    }}
                  >
                    {" "}
                    /month
                  </span>
                </p>
              </div>

              {/* Large score circle */}
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: "3px solid var(--accent-blue)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--accent-blue)",
                      lineHeight: 1,
                      fontFamily: "'Newsreader', serif",
                    }}
                  >
                    {topMatch.totalScore}
                  </div>
                  <div
                    style={{
                      fontSize: 8,
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    /100
                  </div>
                </div>
              </div>
            </div>

            {/* Why You Fit Callout */}
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: "var(--accent-blue-subtle)",
                borderLeft: "3px solid var(--accent-blue)",
                marginBottom: 12,
                fontSize: 11,
                color: "var(--text-secondary)",
                lineHeight: 1.4,
              }}
            >
              💡 {topMatch.whyYouFit}
            </div>

            {/* Job Description */}
            <p
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                margin: 0,
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              {topMatch.description}
            </p>

            {/* Score breakdown bars */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 14,
              }}
            >
              <ScoreBar
                label="Personality"
                value={topMatch.personalityScore}
                max={40}
                color="#a78bfa"
              />
              <ScoreBar
                label="Skill"
                value={topMatch.skillScore}
                max={35}
                color="#34d399"
              />
              <ScoreBar
                label="Experience"
                value={topMatch.experienceScore}
                max={25}
                color="#60a5fa"
              />
            </div>

            {/* Key skills + Your strengths */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-tertiary)",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Key Skills Required
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {topMatch.keySkills.map((s) => {
                    const owned = userHasSkill(s);
                    return (
                      <span
                        key={s}
                        className={`tag ${owned ? "tag-green" : "tag-muted"}`}
                        style={{
                          fontSize: 10,
                          border: owned ? undefined : "1px solid var(--border)",
                          opacity: owned ? 1 : 0.6,
                        }}
                      >
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-tertiary)",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Your Matching Strengths
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {topMatch.yourStrengths.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "var(--accent-blue-subtle)",
                        color: "var(--accent-blue)",
                        border: "1px solid var(--accent-blue)",
                        fontWeight: 500,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Other 4 Job Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          {otherMatches.map((match, idx) => {
            const isExpanded = expandedId === match.id;

            return (
              <div
                key={match.id}
                className="card"
                style={{
                  padding: 16,
                  border: isExpanded
                    ? "1px solid var(--text)"
                    : "1px solid var(--border)",
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "var(--text-tertiary)",
                          width: 18,
                          height: 18,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          border: "1px solid var(--border)",
                          flexShrink: 0,
                        }}
                      >
                        #{idx + 2}
                      </span>
                      <h3
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text)",
                          margin: 0,
                        }}
                      >
                        {match.title}
                      </h3>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "var(--text)",
                        lineHeight: 1,
                      }}
                    >
                      {match.totalScore}
                    </div>
                    <div
                      style={{
                        fontSize: 8,
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      /100
                    </div>
                  </div>
                </div>

                {/* Metadata chips */}
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      padding: "1px 6px",
                      borderRadius: 3,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {match.field}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      padding: "1px 6px",
                      borderRadius: 3,
                      background:
                        match.demand === "High Demand"
                          ? "var(--accent-green-subtle)"
                          : "var(--bg)",
                      border: `1px solid ${match.demand === "High Demand" ? "var(--accent-green)" : "var(--border)"}`,
                      color:
                        match.demand === "High Demand"
                          ? "var(--accent-green)"
                          : "var(--text-secondary)",
                      fontWeight: match.demand === "High Demand" ? 600 : 400,
                    }}
                  >
                    {match.demand}
                  </span>
                </div>

                {/* Key skills */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    marginBottom: 8,
                  }}
                >
                  {match.keySkills.slice(0, 4).map((s) => {
                    const owned = userHasSkill(s);
                    return (
                      <span
                        key={s}
                        className={`tag ${owned ? "tag-green" : "tag-muted"}`}
                        style={{
                          fontSize: 9,
                          border: owned ? undefined : "1px solid var(--border)",
                          opacity: owned ? 1 : 0.6,
                        }}
                      >
                        {s}
                      </span>
                    );
                  })}
                  {match.keySkills.length > 4 && (
                    <span
                      style={{
                        fontSize: 9,
                        padding: "1px 6px",
                        borderRadius: 4,
                        color: "var(--text-tertiary)",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      +{match.keySkills.length - 4}
                    </span>
                  )}
                </div>

                {/* View Details toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : match.id)}
                  style={{
                    fontSize: 10,
                    color: "var(--text-secondary)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {isExpanded ? "Hide Details" : "View Details"}
                </button>

                {/* Expanded breakdown */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    {/* Score bars */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        marginBottom: 10,
                      }}
                    >
                      <ScoreBar
                        label="Personality"
                        value={match.personalityScore}
                        max={40}
                        color="#a78bfa"
                      />
                      <ScoreBar
                        label="Skill"
                        value={match.skillScore}
                        max={35}
                        color="#34d399"
                      />
                      <ScoreBar
                        label="Experience"
                        value={match.experienceScore}
                        max={25}
                        color="#60a5fa"
                      />
                    </div>

                    {/* Salary + Company */}
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text)",
                        fontWeight: 500,
                        marginBottom: 6,
                      }}
                    >
                      RM {match.salaryMin.toLocaleString()} –{" "}
                      {match.salaryMax.toLocaleString()}
                      <span
                        style={{
                          fontWeight: 400,
                          color: "var(--text-tertiary)",
                          fontSize: 10,
                        }}
                      >
                        {" "}
                        /month
                      </span>
                      <span style={{ color: "var(--text-tertiary)" }}> · </span>
                      <span
                        style={{
                          fontWeight: 400,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {match.companyType}
                      </span>
                    </div>

                    {/* Why You Fit */}
                    <div
                      style={{
                        padding: "6px 10px",
                        borderRadius: 5,
                        background: "var(--accent-blue-subtle)",
                        borderLeft: "2px solid var(--accent-blue)",
                        marginBottom: 8,
                        fontSize: 10,
                        color: "var(--text-secondary)",
                        lineHeight: 1.4,
                      }}
                    >
                      💡 {match.whyYouFit}
                    </div>

                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-secondary)",
                        margin: 0,
                        marginBottom: 8,
                        lineHeight: 1.5,
                      }}
                    >
                      {match.description}
                    </p>

                    {/* Your strengths */}
                    <div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "var(--text-tertiary)",
                          marginBottom: 3,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Your Matching Strengths
                      </div>
                      <div
                        style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
                      >
                        {match.yourStrengths.map((s) => (
                          <span
                            key={s}
                            style={{
                              fontSize: 9,
                              padding: "1px 7px",
                              borderRadius: 4,
                              background: "var(--accent-blue-subtle)",
                              color: "var(--accent-blue)",
                              border: "1px solid var(--accent-blue)",
                              fontWeight: 500,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Career Field Map ── */}
      <div className="animate-fade-up stagger-4" style={{ marginBottom: 48, textAlign: "center" }}>
        <button
          onClick={() => {
            const fieldId = fieldToIdMap[topMatch.field] || "fullstack";
            router.push(`/map?field=${fieldId}`);
          }}
          className="btn-primary"
          style={{
            padding: "10px 24px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Explore more...
        </button>
      </div>

      {/* ── Type Profile ── */}
      <div className="animate-fade-up stagger-5">
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 16,
            letterSpacing: "0.02em",
          }}
        >
          Type Profile
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          <div className="card-surface" style={{ padding: 18 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-tertiary)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Strengths
            </p>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {archetype.strengths.map((s) => (
                <li
                  key={s}
                  style={{
                    fontSize: 12,
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      color: "var(--accent-green)",
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-surface" style={{ padding: 18 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-tertiary)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Ideal Environments
            </p>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {archetype.idealEnvironments.map((e) => (
                <li
                  key={e}
                  style={{
                    fontSize: 12,
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      color: "var(--text)",
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-surface" style={{ padding: 18 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-tertiary)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Growth Areas
            </p>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {archetype.growthAreas.map((g) => (
                <li
                  key={g}
                  style={{
                    fontSize: 12,
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      color: "var(--accent-blue)",
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M5 2v6M2 5h6"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Work Style — new section */}
        <div className="card-surface" style={{ padding: 18, marginTop: 12 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-tertiary)",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Work Style
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--text)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {archetype.workStyle}
          </p>
        </div>

        {/* Top Jobs — new section */}
        <div className="card-surface" style={{ padding: 18, marginTop: 12 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-tertiary)",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Recommended Roles
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {archetype.topJobs.map((job) => (
              <span
                key={job}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--text)",
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                }}
              >
                {job}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontSize: 10,
          color: "var(--text-secondary)",
          width: 80,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 4,
          background: "var(--border)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.round((value / max) * 100)}%`,
            background: color,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text)",
          width: 36,
          textAlign: "right",
        }}
      >
        {value}/{max}
      </span>
    </div>
  );
}

function MiniBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        height: 4,
        background: "var(--border)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.round((value / max) * 100)}%`,
          background: color,
        }}
      />
    </div>
  );
}
