
  
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useFullscreen } from '@/hooks/full-screen';
import { Label, Pie, PieChart, ResponsiveContainer, LabelList, Cell } from "recharts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatNumber, renderActiveShape, noDataFound } from "@/lib/utils";
import { DonutChartSkeleton } from "./ChartSkeletons";
import ChartHeader from './ChartHeader';
 
interface DonutChartProps {
  chartData?: { label?: string;[key: string]: string | number | undefined }[];
  dataKey: string;  // Dynamic key for chart data
  nameKey?: string;  // Dynamic key for name
  chartConfig?: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  displayMode?: "percentage" | "value" | "both";
  exportKey?: string;
  innerRadiusProp?: number;
  outerRadiusProp?: number;
  frequencyShow?: boolean;
  frequencyOptions?: string[];
  selectedFrequency?: string;
  handleFrequencyChange?: (value: string) => void;
  frequencyPlaceholder?: string;
  // Filter options - supports radio, single-select, and multi-select
  filterType?: "radio" | "single-select" | "multi-select";
  filterOptions?: { value: string; label: string }[];
  selectedFilterValue?: string | string[]; // string for radio/single-select, string[] for multi-select
  handleFilterChange?: (value: string | string[]) => void;
  filterPlaceholder?: string;
  filterClassName?: string;
  // Legacy props for backward compatibility
  marginTop?: string;
  isdonut?: boolean;
  isLoading?: boolean;
  handleExport?: () => void;
  onExpand?: () => void;
  onExport?: (s: string, title: string, index: number) => void;
  visitEventOptions?: { value: string; label: string }[];
  handleTypeChange?: (value: string) => void;
  selectedType?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  isSelect?: boolean;
  isRadioButton?: boolean;
  selectoptions?: string[];
  placeholder?: string;
  isPercentageValue?: boolean;
  isLabelist?: boolean;
  direction?: string;
  totalV?: number;
  position?: string;
  contentHeight?: number | string;
  cardHeight?: number | string;
  isPercentage?: boolean;
  istotalvistors?: boolean;
  handleExportCsv?: () => void;
  handleExportPng?: (title: string, key: string) => void;
  handleExpand?: () => void;
  onSegmentClick?: (data: any) => void;
  donutHeight?: number | string;
  radii?: {
    default?: { inner: number; outer: number };
    mobile?: { inner: number; outer: number };
    tablet?: { inner: number; outer: number };
    laptop?: { inner: number; outer: number };
    laptopL?: { inner: number; outer: number };  // ← Add this
  };
 
  expandedRadii?: {
    default?: { inner: number; outer: number };
    mobile?: { inner: number; outer: number };
    tablet?: { inner: number; outer: number };
    laptop?: { inner: number; outer: number };
    laptopL?: { inner: number; outer: number };  // ← Add this
  };
  showHeader?: boolean;
  showExport?: boolean;
  className?: string;
  chartMargins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  legendClickable?: boolean;
}
 
