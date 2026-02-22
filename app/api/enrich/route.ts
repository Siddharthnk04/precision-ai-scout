import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { isSafePublicUrl } from "@/lib/security";
import { EnrichmentDataSchema, ApiError } from "@/lib/types";

// Lazy instantiation to avoid errors during build-time static analysis
let openai: OpenAI | null = null;
function getOpenAIClient() {
    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
        });
    }
    return openai;
}

// --- Validation Schemas ---
const EnrichRequestSchema = z.object({
    url: z.string().url().max(2048),
});

// --- Simple Token Bucket Rate Limiter (Production-grade fallback) ---
// Note: In a real distributed environment (Vercel), use Upstash/Redis for shared state.
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const ipCache = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const state = ipCache.get(ip);

    if (!state || now > state.resetAt) {
        ipCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (state.count >= MAX_REQUESTS) {
        return false;
    }

    state.count += 1;
    return true;
}

// --- Standard Response Helper ---
function errorResponse(error: string, code: string, status: number) {
    return NextResponse.json({ error, code }, { status });
}

export async function POST(req: NextRequest) {
    try {
        // 1. Rate Limiting
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        if (!checkRateLimit(ip)) {
            return errorResponse("Too many requests. Please try again in a minute.", "RATE_LIMIT_EXCEEDED", 429);
        }

        // 2. Input Validation (Zod)
        const body = await req.json().catch(() => ({}));
        const validation = EnrichRequestSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse("Invalid request body. URL is required and must be valid.", "INVALID_INPUT", 400);
        }

        const { url } = validation.data;

        // 3. SSRF Protection
        if (!isSafePublicUrl(url)) {
            return errorResponse("The provided URL is not allowed (internal or private address).", "SSRF_BLOCKED", 400);
        }

        // 4. Fetch Website with Timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        let html = "";
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PrecisionScout/1.0)' },
                cache: 'no-store',
            });

            if (!response.ok) throw new Error(`Source returned ${response.status}`);
            html = await response.text();
        } catch (err: any) {
            if (err.name === 'AbortError') {
                return errorResponse("Fetching the website timed out after 8 seconds.", "FETCH_TIMEOUT", 504);
            }
            return errorResponse(`Failed to reach the target website: ${err.message}`, "FETCH_ERROR", 500);
        } finally {
            clearTimeout(timeout);
        }

        // 5. Preparation & Cleaning (Boundaries)
        const cleanedText = html
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 10000);

        // 6. OpenAI Enrichment with Abort Signal
        try {
            const openaiInstance = getOpenAIClient();
            const completion = await openaiInstance.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are a VC Investment Analyst. Analyze the provided website text from a startup and return a structured JSON object.
            Return ONLY valid JSON.`,
                    },
                    {
                        role: "user",
                        content: `Analyze this content and return a structured JSON matching this schema:
            {
              "summary": "1-2 sentences of what the company does",
              "whatTheyDo": ["bullet1", "bullet2", "bullet3"],
              "keywords": ["k1", "k2", "k3"],
              "signals": ["Signal 1", "Signal 2"],
              "sources": [{"url": "${url}", "timestamp": "${new Date().toISOString()}"}]
            }
            
            Website Content: ${cleanedText}`,
                    },
                ],
                response_format: { type: "json_object" },
            });

            const rawContent = completion.choices[0].message.content || "{}";
            const result = JSON.parse(rawContent);

            // Validate AI Response
            const parsedResult = EnrichmentDataSchema.safeParse(result);
            if (!parsedResult.success) {
                throw new Error("AI returned malformed data");
            }

            return NextResponse.json(parsedResult.data, {
                headers: { "Cache-Control": "no-store" }
            });
        } catch (err: any) {
            console.error("OpenAI Error:", err);
            return errorResponse("Failed to process intelligence via AI.", "AI_ERROR", 500);
        }
    } catch (error: any) {
        console.error("Unhandled API error:", error);
        return errorResponse("An internal server error occurred.", "INTERNAL_ERROR", 500);
    }
}
