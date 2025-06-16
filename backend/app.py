import os
import datetime
from flask import Flask, request, Response, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv

from twilio.twiml.voice_response import VoiceResponse, Dial, Number
from twilio.rest import Client

from lead_selector import select_leads

import gspread
from google.oauth2.service_account import Credentials

from flask_cors import CORS

from datetime import datetime


load_dotenv()
app = Flask(__name__)

# TODO: Change this in prod once nehes isreal gives their fucking domain 
CORS(app, origins="*")

# CORS(app, origins=[
#     "http://localhost:3000",
#     "https://the-actual-domain.com"
# ])

ACCOUNT_SID = os.getenv('ACCOUNT_SID')
AUTH_TOKEN = os.getenv('AUTH_TOKEN')
API_KEY_SID = os.getenv('API_KEY_SID')
API_KEY_SECRET = os.getenv('API_KEY_SECRET')
TWILIO_NUMBER = os.getenv('TWILIO_NUMBER')
GOOGLE_SHEET_ID = os.getenv('GOOGLE_SHEET_ID')
GOOGLE_API_JSON = os.getenv('GOOGLE_API_JSON')

CALLBACK_BASE = os.getenv('CALLBACK_BASE', 'https://t6d2lxxc1vjn.share.zrok.io/')
VOICE_ACCEPT_PATH = "/voice/accept"
VOICE_BUSY_PATH = "/voice/busy"

# Set environment mode: 'production' or 'development'
app.config['ENV'] = os.getenv('FLASK_ENV', 'development')  # Default is production

# Choose the correct Mongo URI
if app.config['ENV'] == 'development':
    mongo_uri = os.getenv('LOCAL_MONGO_URI')
else:
    mongo_uri = os.getenv('MONGO_URI')



client = MongoClient(mongo_uri)
db = client['nehes_israel']           # Replace with your database name
collection = db['my_db']

try:
    client = MongoClient(mongo_uri)
    db = client.admin
    server_status = db.command("serverStatus")
    print(f"Mongo URI: {mongo_uri}")
    print("✅ Connected to MongoDB!")
except Exception as e:
    print("❌ Connection failed:", e)


def log_request(name):
    print(f"\n====== Incoming Twilio Webhook ({name}) ======")
    print(f"Timestamp: {datetime.datetime.now()}")
    print(f"Remote Addr: {request.remote_addr}")
    print(f"Headers:\n{dict(request.headers)}")
    print(f"Form Data:\n{dict(request.form)}")
    print("Raw Body:\n", request.get_data(as_text=True))
    print("=====================================\n")

