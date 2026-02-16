import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { MdEdit } from "react-icons/md";

interface ConfigSectionProps {
  config: {
    fraudThreshold: string;
    targetUrl: string;
    targetBlockUrl: string;
    redirection: boolean;
  };
  editingField: string | null;
  editingValue: string | boolean;
  isLoading: boolean;
  isSaving: boolean;
  onStartEdit: (field: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string | boolean) => void;
}

export const ConfigSection = ({
  config,
  editingField,
  editingValue,
  isLoading,
  isSaving,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
}: ConfigSectionProps) => {
  const renderEditableField = (
    fieldKey: keyof typeof config,
    label: string,
    placeholder: string,
    type: "text" | "switch" = "text"
  ) => {
    if (!fieldKey || !config) return null;
    const isEditing = editingField === fieldKey;
    const value = config?.[fieldKey];

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <span className="text-subBody font-medium text-gray-700 sm:w-32 whitespace-nowrap dark:text-white">
            {label} :
          </span>
          {isEditing ? (
            type === "switch" ? (
              <div className="flex items-center gap-2">
                <span className="text-subBody font-medium text-gray-700">
                  {editingValue ? "True" : "False"}
                </span>
                <Switch
                  checked={(editingValue as boolean) || false}
                  onCheckedChange={onEditValueChange || (() => {})}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            ) : (
              <Input
                value={editingValue as string}
                onChange={(e) => onEditValueChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-subBody "
              />
            )
          ) : (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <>
                  <span className="text-subBody text-gray-900 break-all sm:break-words dark:text-gray-300">
                    {type === "switch"
                      ? value
                        ? "True"
                        : "False"
                      : value || `No ${label?.toLowerCase() || ""} configured`}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onStartEdit?.(fieldKey)}
                    disabled={isLoading || !onStartEdit}
                    className="p-1 h-6 w-6 hover:bg-gray-100 ml-1"
                    title={`Edit ${label || ""}`}
                  >
                    <MdEdit className="h-3 w-3 text-primary" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end sm:justify-start flex-shrink-0">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={onSaveEdit || (() => {})}
                className="text-xs"
                disabled={isSaving || !onSaveEdit}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit || (() => {})}
                className="text-xs"
                disabled={isSaving || !onCancelEdit}
              >
                Cancel
              </Button>
            </>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Row 1: Fraud Threshold + Target URL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
              {renderEditableField(
                "fraudThreshold",
                "Fraud Threshold",
                "Enter fraud threshold"
              )}
              {renderEditableField("targetUrl", "Target URL", "Enter target URL")}
            </div>

            {/* Row 2: Target Block URL + Redirection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderEditableField(
                "targetBlockUrl",
                "Target Block URL",
                "Enter target block URL"
              )}
              {renderEditableField("redirection", "Redirection", "", "switch")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

