"use client";

import { useApi } from "@/hooks/api/api_base";
import { useMutation } from "@tanstack/react-query";

export interface FilterPayload {
  package_name: string;
  start_date: string;
  end_date: string;
}

export interface VtaEnablesPublishersPayload extends FilterPayload {}

export interface AttributionWindowPayload {
  package_name: string;
}

export interface AttributionWindowResponse {
  "Click to Open Window (in Days)": number;
  "Inactivity Window": number;
  "VTA Enables Publishers": string[];
  "Frequency Cap": number;
  "Risk Tolerence": string;
}

export interface PayoutDetailsPayload {
  package_name: string;
}

export interface PayoutDetailsResponse {
  payout_details: {
    Impression: string[];
    Click: string[];
    Conversion: string[];
    Event: string[];
  };
}

export interface CountryCodesPayload {
  package_name: string;
}

export interface SaveConfigurationPayload {
  package_name: string;
  update_data: {
    "Threshold Window": {
      "Click to Open Window (in Days)": number;
      "Inactivity Window": number;
      "Frequency Cap": number;
      "VTA Enables Publishers": string[];
      "Risk Tolerence": string;
    };
    "Payout Details": {
      Impression: string[];
      Click: string[];
      Conversion: string[];
      Event: string[];
    };
    "Geo Selection": string[];
  };
}

export interface SaveConfigurationResponse {
  message?: string;
  success?: string;
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

export const useVtaEnablesPublishers = (
  payload?: VtaEnablesPublishersPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl("reengagement/click/vta_enables_publishers"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-vta-enables-publishers", payload),
      enabled,
    }
  );
};

export const useGetAttributionWindow = (
  payload?: AttributionWindowPayload,
  enabled: boolean = false
) => {
  return useApi<AttributionWindowResponse>(
    getApiUrl("reengagement/click/get_attribution_window"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-attribution-window", payload),
      enabled,
    }
  );
};

export const useGetPayoutDetails = (
  payload?: PayoutDetailsPayload,
  enabled: boolean = false
) => {
  return useApi<PayoutDetailsResponse>(
    getApiUrl("reengagement/click/get_payout_details"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-payout-details", payload),
      enabled,
    }
  );
};

export const useGetCountryCodes = (
  payload?: CountryCodesPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl("reengagement/click/country_code"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-country-codes", payload),
      enabled,
    }
  );
};

export const useGetConfiguredCountries = (
  payload?: CountryCodesPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl("reengagement/click/get_configured_country"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-configured-countries", payload),
      enabled,
    }
  );
};

export const useSaveConfiguration = () => {
  return useMutation<SaveConfigurationResponse, Error, SaveConfigurationPayload>({
    mutationFn: async (payload: SaveConfigurationPayload) => {
      const token = localStorage.getItem("IDToken") || "";
      const response = await fetch(
        getApiUrl("reengagement/click/update_save_config"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save configuration");
      }
      return response.json() as Promise<SaveConfigurationResponse>;
    },
  });
};

