"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, X } from "lucide-react";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: { id: string; label: string } | null;
  onSave: (data: { field: string; value: string[]; searchValue?: string; category?: string }) => void;
  filterData: any;
  filterloading: boolean;
  savedFilters?: Array<{ field: string; value: string[] }>;
  mode?: string;
  onSearchChange?: (searchQuery: string) => void;
  category?: string;
}

interface FilterItem {
  id: string;
  name: string;
  selected: boolean;
}

interface NestedCategory {
  name: string;
  items: string[];
}

const NESTED_FIELDS = ['publisher_name', 'event_publisher_name'];
const SEARCH_DEBOUNCE_MS = 500;
const SEARCH_LOADING_MS = 1000;

const FilterModal = ({
  isOpen,
  onClose,
  selectedItem,
  onSave,
  filterData,
  filterloading,
  savedFilters = [],
  mode,
  onSearchChange,
  category = "",
}:FilterModalProps) => {
  // State
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [leftColumnSearch, setLeftColumnSearch] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [initialData, setInitialData] = useState<string[]>([]);
  const [hasManuallyToggled, setHasManuallyToggled] = useState(false);

  // Refs
  const lastQueryRef = useRef<string>("");
  const prevSelectedItemRef = useRef<string | null>(null);
  const searchStateRef = useRef<{ [key: string]: string }>({});
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Memoized values
  const existingSavedFilters = useMemo(() => {
    if (!selectedItem) return [];
    // Look for filter with composite key (category:field) or just field (for backward compatibility)
    const compositeField = category ? `${category}:${selectedItem.id}` : selectedItem.id;
    const savedFilterForItem = savedFilters.find(
      (filter) => filter.field === compositeField || filter.field === selectedItem.id
    );
    return savedFilterForItem ? savedFilterForItem.value : [];
  }, [selectedItem, savedFilters, category]);

  const isNestedData = useMemo(() => {
    if (!filterData || typeof filterData !== 'object') return false;
    const hasNestedStructure = !Array.isArray(filterData) && 
      Object.keys(filterData).some(key => Array.isArray(filterData[key]));
    const isNestedField = selectedItem?.id && NESTED_FIELDS.includes(selectedItem.id);
    return hasNestedStructure || isNestedField;
  }, [filterData, selectedItem?.id]);

  const nestedCategories = useMemo<NestedCategory[]>(() => {
    if (!isNestedData || !filterData) return [];
    if (!Array.isArray(filterData) && Object.keys(filterData).some(key => Array.isArray(filterData[key]))) {
      return Object.keys(filterData).map(category => ({
        name: category,
        items: filterData[category] || []
      }));
    }
    return [];
  }, [isNestedData, filterData]);

  const shouldShowNestedView = useMemo(() => {
    return (isNestedData && nestedCategories.length > 0) || 
           (selectedItem?.id && NESTED_FIELDS.includes(selectedItem.id));
  }, [isNestedData, nestedCategories.length, selectedItem?.id]);

  const searchItems = useMemo<FilterItem[]>(() => {
    if (!filterData) return [];
    
    let allItems: string[] = [];
    if (isNestedData && !Array.isArray(filterData)) {
      allItems = Object.values(filterData).flat() as string[];
    } else if (Array.isArray(filterData)) {
      allItems = filterData;
    }
    
    return allItems.map((item) => ({
      id: item,
      name: item,
      selected: existingSavedFilters.includes(item),
    }));
  }, [filterData, existingSavedFilters, isNestedData]);

  const selectedFilteredItems = useMemo<FilterItem[]>(() => {
    return selectedItems.map((itemName) => ({
      id: itemName,
      name: itemName,
      selected: true,
    }));
  }, [selectedItems]);

  // Utility function to get all available items
  const getAllAvailableItems = useCallback((): string[] => {
    if (isNestedData && filterData) {
      return Object.values(filterData).flat() as string[];
    }
    if (Array.isArray(filterData)) {
      return filterData;
    }
    if (selectedItem?.id && NESTED_FIELDS.includes(selectedItem.id)) {
      return initialData.length > 0 ? initialData : searchItems.map(item => item.name);
    }
    return [];
  }, [isNestedData, filterData, selectedItem?.id, initialData, searchItems]);

  // Initialize data when modal opens
  useEffect(() => {
    if (!isOpen || !selectedItem) return;

    let allItems: string[] = [];
    if (Array.isArray(filterData) && filterData.length > 0) {
      allItems = filterData;
    } else if (isNestedData && filterData) {
      allItems = Object.values(filterData).flat() as string[];
    }

    if (allItems.length > 0) {
      setInitialData(allItems);
      if (existingSavedFilters.length > 0) {
        setSelectedItems(existingSavedFilters);
        setSelectAll(existingSavedFilters.length === allItems.length);
      } else {
        setSelectedItems([]);
        setSelectAll(false);
      }
    } else if (selectedItem.id && NESTED_FIELDS.includes(selectedItem.id)) {
      setInitialData([]);
      setSelectedItems(existingSavedFilters);
      setSelectAll(false);
    }
  }, [isOpen, selectedItem?.id, filterData, existingSavedFilters, isNestedData]);

  // Handle filter switching
  useEffect(() => {
    if (!isOpen || !selectedItem) return;

    const currentFilterId = selectedItem.id;
    const previousFilterId = prevSelectedItemRef.current;

    if (previousFilterId && previousFilterId !== currentFilterId) {
      setInitialData([]);
      setSelectedItems([]);
      setSelectAll(false);
      setHasManuallyToggled(false);
      setLeftColumnSearch("");
      lastQueryRef.current = "";
    }

    prevSelectedItemRef.current = currentFilterId;
  }, [isOpen, selectedItem?.id]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const currentSearch = leftColumnSearch.trim();
      if (currentSearch === "" && selectedItem?.id) {
        delete searchStateRef.current[selectedItem.id];
        lastQueryRef.current = "";
      }
      
      setInitialData([]);
      setLeftColumnSearch("");
      setSelectedItems([]);
      setSelectAll(false);
      setHasManuallyToggled(false);
      prevSelectedItemRef.current = null;
    }
  }, [isOpen, leftColumnSearch, selectedItem?.id]);

  // Handle loading state
  useEffect(() => {
    if (filterloading) {
      setSelectAll(false);
    }
  }, [filterloading]);

  // Save search state
  useEffect(() => {
    if (!selectedItem?.id) return;
    const trimmedSearch = leftColumnSearch.trim();
    if (trimmedSearch !== "") {
      searchStateRef.current[selectedItem.id] = trimmedSearch;
    } else {
      delete searchStateRef.current[selectedItem.id];
      lastQueryRef.current = "";
    }
  }, [leftColumnSearch, selectedItem?.id]);

  // Restore search state when opening
  useEffect(() => {
    if (isOpen && selectedItem?.id) {
      const savedSearch = searchStateRef.current[selectedItem.id];
      if (savedSearch && savedSearch.trim() !== "") {
        setLeftColumnSearch(savedSearch);
        lastQueryRef.current = savedSearch;
      } else {
        setLeftColumnSearch("");
        lastQueryRef.current = "";
      }
    }
  }, [isOpen, selectedItem?.id]);

  // Debounced search handler
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const trimmedQuery = searchQuery.trim();
    const currentLastQuery = lastQueryRef.current;

    if (trimmedQuery === "" && currentLastQuery !== "") {
      lastQueryRef.current = "";
      onSearchChange?.("");
      return;
    }

    if (!trimmedQuery || trimmedQuery === currentLastQuery) {
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (trimmedQuery !== lastQueryRef.current) {
        lastQueryRef.current = trimmedQuery;
        onSearchChange?.(searchQuery);
      }
    }, SEARCH_DEBOUNCE_MS);
  }, [onSearchChange]);

  // Handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLeftColumnSearch(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleSelectAllToggle = useCallback((checked: boolean) => {
    setHasManuallyToggled(true);
    setSelectAll(checked);
    
    if (checked) {
      const allItems = getAllAvailableItems();
      setSelectedItems(allItems);
    } else {
      setSelectedItems([]);
    }
  }, [getAllAvailableItems]);

  const toggleItem = useCallback((id: string) => {
    setHasManuallyToggled(true);
    
    setSelectedItems((prev) => {
      const newItems = prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id];
      
      if (prev.includes(id) && selectAll) {
        setSelectAll(false);
      }
      
      return newItems;
    });
  }, [selectAll]);

  const toggleCategory = useCallback((categoryName: string, checked: boolean) => {
    setHasManuallyToggled(true);
    
    let categoryItems: string[] = [];
    if (isNestedData && filterData) {
      categoryItems = filterData[categoryName] || [];
    }
    
    if (checked) {
      setSelectedItems((prev) => {
        const combined = [...prev, ...categoryItems];
        return Array.from(new Set(combined));
      });
    } else {
      setSelectedItems((prev) => prev.filter(item => !categoryItems.includes(item)));
      setSelectAll(false);
    }
  }, [isNestedData, filterData]);

  const isCategoryFullySelected = useCallback((categoryName: string): boolean => {
    if (!isNestedData || !filterData) return false;
    const categoryItems = filterData[categoryName] || [];
    return categoryItems.length > 0 && categoryItems.every((item: string) => selectedItems.includes(item));
  }, [isNestedData, filterData, selectedItems]);

  const isCategoryPartiallySelected = useCallback((categoryName: string): boolean => {
    if (!isNestedData || !filterData) return false;
    const categoryItems = filterData[categoryName] || [];
    const selectedCount = categoryItems.filter((item: string) => selectedItems.includes(item)).length;
    return selectedCount > 0 && selectedCount < categoryItems.length;
  }, [isNestedData, filterData, selectedItems]);

  const handleSave = useCallback(() => {
    const selectedFilters = selectAll ? [] : selectedItems;
    
    onSave({
      field: selectedItem?.id || "",
      value: selectedFilters,
      searchValue: leftColumnSearch,
      category: category,
    });
    
    onClose();
  }, [selectAll, selectedItems, selectedItem?.id, leftColumnSearch, category, onSave, onClose]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const isViewMode = mode === "view";
  const filteredItems = searchItems;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-100"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-[90%] flex-col rounded-lg bg-white shadow-lg dark:bg-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-body font-semibold dark:text-white">
              Filter {selectedItem?.label}
            </h2>
            <X
              className="h-4 w-4 cursor-pointer hover:text-gray-700"
              onClick={onClose}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="select-all" className="text-subBody dark:text-white">
                Select All
              </Label>
              <Switch
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAllToggle}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Left Column - All Values */}
            <div className="border rounded-lg p-4">
              <div className="mb-3">
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={leftColumnSearch}
                  onChange={handleSearchChange}
                  className="mb-2 pr-8"
                  disabled={isViewMode}
                />
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filterloading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : shouldShowNestedView ? (
                  nestedCategories.map((category) => (
                    <div key={category.name} className="border rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`category-${category.name}`}
                          checked={isCategoryFullySelected(category.name)}
                          ref={(ref) => {
                            if (ref && 'indeterminate' in ref) {
                              (ref as any).indeterminate = isCategoryPartiallySelected(category.name);
                            }
                          }}
                          onCheckedChange={(checked) => toggleCategory(category.name, checked as boolean)}
                          disabled={isViewMode}
                        />
                        <Label
                          htmlFor={`category-${category.name}`}
                          className="font-semibold text-gray-700 cursor-pointer dark:text-white"
                        >
                          {category.name}
                        </Label>
                      </div>
                      <div className="ml-6 space-y-1">
                        {category.items.map((item) => (
                          <div
                            key={item}
                            className="flex items-center space-x-2 rounded p-1 hover:bg-gray-50 dark:text-white"
                          >
                            <Checkbox
                              id={`nested-item-${item}`}
                              checked={selectedItems.includes(item)}
                              onCheckedChange={() => toggleItem(item)}
                              disabled={isViewMode}
                            />
                            <Label
                              htmlFor={`nested-item-${item}`}
                              className="flex-1 cursor-pointer truncate text-subBody dark:text-white"
                              title={item}
                            >
                              {item.length > 25 ? `${item.substring(0, 25)}...` : item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : filteredItems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No data found.
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-2 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-white"
                    >
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={selectedItems.includes(item.name)}
                        onCheckedChange={() => toggleItem(item.id)}
                        disabled={isViewMode}
                      />
                      <Label
                        htmlFor={`item-${item.id}`}
                        className="flex-1 cursor-pointer truncate"
                        title={item.name}
                      >
                        {item.name.length > 25 ? `${item.name.substring(0, 25)}...` : item.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Selected Values */}
            <div className="border rounded-lg p-4">
              <h3 className="text-md font-semibold mb-3 text-gray-700">
                Selected Values ({selectedFilteredItems.length})
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedFilteredItems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    {isViewMode || mode === "edit" ? "No Filters Applied" : "No items selected."}
                  </div>
                ) : (
                  selectedFilteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-2 rounded p-2 bg-blue-50 border border-blue-200"
                    >
                      <Checkbox
                        id={`selected-item-${item.id}`}
                        checked={selectedItems.includes(item.name)}
                        onCheckedChange={() => toggleItem(item.id)}
                        disabled={isViewMode}
                      />
                      <Label
                        htmlFor={`selected-item-${item.id}`}
                        className="flex-1 cursor-pointer truncate"
                        title={item.name}
                      >
                        {item.name.length > 25 ? `${item.name.substring(0, 25)}...` : item.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-4">
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="default"
              size="sm"
              disabled={isViewMode}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="default"
              size="sm"
              disabled={isViewMode}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
