
"use client";
import Endpoint from "@/common/endpoint";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
 
export function useIsMFA() {
  const [accessToken, setAccessToken] = useState("");
  const [idToken, setIdToken] = useState("");
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.mfilterit.com/";
  const url = authDomain + Endpoint.IS_MFA;
  const hasTriggeredRef = useRef(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AccessToken");
      const idTokenValue = localStorage.getItem("IDToken");
      setAccessToken(token || "");
      setIdToken(idTokenValue || "");
    }
  }, []);
  
  let t = true;
  if (typeof window === "undefined") t = false;
 
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(url, {
        access_token: accessToken,
      }, {
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
           
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Cache the result
      queryClient.setQueryData(["IS_MFA"], data);
    },
    onError: (error) => {
      console.error("Is MFA API error:", error);
    },
  });
  
  // Check if we already have cached data
  const cachedData = queryClient.getQueryData(["IS_MFA"]);
  
  // Trigger the API call when conditions are met, but only once and only if no cached data
  useEffect(() => {
    if (t && accessToken && idToken && !hasTriggeredRef.current && !mutation.isLoading && !cachedData) {
      hasTriggeredRef.current = true;
      mutation.mutate();
    }
  }, [t, accessToken, idToken, mutation.isLoading, cachedData]);
  
  // Reset the trigger flag when conditions change
  useEffect(() => {
    if (!t || !accessToken || !idToken) {
      hasTriggeredRef.current = false;
    }
  }, [t, accessToken, idToken]);
  
  return {
    data: cachedData || mutation.data,
    error: mutation.error,
    isLoading: mutation.isLoading,
    refetch: () => {
      hasTriggeredRef.current = false;
      queryClient.removeQueries(["IS_MFA"]);
      mutation.mutate();
    },
  };
}
