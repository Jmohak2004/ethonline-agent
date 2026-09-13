import "../env";
import { DEFAULT_MODEL } from "../env";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const getPoolAPYTool = createTool({
  id: "getPoolAPY",
  description: "Gets the current APY for a specific asset on a given protocol using real-time DeFi Llama data.",
  inputSchema: z.object({
    asset: z.string().describe("The asset symbol, e.g. USDC, ETH, WETH, cbBTC"),
    protocol: z.string().describe("The protocol name, e.g. Aave, Compound, Uniswap, Aerodrome"),
    network: z.string().describe("The network name, e.g. base, ethereum, arbitrum"),
  }),
  execute: async ({ context }: { context: { asset: string; protocol: string; network: string } }) => {
    try {
      // Fetch real yield data from DeFi Llama API
      const res = await fetch("https://yields.llama.fi/pools");
      const data: any = await res.json();

      if (!data || !data.data) {
        throw new Error("Invalid API response from DeFi Llama");
      }

      const assetLower = context.asset.toLowerCase();
      const protocolLower = context.protocol.toLowerCase();
      const networkLower = context.network.toLowerCase() === "base" ? "base" : context.network.toLowerCase();

      const matchingPools = data.data.filter(
        (pool: any) =>
          pool.symbol?.toLowerCase().includes(assetLower) &&
          pool.project?.toLowerCase().includes(protocolLower) &&
          pool.chain?.toLowerCase() === networkLower
      );

      if (matchingPools.length > 0) {
        matchingPools.sort((a: any, b: any) => (b.apy || 0) - (a.apy || 0));
        const bestPool = matchingPools[0];

        return {
          success: true,
          asset: context.asset,
          protocol: bestPool.project,
          network: bestPool.chain,
          currentAPY: `${Number(bestPool.apy).toFixed(2)}%`,
          poolId: bestPool.pool,
          tvlUsd: bestPool.tvlUsd,
        };
      } else {
        return {
          success: false,
          error: `No live DeFi Llama pool found for ${context.asset} on ${context.network}.`,
        };
      }
    } catch (error: any) {
      return { success: false, error: "Failed to fetch on-chain APY data: " + (error?.message || error) };
    }
  },
});

export const YieldFarmerAgent = new Agent({
  id: "yield-farmer-agent",
  name: "YieldFarmer",
  instructions:
    "You are an AI DeFi agent specialized in analyzing yield farming opportunities. You can scan pools across Aave, Compound, Aerodrome, and Uniswap to find the highest APY. When users ask about yield, you provide structured recommendations on where to deploy their stablecoins (e.g., USDC, USDT) or native assets (e.g., ETH) for maximum yield while considering risk.",
  model: DEFAULT_MODEL,
  tools: {
    getPoolAPY: getPoolAPYTool,
  },
});
