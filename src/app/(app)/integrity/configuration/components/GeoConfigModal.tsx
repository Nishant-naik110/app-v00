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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import MultipleSelect from "@/components/ui/multiple-select";

interface GeoFormRow {
  parameter: string;
  value: string;
  selectGeo: string[];
}

interface GeoConfigModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  rows: GeoFormRow[];
  configParameters: string[];
  countries: string[];
  isLoadingParameters: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onUpdateRow: (index: number, field: string, value: string | string[]) => void;
}

export const GeoConfigModal = ({
  isOpen,
  isEditMode,
  rows,
  configParameters,
  countries,
  isLoadingParameters,
  isSaving,
  onClose,
  onSave,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
}: GeoConfigModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-subBody font-semibold text-gray-900 dark:text-white">
            {isEditMode ? "Edit GEO Configuration" : "GEO Configuration"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {!isEditMode && (
              <div className="flex justify-end items-center">
                <Button
                  type="button"
                  onClick={onAddRow || (() => {})}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={!onAddRow}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {rows?.map((row, index) => (
              <div
                key={index}
                className="flex items-end gap-3 p-3 border rounded-lg mb-4"
              >
                <div className="flex-1">
                  <Label
                    htmlFor={`parameter-${index}`}
                    className="text-subBody font-medium text-gray-700 mb-1 block"
                  >
                    Parameter
                  </Label>
                  <Select
                    value={row?.parameter || ""}
                    onValueChange={(value) =>
                      onUpdateRow?.(index, "parameter", value || "")
                    }
                    disabled={isLoadingParameters || isEditMode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isLoadingParameters ? "Loading..." : "Select..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {configParameters?.length && configParameters.length > 0 ? (
                        configParameters.map((parameter) => (
                          <SelectItem key={parameter || ""} value={parameter || ""}>
                            {parameter || ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-parameters" disabled>
                          No parameters available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label
                    htmlFor={`geoValue-${index}`}
                    className="text-subBody font-medium text-gray-700 mb-1 block"
                  >
                    Value (Optional)
                  </Label>
                  <Input
                    id={`geoValue-${index}`}
                    placeholder="Enter Value"
                    value={row?.value || ""}
                    onChange={(e) =>
                      onUpdateRow?.(index, "value", e?.target?.value || "")
                    }
                    className="w-full"
                  />
                </div>

                <div className="flex-1">
                  <Label
                    htmlFor={`selectGeo-${index}`}
                    className="text-subBody font-medium text-gray-700 mb-1 block"
                  >
                    Select GEO
                  </Label>
                  <MultipleSelect
                    options={countries || []}
                    selectedValues={row?.selectGeo || []}
                    onSelectionChange={(selectedValues) =>
                      onUpdateRow?.(index, "selectGeo", selectedValues || [])
                    }
                    placeholder="Select Country"
                    searchable={true}
                    searchPlaceholder="Search countries..."
                  />
                </div>

                {rows?.length && rows.length > 1 && !isEditMode && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => onRemoveRow?.(index)}
                      size="sm"
                      variant="outline"
                      disabled={!onRemoveRow}
                    >
                      <Trash2 className="h-3 w-3 text-primary" />
                    </Button>
                  </div>
                )}
              </div>
            )) || []}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row gap-2 dark:bg-background">
          <Button
            onClick={onClose || (() => {})}
            className="w-full sm:w-auto order-2 sm:order-1 rounded-md"
            disabled={!onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave || (() => {})}
            className="w-full sm:w-auto order-1 sm:order-2 rounded-md"
            disabled={isSaving || !onSave}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              isEditMode ? "Update" : "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
