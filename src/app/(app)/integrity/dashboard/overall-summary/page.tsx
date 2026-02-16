"use client";
import React, { useState, useMemo, useRef, useEffect, lazy } from "react";
import StackedBarWithLine from "@/components/mf/charts/StackedBarwithLine";
import { usePackage } from "@/components/mf/PackageContext";
import { useDateRange } from "@/components/mf/DateRangeContext";
import DonutChart from "@/components/mf/charts/DonutChart";
import StatsCards from "@/components/mf/StatsCards";
const Publisher = lazy(() => import("./Publisher"));
const InDepthAnomalyAnalysis = lazy(() => import("./InDepthAnomalyAnalysis"));
const AnalysisInsights = lazy(() => import("./AnalysisInsights"));
import { Filter } from "@/components/mf/Filters/Filter";
import { MobileFilterSidebar } from "@/components/mf/Filters/MobileFilterSidebar";
import { ToggleButton } from "@/components/mf/ToggleButton";
import LazyComponentWrapper from "@/components/mf/LazyComponentWrapper";
import {
  PieChart,
  TrendingUp,
  Download,
  CheckCircle2,
XCircle,
TriangleAlert,
Eye,
MousePointerClick,
Filter as FilterIcon

} from "lucide-react";

// Hooks (API calls)
import {
  useTotalPercentage,
  useDateWiseTrend,
  usePublisherVendorTrend,
  useSplitOfSources,
  useFraudCategories,
  useFraudSubCategoryProgressBar,
  useDateWiseFraudSubCategory,
  usePublisherWiseFraudSubCategory,
  useFraudSubCategory,
  useFraudSubCategoryDetails,
  usePublishersFilter,
  useCampaignsFilter,
  useCountryFilter,
  type DashboardPayload,
  type FilterPayload,
  type PublisherApiResponse,
} from "../../hooks/useIntegrityDashboard";
import { COLOR_PALETTE, CHART_COLORS, getPercentageKey, DW_TREND_FREQUENCY_MAP } from "./constants";

const DW_TREND_SELECT_OPTIONS = ["Daily", "Weekly", "Monthly"];

import { Button } from "@/components/ui/button";
import {
  createExpandHandler,
  createPngExportHandler,
  exportCsvFromUrl,
} from "@/lib/utils";
import {
  buildSimpleFilter,
  buildPublisherFilter,
  extractSelectedValues,
} from "../../hooks/useFilterHelpers";

