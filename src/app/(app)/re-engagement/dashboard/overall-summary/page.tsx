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
  Users,
  Building2,
  Filter as FilterIcon,
  Download,
  MousePointerClick,
  CheckCircle2,
  XCircle,
  TriangleAlert,
  Repeat,
  SquareActivity
} from "lucide-react";

// Hooks (API calls)
import {
  useTotalPercentage,
  useDateWiseTrend,
  usePublisherVendorTrend,
  useSplitOfSources,
  useFraudCategories,
  usePublishersFilter,
  useCampaignsFilter,
  useAgencyFilter,
  useCountryFilter,
  useEventTypeFilter,
  type DashboardPayload,
  type FilterPayload,
  type PublisherApiResponse,
} from "../../hooks/useDashboard";
import { COLOR_PALETTE,  getPercentageKey, DW_TREND_FREQUENCY_MAP } from "./constants";

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
  const [selectedType, setSelectedType] = useState<"click" | "conversion" | "event">(
    "click"
  );
  const [publisherVendorFilter, setPublisherVendorFilter] = useState<
    "Publisher" | "Vendor"
  >("Publisher");
  const [onclickvalue, setonclickvalue] = useState("");
  const [dwTrendSelectedFrequency, setDwTrendSelectedFrequency] =
    useState("Daily");
  // Mobile filter sidebar state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Export states for main dashboard charts only
  const [exporting, setExporting] = useState({
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
  
  const { data: agencyData, isLoading: isLoadingAgency } = 
    useAgencyFilter(selectedType, baseFilterPayload, !!baseFilterPayload);
  
  const { data: countryData, isLoading: isLoadingCountry } = 
    useCountryFilter(selectedType, baseFilterPayload, !!baseFilterPayload);

  const { data: eventTypesData, isLoading: isLoadingEventTypes } = 
    useEventTypeFilter(selectedType, baseFilterPayload, !!baseFilterPayload && selectedType === "event");

  // Filter State
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>(["all"]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(["all"]);
  const [selectedAgency, setSelectedAgency] = useState<string[]>(["all"]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["all"]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(["all"]);

  // Reset filters when type changes
  useEffect(() => {
    setSelectedPublishers(["all"]);
    setSelectedCampaigns(["all"]);
    setSelectedAgency(["all"]);
    setSelectedCountries(["all"]);
    setSelectedEventTypes(["all"]);
  }, [selectedType, selectedPackage, startDate, endDate]);

  // Build UI Filter Configs
  const publishersFilter = useMemo(
    () => buildPublisherFilter(publishersData, selectedPublishers, isLoadingPublishers),
    [publishersData, selectedPublishers, isLoadingPublishers]
  );

  const otherFilters = useMemo(() => ({
    Campaigns: buildSimpleFilter(campaignsData, selectedCampaigns, isLoadingCampaigns),
    Agency: buildSimpleFilter(agencyData, selectedAgency, isLoadingAgency),
    Country: buildSimpleFilter(countryData, selectedCountries, isLoadingCountry),
    ...(selectedType === "event" && {
      "Event Types": buildSimpleFilter(eventTypesData, selectedEventTypes, isLoadingEventTypes),
    }),
  }), [
    campaignsData,
    agencyData,
    countryData,
    eventTypesData,
    selectedCampaigns,
    selectedAgency,
    selectedCountries,
    selectedEventTypes,
    isLoadingCampaigns,
    isLoadingAgency,
    isLoadingCountry,
    isLoadingEventTypes,
    selectedType,
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
    if (newState.Agency) {
      setSelectedAgency(extractSelectedValues(newState.Agency));
    }
    if (newState.Country) {
      setSelectedCountries(extractSelectedValues(newState.Country));
    }
    if (newState["Event Types"]) {
      setSelectedEventTypes(extractSelectedValues(newState["Event Types"]));
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
      vendor_id: selectedAgency,
      campaign_id: selectedCampaigns,
      country: selectedCountries,
      ...(selectedType === "event" && {
        event_type: selectedEventTypes,
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
    selectedEventTypes,
    selectedType,
  ]);

  // Fraud Categories API Hook
  const {
    data: fraudCategoriesData,
    isLoading: isLoadingFraudCategories,
  } = useFraudCategories(
    selectedType,
    baseDashboardPayload,
    !!baseDashboardPayload
  );

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

  // Date Wise Trend API Payload
  const dwTrendPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!baseDashboardPayload) return undefined;
    return {
      ...baseDashboardPayload,
      frequency: DW_TREND_FREQUENCY_MAP[dwTrendSelectedFrequency] || "daily",
    };
  }, [baseDashboardPayload, dwTrendSelectedFrequency]);

  // Publisher Vendor Trend API Payload
  const publisherVendorPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!baseDashboardPayload) return undefined;
    return {
      ...baseDashboardPayload,
      frequency: publisherVendorFilter === "Publisher" ? "publisher" : "agency",
    };
  }, [baseDashboardPayload, publisherVendorFilter]);

  // CSV Export Payloads
  const splitOfSourcesExportPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!baseDashboardPayload || !exporting.splitOfSources) {
      return undefined;
    }
    return {
      ...baseDashboardPayload,
      export_type: "csv",
    };
  }, [baseDashboardPayload, exporting.splitOfSources]);

  const dateWiseTrendExportPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!dwTrendPayload || !exporting.dwTrend) {
      return undefined;
    }
    return {
      ...dwTrendPayload,
      export_type: "csv",
    };
  }, [dwTrendPayload, exporting.dwTrend]);

  const publisherVendorTrendExportPayload = useMemo<DashboardPayload | undefined>(() => {
    if (!publisherVendorPayload || !exporting.publisherVendor) {
      return undefined;
    }
    return {
      ...publisherVendorPayload,
      export_type: "csv",
    };
  }, [publisherVendorPayload, exporting.publisherVendor]);

  // ============================================================================
  // API HOOKS - Main Dashboard Charts Only
  // ============================================================================

  // Date Wise Trend API Hook
  const dwTrendSelectOptions = ["Daily", "Weekly", "Monthly"];
  const {
    data: dwTrendData,
    isLoading: isLoadingDwTrend,
  } = useDateWiseTrend(
    selectedType,
    dwTrendPayload,
    !!dwTrendPayload && !exporting.dwTrend
  );

  // Publisher Vendor Trend API Hook
  const {
    data: publisherVendorData,
    isLoading: isLoadingPublisherVendor,
  } = usePublisherVendorTrend(
    selectedType,
    publisherVendorPayload,
    !!publisherVendorPayload && !exporting.publisherVendor
  );

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
  } = useSplitOfSources(
    selectedType,
    baseDashboardPayload,
    !!baseDashboardPayload && !exporting.splitOfSources
  );

  // CSV Export API Hooks
  const {
    data: splitOfSourcesExportData,
  } = useSplitOfSources(
    selectedType,
    splitOfSourcesExportPayload,
    !!splitOfSourcesExportPayload
  );

  const {
    data: dateWiseTrendExportData,
  } = useDateWiseTrend(
    selectedType,
    dateWiseTrendExportPayload,
    !!dateWiseTrendExportPayload
  );

  const {
    data: publisherVendorTrendExportData,
  } = usePublisherVendorTrend(
    selectedType,
    publisherVendorTrendExportPayload,
    !!publisherVendorTrendExportPayload
  );

  // Compute split of sources chart data and config from API response
  const { splitOfSourcesChartData, splitOfSourcesChartConfig } = useMemo(() => {
    const response = Array.isArray(splitOfSourcesData)
      ? splitOfSourcesData
      : splitOfSourcesData?.data || [];

    const labelColorMap: Record<string, string> = {};
    let colorIndex = 0;
    const mapped = response
      .filter((item: any) => item?.total_count > 0)
      .map((item: any) => {
        const label = item?.source_type;
        if (!labelColorMap[label]) {
          labelColorMap[label] =
            COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
          colorIndex++;
        }
        return {
          label,
          visit: item?.total_count,
          percentage: item?.[getPercentageKey(label)] || "",
          fill: labelColorMap[label],
        };
      });

    const config: Record<string, { label: string; color: string }> = {};
    mapped.forEach((item) => {
      config[item?.label] = { label: item?.label, color: item?.fill };
    });

    return {
      splitOfSourcesChartData: mapped,
      splitOfSourcesChartConfig: config,
    };
  }, [splitOfSourcesData]);

 
  const handleDwTrendFrequencyChange = (value: string) => {
    setDwTrendSelectedFrequency(value);
  };


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


  const publisherGroups = useMemo(() => {
    return { Publishers: publishersData || { Affiliate: [], "Whitelisted Publisher": [] } };
  }, [publishersData]);

  const isInitialLoading = useMemo(() => {
    return isPackageLoading || isLoadingPublishers;
  }, [isPackageLoading, isLoadingPublishers]);

  const handleDonutClick = (data: any) => {
    setonclickvalue(data?.label || data?.name);
  };

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
          <h1 className="text-body font-semibold text-foreground text-center md:hidden sticky top-0 z-50 bg-background px-4 py-3 border-b border-gray-200">
            Overall Summary
          </h1>
        {/* Modern Filters Row with Glassmorphism Effect */}
      
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 p-2 sm:p-2 sticky top-0 z-50 dark:bg-card bg-white border border-border/40 rounded-xl shadow-lg mt-2">
            {/* Mobile Filter Button - Only visible on small devices */}
            <div className="lg:hidden w-full flex flex-col gap-2">
              <div className="flex items-center justify-between w-full">
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
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {totalFilters}
                      </span>
                    );
                  })()}
                </Button>
                <ToggleButton
                  options={[
                    { label: "Click", value: "click" },
                    { label: "Conversion", value: "conversion" },
                    { label: "Event", value: "event" },
                  ]}
                  selectedValue={selectedType}
                  onChange={(value) =>
                    setSelectedType(value as "click" | "conversion" | "event")
                  }
                />
              </div>
            </div>

            {/* Desktop Filters - Only visible on large devices */}
            <div className="hidden lg:flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Publisher Filter */}
              <Filter
                key={`publishers-${selectedType}-${selectedPackage}-${startDate}-${endDate}`}
                filter={{ Publishers: publishersFilter }}
                onChange={handlePublisherFilterChange}
                grouped={true}
                publisherGroups={publisherGroups}
              />
              <Filter
                key={`other-${selectedType}-${selectedPackage}-${startDate}-${endDate}`}
                filter={otherFilters}
                onChange={handleOtherFiltersChange}
                grouped={false}
              />
            </div>

            {/* Modern Toggle Button - Desktop */}
            <div className="hidden lg:block self-end lg:self-auto">
              <ToggleButton
                options={[
                  { label: "Click", value: "click" },
                  { label: "Conversion", value: "conversion" },
                  { label: "Event", value: "event" },
                ]}
                selectedValue={selectedType}
                onChange={(value) =>
                  setSelectedType(value as "click" | "conversion" | "event")
                }
              />
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
          publisherGroups={publisherGroups}
        />

        {/* Enhanced Stats Cards with Modern Design */}
        <div className="transition-all duration-300 ease-in-out">
          <StatsCards
            data={totalPercentageData || {}}
            customLabels={{
              Total: `Total ${selectedType === "event" ? "Events" : selectedType === "click" ? "Clicks" : "Conversions"}`,
              Valid: `Valid ${selectedType === "event" ? "Events" : selectedType === "click" ? "Clicks" : "Conversions"}`,
              Invalid: `Invalid ${selectedType === "event" ? "Events" : selectedType === "click" ? "Clicks" : "Conversions"}`,
            }}
            icons={{
              Total: selectedType === "event" ?  SquareActivity : selectedType === "click" ? MousePointerClick : Repeat,
              Valid: CheckCircle2,
              Invalid: TriangleAlert,
            }}
            isLoading={isLoadingTotalPercentage || isPackageLoading}
          />
        </div>

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
              </span>}
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
              cardHeight="17rem"

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
              </span>}
              frequencyOptions={dwTrendSelectOptions}
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
              isLoading={isLoadingDwTrend || isPackageLoading}
              barHeight="10rem"
              contentHeight="12rem"
              cardHeight="17rem"
              showRightAxis={true}
              chartMargins={{ top: 0, right: -10, left: -10, bottom: -4 }}
            />
          </div>
        </div>

        {/* Publisher/Vendor Wise Trend - Full Width Modern Card */}
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

        {/* In-Depth Analysis Section with Modern Spacing */}
        <div className="transition-all duration-300">
          <LazyComponentWrapper>
            <InDepthAnomalyAnalysis
              selectedType={selectedType}
              
              query={{
                publishers: selectedPublishers,
                campaigns: selectedCampaigns,
                country: selectedCountries,
                event_type: selectedEventTypes,
                agency: selectedAgency,
              }}
              onclickvalue={onclickvalue}
             
              onDonutSegmentClick={handleDonutClick}
              filterApisCompleted={!!baseFilterPayload}
              isInitialLoading={isInitialLoading}
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
              agencyfilter={selectedAgency}
              countryfilter={selectedCountries}
              eventTypeFilter={selectedEventTypes}
              onClickValue={onclickvalue || firstFraudCategoryLabel || ""}
              isInitialLoading={isInitialLoading}
            />
          </LazyComponentWrapper>
        </div>

        {/* Publisher Section */}
        <div className="transition-all duration-300">
          <LazyComponentWrapper>
            <Publisher
              publisherfilter={selectedPublishers}
              campaignfilter={selectedCampaigns}
              agencyfilter={selectedAgency}
              countryfilter={selectedCountries}
              eventTypeFilter={selectedEventTypes}
              selectedType={selectedType}
            />
          </LazyComponentWrapper>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
