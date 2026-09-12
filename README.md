# Vani-Fi — Financial Intelligence for Bharat 🇮🇳

> **Responsible Hyper-Personalized Financial Copilot for Bharat**  
> *Built for Hackout 2026*

---

## 🌟 Overview

**Vani-Fi** is an AI-powered financial intelligence platform designed specifically for customers across Bharat (Tier 2, 3, 4 towns and emerging digital banking users). Unlike traditional banking apps that prioritize product cross-selling, Vani-Fi understands the customer's financial situation and determines the most appropriate next financial action — **including when NOT to recommend or sell a financial product**.

---

## 🧠 Core Financial Intelligence Layers

1. **Financial Pulse (Health Layer)**: Continuous evaluation of cashflow velocity, liquidity ratios, and debt burdens into an understandable 0–100 benchmark (with clear drivers and explanations).
2. **Safe-to-Spend (Planning Layer)**: Calculates true discretionary spending capacity:
   $$\text{Safe-to-Spend} = \text{Liquid Balance} + \text{Confirmed Inflow} - \sum_{\text{confirmed}} (\text{Amount} - \text{Saved}) - \text{Safety Buffer}$$
3. **Virtual Future Commitments**: Allows users to plan future expenses (college fees, rent, insurance) virtually without locking or moving real bank funds.
4. **Responsible Next Best Action (Decision Layer)**: Context-sensitive recommendations supporting `OFFER`, `ASSIST`, `PROTECT`, `WARN`, and `DO_NOTHING`. Commercial credit is programmatically suppressed during financial distress.
5. **Vernacular Voice AI (Interaction Layer)**: Natural language conversational processing in **Hindi, English, and Gujarati** with explicit confirmation dialogues before financial reservations.
6. **Transparent Lending & KFS (Governance Layer)**: Standardized RBI Key Facts Statement (KFS) disclosure, vernacular audio explanations, interactive comprehension quizzes, and a statutory 3-day penalty-free cool-off window.
7. **Fraud & Protection (Safety Layer)**: Strict separation of financial stress (liquidity pressure) from anomalous fraud events, offering merchant blocking and card freezes.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16.3.3](https://nextjs.org/) (App Router, Turbopack)
- **UI & Runtime**: [React 19](https://react.dev/), [TypeScript 5.7](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)
- **Components**: [Base UI Primitives](https://base-ui.com/), [Shadcn UI Nova](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **State Management**: Centralized Reactive Financial Context (`lib/financial-context.tsx`)
- **Testing**: Native Node.js test runner for unit calculation suites and end-to-end demo journeys

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
```bash
# Run unit tests for Safe-to-Spend, Financial Pulse & Voice NLP
npm test

# Run complete Hackout 2026 End-to-End demo scenario
npm run test:e2e
```

### 4. Production Build & Typecheck
```bash
npm run typecheck
npm run build
npm start
```

---

## 🗺️ Application Routes

- **Public**: `/` (Landing), `/product`, `/how-it-works`, `/trust`
- **Auth & Language**: `/login`, `/verify`, `/language`
- **Onboarding**: `/onboarding`, `/onboarding/consent`, `/onboarding/connect`
- **Dashboard & Core**: `/app` (Overview), `/app/financial-pulse`, `/app/money`, `/app/commitments`
- **Intelligence & Safety**: `/app/for-you`, `/app/protection`, `/app/assistant`
- **Transparent Borrowing**: `/app/loans`, `/app/loans/apply`, `/app/loans/kfs`, `/app/loans/confirm`
- **Settings & Notifications**: `/app/notifications`, `/app/settings`

---

## 📜 Hackout 2026 Demo Scenario

1. **Start**: Liquid Balance = ₹1,00,000, Initial Financial Pulse = 82.
2. **Vernacular Voice**: Speak or trigger *"मेरी बेटी की कॉलेज फीस अगले महीने पचास हजार है"*.
3. **Intent Detection**: System detects `Education`, `₹50,000`, and requests confirmation.
4. **Commitment Created**: User confirms $\rightarrow$ Safe-to-Spend instantly updates to **₹50,000**.
5. **Cashflow Simulations**:
   - Inflow (+₹20,000) $\rightarrow$ Balance: ₹1,20,000, Safe-to-Spend: **₹70,000**.
   - Spending (-₹10,000) $\rightarrow$ Balance: ₹1,10,000, Safe-to-Spend: **₹60,000**.
6. **Responsible AI Guardrail**:
   - Toggle to *Stressed State* $\rightarrow$ Commercial loans are **strictly suppressed**.
   - System recommends budget assistance (`ASSIST`) and safe pacing (`WARN`) rather than selling credit.
7. **Lending & KFS**: Review standardized loan terms, pass the EMI comprehension check, authorize via OTP, and view the active 3-day cool-off cancellation rights.

---

## 🔒 Security & Privacy

- **Account Aggregator Standards**: Read-only financial statements with zero withdrawal capabilities.
- **Explainable Decisions**: Every recommendation provides a *"Why am I seeing this?"* breakdown.
- **Accessibility**: Full keyboard navigation, screen reader labels, and `prefers-reduced-motion` compliance.

---

*Vani-Fi — Financial Intelligence for Bharat.*