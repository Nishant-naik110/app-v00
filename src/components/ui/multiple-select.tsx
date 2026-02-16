"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";

interface MultipleSelectProps {
  options: string[];
  selectedValues: string[];
  onSelectionChange: (selectedValues: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  onApply?: (selectedValues: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const MultipleSelect = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options",
  label,
  disabled = false,
  className = "",
  onApply,
  searchable = true,
  searchPlaceholder = "Search options...",
}:MultipleSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>(selectedValues);
  const [searchTerm, setSearchTerm] = useState("");

  // Update temp values when selectedValues prop changes
  React.useEffect(() => {
    setTempSelectedValues(selectedValues);
  }, [selectedValues]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (value: string) => {
    const newSelectedValues = tempSelectedValues.includes(value)
      ? tempSelectedValues.filter((v) => v !== value)
      : [...tempSelectedValues, value];
    setTempSelectedValues(newSelectedValues);
  };

  const handleSelectAll = () => {
    // Select all filtered options
    const newSelectedValues = [...tempSelectedValues];
    filteredOptions.forEach(option => {
      if (!newSelectedValues.includes(option)) {
        newSelectedValues.push(option);
      }
    });
    setTempSelectedValues(newSelectedValues);
  };

  const handleClearAll = () => {
    setTempSelectedValues([]);
  };

  const handleApply = () => {
    onSelectionChange(tempSelectedValues);
    if (onApply) {
      onApply(tempSelectedValues);
    }
    setIsOpen(false);
    setSearchTerm(""); // Clear search when applying
  };

  const handleCancel = () => {
    setTempSelectedValues(selectedValues);
    setIsOpen(false);
    setSearchTerm(""); // Clear search when canceling
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    if (selectedValues.length === options.length) {
      return "All";
    }
    if (selectedValues.length === 1) {
      return selectedValues[0];
    }
    return `${selectedValues.length} Selected`;
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-subBody font-medium mb-1 block">{label}</label>
      )}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-between w-full h-10 px-3 py-2 text-subBody border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            disabled={disabled}
          >
            <span className="truncate text-left">{getDisplayText()}</span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-0">
          {/* Fixed Header */}
          <div className="p-2 border-b bg-background sticky top-0 z-10">
            {searchable && (
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-subBody"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSelectAll}
                className="flex-1"
                size="sm"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="flex-1"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Scrollable Options Area */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-subBody text-muted-foreground">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className="flex items-center px-2 py-1.5 hover:bg-accent cursor-pointer"
                  onClick={() => handleToggle(option)}
                >
                  <Checkbox
                    checked={tempSelectedValues.includes(option)}
                    className="mr-2 pointer-events-none"
                  />
                  <span className="text-subBody">{option}</span>
                </div>
              ))
            )}
          </div>

          {/* Fixed Footer */}
          <div className="p-2 border-t bg-background sticky bottom-0 z-10">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleApply}
                className="flex-1"
                // disabled={tempSelectedValues.length === 0}
              >
                Apply ({tempSelectedValues.length})
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MultipleSelect; 