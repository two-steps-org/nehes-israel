import { Keypad } from "@/components/keypad";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Users } from "lucide-react";
import React from "react";

type CustomerNumber = {
  id: number;
  phone: string;
};

interface DialerCardProps {
  agentNumber: string;
  setAgentNumber: (v: string) => void;
  customerNumbers: CustomerNumber[];
  setCustomerNumbers: (v: CustomerNumber[]) => void;
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
  isTripleCallMode: boolean;
  setIsTripleCallMode: (v: boolean) => void;
  handleCustomerNumberChange?: (idx: number, value: string) => void;
}

export function DialerCard(props: DialerCardProps) {
  const {
    agentNumber,
    setAgentNumber,
    customerNumbers,
    setCustomerNumbers,
    isCallInProgress,
    handleCall,
    setFocusedInput,
    agentInputRef,
    handleKeypadInput,
    handleKeypadBackspace,
    handleTripleCall,
    isTripleCallInProgress,
    isTripleCallMode,
    setIsTripleCallMode,
    handleCustomerNumberChange,
  } = props;
  const { t, dir } = useLanguage();
  const phoneIconClass = dir === "rtl" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4";
  const usersIconClass = dir === "rtl" ? "ml-2 h-5 w-5" : "mr-2 h-5 w-5";

  // Calculate if button should be disabled based on isTripleCallMode state
  const isButtonDisabled = isTripleCallMode
    ? isTripleCallInProgress ||
      customerNumbers.some((n) => n.phone.trim().length === 0)
    : isCallInProgress || !customerNumbers[0].phone.trim();

  // Determine which function to call based on isTripleCallMode state
  const handleButtonClick = isTripleCallMode ? handleTripleCall : handleCall;

  // Determine button text and icon based on isTripleCallMode state
  const buttonText = isTripleCallMode
    ? isTripleCallInProgress
      ? t("button.callingLeads")
      : t("button.tripleCall")
    : isCallInProgress
    ? t("button.connecting")
    : t("button.bridge");

  const ButtonIcon = isTripleCallMode ? Users : Phone;
  const iconClass = isTripleCallMode ? usersIconClass : phoneIconClass;

  return (
    <div className="h-full">
      <div className="h-full dark:border-[#D29D0E]/30 dark:bg-[#122347]/50">
        <div className="px-6">
          {/* Call button */}
          <Button
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            className="w-full bg-[#122347] hover:bg-[#122347]/90 text-white dark:bg-[#D29D0E] dark:hover:bg-[#D29D0E]/90 dark:text-[#122347] py-6 text-lg"
            size="lg"
          >
            <ButtonIcon className={iconClass} />
            {buttonText}
          </Button>

          {/* Triple call checkbox */}
          <div className="flex items-center space-x-2 gap-x-2 py-4">
            <Checkbox
              id="useTripleCall"
              checked={isTripleCallMode}
              onCheckedChange={(checked) =>
                setIsTripleCallMode(checked === true)
              }
            />
            <Label
              htmlFor="useTripleCall"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground dark:text-[#D29D0E]"
            >
              {dir === "rtl" ? "תשתמש ב שיחה משולשת" : "use triple call leads"}
            </Label>
          </div>

          {/* Agent number input */}
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
              maxLength={10}
              onChange={(e) => setAgentNumber(e.target.value)}
              className="border-input dark:border-[#D29D0E]/50 dark:bg-[#122347]/80 dark:text-white focus-visible:ring-[#D29D0E]"
              ref={agentInputRef}
              onFocus={() => setFocusedInput("agent")}
            />
          </div>

          {/* Customer number inputs */}
          <div className="space-y-2 mt-4">
            <Label
              htmlFor="customerNumbers"
              className="text-foreground dark:text-[#D29D0E]"
            >
              {t("customer.number")}
            </Label>
            <div className="flex flex-col space-y-2">
              {customerNumbers.map((customerNumber, idx) => {
                // Show only first input if isTripleCallMode is false
                if (!isTripleCallMode && idx > 0) return null;

                return (
                  <Input
                    key={customerNumber.id}
                    id={`customerNumber${idx}`}
                    type="tel"
                    placeholder={t("placeholder.customer")}
                    value={customerNumber.phone}
                    maxLength={10}
                    onChange={(e) => {
                      if (handleCustomerNumberChange) {
                        handleCustomerNumberChange(idx, e.target.value);
                      } else {
                        const newNumbers = [...customerNumbers];
                        newNumbers[idx] = {
                          ...newNumbers[idx],
                          phone: e.target.value,
                        };
                        setCustomerNumbers(newNumbers);
                      }
                    }}
                    onFocus={() => setFocusedInput({ type: "customer", idx })}
                    className="border-input dark:border-[#D29D0E]/50 dark:bg-[#122347]/80 dark:text-white focus-visible:ring-[#D29D0E]"
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <Keypad
              onKeyPress={handleKeypadInput}
              onBackspace={handleKeypadBackspace}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
