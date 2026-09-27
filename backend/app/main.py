from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, analyze, bitcoin, health, nostr
from app.core.config import settings
from app.models import db

app = FastAPI(
    title="Satoshi Sentinel API",
    description=(
        "Local-first Bitcoin + Nostr signal analysis. Analysis endpoints run "
        "deterministic local heuristics and never require an AI API key. "
        "Public-data endpoints (Bitcoin, Nostr) degrade gracefully when the "
        "underlying public service is unreachable."
    ),
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    db.init_db()


app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(ai.router, prefix="/api", tags=["ai"])
app.include_router(bitcoin.router, prefix="/api", tags=["bitcoin"])
app.include_router(nostr.router, prefix="/api", tags=["nostr"])


@app.get("/")
async def root():
    return {
        "name": "Satoshi Sentinel API",
        "status": "ok",
        "docs": "/docs",
    }
