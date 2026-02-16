"use client";

import { useApi } from "@/hooks/api/api_base";
import type { FilterApiResponse, PublisherApiResponse } from "../dashboard/overall-summary/Types";

export interface StatsCardData {
  [key: string]: {
    count: string | number;
    percentage?: string;
    color_code?: string;
  };
}

export interface ChartDataResponse {
  data: any[];
  config?: Record<string, any>;
  url?: string;
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
  campaign_id?: string[];
  country?: string[];
  frequency?: string;
  export_type?: string;
  category?: string;
  fraud_sub_category?: string;
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

// ============================================================================
// FILTER HOOKS
// ============================================================================

export const usePublishersFilter = (
  selectedType: "impression" | "click" = "impression",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<PublisherApiResponse>(
    getApiUrl(`integrity/${selectedType}/publisher`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-publishers-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useCampaignsFilter = (
  selectedType: "impression" | "click" = "impression",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`integrity/${selectedType}/campaign`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-campaigns-filter", payload, selectedType),
      enabled,
    }
  );
};

export const useCountryFilter = (
  selectedType: "impression" | "click" = "impression",
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(`integrity/${selectedType}/country`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-country-filter", payload, selectedType),
      enabled,
    }
  );
};

// ============================================================================
// CHART DATA HOOKS
// ============================================================================

export const useTotalPercentage = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<StatsCardData>(
    getApiUrl(`integrity/${selectedType}/total_percentage`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-total-percentage", payload, selectedType),
      enabled,
    }
  );
};

export const useSplitOfSources = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`integrity/${selectedType}/source_split`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-split-of-sources", payload, selectedType),
      enabled,
    }
  );
};

export const useDateWiseTrend = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`integrity/${selectedType}/trends`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-date-wise-trend", payload, selectedType),
      enabled,
    }
  );
};

export const usePublisherVendorTrend = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`integrity/${selectedType}/publisher_trends`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-publisher-vendor-trend", payload, selectedType),
      enabled,
    }
  );
};

export const useFraudCategories = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`integrity/${selectedType === "click" ? "click" : "impression"}/fraud_category`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-fraud-categories", payload, selectedType),
      enabled,
    }
  );
};

export const useFraudSubCategoryProgressBar = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`integrity/${selectedType === "click" ? "click" : "impression"}/fraud_sub_category_progress_bar`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-fraud-sub-category-progress-bar", payload, selectedType),
      enabled,
    }
  );
};

export const useDateWiseFraudSubCategory = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`integrity/${selectedType === "click" ? "click" : "impression"}/date_wise_fraud_sub_category_chart`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-date-wise-fraud-sub-category", payload, selectedType),
      enabled,
    }
  );
};

export const usePublisherWiseFraudSubCategory = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<ChartDataResponse>(
    getApiUrl(`integrity/${selectedType === "click" ? "click" : "impression"}/publisher_wise_fraud_sub_category`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-publisher-wise-fraud-sub-category", payload, selectedType),
      enabled,
    }
  );
};

export interface FraudSubCategoryItem {
  fraud_subcategory: string;
  type: string;
}

export interface FraudSubCategoryDetailsResponse {
  data?: any[];
  title?: string;
}

export const useFraudSubCategory = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<FraudSubCategoryItem[]>(
    getApiUrl(`integrity/${selectedType}/fraud_sub_category`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-fraud-sub-category", payload, selectedType),
      enabled,
    }
  );
};

export const useFraudSubCategoryDetails = (
  selectedType: "impression" | "click",
  payload?: DashboardPayload,
  enabled: boolean = false
) => {
  return useApi<FraudSubCategoryDetailsResponse>(
    getApiUrl(`integrity/${selectedType}/fraud_sub_category_details`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-fraud-sub-category-details", payload, selectedType),
      enabled,
    }
  );
};

// ============================================================================
// PUBLISHER SUMMARY HOOKS
// ============================================================================

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
  selectedType: "impression" | "click",
  payload?: PublisherSummaryPayload,
  enabled: boolean = false
) => {
  return useApi<PublisherSummaryResponse>(
    getApiUrl(`integrity/${selectedType}/publisher_summery`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("integrity-publisher-summary", payload, selectedType),
      enabled,
    }
  );
};

// ============================================================================
// CONVERSION CHART HOOKS
// ============================================================================

export interface ConversionChartPayload extends DashboardPayload {
  publisher?: string[];
  event_type?: string[];
  export_type?: string;
}

export const useClickConversion = (
  selectedType: "impression" | "click",
  payload?: ConversionChartPayload,
  enabled: boolean = false
) => {
  return useApi<any[]>(
    getApiUrl(`install/click_conversion`),
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
  return useApi<any[]>(
    getApiUrl(`event/conversion_event`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("conversion-event", payload),
      enabled,
    }
  );
};

// ============================================================================
// EVENT TYPE LIST HOOK
// ============================================================================

export interface EventTypeListPayload {
  package_name: string;
  start_date: string;
  end_date: string;
}

export const useEventTypeList = (
  payload?: EventTypeListPayload,
  enabled: boolean = false
) => {
  return useApi<any[]>(
    getApiUrl(`event/event_list`),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("event-type-list", payload),
      enabled,
    }
  );
};

