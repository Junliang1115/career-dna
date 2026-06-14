"use client";
import {
  MockCandidate,
  MockJobDescription,
  getCareerType,
} from "@/lib/mockCandidates";
import { Star, ExternalLink, TrendingUp, Check } from "lucide-react";

interface Props {
  candidates: MockCandidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string | null) => void;
  job: MockJobDescription;
}

/** Soft skill labels derived from quiz softSkillScore range */
function softSkillLabel(score: number): string {
  if (score >= 90) return "Exceptional people skills";
  if (score >= 80) return "Strong collaboration skills";
  if (score >= 70) return "Solid communication skills";
  if (score >= 60) return "Good problem-solving mindset";
  return "Analytical & detail-oriented";
}

/**
 * Generate 2–3 contextual keyword highlights for a candidate card.
 * Priority:
 *  1. Years of experience in their primary role
 *  2. Up to 2 skill keywords that match the job's requiredSkills
 *  3. One soft skill insight derived from quiz softSkillScore
 */
function getHighlights(c: MockCandidate, job: MockJobDescription): string[] {
  const highlights: string[] = [];

  // 1. Experience headline — pull role title from first work experience
  const primaryRole = c.workExperience[0]?.role ?? "Engineering";
  // Strip common suffixes for brevity
  const shortRole = primaryRole
    .replace(/\bSenior\b/i, "Sr.")
    .replace(/\bJunior\b/i, "Jr.")
    .replace(/\bAssociate\b/i, "")
    .trim();
  highlights.push(
    `${c.yearsExp} yr${c.yearsExp !== 1 ? "s" : ""} as ${shortRole}`,
  );

  // 2. Matched skills (up to 2) vs the current JD
  const jobSkillsLower = job.requiredSkills.map((s) => s.toLowerCase());
  const matchedSkills = c.topSkills.filter((s) =>
    jobSkillsLower.includes(s.toLowerCase()),
  );
  if (matchedSkills.length > 0) {
    highlights.push(`Proficiency in ${matchedSkills.slice(0, 2).join(" & ")}`);
  }

  // 3. Soft skill insight from quiz score (always show, keeps card informative)
  highlights.push(softSkillLabel(c.softSkillScore));

  return highlights.slice(0, 3);
}

export default function ShortlistPanel({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  job,
}: Props) {
  const avgScore =
    candidates.length > 0
      ? Math.round(
          candidates.reduce((s, c) => s + c.overallScore, 0) /
            candidates.length,
        )
      : 0;

  const ACCENT = "#2D6A4F";

  if (candidates.length === 0) {
    return (
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
            gap: 7,
            marginBottom: 10,
          }}
        >
          <Star size={14} style={{ color: "#F59E0B" }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
            Top 10 Matches
          </p>
        </div>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              lineHeight: 1.5,
            }}
          >
            No candidates matched. Try adjusting the job description.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--bg)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Star size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
            Top 10 Matches
          </p>
          <span
            style={{
              padding: "1px 6px",
              borderRadius: 10,
              background: "var(--accent-green-subtle)",
              color: "var(--accent-green)",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {candidates.length}
          </span>
        </div>
        {candidates.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={11} style={{ color: ACCENT }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT }}>
              Avg {avgScore}%
            </span>
          </div>
        )}
      </div>

      {/* Candidate list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
          overflowY: "auto",
          paddingRight: "6px",
        }}
      >
        {candidates.map((c) => {
          const isSelected = selectedCandidateId === c.id;
          const highlights = getHighlights(c, job);

          return (
            <div
              key={c.id}
              onClick={() => onSelectCandidate(isSelected ? null : c.id)}
              style={{
                padding: "10px",
                borderRadius: 8,
                border: isSelected
                  ? `1.5px solid ${ACCENT}`
                  : "1px solid var(--border)",
                background: isSelected
                  ? "rgba(45,106,79,0.02)"
                  : "var(--surface)",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {/* Header row: avatar + name + score */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    background: ACCENT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 10,
                    flexShrink: 0,
                  }}
                >
                  {c.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text)",
                      marginBottom: 1,
                    }}
                  >
                    {c.name}
                  </p>
                  <p style={{ fontSize: 9, color: "var(--text-secondary)" }}>
                    {c.university} · {getCareerType(c.mbti)} · CGPA:
                    {c.cgpa.toFixed(2)}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: ACCENT }}>
                    {c.overallScore}%
                  </div>
                </div>
              </div>

              {/* Keyword highlight badges */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                {highlights.map((h, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "2px 7px",
                      borderRadius: 20,
                      fontSize: 8.5,
                      fontWeight: 600,
                      lineHeight: 1.5,
                      background:
                        i === 0
                          ? "var(--accent-green-subtle)"
                          : i === 1
                            ? "rgba(82,183,136,0.10)"
                            : "var(--surface)",
                      color:
                        i === 0
                          ? ACCENT
                          : i === 1
                            ? ACCENT
                            : "var(--text-secondary)",
                      border: `1px solid ${
                        i === 0
                          ? "var(--accent-green-border)"
                          : i === 1
                            ? "rgba(82,183,136,0.25)"
                            : "var(--border)"
                      }`,
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Action button */}
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCandidate(isSelected ? null : c.id);
                  }}
                  style={{
                    flex: 1,
                    padding: "5px 8px",
                    borderRadius: 6,
                    border: isSelected ? "none" : "1px solid var(--border)",
                    background: isSelected ? ACCENT : "var(--surface)",
                    color: isSelected ? "white" : "var(--text)",
                    fontSize: 9,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    transition: "all 0.12s",
                  }}
                >
                  {isSelected ? (
                    <>
                      <Check size={9} /> Selected
                    </>
                  ) : (
                    <>
                      <ExternalLink size={9} /> View Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 90) return "#2D6A4F";
  if (score >= 80) return "#40916C";
  if (score >= 70) return "#74C69D";
  if (score >= 60) return "#B7E4C7";
  return "#D8F3DC";
}
