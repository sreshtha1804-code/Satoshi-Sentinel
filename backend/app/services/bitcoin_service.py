"""
Bitcoin public-data lookups. Calls a public block explorer API (mempool.space
by default, configurable via BITCOIN_API_BASE_URL) purely to surface
already-public on-chain facts (balance, tx count, confirmation status) —
never anything that requires a key or credential. Every call has a strict
timeout and every failure degrades gracefully: callers always get a
response, with `available: False` and a reason instead of an exception,
because a hackathon demo (and a real user mid-investigation) should never
be blocked by a third-party API being slow or down.
"""

import httpx

from app.core.config import settings


async def fetch_address_info(address: str) -> dict:
    """
    Fetch public on-chain summary info for an address. Returns a dict with
    `available: bool`; when False, `reason` explains why (timeout, network
    error, not found, etc.) rather than raising.
    """
    url = f"{settings.bitcoin_api_base_url}/address/{address}"
    try:
        async with httpx.AsyncClient(timeout=settings.bitcoin_lookup_timeout_seconds) as client:
            resp = await client.get(url)
        if resp.status_code == 404:
            return {"available": False, "reason": "Address not found in the public index (may be unused)."}
        resp.raise_for_status()
        data = resp.json()
        chain_stats = data.get("chain_stats", {}) or {}
        mempool_stats = data.get("mempool_stats", {}) or {}
        funded = chain_stats.get("funded_txo_sum", 0) or 0
        spent = chain_stats.get("spent_txo_sum", 0) or 0
        return {
            "available": True,
            "balance_sats": funded - spent,
            "tx_count": chain_stats.get("tx_count", 0),
            "pending_tx_count": mempool_stats.get("tx_count", 0),
            "source": "mempool.space",
        }
    except httpx.TimeoutException:
        return {"available": False, "reason": "Public data lookup timed out."}
    except httpx.HTTPStatusError as exc:
        return {"available": False, "reason": f"Public data source returned an error ({exc.response.status_code})."}
    except httpx.RequestError:
        return {"available": False, "reason": "Could not reach the public data source."}
    except Exception:
        return {"available": False, "reason": "Unexpected error while fetching public data."}


async def fetch_transaction_info(txid: str) -> dict:
    """Fetch public info for a transaction id, degrading gracefully on failure."""
    url = f"{settings.bitcoin_api_base_url}/tx/{txid}"
    try:
        async with httpx.AsyncClient(timeout=settings.bitcoin_lookup_timeout_seconds) as client:
            resp = await client.get(url)
        if resp.status_code == 404:
            return {"available": False, "reason": "Transaction not found in the public index."}
        resp.raise_for_status()
        data = resp.json()
        status = data.get("status", {}) or {}
        return {
            "available": True,
            "confirmed": bool(status.get("confirmed", False)),
            "block_height": status.get("block_height"),
            "fee_sats": data.get("fee"),
            "input_count": len(data.get("vin", []) or []),
            "output_count": len(data.get("vout", []) or []),
            "source": "mempool.space",
        }
    except httpx.TimeoutException:
        return {"available": False, "reason": "Public data lookup timed out."}
    except httpx.HTTPStatusError as exc:
        return {"available": False, "reason": f"Public data source returned an error ({exc.response.status_code})."}
    except httpx.RequestError:
        return {"available": False, "reason": "Could not reach the public data source."}
    except Exception:
        return {"available": False, "reason": "Unexpected error while fetching public data."}
