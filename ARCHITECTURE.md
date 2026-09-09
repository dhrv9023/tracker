# Personal Finance Command Center (Finance OS) — System Architecture

## 1. System Overview & Philosophy

**Finance OS** is an intelligent, privacy-first personal finance platform inspired by the tactical aesthetic of Money Heist. It transforms personal finance management from passive record-keeping into an active, strategic command center.

The application operates on an uncompromising separation of responsibilities:
```
APPLICATION CALCULATES
        ↓
GEMINI INTERPRETS / RECOMMENDS
        ↓
APPLICATION VALIDATES
        ↓
USER APPROVES ACTION
```

### Core Tenets
1. **Mathematical Determinism**: Financial numbers, surplus calculations, percentages, debt-to-income ratios, compounding projections, and timelines are computed exclusively by pure, deterministic TypeScript algorithms. Gemini never calculates authoritative numbers.
2. **Context-Grounding Without Hallucination**: When AI assistance is invoked, Gemini is provided with authoritative, pre-calculated numbers through structured delimiters. The model's role is strictly to explain trade-offs, ask tactical clarifying questions, and provide qualitative guidance.
3. **No Direct Mutation**: Gemini cannot directly mutate financial ledgers, create missions, or update user profiles. It may propose structured action intents, but the application runtime validates those proposals against business rules, and the user must explicitly approve them.
4. **Client-Centric Privacy**: All personal financial telemetry resides in local device storage. Credentials and API keys are strictly excluded from backups and never transmitted alongside external payloads.

---

## 2. Deterministic Calculation Engines

The application contains pure mathematical utility modules in `src/utils/`:

### A. Cash Flow & Health Score Engine (`finance.ts`, `healthScoreEngine.ts`)
- **Monthly Surplus / Deficit**:
  $$\text{Monthly Surplus} = \text{Total Monthly Income} - \text{Total Monthly Expenses}$$
- **Savings Rate**:
  $$\text{Savings Rate} = \frac{\text{Monthly Surplus}}{\text{Total Income}} \times 100$$
- **Emergency Fund Runway**:
  $$\text{Runway (Months)} = \frac{\text{Liquid Emergency Fund}}{\text{Essential Monthly Expenses}}$$
- **Composite Financial Health Score (0–100)**: Evaluates 5 weighted pillars:
  1. Cash Flow Margin (25%)
  2. Savings Rate (20%)
  3. Emergency Runway (25%)
  4. Debt Burden (15%)
  5. Investment Foundation (15%)

### B. Savings Mission Planning Engine (`finance.ts`)
- **Required Monthly Contribution**:
  $$\text{Required} = \left\lceil \frac{\text{Target Amount} - \text{Current Amount}}{\text{Months Remaining}} \right\rceil$$
- **Feasibility Classification**:
  - `comfortable`: Required contribution absorbs $\le 80\%$ of monthly surplus.
  - `tight`: Required contribution absorbs $80\% - 100\%$ of surplus.
  - `impossible`: Required contribution exceeds total available monthly surplus.
  - `completed`: Target capital reached.
- **Trajectory Ahead/Behind Tracking**: Compares elapsed time against expected linear accumulation with a $\pm ₹1,000$ tolerance band.
- **Conflict Resolution Engine**: Evaluates competing active missions against total flexible surplus using multi-factor priority scoring (importance 40%, deadline urgency 35%, completion momentum 25%).

### C. Investment Planner & SIP Engine (`finance.ts`)
- **SIP Future Value (Annuity Compounding Formula)**:
  $$\text{FV} = P \times \left[ \frac{(1 + r)^n - 1}{r} \right] \times (1 + r)$$
  where $r = \frac{\text{Annual Rate}}{12 \times 100}$, $n = \text{Years} \times 12$.
  When $r = 0$, $\text{FV} = P \times n$.
  Duration is clamped between $0$ and $100$ years to eliminate numerical instability.
