import asyncio
from dotenv import load_dotenv
load_dotenv()
from services.wallet.vault import WalletVaultService

async def main():
    service = WalletVaultService()
    print("Testing create_wallet...")
    address, enc = await service.create_wallet()
    print(f"Created wallet: {address}")
    
    print("Testing get_cdp_account...")
    account = await service.get_cdp_account(address)
    print(f"Loaded account: {account.address.address_id}")

if __name__ == "__main__":
    asyncio.run(main())
