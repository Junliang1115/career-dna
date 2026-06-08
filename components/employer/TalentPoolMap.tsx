'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { mockCandidates, topCandidates, mockJob, TOP_N, CANVAS_SIZE, CENTER, SCALE } from '@/lib/mockCandidates';
import { RotateCcw } from 'lucide-react';

interface Props {
  focusMode?: 'balanced' | 'technical' | 'soft';
}

export default function TalentPoolMap({ focusMode = 'balanced' }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const toScreen = useCallback((vx: number, vy: number) => {
    return {
      x: CENTER + vx * SCALE + pan.x,
      y: CENTER + vy * SCALE + pan.y,
    };
  }, [pan]);

  const jobScreen = toScreen(mockJob.vector[0], mockJob.vector[1]);
  const topIds = new Set(topCandidates.map(c => c.id));

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
      setDragOffset({
        x: (e.clientX - svgRect.left - CENTER - pan.x) / SCALE,
        y: (e.clientY - svgRect.top - CENTER - pan.y) / SCALE,
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
    setSelected(prev => prev === id ? null : id);
  };

  const handleReset = () => setPan({ x: 0, y: 0 });

  const activeCandidate = mockCandidates.find(c => c.id === (selected || hovered));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{
          padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)',
          background: 'var(--surface)', fontSize: 11, color: 'var(--text-secondary)',
        }}>
          {mockCandidates.length} candidates · Top {TOP_N} highlighted
        </div>
        <div style={{
          padding: '4px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--surface)', display: 'flex', gap: 2,
        }}>
          {['Balanced', 'Technical', 'Soft'].map(mode => (
            <button key={mode} style={{
              padding: '4px 10px', borderRadius: 6, border: 'none',
              background: mode === 'Balanced' ? '#2D6A4F' : 'transparent',
              color: mode === 'Balanced' ? 'white' : 'var(--text-secondary)',
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
            }}>
              {mode}
            </button>
          ))}
        </div>
        <button
          onClick={handleReset}
          style={{
            marginLeft: 'auto', padding: '5px 10px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* SVG Map */}
        <div style={{
          borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface)',
          overflow: 'hidden', flexShrink: 0, cursor: isPanning ? 'grabbing' : 'grab',
        }}>
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
            {/* Background gradient */}
            <defs>
              <radialGradient id="mapBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="url(#mapBg)" />

            {/* Concentric distance rings */}
            {[0.25, 0.5, 0.75, 1.0].map(r => (
              <circle
                key={r}
                cx={jobScreen.x} cy={jobScreen.y}
                r={r * SCALE}
                fill="none"
                stroke="var(--border)"
                strokeWidth={0.5}
                strokeDasharray="4 6"
                opacity={0.5}
              />
            ))}

            {/* Axis lines */}
            <line
              x1={CENTER + pan.x} y1={0}
              x2={CENTER + pan.x} y2={CANVAS_SIZE}
              stroke="var(--border)" strokeWidth={0.5} opacity={0.3}
            />
            <line
              x1={0} y1={CENTER + pan.y}
              x2={CANVAS_SIZE} y2={CENTER + pan.y}
              stroke="var(--border)" strokeWidth={0.5} opacity={0.3}
            />

            {/* Connection lines: job → top 10 */}
            {topCandidates.map(candidate => {
              const isDraggingThis = candidate.id === dragging;
              const pos = toScreen(
                candidate.vector[0] + (isDraggingThis ? dragOffset.x : 0),
                candidate.vector[1] + (isDraggingThis ? dragOffset.y : 0),
              );
              const dist = Math.hypot(pos.x - jobScreen.x, pos.y - jobScreen.y);
              const opacity = Math.max(0.12, 0.9 - (dist / SCALE) * 0.6);
              const isActive = candidate.id === selected || candidate.id === hovered;
              return (
                <g key={`line-${candidate.id}`}>
                  <line
                    x1={jobScreen.x} y1={jobScreen.y}
                    x2={pos.x} y2={pos.y}
                    stroke={scoreColor(candidate.overallScore)}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeDasharray={isActive ? '0' : '6 4'}
                    opacity={opacity}
                    style={{ transition: 'opacity 0.2s, stroke-width 0.15s' }}
                  />
                  {/* Distance label on line */}
                  {isActive && (
                    <text
                      x={(jobScreen.x + pos.x) / 2 + 8}
                      y={(jobScreen.y + pos.y) / 2 - 6}
                      fontSize={9} fill="var(--text-secondary)"
                      style={{ pointerEvents: 'none' }}
                    >
                      {Math.round(dist)}px
                    </text>
                  )}
                </g>
              );
            })}

            {/* Candidate nodes */}
            {mockCandidates.map(candidate => {
              const isTop = topIds.has(candidate.id);
              const isActive = candidate.id === selected || candidate.id === hovered;
              const isDraggingThis = candidate.id === dragging;
              const pos = toScreen(
                candidate.vector[0] + (isDraggingThis ? dragOffset.x : 0),
                candidate.vector[1] + (isDraggingThis ? dragOffset.y : 0),
              );
              const r = isTop ? 15 : 11;
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
                  {/* Pulse ring for top matches */}
                  {isTop && !isActive && (
                    <circle
                      cx={pos.x} cy={pos.y} r={r + 7}
                      fill="none" stroke={color} strokeWidth={1}
                      opacity={0.3}
                    />
                  )}

                  {/* Glow for active */}
                  {isActive && (
                    <circle cx={pos.x} cy={pos.y} r={r + 10} fill={color} opacity={0.18} />
                  )}

                  {/* Main circle */}
                  <circle
                    cx={pos.x} cy={pos.y} r={r}
                    fill={color}
                    opacity={isTop ? 1 : 0.38}
                    stroke={isActive ? '#fff' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isActive ? 2.5 : 1}
                    style={{ transition: 'all 0.15s' }}
                  />

                  {/* Initials */}
                  <text
                    x={pos.x} y={pos.y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={r - 5} fontWeight={700} fill="white"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {candidate.avatar}
                  </text>

                  {/* Score badge for top matches */}
                  {isTop && (
                    <g>
                      <rect
                        x={pos.x - 14} y={pos.y + r + 4}
                        width={28} height={14} rx={4}
                        fill={color} opacity={0.9}
                      />
                      <text
                        x={pos.x} y={pos.y + r + 14}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={8} fontWeight={700} fill="white"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {candidate.overallScore}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Job description center node */}
            <g style={{ pointerEvents: 'none' }}>
              {/* Outer glow rings */}
              <circle cx={jobScreen.x} cy={jobScreen.y} r={36} fill="#2D6A4F" opacity={0.06} />
              <circle cx={jobScreen.x} cy={jobScreen.y} r={26} fill="#2D6A4F" opacity={0.10} />
              {/* Rings */}
              <circle cx={jobScreen.x} cy={jobScreen.y} r={20} fill="#2D6A4F" opacity={0.15} />
              <circle cx={jobScreen.x} cy={jobScreen.y} r={14} fill="#2D6A4F" />
              {/* Text */}
              <text
                x={jobScreen.x} y={jobScreen.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontWeight={800} fill="white"
              >
                JD
              </text>
              {/* Label below */}
              <text
                x={jobScreen.x} y={jobScreen.y + 32}
                textAnchor="middle"
                fontSize={10} fill="var(--text)" fontWeight={600}
                style={{ userSelect: 'none' }}
              >
                {mockJob.title}
              </text>
              <text
                x={jobScreen.x} y={jobScreen.y + 45}
                textAnchor="middle"
                fontSize={9} fill="var(--text-secondary)"
                style={{ userSelect: 'none' }}
              >
                {mockJob.industry}
              </text>
            </g>
          </svg>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, minWidth: 220, maxWidth: 290, display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'flex-start' }}>

          {/* JD preview */}
          <div style={{
            padding: '14px', borderRadius: 12, border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Job Description</p>
              <span style={{ fontSize: 10, color: '#2D6A4F', fontWeight: 500, cursor: 'pointer' }}>Edit</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>
              {mockJob.title}
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We are looking for a full stack engineer proficient in React, Node.js, and cloud infrastructure...
            </p>
            <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'].map(skill => (
                <span key={skill} style={{
                  padding: '2px 7px', borderRadius: 4,
                  background: 'rgba(45,106,79,0.1)', color: '#2D6A4F',
                  fontSize: 10, fontWeight: 500,
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Candidate detail */}
          {activeCandidate ? (
            <div style={{
              padding: '14px', borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: scoreColor(activeCandidate.overallScore),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>
                  {activeCandidate.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {activeCandidate.name}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                    {activeCandidate.university} · {activeCandidate.yearsExp}y exp
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(activeCandidate.overallScore), lineHeight: 1 }}>
                    {activeCandidate.overallScore}
                    <span style={{ fontSize: 11, fontWeight: 400 }}>%</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>match</div>
                </div>
              </div>

              {/* MBTI */}
              <div style={{ marginBottom: 10 }}>
                <span style={{
                  display: 'inline-block', padding: '3px 8px', borderRadius: 4,
                  background: 'rgba(45,106,79,0.1)', color: '#2D6A4F',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                }}>
                  {activeCandidate.mbti}
                </span>
                {topIds.has(activeCandidate.id) && (
                  <span style={{
                    marginLeft: 6, display: 'inline-block', padding: '3px 8px', borderRadius: 4,
                    background: '#2D6A4F', color: 'white',
                    fontSize: 10, fontWeight: 600,
                  }}>
                    ★ Top {TOP_N}
                  </span>
                )}
              </div>

              {/* Skills */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>Top Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {activeCandidate.topSkills.map(skill => (
                    <span key={skill} style={{
                      padding: '2px 7px', borderRadius: 4,
                      border: '1px solid var(--border)', fontSize: 10, color: 'var(--text)',
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Score bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ScoreBar label="Technical" value={activeCandidate.technicalSkillScore} color="#2D6A4F" />
                <ScoreBar label="Soft Skills" value={activeCandidate.softSkillScore} color="#52B788" />
                <ScoreBar
                  label="Course Match"
                  value={Math.round((activeCandidate.coursesCovered / activeCandidate.totalCourses) * 100)}
                  color="#74C69D"
                />
              </div>
            </div>
          ) : (
            <div style={{
              padding: '14px', borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 10 }}>
                💡 Interact with the map
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  ['Hover node', 'Preview candidate'],
                  ['Click node', 'Pin candidate details'],
                  ['Top nodes', 'Green ring = Top 10 match'],
                  ['Drag canvas', 'Pan the map'],
                  ['Focus mode', 'Adjust skill weights'],
                ].map(([label, desc]) => (
                  <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2D6A4F', marginTop: 4, flexShrink: 0 }} />
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
      <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          width: `${value}%`, height: '100%', background: color,
          borderRadius: 3, transition: 'width 0.4s',
        }} />
      </div>
    </div>
  );
}
