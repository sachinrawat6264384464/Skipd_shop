import asyncio
import httpx

async def test_endpoint():
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get("http://127.0.0.1:8080/api/v1/payments/admin/all")
            print(f"STATUS: {res.status_code}")
            print(f"COUNT: {len(res.json())}")
            print(f"DATA: {res.json()}")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_endpoint())
