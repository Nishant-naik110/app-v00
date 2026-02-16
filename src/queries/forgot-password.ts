import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useMutation } from "@tanstack/react-query";

export type ForgotPasswordError = {
  message: string;
};

export type ForgotPasswordBodyType = {
  username: string;
};

/**
 * TODO
 */
export function useForgotPassword(
  onError: (error: ForgotPasswordError) => void,
  onSuccess: (data: any) => void,
) {
  const url = process.env.NEXT_PUBLIC_AUTH_DOMAIN + Endpoint.FORGOT_PASSWORD;
  const apiCall = APICall({
    url,
    method: "POST",
    headers: {
      Authorization:
        "92a2119fb3329486dd39b97464d4fe5a4f8ba763fa884b8ba2d689b0b67c4175d9eff7232acd828ad24db7e5ddf7cae32ebf6eadab9e4d6c7cdeb1bbbc82c273",
    },
  });
  
  return useMutation({
    mutationFn: (variables: { query?: Record<string, string>; body?: ForgotPasswordBodyType }) =>
      apiCall(variables),
    onError,
    onSuccess,
  });
}
