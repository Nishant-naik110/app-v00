"use client"
import { Bar, BarChart, XAxis, YAxis,LabelList, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import HeaderRow from "../HeaderRow";
import { Loader2 } from "lucide-react"
import { InformationCard } from "../InformationCard";
import { useTheme } from "@/components/mf/theme-context";
interface chartData {
  label: string;
  [key: string]: string | number;
}

interface chartconfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface HorizontalBarChartProps {
  chartData: chartData[];
  chartConfig: chartconfig;
  xAxisTitle?: string;
  yAxisTitle?: string;
  isHorizontal: boolean;
  InformCard?: { title: string; desc: string }[];
  title?: string;
  position?:string;
  handleExport?: () => void;
  onExpand: () => void;
  onExport?: (s: string, title: string, index: number) => void;
  isRadioButton: boolean;
  isSelect: boolean;
  BarchartTitle?: string;
  formatterType?: "number" | "percentage";
  dataKey?: string;
  namekeys?:string;
  isLoading:boolean;
  barsize?:number;
  setheight?:string;
  isPercentage?:boolean;
  handleFrequencyChange?: (value: string) => void;
  selectoptions?:string[];
  selecteedFrequency?:string;
  placeholder?:string;
}

const HorizontalVerticalBarChart = ({
  chartData,
  chartConfig,
  xAxisTitle,
  yAxisTitle,
  isHorizontal = false,
  handleExport,
  onExport,
  onExpand,
  isLoading,
  position,
  isSelect,
  isRadioButton,
  title,
  BarchartTitle,
  formatterType = "number",
  dataKey,
  namekeys,
  InformCard=[],
  barsize,
  setheight,
  isPercentage,
  handleFrequencyChange,
  selectoptions,
  selecteedFrequency,
  placeholder="",
}: HorizontalBarChartProps) => {
   const { isDarkMode } = useTheme();
  const formatLabel = (value: number) => {
    if (formatterType === "percentage") {
      return `${(value * 1).toFixed(2)}%`;   // Format as percentage
    }
    return `${value}`;  // Format as number
  };
  const chartHeight = Math.min(chartData.length * 10, 400); 
  const chartWidth = Math.min(chartData.length * 50, 1000);
  const computedChartSize = isHorizontal
  ? { height: Math.min(chartData.length * 30, 400), width: undefined }
  : { height: undefined, width: Math.min(chartData.length * 50, 1000) };
  
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
  
   
  return (
    <Card className="shadow-md rounded-lg dark:bg-card h-full p-0 w-full">
      <HeaderRow
        title={title}
        onExpand={onExpand}
        handleExport={handleExport}
        isRadioButton={isRadioButton}
        isSelect={isSelect}
        onExport={onExport}
        selectoptions={selectoptions}
        handleFrequencyChange={handleFrequencyChange}
        selectedFrequency={selecteedFrequency}
        placeholder={placeholder||""}
      />
      <CardHeader className="items-center p-0 pb-0">
        <CardTitle className="text-body font-semibold">{BarchartTitle}</CardTitle>
      </CardHeader>
      <CardContent  className={`overflow-y-auto scrollbar h-[${setheight}] p-2`}>
        <ResponsiveContainer width={"100%"} height='100%'>
      <div className="flex flex-row  h-full w-full">
          {/* Information Cards */}
          <div className="flex-0 flex flex-col justify-center">
            {InformCard?.map((item, index) => (

              <InformationCard
                key={index}
                InformTitle={item.title}
                informDescription={item.desc}
              />
            ))}
          </div>
          <div className=" flex justify-center flex-1 ">
      {isLoading ?(
         <div className="flex items-center justify-center  w-full h-[250px]">
                    <Loader2 className=" h-8 w-8 animate-spin text-primary" />
               </div>
      ):(
        <ChartContainer config={chartConfig}  style={{ height: "100%",width: "100%" }}>
          <ResponsiveContainer height={chartHeight}>
          {chartData.length>0 ?(
          <BarChart  
          //height={chartHeight} 
            accessibilityLayer
            data={chartData}
            layout={isHorizontal ? "vertical" : "horizontal"} // Toggle between vertical and horizontal chart
            margin={{
              left: 0,
              top:10,
              right:20,
            }}
            barSize={barsize}
            barGap={1} // Reduce gap between bars in the same group
            barCategoryGap="2%" // 
          >
            {/* Conditionally set axis based on orientation */}
            {isHorizontal ? (
              <>
               <YAxis
  dataKey="label"
  type="category"
  tickLine={false}
  tickMargin={12}
  axisLine={false}
  interval={0}
  className="text-body"
  tick={<CustomTick chartConfig={chartConfig} />}
  style={{ fontSize: "8px" }}
/>
                <XAxis 
                  dataKey={dataKey}
                  axisLine={true}
                  interval={0}
                  style={{ fontSize: "8px" }}
                  type="number"  // Use a numerical axis for horizontal layout
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  tickMargin={3}
                  axisLine={false}
                  interval={0}
                  style={{ fontSize: "8px" }}
                  tickFormatter={(value) =>
                    chartConfig[value as keyof typeof chartConfig]?.label
                  }
                />
                <YAxis
                  dataKey={dataKey}
                  axisLine={true}
                  interval={0}
                  type="number" 
                  className="text-body"
                  tickMargin={12}
                  style={{ fontSize: "8px" }}
                  tick={<CustomTick chartConfig={chartConfig} />}
                  
                />
              </>
            )}
            
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent  nameKey={namekeys} hideLabel isPercentage={isPercentage}/>}
            />
            <ChartLegend
              content={<ChartLegendContent verticalAlign="bottom"  nameKey={namekeys}/>}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
            <Bar 
              dataKey={dataKey}
              layout={isHorizontal ? "vertical" : "horizontal"} // Bar layout based on the orientation
              radius={4}
            >
             
                           <LabelList 
                                  dataKey={dataKey}
                                  position={position}
                                  style={{ fontSize: "8px",  fill: isDarkMode ? "#fff" : "#000",  backgroundColor:"#fff"}}
                                  formatter={(formatLabel)} 
                                />
                        
                                
              </Bar>
          </BarChart>
          ):(
            <div className="flex items-center justify-center h-[250px]">
            <span className="text-subBody">No Data Found.!</span>
          </div>)}
          </ResponsiveContainer>
        </ChartContainer>
      )}
      </div>
      </div>
      </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
export default HorizontalVerticalBarChart;
