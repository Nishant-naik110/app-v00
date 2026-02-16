"use client";

import { useApi } from "@/hooks/api/api_base";

export interface FilterApiResponse {
  data: string[];
  isLoading: boolean;
}

export interface PublisherApiResponse {
  Affiliate: string[];
  "Whitelisted Publisher": string[];
  [key: string]: string[];
}

export interface ChartDataResponse {
  data: any[];
  config?: Record<string, any>;
  url?: string;
}

export interface StatsCardData {
  [key: string]: {
    count: string | number;
    percentage?: string;
    color_code?: string;
  };
}

export interface FilterPayload {
  package_name: string;
  start_date: string;
  end_date: string;
}

export interface DashboardPayload {
  start_date: string;
  end_date: string;
  package_name: string;
  publisher?: string[];
  vendor_id?: string[];
  campaign_id?: string[];
  country?: string[];
  event_type?: string[];
  os_type?: string[];
  useConversionDate?: boolean;
  category?: string;
  frequency?: string;
  type?: string;
  export_type?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_APP_PERF || "";

const getApiUrl = (endpoint: string): string => `${API_BASE}${endpoint}`;

const generateQueryKey = (baseKey: string, ...dependencies: any[]): string[] => {
  return [
    baseKey,
    ...dependencies.map((dep) => {
      if (dep === null || dep === undefined) return "";
      if (typeof dep === "object") return JSON.stringify(dep);
      return String(dep);
    }),
  ];
};

export const usePublishersFilter = (
  selectedType: "install" | "event" = "install",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<PublisherApiResponse>(
    getApiUrl(`${selectedType}/publisher`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("publishers-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useCampaignsFilter = (
  selectedType: "install" | "event" = "install",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`${selectedType}/campaign`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("campaigns-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useAgencyFilter = (
  selectedType: "install" | "event" = "install",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`${selectedType}/agency`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("agency-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useCountryFilter = (
  selectedType: "install" | "event" = "install",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`${selectedType}/country`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("country-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useEventTypeFilter = (
  selectedType: "install" | "event" = "install",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`${selectedType}/event_list`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("event-type-filter", payload, selectedType),
      enabled,
    }
  );
};

// ============================================================================
// CHART DATA HOOKS - Following ticketing pattern
// ============================================================================

export const useTotalPercentage = (
  selectedType: "install" | "event" = "install",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<StatsCardData>(
    getApiUrl(`${selectedType}/total_percentage`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("total-percentage", payload, selectedType),
      enabled,
    }
  );
};

export const useDateWiseTrend = (
  selectedType: "install" | "event" = "install",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`${selectedType}/trends`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("date-wise-trend", payload, selectedType),
      enabled,
    }
  );
};

export const usePublisherVendorTrend = (
  selectedType: "install" | "event" = "install",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`${selectedType}/publisher_trends`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("publisher-vendor-trend", payload, selectedType),
      enabled,
    }
  );
};

export const useSplitOfSources = (
  selectedType: "install" | "event" = "install",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`${selectedType}/source_split`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("split-of-sources", payload, selectedType),
      enabled,
     
    }
  );
};

export const useFraudCategories = (
  selectedType: "install" | "event" = "install",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`${selectedType}/fraud_category`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("fraud-categories", payload, selectedType),
      enabled,
    }
  );
};

export const useFraudSubCategoryProgressBar = (
  selectedType: "install" | "event" = "install",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`${selectedType}/fraud_sub_category_progress_bar`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("fraud-sub-category-progress-bar", payload, selectedType),
      enabled,
    }
  );
};

export const useDateWiseFraudSubCategory = (
  selectedType: "install" | "event" = "install",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`${selectedType}/date_wise_fraud_sub_category_chart`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("date-wise-fraud-sub-category", payload, selectedType),
      enabled,
    }
  );
};

export const usePublisherWiseFraudSubCategory = (
  selectedType: "install" | "event" = "install",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`${selectedType}/publisher_wise_fraud_sub_category`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("publisher-wise-fraud-sub-category", payload, selectedType),
      enabled,
    }
  );
};

export interface PublisherSummaryPayload extends DashboardPayload {
  summary_type?: string;
  publisher_type?: string;
  order?: string;
  column_name?: string;
  page_number?: number;
  record_limit?: number;
  search_term?: string;
  column_type?: string;
  export_type?: string;
}

