"use client";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { HTMLInputTypeAttribute, useState } from "react";

type TextFieldProps = {
  name: string;
  label?: string;
  placeholder: string;
  error?: string;
  defaultValue?: string;
  value?: string;
  icon?: React.ReactNode;
  type?: HTMLInputTypeAttribute;
  disabled?: boolean;
  autoComplete?: boolean;
  onChange: (s: string) => void;
};

export function TextField({
  label,
  placeholder,
  icon,
  type = "text",
  name,
  error,
  disabled,
  defaultValue,
  value,
  onChange,
  autoComplete,
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <>
      {label && (
        <label htmlFor={name} className="block text-subBody font-medium">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon}
        <input
          id={name}
          name={name}
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          required
          className={cn(
            "block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm dark:bg-input",
            { "pl-10": !!icon },
          )}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          defaultValue={defaultValue}
          value={value}
          autoComplete={autoComplete ? "one-time-code" : ""}
        />
        {type === "password" && (
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
        )}
      </div>
      <span className="h-1 text-xs text-destructive dark:text-orange-500">
        {error}&nbsp;
      </span>
    </>
  );
}
