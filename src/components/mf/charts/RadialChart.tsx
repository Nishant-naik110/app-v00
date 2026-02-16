"use client"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { useState,useEffect } from "react";

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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Loader2 } from "lucide-react";
import HeaderRow from "../HeaderRow";

interface RadialChartProps {
    chartData?: { label?: string; [key: string]: string | number | undefined }[];
    chartConfig?: {
      [key: string]: {
        label: string;
        color: string;
      };
  };
  Device?:string;
  Vname?:string;
  Vvalue?:number;
  Oname?:string;
  Ovalue?:number;
  backgroundcolors?:string;
  textcolors?:string;
  value1?:string;
  value2?:string;
  isLoading?:boolean;
  isPercentage?:boolean;
  selectedFrequency?:string;
  placeholder?:string;
  handleExport?: () => void;
  onExpand?: () => void;
  onExport?: (s: string, title: string, index: number) => void;
  title?: string;
  isSelect?: boolean;
  isRadioButton?: boolean;
  handleFrequencyChange?: (value: string) => void; 
  selectoptions?:string[];
  visitEventOptions?: { value: string; label: string }[];
  handleTypeChange?: (value: string) => void;
  selectedType?: string;
  heading?:string;
  isHeader?:boolean;
  isCardTitle?:boolean;
};

const RadialBars = ({
    heading ="heading",
    //sub_heading,
      handleTypeChange,
      visitEventOptions,
      selectedType,
      handleExport,
      onExport,
      selectoptions =[],
      onExpand,
      handleFrequencyChange,
      title ,
      isSelect= false,
      isRadioButton =false,
      isHeader=true,
      isCardTitle=false,
    chartConfig,
    chartData,
    Device,
    Vname,
    Vvalue,
    Oname,
    value1,
    value2,
    Ovalue,
    backgroundcolors,
    textcolors,
    isLoading,
    isPercentage,
    selectedFrequency,
    placeholder,
}: RadialChartProps) => {
    const [data, setData] = useState<{ label?: string; [key: string]: number | undefined }[]>([]);

    useEffect(() => {
        if (chartData) {
            setData(chartData);
        } else {
            setData([]);
        }
    }, [chartData]);

    return (
        <Card className="flex flex-col max-h-[280px]">
            
                {isHeader && (
                    <div className="p-2">
                <HeaderRow
      visitEventOptions={visitEventOptions}
      handleTypeChange={handleTypeChange}
      selectoptions={selectoptions}
      selectedType={selectedType}
      title={title}
      handleFrequencyChange={handleFrequencyChange}
      selectedFrequency={selectedFrequency}
      onExpand={onExpand}
      handleExport={handleExport}
      isRadioButton={isRadioButton}
      isSelect={isSelect}
      onExport={onExport}
      textcolors={textcolors}
      heading={heading}
      placeholder={placeholder}
              

/>
</div>
 ) }
            
            {isCardTitle && (
               <CardHeader className="items-center p- pb-0">
                <CardTitle className="text-body font-semibold p-2" style={{ color: textcolors }}>
                    {Device}
                </CardTitle>
            </CardHeader>
        )}
            <CardContent className="relative flex-1 min-h-[150px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square w-full max-w-[200px]"
                    >
                        {data.length > 0 ? (
                            <RadialBarChart
                                data={chartData}
                                endAngle={180}
                                innerRadius={80}
                                outerRadius={120}
                            >
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel isPercentage={isPercentage}/>}
                                />
                                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                    <Label content={({ viewBox }) => {/* ... existing label content ... */}}/>
                                </PolarRadiusAxis>
                                <RadialBar
                                    dataKey={value1 || "Visit %"}
                                    stackId="a"
                                    cornerRadius={5}
                                    fill={chartConfig[value1 || "Visit %"]?.color}
                                    className="stroke-transparent stroke-2"
                                />
                                <RadialBar
                                    dataKey={value2 || "Event %"}
                                    fill={chartConfig[value2 || "Event %"]?.color}
                                    stackId="a"
                                    cornerRadius={5}
                                    className="stroke-transparent stroke-2"
                                />
                            </RadialBarChart>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-subBody">No Data Found!</span>
                            </div>
                        )}
                    </ChartContainer>
                )}
            </CardContent>
            <CardFooter className="pb-5">
                <div className={`${backgroundcolors} w-full`} style={{ color: textcolors }}>
                    <div className="flex items-center justify-center gap-4 font-semibold text-body">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: chartConfig[value1 || "Visit %"]?.color || "#000" }}
                            />
                            <span>{Vname}: {isLoading ? "0" : (Vvalue ?? 0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: chartConfig[value2 || "Event %"]?.color || "#000" }}
                            />
                            <span>{Oname}: {isLoading ? "0" : (Ovalue ?? 0)}%</span>
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};
export default RadialBars;
