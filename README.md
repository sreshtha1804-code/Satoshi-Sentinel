# 🛡️ Satoshi Sentinel

### Know what you're signing. Know who you're trusting.

Satoshi Sentinel is a **privacy-first, explainable security companion for the Bitcoin and Nostr ecosystem**.

It helps users analyze Bitcoin-related information, Nostr identities and events, suspicious URLs, payment requests, and social-engineering messages by combining multiple security signals and presenting them in a human-readable way.

Instead of reducing every situation to a simple **SAFE / SCAM** verdict, Satoshi Sentinel focuses on **evidence, signals, context, and explanations**.

The goal is simple:

> **Understand the risk before you trust, sign, click, or pay.**

---

# ✨ Features

## 🔎 Multi-Input Analysis

Satoshi Sentinel is designed to analyze different types of security-sensitive inputs from a single interface.

Supported analysis categories include:

* ₿ Bitcoin addresses
* 💸 Bitcoin payment requests
* 🟣 Nostr identities
* 📝 Nostr events and messages
* 🔗 Suspicious URLs
* 💬 Social-engineering messages
* 🔐 Transaction-related information

Each input can contain different types of security signals, so the analysis process is designed to look beyond a single indicator.

---

# ₿ Bitcoin Security

Bitcoin transactions are generally irreversible, which makes verifying information before sending funds especially important.

Satoshi Sentinel can be used to inspect Bitcoin-related information and surface potentially relevant signals.

The analysis can consider:

* Bitcoin addresses
* Payment information
* Transaction-related data
* Suspicious payment instructions
* Address-related signals
* Context surrounding a payment request

The objective is not to tell the user what decision to make, but to provide additional context before they proceed.

---

# 🟣 Nostr Security

Nostr provides decentralized identity and communication, but users may still encounter impersonation, misleading identities, suspicious messages, or unfamiliar public keys.

Satoshi Sentinel is designed to analyze:

* Nostr public keys
* Identities
* Events
* Messages
* Identity-related signals
* Suspicious activity patterns
* Context surrounding interactions

This allows users to investigate unfamiliar Nostr information before trusting or interacting with it.

---

# 🔗 URL Analysis

Links are commonly used in phishing and social-engineering attacks.

Satoshi Sentinel can analyze suspicious URLs and surface signals that may deserve additional attention.

Potential signals can include:

* URL structure
* Domain-related indicators
* Suspicious patterns
* Context of the URL
* Social-engineering context

The result is presented as an explanation rather than a simple binary classification.

---

# 💬 Social Engineering Analysis

Technical indicators are not always enough.

A message can be suspicious because of the way it tries to influence a user.

Satoshi Sentinel can analyze messages for patterns such as:

* Urgency
* Pressure
* Impersonation
* Suspicious payment requests
* Requests for sensitive information
* Manipulative language
* Unusual instructions
* Trust exploitation

The system combines these signals with other available evidence to produce a broader explanation.

---

# 🧠 Explainable Risk Analysis

One of the core ideas behind Satoshi Sentinel is **explainability**.

Instead of displaying:

```text
SCAM
```

the application is designed to provide information such as:

```text
Risk Signals
├── Identity Signal
├── Transaction Signal
├── URL Signal
├── Behavioral Signal
└── Social Engineering Signal

Evidence
├── Observed indicator
├── Related context
└── Supporting information

Analysis
└── Human-readable explanation
```

This gives users more context about **why an input may deserve caution**.

---

# 🔄 Analysis Pipeline

Satoshi Sentinel follows an evidence-oriented analysis pipeline.

```text
┌──────────────────────┐
│      User Input      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Signal Extraction  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Evidence Correlation │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    AI Analysis       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Risk Explanation     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   User Decision      │
└──────────────────────┘
```

The final decision remains with the user.

---

# 🎯 Core Principles

## Explain

Show users the signals and reasoning behind an analysis.

## Correlate

Combine multiple pieces of evidence instead of depending on a single indicator.

## Verify

Encourage users to inspect important information before acting.

## Empower

Give users context that helps them make their own decisions.

## Protect

Keep privacy and responsible data handling central to the product design.

---

# 🖥️ Application

The current application is organized around several major interfaces.

---

## 🏠 Dashboard

The dashboard acts as the central entry point to Satoshi Sentinel.

It provides access to:

* Security analysis
* Recent analysis activity
* Quick actions
* Explain Before You Sign
* History
* Settings

The dashboard is designed to give users a quick overview without requiring them to navigate through multiple pages before starting an analysis.

---

# 🔍 Analyze

The Analyze page is the primary interface for submitting information.

Users can provide security-relevant information such as:

* Bitcoin addresses
* URLs
* Messages
* Nostr-related information
* Payment requests
* Other suspicious content

The input is then passed through the analysis flow.

---

# 📊 Analysis Result

