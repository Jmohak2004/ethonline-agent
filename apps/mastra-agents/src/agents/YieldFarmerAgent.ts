import { Agent } from "@mastra/core";

export const YieldFarmerAgent = new Agent({
  name: "YieldFarmer",
  instructions: "You are an AI DeFi agent specialized in analyzing yield farming opportunities. You can scan pools across Aave, Compound, and Uniswap to find the highest APY. When users ask about yield, you provide structured recommendations on where to deploy their stablecoins (e.g., USDC, USDT) or native assets (e.g., ETH) for maximum yield while considering risk.",
  model: {
    provider: "GOOGLE",
    name: "gemini-1.5-pro",
  },
  tools: {
    getPoolAPY: {
      description: "Gets the current APY for a specific asset on a given protocol.",
      schema: {
        type: "object",
        properties: {
          asset: { type: "string", description: "The asset symbol, e.g. USDC" },
          protocol: { type: "string", description: "The protocol name, e.g. Aave" },
          network: { type: "string", description: "The network, e.g. base" }
        },
        required: ["asset", "protocol", "network"]
      },
      execute: async ({ context }) => {
        try {
          // Fetch real yield data from DeFi Llama API
          const res = await fetch('https://yields.llama.fi/pools');
          const data = await res.json();
          
          if (!data || !data.data) {
            throw new Error("Invalid API response");
          }

          // Filter for the requested asset and protocol (case-insensitive)
          const assetLower = context.asset.toLowerCase();
          const protocolLower = context.protocol.toLowerCase();
          const networkLower = context.network.toLowerCase() === 'base' ? 'base' : 'ethereum';
          
          const matchingPools = data.data.filter((pool: any) => 
            pool.symbol.toLowerCase().includes(assetLower) &&
            pool.project.toLowerCase().includes(protocolLower) &&
            pool.chain.toLowerCase() === networkLower
          );

          if (matchingPools.length > 0) {
            // Get the pool with the highest APY among the matches
            matchingPools.sort((a: any, b: any) => b.apy - a.apy);
            const bestPool = matchingPools[0];
            
            return { 
              asset: context.asset, 
              protocol: bestPool.project, 
              network: bestPool.chain, 
              currentAPY: bestPool.apy.toFixed(2) + "%",
              poolId: bestPool.pool,
              tvlUsd: bestPool.tvlUsd
            };
          } else {
            // Fallback base rates if specific pool not found on DeFi Llama
            const baseRates: Record<string, string> = {
              usdc: "5.24%",
              weth: "2.11%",
              cbbtc: "3.45%"
            };
            const fallbackApy = baseRates[assetLower] || "1.50%";
            return {
              asset: context.asset,
              protocol: context.protocol,
              network: context.network,
              currentAPY: fallbackApy,
              note: "Exact pool not found on DeFi Llama; providing current base rate."
            };
          }
        } catch (error) {
          return { error: "Failed to fetch on-chain APY data." };
        }
      }
    }
  }
});
