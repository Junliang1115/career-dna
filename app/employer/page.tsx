'use client';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import TalentPoolMap from '@/components/employer/TalentPoolMap';
import { mockCandidates, topCandidates, mockJob } from '@/lib/mockCandidates';
import { Briefcase, Users, BarChart3, TrendingUp, Filter } from 'lucide-react';

const ACCENT = '#2D6A4F';

export default function EmployerPage() {
  const { user, loading } = useAuth();
  const { profile } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  const avgScore = Math.round(topCandidates.reduce((s, c) => s + c.overallScore, 0) / topCandidates.length);

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#FAF9F7', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{
                fontSize: 22, fontWeight: 700, color: 'var(--text)',
                fontFamily: "'Newsreader', 'Instrument Serif', Georgia, serif",
                marginBottom: 4,
              }}>
                Talent Pool
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {profile.companyName || 'Your Company'} · {mockJob.title} · {mockJob.industry}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'white', color: 'var(--text)', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Filter size={13} /> Filter
              </button>
              <button style={{
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: ACCENT, color: 'white', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}>
                Post a Job
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { icon: <Users size={16} />, label: 'Total Candidates', value: mockCandidates.length, color: '#2D6A4F' },
              { icon: <TrendingUp size={16} />, label: 'Top Match Avg', value: `${avgScore}%`, color: '#40916C' },
              { icon: <BarChart3 size={16} />, label: 'Top 10 Range', value: '58–94%', color: '#74C69D' },
              { icon: <Briefcase size={16} />, label: 'Active Jobs', value: '1', color: '#52B788' },
            ].map(card => (
              <div key={card.label} style={{
                padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'white', display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${card.color}18`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: card.color, flexShrink: 0,
                }}>
                  {card.icon}
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                    {card.value}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'flex-start',
        }}>
          {/* Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TalentPoolMap />

            {/* Legend */}
            <div style={{
              padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'white', display: 'flex', gap: 20, flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>Match score:</span>
              {[
                { label: '90%+', color: '#2D6A4F' },
                { label: '80–89%', color: '#40916C' },
                { label: '70–79%', color: '#74C69D' },
                { label: '60–69%', color: '#B7E4C7' },
                { label: '< 60%', color: '#D8F3DC' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top candidates list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                Top {topCandidates.length} Matches
              </h2>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>sorted by score</span>
            </div>

            {topCandidates.map((candidate, i) => (
              <div key={candidate.id} style={{
                padding: '12px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'white', cursor: 'pointer',
                transition: 'all 0.12s',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: scoreColor(candidate.overallScore),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 10, flexShrink: 0,
                  }}>
                    {candidate.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>
                      {candidate.name}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                      {candidate.mbti} · {candidate.university}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor(candidate.overallScore) }}>
                      {candidate.overallScore}%
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>match</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {candidate.topSkills.slice(0, 3).map(s => (
                      <span key={s} style={{
                        padding: '1px 6px', borderRadius: 3,
                        border: '1px solid var(--border)', fontSize: 9, color: 'var(--text-secondary)',
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Mini score bars */}
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <MiniBar label="T" value={candidate.technicalSkillScore} />
                  <MiniBar label="S" value={candidate.softSkillScore} />
                  <MiniBar label="C" value={Math.round(candidate.coursesCovered / candidate.totalCourses * 100)} />
                </div>
              </div>
            ))}

            <button style={{
              padding: '10px', borderRadius: 8, border: '1px dashed var(--border)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: 12,
              cursor: 'pointer', marginTop: 4,
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

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{value}%</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: '#2D6A4F', borderRadius: 2 }} />
      </div>
    </div>
  );
}
