Project Baseline v1.0

Este é o marco zero oficial do projeto.
Tudo que vier depois — README.md, CLAUDE.md, architecture.md, ADRs, specs, tasks e prompts para Claude/Codex — deve derivar deste baseline.

1. Identidade do projeto
Nome oficial de trabalho

Personal English Coach

Definição curta

Um tutor pessoal de inglês, por voz, com memória persistente de aprendizagem, projetado para uso individual, single-user e self-hosted/local-first.

Definição operacional

O sistema deve atuar como:

parceiro de conversação;
treinador de speaking;
treinador de reading aloud;
registrador de progresso;
mecanismo de revisão adaptativa.

Ele não é um chat genérico.
Ele não é um SaaS educacional.
Ele não é uma plataforma multiusuário.

2. Objetivo do projeto
Objetivo principal

Ajudar o usuário a falar e ler em inglês com mais fluidez, confiança e consistência, por meio de interação recorrente por voz, correção útil e adaptação ao histórico pessoal.

Objetivos secundários
detectar dificuldades recorrentes;
reduzir gradualmente a dependência de PT-BR;
acompanhar progresso por habilidade;
reapresentar conteúdos frágeis no momento certo;
manter histórico navegável e auditável da evolução.
3. Não objetivos

Este projeto não tem como objetivo:

suportar múltiplos usuários na mesma instância;
ter billing, assinatura ou monetização embutida;
operar como produto SaaS;
oferecer avatars 3D ou interface gamificada complexa no MVP;
substituir um currículo formal completo de inglês;
funcionar como LMS, marketplace ou plataforma social;
virar um assistente geral como o Rayzen AI;
suportar arquitetura distribuída ou microsserviços neste estágio;
otimizar para escala de produção multi-tenant.
4. Natureza do uso
Modelo de uso
uso pessoal;
uma única instância por usuário;
outras pessoas podem clonar o repositório e subir sua própria versão;
cada instalação é isolada conceitualmente;
a arquitetura assume um perfil de aprendizagem ativo.
Consequência prática

O sistema deve ser otimizado para:

simplicidade de operação;
persistência local ou self-hosted;
personalização profunda;
transparência do estado pedagógico;
baixo atrito de manutenção.
5. Proposta central de produto
Tese do produto

O valor do sistema não está apenas em “conversar por voz”.
O valor está em:

conversar;
detectar padrões de erro;
lembrar dificuldades;
ajustar a próxima interação;
revisar o que ainda não foi dominado.
Resultado esperado

O usuário deve sentir que o sistema:

lembra onde ele trava;
entende em que pontos ele melhorou;
escolhe o próximo passo com base nisso;
não recomeça do zero a cada sessão.
6. Princípios do sistema
Princípio 1 — Voz é interface principal

A interação principal do produto é por voz.
Texto existe como apoio, registro, correção e fallback.

Princípio 2 — Memória pedagógica é núcleo do produto

O sistema não deve depender só de histórico conversacional.
Ele deve manter um estado estruturado do aprendiz.

Princípio 3 — PT-BR é suporte, não destino

Português pode ser usado para explicar, destravar e orientar.
A trajetória correta é reduzir esse apoio com o tempo.

Princípio 4 — Correção deve ser útil, não sufocante

O sistema não deve corrigir tudo o tempo todo.
Deve priorizar o erro mais relevante do turno.

Princípio 5 — O sistema precisa ser auditável

O usuário deve conseguir entender:

o que o sistema sabe sobre ele;
por que um foco foi escolhido;
o que mudou no seu perfil.
Princípio 6 — Documentação é normativa

A documentação não é apoio passivo.
Ela é contrato operacional para implementação por humanos e agentes.

7. Escopo funcional oficial
Escopo incluído no produto-base

O produto terá estes domínios funcionais:

A. Conversa principal
sessão de conversa;
input por voz;
resposta do coach;
correção textual;
persistência da interação.
B. Memória do aprendiz
perfil persistente;
dificuldades recorrentes;
score por habilidade;
snapshot de progresso;
foco atual.
C. Revisão adaptativa
fila de revisão;
exercícios derivados de erros recorrentes;
repetição guiada;
reforço de vocabulário e estruturas.
D. Reading mode
leitura em voz alta;
comparação com texto-alvo;
feedback de fluidez/pronúncia;
persistência dos resultados.
E. Progresso
sessões;
minutos falados;
evolução por skill;
erros recorrentes;
tendências.
F. Configuração pessoal
intensidade de correção;
nível de uso de PT-BR;
objetivo atual;
foco preferencial.
8. Escopo oficial do MVP

O MVP deve ser funcional, mas contido.

