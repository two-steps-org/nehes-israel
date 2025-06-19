import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import React from "react";

interface CallHistoryCardProps {
  visibleHistory: any[];
  isLoadingHistory: boolean;
  t: (key: string) => string;
  handleFillCustomerNumber: (phoneNumber: string) => void;
}

export function CallHistoryCard({
  visibleHistory,
  isLoadingHistory,
  t,
  handleFillCustomerNumber,
}: CallHistoryCardProps) {
  return (
    <Card className="dark:border-[#D29D0E]/30 dark:bg-[#122347]/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-foreground dark:text-white">
          {t("history.title")}
        </CardTitle>
        <CardDescription className="text-muted-foreground dark:text-gray-300">
          {t("history.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" className="w-full">
          <div className="h-[500px] overflow-y-auto pr-2">
            <TabsContent value="recent" className="mt-0">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122347] dark:border-[#D29D0E]" />
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleHistory.map((call, index) => (
                    <div
                      key={`${call.id ?? call.timestamp}-${
                        call.agentNumber
                      }-${index}`}
                      onClick={() => {
                        if (call.phone_number) {
                          handleFillCustomerNumber(call.phone_number);
                        }
                      }}
                      className="p-3 border rounded-md hover:bg-gray-50 transition-colors dark:border-[#D29D0E]/30 dark:hover:bg-[#D29D0E]/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-foreground dark:text-[#D29D0E]">
                            {t("table.customer_name")} :{" "}
                            {call.full_name ? call.full_name : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-gray-300">
                            {t("table.customer")}: {call.phone_number}
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-gray-300">
                            {t("table.status")}: {call.status}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {call.isCalled
                            ? call.isCalled == "yes"
                              ? "Called"
                              : "Not Called"
                            : "Not Called"}
                          {call.duration > 0 && (
                            <span className="text-xs text-muted-foreground dark:text-gray-300">
                              {call.duration}s
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
      </CardContent>
    </Card>
  );
}
