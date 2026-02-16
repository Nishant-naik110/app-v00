"use client";
import type React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ResizableTable from "@/components/mf/ReportingToolTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DoubleLineChart from "@/components/mf/charts/DoubleLineChart";
import { usePackage } from "@/components/mf/PackageContext";
import {
  usePublisherSummary,
  useClickConversion,
  useConversionEvent,
  useEventTypeList,
  type PublisherSummaryPayload,
  type ConversionChartPayload,
  type EventTypeListPayload,
} from "../../hooks/useDashboard";
import domToImage from "dom-to-image";

import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, CalendarIcon, Download, Clock } from "lucide-react";
import { useDateRange } from "@/components/mf/DateRangeContext";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { onExpand, downloadURI } from "@/lib/utils";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";

interface Column {
  key: string;
  title: string;
  render?: (item: any) => React.ReactNode;
}

interface ChartDataItem {
  label: string;
  standard: number;
  demandgen: number;
  [key: string]: string | number;
}

  // Chart configurations for different views - now dynamic based on selectedPublisher
const getInstallChartConfig = (publisherName: string) => ({
  standard: {
    label: publisherName || "Publisher",
    color: "#2563eb",
  },
});

const getEventChartConfig = (publisherName: string) => ({
  standard: {
    label: publisherName || "Publisher",
    color: "#22c55e",
  },
});

// Normalize os_type payload: never send "all", instead default to both OS types
const getOsTypePayload = (osTypes?: string[]) => {
  if (!osTypes || osTypes.length === 0 || osTypes.includes("all")) {
    return ["android", "ios"];
  }
  return osTypes.map((os) => os.toLowerCase());
};

