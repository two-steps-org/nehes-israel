import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLanguage } from "./language-provider";

interface ActiveLeadsCardProps {
  activeLeads: any[];
  iconMarginClass: string;
}

export function ActiveLeadsCard({
  activeLeads,
  iconMarginClass,
}: ActiveLeadsCardProps) {
  const { t } = useLanguage();
  if (!activeLeads.length) return null;
  const [hiddenLeadIds, setHiddenLeadIds] = useState<string[]>([]);
  const [timers, setTimers] = useState<{ [key: string]: number }>({});
  const intervalRefs = React.useRef<{ [key: string]: any }>({});

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

  useEffect(() => {
    visibleLeads.forEach((lead) => {
      if (lead.status === "in-progress" && !intervalRefs.current[lead._id]) {
        intervalRefs.current[lead._id] = setInterval(() => {
          setTimers((prev) => ({ ...prev, [lead._id]: (prev[lead._id] || 0) + 1 }));
        }, 1000);
      } else if (lead.status !== "in-progress" && intervalRefs.current[lead._id]) {
        clearInterval(intervalRefs.current[lead._id]);
        delete intervalRefs.current[lead._id];
      }
    });

    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, [visibleLeads]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

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
              {lead.status === "in-progress" && timers[lead._id] > 0 ? (
                <div className="text-xs text-green-500 dark:text-green-400 mt-1">
                  {formatTime(timers[lead._id])}
                </div>
              ) : (
                lead.status && (
                  <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Status: {lead.status}
                  </div>
                )
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
