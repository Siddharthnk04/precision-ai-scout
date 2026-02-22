import { z } from "zod";

// --- Sector & Stage Enums ---
export const SectorSchema = z.enum([
    'Enterprise SaaS',
    'Fintech',
    'Healthtech',
    'AI/ML',
    'Consumer',
    'Infrastructure',
    'Other'
]);
export type Sector = z.infer<typeof SectorSchema>;

export const StageSchema = z.enum(['Seed', 'Series A', 'Series B', 'Series C+']);
export type Stage = z.infer<typeof StageSchema>;

// --- Company Schema ---
export const CompanySchema = z.object({
    id: z.string(),
    name: z.string(),
    website: z.string().url(),
    sector: SectorSchema,
    stage: StageSchema,
    geography: z.string(),
    shortDescription: z.string(),
    tags: z.array(z.string()),
});
export type Company = z.infer<typeof CompanySchema>;

// --- Enrichment Schema ---
export const EnrichmentSourceSchema = z.object({
    url: z.string().url(),
    timestamp: z.string().datetime(),
});

export const EnrichmentSignalSchema = z.object({
    title: z.string(),
    description: z.string(),
    timestamp: z.string().datetime(),
});

export const EnrichmentDataSchema = z.object({
    summary: z.string(),
    bullets: z.array(z.string()),
    keywords: z.array(z.string()),
    signals: z.array(EnrichmentSignalSchema),
    sources: z.array(z.string()),
    thesisScore: z.number().min(0).max(100),
    thesisRationale: z.string(),
    enrichedAt: z.string().datetime(),
});
export type EnrichmentData = z.infer<typeof EnrichmentDataSchema>;

// --- Note Schema ---
export const NoteSchema = z.object({
    companyId: z.string(),
    content: z.string(),
    updatedAt: z.string().datetime(),
});
export type Note = z.infer<typeof NoteSchema>;

// --- Saved Search Schema ---
export const SavedSearchSchema = z.object({
    id: z.string(),
    name: z.string(),
    filters: z.object({
        sector: z.string().optional(),
        stage: z.string().optional(),
        geography: z.string().optional(),
        query: z.string().optional(),
    }),
    createdAt: z.string().datetime(),
});
export type SavedSearch = z.infer<typeof SavedSearchSchema>;

// --- List Schema ---
export const InvestmentListSchema = z.object({
    id: z.string(),
    name: z.string(),
    companyIds: z.array(z.string()),
    createdAt: z.string().datetime(),
});
export type InvestmentList = z.infer<typeof InvestmentListSchema>;

// --- Standard API Error Format ---
export interface ApiError {
    error: string;
    code: string;
}
