# Adding App Screens

This guide explains how to add new pages / screens to the mobile app.

---

## How routing works

The app uses [Expo Router](https://expo.github.io/router/), which maps files in `apps/mobile/app/` to routes. The mapping is automatic — you create a file and the route exists.

```
app/index.tsx              →  /
app/course.tsx             →  /course
app/progress.tsx           →  /progress
app/lesson/[unitId].tsx    →  /lesson/:unitId   (dynamic segment)
app/review/[unitId].tsx    →  /review/:unitId
app/task/[unitId].tsx      →  /task/:unitId
app/_layout.tsx            →  root layout (wraps everything)
app/admin/_layout.tsx      →  admin section layout
app/admin/add-exercise.tsx →  /admin/add-exercise
```

### Key rules

- Files named `_layout.tsx` are layout wrappers, not screens themselves.
- Files with `[param]` in the name create dynamic routes — use `useLocalSearchParams<{ param: string }>()` to read the value.
- Nested folders create nested routes.
- The root `_layout.tsx` wraps the entire app (safe area, navigation stack, providers).

---

## Adding a static page

### Example: add a `/about` screen

**1. Create the file**

```tsx
// apps/mobile/app/about.tsx
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>‹ Back</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>About LinguaNomad</Text>
        <Text style={styles.body}>
          An open-source app for adventurous language learners.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f0f1a" },
  backBtn: { padding: 16 },
  backBtnText: { fontSize: 16, color: "#818cf8", fontWeight: "600" },
  content: { padding: 24, gap: 16 },
  heading: { fontSize: 24, fontWeight: "700", color: "#ffffff" },
  body: { fontSize: 16, color: "#c8c8e8", lineHeight: 24 },
});
```

**2. Link to it from another screen**

```tsx
import { useRouter } from "expo-router";

const router = useRouter();

// Anywhere in JSX:
<Pressable onPress={() => router.push("/about")}>
  <Text>About</Text>
</Pressable>
```

That's it. The route `/about` is live.

---

## Adding a dynamic page

Dynamic pages take a URL parameter. Use `[param]` in the filename.

### Example: add a `/grammar/[noteId]` detail screen

**1. Create the file**

```tsx
// apps/mobile/app/grammar/[noteId].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCourseBundles } from "../../lib/course-data";

export default function GrammarNoteScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Find the grammar note across all bundles
  const note = getCourseBundles()
    .flatMap((b) => b.grammarNotes)
    .find((n) => n.id === noteId);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>‹ Back</Text>
      </Pressable>
      {note ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>{note.title}</Text>
          <Text style={styles.body}>{note.summary}</Text>
        </ScrollView>
      ) : (
        <Text style={styles.error}>Grammar note not found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f0f1a" },
  backBtn: { padding: 16 },
  backBtnText: { fontSize: 16, color: "#818cf8", fontWeight: "600" },
  content: { padding: 24, gap: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: "#ffffff" },
  body: { fontSize: 15, color: "#c8c8e8", lineHeight: 24 },
  error: { fontSize: 16, color: "#9090c0", margin: 24 },
});
```

**2. Navigate to it**

```tsx
router.push(`/grammar/${noteId}`);
```

---

## Adding a section with its own layout

If you need a group of screens that share a common layout (header, tab bar, etc.), create a subfolder with a `_layout.tsx`.

### Example: add a `/vocab/` section

```
app/vocab/
├── _layout.tsx       ← layout wrapper for all vocab screens
├── index.tsx         ← /vocab  (vocabulary list)
└── [lexemeId].tsx    ← /vocab/:lexemeId  (word detail)
```

`_layout.tsx` uses a `<Stack>` or `<Tabs>` navigator from Expo Router:

```tsx
// apps/mobile/app/vocab/_layout.tsx
import { Stack } from "expo-router";

export default function VocabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
```

---

## Passing data between screens

Expo Router is URL-based. Pass simple values as path or query parameters:

```tsx
// Navigate with a query param
router.push(`/vocab?filter=food`);

// Read it in the target screen
const { filter } = useLocalSearchParams<{ filter?: string }>();
```

For complex state (e.g. a partially completed lesson run), use React Context. The app already provides two contexts:
- `useLearnerProgress()` — `apps/mobile/lib/learner-progress.tsx`
- `useCustomExercises()` — `apps/mobile/lib/custom-exercises.tsx`

Add your own context provider in a new file under `apps/mobile/lib/` and register it in `app/_layout.tsx`.

---

## Theming

Colors are in `apps/mobile/src/theme/colors.ts` and typography in `apps/mobile/src/theme/typography.ts`. Use these instead of hardcoding hex values in component styles.

The app's background is `#0f0f1a` (dark navy). Primary accent is `#6366f1` (indigo). Text is `#e0e0f0` (light) and `#9090c0` (muted).

---

## Checklist

When adding a new screen:

- [ ] File created at the correct path in `apps/mobile/app/`
- [ ] Default export is a React component function
- [ ] Uses `useSafeAreaInsets()` and applies `paddingTop: insets.top` at minimum
- [ ] Back navigation handled with `useRouter().back()` or `router.push('/')`
- [ ] No hardcoded colors — use constants from `src/theme/colors.ts`
- [ ] Screen is accessible (buttons have `accessibilityRole` and `accessibilityLabel`)
