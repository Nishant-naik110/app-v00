// Table column definitions
export const CONFIG_RULES_COLUMNS = [
  { title: "Rule Name", key: "ruleName" },
  { title: "Status", key: "status" },
  { title: "Whitelist Configuration", key: "whitelistConfiguration" },
  { title: "Rule Configuration", key: "ruleConfiguration" },
];

export const MAPPING_RULES_COLUMNS = [
  { title: "Source", key: "source" },
  { title: "Target", key: "target" },
];

// Default pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Debounce delay for search
export const SEARCH_DEBOUNCE_DELAY = 500;

// Rule types that require special handling
export const COUNTRY_RULE_TYPE = "mf_rule_incorrect_region_country";
export const REDIRECT_RULE_TYPE = "mf_rule_redirect";

// Initial form states
export const INITIAL_CONFIG_STATE = {
  fraudThreshold: "",
  targetUrl: "",
  targetBlockUrl: "",
  redirection: false,
};

export const INITIAL_RULE_FORM_STATE = {
  ruleName: "",
  status: "False",
  whitelistConfiguration: "",
  ruleConfiguration: "",
};

export const INITIAL_MAPPING_FORM_STATE = {
  source: "",
  target: "",
};

export const INITIAL_VALIDATION_ERRORS = {
  ruleForm: {},
  mappingForm: {},
  newKeyValues: {},
};

