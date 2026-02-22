# Precision AI Scout

A production-grade Venture Capital intelligence platform designed to transform fund investment theses into automated, actionable sourcing workflows.

## Project Overview
Precision AI Scout solves the "signal-to-noise" problem in early-stage venture sourcing. Traditional discovery tools often return generic lists that require manual triaging. This platform implements a **thesis-driven sourcing** approach, where every startup is evaluated against specific fund requirements using explainable AI.

By combining real-time web intelligence with LLM-powered synthesis, it enables analysts to move from a URL to a deep, thesis-aligned investment memo in seconds.

## Live Demo
- **Deployed URL**: https://precision-ai-scout-pbhr.vercel.app
- **GitHub Repository**: https://github.com/Siddharthnk04/precision-ai-scout

## Core Features

### Discovery Engine
- **What**: Advanced faceted search across sectors, investment stages, and geographies with real-time reactive filtering.
- **Why (VC Context)**: Analysts need to slice the "universal set" of startups into specific cohorts (e.g., "Seed stage AI in Europe") instantly to maintain pipeline velocity.

### Company Profile Intelligence
- **What**: Aggregated view of company data including metadata, tags, and internal analysis notes.
- **Why (VC Context)**: Centralizes all known data about a lead, reducing context switching between multiple tabs and tools.

### Live Enrichment (OpenAI-Powered)
- **What**: One-click server-side extraction of live company data. Scans websites to identify product pivots, hiring signals, and core value props.
- **Why (VC Context)**: Startup websites change faster than databases. Real-time enrichment ensures the analyst is looking at the ground truth, not a 6-month-old stale record.

### Signal Pulse Dashboard
- **What**: A chronological feed of market signals and intelligence freshness indicators.
- **Why (VC Context)**: Identifies which companies in the pipeline have new developments or require a "re-sync" of their intelligence.

### Lists & Pipeline Management
- **What**: Custom organizational buckets for companies (e.g., "Q1 Alpha Pipeline").
- **Why (VC Context)**: Moves sourcing from "search" to "workflow," allowing teams to manage specific deal-flow tracks.

### Saved Searches
- **What**: Persistent search parameters that can be revisited with a single click.
- **Why (VC Context)**: Automates the monitoring of specific market segments that match the fund's evergreen thesis.

### Export (CSV / JSON)
- **What**: Fully functional, client-side generation of sorted and filtered datasets.
- **Why (VC Context)**: Ensures interoperability with existing VC stacks (Affinity, Salesforce, HubSpot).

### Thesis Match Scoring
- **What**: An AI-calculated score (0-100) indicating how well a company aligns with the fund's investment thesis.
- **Why (VC Context)**: Acts as a force multiplier for analysts, allowing them to prioritize high-alignment leads during peak deal-flow periods.

### Intelligence Freshness Logic
- **What**: Visual tracking of when a company was last "synced" with the live web.
- **Why (VC Context)**: Prevents redundant API calls and ensures data reliability.

## Architecture Overview

The system is built on a modern **Next.js 14** stack, prioritizing security, performance, and developer experience.

```text
[ Browser / Client ]
       |
       |--- [ UI Components (Tailwind CSS, Lucide) ]
       |--- [ Storage Engine (Zod Validated LocalStorage) ]
       |
[ Next.js Server ]
       |
       |--- [ API Route: /api/enrich ]
                |-- [ Rate Limiter (Token Bucket) ]
                |-- [ SSRF Protection (lib/security.ts) ]
                |-- [ Content Sanitizer ]
                |-- [ OpenAI GPT-4o-mini Synthesis ]
                |-- [ Structured Output Verification ]
```

### Key Architectural Pillars:
- **Next.js 14 App Router**: Efficient server-side rendering and client-side transitions.
- **Server-Side Enrichment**: All API keys and scraping logic are isolated on the server to prevent client-side exposure.
- **Zod Validation**: Strict schema enforcement for all data at the boundaries (API entry, AI output, LocalStorage).
- **Zero-DB Persistence**: Optimized for low-latency MVPs using LocalStorage as a reactive cache and note store.

## Security & Production Hardening
- **Server-Only Secrets**: OpenAI API keys are never exposed to the client.
- **SSRF Protection**: `lib/security.ts` blocks internal/private IP ranges during web scanning to prevent Server-Side Request Forgery.
- **Rate Limiting**: Per-IP throttling prevents API abuse and budget exhaustion.
- **Safe Error Handling**: Unified error response format `{ error, code }` without leaking stack traces.
- **Build Verification**: Strict TypeScript mode and linting enforced for every production build.

## Setup Instructions

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/siddharthnaik/precision-ai-scout.git
    cd precision-ai-scout
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root:
    ```env
    OPENAI_API_KEY=your_sk_key_here
    ```

4.  **Development Mode**
    ```bash
    npm run dev
    ```

5.  **Build for Production**
    ```bash
    npm run build
    npm start
    ```

## Example VC Workflow

1.  **Discovery**: Filter for "AI/ML", "Seed", and "United States".
2.  **Save Search**: Save as "US AI Seed" to revisit later.
3.  **Triage**: Review the list and click "Enrich" on a high-potential target.
4.  **Analysis**: Read the AI-generated "Thesis Alignment" and add internal notes.
5.  **Pipeline**: Add the company to the "Active Pipeline" list.
6.  **Export**: Export the pipeline as a CSV for the Monday morning partners' meeting.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS / Vanilla CSS
- **AI**: OpenAI SDK (GPT-4o-mini)
- **Validation**: Zod
- **Icons**: Lucide React
- **Analytics**: Custom internal tracking



## Final Status
**STATUS: PRODUCTION READY**
The project fulfills all architectural and feature requirements. All core flows (Discovery, Enrichment, Storage, Export) are fully functional and validated against production build constraints.
