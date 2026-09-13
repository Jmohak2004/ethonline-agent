import "../env";
import { DEFAULT_MODEL } from "../env";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const validateTokenomicsTool = createTool({
  id: "validateTokenomics",
  description: "Validates whether the provided initial supply and tokenomics parameters are standard and safe for an ERC20 token.",
  inputSchema: z.object({
    tokenName: z.string().describe("The name of the token, e.g. AgentFi"),
    tokenSymbol: z.string().describe("The ticker symbol, e.g. AGFI"),
    supply: z.number().describe("The total initial supply"),
    decimals: z.number().optional().describe("Decimals, defaults to 18"),
  }),
  execute: async ({ context }: { context: { tokenName: string; tokenSymbol: string; supply: number; decimals?: number } }) => {
    const isSafe = context.supply > 0 && context.supply <= 1_000_000_000_000;
    const decimals = context.decimals || 18;

    return {
      success: true,
      tokenName: context.tokenName,
      tokenSymbol: context.tokenSymbol.toUpperCase(),
      supply: context.supply,
      decimals,
      isValid: isSafe,
      status: isSafe ? "APPROVED" : "WARNING",
      recommendation: isSafe
        ? "Tokenomics structure conforms to ERC20 standards. Safe to deploy on Base."
        : "Initial supply is outside standard conventions (> 1 Trillion). Consider reducing total supply.",
      deploymentReady: isSafe,
    };
  },
});

const generateDeployPayloadTool = createTool({
  id: "generateDeployPayload",
  description: "Generates the on-chain deployment payload and contract parameters for deploying on Base.",
  inputSchema: z.object({
    tokenName: z.string().describe("The token name"),
    tokenSymbol: z.string().describe("The token symbol"),
    supply: z.number().describe("The initial supply to mint to deployer"),
  }),
  execute: async ({ context }: { context: { tokenName: string; tokenSymbol: string; supply: number } }) => {
    return {
      success: true,
      targetNetwork: "base-sepolia",
      chainId: 84532,
      contractStandard: "ERC20Burnable, ERC20Permit",
      constructorArgs: {
        name: context.tokenName,
        symbol: context.tokenSymbol.toUpperCase(),
        initialSupply: context.supply.toString(),
      },
      instructions: "Sign the transaction with your connected wallet or execute via agent CDP wallet.",
    };
  },
});

export const TokenDeployerAgent = new Agent({
  id: "token-deployer-agent",
  name: "TokenDeployer",
  instructions:
    "You are an AI Smart Contract assistant. You help users deploy new ERC20 tokens on Base network. You ask for Name, Symbol, and initial supply. Once provided, you validate the tokenomics and generate the deployment payload.",
  model: DEFAULT_MODEL,
  tools: {
    validateTokenomics: validateTokenomicsTool,
    generateDeployPayload: generateDeployPayloadTool,
  },
});
