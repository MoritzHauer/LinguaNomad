import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const pillars = [
  {
    title: "Read And Hear First",
    description: "Start with short Kyrgyz phrases and dialogues before pushing output too early."
  },
  {
    title: "Review What Matters",
    description: "Use spaced retrieval to keep foundational forms and sentence patterns available."
  },
  {
    title: "Do Something Real",
    description: "Finish each unit with a concrete task, not another round of isolated taps."
  }
];

const starterPack = [
  "Cyrillic and transliteration support",
  "Greetings and introductions",
  "Politeness and address forms",
  "First task: introduce yourself clearly"
];

export default function HomeScreen() {
  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Kyrgyz Starter Path</Text>
          <Text style={styles.title}>LinguaNomad</Text>
          <Text style={styles.subtitle}>
            A mobile-first, offline-first language app for learners who want lasting progress, not shallow streaks.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Loop</Text>
          {pillars.map((pillar) => (
            <View key={pillar.title} style={styles.card}>
              <Text style={styles.cardTitle}>{pillar.title}</Text>
              <Text style={styles.cardBody}>{pillar.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Starter Pack Focus</Text>
          <View style={styles.packCard}>
            {starterPack.map((item) => (
              <View key={item} style={styles.packRow}>
                <View style={styles.packMarker} />
                <Text style={styles.packText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5efe5"
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24
  },
  hero: {
    backgroundColor: "#d9ead3",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#9db595",
    shadowColor: "#2f4632",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 2
  },
  eyebrow: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#44624a",
    marginBottom: 10,
    fontWeight: "700"
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    color: "#1f3526",
    fontWeight: "800",
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#324b38"
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    fontSize: 22,
    color: "#2d2217",
    fontWeight: "700"
  },
  card: {
    backgroundColor: "#fffaf3",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ddcfbb"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3f2f1f",
    marginBottom: 6
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5b4936"
  },
  packCard: {
    backgroundColor: "#35261d",
    borderRadius: 24,
    padding: 20,
    gap: 14
  },
  packRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  packMarker: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#f3c96b"
  },
  packText: {
    flex: 1,
    color: "#f8f1e6",
    fontSize: 15,
    lineHeight: 22
  }
});