export default function Publisher({
  publisherfilter,
  campaignfilter,
  countryfilter,
  agencyfilter,
  eventTypeFilter,
  osTypeFilter,
}: {
  publisherfilter: string[];
  campaignfilter: string[];
  agencyfilter: string[];
  countryfilter: string[];
  eventTypeFilter?: string[];
  osTypeFilter?: string[];
}) {
  const { selectedPackage } = usePackage();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deviceType, setDeviceType] = useState("desktop");

  const [tableColumns, setTableColumns] = useState<Column[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string>("");
  const [selectedEventTypesChart, setSelectedEventTypesChart] = useState<string[]>([]);
  const [isEventTypeDropdownOpen, setIsEventTypeDropdownOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Global date range for table data
  const { startDate, endDate } = useDateRange();

  // Local date range for dialog charts (separate from global context)
  const [dialogStartDate, setDialogStartDate] = useState(startDate);
  const [dialogEndDate, setDialogEndDate] = useState(endDate);
  const [dialogDateRange, setDialogDateRange] = useState<DateRange | undefined>(
    {
      from: new Date(startDate),
      to: new Date(endDate),
    }
  );

  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleExpand = (key: string) => {
    onExpand(key, cardRefs, expandedCard, setExpandedCard);
  };

  const handleExportPng = useCallback(async (title: string, key: string) => {
    try {
      const ref = cardRefs.current[key];
      if (!ref) {
        console.error(`Export failed: No element found for key "${key}"`);
        return;
      }

      const screenshot = await domToImage.toPng(ref);
      downloadURI(screenshot, `${title}.png`);
    } catch (error) {
      console.error("Error exporting PNG:", error);
    }
  }, []);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedRadioButton, setSelectedRadioButton] = useState<string>("all");
  const isInitialMountRef = useRef(true);

  // Publisher Summary API Payload
  const publisherSummaryPayload = useMemo<PublisherSummaryPayload | undefined>(() => {
    if (!selectedPackage || !startDate || !endDate) {
      return undefined;
    }
    const eventTypeValue =
      !selectedEventTypes || selectedEventTypes === "all"
        ? ["all"]
        : [selectedEventTypes];
    
    return {
      start_date: startDate,
      end_date: endDate,
      package_name: selectedPackage,
      summary_type: "publisher",
      publisher_type: "all",
      order: "ascending",
      column_name: "publisher_name",
      page_number: currentPage,
      record_limit: limit,
      search_term: debouncedSearchTerm,
      publisher: publisherfilter,
      campaign_id: campaignfilter,
      vendor_id: agencyfilter,
      country: countryfilter,
      event_type: eventTypeValue,
      column_type: selectedRadioButton,
      os_type: getOsTypePayload(osTypeFilter),
    };
  }, [
    selectedPackage,
    startDate,
    endDate,
    currentPage,
    limit,
    debouncedSearchTerm,
    publisherfilter,
    campaignfilter,
    agencyfilter,
    countryfilter,
    selectedEventTypes,
    selectedRadioButton,
    osTypeFilter,
  ]);

  // Event Type List Payload
  const eventTypeListPayload = useMemo<EventTypeListPayload | undefined>(() => {
    if (!selectedPackage || !startDate || !endDate) return undefined;
    return {
      package_name: selectedPackage,
      start_date: startDate,
      end_date: endDate,
    };
  }, [selectedPackage, startDate, endDate]);

  // Install Chart Payload
  const installChartPayload = useMemo<ConversionChartPayload | undefined>(() => {
    if (!selectedPublisher || !selectedPackage || !dialogStartDate || !dialogEndDate) {
      return undefined;
    }
    return {
      start_date: dialogStartDate,
      end_date: dialogEndDate,
      package_name: selectedPackage,
      publisher: [selectedPublisher],
      os_type: getOsTypePayload(osTypeFilter),
    };
  }, [selectedPublisher, selectedPackage, dialogStartDate, dialogEndDate, osTypeFilter]);

  // Event Chart Payload
  const eventChartPayload = useMemo<ConversionChartPayload | undefined>(() => {
    if (!selectedPublisher || !selectedPackage || !dialogStartDate || !dialogEndDate) {
      return undefined;
    }
    const eventTypes =
      selectedEventTypesChart.length > 0 ? selectedEventTypesChart : [];
    return {
      start_date: dialogStartDate,
      end_date: dialogEndDate,
      package_name: selectedPackage,
      publisher: [selectedPublisher],
      event_type: eventTypes.length === 0 ? ["all"] : eventTypes,
      os_type: getOsTypePayload(osTypeFilter),
    };
  }, [
    selectedPublisher,
    selectedPackage,
    dialogStartDate,
    dialogEndDate,
    selectedEventTypesChart,
    osTypeFilter,
  ]);

  // API call for publisher summary
  const {
    data: publisherSummaryData,
    isLoading: isLoadingPublisherSummary,
    isFetching: isFetchingPublisherSummary,
    refetch: refetchPublisherSummary,
  } = usePublisherSummary("install", publisherSummaryPayload, !!publisherSummaryPayload);

  // Event Type List API
  const { data: eventTypeListData, isLoading: isLoadingEventTypeFilter } =
    useEventTypeList(eventTypeListPayload, !!eventTypeListPayload);

  // Install Chart API
  const { data: installChartData, isLoading: installChartLoading } =
    useClickConversion("install", installChartPayload, !!installChartPayload && isDialogOpen);

  // Event Chart API
  const { data: eventChartData, isLoading: eventChartLoading } =
    useConversionEvent(eventChartPayload, !!eventChartPayload && isDialogOpen);

  const isLoading = isLoadingPublisherSummary || isFetchingPublisherSummary;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Transform event type list
  const eventTypeOptions = useMemo(() => {
    if (!eventTypeListData || !Array.isArray(eventTypeListData)) return [];
    return eventTypeListData.map((item: any) =>
      typeof item === "string" ? item : item?.event_type ?? item?.name ?? String(item)
    );
  }, [eventTypeListData]);

  // Initialize selected event types when options load
  useEffect(() => {
    if (eventTypeOptions.length > 0 && selectedEventTypesChart.length === 0) {
      setSelectedEventTypesChart(eventTypeOptions);
    }
  }, [eventTypeOptions]);

  // Transform install chart data
  const transformedInstallChartData = useMemo<ChartDataItem[]>(() => {
    if (!installChartData || !Array.isArray(installChartData)) return [];
    return installChartData.map((item: any) => ({
      label: item?.bucket || "",
      standard: item?.percentage || 0,
      demandgen: item?.percentage || 0,
    }));
  }, [installChartData]);

  // Transform event chart data
  const transformedEventChartData = useMemo<ChartDataItem[]>(() => {
    if (!eventChartData || !Array.isArray(eventChartData)) return [];
    return eventChartData.map((item: any) => ({
      label: item?.bucket || "",
      standard: item?.percentage || 0,
      demandgen: item?.percentage || 0,
    }));
  }, [eventChartData]);

  // Handle publisher summary data response
  useEffect(() => {
    if (publisherSummaryData) {
      // Check if response has URL (CSV export)
      if (publisherSummaryData.url) {
        const link = document.createElement("a");
        link.href = publisherSummaryData.url;
        link.setAttribute("download", "fraud_sub_categories.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (publisherSummaryData?.data && publisherSummaryData.data.length > 0) {
        setTableData(publisherSummaryData.data);
        const firstRow = publisherSummaryData.data[0];
        if (!firstRow) {
          setTableData([]);
          setTotalPages(1);
          setTotalRecords(0);
          return;
        }

        const dynamicColumns = Object.keys(firstRow)
          .filter((key) => key !== "Publisher")
          .map((key) => {
            // Check if this column should have a custom render function
            if (
              key === "action" ||
              key === "buttons" ||
              key.toLowerCase().includes("button")
            ) {
              return {
                title: key,
                key: key,
                render: (item: any) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Dispatch custom event for showing details
                        const event = new CustomEvent(
                          "showPublisherDetails",
                          {
                            detail: { publisherId: item?.Publisher },
                          }
                        );
                        window.dispatchEvent(event);
                      }}
                      className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-subBody"
                    >
                      View Details
                    </button>
                  </div>
                ),
              };
            }

            // For regular columns, check if the value is an object that needs special handling
            return {
              title: key,
              key: key,
              render: (item: any) => {
                const value = item?.[key];
                // Handle objects, arrays, or complex data
                if (typeof value === "object" && value !== null) {
                  if (Array.isArray(value)) {
                    return value.join(", ");
                  }
                  // For objects, you might want to display a specific property or stringify
                  return JSON.stringify(value);
                }
                // For primitive values, display as is
                return typeof value === "number"
                  ? value.toLocaleString()
                  : String(value || "");
              },
            };
          });
        const final = [
          {
            title: "Publisher",
            key: "Publisher",
            render: (item: any) => (
              <button
                onClick={() => {
                  const event = new CustomEvent("showPublisherDetails", {
                    detail: { publisherId: item?.Publisher },
                  });
                  window.dispatchEvent(event);
                }}
                className="text-primary hover:underline cursor-pointer"
              >
                {item?.Publisher || ""}
              </button>
            ),
          },
          ...dynamicColumns,
        ];

        setTableColumns(final);
        setTotalPages(publisherSummaryData?.Total_pages || 1);
        setTotalRecords(publisherSummaryData?.Total_records || 0);
      } else {
        setTableData([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    }
  }, [publisherSummaryData]);

  // CSV Export payloads
  const [isExportingInstallChart, setIsExportingInstallChart] = useState(false);
  const [isExportingEventChart, setIsExportingEventChart] = useState(false);

  const installChartExportPayload = useMemo<ConversionChartPayload | undefined>(() => {
    if (!selectedPublisher || !selectedPackage || !dialogStartDate || !dialogEndDate || !isExportingInstallChart) {
      return undefined;
    }
    return {
      start_date: dialogStartDate,
      end_date: dialogEndDate,
      package_name: selectedPackage,
      publisher: [selectedPublisher],
      os_type: getOsTypePayload(osTypeFilter),
      export_type: "csv",
    };
  }, [selectedPublisher, selectedPackage, dialogStartDate, dialogEndDate, isExportingInstallChart, osTypeFilter]);

  const eventChartExportPayload = useMemo<ConversionChartPayload | undefined>(() => {
    if (!selectedPublisher || !selectedPackage || !dialogStartDate || !dialogEndDate || !isExportingEventChart) {
      return undefined;
    }
    const eventTypes = selectedEventTypesChart.length > 0 ? selectedEventTypesChart : [];
    return {
      start_date: dialogStartDate,
      end_date: dialogEndDate,
      package_name: selectedPackage,
      publisher: [selectedPublisher],
      event_type: eventTypes.length === 0 ? ["all"] : eventTypes,
      os_type: getOsTypePayload(osTypeFilter),
      export_type: "csv",
    };
  }, [selectedPublisher, selectedPackage, dialogStartDate, dialogEndDate, selectedEventTypesChart, isExportingEventChart, osTypeFilter]);

  // Export API hooks
  const { data: installChartExportData } = useClickConversion(
    "install",
    installChartExportPayload,
    !!installChartExportPayload
  );

  const { data: eventChartExportData } = useConversionEvent(
    eventChartExportPayload,
    !!eventChartExportPayload
  );

  // Handle CSV downloads
  useEffect(() => {
    const exportData = installChartExportData as any;
    if (exportData?.url) {
      const link = document.createElement("a");
      link.href = exportData.url;
      link.setAttribute("download", `Install_Conversion_Rate_${selectedPublisher || "unknown"}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportingInstallChart(false);
    }
  }, [installChartExportData, selectedPublisher]);

  useEffect(() => {
    const exportData = eventChartExportData as any;
    if (exportData?.url) {
      const link = document.createElement("a");
      link.href = exportData.url;
      link.setAttribute("download", `Install_to_Event_Time_${selectedPublisher || "unknown"}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportingEventChart(false);
    }
  }, [eventChartExportData, selectedPublisher]);

  // Handle CSV export for install chart
  const handleInstallChartExportCsv = useCallback(() => {
    setIsExportingInstallChart(true);
  }, []);

  // Handle CSV export for event chart
  const handleEventChartExportCsv = useCallback(() => {
    setIsExportingEventChart(true);
  }, []);

  const handleSelectedRadioButton = (data: any) => {
    setSelectedRadioButton(data);
    setCurrentPage(1);
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 1500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Explicitly refetch when filter (radio button) changes
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    
    refetchPublisherSummary?.();
  }, [selectedRadioButton, refetchPublisherSummary]);

  // Listen for the custom event
  useEffect(() => {
    const handleShowDetails = (event: CustomEvent) => {
      const publisherId = event?.detail?.publisherId;
      if (publisherId) {
        setSelectedPublisher(publisherId);
        setDialogStartDate(startDate);
        setDialogEndDate(endDate);
        setDialogDateRange({
          from: new Date(startDate),
          to: new Date(endDate),
        });
        setIsDialogOpen(true);
      }
    };
    window.addEventListener("showPublisherDetails", handleShowDetails as EventListener);
    return () => {
      window.removeEventListener("showPublisherDetails", handleShowDetails as EventListener);
    };
  }, [startDate, endDate]);

  const handleDeviceChange = (value: string) => {
    const deviceMap: Record<string, string> = {
      Desktop: "desktop",
      Mobile: "mobile",
    };
    setDeviceType(deviceMap[value] ?? "desktop");
  };


  // Handle event type selection
  const handleEventTypeToggle = (eventType: string) => {
    setSelectedEventTypes(eventType);
    setIsEventTypeDropdownOpen(false);
  };

  // Handle select all event types
  const handleSelectAllEventTypes = () => {
    setSelectedEventTypes("");
    setIsEventTypeDropdownOpen(false);
  };

  // Handle event type filter change for chart (using multi-select from DoubleLineChart)
  const handleEventTypeFilterChange = useCallback((values: string | string[]) => {
    setSelectedEventTypesChart(Array.isArray(values) ? values : [values]);
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handler for dialog date change (local state only)
  const handleDialogDateChange = useCallback((range: DateRange | undefined) => {
    setDialogDateRange(range);
    if (range?.from && range?.to) {
      setDialogStartDate(format(range.from, "yyyy-MM-dd"));
      setDialogEndDate(format(range.to, "yyyy-MM-dd"));
      setIsDatePickerOpen(false);
    }
  }, []);

  // Handler for dialog preset selection
  const handleDialogPresetSelect = useCallback((value: string) => {
    let newDateRange: DateRange | undefined;

    switch (value) {
      case "l_month":
        newDateRange = {
          from: startOfMonth(subMonths(new Date(), 1)),
          to: endOfMonth(subMonths(new Date(), 1)),
        };
        break;
      case "l_week":
        newDateRange = {
          from: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
          to: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
        };
        break;
      default:
        const days = parseInt(value, 10);
        if (!isNaN(days)) {
          newDateRange = {
            from: subDays(new Date(), days),
            to: new Date(),
          };
        }
        break;
    }

    if (newDateRange?.from && newDateRange?.to) {
      setDialogDateRange(newDateRange);
      setDialogStartDate(format(newDateRange.from, "yyyy-MM-dd"));
      setDialogEndDate(format(newDateRange.to, "yyyy-MM-dd"));
      // Use setTimeout to ensure state updates before closing
      setTimeout(() => {
        setIsDatePickerOpen(false);
      }, 100);
    }
  }, []);

  // Date preset options for MFSingleSelect
  const datePresetItems = useMemo(() => [
    { title: "Last 7 days", value: "7" },
    { title: "Last week", value: "l_week" },
    { title: "Last 30 days", value: "30" },
    { title: "Last month", value: "l_month" },
    { title: "Last 3 months", value: "90" },
  ], []);

  const [isExporting, setIsExporting] = useState(false);

  // Export payload
  const exportPayload = useMemo<PublisherSummaryPayload | undefined>(() => {
    if (!selectedPackage || !startDate || !endDate || !isExporting) {
      return undefined;
    }
    return {
      start_date: startDate,
      end_date: endDate,
      package_name: selectedPackage,
      summary_type: "publisher",
      publisher_type: "all",
      order: "ascending",
      column_name: "publisher_name",
      page_number: currentPage,
      record_limit: limit,
      search_term: debouncedSearchTerm,
      publisher: publisherfilter,
      campaign_id: campaignfilter,
      vendor_id: agencyfilter,
      country: countryfilter,
      event_type: ["all"],
      column_type: selectedRadioButton,
      os_type: getOsTypePayload(osTypeFilter),
      export_type: "csv",
    };
  }, [
    selectedPackage,
    startDate,
    endDate,
    currentPage,
    limit,
    debouncedSearchTerm,
    publisherfilter,
    campaignfilter,
    agencyfilter,
    countryfilter,
    selectedRadioButton,
    isExporting,
    osTypeFilter,
  ]);

  // Export API hook
  const {
    data: exportData,
  } = usePublisherSummary("install", exportPayload, !!exportPayload);

  // Handle export data response
  useEffect(() => {
    if (exportData?.url) {
      const link = document.createElement("a");
      link.href = exportData.url;
      link.setAttribute("download", "fraud_sub_categories.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }
  }, [exportData]);

  //export
  const handleExport = () => setIsExporting(true);
 useEffect(() => {
    setCurrentPage(1)
  }, [
    publisherfilter,
    campaignfilter,
    agencyfilter,
    countryfilter,
    osTypeFilter,
    selectedEventTypes,
    selectedRadioButton,
   
  ])


  return (
    <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-0 transition-all duration-300">
      {/* Modern Section Header with Event Type Selector */}
      <div className="flex  items-start sm:items-center justify-between gap-2 p-2 ">
        {/* Title with gradient bars */}
        <div className="flex items-center justify-center gap-2">
        <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full dark:from-primary dark:to-white" />
        <h2 className="text-subHeader font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white]">
          Publisher Validation Summary
        </h2>
        <div className="h-8 w-1 bg-gradient-to-b from-secondary to-primary rounded-full dark:from-white dark:to-primary" />
        </div>

        {/* Event Type Dropdown */}
        <div className="flex items-center gap-2 p-2">
          <span className="text-subBody text-muted-foreground hidden sm:inline">
            Filter by:
          </span>
          <DropdownMenu
            open={isEventTypeDropdownOpen}
            onOpenChange={setIsEventTypeDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-9 text-subBody min-w-[140px] justify-between hover:bg-muted/50 transition-all"
              >
                <span className="text-subBody font-medium">Event Types</span>
                <div className="flex items-center gap-1.5">
                  {hasMounted && (
                    <span className="text-subBody bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold dark:text-white">
                      {!selectedEventTypes || selectedEventTypes === "all"
                        ? "All"
                        : "1"}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
              <div className="p-2 border-b">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-subBody font-medium">Event Types</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllEventTypes}
                      className="text-subBody"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {isLoadingEventTypeFilter ? (
                <div className="p-2 text-center">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  <span className="text-subBody text-muted-foreground">
                    Loading...
                  </span>
                </div>
              ) : (
                eventTypeOptions.map((eventType) => (
                  <div
                    key={eventType}
                    className="flex items-center px-2 py-1.5 hover:bg-accent cursor-pointer"
                    onClick={() => handleEventTypeToggle(eventType)}
                  >
                    {hasMounted && (
                      <Checkbox
                        checked={selectedEventTypes === eventType}
                        className="mr-2 pointer-events-none"
                      />
                    )}
                    <span className="text-subBody">{eventType}</span>
                  </div>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ResizableTable
        columns={tableColumns}
        data={tableData}
        onSearch={setSearchTerm}
        isTableDownload={true}
        handleExport={handleExport}
        isLoading={isLoading}
        totalPages={totalPages}
        pageNo={currentPage}
        limit={limit}
        onPageChange={setCurrentPage}
        onLimitChange={(newLimit: number) => {
          setLimit(newLimit);
          setCurrentPage(1);
        }}
        filterType="radio"
        filterOptions={[
          { value: "all", label: "All" },
          { value: "valid", label: "Valid" },
          { value: "invalid", label: "Invalid" },
        ]}
        onFilterChange={(value) => handleSelectedRadioButton(Array.isArray(value) ? value[0] : value)}
        selectedFilterValue={selectedRadioButton}
        stickyColumns={["Publisher",]}
        totalRecords={totalRecords}
        containerHeight={650}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col z-[9999]">

          <div className="flex flex-col gap-4 w-full h-full overflow-y-auto">
            {/* Header with Local Date Picker */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sticky top-0 bg-background z-10 pb-2 mt-2">
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-fit justify-start text-left font-normal text-subBody"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dialogDateRange?.from ? (
                      dialogDateRange.to ? (
                        <>
                          {format(dialogDateRange.from, "LLL dd, y")} -{" "}
                          {format(dialogDateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dialogDateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 z-[10000]" 
                  align="start"
                  onInteractOutside={(e) => {
                    // Prevent closing when clicking on Select dropdown
                    const target = e.target as HTMLElement;
                    // Check for Radix Select elements
                    if (target.closest('[role="listbox"]') || 
                        target.closest('[data-radix-select-viewport]') ||
                        target.closest('[data-radix-select-item]') ||
                        target.closest('[data-radix-select-content]') ||
                        target.closest('[data-radix-popper-content-wrapper]')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="p-2" onClick={(e) => e.stopPropagation()}>
                    <MFSingleSelect
                      items={datePresetItems}
                      placeholder="Select Preset"
                      onValueChange={handleDialogPresetSelect}
                      className="w-full"
                    />
                  </div>
                  <Calendar
                    key={`${dialogDateRange?.from?.getTime()}-${dialogDateRange?.to?.getTime()}`}
                    initialFocus
                    mode="range"
                    defaultMonth={dialogDateRange?.from}
                    selected={dialogDateRange}
                    onSelect={handleDialogDateChange}
                    numberOfMonths={2}
                    disabled={{ after: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Charts Container */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
              {/* Install Chart */}
              <DoubleLineChart
                ref={(el) => {
                  if (el) cardRefs.current["install_conversion_rate"] = el;
                }}
                chartData={transformedInstallChartData}
                chartConfig={getInstallChartConfig(selectedPublisher || "")}
                title={`Click to Install Time: ${selectedPublisher || ""}`}
                titleIcon={
                 <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                <Download className="w-5 h-5 text-white" />
                </span>}
                isRadioButton={false}
                isLoading={installChartLoading}
                AxisLabel="Percentage"
                selectoptions={["Desktop", "Mobile"]}
                handleFrequencyChange={handleDeviceChange}
                selectedFrequency={deviceType}
                isPercentage={true}
                LinechartTitle=""
                showMenu={true}
                xAxisLabel="Minutes"
                yAxisLabel="Percentage"
                height={200}
                contentHeight="230px"
                cardHeight="330px"
                handleExportCsv={handleInstallChartExportCsv}
                handleExportPng={handleExportPng}
                handleExpand={() => handleExpand("install_conversion_rate")}
                exportKey="install_conversion_rate"
              />

              {/* Event Chart with Filter */}
              <DoubleLineChart
                ref={(el) => {
                  if (el) cardRefs.current["install_to_event_time"] = el;
                }}
                chartData={transformedEventChartData}
                chartConfig={getEventChartConfig(selectedPublisher || "")}
                title={`Install to Event Time: ${selectedPublisher || ""}`}
                titleIcon={
                 <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                <Clock className="w-5 h-5 text-white" />
                </span>}
                isRadioButton={true}
                isLoading={eventChartLoading}
                AxisLabel="Percentage"
                selectoptions={["Desktop", "Mobile"]}
                handleFrequencyChange={handleDeviceChange}
                selectedFrequency={deviceType === "desktop" ? "Desktop" : "Mobile"}
                isPercentage={true}
                LinechartTitle=""
                showMenu={true}
                xAxisLabel="Minutes"
                yAxisLabel="Percentage"
                height={200}
                contentHeight="230px"
                cardHeight="330px"
                filterType="multi-select"
                filterOptions={eventTypeOptions.map((option) => ({
                  value: option,
                  label: option,
                }))}
                selectedFilterValue={selectedEventTypesChart}
                handleFilterChange={handleEventTypeFilterChange}
                filterPlaceholder="Event Types"
                filterClassName="w-[140px] h-[30px]"
                handleExportCsv={handleEventChartExportCsv}
                handleExportPng={handleExportPng}
                handleExpand={() => handleExpand("install_to_event_time")}
                exportKey="install_to_event_time"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
