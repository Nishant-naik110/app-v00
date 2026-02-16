"use client";
import ProgressBarChart from "@/components/mf/charts/ProgressBarChart";
import { Card, CardContent } from "@/components/ui/card";
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  createExpandHandler,
  createPngExportHandler,
  exportCsvFromUrl,
} from "@/lib/utils";
import StackedBarWithLine1 from "@/components/mf/charts/StackedBarwithLine";
import StackedBarChart from "@/components/mf/charts/stackedBarChart";
import ResizableTable from "@/components/mf/ReportingToolTable";
import { usePackage } from "@/components/mf/PackageContext";
import { useDateRange } from "@/components/mf/DateRangeContext";
import {
  usePublishersFilter,
  useEventTypeFilterExtended,
  useCleanPublishers,
  useFraudulentPublishers,
  useVtaCtaPublisherSummary,
  useStateWisePublisher,
  useMakeModelWisePublisher,
  usePublisherWiseOsDetails,
  useCvr,
  useIncentSamples,
  type PublisherApiResponse,
  type FilterPayload,
} from "../hooks/useDashboard";
import {
  buildSimpleFilter,
  extractSelectedValues,
} from "../hooks/useFilterHelpers";
import { Filter } from "@/components/mf/Filters/Filter";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import MultipleSelect from "@/components/ui/multiple-select";
import { Loader2, BarChart3, TrendingUp } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Constants
const DEBOUNCE_DELAY = 500;
const DEFAULT_PAGE_LIMIT = 10;



// Normalize os_type payload: never send "all", instead default to both OS types
const getOsTypePayload = (osTypes?: string[]) => {
  if (!osTypes || osTypes.length === 0 || osTypes.includes("all")) {
    return ["android", "ios"];
  }
  // Normalize any selected values (e.g. "Ios") to lowercase for the payload
  return osTypes.map((os) => os.toLowerCase());
};

// VTA & CTA table columns
const VTA_CTA_COLUMNS = [
  {
    title: "Publisher Name",
    key: "publisher_name",
    render: (item: any) => item?.publisher_name || "",
  },
  {
    title: "Total Installs",
    key: "total_installs",
    render: (item: any) =>
      new Intl.NumberFormat("en-US").format(item?.total_installs || 0),
  },
  {
    title: "VTA",
    key: "vta",
    render: (item: any) => item?.vta?.toLocaleString() || "0",
  },
  {
    title: "VTA %",
    key: "percent_vta",
    render: (item: any) => item?.percent_vta || "0%",
  },
  {
    title: "CTA",
    key: "cta",
    render: (item: any) =>
      new Intl.NumberFormat("en-US").format(item?.cta || 0),
  },
  {
    title: "CTA %",
    key: "percent_cta",
    render: (item: any) => item?.percent_cta || "0%",
  },
];

// Utility function to create filter structure
const createPublisherFilter = (
  publisherData: PublisherApiResponse,
  selectedPublishers: string[],
  isLoading: boolean
) => {
  const totalPublishers = Object.values(publisherData || {}).flat().length;
  const selectedCount =
    !selectedPublishers ||
    selectedPublishers.length === 0 ||
    selectedPublishers.includes("all")
      ? totalPublishers
      : selectedPublishers.length;

  return {
    Publishers: {
      filters: Object.entries(publisherData || {}).map(([group, publishers]) => ({
        label: group || "",
        checked: true,
        subItems: (Array.isArray(publishers) ? publishers : [])?.map((publisher: string) => ({
          label: publisher || "",
          checked:
            !selectedPublishers ||
            selectedPublishers.length === 0 ||
            selectedPublishers.includes("all") ||
            selectedPublishers.includes(publisher),
        })) || [],
      })),
      isSelectAll:
        !selectedPublishers ||
        selectedPublishers.length === 0 ||
        selectedPublishers.includes("all") ||
        selectedPublishers.length === totalPublishers,
      selectedCount,
      loading: isLoading,
    },
  };
};

// Utility function to normalize publisher filter
const normalizePublisherFilter = (
  filterState: any,
  allPublishers: string[]
): string[] => {
  if (!filterState?.Publishers) return [];
  
  return filterState.Publishers.isSelectAll
    ? ["all"]
    : [
        ...(filterState.Publishers.filters?.Affiliate || []),
        ...(filterState.Publishers.filters?.["Whitelisted Publisher"] || []),
      ];
};

// Utility function to format CVR column value
const formatCvrValue = (value: any): string => {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (typeof value === "string" && value.includes("%")) {
    return value;
  }
  if (typeof value === "string" && !isNaN(Number(value.replace(/,/g, "")))) {
    return Number(value.replace(/,/g, "")).toLocaleString();
  }
  return String(value || "");
};

