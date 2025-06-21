import { useState, useEffect, useCallback } from "react"
import { fetchActiveLeads } from "@/lib/api"
import { ActiveLeads } from "@/types/activeLeads.type"
import { PAGE_SIZE, DEFAULT_PAGE } from "@/lib/utils"

export function useCallHistory() {
    const [callHistory, setCallHistory] = useState<ActiveLeads>({ data: [], metadata: { page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 } })
    const [isLeadsLoading, setIsLeadsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
    const [pageSize] = useState(PAGE_SIZE)
    const [currentSearchQuery, setCurrentSearchQuery] = useState("")

    const loadCallHistory = useCallback(async (page: number, size: number, search: string = "") => {
        setIsLeadsLoading(true)
        // Update the current search query when loading
        setCurrentSearchQuery(search)
        try {
            const history = await fetchActiveLeads(page, size, search)
            setCallHistory(history)
        } catch (error) {
            console.error("Failed to load call history:", error)
            // Set empty data on error
            setCallHistory({ data: [], metadata: { page, pageSize: size, total: 0, totalPages: 0 } })
        } finally {
            setIsLeadsLoading(false)
        }
    }, [pageSize])

    useEffect(() => {
        loadCallHistory(currentPage, pageSize, currentSearchQuery)
    }, [currentPage, loadCallHistory, pageSize, currentSearchQuery])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const reloadHistory = useCallback(async (search: string = "") => {
        await loadCallHistory(currentPage, pageSize, search)
    }, [loadCallHistory, currentPage, pageSize])

    return {
        callHistory,
        leads: callHistory.data || [],
        isLeadsLoading,
        currentPage,
        pageSize,
        totalPages: callHistory.metadata?.totalPages || 0,
        total: callHistory.metadata?.total || 0,
        handlePageChange,
        reloadHistory,
        setCallHistory,
        loadCallHistory,
        currentSearchQuery,
    }
} 