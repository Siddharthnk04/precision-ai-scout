import { Company, EnrichmentData, Note, SavedSearch, InvestmentList } from './types';

const STORAGE_KEYS = {
    NOTES: 'vc_notes',
    ENRICHMENT: 'vc_enrichment_cache',
    LISTS: 'vc_lists',
    SAVED_SEARCHES: 'vc_saved_searches',
};

export const storage = {
    // Notes
    getNotes: (): Note[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
        return stored ? JSON.parse(stored) : [];
    },
    saveNote: (note: Note) => {
        const notes = storage.getNotes();
        const index = notes.findIndex((n) => n.companyId === note.companyId);
        if (index > -1) {
            notes[index] = note;
        } else {
            notes.push(note);
        }
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    },
    getNoteForCompany: (companyId: string): Note | undefined => {
        return storage.getNotes().find((n) => n.companyId === companyId);
    },

    // Enrichment Cache
    getEnrichmentCache: (): Record<string, EnrichmentData> => {
        if (typeof window === 'undefined') return {};
        const stored = localStorage.getItem(STORAGE_KEYS.ENRICHMENT);
        return stored ? JSON.parse(stored) : {};
    },
    cacheEnrichment: (companyId: string, data: EnrichmentData) => {
        const cache = storage.getEnrichmentCache();
        cache[companyId] = data;
        localStorage.setItem(STORAGE_KEYS.ENRICHMENT, JSON.stringify(cache));
    },
    getCachedEnrichment: (companyId: string): EnrichmentData | undefined => {
        return storage.getEnrichmentCache()[companyId];
    },

    // Lists
    getLists: (): InvestmentList[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEYS.LISTS);
        return stored ? JSON.parse(stored) : [];
    },
    saveList: (list: InvestmentList) => {
        const lists = storage.getLists();
        const index = lists.findIndex((l) => l.id === list.id);
        if (index > -1) {
            lists[index] = list;
        } else {
            lists.push(list);
        }
        localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
    },
    deleteList: (listId: string) => {
        const lists = storage.getLists().filter((l) => l.id !== listId);
        localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
    },

    // Saved Searches
    getSavedSearches: (): SavedSearch[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);
        return stored ? JSON.parse(stored) : [];
    },
    saveSearch: (search: SavedSearch) => {
        const searches = storage.getSavedSearches();
        searches.push(search);
        localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(searches));
    },
    deleteSearch: (searchId: string) => {
        const searches = storage.getSavedSearches().filter((s) => s.id !== searchId);
        localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(searches));
    },
};
