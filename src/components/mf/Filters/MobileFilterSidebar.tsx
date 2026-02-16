"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Check, Search, X, Users, Building2, Globe, Megaphone, Calendar, LucideIcon } from "lucide-react";
import { FilterState } from "./Filter";

// Icon mapping for filter types
const getFilterIcon = (filterId: string): LucideIcon => {
  const id = filterId.toLowerCase();
  if (id.includes("publisher")) return Users;
  if (id.includes("agency") || id.includes("vendor")) return Building2;
  if (id.includes("country")) return Globe;
  if (id.includes("campaign")) return Megaphone;
  if (id.includes("event") || id.includes("type")) return Calendar;
  return Users;
};


interface MobileFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filter: { [key: string]: FilterState };
  onChange: (state: { [key: string]: FilterState }) => void;
  onApply: () => void;
  onCancel: () => void;
  grouped?: boolean;
  publisherGroups?: { [key: string]: { [groupKey: string]: string[] } };
  singleSelect?: boolean;
}

const isGroupItem = (item: any): item is { label: string; checked?: boolean; subItems?: Array<{ label: string; checked: boolean }> } => {
  return item && typeof item === 'object' && Array.isArray(item?.subItems);
};

const calculateTotalCount = (filterState: FilterState): number => {
  if (Array.isArray(filterState.filters)) {
    const hasSubItems = filterState.filters.some(isGroupItem);
    if (hasSubItems) {
      return filterState.filters.reduce((sum: number, group: any) => {
        return sum + (group.subItems?.length || 0);
      }, 0);
    }
    return filterState.filters.length;
  }
  return Object.values(filterState.filters).reduce((sum, items) => sum + items.length, 0);
};

const matchesSearch = (text: string, query: string): boolean => {
  return text.toLowerCase().includes(query.toLowerCase().trim());
};

