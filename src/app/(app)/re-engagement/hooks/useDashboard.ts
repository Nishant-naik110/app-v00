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

// Re-engagement uses "click" and "conversion" instead of "install" and "event"
export const usePublishersFilter = (
  selectedType: "click" | "conversion" | "event",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<PublisherApiResponse>(
    getApiUrl(`reengagement/${selectedType}/publisher`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-publishers-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useCampaignsFilter = (
  selectedType: "click" | "conversion" | "event",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`reengagement/${selectedType}/campaign`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-campaigns-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useAgencyFilter = (
  selectedType: "click" | "conversion" | "event",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`reengagement/${selectedType}/agency`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-agency-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useCountryFilter = (
  selectedType: "click" | "conversion" | "event",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`reengagement/${selectedType}/country`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-country-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useEventTypeFilter = (
  selectedType: "click" | "conversion" | "event",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`reengagement/${selectedType}/event_list`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-event-type-filter", payload, selectedType),
      enabled,
    }
  );
};

// ============================================================================
// CHART DATA HOOKS
// ============================================================================

export const useTotalPercentage = (
  selectedType: "click" | "conversion" | "event",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<StatsCardData>(
    getApiUrl(`reengagement/${selectedType}/total_percentage`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-total-percentage", payload, selectedType),
      enabled,
    }
  );
};

export const useDateWiseTrend = (
  selectedType: "click" | "conversion" | "event",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`reengagement/${selectedType}/trends`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-date-wise-trend", payload, selectedType),
      enabled,
    }
  );
};

export const usePublisherVendorTrend = (
  selectedType: "click" | "conversion" | "event",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`reengagement/${selectedType}/publisher_trends`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-publisher-vendor-trend", payload, selectedType),
      enabled,
    }
  );
};

export const useSplitOfSources = (
  selectedType: "click" | "conversion" | "event",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`reengagement/${selectedType}/source_split`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-split-of-sources", payload, selectedType),
      enabled,
    }
  );
};

export const useFraudCategories = (
  selectedType: "click" | "conversion" | "event",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`reengagement/${selectedType}/fraud_category`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-fraud-categories", payload, selectedType),
      enabled,
    }
  );
};

export const useFraudSubCategoryProgressBar = (
  selectedType: "click" | "conversion" | "event",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`reengagement/${selectedType}/fraud_sub_category_progress_bar`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-fraud-sub-category-progress-bar", payload, selectedType),
      enabled,
    }
  );
};

export const useDateWiseFraudSubCategory = (
  selectedType: "click" | "conversion" | "event",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`reengagement/${selectedType}/date_wise_fraud_sub_category_chart`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-date-wise-fraud-sub-category", payload, selectedType),
      enabled,
    }
  );
};

export const usePublisherWiseFraudSubCategory = (
  selectedType: "click" | "conversion" | "event",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`reengagement/${selectedType}/publisher_wise_fraud_sub_category`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-publisher-wise-fraud-sub-category", payload, selectedType),
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
  selectedType: "click" | "conversion" | "event",
  payload?: PublisherSummaryPayload,
  enabled: boolean = false
) => {
  return useApi<PublisherSummaryResponse>(
    getApiUrl(`reengagement/${selectedType}/publisher_summary`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-publisher-summary", payload, selectedType),
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
  selectedType: "click" | "conversion" | "event",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<FraudSubCategoryItem[]>(
    getApiUrl(`reengagement/${selectedType}/fraud_sub_category`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-fraud-sub-category", payload, selectedType),
      enabled,
    }
  );
};

export const useFraudSubCategoryDetails = (
  selectedType: "click" | "conversion" | "event",
  payload?: FraudSubCategoryDetailsPayload,
  enabled: boolean = false
) => {
  return useApi<FraudSubCategoryDetailsResponse>(
    getApiUrl(`reengagement/${selectedType}/fraud_sub_category_details`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-fraud-sub-category-details", payload, selectedType),
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

export const useClickConversion = (
  selectedType: "click" | "conversion" | "event",
  payload?: ConversionChartPayload,
  enabled: boolean = false
) => {
  return useApi<ConversionChartResponse[]>(
    getApiUrl(`reengagement/${selectedType}/click_conversion`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-click-conversion", payload, selectedType),
      enabled,
    }
  );
};

export const useConversionEvent = (
  payload?: ConversionChartPayload,
  enabled: boolean = false
) => {
  return useApi<ConversionChartResponse[]>(
    getApiUrl("reengagement/event/conversion_event"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-conversion-event", payload),
      enabled,
    }
  );
};

export interface EventTypeListPayload {
  package_name: string;
  start_date: string;
  end_date: string;
}

export const useEventTypeList = (
  payload?: EventTypeListPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl("reengagement/event/event_list"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-event-type-list", payload),
      enabled,
    }
  );
};