- **Investment Readiness Analysis**: Safeguards capital by verifying operating cash flow (no deficit), emergency runway ($\ge 1.0$ months minimum, $\ge 6.0$ months ideal), and high-cost revolving debt liquidation before market exposure.
- **Asset Allocation Modeling**: Conservative (30% Equity / 50% Debt / 20% Gold), Moderate (60% Equity / 30% Debt / 10% Gold), Aggressive (80% Equity / 15% Debt / 5% Gold).

### D. Insights & Monthly Review Engine (`insightsEngine.ts`)
- **Deterministic Pattern Recognition**: Detects category spending surges ($>20\%$ MoM), budget overruns ($\ge 100\%$, $\ge 80\%$), emergency runway erosion, and savings milestones.
- **Historical Honesty**: If prior month data is absent, the engine transparently states data sufficiency constraints rather than fabricating historical comparisons.

---

## 3. Gemini AI Intelligence Layer

The AI copilot operates across 4 specialized interfaces:
1. **Savings Intelligence** (`geminiService.ts`): Wizard assistant that translates natural-language goals ("buy a MacBook by next Diwali") into structured mission parameters.
2. **Investment Explainer** (`geminiService.ts`): Educational guide that translates deterministic SIP numbers into personalized risk and tradeoff explanations.
3. **The Advisor Terminal** (`geminiAdvisorService.ts`): General conversational copilot supporting 8 financial intents (affordability, mission tradeoffs, debt acceleration, lifestyle creep, etc.).
4. **Monthly Review Intelligence** (`geminiMonthlyReviewService.ts`): Generates commanding, tactical executive summaries from the monthly review report.

### Safeguards & Security Architecture
- **Prompt Injection Defense**: User queries are explicitly encapsulated inside `[USER QUERY - UNTRUSTED DATA]` blocks. System instructions mandate treating application figures as immutable truth and user text as unprivileged description.
- **Hybrid Execution (Server Proxy + Client Fallback)**:
  - In development and supported node environments, requests route via `POST /api/gemini` proxy to keep API keys on the server side.
  - In static deployments (e.g. GitHub Pages, static CDNs), requests execute directly in the browser using the user's securely stored client key (`getActiveGeminiApiKey()`).
- **Offline / Failure Fallback**: All Gemini services contain instant deterministic fallbacks that return valid structured data if offline, rate-limited, or encountering malformed responses.

---

## 4. State Management & Persistence Architecture

Application state is managed globally through `FinanceContext.tsx`:

### Schema Versioning & Migrations (`persistenceManager.ts`)
- **Current Version**: `CURRENT_SCHEMA_VERSION = 3`
- **Migration Pipeline**:
  - `v1 -> v2`: Migrates legacy flat transactions into structured schema with `expenseType`, `essentiality`, and `recurring` flags.
  - `v2 -> v3`: Normalizes mission priorities (`critical` mapped to `high`, invalid entries defaulted to `medium`).
- **Corrupt Storage Recovery**: `safeGetItem()` traps JSON parse errors and returns typed defaults to prevent blank-screen app crashes.

### Local Data Vault (Backup & Restore)
- **Sanitized JSON Backup (`exportFullFinancialData`)**:
  - Exports user profile, transactions, budgets, custom categories, missions, contribution logs, investment profile, holdings, and dismissed insights.
  - **Strictly excludes** API keys, credentials, and transient tokens.
- **Atomic Import Validation (`validateAndParseBackup`)**:
  - Parses and validates schema structure before mutating React state or local storage. Rejects malformed JSON with descriptive feedback.
- **Deliberate Purge Protocol (`safePurgeAllData`)**:
  - Two-stage confirmation dialog requiring the user to explicitly type `"PURGE"` or `"RESET"` to execute a complete data purge.

---

## 5. Deployment & Production Setup

### System Requirements
- Node.js 18+ or 20+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd tracker

# Install dependencies
npm install
```

### Environment Configuration
Create a `.env` file in the project root:
```env
# Optional server-side or build-time Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here
# or
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*Note: Users can also enter their Gemini API key directly inside **Settings** in the web interface.*

### Running the Application
```bash
# Start local development server with /api/gemini proxy
npm run dev

# Run automated Vitest test suite
npm test

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```
