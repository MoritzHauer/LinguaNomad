# Adding Exercise Types

This guide walks through adding a brand new exercise type end to end, from the TypeScript type all the way to the rendered React Native component.

We'll use a hypothetical `"word-order"` exercise as the running example — the learner sees shuffled words and must arrange them in the correct order.

---

## Overview: how exercise types work

The exercise system has four layers:

| Layer | File | Responsibility |
|---|---|---|
| **Type definition** | `packages/content-schema/src/index.ts` | Describes the JSON shape of the exercise |
| **Content JSON** | `content/languages/<lang>/tasks/<slug>.tasks.json` | Stores the actual exercise data |
| **Dispatch** | `apps/mobile/app/task/[unitId].tsx` | Checks `task.kind` and renders the right component |
| **Component** | `apps/mobile/src/components/<Name>Task.tsx` | The actual UI for the exercise |

---

## Step 1 — Add the TypeScript type

Open `packages/content-schema/src/index.ts`.

### 1a. Add the new kind to `TaskKind`

```ts
export type TaskKind =
  | "guided-dialogue-completion"
  | "register-choice"
  | "pattern-swap"
  | "information-gap"
  | "script-to-meaning"
  | "noticing"
  | "mini-role"
  | "multiple-choice"
  | "fill-in-blank"
  | "script-match"
  | "word-order";        // ← add your new kind here
```

### 1b. Create the new task definition interface

Add it after the existing task definition interfaces:

```ts
export interface WordOrderTaskDefinition extends BaseTaskDefinition {
  kind: "word-order";
  /** The words in the correct order — the learner must reproduce this. */
  correctSequence: string[];
  /** Optional English hint below the word chips. */
  translationHint?: string;
}
```

### 1c. Add it to the `TaskDefinition` union

```ts
export type TaskDefinition =
  | GuidedDialogueCompletionTaskDefinition
  | RegisterChoiceTaskDefinition
  | PatternSwapTaskDefinition
  | InformationGapTaskDefinition
  | ScriptToMeaningTaskDefinition
  | NoticingTaskDefinition
  | MiniRoleTaskDefinition
  | MultipleChoiceTaskDefinition
  | FillInBlankTaskDefinition
  | ScriptMatchTaskDefinition
  | WordOrderTaskDefinition;   // ← add here
```

---

## Step 2 — Create content JSON

Add a `word-order` task to one of the task JSON files (or a new task file for a new unit):

```jsonc
// content/languages/ky/tasks/greetings-and-introductions.tasks.json
{
  "version": 1,
  "languageCode": "ky",
  "items": [
    {
      "id": "ky-task-greetings-word-order-01",
      "kind": "word-order",
      "objective": "Build a greeting sentence",
      "instructions": "Arrange the words to form the correct greeting sentence.",
      "successCriteria": ["Words placed in the correct order"],
      "correctSequence": ["Саламатсызбы", ",", "менин", "атым", "Айгүл"],
      "translationHint": "Hello, my name is Aigul."
    }
  ]
}
```

Add the task's ID to the relevant unit's `taskIds` array in its `.unit.json`.

---

## Step 3 — Create the React Native component

Create `apps/mobile/src/components/WordOrderTask.tsx`:

