from datetime import datetime

def process_gateway(data):

    # Add timestamp
    data["gateway_time"] = str(
        datetime.utcnow()
    )

    # Validate required fields
    required = [
        "device_id",
        "temperature"
    ]

    for field in required:

        if field not in data:

            raise ValueError(
                f"{field} missing"
            )

    return data