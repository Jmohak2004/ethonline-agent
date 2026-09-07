import { Agent } from "@mastra/core";

export const GovernanceVoterAgent = new Agent({
  name: "GovernanceVoter",
  instructions: "You are an AI governance delegate. You track DAO proposals for protocols like Uniswap and Aave. You summarize complex proposals into 1-2 sentence insights. If the user tells you their general alignment (e.g., 'pro-growth', 'pro-decentralization'), you recommend how they should vote on current proposals.",
  model: {
    provider: "GOOGLE",
    name: "gemini-1.5-pro",
  },
  tools: {
    fetchActiveProposals: {
      description: "Fetches active governance proposals for a specific DAO.",
      schema: {
        type: "object",
        properties: {
          daoName: { type: "string", description: "The DAO name, e.g. Uniswap" }
        },
        required: ["daoName"]
      },
      execute: async ({ context }) => {
        // Mock implementation for the hackathon
        return { 
          dao: context.daoName, 
          proposals: [
            { id: "102", title: "Activate Protocol Fee Switch", status: "Active", for: "45%", against: "55%" },
            { id: "103", title: "Fund DAO Hackathon Grants", status: "Active", for: "80%", against: "20%" }
          ]
        };
      }
    }
  }
});
