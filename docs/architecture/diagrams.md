# LinguaNomad Architecture Diagrams

This document contains Mermaid diagrams across five views of the LinguaNomad system.

---

## 1. System Context Diagram (C4 Level 1)

Who uses the system and what external systems does it depend on?

```mermaid
C4Context
    title LinguaNomad – System Context

    Person(learner, "Learner", "A motivated language learner studying Kyrgyz on their phone.")

    System(mobile, "LinguaNomad Mobile App", "Delivers structured lessons, spaced-retrieval review, and task-based practice. Works fully offline.")

    System_Ext(supabase, "Supabase Backend", "Handles authentication, cloud backup of learner progress, content-pack metadata, and remote configuration.")

    System_Ext(cdn, "Content Pack CDN", "Hosts downloadable content packs (JSON bundles) distributed to learners.")

    Rel(learner, mobile, "Studies lessons, reviews vocabulary, completes tasks")
    Rel(mobile, supabase, "Authenticates, syncs progress, fetches remote config", "HTTPS / REST + Realtime")
    Rel(mobile, cdn, "Downloads content packs", "HTTPS")
```

---

## 2. Container Diagram (C4 Level 2)

Major containers inside the mobile app and how they connect to the backend.

```mermaid
C4Container
    title LinguaNomad – Container Diagram

    Person(learner, "Learner")

    Container_Boundary(app, "LinguaNomad Mobile App (Expo / React Native)") {
        Container(ui, "Lesson & Review UI", "React Native / Expo Router", "Screens for lessons, review queues, tasks, and progress. Reads from and writes to local SQLite.")
        Container(srs, "packages/srs", "TypeScript", "On-device SRS scheduling logic. Computes next review dates from performance history. Runs fully offline.")
        Container(schema, "packages/content-schema", "TypeScript", "Canonical TypeScript types for Lexeme, SentenceCard, GrammarNote, TaskDefinition, UnitDefinition, ReviewItem, and source metadata.")
        Container(sqlite, "Local SQLite DB", "Expo SQLite", "Persists content packs, learner progress, review history, and pending sync queue.")
        Container(sync, "Sync Orchestrator", "TypeScript", "Queues local changes, detects connectivity, pushes deltas to Supabase, resolves conflicts deterministically.")
    }

    Container_Boundary(backend, "Supabase Backend") {
        Container(auth, "Auth", "Supabase Auth", "JWT-based authentication.")
        Container(db, "Postgres DB", "Supabase Postgres", "Stores user accounts, cloud progress snapshots, content-pack metadata.")
        Container(storage, "File Storage", "Supabase Storage / CDN", "Hosts downloadable content pack bundles.")
    }

    Rel(learner, ui, "Interacts with")
    Rel(ui, srs, "Requests next review schedule")
    Rel(ui, sqlite, "Reads/writes content and progress")
    Rel(srs, sqlite, "Reads review history, writes review items")
    Rel(ui, sync, "Triggers sync on reconnect")
    Rel(sync, sqlite, "Reads pending queue, updates sync state")
    Rel(sync, auth, "Authenticates requests", "HTTPS")
    Rel(sync, db, "Pushes/pulls progress deltas", "HTTPS / REST")
    Rel(ui, storage, "Downloads content packs", "HTTPS")
    Rel(schema, ui, "Type contracts (compile-time)")
    Rel(schema, srs, "Type contracts (compile-time)")
```

---

## 3. Data Flow: Content Pack → Lesson → SRS → Sync

End-to-end journey of content from CDN download to reviewed and synced progress.

