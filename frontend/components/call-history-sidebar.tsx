"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { fetchActiveLeads } from "@/lib/api";
import { ActiveLeads } from "@/types/activeLeads.type";

export function CallHistorySidebar() {
  const [callHistory, setCallHistory] = useState<ActiveLeads>({
    data: [],
    metadata: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const { t, dir } = useLanguage();

  // Determine sidebar position based on language direction
  const sidebarSide = dir === "rtl" ? "left" : "right";

  useEffect(() => {
    const loadCallHistory = async () => {
      try {
        const history = await fetchActiveLeads(1, 10); // Load first 10 items for sidebar
        setCallHistory(history);
      } catch (error) {
        console.error("Failed to load call history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCallHistory();
  }, []);

  return (
    <Sidebar side={sidebarSide} variant="floating" collapsible="offcanvas">
      <SidebarHeader className="border-b dark:border-[#D29D0E]/30">
        <div className="p-4" dir={dir}>
          <h2 className="text-xl font-bold text-[#122347] dark:text-[#D29D0E]">
            {t("history.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {t("history.subtitle")}
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122347] dark:border-[#D29D0E]"></div>
          </div>
        ) : (
          <div className="space-y-2 p-4" dir={dir}>
            {callHistory.data?.map((call) => (
              <div
                key={call._id}
                className="p-3 border rounded-md hover:bg-gray-50 transition-colors dark:border-[#D29D0E]/30 dark:hover:bg-[#D29D0E]/10"
              >
                <div className="font-medium text-[#122347] dark:text-[#D29D0E]">
                  {call.full_name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  Phone: {call.phone_number}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-400">
                  Project: {call.status}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-400">
                  Status: {call.isCalled ? "✅ Called" : "❌ Not Yet"}
                </div>
              </div>
            ))}
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-4 dark:border-[#D29D0E]/30">
        <Button
          variant="outline"
          className="w-full text-[#122347] border-[#122347] hover:bg-[#D29D0E]/10 dark:text-[#D29D0E] dark:border-[#D29D0E] dark:hover:bg-[#D29D0E]/10"
          onClick={() => window.open("/call-history", "_blank")}
        >
          {t("history.viewFull")}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
