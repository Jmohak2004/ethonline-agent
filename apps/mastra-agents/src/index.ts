import "./env";
import { Mastra } from "@mastra/core";
import { YieldFarmerAgent } from "./agents/YieldFarmerAgent";
import { NFTAppraiserAgent } from "./agents/NFTAppraiserAgent";
import { GovernanceVoterAgent } from "./agents/GovernanceVoterAgent";
import { TokenDeployerAgent } from "./agents/TokenDeployerAgent";
import { ArbitrageScannerAgent } from "./agents/ArbitrageScannerAgent";
import { SwapAgent } from "./agents/SwapAgent";
import { BettingAgent } from "./agents/BettingAgent";

export const agents = {
  YieldFarmerAgent,
  NFTAppraiserAgent,
  GovernanceVoterAgent,
  TokenDeployerAgent,
  ArbitrageScannerAgent,
  SwapAgent,
  BettingAgent,
};

export const mastra = new Mastra({
  agents,
});

// Example usage function to test an agent
async function testAgent() {
  console.log("Testing SwapAgent...");
  try {
    const response = await SwapAgent.generate("Swap 5 USDC to ETH on Base");
    console.log("Response:", response.text);
  } catch (err: any) {
    console.error("Error executing agent:", err?.message || err);
  }
}

if (require.main === module) {
  testAgent();
}
