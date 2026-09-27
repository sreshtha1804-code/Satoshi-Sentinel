from typing import Optional

from pydantic import BaseModel


class BitcoinAddressStructural(BaseModel):
    address: str
    is_valid_format: bool
    type: str
    network: str
    checksum_verified: bool
    notes: str


class BitcoinAddressResponse(BaseModel):
    structural: BitcoinAddressStructural
    public_data: dict
    # `public_data` is intentionally a free-form dict (not a strict nested
    # model): it always includes `available: bool`, plus either the public
    # fields (balance_sats, tx_count, ...) or a `reason` when unavailable.
    # See app/services/bitcoin_service.py.


class BitcoinTransactionResponse(BaseModel):
    txid: str
    public_data: dict


class BitcoinLookupError(BaseModel):
    error: str
    detail: str
    structural: Optional[BitcoinAddressStructural] = None
