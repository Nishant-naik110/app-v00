
import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useMutation } from "@tanstack/react-query";
 
export type ErrorResponse = {
  message: string;
};
 
export type SetMFAPreferenceBodyType = {
  access_token: string;
  enable_sms_mfa?: boolean;
  enable_software_token_mfa?: boolean;
  enable_email_mfa?: boolean;
 
};
 
export function useSetMFAPreference(
  onError: (err: ErrorResponse) => void,
  onSuccess: (data: unknown) => void,
) {
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.mfilterit.com/";
  const url = authDomain + Endpoint.SET_MFA_PREFERENCE;
  const apiCall = APICall({
    url,
    method: "POST",
    headers: {
      Authorization: typeof window !== "undefined" ? localStorage.getItem("IDToken") || "" : "",
    },
  });
  
  return useMutation({
    mutationFn: (variables: { query?: Record<string, string>; body?: SetMFAPreferenceBodyType }) =>
      apiCall(variables),
    onSuccess,
    onError,
  });
}