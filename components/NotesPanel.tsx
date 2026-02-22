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
            <div className="p-4 border-b border-borderDark flex items-center justify-between bg-slate-800/80">
                <h3 className="font-bold text-textPrimary uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <StickyNote className="w-3.5 h-3.5 text-accent/60" />
                    Internal Analysis
                </h3>
                {lastSaved && (
                    <span className="text-[10px] text-textSecondary font-medium">
                        Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
            <div className="flex-1 bg-transparent">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add investment committee notes, due diligence tracks, or thesis feedback..."
                    className="w-full h-full min-h-[300px] p-6 text-sm text-textPrimary placeholder-textSecondary/40 bg-transparent focus:outline-hidden resize-none leading-relaxed"
                />
            </div>
            <div className="p-4 border-t border-borderDark bg-slate-800/50">
                <button
                    onClick={handleSave}
                    className="btn btn-secondary w-full flex gap-2 items-center justify-center text-xs shadow-sm hover:shadow-primary/5 transition-all"
                >
                    <Save className="w-3.5 h-3.5" />
                    {lastSaved ? "Update Analysis" : "Save Analysis"}
                </button>
            </div>
        </div>
    );
}
