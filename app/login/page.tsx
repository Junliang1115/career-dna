'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/profile');
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (errorCode === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later');
      } else {
        setError('Failed to sign in. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      router.push('/profile');
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === 'auth/popup-closed-by-user') {
        setError('Google sign-in was closed before completion');
      } else if (errorCode === 'auth/cancelled-popup-request') {
        setError('Google sign-in was cancelled');
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with a different sign-in method');
      } else {
        setError('Failed to sign in with Google. Please try again');
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
      background: '#FAF9F7',
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
            color: '#111111',
            marginBottom: 8,
            fontFamily: "'Newsreader', 'Instrument Serif', Georgia, serif",
          }}>
            Welcome back
          </h1>
          <p style={{
            fontSize: 14,
            color: '#787774',
          }}>
            Sign in to continue to Career DNA
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{
          padding: 32,
          background: '#FFFFFF',
        }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
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
              border: '1px solid #EAEAEA',
              background: '#FFFFFF',
              color: '#111111',
              cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 16 }}>G</span>
            {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ height: 1, flex: 1, background: '#EAEAEA' }} />
            <span style={{ fontSize: 12, color: '#787774' }}>or</span>
            <div style={{ height: 1, flex: 1, background: '#EAEAEA' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#787774',
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
                  borderBottom: '1px solid #EAEAEA',
                  background: 'transparent',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  color: '#111111',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#2D6A4F'}
                onBlur={(e) => e.target.style.borderBottomColor = '#EAEAEA'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#787774',
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
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 0',
                  border: 'none',
                  borderBottom: '1px solid #EAEAEA',
                  background: 'transparent',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  color: '#111111',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#2D6A4F'}
                onBlur={(e) => e.target.style.borderBottomColor = '#EAEAEA'}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 12px',
                background: '#FDEBEC',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 13,
                color: '#C1453A',
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
                background: loading ? '#999' : '#2D6A4F',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 14,
          color: '#787774',
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{
            color: '#2D6A4F',
            fontWeight: 500,
          }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
