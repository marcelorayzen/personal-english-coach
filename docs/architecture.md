# Architecture

## Overview

Personal English Coach is implemented as a **TypeScript monorepo** and a **modular monolith**.

This style is the official baseline because the project is:

- single-user per installation
- self-hosted/local-first
- domain-rich
- documentation-driven
- not designed for distributed scale in the MVP

## Architectural style

### Chosen
- monorepo
- modular monolith

### Explicitly rejected for this stage
- microservices
- distributed event-driven architecture
- multiple independent backends
- premature domain split into separate deployables

## System layers

### Web app
The web application is the learner-facing interface for:

- conversation
- reading mode
- review mode
- progress view
- settings

### API app
The backend coordinates:

- conversation turns
- provider abstractions
- persistence
- learner state derivation
- review queue generation
- progress aggregation

### Shared packages
- `packages/types`: shared contracts
- `packages/prompts`: prompt contracts and templates
- `packages/core`: framework-agnostic domain helpers
- `packages/config`: app metadata and runtime config helpers

## Official backend modules

### CoachModule
Responsible for turn orchestration, coach response generation, and per-turn pedagogical payloads.

### VoiceModule
Responsible for speech-to-text, text-to-speech, and provider abstractions.

### SessionModule
Responsible for session lifecycle, session history, and session-level summaries.

### LearnerMemoryModule
Responsible for learner profile, learner state, snapshots, recurring issues, and structured memory.

### ReviewModule
Responsible for review queue, drills, and reintroduction of weak items.

### ReadingModule
Responsible for reading aloud sessions, target text comparison, and reading feedback records.

### ProgressModule
Responsible for progress summaries, trends, and higher-level aggregates.

### ConfigModule
Responsible for preferences and user-configurable pedagogical behavior.

### HealthModule
Responsible for technical health and readiness endpoints.

## Data architecture

The source of learning continuity is **structured learner state**, not raw chat history.

Main persisted concepts:

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

## Memory rule

The model should not depend on the full raw history as its primary context.

Instead, the main context should be derived from:

- immediate session context
- learner profile
- learner state summary
- current focus
- review priorities
- recent relevant mistakes

## Voice persistence rule

In the MVP, the system persists:

- learner transcription
- coach text response
- session and utterance metadata

Raw audio is **not** part of default MVP persistence.

## Frontend routes

Planned MVP routes:

- `/`
- `/conversation`
- `/reading`
- `/review`
- `/progress`
- `/settings`

## Implementation phases

1. Foundation
2. Core Conversation
3. Learner Memory
4. Review
5. Reading
6. Progress
7. Polish
