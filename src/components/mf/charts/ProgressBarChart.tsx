"use client";

import React, { useState, useMemo } from "react";
import { useFullscreen } from '@/hooks/full-screen';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ProgressBarChartSkeleton } from "./ChartSkeletons";
import { ChartMenuDropdown } from "./ChartMenuDropdown";
import { noDataFound, formatInternationalNumber } from "@/lib/utils";
import { RadioButtons } from "@/components/mf/RadioButton";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import ChartHeader from "./ChartHeader";

interface ProgressBarChartItem {
  label: string;
  visit?: number;
  percentage: string;
  fill?: string;
  count?: number;
  icon?: string;
  color?: string;
}

interface ProgressBarChartProps {
  chartData?: ProgressBarChartItem[];
  title?: string;
  titleIcon?: React.ReactNode;
  handleExportCsv?: () => void;
  handleExportPng?: (title: string, key: string) => void;
  handleExpand?: () => void;
  exportKey?: string;
  isLoading?: boolean;
  height?: number | string;
  cardHeight?: number | string;
  className?: string;
  contentHeight?: number | string;
  showHeader?: boolean;
  showExport?: boolean;
  filterType?: "radio" | "single-select" | "multi-select";
  filterOptions?: { value: string; label: string }[];
  selectedFilterValue?: string | string[];
  handleFilterChange?: (value: string | string[]) => void;
  filterPlaceholder?: string;
  filterClassName?: string;
  frequencyShow?: boolean;
  frequencyOptions?: string[];
  selectedFrequency?: string;
  handleFrequencyChange?: (value: string) => void;
  frequencyPlaceholder?: string;
  gap?: number | string;
  maxVisibleCount?: number;
  showTooltip?: boolean;
  tooltipPosition?: "top" | "right" | "bottom" | "left";
  // Icon size props
  iconWidth?: number | string;
  iconHeight?: number | string;
  // Click handler - sends clicked data to parent
  onDataClick?: (data: ProgressBarChartItem, index: number, dataKey: string) => void;
  progressBarHeight?: number | string;
}

