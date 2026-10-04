# Ondera Agro-Mesh ☕
### Offline-First Edge Multi-Agent Mesh for Smallholder Coffee Farmers
**World Bank Small AI for Development Hackathon**

---

## 🌾 Overview
**Ondera Agro-Mesh** is an offline-first, store-and-forward edge multi-agent system designed for smallholder coffee farmers (such as Noor) cultivating high-altitude Arabica in the Ondera highlands (elevation 1,700m – 2,000m). 

In steep mountain micro-climates where cellular connectivity is intermittent or non-existent, smallholders face severe crop-threatening diseases (*Hemileia vastatrix* / Coffee Leaf Rust and *Colletotrichum kahawae* / Coffee Berry Disease) and predatory middleman pricing during harvest.

**Ondera Agro-Mesh solves this by:**
1. **Offline Edge PWA**: Runs on basic mobile devices with service worker caching and local store-and-forward vaulting. Farmers record observations (e.g. *"yellow spots on leaves"*), geolocations, and edge ML classifications without network connectivity.
2. **Store-and-Forward Mesh Sync**: When the device nears a community LoRa gateway or regains connectivity, queued dossiers are burst-synchronized via `POST /api/sync`.
3. **Claude Multi-Agent Orchestrator**: The backend uses the official Anthropic Claude API to analyze the field dossier and generate localized extension officer technical briefings, actionable organic/cultural treatment steps, urgency triage, and market price protection benchmarks.
4. **District Extension Officer Command Center**: Real-time cloud dashboard for extension officers to monitor disease vectors, dispatch SMS guidance to farmers, and track fair-trade pricing ($3.85/kg parchment floor).

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────┐       ┌───────────────────────────────┐
│   Farmer Noor's Mobile PWA      │       │  District Extension Officer   │
│   (Next.js 14, Tailwind, PWA)   │       │   (Cloud Web Command Center)  │
│   • Local Storage Vault         │       │   • Live Dossier Stream       │
│   • Offline Diagnostic Rules    │       │   • Urgency Triage & SMS Push │
└────────────────┬────────────────┘       └──────────────▲────────────────┘
                 │                                       │
      Store-and-Forward Sync                             │
           (HTTP / Mesh)                                 │
                 │                                       │
                 ▼                                       │
┌────────────────────────────────────────────────────────┴────────────────┐
│                   FastAPI Sync Gateway (/backend)                       │
│    • Async SQLAlchemy 2.0 + asyncpg Connection Pooling                 │
│    • PostgreSQL 15 Alpine Database (Docker)                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                     Anthropic Claude API
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 Claude Multi-Agent Orchestrator                         │
│    • High-Altitude Arabica Pathology & Agronomy Engine                  │
│    • Localized Treatment (Copper bio-fungicide, canopy pruning, shade)  │
│    • Market Intelligence & Price Protection Engine                      │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Monorepo Architecture**: Root `package.json` workspace managing frontend and backend tasks concurrently.
- **Database**: PostgreSQL 15 Alpine containerized via `docker-compose.yml`.
- **Backend**: Python 3.11+ with FastAPI, async SQLAlchemy 2.0, asyncpg, Pydantic v2, and Anthropic SDK.
- **Frontend**: Next.js 14+ (App Router), React 18, Tailwind CSS, `@ducanh2912/next-pwa` service worker caching, and Vercel readiness.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (Node 20+ recommended)
- Python 3.11+ (or `uv`)

### 1. Clone & Set Up Environment
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```
*(Optional)* Add your `ANTHROPIC_API_KEY` to `backend/.env` for live Claude 3.7 Sonnet inference. If left blank, the built-in agronomic heuristic fallback engine operates automatically.

### 2. Start PostgreSQL via Docker Compose
```bash
make db-up
# Or: docker compose up postgres -d
```

### 3. Seed Realistic Ondera Highlands Data
Populates sample dossiers for Noor (Bourbon - Leaf Rust), Abera (SL28 - Berry Disease), and Chaltu (Ruiru 11 - Chlorosis):
```bash
make seed
# Or: cd backend && python seed.py
```

### 4. Run Full Stack Concurrently
```bash
# Install dependencies
make setup

