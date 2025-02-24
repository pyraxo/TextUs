from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from .config import get_settings


class Database:
    def __init__(self):
        settings = get_settings()
        self.client = AsyncIOMotorClient(settings.mongo_uri)

    async def start(self):
        settings = get_settings()
        await init_beanie(self.client[settings.mongo_db_name], document_models=[])

    def close(self):
        self.client.close()
