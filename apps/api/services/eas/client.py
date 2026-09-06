"""
AgentFi — EAS (Ethereum Attestation Service) Client
Issues on-chain attestations for AI Agent predictions so users don't have to trust a black box.
"""
import uuid
import time
import structlog
from typing import Dict, Any

logger = structlog.get_logger()

import os
import time
import structlog
from typing import Dict, Any
from web3 import Web3
from eth_abi import encode
from services.wallet.vault import WalletVaultService, NETWORKS

logger = structlog.get_logger()
vault_service = WalletVaultService()

# EAS Contract Addresses
EAS_ADDRESSES = {
    "sepolia": "0xC2679fEA5337eb638214Ea8F6aEd63259Faf2F22",
    "base-sepolia": "0x4200000000000000000000000000000000000021"
}

# Example Schema UID for AgentFi Signals (Pre-registered)
AGENTFI_SCHEMA_UID = "0x8fae8fc7be09d1c16eddfb49911e3b5087d16df3323a67039a8cbe06422201b1"

EAS_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {"internalType": "bytes32", "name": "schema", "type": "bytes32"},
                    {
                        "components": [
                            {"internalType": "address", "name": "recipient", "type": "address"},
                            {"internalType": "uint64", "name": "expirationTime", "type": "uint64"},
                            {"internalType": "bool", "name": "revocable", "type": "bool"},
                            {"internalType": "bytes32", "name": "refUID", "type": "bytes32"},
                            {"internalType": "bytes", "name": "data", "type": "bytes"},
                            {"internalType": "uint256", "name": "value", "type": "uint256"}
                        ],
                        "internalType": "struct AttestationRequestData",
                        "name": "data",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct AttestationRequest",
                "name": "request",
                "type": "tuple"
            }
        ],
        "name": "attest",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "payable",
        "type": "function"
    }
]

class EASClient:
    def __init__(self, network: str = None):
        self.network = (network or os.getenv("NETWORK", "sepolia")).lower()
        self.eas_address = EAS_ADDRESSES.get(self.network, EAS_ADDRESSES["sepolia"])
        
        net_cfg = NETWORKS.get(self.network, NETWORKS["sepolia"])
        self.rpc_url = net_cfg["rpc"]
        try:
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url, request_kwargs={"timeout": 6}))
        except Exception:
            self.w3 = None

    async def attest_signal(
        self, 
        agent_slug: str, 
        asset: str, 
        recommendation: str, 
        confidence: float
    ) -> Dict[str, Any]:
        """
        Submits a true on-chain attestation to the EAS contract.
        """
        sponsor_key = os.getenv("PLATFORM_SPONSOR_KEY")
        if not sponsor_key or not self.w3 or not self.w3.is_connected():
            return {
                "success": False,
                "error": "EAS_NOT_CONFIGURED",
                "message": "Real EAS requires PLATFORM_SPONSOR_KEY and Web3 connection."
            }

        try:
            acct = self.w3.eth.account.from_key(sponsor_key)
            eas_contract = self.w3.eth.contract(address=Web3.to_checksum_address(self.eas_address), abi=EAS_ABI)
            
            # Encode data: string agent_slug, string asset, string recommendation, uint256 confidence (scaled by 100)
            encoded_data = encode(["string", "string", "string", "uint256"], [
                agent_slug,
                asset,
                recommendation,
                int(confidence * 100)
            ])
            
            request = {
                "schema": bytes.fromhex(AGENTFI_SCHEMA_UID[2:]),
                "data": {
                    "recipient": "0x0000000000000000000000000000000000000000",
                    "expirationTime": 0,
                    "revocable": True,
                    "refUID": bytes([0] * 32),
                    "data": encoded_data,
                    "value": 0
                }
            }
            
            nonce = self.w3.eth.get_transaction_count(acct.address)
            gas_price = self.w3.eth.gas_price
            
            tx = eas_contract.functions.attest(request).build_transaction({
                "from": acct.address,
                "nonce": nonce,
                "gas": 400_000,
                "gasPrice": gas_price,
            })
            
            signed_tx = acct.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction).hex()
            
            # Note: The true UID requires listening to the event log, but for now we return the txn hash
            # and format the explorer URL to track the transaction.
            explorer_url = f"{NETWORKS[self.network]['explorer']}/tx/{tx_hash}"
            
            logger.info("EAS Attestation Published On-Chain", tx_hash=tx_hash)
            
            return {
                "success": True,
                "uid": tx_hash,
                "explorer_url": explorer_url,
                "timestamp": time.time(),
                "schema": "AgentFi_Trading_Signal_v1",
                "data": {
                    "agent": agent_slug,
                    "asset": asset,
                    "recommendation": recommendation,
                    "confidence": confidence
                }
            }
        except Exception as e:
            logger.error("EAS Attestation failed", error=str(e))
            return {"success": False, "error": "ATTESTATION_FAILED"}

eas_client = EASClient()
