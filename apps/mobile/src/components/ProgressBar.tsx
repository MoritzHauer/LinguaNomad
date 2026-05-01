import React from "react";
import { StyleSheet, View } from "react-native";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = total > 0 ? Math.min(current / total, 1) : 0;

  return (
    <View style={styles.outer}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 100,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 100
  }
});
