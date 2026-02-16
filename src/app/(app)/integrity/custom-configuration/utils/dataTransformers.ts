// Data transformation utility functions

import type { ConfigRuleItem, MappingRuleItem } from '../types';
import type { CountryOption } from '../../hooks/useCustomConfiguration';

/**
 * Transforms API response data to table format for configuration rules
 */
export const transformConfigRulesData = (
  data: Array<{
    rule_name: string;
    status: boolean;
    whitelist_configuration: Array<{ event_path: string }>;
    rule_configuration: Record<string, any>;
  }>
): ConfigRuleItem[] => {
  return data.map((item, index) => ({
    id: index + 1,
    ruleName: item.rule_name,
    status: item.status ? "True" : "False",
    whitelistConfiguration:
      item.whitelist_configuration.length > 0
        ? JSON.stringify(item.whitelist_configuration)
        : "",
    ruleConfiguration: JSON.stringify(item.rule_configuration),
  }));
};

/**
 * Transforms API response data to table format for mapping rules
 */
export const transformMappingRulesData = (
  data: Array<{ source: string; target: string }>
): MappingRuleItem[] => {
  return data.map((item, index) => ({
    id: index + 1,
    source: item.source,
    target: item.target,
  }));
};

/**
 * Converts whitelist configuration pairs to array format for API
 */
export const convertWhitelistPairsToArray = (
  whitelistConfigPairs: { [key: string]: any },
  parameterCountryRows: Array<{
    id: string;
    parameter: string;
    value: string;
    countries: string[];
    threshold?: string;
  }>,
  configurationBlocks: Array<{
    id: string;
    parameters: string[];
    values: { [key: string]: string };
  }>,
  ruleName: string,
  showAddKeyMode: boolean,
  COUNTRY_RULE_TYPE: string,
  REDIRECT_RULE_TYPE: string
): any[] => {
  const whitelistArray: any[] = [];

  // Convert existing whitelist pairs to array format
  Object.entries(whitelistConfigPairs).forEach(([key, value]) => {
    const keyParts = key.split("_");
    const lastPart = keyParts[keyParts.length - 1];
    const hasIndexSuffix = !isNaN(parseInt(lastPart)) && keyParts.length > 1;

    if (hasIndexSuffix) {
      const originalKey = keyParts.slice(0, -1).join("_");
      const index = parseInt(lastPart);

      while (whitelistArray.length <= index) {
        whitelistArray.push({});
      }

      whitelistArray[index][originalKey] = value;
    } else {
      if (whitelistArray.length === 0) {
        whitelistArray.push({});
      }
      whitelistArray[0][key] = value;
    }
  });

  // Add new items if in add mode
  if (showAddKeyMode) {
    if (ruleName === COUNTRY_RULE_TYPE || ruleName === REDIRECT_RULE_TYPE) {
      parameterCountryRows.forEach((row) => {
        if (row.value.trim()) {
          if (ruleName === COUNTRY_RULE_TYPE) {
            if (row.countries.length > 0) {
              whitelistArray.push({
                [row.parameter]: row.value,
                country: row.countries,
              });
            }
          } else if (ruleName === REDIRECT_RULE_TYPE) {
            const configItem: any = { [row.parameter]: row.value };
            if (row.threshold) {
              configItem.threshold = row.threshold;
            }
            whitelistArray.push(configItem);
          }
        }
      });
    } else {
      configurationBlocks.forEach((block) => {
        if (block.parameters.length > 0) {
          const configItem: any = {};
          block.parameters.forEach((param) => {
            if (block.values[param]?.trim()) {
              configItem[param] = block.values[param];
            }
          });
          if (Object.keys(configItem).length > 0) {
            whitelistArray.push(configItem);
          }
        }
      });
    }
  }

  return whitelistArray.filter((item) => Object.keys(item).length > 0);
};

/**
 * Parses whitelist configuration from JSON string to key-value pairs
 */
export const parseWhitelistConfiguration = (
  whitelistConfigString: string
): {
  configPairs: { [key: string]: any };
  extractedCountries: string[];
} => {
  const configPairs: { [key: string]: any } = {};
  let extractedCountries: string[] = [];

  try {
    const parsedWhitelist = JSON.parse(whitelistConfigString || "[]");

    if (Array.isArray(parsedWhitelist)) {
      parsedWhitelist.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.entries(item).forEach(([key, value]) => {
            if (key === 'country' && Array.isArray(value)) {
              if (index === 0) {
                extractedCountries = value;
              }
              const countryKeyName = parsedWhitelist.length > 1 ? `country_${index}` : 'country';
              configPairs[countryKeyName] = value;
            } else {
              const keyName = parsedWhitelist.length > 1 ? `${key}_${index}` : key;
              configPairs[keyName] = value;
            }
          });
        } else {
          const keyName = parsedWhitelist.length > 1 ? `item_${index}` : `item`;
          configPairs[keyName] = item;
        }
      });
    } else if (typeof parsedWhitelist === 'object' && parsedWhitelist !== null) {
      Object.assign(configPairs, parsedWhitelist);
    }
  } catch (error) {
    console.error("Error parsing whitelist configuration:", error);
  }

  return { configPairs, extractedCountries };
};

/**
 * Checks if all countries are selected and converts to ["all"] if needed
 */
export const normalizeCountrySelection = (
  selectedValues: string[],
  allCountries: CountryOption[]
): string[] => {
  const allCountryValues = allCountries.map((country) => country.value);
  const isAllCountriesSelected =
    selectedValues.length === allCountryValues.length &&
    selectedValues.every((country) => allCountryValues.includes(country));

  return isAllCountriesSelected ? ["all"] : selectedValues;
};

