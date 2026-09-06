import asyncio
from cdp import CdpClient
async def main():
    async with CdpClient(api_key_id="test", private_key="test\n") as c:
        print(dir(c.evm))
asyncio.run(main())
