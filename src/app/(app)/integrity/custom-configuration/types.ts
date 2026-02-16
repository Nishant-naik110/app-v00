// Type definitions for Custom Configuration module

export interface ConfigState {
  fraudThreshold: string;
  targetUrl: string;
  targetBlockUrl: string;
  redirection: boolean;
}

export interface RuleFormState {
  ruleName: string;
  status: string;
  whitelistConfiguration: string;
  ruleConfiguration: string;
}

export interface MappingFormState {
  source: string;
  target: string;
}

export interface ValidationErrors {
  ruleForm: {
    ruleName?: string;
    status?: string;
  };
  mappingForm: {
    source?: string;
    target?: string;
  };
  newKeyValues: {
    [key: string]: string | undefined;
  };
  selectedCountries?: string;
}

export interface ParameterCountryRow {
  id: string;
  parameter: string;
  value: string;
  countries: string[];
  threshold?: string;
}

export interface ConfigurationBlock {
  id: string;
  parameters: string[];
  values: { [key: string]: string };
  countries: string[];
  threshold?: string;
}

export interface ConfigRuleItem extends Record<string, string | number> {
  id: number;
  ruleName: string;
  status: string;
  whitelistConfiguration: string;
  ruleConfiguration: string;
}

export interface MappingRuleItem extends Record<string, string | number> {
  id: number;
  source: string;
  target: string;
}

export interface DeleteConfirmationState {
  isOpen: boolean;
  type: 'whitelist' | 'newConfig';
  key: string;
  onConfirm: () => void;
}

