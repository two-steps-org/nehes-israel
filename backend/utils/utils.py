import os
import datetime
import gspread
from google.oauth2.service_account import Credentials
from flask import request

GOOGLE_SHEET_ID = os.getenv('GOOGLE_SHEET_ID')
GOOGLE_API_JSON = os.getenv('GOOGLE_API_JSON')

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

# We're not using google sheets for now
# def log_call_to_sheet(call_sid, agent_number, customer_number, status="initiated", duration=None):
#     try:
#         gc = gspread_client()
#         sh = gc.open_by_key(GOOGLE_SHEET_ID)
#         sheet = sh.worksheet("call_history")
#         row = [
#             call_sid,
#             datetime.datetime.utcnow().isoformat(),
#             agent_number,
#             customer_number,
#             status,
#             duration if duration else ""
#         ]
#         sheet.append_row(row)
#     except Exception as exc:
#         import traceback
#         print(f"[Google Sheets] Failed to log: {exc}")
#         traceback.print_exc()

# def update_sheet_status(call_sid, status, duration=None, agent_number="", customer_number=""):
#     try:
#         gc = gspread_client()
#         sh = gc.open_by_key(GOOGLE_SHEET_ID)
#         sheet = sh.worksheet("call_history")
#         # Fetch all and look for row with this SID in col 1
#         records = sheet.get_all_records()
#         for idx, rec in enumerate(records):
#             rec_sid = str(rec.get("call_sid") or rec.get("id") or "").strip()
#             if rec_sid == str(call_sid).strip():
#                 # Found, update status and duration (columns 5 and 6: E and F)
#                 rownum = idx + 2  # because get_all_records skips header, sheet row is idx+2
#                 sheet.update_cell(rownum, 5, status)
#                 if duration is not None:
#                     sheet.update_cell(rownum, 6, duration)
#                 print(f"Updated row for CallSid {call_sid}: status={status}, duration={duration}")
#                 return
#         # Not found, insert new (using whatever was given; Twilio will always send 'To' and 'From')
#         sheet.append_row([
#             call_sid,
#             datetime.datetime.utcnow().isoformat(),
#             agent_number,
#             customer_number,
#             status,
#             duration if duration else ""
#         ])
#         print(f"Inserted log for new CallSid {call_sid}")
#     except Exception as exc:
#         import traceback
#         print(f"[Google Sheets] Failed to update: {exc}")
#         traceback.print_exc() 