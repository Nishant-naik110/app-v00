"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePackage } from "@/components/mf/PackageContext";
import {
  useGetThresholdTolerance,
  useGetRuleConfig,
  useGetConfigParameters,
  useGetCountries,
  useGetGeoConfig,
  updateThresholdToleranceApi,
  addRuleConfigApi,
  editRuleConfigApi,
  deleteRuleConfigApi,
  addGeoConfigApi,
  editGeoConfigApi,
  deleteGeoConfigApi,
  type ThresholdTolerancePayload,
  type RuleConfigPayload,
  type ConfigParametersPayload,
  type CountriesPayload,
  type GeoConfigPayload,
} from "../hooks/useRuleConfiguration";
import { ThresholdConfigSection } from "./components/ThresholdConfigSection";
import { ConfigTable } from "./components/ConfigTable";
import { RuleConfigModal } from "./components/RuleConfigModal";
import { GeoConfigModal } from "./components/GeoConfigModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import {
  ITEMS_PER_PAGE,
  SEARCH_DEBOUNCE_DELAY,
  RULE_CONFIG_COLUMNS,
  GEO_CONFIG_COLUMNS,
} from "./constants";
import type { CountryOption } from "../hooks/useRuleConfiguration";

// Types
interface RuleFormRow {
  configurationParameter: string;
  value: string;
  whitelistThreshold: string;
}

interface GeoFormRow {
  parameter: string;
  value: string;
  selectGeo: string[];
}

// Utility Functions
const validateRuleForm = (rows: RuleFormRow[]): boolean => {
  if (!rows || rows.length === 0) return false;
  return rows.every(
    (row) =>
      row?.configurationParameter && row?.value && row?.whitelistThreshold
  );
};

const validateGeoForm = (rows: GeoFormRow[]): boolean => {
  if (!rows || rows.length === 0) return false;
  return rows.every((row) => row?.selectGeo && row.selectGeo.length > 0);
};

const getAllowedGeoValue = (
  selectedCountries: string[],
  allCountries: CountryOption[]
): string => {
  if (!allCountries?.length) return "all";
  const allAvailableCountries = allCountries.map((country) => country?.value || "").filter(Boolean);
  const isAllCountriesSelected = allAvailableCountries.length > 0 && allAvailableCountries.every((country) =>
    selectedCountries.includes(country)
  );

  return isAllCountriesSelected ? "all" : selectedCountries.join(",");
};

const parseAllowedGeo = (
  allowedGeo: string,
  allCountries: CountryOption[]
): string[] => {
  if (!allowedGeo) return [];
  if (allowedGeo === "all") {
    return allCountries?.map((country) => country?.value || "").filter(Boolean) || [];
  }
  return allowedGeo.split(",").map((geo) => geo.trim()).filter((geo) => geo);
};

const parseRuleConfig = (
  ruleConfig: string
): { parameter: string; value: string } => {
  if (!ruleConfig) return { parameter: "", value: "" };
  const parts = ruleConfig.split(":");
  return { parameter: parts[0] || "", value: parts[1] || "" };
};