const Dashboard = () => {
  const { selectedPackage, isPackageLoading } = usePackage();
  const { startDate, endDate } = useDateRange();
  const [selectedType, setSelectedType] = useState<"impression" | "click">(
    "impression"
  );
  const [onclickvalue, setonclickvalue] = useState("");
  const [dwTrendSelectedFrequency, setDwTrendSelectedFrequency] =
  useState("Daily");
  const [selectedRadio1, setSelectedRadio1] = useState<"Publisher" | "Vendor">("Publisher");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Analysis Insights States
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>("table");
  const [searchTermIncent, setSearchTermIncent] = useState("");

  // Export states grouped
  const [exporting, setExporting] = useState({
    fraudCategories: false,
    progressBar: false,
    areaChart: false,
    reattribution: false,
    dwTrend: false,
    publisherVendor: false,
    splitOfSources: false,
  });

  // Refs
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // ============================================================================
  // FILTER SYSTEM - New Pattern
  // ============================================================================
  
  const baseFilterPayload = useMemo<FilterPayload | undefined>(() => {
    if (!selectedPackage || isPackageLoading) return undefined;
    return {
      package_name: selectedPackage,
      start_date: startDate,
      end_date: endDate,
    };
  }, [selectedPackage, isPackageLoading, startDate, endDate]);

  // Filter API Hooks
  const { data: publishersData, isLoading: isLoadingPublishers } = 
    usePublishersFilter(selectedType, baseFilterPayload, !!baseFilterPayload);
  
  const { data: campaignsData, isLoading: isLoadingCampaigns } = 
    useCampaignsFilter(selectedType, baseFilterPayload, !!baseFilterPayload);
  
  const { data: countryData, isLoading: isLoadingCountry } = 
    useCountryFilter(selectedType, baseFilterPayload, !!baseFilterPayload);

  // Filter State
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>(["all"]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(["all"]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["all"]);

  // Reset filters when type changes
  useEffect(() => {
    setSelectedPublishers(["all"]);
    setSelectedCampaigns(["all"]);
    setSelectedCountries(["all"]);
  }, [selectedType, selectedPackage, startDate, endDate]);

  // Build UI Filter Configs
  const publishersFilter = useMemo(
    () => buildPublisherFilter(publishersData, selectedPublishers, isLoadingPublishers),
    [publishersData, selectedPublishers, isLoadingPublishers]
  );

  const otherFilters = useMemo(() => ({
    Campaigns: buildSimpleFilter(campaignsData, selectedCampaigns, isLoadingCampaigns),
    Country: buildSimpleFilter(countryData, selectedCountries, isLoadingCountry),
  }), [
    campaignsData,
    countryData,
    selectedCampaigns,
    selectedCountries,
    isLoadingCampaigns,
    isLoadingCountry,
  ]);

  // Filter Change Handlers
  const handlePublisherFilterChange = (newState: any) => {
    const Publishers = newState.Publishers;
    if (Publishers) {
      setSelectedPublishers(extractSelectedValues(Publishers));
    }
  };

  const handleOtherFiltersChange = (newState: any) => {
    if (newState.Campaigns) {
      setSelectedCampaigns(extractSelectedValues(newState.Campaigns));
    }
    if (newState.Country) {
      setSelectedCountries(extractSelectedValues(newState.Country));
    }
  };

  // ============================================================================
  // DASHBOARD PAYLOAD
  // ============================================================================

  const baseDashboardPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!selectedPackage || isPackageLoading) return undefined;
    return {
      start_date: startDate,
      end_date: endDate,
      package_name: selectedPackage,
      publisher: selectedPublishers,
      campaign_id: selectedCampaigns,
      country: selectedCountries,
    };
  }, [
    selectedPackage,
    isPackageLoading,
    startDate,
    endDate,
    selectedPublishers,
    selectedCampaigns,
    selectedCountries,
  ]);

  // Date Wise Trend API Payload
  const dwTrendPayload = {
    ...baseDashboardPayload,
    frequency: DW_TREND_FREQUENCY_MAP[dwTrendSelectedFrequency] || "daily",
  };

  // CSV Export Payloads - Only create when exporting
  const splitOfSourcesExportPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!exporting.splitOfSources || !baseDashboardPayload) {
      return undefined;
    }
    return {
      ...baseDashboardPayload,
      export_type: "csv",
    };
  }, [baseDashboardPayload, exporting.splitOfSources]);

  const dateWiseTrendExportPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!exporting.dwTrend || !dwTrendPayload) {
      return undefined;
    }
    return {
      ...dwTrendPayload,
      export_type: "csv",
    };
  }, [dwTrendPayload, exporting.dwTrend]);

  const publisherVendorTrendExportPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!exporting.publisherVendor || !baseDashboardPayload) {
      return undefined;
    }
    return {
      ...baseDashboardPayload,
      export_type: "csv",
    };
  }, [baseDashboardPayload, exporting.publisherVendor]);

  // Total Percentage API Hook
  const { data: totalPercentageData, isLoading: isLoadingTotalPercentage } =
    useTotalPercentage(
      selectedType,
      baseDashboardPayload,
      !!baseDashboardPayload
    );

  // Split of Sources API Hook
  const {
    data: splitOfSourcesData,
    isLoading: isLoadingSplitOfSources,
    refetch: refetchSplitOfSources,
  } = useSplitOfSources(
    selectedType,
    baseDashboardPayload,
    !!baseDashboardPayload && !exporting.splitOfSources
  );

  // Date Wise Trend API Hook
  const {
    data: dwTrendData,
    isLoading: isLoadingDwTrend,
    refetch: refetchDwTrend,
  } = useDateWiseTrend(
    selectedType,
    dwTrendPayload,
    !!dwTrendPayload && !exporting.dwTrend
  );

  // Publisher Vendor Trend API Hook
  const {
    data: publisherVendorData,
    isLoading: isLoadingPublisherVendor,
    refetch: refetchPublisherVendor,
  } = usePublisherVendorTrend(
    selectedType,
    baseDashboardPayload,
    !!baseDashboardPayload && !exporting.publisherVendor
  );

  // Fraud Categories API Hook
  const {
    data: fraudCategoriesData,
    isLoading: isLoadingFraudCategories,
    refetch: refetchFraudCategories,
  } = useFraudCategories(
    selectedType,
    baseDashboardPayload,
    !!baseDashboardPayload && !exporting.fraudCategories
  );

  const donutChartConfig = useMemo(() => {
    return { visit: { label: "Count", color: CHART_COLORS[0] } };
  }, []);

  // Extract first label from fraud categories data for default value
  const firstFraudCategoryLabel = useMemo(() => {
    if (!fraudCategoriesData) return null;
    const data = Array.isArray(fraudCategoriesData)
      ? fraudCategoriesData
      : fraudCategoriesData?.data || [];
    return data.length > 0 ? data[0]?.label : null;
  }, [fraudCategoriesData]);

  // Set default onclickvalue to first fraud category label when available
  useEffect(() => {
    if (firstFraudCategoryLabel && !onclickvalue) {
      setonclickvalue(firstFraudCategoryLabel);
    }
  }, [firstFraudCategoryLabel, onclickvalue]);

  // Fraud Sub Category Progress Bar Payload
  const progressBarPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!baseDashboardPayload) {
      return undefined;
    }
    const category = onclickvalue || firstFraudCategoryLabel;
    if (!category) {
      return undefined;
    }
    return {
      ...baseDashboardPayload,
      category: category,
    };
  }, [baseDashboardPayload, onclickvalue, firstFraudCategoryLabel]);

  // Fraud Sub Category Progress Bar API Hook
  const {
    data: progressBarDataResponse,
    isLoading: isLoadingProgressBar,
    refetch: refetchProgressBar,
  } = useFraudSubCategoryProgressBar(
    selectedType,
    progressBarPayload,
    !!progressBarPayload && !exporting.progressBar
  );

  // Date Wise Fraud Sub Category Payload
  const areaChartPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!baseDashboardPayload) {
      return undefined;
    }
    const category = onclickvalue || firstFraudCategoryLabel;
    if (!category) {
      return undefined;
    }
    return {
      ...baseDashboardPayload,
      category: category,
      frequency: "daily",
    };
  }, [baseDashboardPayload, onclickvalue, firstFraudCategoryLabel]);

  // Date Wise Fraud Sub Category API Hook
  const {
    data: areaChartDataResponse,
    isLoading: isLoadingAreaChart,
    refetch: refetchAreaChart,
  } = useDateWiseFraudSubCategory(
    selectedType,
    areaChartPayload,
    !!areaChartPayload && !exporting.areaChart
  );

  // Publisher Wise Fraud Sub Category Payload
  const reattributionPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!baseDashboardPayload) {
      return undefined;
    }
    const category = onclickvalue || firstFraudCategoryLabel;
    if (!category) {
      return undefined;
    }
    return {
      ...baseDashboardPayload,
      category: category,
      type: selectedRadio1 === "Vendor" ? "agency" : "publisher",
    };
  }, [baseDashboardPayload, onclickvalue, firstFraudCategoryLabel, selectedRadio1]);

  // Publisher Wise Fraud Sub Category API Hook
  const {
    data: reattributionData,
    isLoading: isLoadingReattribution,
    refetch: refetchReattribution,
  } = usePublisherWiseFraudSubCategory(
    selectedType,
    reattributionPayload,
    !!reattributionPayload && !exporting.reattribution
  );

  // Fraud Sub Category Payload (for Analysis Insights)
  const fraudSubCategoryPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!baseDashboardPayload) {
      return undefined;
    }
    const category = onclickvalue || firstFraudCategoryLabel;
    if (!category) {
      return undefined;
    }
    return {
      ...baseDashboardPayload,
      category: category,
    };
  }, [baseDashboardPayload, onclickvalue, firstFraudCategoryLabel]);

  // Fraud Sub Category API Hook
  const {
    data: fraudSubCategoryData,
    isLoading: fraudSubCategoryLoading,
  } = useFraudSubCategory(
    selectedType,
    fraudSubCategoryPayload,
    !!fraudSubCategoryPayload
  );

  // Fraud Sub Category Details Payload
  const fraudSubCategoryDetailsPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!baseDashboardPayload || !selectedKey) {
      return undefined;
    }
    const category = onclickvalue || firstFraudCategoryLabel;
    if (!category) {
      return undefined;
    }
    return {
      ...baseDashboardPayload,
      category: category,
      fraud_sub_category: selectedKey,
    };
  }, [baseDashboardPayload, selectedKey, onclickvalue, firstFraudCategoryLabel]);

  // Fraud Sub Category Details API Hook
  const {
    data: fraudSubCategoryDetailsData,
    isLoading: fraudSubCategoryDetailsLoading,
  } = useFraudSubCategoryDetails(
    selectedType,
    fraudSubCategoryDetailsPayload,
    !!fraudSubCategoryDetailsPayload &&
      (selectedAnalysisType === "table" ||
        selectedAnalysisType === "graph" ||
        selectedAnalysisType === "carousel" ||
        selectedAnalysisType === "progress")
  );

  // CSV Export API Hooks
  const {
    data: splitOfSourcesExportData,
    refetch: refetchSplitOfSourcesExport,
  } = useSplitOfSources(
    selectedType,
    splitOfSourcesExportPayload,
    !!splitOfSourcesExportPayload
  );

  const {
    data: dateWiseTrendExportData,
    refetch: refetchDateWiseTrendExport,
  } = useDateWiseTrend(
    selectedType,
    dateWiseTrendExportPayload,
    !!dateWiseTrendExportPayload
  );

  const {
    data: publisherVendorTrendExportData,
    refetch: refetchPublisherVendorTrendExport,
  } = usePublisherVendorTrend(
    selectedType,
    publisherVendorTrendExportPayload,
    !!publisherVendorTrendExportPayload
  );


  // Compute split of sources chart data and config from API response
  const { splitOfSourcesChartData, splitOfSourcesChartConfig } = useMemo(() => {
    if (!splitOfSourcesData) {
      return { splitOfSourcesChartData: [], splitOfSourcesChartConfig: {} };
    }

    const response = Array.isArray(splitOfSourcesData)
      ? splitOfSourcesData
      : splitOfSourcesData?.data || [];

    const labelColorMap: Record<string, string> = {};
    let colorIndex = 0;
    const mapped = (response || [])
      .filter((item: any) => (item?.total_count || 0) > 0)
      .map((item: any) => {
        const label = item?.source_type || item?.label || item?.name || item?.category || "";
        if (!labelColorMap[label]) {
          labelColorMap[label] =
            COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
          colorIndex++;
        }
        const visit = item?.total_count || item?.count || item?.value || item?.visit || 0;
        const percentage = item?.[getPercentageKey(label)] || item?.percentage || item?.percent || "";
        return {
          label,
          visit,
          percentage,
          fill: labelColorMap[label] || "",
        };
      });

    const config: Record<string, { label: string; color: string }> = {};
    mapped.forEach((item) => {
      if (item?.label) {
        config[item.label] = { label: item.label || "", color: item.fill || "" };
      }
    });

    return {
      splitOfSourcesChartData: mapped,
      splitOfSourcesChartConfig: config,
    };
  }, [splitOfSourcesData]);


  const handleDwTrendFrequencyChange = (value: string) => {
    setDwTrendSelectedFrequency(value);
  };

  const handleDonutClick = (data: any) => {
    setonclickvalue(data?.label || data?.name);
  };

  // Process fraud sub category data for Analysis Insights
  const [tableDataIncent, setTableDataIncent] = useState<any[]>([]);
  const [chartDataIncent, setChartDataIncent] = useState<any[]>([]);
  const [chartConfigIncent, setChartConfigIncent] = useState<any>({});
  const [dynamicTableColumns, setDynamicTableColumns] = useState<any[]>([]);
  const [progressDataIncent, setProgressDataIncent] = useState<any[]>([]);

  // Update fraud sub categories when data changes
  useEffect(() => {
    if (fraudSubCategoryData && Array.isArray(fraudSubCategoryData)) {
      if (fraudSubCategoryData.length > 0 && !selectedKey) {
        setSelectedKey(fraudSubCategoryData[0]?.fraud_subcategory || null);
        setSelectedAnalysisType(fraudSubCategoryData[0]?.type || "table");
      } else if (fraudSubCategoryData.length === 0) {
        setSelectedKey(null);
        setSelectedAnalysisType("table");
        setTableDataIncent([]);
        setChartDataIncent([]);
        setDynamicTableColumns([]);
        setProgressDataIncent([]);
      }
    }
  }, [fraudSubCategoryData, selectedKey]);

  // Process fraud sub category details data
  useEffect(() => {
    if (
      fraudSubCategoryDetailsData?.data &&
      Array.isArray(fraudSubCategoryDetailsData.data) &&
      fraudSubCategoryDetailsData.data.length > 0
    ) {
      if (selectedAnalysisType === "table") {
        const firstItem = fraudSubCategoryDetailsData.data[0];
        const columns = Object.keys(firstItem || {}).map((key) => ({
          title: (key || "")
            .split("_")
            .map((word) => (word?.charAt(0) || "").toUpperCase() + (word?.slice(1) || ""))
            .join(" "),
          key: key || "",
        }));
        setDynamicTableColumns(columns);
        setTableDataIncent(fraudSubCategoryDetailsData.data || []);
      } else if (selectedAnalysisType === "graph") {
        const chartData = (fraudSubCategoryDetailsData.data || []).map((item: any) => ({
          label: item?.bucket || "",
          percentage: item?.percentage || "",
        }));
        const chartConfig = {
          percentage: { label: "Percentage", color: "#2563eb" },
        };
        setChartDataIncent(chartData);
        setChartConfigIncent(chartConfig);
      } else if (selectedAnalysisType === "progress") {
        const progressData = (fraudSubCategoryDetailsData.data || []).map(
          (item: any) => ({
            visit: item?.visit || 0,
            label: item?.label || "",
            percentage: item?.percentage ? item.percentage : "-",
            fill: item?.fill || "",
          })
        );
        setProgressDataIncent(progressData);
      }
    } else {
      setTableDataIncent([]);
      setChartDataIncent([]);
      setDynamicTableColumns([]);
      setProgressDataIncent([]);
    }
  }, [fraudSubCategoryDetailsData, selectedAnalysisType]);

  // Handle CSV export responses
  useEffect(() => {
    if (splitOfSourcesExportData?.url) {
      exportCsvFromUrl({
        url: splitOfSourcesExportData.url,
        filename: "Split Of Sources",
        onSuccess: () => {
          setExporting((prev) => ({ ...prev, splitOfSources: false }));
    },
  });
    }
  }, [splitOfSourcesExportData]);

  useEffect(() => {
    if (dateWiseTrendExportData?.url) {
      exportCsvFromUrl({
        url: dateWiseTrendExportData.url,
        filename: "Date Wise Trend",
        onSuccess: () => {
          setExporting((prev) => ({ ...prev, dwTrend: false }));
        },
      });
    }
  }, [dateWiseTrendExportData]);

  useEffect(() => {
    if (publisherVendorTrendExportData?.url) {
      exportCsvFromUrl({
        url: publisherVendorTrendExportData.url,
        filename: "Publisher Vendor Trend",
        onSuccess: () => {
          setExporting((prev) => ({ ...prev, publisherVendor: false }));
        },
      });
    }
  }, [publisherVendorTrendExportData]);

  // Loading states
  const isStatsLoading = useMemo(() => {
    return (
      isLoadingPublishers ||
      isLoadingTotalPercentage ||
      isPackageLoading
    );
  }, [isLoadingPublishers, isLoadingTotalPercentage, isPackageLoading]);

  const isSplitSourcesLoading = useMemo(() => {
    return (
      isLoadingPublishers ||
      (isLoadingSplitOfSources && !exporting.splitOfSources) ||
      isPackageLoading
    );
  }, [isLoadingPublishers, isLoadingSplitOfSources, exporting.splitOfSources, isPackageLoading]);

  const isDataApiLoading = useMemo(() => {
    return (
      isLoadingPublishers ||
      (isLoadingDwTrend && !exporting.dwTrend) ||
      isPackageLoading
    );
  }, [isLoadingPublishers, isLoadingDwTrend, exporting.dwTrend, isPackageLoading]);

  const isPublisherVendorLoading = useMemo(() => {
    return (
      isLoadingPublishers ||
      (isLoadingPublisherVendor && !exporting.publisherVendor) ||
      isPackageLoading
    );
  }, [isLoadingPublishers, isLoadingPublisherVendor, exporting.publisherVendor, isPackageLoading]);

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        {/* Filters Row + Toggle */}
        <div className="sticky top-0 z-50 dark:bg-card bg-white border border-border/40 rounded-xl shadow-lg mt-2">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 p-2 sm:p-2">
            {/* Mobile Filter Button */}
            <div className="lg:hidden w-full flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2"
              >
                <FilterIcon className="w-4 h-4" />
                <span>Filters</span>
                {(() => {
                  const totalFilters = 
                    publishersFilter.selectedCount +
                    Object.values(otherFilters).reduce(
                      (sum, f) => sum + (f?.selectedCount || 0),
                      0
                    );
                  return totalFilters > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-subBody font-semibold dark:text-white">
                      {totalFilters}
                    </span>
                  );
                })()}
              </Button>
              <ToggleButton
                options={[
                  { label: "Impression", value: "impression" },
                  { label: "Click", value: "click" },
                ]}
                selectedValue={selectedType}
                onChange={(value) =>
                  setSelectedType(value as "click" | "impression")
                }
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2 w-full">
              <div className="shrink-0">
                <Filter
                  key={`publishers-${selectedType}-${selectedPackage}-${startDate}-${endDate}`}
                  filter={{ Publishers: publishersFilter }}
                  onChange={handlePublisherFilterChange}
                  grouped={true}
                  publisherGroups={{ Publishers: publishersData || {} }}
                />
              </div>
              <div className="shrink-0">
                <Filter
                  key={`other-${selectedType}-${selectedPackage}-${startDate}-${endDate}`}
                  filter={otherFilters}
                  onChange={handleOtherFiltersChange}
                  grouped={false}
                />
              </div>
            </div>

            {/* Desktop Toggle */}
            <div className="hidden lg:block self-end lg:self-auto shrink-0">
              <ToggleButton
                options={[
                  { label: "Impression", value: "impression" },
                  { label: "Click", value: "click" },
                ]}
                selectedValue={selectedType}
                onChange={(value) =>
                  setSelectedType(value as "click" | "impression")
                }
              />
            </div>
          </div>
        </div>

        {/* Mobile Filter Sidebar */}
        <MobileFilterSidebar
          key={`mobile-filters-${selectedType}-${selectedPackage}-${startDate}-${endDate}`}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          filter={{
            Publishers: publishersFilter,
            ...otherFilters,
          }}
          onChange={(newState) => {
            const { Publishers, ...rest } = newState;
            
            if (Publishers) {
              handlePublisherFilterChange({ Publishers });
            }
            if (Object.keys(rest).length > 0) {
              handleOtherFiltersChange(rest);
            }
          }}
          onApply={() => setIsMobileFilterOpen(false)}
          onCancel={() => setIsMobileFilterOpen(false)}
          grouped={true}
          publisherGroups={{ Publishers: publishersData || {} }}
        />

        <StatsCards
          data={totalPercentageData || {}}
          customLabels={{
            Total: `Total ${selectedType === "click" ? "Clicks" : "Impressions"}`,
            Valid: `Valid ${selectedType === "click" ? "Clicks" : "Impressions"}`,
            Invalid: `Invalid ${selectedType === "click" ? "Clicks" : "Impressions"}`,
          }}
            icons={{
                        Total: selectedType === "click" ? MousePointerClick : Eye,
                        Valid: CheckCircle2,
                        Invalid: TriangleAlert,
                      }}
          isLoading={isStatsLoading}
        />

        {/* Modern Charts Grid with Better Spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-2 transition-all duration-300">
          {/* Donut Chart with Modern Card */}
          <div
            ref={(el) => {
              if (el) cardRefs.current["split_of_sources"] = el;
            }}
            className="transition-all duration-300 hover:shadow-xl"
          >
              <DonutChart
                chartData={splitOfSourcesChartData}
                chartConfig={splitOfSourcesChartConfig}
                title="Split Of Sources"
              titleIcon={
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
              <PieChart className="w-5 h-5 text-white" />
              </span>
              }
              handleExportCsv={() => {
                setExporting((prev) => ({ ...prev, splitOfSources: true }));
              }}
              handleExpand={createExpandHandler({
                key: "split_of_sources",
                cardRefs,
                expandedCard,
                setExpandedCard,
              })}
              handleExportPng={createPngExportHandler({
                cardRefs,
                key: "split_of_sources",
                filename: "Split Of Sources",
              })}
              exportKey="split_of_sources"
                dataKey="visit"
                nameKey="label"
                isLoading={isSplitSourcesLoading}
                isView={true}
                direction="flex-col"
                marginTop="mt-0"
                position="items-start"
                isPercentage={false}
                isPercentageValue={true}
                istotalvistors={false}
              displayMode="both"
              contentHeight="14.375rem"
              cardHeight="17rem"
                onSegmentClick={handleDonutClick}
                legendClickable={true}
              />
          </div>

          {/* Date Wise Trend Chart with Modern Card */}
          <div
            ref={(el) => {
              if (el) cardRefs.current["date_wise_trend"] = el;
            }}
            className="lg:col-span-2 transition-all duration-300 hover:shadow-xl"
          >
            <StackedBarWithLine
              chartData={dwTrendData?.data || []}
              chartConfig={dwTrendData?.config || {}}
                title="Date Wise Trend"
              titleIcon={
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
              <TrendingUp className="w-5 h-5 text-white" />
              </span>
              }
              frequencyOptions={DW_TREND_SELECT_OPTIONS}
                selectedFrequency={dwTrendSelectedFrequency}
                handleFrequencyChange={handleDwTrendFrequencyChange}
              frequencyPlaceholder="Daily"
              handleExportCsv={() => {
                setExporting((prev) => ({ ...prev, dwTrend: true }));
              }}
              handleExpand={createExpandHandler({
                key: "date_wise_trend",
                cardRefs,
                expandedCard,
                setExpandedCard,
              })}
              handleExportPng={createPngExportHandler({
                cardRefs,
                key: "date_wise_trend",
                filename: "Date Wise Trend",
              })}
              exportKey="date_wise_trend"
                  isLegend={true}
                  isLoading={isDataApiLoading}
              barHeight="10rem"
              contentHeight="12rem"
              cardHeight="17rem"
              showRightAxis={true}
              chartMargins={{ top: 0, right: -10, left: -10, bottom: -4 }}
                />
              </div>
        </div>

        {/* Publisher Wise Trend - Full Width Modern Card */}
        <div
            ref={(el) => {
              if (el) cardRefs.current["publisher_vendor_trend"] = el;
            }}
          className="w-full transition-all duration-300 hover:shadow-xl"
          >
          <StackedBarWithLine
            chartData={publisherVendorData?.data || []}
            chartConfig={publisherVendorData?.config || {}}
                title="Publisher Wise Trend" 
            titleIcon={
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
            <TrendingUp className="w-5 h-5 text-white" />
            </span>}
            handleExportCsv={() => {
              setExporting((prev) => ({ ...prev, publisherVendor: true }));
            }}
            handleExpand={createExpandHandler({
              key: "publisher_vendor_trend",
              cardRefs,
              expandedCard,
              setExpandedCard,
            })}
            handleExportPng={createPngExportHandler({
              cardRefs,
              key: "publisher_vendor_trend",
              filename: "Publisher Vendor Wise Trend",
            })}
            exportKey="publisher_vendor_trend"
                  isLegend={true}
                  isLoading={isPublisherVendorLoading}
            barHeight="12.5rem"
            contentHeight="14.375rem"
            cardHeight="19.6875rem"
            showRightAxis={true}
            chartMargins={{ top: 0, right: -10, left: -10, bottom: -4 }}
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <LazyComponentWrapper>
            <InDepthAnomalyAnalysis
                           donutData={
                            Array.isArray(fraudCategoriesData)
                              ? fraudCategoriesData
                              : fraudCategoriesData?.data || []
                          }
            
              donutConfig={donutChartConfig}
              fraudStatsLoading={isLoadingFraudCategories}
              isExportingFraudCategories={exporting.fraudCategories}
              onDonutSegmentClick={handleDonutClick}
              refetchFraudCategories={refetchFraudCategories}
              progressBarData={
                Array.isArray(progressBarDataResponse)
                  ? progressBarDataResponse
                  : progressBarDataResponse?.data || []
              }
             
              progressBarLoading={isLoadingProgressBar}
              isExportingProgressBar={exporting.progressBar}
              refetchProgressBar={refetchProgressBar}
              areaChartData1={areaChartDataResponse?.data || []}
              areaBarConfig={areaChartDataResponse?.config}
              areaChartApiLoading={isLoadingAreaChart}
              isExportingAreaChart={exporting.areaChart}
              refetchAreaChart={refetchAreaChart}
              reattributionChartData={reattributionData?.data || []}
              reattributionStackedBarConfig={reattributionData?.config}
              reattributionLoading={isLoadingReattribution}
              isExportingReattribution={exporting.reattribution}
              refetchReattribution={refetchReattribution}
              onclickvalue={onclickvalue}
              selectedRadio1={selectedRadio1}
              setSelectedRadio1={setSelectedRadio1}
              isInitialLoading={isPackageLoading}
              cardRefs={cardRefs}
              expandedCard={expandedCard}
              setExpandedCard={setExpandedCard}
              baseDashboardPayload={baseDashboardPayload}
              selectedType={selectedType}
              setExporting={setExporting}
              fraudSubCategories={fraudSubCategoryData || []}
              selectedKey={selectedKey}
              setSelectedKey={setSelectedKey}
              selectedAnalysisType={selectedAnalysisType}
              setSelectedAnalysisType={setSelectedAnalysisType}
              searchTermIncent={searchTermIncent}
              setSearchTermIncent={setSearchTermIncent}
              tableDataIncent={tableDataIncent}
              chartDataIncent={chartDataIncent}
              chartConfigIncent={chartConfigIncent}
              dynamicTableColumns={dynamicTableColumns}
              progressDataIncent={progressDataIncent}
              fraudSubCategoryDetailsLoading={fraudSubCategoryDetailsLoading}
              isPackageLoading={isPackageLoading}
              fraudSubCategoryDetailsData={fraudSubCategoryDetailsData}
            />
          </LazyComponentWrapper>
        </div>

        {/* Analysis Insights Section */}
        <div className="transition-all duration-300">
          <LazyComponentWrapper>
            <AnalysisInsights
              selectedViewType={selectedType}
              publisherfilter={selectedPublishers}
              campaignfilter={selectedCampaigns}
              countryfilter={selectedCountries}
              onClickValue={onclickvalue || firstFraudCategoryLabel || ""}
              isInitialLoading={isPackageLoading}
            />
          </LazyComponentWrapper>
        </div>

        <div className="transition-all duration-300">
          <LazyComponentWrapper>
        <Publisher
          publisherfilter={selectedPublishers}
          campaignfilter={selectedCampaigns}
          countryfilter={selectedCountries}
          eventTypeFilter={["all"]}
          selectedTypeFromDashboard={selectedType}
        />
          </LazyComponentWrapper>
        </div>
      </div>
    </>
  );
};

export default Dashboard;



