"""
Structural Bitcoin address analysis only. This never contacts a node, an
indexer, or any external API — it checks the string's shape against known
encodings (base58 legacy formats, bech32/bech32m SegWit formats) and, for
bech32, verifies the built-in checksum. It never confirms an address has
been used, has a balance, or exists on the actual chain.

Mirrors frontend/src/utils/detectors/bitcoinAddress.js.
"""

import re
from dataclasses import dataclass, field

from app.services.bech32 import bech32_decode, convert_bits

BASE58_LEGACY = re.compile(r"^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$")
BASE58_TESTNET = re.compile(r"^[2mn][a-km-zA-HJ-NP-Z1-9]{25,34}$")
BECH32_CANDIDATE = re.compile(r"^(bc1|tb1|bcrt1)[a-z0-9]{6,87}$", re.IGNORECASE)

ADDRESS_SCAN_PATTERN = re.compile(
    r"\b(bc1[a-z0-9]{6,87}|tb1[a-z0-9]{6,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|[2mn][a-km-zA-HJ-NP-Z1-9]{25,34})\b",
    re.IGNORECASE,
)


@dataclass
class AddressClassification:
    address: str
    is_valid_format: bool
    type: str
    network: str
    checksum_verified: bool
    notes: str


def classify_address(raw: str) -> AddressClassification:
    address = (raw or "").strip()

    if BECH32_CANDIDATE.match(address):
        decoded = bech32_decode(address)
        if not decoded:
            return AddressClassification(
                address=address,
                is_valid_format=False,
                type="Unrecognized SegWit-style address",
                network="unknown",
                checksum_verified=False,
                notes="Starts like a bech32 address but the checksum does not verify.",
            )

        network = {"bc": "mainnet", "tb": "testnet", "bcrt": "regtest"}.get(decoded.hrp, "unknown")
        witness_version = decoded.data[0] if decoded.data else -1
        program = convert_bits(decoded.data[1:], 5, 8, False)
        program_len = len(program) if program is not None else -1

        addr_type = "Unknown SegWit version"
        if witness_version == 0 and program_len == 20:
            addr_type = "Native SegWit (P2WPKH)"
        elif witness_version == 0 and program_len == 32:
            addr_type = "Native SegWit script (P2WSH)"
        elif witness_version == 1 and program_len == 32:
            addr_type = "Taproot (P2TR)"

        expected_encoding = "bech32" if witness_version == 0 else "bech32m"
        encoding_matches = decoded.encoding == expected_encoding
        is_valid = program is not None and encoding_matches

        return AddressClassification(
            address=address,
            is_valid_format=is_valid,
            type=addr_type,
            network=network,
            checksum_verified=is_valid,
            notes=(
                "Bech32 checksum verified locally against the address string."
                if encoding_matches
                else f"Checksum uses {decoded.encoding} but witness version {witness_version} expects the other variant."
            ),
        )

    if BASE58_LEGACY.match(address):
        addr_type = "Legacy (P2PKH)" if address[0] == "1" else "Script / multisig-compatible (P2SH)"
        return AddressClassification(
            address=address,
            is_valid_format=True,
            type=addr_type,
            network="mainnet",
            checksum_verified=False,
            notes="Matches base58 legacy format and charset. Base58check digit-checksum is not verified in this phase.",
        )

    if BASE58_TESTNET.match(address):
        addr_type = "Script / multisig-compatible (P2SH, testnet)" if address[0] == "2" else "Legacy (P2PKH, testnet)"
        return AddressClassification(
            address=address,
            is_valid_format=True,
            type=addr_type,
            network="testnet",
            checksum_verified=False,
            notes="Matches base58 testnet format and charset. Base58check digit-checksum is not verified in this phase.",
        )

    return AddressClassification(
        address=address,
        is_valid_format=False,
        type="Unrecognized format",
        network="unknown",
        checksum_verified=False,
        notes="Does not match any known Bitcoin address encoding.",
    )


def extract_bitcoin_addresses(text: str) -> list[AddressClassification]:
    if not text:
        return []
    matches = ADDRESS_SCAN_PATTERN.findall(text)
    seen: set[str] = set()
    results: list[AddressClassification] = []
    for m in matches:
        if m in seen:
            continue
        seen.add(m)
        results.append(classify_address(m))
    return results
