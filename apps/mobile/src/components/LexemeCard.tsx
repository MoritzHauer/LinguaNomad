import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface LexemeCardProps {
  cyrillic: string;
  transliteration?: string;
  gloss: string;
}

/**
 * Displays a Kyrgyz lexeme with Cyrillic script, transliteration, and English gloss.
 * Font size scales down for long words to avoid overflow.
 */
export function LexemeCard({ cyrillic, transliteration, gloss }: LexemeCardProps) {
  // Scale down for very long words (> 10 chars)
  const cyrillicSize = cyrillic.length > 12 ? 32 : cyrillic.length > 8 ? 42 : 52;

  return (
    <View style={styles.card}>
      <Text style={[styles.cyrillic, { fontSize: cyrillicSize }]} adjustsFontSizeToFit numberOfLines={2}>
        {cyrillic}
      </Text>
      {transliteration ? (
        <Text style={styles.transliteration}>{transliteration}</Text>
      ) : null}
      <View style={styles.divider} />
      <Text style={styles.gloss}>{gloss}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "rgba(30,30,52,1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 }
  },
  cyrillic: {
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: undefined
  },
  transliteration: {
    fontSize: 20,
    color: "#9090c0",
    letterSpacing: 1,
    fontStyle: "italic"
  },
  divider: {
    width: 48,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  gloss: {
    fontSize: 22,
    color: "#c8c8e8",
    fontWeight: "400",
    textAlign: "center"
  }
});
