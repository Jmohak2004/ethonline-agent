import { Agent } from "@mastra/core";

export const NFTAppraiserAgent = new Agent({
  name: "NFTAppraiser",
  instructions: "You are an AI specialized in evaluating NFT collections. You analyze floor prices, recent sales, and the rarity of specific tokens. When users provide a collection name or token ID, you evaluate its market value and give insights on whether it's overvalued or a good deal.",
  model: {
    provider: "GOOGLE",
    name: "gemini-1.5-pro",
  },
  tools: {
    getCollectionFloor: {
      description: "Gets the current floor price for an NFT collection.",
      schema: {
        type: "object",
        properties: {
          collectionName: { type: "string", description: "The name of the NFT collection" },
          network: { type: "string", description: "The network, e.g. base" }
        },
        required: ["collectionName"]
      },
      execute: async ({ context }) => {
        // Mock implementation for the hackathon
        return { 
          collection: context.collectionName, 
          floorPriceETH: Math.random() * 2 + 0.1, 
          volume24hETH: Math.random() * 50 + 10 
        };
      }
    }
  }
});
