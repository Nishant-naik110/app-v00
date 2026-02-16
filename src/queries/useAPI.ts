import { AxiosRequestConfig } from "axios";
import { useQuery } from "@tanstack/react-query";

export function useAPI<D, E>({
  tag,
  options,
  enabled = true,
}: {
  tag: string;
  options: AxiosRequestConfig;
  enabled?: boolean;
}) {
  const enhancedOptions: AxiosRequestConfig = {
    ...options,
    headers: {
      ...options.headers,
      // Add the Authorization header only on the client side
      Authorization:
        typeof window !== "undefined" && localStorage.getItem("AccessToken")
          ? `${localStorage.getItem("AccessToken")}`
          : undefined,
    },
  };

  return useQuery<D, E>({
    queryKey: [tag, { options: enhancedOptions }],
    queryFn: async () => {
      const axios = (await import("axios")).default;
      return axios.request<D>(enhancedOptions).then((res) => res.data);
    },
    enabled: enabled,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
