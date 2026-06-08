'use client';
import { useApp } from '@/lib/context';
import { getArchetype } from '@/lib/types';
import { calculateScore, scoreToType, getDimensionPercents } from '@/lib/scoring';
import { calculateJobMatches, JobMatch } from '@/lib/jobData';
import FieldVectorMap from '@/components/map/FieldVectorMap';
import { useState } from 'react';

type SortKey = 'score' | 'salary' | 'demand';
type FieldFilter = string | null;

const DEMAND_ORDER: Record<string, number> = { Rare: 0, Competitive: 1, Oversaturated: 2 };
const PAGE_SIZE = 12;

export default function ResultsPage() {
  const { profile } = useApp();
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const [fieldFilter, setFieldFilter] = useState<FieldFilter>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  if (!profile.careerType && Object.keys(profile.answers).length === 0) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          No results yet. <a href="/quiz" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Take the quiz first.</a>
        </p>
      </div>
    );
  }

  const score = calculateScore(profile.answers);
  const type = profile.careerType || scoreToType(score);
  const archetype = getArchetype(type);
  const dims = getDimensionPercents(score);

  // Use new calculateJobMatches for ALL jobs with full scoring
  const allMatches = calculateJobMatches(type, profile.skills || [], profile.courses);

  // Collect unique fields for filter chips
  const fields = Array.from(new Set(allMatches.map(m => m.job.field))).sort();

  // Apply filter
  const filtered = fieldFilter
    ? allMatches.filter(m => m.job.field === fieldFilter)
    : allMatches;

  // Apply sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.totalScore - a.totalScore;
    if (sortBy === 'salary') return b.job.salaryMax - a.job.salaryMax;
    if (sortBy === 'demand') return DEMAND_ORDER[a.job.demand] - DEMAND_ORDER[b.job.demand];
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageMatches = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const topMatch = sorted[0];

  const handleShare = () => {
    const text = `My CareerType is ${type} — "${archetype.name}"! Find yours at Career DNA.`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  // Helper to get score bar width %
  const bar = (val: number, max: number) => `${Math.round((val / max) * 100)}%`;

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '56px 24px' }}>

      {/* ── Type Reveal ── */}
      <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 56 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: 24, textTransform: 'uppercase' }}>
          Your Career Type
        </p>

        {/* 4-letter type boxes */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {type.split('').map((letter, i) => (
            <div
              key={i}
              style={{
                width: 56,
                height: 68,
                borderRadius: 6,
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 400,
                color: 'var(--text)',
                background: 'var(--bg)',
                fontFamily: "'Newsreader', serif",
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 400, color: 'var(--text)', marginBottom: 8, fontFamily: "'Newsreader', serif" }}>
          {archetype.name}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 28 }}>
          &ldquo;{archetype.tagline}&rdquo;
        </p>

        <button
          onClick={handleShare}
          className="btn-secondary"
          style={{ fontSize: 12 }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="3" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
            <circle cx="10" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
            <circle cx="6.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
            <path d="M3 4.5v1.5M6.5 4.5V8M8.5 6v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          Share My Type
        </button>
      </div>

      {/* ── Dimension Breakdown ── */}
      <div className="animate-fade-up stagger-2" style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16, letterSpacing: '0.02em' }}>
          Profile Breakdown
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dims.map(dim => {
            const dominantLetter = dim.percentA >= 50 ? dim.letterA : dim.letterB;
            const dominantPct = dim.percentA >= 50 ? dim.percentA : 100 - dim.percentA;

            return (
              <div
                key={dim.label}
                style={{
                  padding: '16px 18px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {dim.label}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'var(--surface)',
                  }}>
                    {dominantLetter} {dominantPct}%
                  </span>
                </div>

                <div style={{
                  height: 3,
                  borderRadius: 2,
                  background: 'var(--border)',
                  overflow: 'hidden',
                  marginBottom: 10,
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${dominantPct}%`,
                      background: 'var(--text)',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                  <div style={{ flex: dim.percentA, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{dim.letterA}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{dim.descA}</span>
                  </div>
                  <div style={{ flex: 100 - dim.percentA, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{dim.letterB}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{dim.descB}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Job Matches ── */}
      <div className="animate-fade-up stagger-3" style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em' }}>
            All Job Matches
          </h2>

          {/* Sort controls */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['score', 'salary', 'demand'] as SortKey[]).map(key => (
              <button
                key={key}
                onClick={() => { setSortBy(key); setPage(0); }}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: sortBy === key ? 'var(--text)' : 'var(--border)',
                  background: sortBy === key ? 'var(--text)' : 'transparent',
                  color: sortBy === key ? 'var(--bg)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: 500,
                }}
              >
                {key === 'score' ? 'Top Match' : key === 'salary' ? 'Salary' : 'Demand'}
              </button>
            ))}
          </div>
        </div>

        {/* Field filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          <button
            onClick={() => { setFieldFilter(null); setPage(0); }}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: fieldFilter === null ? 'var(--accent-blue)' : 'var(--border)',
              background: fieldFilter === null ? 'var(--accent-blue)' : 'transparent',
              color: fieldFilter === null ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            All Fields
          </button>
          {fields.map(f => (
            <button
              key={f}
              onClick={() => { setFieldFilter(f); setPage(0); }}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: fieldFilter === f ? 'var(--accent-blue)' : 'var(--border)',
                background: fieldFilter === f ? 'var(--accent-blue)' : 'transparent',
                color: fieldFilter === f ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Top match highlight */}
        {topMatch && sortBy === 'score' && !fieldFilter && (
          <div
            style={{
              padding: 20,
              borderRadius: 8,
              border: '2px solid var(--accent-blue)',
              background: 'var(--surface)',
              marginBottom: 16,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 12,
              right: 14,
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--accent-blue)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'var(--bg)',
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid var(--accent-blue)',
            }}>
              Your Top Match
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                  {topMatch.job.title}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {topMatch.job.company} &middot; RM {topMatch.job.salaryMin.toLocaleString()}–{topMatch.job.salaryMax.toLocaleString()} &middot; {topMatch.job.field}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {topMatch.skillsCovered.map(s => (
                    <span key={s} className="tag tag-green" style={{ fontSize: 10 }}>{s}</span>
                  ))}
                  {topMatch.skillsMissing.map(s => (
                    <span key={s} className="tag tag-red" style={{ fontSize: 10 }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Large score display */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent-blue)', lineHeight: 1, fontFamily: "'Newsreader', serif" }}>
                  {topMatch.totalScore}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                  /100
                </div>
              </div>
            </div>

            {/* Score breakdown bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <ScoreBar label="Personality" value={topMatch.personalityScore} max={40} color="#a78bfa" />
              <ScoreBar label="Skill Match" value={topMatch.skillScore} max={30} color="#34d399" />
              <ScoreBar label="Course Coverage" value={topMatch.courseScore} max={30} color="#60a5fa" />
            </div>
          </div>
        )}

        {/* Job cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {pageMatches.map((match) => {
            const isExpanded = expandedId === match.job.id;
            const isTop = sortBy === 'score' && !fieldFilter && match === topMatch;
            if (isTop) return null; // top match shown separately above

            return (
              <div
                key={match.job.id}
                className="card"
                style={{
                  padding: 16,
                  border: isExpanded ? '1px solid var(--text)' : '1px solid var(--border)',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{match.job.title}</h3>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {match.job.company} &middot; {match.job.demand}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{match.totalScore}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>/100</div>
                  </div>
                </div>

                {/* Mini score bars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                  <MiniBar value={match.personalityScore} max={40} color="#a78bfa" />
                  <MiniBar value={match.skillScore} max={30} color="#34d399" />
                  <MiniBar value={match.courseScore} max={30} color="#60a5fa" />
                </div>

                {/* Skill tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
                  {match.skillsCovered.map(s => (
                    <span key={s} className="tag tag-green" style={{ fontSize: 9 }}>{s}</span>
                  ))}
                  {match.skillsMissing.map(s => (
                    <span key={s} className="tag tag-red" style={{ fontSize: 9 }}>{s}</span>
                  ))}
                </div>

                {/* View Details toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : match.job.id)}
                  style={{
                    fontSize: 10,
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </button>

                {/* Expanded breakdown */}
                {isExpanded && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <ScoreBar label="Personality" value={match.personalityScore} max={40} color="#a78bfa" />
                      <ScoreBar label="Skill Match" value={match.skillScore} max={30} color="#34d399" />
                      <ScoreBar label="Course Coverage" value={match.courseScore} max={30} color="#60a5fa" />
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--accent-green)' }}>{match.skillsCovered.length} covered</span>
                      {' · '}
                      <span style={{ color: 'var(--accent-red)' }}>{match.skillsMissing.length} gaps</span>
                      {' · '}
                      RM {match.job.salaryMin.toLocaleString()}–{match.job.salaryMax.toLocaleString()}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                      {match.job.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: page === 0 ? 'var(--text-tertiary)' : 'var(--text)',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', alignSelf: 'center' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: page >= totalPages - 1 ? 'var(--text-tertiary)' : 'var(--text)',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ── Career Field Map ── */}
      <div className="animate-fade-up stagger-4" style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em' }}>
            Career Field Map
          </h2>
          <button
            onClick={() => setShowMap(v => !v)}
            className="btn-secondary"
            style={{ fontSize: 11, padding: '5px 12px' }}
          >
            {showMap ? 'Hide' : 'Open'}
          </button>
        </div>
        {showMap && <FieldVectorMap careerType={type} />}
      </div>

      {/* ── Type Profile ── */}
      <div className="animate-fade-up stagger-5">
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16, letterSpacing: '0.02em' }}>
          Type Profile
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div className="card-surface" style={{ padding: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strengths</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {archetype.strengths.map(s => (
                <li key={s} style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: 'var(--accent-green)', marginTop: 1, flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-surface" style={{ padding: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ideal Environments</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {archetype.idealEnvironments.map(e => (
                <li key={e} style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: 'var(--text)', marginTop: 1, flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-surface" style={{ padding: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Growth Areas</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {archetype.growthAreas.map(g => (
                <li key={g} style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: 'var(--accent-blue)', marginTop: 1, flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, color: 'var(--text-secondary)', width: 80, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.round((value / max) * 100)}%`, background: color, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)', width: 24, textAlign: 'right' }}>{value}/{max}</span>
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.round((value / max) * 100)}%`, background: color }} />
    </div>
  );
}
