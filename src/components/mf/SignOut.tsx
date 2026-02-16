"use client";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useSignOut } from "@/queries";
import ToastContent from "@/components/mf/ToastContent";
import { Power } from "lucide-react";
 
const SignOutButton = () => {
  const router = useRouter();
  const [toastData, setToastData] = React.useState<any>(null);
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };
  
  const { mutate } = useSignOut(
    // onError callback
    (error) => {
      setToastData({
        type: "error",
        title: "Sign Out Failed",
        description: error.message || "Failed to sign out",
        variant: "default"
      });
      // Clear session and redirect to base URL even on error
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = getBaseUrl();
        }
        router.refresh();
      }, 1000);
    },
    // onSuccess callback
    (data) => {
      //console.log("Sign out success:", data.data.message);
      setToastData({
        type: "success",
        title: "Signed Out",
        description:data.data.message,
        variant: "default"
      });
      // Clear session and redirect to base URL on success
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = getBaseUrl();
        }
        router.refresh();
      }, 1000);
    }
  );
  
  const onClick = () => {
    const accessToken = localStorage.getItem("AccessToken");
    const idToken = localStorage.getItem("IDToken");
    
    if (!accessToken || !idToken) {
      console.log("Debug - No access token or id token, clearing session and redirecting");
      // Clear all session storage items and redirect to base URL
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = getBaseUrl();
      }
      router.refresh();
      return;
    }
 
    // Make the API call
    mutate(accessToken);
  };
 
  return (
    <>
      {toastData && (
        <ToastContent
          type={toastData.type}
          title={toastData.title}
          description={toastData.description}
          variant={toastData.variant}
        />
      )}
      <Button
        title="Log out"
        variant="ghost"
        size="icon"
        onClick={onClick}
        className="hover:bg-destructive hover:text-destructive-foreground rounded-full hover:scale-110 "
      >
        <Power />
      </Button>
    </>
  );
};
 
export default SignOutButton;