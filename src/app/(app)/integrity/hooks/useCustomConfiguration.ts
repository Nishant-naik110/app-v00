"use client";

import { useApi } from "@/hooks/api/api_base";
import Endpoint from "../common/endpoint";

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
// TYPES
// ============================================================================

export interface CustomConfigResponse {
  fraud_threshold: number;
  target_url: string;
  target_blocked_url: string;
  redirection_status: boolean;
}

export interface ConfigSummaryItem {
  rule_name: string;
  status: boolean;
  whitelist_configuration: Array<{ event_path: string }>;
  rule_configuration: Record<string, any>;
}

export interface ConfigSummaryResponse {
  data: ConfigSummaryItem[];
  total: number;
  page_number: number;
  record_limit: number;
  total_pages: number;
}

export interface MappingConfigItem {
  source: string;
  target: string;
}

export interface MappingConfigResponse extends Array<MappingConfigItem> {}

export interface CountryOption {
  value: string;
  label: string;
}

export interface GetCustomConfigPayload {
  package_name: string;
}

export interface EditCustomConfigPayload {
  package_name: string;
  config_type: string;
  update_data: {
    fraud_threshold: number;
    target_url: string;
    target_blocked_url: string;
    redirection_status: boolean;
  };
}

export interface GetConfigSummaryPayload {
  package_name: string;
  page_number: number;
  record_limit: number;
  search_term?: string;
}

export interface GetConfigParametersPayload {
  package_name: string;
}

export interface EditCustomConfigRulePayload {
  package_name: string;
  rule_name: string;
  update_data: {
    status: boolean;
    whitelist_configuration: any[];
    rule_configuration: Record<string, any>;
  };
}

export interface GetMappingConfigPayload {
  package_name: string;
}

export interface UpdateMappingConfigPayload {
  package_name: string;
  update_data: Record<string, string>;
}

export interface GetCountriesPayload {
  package_name: string;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to get custom configuration
 */
export const useGetCustomConfig = (
  packageName?: string,
  enabled: boolean = false
) => {
  return useApi<CustomConfigResponse>(
    getApiUrl(Endpoint.GET_CUSTOM_CONFIG),
    "POST",
    packageName ? { package_name: packageName } : undefined,
    {
      queryKey: generateQueryKey("custom-config", packageName),
      enabled,
    }
  );
};

/**
 * Hook to get config summary with pagination and search
 */
export const useGetConfigSummary = (
  payload?: GetConfigSummaryPayload,
  enabled: boolean = false
) => {
  return useApi<ConfigSummaryResponse>(
    getApiUrl(Endpoint.GET_CUSTOM_CONFIG_SUMMARY),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("config-summary", payload),
      enabled,
    }
  );
};

/**
 * Hook to get configuration parameters
 */
export const useGetConfigParameters = (
  packageName?: string,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl(Endpoint.CONFIG_PARAMETERS),
    "POST",
    packageName ? { package_name: packageName } : undefined,
    {
      queryKey: generateQueryKey("config-parameters", packageName),
      enabled,
    }
  );
};

/**
 * Hook to get mapping configuration
 */
export const useGetMappingConfig = (
  packageName?: string,
  enabled: boolean = false
) => {
  return useApi<MappingConfigResponse>(
    getApiUrl(Endpoint.GET_MAPPING_CONFIG),
    "POST",
    packageName ? { package_name: packageName } : undefined,
    {
      queryKey: generateQueryKey("mapping-config", packageName),
      enabled,
    }
  );
};

/**
 * Hook to get countries
 */
export const useGetCountries = (
  packageName?: string,
  enabled: boolean = false
) => {
  return useApi<CountryOption[]>(
    getApiUrl(Endpoint.GEO_COUNTRY_CODE),
    "POST",
    packageName ? { package_name: packageName } : undefined,
    {
      queryKey: generateQueryKey("countries", packageName),
      enabled,
    }
  );
};

// ============================================================================
// API HELPER FUNCTIONS FOR MUTATIONS
// ============================================================================

/**
 * Edit custom configuration
 */
export const editCustomConfigApi = async (payload: EditCustomConfigPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.EDIT_CUSTOM_CONFIG), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to edit custom configuration");
  }
  return response.json() as Promise<string>;
};

/**
 * Edit custom configuration rule
 */
export const editCustomConfigRuleApi = async (
  payload: EditCustomConfigRulePayload
) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.EDIT_CUSTOM_CONFIG_RULE), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to edit custom configuration rule");
  }
  return response.json() as Promise<string>;
};

/**
 * Update mapping configuration
 */
export const updateMappingConfigApi = async (
  payload: UpdateMappingConfigPayload
) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.UPDATE_MAPPING_CONFIG), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to update mapping configuration");
  }
  return response.json() as Promise<string>;
};

