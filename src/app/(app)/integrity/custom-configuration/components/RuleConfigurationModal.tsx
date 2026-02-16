"use client";

import React, { useMemo } from "react";
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
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import type {
  RuleFormState,
  ValidationErrors,
  ParameterCountryRow,
  ConfigurationBlock,
} from "../types";
import type { CountryOption } from "../../hooks/useCustomConfiguration";
import { COUNTRY_RULE_TYPE, REDIRECT_RULE_TYPE } from "../constants";

interface RuleConfigurationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ruleForm: RuleFormState;
  setRuleForm: React.Dispatch<React.SetStateAction<RuleFormState>>;
  validationErrors: ValidationErrors;
  clearValidationErrors: (formType?: 'ruleForm' | 'mappingForm' | 'newKeyValues' | 'selectedCountries') => void;
  ruleConfigPairs: { [key: string]: any };
  setRuleConfigPairs: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  whitelistConfigPairs: { [key: string]: any };
  setWhitelistConfigPairs: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  parameterCountryRows: ParameterCountryRow[];
  configurationBlocks: ConfigurationBlock[];
  showAddKeyMode: boolean;
  configParameters: string[];
  countries: CountryOption[];
  isLoadingCountries: boolean;
  editMode: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onDeleteWhitelistItem: (key: string) => void;
  onInitializeAddMode: () => void;
  onResetAddMode: () => void;
  onAddParameterCountryRow: () => void;
  onRemoveParameterCountryRow: (rowId: string) => void;
  onUpdateParameterCountryRow: (rowId: string, updates: Partial<ParameterCountryRow>) => void;
  onAddConfigurationBlock: () => void;
  onRemoveConfigurationBlock: (blockId: string) => void;
  onUpdateBlockParameters: (blockId: string, parameters: string[]) => void;
  onUpdateBlockValue: (blockId: string, parameter: string, value: string) => void;
  onUpdateWhitelistPair: (key: string, value: any) => void;
  onNormalizeCountrySelection: (selectedValues: string[], allCountries: CountryOption[]) => string[];
}

