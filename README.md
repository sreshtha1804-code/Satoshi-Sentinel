# Satoshi Sentinel

**"Know what you're signing. Know who you're trusting."**

An explainable, privacy-first security companion for the Bitcoin and Nostr
ecosystems. Built for BOSS Battle 2026 (Bitshala) — AI track.

> Satoshi Sentinel is an investigative assistance tool, not a fraud oracle.

---

## 1. Problem

Bitcoin and Nostr both give people direct control — over money, over
identity — with no intermediary to call when something looks wrong. That
same lack of intermediation is what scammers exploit: a DM claiming to be
"official support," a giveaway address, a Nostr event impersonating a
known identity, a link that looks one character off from a real domain.
Most victims don't lack caution; they lack a fast way to see *why*
something feels off before they act.

## 2. Solution

Satoshi Sentinel takes a suspicious message, Bitcoin address, Nostr event,
or URL, and produces an **explainable** report: what patterns were
observed, why each one is commonly associated with risk, and what to
independently verify — never a bare "SCAM" or "SAFE" verdict. Evidence
(what was found) and interpretation (what it might mean) are always kept
visibly separate, and every score is a **signal**, not proof.

## 3. Why Bitcoin / Nostr

Both ecosystems are pseudonymous and irreversible-by-design — a sent
transaction or a leaked key cannot be undone. That makes the *moment
before* acting the only real intervention point, which is exactly where
Satoshi Sentinel sits. It uses only already-public information (address
formats, relay-visible events, profile metadata) and never requests a
seed phrase, private key, or wallet connection.

## 4. Why AI

A rule engine can detect patterns; it can't naturally *explain* them to
someone who isn't a security researcher. Satoshi Sentinel's local
heuristic engine does the detection deterministically (see below), and an
optional AI layer turns the structured findings into plain language —
receiving only the already-extracted evidence, never raw user input, and
never required for the app to function.

## 5. Privacy architecture

- **Never requested, anywhere in the product:** seed phrases, private
  keys, wallet passwords, or a wallet connection.
- **A security gate rejects key material before analysis runs at all** —
  both client-side (`src/utils/detectors/security.js`) and server-side
  (`backend/app/services/security.py`), independently, so the check holds
  even if one side is bypassed or the backend is offline. It looks for
  WIF-formatted keys, labeled hex private keys, and 12/24-word
  BIP-39-shaped seed phrases (a structural heuristic, not the exact
  wordlist — deliberately a little over-inclusive, since blocking a false
  positive is far cheaper than missing a real key).
- **Data minimization toward AI:** `/api/ai/explain` receives only the
  already-computed findings (type, severity, title, description, evidence)
  — never the raw pasted content.
- **No AI key required to run.** Every analysis and explanation has a
  fully local, deterministic fallback.
