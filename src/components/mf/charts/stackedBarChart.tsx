"use client";
import { useTheme } from "@/components/mf/theme-context";
import type React from "react";
import { forwardRef, useState, useMemo } from "react";
import { useFullscreen } from '@/hooks/full-screen';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from "recharts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InformationCard } from "../InformationCard";
import { StackedBarChartSkeleton } from "./ChartSkeletons";

import {
  CustomLegendContent,
  CustomXAxisTick,
  noDataFound,
  formatNumber,
  labelFormatter,
  ChartAnimations,
} from "@/lib/utils";

import ChartHeader from "./ChartHeader";

interface ChartBarStackedProps {
  // Export props
  handleExportCsv?: () => void;
  handleExportPng?: (title: string, key: string) => void;
  handleExpand?: () => void;
  exportKey?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  showHeader?: boolean;
  showExport?: boolean;
  frequencyShow?: boolean;
  frequencyOptions?: string[];
  selectedFrequency?: string;
  handleFrequencyChange?: (value: string) => void;
  frequencyPlaceholder?: string;
  frequencySelectClassName?: string; // For frequency/select dropdown className

  // Filter options - supports radio, single-select, and multi-select
  filterType?: "radio" | "single-select" | "multi-select";
  filterOptions?: { value: string; label: string }[];
  selectedFilterValue?: string | string[]; // string for radio/single-select, string[] for multi-select
  handleFilterChange?: (value: string | string[]) => void;
  filterPlaceholder?: string;
  filterClassName?: string;

  // Legacy props for backward compatibility
  isRadioButton?: boolean;
  radioOptions?: { value: string; label: string }[];
  selectedRadio?: string;
  visitEventOptions?: { value: string; label: string }[];
  handleTypeChange?: (value: string) => void;
  selectedType?: string;
  isSelect?: boolean;
  selectoptions?: string[];
  placeholder?: string;

  // Chart data and config
  chartData?: {
    label?: string;
    [key: string]: string | number | undefined;
  }[];
  chartConfig?: {
    [key: string]: {
      label?: string;
      color?: string;
    };
  };

  // Loading and display
  isLoading?: boolean;
  isLegend?: boolean;
  legendPosition?: "top" | "bottom";

  // Information card
  isInformCard?: boolean;
  InformCard?: { title: string; desc: string }[];

  // Chart dimensions
  barHeight?: number | string;
  cardHeight?: number | string;
  className?: string;
  contentHeight?: number | string;

  // Bar configuration
  barWidth?: number; // Width per data point for chart width calculation
  barSize?: number; // Individual bar width in pixels
  barGap?: number;
  barCategoryGap?: number;
  barRadius?: number; // Bar corner radius - simple number for all corners
  defaultBarColor?: string; // Default color for bars if not specified in chartConfig

  // Animation configuration
  animationDuration?: number; // Animation duration in ms for bars (default: 600)
  animationDelayPerPoint?: number; // Delay between each point appearing in ms (default: 120)

  // Hover effect props
  // hoverScale?: number; // Scale factor when bar is hovered (default: 1.12)
  // hoverBrightness?: number; // Brightness increase on hover (default: 1.15)
  // hoverSaturation?: number; // Saturation increase on hover (default: 1.1)

  // Chart margins
  chartMargins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };

  // Axis configuration
  showAxisLine?: boolean;
  showTickLine?: boolean;
  xAxisAngle?: number; // Angle for X-axis labels
  xAxis?: {
    dataKey: string;
    title?: string;
    tickFormatter?: (value: string | number) => string;
    isPercentage?: boolean;
    height?: number;
    minTickGap?: number;
    tickMargin?: number;
    interval?: number;
    textAnchor?: "start" | "middle" | "end";
  };
  yAxis?: {
    dataKey: string;
    title?: string;
    tickFormatter?: (value: string | number) => string;
    width?: number | { horizontal?: number; vertical?: number };
    tickMargin?: number;
    interval?: number;
    height?: number;
  };

  // Grid configuration
  isCartesian?: boolean;
  cartesianGridColor?: string;
  cartesianGridHorizontal?: boolean;
  cartesianGridVertical?: boolean;
  cartesianGridStrokeDasharray?: string;
  cartesianGridStrokeWidth?: number;

  // Chart type
  isHorizontal?: boolean;
  isPercentage?: boolean;
  AxisLabel?: string;
  yAxisXOffset?: number; // horizontal bar label spacing
  dy?: number; //horizontal bar label spacing

  // Display options
  showMenu?: boolean;
  heading?: string;

  // Click handler
  onDataClick?: (data: any, index: number, dataKey: string) => void;

  // Legacy export props (for backward compatibility)
  handleExport?: () => void;
  onExpand?: () => void;
  onExport?: (format: string, title: string, key: string) => void;
  textLimit?: number;
  xOffset?: number; // horizontal bar label spacing
}

