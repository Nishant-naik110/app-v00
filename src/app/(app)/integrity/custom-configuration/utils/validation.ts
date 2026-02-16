// Validation utility functions

import React from 'react';
import type {
  RuleFormState,
  MappingFormState,
  ParameterCountryRow,
  ConfigurationBlock,
  ValidationErrors,
} from '../types';
import { COUNTRY_RULE_TYPE, REDIRECT_RULE_TYPE } from '../constants';

export const validateRuleForm = (
  ruleForm: RuleFormState,
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>
): boolean => {
  const errors: { ruleName?: string; status?: string } = {};

  if (!ruleForm.ruleName?.trim()) {
    errors.ruleName = "Rule name is required";
  } else if (ruleForm.ruleName.trim().length < 3) {
    errors.ruleName = "Rule name must be at least 3 characters";
  }

  if (!ruleForm.status) {
    errors.status = "Status is required";
  }

  setValidationErrors((prev) => ({
    ...prev,
    ruleForm: errors,
  }));

  return Object.keys(errors).length === 0;
};

export const validateMappingForm = (
  mappingForm: MappingFormState,
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>
): boolean => {
  const errors: { source?: string; target?: string } = {};

  if (!mappingForm.source?.trim()) {
    errors.source = "Source is required";
  }

  if (!mappingForm.target?.trim()) {
    errors.target = "Target is required";
  }

  setValidationErrors((prev) => ({
    ...prev,
    mappingForm: errors,
  }));

  return Object.keys(errors).length === 0;
};

export const validateNewKeyValues = (
  ruleName: string,
  parameterCountryRows: ParameterCountryRow[],
  configurationBlocks: ConfigurationBlock[],
  showAddKeyMode: boolean,
  editMode: boolean,
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>
): boolean => {
  const errors: { [key: string]: string } = {};

  if (ruleName === COUNTRY_RULE_TYPE || ruleName === REDIRECT_RULE_TYPE) {
    if (parameterCountryRows.length === 0 && !editMode) {
      errors['general'] = "At least one parameter block is required";
    } else {
      parameterCountryRows.forEach((row) => {
        if (!row.parameter) {
          errors[`${row.id}_parameter`] = "Parameter is required";
        }

        if (!row.value?.trim()) {
          errors[`${row.id}_value`] = "Value is required";
        }

        if (ruleName === COUNTRY_RULE_TYPE && row.countries.length === 0) {
          errors[`${row.id}_countries`] = "At least one country is required";
        }

        if (ruleName === REDIRECT_RULE_TYPE && !row.threshold?.trim()) {
          errors[`${row.id}_threshold`] = "Threshold is required";
        }
      });
    }
  } else {
    if (configurationBlocks.length === 0 && !editMode) {
      errors['general'] = "At least one configuration block is required";
    } else {
      configurationBlocks.forEach((block) => {
        if (block.parameters.length === 0) {
          errors[block.id] = "At least one parameter is required";
        } else {
          block.parameters.forEach((param) => {
            if (!block.values[param]?.trim()) {
              errors[`${block.id}_${param}`] = `${param} value is required`;
            }
          });
        }
      });
    }
  }

  setValidationErrors((prev) => ({
    ...prev,
    newKeyValues: errors,
  }));

  return Object.keys(errors).length === 0;
};

