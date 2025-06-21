import React from "react";
import { Lead } from "@/types/activeLeads.type";
import { useLanguage } from "./language-provider";

interface LeadCardProps {
  lead: Lead;
  index: number;
  onLeadClick: (phoneNumber: string) => void;
}

export function LeadCard({ lead, index, onLeadClick }: LeadCardProps) {
  const { isHebrew, t } = useLanguage();

  const handleClick = () => {
    if (lead.phone_number) {
      onLeadClick(lead.phone_number);
    }
  };

  return (
    <div
      key={`${lead._id ?? lead.timestamp}-${lead.phone_number}-${index}`}
      onClick={handleClick}
      className="p-3 border rounded-md hover:bg-gray-50 transition-colors dark:border-[#D29D0E]/30 dark:hover:bg-[#D29D0E]/10 cursor-pointer"
      style={{ direction: isHebrew ? "rtl" : "ltr" }}
    >
      <div className="flex items-start justify-between">
        {/* Customer info - appears on right in Hebrew */}
        <div className={isHebrew ? "text-right" : "text-left"}>
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

        {/* Status info - appears on left in Hebrew */}
        <div className="flex flex-col items-end">
          <span className="text-xs">
            {lead.isCalled == "yes" ? (
              <span className="bg-[#D29D0E] text-white px-2 py-1 rounded-md">
                {t("table.called")}
              </span>
            ) : (
              <span className="text-red-500">{t("table.not_called")}</span>
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
  );
}