# Run PostgreSQL, FastAPI backend, and Next.js frontend concurrently
make dev
```
- **Next.js Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🧪 Testing the Offline-First Workflow

1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. Navigate to the **"Farmer Noor Field Terminal"** tab.
3. In the top-right connectivity pill, toggle **"Simulate Offline"**.
4. Click **"☕ Noor: Leaf Rust (Yellow Spots)"** preset or type observations (e.g., *"yellow spots on leaves, powdery underside, leaf drop after rain"*).
5. Click **"Record Offline (Preserve in Local Store-and-Forward Vault)"**.
   - Notice the payload is instantly secured in the browser's persistent Store-and-Forward queue.
6. Toggle **"Disable Offline Simulation"** (simulating farmer Noor walking within range of an Ondera edge mesh relay).
7. Click the glowing **"Sync to Extension Network (1 Queued)"** button.
   - The queue transmits via `POST /api/sync` to PostgreSQL.
   - The Claude Multi-Agent Orchestrator generates the technical briefing and agronomic action plan.
8. Switch to the **"District Extension Officer Command Center"** tab to view the live synchronized advisory with urgency tags, treatment steps, and cooperative pricing benchmarks.

---

## 📡 API Specification

### `POST /api/sync`
Synchronizes an offline-captured Store-and-Forward dossier and triggers Claude advisory generation.
```json
{
  "id": "ondera-1728000000-abcde",
  "farmer_id": "farmer_noor_01",
  "farmer_name": "Noor",
  "crop_type": "Arabica Coffee (Bourbon)",
  "offline_diagnosis": "Suspected Coffee Leaf Rust (Hemileia vastatrix) - Edge Confidence: 92%",
  "symptoms_description": "yellow spots on leaves, powdery underside, leaf drop after rain",
  "geo_lat": 6.4521,
  "geo_lon": 38.5412,
  "altitude_m": 1840.0
}
```

**Response (201 Created):**
```json
{
  "id": "ondera-1728000000-abcde",
  "farmer_id": "farmer_noor_01",
  "farmer_name": "Noor",
  "crop_type": "Arabica Coffee (Bourbon)",
  "offline_diagnosis": "Suspected Coffee Leaf Rust (Hemileia vastatrix) - Edge Confidence: 92%",
  "symptoms_description": "yellow spots on leaves, powdery underside, leaf drop after rain",
  "geo_lat": 6.4521,
  "geo_lon": 38.5412,
  "altitude_m": 1840.0,
  "synced_at": "2026-10-04T10:17:30.163000Z",
  "urgency_level": "HIGH",
  "advisory_summary": "Validated high-probability Hemileia vastatrix (Coffee Leaf Rust) outbreak for Noor (farmer_noor_01) in the Ondera highland zone...",
  "recommended_action": "1. Strip and burn severely infected lower foliage to halt spore propagation.\n2. Apply copper hydroxide (0.2% concentration) or certified organic Bacillus subtilis suspension...",
  "market_context": "Current Ondera Cooperative Grade 1 parchment pricing holds at $3.85/kg...",
  "status": "PROCESSED"
}
```

### Additional Endpoints
- `POST /api/sync/batch`: Batch sync multiple offline dossiers.
- `GET /api/sync/dossiers`: List all synced dossiers with filtering by urgency or farmer.
- `GET /api/sync/dossiers/{id}`: Detailed view of a specific dossier.
- `GET /api/sync/stats`: Real-time aggregated statistics for extension officers.
- `GET /api/health`: Healthcheck verifying PostgreSQL connectivity.

---

## ☁️ Deployment

### Frontend (Vercel)
The frontend is built with Next.js 14 App Router and is 100% Vercel-ready:
1. Connect your GitHub repository to Vercel.
2. Set Root Directory to `frontend`.
3. Configure the environment variable:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed FastAPI backend (e.g. `https://api.ondera-mesh.org`).
4. Click **Deploy**.

### Backend (Cloud Run / AWS / Render / Railway)
The backend includes a production-grade multi-stage `Dockerfile`:
```bash
docker build -t ondera-backend ./backend
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/dbname" \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  ondera-backend
```

---

## 📜 License
MIT License • Developed for the World Bank Small AI for Development Hackathon.
