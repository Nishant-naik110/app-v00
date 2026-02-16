"use client";

import React, { forwardRef, useMemo } from "react";
import { useFullscreen } from '@/hooks/full-screen';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { formatValue,  CustomLegendContent, CustomXAxisTick } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartMenuDropdown } from "./ChartMenuDropdown";
import { LineChartSkeleton } from "./ChartSkeletons";
import { RadioButtons } from "@/components/mf/RadioButton";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import { MultiSelect } from "@/components/ui/multi-select";
import { InformationCard } from "../InformationCard";
import ChartHeader from "./ChartHeader";

interface DoubleLineProps {
  chartData?: {
    label: string;
    [key: string]: string | number;
  }[];
  chartConfig?: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  // Export props
  handleExportCsv?: () => void;
  handleExportPng?: (title: string, key: string) => void;
  handleExpand?: () => void;
  exportKey?: string;
  title?: string;
  titleIcon?: React.ReactNode;
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
  isLoading?: boolean;
  chartHeight?: number | string;
  cardHeight?: number | string;
  className?: string;
  contentHeight?: number | string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisAngle?: number;
  showAxisLine?: boolean;
  showTickLine?: boolean;
  cartesianGridColor?: string;
  cartesianGridHorizontal?: boolean;
  cartesianGridVertical?: boolean;
  cartesianGridStrokeDasharray?: string;
  chartMargins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  xAxisSpacing?: number;
  minTickGap?: number; 
  InformCard?: { title: string; desc: string }[];
  isInformCard?: boolean;
  handleExport?: () => void;
  onExpand?: () => void;
  onExport?: (s: string, title: string, key: string) => void;
  isSelect?: boolean;
  isRadioButton?: boolean;
  LinechartTitle?: string;
  AxisLabel?: string;
  selectoptions?: string[];
  placeholder?: string;
  isPercentage?: boolean;
  showMenu?: boolean;
  height?: number | string;
  isLegend?: boolean;
  legendPosition?: "top" | "bottom";
  yAxisLabelShow?: boolean;
  xAxisLabelShow?: boolean;
  onDataClick?: (data: any, index: number, dataKey: string) => void;
}

