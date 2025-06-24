import React from "react";
import { Lead } from "@/types/activeLeads.type";
import { useLanguage } from "./language-provider";
import { Button } from "./ui/button";
import { X, Pin } from "lucide-react";
import { SelectedLead } from "@/hooks/useSelectedLeads";

interface LeadCardProps {
  lead: Lead | SelectedLead;
  index: number;
  onLeadClick: (phoneNumber: string) => void;
  isSelected?: boolean;
  onRemoveSelected?: (phoneNumber: string) => void;
}

export function LeadCard({
  lead,
  index,
  onLeadClick,
  isSelected = false,
  onRemoveSelected,
}: LeadCardProps) {
  const { isHebrew, t } = useLanguage();
  const selectedLead = lead as SelectedLead;

  const handleClick = () => {
    if (lead.phone_number && !isSelected) {
      onLeadClick(lead.phone_number);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveSelected && lead.phone_number) {
      onRemoveSelected(lead.phone_number);
    }
  };

  return (
    <div
      key={`${lead._id ?? lead.timestamp}-${lead.phone_number}-${index}`}
      onClick={handleClick}
      className={`p-3 border rounded-md transition-colors relative ${
        isSelected
          ? "border-[#D29D0E] bg-[#D29D0E]/5 dark:border-[#D29D0E] dark:bg-[#D29D0E]/10"
          : "border-gray-200 hover:bg-gray-50 dark:border-[#D29D0E]/30 dark:hover:bg-[#D29D0E]/10 cursor-pointer"
      }`}
      style={{ direction: isHebrew ? "rtl" : "ltr" }}
    >
      {/* Pinned indicator and remove button */}
      {isSelected && (
        <div
          className={`absolute top-1 ${
            isHebrew ? "left-1" : "right-1"
          } flex items-center gap-1 z-10`}
        >
          {/* Position number */}
          {selectedLead.position && (
            <div className="bg-[#D29D0E] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
              {selectedLead.position}
            </div>
          )}
          <Pin className="w-3 h-3 text-[#D29D0E]" />
          {onRemoveSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full"
              title={t("selected.remove")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}

      <div className="flex items-start justify-between">
        {/* Customer info - appears on right in Hebrew */}
        <div
          className={`${isHebrew ? "text-right" : "text-left"} ${
            isSelected ? (isHebrew ? "pl-12" : "pr-12") : ""
          }`}
        >
          {/* Show pinned label for selected leads */}
          {isSelected && (
            <div className="text-xs text-[#D29D0E] font-medium mb-1">
              {t("selected.pinned")}
            </div>
          )}

          <div className="font-medium text-foreground dark:text-[#D29D0E]">
            {t("table.customer_name")} :{" "}
            {lead.full_name ? lead.full_name : "N/A"}
          </div>
          <div className="text-sm text-muted-foreground dark:text-gray-300">
            {t("table.customer")}: {lead.phone_number}
          </div>

          {/* Show search message for placeholder leads */}
          {selectedLead.searchMessage ? (
            <div className="text-xs text-orange-600 dark:text-orange-400">
              {t("selected.not_found")}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground dark:text-gray-300">
              {t("table.status")}: {lead.status}
            </div>
          )}
        </div>

        {/* Status info - appears on left in Hebrew */}
        <div className={`flex flex-col items-end ${isSelected ? "mt-6" : ""}`}>
          {!selectedLead.searchMessage && (
            <span className="text-xs">
              {lead.isCalled == "yes" ? (
                <span className="bg-[#D29D0E] text-white px-2 py-1 rounded-md">
                  {t("table.called")}
                </span>
              ) : (
                <span className="text-red-500">{t("table.not_called")}</span>
              )}
            </span>
          )}

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
