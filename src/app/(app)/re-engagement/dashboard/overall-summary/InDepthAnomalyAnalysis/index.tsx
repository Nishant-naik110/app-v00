"use client";
import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  createExpandHandler,
  createPngExportHandler,
  exportCsvFromUrl,
} from "@/lib/utils";
import { usePackage } from "@/components/mf/PackageContext";
import { useDateRange } from "@/components/mf/DateRangeContext";
import DonutChart from "@/components/mf/charts/DonutChart";

import StackedBarChart from "@/components/mf/charts/stackedBarChart";

import {
  Loader2,
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  Building2,
} from "lucide-react";
import ChartAreaGradient from "@/components/mf/charts/ChartAreaGradient";
import ProgressBarChart from "@/components/mf/charts/ProgressBarChart";
import {
  useFraudCategories,
  useFraudSubCategoryProgressBar,
  useDateWiseFraudSubCategory,
  usePublisherWiseFraudSubCategory,
 
  type DashboardPayload,
} from "../../../hooks/useDashboard";
import { CHART_COLORS } from "../constants";

interface InDepthAnomalyAnalysisProps {
  selectedType: "click" | "conversion" | "event";
  query: {
    publishers: string[];
    campaigns: string[];
    country: string[];
    event_type: string[];
    agency: string[];
  };
  onclickvalue: string;
  setonclickvalue: (value: string) => void;
  filterApisCompleted: boolean;
  isInitialLoading: boolean;
  onDonutSegmentClick: (data: any) => void;
}

