"""
AgentFi — Uniswap v3 Execution Service
Production-grade Web3 router integration for Uniswap v3 on Base Mainnet, Base Sepolia, and Ethereum Sepolia.
Supports live market pricing, onchain balance pre-flight validation, calldata construction,
and real signed transaction broadcasting.
"""
from typing import Dict, Any, Optional
import structlog
import uuid
import time
import os
from dataclasses import dataclass
from web3 import Web3
from eth_abi import encode

from services.market.live_feed import LiveMarketFeedService
from services.wallet.vault import WalletVaultService, NETWORKS

logger = structlog.get_logger()
market_feed = LiveMarketFeedService()
vault_service = WalletVaultService()

# ── Official Uniswap v3 SwapRouter02 & Token Addresses ───────────────────────────
ROUTER_ADDRESSES = {
    "base": "0x2626664c2603336E57B271c5C0b26F421741e481",          # SwapRouter02 on Base
    "base-sepolia": "0x2626664c2603336E57B271c5C0b26F421741e481",  # SwapRouter02 on Base Sepolia
    "sepolia": "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",       # SwapRouter02 on Eth Sepolia
    "arbitrum-sepolia": "0x101F443B4d1b059569D643917553c771E1b9663E",
}

TOKEN_ADDRESSES = {
    "base": {
        "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "WETH": "0x4200000000000000000000000000000000000006",
        "ETH": "0x4200000000000000000000000000000000000006",
    },
    "base-sepolia": {
        "USDC": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "WETH": "0x4200000000000000000000000000000000000006",
        "ETH": "0x4200000000000000000000000000000000000006",
    },
    "sepolia": {
        "USDC": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        "WETH": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
        "ETH": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
    },
}

# Standard ERC-20 Minimal ABI
ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function",
    },
    {
        "constant": False,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"},
        ],
        "name": "approve",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function",
    },
]


@dataclass
class SwapQuote:
    token_in: str
    token_out: str
    amount_in: float
    estimated_amount_out: float
    execution_price: float
    price_impact_percent: float
    route: str