```tsx
import type { WordOrderTaskDefinition } from "@linguanomad/content-schema";
import React, { useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  task: WordOrderTaskDefinition;
  onComplete: (allCorrect: boolean) => void;
}

export function WordOrderTask({ task, onComplete }: Props) {
  // Shuffled bank of words the learner can tap
  const shuffled = useMemo(
    () => [...task.correctSequence].sort(() => Math.random() - 0.5),
    [task.correctSequence]
  );

  const [placed, setPlaced] = useState<string[]>([]);
  const [bank, setBank] = useState(shuffled);
  const [checked, setChecked] = useState(false);

  const isComplete = placed.length === task.correctSequence.length;
  const isCorrect = placed.join(" ") === task.correctSequence.join(" ");

  function tapWord(word: string) {
    if (checked) return;
    setPlaced((p) => [...p, word]);
    setBank((b) => {
      const idx = b.indexOf(word);
      return [...b.slice(0, idx), ...b.slice(idx + 1)];
    });
  }

  function removeWord(index: number) {
    if (checked) return;
    const word = placed[index];
    setPlaced((p) => p.filter((_, i) => i !== index));
    setBank((b) => [...b, word]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>{task.instructions}</Text>

      {/* Answer row */}
      <View style={styles.answerRow}>
        {placed.map((word, i) => (
          <Pressable key={i} style={styles.placedChip} onPress={() => removeWord(i)}>
            <Text style={styles.chipText}>{word}</Text>
          </Pressable>
        ))}
        {placed.length === 0 && (
          <Text style={styles.placeholder}>Tap words below …</Text>
        )}
      </View>

      {task.translationHint ? (
        <Text style={styles.hint}>{task.translationHint}</Text>
      ) : null}

      {/* Word bank */}
      <View style={styles.bank}>
        {bank.map((word, i) => (
          <Pressable key={i} style={styles.bankChip} onPress={() => tapWord(word)}>
            <Text style={styles.chipText}>{word}</Text>
          </Pressable>
        ))}
      </View>

      {/* Result feedback */}
      {checked && (
        <Text style={isCorrect ? styles.correct : styles.incorrect}>
          {isCorrect ? "✓ Correct!" : `✗ Expected: ${task.correctSequence.join(" ")}`}
        </Text>
      )}

      {/* Check / Continue */}
      <Pressable
        style={[styles.btn, !isComplete && styles.btnDisabled]}
        disabled={!isComplete}
        onPress={() => {
          if (!checked) {
            setChecked(true);
          } else {
            onComplete(isCorrect);
          }
        }}
      >
        <Text style={styles.btnText}>
          {checked ? "Continue →" : "Check"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  instructions: { fontSize: 14, color: "#9090c0" },
  answerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    minHeight: 48,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 8,
  },
  placeholder: { fontSize: 13, color: "#4a4a70", alignSelf: "center" },
  hint: { fontSize: 13, color: "#6060a0", fontStyle: "italic" },
  bank: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  placedChip: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bankChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 15, color: "#e0e0f0", fontWeight: "600" },
  correct: { fontSize: 14, color: "#34d399", fontWeight: "600" },
  incorrect: { fontSize: 14, color: "#f87171", fontWeight: "600" },
  btn: {
    height: 52,
    backgroundColor: "#6366f1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { backgroundColor: "rgba(255,255,255,0.06)" },
  btnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
```

---

## Step 4 — Wire up the component in the task screen

Open `apps/mobile/app/task/[unitId].tsx`.

### 4a. Add the import for the new type

```ts
import type {
  // ... existing imports ...
  WordOrderTaskDefinition,   // ← add this
} from "@linguanomad/content-schema";
```

### 4b. Import the new component

```ts
import { WordOrderTask } from "../../src/components/WordOrderTask";
```

### 4c. Add a branch in `renderTask`

In the `renderTask` function, add a new `if` block **before** the `FallbackTask` return:

```ts
function renderTask(t: TaskDefinition) {
  // ... existing if blocks ...

  if (t.kind === "word-order") {
    return (
      <WordOrderTask
        key={t.id}
        task={t as WordOrderTaskDefinition}
        onComplete={(correct) => handleTaskComplete(correct)}
      />
    );
  }

  return <FallbackTask key={t.id} task={t} onComplete={handleTaskComplete} />;
}
```

### 4d. Update `getTaskKindLabel` in `course-data.ts`

Open `apps/mobile/lib/course-data.ts` and add the new kind to the `getTaskKindLabel` switch statement:

```ts
export function getTaskKindLabel(kind: TaskDefinition["kind"]): string {
  switch (kind) {
    // ... existing cases ...
    case "word-order":
      return "Word Order";
    default:
      return assertNever(kind);   // TypeScript will catch missing cases at compile time
  }
}
```

The `assertNever` call means TypeScript will give you a compile error if you add a new `TaskKind` but forget to handle it here. This acts as a safety net across the codebase.

---

## Step 5 — Run tests

```bash
pnpm test
```

---

## Existing exercise types reference

| `kind` | Interface | What the learner does |
|---|---|---|
| `guided-dialogue-completion` | `GuidedDialogueCompletionTaskDefinition` | Fill blank slots in a dialogue by choosing from given options |
| `register-choice` | `RegisterChoiceTaskDefinition` | Choose the contextually appropriate register (formal/informal/etc.) |
| `pattern-swap` | `PatternSwapTaskDefinition` | Substitute words into a sentence pattern |
| `information-gap` | `InformationGapTaskDefinition` | Two-party task — learner has information the partner needs |
| `script-to-meaning` | `ScriptToMeaningTaskDefinition` | Match Cyrillic script items to their meanings |
| `noticing` | `NoticingTaskDefinition` | Identify the grammatically notable element in a set of sentences |
| `mini-role` | `MiniRoleTaskDefinition` | Open-ended role play with a phrase bank |
| `multiple-choice` | `MultipleChoiceTaskDefinition` | Standard single-answer multiple choice |
| `fill-in-blank` | `FillInBlankTaskDefinition` | Type or select the missing word in a sentence template |
| `script-match` | `ScriptMatchTaskDefinition` | Match Cyrillic words to their transliterations (or vice versa) |

All interfaces extend `BaseTaskDefinition`, which provides: `id`, `kind`, `objective`, `instructions`, `successCriteria`, `sourceIds`, `lexemeIds`, `sentenceIds`, `grammarNoteIds`, `completionHint`, `supportCards`.
