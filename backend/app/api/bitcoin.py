from fastapi import APIRouter

from app.services.bitcoin_address import classify_address
from app.services.bitcoin_service import fetch_address_info, fetch_transaction_info

router = APIRouter()


@router.get("/bitcoin/address/{address}")
async def get_bitcoin_address(address: str):
    structural = classify_address(address)
    public_data = await fetch_address_info(address)
    return {
        "structural": {
            "address": structural.address,
            "is_valid_format": structural.is_valid_format,
            "type": structural.type,
            "network": structural.network,
            "checksum_verified": structural.checksum_verified,
            "notes": structural.notes,
        },
        "public_data": public_data,
    }


@router.get("/bitcoin/transaction/{txid}")
async def get_bitcoin_transaction(txid: str):
    public_data = await fetch_transaction_info(txid)
    return {
        "txid": txid,
        "public_data": public_data,
    }
