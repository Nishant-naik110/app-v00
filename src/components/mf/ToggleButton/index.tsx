import React from 'react';
import { cn } from "@/lib/utils";
 
export interface ToggleOption {
  label: string;
  value: string;
}
 
interface ToggleButtonProps {
  options: ToggleOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}
 
export const ToggleButton = ({
  options,
  selectedValue,
  onChange,
  className,
}:ToggleButtonProps) => {
  const selectedIndex = options.findIndex(opt => opt.value === selectedValue);
  const buttonCount = options.length;
 
  return (
    <div
      className={cn(
        "relative inline-flex items-center bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 dark:from-muted/30 dark:via-muted/20 dark:to-muted/30 border-2 border-border/30 rounded-xl backdrop-blur-sm shadow-inner",
        className
      )}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-xl opacity-50" />
      
      {/* Sliding background with enhanced design */}
      <div
        className="absolute top-1 bottom-1 bg-gradient-to-br from-primary via-primary to-secondary rounded-lg shadow-lg transition-all duration-500 ease-out"
        style={{
          width: `calc((100% - 8px) / ${buttonCount})`,
          left: `calc(4px + ((100% - 8px) / ${buttonCount} * ${selectedIndex}))`,
          boxShadow: '0 4px 12px rgba(130, 13, 118, 0.4), 0 0 20px rgba(130, 13, 118, 0.2)',
        }}
      />
      
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex-1 px-4 py-1.5 text-subBody font-bold transition-all duration-300",
              "hover:scale-105 text-center rounded-lg whitespace-nowrap",
              isSelected
                ? "text-white drop-shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minWidth: 0,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
 
 
 