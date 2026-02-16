// Custom hook for managing form state and validation

import { useState, useCallback } from 'react';
import type {
  ConfigState,
  RuleFormState,
  MappingFormState,
  ValidationErrors,
  ParameterCountryRow,
  ConfigurationBlock,
} from '../types';
import {
  INITIAL_CONFIG_STATE,
  INITIAL_RULE_FORM_STATE,
  INITIAL_MAPPING_FORM_STATE,
  INITIAL_VALIDATION_ERRORS,
} from '../constants';
import {
  validateRuleForm,
  validateMappingForm,
  validateNewKeyValues,
} from '../utils/validation';
import { COUNTRY_RULE_TYPE, REDIRECT_RULE_TYPE } from '../constants';

export const useFormState = () => {
  const [config, setConfig] = useState<ConfigState>(INITIAL_CONFIG_STATE);
  const [ruleForm, setRuleForm] = useState<RuleFormState>(INITIAL_RULE_FORM_STATE);
  const [mappingForm, setMappingForm] = useState<MappingFormState>(INITIAL_MAPPING_FORM_STATE);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(INITIAL_VALIDATION_ERRORS);

  const resetConfig = useCallback(() => {
    setConfig(INITIAL_CONFIG_STATE);
  }, []);

  const resetRuleForm = useCallback(() => {
    setRuleForm(INITIAL_RULE_FORM_STATE);
  }, []);

  const resetMappingForm = useCallback(() => {
    setMappingForm(INITIAL_MAPPING_FORM_STATE);
  }, []);

  const clearValidationErrors = useCallback((
    formType?: 'ruleForm' | 'mappingForm' | 'newKeyValues' | 'selectedCountries'
  ) => {
    if (formType) {
      setValidationErrors((prev) => ({
        ...prev,
        [formType]: formType === 'newKeyValues' ? {} : undefined,
      }));
    } else {
      setValidationErrors(INITIAL_VALIDATION_ERRORS);
    }
  }, []);

  const validateRule = useCallback((): boolean => {
    return validateRuleForm(ruleForm, setValidationErrors);
  }, [ruleForm]);

  const validateMapping = useCallback((): boolean => {
    return validateMappingForm(mappingForm, setValidationErrors);
  }, [mappingForm]);

  const validateNewKeys = useCallback((
    parameterCountryRows: ParameterCountryRow[],
    configurationBlocks: ConfigurationBlock[],
    showAddKeyMode: boolean,
    editMode: boolean
  ): boolean => {
    return validateNewKeyValues(
      ruleForm.ruleName,
      parameterCountryRows,
      configurationBlocks,
      showAddKeyMode,
      editMode,
      setValidationErrors
    );
  }, [ruleForm.ruleName]);

  return {
    // State
    config,
    ruleForm,
    mappingForm,
    validationErrors,
    // Setters
    setConfig,
    setRuleForm,
    setMappingForm,
    setValidationErrors,
    // Resetters
    resetConfig,
    resetRuleForm,
    resetMappingForm,
    // Validators
    validateRule,
    validateMapping,
    validateNewKeys,
    clearValidationErrors,
  };
};

