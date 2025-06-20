import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Lead } from "@/types/activeLeads.type";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FilterIcon, Search, X } from "lucide-react";
import { Pagination } from "./Pagination";
import { useLeadsSearch } from "@/hooks/useLeadsSearch";
import { DEBOUND_DELAY } from "@/lib/utils";

interface CallHistoryCardProps {
  leads: Lead[];
  isLeadsLoading: boolean;
  t: (key: string) => string;
  handleFillCustomerNumber: (phoneNumber: string) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onSearch: (searchQuery: string, resetPage?: boolean) => void;
}

export function LeadsTable({
  leads,
  isLeadsLoading: isLoadingHistory,
  t,
  handleFillCustomerNumber,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onSearch,
}: CallHistoryCardProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Use the comprehensive search hook that handles all debouncing logic
  const { searchQuery, setSearchQuery, clearSearch, isSearching } =
    useLeadsSearch({
      onSearch,
      currentPage,
      debounceDelay: DEBOUND_DELAY,
    });

  useEffect(() => {
    console.log(leads);
  }, [leads]);

  const handleClearSearch = () => {
    clearSearch();
    // Keep hasSearched true so that clearing also triggers a search (to show all results)
  };

  return (
    <Card className="dark:border-[#D29D0E]/30 dark:bg-[#122347]/50 flex flex-col">
      {/* header */}
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-xl font-bold text-foreground dark:text-white">
          <div className="flex items-center gap-2">
            <span>
              {t("history.title")} ({total} {t("history.subtitle")})
            </span>
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <FilterIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>

        {/* Search input - shown/hidden based on filters state */}
        {isFiltersOpen && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={
                t("table.search.placeholder") || "Search by name or phone..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {isSearching && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#122347] dark:border-[#D29D0E]" />
              </div>
            )}
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      {/* leads list - with proper height calculation */}
      <CardContent className="flex-1 flex flex-col">
        <Tabs
          defaultValue="recent"
          className="w-full flex flex-col flex-1 max-h-[calc(100vh-310px)]"
        >
          <div
            className="flex-1 overflow-y-auto pr-2"
            style={{
              height: "calc(100vh - 280px)", // Approximate: 100vh - header(64px) - card header(60px) - pagination(60px) - padding(96px)
            }}
          >
            <TabsContent value="recent" className="mt-0 h-full">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122347] dark:border-[#D29D0E]" />
                </div>
              ) : leads.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground dark:text-gray-300">
                    No leads found
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead, index) => (
                    <div
                      key={`${lead._id ?? lead.timestamp}-${
                        lead.phone_number
                      }-${index}`}
                      onClick={() => {
                        if (lead.phone_number) {
                          handleFillCustomerNumber(lead.phone_number);
                        }
                      }}
                      className="p-3 border rounded-md hover:bg-gray-50 transition-colors dark:border-[#D29D0E]/30 dark:hover:bg-[#D29D0E]/10 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-foreground dark:text-[#D29D0E]">
                            {t("table.customer_name")} :{" "}
                            {lead.full_name ? lead.full_name : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-gray-300">
                            {t("table.customer")}: {lead.phone_number}
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-gray-300">
                            {t("table.status")}: {lead.status}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs">
                            {lead.isCalled == "yes" ? (
                              <span className="bg-[#D29D0E] text-white px-2 py-1 rounded-md">
                                Called
                              </span>
                            ) : (
                              <span className="text-red-500">Not Called</span>
                            )}
                          </span>

                          {lead?.call_duration && lead.call_duration > 0 && (
                            <span className="text-xs text-muted-foreground dark:text-gray-300">
                              {lead.call_duration}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
