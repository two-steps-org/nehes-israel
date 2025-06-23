import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ActiveLeadsCardProps {
  activeLeads: any[];
  iconMarginClass: string;
  t: (key: string) => string;
}

export function ActiveLeadsCard({
  activeLeads,
  iconMarginClass,
  t,
}: ActiveLeadsCardProps) {
  const [hiddenLeadIds, setHiddenLeadIds] = useState<string[]>([]);

  useEffect(() => {
    activeLeads.forEach((lead) => {
      if (
        (lead.status === "completed" || lead.status === "no-answer") &&
        !hiddenLeadIds.includes(lead._id)
      ) {
        setTimeout(() => {
          setHiddenLeadIds((prev) => [...prev, lead._id]);
        }, 3000);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLeads, hiddenLeadIds]);

  const visibleLeads = activeLeads.filter(
    (lead) => !hiddenLeadIds.includes(lead._id)
  );

  if (!visibleLeads.length) return null;
  return (
    <Card className="dark:border-[#D29D0E]/30 dark:bg-[#122347]/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-foreground dark:text-white">
          {t("activeLeads.title")}
        </CardTitle>
        <CardDescription className="text-muted-foreground dark:text-gray-300">
          {t("activeLeads.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleLeads.map((lead) => (
            <div
              key={lead._id}
              className="p-3 border rounded-md dark:border-[#D29D0E]/30 bg-background dark:bg-[#122347]/80"
            >
              <div className="text-sm text-muted-foreground dark:text-gray-300">
                {lead.phone_number}
              </div>
              {lead.status && (
                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Status: {lead.status}
                </div>
              )}
              <div className="mt-2 flex items-center text-xs text-muted-foreground dark:text-gray-400">
                <Clock className={`h-3 w-3 ${iconMarginClass}`} />
                <span>{t("activeLeads.inProgress")}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
