"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  XAxisProps,
  YAxis,
} from "recharts";
import domToImage from "dom-to-image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import MFChartDropdown from "./MFChartDropdown";
import { useCallback, useRef } from "react";
import { downloadURI } from "@/lib/utils";

type MFBarChart = {
  title: string;
  description?: string;
  className: string;
  yAxis?: boolean;
  data: unknown[];
  chartConfig: ChartConfig;
  legend?: boolean;
  xAxisProps: XAxisProps;
  onDropdownClick: (s: string) => void;
};

export function MFBarChart({
  className = "",
  description,
  title,
  yAxis = false,
  chartConfig,
  data,
  legend,
  onDropdownClick,
  xAxisProps,
}: MFBarChart) {
  const ref = useRef<HTMLDivElement>(null);

  const onExport = useCallback(
    async (s: string) => {
      switch (s) {
        case "png":
          if (!ref || !ref.current) return;
          const s = await domToImage.toPng(ref.current);
          downloadURI(s, title + ".png");
          return;
        default:
      }
    },
    [title],
  );
  return (
    <Card className={"h-full w-full " + className} ref={ref}>
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <span className="absolute right-0 top-0 p-6">
          <MFChartDropdown
            items={["Date", "Week", "Month"]}
            onClick={onDropdownClick}
            onExport={onExport}
            onExpand={() => ref.current?.requestFullscreen()}
          />
        </span>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="max-h-60 w-full bg-background"
        >
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis {...xAxisProps} />
            {yAxis && (
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
            )}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {legend && <ChartLegend content={<ChartLegendContent />} />}
            {Object.keys(chartConfig).map((v, i) => (
              <Bar key={i} dataKey={v} fill={`var(--color-${v})`} radius={4} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
