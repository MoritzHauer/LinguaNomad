import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface FeedbackModalProps {
  visible: boolean;
  unitId: string;
  unitTitle: string;
  onClose: () => void;
}

interface FeedbackEntry {
  unitId: string;
  unitTitle: string;
  rating: number;
  comment: string;
  timestamp: number;
}

const FEEDBACK_KEY = "@linguanomad/feedback";

export function FeedbackModal({ visible, unitId, unitTitle, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    const entry: FeedbackEntry = {
      unitId,
      unitTitle,
      rating,
      comment,
      timestamp: Date.now(),
    };

    try {
      const existing = await AsyncStorage.getItem(FEEDBACK_KEY);
      const arr: FeedbackEntry[] = existing ? (JSON.parse(existing) as FeedbackEntry[]) : [];
      arr.push(entry);
      await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(arr));
    } catch {
      // Storage error — ignore silently
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setComment("");
      onClose();
    }, 1200);
  }

  function handleSkip() {
    setRating(0);
    setComment("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {submitted ? (
            <View style={styles.successWrap}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successText}>Thanks for your feedback!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>How was this lesson?</Text>
              <Text style={styles.subtitle}>{unitTitle}</Text>

              {/* Stars */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Rate ${star} stars`}
                  >
                    <Text style={[styles.star, star <= rating && styles.starActive]}>
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Comment field */}
              <TextInput
                style={styles.commentInput}
                placeholder="What could be better? (optional)"
                placeholderTextColor="#4a4a70"
                value={comment}
                onChangeText={(t) => setComment(t.slice(0, 300))}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
              <Text style={styles.charCount}>{comment.length}/300</Text>

              {/* Submit */}
              <Pressable
                style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={rating === 0}
                accessibilityRole="button"
              >
                <Text style={[styles.submitBtnText, rating === 0 && styles.submitBtnTextDisabled]}>
                  Submit Feedback
                </Text>
              </Pressable>

              {/* Skip */}
              <Pressable onPress={handleSkip} style={styles.skipBtn} accessibilityRole="button">
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(30,30,52,1)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e0e0f0",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9090c0",
    textAlign: "center",
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
  },
  starBtn: {
    padding: 4,
  },
  star: {
    fontSize: 36,
    color: "rgba(255,255,255,0.15)",
  },
  starActive: {
    color: "#f59e0b",
  },
  commentInput: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    color: "#e0e0f0",
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 11,
    color: "#4a4a70",
    alignSelf: "flex-end",
    marginTop: -8,
  },
  submitBtn: {
    width: "100%",
    height: 50,
    backgroundColor: "#6366f1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  submitBtnTextDisabled: {
    color: "#4a4a70",
  },
  skipBtn: {
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    color: "#6060a0",
  },
  successWrap: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  successEmoji: {
    fontSize: 48,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e0e0f0",
  },
});
