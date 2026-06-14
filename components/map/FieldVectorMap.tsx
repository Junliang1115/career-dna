"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  fieldNodes,
  fieldEdges,
  fieldByType,
  FieldNode,
} from "@/lib/fieldGraph";
import { jobs, Job, calculateJobMatches } from "@/lib/jobData";
import { useApp } from "@/lib/context";
import { DemandLevel } from "@/lib/jobData";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

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

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheelRaw = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      setZoom((prev) => {
        const newZoom =
          e.deltaY < 0
            ? Math.min(5.0, prev * zoomFactor)
            : Math.max(0.4, prev / zoomFactor);
        return newZoom;
      });
    };

    svg.addEventListener("wheel", handleWheelRaw, { passive: false });
    return () => {
      svg.removeEventListener("wheel", handleWheelRaw);
    };
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsPanning(true);
    setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - panStart.x,
      y: touch.clientY - panStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(5.0, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.4, prev / 1.2));
  };

  const handleReset = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

  // Find top match field ID and relevant field IDs for result-based highlighting
  const topMatchFieldId = useMemo(() => {
    const matches = calculateJobMatches(
      careerType,
      profile.skills || [],
      profile.courses
    );
    return matches.length > 0 ? matches[0].job.fieldId : null;
  }, [careerType, profile.skills, profile.courses]);

  const resultFieldIds = useMemo(() => {
    const matches = calculateJobMatches(
      careerType,
      profile.skills || [],
      profile.courses
    );
    return new Set(matches.slice(0, 5).map(m => m.job.fieldId));
  }, [careerType, profile.skills, profile.courses]);

  // Set the top match field ID as active by default on load/change
  useEffect(() => {
    if (topMatchFieldId) {
      setActive(topMatchFieldId);
    }
  }, [topMatchFieldId]);

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
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {/* Controls bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Zoom controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={handleZoomOut}
              style={{
                border: "none",
                background: "transparent",
                padding: "6px 8px",
                cursor: "pointer",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
              }}
              title="Zoom Out"
            >
              <ZoomOut size={12} />
            </button>
            <span
              style={{
                fontSize: 10,
                color: "var(--text-secondary)",
                padding: "0 4px",
                minWidth: 32,
                textAlign: "center",
                fontWeight: 600,
                userSelect: "none",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              style={{
                border: "none",
                background: "transparent",
                padding: "6px 8px",
                cursor: "pointer",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
              }}
              title="Zoom In"
            >
              <ZoomIn size={12} />
            </button>
          </div>

          <button
            onClick={handleReset}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <RotateCcw size={11} /> Reset Map
          </button>
        </div>
      </div>

      {/* Map SVG container */}
      <div
        style={{
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          overflow: "hidden",
          cursor: isPanning ? "grabbing" : "grab",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 1000 800"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <g
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            style={{
              transformOrigin: "500px 400px",
              transition: isPanning ? "none" : "transform 0.15s ease-out",
            }}
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
                style={{ vectorEffect: "non-scaling-stroke", transition: "all 0.15s" }}
              />
            );
          })}

          {/* Nodes */}
          {fieldNodes.map((node) => {
            const isHighlighted = highlightNodes.has(node.id);
            const isTypeMatch = typeNodes.has(node.id);
            const isActive = active === node.id;
            const isResultField = resultFieldIds.has(node.id);
            const isMuted = !isTypeMatch && !isHighlighted && !isActive && !isResultField;

            // Compensate node radius so it grows slightly when zoomed
            const baseR = isHighlighted || isActive || isResultField ? 5.5 : isTypeMatch ? 4.5 : 4;
            const r = baseR / Math.pow(zoom, 0.75);

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
                    r={r + 4 / Math.pow(zoom, 0.75)}
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth={0.75}
                    strokeOpacity={0.3}
                    style={{ vectorEffect: "non-scaling-stroke", transition: "all 0.15s" }}
                  />
                )}
                {isResultField && !isActive && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r + 5.5 / Math.pow(zoom, 0.75)}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    strokeOpacity={0.8}
                    style={{ vectorEffect: "non-scaling-stroke", transition: "all 0.15s" }}
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
                      isMuted ? 0.5 : isHighlighted || isActive || isResultField ? 1 : 0.35
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
                      isMuted ? 0.5 : isHighlighted || isActive || isResultField ? 1 : 0.35
                    }
                    style={{ vectorEffect: "non-scaling-stroke", transition: "all 0.15s" }}
                  />
                )}
                {/* Label to the right */}
                <text
                  x={node.x + (baseR + 4) / Math.pow(zoom, 0.75)}
                  y={node.y + 3 / Math.pow(zoom, 0.75)}
                  style={{
                    fontSize: `${10 / Math.pow(zoom, 0.75)}px`,
                    fontWeight: isTypeMatch || isResultField
                      ? 600
                      : isHighlighted || isActive
                        ? 500
                        : 400,
                    fill: isMuted
                      ? "var(--text-tertiary)"
                      : isHighlighted || isActive || isResultField
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
        </g>
      </svg>
      </div>

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
