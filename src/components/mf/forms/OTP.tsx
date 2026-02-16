import React, { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

type OTPPropType = {
  title: string;
  description?: string;
  buttonText?: string;
  errorText?: string;
  onSubmit: (otp: string) => void;
  onResend?: () => void;
};

export const OTPForm = ({
  title,
  description,
  buttonText = "Submit",
  errorText,
  onSubmit,
  onResend,
}: OTPPropType) => {
  const [OTP, setOTP] = useState("");

  return (
    <>
      <h2 className="text-center text-header">{title}</h2>
      <span className="text-body text-foreground">{description}</span>
      <InputOTP maxLength={6} name="otp" onChange={setOTP}>
        <InputOTPGroup className="ml-auto">
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup className="mr-auto">
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <span className="text-xs text-destructive">{errorText}&nbsp;</span>
      <div className="m-0 flex justify-center p-0">
        <Button
          variant="secondary"
          className="w-full max-w-60 rounded-full text-white hover:bg-primary"
          onClick={() => onSubmit(OTP)}
        >
          {buttonText}
        </Button>
      </div>
      {typeof onResend === "function" && (
        <div className="mt-4 flex flex-col items-center space-y-2 text-subBody">
          <div className="flex items-center space-x-2">
            <span>Did&apos;nt receive code?</span>
            <Button
              variant="link"
              size="sm"
              className="m-0 p-0"
              onClick={onResend}
            >
              Resend
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
