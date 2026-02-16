"use client"
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

 export type ToastType = "success" | "error" | "info" | "warning";

interface ToastContentProps {
  type?: ToastType;
  title?: string;
  description?: string | React.ReactNode;
variant?: "default" | "destructive" | null;
}

const iconMap: Record<ToastType, JSX.Element> = {
  success: <CheckCircle className="w-5 h-5 font-semibold text-green-700" />,
  error: <XCircle className="w-5 h-5 font-semibold text-red-600" />,
  info: <Info className="w-5 h-5 font-semibold text-blue-600" />,
  warning: <AlertTriangle className="w-5 h-5 font-semibold text-yellow-600" />,
};

const borderClassMap: Record<ToastType, string> = {
  success: "border-l-4 border-l-green-500 text-black",
  error: "border-l-4 border-l-red-600 text-black",
  info: "border-l-4 border-l-blue-600 text-black",
  warning: "border-l-4 border-l-yellow-500 text-black",
};

const ToastContent = ({
  type = "info",
  title,
  description,
  variant = "default",
}: ToastContentProps) => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: (
        <div className="flex items-center gap-2 text-black">
          {iconMap[type]}
          {title}
        </div>
      ),
      description: description && (
        <div className="pl-5 text-center text-black">{description}</div>
      ),
      variant,
      duration: 5000,
      className: borderClassMap[type],
    });
  }, [toast, type, title, description, variant]);

  // This component renders nothing itself, just triggers toast
  return null;
};

export default ToastContent;
