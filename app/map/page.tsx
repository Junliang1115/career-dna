"use client";
import { useState, useMemo } from "react";
import { fieldNodes, fieldEdges, FieldNode } from "@/lib/fieldGraph";
import { jobs, Job, DemandLevel } from "@/lib/jobData";
import { careerFields, positionsByField } from "@/lib/careerTaxonomy";
import { useApp } from "@/lib/context";
import Link from "next/link";

const ACCENT = "#2D6A4F";

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

type DrillLevel = 0 | 1 | 2;

export default function MapPage() {
  const { profile } = useApp();
  const [drillLevel, setDrillLevel] = useState<DrillLevel>(0);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [visiblePositions, setVisiblePositions] = useState<Set<string>>(
    new Set(),
  );
  // Level 0 zoom state — for interactive hover/zoom drill-down
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const careerType = profile.careerType;
  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9+#]+/g, " ")
      .trim();

  const selectedFieldNode: FieldNode | null = useMemo(() => {
    if (!selectedField) return null;
    return fieldNodes.find((n) => n.id === selectedField) || null;
  }, [selectedField]);

  // (zoom overlay removed)

  // Precompute position dots for each field (for Level 0 distribution display)
  // Returns map of fieldId → array of {x, y, color} for position dots
  const fieldPositionDots = useMemo(() => {
    const map = new Map<
      string,
      Array<{ x: number; y: number; color: string }>
    >();
    fieldNodes.forEach((field) => {
      const positions = positionsByField[field.id] || [];
      const dots: Array<{ x: number; y: number; color: string }> = [];
      const count = positions.length;
      positions.forEach((pos, i) => {
        // Spread dots in a small circle around the field node
        const angleOffset =
          (i / Math.max(count, 1)) * 2 * Math.PI - Math.PI / 2;
        const dist = 18 + (i % 3) * 5; // varying distance 18-28px
        dots.push({
          x: field.x + dist * Math.cos(angleOffset),
          y: field.y + dist * Math.sin(angleOffset),
          color: field.color,
        });
      });
      map.set(field.id, dots);
    });
    return map;
  }, []);

  // ─── Skill nodes — top bridge skills that span multiple fields ───
  // Skills appear in the outer ring (r=370), connected to their relevant fields
  const { skillNodes, skillFieldMap } = useMemo(() => {
    // Extract all skills and count how many fields they appear in
    const skillFieldCount = new Map<string, Set<string>>();
    Object.entries(positionsByField).forEach(([fieldId, positions]) => {
      const fieldNode = fieldNodes.find((n) => n.id === fieldId);
      positions.forEach((pos) => {
        pos.keywords.forEach((kw) => {
          const skill = kw.trim();
          if (!skill) return;
          if (!skillFieldCount.has(skill)) skillFieldCount.set(skill, new Set());
          skillFieldCount.get(skill)!.add(fieldId);
        });
      });
    });
    // Keep skills that appear in 3+ fields (bridge skills)
    const SKILL_RING_R = 370;
    const CX = 500, CY = 260;
    const bridgeSkills = [...skillFieldCount.entries()]
      .filter(([skill, fields]) => fields.size >= 3)
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 28); // top 28 skills

    const nodes = bridgeSkills.map(([skill, fields], i) => {
      const angle = -Math.PI / 2 + (i / bridgeSkills.length) * 2 * Math.PI;
      return {
        skill,
        x: CX + SKILL_RING_R * Math.cos(angle),
        y: CY + SKILL_RING_R * Math.sin(angle),
        fieldCount: fields.size,
        fieldIds: [...fields],
      };
    });
    return { skillNodes: nodes, skillFieldMap: skillFieldCount };
  }, []);

  // Skills connected to currently hovered field
  const skillsForHoveredField = useMemo(() => {
    if (!hoveredField) return new Set<string>();
    return new Set(skillNodes.filter((n) => n.fieldIds.includes(hoveredField!)).map((n) => n.skill));
  }, [hoveredField, skillNodes]);

  // Fields connected to currently hovered skill
  const fieldsForHoveredSkill = useMemo(() => {
    if (!hoveredSkill) return new Set<string>();
    const node = skillNodes.find((n) => n.skill === hoveredSkill);
    return node ? new Set(node.fieldIds) : new Set<string>();
  }, [hoveredSkill, skillNodes]);

  // Connected field IDs for a given field (via edges)
  const connectedFieldIds = useMemo(() => {
    const connected = new Set<string>();
    if (!hoveredField) return connected;
    fieldEdges.forEach((edge) => {
      if (edge.source === hoveredField) connected.add(edge.target);
      if (edge.target === hoveredField) connected.add(edge.source);
    });
    return connected;
  }, [hoveredField]);

  const fieldJobs = useMemo(() => {
    if (!selectedFieldNode) return [];
    return jobs.filter((j) => j.field === selectedFieldNode.label);
  }, [selectedFieldNode]);

  const fieldNodeByLabel = useMemo(() => {
    return new Map(fieldNodes.map((node) => [node.label, node]));
  }, []);

  const getFieldPositions = (fieldId: string) => {
    return positionsByField[fieldId]?.map((p) => p.title) || [];
  };

  const typeFieldIds = useMemo(() => {
    if (!careerType) return new Set<string>();
    const { fieldByType } = require("@/lib/fieldGraph");
    return new Set<string>(fieldByType[careerType] || []);
  }, [careerType]);

  const fieldPositions = useMemo(() => {
    if (!selectedField) return [];
    return getFieldPositions(selectedField);
  }, [selectedField]);

  const fieldSkills = useMemo(() => {
    if (!selectedFieldNode) return [];
    const counts = new Map<string, number>();
    fieldJobs.forEach((job) => {
      job.skillsRequired.forEach((skill) => {
        const key = skill.trim();
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .filter(([, count]) => count >= 2 || counts.size <= 7)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([skill]) => skill);
  }, [fieldJobs, selectedFieldNode]);

  const positionSkillMap = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!selectedField) return map;
    const positions = positionsByField[selectedField] || [];
    positions.forEach(({ title, keywords }) => {
      map.set(title, keywords);
    });
    return map;
  }, [selectedField]);

  const skillPositionMap = useMemo(() => {
    const map = new Map<string, string[]>();
    fieldSkills.forEach((skill) => {
      const matchedPositions = fieldPositions.filter((title) =>
        (positionSkillMap.get(title) || []).some(
          (positionSkill) =>
            positionSkill.toLowerCase() === skill.toLowerCase() ||
            positionSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(positionSkill.toLowerCase()),
        ),
      );
      map.set(skill, matchedPositions);
    });
    return map;
  }, [fieldPositions, fieldSkills, positionSkillMap]);

  const relatedJobs = useMemo(() => {
    if (!selectedFieldNode) return [];

    const currentFieldSkills = new Set(
      fieldJobs.flatMap((job) =>
        job.skillsRequired.map((skill) => normalizeText(skill)),
      ),
    );

    const scored = jobs
      .filter((job) => job.field !== selectedFieldNode.label)
      .map((job) => {
        const sharedSkills = job.skillsRequired.filter((skill) => {
          const normalizedSkill = normalizeText(skill);
          return [...currentFieldSkills].some(
            (currentSkill) =>
              currentSkill === normalizedSkill ||
              currentSkill.includes(normalizedSkill) ||
              normalizedSkill.includes(currentSkill),
          );
        });

        const jobFieldNode = fieldNodeByLabel.get(job.field);
        const fieldConnected = jobFieldNode
          ? fieldEdges.some(
              (edge) =>
                (edge.source === selectedFieldNode.id &&
                  edge.target === jobFieldNode.id) ||
                (edge.target === selectedFieldNode.id &&
                  edge.source === jobFieldNode.id),
            )
          : false;

        const score = sharedSkills.length * 3 + (fieldConnected ? 2 : 0);
        return score > 0 ? { job, score, sharedSkills, fieldConnected } : null;
      })
      .filter(
        (
          value,
        ): value is {
          job: Job;
          score: number;
          sharedSkills: string[];
          fieldConnected: boolean;
        } => value !== null,
      )
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.job.field.localeCompare(b.job.field) ||
          a.job.title.localeCompare(b.job.title),
      )
      .slice(0, 7);

    return scored;
  }, [fieldEdges, fieldJobs, fieldNodeByLabel, selectedFieldNode]);

  const positionJobs = useMemo(() => {
    if (!selectedPosition) return [];
    return jobs.filter((j) => j.title === selectedPosition);
  }, [selectedPosition]);

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

  const positionMatchesCareer = (title: string): boolean => {
    if (!careerType) return false;
    const titleJobs = jobs.filter((j) => j.title === title);
    return titleJobs.some((j) => j.typeFit.includes(careerType));
  };

  const getRadialPos = (
    index: number,
    total: number,
    cx: number,
    cy: number,
    r: number,
    offset = 0,
  ) => {
    const angle = -Math.PI / 2 + offset + (index / total) * 2 * Math.PI;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Unified entry to Level 1. If `fieldId` provided, set field-specific state;
  // otherwise just step to Level 1 (used when returning from Level 2).
  const drillToLevel1 = (fieldId?: string) => {
    if (fieldId) {
      const positions = getFieldPositions(fieldId);
      setSelectedField(fieldId);
      setSelectedSkill(null);
      setVisiblePositions(new Set(positions));
    }
    // Clear any selected position and ensure level is 1
    setSelectedPosition(null);
    setDrillLevel(1);
  };

  const drillToLevel2 = (title: string) => {
    setSelectedPosition(title);
    setDrillLevel(2);
  };

  const backToLevel0 = () => {
    setDrillLevel(0);
    setSelectedField(null);
    setSelectedPosition(null);
    setSelectedSkill(null);
    setVisiblePositions(new Set());
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)",
        background: "var(--bg)",
        color: "var(--text)",
        overflow: "hidden",
      }}
    >
      {/* ══════════════════════════════════════════
          LEVEL 0 — Interactive Field Map
          - All 37 field nodes + position distribution dots
          - Hover: highlight connections
          - Click: zoom to field → show position labels
      ══════════════════════════════════════════ */}
      {drillLevel === 0 && (
        <div style={{ padding: "24px 24px 0" }}>
          {/* Zoomed-in field panel (overlays the map) */}
          {/* Zoom overlay removed — entering Level 1 opens the field detail instead */}

          {/* SVG Map */}
          <div
            style={{
              position: "relative",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100vh - 160px)",
            }}
          >
            <svg
              viewBox="0 0 1000 520"
              style={{
                width: "100%",
                maxWidth: 1000,
                height: "70vh",
                display: "block",
                margin: "0 auto",
                opacity: 1,
                transition: "opacity 0.2s",
              }}
            >
              {/* Ring guides */}
              <circle
                cx={500}
                cy={260}
                r={135}
                fill="none"
                stroke="var(--border)"
                strokeWidth={0.5}
                strokeOpacity={0.12}
                strokeDasharray="3 5"
              />
              <circle cx={500} cy={260} r={235} fill="none" stroke="var(--border)" strokeWidth={0.5} strokeOpacity={0.12} strokeDasharray="3 5" />
              {/* Skill ring guide */}
              <circle cx={500} cy={260} r={370} fill="none" stroke="var(--border)" strokeWidth={0.5} strokeOpacity={0.08} strokeDasharray="2 6" />
              <circle cx={500} cy={260} r={6} fill="var(--border)" fillOpacity={0.35} />
              <text
                x={500}
                y={256}
                textAnchor="middle"
                fontSize={7}
                fill="var(--text-tertiary)"
                fillOpacity={0.45}
                fontWeight={500}
              >
                CAREER DNA
              </text>
              <text x={500} y={265} textAnchor="middle" fontSize={6} fill="var(--text-tertiary)" fillOpacity={0.35}>
                37 FIELDS · {skillNodes.length} SKILLS
              </text>

              {/* Edges — highlight on hover */}
              {fieldEdges.map((edge, i) => {
                const src = fieldNodes.find((n) => n.id === edge.source);
                const tgt = fieldNodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;
                const isHighlighted =
                  hoveredField &&
                  (edge.source === hoveredField ||
                    edge.target === hoveredField);
                const isDimmed = hoveredField && !isHighlighted;
                return (
                  <line
                    key={i}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isHighlighted ? ACCENT : "var(--border)"}
                    strokeWidth={isHighlighted ? 1.5 : 0.5}
                    strokeOpacity={isDimmed ? 0.08 : isHighlighted ? 0.7 : 0.2}
                    style={{
                      transition:
                        "stroke 0.15s, stroke-opacity 0.15s, stroke-width 0.15s",
                    }}
                  />
                );
              })}


              {/* ── Skill → Field curved edges ── */}
              {skillNodes.map((node) => {
                const isHoveredSkill = hoveredSkill === node.skill;
                const isFieldHovered = !!hoveredField;
                const isActive = isHoveredSkill || (isFieldHovered && node.fieldIds.includes(hoveredField!));
                const isDimmed = (!!hoveredSkill && !isHoveredSkill) || (isFieldHovered && !node.fieldIds.includes(hoveredField!));
                return node.fieldIds.map((fieldId) => {
                  const field = fieldNodes.find((n) => n.id === fieldId);
                  if (!field) return null;
                  const midX = (node.x + field.x) / 2;
                  const midY = (node.y + field.y) / 2 - 25;
                  const d = `M ${node.x} ${node.y} Q ${midX} ${midY} ${field.x} ${field.y}`;
                  return (
                    <path
                      key={`${node.skill}-${fieldId}`}
                      d={d}
                      stroke={isActive ? ACCENT : "var(--border)"}
                      strokeWidth={isActive ? 1.2 : 0.5}
                      strokeOpacity={isDimmed ? 0.05 : isActive ? 0.55 : 0.1}
                      fill="none"
                      style={{ transition: "stroke 0.15s, stroke-opacity 0.15s", pointerEvents: "none" }}
                    />
                  );
                });
              })}

              {/* ── Skill diamond nodes ── */}
              {skillNodes.map((node) => {
                const isHoveredSkill = hoveredSkill === node.skill;
                const isConnected = skillsForHoveredField.has(node.skill);
                const isDimmed = (!!hoveredSkill && !isHoveredSkill) || (!!hoveredField && !isConnected);
                const primaryField = fieldNodes.find((n) => n.id === node.fieldIds[0]);
                const skillColor = primaryField?.color || ACCENT;
                const r = 6;
                const pts = `${node.x},${node.y - r} ${node.x + r},${node.y} ${node.x},${node.y + r} ${node.x - r},${node.y}`;
                return (
                  <g
                    key={node.skill}
                    onMouseEnter={() => setHoveredSkill(node.skill)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    onClick={() => setHoveredSkill(isHoveredSkill ? null : node.skill)}
                    style={{ cursor: "pointer" }}
                  >
                    {isHoveredSkill && (
                      <circle cx={node.x} cy={node.y} r={r + 7} fill="none" stroke={skillColor} strokeWidth={1.5} strokeOpacity={0.45} style={{ transition: "all 0.15s" }} />
                    )}
                    <polygon
                      points={pts}
                      fill={skillColor}
                      fillOpacity={isDimmed ? 0.1 : isHoveredSkill ? 0.9 : 0.5}
                      stroke={isHoveredSkill ? skillColor : "var(--border)"}
                      strokeWidth={isHoveredSkill ? 1.5 : 0.75}
                      strokeOpacity={isDimmed ? 0.2 : 0.7}
                      style={{ transition: "all 0.15s" }}
                    />
                    {isHoveredSkill && (
                      <text x={node.x + r + 5} y={node.y + 4} fontSize={10} fontWeight={600} fill="var(--text)" fillOpacity={0.9}>
                        {node.skill}
                      </text>
                    )}
                  </g>
                );
              })}


              {/* Position distribution dots (small background dots around each field) */}
              {Array.from(fieldPositionDots.entries()).map(
                ([fieldId, dots]) => {
                  const field = fieldNodes.find((n) => n.id === fieldId);
                  if (!field) return null;
                  const isHovered = hoveredField === fieldId;
                  return dots.map((dot, i) => (
                    <circle
                      key={`${fieldId}-dot-${i}`}
                      cx={dot.x}
                      cy={dot.y}
                      r={2.5}
                      fill={dot.color}
                      fillOpacity={isHovered ? 0.6 : 0.2}
                      style={{ transition: "fill-opacity 0.2s" }}
                    />
                  ));
                },
              )}

              {/* Field nodes — all 37 always visible */}
              {fieldNodes.map((node) => {
                const isTypeMatch = typeFieldIds.has(node.id);
                const isHovered = hoveredField === node.id;
                const isConnected = connectedFieldIds.has(node.id);
                const isDimmedByField = hoveredField && !isHovered && !isConnected;
                const isDimmedBySkill = !!hoveredSkill && !fieldsForHoveredSkill.has(node.id);
                const isDimmed = isDimmedByField || isDimmedBySkill;

                return (
                  <g
                    key={node.id}
                    onClick={() => {
                      setHoveredField(null);
                      drillToLevel1(node.id);
                    }}
                    onMouseEnter={() => setHoveredField(node.id)}
                    onMouseLeave={() => setHoveredField(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Type match or hover: glow ring */}
                    {(isTypeMatch || isHovered) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius + (isHovered ? 9 : 7)}
                        fill="none"
                        stroke={isHovered ? node.color : ACCENT}
                        strokeWidth={isHovered ? 1.5 : 1}
                        strokeOpacity={isHovered ? 0.5 : 0.35}
                        style={{ transition: "all 0.15s" }}
                      />
                    )}
                    {/* Connected field: subtle ring */}
                    {isConnected && !isTypeMatch && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.radius + 5}
                        fill="none"
                        stroke={ACCENT}
                        strokeWidth={0.75}
                        strokeOpacity={0.2}
                      />
                    )}
                    {/* Node dot */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isHovered ? node.radius + 1 : node.radius}
                      fill={node.color}
                      fillOpacity={isDimmed ? 0.15 : isHovered ? 0.95 : 0.7}
                      stroke={
                        isTypeMatch
                          ? ACCENT
                          : isHovered
                            ? node.color
                            : "var(--border)"
                      }
                      strokeWidth={isHovered ? 2 : isTypeMatch ? 1.5 : 0.75}
                      strokeOpacity={isDimmed ? 0.15 : 0.7}
                      style={{ transition: "all 0.15s" }}
                    />
                    {/* Label */}
                    <text
                      x={node.x + node.radius + 6}
                      y={node.y + 4}
                      fontSize={isHovered ? 12 : 11}
                      fontWeight={isTypeMatch || isHovered ? 600 : 400}
                      fill={
                        isHovered
                          ? "var(--text)"
                          : isTypeMatch
                            ? "var(--text)"
                            : "var(--text-secondary)"
                      }
                      fillOpacity={isDimmed ? 0.3 : 1}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredField &&
              (() => {
                const field = fieldNodes.find((n) => n.id === hoveredField);
                const positions = positionsByField[hoveredField] || [];
                if (!field) return null;
                return (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--text)",
                      color: "white",
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      animation: "fadeIn 0.12s ease",
                    }}
                  >
                    <span style={{ color: field.color, marginRight: 6 }}>
                      ●
                    </span>
                    {field.label}
                    <span style={{ opacity: 0.6, marginLeft: 8 }}>
                      {positions.length} positions
                    </span>
                  </div>
                );
              })()}

            {/* ── Skill hover info card ── */}
            {hoveredSkill && (() => {
              const node = skillNodes.find((n) => n.skill === hoveredSkill);
              if (!node) return null;
              const connectedFields = node.fieldIds.map((id) => fieldNodes.find((n) => n.id === id)).filter(Boolean);
              const allPositions = node.fieldIds.flatMap((fid) => (positionsByField[fid] || []).map((p) => ({ ...p, fieldId: fid })));
              return (
                <div
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "14px 18px",
                    width: 340,
                    maxWidth: "90vw",
                    zIndex: 20,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    animation: "fadeIn 0.15s ease",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, background: ACCENT, borderRadius: 2, transform: "rotate(45deg)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{node.skill}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600 }}>{node.fieldCount} FIELDS</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: allPositions.length > 0 ? 8 : 0 }}>
                    {connectedFields.map((field) => field && (
                      <span key={field.id} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, background: `${field.color}18`, color: field.color, fontWeight: 600 }}>
                        {field.label}
                      </span>
                    ))}
                  </div>
                  {allPositions.length > 0 && (
                    <div>
                      <p style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sample positions</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {[...new Set(allPositions.map((p) => p.title))].slice(0, 6).map((title) => (
                          <span key={title} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "var(--bg)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-tertiary)",
              marginTop: 10,
              marginBottom: 16,
            }}
          >
            {careerType
              ? "Hover to explore connections · Click to see specialized positions"
              : "Click any field to explore career paths"}
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════
          LEVEL 1 — Field Detail
      ══════════════════════════════════════════ */}
      {drillLevel === 1 && selectedFieldNode && (
        <div style={{ padding: "16px 24px 0" }}>
          {/* Field header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: selectedFieldNode.color,
                }}
              />
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: selectedFieldNode.color,
                  margin: 0,
                  fontFamily: "'Newsreader', serif",
                }}
              >
                {selectedFieldNode.label}
              </h2>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                marginTop: 4,
              }}
            >
              {fieldPositions.length} specialized positions and{" "}
              {fieldSkills.length} skill nodes — click a node to explore
            </p>
          </div>

          {/* Positions and skills graph */}
          <svg
            viewBox="0 0 1000 600"
            style={{
              width: "100%",
              maxWidth: 960,
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          >
            {(() => {
              const centerX = 500;
              const centerY = 260;
              const positionRadius = 135;
              const skillRadius = 185;
              const relatedRadius = 255;
              const dotR = 6;
              const skillR = 6;
              const positionCount = Math.max(fieldPositions.length, 1);
              const skillCount = Math.max(fieldSkills.length, 1);
              const relatedCount = Math.max(relatedJobs.length, 1);
              const positionAngleOffset = -Math.PI / 2;
              const skillAngleOffset = -Math.PI / 2 + Math.PI / skillCount;
              const relatedAngleOffset = -Math.PI / 2 + Math.PI / relatedCount;
              const positionNodes = fieldPositions.map((title, i) => ({
                title,
                ...getRadialPos(
                  i,
                  positionCount,
                  centerX,
                  centerY,
                  positionRadius,
                  positionAngleOffset,
                ),
              }));
              const skillNodes = fieldSkills.map((skill, i) => ({
                skill,
                ...getRadialPos(
                  i,
                  skillCount,
                  centerX,
                  centerY,
                  skillRadius,
                  skillAngleOffset,
                ),
              }));
              const relatedJobNodes = relatedJobs.map((entry, i) => ({
                ...entry,
                ...getRadialPos(
                  i,
                  relatedCount,
                  centerX,
                  centerY,
                  relatedRadius,
                  relatedAngleOffset,
                ),
              }));
              const activePositionSet = selectedSkill
                ? new Set(skillPositionMap.get(selectedSkill) || [])
                : null;

              return (
                <>
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={95}
                    fill="none"
                    stroke={selectedFieldNode.color}
                    strokeWidth={0.75}
                    strokeOpacity={0.12}
                  />
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={skillRadius + 20}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={0.75}
                    strokeOpacity={0.18}
                  />
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={relatedRadius + 24}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={0.75}
                    strokeOpacity={0.1}
                    strokeDasharray="4 4"
                  />

                  {/* Connector lines */}
                  {positionNodes.map((positionNode) => {
                    const positionSkills =
                      positionSkillMap.get(positionNode.title) || [];
                    return positionSkills.map((skill) => {
                      const skillNode = skillNodes.find(
                        (node) => node.skill === skill,
                      );
                      if (!skillNode) return null;
                      const isHighlighted =
                        !selectedSkill ||
                        selectedSkill === skill ||
                        activePositionSet?.has(positionNode.title);
                      return (
                        <line
                          key={`${positionNode.title}-${skill}`}
                          x1={positionNode.x + dotR}
                          y1={positionNode.y}
                          x2={skillNode.x - skillR}
                          y2={skillNode.y}
                          stroke={
                            isHighlighted ? "var(--text)" : "var(--border)"
                          }
                          strokeWidth={isHighlighted ? 1 : 0.5}
                          strokeOpacity={isHighlighted ? 0.3 : 0.12}
                        />
                      );
                    });
                  })}

                  {/* Position-to-related job lines */}
                  {positionNodes.map((positionNode) => {
                    const positionSkills =
                      positionSkillMap.get(positionNode.title) || [];
                    return relatedJobNodes.flatMap((relatedNode) => {
                      const sharedSkills =
                        relatedNode.job.skillsRequired.filter((skill) =>
                          positionSkills.some((positionSkill) => {
                            const normalizedPositionSkill =
                              normalizeText(positionSkill);
                            const normalizedSkill = normalizeText(skill);
                            return (
                              normalizedPositionSkill === normalizedSkill ||
                              normalizedPositionSkill.includes(
                                normalizedSkill,
                              ) ||
                              normalizedSkill.includes(normalizedPositionSkill)
                            );
                          }),
                        );

                      if (sharedSkills.length === 0) return [];

                      const selectedSkillPositions = selectedSkill
                        ? new Set(skillPositionMap.get(selectedSkill) || [])
                        : null;
                      const isHighlighted =
                        !selectedSkill ||
                        selectedSkillPositions?.has(positionNode.title) ||
                        positionMatchesCareer(positionNode.title) ||
                        positionMatchesCareer(relatedNode.job.title);

                      return (
                        <line
                          key={`${positionNode.title}-${relatedNode.job.id}`}
                          x1={positionNode.x + dotR}
                          y1={positionNode.y}
                          x2={relatedNode.x - dotR}
                          y2={relatedNode.y}
                          stroke={
                            isHighlighted ? "var(--text)" : "var(--border)"
                          }
                          strokeWidth={isHighlighted ? 0.8 : 0.4}
                          strokeOpacity={isHighlighted ? 0.25 : 0.06}
                        />
                      );
                    });
                  })}

                  {/* Position nodes */}
                  {positionNodes.map((node) => {
                    const isMatch = positionMatchesCareer(node.title);
                    const isVisible = visiblePositions.has(node.title);
                    const isActive = selectedPosition === node.title;
                    const isDimmed = selectedSkill
                      ? !(skillPositionMap.get(selectedSkill) || []).includes(
                          node.title,
                        )
                      : false;
                    return (
                      <g
                        key={node.title}
                        onClick={() => drillToLevel2(node.title)}
                        style={{
                          cursor: "pointer",
                          opacity: isVisible ? (isDimmed ? 0.3 : 1) : 0,
                          transition: "opacity 0.2s",
                        }}
                      >
                        {isMatch && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={dotR + 5}
                            fill="none"
                            stroke={ACCENT}
                            strokeWidth={0.75}
                            strokeOpacity={0.3}
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={dotR}
                          fill={
                            isActive
                              ? "var(--text)"
                              : isMatch
                                ? ACCENT
                                : selectedFieldNode.color
                          }
                          fillOpacity={isDimmed ? 0.4 : 0.88}
                          stroke={isMatch ? ACCENT : "var(--border)"}
                          strokeWidth={0.5}
                          strokeOpacity={0.4}
                        />
                        <text
                          x={node.x + dotR + 7}
                          y={node.y + 3.5}
                          style={{
                            fontSize: 11,
                            fontWeight: isMatch ? 500 : 400,
                            fill: isDimmed
                              ? "var(--text-tertiary)"
                              : isMatch
                                ? ACCENT
                                : "var(--text)",
                            fillOpacity: isDimmed ? 0.5 : 1,
                          }}
                        >
                          {node.title.length > 22
                            ? node.title.slice(0, 20) + "…"
                            : node.title}
                        </text>
                      </g>
                    );
                  })}

                  {/* Skill nodes */}
                  {skillNodes.map((node) => {
                    const relatedPositions =
                      skillPositionMap.get(node.skill) || [];
                    const isSelected = selectedSkill === node.skill;
                    const isDimmed = selectedSkill ? !isSelected : false;
                    const isCareerMatch = relatedPositions.some((title) =>
                      positionMatchesCareer(title),
                    );
                    return (
                      <g
                        key={node.skill}
                        onClick={() =>
                          setSelectedSkill((prev) =>
                            prev === node.skill ? null : node.skill,
                          )
                        }
                        style={{
                          cursor: "pointer",
                          opacity: isDimmed ? 0.35 : 1,
                          transition: "opacity 0.15s",
                        }}
                      >
                        {isCareerMatch && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={skillR + 5}
                            fill="none"
                            stroke="var(--text)"
                            strokeWidth={0.75}
                            strokeOpacity={0.2}
                          />
                        )}
                        <rect
                          x={node.x - skillR}
                          y={node.y - skillR}
                          width={skillR * 2}
                          height={skillR * 2}
                          rx={1}
                          fill={
                            isSelected ? "var(--text)" : selectedFieldNode.color
                          }
                          fillOpacity={isDimmed ? 0.35 : 0.65}
                          stroke={isSelected ? "var(--text)" : "var(--border)"}
                          strokeWidth={0.5}
                          transform={`rotate(45 ${node.x} ${node.y})`}
                        />
                        <text
                          x={node.x + skillR + 8}
                          y={node.y + 3.5}
                          style={{
                            fontSize: 11,
                            fontWeight: isSelected ? 600 : 400,
                            fill: isDimmed
                              ? "var(--text-tertiary)"
                              : isSelected
                                ? "var(--text)"
                                : "var(--text-secondary)",
                            fillOpacity: isDimmed ? 0.5 : 1,
                          }}
                        >
                          {node.skill.length > 24
                            ? node.skill.slice(0, 22) + "…"
                            : node.skill}
                        </text>
                      </g>
                    );
                  })}

                  {/* Related job nodes */}
                  {relatedJobNodes.map((node) => {
                    const isSelected = selectedPosition === node.job.title;
                    const isCareerMatch = positionMatchesCareer(node.job.title);
                    const isDimmed = selectedSkill
                      ? !(skillPositionMap.get(selectedSkill) || []).includes(
                          node.job.title,
                        )
                      : false;

                    return (
                      <g
                        key={node.job.id}
                        onClick={() => drillToLevel2(node.job.title)}
                        style={{
                          cursor: "pointer",
                          opacity: isDimmed ? 0.3 : 1,
                          transition: "opacity 0.15s",
                        }}
                      >
                        {isCareerMatch && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={dotR + 6}
                            fill="none"
                            stroke={ACCENT}
                            strokeWidth={0.75}
                            strokeOpacity={0.2}
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={dotR + 1}
                          fill={
                            isSelected
                              ? "var(--text)"
                              : node.fieldConnected
                                ? ACCENT
                                : selectedFieldNode.color
                          }
                          fillOpacity={isDimmed ? 0.3 : 0.55}
                          stroke={isSelected ? "var(--text)" : "var(--border)"}
                          strokeWidth={0.5}
                          strokeOpacity={0.5}
                        />
                        <text
                          x={node.x + dotR + 8}
                          y={node.y + 3.5}
                          style={{
                            fontSize: 11,
                            fontWeight: isSelected ? 600 : 400,
                            fill: isDimmed
                              ? "var(--text-tertiary)"
                              : isSelected
                                ? "var(--text)"
                                : "var(--text-secondary)",
                            fillOpacity: isDimmed ? 0.5 : 1,
                          }}
                        >
                          {node.job.title.length > 24
                            ? node.job.title.slice(0, 22) + "…"
                            : node.job.title}
                        </text>
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>

          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-tertiary)",
              marginTop: 12,
              marginBottom: 16,
            }}
          >
            Click a position node to see open jobs
          </p>

          {selectedSkill && (
            <div
              style={{
                maxWidth: 960,
                margin: "0 auto 16px",
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ color: "var(--text)", fontWeight: 600 }}>
                {selectedSkill}
              </span>{" "}
              connects to {skillPositionMap.get(selectedSkill)?.length || 0}{" "}
              position
              {skillPositionMap.get(selectedSkill)?.length === 1 ? "" : "s"}
              .&nbsp;
              {skillPositionMap.get(selectedSkill)?.length ? (
                <>
                  Related positions:{" "}
                  {skillPositionMap.get(selectedSkill)?.join(", ")}
                </>
              ) : null}
            </div>
          )}

          {!selectedSkill && relatedJobs.length > 0 && (
            <div
              style={{
                maxWidth: 960,
                margin: "0 auto 16px",
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              Related jobs:{" "}
              {relatedJobs.map((entry) => entry.job.title).join(", ")}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          LEVEL 2 — Job Market
      ══════════════════════════════════════════ */}
      {drillLevel === 2 && selectedPosition && selectedFieldNode && (
        <div style={{ padding: "16px 24px 40px" }}>
          {/* Position header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <p
              style={{
                fontSize: 10,
                color: "var(--text-tertiary)",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              {selectedFieldNode.label}
            </p>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: selectedFieldNode.color,
                margin: 0,
                fontFamily: "'Newsreader', serif",
              }}
            >
              {selectedPosition}
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                marginTop: 4,
              }}
            >
              {positionJobs.length} opening
              {positionJobs.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {/* Job cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 12,
              maxWidth: 960,
              margin: "0 auto",
            }}
          >
            {positionJobs.map((job, i) => {
              const pct = matchPct(job);
              return (
                <div
                  key={job.id}
                  className="card"
                  style={{
                    padding: "18px 20px",
                    opacity: 1,
                    transform: "translateY(0)",
                    transition: `opacity 0.3s ease ${i * 40}ms, transform 0.3s ease ${i * 40}ms`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text)",
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {job.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: 3,
                        background: `${demandColor(job.demand)}12`,
                        color: demandColor(job.demand),
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {job.demand}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      margin: "0 0 10px",
                    }}
                  >
                    {job.company}
                  </p>

                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      margin: "0 0 12px",
                      lineHeight: 1.5,
                    }}
                  >
                    {job.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                      marginBottom: 12,
                    }}
                  >
                    {job.skillsRequired.slice(0, 4).map((skill) => {
                      const covered = profile.courses.some(
                        (c) =>
                          c.toLowerCase().includes(skill.toLowerCase()) ||
                          skill.toLowerCase().includes(c.toLowerCase()),
                      );
                      return (
                        <span
                          key={skill}
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            padding: "2px 7px",
                            borderRadius: 3,
                            background: covered
                              ? "rgba(45,106,79,0.1)"
                              : "var(--surface)",
                            color: covered ? ACCENT : "var(--text-secondary)",
                          }}
                        >
                          {covered ? "✓" : "+"} {skill}
                        </span>
                      );
                    })}
                    {job.skillsRequired.length > 4 && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--text-tertiary)",
                          padding: "2px 4px",
                        }}
                      >
                        +{job.skillsRequired.length - 4} more
                      </span>
                    )}
                  </div>

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
                      RM {job.salaryMin.toLocaleString()} –{" "}
                      {job.salaryMax.toLocaleString()}
                    </span>
                    {careerType && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background:
                            pct >= 70 ? `${ACCENT}12` : "var(--surface)",
                          color: pct >= 70 ? ACCENT : "var(--text-secondary)",
                        }}
                      >
                        {pct}% match
                      </span>
                    )}
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
