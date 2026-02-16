import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ViewRuleModalProps {
  isOpen: boolean;
  viewingRule: any;
  onClose: () => void;
}

export const ViewRuleModal = ({
  isOpen,
  viewingRule,
  onClose,
}: ViewRuleModalProps) => {
  const renderWhitelistConfig = () => {
    try {
      const parsedConfig = JSON.parse(
        viewingRule.whitelistConfiguration || "[]"
      );

      if (Array.isArray(parsedConfig)) {
        if ( parsedConfig?.length === 0) {
          return (
            <div className="text-subBody text-gray-500 italic">
              No whitelist configuration found
            </div>
          );
        }

        return (
          <div className="space-y-3">
            {parsedConfig?.map((item: any, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-3 bg-white"
              >
                {typeof item === "object" && item !== null ? (
                  <div className="space-y-2">
                    {Object.entries(item || {}).map(([key, value]) => (
                      <div key={key || ""} className="flex items-center gap-3">
                        <span className="text-subBody font-medium text-gray-700 min-w-[120px]">
                          {key || ""} :
                        </span>
                        <span className="text-subBody text-gray-900 flex-1">
                          {key === "country" && Array.isArray(value)
                            ? (value as string[])?.join(", ") || ""
                            : String(value || "")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-subBody font-medium text-gray-700 min-w-[120px]">
                      Value :
                    </span>
                    <span className="text-subBody text-gray-900 flex-1">
                      {String(item || "")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      } else if (typeof parsedConfig === "object" && parsedConfig !== null) {
        return (
          <div className="space-y-2">
            {Object.entries(parsedConfig || {}).map(([key, value]) => (
              <div key={key || ""} className="flex items-center gap-3">
                <span className="text-subBody font-medium text-gray-700 min-w-[120px]">
                  {key || ""} :
                </span>
                <span className="text-subBody text-gray-900 flex-1">
                  {key === "country" && Array.isArray(value)
                    ? (value as string[])?.join(", ") || ""
                    : String(value || "")}
                </span>
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div className="text-subBody text-gray-500 italic">
            No whitelist configuration found
          </div>
        );
      }
    } catch (error) {
      return (
        <div className="text-subBody text-red-500">
          Error parsing whitelist configuration
        </div>
      );
    }
  };

  const renderRuleConfig = () => {
    try {
      const parsedConfig = JSON.parse(
        viewingRule.ruleConfiguration || "{}"
      );
      return !parsedConfig || Object.keys(parsedConfig || {}).length === 0 ? (
        <div className="text-subBody text-gray-500 italic dark:text-white">
          No configuration found
        </div>
      ) : (
        <div className="space-y-2 ">
          {Object.entries(parsedConfig || {}).map(([key, value]) => (
            <div key={key || ""} className="flex items-center gap-3">
              <span className="text-subBody font-medium text-gray-700 min-w-[120px]">
                {key || ""} :
              </span>
              <span className="text-subBody text-gray-900 flex-1">
                {String(value || "")}
              </span>
            </div>
          ))}
        </div>
      );
    } catch (error) {
      return (
        <div className="text-subBody text-red-500">Error parsing configuration</div>
      );
    }
  };

  return (
    <Dialog open={isOpen || false} onOpenChange={onClose || (() => {})}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-body font-semibold text-gray-900 dark:text-white">
            View Rule Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          {viewingRule && (
            <div className="grid grid-cols-1 gap-4 ">
              <div>
                <Label className="text-subBody font-semibold text-gray-700 dark:text-white">
                  Rule Name
                </Label>
                <div className="p-2 bg-gray-50 rounded border mt-1 dark:bg-background dark:text-white">
                  {viewingRule?.ruleName || ""}
                </div>
              </div>

              <div>
                <Label className="text-subBody font-semibold text-gray-700 dark:text-white">
                  Status
                </Label>
                <div className="p-2 bg-gray-50 rounded border mt-1 dark:bg-background dark:text-white">
                  {viewingRule?.status || ""}
                </div>
              </div>

              <div>
                <Label className="text-subBody font-semibold text-gray-700 dark:text-white">
                  Whitelist Configuration
                </Label>
                <div className="p-3 bg-gray-50 rounded border mt-1 max-h-[200px] overflow-y-auto dark:bg-background dark:text-white">
                  {renderWhitelistConfig()}
                </div>
              </div>

              <div>
                <Label className="text-subBody font-semibold text-gray-700 dark:text-white">
                  Rule Configuration
                </Label>
                <div className="p-3 bg-gray-50 rounded border mt-1 max-h-[200px] overflow-y-auto">
                  {renderRuleConfig()}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            onClick={onClose || (() => {})}
            size="sm"
            disabled={!onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
