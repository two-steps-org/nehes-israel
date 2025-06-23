from flask import Blueprint, request, Response, jsonify
from twilio.twiml.voice_response import VoiceResponse, Dial, Number
from twilio.rest import Client
#from utils.utils import update_sheet_status
import os
from flask_socketio import SocketIO

ACCOUNT_SID = os.getenv('ACCOUNT_SID')
AUTH_TOKEN = os.getenv('AUTH_TOKEN')
API_KEY_SID = os.getenv('API_KEY_SID')
API_KEY_SECRET = os.getenv('API_KEY_SECRET')
TWILIO_NUMBER = os.getenv('TWILIO_NUMBER')

twilio_bp = Blueprint('twilio', __name__)
BASE_URL = '/api/twilio'

@twilio_bp.route(f"{BASE_URL}/target_call", methods=['GET', 'POST'])
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
    callback_url = request.url_root.rstrip("/") + f"{BASE_URL}/twilio_callback"
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

@twilio_bp.route(f"{BASE_URL}/trigger_target_call", methods=['POST', 'GET'])
def trigger_target_call():
    try:
        print("=== DEBUG: Starting trigger_target_call ===")
        
        # Validate Twilio credentials firstAdd commentMore actions
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
        # once 
        twiml_url = request.url_root.rstrip("/") + f"{BASE_URL}/target_call?numbers={num_string}"
        print(f"DEBUG: twiml_url: {twiml_url}")
        
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        print("DEBUG: Twilio client created successfully")
        
        # what twiml_url is ?

        call = client.calls.create(
            to=agent_number,
            from_=TWILIO_NUMBER,
            url=twiml_url,
            method="POST",
            status_callback=request.url_root.rstrip("/") + f"{BASE_URL}/twilio_callback",
            status_callback_event=["initiated", "ringing", "answered", "completed"],
            status_callback_method="POST"
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
    

@twilio_bp.route(f"{BASE_URL}/twilio_callback",  methods=['GET', 'POST'])
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
    print(f"[Twilio Callback] SID: {call_sid} | \nStatus: {call_status} | \nFrom: {from_number} | \nTo: {to_number} | \nDuration: {duration}")
    #update_sheet_status(call_sid, call_status, duration, from_number, to_number)
    from app import socketio
    socketio.emit('call_status_update', {
        'call_sid': call_sid,
        'status': call_status,
        'from': from_number,
        'to': to_number,
        'duration': duration
    })
    return ("", 204) 


# TODO: might be relevant later -

# TODO: 1
# @twilio_bp.route(f"{BASE_URL}/triple_call", methods=['GET', 'POST'])
# def triple_call_twiml():
#     leads = select_leads()
#     vr = VoiceResponse()
#     dial = Dial()

#     callback_url = request.url_root.rstrip("/") + "/twilio_callback"
#     status_events = "initiated,ringing,answered,completed,busy,failed,no-answer,canceled"

#     for n in leads:
#         num = Number(
#             n,
#             status_callback=callback_url,
#             status_callback_event=status_events,
#             status_callback_method="POST"
#         )
#         dial.append(num)

#     vr.append(dial)
#     return Response(str(vr), mimetype="text/xml")

# TODO: 2
# @twilio_bp.route(f"{BASE_URL}/triple_call", methods=['GET', 'POST'])
# def triple_call_twiml():
#     leads = select_leads()  # This should return a list of phone numbers as strings
#     vr = VoiceResponse()
#     dial = Dial()

#     callback_url = request.url_root.rstrip("/") + "/twilio_callback"
#     status_events = "initiated,ringing,answered,completed,busy,failed,no-answer,canceled"

#     for n in leads:
#         num = Number(
#             n,
#             status_callback=callback_url,
#             status_callback_event=status_events,
#             status_callback_method="POST"
#         )
#         dial.append(num)

#     vr.append(dial)
#     return Response(str(vr), mimetype="text/xml")

# @twilio_bp.route(f"{BASE_URL}/trigger_triple_call", methods=['POST'])
# def trigger_triple_call():
#     data = request.get_json(force=True)
#     agent_number = data.get("agent")
#     if not agent_number:
#         agent_number = TWILIO_NUMBER
#         print(f"DEBUG: No Number Provided used agent number: {agent_number}")
#         return jsonify({"No Number Provided": "Used Twilio Number."})
    
#     # Validate Twilio credentials
#     if not ACCOUNT_SID or len(ACCOUNT_SID) != 34 or not ACCOUNT_SID.startswith('AC'):
#         return jsonify({"error": "Invalid Twilio Account SID"}), 500
        
#     if not API_KEY_SID or not API_KEY_SECRET:
#         return jsonify({"error": "Missing Twilio API Key credentials"}), 500
    
#     # twiml_url = request.url_root.rstrip("/") + "/triple_call"
#     twiml_url = "http://localhost:5001/triple_call"
#     # callback_url = request.url_root.rstrip("/") + "/twilio_callback"
#     callback_url = "http://localhost:5001/twilio_callback"
#     client = Client(API_KEY_SID, API_KEY_SECRET, ACCOUNT_SID)
#     call = client.calls.create(
#         to=agent_number,
#         from_=TWILIO_NUMBER,
#         url=twiml_url,
#         method="POST",
#         status_callback=callback_url,
#         status_callback_event=["initiated","ringing","answered","completed","busy","failed","no-answer","canceled"],
#         status_callback_method="POST"
#     )
#     return jsonify({"call_sid": call.sid})