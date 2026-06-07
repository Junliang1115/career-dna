"use client";
import { useState, useMemo } from "react";
import {
  fieldNodes,
  fieldEdges,
  fieldByType,
  FieldNode,
} from "@/lib/fieldGraph";
import { jobs, Job } from "@/lib/jobData";
import { useApp } from "@/lib/context";
import { DemandLevel } from "@/lib/jobData";

const ACCENT = "#2D6A4F";

function nodeMatchesJob(node: FieldNode, job: Job): boolean {
  if (node.kind === "field") {
    const nodeLabel = node.label.trim().toLowerCase();
    const jobField = job.field.trim().toLowerCase();
    if (jobField === nodeLabel) return true;
    if (jobField.includes(nodeLabel) || nodeLabel.includes(jobField))
      return true;
  }

  const nodeTokens = node.label
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .map((t) => t.replace(/[+#.]/g, ""))
    .filter((t) => t.length >= 2);

  if (nodeTokens.length === 0) return false;

  return job.skillsRequired.some((skill) => {
    const skillTokens = skill
      .toLowerCase()
      .split(/[^a-z0-9+#]+/)
      .map((t) => t.replace(/[+#.]/g, ""))
      .filter((t) => t.length >= 2);

    return nodeTokens.some((nt) =>
      skillTokens.some((st) => st.includes(nt) || nt.includes(st)),
    );
  });
}

function demandColor(d: DemandLevel): string {
  switch (d) {
    case "Rare":
      return ACCENT;
    case "Competitive":
      return "#787774";
    case "Oversaturated":
      return "#C1453A";
    default:
      return "#A8A49E";
  }
}

interface Props {
  careerType: string;
}

export default function FieldVectorMap({ careerType }: Props) {
  const { profile } = useApp();
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const highlightNodes = useMemo(() => {
    const set = new Set<string>([
      ...(active ? [active] : []),
      ...(hovered ? [hovered] : []),
    ]);
    if (hovered || active) {
      fieldEdges.forEach((edge) => {
        if (edge.source === hovered || edge.source === active)
          set.add(edge.target);
        if (edge.target === hovered || edge.target === active)
          set.add(edge.source);
      });
    }
    return set;
  }, [hovered, active]);

  const typeNodes = useMemo(
    () => new Set(fieldByType[careerType] || []),
    [careerType],
  );

  const handleNodeClick = (id: string) => {
    setActive((prev) => (prev === id ? null : id));
  };

  const activeNode: FieldNode | null = active
    ? fieldNodes.find((n) => n.id === active) || null
    : null;

  const activeJobs: Job[] = useMemo(() => {
    if (!activeNode) return [];
    return jobs.filter((j) => nodeMatchesJob(activeNode, j)).slice(0, 3);
  }, [activeNode]);

  const matchPct = (job: Job): number => {
    let score = 0;
    if (careerType && job.typeFit.includes(careerType)) score += 40;
    const userSkillsLower = [...job.skillsUser, ...profile.courses].map((s) =>
      s.toLowerCase(),
    );
    const overlap = job.skillsRequired.filter((skill) =>
      userSkillsLower.some(
        (us) =>
          us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us),
      ),
    ).length;
    score += Math.round((overlap / job.skillsRequired.length) * 60);
    return Math.min(100, score);
  };

  return (
    <div>
      {/* Minimalist graph */}
      <svg
        viewBox="0 0 900 460"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* Edges */}
        {fieldEdges.map((edge, i) => {
          const src = fieldNodes.find((n) => n.id === edge.source);
          const tgt = fieldNodes.find((n) => n.id === edge.target);
          if (!src || !tgt) return null;
          const isHighlighted =
            highlightNodes.has(edge.source) && highlightNodes.has(edge.target);
          return (
            <line
              key={i}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke={isHighlighted ? "#111111" : "#EAEAEA"}
              strokeWidth={isHighlighted ? 1 : 0.5}
              strokeOpacity={isHighlighted ? 0.4 : 0.3}
              style={{ transition: "all 0.15s" }}
            />
          );
        })}

        {/* Nodes */}
        {fieldNodes.map((node) => {
          const isHighlighted = highlightNodes.has(node.id);
          const isTypeMatch = typeNodes.has(node.id);
          const isActive = active === node.id;
          const isMuted = !isTypeMatch && !isHighlighted && !isActive;
          const r = isHighlighted || isActive ? 5 : isTypeMatch ? 4.5 : 4;

          return (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {isTypeMatch && !isActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 4}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={0.75}
                  strokeOpacity={0.3}
                  style={{ transition: "all 0.15s" }}
                />
              )}
              {node.kind === "skill" ? (
                <rect
                  x={node.x - r}
                  y={node.y - r}
                  width={r * 2}
                  height={r * 2}
                  rx={1}
                  fill={
                    isHighlighted || isActive
                      ? node.color
                      : isMuted
                        ? "#EAEAEA"
                        : node.color
                  }
                  fillOpacity={
                    isMuted ? 0.5 : isHighlighted || isActive ? 1 : 0.35
                  }
                  transform={`rotate(45 ${node.x} ${node.y})`}
                  style={{ transition: "all 0.15s" }}
                />
              ) : (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={
                    isHighlighted || isActive
                      ? node.color
                      : isMuted
                        ? "#EAEAEA"
                        : node.color
                  }
                  fillOpacity={
                    isMuted ? 0.5 : isHighlighted || isActive ? 1 : 0.35
                  }
                  style={{ transition: "all 0.15s" }}
                />
              )}
              {/* Label to the right */}
              <text
                x={node.x + r + 5}
                y={node.y + 3.5}
                style={{
                  fontSize: 10,
                  fontWeight: isTypeMatch
                    ? 500
                    : isHighlighted || isActive
                      ? 500
                      : 400,
                  fill: isMuted
                    ? "var(--text-tertiary)"
                    : isHighlighted || isActive
                      ? "var(--text)"
                      : "var(--text-secondary)",
                  fillOpacity: isMuted ? 0.6 : 1,
                  transition: "all 0.15s",
                }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      <p
        style={{
          fontSize: 11,
          color: "var(--text-tertiary)",
          textAlign: "center",
          marginTop: 6,
          marginBottom: 16,
        }}
      >
        Click field or skill nodes to explore roles
      </p>

      {/* Inline job cards when node is active */}
      {activeNode && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: activeNode.color,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {activeNode.label}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {activeNode.kind}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 8,
            }}
          >
            {activeJobs.map((job) => {
              const pct = matchPct(job);
              return (
                <div
                  key={job.id}
                  className="card"
                  style={{
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <h4 style={{ fontSize: 13, fontWeight: 600 }}>
                      {job.title}
                    </h4>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: `${demandColor(job.demand)}12`,
                        color: demandColor(job.demand),
                        flexShrink: 0,
                      }}
                    >
                      {job.demand}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      marginBottom: 8,
                    }}
                  >
                    {job.company}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--text)",
                      }}
                    >
                      RM {job.salaryMin.toLocaleString()}–
                      {job.salaryMax.toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: pct >= 70 ? ACCENT : "var(--text-secondary)",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
