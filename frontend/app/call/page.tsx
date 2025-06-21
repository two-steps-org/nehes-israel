"use client";

import { AppHeader } from "@/components/app-header";
import { useLanguage } from "@/components/language-provider";
import { useCallHistory } from "@/hooks/useCallHistory";
import { useTripleCall } from "@/hooks/useTripleCall";
import { useDialer } from "@/hooks/useDialer";
import { DialerCard } from "@/components/DialerCard";
import { ActiveLeadsCard } from "@/components/ActiveLeadsCard";
import { StatusAlert } from "@/components/StatusAlert";
import { LeadsTable } from "@/components/LeadsTable";
import { ActiveLeads, Lead } from "@/types/activeLeads.type";
import { io, Socket } from "socket.io-client";
import React, { useMemo, useCallback, useRef } from "react";
import { useActiveLeadsSocket } from "@/hooks/useActiveLeadsSocket";
import { useSelectedLeads } from "@/hooks/useSelectedLeads";

export default function CallingApp() {
  const { dir } = useLanguage();

  // Call history hook with pagination
  const {
    leads,
    isLeadsLoading,
    setCallHistory,
    currentPage,
    totalPages,
    total,
    handlePageChange,
    loadCallHistory,
  } = useCallHistory();

  // Triple call hook
  const {
    isTripleCallInProgress,
    tripleCallStatus,
    activeLeads,
    handleTripleCall,
    setActiveLeads,
  } = useTripleCall({
    onHistoryUpdate: (history: ActiveLeads) => setCallHistory(history),
  });

  // Selected leads hook
  const {
    selectedLeads,
    addSelectedLead,
    addSelectedLeadWithPosition,
    removeSelectedLead,
    removeSelectedLeadByPosition,
    clearSelectedLeads,
    isLeadSelected,
    searchAndSelectLead,
    canAddMoreLeads,
  } = useSelectedLeads();

  // Handle phone number completion (10 digits)
  const handlePhoneNumberComplete = useCallback(
    async (phoneNumber: string) => {
      try {
        const result = await searchAndSelectLead(phoneNumber);
        if (result.found && result.page) {
          // Navigate to the page containing the lead
          handlePageChange(result.page);
        }
      } catch (error) {
        console.error("Error searching for lead:", error);
      }
    },
    [searchAndSelectLead]
  );

  // Handle phone number deletion (manual delete from input)
  const handlePhoneNumberDeleted = useCallback(
    (position: number, previousPhoneNumber: string) => {
      // Remove the pinned lead at this position
      removeSelectedLeadByPosition(position);
    },
    [removeSelectedLeadByPosition]
  );

  // Dialer hook
  const agentInputRef = React.useRef<HTMLInputElement>(null);
  const {
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
    handleKeypadInput,
    handleKeypadBackspace,
    handleFillCustomerNumber,
    handleCustomerNumberChange,
    getPositionForPhoneNumber,
    isTripleCallMode,
    setIsTripleCallMode,
    mapCustomerNumbersToLeads,
  } = useDialer({
    onHistoryUpdate: (history: ActiveLeads) => setCallHistory(history),
    onActiveLeads: setActiveLeads,
    onPhoneNumberComplete: handlePhoneNumberComplete,
    onPhoneNumberDeleted: handlePhoneNumberDeleted,
  });

  // Handle removing selected lead and clearing from dialer
  const handleRemoveSelectedLead = useCallback(
    (phoneNumber: string) => {
      removeSelectedLead(phoneNumber);
      // Also remove from customer numbers in dialer
      setCustomerNumbers((prev) =>
        prev.map((num) =>
          num.phone === phoneNumber ? { ...num, phone: "" } : num
        )
      );
    },
    [removeSelectedLead, setCustomerNumbers]
  );

  // Handle selecting lead with position based on dialer
  const handleSelectLeadWithPosition = useCallback(
    (lead: Lead) => {
      // Find the position where this lead's phone number should go
      const position = getPositionForPhoneNumber(lead.phone_number);
      if (position) {
        // Use the existing position
        addSelectedLeadWithPosition(lead, position);
      } else {
        // Use the regular add method which will find next available position
        addSelectedLead(lead);
      }
    },
    [addSelectedLead, addSelectedLeadWithPosition, getPositionForPhoneNumber]
  );

  // Icon/class helpers
  const iconMarginClass = useMemo(
    () => (dir === "rtl" ? "ml-1" : "mr-1"),
    [dir]
  );
  const flexDirection = dir === "rtl" ? "flex-row-reverse" : "flex-row";
  const socketRef = useRef<Socket | null>(null);

  const { connectSocket, disconnectSocket } = useActiveLeadsSocket({
    socketRef,
    setActiveLeads,
  });

  // Wrap handleCall to connect socket before calling
  const handleCallWithSocket = async () => {
    connectSocket();
    await handleCall();
    setTimeout(disconnectSocket, 60000);
  };

  // Wrap handleTripleCall to connect socket before calling
  const handleTripleCallWithSocket = async (
    agentNumber: string,
    leads: any[]
  ) => {
    connectSocket();
    await handleTripleCall(agentNumber, leads);
    setTimeout(disconnectSocket, 60000);
  };

  // Memoize the search handler to prevent recreating on every render
  const handleSearch = useCallback(
    async (searchQuery: string, resetPage?: boolean) => {
      if (resetPage && currentPage !== 1) {
        // Reset to page 1 and load data
        handlePageChange(1);
        await loadCallHistory(1, 20, searchQuery);
      } else {
        // Use current page
        await loadCallHistory(currentPage, 20, searchQuery);
      }
    },
    [loadCallHistory, currentPage, handlePageChange]
  );

  return (
    <div
      className="flex flex-col min-h-screen bg-background dark:bg-[#122347]"
      dir={dir}
    >
      <AppHeader />

      <div className="flex-1 container mx-auto px-4 py-6">
        <div className={`flex flex-row lg:${flexDirection} gap-6`}>
          <div className="lg:w-1/3">
            <DialerCard
              agentNumber={agentNumber}
              setAgentNumber={setAgentNumber}
              customerNumbers={customerNumbers}
              setCustomerNumbers={setCustomerNumbers}
              isCallInProgress={isCallInProgress}
              handleCall={handleCallWithSocket}
              agentCountryCode={agentCountryCode}
              setAgentCountryCode={setAgentCountryCode}
              customerCountryCodes={customerCountryCodes}
              setCustomerCountryCodes={setCustomerCountryCodes}
              focusedInput={focusedInput}
              setFocusedInput={setFocusedInput}
              agentInputRef={agentInputRef}
              handleKeypadInput={handleKeypadInput}
              handleKeypadBackspace={handleKeypadBackspace}
              handleTripleCall={() => {
                const leads = mapCustomerNumbersToLeads();
                handleTripleCallWithSocket(agentNumber, leads);
              }}
              isTripleCallInProgress={isTripleCallInProgress}
              isTripleCallMode={isTripleCallMode}
              setIsTripleCallMode={setIsTripleCallMode}
              handleCustomerNumberChange={handleCustomerNumberChange}
            />
          </div>
          <div className="lg:w-2/3 space-y-6">
            {/* status alert */}
            <StatusAlert tripleCallStatus={tripleCallStatus} />

            {/* active call leads card*/}
            <ActiveLeadsCard
              activeLeads={activeLeads}
              iconMarginClass={iconMarginClass}
            />

            {/* leads table with pagination */}
            <LeadsTable
              leads={leads}
              isLeadsLoading={isLeadsLoading}
              handleFillCustomerNumber={handleFillCustomerNumber}
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              selectedLeads={selectedLeads}
              onSelectLead={handleSelectLeadWithPosition}
              onRemoveSelectedLead={handleRemoveSelectedLead}
              canAddMoreLeads={canAddMoreLeads()}
              getPositionForPhoneNumber={getPositionForPhoneNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
