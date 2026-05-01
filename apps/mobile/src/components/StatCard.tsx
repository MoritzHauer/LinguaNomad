import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type StatCardVariant = "default" | "highlight" | "streak";

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  sublabel?: string;
  variant?: StatCardVariant;
}

export function StatCard({ icon, value, label, sublabel, variant = "default" }: StatCardProps) {
  return (
    <View style={[styles.card, variant === "highlight" && styles.cardHighlight, variant === "streak" && styles.cardStreak]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, variant === "highlight" && styles.valueViolet, variant === "streak" && styles.valueAmber]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  cardHighlight: {
    borderColor: "rgba(99,102,241,0.3)",
    backgroundColor: "rgba(99,102,241,0.07)",
  },
  cardStreak: {
    borderColor: "rgba(245,158,11,0.3)",
    backgroundColor: "rgba(245,158,11,0.06)",
  },
  icon: {
    fontSize: 22,
    marginBottom: 6,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 32,
  },
  valueViolet: {
    color: "#818cf8",
  },
  valueAmber: {
    color: "#fbbf24",
  },
  label: {
    fontSize: 12,
    color: "#5050a0",
    marginTop: 2,
  },
  sublabel: {
    fontSize: 11,
    color: "#3a3a70",
    marginTop: 1,
  },
});
