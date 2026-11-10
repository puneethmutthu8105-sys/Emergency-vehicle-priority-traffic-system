
# AI-Powered Road Accident Prediction & Emergency Response System

Built with **IBM Bob Agentic AI** — A complete multi-agent platform for intelligent road safety.

## 🚦 Overview
This system uses 7 specialized AI agents to analyze traffic, predict accident risks, monitor road conditions, detect hotspots, and coordinate emergency responses — all powered by IBM watsonx.ai with OpenAI fallback.

## ⚡ Quick Start

### 1. Clone & Configure
```bash
git clone <repo>
cd road-safety-ai
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start All Services
```bash
docker-compose up -d
```

### 3. Seed Demo Data
```bash
docker-compose exec backend python data/seed/seed_data.py
```

### 4. Open the App
- **Frontend Dashboard**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Grafana Monitoring**: http://localhost:3001 (admin / admin123)
- **Prometheus Metrics**: http://localhost:9090
- **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin123)

## 🔐 Demo Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@roadsafety.ai | Admin@123 |
| Officer | officer@roadsafety.ai | Officer@123 |
| Public | demo@roadsafety.ai | Demo@123 |

## 🤖 AI Agents

| Agent | Capability |
|-------|-----------|
| Orchestrator | Decomposes tasks, routes to specialist agents |
| Traffic Analysis | Analyzes congestion, density, speed |
| Accident Risk Prediction | Predicts risk score (0-100) from multi-factor analysis |
| Road Condition Monitoring | Potholes, weather hazards, visibility |
| Hotspot Detection | DBSCAN-like clustering of accident-prone zones |
| Emergency Response | AI-powered emergency action recommendations |
| Ambulance Coordination | Optimal ambulance dispatch (simulated fleet) |

## 🛠 MCP Tool Servers
- **Traffic Tool Server** — Road segment data
- **Weather Tool Server** — OpenWeatherMap / simulated weather
- **Geospatial Tool Server** — Distance, bounding box, routing
- **Emergency Tool Server** — Emergency log management
- **Ambulance Registry Server** — Fleet management (simulated)

## 🏗 Architecture
```
LLM Gateway (watsonx.ai → OpenAI fallback)
        ↕
Orchestrator Agent
  ├── Traffic Agent      ← MCP Traffic Server
  ├── Risk Agent         ← MCP Weather + Traffic
  ├── Road Condition     ← MCP Weather + Geo
  ├── Hotspot Agent      ← Historical Accident DB
  ├── Emergency Agent    ← MCP Emergency Server
  └── Ambulance Agent    ← MCP Ambulance Registry
        ↕
ChromaDB (Agent Memory) + PostgreSQL (Data) + Redis (Cache)
        ↕
FastAPI REST + WebSocket
        ↕
React Dashboard (Leaflet Maps + Recharts)
```

## ⚠ Important Disclaimers
- Traffic data: **SIMULATED** (no live traffic API unless configured)
- Ambulance fleet: **SIMULATED** — Not real emergency dispatch
- Weather: Uses OpenWeatherMap API if key provided, otherwise simulated
- Accident risk predictions: **AI predictions only** — not confirmed accidents

## 🚨 Emergency
In real emergencies, always contact official services: **112** (India) / **911** (US) / **999** (UK)

## 📜 License
MIT



