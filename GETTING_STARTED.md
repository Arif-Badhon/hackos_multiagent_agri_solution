# ☕ Welcome to Ondera Agro-Mesh!
### A Beginner's Guide & Overview
**World Bank Small AI for Development Hackathon**

---

## 🌟 What is this project?

**Ondera Agro-Mesh** is an **offline-first AI system** designed to protect smallholder coffee farmers who live and work in remote mountain regions where there is **no internet or cellular coverage**.

It combines:
1. **An Offline Mobile App (PWA)** that farmers can open in their phone's browser even with **zero bars of signal**.
2. **A Store-and-Forward Vault** that safely locks in field crop health observations on the phone until connectivity is reached.
3. **An Anthropic Claude AI Multi-Agent Brain** that analyzes field symptoms, prescribes organic treatments, and calculates fair-trade market prices to protect farmers from being cheated by middleman buyers.
4. **An Extension Officer Dashboard** where district agricultural officers can track disease outbreaks across the entire region.

---

## 👩‍🌾 Meet Noor: The Story Behind the Solution

Imagine **Noor**, a smallholder coffee farmer living in the steep **Ondera Highlands** (elevation 1,840 meters / 6,000 feet).

- Noor's family depends on a small plot of Arabica coffee trees (*Bourbon variety*).
- In the mountain valleys, cold mists and heavy rainfall create the perfect breeding ground for **Coffee Leaf Rust** (*Hemileia vastatrix*) — a devastating fungus that covers leaves in yellow-orange powder, defoliates trees, and destroys up to 60% of the coffee harvest.
- In Noor's field, **there is zero cellular network**. If she sees yellow spots, she cannot search Google or call an agronomist.
- Worse yet, when harvest season arrives, predatory roadside brokers arrive in trucks offering to buy stressed cherries at **40% to 60% below market value** ($1.80/kg instead of the fair $3.85/kg cooperative rate).

**Ondera Agro-Mesh gives Noor an agronomic expert and market protector right in her pocket — offline.**

---

## 🚀 Try the Live Demo (No Installation Required!)

You can test the entire system right now in your web browser:

| Live Service | URL | What to look for |
| :--- | :--- | :--- |
| 📱 **Frontend App (Vercel)** | **[https://hackoshackhathon.vercel.app](https://hackoshackhathon.vercel.app/)** | Interactive farmer field terminal & command center |
| ⚡ **Backend API (Render)** | **[https://hackos-multiagent-agri-solution.onrender.com](https://hackos-multiagent-agri-solution.onrender.com)** | FastAPI cloud sync gateway & health check |
| 📑 **Interactive API Docs** | **[https://hackos-multiagent-agri-solution.onrender.com/docs](https://hackos-multiagent-agri-solution.onrender.com/docs)** | Live Swagger documentation |

---

## ⏱️ The 3-Minute Interactive Test Walkthrough

Here is how you can test the offline capability and Claude AI in under 3 minutes:

```
Step 1: Open the Frontend App
        Go to: https://hackoshackhathon.vercel.app

Step 2: Go to the Farmer's Terminal
        Click the tab: "Farmer Noor Field Terminal (Offline Edge)".

Step 3: Simulate Going Offline
        In the top-right corner, click the "Simulate Offline" button.
        Notice the status badge turns amber: "Offline (Vault Active)".
        (You don't need to turn off your laptop's Wi-Fi!)

Step 4: Record a Field Problem
        Click the quick button: "☕ Noor: Leaf Rust (Yellow Spots)".
        The form auto-fills with symptoms:
        "yellow spots on leaves, powdery underside, leaf drop after rain".
        Click: "Record Offline (Preserve in Local Store-and-Forward Vault)".

Step 5: Inspect the Offline Vault
        Scroll down to the "Store-and-Forward Vault Queue".
        Notice your observation is safely locked in the offline queue (1 pending).
        Try refreshing your browser! The record remains safe in storage.

Step 6: Reconnect & Sync
        Click "Disable Offline Simulation" (simulating Noor walking into town).
        The glowing button activates: "Sync to Extension Network (1 Queued)".
        Click it!

Step 7: Watch Claude AI in Action
        Within 2 seconds, Claude analyzes the case:
        • Urgency Level: HIGH
        • Officer Briefing: Validated Leaf Rust risk to neighboring plots.
        • Action Plan: Step-by-step organic copper spray, pruning, shade thinning.
        • Market Warning: Reminds Noor of the $3.85/kg cooperative floor price.

Step 8: Check the Extension Officer View
        Click the "District Extension Officer Command Center" tab.
        Noor's dossier is now visible live to government agricultural officers!
```

---

## 🧠 How Does It Work Under the Hood?

The system is organized into **4 simple phases**:

```
[Phase 1: In the Mountain Field]
Farmer Noor spots sick leaves ──► Inputs into phone app ──► Stored safely in local phone memory

[Phase 2: Connecting to the Mesh]
Noor walks near community LoRa relay ──► App detects signal ──► Bursts data to Cloud Gateway

[Phase 3: AI Agronomic Intelligence]
FastAPI Gateway receives data ──► Anthropic Claude 3.7 analyzes disease ──► Writes 6-step treatment plan

[Phase 4: District Headquarters]
Extension Officer sees live outbreak map ──► Sends SMS advice ──► Protects regional coffee harvest
```

---

## 💻 Want to Run It on Your Own Machine?

If you want to run the code locally, you only need **Docker** and **Node.js**:

### 1. Download the Project
```bash
git clone https://github.com/Arif-Badhon/hackos_multiagent_agri_solution.git
cd hackos_multiagent_agri_solution
```

### 2. Start PostgreSQL Database
```bash
docker compose up postgres -d
```

### 3. Run the App
```bash
# Install dependencies
npm run install:all

# Run backend & frontend together
npm run dev
```
- Open **http://localhost:3000** for the frontend.
- Open **http://localhost:8000/docs** for the backend API.

---

## 📂 Project Directory Map

Here is how the project files are organized:

- `frontend/` **(The User Interface - Next.js 14 & Tailwind CSS)**
  - `components/DossierSync.tsx`: The heart of the offline experience. Contains the form, the local storage vault, and the sync transmitter.
  - `app/page.tsx`: The main dashboard with the Command Center and tab views.
  - `next.config.mjs`: Configures the Progressive Web App (PWA) so the app works without internet.
- `backend/` **(The Cloud Brain - FastAPI & Python 3.11)**
  - `main.py`: The web server setup, security CORS rules, and health checks.
  - `database.py`: Connects asynchronously to PostgreSQL.
  - `models.py`: Defines the `SyncDossier` database table (farmer name, location, symptoms, AI advisory).
  - `routes/sync.py`: Receives the synced data at `POST /api/sync`.
  - `agents/claude_orchestrator.py`: The bridge to Anthropic's Claude AI model (`claude-sonnet-4-6`). Formats the medical/agricultural questions and parses the advice.
- `docker-compose.yml`: Spawns the local PostgreSQL database in 1 second.
- `Makefile`: Convenient shortcuts like `make dev`, `make seed`, `make db-up`.

---

## ❓ Frequently Asked Questions (FAQ)

#### Q1: Does the app really work without internet?
**Yes.** The frontend is a Progressive Web App (PWA). Once loaded, its code and scripts are cached on the phone by a Service Worker. If cellular signal drops to zero, the app remains responsive, allows form entries, and saves observations to the device's persistent storage.

#### Q2: What is "Store-and-Forward"?
It is an architectural pattern borrowed from space communications and disaster response. Instead of failing when there is no connection, data is "stored" locally and "forwarded" automatically the moment a connection is detected.

#### Q3: What happens if the Claude API key is missing or expires?
We built in an **Agronomic Heuristic Fallback Engine**. If the Claude API key is ever missing, rate-limited, or offline, the system automatically uses built-in expert coffee pathology rules so the app never crashes.

#### Q4: Why is market pricing included in a plant disease app?
Because smallholder farmers are economically vulnerable during crop disease crises. Intermediaries exploit disease panic to underpay farmers by up to 60%. By embedding real-time cooperative benchmark pricing ($3.85/kg), Noor knows exactly what her coffee is worth and avoids panic-selling.

---

## 🏆 Summary for Hackathon Evaluators
- **World Bank Focus**: Directly addresses smallholder climate and economic resilience.
- **Offline-First Reality**: Built for the actual conditions of rural East African highlands.
- **Multi-Agent Architecture**: Combines on-device edge classifiers with Claude cloud reasoning.
- **Production-Ready**: 100% live right now on Vercel and Render.
