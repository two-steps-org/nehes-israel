import os
from pymongo import MongoClient

FLASK_ENV = os.getenv('FLASK_ENV')
if FLASK_ENV == 'development':
    mongo_uri = os.getenv('LOCAL_MONGO_URI', 'mongodb://localhost:27017')
else:
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        raise RuntimeError('MONGO_URI environment variable must be set in production!')

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