import "../env";
import { DEFAULT_MODEL } from "../env";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

const initializeCoinbase = () => {
  const apiKeyName =
    process.env.CDP_API_KEY_NAME ||
    process.env.CDP_LIVE_API_KEY_NAME ||
    process.env.CDP_SANDBOX_API_KEY_NAME;
  const rawKey =
    process.env.CDP_API_KEY_PRIVATE_KEY ||
    process.env.CDP_LIVE_API_KEY_PRIVATE_KEY ||
    process.env.CDP_SANDBOX_API_KEY_PRIVATE_KEY;
  const apiPrivateKey = rawKey?.replace(/\\n/g, "\n");

  if (apiKeyName && apiPrivateKey) {
    try {
      Coinbase.configure({ apiKeyName, privateKey: apiPrivateKey });
      return true;
    } catch (err) {
      console.warn("Coinbase configuration error:", err);
      return false;
    }
  }
  return false;
};

const isConfigured = initializeCoinbase();

const placeBetTool = createTool({
  id: "placeBet",
  description: "Places an on-chain bet regarding a currency's price movement (long or short) using Base Sepolia.",
  inputSchema: z.object({
    asset: z.string().describe("The asset to bet on, e.g. ETH"),
    direction: z.enum(["LONG", "SHORT"]).describe("The direction of the bet: 'LONG' or 'SHORT'"),
    amountUsd: z.number().describe("The amount to bet in USD"),
  }),
  execute: async ({ context }: { context: { asset: string; direction: "LONG" | "SHORT"; amountUsd: number } }) => {
    try {
      if (!isConfigured) {
        return {
          success: false,
          error: "CDP SDK is not configured. Missing CDP API keys in .env.",
        };
      }

      // Fetch current price for context
      const cgId =
        context.asset.toLowerCase() === "eth" || context.asset.toLowerCase() === "weth"
          ? "ethereum"
          : context.asset.toLowerCase();
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`);
      const data: any = await res.json();
      const currentPrice = data[cgId]?.usd || 2500;

      // Determine swap path:
      // If SHORT: Sell Asset -> Buy USDC
      // If LONG: Sell USDC -> Buy Asset
      const tokenIn = context.direction.toUpperCase() === "SHORT" ? context.asset : "USDC";
      const tokenOut = context.direction.toUpperCase() === "SHORT" ? "USDC" : context.asset;

      let amountToSwap = context.amountUsd;
      if (tokenIn !== "USDC" && currentPrice > 0) {
        amountToSwap = Number((context.amountUsd / currentPrice).toFixed(6));
      }

      let wallet: Wallet;
      try {
        wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
      } catch (e: any) {
        return { success: false, error: "Failed to initialize wallet: " + (e?.message || e) };
      }

      const trade = await wallet.createTrade({
        amount: amountToSwap,
        fromAssetId: tokenIn.toLowerCase(),
        toAssetId: tokenOut.toLowerCase(),
      });

      await trade.wait();

      return {
        success: true,
        network: "base-sepolia",
        betType: context.direction.toUpperCase(),
        asset: context.asset,
        entryPriceUsd: currentPrice,
        amountWagered: amountToSwap,
        status: trade.getStatus(),
        transactionLink: trade.getTransaction()?.getTransactionLink(),
        message: `Successfully placed a ${context.direction} position on ${context.asset} on-chain! Swapped ${amountToSwap} ${tokenIn} for ${tokenOut}.`,
      };
    } catch (error: any) {
      if (error?.message && error.message.includes("insufficient")) {
        return {
          success: false,
          error: "INSUFFICIENT_FUNDS",
          message: `Agent wallet has insufficient funds to execute this position. Please fund the agent wallet on Base Sepolia.`,
        };
      }
      return { success: false, error: "Failed to execute bet on-chain: " + (error?.message || error) };
    }
  },
});

export const BettingAgent = new Agent({
  id: "betting-agent",
  name: "BettingAgent",
  instructions:
    "You are an AI Prediction Market and Betting Agent. Users can ask you to 'bid against a currency' (e.g. short ETH) or place a bet on its price. You execute these positions on-chain by swapping the asset for a stablecoin (USDC) to simulate shorting, or buying it to simulate longing.",
  model: DEFAULT_MODEL,
  tools: {
    placeBet: placeBetTool,
  },
});
