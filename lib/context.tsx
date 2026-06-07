'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
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
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);

  const setProfile = (p: Partial<UserProfile>) => {
    setProfileState(prev => ({ ...prev, ...p }));
  };

  const reset = () => setProfileState(defaultProfile);

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