export interface PublisherSummaryResponse {
  data: any[];
  Total_pages?: number;
  Total_records?: number;
  url?: string;
}

export const usePublisherSummary = (
  selectedType: "install" | "event" = "install",
  payload?: PublisherSummaryPayload,
  enabled: boolean = false
) => {
  return useApi<PublisherSummaryResponse>(
    getApiUrl(`${selectedType}/publisher_summery`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("publisher-summary", payload, selectedType),
      enabled,
    }
  );
};

// Contributing Publisher Hooks
export interface ContributingPublisherPayload extends DashboardPayload {
  page_number?: number;
  record_limit?: number;
  search_term?: string;
}

export interface ContributingPublisherResponse {
  data: any[];
  Total_pages?: number;
  Total_records?: number;
}

export const useContributingPublisherOriginal = (
  selectedType: "install" | "event" = "install",
  payload?: ContributingPublisherPayload,
  enabled: boolean = false
) => {
  return useApi<ContributingPublisherResponse>(
    getApiUrl(`${selectedType}/contributing-publisher/original`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("contributing-publisher-original", payload, selectedType),
      enabled,
    }
  );
};

export const useContributingPublisherReattribution = (
  selectedType: "install" | "event" = "install",
  payload?: ContributingPublisherPayload,
  enabled: boolean = false
) => {
  return useApi<ContributingPublisherResponse>(
    getApiUrl(`${selectedType}/contributing-publisher/reattribution`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("contributing-publisher-reattribution", payload, selectedType),
      enabled,
    }
  );
};

// Analysis Insights Hooks
export interface FraudSubCategoryItem {
  fraud_subcategory: string;
  type: "table" | "graph" | "carousel" | "progress";
}

export interface FraudSubCategoryDetailsPayload extends DashboardPayload {
  fraud_sub_category: string;
}

export interface FraudSubCategoryDetailsResponse {
  data: any[];
  title?: string;
}

export const useFraudSubCategory = (
  selectedType: "install" | "event" = "install",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<FraudSubCategoryItem[]>(
    getApiUrl(`${selectedType}/fraud_sub_category`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("fraud-sub-category", payload, selectedType),
      enabled,
    }
  );
};

export const useFraudSubCategoryDetails = (
  selectedType: "install" | "event" = "install",
  payload?: FraudSubCategoryDetailsPayload,
  enabled: boolean = false
) => {
  return useApi<FraudSubCategoryDetailsResponse>(
    getApiUrl(`${selectedType}/fraud_sub_category_details`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("fraud-sub-category-details", payload, selectedType),
      enabled,
    }
  );
};

// Publisher Hooks
export interface ConversionChartPayload extends Omit<DashboardPayload, 'publisher'> {
  publisher: string[];
}

export interface ConversionChartResponse {
  bucket: string;
  percentage: number;
}

export interface EventTypeListPayload {
  package_name: string;
  start_date: string;
  end_date: string;
}

export const useClickConversion = (
  selectedType: "install" | "event" = "install",
  payload?: ConversionChartPayload,
  enabled: boolean = false
) => {
  return useApi<ConversionChartResponse[]>(
    getApiUrl(`${selectedType}/click_conversion`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("click-conversion", payload, selectedType),
      enabled,
    }
  );
};

export const useConversionEvent = (
  payload?: ConversionChartPayload,
  enabled: boolean = false
) => {
  return useApi<ConversionChartResponse[]>(
    getApiUrl("event/conversion_event"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("conversion-event", payload),
      enabled,
    }
  );
};

export const useEventTypeList = (
  payload?: EventTypeListPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl("event/event_list"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("event-type-list", payload),
      enabled,
    }
  );
};

// Extended Metrics Hooks
export interface ExtendedMetricsPayload extends FilterPayload {
  publisher?: string[];
}

export interface CleanPublishersResponse {
  data: Array<{
    label: string;
    visit: number;
    percentage: string;
    fill?: string;
  }>;
}

export interface VtaCtaPublisherSummaryResponse {
  data: Array<{
    "Publisher Name": string;
    "Total Count": number;
    "Vta": number;
    "Vta %": string;
    "Cta": number;
    "Cta %": string;
  }>;
}

