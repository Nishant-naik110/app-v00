import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { FRAUD_TOLERANCE_OPTIONS } from "../constants";

interface ThresholdConfigSectionProps {
  frequencyCapping: string;
  fraudTolerance: string;
  isBlocked: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onFrequencyChange: (value: string) => void;
  onToleranceChange: (value: string) => void;
  onBlockedChange: (value: boolean) => void;
  onSave: () => void;
}

export const ThresholdConfigSection = ({
  frequencyCapping,
  fraudTolerance,
  isBlocked,
  isLoading,
  isSaving,
  onFrequencyChange,
  onToleranceChange,
  onBlockedChange,
  onSave,
}: ThresholdConfigSectionProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-center">
          <div className="sm:col-span-1">
            <label className="block text-subBody font-medium text-gray-700 mb-2 dark:text-white">
              Frequency Capping (in days)
            </label>
            <Input
              value={frequencyCapping || ""}
              onChange={(e) => onFrequencyChange?.(e?.target?.value || "")}
              placeholder="Enter frequency capping"
              className="w-full text-subBody"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-subBody font-medium text-gray-700 mb-2 dark:text-white">
              Fraud Tolerance
            </label>
            <Select value={fraudTolerance || ""} onValueChange={onToleranceChange || (() => {})}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select fraud tolerance" />
              </SelectTrigger>
              <SelectContent>
                {FRAUD_TOLERANCE_OPTIONS?.map((option) => (
                  <SelectItem key={option?.value || ""} value={option?.value || ""}>
                    {option?.label || ""}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 flex flex-row items-start sm:items-center lg:items-start justify-between gap-1 mt-4">
            <div className="flex items-center gap-4 w-full sm:w-auto mt-2">
              <span className="text-subBody font-medium text-gray-700 dark:text-white">
                Blocked
              </span>
              <Switch
                checked={isBlocked || false}
                onCheckedChange={onBlockedChange || (() => {})}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <Button
              onClick={onSave || (() => {})}
              className="w-full sm:w-auto dark:text-white rounded-md"
              size="sm"
              disabled={isSaving || !onSave}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
