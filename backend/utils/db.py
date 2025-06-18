import os
from pymongo import MongoClient

FLASK_ENV = os.getenv('FLASK_ENV')
mongo_uri = os.getenv('LOCAL_MONGO_URI') if FLASK_ENV == 'development' else os.getenv('MONGO_URI')

client = MongoClient(mongo_uri)
db = client['nehes_israel']
collection = db['my_db']

try:
    # Test connection
    client.admin.command("serverStatus")
    print(f"Mongo URI: {mongo_uri}") if FLASK_ENV == 'development' else None
    print("✅ Connected to MongoDB!")
except Exception as e:
    print("❌ Connection failed:", e) 