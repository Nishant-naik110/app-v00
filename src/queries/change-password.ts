
import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
 
export type ChangePasswordErrorType = {
  error: string;
  status_code: number;
};
 
export type ChangePasswordBodyType = {
  current_password: string;
  new_password: string;
  access_token: string;
};
 
interface ToastData {
  type: "success" | "error";
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}
 
export function useChangePassword() {
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const url = process.env.NEXT_PUBLIC_AUTH_DOMAIN + Endpoint.CHANGE_PASSWORD;
  
  const onSuccess = (d: any) => {
    const message = d && typeof d === 'object' && 'data' in d && d.data && typeof d.data === 'object' && 'message' in d.data
      ? (d.data as { message: string }).message
      : "Password reset successfully";
    
    setToastData({
      type: "success",
      title: "Success",
      description: message,
      variant: "default"
    });
  };
 
  const onError = (e: ChangePasswordErrorType) => {
    //console.log("Error object:", e);
    
    let message = "Failed to reset password";
    
    // Handle different error formats
    if (e && typeof e === 'object') {
      if ('error' in e && typeof e.error === 'string') {
        message = e.error;
      } else if ('message' in e && typeof e.message === 'string') {
        message = e.message;
      } else if (typeof e === 'string') {
        message = e;
      }
    }
    
    setToastData({
      type: "error",
      title: "Error",
      description: message,
      variant: "default"
    });
  };
 
  const mutation = useMutation({
    mutationFn: (body: ChangePasswordBodyType) => {
      // Get ID token from localStorage for Authorization header (same as sign-out)
      const idToken = typeof window !== "undefined" ? localStorage.getItem("IDToken") : null;
      
      console.log("=== CHANGE PASSWORD DEBUG ===");
      console.log("Debug - Change Password API URL:", url);
      console.log("Debug - Request body:", body);
      console.log("Debug - IDToken:", idToken);
      console.log("Debug - AccessToken:", typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null);
      console.log("=== END DEBUG ===");
      
      if (!idToken) {
        throw new Error("No idToken found in session storage");
      }
      
      const apiCall = APICall({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken
        },
      });
      
      return apiCall({
        body,
      });
    },
    onError,
    onSuccess,
  });
 
  return {
    ...mutation,
    toastData,
    setToastData
  };
}
 
/** RESPONSE FROM API
{
    "message": "User created successfully",
    "user": {
        "CodeDeliveryDetails": {
            "AttributeName": "email",
            "DeliveryMedium": "EMAIL",
            "Destination": "t***@m***"
        },
        "ResponseMetadata": {
            "HTTPHeaders": {
                "connection": "keep-alive",
                "content-length": "171",
                "content-type": "application/x-amz-json-1.1",
                "date": "Fri, 18 Oct 2024 06:22:06 GMT",
                "x-amzn-requestid": "3862caf7-875b-4fed-a68e-1f71b1a7153a"
            },
            "HTTPStatusCode": 200,
            "RequestId": "3862caf7-875b-4fed-a68e-1f71b1a7153a",
            "RetryAttempts": 0
        },
        "UserConfirmed": false,
        "UserSub": "d8c13360-2041-70cd-66d4-48fd5f4bd821"
    }
}
*/
 