Incluído no MVP
conversa principal por voz;
transcrição de entrada;
resposta do coach em texto;
síntese de voz para resposta;
persistência de sessões;
persistência de utterances;
learner profile inicial;
learner state resumido;
registro de mistakes;
score inicial por habilidades;
review queue simples;
progress summary simples;
reading mode básico;
tela/configuração mínima.
Fora do MVP
engine avançado de pronúncia fonema a fonema;
avatars complexos;
animações;
gamificação elaborada;
ranking;
modo social;
multilíngue além do fluxo PT-BR → EN;
app mobile nativo completo;
export/import sofisticado;
automações externas complexas;
múltiplos perfis em uma mesma instância.
9. Estratégia pedagógica oficial
Idioma principal de aprendizagem
inglês como idioma-alvo;
PT-BR como idioma de suporte.
Regra de uso do PT-BR

O sistema deve operar com suporte progressivo:

estágio inicial
mais apoio em PT-BR;
explicações curtas;
instruções bilíngues;
reformulação guiada.
estágio intermediário
inglês dominante;
PT-BR apenas em pontos de travamento;
feedback pontual em português.
estágio avançando
conversa quase toda em inglês;
PT-BR apenas quando solicitado ou necessário.
Regra de correção

Por turno, o sistema deve:

corrigir no máximo 1 ou 2 pontos principais;
priorizar inteligibilidade e naturalidade;
evitar sobrecarregar a experiência;
incentivar repetição após correção.
Regra de adaptação

Se o usuário:

falhar repetidamente → reduzir complexidade e aumentar suporte;
evoluir consistentemente → reduzir suporte e aumentar abertura da conversa;
repetir erro ao longo de sessões → encaminhar para revisão adaptativa.
10. Arquitetura oficial
Estilo arquitetural

Monorepo + monólito modular

Justificativa

Esse estilo é o mais adequado porque o projeto:

é single-user;
não exige escala distribuída;
precisa de clareza de domínio;
se beneficia de tipos e contratos compartilhados;
será conduzido com forte apoio documental.
Arquitetura rejeitada
microsserviços;
arquitetura orientada a eventos distribuída;
múltiplos backends independentes;
app separado por domínio desde o início.
11. Stack oficial

Estas escolhas ficam congeladas como baseline.

Package manager

pnpm

Monorepo

pnpm workspace

Linguagem principal

TypeScript

Backend

NestJS

Frontend

Next.js

ORM

Prisma

Banco

PostgreSQL

Infra local

Docker Compose

Compartilhamento interno

Packages compartilhados para:

tipos;
prompts;
utilitários/core.
Observação

SQLite não será o banco oficial do baseline.
Podemos até usá-lo em testes localizados no futuro, mas o projeto nasce oficialmente em PostgreSQL.

12. Estrutura lógica oficial do repositório
repo/
├── CLAUDE.md
├── README.md
├── docs/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   ├── types/
│   ├── prompts/
│   └── core/
├── infra/
├── prisma/ or apps/api/prisma/
└── .github/
Regra estrutural
apps/api contém backend NestJS;
apps/web contém frontend Next.js;
packages/types contém contratos compartilhados;
packages/prompts contém prompts versionados;
packages/core contém lógica compartilhável não dependente de framework.
13. Módulos oficiais do backend

O backend terá estes módulos como fronteiras de domínio:

1. CoachModule

Responsável por:

sessão principal de conversa;
coordenação da resposta do tutor;
payload pedagógico por turno.
2. VoiceModule

Responsável por:

transcrição;
síntese;
abstração de provider de voz.
3. SessionModule

Responsável por:

lifecycle de sessão;
histórico navegável;
estatísticas por sessão.
4. LearnerMemoryModule

Responsável por:

learner profile;
learner state;
snapshots;
dificuldades recorrentes;
estado resumido do aprendiz.
5. ReviewModule

Responsável por:

fila de revisão;
drills;
reintrodução de conteúdos frágeis.
6. ReadingModule

Responsável por:

leitura em voz alta;
registro de leitura;
feedback associado.
7. ProgressModule

Responsável por:

agregados de evolução;
resumos de progresso;
tendências.
8. ConfigModule

Responsável por:

preferências;
intensidade de correção;
política de uso de PT-BR;
objetivos pessoais.
9. HealthModule

Responsável por:

healthcheck técnico;
readiness básica.
14. Domínio de dados oficial

Estas entidades fazem parte do baseline.

LearnerProfile

Representa o perfil principal do usuário.

LearningSession

Representa uma sessão de conversa, leitura ou revisão.

Utterance

Representa cada fala/interação registrada na sessão.

Mistake

Representa erro detectado e categorizado.

SkillMastery

Representa evolução por habilidade.

VocabularyItem

Representa item de vocabulário acompanhado pelo sistema.

PronunciationTarget

Representa palavra/som/alvo de pronúncia monitorado.

LearnerSnapshot

Representa snapshot resumido do estado pedagógico.

ReviewQueueItem

Representa item pendente de revisão adaptativa.

Config/Preferences

Representa preferências pessoais do sistema.

15. Regra oficial de memória
O que NÃO é memória principal
histórico bruto completo de conversa;
logs textuais não estruturados;
embeddings isolados sem interpretação pedagógica.
O que É memória principal

Learner State estruturado, derivado de:

profile;
mistakes;
skill mastery;
snapshots;
review queue;
sinais recentes de desempenho.
Regra de uso no prompt

