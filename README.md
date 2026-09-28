# 🛡️ Satoshi Sentinel

### Know what you're signing. Know who you're trusting.

**Satoshi Sentinel** is a privacy-first, explainable security companion for the **Bitcoin + Nostr ecosystem**.

It helps users analyze Bitcoin addresses, payment requests, Nostr identities and events, suspicious URLs, and social-engineering messages by combining security signals and presenting the findings in a human-readable way.

Instead of reducing everything to a simple **SAFE / SCAM** label, Satoshi Sentinel focuses on **evidence, context, signals, and explanations**.

> **Understand the risk before you trust, sign, click, or pay.**

---

## ✨ Features

* 🔎 **Multi-input security analysis**
* ₿ **Bitcoin address and payment analysis**
* 🟣 **Nostr identity, event, and message analysis**
* 🔗 **Suspicious URL analysis**
* 💬 **Social-engineering detection**
* 🧠 **AI-assisted security analysis**
* 📊 **Explainable risk assessment**
* 🧾 **Evidence-based analysis**
* ✍️ **Explain Before You Sign**
* 📜 **Analysis history**
* 🔐 **Privacy-focused design**
* ⚙️ **Privacy and application settings**
* 📱 **Responsive interface**

---

## 🧠 Explainable Risk Analysis

Satoshi Sentinel is designed to show **why something may be suspicious**, rather than simply returning a binary verdict.

The analysis can consider signals such as:

```text
Identity
Transaction
URL
Behavior
Social Engineering
Context
```

These signals are correlated with available evidence and presented through an understandable explanation.

### Analysis Pipeline

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

The final decision always remains with the user.

---

## ₿ Bitcoin Analysis

Satoshi Sentinel can analyze Bitcoin-related information such as:

* Bitcoin addresses
* Payment requests
* Transaction-related information
* Suspicious payment instructions
* Context surrounding a payment request

The goal is to provide additional information before users send funds or approve an action.

---

## 🟣 Nostr Analysis

The project is designed to analyze:

* Nostr identities
* Public keys
* Events
* Messages
* Identity-related signals
* Suspicious activity patterns

This helps users investigate unfamiliar Nostr information before interacting with it.

---

## 🔗 URL Analysis

Satoshi Sentinel can examine suspicious URLs for security-relevant indicators.

Possible signals include:

* Suspicious URL structures
* Domain-related indicators
* Unusual patterns
* Context surrounding the link
* Social-engineering context

---

## 💬 Social Engineering Analysis

Messages can be analyzed for patterns such as:

* Urgency
* Impersonation
* Pressure to act
* Requests for sensitive information
* Suspicious payment instructions
* Manipulative language
* Unusual instructions
* Trust exploitation

These signals can then be considered alongside other available evidence.

---

# 🖥️ Application

## 🏠 Dashboard

The central entry point to Satoshi Sentinel.

Provides access to:

* Security analysis
* Recent activity
* Quick actions
* Explain Before You Sign
* History
* Settings

---

## 🔍 Analyze

The primary interface for submitting information for analysis.

Users can provide:

* Bitcoin addresses
* URLs
* Messages
* Nostr information
* Payment requests
* Other suspicious content

---

## 📊 Analysis Result

Displays the output of the analysis, including:

* Risk level
* Detected signals
* Supporting evidence
* Analysis explanation
* Relevant warnings
* Additional context

---

## ✍️ Explain Before You Sign

Designed around the moment before a user approves or signs an important action.

It focuses on questions such as:

```text
WHO?
What identity is requesting this?

WHAT?
What action or information is involved?

WHY?
What is the stated reason?

SIGNALS?
What unusual indicators were detected?

EVIDENCE?
What supports those indicators?

VERIFY?
What should be independently checked?
```

---

## 📜 History

Allows users to review previous analyses and detected signals.

---

## ⚙️ Settings

Provides application configuration and privacy-related controls.

---

# 🔐 Privacy

Privacy is a core design principle of Satoshi Sentinel.

The project focuses on:

* Minimal unnecessary data collection
* Transparent analysis
* User-controlled interaction
* Explainable results
* Clear separation between evidence and AI interpretation
* Privacy-conscious application design

---

# 🏗️ Architecture

```text
                         SATOSHI SENTINEL
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
         React Frontend                  FastAPI Backend
                │                               │
        ┌───────┼────────┐              ┌───────┼────────┐
        │       │        │              │       │        │
        ▼       ▼        ▼              ▼       ▼        ▼
    Dashboard Analyze  History        API     Analysis    AI
        │       │        │              │       │        │
        └───────┼────────┘              └───────┼────────┘
                │                               │
                └───────────────┬───────────────┘
                                │
                                ▼
                       Security Signals
                                │
                                ▼
                     Evidence + Explanation
```

---

# 💻 Tech Stack

| Technology | Purpose                                |
| ---------- | -------------------------------------- |
| React      | Frontend interface                     |
| Vite       | Frontend tooling                       |
| JavaScript | Application logic                      |
| CSS        | Styling and responsive UI              |
| Lucide     | Interface icons                        |
| Python     | Backend                                |
| FastAPI    | API framework                          |
| Uvicorn    | Backend server                         |
| AI         | Signal interpretation and explanations |

---

# 📁 Project Structure

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

# 🔄 Analysis Flow

