# English Journey — Architecture

## Visão

Plataforma **local-first** de aprendizagem de inglês (A1→A2 profundo; B1/B2 placeholder) com currículo estruturado, motores pedagógicos no frontend e **Tutor IA** via FastAPI.

## Princípio

```text
DIAGNOSTIC → CONTENT → LESSON → PRACTICE → REVIEW → CHECKPOINT → MASTERY → NEXT
```

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + Vite + TypeScript + Tailwind (padrão MLOps Lab) |
| Persistência | Zustand persist → localStorage |
| Backend | Python FastAPI (Tutor IA) |
| Deploy | Docker Compose (Nginx + API) |

API keys **nunca** no frontend.

## Estrutura

```text
frontend/          # Vite React app + public/data (currículo JSON)
backend/           # FastAPI tutor
scripts/           # generate-curriculum.mjs
docs/
docker-compose.yml
```

## Domínios de dados

**Conteúdo:** `frontend/public/data/curriculum|exercises|vocabulary|grammar|assessments`

**Estado do aluno (browser):** progress, mistakes, reviewQueue, settings, diagnostic

## Offline

Conteúdo, exercícios, revisão e progresso funcionam offline. Tutor degrada com fallback local.
