"use client";
import Link from "next/link";
import DotField from "@/components/home/DotField";
import { careerFields, clusterColors } from "@/lib/careerTaxonomy";
import { useEffect, useState } from "react";

// Dynamically derive clusters from careerTaxonomy + fieldGraph
const clusterMeta: Record<string, string> = {
  engineering: "Engineering",
  data: "Data & AI",
  infrastructure: "Infrastructure",
  security: "Security",
  design: "Design",
  science: "Research",
  emerging: "Emerging Tech",
  product: "Product & Biz",
};

const CLUSTERS = (() => {
  const groups: Record<string, typeof careerFields> = {};
  for (const f of careerFields) {
    if (!groups[f.cluster]) groups[f.cluster] = [];
    groups[f.cluster].push(f);
  }
  return Object.entries(groups).map(([id, fields]) => ({
    id,
    label: clusterMeta[id] ?? id,
    color: clusterColors[id] ?? "#888",
    count: fields.length,
    fields,
  }));
})();

const STUDENT_STEPS = [
  {
    num: "01",
    title: "Answer the Quiz",
    desc: "Complete a short career personality assessment — 28 questions that take about 8 minutes.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Fill Up Your Profile",
    desc: "Add your skills, education, and experience to build a complete career profile that represents you.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Explore the Map",
    desc: "Discover your most suitable career path on the interactive career map, matched to your unique profile.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
  },
];

