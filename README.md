# ₿ Satoshi Sentinel

### Know what you're signing. Know who you're trusting.

Satoshi Sentinel is a privacy-first security companion for **Bitcoin and Nostr** that helps users investigate suspicious messages, payment requests, URLs, Bitcoin addresses, and Nostr activity.

Instead of simply returning a **“SCAM” or “SAFE”** label, Satoshi Sentinel extracts observable signals, explains why they matter, and helps users understand what they should verify before clicking, sending, or signing.

---

## 🚨 The Problem

Bitcoin and Nostr give users greater control over their money and identity, but that also means users are responsible for making important security decisions themselves.

A suspicious message may contain:

* Urgent requests
* Fake rewards or giveaways
* Bitcoin payment addresses
* External links
* Impersonation attempts
* Social-engineering language
* Suspicious transaction details

Checking each signal manually can be difficult, especially for users who are not familiar with Bitcoin or decentralized systems.

Satoshi Sentinel brings these signals together into one explainable security workflow.

---

## 🛡️ What Satoshi Sentinel Does

The core analysis flow is:

```text
Input
  ↓
Extract Signals
  ↓
Correlate Evidence
  ↓
Risk Analysis
  ↓
AI Explanation
  ↓
Recommended Verification Steps
```

Users can investigate:

* Suspicious messages
* Bitcoin addresses
* URLs
* Payment requests
* Nostr events
* Transaction information

The system focuses on explaining the evidence instead of blindly making the decision for the user.

---

## 🔍 Key Features

### Suspicious Message Analysis

Detects patterns such as:

* Urgency
* Payment requests
* Reward/giveaway framing
* External URLs
* Bitcoin addresses
* Social-engineering indicators
* Possible impersonation patterns

### ₿ Bitcoin Address Investigation

Analyze publicly available Bitcoin information before sending funds.

The system is designed around public information and does not require private keys or wallet credentials.

### 🟣 Nostr Investigation

Inspect observable Nostr information such as:

* Public identities
* Profile metadata
* Events
* Public keys
* Relay-based information

The existence of a Nostr identity is treated as evidence, not automatic proof of legitimacy.

Nostr uses public-key cryptography and relay-based communication, making public identity and event information useful inputs for investigation.

### ✍️ Explain Before You Sign

A dedicated interface for understanding Bitcoin transaction information before authorization.

It can be designed to explain:

* Inputs
* Outputs
* Destination
* Amount
* Fees
* Change
* Suspicious characteristics
* What the transaction is actually doing

**Satoshi Sentinel never asks for your seed phrase or private key and does not perform wallet signing.**

---

## 🧠 Explainable AI

Satoshi Sentinel does not rely entirely on an LLM to decide whether something is dangerous.

The architecture separates:

```text
Deterministic Signal Extraction
            ↓
      Structured Evidence
            ↓
       Risk Analysis
            ↓
       AI Explanation
```

This allows the system to identify concrete signals first and use AI primarily to explain those findings in human-readable language.

The risk score is an **indicator of observed signals, not proof of fraud**.

---

## 🔐 Privacy First

Security tools should not require users to surrender their most sensitive information.

Satoshi Sentinel follows strict privacy boundaries:

* ❌ No seed phrases
* ❌ No private keys
* ❌ No wallet passwords
* ❌ No custodial wallet
* ❌ No transaction signing
* ✅ Public Bitcoin information
* ✅ Public Nostr information
* ✅ User-provided content
* ✅ Server-side API key handling

Sensitive information should never be submitted to the application for analysis.

---

## 📊 Risk Analysis

Satoshi Sentinel uses observable signals to calculate an analysis score.

| Score  | Level  |
| ------ | ------ |
| 0–29   | LOW    |
| 30–54  | MEDIUM |
| 55–100 | HIGH   |

Examples of higher-risk signals include:

* Requests for private keys or seed phrases
* Suspicious payment requests
* Verified malicious indicators

Other signals may include:

* Urgency
* External links
* Reward framing
* Unusual payment context
* Impersonation patterns

The score should be treated as an investigative aid rather than a definitive fraud verdict.

---

## 🏗️ Architecture

```text
                 ┌─────────────────────┐
                 │       Frontend      │
                 │   React + Vite      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Analysis API     │
                 │   FastAPI / Python  │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │ Bitcoin  │   │  Nostr   │   │  Signal  │
       │   Data   │   │   Data   │   │  Engine  │
       └──────────┘   └──────────┘   └────┬─────┘
                                          │
                                          ▼
                                ┌─────────────────┐
                                │  AI Explanation │
                                └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS
* Lucide React

### Backend

* Python
* FastAPI

### Data & Protocols

* Bitcoin public APIs
* Nostr protocol
* WebSockets
* SQLite

### AI

* AI / LLM integration
* Deterministic local analysis fallback

---

## 📁 Project Structure

```text
satoshi-sentinel/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── data/
│   │   └── styles/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/satoshi-sentinel.git
cd satoshi-sentinel
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### 3. Backend

Open another terminal:

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

## ⚙️ Environment Variables

Create a `.env` file for local configuration.

Example:

```env
VITE_API_URL=http://localhost:8000

AI_API_KEY=
AI_MODEL=

BITCOIN_API_URL=
NOSTR_RELAY_URL=

DATABASE_URL=sqlite:///./satoshi_sentinel.db
```

Never commit real API keys or secrets.

---

## 🧪 Demo Mode

Satoshi Sentinel is designed to remain demonstrable even without an external AI API key.

A deterministic local analysis engine can identify common suspicious signals and provide a basic analysis flow without depending entirely on an external AI service.

Example input:

```text
URGENT! Your account has been selected for a
0.05 BTC reward. Send the verification fee to
[Bitcoin address] and claim your reward at
[external URL].
```

Possible detected signals:

```text
✓ Urgency
✓ Bitcoin payment request
✓ External URL
✓ Reward/giveaway framing
✓ Bitcoin address
```

The application then explains why these signals deserve attention.

---

## 🔒 Security Principles

Satoshi Sentinel follows several core principles:

1. **Never request secrets**
2. **Separate evidence from AI interpretation**
3. **Use public information wherever possible**
4. **Do not blindly trust decentralized identities**
5. **Do not perform wallet signing**
6. **Keep API credentials server-side**
7. **Treat risk scores as indicators, not proof**

---

## 🗺️ Future Development

Planned improvements include:

* Expanded Bitcoin transaction analysis
* More Bitcoin data sources
* Nostr relay integration
* Nostr profile and event correlation
* Stronger deterministic security rules
* Improved evidence correlation
* More detailed transaction explanations
* Additional phishing and impersonation detection
* Production-grade rate limiting and security controls

---

## 🎯 Why Satoshi Sentinel?

Satoshi Sentinel is built around a simple idea:

> **Security tools should help users understand what they are trusting, not simply tell them what to trust.**

Bitcoin and Nostr are built around user control. Satoshi Sentinel extends that principle to security by making suspicious activity more understandable and evidence-driven.

---

## 👤 Built By

**Sreshtha Das**

Built independently as a solo project focused on:

* Bitcoin security
* Nostr
* Privacy
* Explainable AI
* Cybersecurity
* User-controlled technology

---

## ⚠️ Disclaimer

Satoshi Sentinel is an **investigative assistance tool**, not a fraud oracle.

A risk score or AI-generated explanation does not guarantee that an address, message, identity, website, or transaction is malicious or legitimate.

Always independently verify important information before sending funds, clicking suspicious links, or authorizing transactions.

---

### ₿ Bitcoin × Nostr × AI × Privacy

**Know what you're signing. Know who you're trusting.**
