# Yellow Bank Super Agent (YAI™)

A high-fidelity, secure banking agent simulation powered by **Yellow.ai** and **Google Gemini API**. This application demonstrates a multi-step financial workflow including secure authentication, token-optimized data projection, and dynamic rich media rendering.

## 🚀 Overview

The Yellow Bank Agent is a specialized AI interface designed to handle sensitive banking operations. It guides users through a secure authentication funnel to access and manage loan details with high precision and low latency.

## ✨ Key Features

### 🔐 Secure Multi-Step Authentication
- **Identity Collection**: Requests registered Phone Number and Date of Birth (DOB).
- **OTP Workflow**: Integrated mock OTP generation (1234, 5678, 7889, 1209) with real-time verification logic.
- **Identity Core**: Visual status indicators (GUEST vs. VERIFIED) to track session security.

### 📊 Optimized Data Retrieval
- **Workflow A (Loan Discovery)**: Uses a "Projection Method" to extract only essential fields (`ID`, `Type`, `Tenure`) from a raw 15+ field dataset, significantly reducing token consumption.
- **Workflow B (Loan Analysis)**: Detailed tabular statement rendering for specific accounts, covering principal, interest, and nominee details.

### 📱 Premium UI/UX
- **Mobile-First Design**: Fully responsive interface that maintains high-end aesthetics on desktops while providing touch-friendly, legible components on small devices.
- **Rich Media Cards**: Interactive horizontal-scroll cards for account selection.
- **Tabular Statements**: Clean, professional data tables for financial transparency.
- **Voice Input**: Integrated speech-to-text for hands-free banking queries.

### 🤖 Intelligent Agent Behavior
- **English-Only Constraint**: Strict language enforcement for regulatory compliance.
- **Intent Persistence**: Retains the "Loan Details" intent even if authentication is reset (e.g., user changes phone number).
- **CSAT Integration**: Built-in Customer Satisfaction workflow to capture service feedback.

## 🛠 Tech Stack

- **Framework**: React 19 (ESM via esm.sh)
- **Styling**: Tailwind CSS
- **Intelligence**: Google Gemini API (`gemini-3-flash-preview`)
- **Type Safety**: TypeScript

## 📂 Project Structure

- `index.tsx`: Application entry point.
- `App.tsx`: Main UI logic and state management.
- `geminiService.ts`: Integration with `@google/genai` and System Instructions.
- `types.ts`: Interface definitions for loans, messages, and sessions.
- `mockApi.ts`: Simulated banking backend for OTP and data retrieval.
- `metadata.json`: App permissions (Microphone access).

## ⚙️ Setup & Installation

1. **API Key Configuration**:
   - Create a `.env` file in the root directory.
   - Add your Gemini API key:
     ```env
     API_KEY=your_gemini_api_key_here
     ```
   - *Note: `.env` is ignored by git for security.*

2. **Run Environment**:
   - Ensure your environment supports ES Modules.
   - The app uses an `importmap` in `index.html` to load React and Gemini SDK directly from ESM CDNs.

## 🛡 Security Rules

- **Zero Hallucination**: The agent follows a strict "Happy Path" defined in the System Instructions.
- **Privacy**: Mock data simulates bank-grade encryption and secure tunnels.
- **Logout**: One-click session reset clears all sensitive authentication slots from the state.

---
*Powered by Eswar Yellow.ai - The Future of Autonomous Banking.*
