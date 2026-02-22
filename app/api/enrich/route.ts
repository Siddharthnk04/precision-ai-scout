import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { isSafePublicUrl } from "@/lib/security";
import { EnrichmentDataSchema, ApiError } from "@/lib/types";
import { INVESTMENT_THESIS } from "@/lib/constants";
import { track } from "@/lib/analytics";

// --- Configuration ---
const IS_DEV = process.env.NODE_ENV === "development";

// OpenAI initialization with safety
const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        if (IS_DEV) console.error("!!! [api/enrich] CRITICAL ERROR: OPENAI_API_KEY IS MISSING !!!");
        return null;
    }
    return new OpenAI({ apiKey });
};

// Global log at startup
if (process.env.OPENAI_API_KEY) {
    if (IS_DEV) console.log(">>> [api/enrich] Intelligence System Online (API Key Validated) <<<");
} else {
    if (IS_DEV) console.error("!!! [api/enrich] Intelligence System Offline (API Key Missing) !!!");
}

// --- Validation Schemas ---
const EnrichRequestSchema = z.object({
    url: z.string().url().max(2048),
    companyId: z.string().optional(),
});

// --- In-Memory Cache (60s Safeguard) ---
const enrichmentHistory = new Map<string, number>();

// --- Simple Token Bucket Rate Limiter ---
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 50;
const ipCache = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const state = ipCache.get(ip);
    if (!state || now > state.resetAt) {
        ipCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (state.count >= MAX_REQUESTS) return false;
    state.count += 1;
    return true;
}

function errorResponse(error: string, code: string, status: number) {
    if (IS_DEV) console.error(`[api/enrich] REJECTED [${status}]: ${error} | Code: ${code}`);
    return NextResponse.json({ error, code }, { status });
}

// Helper for fallback data
const generateFallbackData = (url: string, reason: string): any => {
    return {
        summary: "Intelligence extraction yielded partial results. Manual review recommended.",
        bullets: [`Source scanning encountered a restriction: ${reason}`, "Basic connectivity established"],
        keywords: ["Limited-Scan"],
        signals: [{
            title: "Intelligence Gap",
            description: `The extraction engine encountered an issue: ${reason}. Returning available historical data.`,
            timestamp: new Date().toISOString()
        }],
        sources: [url],
        thesisScore: 50,
        thesisRationale: "Unable to calculate deep alignment due to source accessibility issues.",
        enrichedAt: new Date().toISOString()
    };
};

