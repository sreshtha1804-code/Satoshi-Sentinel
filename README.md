# 🛡️ Satoshi Sentinel

### Know what you're signing. Know who you're trusting.

Satoshi Sentinel is a privacy-first, explainable security companion for the **Bitcoin + Nostr ecosystem**.

It analyzes different types of potentially risky inputs and provides **evidence, signals, context, and explanations** instead of reducing everything to a simple `SAFE` or `SCAM` label.

---

## ✨ Features

* 🔍 Multi-input security analysis
* ₿ Bitcoin address and payment analysis
* 🟣 Nostr identity, event, and message analysis
* 🔗 Suspicious URL analysis
* 💬 Social-engineering message detection
* 🤖 AI-assisted security analysis
* 🧠 Explainable risk assessment
* 📊 Evidence-based analysis
* ✍️ Explain Before You Sign
* 🕒 Analysis history
* 🔐 Privacy-focused design
* ⚙️ Settings and privacy controls
* 📱 Responsive interface

---

## 🧠 How It Works

Satoshi Sentinel follows an explainable analysis pipeline:

```text
User Input
    ↓
Signal Extraction
    ↓
Evidence Correlation
    ↓
AI Analysis
    ↓
Risk Explanation
    ↓
User Decision
```

The system considers multiple signals instead of relying on a single indicator.

### Risk Analysis

Signals can come from:

* Identity
* Transaction
* URL
* Behaviour
* Social engineering
* Context

The goal is to help users understand **why something may be risky** before taking an action.

---

## 🛡️ Security Philosophy

Satoshi Sentinel is designed around explainability and user awareness.

An unknown identity should not automatically be treated as malicious, and a single suspicious signal should not automatically determine the final result.

The application focuses on:

**Explain → Correlate → Verify → Decide**

---

## 🖥️ Application

### Dashboard

Provides an overview of security analysis and recent activity.

### Analyze

Allows users to submit different types of inputs for security analysis.

### Analysis Result

Displays:

* Risk information
* Detected signals
* Evidence
* Context
* AI analysis
* Explanation

### Explain Before You Sign

Helps users understand potentially risky actions before signing or proceeding.

### History

Stores previous analyses for later review.

### Settings

Provides application and privacy-related controls.

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│                              │
│ Dashboard                    │
│ Analyze                      │
│ Analysis Result              │
│ Explain Before You Sign      │
│ History                      │
│ Settings                     │
└──────────────┬───────────────┘
               │
               │ API
               ▼
┌──────────────────────────────┐
│       FastAPI Backend        │
│                              │
│ API Routes                   │
│ Analysis Services            │
│ Bitcoin Intelligence         │
│ Nostr Intelligence           │
│ URL Analysis                 │
│ AI Analysis                  │
└──────────────┬───────────────┘
               │
               ▼
       Evidence + Signals
               │
               ▼
        Risk Explanation
```

---

## 🧰 Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS
* Lucide Icons

### Backend

* Python
* FastAPI
* Uvicorn

### Intelligence

* AI-assisted analysis
* Security signal extraction
* Evidence correlation
* Bitcoin analysis
* Nostr analysis
* URL analysis
* Social-engineering analysis

---

## 📁 Project Structure

```text
Satoshi-Sentinel/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── logo.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── logo.svg
│   │   │   └── icons/
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── RiskCard.jsx
│   │   │   ├── SignalCard.jsx
│   │   │   ├── EvidenceCard.jsx
│   │   │   ├── AnalysisCard.jsx
│   │   │   ├── InputPanel.jsx
│   │   │   ├── HistoryCard.jsx
│   │   │   └── LoadingState.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analyze.jsx
│   │   │   ├── AnalysisResult.jsx
│   │   │   ├── ExplainBeforeSign.jsx
│   │   │   ├── History.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   └── analysis.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── analyzer.py
│   │   │   ├── bitcoin.py
│   │   │   ├── nostr.py
│   │   │   ├── url_analyzer.py
│   │   │   └── ai_analyzer.py
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── analysis.py
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── validators.py
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sreshtha1804-code/Satoshi-Sentinel.git
cd Satoshi-Sentinel
```

---

### 2. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available through the Vite development server.

---

### 3. Run the Backend

Open another terminal:

```bash
cd Satoshi-Sentinel/backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The API will run locally.

---

## 🔐 Environment Variables

Create your environment configuration according to the services used by the backend.

Example:

```env
AI_API_KEY=your_api_key
BITCOIN_API_URL=your_api_url
NOSTR_RELAY_URL=your_relay_url
```

Never commit real API keys or secrets to GitHub.

---

## 🌐 Deployment

The frontend is deployed as a Render Static Site.

**Live frontend:**

[Open Satoshi Sentinel](https://satoshi-sentinel-1.onrender.com)

The backend is currently being developed and tested locally.

---

## 🚧 Current Development Status

### Completed

* React + Vite frontend
* Dashboard
* Analyze interface
* Analysis result interface
* Explain Before You Sign interface
* History interface
* Settings interface
* Responsive UI
* Privacy-focused interface
* FastAPI backend foundation

### In Development

* Bitcoin intelligence
* Nostr intelligence
* URL intelligence
* Social-engineering analysis
* Advanced evidence correlation
* Expanded security signals
* Frontend ↔ backend integration
* AI analysis pipeline

---

## 🗺️ Roadmap

### Phase 1 — Interface

* Complete core application interface
* Improve analysis visualization
* Improve responsive behaviour
* Refine user experience

### Phase 2 — Backend

* Connect frontend to FastAPI
* Implement analysis APIs
* Add validation
* Improve error handling

### Phase 3 — Intelligence

* Bitcoin analysis
* Nostr analysis
* URL analysis
* Social-engineering detection
* AI-assisted analysis

### Phase 4 — Correlation

* Combine multiple evidence sources
* Improve contextual analysis
* Generate clearer explanations
* Improve risk reasoning

---

## 🎯 Design Principles

### Explain

Show users why something may be risky.

### Correlate

Combine multiple signals instead of relying on a single indicator.

### Verify

Encourage evidence-based decisions.

### Empower

Give users information rather than forcing a binary decision.

### Protect

Keep privacy and security central to the application.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

```bash
git clone https://github.com/sreshtha1804-code/Satoshi-Sentinel.git
cd Satoshi-Sentinel
```

Create a new branch:

```bash
git checkout -b feature/your-feature
```

Make your changes, commit them, and create a pull request.

---

## 📌 Development Guidelines

* Keep security-related logic explainable.
* Avoid treating a single signal as definitive evidence.
* Keep sensitive information out of source code.
* Validate user inputs.
* Keep frontend and backend responsibilities separated.
* Prefer clear and maintainable code.

---

## ⚠️ Disclaimer

Satoshi Sentinel is an experimental security analysis tool.

Its analysis and AI-generated explanations should not be considered a guarantee that an address, message, identity, URL, transaction, or request is safe or malicious.

Users should independently verify important information before signing transactions, sending funds, or interacting with unknown entities.

---

## 👨‍💻 Author

**Sreshtha Das**

B.Tech CSE Student
Aspiring Software Engineer

* GitHub: [sreshtha1804-code](https://github.com/sreshtha1804-code)
* Project: [Satoshi Sentinel](https://github.com/sreshtha1804-code/Satoshi-Sentinel)
