"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  MdEdit,
  MdDelete,
  MdVisibility,
  MdFileDownload,
  MdArrowDropDown,
  MdSearch,
  MdArrowDownward,
  MdArrowUpward,
  MdPause,
  MdPlayArrow,
  MdUnfoldMore,
} from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";
import { FaClone } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Pagination from "../ui/pagination";
import { CalendarIcon, Loader2, Plus, X, Download } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import EllipsisTooltip from "@/components/mf/EllipsisTooltip";
import { TicketingTableSkeleton } from "@/components/mf/charts/ChartSkeletons";
import EmptyState from "@/components/ui/empty-state";
import { RadioButtons } from "@/components/mf/RadioButton";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Column<T = any> =
  | { title: string; key: string; width?: number }
  | {
      title: string;
      key: string;
      width?: number;
      render: (data: T) => React.ReactNode;
    };

export interface ActionButtonConfig {
  title: string;
  action: () => void;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

interface ResizableTableProps<T = Record<string, string | number>> {
  // Core Props
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyStateMessage?: string;
  height?: number;
  // Search & Filter
  isSearchable?: boolean;
  onSearch?: (searchTerm: string) => void;
  statusFilter?: string;
  priorityFilter?: string;
  onStatusFilter?: (status: string) => void;
  onPriorityFilter?: (priority: string) => void;
  statusFilterItems?: Array<{ title: string; value: string }>;
  priorityFilterItems?: Array<{ title: string; value: string }>;

  // Column Management
  isColumn?: boolean;
  isMultiLineHeader?: boolean;
  isCheckbox?: boolean;
  ischeckboxbody?: boolean;
  onSelect?: (selectedItems: T[]) => void;
  itemCount?: (count: number) => void;
  isCount?: boolean;

