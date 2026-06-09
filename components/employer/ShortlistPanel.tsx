'use client';
import { useState } from 'react';
import { mockCandidates, topCandidates } from '@/lib/mockCandidates';
import { Star, X, ExternalLink, TrendingUp } from 'lucide-react';

interface ShortlistedCandidate {
  id: string;
  name: string;
  avatar: string;
  overallScore: number;
  technicalSkillScore: number;
  softSkillScore: number;
  mbti: string;
  university: string;
  yearsExp: number;
  topSkills: string[];
}

interface Props {
  shortlisted: ShortlistedCandidate[];
  onRemove: (id: string) => void;
}

export default function ShortlistPanel({ shortlisted, onRemove }: Props) {
  const avgScore = shortlisted.length > 0
    ? Math.round(shortlisted.reduce((s, c) => s + c.overallScore, 0) / shortlisted.length)
    : 0;

  if (shortlisted.length === 0) {
    return (
      <div style={{
        padding: '16px', borderRadius: 12, border: '1px solid var(--border)',
        background: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <Star size={14} style={{ color: '#F59E0B' }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>My Shortlist</p>
        </div>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>☆</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Click the star on any candidate card to add them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px', borderRadius: 12, border: '1px solid var(--border)',
      background: 'white',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Star size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>My Shortlist</p>
          <span style={{
            padding: '1px 6px', borderRadius: 10, background: '#FEF3C7', color: '#D97706',
            fontSize: 10, fontWeight: 700,
          }}>
            {shortlisted.length}
          </span>
        </div>
        {shortlisted.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={11} style={{ color: '#2D6A4F' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2D6A4F' }}>Avg {avgScore}%</span>
          </div>
        )}
      </div>

      {/* Shortlisted candidates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shortlisted.map(c => (
          <div key={c.id} style={{
            padding: '10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--surface)', position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7,
                background: scoreColor(c.overallScore),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 10, flexShrink: 0,
              }}>
                {c.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>
                  {c.name}
                </p>
                <p style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
                  {c.mbti} · {c.yearsExp}y · {c.university}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: scoreColor(c.overallScore) }}>
                  {c.overallScore}%
                </div>
              </div>
            </div>

            {/* Skills */}
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 6 }}>
              {c.topSkills.slice(0, 3).map(s => (
                <span key={s} style={{
                  padding: '1px 5px', borderRadius: 3,
                  border: '1px solid var(--border)', fontSize: 8, color: 'var(--text-secondary)',
                }}>
                  {s}
                </span>
              ))}
            </div>

            {/* Mini bars */}
            <div style={{ display: 'flex', gap: 4 }}>
              <MiniBar label="T" value={c.technicalSkillScore} color="#2D6A4F" />
              <MiniBar label="S" value={c.softSkillScore} color="#52B788" />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
              <button style={{
                flex: 1, padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)',
                background: 'white', fontSize: 9, fontWeight: 500, color: 'var(--text)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              }}>
                <ExternalLink size={9} /> View Profile
              </button>
              <button
                onClick={() => onRemove(c.id)}
                style={{
                  padding: '4px 6px', borderRadius: 5, border: '1px solid #FEE2E2',
                  background: '#FEF2F2', color: '#DC2626', fontSize: 9, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
                }}
              >
                <X size={9} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Export CTA */}
      <button style={{
        width: '100%', marginTop: 10, padding: '8px',
        borderRadius: 7, border: '1px dashed var(--border)',
        background: 'transparent', fontSize: 11, fontWeight: 500,
        color: 'var(--text-secondary)', cursor: 'pointer',
      }}>
        Export shortlist →
      </button>
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
