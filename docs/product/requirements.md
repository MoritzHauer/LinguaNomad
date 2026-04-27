# LinguaNomad MVP Requirements

## Scope Statement

The first release should prove that LinguaNomad can deliver a high-quality Kyrgyz learning loop on mobile without depending on constant connectivity.

## Primary User Journey

1. A learner installs the mobile app.
2. The learner chooses or is assigned the Kyrgyz starter path.
3. The learner completes an onboarding sequence that introduces the script, pronunciation basics, and the structure of the course.
4. The learner studies a short lesson built around a concrete communication goal.
5. The learner completes a review queue generated from the lesson.
6. The learner performs a task that requires comprehension and guided production.
7. The learner exits, comes back later, and can continue offline.
8. The learner reconnects and progress syncs safely.

## Functional Requirements

### Learning Experience

- The app must provide a starter Kyrgyz course with structured units.
- Each unit must include lesson content, reviewable items, and at least one task-based activity.
- The app must support Cyrillic text and transliteration metadata.
- The app must support grammar and pronunciation notes attached to content items.

### Review And Progression

- The app must schedule review items based on learner performance.
- The learner must be able to complete reviews offline.
- Lesson unlocks and progress state must survive app restarts and offline sessions.

### Offline And Sync

- The learner must be able to download a starter content pack.
- Core study and review flows must work without network access.
- Sync must reconcile learner progress when connectivity returns.

### Content Governance

- Every public content source must record license status and attribution requirements.
- Non-redistributable prototype content must remain outside the public repository and release assets.
- Content must be representable in a reusable schema that supports lessons, reviews, and tasks.

## Non-Functional Requirements

- The app should feel usable on low-bandwidth or intermittent connections.
- The content model should be reusable for future languages.
- The architecture should avoid unnecessary backend coupling.
- The codebase should be organized for open-source contributors.

## MVP Exclusions

- Multi-language parity
- Social features
- Speech scoring
- AI conversation tutor
- Heavy gamification systems

## Acceptance Criteria

The MVP baseline is complete when:
- The repository contains a mobile app scaffold and shared package structure.
- The repository contains product, architecture, and content-policy docs.
- The repository defines a content schema direction and source manifest format.
- The repository can host at least one starter unit and its review data.
- The mobile app can represent the lesson, review, and task loop for offline use.