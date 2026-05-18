# Fase 4 - Reading Mode + Progress Summary

## Objetivo
Entregar pratica de leitura em voz alta com feedback persistido e visao simples de progresso.

## Endpoints alvo
- `POST /api/reading/sessions`
- `POST /api/reading/sessions/:sessionId/attempts`
- `GET /api/progress/summary`

## Sequencia de entrega
1. Criar sessao de leitura com texto alvo persistido.
2. Registrar tentativas do learner e gerar feedback basico.
3. Persistir avaliacao e sinalizar erro de `reading_accuracy` quando abaixo do limiar.
4. Expor resumo de progresso com metricas minimas.

## Regras e contratos
- `POST /api/reading/sessions` cria `LearningSession` com `sessionType=reading`.
- Texto alvo e persistido como utterance `system` do inicio da sessao.
- `POST /api/reading/sessions/:sessionId/attempts`:
  - persiste utterance do learner;
  - gera feedback do coach;
  - calcula acuracia/cobertura basicas;
  - registra resumo tecnico da avaliacao.
- Quando acuracia < `85%`, registrar `Mistake` com categoria `reading_accuracy`.
- `GET /api/progress/summary` retorna:
  - total de sessoes;
  - minutos falados acumulados;
  - problemas recorrentes;
  - tendencia de skills (snapshot atual);
  - focos recentes.

## Backlog executavel
- [x] DTOs e validacao para sessao/tentativa de leitura.
- [x] Endpoint de criacao de sessao de leitura.
- [x] Endpoint de tentativa com avaliacao basica e feedback.
- [x] Persistencia de resultados via `LearningSession` + `Utterance` + `Mistake`.
- [x] Endpoint `GET /api/progress/summary`.
- [x] Testes de contrato HTTP para endpoints da fase.
- [x] Teste unitario para regra de avaliacao de leitura.

## DoD (Definition of Done)
- Fluxo completo de leitura funciona sem dependencia de provider externo.
- Erro de leitura recorrente e rastreado no modelo de memoria.
- Resumo de progresso retorna metricas minimas do spec.
- `typecheck`, `lint` e `test` verdes com cobertura dos novos contratos.
