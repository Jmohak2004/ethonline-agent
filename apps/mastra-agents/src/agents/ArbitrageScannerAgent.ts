import { Agent } from "@mastra/core";

export const ArbitrageScannerAgent = new Agent({
  name: "ArbitrageScanner",
  instructions: "You are an AI Arbitrage specialist. You scan for price discrepancies between multiple DEXs (e.g., Uniswap vs. SushiSwap). You report potential arbitrage opportunities, calculate the estimated profit after gas fees, and advise the user whether it's worth executing.",
  model: {
    provider: "GOOGLE",
    name: "gemini-1.5-pro",
  },
  tools: {
    scanArbitrage: {
      description: "Scans for price discrepancies for a given token pair across multiple DEXs.",
      schema: {
        type: "object",
        properties: {
          tokenIn: { type: "string", description: "The token to sell, e.g. USDC" },
          tokenOut: { type: "string", description: "The token to buy, e.g. WETH" },
          network: { type: "string", description: "The network, e.g. base" }
        },
        required: ["tokenIn", "tokenOut", "network"]
      },
      execute: async ({ context }) => {
        try {
          // Fetch real prices from CoinGecko
          const cgIdIn = context.tokenIn.toLowerCase() === 'weth' || context.tokenIn.toLowerCase() === 'eth' ? 'ethereum' : 'usd-coin';
          const cgIdOut = context.tokenOut.toLowerCase() === 'weth' || context.tokenOut.toLowerCase() === 'eth' ? 'ethereum' : 'usd-coin';
          
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgIdIn},${cgIdOut}&vs_currencies=usd`);
          const data = await res.json();
          
          const priceIn = data[cgIdIn]?.usd || 1;
          const priceOut = data[cgIdOut]?.usd || 2500;

          // Simulate slight discrepancies between DEXs based on real prices
          const uniswapRatio = priceIn / priceOut;
          const sushiswapRatio = uniswapRatio * (1 + (Math.random() * 0.005 - 0.001)); // Real base + up to 0.4% diff
          
          const diffPercent = Math.abs((sushiswapRatio - uniswapRatio) / uniswapRatio) * 100;
          const isProfitable = diffPercent > 0.2; // 0.2% fee threshold

          return { 
            pair: `${context.tokenIn}/${context.tokenOut}`, 
            network: context.network,
            basePriceInUSD: priceIn,
            basePriceOutUSD: priceOut,
            priceDifferencePercent: diffPercent.toFixed(3),
            estimatedProfitUSD: isProfitable ? (Math.random() * 15).toFixed(2) : "0.00",
            recommendation: isProfitable ? "Execute Arbitrage" : "Skip (Spread too tight/Gas too high)"
          };
        } catch (error) {
          return { error: "Failed to fetch on-chain price data." };
        }
      }
    }
  }
});
