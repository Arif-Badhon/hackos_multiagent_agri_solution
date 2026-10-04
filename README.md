# ☕ KrishiKotha AI

### Offline-First Edge Multi-Agent Mesh & Multimodal Streaming for Smallholder Coffee Cultivation in Bandarban, Bangladesh

**World Bank Small AI for Development Hackathon**

[![Frontend: Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014%20(App%20Router)-black?style=flat&logo=next.js)](https://nextjs.org)
[![PWA: Offline First](https://img.shields.io/badge/PWA-Offline--First%20Store--and--Forward-emerald?style=flat&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Streaming: SSE](https://img.shields.io/badge/Streaming-text%2Fevent--stream-00c853?style=flat)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015%20(Docker)-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![AI: Anthropic Claude 3.5](https://img.shields.io/badge/Intelligence-Anthropic%20Claude%203.5%20Sonnet%20(Multimodal)-d97706?style=flat&logo=anthropic)](https://www.anthropic.com)
[![Voice: Web Speech API](https://img.shields.io/badge/Speech%20Recognition-Bangla%20(bn--BD)-blue?style=flat)](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
[![Deployment: Vercel Ready](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Cloud%20Containers-blue?style=flat&logo=vercel)](https://vercel.com)

---

> 🚀 **Live Production Demo**:
>
> - **Frontend Web App (Vercel)**: [https://hackoshackhathon.vercel.app](https://hackoshackhathon.vercel.app/)
> - **FastAPI Backend (Render)**: [https://hackos-multiagent-agri-solution.onrender.com](https://hackos-multiagent-agri-solution.onrender.com)
> - **Interactive Swagger Docs**: [https://hackos-multiagent-agri-solution.onrender.com/docs](https://hackos-multiagent-agri-solution.onrender.com/docs)
> - **Beginner's Walkthrough**: [GETTING_STARTED.md](GETTING_STARTED.md)

---

## 📖 Table of Contents

1. [Executive Summary & Bangladesh Coffee Context](#-executive-summary--bangladesh-coffee-context)
2. [Local Constraints & The DAE Bandarban Challenge](#-local-constraints--the-dae-bandarban-challenge)
3. [High-Level System Architecture](#-high-level-system-architecture)
4. [Multimodal Streaming Pipeline with Claude 3.5 Sonnet](#-multimodal-streaming-pipeline-with-claude-35-sonnet)
5. [Native Bangla Voice & Camera Interface](#-native-bangla-voice--camera-interface)
6. [Offline-First Store-and-Forward Topology](#-offline-first-store-and-forward-topology)
7. [Tech Stack & Engineering Decisions](#-tech-stack--engineering-decisions)
8. [Data Model & Database Schema](#-data-model--database-schema)
9. [API Specification](#-api-specification)
10. [Quick Start & Local Setup](#-quick-start--local-setup)
11. [Judge Evaluation Walkthrough](#-judge-evaluation-walkthrough)
12. [Cloud Deployment Guide](#-cloud-deployment-guide)
13. [Repository Structure](#-repository-structure)

---

## 🌾 Executive Summary & Bangladesh Coffee Context

In Bangladesh, the hilly terrains of **Bandarban (Chittagong Hill Tracts)** are emerging as a high-potential frontier for commercial coffee cultivation. Under initiatives from the **Department of Agricultural Extension (DAE)**, thousands of indigenous and smallholder farmers are cultivating Arabica and Robusta varieties on mountain slopes (elevation 300m – 850m+ ASL).

However, smallholder coffee growers in Bandarban face severe operational bottlenecks:

1. **Zero / Weak Connectivity in Remote Hill Tracts**: Steep valleys and remote mountain communities have no cellular data or unreliable 2G coverage.
2. **Pathology & Climate Stress**: High summer heat (>36°C) and micro-climate humidity induce severe **Mealybug** infestations and **Dieback on Arabica**, causing leaf drop and premature cherry drying.
3. **Pulping & Drying Machine Deficit**: Smallholders lack mechanical pulpers and solar drying houses. Unable to process fresh cherries on-site, they are forced to sell raw cherries at rock-bottom prices to predatory local middlemen (*farias*).
4. **Language & Literacy Barriers**: Smallholder farmers require intuitive, zero-typing interactions in standard Bengali (**Bangla**) with visual evidence.

### The Solution: KrishiKotha AI (DAE Bandarban Edition)

KrishiKotha AI addresses these acute bottlenecks through a unified edge multi-agent system:

- **Mobile Camera Capture (`capture="environment"`)**: Mobile-first photo capture of foliar symptoms, mealybug clusters, and cherry dieback.
- **Native Bangla Speech Recognition (`bn-BD`)**: High-accuracy spoken Bengali transcription directly in the mobile browser using the native Web Speech API.
- **Anthropic Claude 3.5 Sonnet Multimodal Streaming**: Real-time server-sent events (`text/event-stream`) streaming actionable agronomic guidance in standard Bengali directly to the farmer.
- **Offline Store-and-Forward Vault**: Caches field observations locally in browser IndexedDB/LocalStorage when deep in the hills, synchronizing when entering mesh or cellular range.
- **DAE Extension Command Center**: Aggregates synchronized field dossiers, triages disease outbreaks, and tracks fair pricing against exploitative *farias*.

---

## 🇧🇩 Local Constraints & The DAE Bandarban Challenge

| Local Challenge in Bandarban | Agronomic / Market Impact | KrishiKotha AI Countermeasure |
| :--- | :--- | :--- |
| **Mealybug (মিলিবাগ) Infestation** | Waxy white insect clusters feed on tender shoots and cherry stems, transmitting sooty mold. | Visual image detection via Claude 3.5 Sonnet; organic neem-oil detergent spray protocol and biological ant-barrier instructions. |
| **Arabica Dieback (ডাইব্যাক)** | Fungal pathogen (*Colletotrichum*) aggravated by heat stress causes terminal twigs to dry and turn black. | Pruning 2-3 inches below infected wood, flame sanitization, and copper oxychloride paste application. |
| **High Summer Heat & Sun Scorch** | Extreme temperatures cause blossom drop and sunburned cherries. | Micro-climate recommendations: 50% shade canopy management (Albizia/banana trees) and organic grass mulching. |
| **Post-Harvest Pulping & Drying Deficit** | Lack of wet pulping machines forces immediate sale of perishable raw cherries. | Community cooperative solar drying guidance to produce dry cherry/parchment, preventing distressed sales to *farias*. |
| **Predatory Middlemen (*Farias*)** | *Farias* buy raw cherry at 40-60% below market value. | Real-time market floor advisory and DAE extension officer linkage for collective auctioning. |

---

## 🏛️ High-Level System Architecture

```mermaid
graph TD
    subgraph Mobile Edge Layer [Field Edge - Bandarban Hill Tracts]
        A[Farmer Mobile Device] -->|Voice Input: bn-BD| B[Native Speech Recognition]
        A -->|Camera: capture='environment'| C[Crop Photo / Folio]
        B & C --> D[DAE Bandarban Coffee Agent UI]
        D -->|Offline Mode| E[Local Store-and-Forward Vault]
        D -->|Network Connected| F[Multipart FormData Upload]
    end

    subgraph Gateway Ingestion Layer [FastAPI Gateway]
        F -->|POST /api/sync/stream| G[FastAPI Streaming Gateway]
        E -->|Burst Sync: POST /api/sync| H[FastAPI Async Relational Ingestion]
        H --> I[(PostgreSQL 15 DB)]
    end

    subgraph Intelligence Layer [Anthropic Claude 3.5 Sonnet]
        G -->|Base64 Image + Bangla Transcript| J[Claude 3.5 Sonnet Multimodal]
        J -->|System Prompt: DAE Bandarban Persona| K[Async Token Streaming Engine]
        K -->|text/event-stream Chunks| D
        H -->|Store-and-Forward Telemetry| L[JSON Advisory Synthesis]
        L --> I
    end

    subgraph Operational Command Layer [DAE District Extension HQ]
        I --> M[DAE Extension Officer Dashboard]
        M --> N[Regional Mealybug & Dieback Triage]
        M --> O[Fair Pricing Protection vs. Farias]
        M --> P[SMS Advisory Dispatch to Farmers]
    end
```

---

## ⚡ Multimodal Streaming Pipeline with Claude 3.5 Sonnet

The streaming architecture is engineered for low-latency feedback over unstable hill-tract network uplinks:

```
[Farmer Mobile UI]
      │
      ├─► 1. Camera Snapshot (JPEG/PNG) + Spoken Bangla Transcript (bn-BD)
      │
      ▼  (POST /api/sync/stream - multipart/form-data)
[FastAPI Ingestion Gateway]
      │
      ├─► Reads image bytes and validates MIME type
      ├─► Formats multimodal content block: [{"type": "image", ...}, {"type": "text", ...}]
      │
      ▼  (client.messages.stream)
[Anthropic Claude 3.5 Sonnet]
      │  Strict System Persona:
      │  "You are an AI agricultural extension officer for the DAE in Bandarban, Bangladesh.
      │   Analyze the farmer's visual evidence and Bangla audio transcript. Address local
      │   constraints: Mealybugs, Dieback on Arabica, high summer heat, and the lack of
      │   local pulping/drying machines forcing farmers to sell raw cherries to farias (middlemen).
      │   Output your advice entirely in standard Bengali (Bangla)."
      │
      ▼  (text/event-stream generator chunks)
[StreamingResponse Engine]
      │
      ▼  (Fetch API: response.body.getReader())
[Client React UI: analysisStream state]
      └─► Incremental Bengali tokens render live with blinking cursor on farmer's screen!
```

---

## 🎙️ Native Bangla Voice & Camera Interface

The mobile interface is crafted with agricultural emerald/white thematic styles and requires zero complex keyboard typing:

1. **Environment Camera Snap (`capture="environment"`)**:
   - Triggers the rear mobile camera on Android and iOS devices.
   - Live image preview with clear thumbnail, file metadata, and one-tap re-take or removal.
2. **Speech Recognition (`webkitSpeechRecognition` hardcoded to `bn-BD`)**:
   - Captures native spoken Bangla audio from farmers.
   - Provides live listening animations (`শুনছি... কথা বলুন`) with visual feedback.
   - Transcribes text directly into an editable Bangla textarea.
3. **One-Tap Quick Scenarios**:
   - 🐛 **মিলিবাগ ও ডাইব্যাক (Mealybug & Dieback)**: Pre-fills symptoms of waxy mealybug colonies and terminal twig death.
   - ☀️ **গ্রীষ্মের তাপদাহ ও ছায়া (Heat Stress & Shade)**: Pre-fills symptoms of cherry drop and heat wilt.
   - ⚖️ **পাল্পিং সংকট ও ফড়িয়া সুরক্ষা (Pulping Shortage & Middlemen)**: Pre-fills market pricing and drying inquiries.

---

## 🔄 Offline-First Store-and-Forward Topology

When scouting deep in mountain plots with zero connectivity:

1. Observations and photos are secured in the **Local Store-and-Forward Vault** (`localStorage` / IndexedDB).
2. The UI operates in **Offline Mode**; dossiers are tagged with client timestamps and geo-coordinates.
3. Upon returning to community centers or mobile network coverage, the **Burst Sync Transmission** fires automatically or via one-click synchronization to `POST /api/sync`.
4. Payloads are persisted in PostgreSQL, analyzed by the Claude multi-agent engine, and made visible to DAE officers.

---

## 🛠️ Tech Stack & Engineering Decisions

| Component | Technology | Role & Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | Fast React Server Components, client streaming UI, optimized for mobile devices. |
| **Speech Recognition** | **Web Speech API (`bn-BD`)** | Zero-latency, browser-native Bangla speech recognition without external STT API overhead. |
| **Camera Integration** | **HTML5 Media Capture API** | Native `capture="environment"` invokes rear mobile lenses directly. |
| **PWA Service Worker** | **`@ducanh2912/next-pwa`** | Offline app caching, static asset precaching, installable mobile experience. |
| **Styling** | **Tailwind CSS (Agricultural Dark/Light)** | Clean, high-contrast greens (`#0A281B`, `#10B981`) designed for outdoor sunlight visibility. |
| **Backend Framework** | **FastAPI (Python 3.11+)** | High-performance asynchronous ASGI server supporting native streaming responses and SSE. |
| **Multipart Parsing** | **`python-multipart`** | Efficient asynchronous parsing of image uploads and audio transcripts. |
| **AI Intelligence** | **Anthropic Claude 3.5 Sonnet** | Multimodal image understanding + fluent standard Bengali agronomic reasoning. |
| **Database & ORM** | **PostgreSQL 15 + SQLAlchemy 2.0 (Async) + asyncpg** | Non-blocking database I/O with connection pooling for store-and-forward dossier triage. |

---

## 📊 Data Model & Database Schema

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

### 1. Multimodal Streaming Advisory (DAE Bandarban)

- **Endpoint**: `POST /api/sync/stream`
- **Content-Type**: `multipart/form-data`
- **Response**: `text/event-stream`
- **Request Parameters**:
  - `transcript` (*string*, required): Spoken Bangla transcript or farmer's observation.
  - `image` (*UploadFile*, optional): Camera photo of infected coffee foliage or cherries.
- **Example cURL**:

```bash
curl -X POST http://localhost:8000/api/sync/stream \
  -F "transcript=বান্দরবানে আমার কফি গাছে মিলিবাগ আক্রমণ করেছে এবং ডাল শুকিয়ে কালো হচ্ছে।" \
  -F "image=@foliage_sample.jpg;type=image/jpeg"
```

### 2. Synchronize Store-and-Forward Dossier

- **Endpoint**: `POST /api/sync`
- **Content-Type**: `application/json`
- **Response**: `201 Created` with full structured Claude advisory.

### 3. Batch Synchronization

- **Endpoint**: `POST /api/sync/batch`
- **Description**: Synchronizes multiple queued field dossiers collected over multi-day mountain excursions.

### 4. Extension Officer Dossier Feed

- **Endpoint**: `GET /api/sync/dossiers?urgency=HIGH&limit=50`
- **Description**: Query synchronized dossiers filtered by urgency level and farmer ID.

### 5. Aggregated Regional Statistics

- **Endpoint**: `GET /api/sync/stats`
- **Description**: Summary metrics: total alerts, active farmers, and fair market benchmark.

### 6. Service Health Check

- **Endpoint**: `GET /api/health`
- **Response**: `{"status": "healthy", "database": "connected", "version": "1.0.0"}`

---

## 🚀 Quick Start & Local Setup

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) v18+ (Node 20+ recommended)
- [Python](https://www.python.org/) 3.11+ (or `uv`)

### 1. Clone & Configure Environment

```bash
git clone https://github.com/Arif-Badhon/hackos_multiagent_agri_solution.git krishikotha-ai
cd krishikotha-ai

# Configure environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Ensure your Anthropic API Key is set in `backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

*(If no API key is provided, the system seamlessly activates the built-in domain fallback streaming engine in Bengali).*

### 2. Start PostgreSQL Container

```bash
docker compose up postgres -d
# Or: make db-up
```

### 3. Seed Sample Database Records

```bash
make seed
# Or: cd backend && python seed.py
```

### 4. Run Both Frontend and Backend Concurrently

```bash
npm run dev
# Or: make dev
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🧪 Judge Evaluation Walkthrough

Follow these steps to evaluate the multimodal streaming and offline mesh capabilities in **under 3 minutes**:

```
[Step 1] Open http://localhost:3000 in your browser.
         Switch to Tab 2: "Farmer Noor Field Terminal (Offline Edge)".
         Notice the header: "DAE Bandarban Coffee Agent - Claude 3.5 Sonnet".

[Step 2] Test Multimodal Camera Input:
         Click "ছবি তুলুন / আপলোড করুন" to snap a crop photo or select an image.
         Notice the instant visual thumbnail preview with "পুনরায় তুলুন" and "ছবি সরান" controls.

[Step 3] Test Native Bangla Voice Recognition:
         Click "Speak Bangla (বাংলায় বলুন)".
         Speak into your microphone in Bangla (e.g., "কফি গাছে সাদা পোকা এবং ডাল শুকিয়ে যাচ্ছে").
         Notice the text flows live into the Bangla textarea!
         (Alternative: Click the quick scenario pill "মিলিবাগ ও ডাইব্যাক" for instant 1-click test).

[Step 4] Trigger Claude 3.5 Sonnet Live Streaming:
         Click the glowing green button: "ক্লদ ৩.৫ সননেট থেকে লাইভ পরামর্শ পান (Stream Advice)".
         Watch the streaming card appear as Claude delivers advice in standard Bengali live token-by-token:
         - 1. Mealybug management & organic neem protocols
         - 2. Arabica Dieback pruning & copper oxychloride paste
         - 3. Summer heat shade canopy & mulching
         - 4. Pulping machine shortage and protection against farias (middlemen)

[Step 5] Copy & Share Advice:
         Click "পরামর্শ কপি করুন" to copy the generated Bengali guidance to the clipboard.

[Step 6] Test Store-and-Forward Offline Resilience:
         Toggle "Simulate Offline" in the top bar.
         Save observations to the local vault, refresh the browser, and verify data persists safely offline.
```

---

## ☁️ Cloud Deployment Guide

### Deploying Frontend to Vercel

1. Import repository on [Vercel](https://vercel.com/new).
2. Set **Root Directory** to `frontend`.
3. Add environment variable:

   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
   ```

4. Deploy! Next.js compiles PWA service workers and serves via global edge CDN.

### Deploying Backend to Cloud Containers (Render / Cloud Run)

```bash
docker build -t ondera-backend ./backend
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/onderadb" \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  -e CLAUDE_MODEL="claude-3-5-sonnet-20241022" \
  -e CORS_ORIGINS="https://your-app.vercel.app,http://localhost:3000" \
  ondera-backend
```

---

## 📁 Repository Structure

```
krishikotha-ai/
├── docker-compose.yml              # Local PostgreSQL 15 Alpine container
├── Makefile                        # Dev commands (make dev, make seed, make up)
├── package.json                    # Root monorepo workspaces & scripts
├── .env.example                    # Root configuration template
├── README.md                       # Comprehensive architecture and submission guide
├── GETTING_STARTED.md              # Beginner's walkthrough & live demo guide
├── backend/                        # FastAPI Async Python Backend
│   ├── main.py                     # App entry point, CORS, lifespan handlers
│   ├── database.py                 # Async SQLAlchemy 2.0 + asyncpg connection pool
│   ├── models.py                   # SyncDossier SQLAlchemy data model
│   ├── schemas.py                  # Pydantic v2 validation models & stats schemas
│   ├── requirements.txt            # FastAPI, python-multipart, anthropic, asyncpg
│   ├── Dockerfile                  # Container definition for cloud deployment
│   ├── seed.py                     # Seed script for realistic coffee dossiers
│   ├── agents/
│   │   ├── __init__.py
│   │   └── claude_orchestrator.py  # Claude 3.5 Sonnet multimodal streaming & fallback
│   └── routes/
│       ├── __init__.py
│       └── sync.py                 # POST /api/sync/stream, batch sync & stats
└── frontend/                       # Next.js 14+ (App Router) Frontend (Vercel-Ready)
    ├── package.json                # Frontend dependencies (@ducanh2912/next-pwa, Lucide)
    ├── next.config.mjs             # PWA service worker caching configuration
    ├── tailwind.config.ts          # Custom agricultural green/dark theme tokens
    ├── public/
    │   ├── manifest.json           # PWA web manifest
    │   └── sw.js                   # PWA service worker
    ├── components/
    │   └── DossierSync.tsx         # DAE Bandarban Agent: camera capture, voice STT, live stream
    └── app/
        ├── layout.tsx              # PWA metadata & dark agro styling
        ├── globals.css             # Agro-mesh styles & glowing accents
        └── page.tsx                # District Extension Officer Command Center & tabs
```

---

## 📜 License & Acknowledgments

Developed for the **World Bank Small AI for Development Hackathon**. Dedicated to empowering smallholder coffee farming communities in Bandarban, Bangladesh with resilient, offline-first artificial intelligence and equitable market access.
