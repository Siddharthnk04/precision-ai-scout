"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Company } from "@/lib/types";
import { ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";

interface CompaniesTableProps {
    companies: Company[];
}

export default function CompaniesTable({ companies }: CompaniesTableProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Reset to page 1 when company list changes (filters applied)
    useEffect(() => {
        setCurrentPage(1);
    }, [companies]);

    const totalPages = Math.ceil(companies.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCompanies = companies.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-4">
            <div className="card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-brand-gray-50 border-b border-brand-gray-200">
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-gray-500 uppercase tracking-widest">Company</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-gray-500 uppercase tracking-widest">Sector</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-gray-500 uppercase tracking-widest">Stage</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-gray-500 uppercase tracking-widest">Geography</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCompanies.map((company) => (
                            <tr
                                key={company.id}
                                className="border-b border-brand-gray-100 last:border-0 hover:bg-brand-gray-50 cursor-pointer group transition-colors"
                                onClick={() => router.push(`/companies/${company.id}`)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-brand-gray-900 group-hover:text-brand-blue transition-colors">
                                            {company.name}
                                        </span>
                                        <span className="text-xs text-brand-gray-500 flex items-center gap-1">
                                            {company.website.replace('https://', '') || company.website}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="badge badge-neutral bg-brand-gray-100/50">{company.sector}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-brand-gray-600 font-medium">{company.stage}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-brand-gray-500">{company.geography}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <ChevronRight className="inline-block w-4 h-4 text-brand-gray-300 group-hover:text-brand-gray-500 transition-colors" />
                                </td>
                            </tr>
                        ))}
                        {companies.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-brand-gray-500">
                                    No companies match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {companies.length > pageSize && (
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-brand-gray-500 uppercase tracking-widest">
                        Page <span className="text-brand-gray-900">{currentPage}</span> of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="btn btn-secondary px-3 py-1.5 gap-2 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="btn btn-secondary px-3 py-1.5 gap-2 disabled:opacity-50"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