The Analysis Result interface presents the output of the analysis.

The interface is designed around understandable security information rather than a single classification.

It can present:

* Risk level
* Detected signals
* Supporting evidence
* Analysis explanation
* Relevant warnings
* Additional context

The objective is to help users understand the result rather than simply display a label.

---

# ✍️ Explain Before You Sign

**Explain Before You Sign** is designed around the moment immediately before a user approves or signs an action.

Instead of encouraging users to blindly approve a request, the feature focuses on questions such as:

```text
What am I signing?

Who is requesting it?

What information is involved?

Are there unusual signals?

What should I verify before continuing?
```

This creates a security checkpoint before an irreversible or important action.

---

# 📜 History

The History page allows users to review previous analyses.

Historical information can help users:

* Revisit previous investigations
* Compare previous analysis results
* Review detected signals
* Keep track of suspicious inputs
* Return to an earlier analysis

---

# ⚙️ Settings

The Settings section provides application configuration and privacy-related controls.

The interface is designed to keep privacy considerations visible instead of hiding them behind the application.

---

# 🔐 Privacy

Privacy is a central design principle of Satoshi Sentinel.

The project aims to avoid unnecessary exposure of user information while providing useful security analysis.

Key principles include:

* Minimal unnecessary data collection
* Transparent analysis
* User-controlled interaction
* Explainable results
* Clear separation between evidence and AI-generated interpretation
* Privacy-focused application design

---

# 🏗️ Architecture

Satoshi Sentinel is divided into a frontend application and backend services.

```text
                         SATOSHI SENTINEL
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
          React Frontend                FastAPI Backend
                │                             │
        ┌───────┼────────┐            ┌───────┼────────┐
        │       │        │            │       │        │
        ▼       ▼        ▼            ▼       ▼        ▼
     Dashboard Analyze History     API Layer Analysis AI
        │       │        │            │       │        │
        └───────┼────────┘            └───────┼────────┘
                │                             │
                └──────────────┬──────────────┘
                               │
                               ▼
                       Security Signals
                               │
                               ▼
                     Evidence + Explanation
```

---

# 💻 Technology Stack

## Frontend

| Technology | Purpose                          |
| ---------- | -------------------------------- |
| React      | User interface                   |
| Vite       | Development and build tooling    |
| JavaScript | Application logic                |
| CSS        | Styling and responsive interface |
| Lucide     | Interface icons                  |

---

## Backend

| Technology | Purpose             |
| ---------- | ------------------- |
| Python     | Backend development |
| FastAPI    | API framework       |
| Uvicorn    | Development server  |

---

## AI

AI-assisted analysis is used to interpret extracted signals and generate human-readable explanations.

The AI layer is intended to work with structured security information rather than replacing the underlying evidence.

---

# 📁 Complete Project Structure

```text
Satoshi-Sentinel/
│
├── .github/
│   │
│   └── workflows/
│       │
│       └── deploy.yml
│
├── frontend/
│   │
│   ├── public/
│   │   │
│   │   ├── favicon.svg
│   │   └── ...
│   │
│   ├── src/
│   │   │
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
│   │
│   ├── app/
│   │   │
│   │   ├── __init__.py
│   │   │
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
├── LICENSE
├── README.md
└── CONTRIBUTING.md
```

> The structure above represents the intended organization of the application as the frontend and backend modules are developed. Individual files may change as implementation progresses.

---

# 🔌 Backend API Concept

The backend provides a layer between the frontend and analysis services.

A typical request follows this pattern:

```text
Frontend
   │
   │ POST /analyze
   ▼
FastAPI
   │
   ▼
Input Validation
   │
   ▼
Signal Extraction
   │
   ▼
Evidence Correlation
   │
   ▼
AI Analysis
   │
   ▼
Structured Result
   │
   ▼
Frontend
```

A structured response can contain information such as:

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

The exact API response structure may evolve as the backend implementation develops.

---

# 🧩 Analysis Model

Satoshi Sentinel separates analysis into multiple layers.

## 1. Input

Raw information submitted by the user.

```text
Address
URL
Message
Nostr Event
Payment Request
```

## 2. Signals

Relevant indicators extracted from the input.

```text
Identity
Transaction
URL
Behavior
Social Engineering
Context
```

## 3. Evidence

Information supporting individual signals.

```text
Observed data
External information
Related context
Historical information
```

## 4. Correlation

Signals are considered together rather than independently.

```text
Signal A
   +
Signal B
   +
Signal C
   ↓
Combined Context
```

## 5. Explanation

The resulting information is converted into a human-readable explanation.

---

# 🧪 Example Analysis Flow

Consider a hypothetical message:

```text
"URGENT! Your Bitcoin account has been compromised.
Send your BTC to this address immediately to secure your funds."
```

The system could identify signals such as:

