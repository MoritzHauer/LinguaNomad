# ADR-001: Monorepo Structure with pnpm Workspaces

**Status:** Accepted  
**Date:** 2026-04-30  
**Author:** LinguaNomad core team

---

## Context

LinguaNomad consists of at least two application surfaces (mobile learner app and a lightweight content-admin tool) and several shared logic domains (SRS scheduling, content schema, cross-cutting utilities). These surfaces need to share TypeScript types and business logic without publishing packages to a registry during early development.

Key forces:

- **Shared domain logic** must be importable in both `apps/mobile` and `apps/content-admin` with a single source of truth.
- **TypeScript types** for content schema must be co-located with the validation and transformation logic so they cannot drift apart.
- **Contributor onboarding** should require one `pnpm install` from the root, not manual linking across separate repos.
- **CI and build tooling** should be able to test and type-check packages in dependency order.
- **Open-source governance** is simpler with a single repository: one issue tracker, one PR flow, one license file, one contributor agreement.

Alternatives considered:

| Option | Problem |
|--------|---------|
| Separate repositories per app/package | Cross-package type changes require coordinated PRs; sharing types needs npm publishing even for pre-alpha work. |
| Single flat package (no workspace) | Impossible to enforce domain boundaries; schema and SRS logic would be entangled with app code. |
| Yarn workspaces / Turborepo | Viable, but pnpm provides strict dependency isolation by default (phantom dependency prevention), performant caching, and simpler configuration for a small team. |
| Nx monorepo | More powerful, but introduces significant configuration overhead that is not warranted at MVP scale. |

---

## Decision

LinguaNomad uses a **pnpm workspace monorepo** with the following layout:

```text
apps/
  mobile/          ← Expo/React Native learner app
  content-admin/   ← Editorial and QA tooling
packages/
  content-schema/  ← Canonical content types and validators
  srs/             ← On-device SRS scheduling logic
  shared/          ← Cross-cutting types, utilities, helpers
docs/
  product/
  architecture/
  content/
```

`pnpm-workspace.yaml` declares `apps/*` and `packages/*` as workspace members. Inter-package dependencies use the `workspace:*` protocol so versions always resolve locally during development.

---

## Consequences

**Positive:**

- One `pnpm install` wires the entire repo; contributors do not manage symlinks or package publishing.
- `packages/content-schema` is the single authoritative location for content types; any change is immediately visible to all consumers.
- `packages/srs` can be unit-tested in isolation without spinning up a device emulator.
- TypeScript project references or a simple `tsc --build` pass can enforce package-level compilation order.
- Easier to add a web surface later (`apps/web`) with zero restructuring.

**Negative / Trade-offs:**

- All contributors must have pnpm installed (minor friction for npm-only contributors).
- As the repo grows, a build orchestration layer (e.g. Turborepo) may be needed to cache incremental builds; this is a deferred concern.
- A monorepo merge queue may need attention if multiple teams contribute simultaneously, but this is not a near-term risk at MVP scale.
