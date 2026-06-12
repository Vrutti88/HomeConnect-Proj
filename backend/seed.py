from database import db
from models import User, Device, AutomationRule, TelemetryLog, Alert
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import json
import random


def seed_data():
    if User.query.filter_by(email="demo@homeconnect.com").first():
        return  # already seeded

    # Create demo user
    user = User(
        name="Alex Johnson",
        email="demo@homeconnect.com",
        password_hash=generate_password_hash("demo123"),
    )
    db.session.add(user)
    db.session.flush()

    # Create devices
    devices_data = [
        {"name": "Living Room Light", "type": "light", "location": "Living Room",
         "status": "online", "state": {"power": "on", "brightness": 80}},
        {"name": "Bedroom Light", "type": "light", "location": "Bedroom",
         "status": "online", "state": {"power": "off", "brightness": 50}},
        {"name": "Smart Thermostat", "type": "thermostat", "location": "Hall",
         "status": "online", "state": {"power": "on", "temperature": 22, "mode": "cool"}},
        {"name": "Front Door Lock", "type": "lock", "location": "Entrance",
         "status": "online", "state": {"locked": True}},
        {"name": "Backyard Camera", "type": "camera", "location": "Backyard",
         "status": "online", "state": {"recording": True, "resolution": "1080p"}},
        {"name": "Motion Sensor", "type": "sensor", "location": "Living Room",
         "status": "online", "state": {"motion": False}},
        {"name": "Smoke Detector", "type": "sensor", "location": "Kitchen",
         "status": "offline", "state": {"smoke": False}},
    ]

    devices = []
    for d in devices_data:
        dev = Device(
            user_id=user.id,
            name=d["name"],
            type=d["type"],
            location=d["location"],
            status=d["status"],
            state=json.dumps(d["state"]),
        )
        db.session.add(dev)
        devices.append(dev)
    db.session.flush()

    # Automation rules
    rules = [
        AutomationRule(
            user_id=user.id,
            name="Morning Lights On",
            trigger_type="time",
            trigger_value="07:00",
            action_device_id=devices[0].id,
            action_command=json.dumps({"power": "on", "brightness": 100}),
        ),
        AutomationRule(
            user_id=user.id,
            name="Night Mode",
            trigger_type="time",
            trigger_value="22:00",
            action_device_id=devices[1].id,
            action_command=json.dumps({"power": "off"}),
        ),
        AutomationRule(
            user_id=user.id,
            name="Cool Down When Hot",
            trigger_type="threshold",
            trigger_value="temperature>28",
            action_device_id=devices[2].id,
            action_command=json.dumps({"mode": "cool", "temperature": 20}),
        ),
    ]
    for r in rules:
        db.session.add(r)

    # Telemetry logs (last 24 hours)
    now = datetime.utcnow()
    for i in range(48):
        ts = now - timedelta(minutes=30 * i)
        db.session.add(TelemetryLog(
            device_id=devices[2].id,  # thermostat
            metric="temperature",
            value=round(20 + random.uniform(-2, 8), 1),
            unit="°C",
            recorded_at=ts,
        ))
        db.session.add(TelemetryLog(
            device_id=devices[0].id,  # living room light
            metric="power_usage",
            value=round(random.uniform(5, 15), 1),
            unit="W",
            recorded_at=ts,
        ))

    # Sample alerts
    alerts = [
        Alert(device_id=devices[4].id, user_id=user.id, type="security",
              severity="warning", message="Backyard Camera: Motion detected at night"),
        Alert(device_id=devices[6].id, user_id=user.id, type="offline",
              severity="critical", message="Smoke Detector went offline"),
        Alert(device_id=devices[2].id, user_id=user.id, type="threshold",
              severity="info", message="Thermostat: Temperature reached 28°C, automation triggered"),
    ]
    for a in alerts:
        db.session.add(a)

    db.session.commit()
    print("✅ Demo data seeded — login: demo@homeconnect.com / demo123")
