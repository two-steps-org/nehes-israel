import { useState, useCallback } from "react"
import { tripleCallLeads, fetchMongoData, Lead } from "@/lib/api"

export function useTripleCall({ onLeads, onHistoryUpdate }: { onLeads?: (leads: Lead[]) => void, onHistoryUpdate?: (history: any[]) => void } = {}) {
    const [isTripleCallInProgress, setIsTripleCallInProgress] = useState<boolean>(false)
    const [tripleCallStatus, setTripleCallStatus] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: false, message: "" })
    const [activeLeads, setActiveLeads] = useState<Lead[]>([])

    const handleTripleCall = useCallback(async (agentNumber: string, leads: Lead[]) => {
        setIsTripleCallInProgress(true)
        setTripleCallStatus({ show: false, success: false, message: "" })

        const leadsNumbers = leads.map((lead) => lead.phoneNumber)

        setActiveLeads([])
        try {
            const result = await tripleCallLeads(agentNumber, leadsNumbers)
            setTripleCallStatus({
                show: true,
                success: result.success,
                message: result.success ? `Successfully initiated calls to ${result.leads.length} leads` : "Failed to initiate triple call",
            })
            if (result.success && result.leads.length > 0) {
                setActiveLeads(result.leads)
                onLeads?.(result.leads)
            }
            const history = await fetchMongoData()
            onHistoryUpdate?.(history)
            setTimeout(() => setTripleCallStatus((prev) => ({ ...prev, show: false })), 5000)
        } catch (error: any) {
            setTripleCallStatus({ show: true, success: false, message: error.message || "An error occurred while initiating triple call" })
            setTimeout(() => setTripleCallStatus((prev) => ({ ...prev, show: false })), 5000)
        } finally {
            setIsTripleCallInProgress(false)
        }
    }, [onLeads, onHistoryUpdate])

    return {
        isTripleCallInProgress,
        tripleCallStatus,
        activeLeads,
        handleTripleCall,
        setActiveLeads,
        setTripleCallStatus,
    }
} 