```text
Input
  ↓
Validation
  ↓
Signal Extraction
  ↓
Evidence Correlation
  ↓
AI Analysis
  ↓
Structured Result
  ↓
Human-readable Explanation
```

A result can contain information such as:

```json
{
  "risk_level": "medium",
  "signals": [
    {
      "type": "social_engineering",
      "severity": "high"
    },
    {
      "type": "identity",
      "severity": "medium"
    }
  ],
  "evidence": [],
  "explanation": "..."
}
```

The exact API structure may evolve as development continues.

---

# 🧩 Security Model

Satoshi Sentinel does not treat a single unfamiliar signal as automatically malicious.

```text
Unknown Identity
       ↓
Additional Evidence
       ↓
Message Context
       +
URL Information
       +
Transaction Information
       +
Behavioral Signals
       ↓
Combined Analysis
```

Multiple signals can be considered together to provide broader context.

---

# 🧠 AI + Evidence

AI acts as an **analysis and explanation layer**.

The architecture separates:

```text
Evidence
   ↓
Signals
   ↓
Analysis
   ↓
Explanation
```

AI-generated explanations should not be treated as independent proof. The system is designed to make relevant signals and evidence visible wherever possible.

---

# 🚀 Getting Started

## Prerequisites

* Node.js
* npm
* Python 3.10+

## Clone

```bash
git clone https://github.com/sreshtha1804-code/Satoshi-Sentinel.git
cd Satoshi-Sentinel
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

Open another terminal:

```bash
cd Satoshi-Sentinel/backend
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
uvicorn main:app --reload
```

---

# 🔧 Environment Variables

Create a `.env` file when required:

```env
AI_API_KEY=your_api_key
BITCOIN_API_URL=your_api_url
NOSTR_RELAY_URL=your_relay_url
```

Never commit:

```text
.env
API keys
Private keys
Wallet seed phrases
Passwords
Authentication tokens
```

Use `.env.example` for configuration templates.

---

# 📈 Development Status

### Completed

* [x] React + Vite frontend
* [x] Dashboard
* [x] Analyze interface
* [x] Analysis Result interface
* [x] Explain Before You Sign
* [x] History
* [x] Settings / Privacy
* [x] FastAPI backend foundation
* [x] Core analysis architecture

### In Development

* [ ] Bitcoin intelligence integration
* [ ] Nostr intelligence integration
* [ ] URL intelligence
* [ ] Social-engineering analysis
* [ ] Advanced evidence correlation
* [ ] Expanded security signals
* [ ] Frontend/backend integration

---

# 🛣️ Roadmap

### Phase 1 — Interface

* [x] Dashboard
* [x] Analyze
* [x] Analysis Result
* [x] Explain Before You Sign
* [x] History
* [x] Settings
* [x] Responsive UI

### Phase 2 — Backend

* [x] FastAPI foundation
* [ ] Analysis endpoints
* [ ] Input validation
* [ ] Structured responses
* [ ] Frontend/backend integration

### Phase 3 — Intelligence

* [ ] Bitcoin address intelligence
* [ ] Bitcoin transaction analysis
* [ ] Nostr identity analysis
* [ ] Nostr event analysis
* [ ] URL intelligence
* [ ] Social-engineering analysis

### Phase 4 — Correlation

* [ ] Multi-signal correlation
* [ ] Evidence aggregation
* [ ] Context-aware analysis
* [ ] Improved explanations
* [ ] Verification guidance

---

# 🎯 Design Principles

### Explain

Show users **why** something may be suspicious.

### Correlate

Combine multiple signals instead of relying on one indicator.

### Verify

Encourage independent verification before important actions.

### Empower

Provide information while leaving the final decision to the user.

### Protect

Keep privacy and responsible data handling central to the design.

---

# 🤝 Contributing

Contributions are welcome.

```bash
git clone https://github.com/sreshtha1804-code/Satoshi-Sentinel.git
cd Satoshi-Sentinel

git checkout -b feature/your-feature

git add .
git commit -m "Add your feature"

git push origin feature/your-feature
```

When opening a pull request, include:

* What was changed
* Why it was changed
* How it was tested
* Known limitations

---

# 🛠️ Development Guidelines

* Keep security logic explainable.
* Validate user input.
* Avoid unnecessary data collection.
* Never expose credentials or private keys.
* Keep frontend and backend responsibilities separated.
* Handle API failures gracefully.
* Keep analysis modules modular.
* Do not present uncertain results as guaranteed facts.

---

# ⚠️ Disclaimer

Satoshi Sentinel is an experimental security-assistance project.

Its analysis is **not a guarantee** that a Bitcoin address, transaction, Nostr identity, URL, message, or payment request is safe or malicious.

Users should independently verify important information before:

* Sending cryptocurrency
* Signing transactions
* Approving requests
* Clicking suspicious links
* Sharing sensitive information
* Trusting an unfamiliar identity

---

# 👨‍💻 Author

## Sreshtha Das

**B.Tech CSE Student**
**Aspiring Software Engineer**

Interested in:

* Full-stack development
* Artificial intelligence
* Cybersecurity
* Blockchain
* UI/UX
* Open-source development

### Links

* GitHub: https://github.com/sreshtha1804-code
* Repository: https://github.com/sreshtha1804-code/Satoshi-Sentinel

---

# 🛡️ Satoshi Sentinel

### Know what you're signing. Know who you're trusting.

**Analyze. Understand. Verify. Decide.**
