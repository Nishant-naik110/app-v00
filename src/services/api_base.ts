"use client";
import { useQuery, useMutation, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { UnauthorizedError } from "@/common/errors";
import { queryClient } from '@/lib/queryClient';

type ApiCallOptions<T = unknown> = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  params?: object;
  headers?: Record<string, string>;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  queryKey?: string[];
  manual?: boolean;
};

type ApiCallResult<T> =
  | { type: "query"; result: UseQueryResult<T, AxiosError>, loading: boolean, refetch: () => void }
  | { type: "mutation"; result: UseMutationResult<T, AxiosError>, loading: boolean };

// Redirect and session clear handler
const handleUnauthorized = () => {
  const currentPath = window.location.pathname;
  if (currentPath !== '/') {
    localStorage.setItem('redirectPath', currentPath);
  }
  localStorage.clear();
  localStorage.clear();
  window.location.href = '/';
};

// Axios instance with interceptor
const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => {
   // console.log("✅ Response:", response); // full response object
    return response;
  },
  (error) => {
    console.log("❌ Axios Error:", error);

    if (error.response) {
    } else if (error.request) {
      console.log("🟠 No response received. Request object:", error.request);
    } else {
      console.log("⚠️ Error setting up request:", error.message);
    }

    
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

// Query function
const queryFunction = async <T>({
  url,
  params,
  signal,
  headers,
}: {
  url: string;
  params?: object;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}): Promise<T> => {
  try {
    const response = await axiosInstance.get<T>(url, {
      params,
      signal,
      headers,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      throw new UnauthorizedError("Session expired");
    }
    throw error;
  }
};

// Mutation function
const mutationFunction = async <T>({
  url,
  method,
  data,
  headers,
}: {
  url: string;
  method: "POST" | "PUT" | "DELETE";
  data?: any;
  headers?: Record<string, string>;
}): Promise<T> => {
  try {
    const response = await axiosInstance.request<T>({
      url,
      method,
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      throw new UnauthorizedError("Session expired");
    }
    throw error;
  }
};

// Main useApiCall hook
export const useApiCall = <T = unknown>(
  options: ApiCallOptions<T>
): ApiCallResult<T> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("IDToken") || "" : "";
  const manual = options.manual ?? false;

  const query = useQuery<T, AxiosError>({
    queryKey: options.queryKey || [options.url, options.params],
    queryFn: async ({ signal }) => {
      return queryFunction<T>({
        url: options.url,
        params: options.params,
        signal,
        headers: {
          ...options.headers,
          Authorization: token,
        },
      });
    },
    enabled: !manual && options.method === "GET" && !!token,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 401) return false;
      return failureCount < 3;
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

  const mutation = useMutation<T, AxiosError>({
    mutationFn: (vars?: any) =>
      mutationFunction<T>({
        url: options.url,
        method: options.method,
        data: options.manual ? vars : options.params,
        headers: {
          ...options.headers,
          Authorization: token,
        },
      }),
    onSuccess: (data) => {
      if (options.queryKey) {
        queryClient.invalidateQueries(options.queryKey);
      }
      options.onSuccess?.(data);
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        handleUnauthorized();
      }
      options.onError?.(error);
    },
  });

  return options.method === "GET"
    ? {
        type: "query",
        result: query,
        loading: query.isFetching || query.isLoading,
        refetch: query.refetch,
      }
    : {
        type: "mutation",
        result: mutation,
        loading: mutation.isPending || mutation.isLoading,
        trigger: mutation.mutateAsync,
      };
};