const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001/api';
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 15000);

async function main() {
  console.log(`[smoke-phase4] Usando API base URL: ${API_BASE_URL}`);

  const readingSession = await requestJson('/reading/sessions', {
    method: 'POST',
    body: {
      title: 'Phase 4 reading smoke',
      targetText: 'I have a hotel reservation for tomorrow morning.',
      languageCode: 'en-US',
    },
  });
  assertShape(
    readingSession,
    ['sessionId', 'sessionType', 'targetText'],
    'reading session response',
  );
  console.log(`[smoke-phase4] Sessao de leitura criada: ${readingSession.sessionId}`);

  const attempt = await requestJson(
    `/reading/sessions/${encodeURIComponent(readingSession.sessionId)}/attempts`,
    {
      method: 'POST',
      body: {
        attemptText: 'I has a hotel booking for tomorrow.',
        durationMs: 2600,
        languageCode: 'en-US',
      },
    },
  );
  assertShape(
    attempt,
    ['sessionId', 'learnerUtterance', 'coachUtterance', 'assessment'],
    'reading attempt response',
  );
  if (typeof attempt.assessment?.accuracyPercent !== 'number') {
    throw new Error('Era esperado um accuracyPercent numerico na avaliacao');
  }
  console.log(
    `[smoke-phase4] Tentativa processada com acuracia=${attempt.assessment.accuracyPercent}%`,
  );

  const summary = await requestJson('/progress/summary', { method: 'GET' });
  assertShape(
    summary,
    ['summary', 'recurringIssues', 'skillTrends', 'recentFocusAreas'],
    'progress summary response',
  );
  console.log(
    `[smoke-phase4] Resumo de progresso: sessoes=${summary.summary?.sessionCount}, minutosFalados=${summary.summary?.spokenMinutes}`,
  );

  console.log('[smoke-phase4] Smoke da Fase 4 concluido com sucesso.');
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
    `[smoke-phase4] Falhou: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
