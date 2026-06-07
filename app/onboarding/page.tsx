'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { universities, allCourses } from '@/lib/universities';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

type DegreeLevel = 'bachelor' | 'master' | 'phd' | '';
type Step = 'uni' | 'degree' | 'major' | 'courses';

const STEPS: Step[] = ['uni', 'degree', 'major', 'courses'];
const ACCENT = '#2D6A4F';

const DEGREE_OPTIONS: { value: DegreeLevel; label: string; desc: string }[] = [
  { value: 'bachelor', label: "Bachelor's Degree", desc: 'Undergraduate — 3 to 4 years' },
  { value: 'master', label: "Master's Degree", desc: 'Postgraduate — 1 to 2 years' },
  { value: 'phd', label: 'PhD / Doctorate', desc: 'Research — 3 to 5+ years' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile } = useApp();

  const [step, setStep] = useState<Step>('uni');
  const [selectedUni, setSelectedUni] = useState(profile.university || '');
  const [selectedDegree, setSelectedDegree] = useState<DegreeLevel>(profile.degree || '');
  const [selectedMajor, setSelectedMajor] = useState(profile.major || '');
  const [selectedCourses, setSelectedCourses] = useState<string[]>(profile.courses);

  const stepIndex = STEPS.indexOf(step);
  const currentUni = universities.find(u => u.name === selectedUni);

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev =>
      prev.includes(course) ? prev.filter(c => c !== course) : prev.length < 5 ? [...prev, course] : prev
    );
  };

  const handleNext = () => {
    if (step === 'uni') {
      if (selectedUni) setProfile({ university: selectedUni });
      setStep('degree');
    } else if (step === 'degree') {
      if (selectedDegree) setProfile({ degree: selectedDegree });
      setStep('major');
    } else if (step === 'major') {
      if (selectedMajor) setProfile({ major: selectedMajor });
      setStep('courses');
    } else {
      if (selectedCourses.length > 0) setProfile({ courses: selectedCourses });
      router.push('/quiz');
    }
  };

  const handleSkip = () => {
    // Save what we have so far
    if (step === 'uni' && selectedUni) setProfile({ university: selectedUni });
    if (step === 'degree' && selectedDegree) setProfile({ degree: selectedDegree });
    if (step === 'major' && selectedMajor) setProfile({ major: selectedMajor });
    if (step === 'courses' && selectedCourses.length > 0) setProfile({ courses: selectedCourses });
    router.push('/quiz');
  };

  const handleBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= stepIndex ? ACCENT : 'var(--border)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Step label */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            {step === 'uni' && 'Which university do you attend?'}
            {step === 'degree' && "What's your degree level?"}
            {step === 'major' && "What's your major?"}
            {step === 'courses' && 'Pick up to 5 courses you\'ve taken'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {step === 'uni' && 'We\'ll tailor job matches to your university\'s network.'}
            {step === 'degree' && 'This helps us filter opportunities at the right level.'}
            {step === 'major' && `${selectedUni} — select your field of study.`}
            {step === 'courses' && "Add courses to improve your job matching accuracy."}
          </p>
        </div>

        {/* ── Step 1: University ─────────────────────────────── */}
        {step === 'uni' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {universities.map(uni => (
              <button
                key={uni.name}
                onClick={() => setSelectedUni(uni.name)}
                style={{
                  padding: '13px 16px', borderRadius: 10,
                  border: `2px solid ${selectedUni === uni.name ? ACCENT : 'var(--border)'}`,
                  background: selectedUni === uni.name ? 'rgba(45,106,79,0.06)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', fontSize: 14,
                  fontWeight: selectedUni === uni.name ? 600 : 400, color: 'var(--text)',
                  transition: 'all 0.12s',
                }}
              >
                {uni.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Degree ───────────────────────────────── */}
        {step === 'degree' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEGREE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedDegree(opt.value)}
                style={{
                  padding: '14px 16px', borderRadius: 10,
                  border: `2px solid ${selectedDegree === opt.value ? ACCENT : 'var(--border)'}`,
                  background: selectedDegree === opt.value ? 'rgba(45,106,79,0.06)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: selectedDegree === opt.value ? 600 : 500, color: 'var(--text)', marginBottom: 2 }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</p>
                  </div>
                  {selectedDegree === opt.value && <Check size={16} style={{ color: ACCENT }} />}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 3: Major ────────────────────────────────── */}
        {step === 'major' && currentUni && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {currentUni.majors.map(major => (
              <button
                key={major}
                onClick={() => setSelectedMajor(major)}
                style={{
                  padding: '13px 16px', borderRadius: 10,
                  border: `2px solid ${selectedMajor === major ? ACCENT : 'var(--border)'}`,
                  background: selectedMajor === major ? 'rgba(45,106,79,0.06)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', fontSize: 14,
                  fontWeight: selectedMajor === major ? 600 : 400, color: 'var(--text)',
                  transition: 'all 0.12s',
                }}
              >
                {major}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 4: Courses ──────────────────────────────── */}
        {step === 'courses' && (
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              {selectedCourses.length}/5 selected
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
              {allCourses.map(course => {
                const isSelected = selectedCourses.includes(course);
                return (
                  <button
                    key={course}
                    onClick={() => toggleCourse(course)}
                    style={{
                      padding: '11px 14px', borderRadius: 10,
                      border: `2.5px solid ${isSelected ? ACCENT : 'var(--border)'}`,
                      background: isSelected ? 'rgba(45,106,79,0.06)' : 'transparent',
                      textAlign: 'left', cursor: 'pointer', fontSize: 14,
                      fontWeight: isSelected ? 600 : 400, color: 'var(--text)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.12s',
                    }}
                  >
                    {course}
                    {isSelected && <Check size={14} style={{ color: ACCENT }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────── */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleNext}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none',
              background: ACCENT, color: 'white', fontWeight: 600, fontSize: 15,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, transition: 'all 0.15s',
            }}
          >
            {step === 'courses' ? 'Start Quiz' : 'Continue'}
            <ChevronRight size={16} />
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                style={{
                  flex: '0 0 auto', padding: '14px 16px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={handleSkip}
              style={{
                flex: 1, padding: '14px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.12s',
              }}
            >
              Skip — go to quiz
            </button>
          </div>

          {step === 'uni' && (
            <button
              onClick={() => router.push('/quiz')}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                border: 'none', background: 'transparent',
                color: 'var(--text-tertiary)', fontSize: 13,
                cursor: 'pointer', marginTop: 4,
              }}
            >
              Skip all →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
