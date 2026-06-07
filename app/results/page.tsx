'use client';
import { useApp } from '@/lib/context';
import { getArchetype } from '@/lib/types';
import { calculateScore, scoreToType, getDimensionPercents } from '@/lib/scoring';
import { matchJobsToType } from '@/lib/jobData';
import FieldVectorMap from '@/components/map/FieldVectorMap';
import { useState } from 'react';

export default function ResultsPage() {
  const { profile } = useApp();
  const [showMap, setShowMap] = useState(false);

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
  const matchedJobs = matchJobsToType(type, [], profile.courses);

  const skillsByJob = matchedJobs.map(job => ({
    job,
    covered: job.skillsRequired.filter(s =>
      profile.courses.some(c => c.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(c.toLowerCase()))
    ),
    missing: job.skillsRequired.filter(s =>
      !profile.courses.some(c => c.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(c.toLowerCase()))
    ),
  }));

  const handleShare = () => {
    const text = `My CareerType is ${type} — "${archetype.name}"! Find yours at Career DNA.`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

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
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16, letterSpacing: '0.02em' }}>
          Top Job Matches
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
          {skillsByJob.map(({ job, covered, missing }) => {
            const matchPct = Math.round((covered.length / job.skillsRequired.length) * 100);
            return (
              <div
                key={job.id}
                className="card"
                style={{
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{job.title}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {job.company} &middot; RM {job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{matchPct}%</div>
                    <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>match</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.55 }}>
                  {job.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {covered.map(s => (
                    <span key={s} className="tag tag-green" style={{ fontSize: 10 }}>
                      {s}
                    </span>
                  ))}
                  {missing.map(s => (
                    <span key={s} className="tag tag-red" style={{ fontSize: 10 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
