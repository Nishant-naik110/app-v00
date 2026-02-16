"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { MappingFormState, ValidationErrors } from "../types";

interface MappingConfigurationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mappingForm: MappingFormState;
  setMappingForm: React.Dispatch<React.SetStateAction<MappingFormState>>;
  validationErrors: ValidationErrors;
  clearValidationErrors: (formType?: 'ruleForm' | 'mappingForm' | 'newKeyValues' | 'selectedCountries') => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const MappingConfigurationModal = ({
  isOpen,
  onOpenChange,
  mappingForm,
  setMappingForm,
  validationErrors,
  clearValidationErrors,
  isSaving,
  onSave,
  onCancel,
}: MappingConfigurationModalProps) => {
  const handleTargetChange = React.useCallback((value: string) => {
    if (!setMappingForm) return;
    setMappingForm((prev) => ({ ...prev, target: value || "" }));
    if (validationErrors?.mappingForm?.target && clearValidationErrors) {
      clearValidationErrors("mappingForm");
    }
  }, [setMappingForm, validationErrors?.mappingForm?.target, clearValidationErrors]);

  return (
    <Dialog
      open={isOpen || false}
      onOpenChange={(open) => {
        if (!open && onCancel) {
          onCancel();
        }
        if (onOpenChange) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-body font-semibold text-gray-900 dark:text-white">
            Edit Mapping Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="source" className="text-subBody font-semibold text-gray-700">
                Source
              </Label>
              <Input
                id="source"
                value={mappingForm?.source || ""}
                disabled={true}
                className="w-full mt-1 bg-gray-100 dark:bg-background"
              />
              {validationErrors?.mappingForm?.source && (
                <p className="text-subBody text-red-500 mt-1">
                  {validationErrors.mappingForm.source || ""}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="target" className="text-subBody font-semibold text-gray-700">
                Target
              </Label>
              <Input
                id="target"
                placeholder="Enter target value"
                value={mappingForm?.target || ""}
                onChange={(e) => handleTargetChange(e?.target?.value || "")}
                className="w-full mt-1"
              />
              {validationErrors?.mappingForm?.target && (
                <p className="text-subBody text-red-500 mt-1">
                  {validationErrors.mappingForm.target || ""}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            onClick={onCancel || (() => {})}
            className="text-white bg-primary hover:bg-primary rounded-md"
            disabled={isSaving || !onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave || (() => {})}
            className="text-white bg-primary hover:bg-primary rounded-md"
            disabled={isSaving || !onSave || !mappingForm?.target?.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