// Incent Sample Card Component
const IncentSampleCard= ({
  data,
}:{data:any}) => {
  const screenshot_url = data?.screenshot_url;
  const otherData = Object.fromEntries(
    Object.entries(data || {}).filter(([key]) => key !== "screenshot_url")
  );

  const renderValue = useCallback((val: string) => {
    const urlRegex = /^(https?:\/\/[^\s]+)/i;
    const isUrl = urlRegex.test(val);
    const displayValue = val.length > 20 ? val.slice(0, 20) + "..." : val;

    if (isUrl) {
      return (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
          title={val}
        >
          {displayValue}
        </a>
      );
    }

    return (
      <span className="text-xs" title={val}>
        {displayValue}
      </span>
    );
  }, []);

  const formatKey = useCallback((key: string) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  return (
    <Card className="w-full h-[290px] overflow-hidden border">
      <CardContent className="p-4">
        <div className="flex h-full w-full justify-between">
          <div className="w-2/3 space-y-4">
            {Object.entries(otherData).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-subBody">
                <span className="w-2 h-2 bg-black rounded-full" />
                <span className="text-subBody font-semibold">{formatKey(key)}:</span>
                {renderValue(String(value))}
              </div>
            ))}
          </div>
          <div className="w-1/2 flex items-center justify-center pl-16">
            {screenshot_url ? (
              <div className="w-48 h-64">
                <img
                  src={screenshot_url}
                  alt="Screenshot"
                  className="w-full h-full object-cover rounded-lg shadow-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-subBody">Image not available</div>';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-48 h-64 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
                No screenshot_url
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Section Header Component
const SectionHeader = ({ title }
  : {title:String}
) => (
  <div className="flex items-center justify-center gap-2 mb-2">
    <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full dark:from-primary dark:to-white" />
    <h2 className="text-subHeader font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white]">
      {title}
    </h2>
     <div className="h-8 w-1 bg-gradient-to-b from-secondary to-primary rounded-full dark:from-white dark:to-primary" />
  </div>
);

const Analytics = () => {
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const { selectedPackage, isPackageLoading } = usePackage();
  const { startDate, endDate } = useDateRange();

  // Consolidated state
  const [selectedType] = useState<"install" | "event">("install");
  const [selectedPublisher, setSelectedPublisher] = useState<string>("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Export states
  const [isExportingCleanInstall, setIsExportingCleanInstall] = useState(false);
  const [isExportingFraudulentInstall, setIsExportingFraudulentInstall] = useState(false);
  const [isExportingCleanEvent, setIsExportingCleanEvent] = useState(false);
  const [isExportingFraudulentEvent, setIsExportingFraudulentEvent] = useState(false);
  const [isExportingVtaCta, setIsExportingVtaCta] = useState(false);
  const [isExportingStateWise, setIsExportingStateWise] = useState(false);
  const [isExportingMakeModel, setIsExportingMakeModel] = useState(false);
  const [isExportingOsVersion, setIsExportingOsVersion] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);

  // CVR state
  const [cvrState, setCvrState] = useState({
    publisherFilter: [] as string[],
    eventTypeFilter: [] as string[],
    currentPage: 1,
    limit: DEFAULT_PAGE_LIMIT,
    totalPages: 1,
    totalRecords: 0,
  });

  // CVR search state (matching Publisher.tsx pattern)
  const [cvrSearchTerm, setCvrSearchTerm] = useState("");
  const [debouncedCvrSearchTerm, setDebouncedCvrSearchTerm] = useState("");

  // Incent samples state
  const [incentSamplesState, setIncentSamplesState] = useState({
    publisherFilter: [] as string[],
    debouncedPublisherFilter: ["all"] as string[],
  });

  // VTA & CTA search state (matching Publisher.tsx pattern)
  const [vtaCtaSearchTerm, setVtaCtaSearchTerm] = useState("");
  const [debouncedVtaCtaSearchTerm, setDebouncedVtaCtaSearchTerm] = useState("");

  // Base filter payload for filter hooks
  const baseFilterPayload = useMemo(() => {
    if (!selectedPackage || isPackageLoading) {
      return undefined;
    }
    return {
      package_name: selectedPackage,
      start_date: startDate,
      end_date: endDate,
    };
  }, [selectedPackage, startDate, endDate, isPackageLoading]);

  // Simple OS Type filter state
  const osTypeData = useMemo(() => ["android", "ios"], []);
  const [selectedOsTypes, setSelectedOsTypes] = useState<string[]>(["all"]);

  // Build OS Type filter for UI
  const osTypeFilter = useMemo(() => ({
    "OS Type": buildSimpleFilter(osTypeData, selectedOsTypes, false),
  }), [osTypeData, selectedOsTypes]);

  // Handle OS Type filter change
  const handleOsTypeFilterChange = (newState: any) => {
    if (newState["OS Type"]) {
      setSelectedOsTypes(extractSelectedValues(newState["OS Type"]));
    }
  };

  // Normalize os_type payload
  const getOsTypePayload = (osTypes?: string[]) => {
    if (!osTypes || osTypes.length === 0 || osTypes.includes("all")) {
      return ["android", "ios"];
    }
    return osTypes.map((os) => os.toLowerCase());
  };

  // Base payload
  const basePayload = useMemo<FilterPayload | undefined>(() => {
    if (!selectedPackage || !startDate || !endDate || isPackageLoading) {
      return undefined;
    }
    return {
      package_name: selectedPackage,
      start_date: startDate,
      end_date: endDate,
      os_type: getOsTypePayload(selectedOsTypes),
    };
  }, [selectedPackage, startDate, endDate, isPackageLoading, selectedOsTypes]);

  // Publishers Filter API
  const publishersFilterApi = usePublishersFilter(
    selectedType,
    basePayload,
    !!basePayload
  );

  const existingPublisherdata = useMemo<PublisherApiResponse>(
    () =>
      publishersFilterApi?.data || {
        Affiliate: [],
        "Whitelisted Publisher": [],
      },
    [publishersFilterApi?.data]
  );

  // Event Type Filter API
  const eventTypeFilterApi = useEventTypeFilterExtended(
    "event",
    basePayload,
    !!basePayload
  );

  const existingEventTypeData = useMemo<string[]>(
    () => (Array.isArray(eventTypeFilterApi?.data) ? eventTypeFilterApi.data : []),
    [eventTypeFilterApi?.data]
  );

  // Initialize selected publisher
  useEffect(() => {
    if (
      existingPublisherdata?.Affiliate?.length > 0 &&
      !selectedPublisher
    ) {
      const firstPublisher = existingPublisherdata.Affiliate[0];
      if (firstPublisher) {
        setSelectedPublisher(firstPublisher);
      }
    }
  }, [existingPublisherdata?.Affiliate, selectedPublisher]);

  // Initialize filters
  useEffect(() => {
    if (existingPublisherdata?.Affiliate?.length > 0) {
      setIncentSamplesState((prev) => {
        if (prev.publisherFilter.length === 0 && prev.debouncedPublisherFilter.length === 1 && prev.debouncedPublisherFilter[0] === "all") {
          return prev;
        }
        return {
          publisherFilter: ["all"],
          debouncedPublisherFilter: ["all"],
        };
      });
    }
  }, [existingPublisherdata?.Affiliate]);

  useEffect(() => {
    if (existingEventTypeData.length > 0 && cvrState.eventTypeFilter.length === 0) {
      setCvrState((prev) => ({ ...prev, eventTypeFilter: existingEventTypeData }));
    }
  }, [existingEventTypeData, cvrState.eventTypeFilter.length]);

  // Debounce CVR search term (matching Publisher.tsx pattern)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCvrSearchTerm(cvrSearchTerm);
    }, 1500); // 1500ms delay like Publisher.tsx

    return () => {
      clearTimeout(timer);
    };
  }, [cvrSearchTerm]);

  // Debounce VTA & CTA search term (matching Publisher.tsx pattern)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVtaCtaSearchTerm(vtaCtaSearchTerm);
    }, 1500); // 1500ms delay like Publisher.tsx

    return () => {
      clearTimeout(timer);
    };
  }, [vtaCtaSearchTerm]);

  // Debounce incent samples publisher filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setIncentSamplesState((prev) => ({
        ...prev,
        debouncedPublisherFilter: prev.publisherFilter,
      }));
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [incentSamplesState.publisherFilter]);

  // Publisher items for dropdown
  const publisherItems = useMemo(
    () =>
      (existingPublisherdata?.Affiliate || []).map((publisher) => ({
        title: publisher,
        value: publisher,
      })),
    [existingPublisherdata?.Affiliate]
  );

  // Filters
  const cvrFilter = useMemo(
    () => ({
      publishersFilter: createPublisherFilter(
        existingPublisherdata,
        cvrState.publisherFilter,
        publishersFilterApi?.isLoading || false
      ),
    }),
    [
      existingPublisherdata,
      cvrState.publisherFilter,
      publishersFilterApi?.isLoading,
    ]
  );

  const incentSamplesFilter = useMemo(
    () => ({
      publishersFilter: createPublisherFilter(
        existingPublisherdata,
        incentSamplesState.publisherFilter,
        publishersFilterApi?.isLoading || false
      ),
    }),
    [
      existingPublisherdata,
      incentSamplesState.publisherFilter,
      publishersFilterApi?.isLoading,
    ]
  );

  // Handlers
  const handleCvrFilterChange = useCallback((filterState: any) => {
    const allPublishers = Object.values(existingPublisherdata || {}).flat();
    const publishers = normalizePublisherFilter(filterState, allPublishers);
    setCvrState((prev) => ({ ...prev, publisherFilter: publishers }));
  }, [existingPublisherdata]);

  const handleEventTypeChange = useCallback(
    (values: string[]) => {
      const shouldSelectAll =
        values.length === 0 || values.length === existingEventTypeData.length;
      setCvrState((prev) => ({
        ...prev,
        eventTypeFilter: shouldSelectAll ? ["all"] : values,
      }));
    },
    [existingEventTypeData]
  );

  const handlePublisherChange = useCallback((value: string) => {
    setSelectedPublisher(value);
  }, []);

  // Publisher payload
  const publisherPayload = useMemo(() => {
    if (!basePayload || !selectedPublisher) return undefined;
    return {
      ...basePayload,
      publisher: [selectedPublisher],
    };
  }, [basePayload, selectedPublisher]);

  // VTA & CTA payload with search
  const vtaCtaPayload = useMemo(() => {
    if (!basePayload) return undefined;
    return {
      ...basePayload,
      search_term: debouncedVtaCtaSearchTerm,
    };
  }, [basePayload, debouncedVtaCtaSearchTerm]);

  // Export handlers
  const handleExportVtaCta = useCallback(() => {
    setIsExportingVtaCta(true);
  }, []);

  // Export payloads
  const cleanInstallExportPayload = useMemo<FilterPayload | undefined>(() => {
    if (!basePayload || !isExportingCleanInstall) return undefined;
    return {
      ...basePayload,
      export_type: "csv",
    };
  }, [basePayload, isExportingCleanInstall]);

  const fraudulentInstallExportPayload = useMemo<FilterPayload | undefined>(() => {
    if (!basePayload || !isExportingFraudulentInstall) return undefined;
    return {
      ...basePayload,
      export_type: "csv",
    };
  }, [basePayload, isExportingFraudulentInstall]);

  const cleanEventExportPayload = useMemo<FilterPayload | undefined>(() => {
    if (!basePayload || !isExportingCleanEvent || selectedType !== "event") return undefined;
    return {
      ...basePayload,
      export_type: "csv",
    };
  }, [basePayload, isExportingCleanEvent, selectedType]);

  const fraudulentEventExportPayload = useMemo<FilterPayload | undefined>(() => {
    if (!basePayload || !isExportingFraudulentEvent || selectedType !== "event") return undefined;
    return {
      ...basePayload,
      export_type: "csv",
    };
  }, [basePayload, isExportingFraudulentEvent, selectedType]);

  const vtaCtaExportPayload = useMemo<FilterPayload | undefined>(() => {
    if (!vtaCtaPayload || !isExportingVtaCta) return undefined;
    return {
      ...vtaCtaPayload,
      export_type: "csv",
    };
  }, [vtaCtaPayload, isExportingVtaCta]);

  const stateWiseExportPayload = useMemo(() => {
    if (!publisherPayload || !isExportingStateWise) return undefined;
    return {
      ...publisherPayload,
      export_type: "csv",
    };
  }, [publisherPayload, isExportingStateWise]);

  const makeModelExportPayload = useMemo(() => {
    if (!publisherPayload || !isExportingMakeModel) return undefined;
    return {
      ...publisherPayload,
      export_type: "csv",
    };
  }, [publisherPayload, isExportingMakeModel]);

  const osVersionExportPayload = useMemo(() => {
    if (!publisherPayload || !isExportingOsVersion) return undefined;
    return {
      ...publisherPayload,
      export_type: "csv",
    };
  }, [publisherPayload, isExportingOsVersion]);

  // API calls
  const { data: cleanInstallData, isLoading: isCleanInstallLoading } =
    useCleanPublishers(selectedType, basePayload, !!basePayload);

  const { data: fraudulentInstallData, isLoading: isFraudulentInstallLoading } =
    useFraudulentPublishers(selectedType, basePayload, !!basePayload);

  const { data: cleanEventData, isLoading: isCleanEventLoading } =
    useCleanPublishers(
      selectedType,
      basePayload,
      !!basePayload && selectedType === "event"
    );

  const { data: fraudulentEventData, isLoading: isFraudulentEventLoading } =
    useFraudulentPublishers(
      selectedType,
      basePayload,
      !!basePayload && selectedType === "event"
    );

  // Export API hooks
  const { data: cleanInstallExportData } = useCleanPublishers(
    selectedType,
    cleanInstallExportPayload,
    !!cleanInstallExportPayload
  );

  const { data: fraudulentInstallExportData } = useFraudulentPublishers(
    selectedType,
    fraudulentInstallExportPayload,
    !!fraudulentInstallExportPayload
  );

  const { data: cleanEventExportData } = useCleanPublishers(
    selectedType,
    cleanEventExportPayload,
    !!cleanEventExportPayload
  );

  const { data: fraudulentEventExportData } = useFraudulentPublishers(
    selectedType,
    fraudulentEventExportPayload,
    !!fraudulentEventExportPayload
  );

  const { data: vtaCtaExportData } = useVtaCtaPublisherSummary(
    selectedType,
    vtaCtaExportPayload,
    !!vtaCtaExportPayload
  );

  const { data: stateWiseExportData } = useStateWisePublisher(
    selectedType,
    stateWiseExportPayload as any,
    !!stateWiseExportPayload
  );

  const { data: makeModelExportData } = useMakeModelWisePublisher(
    selectedType,
    makeModelExportPayload as any,
    !!makeModelExportPayload
  );

  const { data: osVersionExportData } = usePublisherWiseOsDetails(
    selectedType,
    osVersionExportPayload as any,
    !!osVersionExportPayload
  );

  // Handle CSV export responses
  useEffect(() => {
    const exportData = cleanInstallExportData as any;
    if (exportData?.url) {
      exportCsvFromUrl({
        url: exportData.url,
        filename: "Valid Install - Top 10 Publishers",
        onSuccess: () => {
          setIsExportingCleanInstall(false);
        },
      });
    }
  }, [cleanInstallExportData]);

  useEffect(() => {
    const exportData = fraudulentInstallExportData as any;
    if (exportData?.url) {
      exportCsvFromUrl({
        url: exportData.url,
        filename: "Invalid Install - Top 10 Publishers",
        onSuccess: () => {
          setIsExportingFraudulentInstall(false);
        },
      });
    }
  }, [fraudulentInstallExportData]);

  useEffect(() => {
    const exportData = cleanEventExportData as any;
    if (exportData?.url) {
      exportCsvFromUrl({
        url: exportData.url,
        filename: "Valid Event - Top 10 Publishers",
        onSuccess: () => {
          setIsExportingCleanEvent(false);
        },
      });
    }
  }, [cleanEventExportData]);

  useEffect(() => {
    const exportData = fraudulentEventExportData as any;
    if (exportData?.url) {
      exportCsvFromUrl({
        url: exportData.url,
        filename: "Invalid Event - Top 10 Publishers",
        onSuccess: () => {
          setIsExportingFraudulentEvent(false);
        },
      });
    }
  }, [fraudulentEventExportData]);

  useEffect(() => {
    const exportData = vtaCtaExportData as any;
    if (exportData?.url) {
      exportCsvFromUrl({
        url: exportData.url,
        filename: "VTA & CTA Ratios",
        onSuccess: () => {
          setIsExportingVtaCta(false);
        },
      });
    }
  }, [vtaCtaExportData]);

  useEffect(() => {
    const exportData = stateWiseExportData as any;
    if (exportData?.url) {
      exportCsvFromUrl({
        url: exportData.url,
        filename: "Top State-wise Install Counts",
        onSuccess: () => {
          setIsExportingStateWise(false);
        },
      });
    }
  }, [stateWiseExportData]);

  useEffect(() => {
    const exportData = makeModelExportData as any;
    if (exportData?.url) {
      exportCsvFromUrl({
        url: exportData.url,
        filename: "Top Make Model Wise Install Counts",
        onSuccess: () => {
          setIsExportingMakeModel(false);
        },
      });
    }
  }, [makeModelExportData]);

  useEffect(() => {
    const exportData = osVersionExportData as any;
    if (exportData?.url) {
      exportCsvFromUrl({
        url: exportData.url,
        filename: "OS Version Distribution",
        onSuccess: () => {
          setIsExportingOsVersion(false);
        },
      });
    }
  }, [osVersionExportData]);

  const { data: vtaCtaData, isLoading: isVtaCtaLoading } =
    useVtaCtaPublisherSummary(selectedType, vtaCtaPayload, !!vtaCtaPayload);

  const { data: stateWiseData, isLoading: isStateWiseLoading } =
    useStateWisePublisher(selectedType, publisherPayload, !!publisherPayload);

  const { data: makeModelData, isLoading: isMakeModelLoading } =
    useMakeModelWisePublisher(selectedType, publisherPayload, !!publisherPayload);

  const { data: osVersionData, isLoading: isOsVersionLoading } =
    usePublisherWiseOsDetails(selectedType, publisherPayload, !!publisherPayload);

  // Data transformations
  const vtaCtaDataFromApi = useMemo(() => {
    if (vtaCtaData?.data && Array.isArray(vtaCtaData.data)) {
      return vtaCtaData.data.map((item: any) => ({
        publisher_name: item?.["Publisher Name"] || "",
        total_installs: item?.["Total Count"] || 0,
        vta: item?.["Vta"] || 0,
        percent_vta: item?.["Vta %"] || "0%",
        cta: item?.["Cta"] || 0,
        percent_cta: item?.["Cta %"] || "0%",
      }));
    }
    return [];
  }, [vtaCtaData]);

  const stateWiseDataFromApi = useMemo(() => {
    if (stateWiseData?.data && Array.isArray(stateWiseData.data)) {
      return stateWiseData.data.map((item: any) => ({
        label: item?.label || "",
        visit: item?.visit || 0,
        percentage: item?.percentage || "",
        fill: item?.fill || "#1976d2",
      }));
    }
    return [];
  }, [stateWiseData]);

  const makeModelDataFromApi = useMemo(() => {
    if (makeModelData?.data && Array.isArray(makeModelData.data)) {
      return makeModelData.data.map((item: any) => ({
        label: item?.label || "",
        visit: item?.visit || 0,
        price: parseFloat((item?.price || "0").toString().replace(/[₹$€£¥,]/g, "")) || 0,
        fill: item?.fill || "#1976d2",
      }));
    }
    return [];
  }, [makeModelData]);

  const osVersionDataFromApi = useMemo(() => {
    if (osVersionData?.data && Array.isArray(osVersionData.data)) {
      return osVersionData.data.map((item: any) => ({
        label: item?.label || "",
        publishers: item?.visit || 0,
        fill: item?.fill || "#1976d2",
      }));
    }
    return [];
  }, [osVersionData]);

  const finalOsVersionData =
    osVersionDataFromApi.length > 0 ? osVersionDataFromApi : [];

  // CVR payload
  const cvrPayload = useMemo(() => {
    if (
      !basePayload ||
      !existingPublisherdata?.Affiliate?.length ||
      !existingEventTypeData.length
    ) {
      return undefined;
    }

    const allPublishers = Object.values(existingPublisherdata || {}).flat();
    const publisherFilter =
      cvrState.publisherFilter.length === 0 ||
      cvrState.publisherFilter.includes("all") ||
      cvrState.publisherFilter.length === allPublishers.length
        ? ["all"]
        : cvrState.publisherFilter;

    const eventTypeFilter =
      cvrState.eventTypeFilter.length === 0 ||
      cvrState.eventTypeFilter.length === existingEventTypeData.length
        ? ["all"]
        : cvrState.eventTypeFilter;

    return {
      ...basePayload,
      publisher: publisherFilter,
      event_type: eventTypeFilter,
      search_term: debouncedCvrSearchTerm,
      page_number: cvrState.currentPage,
      record_limit: cvrState.limit,
    };
  }, [
    basePayload,
    existingPublisherdata,
    existingEventTypeData,
    cvrState.publisherFilter,
    cvrState.eventTypeFilter,
    cvrState.currentPage,
    cvrState.limit,
    debouncedCvrSearchTerm,
  ]);

  const { data: cvrApiData, isLoading: isCvrApiLoading } = useCvr(
    "event",
    cvrPayload,
    !!cvrPayload
  );

  const cvrDataFromApi = useMemo(() => {
    if (cvrApiData) {
      if (cvrApiData?.data && Array.isArray(cvrApiData.data)) {
        return cvrApiData.data;
      }
      if (Array.isArray(cvrApiData)) {
        return cvrApiData;
      }
    }
    return [];
  }, [cvrApiData]);

  // Extract CVR pagination
  useEffect(() => {
    if (cvrApiData) {
      setCvrState((prev) => ({
        ...prev,
        totalPages: cvrApiData?.Total_pages || prev.totalPages,
        totalRecords: cvrApiData?.Total_records || prev.totalRecords,
      }));
    }
  }, [cvrApiData]);

  // CVR columns
  const cvrColumns = useMemo(() => {
    if (cvrDataFromApi.length === 0) return [];
    const firstRow = cvrDataFromApi[0];
    if (!firstRow) return [];

    return Object.keys(firstRow).map((key) => {
      const isButtonField =
        key === "action" ||
        key === "buttons" ||
        key.toLowerCase().includes("button");

      if (isButtonField) {
        return {
          title: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          key,
          render: () => (
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-subBody">
                View Details
              </button>
            </div>
          ),
        };
      }

      return {
        title: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        key,
        render: (item: any) => formatCvrValue(item?.[key]),
      };
    });
  }, [cvrDataFromApi]);

  // Incent Samples payload
  const incentSamplesPayload = useMemo(() => {
    if (
      !basePayload ||
      !incentSamplesState.debouncedPublisherFilter?.length
    ) {
      return undefined;
    }
    return {
      ...basePayload,
      publisher: incentSamplesState.debouncedPublisherFilter,
    };
  }, [basePayload, incentSamplesState.debouncedPublisherFilter]);

  const { data: incentSamplesApiData, isLoading: isIncentSamplesLoading } =
    useIncentSamples(selectedType, incentSamplesPayload, !!incentSamplesPayload);

  const incentSamplesData = useMemo(() => {
    if (incentSamplesApiData?.data && Array.isArray(incentSamplesApiData.data)) {
      return incentSamplesApiData.data.map((item: any) => ({
        date: item?.Date,
        publisher_name: item?.["Publisher Name"],
        sub_publisher_name: item?.["Sub Publisher Name"],
        campaign_id: item?.["Campaign Id"],
        agency_id: item?.["Agency Id"],
        incent_wall: item?.["Incent Wall"],
        screenshot_url: item?.["Screenshot Url"],
        tracking_url: item?.["Tracking Url"],
        country: item?.Country,
      }));
    }
    return [];
  }, [incentSamplesApiData]);

  // CVR Export
  const cvrExportPayload = useMemo(() => {
    if (
      !basePayload ||
      !existingPublisherdata?.Affiliate?.length ||
      !existingEventTypeData.length
    ) {
      return undefined;
    }

    const allPublishers = Object.values(existingPublisherdata || {}).flat();
    const publisherFilter =
      cvrState.publisherFilter.length === 0 ||
      cvrState.publisherFilter.includes("all") ||
      cvrState.publisherFilter.length === allPublishers.length
        ? ["all"]
        : cvrState.publisherFilter;

    const eventTypeFilter =
      cvrState.eventTypeFilter.length === 0 ||
      cvrState.eventTypeFilter.length === existingEventTypeData.length
        ? ["all"]
        : cvrState.eventTypeFilter;

    return {
      ...basePayload,
      publisher: publisherFilter,
      event_type: eventTypeFilter,
      search_term: debouncedCvrSearchTerm,
      page_number: cvrState.currentPage,
      record_limit: cvrState.limit,
      export_type: "csv",
    };
  }, [
    basePayload,
    existingPublisherdata,
    existingEventTypeData,
    cvrState.publisherFilter,
    cvrState.eventTypeFilter,
    cvrState.currentPage,
    cvrState.limit,
    debouncedCvrSearchTerm,
  ]);

  const cvrExportApi = useCvr("event", cvrExportPayload, false);

  useEffect(() => {
    if (cvrExportApi?.data?.url) {
      const link = document.createElement("a");
      link.href = cvrExportApi.data.url;
      link.setAttribute("download", "CVR.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [cvrExportApi?.data]);

  const handleExports = useCallback(() => {
    if (cvrExportPayload && cvrExportApi?.refetch) {
      cvrExportApi.refetch();
    }
  }, [cvrExportPayload, cvrExportApi]);


  // Chart configurations
  const chartConfig = { visit: { label: "Install", color: "#1976d2" } };
  const osChartConfig = { publishers: { label: "Install", color: "#1976d2" } };

  useEffect (() => {
    setCurrentPage(1)
  },[
    osTypeFilter
  ])

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* OS Type Filter */}
      <div className="sticky top-0 z-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-md bg-background px-3 py-1 mt-2">
        <Filter
          filter={osTypeFilter}
          onChange={handleOsTypeFilterChange}
          grouped={false}
        />
      </div>
      {/* Install & Event Analytics Section */}
      <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-2 transition-all duration-300">
        <SectionHeader title="Install & Event Analytics" />
        <div className="relative">
          <Carousel
            opts={{ align: "start", loop: true, slidesToScroll: 1 }}
            className="w-full"
          >
            <div className="flex items-center gap-2">
              <CarouselPrevious className="static translate-y-0 hover:bg-primary/10 transition-colors" />
              <div className="flex-1 overflow-hidden">
                <CarouselContent className="-ml-2">
                  <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/2">
                    <Card
                      ref={(el) => {
                        if (el) cardRefs.current["valid_install"] = el;
                      }}
                      className="h-full bg-gray-100 dark:bg-gray-500 hover:border-green-200 dark:hover:border-green-400 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <CardContent className="p-2 h-full">
                        <ProgressBarChart
                          chartData={cleanInstallData?.data || []}
                          title="Valid Install - Top 10 Publishers"
                          isLoading={isCleanInstallLoading}
                          handleExpand={createExpandHandler({
                            key: "valid_install",
                            cardRefs,
                            expandedCard,
                            setExpandedCard,
                          })}
                          handleExportPng={createPngExportHandler({
                            cardRefs,
                            key: "valid_install",
                            filename: "Valid Install - Top 10 Publishers",
                          })}
                          handleExportCsv={() => setIsExportingCleanInstall(true)}
                          exportKey="valid_install"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  <CarouselItem className="pl-2 basis-full md:basis-1/2">
                    <Card
                      ref={(el) => {
                        if (el) cardRefs.current["invalid_install"] = el;
                      }}
                      className="h-full bg-gray-100  dark:bg-gray-500 hover:border-red-200 dark:hover:border-red-400 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <CardContent className="p-2 h-full">
                        <ProgressBarChart
                          chartData={fraudulentInstallData?.data || []}
                          title="Invalid Install - Top 10 Publishers"
                          isLoading={isFraudulentInstallLoading}
                          handleExpand={createExpandHandler({
                            key: "invalid_install",
                            cardRefs,
                            expandedCard,
                            setExpandedCard,
                          })}
                          handleExportPng={createPngExportHandler({
                            cardRefs,
                            key: "invalid_install",
                            filename: "Invalid Install - Top 10 Publishers",
                          })}
                          handleExportCsv={() => setIsExportingFraudulentInstall(true)}
                          exportKey="invalid_install"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  <CarouselItem className="pl-2 basis-full md:basis-1/2">
                    <Card
                      ref={(el) => {
                        if (el) cardRefs.current["valid_event"] = el;
                      }}
                      className="h-full bg-gray-100 dark:bg-gray-500 hover:border-blue-200 dark:hover:border-blue-400 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <CardContent className="p-2 h-full">
                        <ProgressBarChart
                          chartData={cleanEventData?.data || []}
                          title="Valid Event - Top 10 Publishers"
                          isLoading={isCleanEventLoading}
                          handleExpand={createExpandHandler({
                            key: "valid_event",
                            cardRefs,
                            expandedCard,
                            setExpandedCard,
                          })}
                          handleExportPng={createPngExportHandler({
                            cardRefs,
                            key: "valid_event",
                            filename: "Valid Event - Top 10 Publishers",
                          })}
                          handleExportCsv={() => setIsExportingCleanEvent(true)}
                          exportKey="valid_event"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  <CarouselItem className="pl-2 basis-full md:basis-1/2">
                    <Card
                      ref={(el) => {
                        if (el) cardRefs.current["invalid_event"] = el;
                      }}
                      className="h-full bg-gray-100 dark:bg-gray-500 hover:border-orange-200 dark:hover:border-orange-400 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <CardContent className="p-2 h-full">
                        <ProgressBarChart
                          chartData={fraudulentEventData?.data || []}
                          title="Invalid Event - Top 10 Publishers"
                          isLoading={isFraudulentEventLoading}
                          handleExpand={createExpandHandler({
                            key: "invalid_event",
                            cardRefs,
                            expandedCard,
                            setExpandedCard,
                          })}
                          handleExportPng={createPngExportHandler({
                            cardRefs,
                            key: "invalid_event",
                            filename: "Invalid Event - Top 10 Publishers",
                          })}
                          handleExportCsv={() => setIsExportingFraudulentEvent(true)}
                          exportKey="invalid_event"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                </CarouselContent>
              </div>
              <CarouselNext className="static translate-y-0 hover:bg-primary/10 transition-colors" />
            </div>
          </Carousel>
        </div>
      </div>

      {/* VTA & CTA Ratios Section */}
      <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-4 transition-all duration-300">
        <SectionHeader title="VTA & CTA Ratios" />
        <ResizableTable
          columns={VTA_CTA_COLUMNS}
          data={vtaCtaDataFromApi}
          isTableDownload={true}
          handleExport={handleExportVtaCta}
          isSearchable={true}
          onSearch={(searchTerm: string) => {
            setVtaCtaSearchTerm(searchTerm);
          }}
          isLoading={isVtaCtaLoading || isPackageLoading}
          containerHeight={635}
        />
      </div>

      {/* Publisher Wise Section */}
      <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-4 transition-all duration-300">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
        <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full dark:from-primary dark:to-white" />
        <h2 className="text-subHeader font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white]">
              Publisher Wise
            </h2>
                    <div className="h-8 w-1 bg-gradient-to-b from-secondary to-primary rounded-full dark:from-white dark:to-primary" />
          </div>
          <div className="w-48">
            <MFSingleSelect
              items={publisherItems}
              placeholder={
                publishersFilterApi?.isLoading
                  ? "Loading publishers..."
                  : "Select Publisher"
              }
              className="w-full"
              value={selectedPublisher}
              onValueChange={handlePublisherChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
          <div className="w-full">
            <StackedBarChart
              ref={(el) => {
                if (el) cardRefs.current["os_version_distribution"] = el;
              }}
              chartData={finalOsVersionData}
              chartConfig={osChartConfig}
              title="OS Version Distribution"
              titleIcon={
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                 <BarChart3 className="w-5 h-5 text-white" />
                 </span>}
              handleExportPng={createPngExportHandler({
                cardRefs,
                key: "os_version_distribution",
                filename: "OS Version Distribution",
              })}
              handleExportCsv={() => setIsExportingOsVersion(true)}
              exportKey="os_version_distribution"
              handleExpand={createExpandHandler({
                key: "os_version_distribution",
                cardRefs,
                expandedCard,
                setExpandedCard,
              })}
              isLoading={
                isOsVersionLoading ||
                isPackageLoading ||
                !selectedPublisher
              }
              isHorizontal={true}
              isInformCard={false}
              isLegend={false}
              isCartesian={true}
              yAxis={{ dataKey: "label" }}
              AxisLabel="Count"
              barHeight="13rem"
              cardHeight="16.5rem"
              chartMargins={{ top: 0, right: -10, left: -10, bottom: 0 }}
            />
          </div>

          <div className="w-full">
            <StackedBarChart
              ref={(el) => {
                if (el) cardRefs.current["state_wise_distribution"] = el;
              }}
              chartData={stateWiseDataFromApi}
              chartConfig={chartConfig}
              title="Top State-wise Install Counts"
              titleIcon={
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                <TrendingUp className="w-5 h-5 text-white" />
                </span>}
              handleExportPng={createPngExportHandler({
                cardRefs,
                key: "state_wise_distribution",
                filename: "State-wise Install Counts",
              })}
              handleExportCsv={() => setIsExportingStateWise(true)}
              exportKey="state_wise_distribution"
              handleExpand={createExpandHandler({
                key: "state_wise_distribution",
                cardRefs,
                expandedCard,
                setExpandedCard,
              })}
              isLoading={
                isStateWiseLoading ||
                publishersFilterApi?.isLoading ||
                isPackageLoading ||
                !selectedPublisher
              }
              isHorizontal={true}
              isInformCard={false}
              isLegend={false}
              isCartesian={true}
              yAxis={{ dataKey: "label" }}
              AxisLabel="Count"
              barHeight="13rem"
              cardHeight="16.5rem"
              chartMargins={{ top: 0, right: -10, left: -10, bottom: 0 }}
            />
          </div>
        </div>
        <div
          ref={(el) => {
            if (el) cardRefs.current["event_traffic_trend"] = el;
          }}
          className="w-full mt-2"
        >
          <StackedBarWithLine1
            chartData={makeModelDataFromApi}
            chartConfig={chartConfig}
            title="Top Make Model Wise Install Counts"
            titleIcon={
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-green-500">
                <TrendingUp className="w-5 h-5 text-white" />
              </span>}
            frequencyShow={false}
            handleExportCsv={() => setIsExportingMakeModel(true)}
            handleExpand={createExpandHandler({
              key: "event_traffic_trend",
              cardRefs,
              expandedCard,
              setExpandedCard,
            })}
            handleExportPng={createPngExportHandler({
              cardRefs,
              key: "event_traffic_trend",
              filename: "Top Make Model Wise Install Counts",
            })}
            exportKey="event_traffic_trend"
            isLegend={false}
            isLoading={isMakeModelLoading || isPackageLoading}
            barHeight="11rem"
            contentHeight="13rem"
            cardHeight="16.5rem"
            chartMargins={{ top: 0, right: -10, left: -10, bottom: -4 }}
          />
        </div>
      </div>

      {/* CVR Table Section */}
      <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-4 transition-all duration-300">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
        <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full dark:from-primary dark:to-white" />
        <h2 className="text-subHeader font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white]">
              CVR
            </h2>
                    <div className="h-8 w-1 bg-gradient-to-b from-secondary to-primary rounded-full dark:from-white dark:to-primary" />
          </div>
          <div className="flex items-center gap-4">
            <Filter
              filter={cvrFilter.publishersFilter}
              onChange={handleCvrFilterChange}
              grouped={true}
              publisherGroups={existingPublisherdata as any}
            />
            <div className="w-32 sm:w-48">
              <MultipleSelect
                options={existingEventTypeData}
                selectedValues={cvrState.eventTypeFilter}
                onSelectionChange={handleEventTypeChange}
                placeholder={
                  eventTypeFilterApi?.isLoading
                    ? "Loading event types..."
                    : "Select Event Types"
                }
                disabled={eventTypeFilterApi?.isLoading}
              />
            </div>
          </div>
        </div>
        <ResizableTable
          columns={cvrColumns}
          data={cvrDataFromApi}
          isSearchable={true}
          onSearch={(searchTerm: string) => {
            setCvrSearchTerm(searchTerm);
            setCvrState((prev) => ({ ...prev, currentPage: 1 }));
          }}
          isLoading={isCvrApiLoading || isPackageLoading}
          isTableDownload={true}
          handleExport={handleExports}
          emptyStateMessage="No CVR data found"
          isPaginated={true}
          totalPages={cvrState.totalPages}
          totalRecords={cvrState.totalRecords}
          pageNo={cvrState.currentPage}
          limit={cvrState.limit}
          onPageChange={(newPage: number) =>
            setCvrState((prev) => ({ ...prev, currentPage: newPage }))
          }
          onLimitChange={(newLimit: number) =>
            setCvrState((prev) => ({ ...prev, limit: newLimit, currentPage: 1 }))
          }
          containerHeight={635}
        />
      </div>

      {/* Incent Samples Section */}
      <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-4 transition-all duration-300">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
        <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full dark:from-primary dark:to-white" />
        <h2 className="text-subHeader font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white]">
              Incent Samples
            </h2>
                   <div className="h-8 w-1 bg-gradient-to-b from-secondary to-primary rounded-full dark:from-white dark:to-primary" />
          </div>
          <div className="flex items-center gap-4">
            <Filter
              filter={incentSamplesFilter.publishersFilter}
              onChange={(filterState: any) => {
                const allPublishers = Object.values(existingPublisherdata || {}).flat();
                const publishers = normalizePublisherFilter(filterState, allPublishers);
                setIncentSamplesState((prev) => ({
                  ...prev,
                  publisherFilter: publishers,
                }));
              }}
              grouped={true}
              publisherGroups={existingPublisherdata as any}
            />
          </div>
        </div>
        <div className="w-full max-w-full overflow-hidden">
          {isIncentSamplesLoading || isPackageLoading ? (
            <div className="flex items-center justify-center h-[300px] sm:h-[300px] lg:h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : incentSamplesData.length > 0 ? (
            <div className="relative">
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <div className="flex items-center gap-4">
                  <CarouselPrevious className="static" />
                  <div className="flex-1 overflow-hidden">
                    <CarouselContent>
                      {incentSamplesData?.map((sample: any, index: number) => (
                        <CarouselItem
                          key={index}
                          className="basis-full md:basis-1/2"
                        >
                          <div className="w-full h-full p-2">
                            <IncentSampleCard data={sample || {}} />
                          </div>
                        </CarouselItem>
                      )) || []}
                    </CarouselContent>
                  </div>
                  <CarouselNext className="static" />
                </div>
              </Carousel>
            </div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center">
              <span className="text-subBody dark:text-white">No Data Found!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
