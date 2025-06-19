from flask import Blueprint, request, jsonify
from utils.db import collection
from datetime import datetime

mongo_bp = Blueprint('mongo', __name__)

@mongo_bp.route("/api/mongo-data", methods=["GET"])
def get_mongo_data():
    try:
        page = int(request.args.get('page', 1))
        pageSize = int(request.args.get('pageSize', 10))
        
        pipeline = [
            {
                "$facet": {
                    "data": [
                        {"$skip": (page - 1) * pageSize},
                        {"$limit": pageSize}
                    ],
                    "metadata": [
                        {"$count": "total"},
                        {
                            "$addFields": {
                                "page": page,
                                "pageSize": pageSize,
                                "totalPages": {
                                    "$ceil": {"$divide": ["$total", pageSize]}
                                }
                            }
                        }
                    ]
                }
            },
            {
                "$project": {
                    "data": 1,
                    "metadata": {"$arrayElemAt": ["$metadata", 0]}
                }
            }
        ]

        result = list(collection.aggregate(pipeline))
        if not result:
            return jsonify({"data": [], "metadata": {}})
        response = result[0]
        # Add timestamp and convert ObjectId to string
        for record in response.get("data", []):
            record["timestamp"] = datetime.utcnow().isoformat()
            if "_id" in record:
                record["_id"] = str(record["_id"])
        return jsonify(response)
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