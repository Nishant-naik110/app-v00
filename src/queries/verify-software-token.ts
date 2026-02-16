
import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
 
type ErrorResponse = {
  message: string;
};
 
export type VerifySoftwareTokenBodyType = {
  access_token: string;
  user_code: string;
};

export function useVerifySoftwareToken(onSuccess: (data: unknown) => void) {
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.mfilterit.com/";
  const url = authDomain + Endpoint.VERIFY_SOFTWARE_TOKEN;
  const apiCall = APICall({
    url,
    method: "POST",
    headers: {
      Authorization: typeof window !== "undefined" ? localStorage.getItem("IDToken") || "" : "",
    },
  });
  
  return useMutation({
    mutationFn: (variables: { query?: Record<string, string>; body?: VerifySoftwareTokenBodyType }) =>
      apiCall(variables),
    onSuccess: (data: any) => {
      // Call the original onSuccess callback
      onSuccess(data);
    },
  });
}
