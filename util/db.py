import os
from pymongo import MongoClient

class MongoSync:
    __client = None

    @classmethod
    def get_client(cls):
        if cls.__client is None:
            cls.__client = MongoClient(
                f"mongodb+srv://{os.getenv('MONGO_USER')}:{os.getenv('MONGO_PASSWD')}@ac-f7n4bxh-shard-00-02.qxfls1g.mongodb.net/?authSource=admin&retryWrites=true&w=majority&appName=ClusterDnD",
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                directConnection=True
            )
        return cls.__client

    @classmethod
    def close_client(cls):
        if cls.__client:
            cls.__client.close()
            cls.__client = None
