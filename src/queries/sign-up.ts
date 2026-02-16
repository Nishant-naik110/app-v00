import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

type ErrorResponse = {
  message: string;
};

export type SignUpBodyType = {
  name: string;
  email: string;
  phone: string;
  temp_password: string;
  role: "user";
  gender: "male" | "female";
};

export function useSignUp(
  onError: (data: ErrorResponse) => void,
  onSuccess: (data: unknown) => void,
) {
  const url = process.env.NEXT_PUBLIC_AUTH_DOMAIN + Endpoint.SIGN_UP;
  const apiCall = APICall({
    url,
    method: "POST",
    headers: {
      Authorization:
        "92a2119fb3329486dd39b97464d4fe5a4f8ba763fa884b8ba2d689b0b67c4175d9eff7232acd828ad24db7e5ddf7cae32ebf6eadab9e4d6c7cdeb1bbbc82c273",
    },
  });
  
  return useMutation({
    mutationFn: (variables: { query?: Record<string, string>; body?: SignUpBodyType }) =>
      apiCall(variables),
    onError,
    onSuccess,
  });
}
