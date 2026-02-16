"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import ResizableTable from "@/components/mf/ReportingToolTable";
import { usePackage } from "@/components/mf/PackageContext";
import {
  useGetCustomConfig,
  useGetConfigSummary,
  useGetConfigParameters,
  useGetMappingConfig,
  useGetCountries,
  editCustomConfigApi,
  editCustomConfigRuleApi,
  updateMappingConfigApi,
} from "../hooks/useCustomConfiguration";
import { ConfigSection } from "./components/ConfigSection";
import { ViewRuleModal } from "./components/ViewRuleModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { RuleConfigurationModal } from "./components/RuleConfigurationModal";
import { MappingConfigurationModal } from "./components/MappingConfigurationModal";
import {
  CONFIG_RULES_COLUMNS,
  MAPPING_RULES_COLUMNS,
  DEFAULT_PAGE_SIZE,
  SEARCH_DEBOUNCE_DELAY,
  COUNTRY_RULE_TYPE,
  REDIRECT_RULE_TYPE,
} from "./constants";
import { useFormState } from "./hooks/useFormState";
import { useConfigurationBlocks } from "./hooks/useConfigurationBlocks";
import { useModalState } from "./hooks/useModalState";
import { useRuleEditor } from "./hooks/useRuleEditor";
import {
  transformConfigRulesData,
  transformMappingRulesData,
  convertWhitelistPairsToArray,
  normalizeCountrySelection,
} from "./utils/dataTransformers";
import type {
  ConfigRuleItem,
  MappingRuleItem,
  DeleteConfirmationState,
} from "./types";

