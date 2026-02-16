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
import { Checkbox } from "@/components/ui/checkbox";
import LazyComponentWrapper from "@/components/mf/LazyComponentWrapper";
import { cn } from "@/lib/utils";
import {
  PieChart,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  Filter as FilterIcon,
  CheckCircle2,
  LaptopMinimalCheck,
  SquareActivity,
  TriangleAlert
} from "lucide-react";

import {
  useTotalPercentage,
  useDateWiseTrend,
  usePublisherVendorTrend,
  useSplitOfSources,
  useFraudCategories,
  useFraudSubCategoryProgressBar,
  useDateWiseFraudSubCategory,
  usePublisherWiseFraudSubCategory,
  type DashboardPayload,
} from "../../hooks/useDashboard";
import { COLOR_PALETTE, CHART_COLORS, getPercentageKey } from "./constants";

import { Button } from "@/components/ui/button";
import {
  createExpandHandler,
  createPngExportHandler,
  exportCsvFromUrl,
} from "@/lib/utils";
import {
  usePublishersFilter,
  useCampaignsFilter,
  useAgencyFilter,
  useCountryFilter,
  useEventTypeFilter,
  type PublisherApiResponse,
  type FilterPayload
} from "../../hooks/useDashboard";
import {
  buildSimpleFilter,
  buildPublisherFilter,
  extractSelectedValues,
} from "../../hooks/useFilterHelpers";

const getOsTypePayload = (osTypes?: string[]) => {
  if (!osTypes || osTypes.length === 0 || osTypes.includes("all")) {
    return ["android", "ios"];
  }
  return osTypes?.map((os) => os.toLowerCase());
};

