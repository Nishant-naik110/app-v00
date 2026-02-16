"use client";
 
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { RadioButtons } from "@/components/mf/RadioButton";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import { MultiSelect } from "@/components/ui/multi-select";
import { ChartMenuDropdown } from "./ChartMenuDropdown";
 
interface ChartHeaderProps {
  title?: string;
  titleIcon?: React.ReactNode;
 
  // Export
  showExport?: boolean;
  handleExportCsv?: () => void;
  handleExportPng?: (title: string, key: string) => void;
  handleExpand?: () => void;
  exportKey?: string;
 
  // Frequency
  frequencyShow?: boolean;
  frequencyOptions?: string[];
  selectedFrequency?: string;
  handleFrequencyChange?: (value: string) => void;
  frequencyPlaceholder?: string;
 
  // Generic Filter
  filterType?: "radio" | "single-select" | "multi-select";
  filterOptions?: { value: string; label: string }[];
  selectedFilterValue?: string | string[];
  handleFilterChange?: (v: string | string[]) => void;
  filterPlaceholder?: string;
  filterClassName?: string;
}
 
const ChartHeader = ({
  title = "",
  titleIcon,
  showExport = true,
  handleExportCsv,
  handleExportPng,
  handleExpand,
  exportKey = "",
  frequencyShow = true,
  frequencyOptions = [],
  selectedFrequency = "",
  handleFrequencyChange,
  frequencyPlaceholder = "Select",
  filterType,
  filterOptions = [],
  selectedFilterValue,
  handleFilterChange,
  filterPlaceholder = "Select...",
  filterClassName = "w-[120px] h-[30px]",
}: ChartHeaderProps) => {
    const isLongTitle =  title?.length  > 30;

  return (
    <CardTitle className="p-2">
      <div className="flex  md:space-x-2 space-x-0 justify-between items-center md:gap-2 gap-1">
        
        {/* Title with Icon */}
        <div className="flex items-center md:gap-2 gap-1 text-body font-medium md:text-subHeader md:font-semibold">
          {titleIcon && <span className="flex-shrink-0 p-2 dark:text-white rounded-md">{titleIcon}</span>}
          {isLongTitle ? (
            <>
              {/* Truncated title for small devices */}
              <span className="text-body font-medium md:text-subHeader md:font-semibold md:hidden">
                {title.slice(0, 30) + '...'}
              </span>
              {/* Full title for larger devices */}
              <span className="hidden md:inline text-body font-medium md:text-subHeader md:font-semibold">
                {title}
              </span>
            </>
          ) : (
            <span className="text-body font-medium md:text-subHeader md:font-semibold">
              {title}
            </span>
          )}
        </div>
 
        {/* Controls */}
        <div className="flex  space-x-1 justify-between  items-center">
 
          {/* Generic Filter */}
          {filterType && (filterOptions?.length ?? 0) > 0 && (
            <>
              {filterType === "radio" && (
                <RadioButtons
                  options={filterOptions}
                  value={selectedFilterValue as string}
                  onValueChange={(value) => handleFilterChange?.(value)}
                />
              )}
 
              {filterType === "single-select" && (
                <MFSingleSelect
                  items={filterOptions.map((o) => ({
                    title: o.label,
                    value: o.value,
                  }))}
                  placeholder={filterPlaceholder}
                  className={filterClassName}
                  value={selectedFilterValue as string}
                  onValueChange={(value) => handleFilterChange?.(value)}
                />
              )}
 
              {filterType === "multi-select" && (
                <MultiSelect
                  options={filterOptions}
                  defaultValue={selectedFilterValue as string[]}
                  onValueChange={(values) => handleFilterChange?.(values)}
                  placeholder={filterPlaceholder}
                  className={filterClassName}
                  maxCount={2}
                />
              )}
            </>
          )}
 
          {/* Frequency Selector (Daily / Weekly / Monthly) */}
          {frequencyShow && (frequencyOptions?.length ?? 0) > 0 && (
            <MFSingleSelect
              items={frequencyOptions.map((v) => ({ title: v, value: v }))}
              placeholder={frequencyPlaceholder}
              className="w-[90px] h-[30px] text-subBody"
              value={selectedFrequency}
              onValueChange={handleFrequencyChange}
            />
          )}
 
          {/* Export Menu */}
          {showExport && (
            <ChartMenuDropdown
              handleExportCsv={handleExportCsv}
              handleExportPng={handleExportPng}
              handleExpand={handleExpand}
              title={title}
              exportKey={exportKey}
            />
          )}
 
        </div>
      </div>
    </CardTitle>
  );
};
 
export default ChartHeader;