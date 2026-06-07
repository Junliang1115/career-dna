'use client';
import { useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/lib/questions';
import { calculateScore, scoreToType, Answers } from '@/lib/scoring';
import { useApp } from '@/lib/context';

type State = {
  currentIndex: number;
  answers: Answers;
};

type Action =
  | { type: 'answer'; questionId: number; answer: 'A' | 'B' }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'answer':
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        answers: { ...state.answers, [action.questionId]: action.answer },
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
  const question = questions[currentIndex];

  const handleAnswer = (answer: 'A' | 'B') => {
    dispatch({ type: 'answer', questionId: question.id, answer });
  };

  useEffect(() => {
    if (currentIndex >= questions.length) {
      const score = calculateScore(answers);
      const type = scoreToType(score);
      setProfile({ answers, careerType: type });
      router.push('/results');
    }
  }, [currentIndex, answers]);

  if (!question) return null;

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
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {Math.round(((currentIndex + 1) / questions.length) * 100)}%
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
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                background: 'var(--text)',
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div style={{ marginTop: 56, marginBottom: 40 }}>
          <p
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: 'clamp(19px, 4vw, 24px)',
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

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[question.optionA, question.optionB].map((opt, i) => {
            const answer = i === 0 ? 'A' : 'B';
            return (
              <button
                key={answer}
                onClick={() => handleAnswer(answer as 'A' | 'B')}
                style={{
                  padding: '18px 20px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
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
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    flexShrink: 0,
                  }}
                >
                  {answer}
                </span>
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text)', lineHeight: 1.6 }}>
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
