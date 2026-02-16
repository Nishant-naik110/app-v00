"use client";

import { useApi } from "@/hooks/api/api_base";

export interface FilterPayload {
  package_name: string;
  start_date: string;
  end_date: string;
}

export interface VtaEnablesPublishersPayload extends FilterPayload {}

export interface ThresholdWindowPayload {
  package_name: string;
}

export interface ThresholdWindowResponse {
  "Click to Install Window (in Days)": number;
  "Install to Event Window (in Days)": number;
  "VTA Enables Publishers": string[];
  "VTA Enables Agency": string[];
  "Risk Tolerence": string;
}

export interface RuleSelectionPayload {
  package_name: string;
}

export interface RuleSelectionResponse {
  "Rule Selection": {
    "Fake Device": boolean;
    "Non Playstore": boolean;
    "Virtual Network": boolean;
    "Click Spam": boolean;
  };
}

export interface PayoutDetailsPayload {
  package_name: string;
}

export interface PayoutDetailsResponse {
  payout_details: {
    Impression: string[];
    Click: string[];
    Install: string[];
    Event: string[];
  };
}

export interface CountryCodesPayload {
  package_name: string;
}

export interface EventToProcess {
  "Event Name": string;
  "SDK/S2S": string;
}

export interface EventsToProcessResponse {
  "Event to Process": EventToProcess[];
}

export interface SaveConfigurationPayload {
  package_name: string;
  update_data: {
    "Threshold Window": {
      "Click to Install Window (in Days)": number;
      "Install to Event Window (in Days)": number;
      "VTA Enables Publishers": string[];
      "VTA Enables Agency": string[];
      "Risk Tolerence": string;
    };
    "Rule Selection": {
      "Fake Device": boolean;
      "Non Playstore": boolean;
      "Virtual Network": boolean;
      "Click Spam": boolean;
    };
    "Payout Deatils": {
      Install: string[];
      Event: string[];
      Impression: string[];
      Click: string[];
    };
    "Geo Selection": string[];
    "Event to Process": Record<string, string>;
  };
}

export interface SaveConfigurationResponse {
  success: string;
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
    getApiUrl("user-acquisition/install/vta_enables_publishers"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("vta-enables-publishers", payload),
      enabled,
    }
  );
};

export const useVtaEnablesAgency = (
  payload?: VtaEnablesPublishersPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl("user-acquisition/install/vta_enables_agency"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("vta-enables-agency", payload),
      enabled,
    }
  );
};

export const useGetThresholdWindow = (
  payload?: ThresholdWindowPayload,
  enabled: boolean = false
) => {
  return useApi<ThresholdWindowResponse>(
    getApiUrl("user-acquisition/install/get_threshold_window"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("threshold-window", payload),
      enabled,
    }
  );
};

export const useGetRuleSelection = (
  payload?: RuleSelectionPayload,
  enabled: boolean = false
) => {
  return useApi<RuleSelectionResponse>(
    getApiUrl("user-acquisition/install/get_rule_selection"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("rule-selection", payload),
      enabled,
    }
  );
};

export const useGetPayoutDetails = (
  payload?: PayoutDetailsPayload,
  enabled: boolean = false
) => {
  return useApi<PayoutDetailsResponse>(
    getApiUrl("user-acquisition/install/get_payout_details"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("payout-details", payload),
      enabled,
    }
  );
};

export const useGetCountryCodes = (
  payload?: CountryCodesPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl("user-acquisition/install/country_code"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("country-codes", payload),
      enabled,
    }
  );
};

export const useGetConfiguredCountries = (
  payload?: CountryCodesPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl("user-acquisition/install/get_configured_country"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("configured-countries", payload),
      enabled,
    }
  );
};

export const useGetEventTypes = (
  payload?: FilterPayload,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    getApiUrl("user-acquisition/event/event_type"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("event-types", payload),
      enabled,
    }
  );
};

export const useGetEventsToProcess = (
  payload?: CountryCodesPayload,
  enabled: boolean = false
) => {
  return useApi<EventsToProcessResponse>(
    getApiUrl("user-acquisition/install/get_events_to_process"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("events-to-process", payload),
      enabled,
    }
  );
};

export const useSaveConfiguration = (
  payload?: SaveConfigurationPayload,
  enabled: boolean = false
) => {
  return useApi<SaveConfigurationResponse>(
    getApiUrl("user-acquisition/install/update_save_config"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("save-configuration", payload),
      enabled,
      toast: {
        showToast: true,
        successMessage: "Configuration saved successfully",
        errorMessage: "Failed to save configuration",
        successTitle: "Success",
        errorTitle: "Error",
      },
    }
  );
};