export function MobileFilterSidebar({
  isOpen,
  onClose,
  filter,
  onChange,
  onApply,
  onCancel,
  grouped = false,
  publisherGroups = {},
  singleSelect = false,
}: MobileFilterSidebarProps) {
  const [localState, setLocalState] = useState<{ [key: string]: FilterState }>(filter);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState<{ [key: string]: string }>({});

  // Update local state when filter prop changes
  useEffect(() => {
    setLocalState(filter);
  }, [filter]);

  // Set first category as selected when sidebar opens
  useEffect(() => {
    if (isOpen && !selectedCategory && Object.keys(localState).length > 0) {
      setSelectedCategory(Object.keys(localState)[0]);
    }
  }, [isOpen, localState, selectedCategory]);

  const handleSearchChange = (categoryId: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [categoryId]: value }));
  };

  const toggleSelectAll = (categoryId: string) => {
    const filterState = localState[categoryId];
    if (!filterState) return;

    const newIsSelectAll = !filterState.isSelectAll;
    const newFilters = Array.isArray(filterState.filters)
      ? filterState.filters.map((item: any) => {
          if (isGroupItem(item)) {
            return {
              ...item,
              checked: newIsSelectAll,
              subItems: item.subItems?.map((subItem) => ({
                ...subItem,
                checked: newIsSelectAll,
              })),
            };
          }
          return { ...item, checked: newIsSelectAll };
        })
      : filterState.filters;

    const totalCount = calculateTotalCount({ ...filterState, filters: newFilters });
    const selectedCount = newIsSelectAll ? totalCount : 0;

    const updatedState = {
      ...localState,
      [categoryId]: {
        ...filterState,
        filters: newFilters,
        isSelectAll: newIsSelectAll,
        selectedCount,
      },
    };

    setLocalState(updatedState);
  };

  const toggleItem = (categoryId: string, itemIndex: number, subItemIndex?: number) => {
    const filterState = localState[categoryId];
    if (!filterState || !Array.isArray(filterState.filters)) return;

    const newFilters = [...filterState.filters];
    const item = newFilters[itemIndex];

    if (subItemIndex !== undefined && isGroupItem(item) && item.subItems) {
      // Toggle sub-item
      const newSubItems = [...item.subItems];
      newSubItems[subItemIndex] = {
        ...newSubItems[subItemIndex],
        checked: !newSubItems[subItemIndex].checked,
      };

      const allSubItemsSelected = newSubItems.every((subItem) => subItem.checked);
      newFilters[itemIndex] = {
        ...item,
        checked: allSubItemsSelected,
        subItems: newSubItems,
      };
    } else {
      // Toggle main item
      if (isGroupItem(item) && item.subItems) {
        const newChecked = !item.checked;
        newFilters[itemIndex] = {
          ...item,
          checked: newChecked,
          subItems: item.subItems.map((subItem) => ({
            ...subItem,
            checked: newChecked,
          })),
        };
      } else {
        newFilters[itemIndex] = {
          ...item,
          checked: !item.checked,
        };
      }
    }

    // Calculate selected count
    let selectedCount = 0;
    if (Array.isArray(newFilters)) {
      newFilters.forEach((item: any) => {
        if (isGroupItem(item) && item.subItems) {
          selectedCount += item.subItems.filter((subItem: any) => subItem.checked).length;
        } else if (item.checked) {
          selectedCount++;
        }
      });
    }

    const totalCount = calculateTotalCount({ ...filterState, filters: newFilters });
    const isSelectAll = selectedCount === totalCount;

    const updatedState = {
      ...localState,
      [categoryId]: {
        ...filterState,
        filters: newFilters,
        isSelectAll,
        selectedCount,
      },
    };

    setLocalState(updatedState);
  };

  const handleApply = () => {
    // Format the data the same way desktop Filter component does
    const formattedState: { [key: string]: any } = {};
    
    Object.keys(localState).forEach((categoryId) => {
      const filterState = localState[categoryId];
      if (!filterState) return;

      // For grouped filters (like Publishers), convert to { [groupKey]: string[] } format
      if (grouped && Array.isArray(filterState.filters)) {
        const hasSubItems = filterState.filters.some(isGroupItem);
        
        if (hasSubItems) {
          // Convert subItems structure to grouped format (same as desktop Filter handleSubmit)
          const selectedByGroup: { [key: string]: string[] } = {};
          
          filterState.filters.forEach((groupItem: any) => {
            if (isGroupItem(groupItem) && Array.isArray(groupItem.subItems)) {
              const selectedItems = groupItem.subItems
                .filter((item: any) => item?.checked)
                .map((item: any) => item?.label)
                .filter((label: any) => label); // Remove any undefined/null labels
              
              if (selectedItems.length > 0) {
                selectedByGroup[groupItem?.label || ""] = selectedItems;
              }
            }
          });

          formattedState[categoryId] = {
            ...filterState,
            filters: selectedByGroup,
          };
        } else {
          // Grouped but not subItems structure - extract by group property
          const selectedByGroup: { [key: string]: string[] } = {};
          
          // Initialize groups from publisherGroups config if available
          if (publisherGroups && publisherGroups[categoryId]) {
            Object.keys(publisherGroups[categoryId]).forEach((groupKey) => {
              selectedByGroup[groupKey] = [];
            });
          }

          filterState.filters.forEach((filter: any) => {
            if (filter?.checked && filter?.group) {
              if (!selectedByGroup[filter.group]) {
                selectedByGroup[filter.group] = [];
              }
              if (filter.label) {
                selectedByGroup[filter.group].push(filter.label);
              }
            }
          });

          formattedState[categoryId] = {
            ...filterState,
            filters: selectedByGroup,
          };
        }
      } else if (singleSelect) {
        // Handle single select mode (same as desktop Filter handleSubmit)
        const filtersArray: any[] = Array.isArray(filterState.filters) 
          ? filterState.filters 
          : Object.values(filterState.filters || {}).flat();
        
        const selectedFilter = filtersArray.find((f: any) => f && typeof f === 'object' && f?.checked);
        const selectedLabel = selectedFilter?.label;
        
        if (selectedLabel) {
          const newFilters = filtersArray.map((f: any) => {
            if (f && typeof f === 'object') {
              return {
                ...f,
                checked: f?.label === selectedLabel,
              };
            }
            return f;
          });
          
          formattedState[categoryId] = {
            ...filterState,
            filters: newFilters,
            selectedCount: 1,
            isSelectAll: false,
          };
        } else {
          formattedState[categoryId] = filterState;
        }
      } else {
        // For non-grouped filters, pass as-is (desktop Filter passes localState directly)
        formattedState[categoryId] = filterState;
      }
    });

    onChange(formattedState);
    onApply();
    onClose();
  };

  const handleCancel = () => {
    setLocalState(filter); // Reset to original state
    onCancel();
    onClose();
  };

  const renderFilterContent = (categoryId: string) => {
    const filterState = localState[categoryId];
    if (!filterState) return null;

    const searchQuery = searchQueries[categoryId] || "";
    const totalCount = calculateTotalCount(filterState);
    const IconComponent = getFilterIcon(categoryId);

    // Filter items based on search
    let displayFilters = Array.isArray(filterState.filters) ? [...filterState.filters] : [];
    
    if (searchQuery.trim()) {
      displayFilters = displayFilters.filter((item: any) => {
        if (isGroupItem(item)) {
          const matchesGroup = matchesSearch(item.label || "", searchQuery);
          const matchesSubItems = item.subItems?.some((subItem) =>
            matchesSearch(subItem.label || "", searchQuery)
          );
          return matchesGroup || matchesSubItems;
        }
        return matchesSearch(item.label || "", searchQuery);
      });
    }

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b bg-background">
          {IconComponent && (
            <IconComponent className="w-5 h-5 text-primary" />
          )}
          <h3 className="text-body font-semibold flex-1 dark:text-white">{categoryId}</h3>
          <span className="text-subBody text-primary dark:text-white font-medium">
            {singleSelect
              ? filterState.isSelectAll
                ? "All"
                : filterState.selectedCount > 0
                ? "1 selected"
                : "0 selected"
              : `${filterState.selectedCount || 0}/${totalCount}`}
          </span>
        </div>

        {/* Search */}
        <div className="p-4 border-b bg-background">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(categoryId, e.target.value)}
              className="flex-1 rounded-r-none h-8"
            />
            <Button
              variant="default"
              size="icon"
              className="rounded-l-none w-8 h-8"
              type="button"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b">
            <Checkbox
              checked={filterState.isSelectAll}
              onCheckedChange={() => toggleSelectAll(categoryId)}
            />
            <span className="text-subBody font-medium dark:text-white">Select All</span>
          </div>

          {/* Filter Items */}
          <div className="space-y-2">
            {displayFilters.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No results found
              </div>
            ) : (
              displayFilters.map((item: any, itemIndex: number) => {
                if (isGroupItem(item) && item.subItems) {
                  return (
                    <div key={itemIndex} className="space-y-1">
                      <div className="flex items-center gap-2 py-2">
                        <Checkbox
                          checked={item.checked || false}
                          onCheckedChange={() => toggleItem(categoryId, itemIndex)}
                        />
                        <span className="text-subBody font-semibold dark:text-white">{item.label}</span>
                      </div>
                      <div className="pl-6 space-y-1 border-l-2 border-border/30">
                        {item.subItems
                          .filter((subItem: any) => {
                            if (!searchQuery.trim()) return true;
                            return matchesSearch(subItem.label || "", searchQuery);
                          })
                          .map((subItem: any, subItemIndex: number) => {
                            const originalIndex = item.subItems?.findIndex(
                              (si: any) => si.label === subItem.label
                            );
                            return (
                              <div
                                key={subItemIndex}
                                className="flex items-center gap-2 py-1"
                              >
                                <Checkbox
                                  checked={subItem.checked}
                                  onCheckedChange={() =>
                                    toggleItem(categoryId, itemIndex, originalIndex)
                                  }
                                />
                                <span className="text-subBody dark:text-white">{subItem.label}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={itemIndex} className="flex items-center gap-2 py-1">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(categoryId, itemIndex)}
                    />
                    <span className="text-subBody dark:text-white">{item.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background z-50 lg:hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <h2 className="text-xl font-semibold dark:text-white">Filters</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Two Panel Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Categories */}
          <div className="w-1/3 border-r bg-muted/30 overflow-y-auto">
            <div className="p-2 space-y-1">
              {Object.entries(localState).map(([categoryId, filterState]) => {
                const totalCount = calculateTotalCount(filterState);
                const IconComponent = getFilterIcon(categoryId);
                const isActive = selectedCategory === categoryId;

                return (
                  <button
                    key={categoryId}
                    onClick={() => setSelectedCategory(categoryId)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                      isActive
                        ? " text-primary shadow-md"
                        : "hover:bg-muted dark:text-white"
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="text-subBody font-medium dark:text-white">{categoryId}</div>
                      <div className="text-xs opacity-70 dark:text-white">
                        {singleSelect
                          ? filterState.isSelectAll
                            ? "All"
                            : filterState.selectedCount > 0
                            ? "1 selected"
                            : "0 selected"
                          : `${filterState.selectedCount || 0}/${totalCount}`}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-1 h-6 bg-primary-foreground rounded-full dark:bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Filter Details */}
          <div className="flex-1 overflow-hidden">
            {selectedCategory ? (
              renderFilterContent(selectedCategory)
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a filter category
              </div>
            )}
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-background">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="w-7 h-7 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handleApply}
            className="w-7 h-7 rounded-full bg-primary"
          >
            <Check className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  );
}

