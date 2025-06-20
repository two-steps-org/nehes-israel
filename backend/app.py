from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from flask_socketio import SocketIO
from routes.twilio_routes import twilio_bp
from routes.mongo_routes import mongo_bp
from routes.base_routes import base_bp
import os

load_dotenv()
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# TODO: Change this in prod
CORS(app, origins="*")

# CORS(app, origins=[
#     "http://localhost:3000",
#     "https://the-actual-domain.com"
# ]) 

app.register_blueprint(base_bp)
app.register_blueprint(twilio_bp)
app.register_blueprint(mongo_bp)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)