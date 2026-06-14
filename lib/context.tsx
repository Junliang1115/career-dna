"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { Answers } from "./scoring";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  university: string;
  degree: "bachelor" | "master" | "phd" | "";
  major: string;
  courses: string[];
  transcriptFile: File | null;
  careerType: string;
  answers: Answers;
  skills: string[];
  certifications: string[];
  linkedin: string;
  github: string;
  role?: "candidate" | "employer";
  companyName?: string;
  industry?: string;
  companySize?: string;
  hiringFor?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companyLocation?: string;
  companyPerks?: string[];
  // Resume OCR extracted fields
  workExperience: WorkExperience[];
  projects: Project[];
  awards: string[];
}

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

interface AppContextType {
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;
  reset: () => void;
}

const defaultProfile: UserProfile = {
  university: "",
  degree: "",
  major: "",
  courses: [],
  transcriptFile: null,
  careerType: "",
  answers: {},
  skills: [],
  certifications: [],
  linkedin: "",
  github: "",
  workExperience: [],
  projects: [],
  awards: [],
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load profile from localStorage on mount and listen to Auth state
  useEffect(() => {
    // 1. Initial load from local storage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("careerscope_profile");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfileState((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse stored profile:", e);
        }
      }
    }

    // 2. Listen to Auth changes to fetch profile from Firestore
    if (typeof window === "undefined" || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && db) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<UserProfile>;
            setProfileState((prev) => {
              const updated = { ...prev, ...data };
              localStorage.setItem(
                "careerscope_profile",
                JSON.stringify(updated),
              );
              return updated;
            });
          }
        } catch (err) {
          console.error("Failed to fetch user profile from Firestore:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const setProfile = (p: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const updated = { ...prev, ...p };
      if (typeof window !== "undefined") {
        const { transcriptFile, ...serializable } = updated;
        localStorage.setItem(
          "careerscope_profile",
          JSON.stringify(serializable),
        );

        // Sync to Firestore if user is logged in
        if (currentUser && db) {
          const docRef = doc(db, "users", currentUser.uid);
          setDoc(docRef, serializable, { merge: true }).catch((err) => {
            console.error("Failed to save profile to Firestore:", err);
          });
        }
      }
      return updated;
    });
  };

  const reset = () => {
    setProfileState(defaultProfile);
    if (typeof window !== "undefined") {
      localStorage.removeItem("careerscope_profile");
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
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
