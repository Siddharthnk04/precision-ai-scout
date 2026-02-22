"use client";

import { useState, useEffect } from "react";
import { InvestmentList, Company } from "@/lib/types";
import { storage } from "@/lib/storage";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import {
    Plus,
    ListFilter,
    MoreVertical,
    Download,
    FileJson,
    FileSpreadsheet,
    Trash2,
    ExternalLink,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function ListsPage() {
    const [lists, setLists] = useState<InvestmentList[]>([]);
    const [newListName, setNewListName] = useState("");

    useEffect(() => {
        const storedLists = storage.getLists();
        if (storedLists.length === 0) {
            // Seed a default list
            const defaultList: InvestmentList = {
                id: "default-1",
                name: "Q1 Alpha Pipeline",
                companyIds: ["1", "3", "7", "10"],
                createdAt: new Date().toISOString()
            };
            storage.saveList(defaultList);
            setLists([defaultList]);
        } else {
            setLists(storedLists);
        }
    }, []);

    const handleCreateList = () => {
        if (!newListName) return;
        const newList: InvestmentList = {
            id: Math.random().toString(36).substr(2, 9),
            name: newListName,
            companyIds: [],
            createdAt: new Date().toISOString()
        };
        storage.saveList(newList);
        setLists([...lists, newList]);
        setNewListName("");
    };

    const handleDeleteList = (id: string) => {
        storage.deleteList(id);
        setLists(lists.filter(l => l.id !== id));
    };

    const exportAsJSON = (list: InvestmentList) => {
        const listCompanies = MOCK_COMPANIES.filter(c => list.companyIds.includes(c.id));
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(listCompanies, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${list.name.toLowerCase().replace(/\s+/g, '-')}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const exportAsCSV = (list: InvestmentList) => {
        const listCompanies = MOCK_COMPANIES.filter(c => list.companyIds.includes(c.id));
        const headers = "id,name,website,sector,stage,geography\n";
        const rows = listCompanies.map(c => `${c.id},${c.name},${c.website},${c.sector},${c.stage},${c.geography}`).join("\n");
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", `${list.name.toLowerCase().replace(/\s+/g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleRemoveCompany = (listId: string, companyId: string) => {
        const list = lists.find(l => l.id === listId);
        if (!list) return;

        const updatedList = {
            ...list,
            companyIds: list.companyIds.filter(id => id !== companyId)
        };

        storage.saveList(updatedList);
        setLists(lists.map(l => l.id === listId ? updatedList : l));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-gray-900">Investment Lists</h1>
                    <p className="text-brand-gray-500 mt-1">Organize your pipeline into functional workflows.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="New list name..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        className="bg-white border border-brand-gray-200 rounded-md py-1.5 px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-blue/20"
                    />
                    <button
                        onClick={handleCreateList}
                        className="btn btn-primary flex gap-2"
                    >
                        <Plus className="w-4 h-4" /> Create List
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map(list => (
                    <div key={list.id} className="card flex flex-col group">
                        <div className="p-6 border-b border-brand-gray-100 flex items-start justify-between bg-brand-gray-50/50">
                            <div>
                                <h3 className="font-bold text-brand-gray-900">{list.name}</h3>
                                <p className="text-xs text-brand-gray-500 mt-1">Created {new Date(list.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteList(list.id)}
                                className="text-brand-gray-400 hover:text-red-500 transition-colors"
                                title="Delete List"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-brand-gray-600">Companies</span>
                                <span className="badge badge-neutral">{list.companyIds.length}</span>
                            </div>

                            <div className="space-y-2">
                                {list.companyIds.slice(0, 3).map(compId => {
                                    const company = MOCK_COMPANIES.find(c => c.id === compId);
                                    return company ? (
                                        <Link
                                            key={compId}
                                            href={`/companies/${compId}`}
                                            className="flex items-center justify-between p-2 rounded-md hover:bg-brand-gray-50 border border-transparent hover:border-brand-gray-100 transition-all group"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleRemoveCompany(list.id, compId);
                                                    }}
                                                    className="p-1 text-brand-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                                    title="Remove from list"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="text-sm font-medium text-brand-gray-900">{company.name}</span>
                                            </div>
                                            <ChevronRight className="w-3 h-3 text-brand-gray-300 group-hover:text-brand-gray-500" />
                                        </Link>
                                    ) : null;
                                })}
                                {list.companyIds.length > 3 && (
                                    <p className="text-[11px] text-brand-gray-400 text-center font-bold uppercase tracking-widest pt-1">
                                        + {list.companyIds.length - 3} more companies
                                    </p>
                                )}
                                {list.companyIds.length === 0 && (
                                    <p className="text-sm text-brand-gray-400 italic text-center py-4">No companies added yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-brand-gray-100 flex gap-2">
                            <button
                                onClick={() => exportAsCSV(list)}
                                className="btn btn-secondary flex-1 text-[11px] font-bold uppercase tracking-wider py-2 gap-1.5"
                                disabled={list.companyIds.length === 0}
                            >
                                <FileSpreadsheet className="w-3 h-3" /> CSV
                            </button>
                            <button
                                onClick={() => exportAsJSON(list)}
                                className="btn btn-secondary flex-1 text-[11px] font-bold uppercase tracking-wider py-2 gap-1.5"
                                disabled={list.companyIds.length === 0}
                            >
                                <FileJson className="w-3 h-3" /> JSON
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
