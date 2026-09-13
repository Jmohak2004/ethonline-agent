"""
AgentFi — The Graph Intelligence Service
Queries subgraphs (Uniswap v3, token flows, whale activities) to deliver real-time onchain metrics.
"""
from typing import Dict, Any, List, Optional
import httpx
import structlog
from dataclasses import dataclass

logger = structlog.get_logger()

# Default subgraphs on The Graph Decentralized Network / Studio
UNISWAP_V3_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
TOKEN_FLOWS_SUBGRAPH = "https://gateway.thegraph.com/api/subgraphs/id/ELUcwgpm14LKPLrBRuVvPvNKHQ9HvwmtKgKzk6P23dzC"

@dataclass
class TokenOnchainMetrics:
    token: str
    total_volume_usd: float
    liquidity_usd: float
    whale_activity_status: str # "ACCUMULATION", "DISTRIBUTION", "NEUTRAL"
    large_transfers_count_24h: int
    net_inflow_usd_24h: float
    evidence: List[str]

class GraphIntelligenceService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.headers = {"Content-Type": "application/json"}
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"

    async def execute_query(self, endpoint: str, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute a GraphQL query against The Graph and fail if unavailable."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    endpoint,
                    json={"query": query, "variables": variables or {}},
                    headers=self.headers
                )
                if response.status_code == 200:
                    data = response.json()
                    if "data" in data and data["data"]:
                        return data["data"]
        except Exception as e:
            logger.error("Graph query failed", error=str(e), endpoint=endpoint)
            raise RuntimeError("The Graph is unavailable") from e

    async def get_token_activity(self, token_symbol: str) -> TokenOnchainMetrics:
        raise RuntimeError(
            "Token activity requires a live subgraph query; no synthetic metrics are available"
        )

    async def get_whale_activity(self, token: str) -> Dict[str, Any]:
        metrics = await self.get_token_activity(token)
        return {
            "token": token,
            "status": metrics.whale_activity_status,
            "large_transfers_24h": metrics.large_transfers_count_24h,
            "net_inflow_usd": metrics.net_inflow_usd_24h,
            "evidence": metrics.evidence
        }

    async def get_liquidity(self, token: str) -> Dict[str, Any]:
        metrics = await self.get_token_activity(token)
        return {
            "token": token,
            "liquidity_usd": metrics.liquidity_usd,
            "24h_volume_usd": metrics.total_volume_usd,
            "slippage_estimate_1000usd": "0.02%"
        }
