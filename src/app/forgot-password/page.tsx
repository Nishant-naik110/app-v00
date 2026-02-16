"use client";

import React, { useState } from "react";
import Home from "@/components/mf/login/home";
import { TextField } from "@/components/mf/forms/TextField";
import { Formik } from "formik";
import { Button } from "@/components/ui/button";
import { Check, Lock, Mail } from "lucide-react";
import {
  ConfirmForgotPasswordBodyType,
  ConfirmForgotPasswordError,
  ForgotPasswordBodyType,
  ForgotPasswordError,
  useConfirmForgotPassword,
  useForgotPassword,
} from "@/queries";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const ForgotPasswordPage = () => {
  return (
    <Home
      InfoText="Simplifying Compliance for Digital Brands Our creative and content compliance solution, Tickr provides automated compliance regulation across creative and content to reduce errors and maximize efficiency with brand-compliant creative assets."
      logoSize="w-52"
      logoUrl="https://infringementportalcontent.mfilterit.com/images/media/logos/mfilterit-white-logo.png"
    >
      <div className="flex flex-col items-center justify-center p-8 px-0 py-0 md:w-5/12">
        <div className="z-10 w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
          <h2 className="text-center text-header">Forgot Password</h2>
          <ForgotPasswordForm />
        </div>
      </div>
    </Home>
  );
};

export default ForgotPasswordPage;

const ForgotPasswordForm = () => {
  const router = useRouter();
  const [FormType, setFormType] = useState<
    "forgot-password" | "update-password"
  >("forgot-password");
  const [Desc, setDesc] = useState("");

  const onForgotPasswordError = (e: ForgotPasswordError) =>
    toast({ title: e.message, variant: "destructive" });
  const onForgotPasswordSuccess = (d: any) => {
    console.log(d);
    toast({ title: d?.data?.message });
    if (d?.data?.response?.CodeDeliveryDetails) {
      const medium = d?.data?.response?.CodeDeliveryDetails?.DeliveryMedium;
      const to = d?.data?.response?.CodeDeliveryDetails?.Destination;
      const desc = `Send as ${medium} to ${to}`;
      setDesc(desc);
    }
    setFormType("update-password");
  };
  const ForgotPassword = useForgotPassword(
    onForgotPasswordError,
    onForgotPasswordSuccess,
  );
  const handleForgotPasswordSubmit = (body: ForgotPasswordBodyType) => {
    console.log("00000000", body);
    ForgotPassword.mutate({ body });
    localStorage.setItem("username", body.username);
  };
  //
  const onConfirmForgotPasswordError = (e: ConfirmForgotPasswordError) => {
    console.log(e);
    toast({ title: e.message, variant: "destructive" });
  };
  const onConfirmForgotPasswordSuccess = (d: any) => {
    console.log(d);
    toast({
      title: d?.data?.message,
      description: "Redirecting to login in 5s",
    });
    setTimeout(() => {
      router.replace("/");
    }, 5000);
  };

  const ConfirmForgotPassword = useConfirmForgotPassword(
    onConfirmForgotPasswordError,
    onConfirmForgotPasswordSuccess,
  );

  const handleConfirmPasswordSubmit = (body: ConfirmForgotPasswordBodyType) => {
    ConfirmForgotPassword.mutate({ body });
  };

  //

  switch (FormType) {
    case "forgot-password":
      return (
        <Formik
          initialValues={{ username: "" }}
          onSubmit={handleForgotPasswordSubmit}
        >
          {({ setFieldValue, handleSubmit }) => (
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <div>
                <TextField
                  label="Email"
                  name="username"
                  type="email"
                  icon={
                    <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                  }
                  onChange={(s) => setFieldValue("username", s)}
                />
              </div>
              <div className="m-0 flex justify-center p-0">
                <Button
                  variant="secondary"
                  className="m-0 w-fit max-w-60 rounded-full text-white hover:bg-primary"
                >
                  Continue
                </Button>
              </div>
            </form>
          )}
        </Formik>
      );
    case "update-password":
    default:
      return (
        <Formik
          initialValues={{
            username: localStorage.getItem("username") ?? "",
            confirmation_code: "",
            new_password: "",
          }}
          onSubmit={handleConfirmPasswordSubmit}
        >
          {({ setFieldValue, handleSubmit, values }) => (
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <span>{Desc}</span>
              <div>
                <TextField
                  label="Email"
                  name="username"
                  type="email"
                  disabled
                  icon={
                    <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                  }
                  defaultValue={values.username}
                  onChange={console.log}
                />
              </div>
              <div>
                <TextField
                  label="Confirmation Code"
                  name="confirmation_code"
                  icon={
                    <Check className="absolute left-3 h-5 w-5 text-gray-400" />
                  }
                  onChange={(s) => setFieldValue("confirmation_code", s)}
                />
              </div>
              <div>
                <TextField
                  label="New Password"
                  name="new_password"
                  type="password"
                  icon={
                    <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
                  }
                  onChange={(s) => setFieldValue("new_password", s)}
                />
              </div>
              <div className="m-0 flex justify-center p-0">
                <Button
                  variant="secondary"
                  className="m-0 w-fit max-w-60 rounded-full text-white hover:bg-primary"
                >
                  Continue
                </Button>
              </div>
            </form>
          )}
        </Formik>
      );
  }
};
