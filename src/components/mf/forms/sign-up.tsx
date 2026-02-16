import React from "react";
import { Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Formik } from "formik";
import { object, string } from "yup";
import { TextField } from "./TextField";

const schema = object().shape({
  role: string().required("Required"),
  gender: string(),
  name: string().required("Required"),
  email: string().email("Invalid Email").required("Required"),
  phone: string().min(10, "10 numbers required").required("Required"),
  temp_password: string()
    .min(8, "Too short")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at number")
    .matches(
      /[!@#%^*(),.":|]/,
      'Password must contain at least one special character (!@#%^*(),.":|])',
    )
    .required("Required"),
});

type SignUpFormProps = {
  errorMessage?: string | null;
  buttonText: string;
  onSubmit: (event: any) => void;
  afterForm?: React.ReactNode;
  beforeForm?: React.ReactNode;
};

const SignUpForm = ({
  onSubmit,
  errorMessage,
  buttonText,
  beforeForm,
  afterForm,
}:SignUpFormProps) => {
  return (
    <>
      {beforeForm}
      <Formik
        initialValues={{
          role: "user",
          name: "",
          email: "",
          phone: "",
          temp_password: "",
          gender: "male",
        }}
        validationSchema={schema}
        onSubmit={onSubmit}
        // onSubmit={console.log}
      >
        {({ handleSubmit, setFieldValue, errors }) => (
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <div>
              <TextField
                icon={
                  <User className="absolute left-3 h-5 w-5 text-gray-400" />
                }
                placeholder="Name"
                name="name"
                error={errors.name}
                onChange={(s) => setFieldValue("name", s)}
              />
            </div>
            <div>
              <TextField
                icon={
                  <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                }
                placeholder="E-mail"
                name="email"
                type="email"
                error={errors.email}
                onChange={(s) => setFieldValue("email", s)}
              />
            </div>
            <div>
              <TextField
                icon={
                  <Phone className="absolute left-3 h-5 w-5 text-gray-400" />
                }
                placeholder="Phone"
                name="phone"
                type="phone"
                error={errors.phone}
                onChange={(s) => setFieldValue("phone", s)}
              />
            </div>
            <div>
              <TextField
                icon={
                  <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
                }
                placeholder="Password"
                name="temp_password"
                type="password"
                error={errors.temp_password}
                onChange={(s) => setFieldValue("temp_password", s)}
              />
            </div>
            <span className="text-xs text-destructive">{errorMessage}</span>
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

export default SignUpForm;
