"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Loader2, ChevronDown, Settings, FileText } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { usePackage } from "@/components/mf/PackageContext";
import FilterModal from "@/components/report/filterModal";
import DeliveryOptionsModal from "@/components/report/deliveryoptionsModal";
import ConfirmationDialog from "@/components/report/confirmationDialog";
import ToastContent, { ToastType } from "@/components/mf/ToastContent";
import { useDateRange } from "@/components/mf/DateRangeContext";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import {
  useGetCategories,
  useGetTemplates,
  useGetTemplateFields,
  useGetDimensionFilters,
  useCreateReport,
  useViewReport,
  useEditReport,
  type GroupedDimension,
  type DimensionFilter,
  type DeliveryOptions,
  type ReportPayload,
  type CreateReportPayload,
  type ViewReportResponse,
} from "../../hooks/useReport";

// Constants
const FILTER_EXCLUDED_TERMS = ["date", "time"];
const CUSTOM_TEMPLATE = "Custom";
const CUSTOM_RANGE = "Custom Range";
const DEBOUNCE_DELAY = 150;
const VALID_FILE_TYPES = ["csv", "xlsx", "parquet"] as const;
const VALID_REPORT_CATEGORIES = ["summary", "transactional"] as const;

type CategoryType = "click" | "conversion" | "event";
type FileType = typeof VALID_FILE_TYPES[number];
type ReportCategory = typeof VALID_REPORT_CATEGORIES[number];

interface CategoryState {
  template: string;
  selectedDimensions: string[];
  dimensions: GroupedDimension[];
  popoverOpen: boolean;
}

interface FilterState {
  item: { id: string; label: string } | null;
  category: string;
  search: string;
}

const GenerateReportPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedPackage } = usePackage();
  const { startDate, endDate } = useDateRange();

  // URL params
  const editId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCloneMode = mode === "clone";
  const isReadOnly = isViewMode; // Only view mode is fully read-only

  // Form state
  const [formData, setFormData] = useState({
    reportName: "",
    reportCategory: "summary" as ReportCategory,
    fileType: "csv" as FileType,
    frequency: null as string | null,
    category: "",
    isDownloadReport: null as boolean | null,
  });

  // Category-specific state
  const [categoryState, setCategoryState] = useState<Record<CategoryType, CategoryState>>({
    click: { template: "", selectedDimensions: [], dimensions: [], popoverOpen: false },
    conversion: { template: "", selectedDimensions: [], dimensions: [], popoverOpen: false },
    event: { template: "", selectedDimensions: [], dimensions: [], popoverOpen: false },
  });

  // Modal states
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"schedule" | "download">("schedule");
  const [dimensionSearch, setDimensionSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterState, setFilterState] = useState<FilterState>({
    item: null,
    category: "",
    search: "",
  });
  const [dimensionsFilters, setDimensionsFilters] = useState<DimensionFilter[]>([]);
  const [deliveryData, setDeliveryData] = useState<DeliveryOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ reportName: "", category: "", dimensions: "" });
  const [toastData, setToastData] = useState<{
    type: ToastType;
    title: string;
    description?: string;
    variant?: "default" | "destructive" | null;
  } | null>(null);

  // API Hooks
  const { data: categoriesData, isLoading: isLoadingCategories, refetch: refetchCategories } =
    useGetCategories(selectedPackage || undefined, !!selectedPackage);

  const categoryOptions = useMemo(
    () => categoriesData?.map((item) => ({ label: item.label, value: item.value })) || [],
    [categoriesData]
  );

  const currentCategory = formData.category as CategoryType;
  const isCategoryValid = currentCategory === "click" || currentCategory === "conversion" || currentCategory === "event";

  // Templates per category
  const clickTemplates = useGetTemplates(
    selectedPackage,
    "click",
    !!selectedPackage && formData.category === "click"
  );
  const conversionTemplates = useGetTemplates(
    selectedPackage,
    "conversion",
    !!selectedPackage && formData.category === "conversion"
  );
  const eventTemplates = useGetTemplates(
    selectedPackage,
    "event",
    !!selectedPackage && formData.category === "event"
  );

  const templatesMap = useMemo(
    () => ({
      click: Array.isArray(clickTemplates.data) ? clickTemplates.data : [],
      conversion: Array.isArray(conversionTemplates.data) ? conversionTemplates.data : [],
      event: Array.isArray(eventTemplates.data) ? eventTemplates.data : [],
    }),
    [clickTemplates.data, conversionTemplates.data, eventTemplates.data]
  );

  const templatesLoadingMap = useMemo(
    () => ({
      click: clickTemplates.isLoading || clickTemplates.isFetching,
      conversion: conversionTemplates.isLoading || conversionTemplates.isFetching,
      event: eventTemplates.isLoading || eventTemplates.isFetching,
    }),
    [
      clickTemplates.isLoading,
      clickTemplates.isFetching,
      conversionTemplates.isLoading,
      conversionTemplates.isFetching,
      eventTemplates.isLoading,
      eventTemplates.isFetching,
    ]
  );

  // Template fields per category
  const clickFields = useGetTemplateFields(
    categoryState.click.template,
    "click",
    selectedPackage || undefined,
    formData.reportCategory,
    !!categoryState.click.template &&
      formData.category === "click" &&
      !!selectedPackage &&
      !!formData.reportCategory 
     
  );

  const conversionFields = useGetTemplateFields(
    categoryState.conversion.template,
    "conversion",
    selectedPackage || undefined,
    formData.reportCategory,
    !!categoryState.conversion.template &&
      formData.category === "conversion" &&
      !!selectedPackage &&
      !!formData.reportCategory 
    
  );

  const eventFields = useGetTemplateFields(
    categoryState.event.template,
    "event",
    selectedPackage || undefined,
    formData.reportCategory,
    !!categoryState.event.template &&
      formData.category === "event" &&
      !!selectedPackage &&
      !!formData.reportCategory 
  );

  // Filters API
  const { data: filterData, isLoading: isLoadingFilters, isFetching: isFetchingFilters } =
    useGetDimensionFilters(
      filterState.item?.id,
      selectedPackage || undefined,
      filterState.category || formData.category,
      formData.reportCategory,
      filterState.search,
      filterModalOpen && !!filterState.item?.id
    );

  // Create/View/Edit API hooks
  const [createPayload, setCreatePayload] = useState<CreateReportPayload | undefined>(undefined);
  const { data: createData, isLoading: isCreating, isFetching: isFetchingCreate, refetch: refetchCreate } =
    useCreateReport(createPayload, false);

  const [viewPayload, setViewPayload] = useState<{ doc_id?: string; package_name?: string } | undefined>(
    undefined
  );
  const [processedPayloadId, setProcessedPayloadId] = useState<string | null>(null);
  const { data: viewData, isLoading: isLoadingView, isFetching: isFetchingView, refetch: refetchViewReport } =
    useViewReport(viewPayload, !!(viewPayload?.doc_id && viewPayload?.package_name));

  const [editPayload, setEditPayload] = useState<
    { doc_id?: string; package_name?: string; update_data?: any } | undefined
  >(undefined);
  const { data: editData, isLoading: isEditing, isFetching: isFetchingEdit, refetch: refetchEdit } =
    useEditReport(editPayload, false);

  const isLoading = isCreating || isFetchingCreate || isLoadingView || isFetchingView || isEditing || isFetchingEdit;

  // Utility functions
  const shouldShowFilter = useCallback((dimensionId: string): boolean => {
    const lower = dimensionId?.toLowerCase() || "";
    return !FILTER_EXCLUDED_TERMS.some((term) => lower.includes(term));
  }, []);

  const getFilterCount = useCallback(
    (dimensionId: string): number => {
      const filter = dimensionsFilters.find((f) => f.field === dimensionId);
      return filter?.value?.length || 0;
    },
    [dimensionsFilters]
  );

  const hasFilters = useCallback(
    (dimensionId: string): boolean => {
      return getFilterCount(dimensionId) > 0;
    },
    [getFilterCount]
  );

  const filterDimensions = useCallback(
    (dimensions: GroupedDimension[] | undefined, search: string) => {
      if (!dimensions || !Array.isArray(dimensions)) return [];
      if (!search) return dimensions;
      const lower = search.toLowerCase();
      return dimensions
        .map((group) => ({
          ...group,
          items: (group.items || []).filter((item) => item.label?.toLowerCase().includes(lower)),
        }))
        .filter((group) => group.items && group.items.length > 0);
    },
    []
  );

  const getCategoryState = useCallback(
    (cat: CategoryType) => categoryState[cat],
    [categoryState]
  );

  const updateCategoryState = useCallback(
    (cat: CategoryType, updates: Partial<CategoryState>) => {
      setCategoryState((prev) => ({
        ...prev,
        [cat]: { ...prev[cat], ...updates },
      }));
    },
    []
  );

  // Set default template when templates are loaded
  useEffect(() => {
    if (!isCategoryValid) return;

    const templates = templatesMap[currentCategory];
    if (templates.length > 0 && !categoryState[currentCategory].template) {
      updateCategoryState(currentCategory, { template: templates[0] });
    }
  }, [templatesMap, currentCategory, isCategoryValid, categoryState, updateCategoryState]);

  // Update dimensions when fields are loaded
  useEffect(() => {
    if (!isCategoryValid) return;

    const fields =
      currentCategory === "click"
        ? clickFields.data
        : currentCategory === "conversion"
        ? conversionFields.data
        : eventFields.data;

    if (fields?.dimensions) {
      updateCategoryState(currentCategory, { dimensions: fields.dimensions });
    }
  }, [
    clickFields.data,
    conversionFields.data,
    eventFields.data,
    currentCategory,
    isCategoryValid,
    updateCategoryState,
  ]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(dimensionSearch), DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [dimensionSearch]);

  // Load report for view/edit
  useEffect(() => {
    if (editId && (isEditMode || isCloneMode || isViewMode) && selectedPackage) {
      const payload = { doc_id: editId, package_name: selectedPackage };
      const payloadKey = `${editId}-${selectedPackage}`;
      if (processedPayloadId !== payloadKey) {
        setProcessedPayloadId(null);
        setFormData({
          reportName: "",
          reportCategory: "summary",
          fileType: "csv",
          frequency: null,
          category: "",
          isDownloadReport: null,
        });
        setDimensionsFilters([]);
        setDeliveryData(null);
        setCategoryState({
          click: { template: "", selectedDimensions: [], dimensions: [], popoverOpen: false },
          conversion: { template: "", selectedDimensions: [], dimensions: [], popoverOpen: false },
          event: { template: "", selectedDimensions: [], dimensions: [], popoverOpen: false },
        });
      }
      setViewPayload(payload);
    } else {
      setViewPayload(undefined);
      setProcessedPayloadId(null);
    }
  }, [editId, isEditMode, isCloneMode, isViewMode, selectedPackage, processedPayloadId]);

  // Refetch view report when payload changes
  useEffect(() => {
    if (viewPayload?.doc_id && viewPayload?.package_name && refetchViewReport) {
      const timeoutId = setTimeout(() => {
        refetchViewReport();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [viewPayload?.doc_id, viewPayload?.package_name, refetchViewReport]);

  // Process view data
  useEffect(() => {
    if (!viewData || !viewPayload?.doc_id || !viewPayload?.package_name || isLoadingView) return;

    const payloadKey = `${viewPayload.doc_id}-${viewPayload.package_name}`;
    if (processedPayloadId === payloadKey) return;

    const response = viewData as ViewReportResponse;
    const data = response?.data;
    if (!data || Object.keys(data).length === 0) {
      setProcessedPayloadId(payloadKey);
      return;
    }

    // Extract category data
    const clickData = (data as any).click;
    const conversionData = (data as any).conversion;
    const eventData = (data as any).event;
    const primaryData = clickData || conversionData || eventData;

    if (!primaryData) {
      setProcessedPayloadId(payloadKey);
      return;
    }

    // Normalize file type
    const normalizedFileType = primaryData.reportFormats
      ? String(primaryData.reportFormats).toLowerCase()
      : "csv";
    const finalFileType = VALID_FILE_TYPES.includes(normalizedFileType as FileType)
      ? (normalizedFileType as FileType)
      : "csv";

    // Normalize report category
    const normalizedReportCategory = primaryData.report_type
      ? String(primaryData.report_type).toLowerCase()
      : "summary";
    const finalReportCategory = VALID_REPORT_CATEGORIES.includes(normalizedReportCategory as ReportCategory)
      ? (normalizedReportCategory as ReportCategory)
      : "summary";

    // Determine category
    let categoryValue = "";
    if (clickData) {
      categoryValue = Array.isArray(clickData.category) ? clickData.category[0] : clickData.category || "click";
    } else if (conversionData) {
      categoryValue = Array.isArray(conversionData.category)
        ? conversionData.category[0]
        : conversionData.category || "conversion";
    } else if (eventData) {
      categoryValue = Array.isArray(eventData.category) ? eventData.category[0] : eventData.category || "event";
    }

    setFormData({
      reportName: primaryData.report_name || "",
      reportCategory: finalReportCategory,
      frequency: primaryData.occurence || null,
      fileType: finalFileType,
      category: categoryValue,
      isDownloadReport: primaryData.download === "yes",
    });

    // Set category-specific data
    if (clickData && clickData.template) {
      updateCategoryState("click", { template: clickData.template });
      if (clickData.dimensions?.length > 0) {
        setDimensionsFilters(clickData.dimensions);
        const dimensionFields = clickData.dimensions.map((dim: DimensionFilter) => dim.field);
        updateCategoryState("click", { selectedDimensions: dimensionFields });
      }
    }

    if (conversionData && conversionData.template) {
      updateCategoryState("conversion", { template: conversionData.template });
      if (conversionData.dimensions?.length > 0) {
        const dimensionFields = conversionData.dimensions.map((dim: DimensionFilter) => dim.field);
        updateCategoryState("conversion", { selectedDimensions: dimensionFields });
      }
    }

    if (eventData && eventData.template) {
      updateCategoryState("event", { template: eventData.template });
      if (eventData.dimensions?.length > 0) {
        const dimensionFields = eventData.dimensions.map((dim: DimensionFilter) => dim.field);
        updateCategoryState("event", { selectedDimensions: dimensionFields });
      }
    }

    if (primaryData.deliveryOptions) {
      // Transform deliveryOptions to nest under category for modal compatibility
      // The modal expects: { [category]: { email: {...}, aws: {...}, etc. } }
      const transformedDeliveryData: any = {
        [categoryValue]: {
          ...primaryData.deliveryOptions,
        },
      };
      // Also keep root level for backward compatibility
      Object.keys(primaryData.deliveryOptions).forEach((key) => {
        if (!transformedDeliveryData[key]) {
          transformedDeliveryData[key] = (primaryData.deliveryOptions as any)[key];
        }
      });
      setDeliveryData(transformedDeliveryData as DeliveryOptions);
    }

    setProcessedPayloadId(payloadKey);
  }, [viewData, viewPayload, isLoadingView, processedPayloadId, updateCategoryState]);

  // Refetch categories on package/date change
  useEffect(() => {
    if (selectedPackage) refetchCategories();
  }, [selectedPackage, startDate, endDate, refetchCategories]);

  // Handlers
  const handleDimensionSelect = useCallback(
    (cat: CategoryType, value: string) => {
      const currentState = getCategoryState(cat);
      const currentSelected = currentState.selectedDimensions || [];
      const newSelected = currentSelected.includes(value)
        ? currentSelected.filter((dim) => dim !== value)
        : [...currentSelected, value];

      updateCategoryState(cat, { selectedDimensions: newSelected });
      if (newSelected.length > 0) {
        setErrors((prev) => ({ ...prev, dimensions: "" }));
      }
    },
    [getCategoryState, updateCategoryState]
  );

  const handleFilterClick = useCallback((item: { id: string; label: string }, cat: string) => {
    setFilterState({ item, category: cat, search: "" });
    setFilterModalOpen(true);
  }, []);

  const handleTemplateChange = useCallback(
    (cat: CategoryType, value: string) => {
      updateCategoryState(cat, { template: value, selectedDimensions: [] });
    },
    [updateCategoryState]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors = { reportName: "", category: "", dimensions: "" };
    let isValid = true;

    if (!formData.reportName.trim()) {
      newErrors.reportName = "Report name is mandatory.";
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    if (isCategoryValid) {
      const state = getCategoryState(currentCategory);
      if (state.template === CUSTOM_TEMPLATE && state.selectedDimensions.length === 0) {
        newErrors.dimensions = "Please select at least one dimension";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [formData.reportName, formData.category, isCategoryValid, currentCategory, getCategoryState]);

  const handleDownloadClick = useCallback(() => {
    if (!validateForm()) return;
    setDeliveryType("download");
    setDeliveryModalOpen(true);
  }, [validateForm]);

  const handleFilterSave = useCallback(
    (data: DimensionFilter & { category?: string }) => {
      const category = filterState.category || data.category || formData.category;
      if (!category) return;

      setDimensionsFilters((prev) => {
        const index = prev.findIndex((f) => f.field === data.field);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return [...prev, data];
      });
    },
    [filterState.category, formData.category]
  );

  const buildDimensionsPayload = useCallback(
    (cat: CategoryType): DimensionFilter[] => {
      const state = getCategoryState(cat);
      if (state.template === CUSTOM_TEMPLATE) {
        return (state.selectedDimensions || []).map((id) => {
          const existing = dimensionsFilters.find((f) => f.field === id);
          return { field: id, value: existing?.value || [] };
        });
      }

      const allDimensions: Array<{ id: string; label: string }> = [];
      (state.dimensions || []).forEach((group) => {
        (group.items || []).forEach((item) => allDimensions.push(item));
      });

      return allDimensions.map((dim) => {
        const existing = dimensionsFilters.find((f) => f.field === dim.id);
        return { field: dim.id, value: existing?.value || [] };
      });
    },
    [getCategoryState, dimensionsFilters]
  );

  const buildPayload = useCallback(
    (delivery: DeliveryOptions): CreateReportPayload => {
      const payload: CreateReportPayload = {};
      if (!isCategoryValid) return payload;

      const state = getCategoryState(currentCategory);
      if (!state.template) return payload;

      const reportPayload: ReportPayload = {
        report_name: formData.reportName,
        occurance: formData.frequency || undefined,
        package_name: selectedPackage || "",
        dimensions: buildDimensionsPayload(currentCategory),
        reportFormats: formData.fileType,
        report_type: formData.reportCategory,
        deliveryOptions: (delivery as any)?.[currentCategory] || delivery,
        download: deliveryType === "download" ? "yes" : "no",
        template: state.template,
        category: [currentCategory],
      };

      if (formData.frequency === CUSTOM_RANGE) {
        reportPayload.start_date = delivery?.dateRange?.startDate;
        reportPayload.end_date = delivery?.dateRange?.endDate;
      }

      (payload as any)[currentCategory] = reportPayload;
      return payload;
    },
    [
      isCategoryValid,
      currentCategory,
      getCategoryState,
      formData,
      selectedPackage,
      deliveryType,
      buildDimensionsPayload,
    ]
  );

  const handleModalSubmit = useCallback(
    (data: DeliveryOptions, startdate?: string, enddate?: string) => {
      setDeliveryData(data);
      setIsSubmitting(true); // Set submitting state immediately
      
      if (editId && isEditMode && isCategoryValid) {
        const state = getCategoryState(currentCategory);
        if (!state.template) return;

        const payload: ReportPayload = {
          report_name: formData.reportName,
          occurence: formData.frequency || undefined,
          package_name: selectedPackage || "",
          dimensions: buildDimensionsPayload(currentCategory),
          reportFormats: formData.fileType,
          report_type: formData.reportCategory,
          deliveryOptions: (data as any)?.[currentCategory] || data,
          download: deliveryType === "download" ? "yes" : "no",
          template: state.template,
          category: currentCategory,
        };

        if (formData.frequency === CUSTOM_RANGE) {
          payload.start_date = data?.dateRange?.startDate;
          payload.end_date =  data?.dateRange?.endDate;
        }

        const updateData: Record<string, ReportPayload> = {};
        updateData[currentCategory] = payload;
        setEditPayload({ doc_id: editId, package_name: selectedPackage, update_data: updateData });
        requestAnimationFrame(() => refetchEdit());
        // Don't close modal - wait for API success
      } else {
        setCreatePayload(buildPayload(data));
        requestAnimationFrame(() => refetchCreate());
        // Don't close modal - wait for API success
      }
      
      // Don't close modal here - it will close on API success
    },
    [
      editId,
      isEditMode,
      isCategoryValid,
      currentCategory,
      getCategoryState,
      formData,
      selectedPackage,
      deliveryType,
      buildDimensionsPayload,
      buildPayload,
      refetchEdit,
      refetchCreate,
    ]
  );

  const handleConfirmation = useCallback(
    (action: "cloud" | "email" | "download") => {
      setConfirmationDialogOpen(false);
      if (action === "cloud" || action === "email") {
        setDeliveryType("download");
        setDeliveryModalOpen(true);
      } else if (deliveryData) {
        handleModalSubmit(deliveryData);
      }
    },
    [deliveryData, handleModalSubmit]
  );

  const handleScheduleClick = useCallback(() => {
    if (!validateForm()) return;
    setDeliveryType("schedule");
    setDeliveryModalOpen(true);
  }, [validateForm]);

  const handleCloseDeliveryModal = useCallback(() => {
    setDeliveryModalOpen(false);
    setDeliveryData(null);
  }, []);

  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleCategoryChange = useCallback(
    (value: string) => {
      // Don't allow category changes in view or edit mode
      if (isReadOnly || isEditMode) return;
      updateFormData({ category: value });
      if (value) setErrors((prev) => ({ ...prev, category: "" }));
    },
    [isReadOnly, isEditMode, updateFormData]
  );

  // Handle API success
  useEffect(() => {
    if (!createData) return;
    
    const response = createData as any;
    
    // Check for success - API returns { message, id } on success
    if (response?.status === "success") {
      const successMessage = response?.message || "Report created successfully!";
      setToastData({
        type: "success",
        title: "Success",
        description: successMessage,
        variant: "default",
      });
      // Reset submitting state and close the delivery modal
      setIsSubmitting(false);
      setDeliveryModalOpen(false);
      // Navigate to report list
      router.push("/re-engagement/reportingtool/report");
    }
  }, [createData, router]);

  useEffect(() => {
    if (!editData) return;
    
    const response = editData as any;
    
    // Check for success - API returns { message, id } on success
    if (response?.message || response?.id) {
      const successMessage = response?.message || "Report updated successfully!";
      setToastData({
        type: "success",
        title: "Success",
        description: successMessage,
        variant: "default",
      });
      // Reset submitting state and close the delivery modal
      setIsSubmitting(false);
      setDeliveryModalOpen(false);
      // Navigate to report list
      router.push("/re-engagement/reportingtool/report");
    }
  }, [editData, router]);

  // Get current category display name and state
  const categoryDisplayName = useMemo(() => {
    const categoryItem = categoryOptions.find((item) => item.value === formData.category);
    return categoryItem ? categoryItem.label : formData.category;
  }, [categoryOptions, formData.category]);

  const currentCategoryState = isCategoryValid ? getCategoryState(currentCategory) : null;
  const currentTemplates = isCategoryValid ? templatesMap[currentCategory] : [];
  const currentTemplatesLoading = isCategoryValid ? templatesLoadingMap[currentCategory] : false;
  const currentDimensions = currentCategoryState?.dimensions || [];

  return (
    <>
     
        <div className="pt-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-900 h-[120px] rounded-xl">
          {toastData && (
            <ToastContent
              type={toastData.type}
              title={toastData.title}
              description={toastData.description}
              variant={toastData.variant}
            />
          )}
          <div className="w-full space-y-2 dark:bg-gray-900 rounded-xl">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Report Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Report Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700 dark:text-white">Report Name <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Enter report name"
                    value={formData.reportName}
                    onChange={(e) => {
                      updateFormData({ reportName: e.target.value });
                      setErrors((prev) => ({ ...prev, reportName: "" }));
                    }}
                    disabled={isReadOnly || isEditMode}
                    className={`h-9 text-subBody ${errors.reportName ? 'border-red-500' : ''}`}
                  />
                  {errors.reportName && <p className="text-xs text-red-500">{errors.reportName}</p>}
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700 dark:text-white">Category <span className="text-red-500">*</span></Label>
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center h-9 border border-input rounded-md bg-gray-50 dark:bg-background">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  ) : (
                    <MFSingleSelect
                      items={categoryOptions.map((item) => ({
                        title: item.label,
                      value: item.value,
                    }))}
                    placeholder="Select Category"
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                    className={`${isReadOnly || isEditMode ? "opacity-50 pointer-events-none" : ""} dark:bg-background`}
                  />
                )}
                {errors.category && <p className="text-subBody text-red-500">{errors.category}</p>}
              </div>

                {/* File Type */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700 dark:text-white">File Type</Label>
                  <MFSingleSelect
                    items={(["csv", "xlsx", "parquet"] as FileType[]).map((type) => ({
                      title: type.toUpperCase(),
                      value: type,
                    }))}
                    placeholder="Select file type"
                    value={formData.fileType}
                    onValueChange={(value) => updateFormData({ fileType: value as FileType })}
                    className={isReadOnly ? "opacity-50 pointer-events-none" : ""}
                  />
                </div>

                {/* Report Category */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700 dark:text-white">Report Category</Label>
                  <MFSingleSelect
                    items={(["summary", "transactional"] as ReportCategory[]).map((category) => ({
                      title: category.charAt(0).toUpperCase() + category.slice(1),
                      value: category,
                    }))}
                    placeholder="Select report category"
                    value={formData.reportCategory}
                    onValueChange={(value) => updateFormData({ reportCategory: value as ReportCategory })}
                    className={isReadOnly ? "opacity-50 pointer-events-none" : ""}
                  />
                </div>
              </div>
            </div>

            {/* Category Configuration */}
            {isCategoryValid && currentCategoryState && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${currentCategory === 'click' ? 'bg-blue-50' : currentCategory === 'conversion' ? 'bg-green-50' : 'bg-purple-50'}`}>
                      <FileText className={`h-4 w-4 ${currentCategory === 'click' ? 'text-blue-600' : currentCategory === 'conversion' ? 'text-green-600' : 'text-purple-600'}`} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 capitalize dark:text-white">{categoryDisplayName} Configuration</h3>
                  </div>
                </div>
                <div className="flex gap-x-4 w-full">
                  <div className="w-1/2 space-y-4">
                    {/* Category Template */}
                    <div className="space-y-2 dark:text-white">
                      <Label>{categoryDisplayName} Template</Label>
                      {currentTemplatesLoading ? (
                        <div className="flex justify-center items-center p-2 border border-input rounded-md h-10">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      ) : (
                        <MFSingleSelect
                          items={currentTemplates.map((template) => ({
                            title: template,
                            value: template,
                          }))}
                          placeholder={`Choose ${categoryDisplayName} Template`}
                          value={currentCategoryState.template}
                          onValueChange={(value) => handleTemplateChange(currentCategory, value)}
                          className={isViewMode ? "opacity-50 pointer-events-none" : ""}
                        />
                      )}
                    </div>

                    {/* Category Dimensions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold dark:text-white">{categoryDisplayName} Dimensions</Label>
                        {currentCategoryState.template === CUSTOM_TEMPLATE && (
                          <span className="text-xs text-gray-500">
                            {currentCategoryState.selectedDimensions.length} selected
                          </span>
                        )}
                      </div>

                      {currentCategoryState.template === CUSTOM_TEMPLATE && (
                        <Popover
                          open={currentCategoryState.popoverOpen}
                          
                          onOpenChange={(open) => updateCategoryState(currentCategory, { popoverOpen: open })}
                        >
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between" disabled={isViewMode}>
                              <span className="text-xs">Select {categoryDisplayName} Dimensions</span>
                              <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <div className="p-2">
                              <Input
                                type="text"
                                placeholder="Search dimensions..."
                                className="mb-2 h-8 text-subBody"
                                value={dimensionSearch}
                                onChange={(e) => setDimensionSearch(e.target.value)}
                              />
                              <div className="max-h-[250px] overflow-y-auto">
                                {filterDimensions(currentDimensions, debouncedSearch).map((group) => (
                                  <div key={group.label} className="mb-2">
                                    <div className="mb-1 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-white">
                                      {group.label}
                                    </div>
                                    {(group.items || []).map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-gray-900 transition-colors dark:text-white"
                                      >
                                        <div className="flex items-center gap-2 flex-1">
                                          <Checkbox
                                            id={`dimension-${currentCategory}-${item.id}`}
                                            checked={currentCategoryState.selectedDimensions.includes(item.id)}
                                            onCheckedChange={() => handleDimensionSelect(currentCategory, item.id)}
                                          />
                                          <Label
                                            htmlFor={`dimension-${currentCategory}-${item.id}`}
                                            className="cursor-pointer text-xs text-gray-700 flex-1 dark:text-white"
                                          >
                                            {item.label}
                                          </Label>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}

                      {errors.dimensions && <p className="text-xs text-red-500">{errors.dimensions}</p>}

                      {currentCategoryState.template === CUSTOM_TEMPLATE &&
                      currentCategoryState.selectedDimensions.length === 0 ? (
                        <div className="mt-1 flex h-16 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                          <p className="text-xs text-gray-500">Select dimensions to view them here</p>
                        </div>
                      ) : (
                        <div className="mt-1 max-h-[250px] overflow-y-auto rounded-md border border-gray-200 bg-gray-50/50">
                          {currentDimensions.map((group) => {
                            const groupItems =
                              currentCategoryState.template === CUSTOM_TEMPLATE
                                ? (group.items || []).filter((item) =>
                                    currentCategoryState.selectedDimensions.includes(item.id)
                                  )
                                : group.items || [];

                            if (groupItems.length === 0) return null;

                            return (
                              <div key={group.label} className="p-2 border-b border-gray-200 last:border-b-0">
                                <div className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  {group.label}
                                </div>
                                <div className="space-y-1">
                                  {groupItems.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between p-1.5 rounded-md hover:bg-blue-50"
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        {currentCategoryState.template === CUSTOM_TEMPLATE && (
                                          <Checkbox
                                            id={item.id}
                                            checked={true}
                                            onClick={() => handleDimensionSelect(currentCategory, item.id)}
                                          />
                                        )}
                                        <Label htmlFor={item.id} className="text-xs text-gray-700 cursor-pointer flex-1 dark:text-white">
                                          {item.label}
                                        </Label>
                                      </div>
                                      {shouldShowFilter(item.id) && (
                                        <button
                                          onClick={() => handleFilterClick(item, formData.category)}
                                          className={`flex items-center gap-1 p-1 rounded-md hover:bg-primary/10 transition-colors ${
                                            hasFilters(item.id) ? "text-primary" : "text-gray-400"
                                          }`}
                                          title={hasFilters(item.id) ? `${getFilterCount(item.id)} filter(s) applied` : "Apply filters"}
                                        >
                                          {hasFilters(item.id) && (
                                            <span className="text-xs font-medium text-primary dark:text-white">
                                              {getFilterCount(item.id)}
                                            </span>
                                          )}
                                          <Filter className={`h-3 w-3 ${hasFilters(item.id) ? "text-primary" : "text-gray-400"}`} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

            <div className="mt-6 flex justify-end gap-3 dark:bg-gray-700">
              <Button
                onClick={() => router.push("/re-engagement/reportingtool/report")}
                variant="default"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleClick}
                variant="default"
                size="sm"
                disabled={(isViewMode || isEditMode || isCloneMode) && formData.isDownloadReport === true}
              >
                Schedule
              </Button>
              <Button
                onClick={handleDownloadClick}
                variant="default"
                size="sm"
                disabled={(isViewMode || isEditMode || isCloneMode) && formData.isDownloadReport === false}
              >
                Download
              </Button>
            </div>
          

          <ConfirmationDialog
            isOpen={confirmationDialogOpen}
            onClose={() => setConfirmationDialogOpen(false)}
            onConfirm={handleConfirmation}
          />

          <FilterModal
            isOpen={filterModalOpen}
            onClose={() => {
              setFilterModalOpen(false);
              setFilterState({ item: null, category: "", search: "" });
            }}
            selectedItem={filterState.item}
            onSave={handleFilterSave}
            filterData={filterData}
            filterloading={isLoadingFilters || isFetchingFilters}
            savedFilters={dimensionsFilters}
            mode={mode || ""}
            onSearchChange={(val) => setFilterState((prev) => ({ ...prev, search: val }))}
            category={filterState.category}
          />

          <DeliveryOptionsModal
            categories={formData.category ? [formData.category] : []}
            isOpen={deliveryModalOpen}
            onClose={() => {
              // Prevent closing during API call
              if (isSubmitting) return;
              handleCloseDeliveryModal();
            }}
            type={deliveryType}
            onSubmit={handleModalSubmit}
            defaultData={deliveryData}
            mode={mode || ""}
            frequency={formData.frequency || undefined}
            onFrequencyChange={(val) => updateFormData({ frequency: val || null })}
            isSubmitting={isSubmitting}
            module="app-analytics"
          />
        </div>
    </>
  );
};

export default GenerateReportPage;
