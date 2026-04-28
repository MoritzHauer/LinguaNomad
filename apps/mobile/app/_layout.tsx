import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { LearnerProgressProvider } from "../lib/learner-progress";

export default function RootLayout() {
  return (
    <LearnerProgressProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#f6efe1"
          }
        }}
      />
    </LearnerProgressProvider>
  );
}