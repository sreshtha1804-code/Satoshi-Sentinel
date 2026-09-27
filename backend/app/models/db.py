"""
Minimal SQLite persistence using the stdlib sqlite3 module — no ORM
dependency required. Stores only the normalized analysis result (never the
raw input beyond the short preview already in `meta`, and never anything
that fails the security gate in app/services/security.py, since that gate
runs before an analysis is ever created).
"""

import json
import sqlite3
import time
import uuid
from contextlib import contextmanager
from pathlib import Path

from app.core.config import settings

_SCHEMA = """
CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    input_type TEXT NOT NULL,
    local_score INTEGER NOT NULL,
    signals TEXT NOT NULL,
    findings TEXT NOT NULL,
    extracted TEXT NOT NULL,
    meta TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"""


def _db_path() -> str:
    path = settings.sqlite_path()
    parent = Path(path).parent
    if str(parent) not in ("", "."):
        parent.mkdir(parents=True, exist_ok=True)
    return path


@contextmanager
def _connect():
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with _connect() as conn:
        conn.execute(_SCHEMA)


def save_analysis(analysis: dict) -> str:
    """Persist a completed analysis and return the id it was stored under."""
    record_id = str(uuid.uuid4())
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO analyses (id, input_type, local_score, signals, findings, extracted, meta, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record_id,
                analysis["input_type"],
                analysis["local_score"],
                json.dumps(analysis["signals"]),
                json.dumps(analysis["findings"]),
                json.dumps(analysis["extracted"]),
                json.dumps(analysis["meta"]),
                time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            ),
        )
    return record_id


def get_analysis(record_id: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM analyses WHERE id = ?", (record_id,)).fetchone()
    if not row:
        return None
    return _row_to_dict(row)


def list_recent(limit: int = 20) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM analyses ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return [_row_to_dict(r) for r in rows]


def _row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "input_type": row["input_type"],
        "local_score": row["local_score"],
        "signals": json.loads(row["signals"]),
        "findings": json.loads(row["findings"]),
        "extracted": json.loads(row["extracted"]),
        "meta": json.loads(row["meta"]),
        "created_at": row["created_at"],
    }
