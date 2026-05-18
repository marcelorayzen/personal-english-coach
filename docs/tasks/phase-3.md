# Fase 3 - Review Queue (Onda 1)

## Objetivo
Entregar fila de revisao funcional alimentada por recorrencia de erros do learner, com priorizacao simples e conclusao de itens.

## Endpoints alvo
- `GET /api/review/queue`
- `POST /api/review/queue/:itemId/complete`

## Sequencia de entrega
1. Definir `ReviewQueuePolicy` para criacao/priorizacao de itens.
2. Gerar itens de review a partir de erros recorrentes da memoria.
3. Expor consulta da fila com ordenacao por prioridade e data.
4. Implementar conclusao de item e atualizacao de status.
5. Fechar smoke E2E completo da onda 1.

## Regras e contratos
- Item de review deve ser criado somente quando recorrencia ultrapassar limiar definido.
- Prioridade minima considera:
  - frequencia do erro;
  - recencia do erro;
  - impacto pedagogico (categoria).
- `GET /api/review/queue` retorna itens pendentes por prioridade (desc) e data (asc como desempate).
- `POST /api/review/queue/:itemId/complete` marca item concluido de forma idempotente.
- Atualizacao da fila deve ocorrer no fluxo de conversa/memoria, sem job externo obrigatorio no MVP.

## Backlog executavel
- [x] Implementar `ReviewQueuePolicy` com regras explicitamente testaveis.
- [x] Integrar policy ao pipeline de atualizacao de memoria (Fase 2).
- [x] Implementar endpoint de listagem da fila com filtros basicos (pendente/concluido se aplicavel).
- [x] Implementar endpoint de conclusao com validacao de `itemId`.
- [x] Testes de contrato HTTP da review queue.
- [ ] Testes de integracao DB para criacao, ordenacao e conclusao de itens.
- [x] Teste de regra: erro recorrente gera item com prioridade esperada.

## DoD (Definition of Done)
- Erro recorrente gera item de review com prioridade consistente.
- Fila retorna ordenacao correta e sem itens duplicados indevidos.
- Conclusao de item altera status e nao quebra idempotencia.
- Integracao conversa -> memoria -> review validada por teste.

## Riscos e mitigacoes
- Risco: ruido na fila por baixa qualidade da regra de recorrencia.
  - Mitigacao: limiar inicial conservador e testes de regressao de policy.
- Risco: itens duplicados para o mesmo padrao de erro.
  - Mitigacao: chave de deduplicacao por learner + tipo de erro + janela temporal.
- Risco: fila desatualizada apos conclusao.
  - Mitigacao: leitura sempre baseada em estado persistido atual.

## Dependencias
- Fase 2 concluida com rastreio de erros e snapshots.
- Tabela/modelo de `ReviewQueueItem` operacional via Prisma migration.

## Checklist de rollout local (Fase 3)
- [ ] Subir stack local e aplicar migrations em base limpa.
- [ ] Rodar fluxo com turnos que contenham erro recorrente.
- [ ] Validar criacao de item em `GET /api/review/queue`.
- [ ] Concluir item via `POST /api/review/queue/:itemId/complete`.
- [ ] Revalidar leitura da fila apos conclusao.

## Criterios de release candidate (RC-Wave1)
- Build e subida local via Docker Compose sem intervencao manual fora do runbook.
- Migrations aplicam em base limpa e seed minimo funciona.
- Smoke E2E verde:
  1. criar sessao
  2. enviar turno
  3. atualizar memoria
  4. gerar item de review
  5. concluir item
- Endpoints da onda 1 com contrato estavel para troca futura de adapters mock por provider real.

## Registro operacional
- Implementacao de contrato concluida sem dependencia de cloud provider:
  - `ReviewQueuePolicy` com recorrencia minima (`>=3`) e prioridade por recencia/frequencia.
  - integracao no fluxo de conversa para atualizar fila apos cada turno.
- Smoke runtime continua pendente por restricoes operacionais de host (espaco/disponibilidade Docker).
- Checklist consolidado de release candidate: `docs/tasks/wave-1-rc.md`.
