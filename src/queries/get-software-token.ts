
import Endpoint from "@/common/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
 
export function useGetSoftwareToken(
  enabled: boolean,
  onError?: (error: any) => void,
  onSuccess?: (data: any) => void
) {
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.mfilterit.com/";
  const url = authDomain + Endpoint.GET_SOFTWARE_TOKEN;
  const [accessToken, setAccessToken] = useState("");
  const [idToken, setIdToken] = useState("");
  const hasTriggeredRef = useRef(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AccessToken");
      const idTokenValue = localStorage.getItem("IDToken") || localStorage.getItem("IdToken");
      
      // Validate tokens before setting them
      if (token && token.trim() !== "") {
        setAccessToken(token);
      } else {
        console.warn("AccessToken is missing or empty");
      }
      
      if (idTokenValue && idTokenValue.trim() !== "") {
        setIdToken(idTokenValue);
      } else {
        console.warn("IDToken is missing or empty");
      }
    }
  }, []);
  
  const mutation = useMutation({
    mutationFn: async () => {
      // Validate tokens before making the request
      if (!accessToken || accessToken.trim() === "") {
        throw new Error("Access token is required but not available");
      }
      
      if (!idToken || idToken.trim() === "") {
        throw new Error("ID token is required but not available");
      }
      
      console.log("Making software token request with tokens:", {
        hasAccessToken: !!accessToken,
        hasIdToken: !!idToken,
        tokenLength: accessToken.length,
        idTokenLength: idToken.length
      });
      
      const response = await axios.post(url, {
        access_token: accessToken,
      }, {
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Software token generated successfully:", data);
      // Cache the result
      queryClient.setQueryData(["GET_SOFTWARE_TOKEN"], data);
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: any) => {
      console.error("Software token API error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: url
      });
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        console.error("401 Unauthorized - Token may be expired or invalid");
        // Clear cached data on auth error
        queryClient.removeQueries(["GET_SOFTWARE_TOKEN"]);
      }
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (auth issues)
      if (error.response?.status === 401) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Check if we already have cached data
  const cachedData = queryClient.getQueryData(["GET_SOFTWARE_TOKEN"]);
  
  // Trigger the API call when conditions are met, but only once and only if no cached data
  useEffect(() => {
    if (enabled && accessToken && idToken && !hasTriggeredRef.current && !mutation.isLoading && !cachedData) {
      hasTriggeredRef.current = true;
      mutation.mutate();
    }
  }, [enabled, accessToken, idToken, mutation.isLoading, cachedData]);
  
  // Reset the trigger flag when conditions change
  useEffect(() => {
    if (!enabled || !accessToken || !idToken) {
      hasTriggeredRef.current = false;
    }
  }, [enabled, accessToken, idToken]);
  
  return {
    data: cachedData || mutation.data,
    error: mutation.error,
    isLoading: mutation.isLoading,
    refetch: () => {
      hasTriggeredRef.current = false;
      queryClient.removeQueries(["GET_SOFTWARE_TOKEN"]);
      mutation.mutate();
    },
  };
}