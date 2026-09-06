"""
AgentFi — Database Seed Script
Populates PostgreSQL with initial production-grade data:
- Core verified agents (WhaleWatcher Pro, MarketMind, NewsScout, SentimentAgent, RiskGuardian, ExecutionAgent)
- Agent Packs (Beginner Safety Pack, Balanced Alpha Pack, Autonomous Research Pack)
- Seed Demo Users with Privy smart accounts and risk profiles
- Initial portfolio positions and market signals
"""
import asyncio
import uuid
import structlog
from datetime import datetime, timezone

from database import engine, Base, AsyncSessionLocal
from models import (
    User, RiskProfile, Agent, AgentCapability, AgentPack, AgentPackItem,
    AgentReputation, PortfolioPosition, MarketSignal,
    UserRole, UserStatus, RiskLevel, AgentCategory, AgentPricingModel, AgentStatus, SignalType
)

logger = structlog.get_logger()


async def seed():
    logger.info("Starting AgentFi database seed...")

    from database import init_db
    await init_db()

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        from sqlalchemy import select
        existing_agent = await db.execute(select(Agent).limit(1))
        if existing_agent.scalar_one_or_none():
            logger.info("Database already seeded with agents, skipping duplicate seed.")
            return

        # ── 1. Seed Demo User & Risk Profile ─────────────────────────────────────
        demo_user = User(
            whatsapp_number="+14155238886",
            display_name="Alex Mercer (Demo)",
            role=UserRole.USER,
            status=UserStatus.ACTIVE,
            wallet_address="0x82A41b0000000000000000000000000000000000",
            email="demo@agentfi.eth"
        )
        db.add(demo_user)
        await db.flush()

        risk_prof = RiskProfile(
            user_id=demo_user.id,
            risk_level=RiskLevel.MEDIUM,
            maximum_trade_amount=20.0,
            daily_loss_limit=10.0,
            maximum_portfolio_exposure=40.0,
            automatic_execution_enabled=True,
            human_approval_threshold=25.0,
            stop_loss_percentage=5.0,
            take_profit_percentage=20.0,
            allowed_assets=["ETH", "WBTC", "USDC", "UNI", "LINK"],
            blocked_assets=["MEME", "DOGE"]
        )
        db.add(risk_prof)

        # ── 2. Seed Initial Portfolio ────────────────────────────────────────────
        pos_eth = PortfolioPosition(
            user_id=demo_user.id,
            asset="ETH",
            quantity=0.01509,
            entry_price=2450.00,
            current_price=2650.00
        )
        db.add(pos_eth)

        # ── 3. Seed Core AI Agents ───────────────────────────────────────────────
        agents_data = [
            {
                "name": "WhaleWatcher Pro",
                "slug": "whalewatcher-pro",
                "ens_name": "whalewatcher.agentfi.eth",
                "description": "Onchain whale transfer and DEX liquidity depth tracker powered by The Graph.",
                "category": AgentCategory.ONCHAIN,
                "price": 3.00,
                "pricing_model": AgentPricingModel.SUBSCRIPTION,
                "risk_level": RiskLevel.MEDIUM,
                "rating": 4.8,
                "active_users": 2340,
                "perf_score": 94.0,
                "capabilities": ["THE_GRAPH_QUERY", "WHALE_ACCUMULATION", "DEX_DEPTH"]
            },
            {
                "name": "MarketMind",
                "slug": "marketmind",
                "ens_name": "marketmind.agentfi.eth",
                "description": "Multi-timeframe technical momentum indicator and trend reversal calculator.",
                "category": AgentCategory.RESEARCH,
                "price": 3.00,
                "pricing_model": AgentPricingModel.SUBSCRIPTION,
                "risk_level": RiskLevel.MEDIUM,
                "rating": 4.7,
                "active_users": 1890,
                "perf_score": 91.0,
                "capabilities": ["RSI_14", "MACD_CROSSOVER", "VOLATILITY_PROFILING"]
            },
            {
                "name": "NewsScout",
                "slug": "newsscout",
                "ens_name": "newsscout.agentfi.eth",
                "description": "Ecosystem breaking news, governance catalysts, and protocol announcement monitor.",
                "category": AgentCategory.NEWS,
                "price": 0.00,
                "pricing_model": AgentPricingModel.FREE,
                "risk_level": RiskLevel.LOW,
                "rating": 4.9,
                "active_users": 3120,
                "perf_score": 88.0,
                "capabilities": ["NEWS_AGGREGATION", "CATALYST_DETECTION"]
            },
            {
                "name": "SentimentAgent",
                "slug": "sentiment-agent",
                "ens_name": "sentiment.agentfi.eth",
                "description": "Social narrative tracker, volume momentum extractor, and crowd sentiment analysis.",
                "category": AgentCategory.SENTIMENT,
                "price": 2.00,
                "pricing_model": AgentPricingModel.SUBSCRIPTION,
                "risk_level": RiskLevel.MEDIUM,
                "rating": 4.6,
                "active_users": 1450,
                "perf_score": 86.0,
                "capabilities": ["SOCIAL_SENTIMENT", "NARRATIVE_EXTRACTION"]
            },
            {
                "name": "RiskGuardian",
                "slug": "riskguardian",
                "ens_name": "riskguardian.agentfi.eth",
                "description": "Chainlink CRE confidential TEE risk engine with strict fail-closed safety guardrails.",
                "category": AgentCategory.RISK,
                "price": 0.00,
                "pricing_model": AgentPricingModel.FREE,
                "risk_level": RiskLevel.LOW,
                "rating": 5.0,
                "active_users": 4890,
                "perf_score": 99.0,
                "capabilities": ["FAIL_CLOSED_VALIDATION", "TEE_CONFIDENTIAL_RISK", "POSITION_SIZING"]
            },
            {
                "name": "ExecutionAgent",
                "slug": "execution-agent",
                "ens_name": "execution.agentfi.eth",
                "description": "DeFi automated swap router executing through Uniswap v3 with slippage protection.",
                "category": AgentCategory.TRADING,
                "price": 0.00,
                "pricing_model": AgentPricingModel.PAY_PER_USE,
                "risk_level": RiskLevel.MEDIUM,
                "rating": 4.9,
                "active_users": 2100,
                "perf_score": 96.0,
                "capabilities": ["UNISWAP_V3_SWAP", "SLIPPAGE_PROTECTION", "TX_RECEIPTS"]
            }
        ]

        created_agents = {}
        for a_data in agents_data:
            agent = Agent(
                developer_id=demo_user.id,
                name=a_data["name"],
                slug=a_data["slug"],
                ens_name=a_data["ens_name"],
                description=a_data["description"],
                category=a_data["category"],
                price=a_data["price"],
                pricing_model=a_data["pricing_model"],
                risk_level=a_data["risk_level"],
                rating=a_data["rating"],
                rating_count=120,
                active_users=a_data["active_users"],
                performance_score=a_data["perf_score"],
                reliability_score=98.5,
                maximum_drawdown=-4.2,
                status=AgentStatus.PUBLISHED,
                capabilities=a_data["capabilities"],
            )
            db.add(agent)
            await db.flush()
            created_agents[a_data["slug"]] = agent

            # Reputation record
            rep = AgentReputation(
                agent_id=agent.id,
                reputation_score=a_data["perf_score"],
                performance_score=a_data["perf_score"],
                risk_adjusted_score=92.0,
                reliability_score=98.5,
                user_rating_score=a_data["rating"] * 20.0,
                completed_tasks=154,
                failed_tasks=3,
                uptime_percentage=99.9
            )
            db.add(rep)

            # Capabilities
            for cap in a_data["capabilities"]:
                db.add(AgentCapability(agent_id=agent.id, capability=cap))

        # ── 4. Seed Agent Packs ──────────────────────────────────────────────────
        alpha_pack = AgentPack(
            developer_id=demo_user.id,
            name="Balanced Alpha Pack",
            slug="alpha-pack",
            description="Our flagship multi-agent suite coordinating onchain whale flows, sentiment, and execution.",
            price=5.00,
            pricing_model=AgentPricingModel.SUBSCRIPTION,
            rating=4.8,
            active_users=2840,
            status=AgentStatus.PUBLISHED,
        )
        db.add(alpha_pack)
        await db.flush()

        for slug in ["newsscout", "marketmind", "whalewatcher-pro", "sentiment-agent", "riskguardian"]:
            if slug in created_agents:
                db.add(AgentPackItem(pack_id=alpha_pack.id, agent_id=created_agents[slug].id))

        beginner_pack = AgentPack(
            developer_id=demo_user.id,
            name="Beginner Safety Pack",
            slug="beginner-pack",
            description="Perfect for new crypto investors. Covers news catalysts, technical filters, and strict risk limits.",
            price=3.00,
            pricing_model=AgentPricingModel.SUBSCRIPTION,
            rating=4.9,
            active_users=1420,
            status=AgentStatus.PUBLISHED,
        )
        db.add(beginner_pack)
        await db.flush()

        for slug in ["newsscout", "marketmind", "riskguardian"]:
            if slug in created_agents:
                db.add(AgentPackItem(pack_id=beginner_pack.id, agent_id=created_agents[slug].id))

        # ── 5. Seed Initial Market Signal ────────────────────────────────────────
        sig = MarketSignal(
            agent_id=created_agents["whalewatcher-pro"].id,
            asset="ETH",
            signal_type=SignalType.POTENTIAL_UPSIDE,
            confidence=0.81,
            risk_level=RiskLevel.MEDIUM,
            evidence=[
                "Whale inflow 24h: $18.4M",
                "Subgraph source: Uniswap v3 WETH/USDC",
                "3 wallets holding >10k ETH accumulated $18.4M in past 24h"
            ],
            recommendation="POTENTIAL_OPPORTUNITY"
        )
        db.add(sig)

        await db.commit()
        logger.info("AgentFi database seed successfully completed!")


if __name__ == "__main__":
    asyncio.run(seed())