export const RuleConfigurationModal = ({
  isOpen,
  onOpenChange,
  ruleForm,
  setRuleForm,
  validationErrors,
  clearValidationErrors,
  ruleConfigPairs,
  setRuleConfigPairs,
  whitelistConfigPairs,
  setWhitelistConfigPairs,
  parameterCountryRows,
  configurationBlocks,
  showAddKeyMode,
  configParameters,
  countries,
  isLoadingCountries,
  editMode,
  isSaving,
  onSave,
  onCancel,
  onDeleteWhitelistItem,
  onInitializeAddMode,
  onResetAddMode,
  onAddParameterCountryRow,
  onRemoveParameterCountryRow,
  onUpdateParameterCountryRow,
  onAddConfigurationBlock,
  onRemoveConfigurationBlock,
  onUpdateBlockParameters,
  onUpdateBlockValue,
  onUpdateWhitelistPair,
  onNormalizeCountrySelection,
}: RuleConfigurationModalProps) => {
  // Convert whitelistConfigPairs back to array format for display
  const whitelistArray = useMemo(() => {
    if (!whitelistConfigPairs || typeof whitelistConfigPairs !== 'object') return [];
    const array: any[] = [];
    const groupedByIndex: { [index: string]: { [key: string]: any } } = {};

    Object.entries(whitelistConfigPairs || {}).forEach(([key, value]) => {
      if (!key) return;
      const keyParts = key.split('_');
      const lastPart = keyParts?.[keyParts.length - 1];
      const hasIndexSuffix = lastPart && !isNaN(parseInt(lastPart)) && keyParts.length > 1;

      if (hasIndexSuffix) {
        const originalKey = keyParts.slice(0, -1).join('_');
        const index = lastPart || "0";
        if (!groupedByIndex[index]) {
          groupedByIndex[index] = {};
        }
        groupedByIndex[index][originalKey] = value;
      } else {
        if (!groupedByIndex['0']) {
          groupedByIndex['0'] = {};
        }
        groupedByIndex['0'][key] = value;
      }
    });

    Object.keys(groupedByIndex).forEach((index) => {
      const indexNum = parseInt(index || "0");
      while (array.length <= indexNum) {
        array.push({});
      }
      array[indexNum] = groupedByIndex[index] || {};
    });

    return array;
  }, [whitelistConfigPairs]);

  const isSpecialRule = ruleForm?.ruleName === COUNTRY_RULE_TYPE || ruleForm?.ruleName === REDIRECT_RULE_TYPE;

  return (
    <Dialog open={isOpen || false} onOpenChange={onOpenChange || (() => {})}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-body font-semibold text-gray-900 dark:text-white">
            Edit Rule Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4">
            {/* Rule Name Field */}
            <div>
              <Label htmlFor="ruleName" className="text-subBody font-semibold text-gray-700">
                Rule Name
              </Label>
              <Input
                id="ruleName"
                placeholder="Enter Rule Name"
                value={ruleForm?.ruleName || ""}
                onChange={(e) => {
                  if (!setRuleForm) return;
                  setRuleForm((prev) => ({ ...prev, ruleName: e?.target?.value || "" }));
                  if (validationErrors?.ruleForm?.ruleName && clearValidationErrors) {
                    clearValidationErrors('ruleForm');
                  }
                }}
                className="w-full mt-1 bg-gray-100 dark:bg-background"
                disabled={editMode || !setRuleForm}
              />
              {validationErrors?.ruleForm?.ruleName && (
                <p className="text-subBody text-red-500 mt-1">
                  {validationErrors.ruleForm.ruleName || ""}
                </p>
              )}
            </div>

            {/* Status Field */}
            <div>
              <Label htmlFor="status" className="text-subBody font-semibold text-gray-700">
                Status
              </Label>
              <Select
                value={ruleForm?.status || ""}
                onValueChange={(value) => {
                  if (!setRuleForm) return;
                  setRuleForm((prev) => ({ ...prev, status: value || "" }));
                  if (validationErrors?.ruleForm?.status && clearValidationErrors) {
                    clearValidationErrors('ruleForm');
                  }
                }}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="True">True</SelectItem>
                  <SelectItem value="False">False</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors?.ruleForm?.status && (
                <p className="text-subBody text-red-500 mt-1">
                  {validationErrors.ruleForm.status || ""}
                </p>
              )}
            </div>

            {/* Whitelist Configuration Section */}
            <div>
              <Label className="text-subBody font-semibold text-gray-700">
                Whitelist Configuration
              </Label>
              <div className="mt-1 space-y-3 p-4 border border-gray-300 rounded-md bg-gray-50 dark:bg-background">
                {!whitelistArray?.length || whitelistArray.length === 0 ? (
                  <div className="text-subBody text-gray-500 italic">
                    No whitelist configuration found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {whitelistArray.map((item: any, index: number) => (
                      item && Object.keys(item || {}).length > 0 && (
                        <div key={index} className="border border-gray-200 rounded-md p-3 bg-white">
                          <div className="space-y-2">
                            {Object.entries(item || {}).map(([key, value]) => (
                              <div key={key || ""} className="flex items-center gap-3">
                                <Label className="text-subBody font-medium text-gray-700 w-32 shrink-0">
                                  {key || ""} :
                                </Label>
                                {key === 'country' ? (
                                  <div className="flex-1">
                                    {isLoadingCountries ? (
                                      <div className="flex items-center gap-2 text-subBody text-gray-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading countries...
                                      </div>
                                    ) : countries?.length && countries.length > 0 ? (
                                      <MultiSelect
                                        options={countries.map((country) => ({
                                          label: country?.label || "",
                                          value: country?.value || "",
                                        }))}
                                        onValueChange={(selectedValues) => {
                                          if (!onNormalizeCountrySelection || !onUpdateWhitelistPair) return;
                                          const countriesToStore = onNormalizeCountrySelection(
                                            selectedValues || [],
                                            countries || []
                                          );
                                          const keyWithIndex = whitelistArray.length > 1 ? `${key}_${index}` : key;
                                          onUpdateWhitelistPair(keyWithIndex, countriesToStore);
                                        }}
                                        defaultValue={
                                          Array.isArray(value)
                                            ? value.includes("all")
                                              ? countries?.map((country) => country?.value || "").filter(Boolean) || []
                                              : value || []
                                            : [String(value || "")]
                                        }
                                        placeholder="Select countries"
                                      />
                                    ) : (
                                      <div className="text-subBody text-gray-500">
                                        No countries available
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Input
                                    value={String(value || "")}
                                    onChange={(e) => {
                                      if (!onUpdateWhitelistPair) return;
                                      const keyWithIndex = whitelistArray.length > 1 ? `${key}_${index}` : key;
                                      onUpdateWhitelistPair(keyWithIndex, e?.target?.value || "");
                                    }}
                                    placeholder={`Enter ${key || ""}`}
                                    className="flex-1 h-9"
                                  />
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (!onDeleteWhitelistItem) return;
                                    const keyWithIndex = whitelistArray.length > 1 ? `${key}_${index}` : key;
                                    onDeleteWhitelistItem(keyWithIndex);
                                  }}
                                  disabled={!onDeleteWhitelistItem}
                                >
                                  <Trash2 className="h-4 w-4 text-primary" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Add New Configuration Button */}
                {!showAddKeyMode ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onInitializeAddMode || (() => {})}
                    className="w-full h-9"
                    disabled={!onInitializeAddMode}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Configuration
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-subBody font-semibold text-gray-700">
                          Configuration Parameter
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={onResetAddMode || (() => {})}
                          className="h-8 w-8 p-0"
                          disabled={!onResetAddMode}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {isSpecialRule ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-end">
                              <Button
                                onClick={onAddParameterCountryRow || (() => {})}
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                disabled={!onAddParameterCountryRow}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {parameterCountryRows?.map((row) => (
                              <div key={row?.id || Math.random()} className="border border-gray-300 rounded-md p-3 bg-white">
                                <div className="flex items-center justify-end mb-3">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onRemoveParameterCountryRow?.(row?.id || "")}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={!onRemoveParameterCountryRow || !row?.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-3">
                                  {/* Parameter Field */}
                                  <div className="flex items-center gap-3">
                                    <Label className="text-subBody font-medium text-gray-700 w-32 shrink-0">
                                      Parameter :
                                    </Label>
                                    <div className="flex-1">
                                      <MFSingleSelect
                                        items={configParameters?.map((key) => ({
                                          title: key || "",
                                          value: key || "",
                                        })) || []}
                                        onValueChange={(value) => {
                                          if (!onUpdateParameterCountryRow || !row?.id) return;
                                          onUpdateParameterCountryRow(row.id, { parameter: value || "" });
                                          if (validationErrors?.newKeyValues?.[`${row.id}_parameter`] && clearValidationErrors) {
                                            clearValidationErrors('newKeyValues');
                                          }
                                        }}
                                        value={row?.parameter || ""}
                                        placeholder="Select Parameter"
                                        className="flex-1"
                                      />
                                    </div>
                                  </div>
                                  {validationErrors?.newKeyValues?.[`${row?.id || ""}_parameter`] && (
                                    <p className="text-subBody text-red-500 mt-1">
                                      {validationErrors.newKeyValues[`${row?.id || ""}_parameter`] || ""}
                                    </p>
                                  )}

                                  {/* Value Field */}
                                  <div className="flex items-center gap-3">
                                    <Label className="text-subBody font-medium text-gray-700 w-32 shrink-0">
                                      Value :
                                    </Label>
                                    <div className="flex-1">
                                      <Input
                                        value={row?.value || ""}
                                        onChange={(e) => {
                                          if (!onUpdateParameterCountryRow || !row?.id) return;
                                          onUpdateParameterCountryRow(row.id, { value: e?.target?.value || "" });
                                          if (validationErrors?.newKeyValues?.[`${row.id}_value`] && clearValidationErrors) {
                                            clearValidationErrors('newKeyValues');
                                          }
                                        }}
                                        placeholder={`Enter ${row?.parameter || 'parameter'} value`}
                                        className="h-9"
                                      />
                                    </div>
                                  </div>
                                  {validationErrors?.newKeyValues?.[`${row?.id || ""}_value`] && (
                                    <p className="text-subBody text-red-500 mt-1">
                                      {validationErrors.newKeyValues[`${row?.id || ""}_value`] || ""}
                                    </p>
                                  )}

                                  {/* Countries Field (for COUNTRY_RULE_TYPE) */}
                                  {ruleForm?.ruleName === COUNTRY_RULE_TYPE && (
                                    <>
                                      <div className="flex items-center gap-3">
                                        <Label className="text-subBody font-medium text-gray-700 w-32 shrink-0">
                                          Countries :
                                        </Label>
                                        <div className="flex-1">
                                          {isLoadingCountries ? (
                                            <div className="flex items-center gap-2 text-subBody text-gray-500">
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                              Loading countries...
                                            </div>
                                          ) : countries?.length && countries.length > 0 ? (
                                            <MultiSelect
                                              options={countries.map((country) => ({
                                                label: country?.label || "",
                                                value: country?.value || "",
                                              }))}
                                              onValueChange={(value) => {
                                                if (!onNormalizeCountrySelection || !onUpdateParameterCountryRow || !row?.id) return;
                                                const countriesToStore = onNormalizeCountrySelection(value || [], countries || []);
                                                onUpdateParameterCountryRow(row.id, { countries: countriesToStore || [] });
                                                if (validationErrors?.newKeyValues?.[`${row.id}_countries`] && clearValidationErrors) {
                                                  clearValidationErrors('newKeyValues');
                                                }
                                              }}
                                              defaultValue={
                                                Array.isArray(row?.countries)
                                                  ? row.countries.includes("all")
                                                    ? countries?.map((country) => country?.value || "").filter(Boolean) || []
                                                    : row.countries || []
                                                  : row?.countries || []
                                              }
                                              placeholder="Select countries"
                                            />
                                          ) : (
                                            <div className="text-subBody text-gray-500">
                                              No countries available
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {validationErrors?.newKeyValues?.[`${row?.id || ""}_countries`] && (
                                        <p className="text-subBody text-red-500 mt-1">
                                          {validationErrors.newKeyValues[`${row?.id || ""}_countries`] || ""}
                                        </p>
                                      )}
                                    </>
                                  )}

                                  {/* Threshold Field (for REDIRECT_RULE_TYPE) */}
                                  {ruleForm?.ruleName === REDIRECT_RULE_TYPE && (
                                    <>
                                      <div className="flex items-center gap-3">
                                        <Label className="text-subBody font-medium text-gray-700 w-32 shrink-0">
                                          Threshold :
                                        </Label>
                                        <div className="flex-1">
                                          <Input
                                            value={row?.threshold || ""}
                                            onChange={(e) => {
                                              if (!onUpdateParameterCountryRow || !row?.id) return;
                                              onUpdateParameterCountryRow(row.id, { threshold: e?.target?.value || "" });
                                              if (validationErrors?.newKeyValues?.[`${row.id}_threshold`] && clearValidationErrors) {
                                                clearValidationErrors('newKeyValues');
                                              }
                                            }}
                                            placeholder="Enter threshold value"
                                            className="h-9"
                                          />
                                        </div>
                                      </div>
                                      {validationErrors?.newKeyValues?.[`${row?.id || ""}_threshold`] && (
                                        <p className="text-subBody text-red-500 mt-1">
                                          {validationErrors.newKeyValues[`${row?.id || ""}_threshold`] || ""}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-end">
                              <Button
                                onClick={onAddConfigurationBlock || (() => {})}
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                disabled={!onAddConfigurationBlock}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {validationErrors?.newKeyValues?.['general'] && (
                              <p className="text-subBody text-red-500 mt-1">
                                {validationErrors.newKeyValues['general'] || ""}
                              </p>
                            )}

                            {configurationBlocks?.map((block) => (
                              <div key={block?.id || Math.random()} className="border border-gray-300 rounded-md p-3 bg-white">
                                <div className="flex items-center justify-end mb-3">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onRemoveConfigurationBlock?.(block?.id || "")}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={!onRemoveConfigurationBlock || !block?.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <Label className="text-subBody font-medium text-gray-700 w-32 shrink-0">
                                      Parameters :
                                    </Label>
                                    <div className="flex-1">
                                      <MultiSelect
                                        options={configParameters?.map((key) => ({
                                          label: key || "",
                                          value: key || "",
                                        })) || []}
                                        onValueChange={(selectedValues) => {
                                          if (!onUpdateBlockParameters || !block?.id) return;
                                          onUpdateBlockParameters(block.id, selectedValues || []);
                                          if (validationErrors?.newKeyValues?.[block.id] && clearValidationErrors) {
                                            clearValidationErrors('newKeyValues');
                                          }
                                        }}
                                        defaultValue={block?.parameters || []}
                                        placeholder="Select Parameters"
                                      />
                                    </div>
                                  </div>

                                  {validationErrors?.newKeyValues?.[block?.id || ""] && (
                                    <p className="text-subBody text-red-500 mt-1">
                                      {validationErrors.newKeyValues[block?.id || ""] || ""}
                                    </p>
                                  )}

                                  {block?.parameters?.length && block.parameters.length > 0 && (
                                    <div className="space-y-3">
                                      {block.parameters.map((param) => (
                                        <div key={param} className="flex items-center gap-3">
                                          <Label className="text-subBody font-medium text-gray-700 w-32 shrink-0">
                                            {param} :
                                          </Label>
                                          <div className="flex-1">
                                            <Input
                                              value={block?.values?.[param] || ""}
                                              onChange={(e) => {
                                                if (!onUpdateBlockValue || !block?.id || !param) return;
                                                onUpdateBlockValue(block.id, param, e?.target?.value || "");
                                                if (validationErrors?.newKeyValues?.[`${block.id}_${param}`] && clearValidationErrors) {
                                                  clearValidationErrors('newKeyValues');
                                                }
                                              }}
                                              placeholder={`Enter ${param || ""} value`}
                                              className="h-9"
                                            />
                                          </div>
                                          {validationErrors?.newKeyValues?.[`${block?.id || ""}_${param || ""}`] && (
                                            <p className="text-subBody text-red-500 mt-1">
                                              {validationErrors.newKeyValues[`${block?.id || ""}_${param || ""}`] || ""}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rule Configuration Section */}
            <div>
              <Label className="text-subBody font-semibold text-gray-700">
                Rule Configuration
              </Label>
              <div className="mt-1 space-y-3 p-4 border border-gray-300 rounded-md bg-gray-50 w-[100%] dark:bg-background">
                {!ruleConfigPairs || Object.keys(ruleConfigPairs || {}).length === 0 ? (
                  <div className="text-subBody text-gray-500 italic">
                    No configuration found
                  </div>
                ) : (
                  Object.entries(ruleConfigPairs || {}).map(([key, value]) => (
                    <div key={key || ""} className="flex items-center justify-between gap-3 w-[100%]">
                      <Label className="text-subBody font-medium text-gray-700 w-[55%] shrink-0 dark:text-white">
                        {key || ""} :
                      </Label>
                      <Input
                        value={String(value || "")}
                        onChange={(e) => {
                          if (!setRuleConfigPairs || !key) return;
                          setRuleConfigPairs((prev) => ({
                            ...prev,
                            [key]: e?.target?.value || "",
                          }));
                        }}
                        placeholder={`Enter ${key || ""}`}
                        className="flex-1 h-9 w-[45%]"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 flex-shrink-0">
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
            disabled={isSaving || !onSave || (editMode ? false : !ruleForm?.ruleName?.trim())}
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
