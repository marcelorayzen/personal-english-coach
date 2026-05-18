# Fase 6 - Robustez + Prompt Tuning

## Objetivo
Melhorar robustez operacional e qualidade de resposta do coach sem quebrar contratos das fases anteriores.

## Escopo implementado
- robustez de acesso a banco com `PrismaService` global (pool unico por processo Nest)
- encerramento gracioso da API com `enableShutdownHooks`
- ajuste do adapter mock para usar contexto de preferencias do learner em respostas

## Entregas
- [x] `DatabaseModule` global com `PrismaService`.
- [x] Migracao dos services principais para injetar `PrismaService` em vez de criar `new PrismaClient()` por modulo.
- [x] `main.ts` com shutdown hooks habilitados.
- [x] Prompt tuning no mock:
  - usa `currentFocus` e `learningGoal`;
  - respeita `ptBrSupportLevel` para hint de suporte;
  - ajusta tom conforme `correctionIntensity`.
- [x] Testes unitarios para comportamento do mock ajustado.

## DoD
- `typecheck`, `lint` e `test` verdes apos migracao para `PrismaService`.
- Contratos HTTP das fases anteriores preservados.
- Adapter mock responde com contexto pedagogico quando preferencias estao disponiveis.
