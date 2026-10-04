# ☕ Welcome to KrishiKotha AI!
### A Beginner's Guide & Overview
**World Bank Small AI for Development Hackathon**

---

## 🌟 What is this project?

**KrishiKotha AI** is an **offline-first, multimodal AI extension system** designed to assist smallholder coffee farmers in the hill tract regions of **Bandarban, Bangladesh**, where cellular coverage is weak or non-existent.

It combines:
1. **Mobile Crop Camera Capture (`capture="environment"`)**: Farmers can snap clear photos of infected coffee leaves, mealybug clusters, and dying branches right in the field.
2. **Native Bangla Voice Recognition (`webkitSpeechRecognition` with `bn-BD`)**: Farmers can speak their observations naturally in Bengali with zero typing required.
3. **Anthropic Claude 3.5 Sonnet Multimodal Streaming**: Real-time streaming advice (`text/event-stream`) in standard Bengali specifically addressing Bandarban's agricultural constraints (Mealybugs, Dieback on Arabica, summer heat/shade management, and protection from predatory *farias* due to the lack of local pulping machines).
4. **Offline Store-and-Forward Vault**: Safely preserves dossiers in the phone's persistent storage when scouting deep in mountain plots without signal.
5. **DAE Extension Command Center**: A live monitoring dashboard for Department of Agricultural Extension (DAE) officers to triage regional outbreaks and protect smallholders.

---

## 👨‍🌾 The Smallholder Reality in Bandarban, Bangladesh

In the scenic hill tracts of **Bandarban** (elevation 300m – 850m+ ASL), smallholder farmers are expanding into commercial Arabica and Robusta coffee cultivation supported by the Department of Agricultural Extension (DAE).

However, farmers face critical local bottlenecks:
- **Severe Mealybug (মিলিবাগ) Infestations & Arabica Dieback (ডাইব্যাক)**: High summer heat and humidity trigger mealybug swarms and fungal twig dieback, threatening up to 50% of the coffee harvest.
- **Pulping & Drying Deficit**: Remote mountain communities lack mechanical wet-pulping machines and solar drying floors. Because raw coffee cherries ferment rapidly, farmers are coerced into selling freshly picked cherries at giveaway prices to local middlemen (*farias*).
- **Zero Signal in the Hills**: Deep mountain plots have no cellular data. When disease strikes, farmers cannot access agronomic advice.

**KrishiKotha AI provides an expert DAE agricultural extension officer right on the farmer's mobile phone — in native Bengali.**

---

## 🚀 Try the Live Demo (No Installation Required!)

You can test the system right now in your web browser:

