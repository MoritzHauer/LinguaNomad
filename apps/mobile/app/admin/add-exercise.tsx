import type { FillInBlankTaskDefinition, MultipleChoiceTaskDefinition, ScriptMatchTaskDefinition, TaskDefinition } from "@linguanomad/content-schema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCourseBundles } from "../../lib/course-data";
import { CUSTOM_EXERCISES_KEY, useCustomExercises } from "../../lib/custom-exercises";
import type { CustomExerciseEntry } from "../../lib/custom-exercises";

type TaskTypeOption = "multiple-choice" | "fill-in-blank" | "script-match";

const TASK_TYPES: TaskTypeOption[] = ["multiple-choice", "fill-in-blank", "script-match"];

const bundles = getCourseBundles();

function TaskTypeButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.typeBtn, selected && styles.typeBtnSelected]}
      accessibilityRole="button"
    >
      <Text style={[styles.typeBtnText, selected && styles.typeBtnTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function FieldInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ""}
        placeholderTextColor="#4a4a70"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

// ─── Multiple Choice Form ───────────────────────────────────────────────────

function MultipleChoiceForm({
  onChange,
}: {
  onChange: (task: Partial<MultipleChoiceTaskDefinition>) => void;
}) {
  const [question, setQuestion] = useState("");
  const [stimulus, setStimulus] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);

  function update(patch: Partial<{ question: string; stimulus: string; choices: string[]; correctIdx: number }>) {
    const q = patch.question ?? question;
    const s = patch.stimulus ?? stimulus;
    const c = patch.choices ?? choices;
    const ci = patch.correctIdx ?? correctIdx;
    onChange({
      kind: "multiple-choice",
      question: q,
      stimulus: s || undefined,
      choices: c.map((text, i) => ({ id: `c${i + 1}`, text, correct: i === ci })),
    });
  }

  return (
    <>
      <FieldInput
        label="Question"
        value={question}
        onChangeText={(v) => { setQuestion(v); update({ question: v }); }}
        placeholder="e.g. What does this word mean?"
      />
      <FieldInput
        label="Stimulus (Cyrillic word, optional)"
        value={stimulus}
        onChangeText={(v) => { setStimulus(v); update({ stimulus: v }); }}
        placeholder="e.g. Салам"
      />
      {choices.map((choice, i) => (
        <View key={i} style={styles.choiceRow}>
          <Pressable
            onPress={() => { setCorrectIdx(i); update({ correctIdx: i }); }}
            style={[styles.radioBtn, correctIdx === i && styles.radioBtnSelected]}
            accessibilityRole="radio"
            accessibilityLabel={`Mark choice ${i + 1} as correct`}
          >
            {correctIdx === i ? <View style={styles.radioDot} /> : null}
          </Pressable>
          <TextInput
            style={[styles.fieldInput, styles.choiceInput]}
            value={choice}
            onChangeText={(v) => {
              const updated = [...choices];
              updated[i] = v;
              setChoices(updated);
              update({ choices: updated });
            }}
            placeholder={`Choice ${i + 1}`}
            placeholderTextColor="#4a4a70"
          />
        </View>
      ))}
      <Text style={styles.hint}>Select the radio button to mark the correct answer.</Text>
    </>
  );
}

// ─── Fill In Blank Form ─────────────────────────────────────────────────────

function FillInBlankForm({
  onChange,
}: {
  onChange: (task: Partial<FillInBlankTaskDefinition>) => void;
}) {
  const [template, setTemplate] = useState("");
  const [wordBank, setWordBank] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [translation, setTranslation] = useState("");

  function update(patch: Partial<{ template: string; wordBank: string; correctAnswer: string; translation: string }>) {
    const t = patch.template ?? template;
    const w = patch.wordBank ?? wordBank;
    const ca = patch.correctAnswer ?? correctAnswer;
    const tr = patch.translation ?? translation;
    onChange({
      kind: "fill-in-blank",
      template: t,
      wordBank: w.split(",").map((s) => s.trim()).filter(Boolean),
      correctAnswer: ca,
      translation: tr || undefined,
    });
  }

  return (
    <>
      <FieldInput
        label="Template (use {{blank}} for the blank)"
        value={template}
        onChangeText={(v) => { setTemplate(v); update({ template: v }); }}
        placeholder="e.g. {{blank}}, Ата!"
      />
      <FieldInput
        label="Word bank (comma separated)"
        value={wordBank}
        onChangeText={(v) => { setWordBank(v); update({ wordBank: v }); }}
        placeholder="e.g. Салам, Жок, Рахмат"
      />
      <FieldInput
        label="Correct answer"
        value={correctAnswer}
        onChangeText={(v) => { setCorrectAnswer(v); update({ correctAnswer: v }); }}
        placeholder="e.g. Салам"
      />
      <FieldInput
        label="Translation (optional)"
        value={translation}
        onChangeText={(v) => { setTranslation(v); update({ translation: v }); }}
        placeholder="e.g. ___, Father!"
      />
    </>
  );
}

