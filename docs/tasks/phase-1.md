# Fase 1 - Gate 0 + Core Conversation (Onda 1)

## Objetivo
Entregar a base implantavel local-first com hardening tecnico (Gate 0) e fluxo principal de conversa (Core Conversation), mantendo contratos estaveis para adapters de IA mockados.

## Endpoints alvo
- `GET /api/health/status` (expandido com readiness real: app + db)
- `POST /api/coach/sessions`
- `POST /api/coach/sessions/:sessionId/turns`
- `GET /api/coach/sessions/:sessionId`

## Sequencia de entrega
1. Gate 0: remover tolerancia de falha em CI e padronizar scripts de workspace.
2. Gate 0: completar Dockerfiles de API/Web e runbook de boot local reproduzivel.
3. Fase 1: criar sessao de conversa e persistencia basica.
4. Fase 1: adicionar envio de turnos com orquestracao coach + adapters mock.
5. Fase 1: disponibilizar consulta de sessao e smoke de contrato.

## Regras e contratos
- `POST /api/coach/sessions` cria `LearningSession` com `sessionType=conversation` e `startedAt`.
- `POST /api/coach/sessions/:sessionId/turns` persiste ao menos:
  - utterance do learner (`role=learner`);
  - utterance do coach (`role=coach`);
  - opcional `role=system` para metadados tecnicos.
- Resposta do coach deve limitar correcao para no maximo 2 pontos por turno.
- Ports internos obrigatorios com implementacao mock na onda 1:
  - `TranscriptionPort`
  - `SynthesisPort`
  - `CoachGenerationPort`
- Contratos dos ports nao mudam entre mock e provider real.

## Backlog executavel
- [x] CI bloqueante em `.github/workflows/ci.yml` sem `|| true`.
- [x] Scripts workspace consistentes: `dev`, `build`, `typecheck`, `lint`, `test`.
- [x] `lint` real para `apps/api` e `apps/web` (remover `echo` placeholder).
- [x] Dockerfile de `apps/api` para build e runtime.
- [x] Dockerfile de `apps/web` para build e runtime.
- [x] Ajustar Compose para subir app + db no fluxo local.
- [x] Migration versionada para sessao/utterance (se necessario alinhar schema existente).
- [x] Seed minimo nao-vazio para smoke local.
- [x] Implementar endpoints de sessao e turnos com validacao de payload.
- [x] Testes de contrato HTTP (status e payload).
- [ ] Teste de integracao DB para criacao de sessao/utterances.

## DoD (Definition of Done)
- Pipeline CI falha quando `typecheck` ou `lint` falham.
- `docker compose -f infra/compose/docker-compose.dev.yml up` sobe sem ajuste manual fora do runbook.
- Migrations aplicam em base limpa e seed cria dados minimos.
- Fluxo smoke verde: criar sessao -> enviar turno -> consultar sessao.
- Regra pedagogica validada por teste: maximo de 2 correcoes por turno.

## Riscos e mitigacoes
- Risco: divergencia entre contrato mock e provider real.
  - Mitigacao: testes de contrato de ports e DTOs versionados.
- Risco: readiness falso-positivo.
  - Mitigacao: `GET /api/health/status` deve validar conexao de banco e dependencias essenciais.
- Risco: scripts workspace heterogeneos.
  - Mitigacao: padrao unico no root + validacao em CI.

## Dependencias
- Prisma schema atual + migrations versionadas.
- Ambiente local com Docker, Node 22+ e pnpm 10+.
- Definicoes de contrato em `docs/api` e `packages/types` (quando aplicavel).

## Checklist de rollout local (Gate 0 + Fase 1)
- [x] `pnpm install`
- [ ] `docker compose -p personal-english-coach -f infra/compose/docker-compose.dev.yml up -d`
- [ ] `docker compose -p personal-english-coach -f infra/compose/docker-compose.dev.yml --profile tools run --rm migrate`
- [ ] `pnpm db:seed`
- [ ] `pnpm dev` (ou stack equivalente via compose completo quando disponivel)
- [ ] Smoke manual/API: `POST /api/coach/sessions`, `POST /turns`, `GET /sessions/:id`

## Criterios de release candidate (RC-F1)
- Todos os endpoints da Fase 1 respondem conforme contrato.
- CI verde sem bypass.
- Readiness real validando app + db.
- Runbook local executavel de ponta a ponta por outra pessoa do time.

## Registro operacional
- 2026-04-15 a 2026-04-17: implementacao e validacao estatica concluidas (`typecheck/lint/test`) com contratos da Fase 1 ativos.
- Bloqueio atual: execucao de smoke runtime local depende de disponibilidade de espaco/disponibilidade do Docker no host.
