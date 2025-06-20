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
import React, { useMemo, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function CallingApp() {
  const { t, dir } = useLanguage();

  // Call history hook with pagination
  const {
    leads,
    isLeadsLoading,
    setCallHistory,
    currentPage,
    totalPages,
    total,
    handlePageChange,
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

  // Helper to connect socket and set up listener
  const connectSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001");
      socketRef.current.on("call_status_update", (data) => {
        setActiveLeads((prevLeads) => {
          const normalize = (num: string = "") => {
            const digits = num.replace(/\D/g, "");
            return digits.slice(-9);
          };
          const toNorm = normalize(data.to);
          const fromNorm = normalize(data.from);
          return prevLeads.map((lead) => {
            const leadNorm = normalize(lead.phone_number);
            if (leadNorm === toNorm || leadNorm === fromNorm) {
              return { ...lead, status: data.status };
            }
            return lead;
          });
        });
      });
    }
  };

  // Helper to disconnect socket
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Wrap handleCall to connect socket before calling
  const handleCallWithSocket = async () => {
    connectSocket();
    await handleCall();
    setTimeout(disconnectSocket, 60000);
  };

  // Wrap handleTripleCall to connect socket before calling
  const handleTripleCallWithSocket = async (agentNumber: string, leads: any[]) => {
    connectSocket();
    await handleTripleCall(agentNumber, leads);
    setTimeout(disconnectSocket, 60000);
  };

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
            <StatusAlert tripleCallStatus={tripleCallStatus} t={t} />

            {/* active call leads card*/}
            <ActiveLeadsCard
              activeLeads={activeLeads}
              iconMarginClass={iconMarginClass}
              t={t}
            />

            {/* leads table with pagination */}
            <LeadsTable
              leads={leads}
              isLeadsLoading={isLeadsLoading}
              t={t}
              handleFillCustomerNumber={handleFillCustomerNumber}
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
