"use client";


import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { Filter, Loader2, ChevronDown, Settings, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
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
} from "../../hooks/useIntegrityReport";

// Constants
const FILTER_EXCLUDED_TERMS = ["date", "time"];
const CUSTOM_TEMPLATE = "Custom";
const CUSTOM_RANGE = "Custom Range";
const DEBOUNCE_DELAY = 150;

// Helpers
const ensureArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (Array.isArray(value)) return value;

  if (value !== null && value !== undefined) return [value];
  return [];
};


const shouldShowFilter = (id: string): boolean => {
  const lower = id?.toLowerCase() || "";
  return !FILTER_EXCLUDED_TERMS.some((term) => lower.includes(term));
};

// Types
interface CategoryState {
  template: string;
  dimensions: GroupedDimension[];
  selectedDimensions: string[];
  popoverOpen: boolean;
}

interface ToastData {
  type: ToastType;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | null;

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
    reportCategory: "summary" as "summary" | "transactional",
    fileType: "csv",
    frequency: null as string | null,
    category: [] as string[],
    isDownloadReport: null as boolean | null,
  });

  const [categoryTemplates, setCategoryTemplates] = useState<Record<string, CategoryState>>({});
  const [dimensionsFilters, setDimensionsFilters] = useState<DimensionFilter[]>([]);
  const [errors, setErrors] = useState({ reportName: "", category: "", dimensions: "" });
  const [toastData, setToastData] = useState<ToastData | null>(null);

  // Modal states
  const [modals, setModals] = useState({
    filter: false,
    delivery: false,
    confirmation: false,
  });
  const [deliveryType, setDeliveryType] = useState<"schedule" | "download">("schedule");
  const [deliveryData, setDeliveryData] = useState<DeliveryOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterState, setFilterState] = useState<{ item: { id: string; label: string } | null; category: string; search: string }>({
    item: null,
    category: "",
    search: "",
  });
  const [dimensionSearch, setDimensionSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {

    const timer = setTimeout(() => setDebouncedSearch(dimensionSearch), DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [dimensionSearch]);

  // API Hooks
  const { data: categoriesData, isLoading: isLoadingCategories, refetch: refetchCategories } = useGetCategories(
    selectedPackage || undefined,
    !!selectedPackage
  );
  const categoryOptions = useMemo(() => categoriesData?.map((item: any) => ({ label: item.label, value: item.value })) || [], [categoriesData]);

  // Templates per category (click and impression for integrity)
  const clickTemplates = useGetTemplates(selectedPackage, "click", !!selectedPackage && formData.category.includes("click"));
  const impressionTemplates = useGetTemplates(selectedPackage, "impression", !!selectedPackage && formData.category.includes("impression"));

  const templatesMap = useMemo(
    () => ({
      click: Array.isArray(clickTemplates.data) ? clickTemplates.data : [],
      impression: Array.isArray(impressionTemplates.data) ? impressionTemplates.data : [],
    }),
    [clickTemplates.data, impressionTemplates.data]
  );

  const templatesLoadingMap = useMemo(
    () => ({
      click: clickTemplates.isLoading || clickTemplates.isFetching,
      impression: impressionTemplates.isLoading || impressionTemplates.isFetching,
    }),
    [clickTemplates.isLoading, clickTemplates.isFetching, impressionTemplates.isLoading, impressionTemplates.isFetching]
  );

  // Template fields per category
  const clickFields = useGetTemplateFields(
    categoryTemplates["click"]?.template,
    "click",
    selectedPackage || undefined,
    formData.reportCategory,
    !!categoryTemplates["click"]?.template && formData.category.includes("click") && !!selectedPackage && !!formData.reportCategory
  );

  const impressionFields = useGetTemplateFields(
    categoryTemplates["impression"]?.template,
    "impression",
    selectedPackage || undefined,
    formData.reportCategory,
    !!categoryTemplates["impression"]?.template && formData.category.includes("impression") && !!selectedPackage && !!formData.reportCategory
  );

  const fieldsMap = useMemo(
    () => ({
      click: clickFields.data,
      impression: impressionFields.data,
    }),
    [clickFields.data, impressionFields.data]
  );

  // Filters
  const { data: filterData, isLoading: isLoadingFilters, isFetching: isFetchingFilters } = useGetDimensionFilters(
    filterState.item?.id,
    selectedPackage || undefined,
    filterState.category || formData.category,
    formData.reportCategory,
    filterState.search,
    modals.filter && !!filterState.item?.id
  );

  // Create/View/Edit
  const [createPayload, setCreatePayload] = useState<any>(undefined);
  const { data: createData, isLoading: isCreating, isFetching: isFetchingCreate, refetch: refetchCreate } = useCreateReport(createPayload, false);

  const [viewPayload, setViewPayload] = useState<{ doc_id?: string; package_name?: string } | undefined>(undefined);
  const [processedPayloadId, setProcessedPayloadId] = useState<string | null>(null);
  const { data: viewData, isLoading: isLoadingView, isFetching: isFetchingView, refetch: refetchViewReport } = useViewReport(
    viewPayload,
    !!(viewPayload?.doc_id && viewPayload?.package_name)
  );

  const [editPayload, setEditPayload] = useState<{ doc_id?: string; package_name?: string; update_data?: any } | undefined>(undefined);
  const { data: editData, isLoading: isEditing, isFetching: isFetchingEdit, refetch: refetchEdit } = useEditReport(editPayload, false);

  const isLoading = isCreating || isFetchingCreate || isLoadingView || isFetchingView || isEditing || isFetchingEdit;

  // Utility functions
  const getFilterCountForDimension = useCallback(
    (dimensionId: string, category: string): number => {
      const compositeField = `${category}:${dimensionId}`;
      const filter = dimensionsFilters.find((f) => {
        return f.field === compositeField || f.field === dimensionId;
      });
      return filter?.value?.length || 0;
    },
    [dimensionsFilters]
  );

  const hasFiltersForDimension = useCallback(
    (dimensionId: string, category: string): boolean => {
      return getFilterCountForDimension(dimensionId, category) > 0;
    },
    [getFilterCountForDimension]
  );

  // Initialize category templates
  useEffect(() => {
    const missing = formData.category.filter((cat) => !categoryTemplates[cat]);
    if (missing.length > 0) {
      setCategoryTemplates((prev) => {
        const updated = { ...prev };
        missing.forEach((cat) => {
          updated[cat] = { template: "", dimensions: [], selectedDimensions: [], popoverOpen: false };
        });
        return updated;
      });
    }
  }, [formData.category, categoryTemplates]);

  // Set default templates
  useEffect(() => {

    if (editId) return;
    const updates: Record<string, Partial<CategoryState>> = {};
    formData.category.forEach((cat) => {
      const templates = templatesMap[cat as keyof typeof templatesMap] || [];
      const state = categoryTemplates[cat];
      if (templates.length > 0 && !state?.template) {
        updates[cat] = { template: templates[0] || "" };
      }
    });
    if (Object.keys(updates).length > 0) {
      setCategoryTemplates((prev) => {
        const updated = { ...prev };
        Object.keys(updates).forEach((cat) => {
          updated[cat] = { ...updated[cat], ...updates[cat] };
        });
        return updated;
      });
    }
  }, [templatesMap, editId, formData.category, categoryTemplates]);

  // Update dimensions from fields
  useEffect(() => {

    const updates: Record<string, GroupedDimension[]> = {};
    formData.category.forEach((cat) => {
      const fields = fieldsMap[cat as keyof typeof fieldsMap];
      if (fields?.dimensions) {
        updates[cat] = fields.dimensions;
      }
    });
    if (Object.keys(updates).length > 0) {
      setCategoryTemplates((prev) => {
        const updated = { ...prev };
        Object.keys(updates).forEach((cat) => {
          updated[cat] = { ...updated[cat], dimensions: updates[cat] };
        });
        return updated;
      });
    }
  }, [fieldsMap, formData.category]);

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
          category: [],
          isDownloadReport: null,
        });
        setCategoryTemplates({});
        setDimensionsFilters([]);
        setDeliveryData(null);
      }
      setViewPayload(payload);
    } else {

      setViewPayload(undefined);
      setProcessedPayloadId(null);
    }
  }, [editId, isEditMode, isCloneMode, isViewMode, selectedPackage, processedPayloadId]);

  // Refetch view report when payload changes
  useEffect(() => {
    if (viewPayload?.doc_id && viewPayload?.package_name) {
      const timeoutId = setTimeout(() => {
        if (refetchViewReport) {
          refetchViewReport();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [viewPayload?.doc_id, viewPayload?.package_name, refetchViewReport]);

  // Process view data
  useEffect(() => {
    if (!viewData || !viewPayload?.doc_id || !viewPayload?.package_name) return;

    const payloadKey = `${viewPayload.doc_id}-${viewPayload.package_name}`;
    if (processedPayloadId === payloadKey) return;
    if (isLoadingView) return;

    const response = viewData as ViewReportResponse;
    const data = response?.data;
    if (!data || Object.keys(data).length === 0) {
      setProcessedPayloadId(payloadKey);
      return;
    }

    const categories: string[] = [];
    const categoryDataMap: Record<string, any> = {};
    const validCategoryKeys = ["click", "impression"];

    Object.keys(data).forEach((key) => {
      const catData = (data as any)[key];
      if (!catData || typeof catData !== "object") return;

      if (validCategoryKeys.includes(key)) {
        if (!categories.includes(key)) {
          categories.push(key);
        }
        categoryDataMap[key] = catData;
      }
      if (catData?.category) {
        const catArray = ensureArray(catData.category);
        catArray.forEach((cat: string) => {
          const catString = String(cat).trim();
          const splitCats = catString.includes(",")
            ? catString.split(",").map(c => c.trim().toLowerCase())
            : [catString.toLowerCase()];

          splitCats.forEach((normalizedCat) => {
            if (validCategoryKeys.includes(normalizedCat) && !categories.includes(normalizedCat)) {
              categories.push(normalizedCat);
            }
            if (!categoryDataMap[normalizedCat]) {
              categoryDataMap[normalizedCat] = catData;
            }
          });
        });
      }
    });

    if (categories.length === 0) {
      validCategoryKeys.forEach((key) => {
        const catData = (data as any)[key];
        if (catData) {
          categories.push(key);
          categoryDataMap[key] = catData;
        }
      });
    }

    const uniqueCategories = Array.from(new Set(categories));
    if (uniqueCategories.length === 0) return;

    const firstData = Object.values(categoryDataMap)[0];
    if (!firstData) return;

    const normalizedFileType = firstData.reportFormats
      ? String(firstData.reportFormats).toLowerCase()
      : "csv";
    const validFileTypes = ["csv", "xlsx"];
    const finalFileType = validFileTypes.includes(normalizedFileType) ? normalizedFileType : "csv";

    const normalizedReportCategory = firstData.report_type
      ? String(firstData.report_type).toLowerCase()
      : "summary";
    const validReportCategories = ["summary", "transactional"];
    const finalReportCategory = validReportCategories.includes(normalizedReportCategory)
      ? normalizedReportCategory as "summary" | "transactional"
      : "summary";

    setFormData((prev) => ({
      ...prev,
      reportName: firstData.report_name || "",
      reportCategory: finalReportCategory,
      frequency: firstData.occurence || null,
      fileType: finalFileType,
      category: uniqueCategories,
      isDownloadReport: firstData.download === "yes",
    }));

    const templateUpdates: Record<string, Partial<CategoryState>> = {};
    const filtersToSet: DimensionFilter[] = [];

    uniqueCategories.forEach((cat) => {
      const catData = categoryDataMap[cat] || data[cat as keyof typeof data];
      if (!catData) return;

      if (catData.template) {
        templateUpdates[cat] = { template: catData.template || "" };
      }

      if (catData.dimensions?.length > 0) {
        const categoryFilters = (catData.dimensions || []).map((dim: DimensionFilter) => ({
          field: `${cat}:${dim.field}`,
          value: dim.value || [],
        }));
        filtersToSet.push(...categoryFilters);
        const dimensionFields = (catData.dimensions || []).map((dim: DimensionFilter) => dim.field);
        templateUpdates[cat] = {
          ...templateUpdates[cat],
          selectedDimensions: dimensionFields,
        };
      }
    });

    if (Object.keys(templateUpdates).length > 0) {
      setCategoryTemplates((prev) => {
        const updated = { ...prev };
        Object.keys(templateUpdates).forEach((cat) => {
          updated[cat] = { ...updated[cat], ...templateUpdates[cat] };
        });
        return updated;
      });
    }

    if (filtersToSet.length > 0) setDimensionsFilters(filtersToSet);
    if (firstData.deliveryOptions) setDeliveryData(firstData.deliveryOptions);
    setProcessedPayloadId(payloadKey);
  }, [viewData, viewPayload, isLoadingView, processedPayloadId]);

  // Refetch categories on package/date change
  useEffect(() => {
    if (selectedPackage) refetchCategories();
  }, [selectedPackage, startDate, endDate, refetchCategories]);

  // Handle API success
  useEffect(() => {
    if (!createData) return;

    const response = createData as any;

    // Check for success - API returns { message, id } on success
    if (response?.status === "success") {
      const successMessage = response?.message || "Report created successfully!";
      setToastData({ type: "success", title: "Success", description: successMessage, variant: "default" });
      // Reset submitting state and close the delivery modal
      setIsSubmitting(false);
      setModals((prev) => ({ ...prev, delivery: false }));
      // Navigate to report list
      router.push("/integrity/reportingtool/report");
    }
  }, [createData, router]);

  useEffect(() => {
    if (!editData) return;

    const response = editData as any;

    // Check for success - API returns { message, id } on success
    if (response?.message || response?.id) {
      const successMessage = response?.message || "Report updated successfully!";
      setToastData({ type: "success", title: "Success", description: successMessage, variant: "default" });
      // Reset submitting state and close the delivery modal
      setIsSubmitting(false);
      setModals((prev) => ({ ...prev, delivery: false }));
      // Navigate to report list
      router.push("/integrity/reportingtool/report");
    }
  }, [editData, router]);

  // Handlers
  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleCategoryChange = useCallback(
    (values: string[]) => {
      // Don't allow category changes in view or edit mode
      if (isReadOnly || isEditMode) return;
      updateFormData({ category: values });
      if (values.length > 0) setErrors((prev) => ({ ...prev, category: "" }));
    },
    [isReadOnly, isEditMode, updateFormData]
  );

  const handleTemplateChange = useCallback((cat: string, value: string) => {
    setCategoryTemplates((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], template: value, selectedDimensions: [] },
    }));
  }, []);

  const handleDimensionSelect = useCallback((cat: string, value: string) => {
    setCategoryTemplates((prev) => {
      const state = prev[cat] || { template: "", dimensions: [], selectedDimensions: [], popoverOpen: false };
      const selected = state.selectedDimensions || [];
      const newSelected = selected.includes(value) ? selected.filter((d) => d !== value) : [...selected, value];
      if (newSelected.length > 0) setErrors((prev) => ({ ...prev, dimensions: "" }));
      return { ...prev, [cat]: { ...state, selectedDimensions: newSelected } };
    });
  }, []);

  const handleFilterClick = useCallback((item: { id: string; label: string }, cat: string) => {
    setFilterState({ item, category: cat, search: "" });
    setModals((prev) => ({ ...prev, filter: true }));
  }, []);

  const handleFilterSave = useCallback((data: DimensionFilter & { category?: string }) => {
    const category = filterState.category || data.category || "";
    if (!category) return;

    const compositeField = `${category}:${data.field}`;

    setDimensionsFilters((prev) => {
      const index = prev.findIndex((f) => {
        const existingField = f.field.includes(':') ? f.field : `${category}:${f.field}`;
        return existingField === compositeField;
      });
      if (index !== -1) {
        const existing = prev[index];
        const updatedFilter = { ...data, field: compositeField };
        if (JSON.stringify(existing) === JSON.stringify(updatedFilter)) return prev;
        const updated = [...prev];
        updated[index] = updatedFilter;
        return updated;
      }
      return [...prev, { ...data, field: compositeField }];
    });
  }, [filterState.category]);

  const validateForm = useCallback((): boolean => {
    const newErrors = { reportName: "", category: "", dimensions: "" };
    let isValid = true;

    if (!formData.reportName.trim()) {
      newErrors.reportName = "Report name is mandatory.";
      isValid = false;
    }

    if (formData.category.length === 0) {
      newErrors.category = "Please select at least one category";
      isValid = false;
    }

    formData.category.forEach((cat) => {
      const state = categoryTemplates[cat];
      if (state?.template === CUSTOM_TEMPLATE && (!state.selectedDimensions || state.selectedDimensions.length === 0)) {
        newErrors.dimensions = "Please select at least one dimension";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData.reportName, formData.category, categoryTemplates]);

  const buildDimensionsPayload = useCallback(
    (cat: string): DimensionFilter[] => {
      const state = categoryTemplates[cat];
      if (!state) return [];

      if (state.template === CUSTOM_TEMPLATE) {
        return (state.selectedDimensions || []).map((id) => {
          const compositeField = `${cat}:${id}`;
          const existing = dimensionsFilters.find((f) => {
            return f.field === compositeField || f.field === id;
          });
          return { field: id, value: existing?.value || [] };
        });
      }

      const allDimensions: Array<{ id: string; label: string }> = [];
      (state.dimensions || []).forEach((group) => {
        group.items.forEach((item) => allDimensions.push(item));
      });

      return allDimensions.map((dim) => {
        const compositeField = `${cat}:${dim.id}`;
        const existing = dimensionsFilters.find((f) => {
          return f.field === compositeField || f.field === dim.id;
        });
        return { field: dim.id, value: existing?.value || [] };
      });
    },
    [categoryTemplates, dimensionsFilters]
  );

  const buildPayload = useCallback(
    (delivery: DeliveryOptions): any => {
      const payload: any = {};
      formData.category.forEach((cat) => {
        const state = categoryTemplates[cat];
        if (!state?.template) return;

        const reportPayload: ReportPayload = {
          report_name: formData.reportName,
          occurance: formData.frequency || undefined,
          package_name: selectedPackage || "",
          dimensions: buildDimensionsPayload(cat),
          reportFormats: formData.fileType,
          report_type: formData.reportCategory,
          deliveryOptions: (delivery as any)?.[cat] || delivery,
          download: deliveryType === "download" ? "yes" : "no",
          template: state.template,
          category: [cat],
        };

        if (formData.frequency === CUSTOM_RANGE) {
          reportPayload.start_date = delivery?.dateRange?.startDate;
          reportPayload.end_date = delivery?.dateRange?.endDate;
        }

        payload[cat] = reportPayload;
      });
      return payload;
    },
    [formData, categoryTemplates, selectedPackage, deliveryType, buildDimensionsPayload]
  );

  const handleModalSubmit = useCallback(
    (data: DeliveryOptions) => {
      setDeliveryData(data);
      setIsSubmitting(true); // Set submitting state immediately
      if (editId && isEditMode) {
        const updateData: Record<string, ReportPayload> = {};
        formData.category.forEach((cat) => {
          const state = categoryTemplates[cat];
          if (!state?.template) return;
          const payload: ReportPayload = {
            report_name: formData.reportName,
            occurence: formData.frequency || undefined,
            package_name: selectedPackage || "",
            dimensions: buildDimensionsPayload(cat),
            reportFormats: formData.fileType,
            report_type: formData.reportCategory,
            deliveryOptions: (data as any)?.[cat] || data,
            download: deliveryType === "download" ? "yes" : "no",
            template: state.template,
            category: cat,
          };
          if (formData.frequency === CUSTOM_RANGE) {
            payload.start_date = data?.dateRange?.startDate;
            payload.end_date = data?.dateRange?.endDate;
          }
          updateData[cat] = payload;
        });
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
    [editId, isEditMode, formData, categoryTemplates, selectedPackage, deliveryType, buildDimensionsPayload, buildPayload, refetchEdit, refetchCreate]
  );

  const handleDownloadClick = useCallback(() => {
    if (!validateForm()) return;
    setDeliveryType("download");
    setModals((prev) => ({ ...prev, delivery: true }));
  }, [validateForm]);

  const handleScheduleClick = useCallback(() => {
    if (!validateForm()) return;
    setDeliveryType("schedule");
    setModals((prev) => ({ ...prev, delivery: true }));
  }, [validateForm]);

  const handleConfirmation = useCallback(
    (action: "cloud" | "email" | "download") => {
      setModals((prev) => ({ ...prev, confirmation: false }));
      if (action === "cloud" || action === "email") {

        setDeliveryType("download");
        setModals((prev) => ({ ...prev, delivery: true }));
      } else if (deliveryData) {
        handleModalSubmit(deliveryData);
      }
    },
    [deliveryData, handleModalSubmit]
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

  return (
    <>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 pt-2 rounded-xl h-[120px]">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:border-none p-2 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Report Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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

              {/* Category */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-white">Category <span className="text-red-500">*</span></Label>
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center h-9 border border-input rounded-md bg-gray-50 dark:bg-background">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                ) : (
                  <MultiSelect
                    options={categoryOptions}
                    onValueChange={handleCategoryChange}
                    defaultValue={formData.category}
                    placeholder="Select categories"
                    disabled={isReadOnly || isEditMode}
                    className="w-full dark:bg-background"
                  />
                )}
                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
              </div>

              {/* File Type */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700 dark:text-white">File Type</Label>
                <MFSingleSelect
                  items={[
                    { title: "CSV", value: "csv" },
                    { title: "XLSX", value: "xlsx" },
                  ]}
                  placeholder="Select file type"
                  value={formData.fileType}
                  onValueChange={(value) => updateFormData({ fileType: value })}
                  className={isReadOnly ? "opacity-50 pointer-events-none" : ""}
                />
              </div>
            </div>
          </div>


          {/* Category Templates and Dimensions */}
          {formData.category.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {formData.category.map((cat) => {
                const state = categoryTemplates[cat] || { template: "", dimensions: [], selectedDimensions: [], popoverOpen: false };
                const templates = templatesMap[cat as keyof typeof templatesMap] || [];
                const isLoadingTemplates = templatesLoadingMap[cat as keyof typeof templatesLoadingMap] || false;
                const filteredDims = filterDimensions(state.dimensions || [], debouncedSearch);
                const categoryDisplayName = cat.charAt(0).toUpperCase() + cat.slice(1);

                return (
                  <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-200 dark:border-gray-500 p-2 dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${cat === 'click' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                          <FileText className={`h-4 w-4 ${cat === 'click' ? 'text-blue-600' : 'text-purple-600'}`} />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 capitalize dark:text-white">{cat} Configuration</h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {/* Template Selection */}
                      <div className="space-y-2">
                        <Label className="dark:text-white">{categoryDisplayName} Template</Label>
                        {isLoadingTemplates ? (
                          <div className="flex justify-center items-center p-2 border border-input rounded-md h-10">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        ) : (
                          <MFSingleSelect
                            items={templates.map((template: string) => ({
                              title: template,
                              value: template,
                            }))}
                            placeholder={`Choose ${categoryDisplayName} Template`}
                            value={state.template}
                            onValueChange={(value) => handleTemplateChange(cat, value)}
                            className={isViewMode ? "opacity-50 pointer-events-none" : ""}
                          />
                        )}
                      </div>


                      {/* Dimensions Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold dark:text-white">{categoryDisplayName} Dimensions</Label>
                          {state.template === CUSTOM_TEMPLATE && (
                            <span className="text-xs text-gray-500">
                              {state.selectedDimensions?.length || 0} selected
                            </span>
                          )}
                        </div>


                        {state.template === CUSTOM_TEMPLATE && (
                          <Popover
                            open={state.popoverOpen}
                            onOpenChange={(open) =>
                              setCategoryTemplates((prev) => ({
                                ...prev,
                                [cat]: { ...prev[cat], popoverOpen: open },
                              }))
                            }
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
                                <div className="max-h-[250px] overflow-y-auto dark:text-white">
                                  {filterDimensions(state.dimensions || [], debouncedSearch).map((group) => (
                                    <div key={group.label} className="mb-2">
                                      <div className="mb-1 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-white">
                                        {group.label}
                                      </div>
                                      {(group.items || []).map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-gray-50 transition-colors dark:hover:bg-gray-700"
                                        >
                                          <div className="flex items-center gap-2 flex-1">
                                            <Checkbox
                                              id={`dimension-${cat}-${item.id}`}
                                              checked={(state.selectedDimensions || []).includes(item.id)}
                                              onCheckedChange={() => handleDimensionSelect(cat, item.id)}
                                            />
                                            <Label
                                              htmlFor={`dimension-${cat}-${item.id}`}
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

                        {state.template === CUSTOM_TEMPLATE && (!state.selectedDimensions || state.selectedDimensions.length === 0) ? (
                          <div className="mt-1 flex h-16 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 dark:bg-gray-900">
                            <p className="text-xs text-gray-500 dark:text-white">Select dimensions to view them here</p>
                          </div>
                        ) : (
                          <div className="mt-1 max-h-[250px] overflow-y-auto rounded-md border border-gray-200 bg-gray-50/50">
                            {(state.dimensions || []).map((group) => {
                              const groupItems =
                                state.template === CUSTOM_TEMPLATE
                                  ? (group.items || []).filter((item) => (state.selectedDimensions || []).includes(item.id))
                                  : group.items || [];
                              if (groupItems.length === 0) return null;

                              return (
                                <div key={group.label} className="p-2 border-b border-gray-200 last:border-b-0">
                                  <div className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {group.label}
                                  </div>
                                  <div className="space-y-1">
                                    {groupItems.map((item) => {
                                      const filterCount = getFilterCountForDimension(item.id, cat);
                                      const hasFilter = hasFiltersForDimension(item.id, cat);
                                      return (
                                        <div
                                          key={item.id}
                                          className="flex items-center justify-between p-1.5 rounded-md hover:bg-blue-50"
                                        >
                                          <div className="flex items-center gap-2 flex-1">
                                            {state.template === CUSTOM_TEMPLATE && (
                                              <Checkbox
                                                id={item.id}
                                                checked={true}
                                                onClick={() => handleDimensionSelect(cat, item.id)}
                                              />
                                            )}
                                            <Label htmlFor={item.id} className="text-xs text-gray-700 cursor-pointer flex-1">
                                              {item.label}
                                            </Label>
                                          </div>
                                          {shouldShowFilter(item.id) && (
                                            <button
                                              onClick={() => handleFilterClick(item, cat)}
                                              className={`flex items-center gap-1 p-1 rounded-md hover:bg-primary/10 transition-colors ${hasFilter ? "text-primary" : "text-gray-400"
                                                }`}
                                              title={hasFilter ? `${filterCount} filter(s) applied` : "Apply filters"}
                                            >
                                              {hasFilter && (
                                                <span className="text-xs font-medium text-primary">{filterCount}</span>
                                              )}
                                              <Filter className={`h-3 w-3 ${hasFilter ? "text-primary" : "text-gray-400"}`} />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}


        </div>
        <div className="mt-2 flex justify-end gap-3 dark:bg-gray-700">
          <Button onClick={() => router.push("/integrity/reportingtool/report")} variant="default" size="sm">
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
          isOpen={modals.confirmation}
          onClose={() => setModals((prev) => ({ ...prev, confirmation: false }))}
          onConfirm={handleConfirmation}
        />

        <FilterModal
          isOpen={modals.filter}
          onClose={() => {
            setModals((prev) => ({ ...prev, filter: false }));
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
          categories={formData.category}
          isOpen={modals.delivery}
          onClose={() => {
            // Prevent closing during API call
            if (isSubmitting) return;
            setModals((prev) => ({ ...prev, delivery: false }));
            setDeliveryData(null);
          }}
          type={deliveryType}
          onSubmit={handleModalSubmit}
          defaultData={deliveryData}
          mode={mode || ""}
          frequency={formData.frequency || undefined}
          onFrequencyChange={(val) => updateFormData({ frequency: val || null })}
          isSubmitting={isSubmitting}
          module="integrity"
        />
      </div>

    </>
  );
};


export default GenerateReportPage;
