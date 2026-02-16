import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useMutation } from "@tanstack/react-query";

export type SignOutError = {
  message: string;
};

export type SignOutBodyType = {
  access_token: string;
};

/**
 * TODO
 */
export function useSignOut(
  onError: (error: SignOutError) => void,
  onSuccess: (data: any) => void,
) {
  const url = process.env.NEXT_PUBLIC_AUTH_DOMAIN + Endpoint.SIGN_OUT;
  
  return useMutation({
    mutationFn: (accessToken: string) => {
      // Get ID token from localStorage for Authorization header
      const idToken = typeof window !== "undefined" 
        ? localStorage.getItem("IDToken") || localStorage.getItem("IdToken")
        : null;
      const authToken = idToken || accessToken; // Fallback to access token if ID token not found
      
      const apiCall = APICall({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
      });
      
      return apiCall({
        body: { access_token: accessToken },
      });
    },
    onError,
    onSuccess,
  });
}
