# Wave 1 RC Checklist (Gate 0 -> Fase 3)

Data de consolidacao: 2026-04-17

## Status geral
- Concluido.
- Escopo funcional (contratos/API) concluido para Gate 0, Fase 1, Fase 2 e Fase 3.
- Sem bloqueios abertos para escopo da Wave 1.

## Matriz de criterios (RC-Wave1)

### Gate 0
- [x] CI bloqueante sem bypass.
  - Evidencia: `.github/workflows/ci.yml` roda `typecheck`, `lint`, `test` sem `|| true`.
- [x] Scripts workspace padronizados (`dev`, `build`, `typecheck`, `lint`, `test`).
  - Evidencia: `package.json` raiz e scripts por pacote/apps.
- [x] Dockerfiles de API e Web implementados.
  - Evidencia: `apps/api/Dockerfile`, `apps/web/Dockerfile`.
- [x] Compose com `postgres + api + web + migrate`.
  - Evidencia: `infra/compose/docker-compose.dev.yml`.
- [x] Baseline de migration versionada criado para wave 1.
  - Evidencia:
    - `prisma/migrations/20260416_wave1_baseline/migration.sql`
    - `prisma/migrations/migration_lock.toml`
- [x] Boot local completo validado ponta a ponta por runbook.
  - Evidencia (2026-04-18):
    - `docker compose -p personal-english-coach -f infra/compose/docker-compose.dev.yml up -d --no-build postgres api web`
    - `docker compose -p personal-english-coach -f infra/compose/docker-compose.dev.yml --profile tools run --rm migrate`

### Fase 1 - Core Conversation
- [x] `POST /api/coach/sessions`
- [x] `POST /api/coach/sessions/:sessionId/turns`
- [x] `GET /api/coach/sessions/:sessionId`
  - Evidencia: `apps/api/src/modules/coach/coach.controller.ts`.
- [x] Persistencia de utterances (`learner`, `coach`, `system`).
  - Evidencia: `apps/api/src/modules/coach/coach.service.ts`.
- [x] Adapters mock com ports estaveis (`TranscriptionPort`, `SynthesisPort`, `CoachGenerationPort`).
  - Evidencia: `apps/api/src/modules/coach/ports/*`, `apps/api/src/modules/coach/adapters/*`.
- [x] Regra pedagogica de no maximo 2 correcoes por turno.
  - Evidencia: `limitCorrections(...).slice(0, 2)` em `coach.service.ts`.
- [x] Contratos de API documentados com exemplos de request/response.
  - Evidencia: `docs/api/wave-1.md`.
- [x] Smoke HTTP/runtime validado em ambiente local com DB real.
  - Evidencia (2026-04-18): `pnpm smoke:wave1` com sucesso.

### Fase 2 - Learner Memory + Preferences
- [x] `GET /api/learner/profile`
- [x] `GET /api/learner/state`
- [x] `GET /api/learner/snapshots`
  - Evidencia: `apps/api/src/modules/learner-memory/learner-memory.controller.ts`.
- [x] `GET /api/config/preferences`
- [x] `PUT /api/config/preferences`
  - Evidencia: `apps/api/src/modules/config/config.controller.ts`.
- [x] `LearnerStateDerivationService` implementado.
  - Evidencia: `apps/api/src/modules/learner-memory/learner-state-derivation.service.ts`.
- [x] Atualizacao de memoria conectada ao fluxo de turnos.
  - Evidencia: `updateLearnerMemoryFromTurn(...)` em `coach.service.ts`.
- [x] Validacao de integracao DB em runtime local (smoke com compose).
  - Evidencia (2026-04-18):
    - `GET /api/health/status` com `readiness.db = ok`
    - `pnpm smoke:wave1` atualizando estado/snapshot apos turnos.

### Fase 3 - Review Queue
- [x] `GET /api/review/queue`
- [x] `POST /api/review/queue/:itemId/complete`
  - Evidencia: `apps/api/src/modules/review/review.controller.ts`.
- [x] `ReviewQueuePolicy` com limiar de recorrencia e prioridade.
  - Evidencia: `apps/api/src/modules/review/review-queue.policy.ts`.
- [x] Integracao fila com fluxo de conversa/memoria.
  - Evidencia: `reviewService.refreshQueueForLearner(...)` em `coach.service.ts`.
- [x] Smoke E2E final da onda (`session -> turn -> memory -> review -> complete`).
  - Evidencia (2026-04-18): `pnpm smoke:wave1` gerou e concluiu item de review.

## Qualidade/validacao executada
- [x] `pnpm typecheck` (workspace) verde.
- [x] `pnpm lint` (workspace) verde.
- [x] `pnpm test` (workspace) verde.
- [x] Observabilidade basica implementada (correlation id + request logging + metricas in-memory).
  - Evidencia:
    - `apps/api/src/common/observability/correlation-id.middleware.ts`
    - `apps/api/src/common/observability/request-logging.interceptor.ts`
    - `apps/api/src/common/observability/request-metrics.service.ts`
    - `apps/api/src/modules/health/health.service.ts` (snapshot de metricas no status)
- [x] Formato de erro padronizado para API (`400/404/5xx`) com filtro global.
  - Evidencia:
    - `apps/api/src/common/filters/api-exception.filter.ts`
    - `apps/api/src/main.ts` (`app.useGlobalFilters(...)`)
- [x] Validacao forte de payload ativa (DTOs com `class-validator` + `ValidationPipe` global).
  - Evidencia:
    - `apps/api/src/main.ts`
    - `apps/api/src/modules/coach/dto/create-coach-session.dto.ts`
    - `apps/api/src/modules/coach/dto/create-coach-turn.dto.ts`
    - `apps/api/src/modules/config/dto/update-preferences.dto.ts`
- [x] Testes de contrato HTTP da wave 1 executados (mock de servicos sem dependencia de Docker/DB runtime).
  - Evidencia: `apps/api/test/wave-1-contract.e2e-test.ts` (12 cenarios passando).
- [x] Testes unitarios de regras/policies executados.
  - Evidencia:
    - `apps/api/test/correction-cap.unit-test.ts`
    - `apps/api/test/learner-state-derivation.unit-test.ts`
    - `apps/api/test/review-queue-policy.unit-test.ts`

## Pendencias para fechar RC-Wave1
- [x] Estabilizar daemon Docker local.
- [x] Rodar compose local completo (`up`, `migrate`, app/web).
- [x] Executar smoke E2E runtime e registrar evidencias no documento.
  - Script usado: `pnpm smoke:wave1` (`scripts/smoke-wave1.mjs`).
- [x] Marcar este checklist como concluido.
