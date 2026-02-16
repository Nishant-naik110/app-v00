
import { Button } from "@/components/ui/button";
import React, { useCallback, useState } from "react";
import LoginForm from "../forms/login";
import { OTPForm } from "../forms/OTP";
import Endpoint from "@/common/endpoint";
import {
  LoginBodyType,
  MFAVerifyBodyType,
  MFAVerifyError,
  useLogin,
  useMFAVerify,
} from "@/queries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { fetchMenuWithPackage, findFirstSubMenuRoute } from "@/lib/menu-utils";
 
type FormType = "login" | "otp";
 
const FormCard = () => {
  const router = useRouter();
  const [FormType, setFormType] = useState<FormType>("login");
 
    const fetchProductsAndRedirect = async (idToken: string, router: any) => {
    try {
      // Use the actual products API endpoint
      const response = await fetch( process.env.NEXT_PUBLIC_AUTH_DOMAIN + "api/v1/access_control/products?config=true", {
        headers: {
          Authorization: `${idToken}`,
        },
      });
      const data = await response.json();
      if (data?.available_products?.some((product: any) => product.label?.includes("App Performance"))) {
        const index = data?.available_products?.findIndex((item: any) => item.label === "App Performance");
         const firstProduct = data?.available_products?.[index];
       const firstProductRoute = firstProduct?.route || "/app-analytics/dashboard/overall-summary";
      
      const productName = firstProduct?.label;
 
      // Use the new utility function that fetches package name first
      const menuData = await fetchMenuWithPackage(idToken, productName);
 
      let firstSubMenuRoute = findFirstSubMenuRoute(menuData) || "";
      // Remove the first segment if it starts with a slash and has more than one segment
      // if (firstSubMenuRoute.startsWith("/")) {
      //   const parts = firstSubMenuRoute.split("/");
      //   if (parts.length > 2) {
      //     // parts[0] is '', parts[1] is the first segment to remove
      //     firstSubMenuRoute = "/" + parts.slice(2).join("/");
      //   }
      // }
 
      const finalRoute = firstSubMenuRoute
        ? `${firstProductRoute}${firstSubMenuRoute.startsWith("/") ? "" : "/"}${firstSubMenuRoute}`
//  ? `${firstSubMenuRoute.startsWith("/") ? "" : "/"}${firstSubMenuRoute}`
        : firstProductRoute;
        console.log(finalRoute,"final")
  // Your code here — condition matched
  console.log("App Performance product is available");
   router.push(finalRoute);
} else {
  // Condition not matched
  console.log("App Performance product is NOT available");
}
      
      
    } catch (error) {
      // fallback if API fails
      // router.push("/app-analytics/dashboard/overall-summary");
    }
  };
 
  const onSuccess = async (res: any) => {
    // MFA login
    if (res?.data?.challenge_name === "SOFTWARE_TOKEN_MFA") {
      setFormType("otp");
    }
    // Normal login
    else if (res.data?.auth_response?.AuthenticationResult?.AccessToken) {
      // Store tokens
      localStorage.setItem(
        "AccessToken",
        res?.data?.auth_response?.AuthenticationResult?.AccessToken,
      );
      localStorage.setItem(
        "IDToken",
        res?.data?.auth_response?.AuthenticationResult?.IdToken,
      );
 
      // Redirect to first product route after successful login
      const idToken = res?.data?.auth_response?.AuthenticationResult?.IdToken;
      await fetchProductsAndRedirect(idToken, router);
    }
  };
 
  const loginFn = useLogin(console.debug, onSuccess);
 
  const onMFAVerifySuccess = async (d: any) => {
    const AccessToken =
      d?.data?.auth_response?.AuthenticationResult?.AccessToken;
    const IdToken =
      d?.data?.auth_response?.AuthenticationResult?.IdToken;
    if (AccessToken && IdToken) {
      localStorage.setItem("AccessToken", AccessToken);
      localStorage.setItem(
        "IDToken",
        IdToken,
      );
      localStorage.removeItem("username");
      // Redirect to first product route after successful MFA verification
      await fetchProductsAndRedirect(IdToken, router);
    }
  };
 
  const onMFAVerifyError = (e: MFAVerifyError) => {
    toast({ title: e.message, variant: "destructive" });
  };
 
  const MFAVerify = useMFAVerify(onMFAVerifyError, onMFAVerifySuccess);
 
  const handleSubmit = useCallback((body: LoginBodyType) => {
    localStorage.setItem("username", body.username);
    if (!loginFn.isLoading) loginFn.mutate({ body });
  }, []);
 
  const handleOTPSubmit = (otp: string) => {
    const body: MFAVerifyBodyType = {
      challenge_name: loginFn.data?.data.challenge_name,
      user_code: otp,
      session_token: loginFn.data?.data.session_token,
      username: localStorage.getItem("username") ?? "",
    };
    if (!MFAVerify.isLoading) MFAVerify.mutate({ body });
  };
 
  return (
    <div className="flex flex-col items-center justify-center p-8 px-0 py-0 md:w-5/12">
      <div className="z-10 w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        {FormType === "login" && (
          <LoginFormCard
            buttonText={loginFn.isLoading ? "Logging in..." : "Login"}
            onSubmit={handleSubmit}
            errorMessage={loginFn.error?.message ?? ""}
          />
        )}
        {FormType === "otp" && (
          <OTPForm
            title="MFA Verification"
            description="Enter MFA code"
            buttonText="Verify"
            onSubmit={handleOTPSubmit}
          />
        )}
      </div>
    </div>
  );
};
 
export default FormCard;
 
const LoginFormCard: React.FC<{
  buttonText: string;
  errorMessage: string | null;
  onSubmit: (data: LoginBodyType) => void;
}> = ({ onSubmit, errorMessage, buttonText }) => {
  return (
    <>
      <LoginForm
        beforeForm={<h2 className="text-center text-header">Login</h2>}
        buttonText={buttonText}
        onSubmit={onSubmit}
        errorMessage={errorMessage}
        afterForm={
          <div className="mt-4 flex flex-col items-center space-y-2 text-subBody">
            <Link href="/forgot-password">
              <Button variant="link" size="sm" className="m-0 h-fit p-0">
                Forgot Password
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <span>Don&apos;t have an account?</span>
              <Link href="/sign-up" replace>
                <Button variant="link" size="sm" className="m-0 h-fit p-0">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        }
      />
    </>
  );
};