# Personal English Coach

Personal English Coach is a personal English tutor by voice, with persistent pedagogical memory, designed for single-user, self-hosted/local-first use.

The coach persona inside the product is **Ray**.

## Product positioning

This repository is intentionally neutral and reusable. Anyone can clone it, configure a personal instance, and run it as an isolated learning system.

Branding such as "Rayzen English Coach" may be used in presentation layers, but the base product and repository remain neutral.

## Core thesis

The value of the system is not just talking by voice. The value comes from continuity:

- talk with the learner
- detect recurring issues
- remember weak points
- adapt the next interaction
- review what was not yet mastered

## Official constraints

- single-user per installation
- self-hosted/local-first
- modular monolith
- TypeScript monorepo
- NestJS backend
- Next.js frontend
- Prisma ORM
- PostgreSQL database
- Docker Compose for local infrastructure

## MVP scope

Included in the MVP:

- core conversation by voice
- speech transcription
- coach response in text
- speech synthesis for Ray
- session persistence
- utterance persistence
- initial learner profile
- summarized learner state
- mistake tracking
- initial skill mastery
- simple review queue
- simple progress summary
- basic reading mode
- minimal settings UI

Out of MVP:

- advanced phoneme-level pronunciation engine
- avatars and complex animation
- elaborate gamification
- multi-user support
- SaaS billing or subscription
- generalized assistant behavior
- native full mobile app

## Repository layout

```txt
apps/
  api/       NestJS backend
  web/       Next.js frontend
packages/
  core/      shared domain logic
  types/     shared contracts and types
  prompts/   prompt templates and prompt contracts
  config/    shared runtime and environment schemas
docs/
  product/   product and pedagogy context
  specs/     normative feature contracts
  decisions/ architecture decisions (ADRs)
  api/       endpoint and payload contracts
  data/      conceptual data model and learner state
  tasks/     phases, backlog, and execution plan
```

## Quick start

Latest release note:
- `docs/tasks/release-note-2026-04-18.md`

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker + Docker Compose

### Install

```bash
pnpm install
```

### Start local infrastructure

```bash
docker compose -p personal-english-coach -f infra/compose/docker-compose.dev.yml up -d
```

Default exposed ports in dev compose:
- PostgreSQL: `5433` (container keeps `5432` internally)
- API: `3001`
- Web: `3000`

If you need custom ports (for example, another stack already uses these ports):

```bash
PEC_DB_PORT=5434 PEC_API_PORT=3011 PEC_WEB_PORT=3005 docker compose -p personal-english-coach -f infra/compose/docker-compose.dev.yml up -d
```

### Run database migrations

```bash
pnpm db:migrate
```

For applying versioned migrations in non-interactive environments:

```bash
pnpm db:migrate:deploy
```

For Docker-only flow:

```bash
docker compose -p personal-english-coach -f infra/compose/docker-compose.dev.yml --profile tools run --rm migrate
```

### Seed minimal local data

```bash
pnpm db:seed
```

### Start API and web

```bash
pnpm dev
```

### Run Wave 1 smoke (API contract flow)

With API running, execute:

```bash
pnpm smoke:wave1
```

Optional custom base URL:

```bash
API_BASE_URL=http://localhost:3001/api pnpm smoke:wave1
```

### Run Phase 4 smoke (reading + progress flow)

With API running, execute:

```bash
pnpm smoke:phase4
```

Optional custom base URL:

```bash
API_BASE_URL=http://localhost:3001/api pnpm smoke:phase4
```

### Run Phase 5 smoke (progress trends flow)

With API running, execute:

```bash
pnpm smoke:phase5
```

Optional custom base URL:

```bash
API_BASE_URL=http://localhost:3001/api pnpm smoke:phase5
```

## Documentation order of authority

1. `docs/specs/*.md`
2. `docs/decisions/*.md`
3. `docs/architecture.md`
4. `CLAUDE.md`
5. `docs/product/*.md`
6. `docs/api/*.md`
7. `docs/data/*.md`
8. `docs/tasks/*.md`
9. code

When code and documentation diverge, documentation prevails unless explicit obsolescence is recorded.

## Coach persona

The coach persona is **Ray**.

Ray should be:

- clear
- encouraging
- concise
- adaptive
- pedagogically useful
- non-suffocating in corrections

Ray is not a generic assistant. Ray is a language coach.
