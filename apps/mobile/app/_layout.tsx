import React from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { LearnerProgressProvider } from "../lib/learner-progress";
import { CustomExercisesProvider } from "../lib/custom-exercises";

function TabIcon({ emoji, size = 20 }: { emoji: string; size?: number }) {
  return <Text style={{ fontSize: size }}>{emoji}</Text>;
}

function AppTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f0f1a",
          borderTopColor: "rgba(255,255,255,0.08)",
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#818cf8",
        tabBarInactiveTintColor: "#4040a0",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
        <Tabs.Screen
          name="index"
          options={{
            title: "Course",
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📚" size={focused ? 22 : 20} />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📊" size={focused ? 22 : 20} />
            ),
          }}
        />
        <Tabs.Screen
          name="course"
          options={{ href: null }} // navigated to programmatically from welcome
        />
        <Tabs.Screen
          name="lesson/[unitId]"
          options={{ href: null }} // navigated to from course
        />
        <Tabs.Screen
          name="review/[unitId]"
          options={{ href: null }} // navigated to after lesson
        />
        <Tabs.Screen
          name="task/[unitId]"
          options={{ href: null }} // navigated to from course
        />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LearnerProgressProvider>
        <CustomExercisesProvider>
          <StatusBar style="light" />
          <AppTabs />
        </CustomExercisesProvider>
      </LearnerProgressProvider>
    </SafeAreaProvider>
  );
}
