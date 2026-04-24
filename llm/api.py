import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agents.orchestrator import DebateOrchestrator
from config import PERSONAS


app = FastAPI(
    title="Viega Intelligence API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = DebateOrchestrator()


class DebateStreamRequest(BaseModel):
    rounds: int = Field(default=2, ge=1, le=5)
    personas: list[str] = Field(..., min_length=2, max_length=5)


def _normalize_personas(personas: list[str]) -> list[str]:
    normalized = []
    for persona in personas:
        key = persona.strip().lower()
        if key in PERSONAS and key not in normalized:
            normalized.append(key)

    if len(normalized) < 2:
        raise ValueError("Choose at least two valid personas.")

    return normalized


def _format_sse(event_name: str, payload: dict) -> str:
    return f"event: {event_name}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/personas")
def list_personas():
    return {"personas": orchestrator.list_personas()}


@app.post("/debates/stream")
def stream_debate(request: DebateStreamRequest):
    try:
        personas = _normalize_personas(request.personas)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    def event_stream():
        try:
            for event in orchestrator.stream_combined_debate(
                persona_keys=personas,
                rounds=request.rounds,
            ):
                yield _format_sse(event["type"], event)
        except Exception as exc:
            error_event = {"type": "error", "message": str(exc)}
            yield _format_sse("error", error_event)
        finally:
            yield _format_sse("done", {"type": "done"})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
