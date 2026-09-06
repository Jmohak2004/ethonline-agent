# AgentFi: The AI-Powered WhatsApp Crypto Companion

## What is this project all about?
**AgentFi** is a fully autonomous, AI-driven decentralized finance (DeFi) assistant that lives directly inside WhatsApp. It abstracts away the massive friction of web3 (wallet seed phrases, complex dex interfaces, approving transactions, and chain-switching) into a natural language chat interface. Users simply text their AI assistant what they want to do—whether it's swapping tokens, checking market sentiment, or earning yield—and the agent executes it securely on-chain on their behalf.

## How is it unique and worthy?
Most crypto bots require you to export your private key to a Telegram bot (a massive security risk) or they force you into clunky web apps. AgentFi is unique because it combines **Multi-Party Computation (MPC)** with **Agentic AI** and **On-Chain Attestations**:
1. **Zero Private Key Exposure:** It uses Coinbase Developer Platform (CDP) MPC wallets. The agent can execute transactions on behalf of the user, but it *never* sees or stores a raw private key. The user retains full custody.
2. **Transparent AI:** AI in web3 is usually a "black box." We solved this by integrating the Ethereum Attestation Service (EAS). Every time our AI agent makes a market prediction or trading signal, it publishes an immutable attestation on-chain. Users can verify the AI's track record transparently.
3. **Frictionless UX:** By meeting users where they already are (WhatsApp) and using natural language (powered by Gemini), the barrier to entry for DeFi drops to zero.

## Notable Features
- **Natural Language Intent Routing:** Type "Swap 10 USDC for WETH" or "What's the market looking like today?", and the AI classifies the intent and routes it to the correct smart contract service.
- **CDP MPC Wallets:** Fully integrated automated wallet generation for every user linked to their phone number, completely non-custodial and secure.
- **DEX Aggregation & Swaps:** Automated on-chain swaps via Uniswap V3.
- **Auto-Yield via Aave V3:** Users can instruct the agent to deposit their idle USDC into Aave v3 to automatically earn yield, all through a text message.
- **On-Chain AI Attestations (EAS):** Publishing verifiable records of AI trading signals to Base/Sepolia.
- **Live Market Data:** Integration with live market feeds to provide users with up-to-date token prices and sentiment analysis.

## The Sponsor Stack
We have heavily utilized cutting-edge sponsor technologies to make this possible:

1. **Coinbase Developer Platform (CDP)**
   - Used for generating and managing **MPC Wallets** for users.
   - Facilitates secure, non-custodial transaction signing (`send_transaction`) for Aave approvals, supplies, and Uniswap trades without exposing raw private keys.
2. **Base (Network)**
   - The primary L2 execution layer for our smart contract interactions (Aave, Uniswap, EAS) providing fast and cheap transactions for the agent.
3. **Ethereum Attestation Service (EAS)**
   - Used to issue on-chain attestations for our AI agent's trading signals, ensuring that our AI's predictions are immutable, timestamped, and publicly verifiable.
4. **Uniswap**
   - Integrated for seamless token swaps, allowing the AI to route trades through Uniswap V3 pools when a user asks to buy or sell assets.
5. **Aave**
   - Integrated to provide "Auto-Yield" capabilities, allowing the AI to autonomously supply user's USDC to Aave liquidity pools to earn interest.
6. **Google Gemini (AI Agent Logic)**
   - Powers the core brain of the platform. Used for complex Natural Language Processing (NLP), intent classification, and generating the actual trading signals/market analysis that gets attested on-chain.
