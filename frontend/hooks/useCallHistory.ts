import { useState, useEffect, useCallback, useMemo } from "react"
import { fetchActiveLeads } from "@/lib/api"
import { ActiveLeads } from "@/types/activeLeads.type"

export function useCallHistory(visibleCountInitial = 25) {
    const [callHistory, setCallHistory] = useState<ActiveLeads>([])
    const [isLeadsLoading, setIsLeadsLoading] = useState(true)
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
                if (mounted) setIsLeadsLoading(false)
            }
        }
        loadCallHistory()
        return () => { mounted = false }
    }, [])

    const leads = useMemo(() => callHistory.data?.slice(0, visibleCount), [callHistory, visibleCount])

    const reloadHistory = useCallback(async () => {
        setIsLeadsLoading(true)
        try {
            const history = await fetchActiveLeads()
            setCallHistory(history)
        } catch (error) {
            // Optionally handle error
        } finally {
            setIsLeadsLoading(false)
        }
    }, [])

    return {
        callHistory,
        leads,
        isLeadsLoading,
        visibleCount,
        hasMoreData,
        reloadHistory,
        setCallHistory,
        setVisibleCount,
        setHasMoreData,
    }
} 