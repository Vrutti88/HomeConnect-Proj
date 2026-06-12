from models import Device

def validate_device(token):

    return Device.query.filter_by(
        device_token=token
    ).first()