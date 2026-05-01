import type { TaskDefinition } from "@linguanomad/content-schema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const CUSTOM_EXERCISES_KEY = "@linguanomad/custom_exercises";

interface CustomExerciseEntry {
  unitId: string;
  task: TaskDefinition;
}

interface CustomExercisesContextValue {
  customTasks: Record<string, TaskDefinition[]>;
  reloadCustomExercises: () => Promise<void>;
}

const CustomExercisesContext = createContext<CustomExercisesContextValue>({
  customTasks: {},
  reloadCustomExercises: async () => {},
});

export function useCustomExercises(): CustomExercisesContextValue {
  return useContext(CustomExercisesContext);
}

export function CustomExercisesProvider({ children }: { children: React.ReactNode }) {
  const [customTasks, setCustomTasks] = useState<Record<string, TaskDefinition[]>>({});

  async function reloadCustomExercises() {
    try {
      const raw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
      if (!raw) {
        setCustomTasks({});
        return;
      }
      const entries = JSON.parse(raw) as CustomExerciseEntry[];
      const grouped: Record<string, TaskDefinition[]> = {};
      for (const entry of entries) {
        if (!grouped[entry.unitId]) grouped[entry.unitId] = [];
        grouped[entry.unitId]!.push(entry.task);
      }
      setCustomTasks(grouped);
    } catch {
      setCustomTasks({});
    }
  }

  useEffect(() => {
    void reloadCustomExercises();
  }, []);

  return (
    <CustomExercisesContext.Provider value={{ customTasks, reloadCustomExercises }}>
      {children}
    </CustomExercisesContext.Provider>
  );
}

export { CUSTOM_EXERCISES_KEY };
export type { CustomExerciseEntry };
