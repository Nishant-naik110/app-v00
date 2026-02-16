import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Formik } from "formik";
import { LoginBodyType } from "@/queries";

type LoginFormProps = {
  errorMessage?: string | null;
  buttonText: string;
  onSubmit: (data: LoginBodyType) => void;
  afterForm: React.ReactNode;
  beforeForm: React.ReactNode;
};

const LoginForm = ({
  onSubmit,
  errorMessage,
  buttonText,
  beforeForm,
  afterForm,
}:LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <>
      {beforeForm}
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={onSubmit}
      >
        {({ setFieldValue, handleSubmit }) => (
          <form className="" onSubmit={handleSubmit}>
            <div>
              <div className="relative mt-2 flex items-center">
                <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  // type="email"
                  required
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 shadow-sm"
                  onChange={(e) => setFieldValue("username", e.target.value)}
                  placeholder="Email or User Name"
                />
              </div>
            </div>
            <div>
              <div className="relative mt-2 flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-12 shadow-sm"
                  onChange={(e) => setFieldValue("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3"
                >
                  {showPassword ? (
                    <EyeOff className="absolute -top-2 right-0 h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="absolute -top-2 right-0 h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <span className="h-4 text-subBody text-destructive">
              {errorMessage}&nbsp;
            </span>
            <Button
              variant="secondary"
              className="w-full rounded-full text-white hover:bg-primary"
            >
              {buttonText}
            </Button>
          </form>
        )}
      </Formik>

      {afterForm}
    </>
  );
};

export default LoginForm;