export interface StateWisePublisherResponse {
  data: Array<{
    label: string;
    visit: number;
    percentage: number;
    fill: string;
  }>;
}

export interface MakeModelWisePublisherResponse {
  data: Array<{
    label: string;
    visit: number;
    price: string;
    fill: string;
  }>;
}

export interface PublisherWiseOsDetailsResponse {
  data: Array<{
    label: string;
    visit: number;
    percentage: string;
    fill: string;
  }>;
}

export interface CvrPayload extends FilterPayload {
  publisher?: string[];
  event_type?: string[];
  search_term?: string;
  page_number?: number;
  record_limit?: number;
  export_type?: string;
}

export interface CvrResponse {
  data: Array<{
    [key: string]: any;
  }>;
  Total_pages?: number;
  Total_records?: number;
  url?: string;
}

export interface IncentSamplesPayload extends FilterPayload {
  publisher?: string[];
}

export interface IncentSamplesResponse {
  data: Array<{
    Date: string;
    "Publisher Name": string;
    "Sub Publisher Name": string;
    "Campaign Id": string;
    "Agency Id": string;
    "Incent Wall": string;
    "Screenshot Url": string;
    "Tracking Url": string;
    Country: string;
  }>;
}

export const useCleanPublishers = (
  selectedType: "install" | "event" = "install",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<CleanPublishersResponse>(
    getApiUrl(`analytics/${selectedType}/clean_publishers`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("clean-publishers", payload, selectedType),
      enabled,
    }
  );
};

export const useFraudulentPublishers = (
  selectedType: "install" | "event" = "install",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<CleanPublishersResponse>(
    getApiUrl(`analytics/${selectedType}/fraudulent_publishers`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("fraudulent-publishers", payload, selectedType),
      enabled,
    }
  );
};

export const useVtaCtaPublisherSummary = (
  selectedType: "install" | "event" = "install",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<VtaCtaPublisherSummaryResponse>(
    getApiUrl(`analytics/${selectedType}/vta_cta_publisher_summary`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("vta-cta-publisher-summary", payload, selectedType),
      enabled,
    }
  );
};

export const useStateWisePublisher = (
  selectedType: "install" | "event" = "install",
  payload?: ExtendedMetricsPayload,
  enabled: boolean = false
) => {
  return useApi<StateWisePublisherResponse>(
    getApiUrl(`analytics/${selectedType}/get_state_wise_publisher`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("state-wise-publisher", payload, selectedType),
      enabled,
    }
  );
};

export const useMakeModelWisePublisher = (
  selectedType: "install" | "event" = "install",
  payload?: ExtendedMetricsPayload,
  enabled: boolean = false
) => {
  return useApi<MakeModelWisePublisherResponse>(
    getApiUrl(`analytics/${selectedType}/get_make_model_wise_publisher`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("make-model-wise-publisher", payload, selectedType),
      enabled,
    }
  );
};

export const usePublisherWiseOsDetails = (
  selectedType: "install" | "event" = "install",
  payload?: ExtendedMetricsPayload,
  enabled: boolean = false
) => {
  return useApi<PublisherWiseOsDetailsResponse>(
    getApiUrl(`analytics/${selectedType}/publisher_wise_os_details`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("publisher-wise-os-details", payload, selectedType),
      enabled,
    }
  );
};

export const useCvr = (
  selectedType: "install" | "event" = "install",
  payload?: CvrPayload,
  enabled: boolean = false
) => {
  return useApi<CvrResponse>(
    getApiUrl(`analytics/${selectedType}/get_cvr`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("cvr", payload, selectedType),
      enabled,
    }
  );
};

export const useIncentSamples = (
  selectedType: "install" | "event" = "install",
  payload?: IncentSamplesPayload,
  enabled: boolean = false
) => {
  return useApi<IncentSamplesResponse>(
    getApiUrl(`analytics/${selectedType}/incent_samples`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("incent-samples", payload, selectedType),
      enabled,
    }
  );
};

// Event Type Filter for Extended Metrics (different endpoint)
export const useEventTypeFilterExtended = (
  selectedType: "install" | "event" = "install",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`analytics/${selectedType}/event_type`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("event-type-filter-extended", payload, selectedType),
      enabled,
    }
  );
};