  // Actions
  isEdit?: boolean;
  isDelete?: boolean;
  isView?: boolean;
  isDownload?: boolean;
  isClone?: boolean;
  isSend?: boolean;
  isPause?: boolean;
  isPlay?: boolean;
  isRefetch?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onDownload?: (item: T) => void;
  onClone?: (item: T) => void;
  onSend?: (item: T) => void;
  onPause?: (item: T) => void;
  onPlay?: (item: T) => void;
  onRefetch?: (params?: { startDate?: Date; endDate?: Date }) => void;
  onDownloadAll?: (items: T[]) => void;
  isTableDownload?: boolean;
  isPaginated?: boolean;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageNo?: number;
  limit?: number;
  totalPages?: number;
  totalRecords?: number;
  filterType?: "radio" | "single-select" | "multi-select";
  filterOptions?: Array<{ value: string | number; label: string }>;
  onFilterChange?: (value: string | string[]) => void;
  selectedFilterValue?: string | string[];
  headerColor?: string;
  isDashboard?: boolean;
  rowHeight?: number;
  dashboardRowHeight?: number;
  headerHeight?: number;
  minColumnWidth?: number;
  defaultColumnWidth?: number;
  handleExport?: () => void;
  containerHeight?: number | string;
  controlsBarHeight?: number | string;
  tableContainerPadding?: number | string;
  outerContainerPadding?: number | string;
  outerContainerMargin?: number | string;
  borderRadius?: number | string;
  controlsBorderRadius?: number | string;
  tableBorderRadius?: number | string;
  paginationBorderRadius?: number | string;
  gap?: number | string;
  controlsGap?: number | string;
  cellPadding?: number | string;
  headerPadding?: number | string;
  rowPadding?: number | string;
  showCreateButton?: boolean;
  onCreate?: () => void;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
  isCheckboxHeader?: boolean;
  buttonTextName?: string;
  stickyColumns?: string[]; // Array of column keys that should be sticky when scrolling horizontally
}

const DEFAULT_ROW_HEIGHT = 30;
const DEFAULT_DASHBOARD_ROW_HEIGHT = 20;
const DEFAULT_HEADER_HEIGHT = 56;
const DEFAULT_BORDER_RADIUS = 6;
const DEFAULT_PADDING = 8;
const DEFAULT_GAP = 8;
const DEFAULT_CELL_PADDING = 8;

const ColumnToggleMenu = ({
  columns,
  onToggle,
  visibleColumns,
}: {
  columns: Column<any>[];
  onToggle: (key: string) => void;
  visibleColumns: Column<any>[];
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-between gap-2 h-9 px-3"
        >
          <span>Columns</span>
          <div className="flex items-center">
            <span className="text-subBody text-primary">
              {columns.length === visibleColumns.length
                ? "All"
                : visibleColumns.length}
            </span>
            <MdArrowDropDown className="ml-1" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <div className="max-h-[300px] overflow-auto">
          {columns.map((column) => (
            <div
              key={column.key}
              className="flex items-center px-4 py-2 hover:bg-muted"
            >
              <Checkbox
                checked={visibleColumns.some((col) => col.key === column.key)}
                onCheckedChange={() => onToggle(column.key)}
                id={`column-${column.key}`}
              />
              <Label
                htmlFor={`column-${column.key}`}
                className="ml-2 cursor-pointer flex-1"
              >
                {column.title}
              </Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ResizableTable = <
  T extends Record<string, any> = Record<string, string | number>,
>({
  // Core Props
  columns,
  data = [],
  isLoading = false,
  emptyStateMessage = "No Data Found!",
  height,
  isSearchable = true,
  onSearch,
  statusFilter,
  priorityFilter,
  onStatusFilter,
  onPriorityFilter,
  statusFilterItems,
  priorityFilterItems,
  isColumn = true,
  isMultiLineHeader = false,
  isCheckbox = false,
  onSelect,
  itemCount,
  isCount = false,
  isEdit = false,
  isDelete = false,
  isView = false,
  isDownload = false,
  isClone = false,
  isSend = false,
  isPause = false,
  isPlay = false,
  isRefetch = false,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onClone,
  onSend,
  onPause,
  onPlay,
  onRefetch,
  onDownloadAll,
  handleExport,
  isTableDownload = false,
  isPaginated = true,
  onPageChange,
  onLimitChange,
  pageNo = 1,
  limit,
  totalPages = 1,
  totalRecords,
  filterType,
  filterOptions,
  onFilterChange,
  selectedFilterValue,
  headerColor = "#ccc",
  isDashboard = false,
  rowHeight = DEFAULT_ROW_HEIGHT,
  dashboardRowHeight = DEFAULT_DASHBOARD_ROW_HEIGHT,
  headerHeight = DEFAULT_HEADER_HEIGHT,
  minColumnWidth = 100,
  defaultColumnWidth = 150,
  containerHeight = 500,
  tableContainerPadding = DEFAULT_PADDING,
  outerContainerPadding = DEFAULT_PADDING,
  borderRadius = DEFAULT_BORDER_RADIUS,
  controlsBorderRadius,
  tableBorderRadius,
  paginationBorderRadius = DEFAULT_BORDER_RADIUS,
  gap = DEFAULT_GAP,
  controlsGap = DEFAULT_GAP,
  cellPadding = DEFAULT_CELL_PADDING,
  headerPadding = DEFAULT_CELL_PADDING,
  rowPadding = DEFAULT_CELL_PADDING,
  showCreateButton = false,
  buttonTextName = "Create Report",
  onCreate,
  onBulkAction,
  stickyColumns = [],
}: ResizableTableProps<T>) => {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Column<T>[]>(columns);
  const [itemsPerPage, setItemsPerPage] = useState(limit || 10);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(pageNo || 1);
  const [isRefetchModalOpen, setIsRefetchModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");

  useEffect(() => {
    const initialWidths: Record<string, number> = {};
    columns.forEach((col) => {
      initialWidths[col.key] = col.width || defaultColumnWidth;
    });
    setColumnWidths(initialWidths);
  }, [columns, defaultColumnWidth]);

  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  useEffect(() => {
    if (pageNo && pageNo !== currentPage) {
      setCurrentPage(pageNo);
    }
  }, [pageNo]);

  useEffect(() => {
    if (limit && limit !== itemsPerPage) {
      setItemsPerPage(limit);
    }
  }, [limit]);

  useEffect(() => {
    if (typeof itemCount === "function") {
      itemCount(selectedItems.length);
    }
  }, [selectedItems.length, itemCount]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleColumnToggle = useCallback(
    (key: string) => {
      setVisibleColumns((prev) =>
        prev.some((col) => col.key === key)
          ? prev.filter((col) => col.key !== key)
          : [...prev, columns.find((col) => col.key === key)!]
      );
    },
    [columns]
  );

  const handleSort = useCallback((key: string) => {
    setSortConfig((current) => {
      if (current?.key === key && current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
        if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

        const aNum = Number(aValue);
        const bNum = Number(bValue);
        const aIsNumeric = !isNaN(aNum) && aValue !== "";
        const bIsNumeric = !isNaN(bNum) && bValue !== "";

        if (aIsNumeric && bIsNumeric) {
          if (aNum < bNum) return sortConfig.direction === "asc" ? -1 : 1;
          if (aNum > bNum) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }

        if (aIsNumeric && !bIsNumeric) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (!aIsNumeric && bIsNumeric) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    let filtered = sortedData;

    if (internalSearchTerm?.trim()) {
      filtered = filtered.filter((item) => {
        return visibleColumns.some((column) => {
          const cellValue = String(item[column.key] || "").toLowerCase();
          return cellValue.includes(internalSearchTerm.toLowerCase());
        });
      });
    }

    return filtered;
  }, [sortedData, visibleColumns, internalSearchTerm]);

  const handleCheckboxChange = useCallback(
    (item: T) => {
      setSelectedItems((prev) => {
        const isSelected = prev.some((i) => i === item);
        const newItems = isSelected
          ? prev.filter((i) => i !== item)
          : [...prev, item];
        onSelect?.(newItems);
        return newItems;
      });
    },
    [onSelect]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const allItems = checked ? filteredData : [];
      setSelectedItems(allItems);
      onSelect?.(allItems);
    },
    [filteredData, onSelect]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, key: string) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = columnWidths[key] || defaultColumnWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = Math.max(
          minColumnWidth,
          startWidth + moveEvent.clientX - startX
        );
        setColumnWidths((prevWidths) => ({
          ...prevWidths,
          [key]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columnWidths, minColumnWidth, defaultColumnWidth]
  );

  const handleItemsPerPageChange = useCallback(
    (newLimit: number) => {
      setItemsPerPage(newLimit);
      setCurrentPage(1);
      onLimitChange?.(newLimit);
    },
    [onLimitChange]
  );

  const handleRefetch = useCallback(() => {
    if (startDate && endDate) {
      onRefetch?.({ startDate, endDate });
      setIsRefetchModalOpen(false);
    }
  }, [startDate, endDate, onRefetch]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setInternalSearchTerm(value);
      onSearch?.(value);
      setCurrentPage(1);
      onPageChange?.(1);
    },
    [onSearch, onPageChange]
  );

  // Helper function to convert number/string to CSS value
  const toCssValue = (
    value: number | string | undefined,
    defaultVal: number | string = 0
  ): string => {
    if (value === undefined)
      return typeof defaultVal === "number" ? `${defaultVal}px` : defaultVal;
    if (typeof value === "number") return `${value}px`;
    return String(value);
  };

  // Calculate left position for sticky columns
  const getStickyLeftPosition = useCallback(
    (columnKey: string): number => {
      if (
        !stickyColumns ||
        stickyColumns.length === 0 ||
        !stickyColumns.includes(columnKey)
      ) {
        return 0;
      }

      const columnIndex = visibleColumns.findIndex(
        (col) => col && col.key === columnKey
      );
      if (columnIndex === -1) return 0;

      let left = 0;

      // Add checkbox column width if it exists and comes before this column
      if (isCheckbox) {
        left += 50; // Checkbox column width
      }

      // Add widths of all sticky columns before this one
      for (let i = 0; i < columnIndex; i++) {
        const col = visibleColumns[i];
        if (col && col.key && stickyColumns.includes(col.key)) {
          left += columnWidths[col.key] || defaultColumnWidth;
        }
      }

      return left;
    },
    [
      stickyColumns,
      visibleColumns,
      columnWidths,
      defaultColumnWidth,
      isCheckbox,
    ]
  );

  // Check if a column should be sticky
  const isStickyColumn = useCallback(
    (columnKey: string): boolean => {
      return (
        stickyColumns &&
        stickyColumns.length > 0 &&
        stickyColumns.includes(columnKey)
      );
    },
    [stickyColumns]
  );

  // Calculate dynamic styles
  const outerContainerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    height: containerHeight
      ? toCssValue(containerHeight)
      : height
        ? toCssValue(height)
        : undefined,
    borderRadius: toCssValue(borderRadius),
    padding: toCssValue(outerContainerPadding),
  };

  const controlsBarStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: toCssValue(controlsGap),
    borderTopLeftRadius: toCssValue(controlsBorderRadius || borderRadius),
    borderTopRightRadius: toCssValue(controlsBorderRadius || borderRadius),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: toCssValue(tableContainerPadding),
  };

  return (
    <>
      {isLoading ? (
        <div
          style={{
            ...outerContainerStyle,
            overflow: "hidden",
          }}
          className="flex items-center justify-center"
        >
          <TicketingTableSkeleton height={containerHeight} />
        </div>
      ) : (
        <div style={outerContainerStyle} className="dark:bg-card/80 bg-white ">
          {/* Table Controls - Top Bar */}
          <div style={controlsBarStyle} className="md:flex-row text-body border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
            {/* Left Side Controls */}
            <div className="flex flex-1 flex-wrap md:flex-nowrap items-center gap-2 ">
              {/* Search Bar */}
              {isSearchable && (
                <div
                  className={cn(
                    "flex items-center space-x-2 p-2 border rounded-md border-gray-200 dark:border-gray-700",
                    isSearchExpanded ? "w-full" : "w-full md:flex-1"
                  )}
                >
                  <>
                    <MdSearch
                      className="text-header text-card-foreground md:hidden"
                      onClick={() => setIsSearchExpanded(true)}
                    />
                    <span className="md:hidden">Search</span>
                    <div className="hidden md:flex w-full items-center relative">
                      <MdSearch className="text-header text-card-foreground" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={internalSearchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className=" bg-white dark:bg-card dark:border-gray-700 w-full text-body dark:text-white outline-none"
                      />
                      <Button
                        type="button"
                        title="Clear"
                        variant="default"
                        className="absolute right-2 cursor-pointer bg-primary rounded-full p-1 flex items-center justify-center w-5 h-5 transition-colors"
                        onClick={() => handleSearchChange("")}
                      >
                        <X className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  </>
                </div>
              )}

              {/* Status & Priority Filters (Ticketing Table) */}
              {(onStatusFilter || onPriorityFilter) && (
                <div className="flex flex-col md:flex-row gap-2">
                  {onStatusFilter &&
                    statusFilterItems &&
                    statusFilterItems.length > 0 && (
                      <Select
                        value={statusFilter || "all"}
                        onValueChange={(value) => {
                          onStatusFilter(value);
                          setCurrentPage(1);
                          onPageChange?.(1);
                        }}
                      >
                        <SelectTrigger className="w-full md:w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusFilterItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                  {onPriorityFilter &&
                    priorityFilterItems &&
                    priorityFilterItems.length > 0 && (
                      <Select
                        value={priorityFilter || "all"}
                        onValueChange={(value) => {
                          onPriorityFilter(value);
                          setCurrentPage(1);
                          onPageChange?.(1);
                        }}
                      >
                        <SelectTrigger className="w-full md:w-[140px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityFilterItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                </div>
              )}

              {/* Filter (Radio / Single-Select / Multi-Select) */}
              <div className="flex items-center justify-between    rounded-md text-subBody dark:text-white">
              {filterType && filterOptions && filterOptions.length > 0 && (
                <>
                
                  <div>
                  {filterType === "radio" && (
                    <RadioButtons
                      options={filterOptions.map((opt) => ({
                        value: String(opt.value ?? ""),
                        label: opt.label,
                      }))}
                      value={
                        typeof selectedFilterValue === "string"
                          ? selectedFilterValue
                          : undefined
                      }
                      onValueChange={(value) => {
                        onFilterChange?.(value);
                      }}
                    />
                  )}
                  </div>
                  <div>
                  {filterType === "single-select" && (
                    <MFSingleSelect
                      items={filterOptions.map((opt) => ({
                        title: opt.label,
                        value: String(opt.value ?? ""),
                      }))}
                      value={
                        typeof selectedFilterValue === "string"
                          ? selectedFilterValue
                          : String(filterOptions[0]?.value ?? "")
                      }
                      onValueChange={(value) => {
                        onFilterChange?.(value);
                      }}
                      placeholder="Select..."
                      className="w-[140px] h-9 text-subBody"
                    />
                  )}
                  </div>
                  <div>
                  {filterType === "multi-select" && (
                    <MultiSelect
                      key={
                        Array.isArray(selectedFilterValue)
                          ? selectedFilterValue.join(",")
                          : "empty"
                      }
                      options={filterOptions.map((opt) => ({
                        label: opt.label,
                        value: String(opt.value ?? ""),
                      }))}
                      defaultValue={
                        Array.isArray(selectedFilterValue)
                          ? selectedFilterValue.map((v) => String(v))
                          : []
                      }
                      onValueChange={(values) => {
                        onFilterChange?.(values);
                      }}
                      placeholder="Select..."
                      className="w-[140px] h-9 text-subBody"
                      maxCount={2}
                    />
                  )}
                  </div>
                  </>
                
              )}
              </div>

              {/* Column Toggle */}
              {isColumn && (
                <ColumnToggleMenu
                  columns={columns}
                  onToggle={handleColumnToggle}
                  visibleColumns={visibleColumns}
                />
              )}

              {showCreateButton && (
                <Button variant="default" size="sm" onClick={onCreate} className="dark:text-white">
                  {buttonTextName}
                </Button>
              )}

              {/* Selected Count */}
              {isCount && (
                <div
                  title="Total Selected Rows"
                  onClick={() => onDownloadAll?.(data)}
                  className="rounded-lg bg-purple-100 p-2 text-primary text-center min-w-[40px] cursor-pointer"
                >
                  <span>{selectedItems.length}</span>
                </div>
              )}

              {/* Table Download Button */}
              {isTableDownload && (
                <Button
                  // variant="outline"
                  size="icon"
                  onClick={handleExport}
                  title="Download Table Data as CSV"
                  className="h-9 w-9 dark:bg-gray-900 bg-white"
                >
                  <Download className="h-6 w-6 text-primary" />
                </Button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div
            className="relative flex-1 border border-t-0 overflow-hidden"
            style={{
              borderBottomLeftRadius: toCssValue(
                tableBorderRadius || borderRadius
              ),
              borderBottomRightRadius: toCssValue(
                tableBorderRadius || borderRadius
              ),
            }}
          >
            <div
              className={`h-full w-full ${filteredData.length === 0 ? "overflow-hidden" : "overflow-auto"}`}
            >
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-full w-full">
                  <EmptyState
                    title={emptyStateMessage}
                    description={"There are no items to display at the moment."}
                    iconType={internalSearchTerm?.trim() ? "search" : "file"}
                    height={400}
                  />
                </div>
              ) : (
                <Table className="min-w-full">
                  <TableHeader
                    className={`sticky top-0 z-20 p-0 border-y-0 border`}
                    style={{
                      backgroundColor: headerColor,
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    <TableRow>
                      {/* Select All Checkbox */}
                      {isCheckbox && (
                        <TableHead
                          className={`border-r`}
                          style={{
                            width: "50px",
                            minWidth: "50px",
                            maxWidth: "50px",
                            backgroundColor: headerColor,
                            ...(stickyColumns &&
                              stickyColumns.length > 0 && {
                                position: "sticky",
                                left: 0,
                                top: 0,
                                zIndex: 30,
                                boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
                              }),
                          }}
                        >
                          <Checkbox
                            checked={
                              selectedItems.length === filteredData.length &&
                              filteredData.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                      )}

                      {/* Column Headers */}
                      {visibleColumns.map((column) => {
                        const isSticky = isStickyColumn(column.key);
                        const stickyLeft = isSticky
                          ? getStickyLeftPosition(column.key)
                          : 0;
                        return (
                          <TableHead
                            key={column.key}
                            className="relative border-r p-0"
                            style={{
                              backgroundColor: headerColor,
                              color: "black",
                              width: `${columnWidths[column.key] || defaultColumnWidth}px`,
                              whiteSpace: isMultiLineHeader
                                ? "pre-line"
                                : "nowrap",
                              height: isMultiLineHeader
                                ? `${headerHeight}px`
                                : "auto",
                              minHeight: `${headerHeight}px`,
                              padding: toCssValue(headerPadding),
                              ...(isSticky && {
                                position: "sticky",
                                left: `${stickyLeft}px`,
                                top: 0,
                                zIndex: 30,
                                boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
                              }),
                            }}
                          >
                            <div className="flex items-center justify-between px-2">
                              <div className="flex-1 overflow-hidden">
                                <span
                                  className={cn(
                                    "block text-subBody font-bold",
                                    isMultiLineHeader
                                      ? "multi-line"
                                      : "truncate"
                                  )}
                                  title={column.title}
                                  style={
                                    isMultiLineHeader
                                      ? {
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }
                                      : {}
                                  }
                                >
                                  {column.title}
                                </span>
                              </div>
                              <div className="flex items-center ml-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSort(column.key);
                                  }}
                                  className="cursor-pointer p-1 hover:bg-gray-200 rounded"
                                  title={`Sort by ${column.title}`}
                                  type="button"
                                >
                                  {sortConfig?.key === column.key ? (
                                    sortConfig.direction === "asc" ? (
                                      <MdArrowUpward className="text-primary text-subBody" />
                                    ) : (
                                      <MdArrowDownward className="text-primary text-subBody" />
                                    )
                                  ) : (
                                    <MdUnfoldMore className="text-gray-400 text-subBody hover:text-gray-600" />
                                  )}
                                </button>
                              </div>
                              {/* Column Resize Handle */}
                              <div
                                onMouseDown={(e) =>
                                  handleMouseDown(e, column.key)
                                }
                                className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-gray-400"
                                style={{ backgroundColor: "transparent" }}
                              />
                            </div>
                          </TableHead>
                        );
                      })}

                      {/* Actions Header */}
                      {(isEdit ||
                        isDelete ||
                        isView ||
                        isDownload ||
                        isPause ||
                        isPlay ||
                        isRefetch ||
                        isSend ||
                        isClone) && (
                        <TableHead
                          className="border-r"
                          style={{
                            backgroundColor: headerColor,
                            color: "black",
                            width: "100px",
                            minWidth: "100px",
                            whiteSpace: "nowrap",
                            fontWeight: "bold",
                          }}
                        >
                          Action
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>

                  <TableBody className="">
                    {filteredData.map((item, index) => (
                      <TableRow
                        key={index}
                        className="h-8"
                        style={{
                          height: `${isDashboard ? dashboardRowHeight : rowHeight}px`,
                        }}
                      >
                        {/* Row Checkbox */}
                        {isCheckbox && (
                          <TableCell
                            className={cn(
                              "border-r",
                              stickyColumns && stickyColumns.length > 0 && "bg-card"
                            )}
                            style={{
                              width: "20px",
                              minWidth: "20px",
                              maxWidth: "20px",
                              height: `${isDashboard ? dashboardRowHeight : rowHeight}px`,
                              lineHeight: `${isDashboard ? dashboardRowHeight : rowHeight}px`,
                              padding: toCssValue(rowPadding),
                              ...(stickyColumns &&
                                stickyColumns.length > 0 && {
                                  position: "sticky",
                                  left: 0,
                                  zIndex: 10,
                                }),
                            }}
                          >
                            <Checkbox
                              checked={selectedItems.includes(item)}
                              onCheckedChange={() => handleCheckboxChange(item)}
                            />
                          </TableCell>
                        )}

                        {/* Data Cells */}
                        {visibleColumns.map((column) => {
                          const isSticky = isStickyColumn(column.key);
                          const stickyLeft = isSticky
                            ? getStickyLeftPosition(column.key)
                            : 0;
                          return (
                            <TableCell
                              key={column.key}
                              className={cn(
                                "border-r dark:text-white text-base-font dark:bg-gray-900",
                                isSticky && "bg-card"
                              )}
                              style={{
                                maxWidth: `${columnWidths[column.key] || defaultColumnWidth}px`,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                height: `${isDashboard ? dashboardRowHeight : rowHeight}px`,
                                lineHeight: `${isDashboard ? dashboardRowHeight : rowHeight}px`,
                                padding: toCssValue(cellPadding),
                                ...(isSticky && {
                                  position: "sticky",
                                  left: `${stickyLeft}px`,
                                  zIndex: 10,
                                }),
                              }}
                            >
                              {"render" in column ? (
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                  {column.render(item)}
                                </div>
                              ) : (
                                <EllipsisTooltip
                                  content={
                                    typeof item[column.key] === "number"
                                      ? item[column.key].toLocaleString()
                                      : String(item[column.key] || "")
                                  }
                                />
                              )}
                            </TableCell>
                          );
                        })}

                        {/* Actions Cell */}
                        {(isEdit ||
                          isDelete ||
                          isView ||
                          isDownload ||
                          isPause ||
                          isPlay ||
                          isRefetch ||
                          isSend ||
                          isClone) && (
                          <TableCell
                            className="border-r dark:text-white text-base-font dark:bg-gray-900"
                            style={{
                              height: `${isDashboard ? dashboardRowHeight : rowHeight}px`,
                              lineHeight: `${isDashboard ? dashboardRowHeight : rowHeight}px`,
                              padding: toCssValue(cellPadding),
                            }}
                          >
                            <div className="flex space-x-2 justify-center">
                              {isClone && (
                                <button
                                  onClick={() => onClone?.(item)}
                                  className="text-primary hover:text-gray-500"
                                >
                                  <FaClone size={18} />
                                </button>
                              )}
                              {isView && (
                                <button
                                  onClick={() => onView?.(item)}
                                  className="text-primary hover:text-gray-500"
                                >
                                  <MdVisibility size={18} />
                                </button>
                              )}

                              {isDelete && (
                                <button
                                  onClick={() => onDelete?.(item)}
                                  className="text-primary hover:text-gray-500"
                                >
                                  <MdDelete size={18} />
                                </button>
                              )}
                              {isEdit &&
                                item.report_differentiator !== "Download" && (
                                  <button
                                    onClick={() => onEdit?.(item)}
                                    className="text-primary hover:text-gray-500"
                                  >
                                    <MdEdit size={18} />
                                  </button>
                                )}
                              {isRefetch && (
                                <button
                                  onClick={() => setIsRefetchModalOpen(true)}
                                  className="text-primary hover:text-gray-500"
                                >
                                  <FiRefreshCw size={18} />
                                </button>
                              )}
                              {isSend && (
                                <button
                                  onClick={() => onSend?.(item)}
                                  className="text-primary hover:text-gray-500"
                                >
                                  <IoIosSend size={18} />
                                </button>
                              )}

                              {isDownload &&
                                item.report_status === "No Data" &&
                                item.download === "yes" && (
                                  <button
                                    disabled={true}
                                    title="No data"
                                    className="text-gray-500"
                                  >
                                    <MdFileDownload size={18} />
                                  </button>
                                )}
                                {isDownload &&
                                item.report_status === "scheduled" &&
                                item.download === "yes" && (
                                  <button
                                    disabled={true}
                                    title="No data"
                                    className="text-gray-500"
                                  >
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                  </button>
                                )}
                              {isDownload &&
                                (item.report_status === "mail sent" ||
                                  item.report_status === "url generated" ||
                                  item.report_status === "uploaded to s3") &&
                                item.download === "yes" && (
                                  <button
                                    onClick={() => onDownload?.(item)}
                                    className="text-primary hover:text-gray-500"
                                  >
                                    <MdFileDownload size={18} />
                                  </button>
                                )}
                              {isPause && (
                                <button
                                  onClick={() => onPause?.(item)}
                                  className="text-primary hover:text-gray-500"
                                >
                                  <MdPause size={18} />
                                </button>
                              )}
                              {isPlay && (
                                <button
                                  onClick={() => onPlay?.(item)}
                                  className="text-primary hover:text-gray-500"
                                >
                                  <MdPlayArrow size={18} />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {isPaginated && data.length > 0 && (
            <div
              className={cn(
                "flex flex-col sm:flex-row items-center justify-between border bg-card shadow-md"
              )}
              style={{
                marginTop: toCssValue(gap),
                gap: toCssValue(controlsGap),
                padding: toCssValue(tableContainerPadding),
                borderRadius: toCssValue(paginationBorderRadius),
              }}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(newPage: number) => {
                  setCurrentPage(newPage);
                  onPageChange?.(newPage);
                }}
                showFirstLast={true}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[10, 20, 50, 200]}
                showItemsPerPage={true}
                totalRecords={totalRecords}
              />
            </div>
          )}

          {/* Date Range Refetch Modal */}
          {isRefetch && (
            <Dialog
              open={isRefetchModalOpen}
              onOpenChange={setIsRefetchModalOpen}
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Select Date Range</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button
                    onClick={handleRefetch}
                    disabled={!startDate || !endDate}
                    className="w-full sm:w-auto"
                  >
                    Refetch Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </>
  );
};

export default ResizableTable;
