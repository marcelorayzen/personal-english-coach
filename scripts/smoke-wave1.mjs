const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001/api';
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 15000);

async function main() {
  console.log(`[smoke] Usando API base URL: ${API_BASE_URL}`);

  const session = await requestJson('/coach/sessions', {
    method: 'POST',
    body: {
      title: 'Wave 1 smoke session',
    },
  });
  assertShape(session, ['sessionId'], 'create session response');
  console.log(`[smoke] Sessao criada: ${session.sessionId}`);

  // Envia erros recorrentes para acionar o limiar da review queue.
  await createTurn(session.sessionId, 'I has a hotel reservation.');
  await createTurn(session.sessionId, 'I has a tour booking.');
  await createTurn(session.sessionId, 'I has a meeting tomorrow.');

  const state = await requestJson('/learner/state', { method: 'GET' });
  assertShape(state, ['summary', 'topWeaknesses'], 'learner state response');
  console.log(
    `[smoke] Estado do learner atualizado: sessoes=${state.summary?.sessionCount}, erros=${state.summary?.mistakeCount}`,
  );

  const reviewQueue = await requestJson('/review/queue', { method: 'GET' });
  assertShape(reviewQueue, ['items'], 'review queue response');
  if (!Array.isArray(reviewQueue.items) || reviewQueue.items.length === 0) {
    throw new Error(
      'Era esperado ao menos um item de review após erros recorrentes',
    );
  }
  console.log(`[smoke] Itens na review queue: ${reviewQueue.items.length}`);

  const firstItem = reviewQueue.items[0];
  const completion = await requestJson(
    `/review/queue/${encodeURIComponent(firstItem.id)}/complete`,
    {
      method: 'POST',
    },
  );
  assertShape(completion, ['itemId', 'isCompleted'], 'review completion response');
  if (completion.isCompleted !== true) {
    throw new Error('Era esperado que o item concluido viesse como true');
  }
  console.log(`[smoke] Item de review concluido: ${completion.itemId}`);

  console.log('[smoke] Smoke da Wave 1 concluido com sucesso.');
}

async function createTurn(sessionId, learnerText) {
  const turn = await requestJson(`/coach/sessions/${encodeURIComponent(sessionId)}/turns`, {
    method: 'POST',
    body: {
      learnerText,
      languageCode: 'en-US',
      durationMs: 1200,
    },
  });
  assertShape(
    turn,
    ['sessionId', 'learnerUtterance', 'coachUtterance', 'corrections'],
    'coach turn response',
  );
  if (!Array.isArray(turn.corrections)) {
    throw new Error('Era esperado um array de correcoes na resposta do turno');
  }
  if (turn.corrections.length > 2) {
    throw new Error(
      'Limite de correcao violado: esperado no maximo 2 correcoes por turno',
    );
  }
}

async function requestJson(path, { method, body }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`JSON invalido na resposta de ${method} ${path}: ${text}`);
    }

    if (!response.ok) {
      throw new Error(
        `Requisicao falhou ${method} ${path}: ${response.status} ${response.statusText} ${JSON.stringify(
          json,
        )}`,
      );
    }

    return json;
  } finally {
    clearTimeout(timeout);
  }
}

function assertShape(value, requiredKeys, label) {
  if (!value || typeof value !== 'object') {
    throw new Error(`Resposta invalida em ${label}: esperado objeto`);
  }
  for (const key of requiredKeys) {
    if (!(key in value)) {
      throw new Error(`Resposta invalida em ${label}: faltando "${key}"`);
    }
  }
}

main().catch((error) => {
  console.error(
    `[smoke] Falhou: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
