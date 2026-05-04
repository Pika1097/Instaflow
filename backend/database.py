from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError

from config import settings

client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.mongo_db_name]


async def ping_database():
    try:
        await client.admin.command("ping")
    except PyMongoError as exc:
        raise RuntimeError("Could not connect to MongoDB") from exc
