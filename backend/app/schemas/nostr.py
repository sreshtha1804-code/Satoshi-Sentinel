from typing import Optional

from pydantic import BaseModel


class NostrProfileResponse(BaseModel):
    pubkey_hex: str
    pubkey_valid_hex: bool
    profile: dict
    # Free-form dict: always includes `available: bool`, plus either the
    # decoded profile fields or a `reason` when unavailable. See
    # app/services/nostr_service.py.
