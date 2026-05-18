# Fase 2 - Learner Memory + Preferences (Onda 1)

## Objetivo
Entregar memoria pedagogica estruturada do learner com derivacao de estado resumido e configuracao de preferencias persistidas.

## Endpoints alvo
- `GET /api/learner/profile`
- `GET /api/learner/state`
- `GET /api/learner/snapshots`
- `GET /api/config/preferences`
- `PUT /api/config/preferences`

## Sequencia de entrega
1. Implementar leitura de profile com dados atuais do learner.
2. Implementar `LearnerStateDerivationService` para gerar estado resumido.
3. Expor snapshots historicos e criterio de geracao.
4. Implementar preferencias (leitura/escrita) com validacao.
5. Integrar atualizacao de memoria ao fluxo de turnos da Fase 1.

## Regras e contratos
- `GET /api/learner/profile` retorna dados basicos (ex.: nivel estimado, confianca, foco atual).
- `GET /api/learner/state` retorna estado resumido derivado (nao apenas dump bruto de tabelas).
- `GET /api/learner/snapshots` retorna historico ordenado por data decrescente.
- `PUT /api/config/preferences` aceita e persiste:
  - `ptBrSupportLevel`
  - `correctionIntensity`
  - foco/objetivo (`currentFocus`, `learningGoal` equivalente)
- Atualizacao de estado apos turno deve ser deterministica e idempotente quando possivel.
- Nao persistir audio bruto no MVP desta onda.

## Backlog executavel
- [x] Definir DTOs de profile/state/snapshots/preferences.
- [x] Implementar `LearnerStateDerivationService`.
- [x] Persistir snapshots de estado com timestamps.
- [x] Mapear erros recorrentes e atualizar `Mistake`/`SkillMastery`.
- [x] Implementar `GET/PUT` de preferencias com validacao de enums.
- [x] Conectar pipeline de conversa para atualizar memoria apos turno.
- [x] Testes de contrato HTTP para endpoints de learner/config.
- [ ] Testes de integracao DB para profile/state/snapshots/preferences.

## DoD (Definition of Done)
- Estado resumido e snapshots retornam dados consistentes apos conversas.
- Preferencias sao persistidas e refletidas na estrategia de resposta do coach.
- Todos os endpoints da Fase 2 possuem validacao de payload e status corretos.
- Testes de integracao comprovam persistencia e leitura de memoria.

## Riscos e mitigacoes
- Risco: derivacao de estado pouco explicavel.
  - Mitigacao: regras explicitas de derivacao com testes deterministas.
- Risco: sobrescrita acidental de preferencias.
  - Mitigacao: validacao de campos permitidos e update parcial controlado.
- Risco: crescimento de snapshots sem criterio.
  - Mitigacao: politica inicial de frequencia (por turno/sessao) documentada.

## Dependencias
- Fase 1 concluida (sessao/turnos persistidos).
- Modelos Prisma de learner/mistake/snapshot/preferences.
- Contratos de dominio em `packages/types` (quando aplicavel).

## Checklist de rollout local (Fase 2)
- [ ] Subir stack local (db + app) via compose/runbook.
- [ ] Aplicar migrations e seed.
- [ ] Executar fluxo: sessao + turnos suficientes para gerar estado/memoria.
- [ ] Validar `GET /api/learner/*` e `GET/PUT /api/config/preferences`.
- [ ] Verificar reflexo de preferencias nas respostas posteriores do coach.

## Registro operacional
- Fase funcional concluida no codigo e nos testes de contrato.
- Bloqueio remanescente: validacao runtime com DB real via Compose pendente por restricoes operacionais de host (espaco/disponibilidade Docker).

## Criterios de release candidate (RC-F2)
- Endpoints de learner/config operacionais com contrato estavel.
- Memoria atualiza apos conversa sem inconsistencias de persistencia.
- Regressao da Fase 1 inexistente (smoke anterior permanece verde).