| Live Service | URL | What to look for |
| :--- | :--- | :--- |
| 📱 **Frontend Web App (Vercel)** | **[https://hackoshackhathon.vercel.app](https://hackoshackhathon.vercel.app/)** | Interactive DAE Bandarban Agent & Command Center |
| ⚡ **FastAPI Backend (Render)** | **[https://hackos-multiagent-agri-solution.onrender.com](https://hackos-multiagent-agri-solution.onrender.com)** | Multimodal streaming gateway & health check |
| 📑 **Interactive API Docs** | **[https://hackos-multiagent-agri-solution.onrender.com/docs](https://hackos-multiagent-agri-solution.onrender.com/docs)** | Live Swagger documentation |

---

## ⏱️ The 3-Minute Interactive Test Walkthrough

Follow these simple steps to test the DAE Bandarban Coffee Agent:

```
Step 1: Open the Frontend App
        Go to: https://hackoshackhathon.vercel.app (or http://localhost:3000 locally).

Step 2: Go to the Field Terminal
        Click the tab: "Farmer Noor Field Terminal (Offline Edge)".
        You will see the "DAE Bandarban Coffee Agent - Claude 3.5 Sonnet" banner.

Step 3: Test Camera Capture
        Click "ছবি তুলুন / আপলোড করুন".
        Snap or upload a photo of coffee leaves or cherries.
        A thumbnail preview instantly displays with options to retake or remove.

Step 4: Speak in Bangla (Voice STT)
        Click the green button: "Speak Bangla (বাংলায় বলুন)".
        Speak into your microphone in Bengali (e.g. "আমার কফি গাছে মিলিবাগ ও ডাইব্যাক দেখা যাচ্ছে").
        Notice the text transcribes live into the Bangla textarea!
        (Tip: You can also click the quick pill "মিলিবাগ ও ডাইব্যাক" for an instant 1-click test).

Step 5: Stream Advice from Claude 3.5 Sonnet
        Click: "ক্লদ ৩.৫ সননেট থেকে লাইভ পরামর্শ পান (Stream Advice)".
        Watch as Claude streams customized advice in standard Bengali token-by-token:
        • Mealybug biological & neem control
        • Arabica dieback sanitization and copper paste treatment
        • Summer heat shade canopy and grass mulching
        • Avoiding predatory farias by community solar drying

Step 6: Copy or Save Advice
        Click "পরামর্শ কপি করুন" to copy the full Bengali advisory for SMS or WhatsApp sharing.
```

---

## 🧠 How Does It Work Under the Hood?

The system is organized into **4 coordinated layers**:

```
[Layer 1: Mobile Edge in Bandarban Hills]
Farmer snaps photo ──► Speaks in Bangla (bn-BD) ──► Stored safely in local vault if offline

[Layer 2: Fast Multipart Transmission]
When in network range ──► Transmits photo & audio transcript via POST /api/sync/stream

[Layer 3: Claude 3.5 Sonnet Multimodal Streaming]
FastAPI Gateway converts image to base64 ──► Claude streams Bengali tokens via Server-Sent Events

[Layer 4: DAE District Headquarters]
Extension officers monitor outbreak triage ──► Coordinate collective pulping & fair pricing
```

---

## 💻 Running Locally

### 1. Download & Configure
```bash
git clone https://github.com/Arif-Badhon/hackos_multiagent_agri_solution.git krishikotha-ai
cd krishikotha-ai

cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Start PostgreSQL Database
```bash
docker compose up postgres -d
```

### 3. Run Backend & Frontend Concurrently
```bash
npm run dev
# Or: make dev
```
- Open **http://localhost:3000** for the frontend app.
- Open **http://localhost:8000/docs** for the FastAPI streaming documentation.

---

## ❓ Frequently Asked Questions (FAQ)

#### Q1: Does the Bangla voice recognition require internet to transcribe?
The voice interface leverages the browser's native Web Speech API (`webkitSpeechRecognition`) hardcoded to `recognition.lang = 'bn-BD'`. On supported browsers (such as Google Chrome on Android or desktop), speech recognition runs natively with high accuracy.

#### Q2: What happens if there is no internet when taking photos?
The app functions as a Progressive Web App (PWA). If there is zero network, observations and photos are securely cached in the browser's **Store-and-Forward Vault**. When a connection or mesh relay is detected, the farmer can sync with a single tap.

#### Q3: What happens if the Claude API key is invalid or offline?
We engineered a high-fidelity **DAE Bandarban Fallback Engine**. If the Anthropic API is unreachable, rate-limited, or testing offline, the backend automatically streams expert agronomic guidance in standard Bengali covering Mealybugs, Dieback, summer heat, and *farias*, ensuring the hackathon demo remains 100% reliable.

#### Q4: Why are pulping machines and "farias" addressed in this app?
In Bandarban, the lack of local wet-pulping machinery is the #1 economic bottleneck. Because coffee cherries spoil quickly, middleman brokers (*farias*) exploit farmers by buying fresh cherries at 50% discounts. The DAE agent advises farmers on collective solar drying to retain value and coordinates with extension officers for fair-trade aggregation.

---

## 🏆 Summary for Hackathon Evaluators
- **World Bank Development Focus**: Targets smallholder poverty alleviation, climate adaptation, and post-harvest market access in Bangladesh.
- **True Offline-First Edge Architecture**: Works under zero-connectivity hill tract conditions.
- **Multimodal Claude 3.5 Sonnet Streaming**: Combines mobile camera visual evidence with real-time streaming Bengali natural language advice.
- **Production-Ready**: Deployed live on Vercel and Render with full test coverage.
