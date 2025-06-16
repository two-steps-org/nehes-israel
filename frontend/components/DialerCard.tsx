import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Keypad } from "@/components/keypad";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Phone, Users } from "lucide-react";
import { countryCodes } from "@/lib/country-codes";
import { useLanguage } from "@/components/language-provider";
import React from "react";

interface DialerCardProps {
  agentNumber: string;
  setAgentNumber: (v: string) => void;
  customerNumbers: string[];
  setCustomerNumbers: (v: string[]) => void;
  isCallInProgress: boolean;
  handleCall: () => void;
  agentCountryCode: string;
  setAgentCountryCode: (v: string) => void;
  customerCountryCodes: string[];
  setCustomerCountryCodes: (v: string[]) => void;
  focusedInput: any;
  setFocusedInput: (v: any) => void;
  agentInputRef: React.RefObject<HTMLInputElement | null>;
  handleKeypadInput: (v: string) => void;
  handleKeypadBackspace: () => void;
  handleTripleCall: () => void;
  isTripleCallInProgress: boolean;
}

export function DialerCard({
  agentNumber,
  setAgentNumber,
  customerNumbers,
  setCustomerNumbers,
  isCallInProgress,
  handleCall,
  agentCountryCode,
  setAgentCountryCode,
  customerCountryCodes,
  setCustomerCountryCodes,
  focusedInput,
  setFocusedInput,
  agentInputRef,
  handleKeypadInput,
  handleKeypadBackspace,
  handleTripleCall,
  isTripleCallInProgress,
}: DialerCardProps) {
  const { t, dir } = useLanguage();
  const phoneIconClass = dir === "rtl" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4";
  const usersIconClass = dir === "rtl" ? "ml-2 h-5 w-5" : "mr-2 h-5 w-5";
  const flexDirection = dir === "rtl" ? "flex-row-reverse" : "flex-row";

  return (
    <div className="h-full">
      <div className="h-full dark:border-[#D29D0E]/30 dark:bg-[#122347]/50">
        <div className="p-6">
          <Button
            onClick={handleTripleCall}
            disabled={isTripleCallInProgress}
            className="w-full bg-[#122347] hover:bg-[#122347]/90 text-white dark:bg-[#D29D0E] dark:hover:bg-[#D29D0E]/90 dark:text-[#122347] py-6 text-lg"
            size="lg"
          >
            <Users className={usersIconClass} />
            {isTripleCallInProgress
              ? t("button.callingLeads")
              : t("button.tripleCall")}
          </Button>

          <div className="my-4 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t dark:border-[#D29D0E]/30"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card dark:bg-[#122347]/50 px-2 text-muted-foreground dark:text-[#D29D0E]">
                {t("or")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="agentNumber"
              className="text-foreground dark:text-[#D29D0E]"
            >
              {t("agent.number")}
            </Label>
            <Input
              id="agentNumber"
              type="tel"
              placeholder={t("placeholder.agent")}
              value={agentNumber}
              onChange={(e) => setAgentNumber(e.target.value)}
              className="border-input dark:border-[#D29D0E]/50 dark:bg-[#122347]/80 dark:text-white focus-visible:ring-[#D29D0E]"
              ref={agentInputRef}
              onFocus={() => setFocusedInput("agent")}
            />
          </div>

          <div className="space-y-2 mt-4">
            <Label
              htmlFor="customerNumbers"
              className="text-foreground dark:text-[#D29D0E]"
            >
              {t("customer.number")}
            </Label>
            <div className="flex flex-col space-y-2">
              {customerNumbers.map((num, idx) => (
                <Input
                  key={idx}
                  id={`customerNumber${idx}`}
                  type="tel"
                  placeholder={t("placeholder.customer")}
                  value={num}
                  onChange={(e) => {
                    const newNumbers = [...customerNumbers];
                    newNumbers[idx] = e.target.value;
                    setCustomerNumbers(newNumbers);
                  }}
                  onFocus={() => setFocusedInput({ type: "customer", idx })}
                  className="border-input dark:border-[#D29D0E]/50 dark:bg-[#122347]/80 dark:text-white focus-visible:ring-[#D29D0E]"
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Keypad
              onKeyPress={handleKeypadInput}
              onBackspace={handleKeypadBackspace}
            />
          </div>

          <Button
            onClick={handleCall}
            disabled={
              isCallInProgress ||
              !agentNumber ||
              customerNumbers.every((n) => !n.trim())
            }
            className="w-full bg-[#122347] hover:bg-[#122347]/90 text-white dark:bg-[#D29D0E] dark:hover:bg-[#D29D0E]/90 dark:text-[#122347] mt-4"
          >
            <Phone className={phoneIconClass} />
            {isCallInProgress ? t("button.connecting") : t("button.bridge")}
          </Button>
        </div>
      </div>
    </div>
  );
}