const Dashboard = () => {
  const { selectedPackage, isPackageLoading } = usePackage();
  const { startDate, endDate } = useDateRange();
  const [selectedType, setSelectedType] = useState<"install" | "event">(
    "install"
  );
  const [publisherVendorFilter, setPublisherVendorFilter] = useState<
    "Publisher" | "Vendor"
  >("Publisher");
  const [onclickvalue, setonclickvalue] = useState<string>("");
  const [conversionvalue, setConversionvalue] = useState<boolean>(false);
  const [dwTrendSelectedFrequency, setDwTrendSelectedFrequency] =
    useState<string>("Daily");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Export states grouped
  const [exporting, setExporting] = useState({
    fraudCategories: false,
    progressBar: false,
    reattribution: false,
    dwTrend: false,
    publisherVendor: false,
    areaChart: false,
    splitOfSources: false,
  });

  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const baseFilterPayload = useMemo<FilterPayload | undefined>(() => {
    if (!selectedPackage || isPackageLoading) {
      return undefined;
    }
    return {
      package_name: selectedPackage,
      start_date: startDate,
      end_date: endDate,
    };
  }, [selectedPackage, isPackageLoading, startDate, endDate]);

  const { data: publishersData, isLoading: isLoadingPublishers } =
    usePublishersFilter(selectedType, baseFilterPayload, !!baseFilterPayload);

  const { data: campaignsData, isLoading: isLoadingCampaigns } =
    useCampaignsFilter(selectedType, baseFilterPayload, !!baseFilterPayload);

  const { data: agencyData, isLoading: isLoadingAgency } =
    useAgencyFilter(selectedType, baseFilterPayload, !!baseFilterPayload);

  const { data: countryData, isLoading: isLoadingCountry } =
    useCountryFilter(selectedType, baseFilterPayload, !!baseFilterPayload);

  const { data: eventTypesData, isLoading: isLoadingEventTypes } =
    useEventTypeFilter(selectedType, baseFilterPayload, selectedType === "event" && !!baseFilterPayload);

  const osTypeData = useMemo(() => ["android", "ios"], []);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>(["all"]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(["all"]);
  const [selectedAgency, setSelectedAgency] = useState<string[]>(["all"]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["all"]);
  const [selectedOsTypes, setSelectedOsTypes] = useState<string[]>(["all"]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(["all"]);
  useEffect(() => {
    setSelectedPublishers(["all"]);
    setSelectedCampaigns(["all"]);
    setSelectedAgency(["all"]);
    setSelectedCountries(["all"]);
    setSelectedOsTypes(["all"]);
    setSelectedEventTypes(["all"]);
  }, [selectedType, selectedPackage, startDate, endDate]);


  const publishersFilter = useMemo(
    () => buildPublisherFilter(publishersData, selectedPublishers, isLoadingPublishers),
    [publishersData, selectedPublishers, isLoadingPublishers]
  );

  const otherFilters = useMemo(() => {
    const filters = {
      Campaigns: buildSimpleFilter(campaignsData, selectedCampaigns, isLoadingCampaigns),
      Agency: buildSimpleFilter(agencyData, selectedAgency, isLoadingAgency),
      Country: buildSimpleFilter(countryData, selectedCountries, isLoadingCountry),
      "OS Type": buildSimpleFilter(osTypeData, selectedOsTypes, false),
    };

    if (selectedType === "event") {
      return {
        ...filters,
        "Event Types": buildSimpleFilter(eventTypesData, selectedEventTypes, isLoadingEventTypes),
      };
    }

    return filters;
  }, [
    campaignsData,
    agencyData,
    countryData,
    osTypeData,
    eventTypesData,
    selectedCampaigns,
    selectedAgency,
    selectedCountries,
    selectedOsTypes,
    selectedEventTypes,
    selectedType,
    isLoadingCampaigns,
    isLoadingAgency,
    isLoadingCountry,
    isLoadingEventTypes,
  ]);

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
    if (newState.Agency) {
      setSelectedAgency(extractSelectedValues(newState.Agency));
    }
    if (newState.Country) {
      setSelectedCountries(extractSelectedValues(newState.Country));
    }
    if (newState["OS Type"]) {
      setSelectedOsTypes(extractSelectedValues(newState["OS Type"]));
    }
    if (newState["Event Types"]) {
      setSelectedEventTypes(extractSelectedValues(newState["Event Types"]));
    }
  };

  const baseDashboardPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!selectedPackage || isPackageLoading) {
      return undefined;
    }
    return {
      start_date: startDate,
      end_date: endDate,
      package_name: selectedPackage,
      publisher: selectedPublishers,
      vendor_id: selectedAgency,
      campaign_id: selectedCampaigns,
      country: selectedCountries,
      os_type: getOsTypePayload(selectedOsTypes),
      ...(selectedType === "event" && {
        event_type: selectedEventTypes,
        useConversionDate: conversionvalue,
      }),
    };
  }, [
    selectedPackage,
    isPackageLoading,
    startDate,
    endDate,
    selectedPublishers,
    selectedAgency,
    selectedCampaigns,
    selectedCountries,
    selectedOsTypes,
    selectedType,
    selectedEventTypes,
    conversionvalue,
  ]);


  const {
    data: fraudCategoriesData,
    isLoading: isLoadingFraudCategories,
  } = useFraudCategories(
    selectedType,
    baseDashboardPayload,
    !!baseDashboardPayload
  );

  const defaultFraudCategory = useMemo(() => {
    return Array.isArray(fraudCategoriesData)
      ? fraudCategoriesData?.[0]?.label
      : fraudCategoriesData?.data?.[0]?.label;
  }, [fraudCategoriesData]);

  const progressBarPayload = baseDashboardPayload && (onclickvalue || defaultFraudCategory)
    ? {
      ...baseDashboardPayload,
      category: onclickvalue || defaultFraudCategory,
    }
    : undefined;

  const reattributionPayload = baseDashboardPayload && (onclickvalue || defaultFraudCategory)
    ? {
      ...baseDashboardPayload,
      category: onclickvalue || defaultFraudCategory,
      type: publisherVendorFilter === "Vendor" ? "agency" : "publisher",
    }
    : undefined;

  const dwTrendFrequencyMap: Record<string, string> = {
    Daily: "daily",
    Weekly: "weekly",
    Monthly: "monthly",
  };
  const dwTrendPayload = baseDashboardPayload
    ? {
      ...baseDashboardPayload,
      frequency: dwTrendFrequencyMap[dwTrendSelectedFrequency] || "daily",
    }
    : undefined;

  const publisherVendorPayload = baseDashboardPayload
    ? {
      ...baseDashboardPayload,
      frequency: publisherVendorFilter === "Publisher" ? "publisher" : "agency",
    }
    : undefined;

  // CSV Export Payloads
  const splitOfSourcesExportPayload =
    baseDashboardPayload && exporting.splitOfSources
      ? {
        ...baseDashboardPayload,
        export_type: "csv",
      }
      : undefined;

  const dateWiseTrendExportPayload =
    dwTrendPayload && exporting.dwTrend
      ? {
        ...dwTrendPayload,
        export_type: "csv",
      }
      : undefined;

  const publisherVendorTrendExportPayload =
    publisherVendorPayload && exporting.publisherVendor
      ? {
        ...publisherVendorPayload,
        export_type: "csv",
      }
      : undefined;


  const areaChartPayload = baseDashboardPayload && (onclickvalue || defaultFraudCategory)
    ? {
      ...baseDashboardPayload,
      category: onclickvalue || defaultFraudCategory,
      frequency: "daily",
    }
    : undefined;

  const { data: progressBarDataResponse, isLoading: isLoadingProgressBar } =
    useFraudSubCategoryProgressBar(
      selectedType,
      progressBarPayload as DashboardPayload,
      !!progressBarPayload && !isLoadingFraudCategories
    );

  const { data: reattributionData, isLoading: isLoadingReattribution } =
    usePublisherWiseFraudSubCategory(
      selectedType,
      reattributionPayload as DashboardPayload,
      !!reattributionPayload && !isLoadingFraudCategories
    );

  const dwTrendSelectOptions = ["Daily", "Weekly", "Monthly"];
  const { data: dwTrendData, isLoading: isLoadingDwTrend } =
    useDateWiseTrend(
      selectedType,
      dwTrendPayload as DashboardPayload,
      !!dwTrendPayload
    );

  const { data: publisherVendorData, isLoading: isLoadingPublisherVendor } =
    usePublisherVendorTrend(
      selectedType,
      publisherVendorPayload,
      !!publisherVendorPayload && !exporting.publisherVendor
    );

  const { data: totalPercentageData, isLoading: isLoadingTotalPercentage } =
    useTotalPercentage(selectedType, baseDashboardPayload, !!baseDashboardPayload);

  const { data: splitOfSourcesData, isLoading: isLoadingSplitOfSources } =
    useSplitOfSources(selectedType, baseDashboardPayload, !!baseDashboardPayload);

  // CSV Export API Hooks
  const { data: splitOfSourcesExportData } =
    useSplitOfSources(selectedType, splitOfSourcesExportPayload, !!splitOfSourcesExportPayload);

  const { data: dateWiseTrendExportData } =
    useDateWiseTrend(
      selectedType,
      dateWiseTrendExportPayload as DashboardPayload,
      !!dateWiseTrendExportPayload
    );

  const { data: publisherVendorTrendExportData } =
    usePublisherVendorTrend(
      selectedType,
      publisherVendorTrendExportPayload,
      !!publisherVendorTrendExportPayload
    );

  const { splitOfSourcesChartData, splitOfSourcesChartConfig } = useMemo(() => {
    const response = Array.isArray(splitOfSourcesData)
      ? splitOfSourcesData
      : splitOfSourcesData?.data || [];

    const labelColorMap: Record<string, string> = {};
    const config: Record<string, { label: string; color: string }> = {};
    const mapped = response
      .filter((item: any) => item?.total_count > 0)
      .map((item: any, index: number) => {
        const label = item?.source_type || "";
        if (label && !labelColorMap[label]) {
          labelColorMap[label] = COLOR_PALETTE[index % COLOR_PALETTE.length];
          config[label] = { label, color: labelColorMap[label] };
        }
        return {
          label,
          visit: item?.total_count || 0,
          percentage: item?.[getPercentageKey(label)] || "",
          fill: labelColorMap[label] || "",
        };
      });

    return {
      splitOfSourcesChartData: mapped,
      splitOfSourcesChartConfig: config,
    };
  }, [splitOfSourcesData]);

  const { data: areaChartDataResponse, isLoading: isLoadingAreaChart } =
    useDateWiseFraudSubCategory(
      selectedType,
      areaChartPayload,
      !!areaChartPayload && !isLoadingFraudCategories
    );


  const handleDonutSegmentClick = (data: any) => {

    setonclickvalue(data?.label || data?.name);
  };

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

  return (
    <>
      <div className="flex flex-col gap-2 w-full">

        <h1 className="text-header font-semibold text-foreground text-center md:hidden sticky top-0 z-50 bg-background px-4 py-3 border-b border-gray-200">
          Overall Summary
        </h1>
        <div className="sticky top-0 z-50   dark:bg-card bg-white border border-border/40 rounded-xl shadow-lg mt-2 ">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 p-2 sm:p-2 md:h-[48px]">
            <div className="lg:hidden w-full flex flex-col gap-2">
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"

                  className="flex items-center gap-1 px-2 py-1 text-sm sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 md:text-base shrink-0"
                >
                  <FilterIcon className="w-4 h-4" onClick={() => setIsMobileFilterOpen(true)} />
                  Filters

                </Button>
                <ToggleButton
                  className="shrink-0 scale-90 sm:scale-95 md:scale-100 origin-right"
                  options={[
                    { label: "Install", value: "install" },
                    { label: "Event", value: "event" },
                  ]}
                  selectedValue={selectedType}
                  onChange={(value) =>
                    setSelectedType(value as "install" | "event")
                  }
                />
              </div>
              {selectedType === "event" && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-200 w-full">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-subBody sm:text-subBody font-medium text-foreground">
                    Conversion Date
                  </span>
                  <Checkbox
                    checked={conversionvalue}
                    onCheckedChange={(checked) =>
                      setConversionvalue(checked === true)
                    }
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary ml-auto"
                  />
                </div>
              )}
            </div>

            {/* Desktop Filters - Only visible on large devices */}

            <div className="hidden lg:flex items-center gap-2 w-full">
              <div
                className={cn(
                  "flex flex-1 min-w-0 items-center gap-2",
                  selectedType === "event" &&
                  "overflow-x-auto flex-nowrap whitespace-nowrap no-scrollbar"
                )}
              >
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
                {selectedType === "event" && (
                  <div className="shrink-0 group relative flex items-center gap-2 rounded-full border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 px-4 py-2 text-subBody font-medium text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105  hover:shadow-md  active:scale-100">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-subBody sm:text-subBody font-medium text-foreground">
                      Conversion Date
                    </span>
                    <Checkbox
                      checked={conversionvalue}
                      onCheckedChange={(checked) =>
                        setConversionvalue(checked === true)
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="hidden lg:block self-end lg:self-auto shrink-0">
              <ToggleButton
                options={[
                  { label: "Install", value: "install" },
                  { label: "Event", value: "event" },
                ]}
                selectedValue={selectedType}
                onChange={(value) =>
                  setSelectedType(value as "install" | "event")
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


        <div className="transition-all duration-300 ease-in-out">
          <StatsCards
            data={totalPercentageData || {}}
            customLabels={{
              Total: `Total ${selectedType === "install" ? "Installs" : "Events"}`,
              Valid: `Valid ${selectedType === "install" ? "Installs" : "Events"}`,
              Invalid: `Invalid ${selectedType === "install" ? "Installs" : "Events"}`,
            }}
            icons={{
              Total: selectedType === "install" ? LaptopMinimalCheck : SquareActivity,
              Valid: CheckCircle2,
              Invalid: TriangleAlert,
            }}
            isLoading={isLoadingTotalPercentage || isPackageLoading}
          />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-2 transition-all duration-300">
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
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                  <PieChart className="w-5 h-5 text-white" />
                </span>
              }

              handleExportCsv={() => setExporting((prev) => ({ ...prev, splitOfSources: true }))}
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
              isLoading={isLoadingSplitOfSources || isPackageLoading}
              isView={true}
              direction="flex-col"
              marginTop="mt-0"
              position="items-start"
              isPercentage={false}
              isPercentageValue={true}
              istotalvistors={false}
              displayMode="both"
              contentHeight="14.375rem"
              cardHeight="18rem"
            />
          </div>

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
              frequencyOptions={dwTrendSelectOptions}
              selectedFrequency={dwTrendSelectedFrequency}
              handleFrequencyChange={setDwTrendSelectedFrequency}
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
              selectedFilterValue={publisherVendorFilter}
              handleFilterChange={(value) => setPublisherVendorFilter(value as "Publisher" | "Vendor")}
              exportKey="date_wise_trend"
              isLegend={true}
              isLoading={isLoadingDwTrend || isPackageLoading}
              barHeight="10rem"
              contentHeight="12rem"
              cardHeight="18rem"
              showRightAxis={true}
              chartMargins={{ top: 0, right: -10, left: -10, bottom: -4 }}
            />
          </div>
        </div>

        <div
          ref={(el) => {
            if (el) cardRefs.current["publisher_vendor_trend"] = el;
          }}
          className="w-full transition-all duration-300 hover:shadow-xl"
        >
          <StackedBarWithLine
            chartData={publisherVendorData?.data || []}
            chartConfig={publisherVendorData?.config || {}}
            title={`${publisherVendorFilter === "Publisher" ? "Publisher Wise Trend" : "Agency Wise Trend"}`}
            titleIcon={
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                {publisherVendorFilter === "Publisher" ? (
                  <Users className="w-5 h-5 text-white" />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
              </span>
            }
            filterType="radio"
            filterOptions={[
              { value: "Publisher", label: "Publisher" },
              { value: "Vendor", label: "Agency" },
            ]}
            selectedFilterValue={publisherVendorFilter}
            handleFilterChange={(value) => {
              if (value === "Publisher" || value === "Vendor") {
                setPublisherVendorFilter(value);
              }
            }}
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
              filename: "Publisher Vendor Trend",
            })}
            exportKey="publisher_vendor_trend"
            isLegend={true}
            isLoading={isLoadingPublisherVendor || isPackageLoading}
            barHeight="12.5rem"
            contentHeight="14.375rem"
            cardHeight="19.6875rem"
            showRightAxis={true}
            chartMargins={{ top: 0, right: -10, left: -10, bottom: -4 }}
          />
        </div>


        <div className="transition-all duration-300">
          <LazyComponentWrapper>
            <InDepthAnomalyAnalysis
              donutData={
                Array.isArray(fraudCategoriesData)
                  ? fraudCategoriesData
                  : fraudCategoriesData?.data || []
              }
              donutConfig={{ visit: { label: "Count", color: CHART_COLORS[0] } }}
              fraudStatsLoading={isLoadingFraudCategories}
              isExportingFraudCategories={exporting.fraudCategories}
              onDonutSegmentClick={handleDonutSegmentClick}
              progressBarData={
                Array.isArray(progressBarDataResponse)
                  ? progressBarDataResponse
                  : progressBarDataResponse?.data || []
              }
              progressBarLoading={isLoadingProgressBar}
              isExportingProgressBar={exporting.progressBar}
              areaChartData1={areaChartDataResponse?.data || []}
              areaBarConfig={areaChartDataResponse?.config || {}}
              areaChartApiLoading={isLoadingAreaChart}
              isExportingAreaChart={exporting.areaChart}
              reattributionChartData={reattributionData?.data || []}
              reattributionStackedBarConfig={reattributionData?.config || {}}
              reattributionLoading={isLoadingReattribution}
              isExportingReattribution={exporting.reattribution}
              onclickvalue={onclickvalue || defaultFraudCategory}
              selectedRadio1={publisherVendorFilter}
              setSelectedRadio1={setPublisherVendorFilter}
              isInitialLoading={isPackageLoading}
              cardRefs={cardRefs}
              expandedCard={expandedCard}
              setExpandedCard={setExpandedCard}
              baseDashboardPayload={baseDashboardPayload}
              selectedType={selectedType}
              setExporting={setExporting}
            />
          </LazyComponentWrapper>
        </div>

        <div className="transition-all duration-300">
          <LazyComponentWrapper>
            <AnalysisInsights
              selectedViewType={selectedType === "event" ? "events" : "install"}
              publisherfilter={selectedPublishers}
              campaignfilter={selectedCampaigns}
              agencyfilter={selectedAgency}
              countryfilter={selectedCountries}
              eventTypeFilter={selectedEventTypes}
              osTypeFilter={selectedOsTypes}
              onClickValue={onclickvalue || defaultFraudCategory}
              isInitialLoading={isPackageLoading}
              conversionvalue={conversionvalue}
            />
          </LazyComponentWrapper>
        </div>

        <div className="transition-all duration-300">
          <LazyComponentWrapper>
            <Publisher
              publisherfilter={selectedPublishers}
              campaignfilter={selectedCampaigns}
              agencyfilter={selectedAgency}
              countryfilter={selectedCountries}
              eventTypeFilter={selectedEventTypes}
              osTypeFilter={selectedOsTypes}
            />
          </LazyComponentWrapper>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
