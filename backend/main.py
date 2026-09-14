"""English Journey API — Tutor IA with provider abstraction."""

from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

app = FastAPI(title="English Journey API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TutorContext(BaseModel):
    level: str | None = None
    lessonId: str | None = None
    lessonTitle: str | None = None
    canDo: str | None = None
    section: str | None = None
    recentMistakes: list[dict[str, Any]] = Field(default_factory=list)
    tutorHints: list[str] = Field(default_factory=list)
    grammarRuleId: str | None = None


class TutorRequest(BaseModel):
    message: str
    mode: str = "explain"
    context: TutorContext = Field(default_factory=TutorContext)


def provider_name() -> str:
    return os.getenv("AI_PROVIDER", "openai").lower()


def has_api_key() -> bool:
    return bool(os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY"))


def build_system_prompt(req: TutorRequest) -> str:
    ctx = req.context
    mistakes = "\n".join(
        f"- topic={m.get('topic')} user={m.get('userAnswer')} correct={m.get('correctAnswer')}"
        for m in (ctx.recentMistakes or [])[:5]
    ) or "- none"
    hints = "\n".join(f"- {h}" for h in (ctx.tutorHints or [])[:6]) or "- none"
    return f"""You are the English Journey AI Tutor for CEFR learners.
Level: {ctx.level or "A1"}
Lesson: {ctx.lessonTitle or ctx.lessonId or "unknown"}
Can Do: {ctx.canDo or "n/a"}
Current section: {ctx.section or "n/a"}
Grammar rule id: {ctx.grammarRuleId or "n/a"}
Mode: {req.mode}

Pedagogy rules:
- Do NOT replace the curriculum; support it.
- Adapt language to the learner level (simpler for A1).
- For A1, short sentences; Portuguese clarification only when helpful.
- Never invent HTML. Plain text only.
- Correct gently: show learner answer, correct form, rule, and a mini practice.
- Prefer retrieval practice and clear examples.

Tutor hints:
{hints}

Recent mistakes:
{mistakes}
"""


def local_reply(req: TutorRequest) -> str:
    msg = (req.message or "").lower()
    ctx = req.context
    parts = [
        f"(Local tutor · mode={req.mode})",
        f"Lesson context: {ctx.level or 'A1'} — {ctx.lessonTitle or ctx.lessonId or 'Lesson'}.",
    ]
    if "age" in msg or "anos" in msg:
        parts.append("Age uses the verb to be: I am 25 years old. (Not 'I have 25 years'.)")
    elif any(w in msg for w in ("am", "is", "are", "to be", "verb")):
        parts.append("I → am · he/she/it → is · you/we/they → are.")
        parts.append("Examples: I am Ana. She is a teacher. Are you a student? Yes, I am.")
    elif req.mode == "correct" or "correct" in msg:
        parts.append("Check subject + am/is/are agreement, then add not for negatives.")
        parts.append("Example fix: 'She are my teacher' → 'She is my teacher'.")
    else:
        parts.append("Set OPENAI_API_KEY in .env for richer answers. Offline tip: practice introductions with am/is/are.")
    if ctx.recentMistakes:
        m = ctx.recentMistakes[0]
        parts.append(
            f"Watch this recent mistake ({m.get('topic')}): “{m.get('userAnswer')}” → “{m.get('correctAnswer')}”."
        )
    return "\n".join(parts)


def call_openai(req: TutorRequest) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = os.getenv("AI_MODEL", "gpt-4o-mini")
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": build_system_prompt(req)},
            {"role": "user", "content": req.message},
        ],
        temperature=0.4,
    )
    return completion.choices[0].message.content or ""


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "english-journey",
        "tutor": "ready" if has_api_key() else "local_fallback",
        "provider": provider_name(),
    }


@app.post("/api/tutor/chat")
def tutor_chat(req: TutorRequest):
    if not req.message.strip():
        return {"reply": "Ask me anything about this lesson.", "provider": "none"}

    if has_api_key() and provider_name() == "openai" and os.getenv("OPENAI_API_KEY"):
        try:
            reply = call_openai(req)
            return {"reply": reply, "provider": "openai", "offline": False}
        except Exception as exc:  # noqa: BLE001 — return safe fallback to client
            return {
                "reply": local_reply(req) + f"\n\n(Provider error: {exc})",
                "provider": "local-fallback",
                "offline": True,
            }

    return {"reply": local_reply(req), "provider": "local-fallback", "offline": True}
