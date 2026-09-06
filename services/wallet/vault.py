"""
AgentFi — Wallet Vault Service
Production-grade EVM wallet generation, AES-256-GCM encrypted private key custody,
and live onchain balance checking across Base and Ethereum testnet/mainnet.
"""
import os
import secrets
from typing import Dict, Any, Tuple, Optional
import structlog
from eth_account import Account
from web3 import Web3
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

logger = structlog.get_logger()

# Minimal ERC-20 ABI for querying balances & decimals
ERC20_BALANCE_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function",
    },
]

# Supported Networks & Verified Contracts
NETWORKS = {
    "base": {
        "name": "Base Mainnet",
        "chain_id": 8453,
        "rpc": os.getenv("BASE_RPC_URL", "https://mainnet.base.org"),
        "explorer": "https://basescan.org",
        "tokens": {
            "USDC": {"address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "decimals": 6},
            "WETH": {"address": "0x4200000000000000000000000000000000000006", "decimals": 18},
        },
    },
    "base-sepolia": {
        "name": "Base Sepolia",
        "chain_id": 84532,
        "rpc": os.getenv("BASE_SEPOLIA_RPC_URL", "https://sepolia.base.org"),
        "explorer": "https://sepolia.basescan.org",
        "tokens": {
            "USDC": {"address": "0x036CbD53842c5426634e7929541eC2318f3dCF7e", "decimals": 6},
            "WETH": {"address": "0x4200000000000000000000000000000000000006", "decimals": 18},
        },
    },
    "sepolia": {
        "name": "Ethereum Sepolia",
        "chain_id": 11155111,
        "rpc": os.getenv("SEPOLIA_RPC_URL", "https://ethereum-sepolia-rpc.publicnode.com"),
        "explorer": "https://sepolia.etherscan.io",
        "tokens": {
            "USDC": {"address": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", "decimals": 6},
            "WETH": {"address": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14", "decimals": 18},
        },
    },
}


class WalletVaultService:
    def __init__(self, master_secret: Optional[str] = None):
        self.master_secret = (
            master_secret
            or os.getenv("APP_SECRET_KEY")
            or "agentfi-production-master-secret-key-must-be-long"
        ).encode()

    def _derive_key(self, salt: bytes) -> bytes:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100_000,
        )
        return kdf.derive(self.master_secret)

    def encrypt_private_key(self, private_key_hex: str) -> str:
        """Encrypts an EVM private key using AES-256-GCM with a random salt and nonce."""
        salt = secrets.token_bytes(16)
        nonce = secrets.token_bytes(12)
        key = self._derive_key(salt)
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(nonce, private_key_hex.encode(), None)
        # Format: salt:nonce:ciphertext (all hex)
        return f"{salt.hex()}:{nonce.hex()}:{ciphertext.hex()}"

    def decrypt_private_key(self, encrypted_str: str) -> str:
        """Decrypts the AES-256-GCM encrypted private key back to hex."""
        parts = encrypted_str.split(":")
        if len(parts) != 3:
            raise ValueError("Invalid encrypted key format")
        salt = bytes.fromhex(parts[0])
        nonce = bytes.fromhex(parts[1])
        ciphertext = bytes.fromhex(parts[2])
        key = self._derive_key(salt)
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(nonce, ciphertext, None).decode()

    def create_wallet(self) -> Tuple[str, str]:
        """Generates a new cryptographic EVM account and returns (address, encrypted_key)."""
        acct = Account.create()
        encrypted_key = self.encrypt_private_key(acct.key.hex())
        logger.info("Generated new encrypted EVM wallet", address=acct.address)
        return acct.address, encrypted_key

    def get_account_from_encrypted_key(self, encrypted_key: str):
        """Reconstructs the eth_account object from encrypted key in memory."""
        raw_key = self.decrypt_private_key(encrypted_key)
        return Account.from_key(raw_key)

    async def auto_sponsor_wallet(self, target_address: str, network: str = "sepolia") -> bool:
        """
        Platform Sponsor / Auto-Faucet logic.
        Sends a small amount of native ETH to the newly created user wallet
        so they can trade immediately without paying gas (Gasless UX).
        """
        cfg = NETWORKS.get(network.lower(), NETWORKS["sepolia"])
        sponsor_key = os.getenv("PLATFORM_SPONSOR_KEY")
        if not sponsor_key:
            logger.warning("Auto-Faucet: PLATFORM_SPONSOR_KEY not set in .env. Faucet disabled.")
            return False
            
        try:
            w3 = Web3(Web3.HTTPProvider(cfg["rpc"]))
            if not w3.is_connected():
                return False
                
            sponsor_acct = w3.eth.account.from_key(sponsor_key)
            nonce = w3.eth.get_transaction_count(sponsor_acct.address)
            
            # Use EIP-1559 for safer real-money execution
            latest_block = w3.eth.get_block("latest")
            base_fee = latest_block.get('baseFeePerGas', w3.to_wei(1, 'gwei'))
            max_priority_fee = w3.to_wei(2, 'gwei')
            max_fee_per_gas = base_fee * 2 + max_priority_fee
            
            tx = {
                'nonce': nonce,
                'to': Web3.to_checksum_address(target_address),
                'value': w3.to_wei(0.002, 'ether'),
                'gas': 21000,
                'maxFeePerGas': max_fee_per_gas,
                'maxPriorityFeePerGas': max_priority_fee,
                'chainId': cfg["chain_id"],
                'type': 2
            }
            
            signed_tx = w3.eth.account.sign_transaction(tx, sponsor_key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            logger.info("Auto-Faucet: Sponsored new wallet with 0.002 ETH", target=target_address, tx_hash=tx_hash.hex())
            return True
        except Exception as e:
            logger.error("Auto-Faucet Error", error=str(e))
            return False

    def get_explorer_url(self, address: str, network: str = "base") -> str:
        cfg = NETWORKS.get(network.lower(), NETWORKS["base"])
        return f"{cfg['explorer']}/address/{address}"

    def get_web3_instance(self, network: str = "base") -> Optional[Web3]:
        cfg = NETWORKS.get(network.lower(), NETWORKS["base"])
        try:
            w3 = Web3(Web3.HTTPProvider(cfg["rpc"], request_kwargs={"timeout": 6}))
            return w3 if w3.is_connected() else None
        except Exception:
            return None

    async def get_onchain_balances(
        self,
        wallet_address: str,
        network: str = "base",
    ) -> Dict[str, Any]:
        """
        Queries live onchain balances for native ETH and major ERC-20s (USDC, WETH).
        Gracefully handles offline RPCs with safe fallback.
        """
        cfg = NETWORKS.get(network.lower(), NETWORKS["base"])
        result = {
            "address": wallet_address,
            "network": cfg["name"],
            "network_key": network,
            "chain_id": cfg["chain_id"],
            "eth_balance": 0.0,
            "usdc_balance": 0.0,
            "weth_balance": 0.0,
            "explorer_url": f"{cfg['explorer']}/address/{wallet_address}",
            "rpc_connected": False,
        }

        try:
            w3 = Web3(Web3.HTTPProvider(cfg["rpc"], request_kwargs={"timeout": 6}))
            if not w3.is_connected():
                return result

            result["rpc_connected"] = True
            checksum_addr = Web3.to_checksum_address(wallet_address)

            # Native ETH balance
            wei_balance = w3.eth.get_balance(checksum_addr)
            result["eth_balance"] = round(float(w3.from_wei(wei_balance, "ether")), 6)

            # Query ERC-20 tokens
            for symbol, token_info in cfg["tokens"].items():
                try:
                    token_addr = Web3.to_checksum_address(token_info["address"])
                    contract = w3.eth.contract(address=token_addr, abi=ERC20_BALANCE_ABI)
                    raw_bal = contract.functions.balanceOf(checksum_addr).call()
                    token_bal = raw_bal / (10 ** token_info["decimals"])
                    if symbol == "USDC":
                        result["usdc_balance"] = round(float(token_bal), 2)
                    elif symbol == "WETH":
                        result["weth_balance"] = round(float(token_bal), 6)
                except Exception as e:
                    logger.debug("Failed querying token balance", symbol=symbol, error=str(e))

        except Exception as e:
            logger.warning("Error fetching onchain balances", address=wallet_address, error=str(e))

        return result
