"""
Local, dependency-free implementation of the Bech32 / Bech32m encodings
defined in BIP-173 and BIP-350. Used to structurally validate SegWit and
Taproot Bitcoin addresses, and Nostr NIP-19 identifiers (npub/note),
entirely offline. This performs checksum math only — it never contacts a
network and never confirms anything against the blockchain.

This mirrors frontend/src/utils/detectors/bech32.js so both sides of the
app agree on address classification.
"""

from dataclasses import dataclass

CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
BECH32_CONST = 1
BECH32M_CONST = 0x2BC830A3


def _polymod(values: list[int]) -> int:
    gen = [0x3B6A57B2, 0x26508E6D, 0x1EA119FA, 0x3D4233DD, 0x2A1462B3]
    chk = 1
    for v in values:
        top = chk >> 25
        chk = ((chk & 0x1FFFFFF) << 5) ^ v
        for i in range(5):
            if (top >> i) & 1:
                chk ^= gen[i]
    return chk & 0xFFFFFFFF


def _hrp_expand(hrp: str) -> list[int]:
    out = [ord(c) >> 5 for c in hrp]
    out.append(0)
    out.extend(ord(c) & 31 for c in hrp)
    return out


def _verify_checksum(hrp: str, data: list[int]) -> str | None:
    combined = _polymod(_hrp_expand(hrp) + data)
    if combined == BECH32_CONST:
        return "bech32"
    if combined == BECH32M_CONST:
        return "bech32m"
    return None


@dataclass(frozen=True)
class Bech32Decoded:
    hrp: str
    data: list[int]
    encoding: str


def bech32_decode(bech_input: str) -> Bech32Decoded | None:
    """Decode a bech32/bech32m string, or return None if malformed."""
    if not isinstance(bech_input, str) or len(bech_input) < 8 or len(bech_input) > 90:
        return None
    if bech_input != bech_input.lower() and bech_input != bech_input.upper():
        return None
    s = bech_input.lower()
    pos = s.rfind("1")
    if pos < 1 or pos + 7 > len(s):
        return None
    hrp = s[:pos]
    data_part = s[pos + 1:]
    data = []
    for ch in data_part:
        idx = CHARSET.find(ch)
        if idx == -1:
            return None
        data.append(idx)
    encoding = _verify_checksum(hrp, data)
    if not encoding:
        return None
    return Bech32Decoded(hrp=hrp, data=data[:-6], encoding=encoding)


def convert_bits(data: list[int], from_bits: int, to_bits: int, pad: bool) -> list[int] | None:
    """Convert between bit-group sizes (5-bit bech32 groups <-> 8-bit bytes)."""
    acc = 0
    bits = 0
    out: list[int] = []
    maxv = (1 << to_bits) - 1
    for value in data:
        if value < 0 or (value >> from_bits) != 0:
            return None
        acc = (acc << from_bits) | value
        bits += from_bits
        while bits >= to_bits:
            bits -= to_bits
            out.append((acc >> bits) & maxv)
    if pad:
        if bits > 0:
            out.append((acc << (to_bits - bits)) & maxv)
    elif bits >= from_bits or ((acc << (to_bits - bits)) & maxv):
        return None
    return out
