import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useMutation } from "@tanstack/react-query";

export type ErrorResponse = {
  message: string;
};

export type SetMFAPreferenceUpdateBodyType = {
  access_token: string;
  enable_software_token_mfa: boolean;
};

export function useSetMFAPreferenceUpdate(
  onError: (err: ErrorResponse) => void,
  onSuccess: (data: unknown) => void,
) {
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.mfilterit.com/";
  const url = authDomain + Endpoint.SET_MFA_PREFERENCE_UPDATE;
  const apiCall = APICall({
    url,
    method: "POST",
    headers: {
      Authorization: typeof window !== "undefined" ? localStorage.getItem("IDToken") || "" : "",
    },
  });
  
  return useMutation({
    mutationFn: (variables: { query?: Record<string, string>; body?: SetMFAPreferenceUpdateBodyType }) =>
      apiCall(variables),
    onSuccess,
    onError,
  });
}
