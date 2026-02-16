"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import React, { useEffect, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSoftwareToken } from "@/queries/get-software-token";
import { toast } from "@/hooks/use-toast";
import { useVerifySoftwareToken } from "@/queries/verify-software-token";
import { useSetMFAPreference, useSetMFAPreferenceUpdate } from "@/queries";
import { useIsMFA } from "@/queries/is-mfa";
import ToastContent from "@/components/mf/ToastContent";
import QRCode from 'react-qr-code';
export const MFACard = () => {
  const IsMFA = useIsMFA();
  const [Enable, setEnable] = useState(false);
  const [toastData, setToastData] = useState<any>(null);
  
  const onSetMFAPreferenceError = console.warn;
  const onSetMFAPreferenceSuccess = (d: any) => {
    if (d && d.data && typeof d.data.message === "string") {
      setToastData({
        type: "success",
        title: "MFA Preference Updated",
        description: d.data.message,
        variant: "default"
      });
    }
    IsMFA.refetch();
  };
  const SetMFAPreference = useSetMFAPreference(
    onSetMFAPreferenceError,
    onSetMFAPreferenceSuccess,
  );
  
  const onSetMFAPreferenceUpdateError = console.warn;
  const onSetMFAPreferenceUpdateSuccess = (d: any) => {
    if (d && d.data && typeof d.data.message === "string") {
      setToastData({
        type: "success",
        title: "MFA Disabled",
        description: d.data.message,
        variant: "default"
      });
    }
    setEnable(false);
    IsMFA.refetch();
  };
  
  const SetMFAPreferenceUpdate = useSetMFAPreferenceUpdate(
    onSetMFAPreferenceUpdateError,
    onSetMFAPreferenceUpdateSuccess,
  );
  
  const disableMFA = () => {
    const body = {
      access_token:
        typeof window !== "undefined" ? localStorage.getItem("AccessToken") : "",
      enable_software_token_mfa: false,
    };
    SetMFAPreferenceUpdate.mutate({ body });
  };
  console.log(IsMFA.data);
  useEffect(() => {
    if (IsMFA.data?.enabled_streams) setEnable(true);
  }, [IsMFA.data]);
  
  return (
    <div className="flex items-center justify-center  100 dark:bg-card">
      <div className="w-full max-w-4xl">
        {toastData && (
          <ToastContent
            type={toastData.type}
            title={toastData.title}
            description={toastData.description}
            variant={toastData.variant}
          />
        )}
        <Card className="shadow-lg border-0 bg-white dark:bg-background">
          <CardHeader className="relative ">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-body font-semiboldflex  text-gray-900 dark:text-white p-2">
                  MFA
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  Enable for extra security
                </CardDescription>
              </div>
              { Enable && (
              <Button
                variant="ghost"
                size="sm"
                title={!Enable ? "Please enable MFA from below" : "Delete MFA"}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 "
                // disabled={!Enable}
                onClick={() => {
                  if (Enable) disableMFA();
                }}
              >
                <Trash2 className="h-4 w-4 cursor-pointer" />
              </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Accordion type="single" collapsible className="w-full">
              <AuthenticatorAccordion
                isEnabled={IsMFA.data?.enabled_streams?.includes(
                  "SOFTWARE_TOKEN_MFA",
                )}
                  mfaData={IsMFA.data}
                  onRefetch={IsMFA.refetch}
                  setToastData={setToastData}
              />
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function AuthenticatorAccordion({ 
  isEnabled, 
  mfaData, 
  onRefetch,
  setToastData
}: { 
  isEnabled: boolean;
  mfaData: any;
  onRefetch: () => void;
  setToastData: (data: any) => void;
}) {
  const [OTP, setOTP] = useState("");
  
  const onGetSoftwareTokenSuccess = (data: any) => {
    if (data?.message) {
      setToastData({
        type: "success",
        title: "Software Token Generated",
        description: data.message,
        variant: "default"
      });
    }
  };
  
  const onGetSoftwareTokenError = (error: any) => {
    setToastData({
      type: "error",
      title: "Token Generation Failed",
      description: error?.message || "Failed to generate software token",
      variant: "default"
    });
  };
  
  // generate token on expand
  const token = useGetSoftwareToken(!isEnabled, onGetSoftwareTokenError, onGetSoftwareTokenSuccess);
  
  const onVerifySoftwareTokenSuccess = (d: any) =>
    toast({ title: d?.data?.message });
  const onSetMFAPreferenceSuccessAccordion = (d: any) => {
    if (d && d.data && typeof d.data.message === "string") {
      setToastData({
        type: "success",
        title: "MFA Enabled",
        description: d.data.message,
        variant: "default"
      });
    }
    onRefetch();
  };

  const onSetMFAPreferenceUpdateSuccess = (d: any) => {
    if (d && d.data && typeof d.data.message === "string") {
      setToastData({
        type: "success",
        title: "Reference Updated",
        description: d.data.message,
        variant: "default"
      });
    }
    onRefetch();
  };

  const SetMFAPreference = useSetMFAPreference(
    console.debug,
    onSetMFAPreferenceSuccessAccordion,
  );

  const SetMFAPreferenceUpdate = useSetMFAPreferenceUpdate(
    console.debug,
    onSetMFAPreferenceUpdateSuccess,
  );

  const VerifySoftwareToken = useVerifySoftwareToken(
    onVerifySoftwareTokenSuccess,
  );

  const handleVerifySoftwareToken = () => {
    if (OTP.length < 6) {
      toast({ title: "Enter OTP", variant: "destructive" });
      return;
    }
    const body = {
      access_token:
        typeof window !== "undefined" ? localStorage.getItem("AccessToken") : "",
      user_code: OTP,
    };
    VerifySoftwareToken.mutate({ body });
  };


  const QRGerator = (secret_code: string) => {
    if (!secret_code) return "";
    const username = localStorage.getItem("username") ?? "";
    let qr = `otpauth://totp/${username}?secret=${secret_code}&issuer=mFilterIt&algorithm=SHA1&digits=6&period=30`;
    return qr;
  };

  useEffect(() => {
    // if(!VerifySoftwareToken.)
    if (VerifySoftwareToken.error) {
      const errorMessage = typeof VerifySoftwareToken.error === 'object' && VerifySoftwareToken.error !== null
        ? (VerifySoftwareToken.error as any).message || "Verification failed"
        : "Verification failed";
      toast({ title: errorMessage });
    } else if (VerifySoftwareToken.data) {
      // toast({ title: VerifySoftwareToken.data.data.message });
      const body = {
        access_token:
          typeof window !== "undefined"
            ? localStorage.getItem("AccessToken")
            : "",
        enable_software_token_mfa: true,
        user_code: OTP,
      };
      SetMFAPreference.mutate({ body });
    }
  }, [VerifySoftwareToken.data, VerifySoftwareToken.error]);

  useEffect(() => {
    if (SetMFAPreference.data) {
      // After successful MFA preference update, call the set reference update API
      const body = {
        access_token:
          typeof window !== "undefined"
            ? localStorage.getItem("AccessToken")
            : "",
        enable_software_token_mfa: true,
      };
      SetMFAPreferenceUpdate.mutate({ body });
    }
  }, [SetMFAPreference.data]);
  switch (isEnabled) {
    case true:
      return (
        <AccordionItem value="item-1">
          <AccordionTrigger>Authenticator App</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-subBody text-green-700 dark:text-green-300 font-medium">
                Multi-factor authentication is enabled
              </p>
            </div>
            <p className="text-subBody text-gray-600 dark:text-gray-400">
              Your account is protected with an authenticator app. You can disable it using the delete button above.
            </p>
          </AccordionContent>
        </AccordionItem>
      );
    case false:
    default:
      return (
        <AccordionItem value="item-1">
          <AccordionTrigger>Authenticator App</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pt-4">
            <p className="text-subBody text-gray-600 dark:text-gray-400 font-medium">
              1. Enter the below token in the preferred MFA App or scan the QR code to enable MFA
            </p>
            <div className="flex items-center justify-between rounded-lg -50 dark:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600">
              <span className="font-mono text-subBody text-gray-800 dark:text-gray-200 break-all">
                {token.isLoading ? (
                  <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                ) : (
                  token.data?.secret_code ? token.data?.secret_code : <span className="text-gray-500 dark:text-gray-400">Failed to generate token</span>
                
                )}
              </span>

              { token.data?.secret_code && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 ml-2 flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Click to copy"
                onClick={() => {
                  navigator.clipboard.writeText(token.data?.secret_code ?? "");
                  toast({ title: "Copied to clipboard" });
                }}
              >
                <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </Button>
              )}
            </div>

            {token.isLoading ? (
                  <span className="text-gray-500 dark:text-gray-400">QR generating...</span>
                ) : (
                  QRGerator(token.data?.secret_code) ? (
                    <QRCode size={200} viewBox={`0 0 256 256`} title="MFA QR Code" value={QRGerator(token.data?.secret_code) ?? ""} />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Failed to generate QR</span>
                    )
                )}
            <p className="text-subBody text-gray-600 dark:text-gray-400 font-medium">
              2. Enter Code from App
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} name="otp" onChange={setOTP}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              className="w-full sm:w-auto sm:ml-auto rounded-lg dark:text-white"
              size="sm"
              onClick={handleVerifySoftwareToken}
            >
              Submit
            </Button>
          </AccordionContent>
        </AccordionItem>
      );
  }
}
