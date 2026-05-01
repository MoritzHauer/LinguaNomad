# LinguaNomad Risk Register

_Last updated: 2026-04-30_
_Format: ID · Description · Probability (H/M/L) · Impact (H/M/L) · Mitigation_

---

## Active Risks

### R-001 · Offline Sync Complexity
- **Description:** Offline-first sync (SQLite → Supabase with conflict resolution) is architecturally complex. It's easy to introduce bugs that silently lose learner progress, particularly around review schedule state and progress unlocks when a user studies on multiple devices or reinstalls.
- **Probability:** H
- **Impact:** H
- **Mitigation:**
  - Write the sync conflict resolution strategy as an ADR (US-039) _before_ any sync code is written
  - Start with a simple last-write-wins strategy; resist early premature optimization
  - Write integration tests for two-device merge scenarios using fixtures before implementation (US-018)
  - Keep sync queue events immutable and append-only — never mutate, only add
  - Validate sync in Sprint 3 before adding content packs download sync in Sprint 4
  - Monitor: dedicate one Sprint 3 review session to sync edge case walkthroughs

---

### R-002 · Kyrgyz Content Quality & Originality
- **Description:** Kyrgyz is an underrepresented language with limited high-quality, publicly licensable references. Relying on the Peace Corps manual as a primary reference creates licensing risk if verbatim content leaks into public assets. Additionally, outdated framing, inconsistent transliteration, and unverified vocabulary could produce pedagogically poor content.
- **Probability:** M
- **Impact:** H
- **Mitigation:**
  - Peace Corps manual registered as `committable: false`, `packagable: false` in source manifest (US-029) ✅
  - All public-facing content must be original LinguaNomad wording — editorial checklist enforced
  - CI validates content JSON but does not (and cannot) check originality — manual editorial gate required before units move to `done`
  - Keep extraction sheets and page-reference notes in a private repo separate from public repository
  - Establish at least one native-speaker or heritage-learner reviewer before Units 3–6 ship
  - Monitor: track each unit against editorial checklist in backlog status

---

### R-003 · Expo SDK Updates & React Native Compatibility
- **Description:** Expo SDK releases (currently on SDK 52/53 trajectory) can introduce breaking changes in navigation (Expo Router), SQLite API, SecureStore, or background download APIs. A forced upgrade mid-sprint can stall delivery by several days.
- **Probability:** M
- **Impact:** M
- **Mitigation:**
  - Pin Expo SDK version in `package.json` (`"expo": "~52.0.0"`) and upgrade deliberately on a dedicated upgrade spike
  - Review Expo SDK release notes before each sprint for deprecation warnings
  - Write integration smoke tests for: SQLite init, SecureStore read/write, and navigation stacks — these catch SDK regressions fast
  - Keep `apps/mobile` isolated from `packages/` to limit blast radius of SDK changes
  - Monitor: check Expo's changelog at sprint boundaries

---

### R-004 · Third-Party Content Licensing
- **Description:** If any bundled content (audio clips, images, example dialogues, or word lists) is sourced from third parties without clearing licensing, LinguaNomad could face takedown demands or legal exposure when the app is published. This risk increases as the app approaches public release.
- **Probability:** L
- **Impact:** H
- **Mitigation:**
  - Every content source must have a `SourceRecord` entry with explicit license status before any items from that source enter a production bundle (US-029) ✅
  - Audio assets are in-scope: no audio from unclear-license sources bundled in MVP
  - No content with status other than `original` or `cleared` may be marked `packagable: true`
  - When in doubt: author original content rather than adapting from an unclear source
  - Before app store submission: run a full content audit against source manifest

---

### R-005 · SRS Algorithm Accuracy for Kyrgyz Vocabulary
- **Description:** The SM-2 algorithm is well-validated for vocabulary recall in general but may produce suboptimal intervals for Kyrgyz-specific items like case suffixes, vowel harmony patterns, and morphologically complex forms. Learners may find certain review items too easy or too hard due to interference between similar forms.
- **Probability:** M
- **Impact:** M
- **Mitigation:**
  - Ship SM-2 as the baseline (US-020) ✅ — it's good enough for MVP and well-understood
  - Track quality ratings per item type (lexeme vs. sentence vs. grammar form) in review history
  - After 2 sprints of real use: analyze if grammar-form items have systematically different recall curves
  - Reserve `packages/srs` as an isolated package so the algorithm can be swapped or parameterized without app-level changes (US-020) ✅
  - Do not add "streak bonuses" or gamified modifiers that mask SRS accuracy in MVP
  - Monitor: review rating distribution per item type in Sprint 4 retrospective

---

### R-006 · Scope Creep — Feature Requests Before Core Loop Ships
- **Description:** LinguaNomad has a rich vision (speech scoring, AI tutor, social features, multiple languages). Pressure to add features before the core offline learning loop is proven can fragment focus and delay the MVP.
- **Probability:** M
- **Impact:** M
- **Mitigation:**
  - Maintain strict MVP exclusion list from `requirements.md` — referenced in every sprint planning session
  - New feature ideas logged in a separate `docs/product/ideas.md` (not in backlog) until core loop ships
  - Sprint goals stay narrow: Sprint 2 = lesson loop, Sprint 3 = auth + sync
  - Moritz as product owner holds final call on any scope change during a sprint

---

### R-007 · Single-Contributor Bus Factor
- **Description:** If Moritz is the only active contributor, illness, time constraints, or context loss between sessions could stall the project significantly. Lack of documentation compounds this risk.
- **Probability:** M
- **Impact:** M
- **Mitigation:**
  - Keep ADRs and docs updated so context is recoverable (no "tribal knowledge" blockers)
  - Agent-driven development (this project!) accelerates solo progress — leverage agents for content generation, scaffolding, and docs
  - Prioritize working software over extensive tooling to avoid yak-shaving
  - Open-source structure with contributing guide ready for first external contributor by Sprint 4

---

## Risk Summary

| ID    | Risk                                    | P | I | Status  |
|-------|-----------------------------------------|---|---|---------|
| R-001 | Offline sync complexity                 | H | H | 🔴 Active |
| R-002 | Kyrgyz content quality & originality    | M | H | 🟡 Managed |
| R-003 | Expo SDK updates                        | M | M | 🟡 Managed |
| R-004 | Third-party content licensing           | L | H | 🟢 Low |
| R-005 | SRS algorithm accuracy for Kyrgyz       | M | M | 🟡 Managed |
| R-006 | Scope creep                             | M | M | 🟡 Managed |
| R-007 | Single-contributor bus factor           | M | M | 🟡 Managed |

### Top 3 Risks to Watch

1. **R-001 (Offline Sync)** — Highest combined severity. Write the ADR and integration test suite before touching sync code.
2. **R-002 (Content Quality)** — Most likely to silently degrade product quality. Native speaker review needed before Units 3–6.
3. **R-004 (Licensing)** — Low probability but high impact at publication time. Source manifest discipline is the only mitigation.
