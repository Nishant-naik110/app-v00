"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, LabelList } from "recharts";
import {formatValue} from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import HeaderRow from "../HeaderRow";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface data {
  label: string;
  [key: string]: string | number;
}

interface config {
  [key: string]: {
    label: string;
    color: string;
  };
}
import { Loader2 } from "lucide-react";

interface DynamicBarChartProps {
  data: data[];
  config: config;
  xAxisTitle?: string;
  yAxisTitle?: string;
  isHorizontal: boolean;
  multiple?:string;
  title?: string;
  handleExport?: () => void;
  onExpand: () => void;
  onExport?: (s: string, title: string, index: number) => void;
  isRadioButton: boolean;
  isSelect: boolean;
  dynamicTitle?: string;
  formatterType?: "number" | "percentage"
  position?: string
  isLoading: boolean
  AxisLabel?:string;
  selectoptions?:string[] ;
   placeholder?: string;
   handleFrequencyChange?: (value: string) => void; 
   width?:string;
   selectedFrequency?:string;
   isPercentage?:boolean;
   isMultiSelect?: boolean;
  multiSelectOptions?: { label: string; value: string }[];
  selectedMultiValues?: string[];
  handleMultiSelectChange?: (values: string[]) => void;
  multiSelectPlaceholder?: string
  
}

export function DynamicBarChart({
  data,
  config,
  xAxisTitle,
  isLoading,
  yAxisTitle,
  isHorizontal = false,
  handleExport,
  onExport,
  onExpand,
  multiple,
   placeholder,
   handleFrequencyChange,
  isSelect,
  selectedFrequency,
  selectoptions=[],
  AxisLabel,
  isRadioButton,
  title,
  isPercentage,
  dynamicTitle,
  formatterType = "number",
  position = "right",
  width,
  // ... existing props ...
  isMultiSelect = false,
  multiSelectOptions = [],
  selectedMultiValues = [],
  handleMultiSelectChange,
  multiSelectPlaceholder = "Select options",

}: DynamicBarChartProps) {

  const CustomSquareLegend = ({ payload }: { payload?: any[] }) => {
    if (!payload) return null;
    // Calculate dynamic height based on data length
    const baseHeight = 50; // Base height for each data entry
    const dynamicHeight = Math.max(data.length * baseHeight, 200); // Minimum height of 200px 
    return (
      <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              style={{
                width: 8,
                height: 8,
                backgroundColor: entry.color,
                borderRadius: 2,
              }}
            ></div>
            <span className="text-subBody">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTick = ({ x, y, payload, chartConfig }) => {
    const label = chartConfig[payload.value]?.label || payload.value;
  
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{label}</title> {/* Tooltip on hover */}
        <text
          x={0}
          y={0}
          dy={4} // Adjusts vertical alignment
          textAnchor="end"
          fontSize={8}
          className="truncate w-24"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "60px", // Set width to limit label
          }}
        >
          {label.length > 8 ? `${label.slice(0, 6)}...` : label}
        </text>
      </g>
    );
  };
  const chartWidth = (data ? data.length : 0) * 70;
  const dataKeys = Object.keys(config || {});

  
  const formatLabel = (value: number) => {
    if (formatterType === "percentage") {
      return `${value}%`;
    }else{
    return `${value}`;
    }
  };
  return (

    <Card className="flex flex-col shadow-md rounded-lg dark:bg-card">
      <HeaderRow
        title={title}
        onExpand={onExpand}
        handleExport={handleExport}
        isRadioButton={isRadioButton}
        isSelect={isSelect}
        selectoptions={selectoptions}
        onExport={onExport}
        placeholder={placeholder}
        handleFrequencyChange={handleFrequencyChange}
        isMultiSelect={isMultiSelect}
        multiSelectOptions={multiSelectOptions}
        selectedMultiValues={selectedMultiValues}
        handleMultiSelectChange={handleMultiSelectChange}
        multiSelectPlaceholder={multiSelectPlaceholder}
        width={width}
        selectedFrequency={selectedFrequency}
      />
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-body font-semibold">{dynamicTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0 max-h-[270px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center  w-full h-[200px]">
            <Loader2 className=" h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (

          <ChartContainer config={config} style={{ height: "250px", width: "100%" }}>
            <ResponsiveContainer height={240}>
              {data?.length > 0 ? (
                <BarChart
                  data={data}
                  layout={isHorizontal ? "vertical" : "horizontal"}
                  width={chartWidth}
                //  height={minHeight}
                >

                  <CartesianGrid strokeDasharray="3 3" />
                  {isHorizontal ? (
                    <XAxis className="text-body"
                      type="number"
                      label={{ value: xAxisTitle, position: "insideBottom", offset: -5 }}
                      tickFormatter={(value) => formatValue(value as number, AxisLabel)}
                      style={{fontSize:'8px'}}
                    />
                  ) : (
                    <XAxis className="text-body"
                      dataKey="label"
                      label={{ value: xAxisTitle, position: "insideBottom", offset: -5, }}
                      style={{fontSize:'8px'}}
                    />
                  )}
                  {isHorizontal ? (
                    <YAxis className="mr-10 text-body"
                      type="category"
                      dataKey="label"
                      label={{
                        value: yAxisTitle,
                        angle: -90,
                        position: "insideLeft",
                        offset: 0
                      }}
                      tickFormatter={(value) => {
                        const displayValue = value.length > 3 ? value.slice(0, 5) + "..." : value;
                        return displayValue; // Return string, not an element
                      }}
                      interval={0}
                      tick={<CustomTick chartConfig={config} />}
                    />
                  ) : (
                    <YAxis className="text-body"
                      label={{
                        value: yAxisTitle,
                        angle: -90,
                        position: "insideLeft",
                      }}
                      tickFormatter={(value) => {
                        const displayValue = value.length > 3 ? value.slice(0, 5) + "..." : value;
                        return displayValue; // Return string, not an element
                      }}
                      tick={<CustomTick chartConfig={config} />}
                    />
                  )}
                  <ChartTooltip content={<ChartTooltipContent isPercentage={isPercentage}/>} />
                  <Legend content={(props) => <CustomSquareLegend {...props} />}
                  />
                  {dataKeys.map((key) => (
                    <Bar key={key} dataKey={key} fill={config[key].color} radius={0}>
                      {/* Add LabelList here to show labels on the bars */}
                      <div className="dark:text-white">
                        <LabelList
                          dataKey={key}
                          position={position}
                          style={{ fontSize: "8px", fill: "#000" }}
                          formatter={formatLabel}
                        />
                      </div>
                    </Bar>
                  ))}
                </BarChart>
              ) : (<div className="flex items-center justify-center w-full h-full">
                <span className="text-subBody">  No Data Found.!</span>
                
              </div>)}
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>

    </Card>
  );
}
export default DynamicBarChart;
