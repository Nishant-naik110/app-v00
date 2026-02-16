export const ITEMS_PER_PAGE = 10;
export const SEARCH_DEBOUNCE_DELAY = 1000;

export const FRAUD_TOLERANCE_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "average", label: "Average" },
  { value: "strict", label: "Strict" },
] as const;

export const RULE_CONFIG_COLUMNS = [
  { title: "Rule Configuration", key: "rule_configuration" },
  { title: "Whitelist Count", key: "whitelist_count" },
  { title: "Whitelist Threshold", key: "whitelist_threshold" },
] as const;

export const GEO_CONFIG_COLUMNS = [
  { title: "Campaign Parameter", key: "campaign_parameter" },
  { title: "Value of Parameter", key: "parameter_value" },
  { title: "Allowed Geo", key: "allowed_geo" },
] as const;

export const TABLE_HEIGHT = 300;
export const TABLE_HEADER_COLOR = "#f8f9fa";

