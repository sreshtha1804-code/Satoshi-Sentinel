import re

from fastapi import APIRouter, HTTPException

from app.services.bech32 import bech32_decode, convert_bits
from app.services.nostr_service import fetch_profile

router = APIRouter()

HEX64 = re.compile(r"^[0-9a-f]{64}$", re.IGNORECASE)


def _resolve_to_hex(pubkey: str) -> str | None:
    if HEX64.match(pubkey):
        return pubkey.lower()
    if pubkey.lower().startswith("npub1"):
        decoded = bech32_decode(pubkey)
        if not decoded or decoded.hrp != "npub":
            return None
        bytes_ = convert_bits(decoded.data, 5, 8, False)
        if bytes_ is None:
            return None
        return "".join(f"{b:02x}" for b in bytes_)
    return None


@router.get("/nostr/profile/{pubkey}")
async def get_nostr_profile(pubkey: str):
    pubkey_hex = _resolve_to_hex(pubkey)
    if pubkey_hex is None:
        raise HTTPException(
            status_code=400,
            detail="pubkey must be a 64-character hex string or a valid npub with a verifying checksum.",
        )

    profile = await fetch_profile(pubkey_hex)
    return {
        "pubkey_hex": pubkey_hex,
        "pubkey_valid_hex": True,
        "profile": profile,
    }
