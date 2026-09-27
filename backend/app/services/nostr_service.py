"""
Nostr public-data lookups. Nostr relays only speak the WebSocket-based
NIP-01 protocol (there is no REST equivalent), so this module's job is to:

1. open a short-lived WebSocket connection to each configured relay,
2. send a REQ subscription asking for the latest kind:0 (metadata) event
   for a given pubkey,
3. collect the first matching event (or give up at a strict timeout),
4. close the connection.

This is read-only and anonymous — no relay ever receives anything beyond
the pubkey being looked up. Every failure (relay down, timeout, malformed
response) degrades gracefully: callers always get a dict back, never an
exception, with `available: False` and a reason when nothing could be
found. A pubkey existing and having a profile is presented as *observable
evidence*, never as proof that the identity is trustworthy.
"""

import asyncio
import json

import websockets

from app.core.config import settings


async def _query_single_relay(relay_url: str, pubkey_hex: str, timeout: float) -> dict | None:
    sub_id = "sentinel-profile-lookup"
    request = json.dumps(["REQ", sub_id, {"kinds": [0], "authors": [pubkey_hex], "limit": 1}])

    try:
        async with websockets.connect(relay_url, open_timeout=timeout, close_timeout=2) as ws:
            await ws.send(request)
            deadline = asyncio.get_event_loop().time() + timeout
            while True:
                remaining = deadline - asyncio.get_event_loop().time()
                if remaining <= 0:
                    return None
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=remaining)
                except asyncio.TimeoutError:
                    return None

                try:
                    message = json.loads(raw)
                except (json.JSONDecodeError, TypeError):
                    continue

                if not isinstance(message, list) or len(message) < 2:
                    continue

                if message[0] == "EVENT" and len(message) >= 3:
                    event = message[2]
                    if isinstance(event, dict) and event.get("kind") == 0:
                        return event
                elif message[0] == "EOSE":
                    return None
    except Exception:
        return None


async def fetch_profile(pubkey_hex: str) -> dict:
    """
    Query the configured relays (in parallel, first usable answer wins) for
    a kind:0 metadata event belonging to `pubkey_hex`. Returns a dict with
    `available: bool`; on success, the decoded profile fields plus which
    relay answered.
    """
    if not pubkey_hex:
        return {"available": False, "reason": "No pubkey provided."}

    relays = settings.nostr_relays
    if not relays:
        return {"available": False, "reason": "No relays configured."}

    timeout = settings.nostr_lookup_timeout_seconds

    tasks = [asyncio.create_task(_query_single_relay(r, pubkey_hex, timeout)) for r in relays]
    try:
        for finished in asyncio.as_completed(tasks, timeout=timeout + 1):
            try:
                event = await finished
            except Exception:
                continue
            if event is not None:
                for t in tasks:
                    t.cancel()
                return _profile_from_event(event)
    except asyncio.TimeoutError:
        pass
    finally:
        for t in tasks:
            if not t.done():
                t.cancel()

    return {
        "available": False,
        "reason": "No relay returned a profile for this pubkey within the timeout window.",
    }


def _profile_from_event(event: dict) -> dict:
    content_raw = event.get("content", "")
    try:
        profile = json.loads(content_raw) if isinstance(content_raw, str) else {}
    except json.JSONDecodeError:
        profile = {}

    return {
        "available": True,
        "name": profile.get("name"),
        "display_name": profile.get("display_name") or profile.get("displayName"),
        "about": profile.get("about"),
        "nip05": profile.get("nip05"),
        "picture": profile.get("picture"),
        "event_created_at": event.get("created_at"),
        "note": "Presence of a profile is observable evidence only — it does not confirm the identity's authenticity or intent.",
    }