```mermaid
sequenceDiagram
    participant CDN as Content Pack CDN
    participant App as Mobile App
    participant SQLite as Local SQLite
    participant SRS as packages/srs
    participant Queue as Sync Queue (SQLite)
    participant Supabase as Supabase Backend

    Note over App,CDN: Content download (requires connectivity)
    App->>CDN: GET /packs/ky-starter.json
    CDN-->>App: Content pack bundle (units, lexemes, sentences, tasks)
    App->>SQLite: Persist content pack rows

    Note over App,SRS: Lesson flow (fully offline)
    App->>SQLite: Load unit + lesson items
    SQLite-->>App: Lexemes, SentenceCards, GrammarNotes, TaskDefinitions
    App->>App: Learner studies lesson
    App->>SRS: recordPerformance(itemId, grade)
    SRS->>SRS: Compute nextReviewAt (SM-2 / FSRS)
    SRS->>SQLite: Write ReviewItem (due date, interval, ease)

    Note over App,Queue: Review session (fully offline)
    App->>SQLite: Fetch due ReviewItems
    SQLite-->>App: Due items
    App->>App: Learner completes reviews
    App->>SRS: recordPerformance(itemId, grade) per item
    SRS->>SQLite: Update ReviewItem state
    App->>Queue: Append progress delta to sync queue

    Note over Queue,Supabase: Sync on reconnect
    App->>App: Connectivity detected
    App->>Queue: Read pending deltas
    Queue-->>App: Pending progress records
    App->>Supabase: POST /sync (progress batch)
    Supabase-->>App: Accepted / conflict report
    App->>Queue: Mark deltas flushed
    App->>SQLite: Apply any server-side corrections
```

---

## 4. Offline-First State Machine

The app transitions between online, offline, and syncing states.

```mermaid
stateDiagram-v2
    [*] --> Offline : App launch (no connectivity)
    [*] --> Online : App launch (connectivity available)

    Online --> Offline : Connectivity lost
    Offline --> Syncing : Connectivity restored AND pending queue non-empty
    Online --> Syncing : Sync triggered (foreground or background)

    Syncing --> Online : Sync complete (queue flushed)
    Syncing --> Offline : Connectivity lost during sync\n(partial flush retained in queue)
    Syncing --> Online : Sync failed (server error)\n(retry scheduled, queue retained)

    state Online {
        [*] --> Idle
        Idle --> Downloading : Learner requests content pack
        Downloading --> Idle : Pack stored in SQLite
        Idle --> Studying : Learner opens lesson
        Studying --> Idle : Lesson complete\n(progress written to SQLite + queue)
        Idle --> Reviewing : Review queue non-empty, learner opens review
        Reviewing --> Idle : Review session complete\n(ReviewItems updated + queue appended)
    }

    state Offline {
        [*] --> OfflineStudying : Learner opens lesson
        OfflineStudying --> [*] : Lesson complete\n(progress written to SQLite + queue)
        [*] --> OfflineReviewing : Learner opens review
        OfflineReviewing --> [*] : Review complete\n(ReviewItems updated + queue appended)
    }

    note right of Syncing
        Conflict resolution is deterministic:
        server timestamp wins for progress records;
        local review items are never discarded.
    end note
```

---

## 5. Content Model ER Diagram

Relationships between the core content and review entities in `packages/content-schema`.

```mermaid
erDiagram
    SourceRecord {
        string id PK
        string name
        string url
        string licenseSummary
        boolean committable
        boolean packagable
        string status
    }

    UnitDefinition {
        string id PK
        string slug
        string languageCode
        string title
        string communicationGoal
    }

    Lexeme {
        string id PK
        string languageCode
        string form
        string transliteration
        string gloss
        string partOfSpeech
        string proficiency
    }

    SentenceCard {
        string id PK
        string languageCode
        string kyrgyz
        string transliteration
        string translation
        string proficiency
    }

    GrammarNote {
        string id PK
        string languageCode
        string title
        string explanation
        string proficiency
    }

    TaskDefinition {
        string id PK
        string languageCode
        string kind
        string title
    }

    ReviewItem {
        string id PK
        string learnerId
        string contentId
        string contentType
        float easeFactor
        int intervalDays
        datetime nextReviewAt
        int grade
    }

    UnitDefinition ||--o{ Lexeme : "includes"
    UnitDefinition ||--o{ SentenceCard : "includes"
    UnitDefinition ||--o{ GrammarNote : "includes"
    UnitDefinition ||--o{ TaskDefinition : "includes"

    Lexeme ||--o{ ReviewItem : "generates"
    SentenceCard ||--o{ ReviewItem : "generates"

    SentenceCard }o--o{ Lexeme : "references"
    TaskDefinition }o--o{ Lexeme : "draws from phrase bank"
    TaskDefinition }o--o{ SentenceCard : "draws from phrase bank"
    GrammarNote }o--o{ SentenceCard : "illustrates with"

    SourceRecord ||--o{ UnitDefinition : "attribution chain"
```
