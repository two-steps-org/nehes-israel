import { useState, useEffect, useCallback, useMemo } from "react"
import { fetchActiveLeads } from "@/lib/api"
import { ActiveLeads } from "@/types/activeLeads.type"

export function useCallHistory(visibleCountInitial = 25) {
    const [callHistory, setCallHistory] = useState<ActiveLeads>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const [visibleCount, setVisibleCount] = useState(visibleCountInitial)
    const [hasMoreData, setHasMoreData] = useState(true)

    useEffect(() => {
        let mounted = true
        const loadCallHistory = async () => {
            try {
                const history = await fetchActiveLeads()
                if (mounted) setCallHistory(history)
            } catch (error) {
                throw error
            } finally {
                if (mounted) setIsLoadingHistory(false)
            }
        }
        loadCallHistory()
        return () => { mounted = false }
    }, [])

    const visibleHistory = useMemo(() => callHistory.data?.slice(0, visibleCount), [callHistory, visibleCount])

    const reloadHistory = useCallback(async () => {
        setIsLoadingHistory(true)
        try {
            const history = await fetchActiveLeads()
            setCallHistory(history)
        } catch (error) {
            // Optionally handle error
        } finally {
            setIsLoadingHistory(false)
        }
    }, [])

    return {
        callHistory,
        visibleHistory,
        isLoadingHistory,
        visibleCount,
        hasMoreData,
        reloadHistory,
        setCallHistory,
        setVisibleCount,
        setHasMoreData,
    }
} 