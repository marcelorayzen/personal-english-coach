# Fase 5 - Progress Summary + Simple Trends

## Objetivo
Consolidar visibilidade de progresso com metricas auditaveis e tendencias simples por janela temporal.

## Endpoint alvo
- `GET /api/progress/summary`

## Regras e contratos
- O resumo deve expor no minimo:
  - `sessionCount`
  - `spokenMinutes`
  - `recurringIssues`
  - `skillTrends`
  - `recentFocusAreas`
- Tendencias simples devem comparar janela atual de 7 dias com janela anterior de 7 dias:
  - tendencia de minutos falados;
  - tendencia de sessoes;
  - tendencia por categoria de erro recorrente.
- Direcao de tendencia:
  - `up` quando `currentValue > previousValue`;
  - `down` quando `currentValue < previousValue`;
  - `stable` quando iguais.

## Backlog executavel
- [x] Expor `GET /api/progress/summary` com metricas minimas.
- [x] Calcular tendencias simples com janela de 7 dias.
- [x] Incluir tendencia por categoria em erros recorrentes.
- [x] Testes unitarios para funcoes de tendencia.
- [x] Teste de contrato para endpoint de summary.

## DoD (Definition of Done)
- Endpoint retorna resumo e bloco `trends` com formato estavel.
- Regras de direcao (`up/down/stable`) estao cobertas por teste unitario.
- Pipeline local (`typecheck/lint/test`) permanece verde.