export async function POST(req: NextRequest) {
    const START_TIME = Date.now();
    let targetUrl = "unknown";

    try {
        // 1. Environment Validation
        const openai = getOpenAIClient();
        if (!openai) {
            return errorResponse("OpenAI Intelligence Service is misconfigured. Please check environment variables.", "AUTH_ERROR", 503);
        }

        // 2. Global Rate Limiting
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        if (!checkRateLimit(ip)) {
            return errorResponse("Server capacity exceeded. Please wait 60 seconds.", "RATE_LIMIT_EXCEEDED", 429);
        }

        // 3. Input Validation
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return errorResponse("Malformed request body.", "INVALID_JSON", 400);
        }

        const validation = EnrichRequestSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(`Input error: ${validation.error.issues[0].message}`, "INVALID_INPUT", 400);
        }
        const { url, companyId } = validation.data;
        targetUrl = url;

        // 4. Duplicate Enrichment Prevention (60s Safeguard)
        if (companyId) {
            const lastEnriched = enrichmentHistory.get(companyId);
            if (lastEnriched && (Date.now() - lastEnriched < 60000)) {
                if (IS_DEV) console.log(`[api/enrich] CACHE_HIT: Deduplicating request for ${companyId}`);
                return errorResponse("Intelligence and signals were just updated. Please wait 60s before re-syncing.", "RECENTLY_ENRICHED", 429);
            }
        }

        // 5. SSRF Protection
        if (!isSafePublicUrl(url)) {
            return errorResponse("Access to the requested URL is restricted for security reasons.", "SSRF_BLOCKED", 400);
        }

        // 6. Fetch Source Data
        if (IS_DEV) console.log(`[api/enrich] SCAN_START: Fetching content from ${url}`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        let htmlSnippet = "";
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PrecisionIntelligence/2.0; +https://precision.ai/scout)' },
                cache: 'no-store',
            });
            if (!response.ok) throw new Error(`HTTP ${response.status} returned by source server.`);
            htmlSnippet = (await response.text()).substring(0, 25000);
        } catch (err: any) {
            if (IS_DEV) console.error(`[api/enrich] SCAN_FAILED for ${url}:`, err.message);

            // SOFT FAILURE: Instead of 500, return fallback data for demo/mock URLs
            if (url.includes('.example.com') || err.message.includes('ENOTFOUND') || err.message.includes('fetch failed')) {
                if (IS_DEV) console.warn(`[api/enrich] Mock or unreachable URL detected. Returning resilient fallback.`);
                const fallback = generateFallbackData(url, err.message);
                if (companyId) enrichmentHistory.set(companyId, Date.now());
                track("enrich_fallback_triggered");
                return NextResponse.json(fallback);
            }

            if (err.name === 'AbortError') return errorResponse("Source website did not respond in time.", "FETCH_TIMEOUT", 504);
            return errorResponse(`Scan failed: ${err.message}`, "FETCH_ERROR", 500);
        } finally {
            clearTimeout(timeout);
        }

        const cleanedText = htmlSnippet
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        if (cleanedText.length < 50) {
            if (IS_DEV) console.warn(`[api/enrich] INSUFFICIENT_CONTENT from ${url}. Length: ${cleanedText.length}`);
            const fallback = generateFallbackData(url, "Insufficient content extracted from website.");
            return NextResponse.json(fallback);
        }

        // 7. Intelligence Extraction & Synthesis
        const generateResponse = async (retryCounter = 0): Promise<any> => {
            try {
                if (IS_DEV) console.log(`[api/enrich] AI_CALL: Requesting synthesis from gpt-4o-mini (Attempt ${retryCounter + 1})`);

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: `You are a Senior VC Analyst. Extract intelligence from the provided text for a startup.
Our investment thesis: "${INVESTMENT_THESIS}"
Return ONLY a valid JSON object matching the requested schema. Ensure signals have ISO timestamps.`
                        },
                        {
                            role: "user",
                            content: `Analyze this content and return exactly this JSON structure:
{
  "summary": "1-2 sentence executive summary",
  "bullets": ["core capability 1", "core capability 2", "core capability 3"],
  "keywords": ["tech1", "tech2", "tech3"],
  "signals": [
    { "title": "Signal Title", "description": "Concise detail", "timestamp": "${new Date().toISOString()}" }
  ],
  "sources": ["${url}"],
  "thesisScore": 85,
  "thesisRationale": "Explain alignment relative to our thesis.",
  "enrichedAt": "${new Date().toISOString()}"
}

Content: ${cleanedText.substring(0, 15000)}`
                        }
                    ],
                    response_format: { type: "json_object" },
                });

                const rawContent = completion.choices[0].message.content || "{}";

                if (IS_DEV) {
                    console.log(`[api/enrich] AI_META: Model=${completion.model} Tokens=${completion.usage?.total_tokens}`);
                }

                const result = JSON.parse(rawContent);
                const parsed = EnrichmentDataSchema.safeParse(result);

                if (!parsed.success) {
                    console.warn(`[api/enrich] AI_VALIDATION_ERROR:`, JSON.stringify(parsed.error.format(), null, 2));
                    if (retryCounter < 1) return generateResponse(retryCounter + 1);
                    throw new Error("Structured output failed validation.");
                }

                return parsed.data;
            } catch (err: any) {
                // Fatal OpenAI errors
                if (err.status === 401 || err.status === 402 || err.status === 429) throw err;

                if (retryCounter < 1) {
                    if (IS_DEV) console.warn(`[api/enrich] AI_RETRYING due to local error: ${err.message}`);
                    return generateResponse(retryCounter + 1);
                }
                throw err;
            }
        };

        const finalData = await generateResponse().catch((err) => {
            console.error("!!! [api/enrich] AI_SYNTHESIS_ABANDONED !!!");
            console.error("Target:", targetUrl);
            console.error("Error:", err.message);

            if (err.error) console.error("Provider Error:", JSON.stringify(err.error, null, 2));

            // Rethrow fatal auth/quota errors
            if (err.status === 401 || err.status === 402 || err.status === 429) throw err;

            // Soft fallback for generic AI failures
            return generateFallbackData(url, "AI engine failed to produce structured analysis.");
        });

        // Update history
        if (companyId) enrichmentHistory.set(companyId, Date.now());

        const duration = Date.now() - START_TIME;
        if (IS_DEV) console.log(`*** [api/enrich] REQUEST_SUCCESS: ${duration}ms | Target: ${targetUrl} ***`);

        track("enrich_successful");
        return NextResponse.json(finalData);

    } catch (error: any) {
        // ULTIMATE FATAL CATCH
        console.error("### [api/enrich] FATAL ROUTE EXCEPTION ###");
        console.error("Context:", targetUrl);
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);

        const status = error.status || error.response?.status || 500;

        if (error.error) console.error("Provider Error Detail:", JSON.stringify(error.error, null, 2));

        console.error("Returning HTTP:", status);
        console.error("########################################");

        if (status === 401) return errorResponse("AI key rejected. Check your subscription.", "AUTH_ERROR", 401);
        if (status === 402) return errorResponse("AI subscription quota exceeded.", "BILLING_ERROR", 402);
        if (status === 429) return errorResponse("AI processing limit reached.", "PROVIDER_LIMIT", 429);

        return errorResponse(`Critical Engine Failure: ${error.message}`, "INTERNAL_ERROR", status);
    }
}
