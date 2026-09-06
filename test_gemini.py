import os
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

async def test():
    model = genai.GenerativeModel('gemini-1.5-flash')
    res = model.generate_content("I want to buy 100 USDC of ETH", generation_config={"response_mime_type": "application/json"})
    print(res.text)

asyncio.run(test())
