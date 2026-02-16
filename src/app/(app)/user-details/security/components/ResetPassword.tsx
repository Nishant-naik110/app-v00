"use client";
import { TextField } from "@/components/mf/forms/TextField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ToastContent from "@/components/mf/ToastContent"
import { useRouter } from "next/navigation";

import { toast } from "@/hooks/use-toast";
import { ChangePasswordErrorType, ChangePasswordBodyType,useChangePassword } from "@/queries";
import { log } from "console";
import { Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";

const schema = Yup.object().shape({
  current_password: Yup.string().required("Required"),
  new_password: Yup.string()
    .min(8, "Too short")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at number")
    .matches(
      /[!@#%^*(),.":|]/,
      'Password must contain at least one special character (!@#%^*(),.":|])',
    )
    .required("Required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password"), ""], "Passwords must match")
    .required("Required"),
});
interface ToastData {
  type: "success" | "error";
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

interface FormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
  access_token: string;
}

export const ChangePassword = () => {
    const router = useRouter();
  
  const [initialValues, setinitialValues] = useState<FormValues>({
    current_password: "",
    new_password: "",
    confirm_password: "",
    access_token: "",
  });

  const ChangePassword = useChangePassword();

  // Watch for success and redirect
  React.useEffect(() => {
    if (ChangePassword.toastData?.type === "success") {
      // Redirect to security tab after successful password change
      // This will trigger the layout to hide the sidebar since activeButton will be "Security"
      router.push("/user-details/security");
    }
  }, [ChangePassword.toastData, router]);

  const handleSubmit = (
    d: FormValues,
    { resetForm }: FormikHelpers<FormValues>,
  ) => {
    console.log("Form submitted with data:", d); // Debug log
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirm_password: k, ...body } = d;
    // Add access token to body
    body.access_token = typeof window === "object" ? (localStorage.getItem("AccessToken") ?? "") : "";
    console.log("Calling API with body:", body); // Debug log
    ChangePassword.mutate(body);
    resetForm();
  };

  return (
    <div className="flex items-center justify-center p-3 dark:bg-card">
      <Card className="w-full max-w-md border-0 bg-white dark:bg-background">
        {ChangePassword.toastData && (
        <ToastContent
          type={ChangePassword.toastData.type}
          title={ChangePassword.toastData.title}
          description={ChangePassword.toastData.description}
          variant={ChangePassword.toastData.variant}
        />
      )}

      <CardHeader className="">
        {/* <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Reset Password
        </CardTitle> */}
      </CardHeader>
      <CardContent className="pt-0">
        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={handleSubmit}
          enableReinitialize={false}
        >
          {({ setFieldValue, handleSubmit, errors, values }) => (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <TextField
                  label="Current Password"
                  placeholder="Enter your current password"
                  name="current_password"
                  type="password"
                  error={errors.current_password}
                  value={values.current_password}
                  onChange={(e) => setFieldValue("current_password", e)}
                />
              </div>
              <div>
                <TextField
                  label="New Password"
                  placeholder="Enter your new password"
                  name="new_password"
                  type="password"
                  error={errors.new_password}
                  value={values.new_password}
                  onChange={(e) => setFieldValue("new_password", e)}
                />
              </div>
              <div>
                <TextField
                  label="Confirm Password"
                  placeholder="Confirm your new password"
                  name="confirm_password"
                  type="password"
                  error={errors.confirm_password}
                  value={values.confirm_password}
                  onChange={(e) => setFieldValue("confirm_password", e)}
                />
              </div>
              <Button 
                type="submit"
                className="w-full sm:w-auto sm:ml-auto rounded-lg mt-2 dark:text-white"
                disabled={ChangePassword.isLoading}
              >
                {ChangePassword.isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </Formik>
      </CardContent>
    </Card>
    </div>
  );
};
