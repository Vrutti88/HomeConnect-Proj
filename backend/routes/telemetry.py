from flask import Blueprint, request, jsonify
from database import db
from models import TelemetryLog, Device, AutomationRule, Alert
from auth_helper import token_required
from routes.automations import evaluate_rule, execute_rule
from datetime import datetime, timedelta
from services.device_auth_service import validate_device
from services.gateway_service import process_gateway

telemetry_bp = Blueprint("telemetry", __name__)


@telemetry_bp.route("", methods=["POST"])
@token_required
def ingest_telemetry(current_user):
    """
    Ingest a telemetry reading from a device.
    Also evaluates threshold-based automation rules.
    """
    data = process_gateway(
        request.get_json()
    )
    device_id = data.get("device_id")
    metric = data.get("metric")
    value = data.get("value")
    unit = data.get("unit", "")

    device = Device.query.filter_by(id=device_id, user_id=current_user.id).first_or_404()

    log = TelemetryLog(device_id=device_id, metric=metric, value=value, unit=unit)
    db.session.add(log)
    device.last_seen = datetime.utcnow()
    device.status = "online"
    db.session.commit()

    # Evaluate threshold automations
    rules = AutomationRule.query.filter_by(
        user_id=current_user.id, trigger_type="threshold", is_enabled=True
    ).all()
    triggered = []
    for rule in rules:
        if evaluate_rule(rule, metric, value):
            execute_rule(rule)
            triggered.append(rule.name)

    # Generate alert for extreme sensor values
    alert_message = None
    if metric == "temperature" and value > 35:
        alert_message = f"{device.name}: High temperature detected ({value}°C)"
    elif metric == "motion" and value == 1:
        alert_message = f"{device.name}: Motion detected"
    elif metric == "smoke" and value > 0:
        alert_message = f"{device.name}: Smoke detected!"

    if alert_message:
        alert = Alert(
            device_id=device_id,
            user_id=current_user.id,
            type="threshold",
            severity="warning" if metric != "smoke" else "critical",
            message=alert_message,
        )
        db.session.add(alert)
        db.session.commit()

        token = request.headers.get(
            "X-DEVICE-TOKEN"
        )

        device = validate_device(token)

        if not device:

            return jsonify({
                "error":"Invalid Device"
            }),401

    return jsonify({"message": "Telemetry recorded", "triggered_rules": triggered}), 201


@telemetry_bp.route("/<int:device_id>", methods=["GET"])
@token_required
def get_telemetry(current_user, device_id):
    Device.query.filter_by(id=device_id, user_id=current_user.id).first_or_404()
    hours = int(request.args.get("hours", 24))
    since = datetime.utcnow() - timedelta(hours=hours)
    logs = (
        TelemetryLog.query.filter(
            TelemetryLog.device_id == device_id,
            TelemetryLog.recorded_at >= since,
        )
        .order_by(TelemetryLog.recorded_at.asc())
        .limit(500)
        .all()
    )
    return jsonify([l.to_dict() for l in logs])
