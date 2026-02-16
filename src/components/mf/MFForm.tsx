"use client";
import React from "react";
//import DynamicForm from "../ui/form";

const MFForm = () => {
  const handleFormSubmit = (values: Record<string, any>) => {
    console.log("Form values submitted:", values);
  };

  type FormFieldType =
    | {
        label: string;
        name: string;
        type: "text" | "email" | "password" | "textarea";
        placeholder: string;
        required: boolean;
        options?: never;
      }
    | {
        label: string;
        name: string;
        type: "select";
        options: string[];
        required: boolean;
        placeholder?: never;
      }
    | {
        label: string;
        name: string;
        type: "radio";
        options: string[];
        required: boolean;
        placeholder?: never;
      }
    | {
        label: string;
        name: string;
        type: "checkbox";
        required: boolean;
        placeholder?: never;
        options?: never;
      }
    | {
        label: string;
        name: string;
        type: "file";
        required: boolean;
        placeholder?: never;
        options?: never;
      };

  const formConfig: FormFieldType[] = [
    {
      label: "First Name",
      name: "firstName",
      type: "text",
      placeholder: "Enter your first name",
      required: true,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      label: "Role",
      name: "role",
      type: "select",
      options: ["Admin", "User", "Guest"],
      required: true,
    },
    {
      label: "About",
      name: "about",
      type: "text",
      placeholder: "Enter your details",
      required: true,
    },
    {
      label: "Gender",
      name: "gender",
      type: "radio",
      options: ["Male", "Female"],
      required: true,
    },
    {
      label: "Newsletter Subscription",
      name: "subscription",
      type: "checkbox",
      required: true,
    },
    {
      label: "Profile Picture",
      name: "profilePicture",
      type: "file",
      required: false,
    },
  ];

  const handleCancel = () => {
    console.log("go back to previous page");
  };

  return (
    <div className="min-h-[calc(100vh_-_5.5rem)] bg-white">
      {/* <DynamicForm
        formConfig={formConfig}
        onSubmit={handleFormSubmit}
        showCancelButton={true}
        showSaveButton={true}
        onCancel={handleCancel}
        saveButtonLabel="Submit"
        cancelButtonLabel="Cancel"
      /> */}
    </div>
  );
};

export default MFForm;
