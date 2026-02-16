"use client";
import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  createExpandHandler,
  createPngExportHandler,
  exportCsvFromUrl,
  noDataFound,
} from "@/lib/utils";
import { usePackage } from "@/components/mf/PackageContext";
import { useDateRange } from "@/components/mf/DateRangeContext";
import ResizableTable from "@/components/mf/ReportingToolTable";
import DoubleLineChart from "@/components/mf/charts/DoubleLineChart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Download, Loader2 } from "lucide-react";
import ProgressBarChart from "@/components/mf/charts/ProgressBarChart";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import {
  useFraudSubCategory,
  useFraudSubCategoryDetails,
  type DashboardPayload,
  type FraudSubCategoryDetailsPayload,
} from "../../hooks/useDashboard";

interface AnalysisInsightsProps {
  selectedViewType: "click" | "conversion" | "event";
  onClickValue: string;
  publisherfilter: string[];
  campaignfilter: string[];
  countryfilter: string[];
  eventTypeFilter: string[];
  agencyfilter: string[];
  isInitialLoading?: boolean;
  conversionvalue?: boolean;
}

const AnalysisInsights = ({
  selectedViewType,
  onClickValue,
  publisherfilter,
  campaignfilter,
  agencyfilter,
  countryfilter,
  eventTypeFilter,
  isInitialLoading,
  conversionvalue = false,
}: AnalysisInsightsProps) => {
  const { selectedPackage } = usePackage();
  const { startDate, endDate } = useDateRange();
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const basePayload = useMemo<DashboardPayload | undefined>(
    () =>
      !selectedPackage || !startDate || !endDate || !onClickValue
        ? undefined
        : {
            start_date: startDate,
            end_date: endDate,
            package_name: selectedPackage,
            category: onClickValue,
            publisher: publisherfilter,
            campaign_id: campaignfilter,
            vendor_id: agencyfilter,
            country: countryfilter,
            ...(selectedViewType === "event" && {
              event_type: eventTypeFilter,
             
            }),
          },
    [
      startDate,
      endDate,
      selectedPackage,
      onClickValue,
      publisherfilter,
      campaignfilter,
      agencyfilter,
      countryfilter,
      selectedViewType,
      eventTypeFilter,
      conversionvalue,
    ]
  );

  const detailsPayload = useMemo<FraudSubCategoryDetailsPayload | undefined>(
    () =>
      !basePayload || !selectedKey
        ? undefined
        : { ...basePayload, fraud_sub_category: selectedKey },
    [basePayload, selectedKey]
  );

  // Export state
  const [isExportingDetails, setIsExportingDetails] = useState(false);

  // Export payload for fraud sub category details
  const fraudSubCategoryDetailsExportPayload = useMemo<
    FraudSubCategoryDetailsPayload | undefined
  >(
    () =>
      !detailsPayload || !isExportingDetails
        ? undefined
        : { ...detailsPayload, export_type: "csv" },
    [detailsPayload, isExportingDetails]
  );

  const { data: fraudSubCategoriesData, isLoading: fraudSubCategoryLoading } =
    useFraudSubCategory(
      selectedViewType,
      basePayload,
      !!basePayload && !isInitialLoading
    );

  const {
    data: fraudSubCategoryDetailsData,
    isLoading: fraudSubCategoryDetailsLoading,
  } = useFraudSubCategoryDetails(
    selectedViewType,
    detailsPayload,
    !!detailsPayload && !isInitialLoading
  );

  // Export API hook
  const { data: fraudSubCategoryDetailsExportData } =
    useFraudSubCategoryDetails(
      selectedViewType,
      fraudSubCategoryDetailsExportPayload,
      !!fraudSubCategoryDetailsExportPayload
    );

  // Handle CSV export response
  useEffect(() => {
    if ((fraudSubCategoryDetailsExportData as any)?.url) {
      exportCsvFromUrl({
        url: (fraudSubCategoryDetailsExportData as any).url,
        filename: `Fraud Sub Category Details - ${selectedKey || "Details"}`,
        onSuccess: () => setIsExportingDetails(false),
      });
    }
  }, [fraudSubCategoryDetailsExportData, selectedKey]);

  const fraudSubCategories = useMemo(() => {
    return Array.isArray(fraudSubCategoriesData) ? fraudSubCategoriesData : [];
  }, [fraudSubCategoriesData]);

  // Transform for MFSingleSelect
  const fraudSubCategoryItems = useMemo(
    () =>
      fraudSubCategories
        .filter((item) => item?.fraud_subcategory)
        .map((item) => ({
          title: item.fraud_subcategory ?? "",
          value: item.fraud_subcategory ?? "",
        })),
    [fraudSubCategories]
  );

  const viewType = useMemo(
    () =>
      !selectedKey || fraudSubCategories.length === 0
        ? "table"
        : fraudSubCategories.find(
            (item) => item?.fraud_subcategory === selectedKey
          )?.type || "table",
    [selectedKey, fraudSubCategories]
  );

  // Auto-select first item when data loads OR when category changes
  useEffect(() => {
    if (
      fraudSubCategories.length > 0 &&
      fraudSubCategories[0]?.fraud_subcategory
    ) {
      // Always set to first item when category changes or data loads
      setSelectedKey(fraudSubCategories[0].fraud_subcategory);
    }
  }, [fraudSubCategories, onClickValue]); // Added onClickValue as dependency

  const { tableData, tableColumns } = useMemo(() => {
    if (viewType !== "table" || !fraudSubCategoryDetailsData?.data?.length) {
      return { tableData: [], tableColumns: [] };
    }

    const firstItem = fraudSubCategoryDetailsData.data[0];
    if (!firstItem) return { tableData: [], tableColumns: [] };

    return {
      tableData: fraudSubCategoryDetailsData.data,
      tableColumns: Object.keys(firstItem).map((key) => ({
        title: key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        key,
      })),
    };
  }, [viewType, fraudSubCategoryDetailsData]);

  const { chartData, chartConfig, chartTitle } = useMemo(
    () =>
      viewType !== "graph" || !Array.isArray(fraudSubCategoryDetailsData?.data)
        ? { chartData: [], chartConfig: {}, chartTitle: "" }
        : {
            chartData: fraudSubCategoryDetailsData.data.map((item: any) => ({
              label: item?.bucket ?? "",
              percentage: item?.percentage ?? 0,
            })),
            chartConfig: {
              percentage: { label: "Percentage", color: "#2563eb" },
            },
            chartTitle: fraudSubCategoryDetailsData.title ?? "",
          },
    [viewType, fraudSubCategoryDetailsData]
  );

  const { progressData, progressTitle } = useMemo(
    () =>
      viewType !== "progress" ||
      !Array.isArray(fraudSubCategoryDetailsData?.data)
        ? { progressData: [], progressTitle: "" }
        : {
            progressData: fraudSubCategoryDetailsData.data.map((item: any) => ({
              visit: item?.visit ?? 0,
              label: item?.label ?? "",
              percentage: item?.percentage ?? "-",
              fill: item?.fill ?? "",
            })),
            progressTitle: fraudSubCategoryDetailsData.title ?? "",
          },
    [viewType, fraudSubCategoryDetailsData]
  );

  const carouselData = useMemo(
    () =>
      viewType === "carousel" &&
      Array.isArray(fraudSubCategoryDetailsData?.data)
        ? fraudSubCategoryDetailsData.data
        : [],
    [viewType, fraudSubCategoryDetailsData]
  );

  const handleExportCsv = useCallback(() => setIsExportingDetails(true), []);
  const handleKeySelect = useCallback((key: string) => setSelectedKey(key), []);

  const IncentSampleCard = ({ data }: { data: any }) => {
    const screenshot_url = data?.screenshot_url;
    const otherData = Object.fromEntries(
      Object.entries(data || {}).filter(([key]) => key !== "screenshot_url")
    );

    const renderValue = (val: string) => {
      const isUrl = /^(https?:\/\/[^\s]+)/i.test(val);
      const displayText = val.length > 20 ? `${val.slice(0, 20)}...` : val;

      return isUrl ? (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="text-subBody text-blue-600 hover:text-blue-800 underline cursor-pointer"
          title={val}
        >
          {displayText}
        </a>
      ) : (
        <span className="text-subBody" title={val}>
          {displayText}
        </span>
      );
    };

    return (
      <Card className="w-full h-[290px] overflow-hidden border-border/40 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-2">
          <div className="flex h-full w-full justify-between gap-4">
            <div className="w-2/3 space-y-3">
              {Object.entries(otherData).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start gap-3 text-subBody group"
                >
                  <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform"></span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-subBody font-semibold text-foreground">
                      {key
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                      :
                    </span>
                    {renderValue(String(value ?? ""))}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-1/2 flex items-center justify-center pl-4">
              {screenshot_url ? (
                <div className="w-48 h-64 rounded-xl overflow-hidden shadow-lg border border-border/40 hover:border-primary/50 transition-all duration-300">
                  <img
                    src={screenshot_url}
                    alt="Screenshot"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target?.parentElement) {
                        target.style.display = "none";
                        target.parentElement.innerHTML =
                          '<div class="w-full h-full flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-subBody">Image not available</div>';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-48 h-64 flex items-center justify-center bg-muted rounded-xl text-muted-foreground border border-dashed border-border/50">
                  <span className="text-subBody">No screenshot</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // RENDER VIEW BASED ON TYPE
  // ============================================================================
  const renderIncentSamplesDynamicView = () => {
    switch (viewType) {
      case "table":
        if (!fraudSubCategoryDetailsLoading && tableColumns.length === 0) {
          return (
            <div className="w-full flex items-center h-[30vh]">
              {noDataFound()}
            </div>
          );
        }
  
        return (
          <ResizableTable
            columns={tableColumns}
            data={tableData}
            height={400}
            isSearchable={false}
            isLoading={fraudSubCategoryDetailsLoading}
          />
        );
  
      case "carousel":
        return carouselData.length > 0 ? (
          <div className="w-full py-2">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <div className="flex items-center gap-4">
                <CarouselPrevious className="static hover:bg-primary hover:text-primary-foreground transition-all" />
                <div className="flex-1 overflow-hidden">
                  <CarouselContent className="-ml-4">
                    {carouselData.map((sample: any, index: number) => (
                      <CarouselItem
                        key={index}
                        className="basis-full md:basis-1/2 pl-4"
                      >
                        <IncentSampleCard data={sample ?? {}} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </div>
                <CarouselNext className="static hover:bg-primary hover:text-primary-foreground transition-all" />
              </div>
            </Carousel>
          </div>
        ) : (
          <div className="w-full flex items-center h-[30vh]">
            {noDataFound()}
          </div>
        );
  
      case "graph":
        if (!fraudSubCategoryDetailsLoading && chartData.length === 0) {
          return (
            <div className="w-full flex items-center h-[30vh]">
              {noDataFound()}
            </div>
          );
        }
  
        return (
          <div
            ref={(el) => {
              if (el) cardRefs.current["fraud_sub_category_trend"] = el;
            }}
            className="w-full transition-all duration-300 hover:shadow-xl"
          >
            <DoubleLineChart
              chartData={chartData}
              title={chartTitle}
              chartConfig={chartConfig as any}
              isRadioButton={false}
              isLoading={fraudSubCategoryDetailsLoading}
              AxisLabel="Percentage"
              isPercentage={true}
              handleExpand={createExpandHandler({
                key: "fraud_sub_category_trend",
                cardRefs,
                expandedCard,
                setExpandedCard,
              })}
              handleExportPng={createPngExportHandler({
                cardRefs,
                key: "fraud_sub_category_trend",
                filename: "Fraud Sub Categories Trend",
              })}
              handleExportCsv={handleExportCsv}
              showMenu={true}
              xAxisLabel="CTIT in Hours"
              yAxisLabel="Percentage"
              cardHeight="18rem"
              height="10rem"
              exportKey="fraud_sub_category_trend"
            />
          </div>
        );
  
      case "progress":
        if (!fraudSubCategoryDetailsLoading && progressData.length === 0) {
          return (
            <div className="w-full flex items-center h-[30vh]">
              {noDataFound()}
            </div>
          );
        }
  
        return (
          <div
            ref={(el) => {
              if (el) cardRefs.current["fraud_sub_category_progress"] = el;
            }}
            className="w-full h-full transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
          >
            <ProgressBarChart
              title={progressTitle}
              chartData={progressData}
              handleExpand={createExpandHandler({
                key: "fraud_sub_category_progress",
                cardRefs,
                expandedCard,
                setExpandedCard,
              })}
              handleExportPng={createPngExportHandler({
                cardRefs,
                key: "fraud_sub_category_progress",
                filename: "Fraud Sub Categories Progress",
              })}
              handleExportCsv={handleExportCsv}
              exportKey="fraud_sub_category_progress"
              isLoading={fraudSubCategoryDetailsLoading}
              titleIcon={<Download className="w-6 h-6 text-primary" />}
            />
          </div>
        );
  
      default:
        return (
          <div className="w-full flex items-center justify-center p-2 text-gray-500 h-[30vh]">
            {fraudSubCategoryDetailsLoading || !!isInitialLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              `No view available for type: ${viewType}`
            )}
          </div>
        );
    }
  };
  

  return fraudSubCategories.length > 0 ? (
    <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg transition-all duration-300">
     
      <div className="flex items-center justify-between gap-2 p-2">
        <h2 className="relative flex items-center gap-2 text-header font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white] before:content-[''] before:h-8 before:w-1 before:bg-gradient-to-b before:from-primary before:to-secondary before:rounded-full after:content-[''] after:h-8 after:w-1 after:bg-gradient-to-b after:from-secondary after:to-primary after:rounded-full">
          {onClickValue ?? ""}
        </h2>

        {/* Fraud Subcategory Selector */}
        <div className="flex items-center gap-2">
          <span className="text-subBody text-muted-foreground hidden sm:inline">
            Filter by:
          </span>
          <MFSingleSelect
            items={fraudSubCategoryItems}
            value={selectedKey ?? ""}
            onValueChange={handleKeySelect}
            placeholder="Select fraud subcategory"
            className="w-[12rem] h-[36px] text-subBody"
          />
        </div>
      </div>

      {renderIncentSamplesDynamicView()}
    </div>
  ) : null;
};

export default AnalysisInsights;
