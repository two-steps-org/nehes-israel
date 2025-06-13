#!/usr/bin/env python3
"""
Test script to verify Twilio authentication
"""
import os
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

# Load environment variables
load_dotenv()

ACCOUNT_SID = os.getenv('ACCOUNT_SID')
AUTH_TOKEN = os.getenv('AUTH_TOKEN')
API_KEY_SID = os.getenv('API_KEY_SID')
API_KEY_SECRET = os.getenv('API_KEY_SECRET')

def test_credentials():
    print("=== Twilio Authentication Test ===")
    
    # Test Account SID format
    print(f"Account SID: {ACCOUNT_SID}")
    print(f"Account SID length: {len(ACCOUNT_SID) if ACCOUNT_SID else 0}")
    print(f"Account SID starts with 'AC': {ACCOUNT_SID.startswith('AC') if ACCOUNT_SID else False}")
    
    if not ACCOUNT_SID or len(ACCOUNT_SID) != 34:
        print("❌ ERROR: Account SID should be 34 characters long")
        return False
    
    print("✅ Account SID format looks correct")
    
    # Test API Key credentials
    print(f"API Key SID: {API_KEY_SID}")
    print(f"API Secret: {API_KEY_SECRET[:8]}..." if API_KEY_SECRET else "None")
    
    if not API_KEY_SID or not API_KEY_SECRET:
        print("❌ ERROR: API Key credentials missing")
        return False
    
    print("✅ API Key credentials present")
    
    # Test authentication
    try:
        print("\n=== Testing API Key Authentication ===")
        client = Client(API_KEY_SID, API_KEY_SECRET, ACCOUNT_SID)
        
        # Try to fetch account info (minimal API call)
        account = client.api.accounts(ACCOUNT_SID).fetch()
        print(f"✅ API Key Authentication successful!")
        print(f"Account Status: {account.status}")
        print(f"Account Type: {account.type}")
        
        return True
        
    except TwilioRestException as e:
        print(f"❌ API Key Authentication failed: {e}")
        print(f"Error Code: {e.code}")
        print(f"Error Message: {e.msg}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_auth_token_method():
    """Test the traditional Auth Token method"""
    try:
        print("\n=== Testing Auth Token Authentication ===")
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        
        # Try to fetch account info
        account = client.api.accounts(ACCOUNT_SID).fetch()
        print(f"✅ Auth Token Authentication successful!")
        print(f"Account Status: {account.status}")
        return True
        
    except TwilioRestException as e:
        print(f"❌ Auth Token Authentication failed: {e}")
        print(f"Error Code: {e.code}")
        if e.code == 20003:
            print("This is the 'Unable to create record: Authenticate' error")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def get_new_api_key():
    client = Client(ACCOUNT_SID, AUTH_TOKEN)

    new_api_key = client.iam.v1.new_api_key.create(
        friendly_name="Mario's API key",
        account_sid=ACCOUNT_SID,
    )

    print(new_api_key.sid)

if __name__ == "__main__":
    get_new_api_key()
    
    # if not success:
    #     print("\n=== Trying Auth Token method ===")
    #     test_auth_token_method()