```text
Social Engineering
├── Urgency
├── Fear-based messaging
└── Immediate payment request

Transaction
└── Bitcoin address included

Behavior
└── Pressure to act without verification
```

Instead of simply returning:

```text
SCAM
```

the interface can explain why these signals deserve attention.

---

# 🛡️ Security Philosophy

Satoshi Sentinel follows a **defense-in-depth** approach.

A single signal should not automatically determine the complete analysis.

For example:

```text
Unknown Identity
       │
       ├── Not automatically malicious
       │
       ▼
Additional Evidence
       │
       ├── Message context
       ├── URL information
       ├── Transaction information
       └── Behavioral signals
       │
       ▼
Combined Analysis
```

This helps avoid treating unfamiliar information as automatically malicious.

---

# 📊 Risk Representation

Satoshi Sentinel is designed to communicate risk using multiple dimensions.

Possible categories include:

```text
LOW
MEDIUM
HIGH
```

However, the risk level is only one part of the analysis.

The interface can also expose:

* Signal severity
* Supporting evidence
* Confidence/context
* Explanation
* Recommended verification steps

The purpose is to provide context rather than create a false sense of certainty.

---

# 🔐 Explain Before You Sign

The **Explain Before You Sign** workflow is one of the core concepts of the project.

Before signing or approving something important, the user should be able to inspect:

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
What information supports those indicators?

VERIFY?
What should the user independently check?
```

This creates a security-oriented pause before an important action.

---

# 🧠 AI + Evidence

AI is used as an **analysis and explanation layer**.

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

This distinction is important because an AI-generated explanation should not be treated as independent proof.

The application is designed to make the underlying signals and evidence visible wherever possible.

---

# 🌐 Bitcoin + Nostr

Satoshi Sentinel combines two important parts of the decentralized ecosystem:

```text
Bitcoin
   │
   ├── Addresses
   ├── Payments
   └── Transactions
       
Nostr
   │
   ├── Identities
   ├── Public Keys
   ├── Events
   └── Messages
```

The combination allows the project to examine security situations where identity, communication, and payments can intersect.

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone https://github.com/sreshtha1804-code/Satoshi-Sentinel.git
cd Satoshi-Sentinel
```

---

## 2. Install frontend dependencies

```bash
cd frontend
npm install
```

---

## 3. Start the frontend

```bash
npm run dev
```

The frontend will start through the Vite development server.

---

## 4. Set up the backend

Open a new terminal:

```bash
cd Satoshi-Sentinel/backend
```

Create a virtual environment:

```bash
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

Install backend dependencies:

```bash
pip install -r requirements.txt
```

---

## 5. Start FastAPI

```bash
uvicorn main:app --reload
```

The backend will run locally through Uvicorn.

---

# 🔧 Environment Variables

Create a `.env` file inside the backend directory when required.

Example:

```env
AI_API_KEY=your_api_key
BITCOIN_API_URL=your_api_url
NOSTR_RELAY_URL=your_relay_url
```

Do not commit actual API keys or secrets to GitHub.

The repository should contain `.env.example` instead.

---

# 🔒 Environment Security

Never commit:

```text
.env
API keys
Private keys
Wallet seed phrases
Authentication tokens
Passwords
Secret credentials
```

Use environment variables for sensitive configuration.

---

# 📈 Development Status

Satoshi Sentinel is currently under active development.

### Current

* React + Vite frontend
* Dashboard
* Analyze interface
* Analysis result interface
* Explain Before You Sign interface
* History
* Settings/privacy interface
* FastAPI backend foundation
* Security-analysis architecture
* AI-assisted analysis concept

### In Development

* Bitcoin intelligence integration
* Nostr intelligence integration
* URL analysis
* Expanded evidence correlation
* More security signals
* Backend/frontend integration
* More detailed analysis explanations

---

# 🛣️ Roadmap

## Phase 1 — Interface

* [x] Dashboard
* [x] Analyze page
* [x] Analysis result page
* [x] Explain Before You Sign
* [x] History
* [x] Settings
* [x] Responsive interface

## Phase 2 — Backend

* [x] FastAPI foundation
* [ ] Analysis endpoints
* [ ] Input validation
* [ ] Structured analysis responses
* [ ] Frontend/backend integration

## Phase 3 — Intelligence

* [ ] Bitcoin address intelligence
* [ ] Bitcoin transaction analysis
* [ ] Nostr identity analysis
* [ ] Nostr event analysis
* [ ] URL intelligence
* [ ] Social-engineering analysis

## Phase 4 — Correlation

* [ ] Multi-signal correlation
* [ ] Evidence aggregation
* [ ] Context-aware analysis
* [ ] Improved risk explanations
* [ ] Confidence/context indicators

## Phase 5 — Expansion

* [ ] More decentralized ecosystem integrations
* [ ] Additional security signals
* [ ] Improved explainability
* [ ] Extended analysis history
* [ ] More verification workflows

---

# 🎯 Design Goals

Satoshi Sentinel is built around several design goals.

### Human-readable

Security information should be understandable without requiring deep blockchain expertise.

### Evidence-oriented

Important conclusions should be connected to observable signals and supporting information.

### Privacy-conscious

Security analysis should minimize unnecessary exposure of user information.

### Explainable

Users should be able to understand how an analysis was produced.

### Non-binary

Security situations are not always simply safe or malicious.

### User-controlled

The application provides information and analysis while leaving the final decision with the user.

---

# 🖼️ Interface Philosophy

The interface is designed around a simple hierarchy:

```text
INPUT
  ↓
