'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Answers } from './scoring';

interface UserProfile {
  university: string;
  degree: 'bachelor' | 'master' | 'phd' | '';
  major: string;
  courses: string[];
  transcriptFile: File | null;
  careerType: string;
  answers: Answers;
  skills: string[];
  certifications: string[];
  linkedin: string;
  github: string;
  role?: 'candidate' | 'employer';
  companyName?: string;
  industry?: string;
  companySize?: string;
  hiringFor?: string;
}

interface AppContextType {
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;
  reset: () => void;
}

const defaultProfile: UserProfile = {
  university: '',
  degree: '',
  major: '',
  courses: [],
  transcriptFile: null,
  careerType: '',
  answers: {},
  skills: [],
  certifications: [],
  linkedin: '',
  github: '',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);

  // Load profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careerscope_profile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfileState(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to parse stored profile:', e);
        }
      }
    }
  }, []);

  const setProfile = (p: Partial<UserProfile>) => {
    setProfileState(prev => {
      const updated = { ...prev, ...p };
      if (typeof window !== 'undefined') {
        const { transcriptFile, ...serializable } = updated;
        localStorage.setItem('careerscope_profile', JSON.stringify(serializable));
      }
      return updated;
    });
  };

  const reset = () => {
    setProfileState(defaultProfile);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('careerscope_profile');
    }
  };

  return (
    <AppContext.Provider value={{ profile, setProfile, reset }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
