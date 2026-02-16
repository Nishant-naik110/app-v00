"use client";
import React from "react";
import { useFullscreen } from '@/hooks/full-screen';

import { AreaChartSkeleton } from "./ChartSkeletons";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ChartHeader from "./ChartHeader";
import {
  CustomLegendContent,
  ChartAnimations,
  CustomXAxisTick,
  formatNumber,
  noDataFound,
} from "@/lib/utils";

export const description = "An area chart with gradient fill";
interface chartData {
  label?: string;
  [key: string]: string | number | undefined;
}

interface chartconfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

interface AreagradientChart {
  chartData?: chartData[];
  chartConfig?: chartconfig;
  XaxisLine?: boolean;
  Xdatakey?: string;
  isSelect?: boolean;
  handleExportCsv?: () => void;
  handleExportPng?: (title: string, key: string) => void;
  handleExpand?: () => void;
  title?: string;
  titleIcon?: React.ReactNode;
  showHeader?: boolean;
  showExport?: boolean;
  frequencyShow?: boolean;
  frequencyOptions?: string[];
  selectedFrequency?: string;
  handleFrequencyChange?: (value: string) => void;
  frequencyPlaceholder?: string;
  filterType?: "radio" | "single-select" | "multi-select";
  filterOptions?: { value: string; label: string }[];
  selectedFilterValue?: string | string[];
  handleFilterChange?: (value: string | string[]) => void;
  filterPlaceholder?: string;
  filterClassName?: string;
  animationDuration?: number;
  animationBegin?: number;
  showTickLineX?: boolean;
  showTickLineY?: boolean;
  YaxisLine?: boolean;
  isLoading?: boolean;
  exportKey?: string;
  height?: number | string;
  className?: string;
  contentHeight?: number | string;
  chartMargins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  cardHeight?: number | string;
  cartesianGridColor?: string;
  cartesianGridHorizontal?: boolean;
  cartesianGridVertical?: boolean;
  cartesianGridStrokeDasharray?: string;
  XAxisHeight?: number;
  tickMarginX?: number;
  tickMarginY?: number;
  isLegend?: boolean;
  legendPosition?: "top" | "bottom";
}

