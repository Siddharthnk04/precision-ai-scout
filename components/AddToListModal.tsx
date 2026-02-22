"use client";

import { useState, useEffect } from "react";
import { InvestmentList } from "@/lib/types";
import { storage } from "@/lib/storage";
import { X, Check, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AddToListModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId: string;
    companyName: string;
}

export default function AddToListModal({ isOpen, onClose, companyId, companyName }: AddToListModalProps) {
    const [lists, setLists] = useState<InvestmentList[]>([]);
    const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const storedLists = storage.getLists();
            setLists(storedLists);
            // Find lists that already contain this company
            const initialSelected = storedLists
                .filter(list => list.companyIds.includes(companyId))
                .map(list => list.id);
            setSelectedListIds(initialSelected);
            setSuccess(false);
        }
    }, [isOpen, companyId]);

    const toggleListSelection = (listId: string) => {
        setSelectedListIds(prev =>
            prev.includes(listId)
                ? prev.filter(id => id !== listId)
                : [...prev, listId]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // For each list in our state
            for (const list of lists) {
                const isSelected = selectedListIds.includes(list.id);
                const containsCompany = list.companyIds.includes(companyId);

                if (isSelected && !containsCompany) {
                    // Add to list
                    const updatedList = { ...list, companyIds: [...list.companyIds, companyId] };
                    storage.saveList(updatedList);
                } else if (!isSelected && containsCompany) {
                    // Remove from list
                    const updatedList = { ...list, companyIds: list.companyIds.filter(id => id !== companyId) };
                    storage.saveList(updatedList);
                }
            }
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err) {
            console.error("Failed to update lists", err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-brand-gray-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-brand-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-brand-gray-100 flex items-center justify-between bg-brand-gray-50/50">
                    <h3 className="font-bold text-brand-gray-900">Add to List</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-brand-gray-100 text-brand-gray-400 hover:text-brand-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-brand-gray-500">
                        Organize <span className="font-semibold text-brand-gray-900">{companyName}</span> into your investment pipelines.
                    </p>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {lists.length === 0 ? (
                            <div className="py-8 text-center border-2 border-dashed border-brand-gray-100 rounded-lg">
                                <p className="text-sm text-brand-gray-400">No lists found. Create one in the Lists page.</p>
                            </div>
                        ) : (
                            lists.map(list => (
                                <label
                                    key={list.id}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                        selectedListIds.includes(list.id)
                                            ? "bg-brand-blue/5 border-brand-blue/30 ring-1 ring-brand-blue/10"
                                            : "bg-white border-brand-gray-100 hover:border-brand-gray-200"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                            selectedListIds.includes(list.id)
                                                ? "bg-brand-blue border-brand-blue"
                                                : "bg-white border-brand-gray-300"
                                        )}>
                                            {selectedListIds.includes(list.id) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-brand-gray-900">{list.name}</span>
                                            <p className="text-[10px] text-brand-gray-400">{list.companyIds.length} companies</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedListIds.includes(list.id)}
                                        onChange={() => toggleListSelection(list.id)}
                                    />
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 bg-brand-gray-50/50 border-t border-brand-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="btn btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || success || lists.length === 0}
                        className={cn(
                            "btn btn-primary flex-1 gap-2",
                            success && "bg-emerald-500 hover:bg-emerald-500 border-emerald-500"
                        )}
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : success ? (
                            <Check className="w-4 h-4" />
                        ) : null}
                        {saving ? "Saving..." : success ? "Saved!" : "Update Selection"}
                    </button>
                </div>
            </div>
        </div>
    );
}
