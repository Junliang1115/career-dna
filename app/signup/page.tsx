'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);
      router.push('/onboarding');
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (errorCode === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (errorCode === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError('Failed to create account. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      router.push(result.isNewUser ? '/onboarding' : '/profile');
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === 'auth/popup-closed-by-user') {
        setError('Google sign-in was closed before completion');
      } else if (errorCode === 'auth/cancelled-popup-request') {
        setError('Google sign-in was cancelled');
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with a different sign-in method');
      } else {
        setError('Failed to continue with Google. Please try again');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--surface)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 400,
            color: 'var(--text)',
            marginBottom: 8,
            fontFamily: "'Newsreader', 'Instrument Serif', Georgia, serif",
          }}>
            Create account
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
          }}>
            Start your career discovery journey
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{
          padding: 32,
          background: 'var(--bg)',
        }}>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || googleLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '12px 20px',
              marginBottom: 16,
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700 }}>G</span>
            {googleLoading ? 'Continuing with Google...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>or</span>
            <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '10px 0',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  background: 'transparent',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-green)'}
                onBlur={(e) => e.target.style.borderBottomColor = 'var(--border)'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '10px 0',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  background: 'transparent',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-green)'}
                onBlur={(e) => e.target.style.borderBottomColor = 'var(--border)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 6 characters"
                style={{
                  width: '100%',
                  padding: '10px 0',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  background: 'transparent',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-green)'}
                onBlur={(e) => e.target.style.borderBottomColor = 'var(--border)'}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 12px',
                background: 'var(--accent-red-subtle)',
                border: '1px solid var(--accent-red-border)',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 13,
                color: 'var(--accent-red)',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px 20px',
                background: loading ? 'var(--text-tertiary)' : 'var(--accent-green)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 14,
          color: 'var(--text-secondary)',
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{
            color: 'var(--accent-green)',
            fontWeight: 500,
          }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