const RuleGeoConfigurationComponent = () => {
  const { selectedPackage } = usePackage();

  // Configuration section state
  const [frequencyCapping, setFrequencyCapping] = useState("");
  const [fraudTolerance, setFraudTolerance] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  // Table pagination state
  const [ruleCurrentPage, setRuleCurrentPage] = useState(1);
  const [ruleLimit, setRuleLimit] = useState(ITEMS_PER_PAGE);
  const [ruleSearchTerm, setRuleSearchTerm] = useState("");
  const [ruleDebouncedSearchTerm, setRuleDebouncedSearchTerm] = useState("");
  const [geoCurrentPage, setGeoCurrentPage] = useState(1);
  const [geoLimit, setGeoLimit] = useState(ITEMS_PER_PAGE);
  const [geoSearchTerm, setGeoSearchTerm] = useState("");
  const [geoDebouncedSearchTerm, setGeoDebouncedSearchTerm] = useState("");

  // Rule form state
  const [ruleRows, setRuleRows] = useState<RuleFormRow[]>([
    { configurationParameter: "", value: "", whitelistThreshold: "" },
  ]);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isRuleEditMode, setIsRuleEditMode] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  // Geo form state
  const [geoRows, setGeoRows] = useState<GeoFormRow[]>([
    { parameter: "", value: "", selectGeo: [] },
  ]);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [isGeoEditMode, setIsGeoEditMode] = useState(false);
  const [editingGeoId, setEditingGeoId] = useState<number | null>(null);

  // Delete confirmation state
  const [ruleDeleteDialogOpen, setRuleDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Record<
    string,
    string | number
  > | null>(null);
  const [geoDeleteDialogOpen, setGeoDeleteDialogOpen] = useState(false);
  const [geoToDelete, setGeoToDelete] = useState<Record<
    string,
    string | number
  > | null>(null);

  // Original values for edit operations
  const [originalRuleValues, setOriginalRuleValues] = useState<{
    parameter: string;
    value: string;
    threshold: string;
  } | null>(null);

  const [originalGeoValues, setOriginalGeoValues] = useState<{
    parameter: string;
    value: string;
    allowed_geo: string;
  } | null>(null);

  const thresholdTolerancePayload = useMemo<
    ThresholdTolerancePayload | undefined
  >(() => {
    if (!selectedPackage) return undefined;
    return { package_name: selectedPackage };
  }, [selectedPackage]);

  const ruleConfigPayload = useMemo<RuleConfigPayload | undefined>(() => {
    if (!selectedPackage) return undefined;
    return {
      package_name: selectedPackage,
      page_number: ruleCurrentPage,
      record_limit: ruleLimit,
      search_term: ruleDebouncedSearchTerm || undefined,
    };
  }, [selectedPackage, ruleCurrentPage, ruleLimit, ruleDebouncedSearchTerm]);

  const configParametersPayload = useMemo<
    ConfigParametersPayload | undefined
  >(() => {
    if (!selectedPackage) return undefined;
    return { package_name: selectedPackage };
  }, [selectedPackage]);

  const countriesPayload = useMemo<CountriesPayload | undefined>(() => {
    if (!selectedPackage) return undefined;
    return { package_name: selectedPackage };
  }, [selectedPackage]);

  const geoConfigPayload = useMemo<GeoConfigPayload | undefined>(() => {
    if (!selectedPackage) return undefined;
    return {
      package_name: selectedPackage,
      page_number: geoCurrentPage,
      record_limit: geoLimit,
      search_term: geoDebouncedSearchTerm || undefined,
    };
  }, [selectedPackage, geoCurrentPage, geoLimit, geoDebouncedSearchTerm]);

  const {
    data: thresholdToleranceData,
    isLoading: isLoadingThresholdTolerance,
    refetch: refetchThresholdTolerance,
  } = useGetThresholdTolerance(
    thresholdTolerancePayload,
    !!thresholdTolerancePayload
  );

  const {
    data: ruleConfigData,
    isLoading: isLoadingRuleConfig,
    refetch: refetchRuleConfig,
  } = useGetRuleConfig(ruleConfigPayload, !!ruleConfigPayload);

  const { data: configParametersData, isLoading: isLoadingConfigParameters } =
    useGetConfigParameters(configParametersPayload, !!configParametersPayload);

  const { data: countriesData } =
    useGetCountries(countriesPayload, !!countriesPayload);

  const {
    data: geoConfigData,
    isLoading: isLoadingGeoConfig,
    refetch: refetchGeoConfig,
  } = useGetGeoConfig(geoConfigPayload, !!geoConfigPayload);

  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [isDeletingRule, setIsDeletingRule] = useState(false);
  const [isSavingGeo, setIsSavingGeo] = useState(false);
  const [isDeletingGeo, setIsDeletingGeo] = useState(false);

  const configParameters = useMemo(
    () => configParametersData || [],
    [configParametersData]
  );

  const countries = useMemo(() => countriesData || [], [countriesData]);

  const countriesValues = useMemo(
    () => countries?.map((c) => c?.value || "").filter(Boolean) || [],
    [countries]
  );

  const ruleConfigTableData = useMemo(() => {
    if (!ruleConfigData?.data || !Array.isArray(ruleConfigData.data)) return [];
    return ruleConfigData.data.map((item, index) => ({
      ...item,
      id:
        index +
        1 +
        ((ruleConfigData?.page_number || 1) - 1) * (ruleConfigData?.record_limit || ITEMS_PER_PAGE),
    }));
  }, [ruleConfigData]);

  const ruleTotalPages = useMemo(
    () => ruleConfigData?.total_pages || 1,
    [ruleConfigData]
  );

  const geoConfigTableData = useMemo(() => {
    if (!geoConfigData?.data || !Array.isArray(geoConfigData.data)) return [];
    return geoConfigData.data.map((item, index) => ({
      ...item,
      id:
        index +
        1 +
        ((geoConfigData?.page_number || 1) - 1) * (geoConfigData?.record_limit || ITEMS_PER_PAGE),
    }));
  }, [geoConfigData]);

  const geoTotalPages = useMemo(
    () => geoConfigData?.total_pages || 1,
    [geoConfigData]
  );


  // Update state when threshold tolerance data is fetched
  useEffect(() => {
    if (thresholdToleranceData) {
      setFrequencyCapping(thresholdToleranceData?.frequency?.toString() || "");
      setFraudTolerance(thresholdToleranceData?.tolerance || "");
      setIsBlocked(thresholdToleranceData?.blocked || false);
    }
  }, [thresholdToleranceData]);

  // Debounce search terms
  useEffect(() => {
    const timer = setTimeout(() => {
      setRuleDebouncedSearchTerm(ruleSearchTerm);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [ruleSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGeoDebouncedSearchTerm(geoSearchTerm);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [geoSearchTerm]);

  // Reset pagination when search terms change
  useEffect(() => {
    setRuleCurrentPage(1);
  }, [ruleSearchTerm]);

  useEffect(() => {
    setGeoCurrentPage(1);
  }, [geoSearchTerm]);

  // Reset pagination when limit changes
  useEffect(() => {
    setRuleCurrentPage(1);
  }, [ruleLimit]);

  useEffect(() => {
    setGeoCurrentPage(1);
  }, [geoLimit]);

 
  const handleSaveConfiguration = async () => {
    if (!selectedPackage) return;
    const frequency = parseInt(frequencyCapping) || 0;

    setIsUpdatingThreshold(true);
    try {
      await updateThresholdToleranceApi({
        package_name: selectedPackage,
        frequency,
        tolerance: fraudTolerance || "",
        blocked: isBlocked || false,
      });
      if (refetchThresholdTolerance) {
        refetchThresholdTolerance();
      }
    } catch (error) {
      console.error("Update Threshold Tolerance Error:", error);
    } finally {
      setIsUpdatingThreshold(false);
    }
  };


  const handleAddRule = () => {
    setRuleRows([
      { configurationParameter: "", value: "", whitelistThreshold: "" },
    ]);
    setIsRuleEditMode(false);
    setEditingRuleId(null);
    setIsRuleModalOpen(true);
  };

  const handleEditRule = (item: Record<string, string | number>) => {
    const ruleConfig = item?.rule_configuration as string;
    if (!ruleConfig) return;
    
    const { parameter, value } = parseRuleConfig(ruleConfig);

    setOriginalRuleValues({
      parameter: parameter || "",
      value: value || "",
      threshold: item?.whitelist_threshold?.toString() || "",
    });

    setRuleRows([
      {
        configurationParameter: parameter || "",
        value: value || "",
        whitelistThreshold: item?.whitelist_threshold?.toString() || "",
      },
    ]);
    setEditingRuleId(Number(item?.id) || null);
    setIsRuleEditMode(true);
    setIsRuleModalOpen(true);
  };

  const handleDeleteRule = (item: Record<string, string | number>) => {
    if (!selectedPackage) return;
    setRuleToDelete(item);
    setRuleDeleteDialogOpen(true);
  };

  const confirmDeleteRule = async () => {
    const item = ruleToDelete;
    if (!item || !selectedPackage) return;

    const ruleConfig = item?.rule_configuration as string;
    if (!ruleConfig) return;
    
    const { parameter, value } = parseRuleConfig(ruleConfig);

    setIsDeletingRule(true);
    try {
      await deleteRuleConfigApi({
        package_name: selectedPackage,
        delete_value: {
          parameter: parameter || "",
          value: value || "",
          threshold: item?.whitelist_threshold?.toString() || "",
        },
      });
      if (refetchRuleConfig) {
        refetchRuleConfig();
      }
      setRuleDeleteDialogOpen(false);
      setRuleToDelete(null);
    } catch (error) {
      console.error("Delete Rule Config Error:", error);
    } finally {
      setIsDeletingRule(false);
    }
  };

  const handleSaveRule = async () => {
    if (!validateRuleForm(ruleRows) || !selectedPackage || !ruleRows?.length) return;

    setIsSavingRule(true);
    try {
      if (isRuleEditMode && editingRuleId && originalRuleValues) {
        const firstRow = ruleRows[0];
        if (!firstRow) return;
        await editRuleConfigApi({
          package_name: selectedPackage,
          old_value: originalRuleValues,
          new_value: {
            parameter: firstRow?.configurationParameter || "",
            value: firstRow?.value || "",
            threshold: firstRow?.whitelistThreshold || "",
          },
        });
      } else {
        await addRuleConfigApi({
          package_name: selectedPackage,
          update_data: ruleRows.map((row) => ({
            parameter: row?.configurationParameter || "",
            value: row?.value || "",
            threshold: row?.whitelistThreshold || "",
          })),
        });
      }

      setIsRuleModalOpen(false);
      setRuleRows([
        { configurationParameter: "", value: "", whitelistThreshold: "" },
      ]);
      setIsRuleEditMode(false);
      setEditingRuleId(null);
      setOriginalRuleValues(null);
      if (refetchRuleConfig) {
        refetchRuleConfig();
      }
    } catch (error) {
      console.error("Save Rule Config Error:", error);
    } finally {
      setIsSavingRule(false);
    }
  };

  const addRuleRow = () => {
    setRuleRows((prev) => [
      ...prev,
      { configurationParameter: "", value: "", whitelistThreshold: "" },
    ]);
  };

  const removeRuleRow = (index: number) => {
    setRuleRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRuleRow = (index: number, field: string, value: any) => {
    setRuleRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleAddGeo = () => {
    setGeoRows([{ parameter: "", value: "", selectGeo: [] }]);
    setIsGeoEditMode(false);
    setEditingGeoId(null);
    setIsGeoModalOpen(true);
  };

  const handleEditGeo = (item: Record<string, string | number>) => {
    const allowedGeoStr = item?.allowed_geo as string;
    if (!allowedGeoStr) return;

    setOriginalGeoValues({
      parameter: item?.campaign_parameter as string || "",
      value: item?.parameter_value?.toString() || "",
      allowed_geo: allowedGeoStr,
    });

    const geoArray = parseAllowedGeo(allowedGeoStr, countries);

    setGeoRows([
      {
        parameter: item?.campaign_parameter as string || "",
        value: item?.parameter_value?.toString() || "",
        selectGeo: geoArray || [],
      },
    ]);
    setEditingGeoId(Number(item?.id) || null);
    setIsGeoEditMode(true);
    setIsGeoModalOpen(true);
  };

  const handleDeleteGeo = (item: Record<string, string | number>) => {
    if (!selectedPackage) return;
    setGeoToDelete(item);
    setGeoDeleteDialogOpen(true);
  };

  const confirmDeleteGeo = async () => {
    const item = geoToDelete;
    if (!item || !selectedPackage) return;

    setIsDeletingGeo(true);
    try {
      await deleteGeoConfigApi({
        package_name: selectedPackage,
        delete_value: {
          parameter: item?.campaign_parameter as string || "",
          value: item?.parameter_value?.toString() || "",
          allowed_geo: item?.allowed_geo as string || "",
        },
      });
      if (refetchGeoConfig) {
        refetchGeoConfig();
      }
      setGeoDeleteDialogOpen(false);
      setGeoToDelete(null);
    } catch (error) {
      console.error("Delete Geo Config Error:", error);
    } finally {
      setIsDeletingGeo(false);
    }
  };

  const handleSaveGeo = async () => {
    if (!validateGeoForm(geoRows) || !selectedPackage || !geoRows?.length) return;

    setIsSavingGeo(true);
    try {
      if (isGeoEditMode && editingGeoId && originalGeoValues) {
        const firstRow = geoRows[0];
        if (!firstRow) return;
        const allowedGeoValue = getAllowedGeoValue(
          firstRow?.selectGeo || [],
          countries
        );

        await editGeoConfigApi({
          package_name: selectedPackage,
          old_value: originalGeoValues,
          new_value: {
            parameter: firstRow?.parameter || "",
            value: firstRow?.value || "",
            allowed_geo: allowedGeoValue,
          },
        });
      } else {
        await addGeoConfigApi({
          package_name: selectedPackage,
          update_data: geoRows.map((row) => {
            const allowedGeoValue = getAllowedGeoValue(row?.selectGeo || [], countries);
            return {
              parameter: row?.parameter || "",
              value: row?.value || "",
              allowed_geo: allowedGeoValue,
            };
          }),
        });
      }

      setIsGeoModalOpen(false);
      setGeoRows([{ parameter: "", value: "", selectGeo: [] }]);
      setIsGeoEditMode(false);
      setEditingGeoId(null);
      setOriginalGeoValues(null);
      if (refetchGeoConfig) {
        refetchGeoConfig();
      }
    } catch (error) {
      console.error("Save Geo Config Error:", error);
    } finally {
      setIsSavingGeo(false);
    }
  };

  const addGeoRow = () => {
    setGeoRows((prev) => [...prev, { parameter: "", value: "", selectGeo: [] }]);
  };

  const removeGeoRow = (index: number) => {
    setGeoRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGeoRow = (index: number, field: string, value: any) => {
    setGeoRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const SectionHeader = ({ title }:{title:String}) => (
    <div className="flex items-center justify-center gap-2 mb-2">
        <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full dark:from-primary dark:to-white" />
        <h2 className="text-subHeader font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white]">
        {title}
      </h2>
              <div className="h-8 w-1 bg-gradient-to-b from-secondary to-primary rounded-full dark:from-white dark:to-primary" />
    </div>
  );

  return (
    <div className="mt-2">
      <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-2 transition-all duration-300">
        <SectionHeader title="Rule & Geo Configuration" />

      {/* Threshold Configuration Section */}
      <ThresholdConfigSection
        frequencyCapping={frequencyCapping}
        fraudTolerance={fraudTolerance}
        isBlocked={isBlocked}
        isLoading={isLoadingThresholdTolerance}
        isSaving={isUpdatingThreshold}
        onFrequencyChange={setFrequencyCapping}
        onToleranceChange={setFraudTolerance}
        onBlockedChange={setIsBlocked}
        onSave={handleSaveConfiguration}
      />

      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-1 sm:gap-2 mt-2">
        {/* Rule Configuration Table */}
        <ConfigTable
          title="Rule Configuration"
          columns={RULE_CONFIG_COLUMNS}
          data={ruleConfigTableData}
          searchTerm={ruleSearchTerm}
          currentPage={ruleCurrentPage}
          totalPages={ruleTotalPages}
          limit={ruleLimit}
          isLoading={isLoadingRuleConfig}
          onSearch={setRuleSearchTerm}
          onPageChange={setRuleCurrentPage}
          onLimitChange={(newLimit) => {
            setRuleLimit(newLimit);
            setRuleCurrentPage(1);
          }}
          onAdd={handleAddRule}
          onEdit={handleEditRule}
          onDelete={handleDeleteRule}
        />

        {/* Geo Configuration Table */}
        <ConfigTable
          title="Geo Configuration"
          columns={GEO_CONFIG_COLUMNS}
          data={geoConfigTableData}
          searchTerm={geoSearchTerm}
          currentPage={geoCurrentPage}
          totalPages={geoTotalPages}
          limit={geoLimit}
          isLoading={isLoadingGeoConfig}
          onSearch={setGeoSearchTerm}
          onPageChange={setGeoCurrentPage}
          onLimitChange={(newLimit) => {
            setGeoLimit(newLimit);
            setGeoCurrentPage(1);
          }}
          onAdd={handleAddGeo}
          onEdit={handleEditGeo}
          onDelete={handleDeleteGeo}
        />
      </div>
      </div>

      {/* Rule Configuration Modal */}
      <RuleConfigModal
        isOpen={isRuleModalOpen}
        isEditMode={isRuleEditMode}
        rows={ruleRows}
        configParameters={configParameters}
        isLoadingParameters={isLoadingConfigParameters}
        isSaving={isSavingRule}
        onClose={() => setIsRuleModalOpen(false)}
        onSave={handleSaveRule}
        onAddRow={addRuleRow}
        onRemoveRow={removeRuleRow}
        onUpdateRow={updateRuleRow}
      />

      {/* Geo Configuration Modal */}
      <GeoConfigModal
        isOpen={isGeoModalOpen}
        isEditMode={isGeoEditMode}
        rows={geoRows}
        configParameters={configParameters}
        countries={countriesValues}
        isLoadingParameters={isLoadingConfigParameters}
        isSaving={isSavingGeo}
        onClose={() => setIsGeoModalOpen(false)}
        onSave={handleSaveGeo}
        onAddRow={addGeoRow}
        onRemoveRow={removeGeoRow}
        onUpdateRow={updateGeoRow}
      />

      {/* Rule Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={ruleDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this rule configuration?"
        isDeleting={isDeletingRule}
        onConfirm={confirmDeleteRule}
        onCancel={() => setRuleDeleteDialogOpen(false)}
      />

      {/* Geo Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={geoDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this geo configuration?"
        isDeleting={isDeletingGeo}
        onConfirm={confirmDeleteGeo}
        onCancel={() => setGeoDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default RuleGeoConfigurationComponent; 