from flask import Blueprint, request, jsonify
from database import db
from models import AutomationRule, Device, Alert
from auth_helper import token_required
from datetime import datetime
import json

automations_bp = Blueprint("automations", __name__)


# ─────────────────────────────────────────────────────────────────
#  RULE ENGINE  (Q5 of the assignment)
# ─────────────────────────────────────────────────────────────────
def evaluate_rule(rule, telemetry_metric=None, telemetry_value=None):
    """
    Evaluate whether an automation rule should fire.

    Trigger types:
      - time       : trigger_value = "HH:MM"
      - threshold  : trigger_value = "metric>value" or "metric<value"
      - device_state: trigger_value = "device_id:key=value"
    """
    trigger = rule.trigger_type
    value = rule.trigger_value

    if trigger == "time":
        now = datetime.utcnow().strftime("%H:%M")
        return now == value

    elif trigger == "threshold" and telemetry_metric is not None:
        # e.g. "temperature>28"
        for op in [">", "<", ">=", "<="]:
            if op in value:
                parts = value.split(op)
                metric = parts[0].strip()
                threshold = float(parts[1].strip())
                if metric != telemetry_metric:
                    return False
                if op == ">" : return telemetry_value > threshold
                if op == "<" : return telemetry_value < threshold
                if op == ">=": return telemetry_value >= threshold
                if op == "<=": return telemetry_value <= threshold

    return False


def execute_rule(rule):
    """Apply the automation rule's action to its target device."""
    if not rule.action_device_id:
        return
    device = Device.query.get(rule.action_device_id)
    if not device:
        return

    try:
        command = json.loads(rule.action_command) if rule.action_command else {}
    except json.JSONDecodeError:
        return

    current_state = json.loads(device.state) if device.state else {}
    current_state.update(command)
    device.state = json.dumps(current_state)
    device.last_seen = datetime.utcnow()
    rule.last_triggered = datetime.utcnow()
    db.session.commit()


# ─────────────────────────────────────────────────────────────────
#  REST ENDPOINTS
# ─────────────────────────────────────────────────────────────────
@automations_bp.route("", methods=["GET"])
@token_required
def get_automations(current_user):
    rules = AutomationRule.query.filter_by(user_id=current_user.id).all()
    return jsonify([r.to_dict() for r in rules])


@automations_bp.route("", methods=["POST"])
@token_required
def create_automation(current_user):
    data = request.get_json()
    rule = AutomationRule(
        user_id=current_user.id,
        name=data["name"],
        trigger_type=data.get("trigger_type", "time"),
        trigger_value=data.get("trigger_value", ""),
        action_device_id=data.get("action_device_id"),
        action_command=json.dumps(data.get("action_command", {})),
        is_enabled=data.get("is_enabled", True),
    )
    db.session.add(rule)
    db.session.commit()
    return jsonify(rule.to_dict()), 201


@automations_bp.route("/<int:rule_id>", methods=["PUT"])
@token_required
def update_automation(current_user, rule_id):
    rule = AutomationRule.query.filter_by(id=rule_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    for field in ["name", "trigger_type", "trigger_value", "is_enabled"]:
        if field in data:
            setattr(rule, field, data[field])
    if "action_command" in data:
        rule.action_command = json.dumps(data["action_command"])
    db.session.commit()
    return jsonify(rule.to_dict())


@automations_bp.route("/<int:rule_id>", methods=["DELETE"])
@token_required
def delete_automation(current_user, rule_id):
    rule = AutomationRule.query.filter_by(id=rule_id, user_id=current_user.id).first_or_404()
    db.session.delete(rule)
    db.session.commit()
    return jsonify({"message": "Rule deleted"})


@automations_bp.route("/evaluate", methods=["POST"])
@token_required
def evaluate_automations(current_user):
    """Manually trigger rule evaluation (used by telemetry endpoint internally)."""
    data = request.get_json() or {}
    metric = data.get("metric")
    value = data.get("value")

    rules = AutomationRule.query.filter_by(user_id=current_user.id, is_enabled=True).all()
    triggered = []
    for rule in rules:
        if evaluate_rule(rule, metric, value):
            execute_rule(rule)
            triggered.append(rule.name)

    return jsonify({"triggered_rules": triggered})
