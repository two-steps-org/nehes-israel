import { useState, useCallback, useEffect } from "react";
import { Lead } from "@/types/activeLeads.type";
import { findLeadByPhone } from "@/lib/api";

export interface SelectedLead extends Lead {
    isFromSearch?: boolean;
    searchMessage?: string;
    position?: number; // 1, 2, or 3 - corresponds to input position
}

export function useSelectedLeads() {
    const [selectedLeads, setSelectedLeads] = useState<SelectedLead[]>([]);

    const addSelectedLeadWithPosition = useCallback((lead: SelectedLead, position: number) => {
        setSelectedLeads(prev => {
            // Check if lead is already selected
            const existingIndex = prev.findIndex(l => l.phone_number === lead.phone_number);
            if (existingIndex !== -1) {
                // Update position if lead already exists
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], position };
                return updated;
            }

            // Remove any lead that was in this position
            const filteredLeads = prev.filter(l => l.position !== position);

            // Add new lead with position
            const leadWithPosition = { ...lead, position };
            const newLeads = [...filteredLeads, leadWithPosition];

            // Sort by position to maintain order
            return newLeads.sort((a, b) => (a.position || 0) - (b.position || 0));
        });
    }, []);

    const addSelectedLead = useCallback((lead: SelectedLead) => {
        setSelectedLeads(prev => {
            // Check if lead is already selected
            const exists = prev.some(l => l.phone_number === lead.phone_number);
            if (exists) return prev;

            // Find next available position
            const usedPositions = prev.map(l => l.position).filter(p => p !== undefined);
            let nextPosition = 1;
            while (usedPositions.includes(nextPosition) && nextPosition <= 3) {
                nextPosition++;
            }

            if (nextPosition > 3) return prev; // No more positions available

            const leadWithPosition = { ...lead, position: nextPosition };
            const newLeads = [...prev, leadWithPosition];

            // Sort by position to maintain order
            return newLeads.sort((a, b) => (a.position || 0) - (b.position || 0));
        });
    }, []);

    const removeSelectedLead = useCallback((phoneNumber: string) => {
        setSelectedLeads(prev => prev.filter(lead => lead.phone_number !== phoneNumber));
    }, []);

    const removeSelectedLeadByPosition = useCallback((position: number) => {
        setSelectedLeads(prev => prev.filter(lead => lead.position !== position));
    }, []);

    const clearSelectedLeads = useCallback(() => {
        setSelectedLeads([]);
    }, []);

    const isLeadSelected = useCallback((phoneNumber: string) => {
        return selectedLeads.some(lead => lead.phone_number === phoneNumber);
    }, [selectedLeads]);

    const searchAndSelectLead = useCallback(async (phoneNumber: string): Promise<{
        found: boolean;
        page?: number;
        message?: string;
    }> => {
        try {
            const result = await findLeadByPhone(phoneNumber);

            if (result.found && result.lead) {
                // Add the found lead to selected leads
                addSelectedLead({
                    ...result.lead,
                    isFromSearch: true
                });

                return {
                    found: true,
                    page: result.page,
                    message: "Lead found and pinned"
                };
            } else {
                // Add a placeholder lead for phone numbers not found in database
                const placeholderLead: SelectedLead = {
                    _id: `placeholder-${phoneNumber}`,
                    phone_number: phoneNumber,
                    full_name: "",
                    status: "",
                    createdAt: new Date().toISOString(),
                    meeting_scheduled: "",
                    meeting_attended: "",
                    isFromSearch: true,
                    searchMessage: result.message || "Lead not found in system"
                };

                addSelectedLead(placeholderLead);

                return {
                    found: false,
                    message: result.message || "Lead not found in system"
                };
            }
        } catch (error) {
            console.error("Error searching for lead:", error);
            return {
                found: false,
                message: "Error searching for lead"
            };
        }
    }, [addSelectedLead]);

    const canAddMoreLeads = useCallback(() => {
        return selectedLeads.length < 3;
    }, [selectedLeads.length]);

    return {
        selectedLeads,
        addSelectedLead,
        addSelectedLeadWithPosition,
        removeSelectedLead,
        removeSelectedLeadByPosition,
        clearSelectedLeads,
        isLeadSelected,
        searchAndSelectLead,
        canAddMoreLeads,
    };
} 