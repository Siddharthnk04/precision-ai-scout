"use client";

import { Company } from "./types";
import { track } from "./analytics";
import { storage } from "./storage";

/**
 * VC-specific export data structure
 */
interface ExportData {
    id: string;
    name: string;
    sector: string;
    stage: string;
    geography: string;
    website: string;
    thesisScore: number;
    enrichedAt: string;
}

/**
 * Maps a Company object and its cached enrichment to a clean export format
 */
const mapToExport = (company: Company): ExportData => {
    const enrichment = storage.getCachedEnrichment(company.id);
    return {
        id: company.id,
        name: company.name,
        sector: company.sector,
        stage: company.stage,
        geography: company.geography,
        website: company.website,
        thesisScore: enrichment?.thesisScore ?? 0,
        enrichedAt: enrichment?.enrichedAt ?? 'N/A'
    };
};

/**
 * Triggers a client-side download of a dynamic Blob
 */
const triggerDownload = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

export const exportUtils = {
    /**
     * Exports an array of companies to CSV
     */
    toCSV: (companies: Company[], filenameSuffix: string = 'export') => {
        track("export_csv");
        const data = companies.map(mapToExport);

        const headers = ["Name", "Sector", "Stage", "Geography", "Website", "Thesis Score", "Last Enriched"];
        const csvRows = [
            headers.join(","),
            ...data.map(row => [
                `"${row.name}"`,
                `"${row.sector}"`,
                `"${row.stage}"`,
                `"${row.geography}"`,
                `"${row.website}"`,
                row.thesisScore,
                `"${row.enrichedAt}"`
            ].join(","))
        ];

        triggerDownload(csvRows.join("\n"), `precision-ai-${filenameSuffix}.csv`, "text/csv;charset=utf-8;");
    },

    /**
     * Exports an array of companies to JSON
     */
    toJSON: (companies: Company[], filenameSuffix: string = 'export') => {
        track("export_json");
        const data = companies.map(mapToExport);
        const jsonContent = JSON.stringify(data, null, 2);

        triggerDownload(jsonContent, `precision-ai-${filenameSuffix}.json`, "application/json;charset=utf-8;");
    }
};