const DoubleLineChart = forwardRef<HTMLDivElement, DoubleLineProps>(({
  chartData = [],
  chartConfig = {},
  handleExportCsv,
  handleExportPng,
  handleExpand,
  exportKey = "",
  title,
  titleIcon,
  showHeader = true,
  showExport = true,
  filterType,
  filterOptions = [],
  selectedFilterValue,
  handleFilterChange,
  filterPlaceholder = "Select...",
  filterClassName = "w-[120px] h-[30px]",
  frequencyShow = true,
  frequencyOptions = [],
  selectedFrequency,
  handleFrequencyChange,
  frequencyPlaceholder = "",
  isLoading = false,
  isLegend = true,
  legendPosition = "bottom",
  height = 250,
  cardHeight,
  className = "",
  contentHeight = "350px",
  xAxisLabel,
  yAxisLabel,
  xAxisAngle = 0,
  yAxisLabelShow = true,
  xAxisLabelShow = true,
  showAxisLine = true,
  showTickLine = true,
  cartesianGridColor = "grey",
  cartesianGridHorizontal = true,
  cartesianGridVertical = false,
  cartesianGridStrokeDasharray = "2 2",
  chartMargins = { top: 12, right: 2, bottom:15, left: 0 },
  xAxisSpacing = 50,
  minTickGap = 0,
  InformCard = [],
  isInformCard = false,
 
  LinechartTitle,
  AxisLabel = "Value",
  isPercentage = false,
  onDataClick,
}, ref) => {
  const isFullscreen = useFullscreen();

  const maxVisiblePoints = 7;
  const barWidth = xAxisSpacing;
  const chartWidth =
    chartData.length > maxVisiblePoints
      ? chartData.length * barWidth
      : undefined;

  // Simple label formatter matching StackedBarwithLine
  const labelFormatter = (label: string) => (
    <div className="text-subBody dark:text-white mb-1">
      {label}
    </div>
  );

  const labelsArray = Object.values(chartConfig).map((config) => config.label);
  const colorsArray = Object.values(chartConfig).map((config) => config.color);

  const chartHeight = useMemo(() => {
    if (isFullscreen && typeof window !== "undefined") {
      // In fullscreen, use a larger height based on viewport
      return Math.min(window.innerHeight * 0.6, 600);
    }
    return typeof height === "number"
      ? height
      : typeof height === "string"
      ? height.endsWith("rem")
        ? Number.parseFloat(height) * 16
        : Number.parseFloat(height)
      : 180;
  }, [height, isFullscreen]);

  return (
    <Card
      ref={ref}
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
              InformTitle={item.title}
              informDescription={item.desc}
            />
          ))}
        </div>
      )}

      <CardContent
        className={`w-full p-4 ${isFullscreen ? 'h-[calc(100vh-80px)]' : ''}`}
        style={{
          height: isFullscreen
            ? 'calc(100vh - 80px)' // Subtract header height
            : typeof contentHeight === "number"
              ? `${contentHeight}px`
              : contentHeight,
        }}
      >
        {isLoading ? (
          <div className="w-full">
            <LineChartSkeleton height={`${chartHeight}px`} />
          </div>
        ) : (
          <>
            {/* Chart container with horizontal scroll */}
            <div className=" relative left-[-20px]">
              {/* Fixed Y-Axis Label (outside scrollable area) */}
              {yAxisLabel && yAxisLabelShow && chartData.length > 0 && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 z-10" style={{ marginLeft: '0px' }}>
                  <span className="text-subBody dark:text-gray-400 whitespace-nowrap">
                    {yAxisLabel}
                  </span>
                </div>
              )}

              <ScrollArea className="w-full whitespace-nowrap">
              <div className={`${yAxisLabel ? 'ml-10' : ''}`}>
                <ChartContainer
                config={chartConfig}
                className="relative w-full p-0"
                style={{ height: `${chartHeight}px` }}
              >
                <div
                  style={{
                    ...(chartWidth
                      ? { minWidth: `${chartWidth}px` }
                      : { width: "100%" }),
                  }}
                >
                  <ResponsiveContainer 
                    width="100%"
                    height={chartHeight}
                  >
                    {chartData.length > 0 ? (
                      <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={chartMargins}
                      >
                        <CartesianGrid 
                          vertical={cartesianGridVertical} 
                          horizontal={cartesianGridHorizontal} 
                          stroke={cartesianGridColor} 
                          strokeDasharray={cartesianGridStrokeDasharray} 
                        />
                        <XAxis
                          dataKey="label"
                          tickLine={showTickLine}
                          axisLine={showAxisLine}
                          interval={0}
                          tickMargin={0}
                          textAnchor="middle"
                          stroke="grey"
                          tick={<CustomXAxisTick angle={xAxisAngle} />}
                        />
                        <YAxis
                          tickLine={showTickLine}
                          axisLine={showAxisLine}
                          tickMargin={10}
                          tickFormatter={(value) =>
                            formatValue(value as number, AxisLabel)
                          }
                          stroke="grey"
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dot" labelFormatter={labelFormatter} isPercentage={isPercentage} />}
                        />
                        {Object.keys(chartConfig).map((key, index) => {
                          return (
                            <Line
                              key={index}
                              dataKey={key}
                              type="linear"
                              stroke={chartConfig[key].color}
                              strokeWidth={2}
                              dot={(props: any) => {
                                const { cx, cy, payload, index: dotIndex } = props;
                                if (cx == null || cy == null) {
                                  return <circle cx={0} cy={0} r={0} fill="transparent" />;
                                }
                                
                                const dataIndex = chartData.findIndex(
                                  (item) => item === payload
                                );
                                
                                return (
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={3}
                                    fill={chartConfig[key].color}
                                    stroke="#fff"
                                    strokeWidth={2}
                                    style={{ 
                                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                      cursor: "pointer"
                                    }}
                                    onClick={() => {
                                      if (dataIndex !== -1 && onDataClick) {
                                        onDataClick(payload, dataIndex, key);
                                      }
                                    }}
                                  />
                                );
                              }}
                            >
                              {isPercentage && (
                                <LabelList
                                  position="top"
                                  className="text-subBody"
                                  formatter={(value: any) => `${value}%`}
                                />
                              )}
                            </Line>
                          );
                        })}
                      </LineChart>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <span className="text-subBody dark:text-white">
                          No Data Found!
                        </span>
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
              </div>
             <ScrollBar orientation="horizontal" className="mb-2"></ScrollBar>
              </ScrollArea>
            </div>
            
            {/* Fixed X-Axis Label (outside scrollable area) */}
            {xAxisLabel && xAxisLabelShow && chartData.length > 0 && (
              <div className="w-full text-center">
                <span className="text-subBody dark:text-gray-400 ">
                  {xAxisLabel}
                </span>
              </div>
            )}
            
            {/* Legend */}
            {chartData.length > 0 && isLegend && legendPosition === "bottom" && (
              <div className="w-full  flex-shrink-0 ">
                <CustomLegendContent labels={labelsArray} colors={colorsArray} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

DoubleLineChart.displayName = "DoubleLineChart";

export default DoubleLineChart;
