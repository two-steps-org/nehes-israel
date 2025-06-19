import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Lead } from "@/types/activeLeads.type";
import React, { useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface CallHistoryCardProps {
  leads: Lead[];
  isLeadsLoading: boolean;
  t: (key: string) => string;
  handleFillCustomerNumber: (phoneNumber: string) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
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
}: CallHistoryCardProps) {
  useEffect(() => {
    console.log(leads);
  }, [leads]);

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add ellipsis and first page if needed
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            onClick={() => onPageChange(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add visible page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => onPageChange(page)}
            isActive={currentPage === page}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Card className="dark:border-[#D29D0E]/30 dark:bg-[#122347]/50 flex flex-col">
      {/* header */}
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-xl font-bold text-foreground dark:text-white">
          {t("history.title")} ({total} {t("history.subtitle")})
        </CardTitle>
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
        {totalPages > 1 && (
          <div className="mt-4 flex-shrink-0">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {generatePaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {/* Page info */}
            <div className="text-center mt-2 text-sm text-muted-foreground dark:text-gray-400">
              Page {currentPage} of {totalPages} ({total} total items)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
