import { useState, useCallback } from "react";

export interface UsePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function usePagination(initialPage: number = 1) {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const resetToFirstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    return {
        currentPage,
        handlePageChange,
        resetToFirstPage,
        setCurrentPage,
    };
} 