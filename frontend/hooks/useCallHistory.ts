import { useState, useEffect, useCallback, useMemo } from "react"
import { fetchMongoData } from "@/lib/api"

export function useCallHistory(visibleCountInitial = 25) {
    const [callHistory, setCallHistory] = useState<any[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const [visibleCount, setVisibleCount] = useState(visibleCountInitial)
    const [hasMoreData, setHasMoreData] = useState(true)

    useEffect(() => {
        let mounted = true
        const loadCallHistory = async () => {
            try {
                const history = await fetchMongoData()
                if (mounted) setCallHistory(history)
            } catch (error) {
                // Optionally handle error
            } finally {
                if (mounted) setIsLoadingHistory(false)
            }
        }
        loadCallHistory()
        return () => { mounted = false }
    }, [])

    const visibleHistory = useMemo(() => callHistory.slice(0, visibleCount), [callHistory, visibleCount])

    const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        if (scrollTop + clientHeight >= scrollHeight - 10 && hasMoreData) {
            try {
                const history = await fetchMongoData()
                if (history.length > callHistory.length) {
                    setCallHistory(history)
                    setVisibleCount((prev) => prev + 5)
                } else {
                    setHasMoreData(false)
                }
            } catch (error) {
                // Optionally handle error
            }
        }
    }, [callHistory, hasMoreData])

    const reloadHistory = useCallback(async () => {
        setIsLoadingHistory(true)
        try {
            const history = await fetchMongoData()
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
        handleScroll,
        reloadHistory,
        setCallHistory,
        setVisibleCount,
        setHasMoreData,
    }
} 