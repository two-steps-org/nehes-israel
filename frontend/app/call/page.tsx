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
import { ActiveLeads } from "@/types/activeLeads.type";
import { io, Socket } from "socket.io-client";
import React, { useMemo, useCallback, useRef } from "react";
import { useActiveLeadsSocket } from "@/hooks/useActiveLeadsSocket";

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
    isTripleCallMode,
    setIsTripleCallMode,
    mapCustomerNumbersToLeads,
  } = useDialer({
    onHistoryUpdate: (history: ActiveLeads) => setCallHistory(history),
    onActiveLeads: setActiveLeads,
  });

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
      const targetPage = resetPage ? 1 : currentPage;
      await loadCallHistory(targetPage, 20, searchQuery);
    },
    [loadCallHistory, currentPage]
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