const InDepthAnomalyAnalysis = ({
  selectedType,
  query,
  onclickvalue,
  setonclickvalue,
  filterApisCompleted,
  onDonutSegmentClick,
  isInitialLoading,
}:InDepthAnomalyAnalysisProps) => {
  const { selectedPackage, isPackageLoading } = usePackage();
  const { startDate, endDate } = useDateRange();
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedRadio1, setSelectedRadio1] = useState<"Publisher" | "Vendor">(
    "Publisher"
  );

  // Export states
  const [isExportingFraudCategories, setIsExportingFraudCategories] =
    useState(false);
  const [isExportingProgressBar, setIsExportingProgressBar] = useState(false);
  const [isExportingAreaChart, setIsExportingAreaChart] = useState(false);
  const [isExportingReattribution, setIsExportingReattribution] =
    useState(false);

  // Analysis Insights related state
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedSampleType, setSelectedSampleType] = useState<string>("table");
  const [searchTermIncent, setSearchTermIncent] = useState("");
  const [tableDataIncent, setTableDataIncent] = useState<any[]>([]);
  const [chartDataIncent, setChartDataIncent] = useState<any[]>([]);
  const [charttitle, setCharttitle] = useState<any>("");
  const [chartConfigIncent, setChartConfigIncent] = useState<any>({});
  const [dynamicTableColumns, setDynamicTableColumns] = useState<any[]>([]);
  const [progressDataIncent, setProgressDataIncent] = useState<any[]>([]);
  const [progresstitle, setProgresstitle] = useState("");
  const [progressConfigIncent, setProgressConfigIncent] = useState<any>({});

  // Map selectedType for API calls (event uses click endpoint)
  const apiType = selectedType as "click" | "conversion" | "event";

  // Base payload for all API calls
  const basePayload = useMemo<DashboardPayload | undefined>(() => {
    if (!selectedPackage || !startDate || !endDate) {
      return undefined;
    }
    return {
      start_date: startDate,
      end_date: endDate,
      package_name: selectedPackage,
      publisher: query.publishers,
      vendor_id: query.agency,
      campaign_id: query.campaigns,
      country: query.country,
      ...(selectedType === "event" && { event_type: query.event_type }),
    };
  }, [
    startDate,
    endDate,
    selectedPackage,
    query.publishers,
    query.agency,
    query.campaigns,
    query.country,
    query?.event_type,
    selectedType,
  ]);

  // Fraud Categories Payload
  const fraudCategoriesPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!basePayload) return undefined;
    return basePayload;
  }, [basePayload]);

    // Fraud Categories API
    const { data: fraudCategoriesData, isLoading: isLoadingFraudCategories } =
    useFraudCategories(
      apiType,
      fraudCategoriesPayload,
      !!fraudCategoriesPayload &&
        !isExportingFraudCategories &&
        filterApisCompleted &&
        !isPackageLoading
    );

     // Extract first label from fraud categories data for default value
  const firstFraudCategoryLabel = useMemo(() => {
    if (!fraudCategoriesData) return null;
    const data = Array.isArray(fraudCategoriesData)
      ? fraudCategoriesData
      : fraudCategoriesData?.data || [];
    return data.length > 0 ? data[0]?.label : null;
  }, [fraudCategoriesData]);

  // Progress Bar Payload
  const progressBarPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!basePayload) return undefined;
    return {
      ...basePayload,
      category: onclickvalue || firstFraudCategoryLabel,
    };
  }, [basePayload, onclickvalue]);

  // Area Chart Payload
  const areaChartPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!basePayload) return undefined;
    return {
      ...basePayload,
      category: onclickvalue || firstFraudCategoryLabel,
      frequency: "daily",
    };
  }, [basePayload, onclickvalue]);

  // Reattribution Payload
  const reattributionPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!basePayload) return undefined;
    return {
      ...basePayload,
      category: onclickvalue || firstFraudCategoryLabel,
      type: selectedRadio1 === "Vendor" ? "agency" : "publisher",
    };
  }, [basePayload, onclickvalue, selectedRadio1]);


  // CSV Export Payloads
  const fraudCategoriesExportPayload = useMemo<
    DashboardPayload | undefined
  >(() => {
    if (!basePayload || !isExportingFraudCategories) return undefined;
    return {
      ...basePayload,
      export_type: "csv",
    };
  }, [basePayload, isExportingFraudCategories]);

  const progressBarExportPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!progressBarPayload || !isExportingProgressBar) return undefined;
    return {
      ...progressBarPayload,
      export_type: "csv",
    };
  }, [progressBarPayload, isExportingProgressBar]);

  const areaChartExportPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!areaChartPayload || !isExportingAreaChart) return undefined;
    return {
      ...areaChartPayload,
      export_type: "csv",
    };
  }, [areaChartPayload, isExportingAreaChart]);

  const reattributionExportPayload = useMemo<
    DashboardPayload | undefined
  >(() => {
    if (!reattributionPayload || !isExportingReattribution) return undefined;
    return {
      ...reattributionPayload,
      export_type: "csv",
    };
  }, [reattributionPayload, isExportingReattribution]);




  // Progress Bar API
  const { data: progressBarData, isLoading: isLoadingProgressBar } =
    useFraudSubCategoryProgressBar(
      apiType,
      progressBarPayload,
      !!progressBarPayload &&
        !isExportingProgressBar &&
        filterApisCompleted &&
        !isPackageLoading &&
        !isLoadingFraudCategories &&
        (!!onclickvalue || !!firstFraudCategoryLabel)
    );

  // Area Chart API
  const { data: areaChartData, isLoading: isLoadingAreaChart } =
    useDateWiseFraudSubCategory(
      apiType,
      areaChartPayload,
      !!areaChartPayload &&
        !isExportingAreaChart &&
        filterApisCompleted &&
        !isPackageLoading &&
        !isLoadingFraudCategories &&
        (!!onclickvalue || !!firstFraudCategoryLabel)
    );

  // Reattribution API
  const { data: reattributionData, isLoading: isLoadingReattribution } =
    usePublisherWiseFraudSubCategory(
      apiType,
      reattributionPayload,
      !!reattributionPayload &&
        !isExportingReattribution &&
        filterApisCompleted &&
        !isPackageLoading &&
        !isLoadingFraudCategories &&
        (!!onclickvalue || !!firstFraudCategoryLabel)
    );

  // Export API Hooks
  const { data: fraudCategoriesExportData } = useFraudCategories(
    apiType,
    fraudCategoriesExportPayload,
    !!fraudCategoriesExportPayload
  );

  const { data: progressBarExportData } = useFraudSubCategoryProgressBar(
    apiType,
    progressBarExportPayload,
    !!progressBarExportPayload
  );

  const { data: areaChartExportData } = useDateWiseFraudSubCategory(
    apiType,
    areaChartExportPayload,
    !!areaChartExportPayload
  );

  const { data: reattributionExportData } = usePublisherWiseFraudSubCategory(
    apiType,
    reattributionExportPayload,
    !!reattributionExportPayload
  );

  const donutConfig = useMemo(() => {
    return { visit: { label: "Count", color: CHART_COLORS[0]  } };
  }, []);

  // ============================================================================
  // CSV EXPORT HANDLERS
  // ============================================================================

  useEffect(() => {
    if (fraudCategoriesExportData?.url) {
      exportCsvFromUrl({
        url: fraudCategoriesExportData.url,
        filename: "fraud_categories",
        onSuccess: () => {
          setIsExportingFraudCategories(false);
        },
      });
    }
  }, [fraudCategoriesExportData]);

  useEffect(() => {
    if (progressBarExportData?.url) {
      exportCsvFromUrl({
        url: progressBarExportData.url,
        filename: "fraud_sub_categories",
        onSuccess: () => {
          setIsExportingProgressBar(false);
        },
      });
    }
  }, [progressBarExportData]);

  useEffect(() => {
    if (areaChartExportData?.url) {
      exportCsvFromUrl({
        url: areaChartExportData.url,
        filename: "date_wise_fraud_sub_categories",
        onSuccess: () => {
          setIsExportingAreaChart(false);
        },
      });
    }
  }, [areaChartExportData]);

  useEffect(() => {
    if (reattributionExportData?.url) {
      exportCsvFromUrl({
        url: reattributionExportData.url,
        filename: "publisher_wise_fraud_sub_categories",
        onSuccess: () => {
          setIsExportingReattribution(false);
        },
      });
    }
  }, [reattributionExportData]);

  const handleDonutSegmentClick = (data: any) => {
    setonclickvalue(data?.label || data?.name);
  };

  return (
    <>
      {/* Modern Card Container with Glassmorphism */}
      <div className="flex flex-col w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-2 transition-all duration-300">
        <div className="w-full space-y-2">
          {/* Modern Section Header */}
          <div className="w-full">
            <div className="flex items-center justify-center gap-2">
        <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full dark:from-primary dark:to-white" />
        <h2 className="text-header font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white]">
                In-Depth Anomaly Analysis
              </h2>
        <div className="h-8 w-1 bg-gradient-to-b from-secondary to-primary rounded-full dark:from-white dark:to-primary" />
            </div>
          </div>

          {/* Charts Grid */}
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-2 transition-all duration-300">
              {/* Fraud Categories Donut Chart */}
              <div
                ref={(el) => {
                  if (el) cardRefs.current["fraud_categories"] = el;
                }}
                className="transition-all duration-300 hover:shadow-xl"
              >
                <DonutChart
                  chartData={
                    Array.isArray(fraudCategoriesData)
                      ? fraudCategoriesData
                      : fraudCategoriesData?.data || []
                  }
                  chartConfig={donutConfig}
                  title="Fraud Categories"
                  titleIcon={
                                   <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                  <PieChart className="w-5 h-5 text-white" />
                  </span>}
                  handleExportCsv={() => {
                    setIsExportingFraudCategories(true);
                  }}
                  handleExportPng={createPngExportHandler({
                    cardRefs,
                    key: "fraud_categories",
                    filename: "Fraud Categories",
                  })}
                  handleExpand={createExpandHandler({
                    key: "fraud_categories",
                    cardRefs,
                    expandedCard,
                    setExpandedCard,
                  })}
                  exportKey="fraud_categories"
                  isLoading={
                    isLoadingFraudCategories && !isExportingFraudCategories
                  }
                  dataKey="visit"
                  nameKey="label"
                  isView={true}
                  direction="flex-col"
                  isdonut={false}
                  marginTop="mt-0"
                  position="items-start"
                  isPercentage={false}
                  isPercentageValue={true}
                  istotalvistors={false}
                  onSegmentClick={onDonutSegmentClick}
                  cardHeight="19.6875rem"
                  contentHeight="14.375rem"
                  displayMode="both"
                  legendClickable={true}
                />
              </div>

              {/* Progress Bar Chart */}
              <div
                ref={(el) => {
                  if (el) cardRefs.current["fraud_sub_categories"] = el;
                }}
                className="col-span-2 transition-all duration-300 hover:shadow-xl"
              >
                <ProgressBarChart
                  cardHeight="19.6875rem"
                  contentHeight="14.375rem"
                  chartData={
                    Array.isArray(progressBarData)
                      ? progressBarData
                      : progressBarData?.data || []
                  }
                  title={`Fraud Sub Categories for ${onclickvalue ? `${onclickvalue}` : firstFraudCategoryLabel}`}
                  titleIcon={
                                   <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                  <BarChart3 className="w-5 h-5 text-white" />
                  </span>}
                  isLoading={
                    (isLoadingProgressBar) &&
                    !isExportingProgressBar
                  }
                  handleExportCsv={() => {
                    setIsExportingProgressBar(true);
                  }}
                  handleExpand={createExpandHandler({
                    key: "fraud_sub_categories",
                    cardRefs,
                    expandedCard,
                    setExpandedCard,
                  })}
                  handleExportPng={createPngExportHandler({
                    cardRefs,
                    key: "fraud_sub_categories",
                    filename: "Fraud Sub Categories",
                  })}
                  exportKey="fraud_sub_categories"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - Date Wise & Publisher/Vendor Analysis */}
        <div className="w-full mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Area Chart */}
            <div
              ref={(el) => {
                if (el) cardRefs.current["date_wise_fraud_sub_categories"] = el;
              }}
              className="transition-all duration-300 h-auto hover:shadow-xl"
            >
              <ChartAreaGradient
                chartData={areaChartData?.data || []}
                chartConfig={areaChartData?.config || {}}
                XaxisLine={true}
                Xdatakey="label"
                CartesianGridVertical={true}
                title={`Date Wise Fraud Sub Categories For ${onclickvalue ? `${onclickvalue}` : firstFraudCategoryLabel}`}
                titleIcon={
                                 <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                <TrendingUp className="w-5 h-5 text-white" />
                </span>}
                handleExportCsv={() => {
                  setIsExportingAreaChart(true);
                }}
                handleExpand={createExpandHandler({
                  key: "date_wise_fraud_sub_categories",
                  cardRefs,
                  expandedCard,
                  setExpandedCard,
                })}
                handleExportPng={createPngExportHandler({
                  cardRefs,
                  key: "date_wise_fraud_sub_categories",
                  filename: "Date Wise Fraud Sub Categories",
                })}
                exportKey="date_wise_fraud_sub_categories"
                isLoading={
                  (isLoadingAreaChart) &&
                  !isExportingAreaChart
                }
                cardHeight="18rem"
                height="12rem"
                contentHeight="11rem"
                chartMargins={{ top: 0, right: -10, left: -10, bottom: 0 }}
              />
            </div>

            {/* Stacked Bar Chart */}
            <div>
              <StackedBarChart
                ref={(el) => {
                  if (el)
                    cardRefs.current["publisher_vendor_fraud_sub_categories"] =
                      el;
                }}
                chartData={reattributionData?.data || []}
                chartConfig={reattributionData?.config || {}}
                title={
                  selectedRadio1 === "Publisher"
                    ? `Publisher Wise Fraud Sub Categories For ${onclickvalue ? `${onclickvalue}` : firstFraudCategoryLabel}`
                    : `Agency Wise Fraud Sub Categories For ${onclickvalue ? `${onclickvalue}` : firstFraudCategoryLabel} Trend`
                }
                titleIcon={
                                   <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                  {selectedRadio1 === "Publisher" ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <Building2 className="w-5 h-5 text-white" />
                  )}
                  </span>
                }
                handleExportCsv={() => {
                  setIsExportingReattribution(true);
                }}
                handleExportPng={createPngExportHandler({
                  cardRefs,
                  key: "publisher_vendor_fraud_sub_categories",
                  filename: `${selectedRadio1 === "Publisher" ? "Publisher" : "Agency"} Wise Fraud Sub Categories`,
                })}
                handleExpand={createExpandHandler({
                  key: "publisher_vendor_fraud_sub_categories",
                  cardRefs,
                  expandedCard,
                  setExpandedCard,
                })}
                exportKey="publisher_vendor_fraud_sub_categories"
                isLoading={
                  (isLoadingReattribution) &&
                  !isExportingReattribution
                }
                isHorizontal={true}
                isInformCard={false}
                isLegend={true}
                isCartesian={true}
                yAxis={{ dataKey: "label" }}
                AxisLabel="Count"
                filterType="radio"
                filterOptions={[
                  { value: "Publisher", label: "Publisher" },
                  { value: "Vendor", label: "Agency" },
                ]}
                selectedFilterValue={selectedRadio1}
                handleFilterChange={(value: string | string[]) =>
                  setSelectedRadio1(value as "Publisher" | "Vendor")
                }
                showMenu={true}
                barHeight="13rem"
                cardHeight="18rem"
                chartMargins={{ top: 0, right: -10, left: -10, bottom: 0 }}
              />
            </div>
          </div>
        </div>
      </div>

      
    </>
  );
};

export default InDepthAnomalyAnalysis;
