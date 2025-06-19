import { useState, useRef, useCallback, RefObject } from "react"
import { bridgeCall, fetchActiveLeads, Lead } from "@/lib/api"
import { ActiveLeads } from "@/types/activeLeads.type";

type CustomerNumber = {
    id: number;
    phone: string;
}

type FocusedInput = "agent" | { type: "customer"; idx: number } | null

export function useDialer({ onHistoryUpdate }: { onHistoryUpdate?: (history: ActiveLeads) => void } = {}) {
    const [agentNumber, setAgentNumber] = useState<string>("")
    const [customerNumbers, setCustomerNumbers] = useState<CustomerNumber[]>([
        { id: 1, phone: "" },
        { id: 2, phone: "" },
        { id: 3, phone: "" }
    ])
    const [isCallInProgress, setIsCallInProgress] = useState<boolean>(false)
    const [agentCountryCode, setAgentCountryCode] = useState<string>("+972")
    const [customerCountryCodes, setCustomerCountryCodes] = useState<string[]>(["+972", "+972", "+972"])
    const [focusedInput, setFocusedInput] = useState<FocusedInput>(null)
    const [isTripleCallMode, setIsTripleCallMode] = useState<boolean>(true)
    const agentInputRef = useRef<HTMLInputElement>(null)

    const handleCall = useCallback(async () => {
        if (customerNumbers.every(num => !num.phone.trim())) {
            console.log('Early return: all customer numbers are empty');
            return;
        }
        const fullAgentNumber = agentNumber.trim() ? `${agentCountryCode}${(agentNumber.startsWith('0') ? agentNumber.slice(1) : agentNumber).trim()}` : ""
        const numbersList = customerNumbers[0].phone.trim() ? `${agentCountryCode}${(customerNumbers[0].phone.startsWith('0') ? customerNumbers[0].phone.slice(1) : customerNumbers[0].phone).trim()}` : ""

        if (numbersList.length === 0) {
            console.log('Early return: numbersList is empty after filtering');
            return;
        }
        setIsCallInProgress(true)
        try {
            await bridgeCall(fullAgentNumber, numbersList)
            const history = await fetchActiveLeads()
            onHistoryUpdate?.(history)
        } catch (error) {
            console.error('Bridge call error:', error)
        } finally {
            setIsCallInProgress(false)
        }
    }, [agentNumber, customerNumbers, agentCountryCode, customerCountryCodes, onHistoryUpdate])

    const mapCustomerNumbersToLeads = useCallback((): Lead[] => {
        return customerNumbers
            .map((customerNumber) =>
                customerNumber.phone.trim()
                    ? {
                        id: `${customerNumber.id}-${customerNumber.phone.trim()}`,
                        phoneNumber: customerNumber.phone.trim(),
                    }
                    : null
            )
            .filter((lead): lead is Lead => !!lead);
    }, [customerNumbers]);

    const handleKeypadInput = useCallback((value: string) => {
        if (focusedInput === "agent") {
            setAgentNumber((prev) => prev + value)
        } else if (focusedInput && typeof focusedInput === "object" && focusedInput.type === "customer") {
            const { idx } = focusedInput
            setCustomerNumbers((prev) => {
                const newNumbers = [...prev]
                newNumbers[idx] = { ...newNumbers[idx], phone: newNumbers[idx].phone + value }
                return newNumbers
            })
        } else {
            const idx = customerNumbers.findIndex(num => num.phone === "") >= 0 ? customerNumbers.findIndex(num => num.phone === "") : 0
            setCustomerNumbers((prev) => {
                const newNumbers = [...prev]
                newNumbers[idx] = { ...newNumbers[idx], phone: newNumbers[idx].phone + value }
                return newNumbers
            })
            setFocusedInput({ type: "customer", idx })
        }
    }, [focusedInput, customerNumbers])

    const handleKeypadBackspace = useCallback(() => {
        if (focusedInput === "agent") {
            setAgentNumber((prev) => prev.slice(0, -1))
        } else if (focusedInput && typeof focusedInput === "object" && focusedInput.type === "customer") {
            const { idx } = focusedInput
            setCustomerNumbers((prev) => {
                const newNumbers = [...prev]
                newNumbers[idx] = { ...newNumbers[idx], phone: newNumbers[idx].phone.slice(0, -1) }
                return newNumbers
            })
        } else {
            const idx = customerNumbers.map(num => !!num.phone).lastIndexOf(true)
            if (idx >= 0) {
                setCustomerNumbers((prev) => {
                    const newNumbers = [...prev]
                    newNumbers[idx] = { ...newNumbers[idx], phone: newNumbers[idx].phone.slice(0, -1) }
                    return newNumbers
                })
                setFocusedInput({ type: "customer", idx })
            }
        }
    }, [focusedInput, customerNumbers])

    const handleFillCustomerNumber = useCallback((phoneNumber: string) => {
        setCustomerNumbers((prev) => {
            const updatedNumbers = [...prev]
            const emptyIndex = updatedNumbers.findIndex((num) => num.phone.trim() === "")
            if (emptyIndex !== -1) {
                updatedNumbers[emptyIndex] = { ...updatedNumbers[emptyIndex], phone: phoneNumber.toString() }
                setCustomerCountryCodes((codes) => {
                    const updatedCodes = [...codes]
                    updatedCodes[emptyIndex] = "+972"
                    return updatedCodes
                })
            }
            return updatedNumbers
        })
    }, [])

    return {
        agentNumber,
        setAgentNumber,
        customerNumbers,
        setCustomerNumbers,
        isCallInProgress,
        handleCall,
        agentCountryCode,
        setAgentCountryCode,
        customerCountryCodes,
        setCustomerCountryCodes,
        focusedInput,
        setFocusedInput,
        agentInputRef,
        handleKeypadInput,
        handleKeypadBackspace,
        handleFillCustomerNumber,
        isTripleCallMode,
        setIsTripleCallMode,
        mapCustomerNumbersToLeads,
    }
} 