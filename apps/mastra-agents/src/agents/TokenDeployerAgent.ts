import { Agent } from "@mastra/core";

export const TokenDeployerAgent = new Agent({
  name: "TokenDeployer",
  instructions: "You are an AI Smart Contract assistant. You help users deploy new ERC20 tokens. You ask for a Name, Symbol, and initial supply. Once provided, you validate the tokenomics and generate the deployment payload for the Base network.",
  model: {
    provider: "GOOGLE",
    name: "gemini-1.5-pro",
  },
  tools: {
    validateTokenomics: {
      description: "Validates if the provided initial supply and tokenomics are standard and safe.",
      schema: {
        type: "object",
        properties: {
          supply: { type: "number", description: "The total supply of the token" }
        },
        required: ["supply"]
      },
      execute: async ({ context }) => {
        // Mock implementation for the hackathon
        const isSafe = context.supply > 0 && context.supply <= 1_000_000_000_000;
        return { 
          isValid: isSafe,
          message: isSafe ? "Supply is within standard ranges." : "Supply is unusually high or invalid." 
        };
      }
    }
  }
});
