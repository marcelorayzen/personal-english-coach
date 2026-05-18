# RC Final - Post Fase 6

Data de consolidacao: 2026-04-18

## Decisao
- Release candidate local-first aprovado para escopo Fase 0 ate Fase 6.
- Sem bloqueios abertos para fluxo principal de conversa, memoria, review, reading e progress.

## Cobertura funcional

### Gate 0
- [x] CI bloqueante (`typecheck`, `lint`, `test`).
- [x] Scripts padronizados no workspace.
- [x] Dockerfiles e Compose operacionais.
- [x] Migration versionada aplicada em ambiente limpo.

### Fase 1
- [x] Sessao de conversa (`POST /api/coach/sessions`).
- [x] Turno de conversa (`POST /api/coach/sessions/:sessionId/turns`).
- [x] Consulta de sessao (`GET /api/coach/sessions/:sessionId`).
- [x] Cap de correcao (max 2 por turno).

### Fase 2
- [x] Profile/state/snapshots do learner.
- [x] Preferencias (`GET/PUT /api/config/preferences`).
- [x] Derivacao de estado e atualizacao de memoria por turno.

### Fase 3
- [x] Review queue (`GET /api/review/queue`).
- [x] Conclusao de item (`POST /api/review/queue/:itemId/complete`).
- [x] Policy de recorrencia/prioridade integrada ao fluxo de conversa.

### Fase 4
- [x] Reading sessions (`POST /api/reading/sessions`).
- [x] Reading attempts (`POST /api/reading/sessions/:sessionId/attempts`).
- [x] Avaliacao basica de leitura com persistencia e feedback.

### Fase 5
- [x] Progress summary (`GET /api/progress/summary`).
- [x] Trends simples de 7 dias (`spokenMinutes`, `sessions`, `recurringIssues` por categoria).

### Fase 6
- [x] Robustez de DB com `PrismaService` global.
- [x] Shutdown hooks habilitados.
- [x] Prompt tuning do mock coach com contexto de preferencias.

## Evidencias executadas (2026-04-18)
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm test`
- [x] `pnpm smoke:wave1`
- [x] `pnpm smoke:phase4`
- [x] `pnpm smoke:phase5`
- [x] `docker compose -p personal-english-coach -f infra/compose/docker-compose.dev.yml up -d --no-build postgres api web`
- [x] `docker compose -p personal-english-coach -f infra/compose/docker-compose.dev.yml --profile tools run --rm migrate`

## Estado operacional atual
- API: `http://localhost:3001/api`
- Web: `http://localhost:3000`
- Postgres local do projeto: `localhost:5433`
- Stack isolada por projeto compose: `personal-english-coach` (sem interferir no stack `rayzen-ai`).

## Riscos residuais (nao bloqueantes)
- Providers de IA seguem em modo mock por design do escopo atual.
- Modulos de `voice` e `session` permanecem como stubs de fundacao fora do fluxo MVP principal.

## Proximos passos recomendados
1. Definir criterio de troca gradual de adapters mock para provider real (feature flag por endpoint).
2. Adicionar telemetry persistida (metricas em storage) para historico de confiabilidade.
3. Planejar fase de hardening de deploy (backup/restore e runbook de recuperacao).
