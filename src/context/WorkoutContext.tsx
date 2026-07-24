import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "./AuthContext";

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export type WorkoutPlan = Record<DayOfWeek, Exercise[]>;

export const DAYS_OF_WEEK: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WorkoutContextType {
  plan: WorkoutPlan;
  activeDay: DayOfWeek;
  setActiveDay: (day: DayOfWeek) => void;
  addExercise: (day: DayOfWeek, name: string) => void;
  removeExercise: (day: DayOfWeek, id: string) => void;
  updateExercise: (day: DayOfWeek, id: string, fields: Partial<Omit<Exercise, "id">>) => void;
  reorderExercises: (day: DayOfWeek, exercises: Exercise[]) => void;
  saveStatus: "Saving" | "Synced" | "Error" | null;
  loadingPlan: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const createEmptyPlan = (): WorkoutPlan => ({
  Mon: [],
  Tue: [],
  Wed: [],
  Thu: [],
  Fri: [],
  Sat: [],
  Sun: [],
});

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<WorkoutPlan>(createEmptyPlan());
  const [activeDay, setActiveDay] = useState<DayOfWeek>("Mon");
  const [saveStatus, setSaveStatus] = useState<"Saving" | "Synced" | "Error" | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Use refs to track remote state and prevent infinite update loops
  const remotePlanRef = useRef<WorkoutPlan>(createEmptyPlan());
  const isInitializingRef = useRef(true);

  // Real-time Firestore Sync
  useEffect(() => {
    if (!user) {
      setPlan(createEmptyPlan());
      remotePlanRef.current = createEmptyPlan();
      setLoadingPlan(false);
      setSaveStatus(null);
      isInitializingRef.current = true;
      return;
    }

    setLoadingPlan(true);
    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as { plan: WorkoutPlan };
          if (data && data.plan) {
            const serverPlan = data.plan;
            remotePlanRef.current = serverPlan;

            // Only update local state if we don't have pending local writes,
            // or if we are loading for the first time,
            // to avoid overwriting user input.
            if (!snapshot.metadata.hasPendingWrites || isInitializingRef.current) {
              setPlan(serverPlan);
              if (isInitializingRef.current) {
                setSaveStatus("Synced");
                isInitializingRef.current = false;
              }
            }
          }
        } else {
          // Document doesn't exist yet: initialize it with empty plan
          const emptyPlan = createEmptyPlan();
          try {
            await setDoc(userDocRef, { plan: emptyPlan });
            remotePlanRef.current = emptyPlan;
            setPlan(emptyPlan);
            setSaveStatus("Synced");
          } catch (err) {
            console.error("Error initializing user document:", err);
          }
          isInitializingRef.current = false;
        }
        setLoadingPlan(false);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        setSaveStatus("Error");
        setLoadingPlan(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Debounced Autosaving
  useEffect(() => {
    if (!user) return;

    // Check if the plan is different from the last known remote plan
    const isPlanEqual = JSON.stringify(plan) === JSON.stringify(remotePlanRef.current);
    if (isPlanEqual) {
      return;
    }

    setSaveStatus("Saving");

    const timer = setTimeout(async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { plan }, { merge: true });
        remotePlanRef.current = plan;
        setSaveStatus("Synced");
      } catch (error) {
        console.error("Error autosaving workout plan:", error);
        setSaveStatus("Error");
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [plan, user]);

  // Actions
  const addExercise = (day: DayOfWeek, name: string) => {
    const newExercise: Exercise = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      name,
      sets: 3,
      reps: 10,
      weight: 0,
    };

    setPlan((prev) => ({
      ...prev,
      [day]: [...prev[day], newExercise],
    }));
  };

  const removeExercise = (day: DayOfWeek, id: string) => {
    setPlan((prev) => ({
      ...prev,
      [day]: prev[day].filter((ex) => ex.id !== id),
    }));
  };

  const updateExercise = (
    day: DayOfWeek,
    id: string,
    fields: Partial<Omit<Exercise, "id">>
  ) => {
    setPlan((prev) => ({
      ...prev,
      [day]: prev[day].map((ex) => (ex.id === id ? { ...ex, ...fields } : ex)),
    }));
  };

  const reorderExercises = (day: DayOfWeek, exercises: Exercise[]) => {
    setPlan((prev) => ({
      ...prev,
      [day]: exercises,
    }));
  };

  return (
    <WorkoutContext.Provider
      value={{
        plan,
        activeDay,
        setActiveDay,
        addExercise,
        removeExercise,
        updateExercise,
        reorderExercises,
        saveStatus,
        loadingPlan,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
