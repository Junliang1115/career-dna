'use client';
import { useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { allQuestions } from '@/lib/questions';
import { calculateCareerType, Answers } from '@/lib/scoring';
import { useApp } from '@/lib/context';

type State = {
  currentIndex: number;
  answers: Answers;
};

type Action =
  | { type: 'answer'; questionId: number; answerText: string }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'answer':
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        answers: { ...state.answers, [action.questionId]: action.answerText },
      };
    default:
      return state;
  }
}

export default function QuizPage() {
  const router = useRouter();
  const { setProfile } = useApp();

  const [state, dispatch] = useReducer(reducer, { currentIndex: 0, answers: {} });

  const { currentIndex, answers } = state;
  const question = allQuestions[currentIndex];

  const handleAnswer = (answerText: string) => {
    dispatch({ type: 'answer', questionId: question.id, answerText });
  };

  useEffect(() => {
    if (currentIndex >= allQuestions.length) {
      const result = calculateCareerType(answers);
      setProfile({ answers, careerType: result.careerType });
      router.push('/results');
    }
  }, [currentIndex, answers]);

  if (!question) return null;

  // Section label
  const sectionLabel = question.section === 'RIASEC'
    ? 'Work Preference'
    : 'Work Personality';

  const sectionNum = question.section === 'RIASEC' ? 1 : 2;

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: 'var(--bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Question {currentIndex + 1} of {allQuestions.length}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {Math.round(((currentIndex + 1) / allQuestions.length) * 100)}%
            </span>
          </div>
          <div
            style={{
              height: 3,
              borderRadius: 2,
              background: 'var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${((currentIndex + 1) / allQuestions.length) * 100}%`,
                background: 'var(--text)',
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>

        {/* Section Badge */}
        <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Section {sectionNum} · {sectionLabel}
          </span>
        </div>

        {/* Question */}
        <div style={{ marginTop: 16, marginBottom: 36 }}>
          <p
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: 'clamp(18px, 3.5vw, 22px)',
              fontWeight: 400,
              lineHeight: 1.5,
              color: 'var(--text)',
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}
          >
            {question.text}
          </p>
        </div>

        {/* Options — 4 typed options per question */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.options.map((opt, idx) => {
            const letters = ['A', 'B', 'C', 'D'];
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.text)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--text)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg)';
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {letters[idx]}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.6 }}>
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
