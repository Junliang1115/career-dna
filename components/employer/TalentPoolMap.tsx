'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { mockCandidates, topCandidates, mockJob, TOP_N, CANVAS_SIZE, CENTER, SCALE } from '@/lib/mockCandidates';

interface Props {
  focusMode?: 'balanced' | 'technical' | 'soft';
}

export default function TalentPoolMap({ focusMode = 'balanced' }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Pan state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const toScreen = useCallback((vx: number, vy: number) => {
    return {
      x: CENTER + vx * SCALE + pan.x,
      y: CENTER + vy * SCALE + pan.y,
    };
  }, [pan]);

  const jobScreen = toScreen(mockJob.vector[0], mockJob.vector[1]);
  const topIds = new Set(topCandidates.map(c => c.id));

  // Score-based color
  const scoreColor = (score: number) => {
    if (score >= 90) return '#2D6A4F';
    if (score >= 80) return '#40916C';
    if (score >= 70) return '#74C69D';
    if (score >= 60) return '#B7E4C7';
    return '#D8F3DC';
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
      const newX = ((e.clientX - svgRect.left - CENTER - pan.x) / SCALE);
      const newY = ((e.clientY - svgRect.top - CENTER - pan.y) / SCALE);
      setOffset({ x: newX, y: newY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDragging(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.button === 0) {
      setDragging(id);
      setSelected(id);
    }
  };

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected(prev => prev === id ? null : id);
  };

  // Reset pan
  const handleReset = () => setPan({ x: 0, y: 0 });

  const activeCandidate = mockCandidates.find(c => c.id === (selected || hovered));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {mockCandidates.length} candidates · Top {TOP_N} highlighted
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            onClick={handleReset}
            style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Reset view
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* SVG Map */}
        <div
          style={{
            borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface)',
            overflow: 'hidden', flexShrink: 0,
            cursor: isPanning ? 'grabbing' : 'grab',
          }}
        >
          <svg
            ref={svgRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            style={{ display: 'block' }}
          >
            {/* Background grid */}
            {[-1, -0.5, 0, 0.5, 1].map(v => {
              const p = toScreen(v, 0);
              const pY = toScreen(0, v);
              return (
                <g key={v}>
                  <line
                    x1={p.x} y1={CENTER + pan.y}
                    x2={p.x} y2={CANVAS_SIZE}
                    stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" opacity={0.5}
                  />
                  <line
                    x1={CENTER + pan.x} y1={pY.y}
                    x2={CANVAS_SIZE} y2={pY.y}
                    stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4 4" opacity={0.5}
                  />
                </g>
              );
            })}

            {/* Connection lines: job → top 10 candidates */}
            {topCandidates.map(candidate => {
              const pos = toScreen(
                candidate.vector[0] + (candidate.id === dragging ? offset.x : 0),
                candidate.vector[1] + (candidate.id === dragging ? offset.y : 0),
              );
              const dist = Math.hypot(pos.x - jobScreen.x, pos.y - jobScreen.y);
              const opacity = Math.max(0.15, 1 - dist / 400);
              return (
                <line
                  key={`line-${candidate.id}`}
                  x1={jobScreen.x} y1={jobScreen.y}
                  x2={pos.x} y2={pos.y}
                  stroke={scoreColor(candidate.overallScore)}
                  strokeWidth={candidate.id === selected || candidate.id === hovered ? 2 : 1}
                  strokeDasharray={candidate.id === selected || candidate.id === hovered ? '0' : '4 4'}
                  opacity={opacity}
                  style={{ transition: 'opacity 0.2s' }}
                />
              );
            })}

            {/* Candidate nodes */}
            {mockCandidates.map(candidate => {
              const isTop = topIds.has(candidate.id);
              const isActive = candidate.id === selected || candidate.id === hovered;
              const pos = toScreen(
                candidate.vector[0] + (candidate.id === dragging ? offset.x : 0),
                candidate.vector[1] + (candidate.id === dragging ? offset.y : 0),
              );
              const r = isTop ? 14 : 10;
              const color = scoreColor(candidate.overallScore);

              return (
                <g
                  key={candidate.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(candidate.id)}
                  onMouseLeave={() => setHovered(null)}
                  onMouseDown={(e) => handleNodeMouseDown(e, candidate.id)}
                  onClick={(e) => handleNodeClick(e, candidate.id)}
                >
                  {/* Outer ring for top matches */}
                  {isTop && !isActive && (
                    <circle
                      cx={pos.x} cy={pos.y} r={r + 5}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      opacity={0.4}
                    />
                  )}
                  {/* Glow for active */}
                  {isActive && (
                    <circle
                      cx={pos.x} cy={pos.y} r={r + 8}
                      fill={color}
                      opacity={0.2}
                    />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={pos.x} cy={pos.y} r={r}
                    fill={color}
                    opacity={isTop ? 1 : 0.45}
                    stroke={isActive ? '#fff' : 'none'}
                    strokeWidth={isActive ? 2 : 0}
                    style={{ transition: 'all 0.15s' }}
                  />
                  {/* Initials */}
                  <text
                    x={pos.x} y={pos.y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={r - 4} fontWeight={600} fill="white"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {candidate.avatar}
                  </text>
                  {/* Score label for top matches */}
                  {isTop && (
                    <text
                      x={pos.x} y={pos.y + r + 10}
                      textAnchor="middle"
                      fontSize={8} fill="var(--text-secondary)"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {candidate.overallScore}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Job description node (center) */}
            <g style={{ pointerEvents: 'none' }}>
              {/* Outer ring */}
              <circle cx={jobScreen.x} cy={jobScreen.y} r={32} fill="#2D6A4F" opacity={0.1} />
              <circle cx={jobScreen.x} cy={jobScreen.y} r={24} fill="#2D6A4F" opacity={0.15} />
              {/* Main circle */}
              <circle cx={jobScreen.x} cy={jobScreen.y} r={18} fill="#2D6A4F" />
              {/* JD icon */}
              <text
                x={jobScreen.x} y={jobScreen.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={12} fill="white" fontWeight={700}
              >
                JD
              </text>
              {/* Label */}
              <text
                x={jobScreen.x} y={jobScreen.y + 36}
                textAnchor="middle"
                fontSize={10} fill="var(--text)" fontWeight={600}
              >
                {mockJob.title}
              </text>
            </g>
          </svg>
        </div>

        {/* Candidate detail card */}
        {activeCandidate && (
          <div style={{
            flex: 1,
            minWidth: 220,
            maxWidth: 280,
            padding: '16px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            alignSelf: 'flex-start',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: scoreColor(activeCandidate.overallScore),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0,
              }}>
                {activeCandidate.avatar}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                  {activeCandidate.name}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {activeCandidate.university} · {activeCandidate.yearsExp}y exp
                </p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: scoreColor(activeCandidate.overallScore),
                }}>
                  {activeCandidate.overallScore}
                  <span style={{ fontSize: 11, fontWeight: 400 }}>%</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>match</div>
              </div>
            </div>

            {/* MBTI badge */}
            <div style={{ marginBottom: 10 }}>
              <span style={{
                display: 'inline-block', padding: '3px 8px', borderRadius: 4,
                background: 'rgba(45,106,79,0.1)', color: '#2D6A4F',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
              }}>
                {activeCandidate.mbti}
              </span>
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>
                Top Skills
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {activeCandidate.topSkills.slice(0, 4).map(skill => (
                  <span key={skill} style={{
                    padding: '2px 7px', borderRadius: 4,
                    border: '1px solid var(--border)',
                    fontSize: 10, color: 'var(--text)',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Score bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <ScoreBar label="Technical" value={activeCandidate.technicalSkillScore} color="#2D6A4F" />
              <ScoreBar label="Soft Skills" value={activeCandidate.softSkillScore} color="#74C69D" />
              <ScoreBar
                label="Course Match"
                value={Math.round((activeCandidate.coursesCovered / activeCandidate.totalCourses) * 100)}
                color="#40916C"
              />
            </div>

            {topIds.has(activeCandidate.id) && (
              <div style={{
                marginTop: 10, padding: '6px 10px', borderRadius: 6,
                background: 'rgba(45,106,79,0.08)', color: '#2D6A4F',
                fontSize: 11, fontWeight: 500, textAlign: 'center',
              }}>
                ★ Top {TOP_N} Match
              </div>
            )}
          </div>
        )}

        {!activeCandidate && (
          <div style={{
            flex: 1, minWidth: 220, padding: '16px',
            borderRadius: 12, border: '1px solid var(--border)',
            background: 'var(--surface)', alignSelf: 'flex-start',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 500 }}>
              💡 How it works
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Center node', 'Job description vector'],
                ['Candidate nodes', 'Positioned by vector distance'],
                ['Ring highlight', 'Top 10 nearest candidates'],
                ['Hover / click', 'View candidate details'],
                ['Drag canvas', 'Pan around the map'],
              ].map(([label, desc]) => (
                <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2D6A4F', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{label}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color }}>{value}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}