def gspread_client():
    creds = Credentials.from_service_account_file(
        GOOGLE_API_JSON, 
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return gspread.authorize(creds)

def log_call_to_sheet(call_sid, agent_number, customer_number, status="initiated", duration=None):
    try:
        gc = gspread_client()
        sh = gc.open_by_key(GOOGLE_SHEET_ID)
        sheet = sh.worksheet("call_history")
        row = [
            call_sid,
            datetime.datetime.utcnow().isoformat(),
            agent_number,
            customer_number,
            status,
            duration if duration else ""
        ]
        sheet.append_row(row)
    except Exception as exc:
        import traceback
        print(f"[Google Sheets] Failed to log: {exc}")
        traceback.print_exc()

def update_sheet_status(call_sid, status, duration=None, agent_number="", customer_number=""):
    try:
        gc = gspread_client()
        sh = gc.open_by_key(GOOGLE_SHEET_ID)
        sheet = sh.worksheet("call_history")
        # Fetch all and look for row with this SID in col 1
        records = sheet.get_all_records()
        for idx, rec in enumerate(records):
            rec_sid = str(rec.get("call_sid") or rec.get("id") or "").strip()
            if rec_sid == str(call_sid).strip():
                # Found, update status and duration (columns 5 and 6: E and F)
                rownum = idx + 2  # because get_all_records skips header, sheet row is idx+2
                sheet.update_cell(rownum, 5, status)
                if duration is not None:
                    sheet.update_cell(rownum, 6, duration)
                print(f"Updated row for CallSid {call_sid}: status={status}, duration={duration}")
                return
        # Not found, insert new (using whatever was given; Twilio will always send 'To' and 'From')
        sheet.append_row([
            call_sid,
            datetime.datetime.utcnow().isoformat(),
            agent_number,
            customer_number,
            status,
            duration if duration else ""
        ])
        print(f"Inserted log for new CallSid {call_sid}")
    except Exception as exc:
        import traceback
        print(f"[Google Sheets] Failed to update: {exc}")
        traceback.print_exc()

@app.route("/", methods=["GET"])
def index():
    return "Hello, World!"

@app.route("/health", methods=["GET"])
def health():
    return "OK"

@app.route("/triple_call", methods=['GET', 'POST'])
def triple_call_twiml():
    leads = select_leads()  # This should return a list of phone numbers as strings
    vr = VoiceResponse()
    dial = Dial()

    callback_url = request.url_root.rstrip("/") + "/twilio_callback"
    status_events = "initiated,ringing,answered,completed,busy,failed,no-answer,canceled"

    for n in leads:
        num = Number(
            n,
            status_callback=callback_url,
            status_callback_event=status_events,
            status_callback_method="POST"
        )
        dial.append(num)

    vr.append(dial)
    return Response(str(vr), mimetype="text/xml")

@app.route("/trigger_triple_call", methods=['POST'])
def trigger_triple_call():
    data = request.get_json(force=True)
    agent_number = data.get("agent")
    if not agent_number:
        return jsonify({"error": "Please provide 'agent' phone number."}), 400
    
    # Validate Twilio credentials
    if not ACCOUNT_SID or len(ACCOUNT_SID) != 34 or not ACCOUNT_SID.startswith('AC'):
        return jsonify({"error": "Invalid Twilio Account SID"}), 500
        
    if not API_KEY_SID or not API_KEY_SECRET:
        return jsonify({"error": "Missing Twilio API Key credentials"}), 500
    
    # twiml_url = request.url_root.rstrip("/") + "/triple_call"
    twiml_url = "http://localhost:5001/triple_call"
    # callback_url = request.url_root.rstrip("/") + "/twilio_callback"
    callback_url = "http://localhost:5001/twilio_callback"
    client = Client(API_KEY_SID, API_KEY_SECRET, ACCOUNT_SID)
    call = client.calls.create(
        to=agent_number,
        from_=TWILIO_NUMBER,
        url=twiml_url,
        method="POST",
        status_callback=callback_url,
        status_callback_event=["initiated","ringing","answered","completed","busy","failed","no-answer","canceled"],
        status_callback_method="POST"
    )
    return jsonify({"call_sid": call.sid})

@app.route("/target_call", methods=['GET', 'POST'])
def target_call_twiml():
    numbers = None
    if request.is_json:
        numbers = request.get_json(force=True).get("numbers")
    elif request.form.get("numbers"):
        numbers = request.form.get("numbers").split(",")
    elif request.args.get("numbers"):
        numbers = request.args.get("numbers").split(",")
    if not numbers:
        return Response("<Response><Say>No numbers provided</Say></Response>", mimetype="text/xml")
    vr = VoiceResponse()
    dial = Dial()
    callback_url = request.url_root.rstrip("/") + "/twilio_callback"
    for n in numbers:
        num = Number(
            n,
            status_callback=callback_url,
            status_callback_event="initiated ringing answered completed busy failed no-answer canceled",
            status_callback_method="POST"
        )
        dial.append(num)
    vr.append(dial)
    print("Returning TwiML:", str(vr))
    return Response(str(vr), mimetype="text/xml")


@app.route("/trigger_target_call", methods=['POST'])
def trigger_target_call():
    # TODO: ask karl regarding the twiml_url and all the configurations
    try:
        print("=== DEBUG: Starting trigger_target_call ===")
        
        # Validate Twilio credentials first
        if not ACCOUNT_SID or len(ACCOUNT_SID) != 34 or not ACCOUNT_SID.startswith('AC'):
            print(f"ERROR: Invalid ACCOUNT_SID: {ACCOUNT_SID} (length: {len(ACCOUNT_SID) if ACCOUNT_SID else 0})")
            return jsonify({"error": "Invalid Twilio Account SID"}), 500
            
        if not API_KEY_SID or not API_KEY_SECRET:
            print("ERROR: Missing API Key credentials")
            return jsonify({"error": "Missing Twilio API Key credentials"}), 500
        
        # Check if request has JSON
        if not request.is_json:
            print("ERROR: Request is not JSON")
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json(force=True)
        print(f"DEBUG: Received data: {data}")
        
        agent_number = data.get("agent")
        numbers = data.get("numbers")
        print(f"DEBUG: agent_number={agent_number}, numbers={numbers}")
        
        if not agent_number or not numbers or not isinstance(numbers, list):
            print("ERROR: Invalid parameters")
            return jsonify({"error": "Please provide 'agent' and list of 'numbers'!"}), 400
            
        # Check Twilio credentials
        print(f"DEBUG: ACCOUNT_SID: {ACCOUNT_SID[:10]}...")
        print(f"DEBUG: API_KEY_SID: {API_KEY_SID}")
        print(f"DEBUG: TWILIO_NUMBER: {TWILIO_NUMBER}")
        
        num_string = ",".join(numbers)
        twiml_url = request.url_root.rstrip("/") + f"/target_call?numbers={num_string}"
        print(f"DEBUG: twiml_url: {twiml_url}")
        
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        print("DEBUG: Twilio client created successfully")
        
        # what twiml_url is ?

        call = client.calls.create(
            to=agent_number,
            from_=TWILIO_NUMBER,
            url=twiml_url,
            method="POST"
        )
        print(f"DEBUG: Call created with SID: {call.sid}")
        
        return jsonify({"success": True, "message": "Call triggered successfully", "call_sid": call.sid})

    except Exception as e:
        print(f"ERROR: Exception occurred: {str(e)}")
        print(f"ERROR: Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        
        # Check if it's a Twilio authentication error
        if "authenticate" in str(e).lower() or "20003" in str(e):
            return jsonify({
                "error": "Twilio authentication failed. Please check your credentials.",
                "details": str(e),
                "solution": "Verify your Account SID is 34 characters and API keys are correct"
            }), 401
        
        return jsonify({"error": f"Failed to trigger call: {str(e)}"}), 500
    

@app.route("/twilio_callback",  methods=['GET', 'POST'])
def twilio_callback():
    if request.method == "POST":
        form = request.form
        print("[Twilio Callback] POST data:", dict(form))
    else:
        form = request.args
        print("[Twilio Callback] GET data:", dict(form))
        
    call_sid = form.get("CallSid")
    call_status = form.get("CallStatus")
    from_number = form.get("From")
    to_number = form.get("To")
    duration = form.get("CallDuration")
    print(f"[Twilio Callback] SID: {call_sid} | Status: {call_status} | From: {from_number} | To: {to_number} | Duration: {duration}")
    update_sheet_status(call_sid, call_status, duration, from_number, to_number)
    return ("", 204)

@app.route("/api/mongo-data", methods=["GET"])
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

@app.route('/api/update-missing-iscalls', methods=['POST'])
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


# @app.route("/call_history", methods=["GET"])
# def get_call_history():
#     gc = gspread_client()
#     sh = gc.open_by_key(GOOGLE_SHEET_ID)
#     sheet = sh.worksheet("call_history")
#     records = sheet.get_all_records()
#     # Ensure duration is always an int (if present)
#     for rec in records:
#         if "duration" in rec and isinstance(rec["duration"], str) and rec["duration"].isdigit():
#             rec["duration"] = int(rec["duration"])
#         elif "duration" in rec and rec["duration"] == "":
#             rec["duration"] = 0
#     # Reverse so latest calls (bottom rows) come first
#     return jsonify(records[::-1])

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)