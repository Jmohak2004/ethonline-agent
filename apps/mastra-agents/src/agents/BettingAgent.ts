import { Agent } from "@mastra/core";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

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

export const BettingAgent = new Agent({
  name: "BettingAgent",
  instructions: "You are an AI Prediction Market and Betting Agent. Users can ask you to 'bid against a currency' (e.g. short ETH) or place a bet on its price. You execute these 'bets' on-chain by swapping the asset for a stablecoin (USDC) to simulate shorting, or buying it to simulate longing.",
  model: {
    provider: "GOOGLE",
    name: "gemini-1.5-pro",
  },
  tools: {
    placeBet: {
      description: "Places an on-chain bet regarding a currency's price movement (long or short).",
      schema: {
        type: "object",
        properties: {
          asset: { type: "string", description: "The asset to bet on, e.g. ETH" },
          direction: { type: "string", description: "The direction of the bet: 'LONG' or 'SHORT'" },
          amountUsd: { type: "number", description: "The amount to bet in USD" }
        },
        required: ["asset", "direction", "amountUsd"]
      },
      execute: async ({ context }) => {
        try {
          if (!isConfigured) {
            return { error: "CDP SDK is not configured. Missing API keys in .env." };
          }

          // Fetch current price for context
          const cgId = context.asset.toLowerCase() === 'eth' || context.asset.toLowerCase() === 'weth' ? 'ethereum' : 'usd-coin';
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`);
          const data = await res.json();
          const currentPrice = data[cgId]?.usd || 0;

          // Determine swap path:
          // If SHORT (bid against): Sell Asset -> Buy USDC
          // If LONG (bid for): Sell USDC -> Buy Asset
          const tokenIn = context.direction.toUpperCase() === 'SHORT' ? context.asset : 'USDC';
          const tokenOut = context.direction.toUpperCase() === 'SHORT' ? 'USDC' : context.asset;
          
          let amountToSwap = context.amountUsd;
          if (tokenIn !== 'USDC' && currentPrice > 0) {
              amountToSwap = context.amountUsd / currentPrice; // Convert USD to Asset amount
          }

          // Execute via CDP
          let wallet: Wallet;
          try {
            wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
          } catch (e) {
            return { error: "Failed to initialize wallet." };
          }

          // Execute trade
          const trade = await wallet.trade({
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
            message: `Successfully placed a ${context.direction} bet on ${context.asset} on-chain! Swapped ${amountToSwap} ${tokenIn} for ${tokenOut}.`
          };
        } catch (error: any) {
          if (error.message && error.message.includes("insufficient")) {
            return {
               success: false,
               error: "INSUFFICIENT_FUNDS",
               message: `Agent wallet has insufficient funds to place this bet. Please fund the agent wallet.`
            };
          }
          return { success: false, error: "Failed to place bet on-chain: " + error.message };
        }
      }
    }
  }
});
