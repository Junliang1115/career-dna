'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Briefcase, Users, BarChart3, Clock } from 'lucide-react';

export default function EmployerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      background: '#FAF9F7',
    }}>
      <div style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(45,106,79,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Briefcase size={28} style={{ color: '#2D6A4F' }} />
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: 'var(--text)',
            marginBottom: 8, fontFamily: "'Newsreader', 'Instrument Serif', Georgia, serif",
          }}>
            Talent Pool Dashboard
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your employer dashboard is being prepared. Upload a job description and we&apos;ll
            find the best candidates from our talent pool using semantic matching.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          {[
            {
              icon: <Users size={20} style={{ color: '#2D6A4F' }} />,
              title: 'Vector Match',
              desc: 'Course structure + MBTI + skills → candidate vectors',
            },
            {
              icon: <BarChart3 size={20} style={{ color: '#2D6A4F' }} />,
              title: 'Top 10 Nearest',
              desc: 'Highlight closest candidates to your JD automatically',
            },
            {
              icon: <Clock size={20} style={{ color: '#2D6A4F' }} />,
              title: 'Role Weighting',
              desc: 'Soft skills vs technical — adjust by job type',
            },
            {
              icon: <Briefcase size={20} style={{ color: '#2D6A4F' }} />,
              title: 'JD Parsing',
              desc: 'Paste any job description, we extract the criteria',
            },
          ].map((card, i) => (
            <div key={i} style={{
              padding: '16px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'white',
              textAlign: 'left',
            }}>
              <div style={{ marginBottom: 8 }}>{card.icon}</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                {card.title}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Coming soon notice */}
        <div style={{
          padding: '20px 24px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'white',
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            🚧 Full dashboard coming soon
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            In the meantime, explore how candidates see their matches at{' '}
            <a href="/results" style={{ color: '#2D6A4F', fontWeight: 500 }}>
              /results
            </a>{' '}
            — the same matching engine powered by your uploaded course data.
          </p>
        </div>

        {/* CTA */}
        <a
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '12px 20px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'white',
            color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          ← Back to home
        </a>

      </div>
    </div>
  );
}