O modelo não deve receber o histórico inteiro como contexto principal.
Deve receber:

contexto imediato da sessão;
learner state resumido;
objetivo atual;
dificuldade/foco relevante.
16. Estrutura oficial do learner state

O learner state é uma representação resumida e operacional do estado do aprendiz.

Deve conter, no mínimo:
level estimate;
speaking confidence;
reading confidence;
pt-BR support level;
correction intensity;
main recurring issues;
strong areas;
current focus;
review priorities;
preferred interaction style.
Função

Esse estado deve orientar:

a fala do coach;
o tipo de correção;
o nível de dificuldade;
o uso de PT-BR;
a escolha de revisão.
17. Contrato oficial de documentação

A documentação do projeto deve seguir estes papéis:

README.md

Visão geral, setup, execução, estrutura, links centrais.

CLAUDE.md

Documento operacional para agentes e humanos que implementam o repositório.

docs/architecture.md

Fonte oficial de arquitetura, módulos, fluxos, fronteiras e stores.

docs/decisions/*.md

ADRs com decisões estruturais congeladas.

docs/specs/*.md

Contrato funcional por feature.

docs/product/*.md

Contexto de produto e modelo pedagógico.

docs/api/*.md

Contratos de endpoints, payloads e eventos.

docs/data/*.md

Modelo conceitual de persistência e learner state.

docs/tasks/*.md

Fases, backlog e execução planejada.

18. Ordem oficial de autoridade documental

Esta ordem fica congelada:

docs/specs/*.md
docs/decisions/*.md
docs/architecture.md
CLAUDE.md
docs/product/*.md
docs/api/*.md
docs/data/*.md
docs/tasks/*.md
código existente
Regra de conflito

Se código e documentação divergirem:

a documentação prevalece, salvo obsolescência explícita;
a divergência deve ser registrada e explicada;
a menor correção coerente deve ser preferida.
19. Papel oficial do CLAUDE.md

O CLAUDE.md deve ser tratado como:

guia operacional do repositório;
instrução-base para Claude/Codex;
documento de contexto, escopo, stack, regras, fluxo de trabalho e disciplina documental.
O que ele precisa impor
documentação como contrato;
leitura obrigatória antes de codar;
proibição de invenção arquitetural;
disciplina de escopo;
formato esperado de resposta do agente;
regra de divergência entre docs e código.
20. Princípios oficiais para Claude/Codex

Claude/Codex devem operar sob estas regras:

não inventar arquitetura;
não expandir escopo;
não criar entidades fora da documentação;
não criar endpoints sem contrato;
não esconder regra auditável só em prompt;
não misturar domínios no mesmo módulo;
não tratar histórico bruto como memória principal;
implementar a menor solução correta;
atualizar documentação afetada quando houver mudança de contrato ou comportamento.
21. Estratégia oficial de implementação
Ordem de execução

O projeto deve ser implementado por fases.

Fase 0 — Foundation
estrutura do monorepo;
setup de apps;
setup de packages;
Docker Compose;
Prisma;
health básico;
documentação base.
Fase 1 — Core Conversation
sessão de conversa;
coach básico;
voz;
persistência de sessão;
payload estruturado.
Fase 2 — Learner Memory
profile;
mistakes;
skill mastery;
snapshot;
learner state operacional.
Fase 3 — Review
review queue;
drills;
repetição guiada.
Fase 4 — Reading
leitura em voz alta;
feedback de leitura;
persistência do reading mode.
Fase 5 — Progress
resumos;
tendências;
visão de evolução.
Fase 6 — Polish
refinamentos de UX;
tuning de prompts;
exportações;
confiabilidade.
22. Regra oficial de simplicidade

Em qualquer decisão futura, deve-se preferir:

menor número de moving parts;
menor acoplamento;
maior clareza documental;
menor superfície de mudança;
compatibilidade com evolução futura sem antecipar complexidade desnecessária.
23. Critérios de estabilidade do baseline

Este baseline só deve ser alterado se houver mudança deliberada em:

natureza do produto;
stack principal;
estilo arquitetural;
domínio central;
ordem de autoridade documental;
escopo do MVP.

Mudanças desse tipo exigem:

atualização deste baseline;
ADR correspondente;
revisão dos documentos dependentes.
24. Resumo executivo congelado

O projeto está oficialmente definido assim:

Personal English Coach é um tutor pessoal de inglês por voz, single-user, self-hosted/local-first, construído como monorepo TypeScript com NestJS, Next.js, Prisma e PostgreSQL, organizado como monólito modular, com memória pedagógica estruturada, revisão adaptativa, reading mode e documentação normativa usada como contrato de implementação por Claude/Codex.

Se estiver tudo correto, no próximo passo eu reconstruo do zero, com base exclusivamente neste baseline, os arquivos:

README.md
CLAUDE.md
docs/architecture.md
ADRs iniciais
docs/product/*
docs/api/*
docs/data/*
template de spec
specs iniciais
tasks e roadmap