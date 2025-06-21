import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, X } from "lucide-react";
import { useLanguage } from "./language-provider";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
  placeholder?: string;
}

export function SearchInput({
  searchQuery,
  onSearchChange,
  onClearSearch,
  isSearching,
  placeholder = "Search by name or phone...",
}: SearchInputProps) {
  const { isHebrew } = useLanguage();

  return (
    <div className="relative" style={{ direction: isHebrew ? "rtl" : "ltr" }}>
      <Search
        className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${
          isHebrew ? "right-3" : "left-3"
        }`}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`${isHebrew ? "pr-10 pl-10" : "pl-10 pr-10"}`}
      />
      {isSearching && (
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 ${
            isHebrew ? "left-10" : "right-10"
          }`}
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#122347] dark:border-[#D29D0E]" />
        </div>
      )}
      {searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSearch}
          className={`absolute top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
            isHebrew ? "left-1" : "right-1"
          }`}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
