# 🏠 HomeConnect – Smart Home Automation Backend

A full-stack smart home automation platform built for the System Design Final Examination.  
**Python (Flask) backend · React frontend · MySQL database**

---

## 📋 Project Overview

HomeConnect is a cloud-based smart home automation platform that enables users to:

- Register and authenticate securely (JWT)
- Register, monitor, and control IoT devices (lights, thermostats, cameras, locks, sensors)
- Create automation rules triggered by time or sensor thresholds
- Ingest real-time telemetry data from devices
- Receive and manage security/threshold alerts
- View a dashboard with live analytics

---

## 🏗️ System Architecture

```
React Frontend (Port 3000)
        │  REST API (JSON)
        ▼
Flask REST API (Port 5000)
        │
   ┌────┴────┐
   │  JWT    │  ← Authentication Layer
   └────┬────┘
        │
┌───────┼──────────────────────────────┐
│       ▼                              │
│  Route Handlers                      │
│  /auth  /devices  /automations       │
│  /telemetry  /alerts  /analytics     │
│       │                              │
│  Rule Engine (automations.py)        │
│  - evaluate_rule()                   │
│  - execute_rule()                    │
│       │                              │
│  SQLAlchemy ORM                      │
└───────┼──────────────────────────────┘
        │
   MySQL Database
   ┌─────────────────────────┐
   │ users                   │
   │ devices                 │
   │ automation_rules        │
   │ telemetry_logs          │
   │ alerts                  │
   └─────────────────────────┘
```

---

## 🗃️ Database Design (MySQL)

### Tables

| Table | Purpose |
|---|---|
| `users` | User accounts with hashed passwords |
| `devices` | IoT device registry with type, location, state (JSON) |
| `automation_rules` | Trigger → Action rules per user |
| `telemetry_logs` | Time-series sensor readings |
| `alerts` | Security and threshold notifications |

### Key Relationships
- `users` → `devices` (one-to-many)
- `users` → `automation_rules` (one-to-many)
- `devices` → `telemetry_logs` (one-to-many)
- `devices` → `alerts` (one-to-many)

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login, get JWT |
| GET | `/api/v1/auth/me` | Current user |

### Devices
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/devices` | List all devices |
| POST | `/api/v1/devices` | Add device |
| PUT | `/api/v1/devices/<id>` | Update device |
| DELETE | `/api/v1/devices/<id>` | Remove device |
| POST | `/api/v1/devices/<id>/control` | Send control command |

### Automations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/automations` | List rules |
| POST | `/api/v1/automations` | Create rule |
| PUT | `/api/v1/automations/<id>` | Update rule |
| DELETE | `/api/v1/automations/<id>` | Delete rule |
| POST | `/api/v1/automations/evaluate` | Manually evaluate rules |

### Telemetry
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/telemetry` | Ingest sensor data |
| GET | `/api/v1/telemetry/<device_id>` | Get device history |

### Alerts
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/alerts` | Get all alerts |
| PUT | `/api/v1/alerts/<id>/read` | Mark one read |
| PUT | `/api/v1/alerts/read-all` | Mark all read |

### Analytics
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/analytics/dashboard` | Dashboard stats |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, Flask 3.0, Flask-SQLAlchemy |
| Auth | JWT (PyJWT), Werkzeug password hashing |
| Database | MySQL 8.0, PyMySQL driver |
| Frontend | React 18, Vite |
| API Style | RESTful JSON |
| CORS | Flask-CORS |

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0 running locally

### 1. MySQL Setup

```sql
CREATE DATABASE homeconnect;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON homeconnect.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup

```bash
cd homeconnect/backend

# Install dependencies
pip install -r requirements.txt

# Configure database (edit config.py if needed)
# Default: mysql+pymysql://root:password@localhost/homeconnect

# Run server (tables auto-created + demo data seeded)
python app.py
```

Backend runs at **http://localhost:5000**

### 3. Frontend Setup

```bash
cd homeconnect/frontend

npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 🚀 Execution Steps

1. Start MySQL service
2. Run `python app.py` in the `backend/` folder
3. Run `npm run dev` in the `frontend/` folder
4. Open http://localhost:3000
5. Login with: **demo@homeconnect.com** / **demo123**

---

## 🧠 Rule Engine Logic (Q5)

The automation rule engine (`routes/automations.py`) supports:

```python
# Time-based: fires when current time matches
trigger_type = "time", trigger_value = "07:00"

# Threshold-based: fires when telemetry crosses a value
trigger_type = "threshold", trigger_value = "temperature>28"
```

When telemetry is ingested via `POST /api/v1/telemetry`, the engine:
1. Saves the reading to `telemetry_logs`
2. Fetches all threshold rules for the user
3. Evaluates each rule: `evaluate_rule(rule, metric, value)`
4. If condition is true: `execute_rule(rule)` updates the target device state
5. Generates an `Alert` if values are extreme (temperature > 35°C, motion, smoke)

---

## 📈 Scalability Considerations (Q6)

- **Horizontal scaling**: Flask app is stateless (JWT); multiple instances behind a load balancer
- **Database**: MySQL with connection pooling via SQLAlchemy; sharding by `user_id` for scale
- **Caching**: Redis can be added for device state cache and telemetry aggregates
- **Message queue**: Kafka/RabbitMQ can replace synchronous telemetry ingestion for millions of devices
- **Fault tolerance**: Devices going offline generate alerts; automation rules are idempotent
- **Edge sync**: IoT gateways can buffer events locally during connectivity loss

---

## 🔮 Future Scope

- WebSocket support for real-time device state push
- Voice assistant integration (Alexa / Google Home)
- Mobile app (React Native)
- ML-based anomaly detection on telemetry streams
- Multi-home / multi-user support
- OTA firmware update management

---

## 📁 Project Structure

```
homeconnect/
├── backend/
│   ├── app.py              # Flask app factory
│   ├── config.py           # Configuration
│   ├── database.py         # SQLAlchemy setup
│   ├── models.py           # DB models (User, Device, AutomationRule, TelemetryLog, Alert)
│   ├── auth_helper.py      # JWT helpers
│   ├── seed.py             # Demo data seeder
│   ├── requirements.txt
│   └── routes/
│       ├── auth.py
│       ├── devices.py
│       ├── automations.py  # ← Rule engine lives here
│       ├── telemetry.py
│       ├── alerts.py
│       └── analytics.py
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── AuthContext.jsx
        ├── services/api.js
        ├── components/
        │   └── Sidebar.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── Dashboard.jsx
            ├── DevicesPage.jsx
            ├── AutomationsPage.jsx
            └── AlertsPage.jsx
```

---

## GitHub Repository

> Upload this project to GitHub and paste the link here:  
> `https://github.com/YOUR_USERNAME/homeconnect`
