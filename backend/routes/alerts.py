from flask import Blueprint, request, jsonify
from database import db
from models import Alert
from auth_helper import token_required

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("", methods=["GET"])
@token_required
def get_alerts(current_user):
    alerts = (
        Alert.query.filter_by(user_id=current_user.id)
        .order_by(Alert.created_at.desc())
        .limit(50)
        .all()
    )
    return jsonify([a.to_dict() for a in alerts])


@alerts_bp.route("/<int:alert_id>/read", methods=["PUT"])
@token_required
def mark_read(current_user, alert_id):
    alert = Alert.query.filter_by(id=alert_id, user_id=current_user.id).first_or_404()
    alert.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"})


@alerts_bp.route("/read-all", methods=["PUT"])
@token_required
def mark_all_read(current_user):
    Alert.query.filter_by(user_id=current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All alerts marked as read"})
