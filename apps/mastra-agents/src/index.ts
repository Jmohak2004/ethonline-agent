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

// Example usage function to test an agent
async function testAgent() {
  console.log("Testing SwapAgent...");
  try {
    const response = await SwapAgent.generate("Swap 5 USDC to ETH on Base");
    console.log("Response:", response.text);
  } catch (err) {
    console.error("Error executing agent:", err);
  }
}

if (require.main === module) {
  testAgent();
}
