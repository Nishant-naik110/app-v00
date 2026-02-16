"use client";
import { useApi } from "@/hooks/api/api_base";
const API_BASE = process.env.NEXT_PUBLIC_APP_PERF || "";
export const usePostBackTable = (
    payload: any,
    enabled: boolean = false
)=>{
    return useApi<any>(
        `${API_BASE}event/postback_events_summary`,
        "POST",
        payload,
        {
            queryKey: ["postback-events-summary", payload],
            enabled,
            staleTime: 0,
            cacheTime: 0,
        }
    )

}


export const publisherFilterApi = (payload: any, enabled: boolean = false)=>{
    return useApi<any>(
        `${API_BASE}event/publisher`,
        "POST",
        payload,
        {
            queryKey: ["publisher", payload],
            enabled,
        }
    )
}

export const eventTypeFilterApi = (payload: any, enabled: boolean = false)=>{
    return useApi<any>(
        `${API_BASE}event/event_list`,
        "POST",
        payload,
        {
            queryKey: ["event-type", payload],
            enabled,
        }
    )
}