const ChartAreaGradient = ({
  chartData = [],
  handleExportCsv,
  handleExportPng,
  handleExpand,
  XAxisHeight = 60,
  showTickLineX = true,
  showTickLineY = true,
  YaxisLine = true,
  showHeader = true,
  showExport = true,
  frequencyShow = true,
  chartConfig,
  Xdatakey = "month",
  animationDuration = 600,
  titleIcon,
  animationBegin = 200,
  XaxisLine = true,
  title,
  isLoading = false,
  exportKey = "",
  height = "11rem",
  chartMargins = { top: 10, right: 40, left: -10, bottom: -20 },
  className = "",
  contentHeight = "11rem",
  cardHeight = "",
  filterType,
  filterOptions = [],
  selectedFilterValue,
  handleFilterChange,
  filterPlaceholder,
  filterClassName,
  frequencyOptions = [],
  selectedFrequency,
  handleFrequencyChange,
  cartesianGridColor = "grey",
  cartesianGridHorizontal = true,
  cartesianGridVertical = false,
  cartesianGridStrokeDasharray = "2 2",
  frequencyPlaceholder,
  tickMarginX = 10,
  tickMarginY = 10,
  isLegend = true,
  legendPosition = "bottom",
}: AreagradientChart) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isFullscreen = useFullscreen();
  const chartHeight = React.useMemo(() => {
    if (isFullscreen && typeof window !== "undefined") {
      // In fullscreen, use a larger height based on viewport
      return Math.min(window.innerHeight * 0.6, 600);
    }
    return typeof height === "number"
      ? height
      : typeof height === "string"
        ? height.endsWith("rem")
          ? Number.parseFloat(height) * 17
          : Number.parseFloat(height)
        : 200;
  }, [height, isFullscreen]);

  const barWidth = 100;
  // Safely handle cases where chartData might be undefined or empty
  const chartWidth = (chartData?.length ?? 0) * barWidth;

  const labels = Object.values(chartConfig || {})
    .map((config) => config?.label)
    .filter((label): label is string => Boolean(label));
  const colors = Object.values(chartConfig || {}).map(
    (config) => config?.color || "#3b82f6"
  );

  return (
    <Card
      ref={cardRef}
      className={`w-full h-full shadow-md rounded-lg dark:bg-card ${isFullscreen ? 'h-screen' : ''} ${className}`}
      style={{
        height: isFullscreen
          ? '100vh'
          : typeof cardHeight === "number" ? `${cardHeight}px` : cardHeight,
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
        className={`w-full px-2 ${isFullscreen ? 'h-[calc(100vh-80px)]' : ''}`}
        style={{
          height: isFullscreen
            ? 'calc(100vh - 80px)'
            : typeof chartHeight === "number"
              ? `${chartHeight}px`
              : chartHeight,
        }}
      >
        {isLoading ? (

          <AreaChartSkeleton height={`${chartHeight}px`} />

        ) : !chartData || chartData.length === 0 ? (
          <div style={{ height: chartHeight }}>
            {noDataFound()}
          </div>
        ) : (
          <>
            {chartData?.length > 0 &&
              isLegend &&
              legendPosition === "top" && (
                <div className="w-full mb-4 flex-shrink-0">
                  <CustomLegendContent labels={labels} colors={colors} />
                </div>
              )}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="w-full">

                <ChartAnimations />

                <ChartContainer
                  config={chartConfig || {}}
                  className="relative w-full p-0"
                  style={{ height: chartHeight }}
                >
                  <div
                    style={chartWidth ? { minWidth: `${chartWidth}px` } : { width: "100%" }}
                  >
                    <ResponsiveContainer width="100%" height={chartHeight}>
                      <AreaChart
                        data={chartData}
                        margin={chartMargins}
                        height={chartHeight}
                        width={chartWidth || 800}
                      >
                        <CartesianGrid
                          vertical={cartesianGridVertical}
                          horizontal={cartesianGridHorizontal}
                          stroke={cartesianGridColor}
                          strokeDasharray={cartesianGridStrokeDasharray}
                        />

                        <XAxis
                          dataKey={Xdatakey}
                          tickLine={showTickLineX}
                          axisLine={XaxisLine}
                          tickMargin={tickMarginX}
                          height={XAxisHeight}
                          interval={0}
                          angle={0}
                          textAnchor="end"
                          style={{ fontSize: "12px" }}
                          tick={<CustomXAxisTick />}
                        />
                        <YAxis
                          tickLine={showTickLineY}
                          axisLine={YaxisLine}
                          tickMargin={tickMarginY}
                          tickCount={5}
                          style={{ fontSize: "12px" }}
                          domain={[0, "dataMax + 100"]}
                          tickFormatter={(value: number) => formatNumber(value)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />

                        <defs>
                          {chartConfig &&
                            Object.entries(chartConfig).map(([key, config]) => (
                              <linearGradient
                                key={key}
                                id={`fill${key}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={config?.color || "#3b82f6"}
                                  stopOpacity={0.85}
                                />
                                <stop
                                  offset="40%"
                                  stopColor={config?.color || "#3b82f6"}
                                  stopOpacity={0.5}
                                />
                                <stop
                                  offset="75%"
                                  stopColor={config?.color || "#3b82f6"}
                                  stopOpacity={0.15}
                                />
                                <stop
                                  offset="100%"
                                  stopColor={config?.color || "#3b82f6"}
                                  stopOpacity={0}
                                />
                              </linearGradient>

                            ))}
                        </defs>

                        {chartConfig &&
                          Object.entries(chartConfig).map(([key, config]) => (
                            <Area
                              key={key}
                              dataKey={key}
                              type="monotone"
                              fill={`url(#fill${key})`}
                              fillOpacity={0.7}
                              stroke={config?.color || "#054f23ff"}
                              strokeWidth={2}
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              stackId="a"
                              isAnimationActive
                              animationBegin={animationBegin}
                              animationDuration={animationDuration}
                              animationEasing="ease-out"
                            />
                          ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </div>
              <ScrollBar orientation="horizontal" className="mb-2"></ScrollBar>
            </ScrollArea>


            {chartData?.length > 0 &&
              isLegend &&
              legendPosition === "bottom" && (
                <div className="w-full  overflow-x-auto overflow-y-hidden mt-[-10px] mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="flex gap-4 justify-center items-center min-w-max">
                    <CustomLegendContent labels={labels} colors={colors} />
                  </div>
                </div>
              )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartAreaGradient;


