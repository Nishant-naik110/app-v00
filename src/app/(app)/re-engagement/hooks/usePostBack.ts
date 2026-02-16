"use client";

import { useApi } from "@/hooks/api/api_base";

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

export interface PostbackEventsPayload {
  package_name: string;
  start_date: string;
  end_date: string;
  publisher?: string[];
  event_type?: string[];
  page_number?: number;
  record_limit?: number;
  search_term?: string;
}

export interface PostbackEventData {
  Date: string;
  "Publisher Name": string;
  "Event Type": string;
  "Total Counts": number;
  "Invalid Events": number;
  "Valid Events": number;
  "Postback Triggered Events": number;
  [key: string]: string | number;
}

export interface PostbackEventsResponse {
  data: PostbackEventData[];
  Total_pages: number;
  Total_records: number;
  page_number: number;
  record_limit: number;
}

export interface PublisherApiResponse {
  Affiliate: string[];
  "Whitelisted Publisher": string[];
  [key: string]: string[];
}

export interface FilterApiResponse {
  data: string[];
}

export const usePostBackTable = (
  payload?: PostbackEventsPayload,
  enabled: boolean = false
) => {
  return useApi<PostbackEventsResponse>(
    getApiUrl("reengagement/event/postback_events_summary"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-postback-events-summary", payload),
      enabled,
      staleTime: 0,
      cacheTime: 0,
    }
  );
};

export const usePublisherFilter = (
  payload?: {
    package_name: string;
    start_date: string;
    end_date: string;
  },
  enabled: boolean = false
) => {
  return useApi<PublisherApiResponse>(
    getApiUrl("reengagement/event/publisher"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-postback-publisher", payload),
      enabled,
    }
  );
};

export const useEventTypeFilter = (
  payload?: {
    package_name: string;
    start_date: string;
    end_date: string;
  },
  enabled: boolean = false
) => {
  return useApi<FilterApiResponse>(
    getApiUrl("reengagement/event/event_list"),
    "POST",
    payload,
    {
      queryKey: generateQueryKey("reengagement-postback-event-type", payload),
      enabled,
    }
  );
};

