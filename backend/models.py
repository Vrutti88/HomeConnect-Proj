from database import db
from datetime import datetime
import json


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    devices = db.relationship("Device", backref="owner", lazy=True)
    automations = db.relationship("AutomationRule", backref="owner", lazy=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class Device(db.Model):
    __tablename__ = "devices"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)   # light, thermostat, camera, lock, sensor
    location = db.Column(db.String(100))
    status = db.Column(db.String(20), default="offline")  # online, offline
    state = db.Column(db.Text, default="{}")              # JSON: {"power": "on", "brightness": 80}
    is_active = db.Column(db.Boolean, default=True)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)

    telemetry = db.relationship("TelemetryLog", backref="device", lazy=True)
    alerts = db.relationship("Alert", backref="device", lazy=True)
    device_token = db.Column(
        db.String(255),
        unique=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "location": self.location,
            "status": self.status,
            "state": json.loads(self.state) if self.state else {},
            "is_active": self.is_active,
            "registered_at": self.registered_at.isoformat(),
            "last_seen": self.last_seen.isoformat(),
        }


class AutomationRule(db.Model):
    __tablename__ = "automation_rules"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    trigger_type = db.Column(db.String(50))          # time, sensor, device_state
    trigger_value = db.Column(db.String(255))         # "08:00", "temperature>25"
    action_device_id = db.Column(db.Integer, db.ForeignKey("devices.id"))
    action_command = db.Column(db.String(255))        # JSON: {"power":"on","brightness":80}
    is_enabled = db.Column(db.Boolean, default=True)
    last_triggered = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    action_device = db.relationship("Device", foreign_keys=[action_device_id])

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "trigger_type": self.trigger_type,
            "trigger_value": self.trigger_value,
            "action_device_id": self.action_device_id,
            "action_device_name": self.action_device.name if self.action_device else None,
            "action_command": json.loads(self.action_command) if self.action_command else {},
            "is_enabled": self.is_enabled,
            "last_triggered": self.last_triggered.isoformat() if self.last_triggered else None,
            "created_at": self.created_at.isoformat(),
        }


class TelemetryLog(db.Model):
    __tablename__ = "telemetry_logs"
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey("devices.id"), nullable=False)
    metric = db.Column(db.String(50))      # temperature, motion, power, brightness
    value = db.Column(db.Float)
    unit = db.Column(db.String(20))        # °C, %, lux, bool
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "device_id": self.device_id,
            "metric": self.metric,
            "value": self.value,
            "unit": self.unit,
            "recorded_at": self.recorded_at.isoformat(),
        }


class Alert(db.Model):
    __tablename__ = "alerts"
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey("devices.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    type = db.Column(db.String(50))        # security, offline, automation, threshold
    severity = db.Column(db.String(20))    # info, warning, critical
    message = db.Column(db.String(255))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "device_id": self.device_id,
            "device_name": self.device.name if self.device else None,
            "type": self.type,
            "severity": self.severity,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
        }
