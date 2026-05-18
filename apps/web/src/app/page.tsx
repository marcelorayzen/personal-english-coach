'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface HealthStatus {
  status?: string;
  readiness?: {
    app?: string;
    db?: string;
  };
  checkedAt?: string;
}

interface LearnerProfile {
  displayName?: string | null;
  levelEstimate?: string | null;
  speakingConfidence?: number;
  ptBrSupportLevel?: string;
  correctionIntensity?: string;
  currentFocus?: string | null;
  learningGoal?: string | null;
}

interface ReviewQueue {
  total?: number;
  items?: Array<{ id: string }>;
}

interface ProgressSummary {
  summary?: {
    sessionCount?: number;
    spokenMinutes?: number;
    recurringIssueCount?: number;
  };
}

interface DashboardState {
  health: HealthStatus | null;
  profile: LearnerProfile | null;
  reviewQueue: ReviewQueue | null;
  progress: ProgressSummary | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

const initialState: DashboardState = {
  health: null,
  profile: null,
  reviewQueue: null,
  progress: null,
};

export default function HomePage() {
  const [data, setData] = useState<DashboardState>(initialState);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>('Painel pronto.');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setFeedback('Atualizando dados do painel...');
    try {
      const [health, profile, reviewQueue, progress] = await Promise.all([
        requestJson<HealthStatus>('/health/status', 'GET'),
        requestJson<LearnerProfile>('/learner/profile', 'GET'),
        requestJson<ReviewQueue>('/review/queue', 'GET'),
        requestJson<ProgressSummary>('/progress/summary', 'GET'),
      ]);
      setData({ health, profile, reviewQueue, progress });
      setFeedback('Dados atualizados com sucesso.');
    } catch (error) {
      setFeedback(
        `Falha ao carregar dados: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const learnerName = data.profile?.displayName || 'Learner';
  const level = data.profile?.levelEstimate || '-';
  const confidence = `${Math.round((data.profile?.speakingConfidence ?? 0) * 100)}%`;
  const sessionCount = data.progress?.summary?.sessionCount ?? 0;
  const spokenMinutes = data.progress?.summary?.spokenMinutes ?? 0;
  const recurringIssues = data.progress?.summary?.recurringIssueCount ?? 0;
  const reviewItems = data.reviewQueue?.total ?? 0;
  const healthStatus = data.health?.status ?? '-';
  const readinessApp = data.health?.readiness?.app ?? '-';
  const readinessDb = data.health?.readiness?.db ?? '-';

  const checkedAt = useMemo(() => {
    if (!data.health?.checkedAt) {
      return '-';
    }
    return new Date(data.health.checkedAt).toLocaleString('pt-BR');
  }, [data.health?.checkedAt]);

  async function onCreateConversationSession() {
    setFeedback('Criando sessão de conversa...');
    try {
      const response = await requestJson<{ sessionId: string }>(
        '/coach/sessions',
        'POST',
        { title: 'Sessão criada pelo painel' },
      );
      setLastSessionId(response.sessionId);
      setFeedback(`Sessão criada: ${response.sessionId}`);
      await loadDashboard();
    } catch (error) {
      setFeedback(
        `Erro ao criar sessão: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async function onSendPracticeTurn() {
    setFeedback('Enviando turno de prática...');
    try {
      let sessionId = lastSessionId;
      if (!sessionId) {
        const created = await requestJson<{ sessionId: string }>(
          '/coach/sessions',
          'POST',
          { title: 'Sessão automática de prática' },
        );
        sessionId = created.sessionId;
        setLastSessionId(sessionId);
      }

      await requestJson(`/coach/sessions/${sessionId}/turns`, 'POST', {
        learnerText: 'I has a hotel reservation.',
        languageCode: 'en-US',
        durationMs: 1200,
      });

      setFeedback(`Turno enviado na sessão ${sessionId}.`);
      await loadDashboard();
    } catch (error) {
      setFeedback(
        `Erro ao enviar turno: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async function onRunReadingAttempt() {
    setFeedback('Executando fluxo de leitura...');
    try {
      const session = await requestJson<{ sessionId: string }>(
        '/reading/sessions',
        'POST',
        {
          title: 'Leitura pelo painel',
          targetText: 'I have a hotel reservation for tomorrow morning.',
          languageCode: 'en-US',
        },
      );

      await requestJson(
        `/reading/sessions/${session.sessionId}/attempts`,
        'POST',
        {
          attemptText: 'I has a hotel booking for tomorrow.',
          languageCode: 'en-US',
          durationMs: 2500,
        },
      );

      setFeedback(`Tentativa de leitura registrada na sessão ${session.sessionId}.`);
      await loadDashboard();
    } catch (error) {
      setFeedback(
        `Erro no fluxo de leitura: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async function onCompleteFirstReviewItem() {
    setFeedback('Concluindo primeiro item da revisão...');
    try {
      const queue = await requestJson<ReviewQueue>('/review/queue', 'GET');
      const itemId = queue.items?.[0]?.id;
      if (!itemId) {
        setFeedback('Nenhum item pendente na fila de revisão.');
        return;
      }

      await requestJson(`/review/queue/${itemId}/complete`, 'POST');
      setFeedback(`Item de revisão concluído: ${itemId}`);
      await loadDashboard();
    } catch (error) {
      setFeedback(
        `Erro ao concluir item de revisão: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px 56px' }}>
      <section
        style={{
          background: '#ffffff',
          border: '1px solid #dbe7f5',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 20px 45px -35px rgba(15, 23, 42, 0.5)',
        }}
      >
        <p
          style={{
            margin: '0 0 10px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: '#1d4ed8',
          }}
        >
          Personal English Coach
        </p>
        <h1 style={{ margin: '0 0 8px', fontSize: '2.1rem' }}>Painel Local-First</h1>
        <p style={{ margin: 0, color: '#334155', lineHeight: 1.6 }}>
          Persona ativa: <strong>Ray</strong>. Painel funcional conectado à API
          local.
        </p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem' }}>Ações rápidas</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <ActionButton
            text={isLoading ? 'Atualizando...' : 'Atualizar dados'}
            onClick={() => void loadDashboard()}
            disabled={isLoading}
          />
          <ActionButton
            text="Criar sessão"
            onClick={() => void onCreateConversationSession()}
            disabled={isLoading}
          />
          <ActionButton
            text="Enviar turno"
            onClick={() => void onSendPracticeTurn()}
            disabled={isLoading}
          />
          <ActionButton
            text="Rodar leitura"
            onClick={() => void onRunReadingAttempt()}
            disabled={isLoading}
          />
          <ActionButton
            text="Concluir revisão"
            onClick={() => void onCompleteFirstReviewItem()}
            disabled={isLoading}
          />
        </div>
        <p style={{ marginTop: 10, color: '#334155' }}>
          <strong>Status:</strong> {feedback}
        </p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem' }}>Resumo do learner</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          <MetricCard titulo="Learner" valor={learnerName} descricao={`Nível: ${level}`} />
          <MetricCard
            titulo="Confiança de fala"
            valor={confidence}
            descricao={`Foco: ${data.profile?.currentFocus ?? '-'}`}
          />
          <MetricCard
            titulo="Sessões"
            valor={String(sessionCount)}
            descricao={`Minutos falados: ${spokenMinutes}`}
          />
          <MetricCard
            titulo="Revisão"
            valor={String(reviewItems)}
            descricao={`Erros recorrentes: ${recurringIssues}`}
          />
          <MetricCard
            titulo="Preferências"
            valor={`${data.profile?.ptBrSupportLevel ?? '-'} / ${
              data.profile?.correctionIntensity ?? '-'
            }`}
            descricao={`Meta: ${data.profile?.learningGoal ?? '-'}`}
          />
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.2rem' }}>Saúde da plataforma</h2>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dbe7f5',
            borderRadius: 14,
            padding: 14,
            color: '#1e293b',
            lineHeight: 1.6,
          }}
        >
          <div>
            Status geral: <strong>{healthStatus}</strong>
          </div>
          <div>
            Readiness app/db: <strong>{readinessApp} / {readinessDb}</strong>
          </div>
          <div>
            Última checagem: <strong>{checkedAt}</strong>
          </div>
          <div>
            API base: <code>{API_BASE_URL}</code>
          </div>
        </div>
      </section>
    </main>
  );
}

function ActionButton(props: {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      style={{
        border: '1px solid #bfdbfe',
        background: props.disabled ? '#dbeafe' : '#eff6ff',
        color: '#1e3a8a',
        borderRadius: 10,
        padding: '8px 12px',
        fontWeight: 700,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {props.text}
    </button>
  );
}

function MetricCard(props: { titulo: string; valor: string; descricao: string }) {
  return (
    <article
      style={{
        background: '#ffffff',
        border: '1px solid #dbe7f5',
        borderRadius: 14,
        padding: 14,
      }}
    >
      <h3 style={{ margin: '0 0 6px', fontSize: '1rem' }}>{props.titulo}</h3>
      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1.1rem' }}>
        {props.valor}
      </p>
      <p style={{ margin: 0, color: '#475569', lineHeight: 1.45 }}>{props.descricao}</p>
    </article>
  );
}

async function requestJson<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as unknown) : {};

  if (!response.ok) {
    const fallback = `${response.status} ${response.statusText}`;
    const message =
      typeof json === 'object' &&
      json &&
      'error' in json &&
      typeof (json as { error?: unknown }).error === 'object' &&
      (json as { error?: { message?: string } }).error?.message
        ? (json as { error?: { message?: string } }).error?.message
        : fallback;
    throw new Error(message);
  }

  return json as T;
}
