import sys
import asyncio
from sqlalchemy.future import select

# Add to path so imports work
sys.path.insert(0, ".")

from database import init_db, AsyncSessionLocal
from models import User, UserRole, UserStatus, Agent, AgentCategory, AgentStatus, AgentPricingModel, RiskLevel, AgentPack, AgentPackItem

async def seed():
    await init_db()
    async with AsyncSessionLocal() as session:
        # Create a default developer if not exists
        dev_stmt = select(User).where(User.whatsapp_number == "+10000000000")
        dev_res = await session.execute(dev_stmt)
        developer = dev_res.scalar_one_or_none()
        
        if not developer:
            developer = User(
                whatsapp_number="+10000000000",
                role=UserRole.AGENT_DEVELOPER,
                status=UserStatus.ACTIVE,
                wallet_address="0xDeveloperWallet00000000000000000000"
            )
            session.add(developer)
            await session.commit()
            await session.refresh(developer)
        
        agents_data = [
            {
                "slug": "whalewatcher-pro",
                "name": "WhaleWatcher Pro",
                "category": AgentCategory.ONCHAIN,
                "description": "Onchain whale tracking and large movement alerts.",
                "price": 10.0
            },
            {
                "slug": "marketmind",
                "name": "MarketMind",
                "category": AgentCategory.TRADING,
                "description": "RSI & momentum trading execution engine.",
                "price": 15.0
            },
            {
                "slug": "newsscout",
                "name": "NewsScout",
                "category": AgentCategory.NEWS,
                "description": "Real-time crypto news and event monitoring.",
                "price": 5.0
            },
            {
                "slug": "sentiment-agent",
                "name": "Sentiment Agent",
                "category": AgentCategory.SENTIMENT,
                "description": "Social media and market sentiment analysis.",
                "price": 5.0
            },
            {
                "slug": "riskguardian",
                "name": "RiskGuardian",
                "category": AgentCategory.RISK,
                "description": "Portfolio risk manager and stop-loss enforcer.",
                "price": 20.0
            },
            {
                "slug": "execution-agent",
                "name": "Execution Agent",
                "category": AgentCategory.AUTOMATION,
                "description": "Uniswap V3 execution and slippage optimization.",
                "price": 0.0
            }
        ]

        created_agents = []
        for a_data in agents_data:
            stmt = select(Agent).where(Agent.slug == a_data["slug"])
            res = await session.execute(stmt)
            agent = res.scalar_one_or_none()
            
            if not agent:
                agent = Agent(
                    name=a_data["name"],
                    slug=a_data["slug"],
                    category=a_data["category"],
                    description=a_data["description"],
                    price=a_data["price"],
                    developer_id=developer.id,
                    status=AgentStatus.PUBLISHED,
                    pricing_model=AgentPricingModel.SUBSCRIPTION,
                    risk_level=RiskLevel.MEDIUM
                )
                session.add(agent)
                print(f"Created agent: {agent.name}")
            else:
                print(f"Agent {agent.name} already exists.")
            created_agents.append(agent)
            
        await session.commit()
        
        # Create alpha-pack
        pack_stmt = select(AgentPack).where(AgentPack.slug == "alpha-pack")
        pack_res = await session.execute(pack_stmt)
        pack = pack_res.scalar_one_or_none()
        
        if not pack:
            pack = AgentPack(
                name="Balanced Alpha Pack",
                slug="alpha-pack",
                description="A curated bundle of market analysis, risk management, and execution agents.",
                price=5.0, # The price expected in message_router.py
                pricing_model=AgentPricingModel.SUBSCRIPTION,
                developer_id=developer.id,
                status=AgentStatus.PUBLISHED
            )
            session.add(pack)
            await session.commit()
            await session.refresh(pack)
            
            # Add some agents to pack
            for idx, a in enumerate(created_agents):
                # Add marketmind, riskguardian, execution-agent
                if a.slug in ["marketmind", "riskguardian", "execution-agent"]:
                    item = AgentPackItem(
                        pack_id=pack.id,
                        agent_id=a.id,
                        order=idx
                    )
                    session.add(item)
            await session.commit()
            print("Created Balanced Alpha Pack")
        else:
            print("Pack already exists")

        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