const DonutChart = ({
  chartData = [],
  chartConfig,
  showExport = true,
  title,
  titleIcon,
  displayMode = "percentage",
  className = "",
  dataKey,
  nameKey,
  totalV = 200500,
  frequencyShow = true,
  frequencyOptions = [],
  selectedFrequency = "",
  handleFrequencyChange,
  frequencyPlaceholder = "",
  filterType,
  filterOptions = [],
  selectedFilterValue,
  handleFilterChange,
  filterPlaceholder = "Select...",
  filterClassName = "w-[120px] h-[30px]",
  isPercentageValue = true,
  isLabelist = false,
  direction = "flex-col",
  isLoading = false,
  marginTop,
  donutHeight = "14rem",
  position,
  exportKey = "",
  isPercentage,
  istotalvistors = true,
  cardHeight = "17.6875rem",
  contentHeight = "14.375rem",
  handleExportCsv,
  handleExportPng,
  handleExpand,
 
  onSegmentClick,
  showHeader = true,
  chartMargins = { top: 0, right: 0, left: 0, bottom: 0 },
  radii = {
    default: { inner: 55, outer: 60 },
    mobile: { inner: 45, outer: 55 },
    tablet: { inner: 35, outer: 65 },
    laptop: { inner: 63, outer: 80 },
    laptopL: { inner: 70, outer: 90 },
  },
  expandedRadii = {
    mobile: { inner: 35, outer: 70 },
    tablet: { inner: 35, outer: 70 },
    laptop: { inner: 90, outer: 150 },
    laptopL: { inner: 80, outer: 140 },
  },
  legendClickable = false,
 
}: DonutChartProps) => {
  
 
  const isFullscreen = useFullscreen();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeLegendIndex, setActiveLegendIndex] = useState<number | null>(null);
 
 
  const formatVisitors = useMemo(() => (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  }, []);
  const getBreakpoint = (width: number) => {
    if (width < 640) return "mobile";
    if (width >= 640 && width < 1024) return "tablet";
    if (width >= 1024 && width < 1440) return "laptop";
    return "laptopL";
  };
 
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440
  );
 
  useEffect(() => {
    if (typeof window === "undefined") return;
 
    const handleResize = () => setWindowWidth(window.innerWidth);
 
    window.addEventListener("resize", handleResize);
    handleResize();
 
    return () => window.removeEventListener("resize", handleResize);
  }, []);  

const breakpoint = getBreakpoint(windowWidth);

