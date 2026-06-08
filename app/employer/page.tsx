'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import TalentPoolMap from '@/components/employer/TalentPoolMap';
import { mockCandidates, topCandidates, mockJob } from '@/lib/mockCandidates';
import { Briefcase, Users, BarChart3, TrendingUp, Filter, Sliders, FileText, CheckCircle } from 'lucide-react';

const ACCENT = '#2D6A4F';

// Simple keyword extraction from job description text
function extractSkillsFromJD(text: string): string[] {
  const skillKeywords = [
    'React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js',
    'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring', 'Go', 'Rust',
    'C++', 'C#', '.NET', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'GraphQL',
    'REST', 'Git', 'Linux', 'TensorFlow', 'PyTorch', 'ML', 'AI',
    'Figma', 'HTML', 'CSS', 'Tailwind', 'Flutter', 'React Native', 'Swift',
    'Kotlin', 'CI/CD', 'Jenkins', 'Agile',
  ];
  const lower = text.toLowerCase();
  return skillKeywords.filter(s => lower.includes(s.toLowerCase()));
}

export default function EmployerPage() {
  const { user, loading } = useAuth();
  const { profile } = useApp();
  const router = useRouter();

  const [jdText, setJdText] = useState(
    'We are looking for a Full Stack Engineer with experience in React, Node.js, TypeScript, PostgreSQL, and cloud infrastructure (AWS or GCP). Strong problem-solving skills and ability to work in an agile team.',
  );
  const [jdParsed, setJdParsed] = useState(true); // Start with parsed (pre-filled)
  const [isParsing, setIsParsing] = useState(false);
  const [weightMode, setWeightMode] = useState<'balanced' | 'technical' | 'soft'>('balanced');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleParseJD = () => {
    setIsParsing(true);
    setTimeout(() => {
      setJdParsed(true);
      setIsParsing(false);
    }, 700);
  };

  const extractedSkills = extractSkillsFromJD(jdText);
  const avgScore = Math.round(topCandidates.reduce((s, c) => s + c.overallScore, 0) / topCandidates.length);

  const companyName = (profile as any).companyName || 'Your Company';

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#FAF9F7', padding: '28px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Page title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: 'var(--text)',
            fontFamily: "'Newsreader', 'Instrument Serif', Georgia, serif",
            marginBottom: 2,
          }}>
            Talent Pool
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {companyName} · Semantic candidate matching
          </p>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { icon: <Users size={14} />, label: 'Total Candidates', value: mockCandidates.length, color: '#2D6A4F' },
            { icon: <TrendingUp size={14} />, label: 'Top Match Avg', value: `${avgScore}%`, color: '#40916C' },
            { icon: <BarChart3 size={14} />, label: 'Top 10 Range', value: '58–94%', color: '#74C69D' },
            { icon: <Briefcase size={14} />, label: 'Extracted Skills', value: `${extractedSkills.length}`, color: '#52B788' },
          ].map(card => (
            <div key={card.label} style={{
              padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'white', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 7,
                background: `${card.color}18`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: card.color, flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                  {card.value}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* JD Input + Weightage row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14, marginBottom: 16 }}>
          {/* JD Editor */}
          <div style={{
            padding: '16px', borderRadius: 12, border: '1px solid var(--border)',
            background: 'white',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <FileText size={14} style={{ color: ACCENT }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                  Job Description
                </p>
                {jdParsed && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    fontSize: 10, color: '#2D6A4F', fontWeight: 500,
                  }}>
                    <CheckCircle size={10} /> Parsed
                  </span>
                )}
              </div>
              <button
                onClick={handleParseJD}
                disabled={isParsing}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none',
                  background: isParsing ? 'var(--border)' : ACCENT,
                  color: 'white', fontSize: 11, fontWeight: 600, cursor: isParsing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {isParsing ? 'Parsing...' : 'Parse JD'}
              </button>
            </div>

            <textarea
              value={jdText}
              onChange={(e) => { setJdText(e.target.value); setJdParsed(false); }}
              style={{
                width: '100%', minHeight: 72, padding: '10px',
                borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text)',
                fontSize: 12, fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="Paste your job description here..."
            />

            {/* Extracted skills */}
            {extractedSkills.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>
                  Extracted skills ({extractedSkills.length})
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {extractedSkills.map(skill => (
                    <span key={skill} style={{
                      padding: '3px 8px', borderRadius: 5,
                      background: 'rgba(45,106,79,0.1)', color: '#2D6A4F',
                      fontSize: 10, fontWeight: 500,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Weightage controls */}
          <div style={{
            padding: '16px', borderRadius: 12, border: '1px solid var(--border)',
            background: 'white',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <Sliders size={14} style={{ color: ACCENT }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Match Weightage</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {([
                { key: 'balanced', label: 'Balanced', desc: '50/50 tech vs soft', color: '#2D6A4F' },
                { key: 'technical', label: 'Technical Focus', desc: '70% tech · 30% soft', color: '#40916C' },
                { key: 'soft', label: 'Soft Skills Focus', desc: '30% tech · 70% soft', color: '#74C69D' },
              ] as const).map(mode => (
                <button
                  key={mode.key}
                  onClick={() => setWeightMode(mode.key)}
                  style={{
                    padding: '10px 12px', borderRadius: 8,
                    border: `2px solid ${weightMode === mode.key ? ACCENT : 'var(--border)'}`,
                    background: weightMode === mode.key ? 'rgba(45,106,79,0.05)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {mode.label}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                    {mode.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Visual weight bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 500 }}>Technical</span>
                <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 500 }}>Soft</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{
                  width: weightMode === 'balanced' ? '50%' : weightMode === 'technical' ? '70%' : '30%',
                  height: '100%', background: '#2D6A4F', borderRadius: 3, transition: 'width 0.3s',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Main content: map + list */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'flex-start',
        }}>
          {/* Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TalentPoolMap focusMode={weightMode} />

            {/* Legend */}
            <div style={{
              padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'white', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
            }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500 }}>Match score:</span>
              {[
                { label: '90%+', color: '#2D6A4F' },
                { label: '80–89%', color: '#40916C' },
                { label: '70–79%', color: '#74C69D' },
                { label: '60–69%', color: '#B7E4C7' },
                { label: '< 60%', color: '#D8F3DC' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{l.label}</span>
                </div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, color: 'white', fontWeight: 800 }}>JD</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Job Description</span>
              </div>
            </div>
          </div>

          {/* Top candidates list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Top {topCandidates.length} Matches
              </h2>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>score rank</span>
            </div>

            {topCandidates.map((candidate, i) => (
              <div key={candidate.id} style={{
                padding: '11px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'white', cursor: 'pointer', transition: 'all 0.12s',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2D6A4F';
                  e.currentTarget.style.background = 'rgba(45,106,79,0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: scoreColor(candidate.overallScore),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 9, flexShrink: 0,
                  }}>
                    {candidate.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>
                      {candidate.name}
                    </p>
                    <p style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
                      {candidate.mbti} · {candidate.yearsExp}y · {candidate.university}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: scoreColor(candidate.overallScore), lineHeight: 1.1 }}>
                      {candidate.overallScore}%
                    </div>
                    <div style={{ fontSize: 8, color: 'var(--text-secondary)' }}>#{i + 1}</div>
                  </div>
                </div>
                <div style={{ marginTop: 7, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {candidate.topSkills.slice(0, 3).map(s => (
                    <span key={s} style={{
                      padding: '1px 5px', borderRadius: 3,
                      border: '1px solid var(--border)', fontSize: 8, color: 'var(--text-secondary)',
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
                {/* Mini bars */}
                <div style={{ marginTop: 6, display: 'flex', gap: 5 }}>
                  <MiniBar label="T" value={candidate.technicalSkillScore} color="#2D6A4F" />
                  <MiniBar label="S" value={candidate.softSkillScore} color="#52B788" />
                  <MiniBar label="C" value={Math.round(candidate.coursesCovered / candidate.totalCourses * 100)} color="#74C69D" />
                </div>
              </div>
            ))}

            <button style={{
              padding: '9px', borderRadius: 7, border: '1px dashed var(--border)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: 11,
              cursor: 'pointer', marginTop: 2,
            }}>
              View all {mockCandidates.length} candidates →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 90) return '#2D6A4F';
  if (score >= 80) return '#40916C';
  if (score >= 70) return '#74C69D';
  if (score >= 60) return '#B7E4C7';
  return '#D8F3DC';
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 8, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 8, color: 'var(--text-secondary)' }}>{value}%</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}
