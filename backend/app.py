from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from flask_socketio import SocketIO
import os

load_dotenv()
app = Flask(__name__)

# Enhanced SocketIO configuration for production
socketio = SocketIO(
    app, 
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    async_mode='eventlet',  # or 'gevent'
    ping_timeout=60,
    ping_interval=25
)

# CORS configuration
CORS(app, origins="*", allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

# CORS(app, origins=[
#     "http://localhost:3000",
#     "https://the-actual-domain.com"
# ])

# Import routes after creating socketio instance to avoid circular imports
from routes.twilio_routes import create_twilio_bp
from routes.leads_routes import leads_bp
from routes.base_routes import base_bp

# Create twilio blueprint with socketio instance
twilio_bp = create_twilio_bp(socketio)

app.register_blueprint(base_bp)
app.register_blueprint(twilio_bp)
app.register_blueprint(leads_bp)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
