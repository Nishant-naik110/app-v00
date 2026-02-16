"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient, QueryObserverResult, UseMutationResult } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const handleUnauthorized = () => {
  // Handle unauthorized access
  // You can add redirect logic here if needed
};

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastConfig {
  showToast?: boolean;
  successMessage?: string | ((data: any) => string);
  errorMessage?: string | ((error: Error) => string);
  successTitle?: string;
  errorTitle?: string;
  variant?: "default" | "destructive" | null;
  successType?: ToastType;
  errorType?: ToastType;
}

export interface UseApiOptions {
  enabled?: boolean;
  staleTime?: number;        
  cacheTime?: number;       
  queryKey?: string[];    
  headers?: Record<string, string>; 
  refetchOnMount?: boolean | "always";
  refetchInterval?: number;
  toast?: ToastConfig;
}

/**
 * Generic API hook using React Query with automatic toast handling
 */
export const useApi = <T = any>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  payload?: any,
  options?: UseApiOptions
) => {
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const toastConfig = options?.toast ?? { showToast: false }; 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Include payload in queryKey if not provided, so React Query refetches when payload changes
  // Use useMemo to ensure queryKey is stable but updates when payload changes
  const queryKey = useMemo(() => {
    if (options?.queryKey) {
      return options.queryKey;
    }
    // Include payload in queryKey so React Query knows to refetch when it changes
    return [url, method, payload ? JSON.stringify(payload) : null];
  }, [url, method, payload, options?.queryKey]);

  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      // Get token directly from localStorage in queryFn to ensure it's always fresh
      const token = typeof window !== "undefined" ? localStorage.getItem("IDToken") || "" : "";
      const controller = new AbortController();

      let finalUrl = url;
      
      // Extract payload from queryKey to ensure we use the latest value
      // The queryKey includes the serialized payload, so we use the payload parameter
      // which will be the current value when the query runs
      const currentPayload = payload;

      const config: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
          ...options?.headers,
        },
        signal: controller.signal,
      };

      if (method === "GET" && currentPayload) {
        const queryParams = new URLSearchParams();
        Object.entries(currentPayload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
        finalUrl = `${url}?${queryParams.toString()}`;
      } else if (method !== "GET" && currentPayload) {
        config.body = JSON.stringify(currentPayload);
      }

      const response = await fetch(finalUrl, config);

      if (!response.ok) {
        if (response.status === 401) handleUnauthorized();
        
        // Try to extract error message from response body
        let errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.log('API Error Response:', errorData);
          
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
          
          // Throw the error with the extracted message
          throw new Error(errorMessage);
        } catch (parseError) {
          console.log('Failed to parse error response:', parseError);
          console.log('Response status:', response.status);
          console.log('Response statusText:', response.statusText);
          // If it's our own error (with the message), re-throw it
          if (parseError instanceof Error && parseError.message !== 'Failed to parse error response') {
            throw parseError;
          }
          
          // Try to get response as text if JSON parsing fails
          try {
            const responseText = await response.text();
            console.log('Response text:', responseText);
            if (responseText) {
              throw new Error(responseText);
            }
          } catch (textError) {
            console.log('Failed to get response as text:', textError);
          }
          
          // Final fallback
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      
      return data;
    },
    enabled: (() => {
      if (!isMounted) return false;
      // If enabled is explicitly provided, use it
      if (options?.enabled !== undefined) {
        return options.enabled;
      }
      // Default behavior: GET requests are always enabled, POST requests require token
      return method === "GET" 
        ? true 
        : !!(typeof window !== "undefined" && localStorage.getItem("IDToken"));
    })(),
    staleTime: options?.staleTime ?? 3 * 60 * 1000,   // 5 min default
    gcTime: options?.cacheTime ?? 10 * 60 * 1000,  // 10 min default
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchInterval: options?.refetchInterval ,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("401")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }) as QueryObserverResult<T, Error>;

  // Handle toast notifications
  useEffect(() => {
    if (!toastConfig.showToast) return;
    
    // Show success toast for mutations (POST, PUT, DELETE)
    if (query.isSuccess && method !== "GET" && toastConfig.successMessage) {
      const message = typeof toastConfig.successMessage === 'function' 
        ? toastConfig.successMessage(query.data) 
        : toastConfig.successMessage;
      const toastType = toastConfig.successType || "success";
      
      // Get className based on type
      const getClassName = (type: ToastType) => {
        const classMap: Record<ToastType, string> = {
          success: "border-l-4 border-l-green-500 text-black",
          error: "border-l-4 border-l-red-600 text-black",
          info: "border-l-4 border-l-blue-600 text-black",
          warning: "border-l-4 border-l-yellow-500 text-black",
        };
        return classMap[type];
      };
      
      toast({
        title: toastConfig.successTitle || "Success",
        description: message,
        variant: "default", // Success toasts always use default variant
        className: getClassName(toastType),
      });
    }
    
    // Show error toast - extract message from error response
    if (query.isError && query.error) {
      // Prioritize error message from API response
      const responseErrorMessage = query.error?.message;
      
      // Use configured error message as fallback or custom formatter
      let errorMessage: string;
      
      if (toastConfig.errorMessage) {
        if (typeof toastConfig.errorMessage === 'function') {
          // Function can use the error object to format message
          errorMessage = toastConfig.errorMessage(query.error);
        } else {
          // If static message provided, use response error if available, otherwise use configured
          errorMessage = responseErrorMessage || toastConfig.errorMessage;
        }
      } else {
        // No configured message, use response error message
        errorMessage = responseErrorMessage || "An error occurred";
      }
      
      const toastType = toastConfig.errorType || "error";
      
      // Get className based on type
      const getClassName = (type: ToastType) => {
        const classMap: Record<ToastType, string> = {
          success: "border-l-4 border-l-green-500 text-black",
          error: "border-l-4 border-l-red-600 text-black",
          info: "border-l-4 border-l-blue-600 text-black",
          warning: "border-l-4 border-l-yellow-500 text-black",
        };
        return classMap[type];
      };
      
      toast({
        title: toastConfig.errorTitle || "Error",
        description: errorMessage,
        variant: toastConfig.variant || "destructive",
        className: getClassName(toastType),
      });
    }
  }, [query.isSuccess, query.isError, query.data, query.error, toastConfig, method, toast]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKey });

  return { ...query, invalidate };
};

