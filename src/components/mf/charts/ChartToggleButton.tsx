"use client";

import React from 'react';
import { cn } from "@/lib/utils";

export interface ChartToggleOption {
  label: string;
  value: string;
}

interface ChartToggleButtonProps {
  options: ChartToggleOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ChartToggleButton = ({
  options,
  selectedValue,
  onChange,
  className,
}: ChartToggleButtonProps) => {
  const selectedIndex = options.findIndex(opt => opt.value === selectedValue);
  const buttonCount = options.length;
  // Ensure selectedIndex is valid, default to 0 if not found
  const validSelectedIndex = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <div
      className={cn(
        "relative inline-flex items-center h-[30px] bg-background/50 dark:bg-card/50 border border-border/30 rounded-md p-0.5 transition-all duration-200",
        className
      )}
    >
      {/* Sliding background indicator */}
      {selectedIndex >= 0 && (
        <div
          className="absolute top-0.5 bottom-0.5 bg-primary rounded-md shadow-sm shadow-primary/30 transition-all duration-300 ease-out"
          style={{
            width: `calc((100% - 4px) / ${buttonCount})`,
            left: `calc(2px + ((100% - 4px) / ${buttonCount} * ${validSelectedIndex}))`,
          }}
        />
      )}
      
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex-1 h-full px-3 text-xs font-medium transition-all duration-200 text-center rounded-md",
              isSelected
                ? "text-white font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            )}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

