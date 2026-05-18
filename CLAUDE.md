# CLAUDE.md

This file is a normative operational guide for Claude, Codex, and humans working in this repository.

## Read this first

Before coding, read in this order:

1. `docs/specs/*.md`
2. `docs/decisions/*.md`
3. `docs/architecture.md`
4. `CLAUDE.md`
5. `docs/product/*.md`
6. `docs/api/*.md`
7. `docs/data/*.md`
8. `docs/tasks/*.md`

## Project identity

This repository implements **Personal English Coach**, a personal English tutor by voice with persistent pedagogical memory.

The coach persona is **Ray**.

The repository must remain neutral and reusable. Branding such as Rayzen may exist in presentation layers, but must not distort the architecture or domain language.

## What this project is

- a single-user learning system
- self-hosted/local-first
- a modular monolith
- voice-first with text as support and fallback
- documentation-driven and audit-friendly

## What this project is not

- not a SaaS
- not multi-tenant
- not a generic assistant
- not a broad LMS platform
- not a social product
- not a microservices architecture

## Non-negotiable implementation rules

- Do not invent architecture.
- Do not expand scope without documentation.
- Do not create entities outside the documentation.
- Do not create endpoints without a contract in `docs/api` and/or `docs/specs`.
- Do not hide auditable rules only in prompt text.
- Do not use raw conversation history as the main memory model.
- Implement the smallest correct solution.
- Update affected documentation when behavior or contracts change.

## Architectural baseline

- Monorepo with `pnpm workspace`
- Backend: `NestJS`
- Frontend: `Next.js`
- ORM: `Prisma`
- Database: `PostgreSQL`
- Local infrastructure: `Docker Compose`
- Architectural style: `modular monolith`

## Official backend domain boundaries

- `CoachModule`
- `VoiceModule`
- `SessionModule`
- `LearnerMemoryModule`
- `ReviewModule`
- `ReadingModule`
- `ProgressModule`
- `ConfigModule`
- `HealthModule`

Do not merge unrelated responsibilities into the same module.

## Domain truth

The system revolves around continuity of learning, not isolated chats.

The system must:

- remember recurring issues
- adapt correction intensity
- adjust PT-BR support level over time
- surface review priorities
- maintain auditable progress state

## Memory model

Main memory is structured learner state derived from:

- learner profile
- mistakes
- skill mastery
- learner snapshots
- review queue
- recent performance signals

Main memory is **not**:

- raw full chat history
- unstructured logs
- embeddings without pedagogical interpretation

## Model context rule

When generating a coach response, prefer:

- immediate session context
- summarized learner state
- current learning goal
- current focus or review priority

Do not send the entire interaction history as the primary context window.

## Pedagogical behavior

### PT-BR support

Use PT-BR as progressive support, not as the destination language.

- beginner: more PT-BR support
- intermediate: English-first with selective PT-BR support
- advanced: almost all English, PT-BR only when needed

### Correction policy

Per turn:

- correct at most 1 or 2 important points
- prioritize intelligibility and naturalness
- avoid overload
- encourage retry or guided repetition

### Adaptation policy

- repeated failure -> reduce complexity and raise support
- consistent success -> reduce support and open the conversation more
- repeated cross-session issue -> send to review queue

## Voice persistence policy

The MVP persists:

- learner transcription
- coach text response
- turn/session metadata

The MVP does **not** persist raw audio by default.

## Naming conventions

### Repository
- `personal-english-coach`

### Apps
- `apps/api`
- `apps/web`

### Packages
- `@personal-english-coach/types`
- `@personal-english-coach/prompts`
- `@personal-english-coach/core`
- `@personal-english-coach/config`

### Domain entities
- `LearnerProfile`
- `LearningSession`
- `Utterance`
- `Mistake`
- `SkillMastery`
- `VocabularyItem`
- `PronunciationTarget`
- `LearnerSnapshot`
- `ReviewQueueItem`
- `Preferences`

### Important fields
Always use:

- `ptBrSupportLevel`
- `correctionIntensity`
- `speakingConfidence`
- `readingConfidence`
- `currentFocus`
- `reviewPriorities`
- `preferredInteractionStyle`

Do not introduce alternative names unless a documented migration exists.

## Change discipline

If you need to change:

- main stack
- architectural style
- MVP scope
- central domain entities
- documentation precedence
- persistence strategy

then:

1. update the relevant normative docs
2. create or update an ADR
3. explain the change clearly in the PR

## Expected agent behavior

When asked to implement something:

1. locate the relevant spec
2. locate the relevant architecture and data docs
3. implement the smallest coherent slice
4. keep the module boundary clean
5. update docs if contracts changed
6. explicitly note any unresolved mismatch