// ─── Script Match Form ──────────────────────────────────────────────────────

function ScriptMatchForm({
  onChange,
}: {
  onChange: (task: Partial<ScriptMatchTaskDefinition>) => void;
}) {
  const [direction, setDirection] = useState<"cyrl-to-latn" | "latn-to-cyrl">("cyrl-to-latn");
  const [pairs, setPairs] = useState([
    { cyrillic: "", transliteration: "" },
    { cyrillic: "", transliteration: "" },
    { cyrillic: "", transliteration: "" },
    { cyrillic: "", transliteration: "" },
  ]);

  function update(patch: Partial<{ direction: "cyrl-to-latn" | "latn-to-cyrl"; pairs: typeof pairs }>) {
    const d = patch.direction ?? direction;
    const p = patch.pairs ?? pairs;
    onChange({
      kind: "script-match",
      direction: d,
      items: p.filter((it) => it.cyrillic && it.transliteration).map((it, i) => ({
        id: `sm-${i + 1}`,
        cyrillic: it.cyrillic,
        transliteration: it.transliteration,
      })),
    });
  }

  return (
    <>
      <View style={styles.directionRow}>
        <Pressable
          onPress={() => { setDirection("cyrl-to-latn"); update({ direction: "cyrl-to-latn" }); }}
          style={[styles.dirBtn, direction === "cyrl-to-latn" && styles.dirBtnSelected]}
        >
          <Text style={[styles.dirBtnText, direction === "cyrl-to-latn" && styles.dirBtnTextSelected]}>
            Cyrillic → Latin
          </Text>
        </Pressable>
        <Pressable
          onPress={() => { setDirection("latn-to-cyrl"); update({ direction: "latn-to-cyrl" }); }}
          style={[styles.dirBtn, direction === "latn-to-cyrl" && styles.dirBtnSelected]}
        >
          <Text style={[styles.dirBtnText, direction === "latn-to-cyrl" && styles.dirBtnTextSelected]}>
            Latin → Cyrillic
          </Text>
        </Pressable>
      </View>
      {pairs.map((pair, i) => (
        <View key={i} style={styles.pairRow}>
          <TextInput
            style={[styles.fieldInput, styles.pairInput]}
            value={pair.cyrillic}
            onChangeText={(v) => {
              const updated = [...pairs];
              updated[i] = { ...updated[i]!, cyrillic: v };
              setPairs(updated);
              update({ pairs: updated });
            }}
            placeholder="Cyrillic"
            placeholderTextColor="#4a4a70"
          />
          <Text style={styles.pairSep}>|</Text>
          <TextInput
            style={[styles.fieldInput, styles.pairInput]}
            value={pair.transliteration}
            onChangeText={(v) => {
              const updated = [...pairs];
              updated[i] = { ...updated[i]!, transliteration: v };
              setPairs(updated);
              update({ pairs: updated });
            }}
            placeholder="Transliteration"
            placeholderTextColor="#4a4a70"
          />
        </View>
      ))}
    </>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function AddExerciseScreen() {
  const router = useRouter();
  const { reloadCustomExercises } = useCustomExercises();

  const [taskType, setTaskType] = useState<TaskTypeOption>("multiple-choice");
  const [selectedUnitId, setSelectedUnitId] = useState(bundles[0]?.unit.id ?? "");
  const [partialTask, setPartialTask] = useState<Partial<TaskDefinition>>({});
  const [savedMsg, setSavedMsg] = useState("");

  async function handleSave() {
    // Basic validation
    if (!selectedUnitId) {
      Alert.alert("Error", "Please select a unit.");
      return;
    }

    const task: TaskDefinition = {
      id: `custom-${taskType}-${Date.now()}`,
      kind: taskType,
      objective: "Custom exercise",
      instructions: "Complete the exercise.",
      successCriteria: ["Complete the exercise."],
      ...partialTask,
    } as TaskDefinition;

    try {
      const raw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
      const entries: CustomExerciseEntry[] = raw ? (JSON.parse(raw) as CustomExerciseEntry[]) : [];
      entries.push({ unitId: selectedUnitId, task });
      await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(entries));
      await reloadCustomExercises();
      setSavedMsg("Exercise saved! ✓");
      setTimeout(() => setSavedMsg(""), 2500);
    } catch {
      Alert.alert("Error", "Failed to save exercise.");
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add Exercise</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Task type selector */}
        <Text style={styles.sectionLabel}>Task Type</Text>
        <View style={styles.typeRow}>
          {TASK_TYPES.map((t) => (
            <TaskTypeButton
              key={t}
              label={t.replace(/-/g, " ")}
              selected={taskType === t}
              onPress={() => setTaskType(t)}
            />
          ))}
        </View>

        {/* Unit selector */}
        <Text style={styles.sectionLabel}>Unit</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
          <View style={styles.unitRow}>
            {bundles.map((b) => (
              <Pressable
                key={b.unit.id}
                onPress={() => setSelectedUnitId(b.unit.id)}
                style={[styles.unitChip, selectedUnitId === b.unit.id && styles.unitChipSelected]}
                accessibilityRole="button"
              >
                <Text style={[styles.unitChipText, selectedUnitId === b.unit.id && styles.unitChipTextSelected]}>
                  {b.unit.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Dynamic form */}
        <Text style={styles.sectionLabel}>Exercise Details</Text>
        {taskType === "multiple-choice" ? (
          <MultipleChoiceForm onChange={(t) => setPartialTask(t as Partial<TaskDefinition>)} />
        ) : taskType === "fill-in-blank" ? (
          <FillInBlankForm onChange={(t) => setPartialTask(t as Partial<TaskDefinition>)} />
        ) : (
          <ScriptMatchForm onChange={(t) => setPartialTask(t as Partial<TaskDefinition>)} />
        )}

        {/* Save */}
        {savedMsg ? (
          <View style={styles.successMsg}>
            <Text style={styles.successMsgText}>{savedMsg}</Text>
          </View>
        ) : null}

        <Pressable onPress={handleSave} style={styles.saveBtn} accessibilityRole="button">
          <Text style={styles.saveBtnText}>Save Exercise</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  backBtn: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 20,
    color: "#9090c0",
    lineHeight: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e0e0f0",
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 60,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#4a4a70",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginTop: 8,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
  },
  typeBtnSelected: {
    backgroundColor: "rgba(99,102,241,0.2)",
    borderColor: "rgba(99,102,241,0.5)",
  },
  typeBtnText: {
    fontSize: 13,
    color: "#9090c0",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  typeBtnTextSelected: {
    color: "#a5b4fc",
  },
  unitScroll: {
    flexGrow: 0,
  },
  unitRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
  },
  unitChipSelected: {
    backgroundColor: "rgba(99,102,241,0.2)",
    borderColor: "rgba(99,102,241,0.5)",
  },
  unitChipText: {
    fontSize: 12,
    color: "#9090c0",
    fontWeight: "600",
  },
  unitChipTextSelected: {
    color: "#a5b4fc",
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#6060a0",
    fontWeight: "600",
  },
  fieldInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 10,
    color: "#e0e0f0",
    fontSize: 14,
  },
  fieldInputMulti: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioBtnSelected: {
    borderColor: "#6366f1",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6366f1",
  },
  choiceInput: {
    flex: 1,
  },
  hint: {
    fontSize: 11,
    color: "#4a4a70",
    fontStyle: "italic",
  },
  directionRow: {
    flexDirection: "row",
    gap: 8,
  },
  dirBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    alignItems: "center",
  },
  dirBtnSelected: {
    backgroundColor: "rgba(99,102,241,0.2)",
    borderColor: "rgba(99,102,241,0.5)",
  },
  dirBtnText: {
    fontSize: 12,
    color: "#9090c0",
    fontWeight: "600",
  },
  dirBtnTextSelected: {
    color: "#a5b4fc",
  },
  pairRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pairInput: {
    flex: 1,
  },
  pairSep: {
    color: "#4a4a70",
    fontSize: 18,
    fontWeight: "300",
  },
  saveBtn: {
    height: 52,
    backgroundColor: "#6366f1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#6366f1",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  successMsg: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  successMsgText: {
    color: "#34d399",
    fontWeight: "600",
    fontSize: 14,
  },
});
