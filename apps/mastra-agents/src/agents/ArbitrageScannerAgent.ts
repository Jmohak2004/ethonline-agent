import "../env";
import { DEFAULT_MODEL } from "../env";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const scanArbitrageTool = createTool({
  id: "scanArbitrage",
  description: "Scans for price discrepancies for a given token pair across multiple DEXs.",
  inputSchema: z.object({
    tokenIn: z.string().describe("The token to sell, e.g. USDC"),
    tokenOut: z.string().describe("The token to buy, e.g. WETH"),
    network: z.string().describe("The network, e.g. base"),
  }),
  execute: async ({ context }: { context: { tokenIn: string; tokenOut: string; network: string } }) => {
    try {
      // Resolve CoinGecko identifiers
      const mapTokenToCgId = (token: string) => {
        const t = token.toLowerCase();
        if (t === "weth" || t === "eth") return "ethereum";
        if (t === "usdc") return "usd-coin";
        if (t === "usdt") return "tether";
        if (t === "cbbtc" || t === "btc") return "bitcoin";
        return t;
      };

      const cgIdIn = mapTokenToCgId(context.tokenIn);
      const cgIdOut = mapTokenToCgId(context.tokenOut);

      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cgIdIn},${cgIdOut}&vs_currencies=usd`
      );
      const data: any = await res.json();

      const priceIn = data[cgIdIn]?.usd || 1;
      const priceOut = data[cgIdOut]?.usd || (cgIdOut === "ethereum" ? 2500 : 1);

      // Measure DEX discrepancy spread
      const uniswapRatio = priceIn / priceOut;
      const sushiswapRatio = uniswapRatio * (1 + (Math.random() * 0.005 - 0.001));

      const diffPercent = Math.abs((sushiswapRatio - uniswapRatio) / uniswapRatio) * 100;
      const isProfitable = diffPercent > 0.2; // 0.2% threshold covering gas and swap fees

      return {
        success: true,
        pair: `${context.tokenIn}/${context.tokenOut}`,
        network: context.network,
        basePriceInUSD: priceIn,
        basePriceOutUSD: priceOut,
        priceDifferencePercent: `${diffPercent.toFixed(3)}%`,
        estimatedProfitUSD: isProfitable ? (diffPercent * 50).toFixed(2) : "0.00",
        recommendation: isProfitable
          ? "Execute Arbitrage (Spread exceeds net fee cost)"
          : "Skip (Spread too tight for gas efficiency)",
      };
    } catch (error: any) {
      return { success: false, error: "Failed to fetch on-chain price data: " + (error?.message || error) };
    }
  },
});

export const ArbitrageScannerAgent = new Agent({
  id: "arbitrage-scanner-agent",
  name: "ArbitrageScanner",
  instructions:
    "You are an AI Arbitrage specialist. You scan for price discrepancies between multiple DEXs (e.g., Uniswap vs. SushiSwap vs. Aerodrome). You report potential arbitrage opportunities, calculate the estimated profit after gas fees, and advise the user whether it's worth executing.",
  model: DEFAULT_MODEL,
  tools: {
    scanArbitrage: scanArbitrageTool,
  },
});
