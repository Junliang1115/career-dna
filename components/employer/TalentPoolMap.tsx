"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  MockCandidate,
  MockJobDescription,
  TOP_N,
  CANVAS_SIZE,
  CENTER,
  SCALE,
  getCareerType,
} from "@/lib/mockCandidates";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string | null) => void;
  candidates: MockCandidate[];
  topCandidates: MockCandidate[];
  job: MockJobDescription;
}

export default function TalentPoolMap({
  selectedCandidateId,
  onSelectCandidate,
  candidates,
  topCandidates,
  job,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.4); // Start with 1.4x zoom so nodes are nicely spaced out
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const toScreen = useCallback(
    (vx: number, vy: number) => {
      return {
        x: CENTER + vx * SCALE * zoom + pan.x,
        y: CENTER + vy * SCALE * zoom + pan.y,
      };
    },
    [pan, zoom],
  );

  const hoveredCandidate = useMemo(() => {
    return candidates.find((c) => c.id === hovered);
  }, [hovered, candidates]);

  const hPos = useMemo(() => {
    if (!hoveredCandidate) return null;
    const isDraggingThis = hoveredCandidate.id === dragging;
    return toScreen(
      hoveredCandidate.vector[0] + (isDraggingThis ? dragOffset.x : 0),
      hoveredCandidate.vector[1] + (isDraggingThis ? dragOffset.y : 0),
    );
  }, [hoveredCandidate, dragging, dragOffset, toScreen]);

  const hasActiveSelection = selectedCandidateId !== null || hovered !== null;

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

  const jobScreen = toScreen(job.vector[0], job.vector[1]);
  const getRadiusForScore = (score: number) => {
    const scoreFraction = score / 100;
    const dist = 1.25 * Math.pow(1.0 - scoreFraction, 1.25) + 0.16;
    return dist * SCALE * zoom;
  };
  const topIds = new Set(topCandidates.map((c) => c.id));

  const scoreColor = (score: number) => {
    if (score >= 90) return "#2D6A4F";
    if (score >= 80) return "#40916C";
    if (score >= 70) return "#74C69D";
    if (score >= 60) return "#B7E4C7";
    return "#D8F3DC";
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
    if (dragging && svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      setDragOffset({
        x: (e.clientX - svgRect.left - CENTER - pan.x) / (SCALE * zoom),
        y: (e.clientY - svgRect.top - CENTER - pan.y) / (SCALE * zoom),
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDragging(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.button === 0) setDragging(id);
  };

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectCandidate(selectedCandidateId === id ? null : id);
  };

  const handleReset = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.4);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(5.0, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.4, prev / 1.2));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
      }}
    >
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
              background: "var(--bg)",
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
          height: 600, // Fixed height to match canvas size
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative", // Absolute positioning context for floating tooltips
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* Background pattern & gradient */}
          <defs>
            <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.1" />
            </pattern>
            <radialGradient id="mapBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="url(#mapBg)" />
          <rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="url(#gridPattern)" />

          {/* Concentric distance rings based on match score percentage */}
          {[90, 80, 70, 60].map((score) => {
            const r = getRadiusForScore(score);
            return (
              <g key={`ring-${score}`}>
                <circle
                  cx={jobScreen.x}
                  cy={jobScreen.y}
                  r={r}
                  fill="none"
                  stroke={scoreColor(score)}
                  strokeWidth={0.5}
                  strokeDasharray="4 6"
                  opacity={0.25}
                />
                <text
                  x={jobScreen.x + 6}
                  y={jobScreen.y - r + 3}
                  fontSize={8}
                  fill="var(--text-secondary)"
                  opacity={0.4}
                  fontWeight={600}
                >
                  {score}%
                </text>
              </g>
            );
          })}

          {/* Axis lines */}
          <line
            x1={CENTER + pan.x}
            y1={0}
            x2={CENTER + pan.x}
            y2={CANVAS_SIZE}
            stroke="var(--border)"
            strokeWidth={0.1}
            opacity={0.3}
          />
          <line
            x1={0}
            y1={CENTER + pan.y}
            x2={CANVAS_SIZE}
            y2={CENTER + pan.y}
            stroke="var(--border)"
            strokeWidth={0.5}
            opacity={0.3}
          />

          {/* Connection lines: job → top 10 */}
          {topCandidates.map((candidate) => {
            const isDraggingThis = candidate.id === dragging;
            const pos = toScreen(
              candidate.vector[0] + (isDraggingThis ? dragOffset.x : 0),
              candidate.vector[1] + (isDraggingThis ? dragOffset.y : 0),
            );
            const dist = Math.hypot(pos.x - jobScreen.x, pos.y - jobScreen.y);
            const isActive =
              candidate.id === selectedCandidateId || candidate.id === hovered;

            // Highlight line if selection is active
            let opacity = Math.max(0.12, 0.9 - (dist / (SCALE * zoom)) * 0.6);
            if (hasActiveSelection) {
              opacity = isActive ? 0.95 : 0.03;
            }

            return (
              <g key={`line-${candidate.id}`}>
                <line
                  x1={jobScreen.x}
                  y1={jobScreen.y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={scoreColor(candidate.overallScore)}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  opacity={opacity}
                  style={{ transition: "opacity 0.2s, stroke-width 0.15s" }}
                />
                {/* Score label on line */}
                {isActive && (
                  <text
                    x={(jobScreen.x + pos.x) / 2 + 8}
                    y={(jobScreen.y + pos.y) / 2 - 6}
                    fontSize={9}
                    fontWeight={600}
                    fill="var(--text-secondary)"
                    style={{ pointerEvents: "none" }}
                  >
                    {candidate.overallScore}% Match
                  </text>
                )}
              </g>
            );
          })}

          {/* Candidate nodes */}
          {candidates.map((candidate) => {
            const isTop = topIds.has(candidate.id);
            const isActive =
              candidate.id === selectedCandidateId || candidate.id === hovered;
            const isHovered = candidate.id === hovered;
            const isDraggingThis = candidate.id === dragging;
            const pos = toScreen(
              candidate.vector[0] + (isDraggingThis ? dragOffset.x : 0),
              candidate.vector[1] + (isDraggingThis ? dragOffset.y : 0),
            );

            // Score is still used for color/opacity — but all nodes are the same base size
            const score = candidate.overallScore;
            // Uniform node radius — hover gives a slight size boost
            const r = 6 * (isHovered ? 1.35 : 1);

            let opacity = score >= 90 ? 1.0 : score >= 80 ? 0.75 : score >= 60 ? 0.45 : 0.25;
            if (hasActiveSelection) {
              opacity = isActive ? 1.0 : 0.18;
            }

            const color = scoreColor(score);

            return (
              <g
                key={candidate.id}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(candidate.id)}
                onMouseLeave={() => setHovered(null)}
                onMouseDown={(e) => handleNodeMouseDown(e, candidate.id)}
                onClick={(e) => handleNodeClick(e, candidate.id)}
              >
                {/* Pulse ring for excellent matches */}
                {score >= 90 && !isActive && !hasActiveSelection && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r + 4}
                    fill="none"
                    stroke={color}
                    strokeWidth={0.75}
                    opacity={0.4}
                  />
                )}

                {/* Glow for active */}
                {isActive && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r + 6}
                    fill={color}
                    opacity={0.2}
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={color}
                  opacity={opacity}
                  stroke={isActive ? "#fff" : "rgba(255,255,255,0.3)"}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  style={{ transition: "all 0.15s" }}
                />
              </g>
            );
          })}

          {/* Job description center node (Diamond Shape) */}
          <g style={{ pointerEvents: "none" }}>
            {/* Outer glow diamonds */}
            <polygon
              points={`${jobScreen.x},${jobScreen.y - 36} ${jobScreen.x + 36},${jobScreen.y} ${jobScreen.x},${jobScreen.y + 36} ${jobScreen.x - 36},${jobScreen.y}`}
              fill="#2D6A4F"
              opacity={0.06}
            />
            <polygon
              points={`${jobScreen.x},${jobScreen.y - 26} ${jobScreen.x + 26},${jobScreen.y} ${jobScreen.x},${jobScreen.y + 26} ${jobScreen.x - 26},${jobScreen.y}`}
              fill="#2D6A4F"
              opacity={0.1}
            />
            <polygon
              points={`${jobScreen.x},${jobScreen.y - 20} ${jobScreen.x + 20},${jobScreen.y} ${jobScreen.x},${jobScreen.y + 20} ${jobScreen.x - 20},${jobScreen.y}`}
              fill="#2D6A4F"
              opacity={0.15}
            />
            {/* Center Diamond */}
            <polygon
              points={`${jobScreen.x},${jobScreen.y - 14} ${jobScreen.x + 14},${jobScreen.y} ${jobScreen.x},${jobScreen.y + 14} ${jobScreen.x - 14},${jobScreen.y}`}
              fill="#2D6A4F"
              stroke="#fff"
              strokeWidth={1.5}
            />
            {/* Label below */}
            <text
              x={jobScreen.x}
              y={jobScreen.y + 32}
              textAnchor="middle"
              fontSize={10}
              fill="var(--text)"
              fontWeight={700}
              style={{ userSelect: "none" }}
            >
              {job.title}
            </text>
            <text
              x={jobScreen.x}
              y={jobScreen.y + 45}
              textAnchor="middle"
              fontSize={9}
              fill="var(--text-secondary)"
              fontWeight={500}
              style={{ userSelect: "none" }}
            >
              {job.field}
            </text>
          </g>
        </svg>

        {/* Floating Tooltip */}
        {hoveredCandidate && hPos && (
          <div
            style={{
              position: "absolute",
              left: hPos.x,
              top: hPos.y - 45,
              transform: "translateX(-50%)",
              background: "rgba(20, 20, 20, 0.9)",
              backdropFilter: "blur(5px)",
              color: "white",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 10,
              pointerEvents: "none",
              zIndex: 100,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 11 }}>{hoveredCandidate.name}</span>
            <span style={{ fontSize: 9, opacity: 0.8 }}>
              {getCareerType(hoveredCandidate.mbti)} · {hoveredCandidate.overallScore}% Match
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
