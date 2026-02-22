# Precision AI Scout - VC Intelligence Interface

A production-grade internal SaaS tool for venture capital firms to turn an investment thesis into an always-on discovery workflow.

## Overview

Precision AI Scout reduces sourcing noise by focusing on thesis-driven discovery. It provides a structured workflow from discovery to deep company enrichment using live web data and LLMs.

### Key Features

- **Thesis-Driven Discovery**: Faceted filtering by Sector, Stage, and Geography linked to fund requirements.
- **Live Web Enrichment**: One-click server-side scanning of company websites to extract summaries, signals (hiring, product updates), and keywords via OpenAI.
- **Explainable AI**: Automated "Why This Matches Thesis" signals based on company data and enriched insights.
- **Workflow Management**: Create lists, save complex searches, and record internal analysis notes.
- **Production Ready**: Server-side API keys, robust error handling, and premium UI aesthetics.
- **Zero-DB Architecture**: Uses LocalStorage for MVP persistence and AI caching, enabling instant Vercel deployment without database overhead.

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **LLM**: OpenAI GPT-4o-mini (Server-side Route Handlers)
- **Persistence**: LocalStorage with custom storage hooks

## Setup Instructions

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add your OpenAI API key:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
5.  **Build for Production**:
    ```bash
    npm run build
    ```

## Deployment (Vercel)

1.  Push the code to a GitHub repository.
2.  Import the project in Vercel.
3.  Add the `OPENAI_API_KEY` into the **Environment Variables** section in Vercel settings.
4.  Deploy.

## Security & Production Guardrails

The following production hardening measures have been implemented:

- **SSRF Protection**: Incoming URLs are validated in `lib/security.ts`. Internal, private, and reserved IP ranges are blocked from external fetches.
- **Request Validation**: All API inputs and AI outputs are strictly validated using `zod` schemas defined in `lib/types.ts`.
- **Rate Limiting**: Implemented a per-IP token bucket rate limiter on the enrichment route (10 req/min) to prevent budget exhaustion and abuse.
- **XSS Prevention**: AI-generated content is rendered using standard React text nodes. No `dangerouslySetInnerHTML` is used.
- **Content Boundaries**: External HTML is truncated and stripped of scripts/styles before being sent to LLMs, reducing token costs and attack surface.
- **Error Standardization**: All API errors follow a `{ error, code }` structure with appropriate HTTP status codes (400, 429, 504, etc.).

## Known Limitations

- **State Sync**: LocalStorage is used for persistence. Data is local to the browser and doesn't sync across devices.
- **Scraping Depth**: The current enrichment logic only scans the landing page.
- **Rate Limit Persistence**: The current rate limiter is in-memory. For multi-instance Vercel deployments, migrating to Upstash/Redis is recommended.

## License

Internal Use - Production Grade MVP
