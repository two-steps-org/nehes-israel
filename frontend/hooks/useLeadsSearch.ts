import { useState, useEffect, useCallback, useRef } from "react";

interface UseLeadsSearchProps {
    onSearch: (searchQuery: string, resetPage?: boolean) => void;
    currentPage: number;
    debounceDelay?: number;
}

export function useLeadsSearch({
    onSearch,
    currentPage,
    debounceDelay = 300
}: UseLeadsSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Use refs to avoid stale closures
    const onSearchRef = useRef(onSearch);
    const currentPageRef = useRef(currentPage);

    // Update refs when values change
    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setIsSearching(false);
        }, debounceDelay);

        if (searchQuery !== debouncedSearchQuery) {
            setIsSearching(true);
        }

        return () => clearTimeout(timer);
    }, [searchQuery, debounceDelay, debouncedSearchQuery]);

    // Track when user starts searching
    useEffect(() => {
        if (searchQuery !== "" && !hasSearched) {
            setHasSearched(true);
        }
    }, [searchQuery, hasSearched]);

    // Trigger search when debounced query changes
    useEffect(() => {
        if (hasSearched) {
            const shouldResetPage = currentPageRef.current !== 1;
            onSearchRef.current(debouncedSearchQuery, shouldResetPage);
        }
    }, [debouncedSearchQuery, hasSearched]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setDebouncedSearchQuery("");
        // Keep hasSearched true so that clearing triggers a search (to show all results)
    }, []);

    return {
        searchQuery,
        debouncedSearchQuery,
        setSearchQuery: handleSearchChange,
        clearSearch,
        hasSearched,
        isSearching,
    };
} 