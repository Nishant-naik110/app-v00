// Custom hook for managing configuration blocks and parameter rows

import { useState, useCallback } from 'react';
import type { ParameterCountryRow, ConfigurationBlock } from '../types';
import { COUNTRY_RULE_TYPE, REDIRECT_RULE_TYPE } from '../constants';

export const useConfigurationBlocks = () => {
  const [parameterCountryRows, setParameterCountryRows] = useState<ParameterCountryRow[]>([]);
  const [configurationBlocks, setConfigurationBlocks] = useState<ConfigurationBlock[]>([]);
  const [showAddKeyMode, setShowAddKeyMode] = useState(false);

  const addConfigurationBlock = useCallback(() => {
    const newBlock: ConfigurationBlock = {
      id: Date.now().toString(),
      parameters: [],
      values: {},
      countries: [],
      threshold: "",
    };
    setConfigurationBlocks((prev) => [...prev, newBlock]);
  }, []);

  const removeConfigurationBlock = useCallback((blockId: string) => {
    setConfigurationBlocks((prev) => prev.filter((block) => block.id !== blockId));
  }, []);

  const updateBlockParameters = useCallback((blockId: string, parameters: string[]) => {
    setConfigurationBlocks((prev) =>
      prev.map((block) => {
        if (block.id === blockId) {
          const newValues = { ...block.values };
          Object.keys(newValues).forEach((key) => {
            if (!parameters.includes(key)) {
              delete newValues[key];
            }
          });

          return {
            ...block,
            parameters,
            values: newValues,
          };
        }
        return block;
      })
    );
  }, []);

  const updateBlockValue = useCallback((blockId: string, parameter: string, value: string) => {
    setConfigurationBlocks((prev) =>
      prev.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            values: {
              ...block.values,
              [parameter]: value,
            },
          };
        }
        return block;
      })
    );
  }, []);

  const addParameterCountryRow = useCallback(() => {
    const newRow: ParameterCountryRow = {
      id: Date.now().toString(),
      parameter: "",
      value: "",
      countries: [],
    };
    setParameterCountryRows((prev) => [...prev, newRow]);
  }, []);

  const removeParameterCountryRow = useCallback((rowId: string) => {
    setParameterCountryRows((prev) => prev.filter((row) => row.id !== rowId));
  }, []);

  const updateParameterCountryRow = useCallback((
    rowId: string,
    updates: Partial<ParameterCountryRow>
  ) => {
    setParameterCountryRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, ...updates } : row))
    );
  }, []);

  const initializeAddMode = useCallback((ruleName: string) => {
    setShowAddKeyMode(true);
    setParameterCountryRows([]);
    setConfigurationBlocks([]);

    if (ruleName === COUNTRY_RULE_TYPE || ruleName === REDIRECT_RULE_TYPE) {
      const newRow: ParameterCountryRow = {
        id: Date.now().toString(),
        parameter: "",
        value: "",
        countries: [],
      };
      setParameterCountryRows([newRow]);
    } else {
      addConfigurationBlock();
    }
  }, [addConfigurationBlock]);

  const resetAll = useCallback(() => {
    setParameterCountryRows([]);
    setConfigurationBlocks([]);
    setShowAddKeyMode(false);
  }, []);

  return {
    // State
    parameterCountryRows,
    configurationBlocks,
    showAddKeyMode,
    // Setters
    setParameterCountryRows,
    setConfigurationBlocks,
    setShowAddKeyMode,
    // Block operations
    addConfigurationBlock,
    removeConfigurationBlock,
    updateBlockParameters,
    updateBlockValue,
    // Row operations
    addParameterCountryRow,
    removeParameterCountryRow,
    updateParameterCountryRow,
    // Mode operations
    initializeAddMode,
    resetAll,
  };
};

