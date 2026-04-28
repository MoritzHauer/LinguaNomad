import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  completeLessonRun,
  createInitialLearnerProfile,
  createLessonRunState,
  type LearnerProfile,
  type LessonCompletionSummary,
  type LessonRunState
} from "@linguanomad/learner-state";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "linguanomad.mobile.progress.v1";

export type SessionPhase = "task" | "review" | "summary";

export interface PersistedSession {
  unitId: string;
  phase: SessionPhase;
  taskIndex: number;
  promptIndex: number;
  reviewIndex: number;
  reviewRevealed: boolean;
  run: LessonRunState;
  summary?: LessonCompletionSummary;
}

interface StoredProgress {
  profile: LearnerProfile;
  activeSession: PersistedSession | null;
}

interface LearnerProgressContextValue {
  isHydrated: boolean;
  profile: LearnerProfile;
  activeSession: PersistedSession | null;
  startUnit: (unitId: string) => Promise<void>;
  saveSession: (session: PersistedSession | null) => Promise<void>;
  clearSession: () => Promise<void>;
  finalizeRun: (run: LessonRunState) => Promise<LessonCompletionSummary>;
}

const LearnerProgressContext = createContext<LearnerProgressContextValue | undefined>(undefined);

export function LearnerProgressProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile>(createInitialLearnerProfile);
  const [activeSession, setActiveSession] = useState<PersistedSession | null>(null);
  const profileRef = useRef(profile);
  const sessionRef = useRef(activeSession);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    sessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    void hydrateState();
  }, []);

  const value = useMemo<LearnerProgressContextValue>(
    () => ({
      isHydrated,
      profile,
      activeSession,
      startUnit,
      saveSession,
      clearSession,
      finalizeRun
    }),
    [activeSession, isHydrated, profile]
  );

  return (
    <LearnerProgressContext.Provider value={value}>
      {children}
    </LearnerProgressContext.Provider>
  );

  async function hydrateState() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setIsHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<StoredProgress>;
      const nextProfile = parsed.profile ?? createInitialLearnerProfile();
      const nextSession = parsed.activeSession ?? null;
      profileRef.current = nextProfile;
      sessionRef.current = nextSession;
      setProfile(nextProfile);
      setActiveSession(nextSession);
    } finally {
      setIsHydrated(true);
    }
  }

  async function persistState(nextProfile: LearnerProfile, nextSession: PersistedSession | null) {
    const payload: StoredProgress = {
      profile: nextProfile,
      activeSession: nextSession
    };

    profileRef.current = nextProfile;
    sessionRef.current = nextSession;
    setProfile(nextProfile);
    setActiveSession(nextSession);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  async function startUnit(unitId: string) {
    const nextSession: PersistedSession = {
      unitId,
      phase: "task",
      taskIndex: 0,
      promptIndex: 0,
      reviewIndex: 0,
      reviewRevealed: false,
      run: createLessonRunState(unitId, profileRef.current.currentCorrectAnswerStreak)
    };

    await persistState(profileRef.current, nextSession);
  }

  async function saveSession(session: PersistedSession | null) {
    await persistState(profileRef.current, session);
  }

  async function clearSession() {
    await persistState(profileRef.current, null);
  }

  async function finalizeRun(run: LessonRunState): Promise<LessonCompletionSummary> {
    const { profile: nextProfile, summary } = completeLessonRun(profileRef.current, run);
    await persistState(nextProfile, sessionRef.current);
    return summary;
  }
}

export function useLearnerProgress(): LearnerProgressContextValue {
  const context = useContext(LearnerProgressContext);

  if (!context) {
    throw new Error("useLearnerProgress must be used within a LearnerProgressProvider");
  }

  return context;
}