const EMPLOYER_STEPS = [
  {
    num: "01",
    title: "Post a Job Description",
    desc: "Paste or write your job description — our AI extracts the key skills and requirements automatically.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Vector Matches Candidates",
    desc: "Our engine cross-references personality, skills, and experience to score and rank the best-fit talent.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "View the Talent Pool",
    desc: "Browse your top candidates on the visual talent map, drill into profiles, and shortlist the right hire.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const htmlTheme = document.documentElement.getAttribute("data-theme");
    if (htmlTheme === "light") setTheme("light");
    else if (htmlTheme === "dark") setTheme("dark");
    else setTheme(isDark ? "dark" : "light");

    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme");
      if (t === "light" || t === "dark") setTheme(t);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const isDark = theme === "dark";
  const dotColor = isDark
    ? "rgba(165, 155, 255, 0.85)"
    : "rgba(99, 102, 241, 0.75)";

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* DotField background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <DotField
            dotRadius={2}
            dotSpacing={16}
            cursorRadius={500}
            cursorForce={0.1}
            bulgeStrength={65}
            dotColor={dotColor}
          />
        </div>

        {/* Radial vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "radial-gradient(ellipse at center, transparent 20%, rgba(14,14,14,0.6) 100%)"
              : "radial-gradient(ellipse at center, transparent 20%, rgba(255,255,255,0.5) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "80px 24px 60px",
            maxWidth: 760,
          }}
        >
          {/* Badge */}
          <div
            className="animate-fade-up stagger-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 99,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text-secondary)",
              letterSpacing: "0.04em",
              marginBottom: 40,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10B981",
                display: "inline-block",
              }}
            />
            AI-Powered Career Intelligence
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up stagger-2"
            style={{
              fontSize: "clamp(44px, 8vw, 80px)",
              fontWeight: 400,
              letterSpacing: "-0.035em",
              lineHeight: 1.0,
              color: "var(--text)",
              marginBottom: 28,
              fontFamily: "'Newsreader', Georgia, serif",
            }}
          >
            Where talent
            <br />
            meets <span style={{ color: "#10B981" }}>opportunity.</span>
          </h1>

          {/* Subline */}
          <p
            className="animate-fade-up stagger-3"
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              marginBottom: 48,
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Bridging students and employers through personality-driven career
            matching. Discover your strengths, find the right fit.
          </p>

          {/* CTA */}
          <div
            className="animate-fade-up stagger-4"
            style={{ display: "flex", justifyContent: "center", gap: 14 }}
          >
            <Link
              href="/login"
              className="btn-primary"
              style={{ padding: "14px 36px", fontSize: 15 }}
            >
              Get Started
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8M8 4l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="animate-fade-up stagger-5"
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            color: "var(--text-tertiary)",
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <span>Scroll</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 2v8M3 7l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ── For Students — How It Works ── */}
      <section
        style={{ padding: "100px 24px", maxWidth: 960, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#818CF8",
              fontWeight: 500,
              marginBottom: 12,
            }}
          >
            For Students
          </p>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 400,
              letterSpacing: "-0.025em",
              color: "var(--text)",
            }}
          >
            Discover your ideal career
          </h2>
          <p
            style={{
              marginTop: 14,
              fontSize: 16,
              color: "var(--text-secondary)",
              maxWidth: 500,
              margin: "14px auto 0",
            }}
          >
            Three simple steps to understand your strengths and find the career
            path that fits you best.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {STUDENT_STEPS.map((step) => (
            <div
              key={step.num}
              className="card"
              style={{ padding: 28, position: "relative", overflow: "hidden" }}
            >
              {/* Step number background */}
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: 16,
                  fontSize: 72,
                  fontWeight: 700,
                  color: "var(--border)",
                  lineHeight: 1,
                  fontFamily: "'Newsreader', Georgia, serif",
                  userSelect: "none",
                }}
              >
                {step.num}
              </div>
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
                  color: "#818CF8",
                  marginBottom: 20,
                }}
              >
                {step.icon}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--text)",
                  marginBottom: 10,
                  fontFamily: "'Newsreader', Georgia, serif",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── For Employers — How It Works ── */}
      <section
        style={{
          padding: "100px 24px",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#10B981",
                fontWeight: 500,
                marginBottom: 12,
              }}
            >
              For Employers
            </p>
            <h2
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 400,
                letterSpacing: "-0.025em",
                color: "var(--text)",
              }}
            >
              Find the right talent, faster
            </h2>
            <p
              style={{
                marginTop: 14,
                fontSize: 16,
                color: "var(--text-secondary)",
                maxWidth: 520,
                margin: "14px auto 0",
              }}
            >
              Post your job description and let AI match you with the most
              compatible candidates from our talent pool.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {EMPLOYER_STEPS.map((step) => (
              <div
                key={step.num}
                style={{
                  padding: 28,
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: "var(--bg)",
                }}
              >
                {/* Step number background */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: 16,
                    fontSize: 72,
                    fontWeight: 700,
                    color: "var(--border)",
                    lineHeight: 1,
                    fontFamily: "'Newsreader', Georgia, serif",
                    userSelect: "none",
                  }}
                >
                  {step.num}
                </div>
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
                    color: "#10B981",
                    marginBottom: 20,
                  }}
                >
                  {step.icon}
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "var(--text)",
                    marginBottom: 10,
                    fontFamily: "'Newsreader', Georgia, serif",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Career Clusters ── */}
      <section
        style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#10B981",
              fontWeight: 500,
              marginBottom: 12,
            }}
          >
            Career Landscape
          </p>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 400,
              letterSpacing: "-0.025em",
              color: "var(--text)",
            }}
          >
            {careerFields.length} fields across {CLUSTERS.length} clusters
          </h2>
          <p
            style={{
              marginTop: 14,
              fontSize: 16,
              color: "var(--text-secondary)",
              maxWidth: 460,
              margin: "14px auto 0",
            }}
          >
            Cross-cluster connections mapped — from frontend to robotics, every
            major CS career path clustered for exploration.
          </p>
        </div>

        {/* Cluster grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {CLUSTERS.map((cluster) => {
            const fields = careerFields.filter((f) => f.cluster === cluster.id);
            return (
              <div
                key={cluster.id}
                className="card"
                style={{ padding: 20, borderTop: `3px solid ${cluster.color}` }}
              >
                <div style={{ marginBottom: 12 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: cluster.color,
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {cluster.label}
                  </span>
                  <span
                    style={{
                      float: "right",
                      fontSize: 11,
                      color: "var(--text-tertiary)",
                      background: "var(--surface)",
                      padding: "1px 6px",
                      borderRadius: 99,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {cluster.count}
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  {fields.slice(0, 3).map((f) => (
                    <span
                      key={f.id}
                      style={{ fontSize: 12, color: "var(--text-secondary)" }}
                    >
                      {f.label}
                    </span>
                  ))}
                  {fields.length > 3 && (
                    <span
                      style={{ fontSize: 11, color: "var(--text-tertiary)" }}
                    >
                      +{fields.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Map CTA */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link
            href="/map"
            className="btn-secondary"
            style={{ padding: "12px 28px" }}
          >
            View full career map
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6h7M7 3.5l2.5 2.5L7 8.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
