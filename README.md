# English Journey

Plataforma pessoal de inglês **A1 → A2** (conteúdo profundo), com UI no padrão do MLOps Lab.

> Abra o app: diagnostic → Today's Study → lesson → practice → checkpoint → próxima lesson.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind (IBM Plex, dark/teal, nav superior)
- Backend: FastAPI (Tutor IA)
- Persistência: Zustand → localStorage (sem banco)
- Currículo: JSON em `frontend/public/data` (32 lessons A1 + 32 A2)

## Docker

```bash
cp .env.example .env   # opcional OPENAI_API_KEY
docker compose up --build
```

- App: http://127.0.0.1:5173/
- Tutor: http://127.0.0.1:8001/health

## Dev local

```bash
# terminal 1 — API
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# terminal 2 — UI
cd frontend && npm install && npm run dev
```

Vite faz proxy de `/api` → `8001`. Em Settings, Backend URL pode ficar vazio.

## Testes

```bash
cd frontend && npm test
```

## O que está incluso

- Diagnostic / placement
- Journey map A1–A2 (B1/B2 “Em breve”)
- Learn com seções completas + exercise player
- Review SRS + Practice My Mistakes
- Module & level tests + progressão
- Tutor contextual (sinais → mistake bank)
- Import/export de progresso

## Escopo

Não certifica CEFR. Speaking/Listening e B1/B2 profundo ficam para versões futuras.
