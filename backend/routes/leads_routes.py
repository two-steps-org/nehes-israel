from flask import Blueprint, request, jsonify
from utils.db import collection
from datetime import datetime

leads_bp = Blueprint('leads', __name__)

@leads_bp.route("/api/leads-data", methods=["GET"])
def get_leads_data():
    try:
        page = int(request.args.get('page', 1))
        pageSize = int(request.args.get('pageSize', 10))
        search = request.args.get('search', '')

        pipeline = [
            {
                "$facet": {
                    "data": [
                        {"$match": {"$or": [{"full_name": {"$regex": search, "$options": "i"}}, {"phone_number": {"$regex": search, "$options": "i"}}]}},
                        {"$skip": (page - 1) * pageSize},
                        {"$limit": pageSize}
                    ],
                    "metadata": [
                        {"$match": {"$or": [{"full_name": {"$regex": search, "$options": "i"}}, {"phone_number": {"$regex": search, "$options": "i"}}]}},
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

@leads_bp.route("/api/find-lead-by-phone", methods=["POST"])
def find_lead_by_phone():
    try:
        data = request.get_json()
        phone_number = data.get('phone_number', '').strip()
        
        if not phone_number:
            return jsonify({"error": "Phone number is required"}), 400
        
        # Clean phone number - remove country code prefix if present
        cleaned_phone = phone_number
        if phone_number.startswith('+972'):
            cleaned_phone = '0' + phone_number[4:]
        elif phone_number.startswith('972'):
            cleaned_phone = '0' + phone_number[3:]
        
        # Search for the lead by phone number
        lead = collection.find_one({"phone_number": cleaned_phone})
        
        if lead:
            # Convert ObjectId to string
            lead["_id"] = str(lead["_id"])
            lead["timestamp"] = datetime.utcnow().isoformat()
            
            # Find which page this lead would be on
            total_before = collection.count_documents({"_id": {"$lt": lead["_id"]}})
            page_size = 20  # Default page size
            page_number = (total_before // page_size) + 1
            
            return jsonify({
                "found": True,
                "lead": lead,
                "page": page_number
            })
        else:
            return jsonify({
                "found": False,
                "phone_number": phone_number,
                "message": "Lead not found in the system"
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@leads_bp.route('/api/update-missing-iscalls', methods=['POST'])
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
        "modified": result.matched_count
    }), 200
