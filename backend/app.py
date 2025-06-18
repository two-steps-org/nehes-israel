from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from routes.twilio_routes import twilio_bp
from routes.mongo_routes import mongo_bp
from routes.base_routes import base_bp

load_dotenv()
app = Flask(__name__)

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
    app.run(host='0.0.0.0', port=5001, debug=True)