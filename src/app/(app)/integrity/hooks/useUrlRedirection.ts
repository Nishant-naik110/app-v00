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

export interface RedirectionResult {
  URL: string;
  status: string;
  status_code: number;
}

export interface UrlRedirectionConfig {
  label: string;
  value: string;
}

export interface UrlRedirectionData {
  "Target URL"?: string;
  "Target Block URL"?: string;
  status: boolean;
}

export interface UrlRedirectionResponse {
  config: UrlRedirectionConfig[];
  data: UrlRedirectionData[];
}

export interface GenerateUrlPayload {
  package_name: string;
  urls: string[];
}

export interface GenerateUrlResponse {
  url: string;
  wrapped_url: string;
}

export interface GenerateShortenedUrlResponse {
  url: string;
  shortend_url: string;
}

export interface UpdateUrlRedirectionPayload {
  package_name: string;
  forward_url?: string;
  block_url?: string;
}

export interface CheckRedirectionPayload {
  package_name: string;
  url: string;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to get URL redirection configuration
 */
export const useGetUrlRedirection = (
  packageName?: string,
  enabled: boolean = false
) => {
  return useApi<UrlRedirectionResponse>(
    getApiUrl(Endpoint.URL_REDIRECTION),
    "POST",
    packageName ? { package_name: packageName } : undefined,
    {
      queryKey: generateQueryKey("url-redirection", packageName),
      enabled,
    }
  );
};

/**
 * Generate URL
 */
export const generateUrlApi = async (payload: GenerateUrlPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.GENERATE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to generate URL");
  }
  return response.json() as Promise<GenerateUrlResponse[]>;
};

/**
 * Generate Shortened URL
 */
export const generateShortenedUrlApi = async (payload: GenerateUrlPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.GENERATE_SHORTENED_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to generate shortened URL");
  }
  return response.json() as Promise<GenerateShortenedUrlResponse[]>;
};

/**
 * Update URL redirection
 */
export const updateUrlRedirectionApi = async (
  payload: UpdateUrlRedirectionPayload
) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.UPDATE_URL_REDIRECTION), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to update URL redirection");
  }
  return response.json() as Promise<{ message: string }>;
};

/**
 * Check redirection
 */
export const checkRedirectionApi = async (payload: CheckRedirectionPayload) => {
  const token = localStorage.getItem("IDToken") || "";
  const response = await fetch(getApiUrl(Endpoint.CHECK_REDIRECTION), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to check redirection");
  }
  return response.json() as Promise<RedirectionResult[]>;
};

