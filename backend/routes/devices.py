from flask import Blueprint, request, jsonify
from database import db
from models import Device, Alert
from auth_helper import token_required
from datetime import datetime
import json

devices_bp = Blueprint("devices", __name__)


@devices_bp.route("", methods=["GET"])
@token_required
def get_devices(current_user):
    devices = Device.query.filter_by(user_id=current_user.id, is_active=True).all()
    return jsonify([d.to_dict() for d in devices])


@devices_bp.route("", methods=["POST"])
@token_required
def add_device(current_user):
    data = request.get_json()
    device = Device(
        user_id=current_user.id,
        name=data["name"],
        type=data["type"],
        location=data.get("location", ""),
        status="online",
        state=json.dumps(data.get("state", {})),
    )
    db.session.add(device)
    db.session.commit()
    return jsonify(device.to_dict()), 201


@devices_bp.route("/<int:device_id>", methods=["PUT"])
@token_required
def update_device(current_user, device_id):
    device = Device.query.filter_by(id=device_id, user_id=current_user.id).first_or_404()
    data = request.get_json()

    if "name" in data:
        device.name = data["name"]
    if "location" in data:
        device.location = data["location"]
    if "status" in data:
        device.status = data["status"]
        device.last_seen = datetime.utcnow()
    if "state" in data:
        device.state = json.dumps(data["state"])
        device.last_seen = datetime.utcnow()

    db.session.commit()
    return jsonify(device.to_dict())


@devices_bp.route("/<int:device_id>", methods=["DELETE"])
@token_required
def delete_device(current_user, device_id):
    device = Device.query.filter_by(id=device_id, user_id=current_user.id).first_or_404()
    device.is_active = False
    db.session.commit()
    return jsonify({"message": "Device removed"})


@devices_bp.route("/<int:device_id>/control", methods=["POST"])
@token_required
def control_device(current_user, device_id):
    """Send a control command to a device (turn on/off, set brightness, etc.)"""
    device = Device.query.filter_by(id=device_id, user_id=current_user.id).first_or_404()
    command = request.get_json()

    current_state = json.loads(device.state) if device.state else {}
    current_state.update(command)
    device.state = json.dumps(current_state)
    device.last_seen = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Command sent", "device": device.to_dict()})
