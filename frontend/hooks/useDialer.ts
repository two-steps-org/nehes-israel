import { useState, useRef, useCallback, RefObject } from "react"
import { bridgeCall, fetchMongoData } from "@/lib/api"

type FocusedInput = "agent" | { type: "customer"; idx: number } | null

export function useDialer({ onHistoryUpdate }: { onHistoryUpdate?: (history: any[]) => void } = {}) {
    const [agentNumber, setAgentNumber] = useState<string>("")
    const [customerNumbers, setCustomerNumbers] = useState<string[]>(["", "", ""])
    const [isCallInProgress, setIsCallInProgress] = useState<boolean>(false)
    const [agentCountryCode, setAgentCountryCode] = useState<string>("+972")
    const [customerCountryCodes, setCustomerCountryCodes] = useState<string[]>(["+972", "+972", "+972"])
    const [focusedInput, setFocusedInput] = useState<FocusedInput>(null)
    const agentInputRef = useRef<HTMLInputElement>(null)

    const handleCall = useCallback(async () => {
        if (customerNumbers.every(num => !num.trim())) {
            console.log('Early return: all customer numbers are empty');
            return;
        }
        const fullAgentNumber = agentNumber.trim() ? `${agentCountryCode}${(agentNumber.startsWith('0') ? agentNumber.slice(1) : agentNumber).trim()}` : ""
        const numbersList = customerNumbers[0].trim() ? `${agentCountryCode}${(customerNumbers[0].startsWith('0') ? customerNumbers[0].slice(1) : customerNumbers[0]).trim()}` : ""

        if (numbersList.length === 0) {
            console.log('Early return: numbersList is empty after filtering');
            return;
        }
        setIsCallInProgress(true)
        try {
            await bridgeCall(fullAgentNumber, numbersList)
            const history = await fetchMongoData()
            onHistoryUpdate?.(history)
        } catch (error) {
            console.error('Bridge call error:', error)
        } finally {
            setIsCallInProgress(false)
        }
    }, [agentNumber, customerNumbers, agentCountryCode, customerCountryCodes, onHistoryUpdate])

    const handleKeypadInput = useCallback((value: string) => {
        if (focusedInput === "agent") {
            setAgentNumber((prev) => prev + value)
        } else if (focusedInput && typeof focusedInput === "object" && focusedInput.type === "customer") {
            const { idx } = focusedInput
            setCustomerNumbers((prev) => {
                const newNumbers = [...prev]
                newNumbers[idx] += value
                return newNumbers
            })
        } else {
            const idx = customerNumbers.findIndex(num => num === "") >= 0 ? customerNumbers.findIndex(num => num === "") : 0
            setCustomerNumbers((prev) => {
                const newNumbers = [...prev]
                newNumbers[idx] += value
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
                newNumbers[idx] = newNumbers[idx].slice(0, -1)
                return newNumbers
            })
        } else {
            const idx = customerNumbers.map(num => !!num).lastIndexOf(true)
            if (idx >= 0) {
                setCustomerNumbers((prev) => {
                    const newNumbers = [...prev]
                    newNumbers[idx] = newNumbers[idx].slice(0, -1)
                    return newNumbers
                })
                setFocusedInput({ type: "customer", idx })
            }
        }
    }, [focusedInput, customerNumbers])

    const handleFillCustomerNumber = useCallback((phoneNumber: string) => {
        setCustomerNumbers((prev) => {
            const updatedNumbers = [...prev]
            const emptyIndex = updatedNumbers.findIndex((num) => num.trim() === "")
            if (emptyIndex !== -1) {
                updatedNumbers[emptyIndex] = phoneNumber.toString()
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
    }
} 