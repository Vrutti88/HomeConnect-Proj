import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "homeconnect-secret-key-2024")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "mysql+pymysql://root:VRUTTI_88@localhost/homeconnect"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRY_HOURS = 24
