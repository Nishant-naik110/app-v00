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

export interface ThresholdTolerancePayload {
  package_name: string;
}

export interface ThresholdToleranceResponse {
  frequency: number;
  tolerance: string;
  blocked: boolean;
}

export interface UpdateThresholdTolerancePayload {
  package_name: string;
  frequency: number;
  tolerance: string;
  blocked: boolean;
}

export interface RuleConfigPayload {
  package_name: string;
  page_number: number;
  record_limit: number;
  search_term?: string;
}

export interface RuleConfigItem {
  rule_configuration: string;
  whitelist_count: number;
  whitelist_threshold: number;
}

export interface RuleConfigResponse {
  data: RuleConfigItem[];
  total: number;
  page_number: number;
  record_limit: number;
  total_pages: number;
}

export interface ConfigParametersPayload {
  package_name: string;
}

export interface ConfigParametersResponse extends Array<string> {}

export interface CountryOption {
  value: string;
  label: string;
}

export interface CountriesPayload {
  package_name: string;
}

export interface GeoConfigPayload {
  package_name: string;
  page_number: number;
  record_limit: number;
  search_term?: string;
}

export interface GeoConfigItem {
  campaign_parameter: string;
  parameter_value: string | number;
  allowed_geo: string;
}

export interface GeoConfigResponse {
  data: GeoConfigItem[];
  total: number;
  page_number: number;
  record_limit: number;
  total_pages: number;
}

export interface AddRuleConfigPayload {
  package_name: string;
  update_data: Array<{
    parameter: string;
    value: string;
    threshold: string;
  }>;
}

export interface EditRuleConfigPayload {
  package_name: string;
  old_value: {
    parameter: string;
    value: string;
    threshold: string;
  };
  new_value: {
    parameter: string;
    value: string;
    threshold: string;
  };
}

export interface DeleteRuleConfigPayload {
  package_name: string;
  delete_value: {
    parameter: string;
    value: string;
    threshold: string;
  };
}

export interface AddGeoConfigPayload {
  package_name: string;
  update_data: Array<{
    parameter: string;
    value: string;
    allowed_geo: string;
  }>;
}

export interface EditGeoConfigPayload {
  package_name: string;
  old_value: {
    parameter: string;
    value: string;
    allowed_geo: string;
  };
  new_value: {
    parameter: string;
    value: string;
    allowed_geo: string;
  };
}

export interface DeleteGeoConfigPayload {
  package_name: string;
  delete_value: {
    parameter: string;
    value: string;
    allowed_geo: string;
  };
}

// ============================================================================
// QUERY HOOKS (GET/READ operations)
// ============================================================================

/**
 * Hook to get threshold tolerance configuration
 */
export const useGetThresholdTolerance = (
  payload?: ThresholdTolerancePayload,
  enabled: boolean = false
) => {
  return useApi<ThresholdToleranceResponse>(
    getApiUrl(Endpoint.THRESHOLD_TOLERANCE),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("threshold-tolerance", payload),
      enabled,
    }
  );
};

/**
 * Hook to get rule configuration summary
 */
export const useGetRuleConfig = (
  payload?: RuleConfigPayload,
  enabled: boolean = false
) => {
  return useApi<RuleConfigResponse>(
    getApiUrl(Endpoint.RULE_CONFIG_SUMMARY),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("rule-config", payload),
      enabled,
    }
  );
};

/**
 * Hook to get configuration parameters
 */
export const useGetConfigParameters = (
  payload?: ConfigParametersPayload,
  enabled: boolean = false
) => {
  return useApi<ConfigParametersResponse>(
    getApiUrl(Endpoint.CONFIG_PARAMETERS),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("config-parameters", payload),
      enabled,
    }
  );
};

/**
 * Hook to get countries list
 */
export const useGetCountries = (
  payload?: CountriesPayload,
  enabled: boolean = false
) => {
  return useApi<CountryOption[]>(
    getApiUrl(Endpoint.GEO_COUNTRY_CODE),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("countries", payload),
      enabled,
    }
  );
};

/**
 * Hook to get geo configuration summary
 */
export const useGetGeoConfig = (
  payload?: GeoConfigPayload,
  enabled: boolean = false
) => {
  return useApi<GeoConfigResponse>(
    getApiUrl(Endpoint.GEO_CONFIG_SUMMARY),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("geo-config", payload),
      enabled,
    }
  );
};

// ============================================================================
// API HELPER FUNCTIONS FOR MUTATIONS
// ============================================================================

/**
 * Update threshold tolerance configuration
 */
export const updateThresholdToleranceApi = async (payload: UpdateThresholdTolerancePayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.UPDATE_THRESHOLD_TOLERANCE), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to update threshold tolerance");
  }
  return response.json();
};

/**
 * Add rule configuration
 */
export const addRuleConfigApi = async (payload: AddRuleConfigPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.ADD_RULE_CONFIG), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to add rule configuration");
  }
  return response.json();
};

/**
 * Edit rule configuration
 */
export const editRuleConfigApi = async (payload: EditRuleConfigPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.EDIT_RULE_CONFIG), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to edit rule configuration");
  }
  return response.json();
};

/**
 * Delete rule configuration
 */
export const deleteRuleConfigApi = async (payload: DeleteRuleConfigPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.DELETE_RULE_CONFIG), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to delete rule configuration");
  }
  return response.json();
};

/**
 * Add geo configuration
 */
export const addGeoConfigApi = async (payload: AddGeoConfigPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.ADD_GEO_CONFIG), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to add geo configuration");
  }
  return response.json();
};

/**
 * Edit geo configuration
 */
export const editGeoConfigApi = async (payload: EditGeoConfigPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.EDIT_GEO_CONFIG), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to edit geo configuration");
  }
  return response.json();
};

/**
 * Delete geo configuration
 */
export const deleteGeoConfigApi = async (payload: DeleteGeoConfigPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.DELETE_GEO_CONFIG), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to delete geo configuration");
  }
  return response.json();
};

