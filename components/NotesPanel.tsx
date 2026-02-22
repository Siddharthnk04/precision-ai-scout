"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { StickyNote, Save } from "lucide-react";

interface NotesPanelProps {
    companyId: string;
}

export default function NotesPanel({ companyId }: NotesPanelProps) {
    const [content, setContent] = useState("");
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        const note = storage.getNoteForCompany(companyId);
        if (note) {
            setContent(note.content);
            setLastSaved(note.updatedAt);
        }
    }, [companyId]);

    const handleSave = () => {
        const timestamp = new Date().toISOString();
        storage.saveNote({
            companyId,
            content,
            updatedAt: timestamp,
        });
        setLastSaved(timestamp);
    };

    return (
        <div className="card h-full flex flex-col">
            <div className="p-4 border-b border-brand-gray-100 flex items-center justify-between bg-brand-gray-50/50">
                <h3 className="font-bold text-brand-gray-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <StickyNote className="w-3.5 h-3.5 text-brand-gray-400" />
                    Internal Analysis
                </h3>
                {lastSaved && (
                    <span className="text-[10px] text-brand-gray-400 font-medium">
                        Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
            <div className="flex-1">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add investment committee notes, due diligence tracks, or thesis feedback..."
                    className="w-full h-full min-h-[300px] p-6 text-sm text-brand-gray-800 placeholder-brand-gray-400 focus:outline-hidden resize-none leading-relaxed"
                />
            </div>
            <div className="p-4 border-t border-brand-gray-100 bg-white">
                <button
                    onClick={handleSave}
                    className="btn btn-secondary w-full flex gap-2 items-center justify-center text-xs"
                >
                    <Save className="w-3.5 h-3.5" />
                    {lastSaved ? "Update Analysis" : "Save Analysis"}
                </button>
            </div>
        </div>
    );
}