const ChartBarStacked = forwardRef<HTMLDivElement, ChartBarStackedProps>(
  (
    {
      // Export props
      handleExportCsv,
      handleExportPng,
      handleExpand,
      exportKey = "",
      title = "",
      titleIcon,
      showHeader = true,
      showExport = true,
      yAxisXOffset = 0,
      xOffset = -15,

      // Frequency/Select props
      frequencyShow = true,
      frequencyOptions = [],
      selectedFrequency = "",
      handleFrequencyChange,
      frequencyPlaceholder = "",
      textLimit = 11,
      // Filter options
      filterType,
      filterOptions = [],
      selectedFilterValue,
      handleFilterChange,
      filterPlaceholder = "Select...",
      filterClassName = "w-[7.5rem] h-[1.875rem]",
      chartData = [],
      chartConfig = {},
      isLoading = false,
      isLegend = true,
      legendPosition = "bottom",
      isInformCard = false,
      InformCard = [],
      barHeight = 200,
      dy = 5,
      cardHeight,
      className = "",
      contentHeight = "320px",
      barWidth = 40,
      barSize = 60,
      barGap = 50,
      barCategoryGap = 20,
      barRadius = 8,
      animationDuration = 600,
      animationDelayPerPoint = 120,
      // hoverScale = 1,
      // hoverBrightness = 1,
      // hoverSaturation = 1,
      chartMargins = { top: 10, right: 0, left: 0, bottom: 10 },
      showAxisLine = true,
      showTickLine = true,
      xAxisAngle = 0,
      xAxis,
      yAxis,
      isCartesian = false,
      cartesianGridColor = "#555",
      cartesianGridHorizontal = true,
      cartesianGridVertical = false,
      cartesianGridStrokeDasharray = "2 2",
      cartesianGridStrokeWidth = 0.5,
      isHorizontal = false,
      isPercentage = false,
      onDataClick,
      defaultBarColor = "#3b82f6",
    },
    ref
  ) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const isFullscreen = useFullscreen();
    const { isDarkMode } = useTheme();

    const CATEGORY_ROW_HEIGHT = 40; // px per bar (adjust if needed)

    const chartHeight = useMemo(() => {
      if (isFullscreen && typeof window !== "undefined") {
        // In fullscreen, use a larger height based on viewport
        return Math.min(window.innerHeight * 0.6, 600);
      }
      return typeof barHeight === "number"
        ? barHeight
        : typeof barHeight === "string"
          ? barHeight.endsWith("rem")
            ? Number.parseFloat(barHeight) * 16
            : Number.parseFloat(barHeight)
          : barHeight;
    }, [barHeight, isFullscreen]);

    const computedChartHeight = isHorizontal
      ? chartHeight
      : Math.max(chartHeight as number, chartData.length * CATEGORY_ROW_HEIGHT);
    // Calculate chart width based on data length and barWidth prop
    const chartWidth = chartData.length * (barWidth + barGap);

    // Calculate X-axis domain and ticks for horizontal bars (isHorizontal = false)
    const calculateNiceTicks = (maxValue: number) => {
      if (maxValue === 0) return { ticks: [0], max: 0 };

      // Add 10% buffer to ensure bars don't touch the edge
      const bufferedMax = maxValue * 1.1;

      // Find the magnitude (power of 10)
      const magnitude = Math.pow(10, Math.floor(Math.log10(bufferedMax)));

      // Start with a smaller base value for more granular ticks
      let base = Math.max(magnitude / 10, 100);

      // Generate ticks by doubling
      const ticks = [0];
      let currentValue = base;

      // Continue until we exceed the buffered max value
      while (currentValue < bufferedMax) {
        ticks.push(currentValue);
        currentValue *= 2;
      }

      // Add one more tick to ensure we cover the max value with buffer
      ticks.push(currentValue);

      const roundedMax = currentValue;
      return { ticks, max: roundedMax };
    };

    const xAxisDomain = (() => {
      if (
        isHorizontal ||
        !chartData ||
        chartData.length === 0 ||
        !chartConfig
      ) {
        return undefined;
      }

      // Calculate max value for stacked bars
      const maxValue = Math.max(
        ...chartData.map((item) => {
          return Object.keys(chartConfig).reduce((sum, key) => {
            return sum + (Number(item[key]) || 0);
          }, 0);
        })
      );

      console.log("Max Value:", maxValue);
      const { max, ticks } = calculateNiceTicks(maxValue);
      console.log("Calculated Domain Max:", max);
      console.log("Calculated Ticks:", ticks);
      return [0, max];
    })();

    const xAxisTicks = (() => {
      if (
        isHorizontal ||
        !chartData ||
        chartData.length === 0 ||
        !chartConfig
      ) {
        return undefined;
      }

      // Calculate max value for stacked bars
      const maxValue = Math.max(
        ...chartData.map((item) => {
          return Object.keys(chartConfig).reduce((sum, key) => {
            return sum + (Number(item[key]) || 0);
          }, 0);
        })
      );

      const { ticks } = calculateNiceTicks(maxValue);
      return ticks;
    })();

    // Use handleExpand from new prop or legacy prop
    const expandHandler = handleExpand;
    const labels = Object.values(chartConfig || {})
      .map((config) => config?.label)
      .filter((label): label is string => Boolean(label));
    const colors = Object.values(chartConfig || {}).map(
      (config) => config?.color || "#3b82f6"
    );

    return (
      <Card
        ref={ref}
        className={`w-full shadow-md rounded-lg dark:bg-card ${isFullscreen ? 'h-screen' : ''} ${className} `}
        style={
          isFullscreen
            ? { height: '100vh' }
            : cardHeight
              ? {
                height:
                  typeof cardHeight === "string"
                    ? cardHeight
                    : `${cardHeight}px`,
              }
              : {}
        }
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

        {isInformCard && (
          <div className="flex-1 px-4 flex flex-row">
            {InformCard?.map((item, index) => (
              <InformationCard
                key={index}
                InformTitle={item?.title || ""}
                informDescription={item?.desc || ""}
              />
            ))}
          </div>
        )}

        <CardContent
          className={`w-full ${isFullscreen ? 'h-[calc(100vh-80px)]' : ''}`}
          style={{
            height: isFullscreen
              ? 'calc(100vh - 80px)' // Subtract header height
              : typeof chartHeight === "number"
                ? `${chartHeight}px`
                : chartHeight,
          }}
        >
          {isLoading ? (
            <div className="w-full">
              <StackedBarChartSkeleton />
            </div>
          ) : (
            <>
              {/* Legend at top if specified */}
              {chartData?.length > 0 &&
                isLegend &&
                legendPosition === "top" && (
                  <div className="w-full mb-4 flex-shrink-0">
                    <CustomLegendContent labels={labels} colors={colors} />
                  </div>
                )}

              {/* Chart container */}
              <ScrollArea className="w-full whitespace-nowrap">
                <div
                  className={`w-full ${isHorizontal
                    ? ""
                    : ""
                    } [`}
                >
                  <ChartAnimations />
                  <ChartContainer
                    config={chartConfig || {}}
                    className="relative w-full p-0 "
                    style={{ height: chartHeight }}
                  >
                    <div
                      style={
                        chartWidth
                          ? { minWidth: `${chartWidth}px` }
                          : { width: "100%" }
                      }
                    >
                      <ResponsiveContainer
                        height={isHorizontal ? chartHeight : computedChartHeight}
                        width="100%"
                      >
                        {chartData?.length > 0 ? (
                          <BarChart
                            data={chartData}
                            layout={isHorizontal ? "horizontal" : "vertical"}
                            margin={chartMargins}
                            barSize={isFullscreen ? 56 : 44}
                            barGap={8}
                            barCategoryGap="10%"
                          >
                            {isCartesian && (
                              <CartesianGrid
                                strokeDasharray={cartesianGridStrokeDasharray}
                                stroke={cartesianGridColor}
                                strokeWidth={cartesianGridStrokeWidth}
                                horizontal={cartesianGridHorizontal}
                                vertical={cartesianGridVertical}
                              />
                            )}
                            <XAxis
                              className="text-subBody"
                              dataKey={
                                isHorizontal ? yAxis?.dataKey : xAxis?.dataKey
                              }
                              type={isHorizontal ? "category" : "number"}
                              tickLine={showTickLine}
                              axisLine={showAxisLine}
                              interval={0}
                              angle={isHorizontal ? xAxisAngle : 0}
                              textAnchor={
                                isHorizontal
                                  ? xAxis?.textAnchor || "middle"
                                  : "end"
                              }
                              height={isHorizontal ? (xAxis?.height ?? 60) : 60}
                              minTickGap={
                                isHorizontal ? (xAxis?.minTickGap ?? 5) : 0
                              }
                              tickMargin={xAxis?.tickMargin ?? 10}
                              domain={!isHorizontal ? xAxisDomain : undefined}
                              ticks={!isHorizontal ? xAxisTicks : undefined}
                              tick={
                                isHorizontal
                                  ? (props) => (
                                    <CustomXAxisTick
                                      {...props}
                                      angle={xAxisAngle}
                                      textlimit={textLimit}
                                    />
                                  )
                                  : undefined
                              }
                              tickFormatter={
                                !isHorizontal
                                  ? (value: number) =>
                                    isPercentage
                                      ? `${value}%`
                                      : formatNumber(value)
                                  : undefined
                              }
                            />

                            {yAxis && (
                              <YAxis
                                className="text-subBody"
                                dataKey={
                                  isHorizontal ? undefined : yAxis?.dataKey
                                }
                                type={isHorizontal ? "number" : "category"}
                                tickLine={showTickLine}
                                axisLine={showAxisLine}
                                width={
                                  typeof yAxis.width === "number"
                                    ? yAxis.width
                                    : typeof yAxis.width === "object"
                                      ? isHorizontal
                                        ? (yAxis.width.horizontal ?? 60)
                                        : (yAxis.width.vertical ?? 120)
                                      : isHorizontal
                                        ? 60
                                        : 120
                                }
                                tickMargin={yAxis?.tickMargin ?? 12}
                                interval={yAxis?.interval ?? 0}
                                height={
                                  yAxis?.height ??
                                  (typeof chartHeight === "number"
                                    ? chartHeight
                                    : Number.parseFloat(String(chartHeight)))
                                }
                                tickFormatter={(value: number) => {
                                  if (yAxis?.tickFormatter) {
                                    return yAxis.tickFormatter(value);
                                  }
                                  if (isPercentage) {
                                    return `${value}%`;
                                  }
                                  return formatNumber(value);
                                }}
                                tick={(props) => (
                                  <CustomXAxisTick
                                    {...props}
                                    textlimit={textLimit}
                                    textAnchor={isHorizontal ? "end" : "start"}
                                    yAxisXOffset={yAxisXOffset}
                                    xOffset={xOffset}
                                    dy={dy}
                                  />
                                )}
                              ></YAxis>
                            )}

                            <ChartTooltip
                            cursor={false}
                              content={
                                <ChartTooltipContent
                                  isPercentage={isPercentage}
                                  labelFormatter={labelFormatter}
                                />
                              }
                            />

                            {/* Chart Bars */}
                            {chartConfig &&
                              Object.keys(chartConfig).map((key, index) => {
                                const barKeys = Object.keys(chartConfig);
                                const totalBars = barKeys.length;
                                const isTopBar = index === totalBars - 1; // Last bar is the top bar

                                const getStackedBarShape = (stackIndex: number) => {
                                  return (props: any) => {
                                    const { x, y, width, height, fill } = props;

                                    const GAP = 1;    
                                    const RADIUS = 4;

                                    const isBottomStack = stackIndex === 0;

                                    return (
                                      <rect
                                        x={x}
                                        y={isBottomStack ? y : y - GAP}            
                                        width={width}
                                        height={isBottomStack ? height : height - GAP} 
                                        fill={fill}
                                        rx={RADIUS}
                                        ry={RADIUS}
                                      />
                                    );
                                  };
                                };

                                return (
                                  <Bar
                                    key={key}
                                    dataKey={key}
                                    stackId="a"
                                    fill={chartConfig?.[key]?.color || defaultBarColor}
                                    shape={getStackedBarShape(index)}   
                                    background={
                                      index === 0
                                        ? { fill: isDarkMode ? "#374151" : "#F1F1F1",
                                          radius:4
                                         } 
                                        : undefined
                                    }
                                    isAnimationActive
                                    animationDuration={animationDuration}
                                  />

                                );
                              })}
                          </BarChart>
                        ) : (
                          <>{noDataFound()}</>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </ChartContainer>
                </div>
                <ScrollBar orientation="horizontal" className="mb-2"></ScrollBar>
              </ScrollArea>

              {/* Legend at bottom if specified */}
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
  }
);

ChartBarStacked.displayName = "ChartBarStacked";

export default ChartBarStacked;