- **Local-first by default:** the frontend runs the entire signal-
  extraction engine in-browser and only calls the backend opportunistically
  (see [Demo instructions](#12-demo-instructions)).

## 6. Features

- Message, Bitcoin address, Nostr event, and URL analysis
- Deterministic local scoring (0–100) with LOW / MEDIUM / HIGH bands,
  identical whether computed client-side or server-side
- Real bech32/bech32m checksum verification for SegWit and Taproot
  addresses and Nostr npubs (a from-scratch BIP-173/350 implementation —
  no crypto library, no network)
- "Explain Before You Sign" — a dedicated interface for breaking down what
  a transaction actually authorizes before approving it
- Session-local analysis history
- Best-effort public Bitcoin (mempool.space) and Nostr (live relay
  WebSocket query) lookups that degrade gracefully and are never presented
  as proof of legitimacy
- Four built-in demo examples, runnable with zero setup

## 7. Architecture

```
User input
   │
   ▼
Security gate  ── rejects seed phrases / private keys, both client- and server-side
   │
   ▼
Local signal extraction  ── message / address / URL / Nostr detectors
   │
   ▼
Deterministic scoring  ── severity-weighted, no randomness
   │
   ├─► Structured findings + extracted data ──► Result page (evidence, always shown)
   │
   └─► (optional) AI explanation layer ──► plain-language reading of the SAME
                                             structured findings (never raw input)
```

The frontend runs this whole pipeline locally. The backend runs the
*identical* deterministic logic (a line-for-line ported engine) as a
service, plus the parts that only make sense server-side: SQLite
persistence, outbound public-data lookups, and API-key custody for the
optional AI call. The frontend prefers the backend when reachable and
transparently falls back to its local copy otherwise — see
`src/hooks/useAnalyze.js`.

```
frontend (React/Vite)  ──HTTP──►  backend (FastAPI)
        │                              │
        └── local engine (always) ◄────┘ (preferred when reachable)
```

## 8. Tech stack

**Frontend:** React, Vite, plain CSS (design tokens, no UI framework),
`react-router-dom`, `lucide-react`.

**Backend:** Python 3, FastAPI, Pydantic, `httpx` (outbound HTTP),
`websockets` (Nostr relay client), SQLite via the stdlib `sqlite3` module
(no ORM).

**AI:** provider-agnostic — `backend/app/services/ai_explain.py` calls out
only if `AI_EXPLAIN_ENABLED=true` and `ANTHROPIC_API_KEY` is set; any
failure falls back to the local deterministic template.

## 9. Installation

```
satoshi-sentinel/
├── src/                  frontend source (see below)
├── backend/              FastAPI backend
├── package.json
└── .env.example          frontend env
```

### Frontend

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` by default.

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env      # defaults work as-is for local dev
uvicorn app.main:app --reload --port 8000
```

Interactive API docs are then at `http://localhost:8000/docs`.

The frontend works fully **without** the backend running — see
[Demo instructions](#12-demo-instructions).

## 10. Environment variables

**Frontend (`.env.example`):**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend URL. Defaults to `http://localhost:8000` if unset. |

**Backend (`backend/.env.example`):**

| Variable | Purpose |
|---|---|
| `APP_ENV`, `HOST`, `PORT` | Basic server config. |
| `CORS_ORIGINS` | Comma-separated origins allowed to call the API. |
| `DATABASE_URL` | SQLite by default; swap later without touching endpoint code. |
| `BITCOIN_API_BASE_URL`, `BITCOIN_LOOKUP_TIMEOUT_SECONDS` | Public block-explorer lookups (mempool.space by default, no key needed). |
| `NOSTR_RELAYS`, `NOSTR_LOOKUP_TIMEOUT_SECONDS` | Public relays queried read-only for profile lookups. |
| `ANTHROPIC_API_KEY`, `AI_EXPLAIN_ENABLED` | **Optional.** Leave blank/false to run entirely on the local explanation template. |

No API key is ever required for the app to run or demo fully.

## 11. API endpoints

All under `/api`. Full interactive docs at `/docs` once the server is running.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check. |
| POST | `/api/analyze` | Analyze `{ type, content }` — `type` is `message`\|`address`\|`nostr`\|`url`. |
| POST | `/api/analyze/message` | Same engine, message-typed convenience route. |
| POST | `/api/analyze/address` | Same engine, address-typed convenience route. |
| POST | `/api/analyze/nostr` | Same engine, Nostr-typed convenience route. |
| POST | `/api/ai/explain` | Plain-language reading of an already-computed `{ input_type, local_score, findings }`. |
| GET | `/api/bitcoin/address/{address}` | Structural classification + best-effort public balance/tx-count data. |
| GET | `/api/bitcoin/transaction/{txid}` | Best-effort public transaction data. |
| GET | `/api/nostr/profile/{pubkey}` | Live relay query (hex pubkey or npub) for a kind:0 profile event. |

Every analyze endpoint runs the security gate first and returns `400` with
a clear, non-echoing message if the input looks like key material.
`backend/scripts/smoke_test.sh` exercises all 11 routes end to end.

## 12. Demo instructions

**Zero-setup path:** run only the frontend (`npm install && npm run dev`).
The Analyze page's demo panel loads four built-in examples (fake giveaway,
suspicious Nostr message, seed-phrase phishing, and a normal transaction
discussion) that run through the full local engine with no backend and no
API key. The top bar shows "Local demo mode" honestly whenever the backend
isn't reachable — this is the intended, fully-functional hackathon-demo
state, not a degraded one.

**Full-stack path:** also run the backend (see Installation). The status
indicator flips to "Backend connected," analysis is persisted to SQLite,
and the same requests hit `/api/bitcoin/*` and `/api/nostr/*` for
best-effort public data.

## 13. Security considerations

1. Seed phrases, private keys, and wallet passwords are never requested,
   and are actively rejected if submitted (client- and server-side).
2. No custodial wallet functionality exists or is planned.
3. API keys (AI, if configured) live only in backend environment
   variables — the frontend never sees them.
4. All backend request bodies are validated via Pydantic models.
5. A Nostr pubkey or profile existing is presented as observable evidence
   only — never as proof of a legitimate identity.
6. A risk score is a heuristic signal, never proof of fraud; this is
   stated in-product, not just in this document.
7. Public API/relay calls run with strict timeouts and fail closed
   (`available: false` + reason) rather than raising into the response.
8. CORS is restricted to explicit configured origins in
   `backend/app/core/config.py` (not a wildcard).
9. Use HTTPS in any real deployment; rate limiting is a noted item in the
   roadmap below, not yet implemented.

## 14. Future roadmap

- Base58check checksum verification for legacy addresses (currently
  structural/charset-only, clearly labeled as such)
- Real secp256k1 Schnorr signature verification for Nostr events
  (currently: presence of `sig` is checked, not validity)
- On-chain transaction-graph correlation ("Transaction signals" section is
  currently a placeholder)
- Rate limiting and auth for a multi-user deployment
- Persistent, cross-session history (currently per-browser-session on the
  frontend; SQLite-backed on the backend but not yet surfaced via a
  history endpoint)
- PostgreSQL swap for `DATABASE_URL` at scale

---

Questions or issues while running this locally? Check
`backend/scripts/smoke_test.sh` first — it's the fastest way to confirm
the backend itself is healthy independent of the frontend.
