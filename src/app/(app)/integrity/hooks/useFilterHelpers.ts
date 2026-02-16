
import type { PublisherApiResponse } from "./useIntegrityDashboard";

/**
 * Helper to build filter state structure for UI components
 */
export interface FilterItem {
  label: string;
  checked: boolean;
  subItems?: FilterItem[];
}

export interface FilterState {
  filters: FilterItem[];
  isSelectAll: boolean;
  selectedCount: number;
  loading: boolean;
}

/**
 * Convert simple array data to Filter component format
 */
export const buildSimpleFilter = (
  data: string[] | undefined,
  selected: string[],
  isLoading: boolean
): FilterState => {
  if (!data || data.length === 0) {
    return {
      filters: [],
      isSelectAll: true,
      selectedCount: 0,
      loading: isLoading,
    };
  }

  const isAllSelected = selected.includes("all") || selected.length === 0;
  
  return {
    filters: data.map((item) => ({
      label: item,
      checked: isAllSelected || selected.includes(item),
    })),
    isSelectAll: isAllSelected,
    selectedCount: isAllSelected ? data.length : selected.length,
    loading: isLoading,
  };
};

/**
 * Convert publisher data to Filter component format
 */
export const buildPublisherFilter = (
  data: PublisherApiResponse | undefined,
  selected: string[],
  isLoading: boolean
): FilterState => {
  if (!data) {
    return {
      filters: [],
      isSelectAll: true,
      selectedCount: 0,
      loading: isLoading,
    };
  }

  const isAllSelected = selected.includes("all") || selected.length === 0;
  
  // For integrity, the key is "Whitelisted Affiliate" instead of "Whitelisted Publisher"
  const whitelistedKey = "Whitelisted Affiliate" in data ? "Whitelisted Affiliate" : "Whitelisted Publisher";
  
  const allPublishers = [
    ...(data.Affiliate || []),
    ...(data[whitelistedKey] || []),
  ];

  const filters: FilterItem[] = [];

  if (data.Affiliate && data.Affiliate.length > 0) {
    filters.push({
      label: "Affiliate",
      checked: isAllSelected || data.Affiliate.some((pub) => selected.includes(pub)),
      subItems: data.Affiliate.map((pub) => ({
        label: pub,
        checked: isAllSelected || selected.includes(pub),
      })),
    });
  }

  if (data[whitelistedKey] && data[whitelistedKey].length > 0) {
    filters.push({
      label: whitelistedKey,
      checked: isAllSelected || data[whitelistedKey].some((pub) => selected.includes(pub)),
      subItems: data[whitelistedKey].map((pub) => ({
        label: pub,
        checked: isAllSelected || selected.includes(pub),
      })),
    });
  }

  return {
    filters,
    isSelectAll: isAllSelected,
    selectedCount: isAllSelected ? allPublishers.length : selected.length,
    loading: isLoading,
  };
};

/**
 * Extract selected values from filter state
 */
export const extractSelectedValues = (filterState: any): string[] => {
  // Handle null/undefined
  if (!filterState) {
    return ["all"];
  }

  // If it's already an array, return it
  if (Array.isArray(filterState)) {
    return filterState.length > 0 ? filterState : ["all"];
  }

  // If selectAll is true, return ["all"]
  if (filterState.isSelectAll) {
    return ["all"];
  }

  const selected: string[] = [];

  // Handle if filters is an object (from Filter component onChange)
  if (filterState.filters && typeof filterState.filters === 'object' && !Array.isArray(filterState.filters)) {
    // filters is an object like { "Affiliate": ["pub1", "pub2"], "Whitelisted Publisher": ["pub3"] }
    Object.entries(filterState.filters).forEach(([key, filter]: [string, any]) => {
      // If filter is an array, it contains the selected publisher names directly
      if (Array.isArray(filter)) {
        selected.push(...filter);
      }
      // If filter has subItems (old structure)
      else if (filter.subItems) {
        filter.subItems.forEach((subItem: any) => {
          if (subItem.checked) {
            selected.push(subItem.label);
          }
        });
      } 
      // If filter is a simple checked item
      else if (filter.checked) {
        selected.push(filter.label);
      }
    });
  } 
  // Handle if filters is an array
  else if (Array.isArray(filterState.filters)) {
    filterState.filters.forEach((filter: FilterItem) => {
      if (filter.subItems) {
        // Has sub-items (like publishers)
        filter.subItems.forEach((subItem) => {
          if (subItem.checked) {
            selected.push(subItem.label);
          }
        });
      } else if (filter.checked) {
        // Simple filter
        selected.push(filter.label);
      }
    });
  }

  return selected.length > 0 ? selected : ["all"];
};
