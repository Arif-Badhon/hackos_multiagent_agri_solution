# ☕ Ondera Agro-Mesh
### Offline-First Edge Multi-Agent Mesh for Smallholder Coffee Farmers
**World Bank Small AI for Development Hackathon**

[![Frontend: Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014%20(App%20Router)-black?style=flat&logo=next.js)](https://nextjs.org)
[![PWA: Offline First](https://img.shields.io/badge/PWA-Offline--First%20Store--and--Forward-emerald?style=flat&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015%20(Docker)-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![AI: Anthropic Claude](https://img.shields.io/badge/Intelligence-Anthropic%20Claude%203.7%20Sonnet-d97706?style=flat&logo=anthropic)](https://www.anthropic.com)
[![Deployment: Vercel Ready](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Cloud%20Containers-blue?style=flat&logo=vercel)](https://vercel.com)

---

> 🚀 **New to this project?** Check out the [**Beginner's Guide & 3-Minute Live Demo (GETTING_STARTED.md)**](GETTING_STARTED.md) for a plain-English introduction, the story of Farmer Noor, and an interactive test walkthrough!

---

## 📖 Table of Contents
1. [Beginner's Guide & Live Demo](GETTING_STARTED.md)
2. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [High-Level Architecture](#-high-level-architecture)
3. [Multi-Agent Design System](#-multi-agent-design-system)
4. [Offline-First Store-and-Forward Topology](#-offline-first-store-and-forward-topology)
5. [Tech Stack & Engineering Decisions](#-tech-stack--engineering-decisions)
6. [Data Model & Schemas](#-data-model--schemas)
7. [API Specification](#-api-specification)
8. [Quick Start & Local Setup](#-quick-start--local-setup)
9. [Judge Evaluation Walkthrough](#-judge-evaluation-walkthrough)
10. [Production Cloud & Vercel Deployment](#-production-cloud--vercel-deployment)
11. [Repository Structure](#-repository-structure)

---

## 🌾 Executive Summary & Problem Statement

### The Ondera Highlands Reality
Smallholder coffee farmers in the **Ondera Highlands** (elevation 1,700m – 2,000m) cultivate some of the world's most prized high-altitude Arabica varieties (*Bourbon*, *SL28*, *Ruiru 11*). However, their geographic isolation presents two critical barriers to livelihood resilience:

1. **Pathological Devastation in Zero-Connectivity Zones**: 
   Steep gorges create unique micro-climates with high humidity (>85%) and cold morning mists — optimal vectors for **Coffee Leaf Rust** (*Hemileia vastatrix*) and **Coffee Berry Disease** (*Colletotrichum kahawae*). Because cellular networks are non-existent in the plots, farmers like Noor cannot access cloud-based advisory tools when early-stage intervention is critical.
2. **Predatory Intermediary Exploitation**: 
   When disease strikes or harvest begins, roadside middleman brokers exploit farmers' lack of market visibility, buying stressed cherries at 40%–60% discounts ($1.80/kg vs. the Fair-Trade cooperative benchmark of $3.85/kg).

### The Solution: Ondera Agro-Mesh
**Ondera Agro-Mesh** bridges the digital divide through an **Offline-First Edge Multi-Agent Mesh**:
- **On-Device Edge Client (PWA)**: Runs locally in Noor's mobile browser with zero internet. Captures field observations, evaluates on-device diagnostic rules, and secures payloads in a persistent **Store-and-Forward Vault**.
- **Burst Synchronization Gateway**: As farmers move toward community mesh relays or LoRa gateways, cached dossiers are batch-uploaded via FastAPI.
- **Claude Multi-Agent Orchestrator**: Cloud backend leverages the official Anthropic Claude API to generate technical briefings for District Extension Officers, tailored organic agronomic treatment plans, and cooperative market price protection.
- **Extension Officer Command Center**: A real-time monitoring interface providing regional disease tracking, urgency triage, and simulated one-click SMS advisory dispatch back to smallholders.

---

## 🏛️ High-Level Architecture

```mermaid
graph TD
    subgraph Edge Layer [Field Edge - Ondera Highlands]
        A[Farmer Noor Mobile PWA] -->|Offline Observation| B[Local Store-and-Forward Vault]
        B -->|Cached Payloads| C{Mesh Connectivity Check}
        C -->|Offline| B
        C -->|Mesh Relay Found| D[Burst Sync Transmission]
    end

    subgraph Ingestion Layer [Cloud Gateway]
        D -->|POST /api/sync| E[FastAPI Async Gateway]
        E -->|Connection Pool asyncpg| F[(PostgreSQL 15 Alpine)]
    end

    subgraph Intelligence Layer [Anthropic Multi-Agent Engine]
        E -->|Dossier Telemetry| G[Claude Orchestrator Agent]
        G -->|Coffee Pathology Model| H[1. Extension Officer Briefing]
        G -->|Organic Treatment Engine| I[2. Step-by-Step Action Plan]
        G -->|Fair-Trade Price Engine| J[3. Market Price Protection]
        H & I & J -->|Structured JSON| E
        E -->|Commit Advisory| F
    end

    subgraph Operational Layer [District Extension Headquarters]
        F -->|Live Stream Query| K[Extension Officer Command Center]
        K -->|Triage & Priority Filters| L[High Urgency Alerts]
        K -->|Simulated SMS Relay| M[Automated Farmer Guidance Dispatch]
    end
```

---

## 🤖 Multi-Agent Design System

Ondera Agro-Mesh organizes intelligence into four specialized cooperative agents:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MULTI-AGENT SYSTEM                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Agent 1: Edge Diagnostic Classifier]  (Local Client / Mobile)        │
│  • Performs offline classification of foliar symptoms                  │
│  • Computes confidence scores for CLR, CBD, and Nutrient Leaching      │
│  • Tags geolocation, altitude, and variety characteristics             │
│                                                                        │
│  [Agent 2: Store-and-Forward Vault Agent]  (Browser / Relay Node)      │
│  • Manages offline persistence across device reboots                   │
│  • Idempotently queues dossiers to prevent duplicate transmission      │
│  • Monitors network state and triggers burst upload on connection      │
│                                                                        │
│  [Agent 3: Claude Agronomic Pathology Agent]  (Cloud Orchestrator)     │
│  • Synthesizes symptom observations with altitude micro-climate data   │
│  • Evaluates regional transmission risk to adjacent Bourbon stands     │
│  • Formulates 6-step cultural, sanitary, and organic bio-sprays        │
│                                                                        │
│  [Agent 4: Market Protection & Pricing Agent]  (Cooperative Gateway)   │
│  • Tracks prevailing Ondera Cooperative parchment floor ($3.85/kg)     │
│  • Detects predatory intermediary underpayment patterns                │
│  • Issues harvest timing guidance and crop insurance filing advice     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Prompt Engineering & Agent Governance
The Claude Orchestrator uses a domain-tailored system prompt encoding highland coffee pathology, biological treatment standards (compliant with export organic certification), and cooperative economics.

```python
ONDERA_AGRONOMY_SYSTEM_PROMPT = """
You are the Senior Coffee Agronomy Intelligence Agent for the World Bank Small AI for Development 'Ondera Agro-Mesh' system.
Context:
- Smallholder coffee farmers in Ondera highlands (like Noor) cultivate Arabica (Bourbon, SL28) at 1,700m-2,000m ASL.
- Output required: Technical briefing for District Extension Officers, step-by-step action plan, urgency triage, and market price protection.
"""
```

---

## 🔄 Offline-First Store-and-Forward Topology

In traditional web applications, network disconnects result in dropped requests and data loss. Ondera Agro-Mesh implements an **asymmetric Store-and-Forward architecture**:

```
[Field Sector 4: 0 bars]
   │
   ├─► Noor inputs: "Yellow spots on leaves, powdery underside"
   ├─► Edge Classifier tags: Hemileia vastatrix (94% confidence)
   ├─► Encrypted Dossier stored into Local Storage Vault
   │
[Walking to Community Center: Mesh Relay In Range]
   │
   ├─► Network Event Listener detects Gateway ping
   ├─► Store-and-Forward Vault Agent activates
   ├─► POST /api/sync transmits queued records
   ├─► Cloud commit & Claude Advisory generated
   ├─► Vault cleared; Local UI displays confirmed cloud receipt
```

---

## 🛠️ Tech Stack & Engineering Decisions

| Tier | Technology | Rationale & Architectural Justification |
| :--- | :--- | :--- |
| **Monorepo** | **npm Workspaces + Concurrently** | Single source of truth. Allows developers to run database, backend, and frontend concurrently with one command (`npm run dev` or `make dev`). |
| **Frontend** | **Next.js 14 (App Router)** | React Server Components + Client components; Vercel edge deployment ready; fast page load optimization. |
| **PWA Engine** | **`@ducanh2912/next-pwa`** | Modern App Router service worker integration; precaches app shells, static chunks, and enables true offline UI execution. |
| **Styling** | **Tailwind CSS (Custom Theme)** | High-contrast, dark-mode agricultural palette (`#051A11`, `#0A281B`, `#10B981`, `#F59E0B`) tailored for bright sunlight field readability. |
| **Backend** | **Python 3.11+ / FastAPI** | High-performance asynchronous ASGI framework; automatic OpenAPI Swagger generation; native Pydantic validation. |
| **ORM / Pool** | **SQLAlchemy 2.0 (Async) + asyncpg** | Non-blocking database I/O using asynchronous PostgreSQL drivers; connection pooling with pre-ping validation to survive intermittent mesh uplinks. |
| **Database** | **PostgreSQL 15 (Docker Alpine)** | Production-grade relational store with composite indexing (`idx_dossier_synced_urgency`, `idx_dossier_farmer_crop`) for instantaneous dashboard triage. |
| **AI Engine** | **Anthropic Claude 3.7 / 3.5 Sonnet** | Advanced biological and economic reasoning; structured JSON parsing; high reliability for technical agronomic synthesis. |

---

## 📊 Data Model & Schemas

### Database Schema: `sync_dossiers`
```sql
CREATE TABLE sync_dossiers (
    id                   VARCHAR(64) PRIMARY KEY,
    farmer_id            VARCHAR(100) NOT NULL,
    farmer_name          VARCHAR(100) NOT NULL DEFAULT 'Noor',
    crop_type            VARCHAR(100) NOT NULL,
    offline_diagnosis    TEXT NOT NULL,
    symptoms_description TEXT,
    geo_lat              DOUBLE PRECISION NOT NULL,
    geo_lon              DOUBLE PRECISION NOT NULL,
    altitude_m           DOUBLE PRECISION DEFAULT 1840.0,
    client_recorded_at   TIMESTAMP WITH TIME ZONE,
    synced_at            TIMESTAMP WITH TIME ZONE NOT NULL,
    advisory_summary     TEXT,
    recommended_action   TEXT,
    urgency_level        VARCHAR(20) DEFAULT 'MEDIUM',
    market_context       TEXT,
    status               VARCHAR(20) NOT NULL DEFAULT 'PROCESSED'
);

CREATE INDEX idx_dossier_farmer_crop ON sync_dossiers (farmer_id, crop_type);
CREATE INDEX idx_dossier_synced_urgency ON sync_dossiers (synced_at, urgency_level);
```

---

## 📡 API Specification

### 1. Synchronize Field Dossier
- **Endpoint**: `POST /api/sync`
- **Description**: Stores an offline-recorded dossier, runs the Claude Multi-Agent Orchestrator, and returns the generated advisory.
- **Request Payload**:
```json
{
  "id": "ondera-noor-1728000000",
  "farmer_id": "farmer_noor_01",
  "farmer_name": "Noor",
  "crop_type": "Arabica Coffee (Bourbon)",
  "offline_diagnosis": "Suspected Coffee Leaf Rust (Hemileia vastatrix) - Edge ML 94%",
  "symptoms_description": "yellow spots on leaves, powdery underside, leaf drop after rain",
  "geo_lat": 6.4521,
  "geo_lon": 38.5412,
  "altitude_m": 1840.0,
  "client_recorded_at": "2026-10-04T10:15:00Z"
}
```

- **Response (201 Created)**:
```json
{
  "id": "ondera-noor-1728000000",
  "farmer_id": "farmer_noor_01",
  "farmer_name": "Noor",
  "crop_type": "Arabica Coffee (Bourbon)",
  "offline_diagnosis": "Suspected Coffee Leaf Rust (Hemileia vastatrix) - Edge ML 94%",
  "symptoms_description": "yellow spots on leaves, powdery underside, leaf drop after rain",
  "geo_lat": 6.4521,
  "geo_lon": 38.5412,
  "altitude_m": 1840.0,
  "client_recorded_at": "2026-10-04T10:15:00Z",
  "synced_at": "2026-10-04T10:17:30Z",
  "urgency_level": "HIGH",
  "advisory_summary": "Farmer Noor (ID: farmer_noor_01) at 1,840m ASL in the Ondera Highlands is reporting symptoms consistent with active Coffee Leaf Rust. Spore dispersal risk to adjacent Bourbon plots is HIGH...",
  "recommended_action": "1. IMMEDIATE SANITATION: Collect and bag all fallen foliage; burn or bury 50cm deep.\n2. COPPER HYDROXIDE SPRAY: Apply certified copper hydroxide suspension (3-4g/L) to undersides of leaves.\n3. SHADE MANAGEMENT: Thin overhead canopy by 20-30%.\n4. NEEM EXTRACT: Apply foliar spray every 10 days...",
  "market_context": "Current Ondera highland parchment benchmark: $3.80–$4.05/kg. Do NOT sell cherry to roadside intermediaries offering 40-60% below benchmark. Pre-register yield with Ondera Cooperative...",
  "status": "PROCESSED"
}
```

### 2. Batch Synchronize
- **Endpoint**: `POST /api/sync/batch`
- **Description**: Accepts an array of dossiers accumulated during multi-day offline field scouting.

### 3. Query Extension Dossiers
- **Endpoint**: `GET /api/sync/dossiers?urgency=HIGH&limit=50`
- **Description**: Paginated feed of synchronized farmer dossiers for the Extension Command Center.

### 4. Aggregated Triage Statistics
- **Endpoint**: `GET /api/sync/stats`
- **Description**: Computes active alerts, smallholder count, and market protection floor.

### 5. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies PostgreSQL connection pool readiness.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) v18+ (Node 20+ recommended)
- [Python](https://www.python.org/) 3.11+ (or `uv`)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/Arif-Badhon/hackos_multiagent_agri_solution.git ondera-agro-mesh
cd ondera-agro-mesh

# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Add your Anthropic API key in `backend/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6
```
*(If no API key is provided, the system activates the built-in domain heuristic engine seamlessly).*

### 2. Start PostgreSQL Container
```bash
docker compose up postgres -d
# Or: make db-up
```

### 3. Seed Realistic Highlands Test Data
```bash
make seed
# Or: cd backend && python seed.py
```
*Seeds realistic cases for Noor (Bourbon / Leaf Rust), Abera (SL28 / Berry Disease), and Chaltu (Ruiru 11 / Nutrient Leaching).*

### 4. Run the Full Stack Concurrently
```bash
npm run dev
# Or: make dev
```
- **Frontend PWA**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend & Interactive Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🧪 Judge Evaluation Walkthrough

Follow these steps to evaluate the offline-first mesh in under 3 minutes:

```
[Step 1] Open http://localhost:3000 in your browser.
         Notice the real-time Highlands Micro-Climate status ($3.85/kg parchment floor).

[Step 2] Switch to the "Farmer Noor Field Terminal (Offline Edge)" tab.

[Step 3] Click the "Simulate Offline" toggle button in the top right.
         Status changes to: "Offline (Vault Active)".

[Step 4] Click the preset: "☕ Noor: Leaf Rust (Yellow Spots)".
         Observations auto-populate with coordinates (Lat 6.4521, Lon 38.5412, Elev. 1,840m).

[Step 5] Click "Record Offline (Preserve in Local Store-and-Forward Vault)".
         Notice: The dossier is immediately secured in the offline queue (1 pending).
         Refresh the browser page: The dossier remains safe in the vault!

[Step 6] Click "Disable Offline Simulation" (simulating Noor connecting to an edge relay).
         The glowing "Sync to Extension Network (1 Queued)" button activates!

[Step 7] Click "Sync to Extension Network".
         Watch the progress indicator transmit the payload and invoke Claude.
         Within 2 seconds, the live Claude advisory card appears with urgency level!

[Step 8] Switch to the "District Extension Officer Command Center" tab.
         View Noor's newly synchronized record at the top of the stream.
         Inspect the 6-step Action Plan, Officer Briefing, and click "Dispatch SMS Advisory".
```

---

## ☁️ Production Cloud & Vercel Deployment

Ondera Agro-Mesh is strictly architected for decoupled cloud deployment:

### Deploying Frontend to Vercel (2 Minutes)
1. Import repository on [Vercel](https://vercel.com/new).
2. Set **Root Directory** to: `frontend`.
3. Add Environment Variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
   ```
4. Click **Deploy**. Vercel compiles the Next.js App Router bundle, activates PWA service workers, and serves via global Edge CDN.

### Deploying Backend to Cloud Containers (Render / Railway / Cloud Run)
The backend includes a production-grade multi-stage `Dockerfile`:
```bash
docker build -t ondera-backend ./backend
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/onderadb" \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  -e CLAUDE_MODEL="claude-sonnet-4-6" \
  -e CORS_ORIGINS="https://your-app.vercel.app" \
  ondera-backend
```

---

## 📁 Repository Structure

```
ondera-agro-mesh/
├── docker-compose.yml              # Local PostgreSQL 15 Alpine container
├── Makefile                        # Dev commands (make dev, make seed, make up)
├── package.json                    # Root monorepo workspaces & scripts
├── .env.example                    # Root configuration template
├── .gitignore                      # Git ignore covering Python, Node, Next.js, and DB
├── README.md                       # Complete architecture and evaluation guide
├── backend/                        # FastAPI Async Python Backend
│   ├── main.py                     # App entry point, CORS for localhost:3000, lifespan
│   ├── database.py                 # Async SQLAlchemy 2.0 + asyncpg connection pool
│   ├── models.py                   # SyncDossier SQLAlchemy data model
│   ├── schemas.py                  # Pydantic v2 validation models & stats schemas
│   ├── requirements.txt            # Python dependencies (FastAPI, Anthropic, SQLAlchemy)
│   ├── Dockerfile                  # Container definition for cloud deployment
│   ├── seed.py                     # Seed script for sample Ondera dossiers
│   ├── .env.example                # Backend environment template
│   ├── .gitignore                  # Python-specific gitignore
│   ├── agents/
│   │   ├── __init__.py
│   │   └── claude_orchestrator.py  # Anthropic Claude SDK multi-agent service
│   └── routes/
│       ├── __init__.py
│       └── sync.py                 # POST /api/sync & extension dashboard endpoints
└── frontend/                       # Next.js 14+ (App Router) Frontend (Vercel-Ready)
    ├── package.json                # Frontend dependencies (@ducanh2912/next-pwa, Lucide)
    ├── next.config.mjs             # PWA service worker caching configuration
    ├── tailwind.config.ts          # Custom Ondera agro-mesh theme tokens
    ├── Dockerfile                  # Multi-stage production container
    ├── .env.example                # Frontend environment template
    ├── .env.local                  # Local development backend pointer
    ├── public/
    │   ├── manifest.json           # PWA web manifest
    │   └── icons/                  # PWA application icons
    ├── components/
    │   └── DossierSync.tsx         # Primary offline form, vault & sync button
    └── app/
        ├── layout.tsx              # PWA metadata & dark agro styling
        ├── globals.css             # Agro-mesh styles & glowing mesh accents
        └── page.tsx                # District Extension Officer Command Center
```

---

## 📜 License & Acknowledgments
Developed for the **World Bank Small AI for Development Hackathon**. Dedicated to empowering smallholder coffee farming communities in the Ondera highlands with resilient, offline-first artificial intelligence.
