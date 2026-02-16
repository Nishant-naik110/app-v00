"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Search, X, Users, Building2, Globe, Megaphone, Calendar, LucideIcon } from "lucide-react";
import EllipsisTooltip from "../EllipsisTooltip";
import MFSpinner from "../MFSpinner";

// Icon mapping for filter types
const getFilterIcon = (filterId: string): LucideIcon => {
  const id = filterId.toLowerCase();
  if (id.includes("publisher")) return Users;
  if (id.includes("agency") || id.includes("vendor")) return Building2;
  if (id.includes("country")) return Globe;
  if (id.includes("campaign")) return Megaphone;
  if (id.includes("event") || id.includes("type")) return Calendar;
  return Users; // Default icon
};


// Constants
const FILTER_CONSTANTS = {
  INITIAL_VISIBLE_ITEMS: 500,
  SCROLL_THRESHOLD: 50,
  SCROLL_OFFSET: 10,
  PAGINATION_INCREMENT: 500,
  POPOVER_WIDTH: "300px",
  POPOVER_MAX_HEIGHT: "70vh",
  FILTER_LIST_MAX_HEIGHT: "60vh",
  SEARCH_ICON_SIZE: 15,
  CHECK_ICON_SIZE: 12,
  NAVIGATION_BUTTON_WIDTH: "w-10",
  DEFAULT_CHECKED_STATE: true,
} as const;

const CSS_CLASSES = {
  FILTER_CONTAINER: "flex flex-wrap gap-2",
  FILTER_PILL: "group relative flex items-center gap-2 rounded-full border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 px-4 py-1 text-subBody font-medium text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105  hover:shadow-md  active:scale-100",
  FILTER_COUNT: "font-semibold text-primary transition-colors duration-300 ",
  POPOVER_CONTENT: "z-[200] flex flex-col",
  HEADER_CONTAINER: "flex items-center flex-shrink-0",
  SEARCH_FORM: "flex mt-2 flex-shrink-0",
  SEARCH_INPUT: "rounded-br-none rounded-tr-none text-subBody h-8",
  SEARCH_BUTTON: "w-8 h-8 rounded-bl-none rounded-tl-none",
  FILTER_LIST_CONTAINER: "relative flex flex-1 min-h-0",
  SCROLL_CONTAINER: "flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent min-h-0 no-scrollbar",
  GROUP_HEADER: "flex items-center bg-gray-50 px-2 py-1.5 rounded-md mb-2 dark:bg-gray-700",
  GROUP_ITEMS: "pl-6 border-l-2 border-gray-200",
  GROUP_ITEM: "flex items-center hover:bg-gray-50 px-2 py-1 rounded dark:hover:bg-gray-700",
  ALPHABET_HEADER: "sticky top-0  text-subBody font-semibold flex items-center justify-center w-5 h-5  bg-background",
  ALPHABET_ITEM: "flex items-center py-1",
  NAVIGATION_CONTAINER: "flex flex-col items-center   overflow-y-auto ",
  NAVIGATION_BUTTON: "text-subBody  rounded hover:bg-background",
  FOOTER_CONTAINER: "flex justify-between flex-shrink-0",
  CLEAR_BUTTON: "w-5 h-5",
  APPLY_BUTTON: "w-5 h-5",
  LOADING_CONTAINER: "grid h-32 place-items-center",
  NO_RESULTS: "p-4 text-center text-gray-500 text-subBody",
} as const;

// Types
export interface FilterItem {
  label: string;
  checked: boolean;
  group?: string;
}

interface SubItem {
  label: string;
  checked: boolean;
}

interface GroupItem {
  label: string;
  checked?: boolean;
  subItems?: SubItem[];
}

type FilterData = 
  | FilterItem[] 
  | { [key: string]: string[] } 
  | GroupItem[];

export interface FilterState {
  filters: FilterData;
  isSelectAll: boolean;
  selectedCount: number;
  loading?: boolean;
  grouped?: boolean;
}

interface FilterProps {
  filter: { [key: string]: FilterState };
  onChange: (state: { [key: string]: FilterState }) => void;
  isSearchable?: boolean;
  onSearch?: (id: string, query: string) => void;
  grouped?: boolean;
  publisherGroups?: { [key: string]: { [groupKey: string]: string[] } };
  popoverWidth?: string;
  popoverMaxHeight?: string;
  filterListMaxHeight?: string;
  singleSelect?: boolean;
}

interface GroupState {
  totalCount: number;
  selectedCount: number;
  allSelected: boolean;
}

type FilterStateMap = { [key: string]: FilterState };
type SearchQueriesMap = { [key: string]: string };
type VisibleItemsMap = { [key: string]: number };
type ScrollContainerRefs = { [key: string]: HTMLDivElement | null };
type GroupedFiltersMap = { [key: string]: FilterItem[] };

// Helper Functions
const isGroupItem = (item: any): item is GroupItem => {
  return item && typeof item === 'object' && Array.isArray(item?.subItems);
};

const isSubItemsStructure = (filters: FilterData): filters is GroupItem[] => {
  return Array.isArray(filters) && filters.some(isGroupItem);
};

const calculateTotalCount = (filterState: FilterState): number => {
  if (isSubItemsStructure(filterState.filters)) {
    return filterState.filters.reduce((sum, group) => {
      return sum + (group.subItems?.length || 0);
    }, 0);
  }
  if (Array.isArray(filterState.filters)) {
    return filterState.filters.length;
  }
  return Object.values(filterState.filters).reduce((sum, items) => sum + items.length, 0);
};

const calculateSelectedCount = (filters: GroupItem[]): number => {
  return filters.reduce((sum, group) => {
    if (group.subItems) {
      return sum + group.subItems.filter(item => item.checked).length;
    }
    return sum;
  }, 0);
};

const calculateTotalItems = (filters: GroupItem[]): number => {
  return filters.reduce((sum, group) => {
    return sum + (group.subItems?.length || 0);
  }, 0);
};

const normalizeSearchQuery = (query: string): string => {
  return query.trim().toLowerCase();
};

const matchesSearch = (text: string, query: string): boolean => {
  return normalizeSearchQuery(text).includes(normalizeSearchQuery(query));
};

export function Filter({
  filter,
  onChange,
  isSearchable = true,
  onSearch,
  grouped = false,
  publisherGroups = {},
  popoverWidth = FILTER_CONSTANTS.POPOVER_WIDTH,
  popoverMaxHeight = FILTER_CONSTANTS.POPOVER_MAX_HEIGHT,
  filterListMaxHeight = FILTER_CONSTANTS.FILTER_LIST_MAX_HEIGHT,
  singleSelect = false,
}: FilterProps) {

  const [localState, setLocalState] = useState<FilterStateMap>(filter);
  const [searchQueries, setSearchQueries] = useState<SearchQueriesMap>({});
  const [visibleItems, setVisibleItems] = useState<VisibleItemsMap>({});
  const scrollContainerRefs = useRef<ScrollContainerRefs>({});
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string }>({});

  // Helper: Check if filters have subItems structure
  const hasSubItemsStructure = useCallback((id: string): boolean => {
    const filterState = localState[id];
    if (!filterState || !Array.isArray(filterState?.filters)) return false;
    return isSubItemsStructure(filterState.filters);
  }, [localState]);

  // Helper function to check subItems structure (for use in useEffect)
  const checkSubItemsStructure = (filters: FilterData): boolean => {
    return Array.isArray(filters) && filters.some(isGroupItem);
  };

  // Update local state when filter prop changes
  useEffect(() => {
    // Check if filters are being reset (all items are selected)
    const isReset = Object.values(filter).every((filterState) => 
      filterState?.isSelectAll === true
    );
    
    // If filters are reset, clear search queries
    if (isReset) {
      setSearchQueries({});
    }
    
    setLocalState(filter);
    
    // Initialize single-select: start with all selected, or track current selection
    if (singleSelect) {
      const newSelectedValues: { [key: string]: string } = {};
      Object.keys(filter).forEach((id) => {
        const filterState = filter[id];
        if (filterState) {
          // If all items are selected (isSelectAll), don't set a specific selectedValue
          // This indicates "all selected" state
          if (filterState.isSelectAll) {
            // Don't set selectedValue - this means "all selected"
            return;
          }
          
          // Otherwise, find the currently selected item
          if (checkSubItemsStructure(filterState.filters)) {
            const filtersArray = filterState.filters as GroupItem[];
            const firstGroup = filtersArray.find((g) => 
              isGroupItem(g) && g?.subItems && Array.isArray(g.subItems) && g.subItems.length > 0
            );
            if (firstGroup && isGroupItem(firstGroup) && firstGroup.subItems) {
              const selectedItem = firstGroup.subItems.find((item: SubItem) => item?.checked);
              if (selectedItem) {
                newSelectedValues[id] = selectedItem.label;
              }
            }
          } else if (Array.isArray(filterState.filters)) {
            const filtersArray = filterState.filters as FilterItem[];
            const selectedItem = filtersArray.find((f) => f?.checked);
            if (selectedItem) {
              newSelectedValues[id] = selectedItem.label;
            }
          }
        }
      });
      setSelectedValues(newSelectedValues);
    }
  }, [filter, singleSelect]);

  // Initialize visible items
  useEffect(() => {
    const initialVisible: VisibleItemsMap = {};
    Object.keys(localState).forEach((id) => {
      initialVisible[id] = FILTER_CONSTANTS.INITIAL_VISIBLE_ITEMS;
    });
    setVisibleItems(initialVisible);
  }, [localState]);

  // Helper: Convert filters to array format
  const getFiltersAsArray = useCallback((id: string): FilterItem[] => {
    const filterState = localState[id];
    if (!filterState) return [];

    if (Array.isArray(filterState?.filters)) {
      if (isSubItemsStructure(filterState.filters)) {
        // Flatten subItems structure
        const filterArray: FilterItem[] = [];
        filterState.filters.forEach((groupItem) => {
          if (isGroupItem(groupItem) && Array.isArray(groupItem?.subItems)) {
            groupItem.subItems?.forEach((item: SubItem) => {
              filterArray.push({
                label: item?.label || String(item),
                checked: item?.checked !== undefined ? item.checked : FILTER_CONSTANTS.DEFAULT_CHECKED_STATE,
                group: groupItem?.label,
              });
            });
          }
        });
        return filterArray;
      }
      // Regular array format
      return filterState.filters as FilterItem[];
    }

    // Convert object format to array
    const filterArray: FilterItem[] = [];
    const filterObj = filterState?.filters as { [key: string]: string[] };
    
    Object.entries(filterObj || {}).forEach(([group, items]) => {
      items?.forEach((label) => {
        filterArray.push({ 
          label, 
          checked: FILTER_CONSTANTS.DEFAULT_CHECKED_STATE, 
          group 
        });
      });
    });

    return filterArray;
  }, [localState]);

  // Helper: Convert flat array back to subItems structure
  const convertToSubItemsStructure = useCallback((id: string, flatArray: FilterItem[]): GroupItem[] => {
    const filterState = localState[id];
    if (!filterState || !Array.isArray(filterState?.filters)) {
      return flatArray as unknown as GroupItem[];
    }

    if (!isSubItemsStructure(filterState.filters)) {
      return flatArray as unknown as GroupItem[];
    }

    // Reconstruct the subItems structure
    return filterState.filters.map((groupItem) => {
      if (Array.isArray(groupItem?.subItems)) {
        const updatedSubItems = flatArray
          .filter((f) => f?.group === groupItem?.label)
          .map((f) => ({
            label: f?.label,
            checked: f?.checked,
          }));
        return {
          ...groupItem,
          subItems: updatedSubItems,
        };
      }
      return groupItem;
    });
  }, [localState]);

  // Helper: Update filter state
  const updateFilterState = useCallback((
    id: string,
    updates: Partial<FilterState>
  ): void => {
    setLocalState((prev) => {
      const filterState = prev?.[id];
      if (!filterState) return prev;

      return {
        ...prev,
        [id]: {
          ...filterState,
          ...updates,
        },
      };
    });
  }, []);

  // Toggle a single filter item
  const toggleFilter = useCallback((id: string, index: number): void => {
    const filterState = localState[id];
    if (!filterState) return;

    const filtersArray = getFiltersAsArray(id);
    if (index < 0 || index >= (filtersArray?.length || 0)) return;

    if (singleSelect) {
      // Single select mode: only one item can be selected (when not in "all selected" state)
      const selectedLabel = filtersArray[index]?.label;
      setSelectedValues((prev) => ({ ...prev, [id]: selectedLabel }));
      
      // Update all filters: only the selected one is checked
      const newFilters = filtersArray.map((f, i) => ({
        ...f,
        checked: i === index,
      }));
      
      const updatedFilters = hasSubItemsStructure(id)
        ? convertToSubItemsStructure(id, newFilters)
        : newFilters;
      
      updateFilterState(id, {
        filters: updatedFilters as FilterData,
        selectedCount: 1,
        isSelectAll: false,
      });
    } else {
      // Multi-select mode: toggle the item
      const newFilters = filtersArray.map((f, i) => 
        i === index ? { ...f, checked: !f?.checked } : f
      );
      
      const selectedCount = newFilters.filter((f) => f?.checked).length;
      const updatedFilters = hasSubItemsStructure(id)
        ? convertToSubItemsStructure(id, newFilters)
        : newFilters;
      
      updateFilterState(id, {
        filters: updatedFilters as FilterData,
        selectedCount: selectedCount,
        isSelectAll: selectedCount === newFilters.length,
      });
    }
  }, [localState, getFiltersAsArray, hasSubItemsStructure, convertToSubItemsStructure, updateFilterState, singleSelect]);

  // Toggle select all
  const toggleSelectAll = useCallback((id: string): void => {
    const filterState = localState[id];
    if (!filterState) return;

    // In single-select mode, toggle between "all selected" and "none selected"
    if (singleSelect) {
      const filtersArray = getFiltersAsArray(id);
      if (filtersArray.length > 0) {
        const currentlyAllSelected = filterState.isSelectAll;
        
        if (currentlyAllSelected) {
          // Deselect all items
          const newFilters = filtersArray.map((f) => ({
            ...f,
            checked: false,
          }));
          
          const updatedFilters = hasSubItemsStructure(id)
            ? convertToSubItemsStructure(id, newFilters)
            : newFilters;
          
          // Remove from selectedValues to indicate "none selected"
          setSelectedValues((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
          
          updateFilterState(id, {
            filters: updatedFilters as FilterData,
            selectedCount: 0,
            isSelectAll: false,
          });
        } else {
          // Select all items
          const newFilters = filtersArray.map((f) => ({
            ...f,
            checked: true,
          }));
          
          const updatedFilters = hasSubItemsStructure(id)
            ? convertToSubItemsStructure(id, newFilters)
            : newFilters;
          
          // Remove from selectedValues to indicate "all selected"
          setSelectedValues((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
          
          updateFilterState(id, {
            filters: updatedFilters as FilterData,
            selectedCount: filtersArray.length,
            isSelectAll: true,
          });
        }
      }
      return;
    }

    if (hasSubItemsStructure(id) && Array.isArray(filterState?.filters)) {
      const newIsSelectAll = !filterState?.isSelectAll;
      const newFilters: GroupItem[] = filterState.filters.map((groupItem) => {
        if (isGroupItem(groupItem) && Array.isArray(groupItem?.subItems)) {
          return {
            ...groupItem,
            checked: newIsSelectAll,
            subItems: groupItem.subItems?.map((item: SubItem) => ({
              ...item,
              checked: newIsSelectAll,
            })),
          };
        }
        return groupItem as GroupItem;
      });

      const totalSelected = calculateSelectedCount(newFilters);
      updateFilterState(id, {
        filters: newFilters as FilterData,
        isSelectAll: newIsSelectAll,
        selectedCount: totalSelected,
      });
      return;
    }

    // Regular structure
    const filtersArray = getFiltersAsArray(id);
    const newIsSelectAll = !filterState?.isSelectAll;
    const newFilters = filtersArray.map((f) => ({
      ...f,
      checked: newIsSelectAll,
    }));

    const updatedFilters = hasSubItemsStructure(id)
      ? convertToSubItemsStructure(id, newFilters)
      : newFilters;

    updateFilterState(id, {
      filters: updatedFilters as FilterData,
      isSelectAll: newIsSelectAll,
      selectedCount: newIsSelectAll ? newFilters.length : 0,
    });
  }, [localState, hasSubItemsStructure, getFiltersAsArray, convertToSubItemsStructure, updateFilterState, singleSelect]);

  // Clear all filters
  const clearAll = useCallback((id: string): void => {
    const filterState = localState[id];
    if (!filterState) return;

    if (hasSubItemsStructure(id) && Array.isArray(filterState?.filters)) {
      const newFilters: GroupItem[] = filterState.filters.map((groupItem) => {
        if (isGroupItem(groupItem) && Array.isArray(groupItem?.subItems)) {
          return {
            ...groupItem,
            checked: false,
            subItems: groupItem.subItems?.map((item: SubItem) => ({
              ...item,
              checked: false,
            })),
          };
        }
        return groupItem as GroupItem;
      });

      updateFilterState(id, {
        filters: newFilters as FilterData,
        isSelectAll: false,
        selectedCount: 0,
      });
      return;
    }

    // Regular structure
    const filtersArray = getFiltersAsArray(id);
    const newFilters = filtersArray.map((f) => ({
      ...f,
      checked: false,
    }));

    const updatedFilters = hasSubItemsStructure(id)
      ? convertToSubItemsStructure(id, newFilters)
      : newFilters;

    updateFilterState(id, {
      filters: updatedFilters as FilterData,
      isSelectAll: false,
      selectedCount: 0,
    });
  }, [localState, hasSubItemsStructure, getFiltersAsArray, convertToSubItemsStructure, updateFilterState]);

  // Toggle entire group
  const toggleGroup = useCallback((id: string, groupKey: string): void => {
    const filterState = localState[id];
    if (!filterState) return;

    const filtersArray = getFiltersAsArray(id);
    const groupItems = filtersArray.filter((f) => f?.group === groupKey);
    
    if (singleSelect) {
      // In single-select mode, select the first item in the group
      if (groupItems.length > 0) {
        const firstItem = groupItems[0];
        const firstIndex = filtersArray.findIndex((f) => f?.label === firstItem?.label);
        if (firstIndex >= 0) {
          toggleFilter(id, firstIndex);
        }
      }
      return;
    }

    const allChecked = groupItems.every((f) => f?.checked);
    const shouldCheck = !allChecked;

    const newFilters = filtersArray.map((f) =>
      f?.group === groupKey ? { ...f, checked: shouldCheck } : f
    );

    const selectedCount = newFilters.filter((f) => f?.checked).length;
    const updatedFilters = hasSubItemsStructure(id)
      ? convertToSubItemsStructure(id, newFilters)
      : newFilters;

    updateFilterState(id, {
      filters: updatedFilters as FilterData,
      selectedCount: selectedCount,
      isSelectAll: selectedCount === newFilters.length,
    });
  }, [localState, getFiltersAsArray, hasSubItemsStructure, convertToSubItemsStructure, updateFilterState, singleSelect, toggleFilter]);

  // Handle search
  const handleSearchChange = useCallback((id: string, query: string): void => {
    setSearchQueries((prev) => ({ ...prev, [id]: query }));
    if (isSearchable && onSearch) {
      onSearch?.(id, query);
    }
  }, [isSearchable, onSearch]);

  // Get filtered filters based on search
  const getFilteredFilters = useCallback((id: string): FilterItem[] => {
    const filtersArray = getFiltersAsArray(id);
    const searchQuery = searchQueries?.[id] || "";
    
    if (!searchQuery?.trim()) {
      return filtersArray;
    }

    return filtersArray.filter((filter) =>
      matchesSearch(filter?.label || "", searchQuery)
    );
  }, [getFiltersAsArray, searchQueries]);

  // Group filters by first letter
  const getGroupedByLetter = useCallback((filters: FilterItem[]): GroupedFiltersMap => {
    const groups: GroupedFiltersMap = {};
    
    filters.forEach((filter) => {
      const firstLetter = filter?.label?.charAt(0)?.toUpperCase() || "";
      if (firstLetter && !groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      if (firstLetter) {
        groups[firstLetter]?.push(filter);
      }
    });
    
    return groups;
  }, []);

  // Group filters by group key
  const getGroupedByKey = useCallback((id: string, filters: FilterItem[]): GroupedFiltersMap => {
    if (!grouped) {
      return { All: filters };
    }

    // Try to find publisherGroups for this filter ID
    // First try exact match, then try to find any matching key
    let groupsConfig: { [groupKey: string]: string[] } | undefined = publisherGroups?.[id];
    
    // If exact match not found, try to find by checking all keys
    if (!groupsConfig && Object.keys(publisherGroups || {}).length > 0) {
      // Try to find a matching key (case-insensitive or partial match)
      const matchingKey = Object.keys(publisherGroups || {}).find(
        (key) => key?.toLowerCase() === id?.toLowerCase() || 
                 id?.toLowerCase()?.includes(key?.toLowerCase() || "") ||
                 key?.toLowerCase()?.includes(id?.toLowerCase() || "")
      );
      if (matchingKey) {
        groupsConfig = publisherGroups?.[matchingKey];
      }
    }

    // If still no config found, extract groups from filter data itself
    if (!groupsConfig) {
      const groups: GroupedFiltersMap = {};
      filters.forEach((filter) => {
        if (filter?.group) {
          if (!groups[filter.group]) {
            groups[filter.group] = [];
          }
          groups[filter.group]?.push(filter);
        }
      });
      return Object.keys(groups).length > 0 ? groups : { All: filters };
    }

    const groups: GroupedFiltersMap = {};
    
    // Initialize groups from publisherGroups config
    Object.keys(groupsConfig || {}).forEach((groupKey) => {
      groups[groupKey] = [];
    });

    // Populate groups with filters
    filters.forEach((filter) => {
      if (filter?.group) {
        // If group exists in config, use it; otherwise create dynamically
        if (groups[filter.group]) {
          groups[filter.group]?.push(filter);
        } else {
          // Dynamically add group if not in config
          if (!groups[filter.group]) {
            groups[filter.group] = [];
          }
          groups[filter.group]?.push(filter);
        }
      }
    });

    return Object.keys(groups).length > 0 ? groups : { All: filters };
  }, [grouped, publisherGroups]);

  // Get group state
  const getGroupState = useCallback((id: string, groupKey: string): GroupState => {
    const filtersArray = getFiltersAsArray(id);
    const groupItems = filtersArray.filter((f) => f?.group === groupKey);
    const totalCount = groupItems.length;
    const selectedCount = groupItems.filter((f) => f?.checked).length;
    const allSelected = totalCount > 0 && selectedCount === totalCount;

    return { totalCount, selectedCount, allSelected };
  }, [getFiltersAsArray]);

  // Handle scroll for pagination
  const handleScroll = useCallback((id: string): void => {
    const container = scrollContainerRefs.current?.[id];
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < FILTER_CONSTANTS.SCROLL_THRESHOLD) {
      setVisibleItems((prev) => ({
        ...prev,
        [id]: (prev?.[id] || FILTER_CONSTANTS.INITIAL_VISIBLE_ITEMS) + FILTER_CONSTANTS.PAGINATION_INCREMENT,
      }));
    }
  }, []);

  // Handle submit
  const handleSubmit = useCallback((id: string): void => {
    const filterState = localState[id];
    if (!filterState) return;

    const searchQuery = searchQueries?.[id] || "";
    const isSearching = searchQuery.trim() !== "";
    const filtersArray = getFiltersAsArray(id);
    const filteredFilters = getFilteredFilters(id);

    if (singleSelect) {
      // In single-select mode, return the selected value
      const selectedLabel = selectedValues[id];
      if (selectedLabel) {
        // Update the filter state to reflect the single selection
        const newFilters = filtersArray.map((f) => ({
          ...f,
          checked: f?.label === selectedLabel,
        }));
        
        const updatedFilters = hasSubItemsStructure(id)
          ? convertToSubItemsStructure(id, newFilters)
          : newFilters;
        
        const updatedState = {
          ...localState,
          [id]: {
            ...filterState,
            filters: updatedFilters as FilterData,
            selectedCount: 1,
            isSelectAll: false,
          },
        };
        
        onChange?.(updatedState);
      }
      return;
    }

    if (grouped && hasSubItemsStructure(id)) {
      const selectedByGroup: { [key: string]: string[] } = {};
      let totalSelectedCount = 0;
      
      if (Array.isArray(filterState?.filters)) {
        filterState.filters.forEach((groupItem) => {
          if (isGroupItem(groupItem) && Array.isArray(groupItem?.subItems)) {
            let selectedItems: string[] = [];
            
            if (isSearching) {
              // Check if group label matches the search
              const groupMatchesSearch = matchesSearch(groupItem?.label || "", searchQuery);
              
              if (groupMatchesSearch) {
                // If group matches, include all checked items from the group
                selectedItems = groupItem.subItems
                  .filter((item) => item?.checked)
                  .map((item) => item?.label)
                  .filter((label) => label) || [];
              } else {
                // If group doesn't match, only include checked items that match the search
                selectedItems = groupItem.subItems
                  .filter((item) => item?.checked && matchesSearch(item?.label || "", searchQuery))
                  .map((item) => item?.label)
                  .filter((label) => label) || [];
              }
            } else {
              // When not searching, include all checked items
              selectedItems = groupItem.subItems
                .filter((item) => item?.checked)
                .map((item) => item?.label)
                .filter((label) => label) || [];
            }
            
            // Only include group if it has selected items
            if (selectedItems.length > 0) {
              selectedByGroup[groupItem?.label || ""] = selectedItems;
              totalSelectedCount += selectedItems.length;
            }
          }
        });
      }

      // Calculate total items for isSelectAll check
      // For grouped filters, count all subItems across all groups
      let totalItems = 0;
      if (Array.isArray(filterState?.filters)) {
        filterState.filters.forEach((groupItem) => {
          if (isGroupItem(groupItem) && Array.isArray(groupItem?.subItems)) {
            totalItems += groupItem.subItems.length;
          }
        });
      }
      const isSelectAll = totalSelectedCount === totalItems && totalSelectedCount > 0;

      // Ensure filters is always an object, even if empty
      const filtersToSend = Object.keys(selectedByGroup).length > 0 
        ? selectedByGroup 
        : {};

      const updatedState = {
        ...localState,
        [id]: {
          ...filterState,
          filters: filtersToSend as FilterData,
          isSelectAll,
          selectedCount: totalSelectedCount,
        },
      };

      // Always call onChange, even if empty, so parent can handle it
      if (onChange) {
        onChange(updatedState);
      }
    } else if (grouped) {
      // Find matching publisherGroups config
      let groupsConfig: { [groupKey: string]: string[] } | undefined = publisherGroups?.[id];
      
      if (!groupsConfig && Object.keys(publisherGroups || {}).length > 0) {
        const matchingKey = Object.keys(publisherGroups || {}).find(
          (key) => key?.toLowerCase() === id?.toLowerCase() || 
                   id?.toLowerCase()?.includes(key?.toLowerCase() || "") ||
                   key?.toLowerCase()?.includes(id?.toLowerCase() || "")
        );
        if (matchingKey) {
          groupsConfig = publisherGroups?.[matchingKey];
        }
      }

      const selectedByGroup: { [key: string]: string[] } = {};
      
      // Initialize groups from config if available, otherwise extract from filters
      if (groupsConfig) {
        Object.keys(groupsConfig).forEach((groupKey) => {
          selectedByGroup[groupKey] = [];
        });
      }

      // When searching, only process filtered filters; otherwise process all filters
      const itemsToProcess = isSearching ? filteredFilters : filtersArray;
      itemsToProcess.forEach((filter) => {
        if (filter?.checked && filter?.group) {
          if (!selectedByGroup[filter.group]) {
            selectedByGroup[filter.group] = [];
          }
          selectedByGroup[filter.group]?.push(filter?.label || "");
        }
      });

      const updatedState = {
        ...localState,
        [id]: {
          ...filterState,
          filters: selectedByGroup as FilterData,
        },
      };

      onChange?.(updatedState);
    } else {
      // When searching, only submit the filtered selected items
      // When not searching, submit all selected items
      let newFilters: FilterItem[];
      
      if (isSearching) {
        // Only include items that match the search query AND are selected
        const filteredSelected = filteredFilters.filter(f => f.checked);
        newFilters = filteredSelected.map(f => ({ ...f, checked: true }));
      } else {
        // Include all filters with their current checked state
        newFilters = filtersArray;
      }
      
      const actualSelectedCount = isSearching
        ? filteredFilters.filter(f => f.checked).length
        : filtersArray.filter(f => f.checked).length;
      const totalCount = filtersArray.length;
      const actualIsSelectAll = !isSearching && actualSelectedCount === totalCount;
      
      const updatedFilters = hasSubItemsStructure(id)
        ? convertToSubItemsStructure(id, newFilters)
        : newFilters;
      
      const updatedState = {
        ...localState,
        [id]: {
          ...filterState,
          filters: updatedFilters as FilterData,
          isSelectAll: actualIsSelectAll,
          selectedCount: actualSelectedCount,
        },
      };

      onChange?.(updatedState);
    }
  }, [localState, grouped, hasSubItemsStructure, publisherGroups, getFiltersAsArray, getFilteredFilters, onChange, singleSelect, selectedValues, convertToSubItemsStructure, searchQueries]);

  // Scroll to element
  const scrollToElement = useCallback((id: string, key: string): void => {
    const container = scrollContainerRefs.current?.[id];
    const element = document.getElementById(`filter-${id}-${key}`);
    
    if (element && container) {
      const containerRect = container?.getBoundingClientRect();
      const elementRect = element?.getBoundingClientRect();
      const scrollTop = (container?.scrollTop || 0) + ((elementRect?.top || 0) - (containerRect?.top || 0)) - FILTER_CONSTANTS.SCROLL_OFFSET;
      container?.scrollTo({ top: scrollTop, behavior: "smooth" });
    } else if (element) {
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Render filter items
  const renderFilterItems = useMemo(() => {
    return Object.entries(localState).map(([id, filterState]) => {
      const totalCount = calculateTotalCount(filterState);
      const filtersArray = getFiltersAsArray(id);
      const filteredFilters = getFilteredFilters(id);
      // Check if grouped view should be shown
      // Try exact match first, then fallback to dynamic detection
      const hasPublisherGroups = publisherGroups?.[id] || 
        Object.keys(publisherGroups || {}).some(key => 
          key?.toLowerCase() === id?.toLowerCase() ||
          id?.toLowerCase()?.includes(key?.toLowerCase() || "") ||
          key?.toLowerCase()?.includes(id?.toLowerCase() || "")
        );
      const isGroupedView = grouped && (hasPublisherGroups || hasSubItemsStructure(id));
      const searchQuery = searchQueries?.[id] || "";
      
      // Get navigation keys and grouped filters  
      let groupKeys: string[] = [];
      let groupedFiltersMap: GroupedFiltersMap = {};
      
      if (isGroupedView && hasSubItemsStructure(id)) {
        const currentFilterState = localState[id];
        if (currentFilterState && Array.isArray(currentFilterState?.filters)) {
          const filtersArray = currentFilterState.filters as GroupItem[];
          let allGroupKeys = filtersArray
            .map((g) => g?.label)
            .filter((label: string) => label);
          
          if (searchQuery?.trim()) {
            allGroupKeys = allGroupKeys.filter((label: string) => {
              const groupItem = filtersArray.find((g) => g?.label === label);
              if (!isGroupItem(groupItem) || !Array.isArray(groupItem?.subItems)) return false;
              
              const groupMatches = matchesSearch(label, searchQuery);
              const subItemMatches = groupItem.subItems?.some((item: SubItem) =>
                matchesSearch(item?.label || "", searchQuery)
              );
              return groupMatches || subItemMatches;
            });
          }
          
          groupKeys = allGroupKeys.sort();
        }
      } else if (isGroupedView && !hasSubItemsStructure(id)) {
        groupedFiltersMap = getGroupedByKey(id, filteredFilters);
        groupKeys = Object.keys(groupedFiltersMap).sort();
      } else {
        groupedFiltersMap = getGroupedByLetter(filteredFilters);
        groupKeys = Object.keys(groupedFiltersMap).sort();
      }

      const hasNoData = totalCount === 0;
      
      return (
        <Popover key={id}>
          <PopoverTrigger>
            <div className={CSS_CLASSES.FILTER_PILL}>
              {(() => {
                const FilterIcon = getFilterIcon(id);
                return <FilterIcon className="w-3.5 h-3.5 text-primary/70 group-hover:text-primary transition-colors duration-300 flex-shrink-0" />;
              })()}
              <span className="text-subBody ">{id}</span>
              <span className="h-4 w-px bg-border/60 transition-colors duration-300 group-hover:bg-primary/40"></span>
              <span className={CSS_CLASSES.FILTER_COUNT}>
                {filterState.isSelectAll
                  ? "All"
                  : hasNoData
                  ? "0"
                  : `${filterState.selectedCount}/${totalCount}`}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent 
            className={CSS_CLASSES.POPOVER_CONTENT}
            style={{ width: popoverWidth, maxHeight: popoverMaxHeight }}
          >
            {/* Header */}
            <div className={CSS_CLASSES.HEADER_CONTAINER}>
              <Checkbox
                title="Select All"
                checked={filterState.isSelectAll}
                onClick={() => toggleSelectAll(id)}
              />
              <p className="ml-2  text-subBody">{id}</p>
              <p className="ml-auto text-subBody text-primary dark:text-white text-small-font">
                {hasNoData
                  ? "0"
                  : singleSelect 
                  ? (filterState.isSelectAll 
                      ? "All" 
                      : (filterState?.selectedCount > 0 ? "1 selected" : "0 selected"))
                  : `${filterState?.selectedCount || 0}/${totalCount}`
                }
              </p>
            </div>

            {/* Search */}
            <form
              className={CSS_CLASSES.SEARCH_FORM}
              onSubmit={(e) => {
                e.preventDefault();
                if (isSearchable && onSearch) {
                  onSearch?.(id, searchQueries?.[id] || "");
                }
              }}
            >
              <Input
                className={CSS_CLASSES.SEARCH_INPUT}
                type="text"
                placeholder="Search..."
                value={searchQueries?.[id] || ""}
                onChange={(e) => handleSearchChange(id, e?.target?.value || "")}
              />
              <Button
                variant="default"
                size="icon-xs"
                className={CSS_CLASSES.SEARCH_BUTTON}
                type="submit"
              >
                <Search size={FILTER_CONSTANTS.SEARCH_ICON_SIZE} />
              </Button>
            </form>

            <hr className="my-2 flex-shrink-0" />

            {/* Filter List */}
            {!filterState.loading && (
              <div className={CSS_CLASSES.FILTER_LIST_CONTAINER}>
                <div
                  ref={(el) => {
                    if (scrollContainerRefs.current) {
                      scrollContainerRefs.current[id] = el;
                    }
                  }}
                  className={CSS_CLASSES.SCROLL_CONTAINER}
                  onScroll={() => handleScroll(id)}
                >
                  {isGroupedView && hasSubItemsStructure(id) ? (
                    <SubItemsView
                      id={id}
                      filterState={filterState}
                      searchQuery={searchQuery}
                      localState={localState}
                      setLocalState={setLocalState}
                      updateFilterState={updateFilterState}
                      singleSelect={singleSelect}
                      selectedValue={selectedValues[id]}
                      onRadioChange={(value) => {
                        const filtersArray = getFiltersAsArray(id);
                        const index = filtersArray.findIndex((f) => f?.label === value);
                        if (index >= 0) {
                          toggleFilter(id, index);
                        }
                      }}
                    />
                  ) : isGroupedView ? (
                    <GroupedView
                      id={id}
                      groupKeys={groupKeys}
                      groupedFilters={groupedFiltersMap}
                      searchQuery={searchQuery}
                      filtersArray={filtersArray}
                      getGroupState={getGroupState}
                      toggleGroup={toggleGroup}
                      toggleFilter={toggleFilter}
                      singleSelect={singleSelect}
                      selectedValue={selectedValues[id]}
                      localState={localState}
                      onRadioChange={(value) => {
                        const index = filtersArray.findIndex((f) => f?.label === value);
                        if (index >= 0) {
                          toggleFilter(id, index);
                        }
                      }}
                    />
                  ) : (
                    <AlphabeticalView
                      id={id}
                      groupKeys={groupKeys}
                      groupedFilters={groupedFiltersMap}
                      searchQuery={searchQuery}
                      filtersArray={filtersArray}
                      toggleFilter={toggleFilter}
                      singleSelect={singleSelect}
                      selectedValue={selectedValues[id]}
                      localState={localState}
                      onRadioChange={(value) => {
                        const index = filtersArray.findIndex((f) => f?.label === value);
                        if (index >= 0) {
                          toggleFilter(id, index);
                        }
                      }}
                    />
                  )}
                </div>

                {/* Navigation */}
                {groupKeys.length > 0 && (
                  <div className={`${CSS_CLASSES.NAVIGATION_CONTAINER} ${FILTER_CONSTANTS.NAVIGATION_BUTTON_WIDTH}`}>
                    {groupKeys.map((key) => {
                      const displayChar = key?.charAt(0)?.toUpperCase() || "";
                      return (
                        <button
                          key={key}
                          className="text-subBody  rounded hover:bg-background"
                          onClick={() => scrollToElement(id, key)}
                          title={key}
                        >
                          {displayChar}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {filterState.loading && (
              <div className={CSS_CLASSES.LOADING_CONTAINER}>
                <MFSpinner />
              </div>
            )}

            <hr className="my-2 flex-shrink-0" />

            {/* Footer Actions */}
            <div className={CSS_CLASSES.FOOTER_CONTAINER}>
              <Button
               size="icon-xs"
                  title="Clear All"
                className={CSS_CLASSES.APPLY_BUTTON}
                onClick={() => clearAll(id)}
              >
                <X size={FILTER_CONSTANTS.CHECK_ICON_SIZE} />
              </Button>
              <PopoverClose>
                <Button
                  className={CSS_CLASSES.APPLY_BUTTON}
                  size="icon-xs"
                  title="Apply"
                  onClick={() => handleSubmit(id)}
                >
                  <Check size={FILTER_CONSTANTS.CHECK_ICON_SIZE} />
                </Button>
              </PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      );
    });
  }, [
    localState,
    searchQueries,
    grouped,
    publisherGroups,
    hasSubItemsStructure,
    getFiltersAsArray,
    getFilteredFilters,
    getGroupedByKey,
    getGroupedByLetter,
    getGroupState,
    toggleSelectAll,
    toggleGroup,
    toggleFilter,
    clearAll,
    handleSubmit,
    handleSearchChange,
    handleScroll,
    scrollToElement,
    isSearchable,
    onSearch,
    updateFilterState,
    setLocalState,
    singleSelect,
    selectedValues,
    getFiltersAsArray,
  ]);

  return <div className={CSS_CLASSES.FILTER_CONTAINER}>{renderFilterItems}</div>;
}

// Sub-components for better organization
interface SubItemsViewProps {
  id: string;
  filterState: FilterState;
  searchQuery: string;
  localState: FilterStateMap;
  setLocalState: React.Dispatch<React.SetStateAction<FilterStateMap>>;
  updateFilterState: (id: string, updates: Partial<FilterState>) => void;
  singleSelect?: boolean;
  selectedValue?: string;
  onRadioChange?: (value: string) => void;
}

const SubItemsView = ({
  id,
  filterState,
  searchQuery,
  localState,
  setLocalState,
  updateFilterState,
  singleSelect = false,
  selectedValue,
  onRadioChange,
}: SubItemsViewProps) => {
  if (!Array.isArray(filterState.filters)) return null;

  // Check if there's no data at all
  if (filterState.filters.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-subBody text-muted-foreground">No data found</p>
      </div>
    );
  }

  // Check if all groups have no subItems
  const allGroupsHaveNoData = filterState.filters.every((groupItem: any) => {
    if (!isGroupItem(groupItem) || !groupItem.subItems) return true;
    return groupItem.subItems.length === 0;
  });

  if (allGroupsHaveNoData) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-subBody text-muted-foreground">No data found</p>
      </div>
    );
  }

  if (singleSelect) {
    // Check if all items are selected (isSelectAll state)
    const allSelected = filterState.isSelectAll;
    
    if (allSelected) {
      // Show all items as checked (but not as radio buttons since all are selected)
      return (
        <div className="flex flex-col gap-2">
          {filterState.filters.map((groupItem: any, groupIndex: number) => {
            if (!isGroupItem(groupItem) || !groupItem.subItems) return null;
            
            const originalSubItems = groupItem?.subItems || [];
            let displaySubItems = originalSubItems;
            
            if (searchQuery?.trim()) {
              displaySubItems = originalSubItems.filter((item) =>
                matchesSearch(item?.label || "", searchQuery) ||
                matchesSearch(groupItem?.label || "", searchQuery)
              );
            }
            
            if (searchQuery?.trim() && displaySubItems.length === 0) return null;
            
            return (
              <div key={groupItem.label || groupIndex} id={`filter-${id}-${groupItem.label}`} className="mb-4">
                <div className={CSS_CLASSES.GROUP_HEADER}>
                  <p className="ml-2 text-body">{groupItem.label}</p>
                  <p className="ml-auto text-subBody text-muted-foreground">
                    {displaySubItems.length} items
                  </p>
                </div>
                <div className={CSS_CLASSES.GROUP_ITEMS}>
                  {displaySubItems.map((item, itemIndex) => {
                    return (
                      <div
                        key={item?.label || itemIndex}
                        className={`${CSS_CLASSES.GROUP_ITEM}`}
                      >
                        <Checkbox
                          checked={true}
                          disabled={true}
                        />
                        <p className="ml-2 text-subBody">{item?.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Show checkboxes when not all selected (single-select mode)
    return (
      <div className="flex flex-col gap-2">
        {filterState.filters.map((groupItem: any, groupIndex: number) => {
          if (!isGroupItem(groupItem) || !groupItem.subItems) return null;
          
          const originalSubItems = groupItem?.subItems || [];
          let displaySubItems = originalSubItems;
          
          if (searchQuery?.trim()) {
            displaySubItems = originalSubItems.filter((item) =>
              matchesSearch(item?.label || "", searchQuery) ||
              matchesSearch(groupItem?.label || "", searchQuery)
            );
          }
          
          if (searchQuery?.trim() && displaySubItems.length === 0) return null;
          
          return (
            <div key={groupItem.label || groupIndex} id={`filter-${id}-${groupItem.label}`} className="mb-4">
              <div className={CSS_CLASSES.GROUP_HEADER}>
                <p className="ml-2 text-body">{groupItem.label}</p>
                <p className="ml-auto text-subBody text-muted-foreground">
                  {displaySubItems.length} items
                </p>
              </div>
              <div className={CSS_CLASSES.GROUP_ITEMS}>
                {displaySubItems.map((item, itemIndex) => {
                  const isSelected = selectedValue === item?.label;
                  return (
                    <div
                      key={item?.label || itemIndex}
                      className={`${CSS_CLASSES.GROUP_ITEM} cursor-pointer`}
                      onClick={() => onRadioChange?.(item?.label || "")}
                    >
                      <Checkbox
                        checked={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRadioChange?.(item?.label || "");
                        }}
                      />
                      <p className="ml-2 text-subBody">{item?.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {filterState.filters.map((groupItem: any, groupIndex: number) => {
        if (!isGroupItem(groupItem) || !groupItem.subItems) return null;
        
        const originalSubItems = groupItem?.subItems || [];
        let displaySubItems = originalSubItems;
        
        if (searchQuery?.trim()) {
          displaySubItems = originalSubItems.filter((item) =>
            matchesSearch(item?.label || "", searchQuery) ||
            matchesSearch(groupItem?.label || "", searchQuery)
          );
        }
        
        if (searchQuery?.trim() && displaySubItems.length === 0) return null;
        
        const selectedSubItems = originalSubItems.filter((item) => item?.checked).length;
        const allSubItemsSelected = originalSubItems.length > 0 && selectedSubItems === originalSubItems.length;
        
        const handleGroupToggle = () => {
          const currentFilterState = localState[id];
          if (!currentFilterState || !Array.isArray(currentFilterState.filters)) return;
          
          const newFilters = currentFilterState.filters.map((g: any, idx: number) => {
            if (idx === groupIndex && isGroupItem(g) && g.subItems) {
              const shouldCheck = !allSubItemsSelected;
              return {
                ...g,
                checked: shouldCheck,
                subItems: g.subItems.map((item) => ({
                  ...item,
                  checked: shouldCheck,
                })),
              };
            }
            return g;
          });
          
          const totalSelected = calculateSelectedCount(newFilters as GroupItem[]);
          const totalItems = calculateTotalItems(newFilters as GroupItem[]);
          
          updateFilterState(id, {
            filters: newFilters as FilterData,
            selectedCount: totalSelected,
            isSelectAll: totalSelected === totalItems,
          });
        };

        const handleItemToggle = (itemIndex: number) => {
          const currentFilterState = localState[id];
          if (!currentFilterState || !Array.isArray(currentFilterState?.filters)) return;
          
          const newFilters = currentFilterState.filters.map((g: any, gIdx: number) => {
            if (gIdx === groupIndex && isGroupItem(g) && Array.isArray(g?.subItems)) {
              const updatedSubItems = g.subItems?.map((subItem, sIdx) =>
                sIdx === itemIndex ? { ...subItem, checked: !subItem?.checked } : subItem
              ) || [];
              
              const allSelected = updatedSubItems.every((si) => si?.checked);
              
              return {
                ...g,
                checked: allSelected,
                subItems: updatedSubItems,
              };
            }
            return g;
          });
          
          const totalSelected = calculateSelectedCount(newFilters as GroupItem[]);
          const totalItems = calculateTotalItems(newFilters as GroupItem[]);
          
          updateFilterState(id, {
            filters: newFilters as FilterData,
            selectedCount: totalSelected,
            isSelectAll: totalSelected === totalItems,
          });
        };

        return (
          <div key={groupItem.label || groupIndex} id={`filter-${id}-${groupItem.label}`} className="mb-4">
            <div 
              className={`${CSS_CLASSES.GROUP_HEADER} cursor-pointer`}
              onClick={handleGroupToggle}
            >
              <Checkbox
                title={groupItem.label}
                checked={allSubItemsSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGroupToggle();
                }}
              />
              <p className="ml-2  text-body">{groupItem.label}</p>
              <p className="ml-auto text-subBody text-muted-foreground">
                {selectedSubItems}/{originalSubItems.length}
              </p>
            </div>
            <div className={CSS_CLASSES.GROUP_ITEMS}>
              {displaySubItems.map((item, itemIndex) => {
                const originalItemIndex = originalSubItems.findIndex(
                  (origItem) => origItem?.label === item?.label
                );
                return (
                  <div
                    key={item?.label || originalItemIndex}
                    className={`${CSS_CLASSES.GROUP_ITEM} cursor-pointer`}
                    onClick={() => handleItemToggle(originalItemIndex)}
                  >
                    <Checkbox
                      title={item?.label || ""}
                      checked={item?.checked || false}
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleItemToggle(originalItemIndex);
                      }}
                    />
                    <p className="ml-2 text-subBody">{item?.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface GroupedViewProps {
  id: string;
  groupKeys: string[];
  groupedFilters: GroupedFiltersMap;
  searchQuery: string;
  filtersArray: FilterItem[];
  getGroupState: (id: string, groupKey: string) => GroupState;
  toggleGroup: (id: string, groupKey: string) => void;
  toggleFilter: (id: string, index: number) => void;
  singleSelect?: boolean;
  selectedValue?: string;
  localState: FilterStateMap;
  onRadioChange?: (value: string) => void;
}

const GroupedView = ({
  id,
  groupKeys,
  groupedFilters,
  searchQuery,
  filtersArray,
  getGroupState,
  toggleGroup,
  toggleFilter,
  singleSelect = false,
  selectedValue,
  localState,
  onRadioChange,
}:GroupedViewProps) => {
  const filteredGroupKeys = searchQuery.trim()
    ? groupKeys.filter((groupKey) => {
        const groupItems = groupedFilters[groupKey] || [];
        return groupItems.length > 0;
      })
    : groupKeys;
  
  if (filteredGroupKeys.length === 0 && searchQuery.trim()) {
    return (
      <div className={CSS_CLASSES.NO_RESULTS}>
        No results found for "{searchQuery}"
      </div>
    );
  }

  if (singleSelect) {
    // Get filter state to check if all are selected
    const filterState = localState[id];
    const allSelected = filterState?.isSelectAll;
    
    // Check if all groups have no data
    const allGroupsHaveNoData = filteredGroupKeys.every((groupKey) => {
      const groupItems = groupedFilters[groupKey] || [];
      return groupItems.length === 0;
    });

    if (allGroupsHaveNoData && filteredGroupKeys.length > 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-subBody text-muted-foreground">No data found</p>
        </div>
      );
    }

    if (allSelected) {
      // Show all items as checked
      return (
        <div className="flex flex-col gap-2">
          {filteredGroupKeys.map((groupKey) => {
            const groupItems = groupedFilters[groupKey] || [];
            const hasNoData = groupItems.length === 0;
            
            // Skip rendering groups with no data
            if (hasNoData) {
              return null;
            }
            
            return (
              <div key={groupKey} id={`filter-${id}-${groupKey}`} className="mb-4">
                <div className={CSS_CLASSES.GROUP_HEADER}>
                  <p className="ml-2 text-subBody">{groupKey}</p>
                  <p className="ml-auto text-subBody text-muted-foreground">
                    {`${groupItems.length} items`}
                  </p>
                </div>
                <div className={CSS_CLASSES.GROUP_ITEMS}>
                  {groupItems.map((item) => {
                    return (
                      <div
                        key={item?.label}
                        className={CSS_CLASSES.GROUP_ITEM}
                      >
                        <Checkbox
                          checked={true}
                          disabled={true}
                        />
                        <p className="ml-2 text-subBody">{item?.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Check if all groups have no data (for single-select mode when not all selected)
    const allGroupsHaveNoDataForSingleSelect = filteredGroupKeys.every((groupKey) => {
      const groupItems = groupedFilters[groupKey] || [];
      return groupItems.length === 0;
    });

    if (allGroupsHaveNoDataForSingleSelect && filteredGroupKeys.length > 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-subBody text-muted-foreground">No data found</p>
        </div>
      );
    }

    // Show checkboxes when not all selected (single-select mode)
    return (
      <div className="flex flex-col gap-2">
        {filteredGroupKeys.map((groupKey) => {
          const groupItems = groupedFilters[groupKey] || [];
          const hasNoData = groupItems.length === 0;
          
          // Skip rendering groups with no data
          if (hasNoData) {
            return null;
          }
          
          return (
            <div key={groupKey} id={`filter-${id}-${groupKey}`} className="mb-4">
              <div className={CSS_CLASSES.GROUP_HEADER}>
                <p className="ml-2 text-subBody">{groupKey}</p>
                <p className="ml-auto text-subBody text-muted-foreground">
                  {`${groupItems.length} items`}
                </p>
              </div>
              <div className={CSS_CLASSES.GROUP_ITEMS}>
                {groupItems.map((item, itemIndex) => {
                  const isSelected = selectedValue === item?.label;
                  return (
                    <div
                      key={item?.label}
                      className={`${CSS_CLASSES.GROUP_ITEM} cursor-pointer`}
                      onClick={() => onRadioChange?.(item?.label || "")}
                    >
                      <Checkbox
                        checked={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRadioChange?.(item?.label || "");
                        }}
                      />
                      <p className="ml-2 text-subBody">{item?.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  // Check if all groups have no data
  const allGroupsHaveNoData = filteredGroupKeys.every((groupKey) => {
    const groupItems = groupedFilters[groupKey] || [];
    const groupState = getGroupState(id, groupKey);
    return groupItems.length === 0 || groupState.totalCount === 0;
  });

  // If all groups have no data, show single "No data found" message
  if (allGroupsHaveNoData && filteredGroupKeys.length > 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-subBody text-muted-foreground">No data found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {filteredGroupKeys.map((groupKey) => {
        const groupItems = groupedFilters[groupKey] || [];
        const groupState = getGroupState(id, groupKey);
        const hasNoData = groupItems.length === 0 || groupState.totalCount === 0;
        
        // Skip rendering groups with no data
        if (hasNoData) {
          return null;
        }
        
        return (
          <div key={groupKey} id={`filter-${id}-${groupKey}`} className="mb-4">
            <div 
              className={`${CSS_CLASSES.GROUP_HEADER} cursor-pointer`}
              onClick={() => toggleGroup(id, groupKey)}
            >
              <Checkbox
                title={groupKey}
                checked={groupState.allSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGroup(id, groupKey);
                }}
              />
              <p className="ml-2  text-subBody">{groupKey}</p>
              <p className="ml-auto text-subBody text-muted-foreground">
                {`${groupState.selectedCount}/${groupState.totalCount}`}
              </p>
            </div>
            <div className={CSS_CLASSES.GROUP_ITEMS}>
              {groupItems.map((item) => {
                const itemIndex = filtersArray.findIndex(
                  (f) => f?.label === item?.label
                );
                return (
                  <div
                    key={item?.label}
                    className={`${CSS_CLASSES.GROUP_ITEM} cursor-pointer`}
                    onClick={() => toggleFilter(id, itemIndex)}
                  >
                    <Checkbox
                      title={item?.label || ""}
                      checked={item?.checked || false}
                      onClick={(e) => {
                        e?.stopPropagation();
                        toggleFilter(id, itemIndex);
                      }}
                    />
                    <p className="ml-2 text-subBody">{item?.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface AlphabeticalViewProps {
  id: string;
  groupKeys: string[];
  groupedFilters: GroupedFiltersMap;
  searchQuery: string;
  filtersArray: FilterItem[];
  toggleFilter: (id: string, index: number) => void;
  singleSelect?: boolean;
  selectedValue?: string;
  localState: FilterStateMap;
  onRadioChange?: (value: string) => void;
}

const AlphabeticalView = ({
  id,
  groupKeys,
  groupedFilters,
  searchQuery,
  filtersArray,
  toggleFilter,
  singleSelect = false,
  selectedValue,
  localState,
  onRadioChange,
}: AlphabeticalViewProps ) => {
  const filteredGroupKeys = searchQuery.trim()
    ? groupKeys.filter((letter) => {
        const letterItems = groupedFilters[letter] || [];
        return letterItems.length > 0;
      })
    : groupKeys;
  
  if (filteredGroupKeys.length === 0 && searchQuery.trim()) {
    return (
      <div className={CSS_CLASSES.NO_RESULTS}>
        No results found for "{searchQuery}"
      </div>
    );
  }

  // Check if there's no data at all (no group keys or all groups are empty)
  if (groupKeys.length === 0 || filteredGroupKeys.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-subBody text-muted-foreground">No data found</p>
      </div>
    );
  }

  // Check if all groups have no data
  const allGroupsHaveNoData = filteredGroupKeys.every((letter) => {
    const letterItems = groupedFilters[letter] || [];
    return letterItems.length === 0;
  });

  if (allGroupsHaveNoData && filteredGroupKeys.length > 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-subBody text-muted-foreground">No data found</p>
      </div>
    );
  }

  if (singleSelect) {
    // Get filter state to check if all are selected
    const filterState = localState[id];
    const allSelected = filterState?.isSelectAll;
    
    // Check if all groups have no data (for single-select mode)
    const allGroupsHaveNoDataForSingleSelect = filteredGroupKeys.every((letter) => {
      const letterItems = groupedFilters[letter] || [];
      return letterItems.length === 0;
    });

    if (allGroupsHaveNoDataForSingleSelect && filteredGroupKeys.length > 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-subBody text-muted-foreground">No data found</p>
        </div>
      );
    }

    if (allSelected) {
      // Show all items as checked
      return (
        <div>
          {filteredGroupKeys.map((letter) => {
            const letterItems = groupedFilters[letter] || [];
            // Skip rendering groups with no data
            if (letterItems.length === 0) {
              return null;
            }
            return (
              <div key={letter} id={`filter-${id}-${letter}`}>
                <div className={CSS_CLASSES.ALPHABET_HEADER}>
                  {letter}
                </div>
                {letterItems.map((filterItem, index) => {
                  return (
                    <span
                      key={`${letter}-${index}`}
                      className={CSS_CLASSES.ALPHABET_ITEM}
                    >
                      <Checkbox
                        checked={true}
                        disabled={true}
                      />
                      <EllipsisTooltip
                        content={filterItem?.label || ""}
                        className="ml-2 text-subBody max-w-[180px]"
                      />
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }
    
    // Show checkboxes when not all selected (single-select mode)
    return (
      <div>
        {filteredGroupKeys.map((letter) => {
          const letterItems = groupedFilters[letter] || [];
          // Skip rendering groups with no data
          if (letterItems.length === 0) {
            return null;
          }
          return (
            <div key={letter} id={`filter-${id}-${letter}`}>
              <div className={CSS_CLASSES.ALPHABET_HEADER}>
                {letter}
              </div>
              {letterItems.map((filterItem, index) => {
                const isSelected = selectedValue === filterItem?.label;
                return (
                  <span
                    key={`${letter}-${index}`}
                    className={`${CSS_CLASSES.ALPHABET_ITEM} cursor-pointer`}
                    onClick={() => onRadioChange?.(filterItem?.label || "")}
                  >
                    <Checkbox
                      checked={isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRadioChange?.(filterItem?.label || "");
                      }}
                    />
                    <EllipsisTooltip
                      content={filterItem?.label || ""}
                      className="ml-2 text-subBody max-w-[180px]"
                    />
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
  
  // Check if all groups have no data (for normal multi-select mode)
  const allGroupsHaveNoDataForMultiSelect = filteredGroupKeys.every((letter) => {
    const letterItems = groupedFilters[letter] || [];
    return letterItems.length === 0;
  });

  if (allGroupsHaveNoDataForMultiSelect && filteredGroupKeys.length > 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-subBody text-muted-foreground">No data found</p>
      </div>
    );
  }

  return (
    <div>
      {filteredGroupKeys.map((letter) => {
        const letterItems = groupedFilters[letter] || [];
        // Skip rendering groups with no data
        if (letterItems.length === 0) {
          return null;
        }
        return (
          <div key={letter} id={`filter-${id}-${letter}`}>
            <div className={CSS_CLASSES.ALPHABET_HEADER}>
              {letter}
            </div>
            {letterItems.map((filterItem, index) => {
              const filterIndex = filtersArray.findIndex(
                (f) => f?.label === filterItem?.label
              );
              return (
                <span
                  key={`${letter}-${index}`}
                  className={`${CSS_CLASSES.ALPHABET_ITEM} cursor-pointer`}
                  onClick={() => toggleFilter(id, filterIndex)}
                >
                  <Checkbox
                    id={`${filterItem?.label || ""}-${index}`}
                    checked={filterItem?.checked || false}
                    onClick={(e) => {
                      e?.stopPropagation();
                      toggleFilter(id, filterIndex);
                    }}
                  />
                  <EllipsisTooltip
                    content={filterItem?.label || ""}
                    className="ml-2 text-subBody max-w-[180px]"
                  />
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
