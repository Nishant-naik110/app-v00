import { Pie, PieChart, LabelList } from "recharts";
import HeaderRow from "../HeaderRow";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { InformationCard } from "../InformationCard";
import { Loader2 } from "lucide-react";

interface PieChartProps {
  chartData?: { label: string; [key: string]: string | number; }[];
  chartConfig?: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  datavalue?: number;
  InformCard?: { title: string; desc: string }[];
  handleExport?: () => void;
  onExpand: () => void;
  onExport?: (s: string, title: string, index: number) => void;
  title?: string;
  isSelect?: boolean;
  isRadioButton?: boolean;
  piechartitle?: string;
  isLoading: boolean;
}

const PieCharts = ({
  chartData,
  chartConfig,
  handleExport,
  onExport,
  onExpand,
  piechartitle,
  title,
  isLoading,
  datavalue,
  isSelect = false,
  isRadioButton = false,
  InformCard = [],
}: PieChartProps) => {
  return (
    <Card className="flex flex-col shadow-md rounded-lg dark:bg-card">
      <HeaderRow
        title={title}
        onExpand={onExpand}
        handleExport={handleExport}
        isRadioButton={isRadioButton}
        isSelect={isSelect}
        onExport={onExport}
      />
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-body font-semibold">{piechartitle}</CardTitle>
      </CardHeader>
      <CardContent className=" flex flex-0 pb-0 h-[400px] w-full overflow-x-auto  overflow-y-hidden scrollbar">
        <div className="flex flex-row space-y-8  space-x-8 h-full w-full">
          {/* Information Cards */}
          <div className="flex-0 flex flex-col justify-center ">
            {InformCard?.map((item, index) => (
              <InformationCard
                key={index}
                InformTitle={item.title}
                informDescription={item.desc}
              />
            ))}
          </div>
          {/* Pie Chart with Scrollable Container */}
          <div className=" flex justify-center flex-1 mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex-1 aspect-square">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square xl:h-[250px] h-[250px] sm:h-[200px] lg:h-[200px] lg:mt-3 sm:mt-3 max-w-full max-h-full"
                  style={{ height: "100%" }}
                >
                  {chartData?.length > 0 ? (
                    <PieChart>
                      <Pie data={chartData} dataKey={datavalue}>
                        <LabelList
                          dataKey={datavalue}
                          style={{ fontSize: '12px', fill: '#000', fontWeight: 'bold' }}
                          stroke="none"
                          formatter={(value: number) => `${value}%`} // Format as a percentage
                        />
                      </Pie>
                      <ChartTooltip
                        content={<ChartTooltipContent nameKey="label" hideLabel />}
                      />
                      <ChartLegend
                        content={<ChartLegendContent nameKey="label" />}
                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                      />
                    </PieChart>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-subBody">No Data Found.!</span>
                    </div>
                  )}
                </ChartContainer>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieCharts;