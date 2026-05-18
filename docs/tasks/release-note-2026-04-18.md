# Release Note - 2026-04-18

## Escopo
- Consolidacao de Gate 0 ate Fase 6 para operacao local-first.

## Highlights
- Wave 1 concluida com smoke E2E (`session -> turn -> memory -> review -> complete`).
- Reading flow implementado:
  - `POST /api/reading/sessions`
  - `POST /api/reading/sessions/:sessionId/attempts`
- Progress summary expandido com trends simples de 7 dias:
  - `GET /api/progress/summary`
  - trends para `spokenMinutes`, `sessions` e `recurringIssues` por categoria.
- Robustez backend:
  - `PrismaService` global (pool unico).
  - shutdown hooks habilitados.
- Prompt tuning no adapter mock com contexto de preferencias do learner.

## Validacoes executadas
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm smoke:wave1`
- `pnpm smoke:phase4`
- `pnpm smoke:phase5`

## Estado operacional
- API: `http://localhost:3001/api`
- Web: `http://localhost:3000`
- Postgres (stack do projeto): `localhost:5433`
- Compose project: `personal-english-coach` (isolado de outros stacks)

## Referencia
- RC consolidado: `docs/tasks/rc-post-phase-6.md`