const currentRadii = isFullscreen
  ? expandedRadii[breakpoint]
  : (radii[breakpoint] ?? radii.default);
 
 
  const chartHeight = useMemo(() => {
    if (isFullscreen && typeof window !== "undefined") {
      // In fullscreen, use a larger height based on viewport
      return Math.min(window.innerHeight * 0.6, 600);
    }
    return typeof donutHeight === "number"
      ? donutHeight
      : typeof donutHeight === "string"
        ? donutHeight.endsWith("rem")
          ? Number.parseFloat(donutHeight) * 16
          : Number.parseFloat(donutHeight)
        : 180;
  }, [donutHeight, isFullscreen]);
 
  return (
    <Card
      className={`w-full shadow-md rounded-lg dark:bg-card ${isFullscreen ? 'h-screen' : ''} ${className}`}
      style={{
        height: isFullscreen
          ? '100vh'
          : typeof cardHeight === "number"
            ? `${cardHeight}px`
            : cardHeight,
      }}
    >
 
      {showHeader && (
 
        <ChartHeader
          title={title}
          titleIcon={titleIcon}
          showExport={showExport}
          handleExportCsv={handleExportCsv ? handleExportCsv : undefined}
          handleExportPng={handleExportPng ? handleExportPng : undefined}
          handleExpand={handleExpand ? handleExpand : undefined}
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
        className={`w-full p-0 pt-0 ${isFullscreen ? 'h-[calc(100vh-80px)]' : ''}`}
        style={{
          height: isFullscreen
            ? 'calc(100vh - 80px)' // Subtract header height
            : typeof contentHeight === "number"
              ? `${contentHeight}px`
              : contentHeight,
        }}
      >        {isLoading ? (
        <DonutChartSkeleton height={`${chartHeight}px`} />
      ) : !chartData || chartData.length === 0 ? (
        <div style={{ height: chartHeight }}>
          {noDataFound()}
        </div>
      ) : (
        
  <div className={`grid grid-cols-2 ${isFullscreen ? 'h-full min-h-full' : 'h-full'}`}>


          <div className="h-full w-full flex justify-center items-center">
            {chartConfig ? (
              <ChartContainer
                config={chartConfig}
                className="relative w-full p-0"
                style={{ height: chartHeight }}
 
              >
                <div style={{ width: "100%", height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      margin={chartMargins}
                    >
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel isPercentage={isPercentage} isFullscreen={isFullscreen} />}
                      />
                      <Pie
                        data={chartData}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        innerRadius={currentRadii?.inner}
                        outerRadius={currentRadii?.outer}
                        cornerRadius={4}
                        paddingAngle={2}  
                        stroke="none" 
                        fill="#8884d8"
                        {...(onSegmentClick
                          ? {
                            activeIndex: activeIndex ?? undefined,
                            activeShape: renderActiveShape,
                            onClick: (data: any, index: number) => {
                              setActiveIndex(activeIndex === index ? null : index);
                              onSegmentClick?.(data);
                            },
                          }
                          : {})}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill as string || chartConfig[entry.label || '']?.color}
                            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
                          />
                        ))}
                        {isLabelist && (
                          <LabelList
                            dataKey={dataKey}
                            position="inside"
                            style={{
                              fontSize: '8px',
                              fill: '#fff',
                              fontWeight: 'bold'
                            }}
                            stroke="none"
                            formatter={(value: number) => `${value}%`}
                          />
                        )}
                        {istotalvistors && (
                          <Label
                            key={totalV}
                            content={({ viewBox }) => {
                              const displayedVisitors = totalV ?? 0;
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                if (displayedVisitors > 0) {
                                  return (
                                    <text
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      textAnchor="middle"
                                      dominantBaseline="middle"
                                    >
                                      <tspan
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        className="fill-foreground lg:text-subBody  xl:text-body md:text-text-body font-bold sm:text-body"
                                        style={{ fontSize: isFullscreen ? '12rem' : '' }}
                                      >
                                        {formatNumber(displayedVisitors)}
                                      </tspan>
                                    </text>
                                  );
                                }
                                return null;
                              }
                              return null;
                            }}
                          />
                        )}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <span className="text-body">No chart configuration available</span>
              </div>
            )}
          </div>
 
          {/* Legend Container */}{chartData.length > 0 && (
            <div className={`flex flex-col ${isFullscreen ? 'justify-center items-center' : 'justify-start'} sm:col-span-1 md:col-span-1 lg:col-span-1 sm:text-subBody border-none ${marginTop} ${isFullscreen ? 'h-full overflow-visible' : 'h-[230px] overflow-y-auto no-scrollbar'} w-full`}>
              <div className={`flex ${direction} md:${direction} sm:${direction} lg:flex-col xl:flex-col ${isFullscreen ? 'mt-0 gap-4' : 'mt-6'} ${position}`}>
                {chartData.length > 0 && chartData?.map((item, index) => {
                  // Dynamically pick label and value using props (with fallback)
                  const label = String(item[nameKey || ""] ?? item.label ?? "");
                  const value = item[dataKey || ""] ?? item.value ?? 0;
                  const isActive = activeLegendIndex === index;
 
                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-2 px-1 py-1 cursor-pointer  transition-all ${isActive ? "bg-gray-100 dark:bg-gray-700 rounded-lg scale-105" : ""
                        } ${isFullscreen ? "p-3 text-subHeader" : "text-subBody"}`}
                      onClick={() => {
                        if (legendClickable) {
                          setActiveLegendIndex(activeLegendIndex === index ? null : index);
                          setActiveIndex(activeIndex === index ? null : index);
                          onSegmentClick?.(item);
 
                        }
                      }}
                    >
                      <span
                        className={`inline-block rounded-full ${isFullscreen ? "w-4 h-4" : "w-3 h-3"}`}
                        style={{ backgroundColor: item?.fill as string || chartConfig?.[label]?.color }}
                      />
                      <p className={`${isFullscreen ? "text-subHeader" : "text-subBody"}`}>
                        {label.charAt(0).toUpperCase() + label.slice(1)}:
                        <span className="px-2">
                          {displayMode === "percentage" && `${value}%`}
                          {displayMode === "value" && (value.toLocaleString("en-US"))}
                          {displayMode === "both" &&
                            `${(value.toLocaleString("en-US"))} (${item?.percentage ?? value})`}
                        </span>
                      </p>
                    </div>
                  );
                })}
 
              </div>
            </div>
          )}
        </div>
      )}
      </CardContent>
 
    </Card>
  );
};
 
export default DonutChart;
 
 