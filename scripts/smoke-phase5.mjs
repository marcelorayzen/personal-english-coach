const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001/api';
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 15000);

async function main() {
  console.log(`[smoke-phase5] Usando API base URL: ${API_BASE_URL}`);

  const session = await requestJson('/coach/sessions', {
    method: 'POST',
    body: { title: 'Phase 5 progress smoke' },
  });
  assertShape(session, ['sessionId'], 'create session response');

  await requestJson(`/coach/sessions/${encodeURIComponent(session.sessionId)}/turns`, {
    method: 'POST',
    body: {
      learnerText: 'I has a reservation for tomorrow.',
      durationMs: 1400,
      languageCode: 'en-US',
    },
  });

  const summary = await requestJson('/progress/summary', { method: 'GET' });
  assertShape(
    summary,
    ['summary', 'recurringIssues', 'skillTrends', 'recentFocusAreas', 'trends'],
    'progress summary response',
  );
  assertShape(summary.trends, ['spokenMinutes', 'sessions', 'recurringIssues'], 'trends');
  assertShape(summary.trends.spokenMinutes, ['currentValue', 'previousValue', 'direction'], 'spokenMinutes trend');
  assertShape(summary.trends.sessions, ['currentValue', 'previousValue', 'direction'], 'sessions trend');

  validateDirection(summary.trends.spokenMinutes.direction, 'spokenMinutes trend');
  validateDirection(summary.trends.sessions.direction, 'sessions trend');

  if (!Array.isArray(summary.trends.recurringIssues)) {
    throw new Error('Era esperado que trends.recurringIssues fosse um array');
  }
  for (const trend of summary.trends.recurringIssues) {
    assertShape(
      trend,
      ['category', 'currentValue', 'previousValue', 'direction'],
      'recurring issue trend',
    );
    validateDirection(trend.direction, `recurring issue trend (${trend.category})`);
  }

  console.log(
    `[smoke-phase5] Resumo ok: sessoes=${summary.summary.sessionCount}, minutosFalados=${summary.summary.spokenMinutes}`,
  );
  console.log('[smoke-phase5] Smoke da Fase 5 concluido com sucesso.');
}

function validateDirection(value, label) {
  if (!['up', 'down', 'stable'].includes(value)) {
    throw new Error(`Direcao invalida para ${label}: ${String(value)}`);
  }
}

async function requestJson(path, { method, body }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
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
    `[smoke-phase5] Falhou: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
