"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useMemo } from "react";

type Language = "en" | "he";

type Translations = {
  [key: string]: {
    en: string;
    he: string;
  };
};

// Add all translations here
const translations: Translations = {
  // app
  "app.title": {
    en: "Calling App",
    he: "אפליקציית שיחות",
  },
  "app.subtitle": {
    en: "Bridge calls to your phone",
    he: "גשר שיחות לטלפון שלך",
  },

  // dialer
  "dialer.title": {
    en: "Call Dialer",
    he: "חייגן שיחות",
  },
  "dialer.description": {
    en: "Make calls to leads or enter numbers manually",
    he: "בצע שיחות ללידים או הזן מספרים באופן ידני",
  },

  // agent
  "agent.number": {
    en: "Agent Phone Number",
    he: "מספר טלפון של הסוכן",
  },

  // customer
  "customer.number": {
    en: "Customer Phone Number",
    he: "מספר טלפון של הלקוח",
  },

  // buttons
  "button.bridge": {
    en: "Bridge Call",
    he: "גשר שיחה",
  },
  "button.connecting": {
    en: "Connecting...",
    he: "מתחבר...",
  },
  "button.tripleCall": {
    en: "Triple Call Leads",
    he: "שיחה משולשת למובילים",
  },
  "button.callingLeads": {
    en: "Calling Leads...",
    he: "מתקשר למובילים...",
  },
  "button.viewHistory": {
    en: "View Call History",
    he: "צפה בהיסטוריית שיחות",
  },

  // history
  "history.title": {
    en: "Leads",
    he: "לידים",
  },
  "history.subtitle": {
    en: "List of leads",
    he: "רשימת לידים",
  },
  "history.tabs.recent": {
    en: "List",
    he: "אחרונות",
  },
  "history.tabs.all": {
    en: "All Calls",
    he: "כל השיחות",
  },
  "history.viewFull": {
    en: "View Full History",
    he: "צפה בהיסטוריה מלאה",
  },

  // table
  "table.datetime": {
    en: "Date & Time",
    he: "תאריך ושעה",
  },
  "table.customer": {
    en: "Customer Number",
    he: "מספר לקוח",
  },
  "table.search.placeholder": {
    en: "Search by name or phone number",
    he: "חפש לפי שם או מספר טלפון",
  },
  "table.search.clear": {
    en: "Clear",
    he: "נקה",
  },
  "table.customer_name": {
    en: "Customer Name",
    he: "שם הלקוח",
  },
  "table.agent": {
    en: "Agent Number",
    he: "מספר סוכן",
  },
  "table.status": {
    en: "Status",
    he: "סטטוס",
  },
  "table.duration": {
    en: "Duration",
    he: "משך",
  },
  "table.not_called": {
    en: "Not Called",
    he: "לא טופל",
  },
  "table.called": {
    en: "Called",
    he: "בוצעה שיחה",
  },
  "table.no_leads_found": {
    en: "No leads found",
    he: "לא נמצאו לידים",
  },

  // selected leads
  "selected.pinned": {
    en: "Pinned Lead",
    he: "ליד נבחר",
  },
  "selected.not_found": {
    en: "Lead not found in system",
    he: "ליד לא נמצא במערכת",
  },
  "selected.found_and_pinned": {
    en: "Lead found and pinned",
    he: "ליד נמצא ונבחר",
  },
  "selected.remove": {
    en: "Remove from pinned",
    he: "הסר מהלידים הנבחרים",
  },
  "selected.max_reached": {
    en: "Maximum pinned leads reached",
    he: "הגעת למקסימום לידים נבחרים",
  },

  // status
  "status.connected": {
    en: "Connected",
    he: "מחובר",
  },
  "status.busy": {
    en: "Busy",
    he: "תפוס",
  },
  "status.failed": {
    en: "Failed",
    he: "נכשל",
  },
  "status.noanswer": {
    en: "No Answer",
    he: "אין מענה",
  },
  "status.canceled": {
    en: "Canceled",
    he: "בוטל",
  },
  "status.queued": {
    en: "Queued",
    he: "בתור",
  },
  "status.initiated": {
    en: "Initiated",
    he: "הותחל",
  },
  "status.ringing": {
    en: "Ringing",
    he: "מצלצל",
  },
  "status.unknown": {
    en: "Unknown",
    he: "לא ידוע",
  },
  "status.dropped": {
    en: "Dropped",
    he: "נותק",
  },

  // placeholder
  "placeholder.agent": {
    en: "Enter your phone number",
    he: "הזן את מספר הטלפון שלך",
  },
  "placeholder.customer": {
    en: "Enter customer phone number",
    he: "הזן את מספר הטלפון של הלקוח",
  },

  // alert
  "alert.success": {
    en: "Success",
    he: "הצלחה",
  },
  "alert.error": {
    en: "Error",
    he: "שגיאה",
  },
  or: {
    en: "or",
    he: "או",
  },

  // active leads
  "activeLeads.title": {
    en: "Active Call",
    he: "שיחה פעילה",
  },
  "activeLeads.description": {
    en: "Currently calling these leads",
    he: "מתקשר כרגע ללידים אלה",
  },
  "activeLeads.inProgress": {
    en: "Call in progress",
    he: "שיחה מתבצעת",
  },

  // pagination
  "pagination.page": {
    en: "Page",
    he: "דף",
  },
  "pagination.of": {
    en: "of",
    he: "מתוך",
  },
  "pagination.total": {
    en: "total items",
    he: "פריטים בסך הכל",
  },
  "pagination.previous": {
    en: "Previous",
    he: "הקודם",
  },
  "pagination.next": {
    en: "Next",
    he: "הבא",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  dir: string;
  isHebrew: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({
  children,
  defaultLanguage = "en",
}: {
  children: React.ReactNode;
  defaultLanguage?: Language;
}) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [dir, setDir] = useState<string>("ltr");

  useEffect(() => {
    // Set the direction based on the language
    setDir(language === "he" ? "rtl" : "ltr");
    // Set the dir attribute on the html element
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    // Set the lang attribute on the html element
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  const isHebrew = useMemo(() => language === "he", [language]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, dir, isHebrew }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
