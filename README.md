# 🏠 HomeConnect – Smart Home Automation Backend

A full-stack smart home automation platform built for the System Design Final Examination.  
**Python (Flask) backend · React frontend · MySQL database**

---

## 📋 Project Overview

HomeConnect is a cloud-based Smart Home Automation Platform designed to manage and control IoT devices such as smart lights, thermostats, cameras, locks, and sensors. 

The platform allows users to:

- Register and authenticate securely
- Add and manage smart home devices
- Monitor device telemetry in real time
- Create automation rules
- Receive security alerts
- View a dashboard with live analytics
- Control devices remotely

---

## 🏗️ System Architecture

```
    React Frontend (Port 3000)
                │  REST API (JSON)
                ▼
    Flask REST API (Port 5001)
                │
   ┌────────────┼─────────────────┐
   ▼            ▼                 ▼
JWT Auth    Device Mgmt    Telemetry Service
                                  │
                                  ▼
                          IoT Gateway Layer
                                  │
                                  ▼
                          Device Authentication
                                  │
                                  ▼
                          Automation Engine
                                  │
                   ┌──────────────┼──────────────┐
                   ▼              ▼              ▼
              Cache Layer   Alert Service    Sync Queue
              (Redis Sim.)               (Fault Tolerance)
                                  ▼
                           MySQL Database
```

---

## Features

### User Authentication

- JWT Authentication
- Password Hashing
- Protected Routes

### Device Management 

- Add Devices
- Update Devices
- Delete Devices
- Remote Device Control

### Device Authentication 

- Device Token Validation
- Secure Telemetry Submission

### IoT Gateway 

- Telemetry Validation
- Timestamp Processing
- Gateway Metadata Management

### Automation Engine 

Supports: 

- Time-Based Rules
- Threshold-Based Rules

Examples: 

- Turn lights on at 7 PM
- Trigger alert if temperature exceeds 35°C
- Detect motion events

### Telemetry Processing 

- Temperature Monitoring
- Motion Detection
- Smoke Detection
- Humidity Monitoring

### Alerts 

- Security Alerts
- Temperature Alerts
- Motion Alerts
- Smoke Alerts

### Distributed Cache 

-Implemented using an in-memory cache. 
-Production deployment would use Redis. 

### Fault Tolerance 

-Offline device commands are stored in a synchronization queue and executed when the device reconnects. 

### Health Monitoring Health endpoint:

```text
GET /health
```

Returns:

```json
{
  "status": "UP",
  "database": "UP",
  "cache": "UP",
  "gateway": "UP"
}
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

Backend runs at **http://127.0.0.1:5001**

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

## 📈 Scalability Considerations

- Horizontal Scaling
- Load Balancing
- Redis Distributed Cache
- Kafka Event Streaming
- MySQL Read Replicas
- Database Sharding
- Edge Device Synchronization

Production architecture may use: 

- Redis
- Apache Kafka
- MongoDB
- AWS IoT Core

---

## Additional Project Details 

### Security 

- JWT Authentication
- Password Hashing
- Device Authentication
- Protected API Endpoints

### Fault Tolerance 

- Offline Synchronization Queue
- Health Monitoring Endpoint
- Gateway Processing Layer

---

## 🔮 Future Scope

- WebSocket Real-Time Updates
- Mobile Application
- Voice Assistant Integration
- AI-Based Automation Recommendations
- Multi-Home Management

---

## GitHub Repository

Repository Link:

`https://github.com/Vrutti88/HomeConnect-Proj`

---

## Author 

Vrutti Patil 

System Design Project 

HomeConnect – Smart Home Automation Platform
