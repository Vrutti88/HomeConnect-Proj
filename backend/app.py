from flask import Flask
from flask_cors import CORS
from config import Config
from database import db
from routes.auth import auth_bp
from routes.devices import devices_bp
from routes.automations import automations_bp
from routes.telemetry import telemetry_bp
from routes.alerts import alerts_bp
from routes.analytics import analytics_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True
    )
    db.init_app(app)

    @app.route("/")
    def home():
        return "HOMECONNECT WORKING"

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(devices_bp, url_prefix="/api/v1/devices")
    app.register_blueprint(automations_bp, url_prefix="/api/v1/automations")
    app.register_blueprint(telemetry_bp, url_prefix="/api/v1/telemetry")
    app.register_blueprint(alerts_bp, url_prefix="/api/v1/alerts")
    app.register_blueprint(analytics_bp, url_prefix="/api/v1/analytics")

    @app.route("/health")
    def health():
        return {"status": "ok"}

    with app.app_context():
        db.create_all()
        from seed import seed_data
        seed_data()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5001)
