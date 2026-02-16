// Custom hook for managing rule editing logic

import { useState, useCallback, useMemo } from 'react';
import type { ConfigRuleItem } from '../types';
import { parseWhitelistConfiguration } from '../utils/dataTransformers';
import { INITIAL_RULE_FORM_STATE } from '../constants';

export const useRuleEditor = () => {
  const [editMode, setEditMode] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [ruleConfigPairs, setRuleConfigPairs] = useState<{ [key: string]: any }>({});
  const [whitelistConfigPairs, setWhitelistConfigPairs] = useState<{ [key: string]: any }>({});
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const initializeEdit = useCallback((item: ConfigRuleItem) => {
    // Parse rule configuration
    try {
      const parsedConfig = JSON.parse(item.ruleConfiguration || "{}");
      setRuleConfigPairs(parsedConfig);
    } catch (error) {
      console.error("Error parsing rule configuration:", error);
      setRuleConfigPairs({});
    }

    // Parse whitelist configuration
    const { configPairs, extractedCountries } = parseWhitelistConfiguration(
      item.whitelistConfiguration || "[]"
    );
    setWhitelistConfigPairs(configPairs);
    setSelectedCountries(extractedCountries);

    setEditMode(true);
    setEditingRuleId(Number(item.id));
  }, []);

  const resetEdit = useCallback(() => {
    setEditMode(false);
    setEditingRuleId(null);
    setRuleConfigPairs({});
    setWhitelistConfigPairs({});
    setSelectedCountries([]);
  }, []);

  const updateWhitelistPair = useCallback((key: string, value: any) => {
    setWhitelistConfigPairs((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const deleteWhitelistItem = useCallback((key: string) => {
    setWhitelistConfigPairs((prev) => {
      const newPairs = { ...prev };
      delete newPairs[key];

      // Reconstruct array format maintaining object boundaries
      const whitelistArray: any[] = [];
      const groupedByIndex: { [index: number]: { [key: string]: any } } = {};

      Object.entries(newPairs).forEach(([originalKey, value]) => {
        const keyParts = originalKey.split('_');
        const lastPart = keyParts[keyParts.length - 1];
        const hasIndexSuffix = !isNaN(parseInt(lastPart)) && keyParts.length > 1;

        if (hasIndexSuffix) {
          const baseKey = keyParts.slice(0, -1).join('_');
          const index = parseInt(lastPart);

          if (!groupedByIndex[index]) {
            groupedByIndex[index] = {};
          }
          groupedByIndex[index][baseKey] = value;
        } else {
          if (!groupedByIndex[0]) {
            groupedByIndex[0] = {};
          }
          groupedByIndex[0][originalKey] = value;
        }
      });

      const sortedIndices = Object.keys(groupedByIndex)
        .map((index) => parseInt(index))
        .sort((a, b) => a - b);

      sortedIndices.forEach((originalIndex) => {
        const obj = groupedByIndex[originalIndex];
        if (Object.keys(obj).length > 0) {
          whitelistArray.push(obj);
        }
      });

      // Convert back to key-value pairs with sequential indexing
      const reindexedPairs: { [key: string]: any } = {};

      whitelistArray.forEach((item, newIndex) => {
        Object.entries(item).forEach(([key, value]) => {
          if (whitelistArray.length === 1) {
            reindexedPairs[key] = value;
          } else {
            reindexedPairs[`${key}_${newIndex}`] = value;
          }
        });
      });

      return reindexedPairs;
    });
  }, []);

  return {
    // State
    editMode,
    editingRuleId,
    ruleConfigPairs,
    whitelistConfigPairs,
    selectedCountries,
    // Setters
    setRuleConfigPairs,
    setWhitelistConfigPairs,
    setSelectedCountries,
    // Methods
    initializeEdit,
    resetEdit,
    updateWhitelistPair,
    deleteWhitelistItem,
  };
};