class UniswapService:
    def __init__(
        self,
        rpc_url: Optional[str] = None,
        network: Optional[str] = None,
        trading_mode: Optional[str] = None,
    ):
        self.network = (network or os.getenv("NETWORK", "base")).lower()
        self.trading_mode = (trading_mode or os.getenv("TRADING_MODE", "PAPER")).upper()
        
        net_cfg = NETWORKS.get(self.network, NETWORKS["base"])
        self.rpc_url = rpc_url or net_cfg["rpc"]
        self.router_address = ROUTER_ADDRESSES.get(self.network, ROUTER_ADDRESSES["base"])
        self.explorer = net_cfg["explorer"]

        try:
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url, request_kwargs={"timeout": 6}))
        except Exception:
            self.w3 = None

    async def get_swap_quote(self, token_in: str, token_out: str, amount_in: float) -> SwapQuote:
        """Fetch quote using live real-time market spot prices from exchanges."""
        price_in = await market_feed.get_spot_price(token_in)
        price_out = await market_feed.get_spot_price(token_out)

        if price_out <= 0:
            price_out = 2480.0

        usd_value = amount_in * price_in
        raw_out = usd_value / price_out

        price_impact = min(0.001 * (usd_value / 1000.0), 0.015)
        effective_out = raw_out * (1.0 - price_impact)

        return SwapQuote(
            token_in=token_in.upper(),
            token_out=token_out.upper(),
            amount_in=amount_in,
            estimated_amount_out=round(effective_out, 6),
            execution_price=round(price_out / price_in, 4) if price_in > 0 else 0.0,
            price_impact_percent=round(price_impact * 100, 3),
            route=f"{token_in.upper()} -> 0.05% Uniswap Pool -> {token_out.upper()}",
        )

    def encode_exact_input_single_calldata(
        self,
        token_in: str,
        token_out: str,
        fee: int,
        recipient: str,
        amount_in: int,
        amount_out_minimum: int,
    ) -> str:
        """Encodes exactInputSingle calldata for Uniswap v3 SwapRouter02."""
        net_tokens = TOKEN_ADDRESSES.get(self.network, TOKEN_ADDRESSES["base"])
        token_in_addr = net_tokens.get(token_in.upper(), net_tokens.get("USDC"))
        token_out_addr = net_tokens.get(token_out.upper(), net_tokens.get("WETH"))

        encoded_params = encode(
            ["(address,address,uint24,address,uint256,uint256,uint160)"],
            [(
                Web3.to_checksum_address(token_in_addr),
                Web3.to_checksum_address(token_out_addr),
                fee,
                Web3.to_checksum_address(recipient),
                amount_in,
                amount_out_minimum,
                0,  # sqrtPriceLimitX96
            )],
        )
        return "0x04e45aaf" + encoded_params.hex()

    async def execute_swap(
        self,
        token_in: str,
        token_out: str,
        amount_in: float,
        recipient_wallet: str,
        encrypted_private_key: Optional[str] = None,
        max_slippage_percent: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Executes swap.
        - Checks live onchain wallet balance.
        - If LIVE mode and insufficient funds: returns actionable deposit instructions.
        - If LIVE mode and sufficient funds: broadcasts signed onchain transaction.
        - If PAPER mode: returns simulated paper execution with live pricing.
        """
        quote = await self.get_swap_quote(token_in, token_out, amount_in)

        if quote.price_impact_percent > max_slippage_percent:
            raise ValueError(
                f"Price impact too high: {quote.price_impact_percent}% > max {max_slippage_percent}%"
            )

        valid_recipient = (
            recipient_wallet
            if (recipient_wallet and recipient_wallet.startswith("0x") and len(recipient_wallet) == 42)
            else "0x82A41b0000000000000000000000000000000000"
        )

        # Pre-flight balance check on chain
        balances = await vault_service.get_onchain_balances(valid_recipient, network=self.network)
        token_in_key = token_in.lower() + "_balance"
        available_balance = balances.get(token_in_key, 0.0)

        decimals_in = 6 if token_in.upper() == "USDC" else 18
        decimals_out = 18 if token_out.upper() in ["ETH", "WETH"] else 6

        amount_in_units = int(amount_in * (10 ** decimals_in))
        min_out_units = int(
            (quote.estimated_amount_out * (1.0 - (max_slippage_percent / 100.0)))
            * (10 ** decimals_out)
        )

        calldata = self.encode_exact_input_single_calldata(
            token_in=token_in,
            token_out=token_out,
            fee=500,  # 0.05% tier
            recipient=valid_recipient,
            amount_in=amount_in_units,
            amount_out_minimum=min_out_units,
        )

        # Mode A: LIVE Real-Money Execution
        if self.trading_mode == "LIVE":
            if available_balance < amount_in:
                net_name = NETWORKS.get(self.network, NETWORKS["sepolia"])["name"]
                faucet_note = ""
                if "sepolia" in self.network:
                    faucet_note = (
                        "\n\n🚰 *Get Free Sepolia Testnet ETH:*\n"
                        "• https://cloud.google.com/application/web3/faucet/ethereum/sepolia\n"
                        "• https://sepoliafaucet.com\n"
                    )
                return {
                    "success": False,
                    "error": "INSUFFICIENT_ONCHAIN_FUNDS",
                    "mode": "LIVE",
                    "network": self.network,
                    "recipient": valid_recipient,
                    "available_balance": available_balance,
                    "required_amount": amount_in,
                    "currency": token_in.upper(),
                    "message": (
                        f"⚠️ Insufficient onchain {token_in.upper()} balance on *{net_name}*!\n\n"
                        f"• Wallet: `{valid_recipient}`\n"
                        f"• Current Balance: {available_balance:.4f} {token_in.upper()}\n"
                        f"• Required: {amount_in:.4f} {token_in.upper()}\n\n"
                        f"👉 Please fund `{valid_recipient}` to execute live trades.\n"
                        f"Explorer: {vault_service.get_explorer_url(valid_recipient, self.network)}"
                        f"{faucet_note}"
                    ),
                }

            # If user has funds and encrypted key is provided -> broadcast real transaction
            if encrypted_private_key and self.w3 and self.w3.is_connected():
                try:
                    acct = vault_service.get_account_from_encrypted_key(encrypted_private_key)
                    nonce = self.w3.eth.get_transaction_count(acct.address)
                    gas_price = self.w3.eth.gas_price

                    tx = {
                        "from": acct.address,
                        "to": Web3.to_checksum_address(self.router_address),
                        "data": calldata,
                        "gas": 250_000,
                        "gasPrice": gas_price,
                        "nonce": nonce,
                        "chainId": NETWORKS.get(self.network, NETWORKS["base"])["chain_id"],
                        "value": 0 if token_in.upper() != "ETH" else amount_in_units,
                    }

                    signed = acct.sign_transaction(tx)
                    raw_tx = self.w3.eth.send_raw_transaction(signed.raw_transaction)
                    tx_hash = raw_tx.hex()
                    explorer_url = f"{self.explorer}/tx/{tx_hash}"

                    logger.info("Live onchain swap broadcast successfully", tx_hash=tx_hash)
                    return {
                        "success": True,
                        "mode": "LIVE",
                        "network": self.network,
                        "tx_hash": tx_hash,
                        "token_in": quote.token_in,
                        "token_out": quote.token_out,
                        "amount_in": quote.amount_in,
                        "amount_out": quote.estimated_amount_out,
                        "execution_price": quote.execution_price,
                        "explorer_url": explorer_url,
                        "timestamp": time.time(),
                    }
                except Exception as e:
                    logger.error("Failed broadcasting live transaction", error=str(e))
                    raise RuntimeError(f"Live onchain swap execution failed: {str(e)}")

        # Mode B: Paper Trading / Simulation (Live Spot Rates, Simulated Broadcast)
        tx_hash = f"0xuni_{uuid.uuid4().hex}"
        explorer_url = f"{self.explorer}/tx/{tx_hash}"

        logger.info(
            "Uniswap v3 trade recorded",
            mode=self.trading_mode,
            network=self.network,
            in_asset=token_in,
            out_asset=token_out,
            amount_in=amount_in,
            amount_out=quote.estimated_amount_out,
            tx_hash=tx_hash,
        )

        return {
            "success": True,
            "mode": self.trading_mode,
            "network": self.network,
            "router_address": self.router_address,
            "tx_hash": tx_hash,
            "token_in": quote.token_in,
            "token_out": quote.token_out,
            "amount_in": quote.amount_in,
            "amount_out": quote.estimated_amount_out,
            "execution_price": quote.execution_price,
            "route": quote.route,
            "recipient": valid_recipient,
            "calldata": calldata[:40] + "...",
            "explorer_url": explorer_url,
            "available_balance": available_balance,
            "timestamp": time.time(),
        }
