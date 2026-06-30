import React from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { LearnerProgressProvider } from "../lib/learner-progress";

type TabIconProps = Readonly<{
  emoji: string;
  size?: number;
}>;

type TabBarIconProps = Readonly<{
  focused: boolean;
  color: string;
  size: number;
}>;

function TabIcon({ emoji, size = 20 }: TabIconProps) {
  return <Text style={{ fontSize: size }}>{emoji}</Text>;
}

function renderLearnTabIcon({ focused }: TabBarIconProps) {
  return <TabIcon emoji="📚" size={focused ? 22 : 20} />;
}

function renderReviewTabIcon({ focused }: TabBarIconProps) {
  return <TabIcon emoji="🔁" size={focused ? 22 : 20} />;
}

function renderProgressTabIcon({ focused }: TabBarIconProps) {
  return <TabIcon emoji="📊" size={focused ? 22 : 20} />;
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
            href: null,
            tabBarStyle: {
              display: "none"
            }
          }}
        />
        <Tabs.Screen
          name="course"
          options={{
            title: "Learn",
            tabBarIcon: renderLearnTabIcon,
          }}
        />
        <Tabs.Screen
          name="review"
          options={{
            title: "Review",
            tabBarIcon: renderReviewTabIcon,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: renderProgressTabIcon,
          }}
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
        <StatusBar style="light" />
        <AppTabs />
      </LearnerProgressProvider>
    </SafeAreaProvider>
  );
}