export default function ProgressBarChart({
  chartData,
  title,
  titleIcon,
  handleExportCsv,
  handleExportPng,
  handleExpand,
  exportKey = "",
  isLoading,
  height = 260,
  cardHeight,
  className = "",
  contentHeight = "320px",
  showHeader = true,
  showExport = true,
  // Filter props
  filterType,
  filterOptions = [],
  selectedFilterValue,
  handleFilterChange,
  filterPlaceholder = "Select...",
  filterClassName = "w-[120px] h-[30px]",
  frequencyShow,
  frequencyOptions = [],
  selectedFrequency,
  handleFrequencyChange,
  frequencyPlaceholder = "",
  gap = 4,
  maxVisibleCount = 4,
  showTooltip = true,
  tooltipPosition = "top",
  iconWidth = 4,
  iconHeight = 4,
  onDataClick,
  progressBarHeight = 2.5,
}: ProgressBarChartProps) {
  const progressData = Array.isArray(chartData) ? chartData : [];
  const isFullscreen = useFullscreen();
  const chartHeight = useMemo(() => {
    if (isFullscreen && typeof window !== "undefined") {
      // In fullscreen, use a larger height based on viewport
      return Math.min(window.innerHeight * 0.7, 800);
    }
    return typeof height === "string" ? Number.parseFloat(height) : height;
  }, [height, isFullscreen]);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // No animation: we just parse the percentage once when data changes
  const getPercentage = (percentage?: string) => {
    if (!percentage || typeof percentage !== "string") return 0;
    const value = Number.parseFloat(percentage.replace("%", ""));
    return isNaN(value) ? 0 : value;
  };

  // Check if all data has zero values
  const hasNoValidData = useMemo(() => {
    if (!progressData || progressData.length === 0) return true;
    
    return progressData.every((item) => {
      const count = item?.count ?? item?.visit ?? 0;
      // Parse percentage inline to avoid dependency issues
      let percentage = 0;
      if (item?.percentage && typeof item.percentage === "string") {
        const value = Number.parseFloat(item.percentage.replace("%", ""));
        percentage = isNaN(value) ? 0 : value;
      }
      return count === 0 && percentage === 0;
    });
  }, [progressData]);

  return (
    <Card
      className={`w-full shadow-md rounded-lg dark:bg-card ${isFullscreen ? 'h-screen' : ''} ${className}`}
      style={{
        height: isFullscreen 
          ? '100vh'
          : typeof cardHeight === "number"
            ? `${cardHeight}px`
            : cardHeight ||
              (contentHeight
                ? typeof contentHeight === "string"
                  ? contentHeight
                  : `${contentHeight}px`
                : undefined),
      }}
    >
      {showHeader && (
      <ChartHeader
      title={title}
      titleIcon={titleIcon}
      showExport={showExport}
      handleExportCsv={handleExportCsv}
      handleExportPng={handleExportPng}
      handleExpand={handleExpand}
      exportKey={exportKey}
      frequencyShow={frequencyShow}
      frequencyOptions={frequencyOptions}
      selectedFrequency={selectedFrequency}
      handleFrequencyChange={handleFrequencyChange}
      frequencyPlaceholder={frequencyPlaceholder}
      filterType={filterType}
      filterOptions={filterOptions}
      selectedFilterValue={selectedFilterValue}
      handleFilterChange={handleFilterChange}
      filterPlaceholder={filterPlaceholder}
      filterClassName={filterClassName}
    />
      )}

      <CardContent
        className={`w-full px-2 pb-2 ${
          progressData.length > maxVisibleCount
            ? "overflow-y-auto"
            : "overflow-y-visible"
        } scrollbar ${isFullscreen ? 'h-[calc(100vh-80px)]' : ''}`}
        style={{
          maxHeight: isFullscreen ? 'calc(100vh - 80px)' : `${chartHeight}px`,
          height: isFullscreen
            ? 'calc(100vh - 80px)' // Subtract header height
            : typeof contentHeight === "number"
              ? `${contentHeight}px`
              : contentHeight,
        }}
      >
        {isLoading ? (
          <ProgressBarChartSkeleton
            rows={4}
          />
        ) : progressData?.length === 0 || hasNoValidData ? (
          <>{noDataFound()}</>
        ) : (
          <ChartContainer
            config={{
              value: {
                label: "Percentage",
                color: "#3b82f6",
              },
            }}
            
            style={{
              height: typeof height === "string" ? height : `${height}px`,
              width: "100%",
            }}
          >
            <TooltipProvider>
              <div className={`flex flex-col scrollbar gap-${gap}`}>
                {progressData?.map((item, index) => {
                  const currentValue = getPercentage(item?.percentage);
                  const safePct = Number.isFinite(currentValue)
                    ? currentValue
                    : 0;
              
                  const glowColor = item?.fill || "#4f46e5";
                  const itemColor = item?.fill || item?.color || "#3b82f6";

                  const displayCount =
                    item?.count ??
                    (typeof item?.visit === "number" ? item.visit : undefined);

                  const progressBarItem = (
                    <div
                      onMouseEnter={() => setHoveredLabel(item?.label ?? null)}
                      onMouseLeave={() => setHoveredLabel(null)}
                      onClick={() => {
                        if (onDataClick) {
                          
                          onDataClick(item, index, "value");
                        }
                      }}
                      className={`cursor-pointer flex items-start gap-2 p-2 rounded-md  bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}
                    >
                      {/* First div: Icon / dot only */}
                      <div className="flex items-center justify-center flex-shrink-0 self-stretch">
                        {item?.icon ? (
                          <img
                            src={item.icon}
                            alt={item?.label || ""}
                            className={`w-${iconWidth} h-${iconHeight} object-contain`}
                          />
                        ) : (
                          <></>
                        )}
                      </div>

                      {/* Second div: Label + progress bar */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Label and value row */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-subBody font-medium text-gray-900 dark:text-white truncate">
                            {item?.label}
                          </h3>
                          <span className="text-subBody font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {displayCount !== undefined && displayCount !== null
                              ? `${formatInternationalNumber(displayCount)} - ${safePct.toFixed(2)}%`
                              : `${safePct.toFixed(2)}%`}
                          </span>
                        </div>
                        <Progress 
                          value={Math.max(0, Math.min(100, safePct))} 
                          className={`h-${progressBarHeight} bg-gray-200 dark:bg-gray-700`}
                          indicatorStyle={{
                            background: itemColor,
                            boxShadow: `0 0 10px ${glowColor}44`,
                          }}
                        />
                      </div>
                    </div>
                  );

                  // Create payload for ChartTooltipContent - matching StackedBarwithLine simplicity
                  const tooltipPayload = [
                    {
                      dataKey: "value",
                      name: "Percentage",
                      value: safePct,
                      color: itemColor,
                      payload: { fill: itemColor },
                    },
                  ];

                  // Simple label formatter matching StackedBarwithLine
                  const labelFormatter = (label: string) => (
                    <div className="text-subBody dark:text-white mb-1">
                      {label}
                    </div>
                  );
                  return (
                    <div key={item?.label}>
                      {showTooltip ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {progressBarItem}
                          </TooltipTrigger>
                          <TooltipContent
                            side={tooltipPosition}
                            align="start"
                            sideOffset={8}
                            className="p-0 border-0 bg-transparent shadow-none"
                          >
                            <ChartTooltipContent
                              active={true}
                              payload={tooltipPayload}
                              label={item?.label}
                              indicator="dot"
                              isPercentage={true}
                              labelFormatter={labelFormatter}
                              formatter={
                                displayCount !== undefined &&
                                displayCount !== null
                                  ? (
                                      value: any,
                                      name: any,
                                      item: any,
                                      index: number,
                                      payload: any
                                    ) => (
                                      <>
                                        <div
                                          className="shrink-0 rounded-[2px] h-2.5 w-2.5 border-[--color-border] bg-[--color-bg]"
                                          style={
                                            {
                                              "--color-bg": itemColor,
                                              "--color-border": itemColor,
                                            } as React.CSSProperties
                                          }
                                        />
                                        <span className="font-mono font-medium tabular-nums text-foreground text-subBody leading-none">
                                          {`${formatInternationalNumber(displayCount)} - ${safePct.toFixed(2)}%`}
                                        </span>
                                      </>
                                    )
                                  : undefined
                              }
                            />
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        progressBarItem
                      )}
                    </div>
                  );
                })}
              </div>
            </TooltipProvider>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
