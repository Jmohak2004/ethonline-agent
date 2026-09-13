import "../env";
import { DEFAULT_MODEL } from "../env";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

// Initialize Coinbase SDK for real on-chain execution
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

const executeSwapTool = createTool({
  id: "executeSwap",
  description: "Executes a real on-chain swap between two tokens on Base Sepolia.",
  inputSchema: z.object({
    tokenIn: z.string().describe("The token to sell, e.g. USDC"),
    tokenOut: z.string().describe("The token to buy, e.g. ETH"),
    amount: z.number().describe("The amount of tokenIn to swap"),
    network: z.string().optional().describe("The network, defaults to base-sepolia"),
  }),
  execute: async ({ context }: { context: { tokenIn: string; tokenOut: string; amount: number; network?: string } }) => {
    try {
      if (!isConfigured) {
        return {
          success: false,
          error: "CDP SDK is not configured. Missing CDP API keys in .env.",
        };
      }

      // Initialize wallet for execution
      let wallet: Wallet;
      try {
        wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
      } catch (e: any) {
        return { success: false, error: "Failed to initialize wallet: " + (e?.message || e) };
      }

      // Execute on-chain trade using official createTrade method
      const trade = await wallet.createTrade({
        amount: context.amount,
        fromAssetId: context.tokenIn.toLowerCase(),
        toAssetId: context.tokenOut.toLowerCase(),
      });

      await trade.wait();

      return {
        success: true,
        network: "base-sepolia",
        pair: `${context.tokenIn}/${context.tokenOut}`,
        amountSwapped: context.amount,
        status: trade.getStatus(),
        transactionLink: trade.getTransaction()?.getTransactionLink(),
        message: `Successfully swapped ${context.amount} ${context.tokenIn} for ${context.tokenOut} on Base Sepolia.`,
      };
    } catch (error: any) {
      if (error?.message && error.message.includes("insufficient")) {
        return {
          success: false,
          error: "INSUFFICIENT_FUNDS",
          message: `Agent wallet has insufficient ${context.tokenIn}. Please fund the agent wallet to execute this real on-chain swap.`,
        };
      }
      return { success: false, error: "Failed to execute swap: " + (error?.message || error) };
    }
  },
});

export const SwapAgent = new Agent({
  id: "swap-agent",
  name: "SwapAgent",
  instructions:
    "You are an AI Swap execution agent. You help users execute real on-chain swaps between tokens (e.g. USDC to ETH) on Base network using the Coinbase SDK. When a user asks to buy or sell, you execute the trade and return the transaction details.",
  model: DEFAULT_MODEL,
  tools: {
    executeSwap: executeSwapTool,
  },
});
