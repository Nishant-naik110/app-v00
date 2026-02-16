'use client';
import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const passwordRules = [
  { label: "At least 8 characters", regex: /^.{8,}$/ },
  { label: "At least one lowercase letter", regex: /[a-z]/ },
  { label: "At least one uppercase letter", regex: /[A-Z]/ },
  { label: "At least one number", regex: /[0-9]/ },
  { label: "At least one special character", regex: /[^a-zA-Z0-9]/ },
];

const PasswordInput: React.FC<{
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}> = ({ id, value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
    <div className="relative w-full max-w-sm">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded px-3 py-2 pr-10 ${
          // red border if any rule is not met and user typed something
          value && !passwordRules.every(rule => rule.regex.test(value))
            ? "border-red-500"
            : "border-gray-300"
        }`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-2 flex items-center text-gray-500"
        tabIndex={-1}
      >
        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
</div>
<div>
      {/* Password rules list */}
      {value && !passwordRules.every(rule => rule.regex.test(value)) && (
  <ul className="mt-2 text-subBody space-y-1">
    {passwordRules.map((rule) => {
      const isValid = rule.regex.test(value);
      return (
        <li
          key={rule.label}
          className={`flex items-center ${
            isValid ? "text-green-600" : "text-red-600"
          }`}
        >
          {isValid ? (
            <CheckCircle size={15} className="mr-1" />
          ) : (
            <XCircle size={15} className="mr-1" />
          )}
          {rule.label}
        </li>
      );
    })}
  </ul>
)}

    </div>
    </>
  );
};

export default PasswordInput;
