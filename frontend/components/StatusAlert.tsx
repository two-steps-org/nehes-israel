import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import React from "react";

interface StatusAlertProps {
  tripleCallStatus: { show: boolean; success: boolean; message: string };
  t: (key: string) => string;
}

export function StatusAlert({ tripleCallStatus, t }: StatusAlertProps) {
  if (!tripleCallStatus.show) return null;
  return (
    <Alert
      className={
        tripleCallStatus.success
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900"
      }
    >
      {tripleCallStatus.success ? (
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      )}
      <AlertTitle
        className={
          tripleCallStatus.success
            ? "text-green-800 dark:text-green-400"
            : "text-red-800 dark:text-red-400"
        }
      >
        {tripleCallStatus.success ? t("alert.success") : t("alert.error")}
      </AlertTitle>
      <AlertDescription
        className={
          tripleCallStatus.success
            ? "text-green-700 dark:text-green-300"
            : "text-red-700 dark:text-red-300"
        }
      >
        {tripleCallStatus.message}
      </AlertDescription>
    </Alert>
  );
}
