import Link from 'next/link';
import AnimatedGraphBackground from '@/components/map/AnimatedBackground';

export default function HomePage() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      {/* Animated graph background */}
      <AnimatedGraphBackground />

      {/* Subtle center gradient for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(247,246,243,0.3) 0%, transparent 65%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Hero content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '64px 24px',
          maxWidth: 720,
        }}
      >
        {/* Label */}
        <div
          className="animate-fade-up stagger-1"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 4,
            border: '1px solid var(--border)',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}
        >
          <img src="/logo.svg" alt="" width={16} height={16} style={{ flexShrink: 0 }} />
          Career DNA
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up stagger-2"
          style={{
            fontSize: 'clamp(40px, 8vw, 72px)',
            fontWeight: 400,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: 'var(--text)',
            marginBottom: 24,
            fontFamily: "'Newsreader', Georgia, serif",
          }}
        >
          Map your CS
          <br />
          career landscape.
        </h1>

        {/* Subline */}
        <p
          className="animate-fade-up stagger-3"
          style={{
            fontSize: 17,
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: 48,
            maxWidth: 440,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Interactive career intelligence for computer science students.
          Discover your type, explore fields, find your path.
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fade-up stagger-4"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <Link href="/onboarding" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
            Find My Type
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <Link
            href="/map"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: 13,
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
          >
            Explore the map
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M7 3.5l2.5 2.5L7 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Bento grid hint */}
      <div
        className="animate-fade-up stagger-5"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          maxWidth: 500,
          marginTop: 16,
          padding: '0 24px',
        }}
      >
        {[
          { label: '4-letter type', desc: 'Personalize your map' },
          { label: '37 fields', desc: 'Full career landscape' },
          { label: 'Real jobs', desc: 'Malaysian market data' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: '16px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
              {item.label}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
