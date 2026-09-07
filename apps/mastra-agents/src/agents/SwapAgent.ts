import { Agent } from "@mastra/core";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

// Initialize Coinbase SDK for real on-chain execution
const initializeCoinbase = () => {
  const apiKeyName = process.env.CDP_API_KEY_NAME;
  const apiPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (apiKeyName && apiPrivateKey) {
    Coinbase.configure({ apiKeyName, privateKey: apiPrivateKey });
    return true;
  }
  return false;
};

const isConfigured = initializeCoinbase();

export const SwapAgent = new Agent({
  name: "SwapAgent",
  instructions: "You are an AI Swap execution agent. You help users execute real on-chain swaps between tokens (e.g. USDC to ETH) on Base network using the Coinbase SDK. When a user asks to buy or sell, you execute the trade and return the transaction details.",
  model: {
    provider: "GOOGLE",
    name: "gemini-1.5-pro",
  },
  tools: {
    executeSwap: {
      description: "Executes a real on-chain swap between two tokens.",
      schema: {
        type: "object",
        properties: {
          tokenIn: { type: "string", description: "The token to sell, e.g. USDC" },
          tokenOut: { type: "string", description: "The token to buy, e.g. ETH" },
          amount: { type: "number", description: "The amount of tokenIn to swap" },
          network: { type: "string", description: "The network, e.g. base-sepolia" }
        },
        required: ["tokenIn", "tokenOut", "amount"]
      },
      execute: async ({ context }) => {
        try {
          if (!isConfigured) {
            return { error: "CDP SDK is not configured. Missing API keys in .env." };
          }

          // In a real scenario, you'd load the specific user's wallet. 
          // For the hackathon agent execution, we use a default agent wallet.
          let wallet: Wallet;
          try {
            // Attempt to load an existing wallet or create a new one for the agent
            wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
            // Note: In production, save/load the wallet seed to persist state
          } catch (e) {
            return { error: "Failed to initialize wallet." };
          }

          // Execute the actual on-chain trade
          const trade = await wallet.trade({
            amount: context.amount,
            fromAssetId: context.tokenIn.toLowerCase(),
            toAssetId: context.tokenOut.toLowerCase(),
          });

          // Wait for the trade to be mined
          await trade.wait();

          return { 
            success: true,
            network: "base-sepolia",
            pair: `${context.tokenIn}/${context.tokenOut}`, 
            amountSwapped: context.amount,
            status: trade.getStatus(),
            transactionLink: trade.getTransaction()?.getTransactionLink(),
            message: `Successfully swapped ${context.amount} ${context.tokenIn} for ${context.tokenOut} on Base Sepolia.`
          };
        } catch (error: any) {
          console.error("Swap error:", error);
          // If insufficient funds, return a graceful error with funding instructions
          if (error.message && error.message.includes("insufficient")) {
            return {
               success: false,
               error: "INSUFFICIENT_FUNDS",
               message: `Agent wallet has insufficient ${context.tokenIn}. Please fund the agent wallet to execute this real on-chain swap.`
            };
          }
          return { success: false, error: "Failed to execute swap: " + error.message };
        }
      }
    }
  }
});
