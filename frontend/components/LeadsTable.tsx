import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Lead } from "@/types/activeLeads.type";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { FilterIcon } from "lucide-react";
import { Pagination } from "./Pagination";
import { useLeadsSearch } from "@/hooks/useLeadsSearch";
import { DEBOUND_DELAY } from "@/lib/utils";
import { useLanguage } from "./language-provider";
import { SearchInput } from "./SearchInput";
import { LeadCard } from "./LeadCard";
import { SelectedLead } from "@/hooks/useSelectedLeads";

interface CallHistoryCardProps {
  leads: Lead[];
  isLeadsLoading: boolean;
  handleFillCustomerNumber: (phoneNumber: string) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onSearch: (searchQuery: string, resetPage?: boolean) => void;
  selectedLeads?: SelectedLead[];
  onSelectLead?: (lead: Lead) => void;
  onRemoveSelectedLead?: (phoneNumber: string) => void;
  canAddMoreLeads?: boolean;
  getPositionForPhoneNumber?: (phoneNumber: string) => number | null;
}

export function LeadsTable(props: CallHistoryCardProps) {
  const {
    leads,
    isLeadsLoading: isLoadingHistory,
    handleFillCustomerNumber,
    currentPage,
    totalPages,
    total,
    onPageChange,
    onSearch,
    selectedLeads = [],
    onSelectLead,
    onRemoveSelectedLead,
    canAddMoreLeads = true,
    getPositionForPhoneNumber,
  } = props;
  const { t } = useLanguage();
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

  const handleLeadClick = (phoneNumber: string) => {
    const lead = leads.find((l) => l.phone_number === phoneNumber);
    if (lead && onSelectLead && canAddMoreLeads) {
      // Add to selected leads (pinned) only if we can add more
      onSelectLead(lead);
      // Also fill the customer number input
      handleFillCustomerNumber(phoneNumber);
    } else {
      // If can't add more leads or no onSelectLead, just fill the number
      handleFillCustomerNumber(phoneNumber);
    }
  };

  const isLeadSelected = (phoneNumber: string) => {
    return selectedLeads.some((lead) => lead.phone_number === phoneNumber);
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
              className="px-2 py-0"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <FilterIcon className="w-3 h-3" />
            </Button>
          </div>
        </CardTitle>

        {/* Search input - shown/hidden based on filters state */}
        {isFiltersOpen && (
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={handleClearSearch}
            isSearching={isSearching}
            placeholder={
              t("table.search.placeholder") || "Search by name or phone..."
            }
          />
        )}
      </CardHeader>

      {/* leads list - with proper height calculation */}
      <CardContent className="flex-1 flex flex-col">
        <Tabs
          defaultValue="recent"
          className="w-full flex flex-col flex-1 max-h-[calc(100vh-340px)]"
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
                    {t("table.no_leads_found")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Render pinned leads first */}
                  {selectedLeads.map((lead, index) => (
                    <LeadCard
                      key={`selected-${lead._id ?? lead.timestamp}-${
                        lead.phone_number
                      }-${index}`}
                      lead={lead}
                      index={index}
                      onLeadClick={handleLeadClick}
                      isSelected={true}
                      onRemoveSelected={onRemoveSelectedLead}
                    />
                  ))}

                  {/* Add separator if there are pinned leads */}
                  {selectedLeads.length > 0 && leads.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-[#D29D0E]/30 my-4"></div>
                  )}

                  {/* Show max leads message if reached limit */}
                  {!canAddMoreLeads && (
                    <div className="text-center py-2 px-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        {t("selected.max_reached")} (3/3)
                      </p>
                    </div>
                  )}

                  {/* Render regular leads */}
                  {leads.map((lead, index) => {
                    // Skip rendering if this lead is already selected/pinned
                    if (isLeadSelected(lead.phone_number)) {
                      return null;
                    }

                    return (
                      <LeadCard
                        key={`${lead._id ?? lead.timestamp}-${
                          lead.phone_number
                        }-${index}`}
                        lead={lead}
                        index={index}
                        onLeadClick={handleLeadClick}
                        isSelected={false}
                      />
                    );
                  })}
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
