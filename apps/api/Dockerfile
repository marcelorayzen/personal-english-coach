FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @personal-english-coach/api prisma:generate
RUN pnpm --filter @personal-english-coach/api build

EXPOSE 3001

CMD ["pnpm", "--filter", "@personal-english-coach/api", "start:prod"]