WHAT WAS DETECTED?
  ↓
WHY DOES IT MATTER?
  ↓
WHAT EVIDENCE SUPPORTS IT?
  ↓
WHAT SHOULD I VERIFY?
```

This keeps the analysis focused on information users can actually understand and act upon.

---

# ⚡ Performance Goals

The project aims to keep the analysis experience responsive by:

* Keeping the frontend lightweight
* Separating UI and backend responsibilities
* Processing only necessary information
* Returning structured analysis results
* Avoiding unnecessary network operations
* Keeping analysis components modular

---

# 🧱 Modularity

The backend is designed so different analysis modules can be developed independently.

```text
                    Analyzer
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
     Bitcoin         Nostr           URL
     Analyzer        Analyzer       Analyzer
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
                Signal Correlation
                       │
                       ▼
                  AI Analysis
                       │
                       ▼
                   Explanation
```

This makes it possible to expand Satoshi Sentinel without rebuilding the entire system.

---

# 🧪 Testing

Testing will cover different layers of the application.

## Frontend

* Component behavior
* Input validation
* Page navigation
* Responsive layouts
* Analysis result rendering

## Backend

* API endpoints
* Input validation
* Analysis services
* Error handling
* Structured responses

## Security Analysis

* Bitcoin inputs
* Nostr inputs
* URLs
* Social-engineering messages
* Multiple signals occurring together

---

# 🛠️ Error Handling

The application should clearly handle situations such as:

```text
Invalid Input
      ↓
Clear Validation Message

Unavailable Service
      ↓
Informative Error

Incomplete Data
      ↓
Explain Missing Information

Analysis Failure
      ↓
Safe Fallback
```

The interface should avoid presenting incomplete analysis as a definitive result.

---

# 🤝 Contributing

Contributions are welcome.

A typical contribution workflow is:

```bash
git clone https://github.com/sreshtha1804-code/Satoshi-Sentinel.git

cd Satoshi-Sentinel

git checkout -b feature/your-feature

git add .

git commit -m "Add your feature"

git push origin feature/your-feature
```

Then open a pull request describing:

* What was changed
* Why it was changed
* How it was tested
* Any known limitations

---

# 📌 Development Guidelines

When contributing to Satoshi Sentinel:

* Keep security-related logic explainable
* Avoid unnecessary collection of user data
* Do not expose private credentials
* Keep frontend and backend responsibilities separated
* Validate user input
* Handle API failures gracefully
* Keep analysis signals modular
* Document new analysis logic
* Avoid presenting uncertain results as guaranteed facts

---

# ⚠️ Disclaimer

Satoshi Sentinel is an experimental security-assistance project.

Its analysis should **not** be treated as a guarantee that a transaction, Bitcoin address, Nostr identity, URL, message, or payment request is safe or malicious.

Users should independently verify important information before:

* Sending cryptocurrency
* Signing transactions
* Approving requests
* Clicking suspicious links
* Sharing sensitive information
* Trusting an unfamiliar identity

---

# 📜 License

This project is licensed under the **MIT License**.

See the [`LICENSE`](LICENSE) file for the complete license text.

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
* Project Repository: https://github.com/sreshtha1804-code/Satoshi-Sentinel

---

# 🏆 Hackathon Project

**Satoshi Sentinel** was developed as a project for **BOSS Battle 2026 by Bitshala**.

### Track

**AI**

### Focus

```text
Bitcoin
+
Nostr
+
AI
+
Security
+
Explainability
+
Privacy
```

---

# 🧭 Project Vision

Satoshi Sentinel is built around a simple idea:

> **Security should not depend on blind trust.**

In decentralized systems, users often become their own final security layer.

Satoshi Sentinel aims to make that layer more informed by bringing together:

```text
Identity
      +
Communication
      +
Transactions
      +
URLs
      +
Behavior
      +
Evidence
      ↓
Explainable Security Analysis
```

The long-term goal is to make security analysis more understandable and accessible across decentralized financial and communication ecosystems.

---

# 🛡️ Satoshi Sentinel

### Know what you're signing. Know who you're trusting.

**Analyze. Understand. Verify. Decide.**
