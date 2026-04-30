import React from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";

import { LearnerProgressProvider } from "../lib/learner-progress";

function TabIcon({ emoji, size = 20 }: { emoji: string; size?: number }) {
  return <Text style={{ fontSize: size }}>{emoji}</Text>;
}

export default function RootLayout() {
  return (
    <LearnerProgressProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0f0f1a",
            borderTopColor: "rgba(255,255,255,0.08)",
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 16,
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
          name="task/[unitId]"
          options={{
            href: null, // Hidden from tab bar — navigated to programmatically
          }}
        />
      </Tabs>
    </LearnerProgressProvider>
  );
}
