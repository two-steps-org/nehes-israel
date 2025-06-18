from flask import Blueprint, request, jsonify
from utils.db import collection
from datetime import datetime

mongo_bp = Blueprint('mongo', __name__)

@mongo_bp.route("/api/mongo-data", methods=["GET"])
def get_mongo_data():
    try:
        data = list(collection.find({}, {
            "_id": 0,
            "full_name": 1,
            "phone_number": 1,
            "project_name": 1,
            "isCalled": 1,
            "agentNumber": 1,  # make sure this exists in Mongo
            "timestamp": 1,
            "status": 1,
            "duration": 1,
            "customerNumber": 1
        }))
        for record in data:
            record["timestamp"] = datetime.utcnow().isoformat()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)})

@mongo_bp.route('/api/update-missing-iscalls', methods=['POST'])
def update_missing_iscalls():
    data = request.json
    phone_numbers = data.get('phoneNumbers', [])
    if not phone_numbers:
        return jsonify({"message": "No data to update"}), 400
    result = collection.update_many(
        {"phone_number": {"$in": phone_numbers}, "isCalled": {"$exists": False}},
        {"$set": {"isCalled": "no"}}
    )
    return jsonify({
        "matched": result.matched_count,
        "modified": result.modified_count
    }), 200 