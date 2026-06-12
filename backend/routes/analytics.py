from flask import Blueprint, jsonify
from database import db
from models import Device, TelemetryLog, Alert, AutomationRule
from auth_helper import token_required
from datetime import datetime, timedelta
from sqlalchemy import func

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/dashboard", methods=["GET"])
@token_required
def dashboard(current_user):
    uid = current_user.id
    total_devices = Device.query.filter_by(user_id=uid, is_active=True).count()
    online_devices = Device.query.filter_by(user_id=uid, status="online", is_active=True).count()
    total_automations = AutomationRule.query.filter_by(user_id=uid, is_enabled=True).count()
    unread_alerts = Alert.query.filter_by(user_id=uid, is_read=False).count()

    # Devices by type
    devices_by_type = (
        db.session.query(Device.type, func.count(Device.id))
        .filter_by(user_id=uid, is_active=True)
        .group_by(Device.type)
        .all()
    )

    # Alerts by severity (last 7 days)
    since = datetime.utcnow() - timedelta(days=7)
    alerts_by_severity = (
        db.session.query(Alert.severity, func.count(Alert.id))
        .filter(Alert.user_id == uid, Alert.created_at >= since)
        .group_by(Alert.severity)
        .all()
    )

    # Recent telemetry summary (last 24h)
    since_24h = datetime.utcnow() - timedelta(hours=24)
    telemetry_count = TelemetryLog.query.join(Device).filter(
        Device.user_id == uid,
        TelemetryLog.recorded_at >= since_24h,
    ).count()

    return jsonify({
        "total_devices": total_devices,
        "online_devices": online_devices,
        "offline_devices": total_devices - online_devices,
        "total_automations": total_automations,
        "unread_alerts": unread_alerts,
        "telemetry_events_24h": telemetry_count,
        "devices_by_type": [{"type": t, "count": c} for t, c in devices_by_type],
        "alerts_by_severity": [{"severity": s, "count": c} for s, c in alerts_by_severity],
    })