const CustomConfiguration = () => {
  const { selectedPackage } = usePackage();

  // ==================== State Management ====================
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string | boolean>("");
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [isSavingMapping, setIsSavingMapping] = useState(false);
  const [editingMappingId, setEditingMappingId] = useState<number | null>(null);
  const [viewingRule, setViewingRule] = useState<ConfigRuleItem | null>(null);
  const [configRulesData, setConfigRulesData] = useState<ConfigRuleItem[]>([]);
  const [mappingRulesData, setMappingRulesData] = useState<MappingRuleItem[]>(
    []
  );
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmationState>({
      isOpen: false,
      type: "whitelist",
      key: "",
      onConfirm: () => {},
    });

  // ==================== Custom Hooks ====================
  const {
    config,
    ruleForm,
    mappingForm,
    validationErrors,
    setConfig,
    setRuleForm,
    setMappingForm,
    setValidationErrors,
    resetRuleForm,
    resetMappingForm,
    validateRule,
    validateMapping,
    validateNewKeys,
    clearValidationErrors,
  } = useFormState();

  const {
    parameterCountryRows,
    configurationBlocks,
    showAddKeyMode,
    setParameterCountryRows,
    setConfigurationBlocks,
    setShowAddKeyMode,
    addConfigurationBlock,
    removeConfigurationBlock,
    updateBlockParameters,
    updateBlockValue,
    addParameterCountryRow,
    removeParameterCountryRow,
    updateParameterCountryRow,
    initializeAddMode,
    resetAll: resetConfigurationBlocks,
  } = useConfigurationBlocks();

  const {
    isRuleModalOpen,
    isViewModalOpen,
    isMappingModalOpen,
    setIsRuleModalOpen,
    setIsViewModalOpen,
    setIsMappingModalOpen,
    openRuleModal,
    closeRuleModal,
    openViewModal,
    closeViewModal,
    openMappingModal,
    closeMappingModal,
  } = useModalState();

  const {
    editMode,
    editingRuleId,
    ruleConfigPairs,
    whitelistConfigPairs,
    selectedCountries,
    setRuleConfigPairs,
    setWhitelistConfigPairs,
    setSelectedCountries,
    initializeEdit,
    resetEdit,
    updateWhitelistPair,
    deleteWhitelistItem,
  } = useRuleEditor();

  // ==================== API Hooks ====================
  const { data: customConfigData, isLoading: isLoadingCustomConfig } =
    useGetCustomConfig(selectedPackage, !!selectedPackage);

  const { data: configParametersData } = useGetConfigParameters(
    selectedPackage,
    !!selectedPackage
  );

  const { data: mappingConfigData, refetch: refetchMappingConfig } =
    useGetMappingConfig(selectedPackage, !!selectedPackage);

  const { data: countriesData, isLoading: isLoadingCountries } =
    useGetCountries(selectedPackage, !!selectedPackage);

  const [configSummaryPayload, setConfigSummaryPayload] = useState<any>(null);
  const { data: configSummaryData, isLoading: isLoadingConfigSummary } =
    useGetConfigSummary(configSummaryPayload, !!configSummaryPayload);

  // ==================== Derived State ====================
  const configParameters = useMemo(
    () => configParametersData || [],
    [configParametersData]
  );

  const countries = useMemo(() => countriesData || [], [countriesData]);

  // ==================== Effects ====================
  // Update config when API data is fetched
  useEffect(() => {
    if (customConfigData) {
      setConfig({
        fraudThreshold: customConfigData?.fraud_threshold?.toString() || "",
        targetUrl: customConfigData?.target_url || "",
        targetBlockUrl: customConfigData?.target_blocked_url || "",
        redirection: customConfigData?.redirection_status || false,
      });
      setApiError(null);
    }
  }, [customConfigData, setConfig]);

  // Update config rules data when fetched
  useEffect(() => {
    if (configSummaryData) {
      const transformedData = transformConfigRulesData(configSummaryData?.data);
      setConfigRulesData(transformedData || []);
      setTotalPages(configSummaryData?.total_pages || 1);
    }
  }, [configSummaryData]);

  // Update mapping rules data when fetched
  useEffect(() => {
    if (mappingConfigData) {
      const transformedData = transformMappingRulesData(mappingConfigData);
      setMappingRulesData(transformedData || []);
    }
  }, [mappingConfigData]);

  // Trigger config summary when pagination or search changes
  useEffect(() => {
    if (selectedPackage) {
      setConfigSummaryPayload({
        package_name: selectedPackage,
        page_number: currentPage || 1,
        record_limit: limit || DEFAULT_PAGE_SIZE,
        search_term: debouncedSearchTerm || "",
      });
    } else {
      setConfigSummaryPayload(null);
    }
  }, [selectedPackage, currentPage, limit, debouncedSearchTerm]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when search terms change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset mapping form when modal closes
  useEffect(() => {
    if (!isMappingModalOpen) {
      resetMappingForm();
      setEditingMappingId(null);
      clearValidationErrors("mappingForm");
      setApiError(null);
    }
  }, [isMappingModalOpen, resetMappingForm, clearValidationErrors]);

  // ==================== Configuration Handlers ====================
  const handleStartEdit = useCallback(
    (field: string) => {
      if (!field) return;
      setEditingField(field);
      setEditingValue(config?.[field as keyof typeof config] || "");
      setApiError(null);
    },
    [config]
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editingField || !selectedPackage) return;

    const updatedConfig = {
      ...config,
      [editingField]: editingValue,
    };

    const payload = {
      package_name: selectedPackage,
      config_type: "rule_config",
      update_data: {
        fraud_threshold: parseInt(updatedConfig?.fraudThreshold || "0") || 0,
        target_url: updatedConfig?.targetUrl || "",
        target_blocked_url: updatedConfig?.targetBlockUrl || "",
        redirection_status: updatedConfig?.redirection || false,
      },
    };

    setIsSavingConfig(true);
    try {
      await editCustomConfigApi(payload);
      setConfig(updatedConfig);
      setEditingField(null);
      setEditingValue("");
      setApiError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update configuration";
      setApiError(errorMessage);
    } finally {
      setIsSavingConfig(false);
    }
  }, [editingField, editingValue, config, selectedPackage, setConfig]);

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditingValue("");
  }, []);

  // ==================== Rule Handlers ====================
  const handleEditRule = useCallback(
    (item: Record<string, string | number>) => {
      if (!item) return;
      setApiError(null);

      setRuleForm({
        ruleName: (item?.ruleName as string) || "",
        status: (item?.status as string) || "",
        whitelistConfiguration: (item?.whitelistConfiguration as string) || "",
        ruleConfiguration: (item?.ruleConfiguration as string) || "",
      });

      setParameterCountryRows([]);
      setConfigurationBlocks([]);

      const ruleItem: ConfigRuleItem = {
        id: Number(item?.id) || 0,
        ruleName: (item?.ruleName as string) || "",
        status: (item?.status as string) || "",
        whitelistConfiguration: (item?.whitelistConfiguration as string) || "",
        ruleConfiguration: (item?.ruleConfiguration as string) || "",
      };

      if (initializeEdit) {
        initializeEdit(ruleItem);
      }
      if (openRuleModal) {
        openRuleModal();
      }
    },
    [
      setRuleForm,
      setParameterCountryRows,
      setConfigurationBlocks,
      initializeEdit,
      openRuleModal,
    ]
  );

  const handleViewRule = useCallback(
    (item: Record<string, string | number>) => {
      if (!item) return;
      const ruleItem: ConfigRuleItem = {
        id: Number(item?.id) || 0,
        ruleName: (item?.ruleName as string) || "",
        status: (item?.status as string) || "",
        whitelistConfiguration: (item?.whitelistConfiguration as string) || "",
        ruleConfiguration: (item?.ruleConfiguration as string) || "",
      };
      setViewingRule(ruleItem);
      if (openViewModal) {
        openViewModal();
      }
    },
    [openViewModal]
  );

  const handleSaveRule = useCallback(async () => {
    clearValidationErrors("ruleForm");
    clearValidationErrors("newKeyValues");

    const isRuleFormValid = validateRule();
    const isNewKeyValuesValid = showAddKeyMode
      ? validateNewKeys(
          parameterCountryRows,
          configurationBlocks,
          showAddKeyMode,
          editMode
        )
      : true;

    if (
      !isRuleFormValid ||
      !isNewKeyValuesValid ||
      !editMode ||
      !editingRuleId
    ) {
      return;
    }

    const whitelistArray = convertWhitelistPairsToArray(
      whitelistConfigPairs,
      parameterCountryRows,
      configurationBlocks,
      ruleForm.ruleName,
      showAddKeyMode,
      COUNTRY_RULE_TYPE,
      REDIRECT_RULE_TYPE
    );

    const hasExistingItems = Object.keys(whitelistConfigPairs || {}).length > 0;
    const hasNewItems =
      showAddKeyMode &&
      (ruleForm?.ruleName === COUNTRY_RULE_TYPE ||
      ruleForm?.ruleName === REDIRECT_RULE_TYPE
        ? parameterCountryRows?.some(
            (row) =>
              row?.value?.trim() &&
              (ruleForm?.ruleName === COUNTRY_RULE_TYPE
                ? row?.countries?.length && row.countries.length > 0
                : true)
          )
        : configurationBlocks?.some((block) => block?.parameters?.length && block.parameters.length > 0));

    const filteredWhitelistArray =
      !hasExistingItems && !hasNewItems
        ? []
        : whitelistArray.filter((item) => Object.keys(item).length > 0);

    const payload = {
      package_name: selectedPackage,
      rule_name: ruleForm?.ruleName || "",
      update_data: {
        status: ruleForm?.status === "True",
        whitelist_configuration: filteredWhitelistArray || [],
        rule_configuration: ruleConfigPairs || {},
      },
    };

    setIsSavingRule(true);
    try {
      await editCustomConfigRuleApi(payload);

      closeRuleModal();
      clearValidationErrors();
      resetRuleForm();
      setRuleConfigPairs({});
      setWhitelistConfigPairs({});
      resetConfigurationBlocks();
      resetEdit();
      setApiError(null);

      if (selectedPackage) {
        setConfigSummaryPayload({
          package_name: selectedPackage,
          page_number: currentPage || 1,
          record_limit: limit || DEFAULT_PAGE_SIZE,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update rule configuration";
      setApiError(errorMessage);
    } finally {
      setIsSavingRule(false);
    }
  }, [
    ruleForm,
    editMode,
    editingRuleId,
    showAddKeyMode,
    parameterCountryRows,
    configurationBlocks,
    whitelistConfigPairs,
    ruleConfigPairs,
    selectedPackage,
    currentPage,
    limit,
    validateRule,
    validateNewKeys,
    clearValidationErrors,
    resetRuleForm,
    resetConfigurationBlocks,
    resetEdit,
    closeRuleModal,
    setRuleConfigPairs,
    setWhitelistConfigPairs,
  ]);

  const handleCancelRule = useCallback(() => {
    setApiError(null);
    clearValidationErrors();
    closeRuleModal();
    resetRuleForm();
    setRuleConfigPairs({});
    setWhitelistConfigPairs({});
    resetConfigurationBlocks();
    resetEdit();
  }, [
    clearValidationErrors,
    closeRuleModal,
    resetRuleForm,
    resetConfigurationBlocks,
    resetEdit,
    setRuleConfigPairs,
    setWhitelistConfigPairs,
  ]);

  // ==================== Mapping Handlers ====================
  const handleEditMapping = useCallback(
    (item: Record<string, string | number>) => {
      if (!item) return;
      setApiError(null);
      setMappingForm({
        source: (item?.source as string) || "",
        target: (item?.target as string) || "",
      });
      setEditingMappingId(Number(item?.id) || null);
      if (openMappingModal) {
        openMappingModal();
      }
    },
    [setMappingForm, openMappingModal]
  );

  const handleSaveMapping = useCallback(async () => {
    clearValidationErrors("mappingForm");

    const isMappingFormValid = validateMapping();

    if (!isMappingFormValid || !editingMappingId) {
      return;
    }

    if (!mappingForm?.source || !mappingForm?.target) {
      setApiError("Source and target are required");
      return;
    }

    const payload = {
      package_name: selectedPackage,
      update_data: {
        [mappingForm?.source || ""]: mappingForm?.target || "",
      },
    };

    setIsSavingMapping(true);
    try {
      await updateMappingConfigApi(payload);
      if (closeMappingModal) {
        closeMappingModal();
      }
      if (resetMappingForm) {
        resetMappingForm();
      }
      setEditingMappingId(null);
      if (clearValidationErrors) {
        clearValidationErrors("mappingForm");
      }
      setApiError(null);
      if (refetchMappingConfig) {
        refetchMappingConfig();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update mapping configuration";
      setApiError(errorMessage);
    } finally {
      setIsSavingMapping(false);
    }
  }, [
    mappingForm,
    editingMappingId,
    selectedPackage,
    validateMapping,
    clearValidationErrors,
    resetMappingForm,
    closeMappingModal,
    refetchMappingConfig,
  ]);

  const handleCancelMapping = useCallback(() => {
    setApiError(null);
    clearValidationErrors("mappingForm");
    closeMappingModal();
    resetMappingForm();
    setEditingMappingId(null);
  }, [clearValidationErrors, closeMappingModal, resetMappingForm]);

  // ==================== Delete Confirmation Handlers ====================
  const handleDeleteWhitelistItem = useCallback(
    (key: string) => {
      if (!key) return;
      setDeleteConfirmation({
        isOpen: true,
        type: "whitelist",
        key: key || "",
        onConfirm: () => {
          if (deleteWhitelistItem) {
            deleteWhitelistItem(key);
          }
          setDeleteConfirmation({
            isOpen: false,
            type: "whitelist",
            key: "",
            onConfirm: () => {},
          });
        },
      });
    },
    [deleteWhitelistItem]
  );

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmation({
      isOpen: false,
      type: "whitelist",
      key: "",
      onConfirm: () => {},
    });
  }, []);

  // ==================== Memoized Handlers ====================
  const handleInitializeAddMode = useCallback(() => {
    if (initializeAddMode && ruleForm?.ruleName) {
      initializeAddMode(ruleForm.ruleName);
    }
  }, [ruleForm?.ruleName, initializeAddMode]);

  const handleUpdateWhitelistPair = useCallback(
    (key: string, value: any) => {
      if (updateWhitelistPair && key) {
        updateWhitelistPair(key, value);
      }
    },
    [updateWhitelistPair]
  );

  const SectionHeader = ({ title }:{title:String}) => (
    <div className="flex items-center justify-center gap-2 mb-2">
      
        <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full dark:from-primary dark:to-white" />
        <h2 className="text-subHeader font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white]">
        {title}
      </h2>
        <div className="h-8 w-1 bg-gradient-to-b from-secondary to-primary rounded-full dark:from-white dark:to-primary" />
    </div>
  );

  // ==================== Render ====================
  return (
    <div className="w-full space-y-2">
      {/* Configuration Section */}
      <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-2 transition-all duration-300">
        <SectionHeader title="Configuration" />
        <ConfigSection
          config={config}
          editingField={editingField}
          editingValue={editingValue}
          isLoading={isLoadingCustomConfig}
          isSaving={isSavingConfig}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onEditValueChange={setEditingValue}
        />
      </div>

      {/* Configuration Rules Section */}
      <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-2 transition-all duration-300">
        <SectionHeader title="Configuration Rules" />

        <ResizableTable
          columns={CONFIG_RULES_COLUMNS}
          data={configRulesData || []}
          isPaginated={true}
          isSearchable={true}
          onSearch={setSearchTerm || (() => {})}
          headerColor="#f8f9fa"
          totalPages={totalPages || 1}
          pageNo={currentPage || 1}
          onPageChange={setCurrentPage || (() => {})}
          onLimitChange={(newLimit: number) => {
            setLimit(newLimit || DEFAULT_PAGE_SIZE);
            setCurrentPage(1);
          }}
          isEdit={true}
          isView={true}
          onEdit={handleEditRule || (() => {})}
          onView={handleViewRule || (() => {})}
          height={300}
        />
      </div>

      {/* Mapping Rules Section */}
      <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-2 transition-all duration-300">
        <SectionHeader title="Mapping Rules" />

        <ResizableTable
          columns={MAPPING_RULES_COLUMNS}
          data={mappingRulesData || []}
          isPaginated={false}
          isSearchable={true}
          onSearch={() => {}}
          headerColor="#f8f9fa"
          isEdit={true}
          onEdit={handleEditMapping || (() => {})}
          height={300}
        />
      </div>

      {/* Rule Configuration Modal */}
      <RuleConfigurationModal
        isOpen={isRuleModalOpen}
        onOpenChange={setIsRuleModalOpen}
        ruleForm={ruleForm}
        setRuleForm={setRuleForm}
        validationErrors={validationErrors}
        clearValidationErrors={clearValidationErrors}
        ruleConfigPairs={ruleConfigPairs}
        setRuleConfigPairs={setRuleConfigPairs}
        whitelistConfigPairs={whitelistConfigPairs}
        setWhitelistConfigPairs={setWhitelistConfigPairs}
        parameterCountryRows={parameterCountryRows}
        configurationBlocks={configurationBlocks}
        showAddKeyMode={showAddKeyMode}
        configParameters={configParameters}
        countries={countries}
        isLoadingCountries={isLoadingCountries}
        editMode={editMode}
        isSaving={isSavingRule}
        onSave={handleSaveRule}
        onCancel={handleCancelRule}
        onDeleteWhitelistItem={handleDeleteWhitelistItem}
        onInitializeAddMode={handleInitializeAddMode}
        onResetAddMode={() => {
          setShowAddKeyMode(false);
          resetConfigurationBlocks();
        }}
        onAddParameterCountryRow={addParameterCountryRow}
        onRemoveParameterCountryRow={removeParameterCountryRow}
        onUpdateParameterCountryRow={updateParameterCountryRow}
        onAddConfigurationBlock={addConfigurationBlock}
        onRemoveConfigurationBlock={removeConfigurationBlock}
        onUpdateBlockParameters={updateBlockParameters}
        onUpdateBlockValue={updateBlockValue}
        onUpdateWhitelistPair={handleUpdateWhitelistPair}
        onNormalizeCountrySelection={normalizeCountrySelection}
      />

      {/* View Rule Modal */}
      <ViewRuleModal
        isOpen={isViewModalOpen}
        viewingRule={viewingRule}
        onClose={closeViewModal}
      />

      {/* Mapping Configuration Modal */}
      <MappingConfigurationModal
        isOpen={isMappingModalOpen}
        onOpenChange={setIsMappingModalOpen}
        mappingForm={mappingForm}
        setMappingForm={setMappingForm}
        validationErrors={validationErrors}
        clearValidationErrors={clearValidationErrors}
        isSaving={isSavingMapping}
        onSave={handleSaveMapping}
        onCancel={handleCancelMapping}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmation?.isOpen || false}
        onConfirm={deleteConfirmation?.onConfirm || (() => {})}
        onCancel={handleCancelDelete || (() => {})}
      />
    </div>
  );
};

export default CustomConfiguration;
