"use client";

import { useApi } from "@/hooks/api/api_base";

// Type definitions
export interface CategoryOption {
  value: string;
  label: string;
}
export interface StatusUpdateState {
  id: number;
  checked: boolean;
}

export interface DimensionItem {
  id: string;
  label: string;
}

export interface GroupedDimension {
  label: string;
  items: DimensionItem[];
}

export interface DimensionFilter {
  field: string;
  value: string[];
}

export interface MetricThreshold {
  field: string;
  operator: string;
  value: string;
}

export interface DeliveryOptions {
  email?: {
    status?: boolean;
    to?: string[];
    mail_id_list?: string[];
    install_to?: string[];
    install_mail_id_list?: string[];
    event_to?: string[];
    event_mail_id_list?: string[];
  };
  cloud?: {
    status?: boolean;
    bucket_name?: string;
    path?: string;
  };
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  install?: DeliveryOptions;
  event?: DeliveryOptions;
}

export interface ReportPayload {
  report_name: string;
  occurence?: string;
  occurance?: string;
  package_name: string;
  dimensions: DimensionFilter[];
  reportFormats: string;
  report_type: string;
  deliveryOptions?: DeliveryOptions;
  download: "yes" | "no";
  template: string;
  category: string | string[];
  start_date?: string;
  end_date?: string;
}

export interface CreateReportPayload {
  install?: ReportPayload;
  event?: ReportPayload
}

export interface ViewReportResponse {
  data?: {
    install?: ReportData;
    event?: ReportData;
  };
}

export interface ReportData {
  report_name?: string;
  report_type?: string;
  occurence?: string;
  reportFormats?: string;
  download?: string;
  template?: string;
  category?: string | string[];
  dimensions?: DimensionFilter[];
  deliveryOptions?: DeliveryOptions;
  start_date?: string;
  end_date?: string;
}

export interface TemplateFieldsResponse {
  dimensions?: GroupedDimension[];
  metrics?: any[];
}

export interface FilterResponse {
  data?: any[];
  options?: any[];
}

export interface CreateReportResponse {
  status?: string;
  message?: string;
}

export interface EditReportResponse {
  status?: string;
  message?: string;
}

export interface ReportListItem {
  id: number;
  report_name: string;
  report_type: string;
  created_by: string;
  created_date: string;
  From_Date: string;
  To_Date: string;
  Report_Status: string;
  status: string;
  frequency?: string;
  last_run?: string;
  next_run?: string;
  download?: boolean;
  report_s3_link?: string;
  category?: string;
  report_differentiator?: string;
  report_date?: string;
}

export interface ReportListResponse {
  reports: ReportListItem[];
  total_pages: number;
  message?: string;
  total?: number;
}

export interface ReportListPayload {
  package_name?: string;
  report_name?: string;
  start_date?: string;
  end_date?: string;
  page_number?: number;
  record_limit?: number;
}

export interface StatusUpdatePayload {
  id: number;
  status: string;
  package_name?: string;
}

export interface StatusUpdateResponse {
  message?: string;
}

export interface DeleteReportPayload {
  doc_id: number;
  package_name?: string;
}

export interface DeleteReportResponse {
  message?: string;
}

// Mailing List Interfaces
export interface CreateMailingListPayload {
  package_name?: string;
  mailing_list_name: string;
  status: string;
  emails: string[];
}

export interface CreateMailingListResponse {
  message?: string;
  status?: string;
}

export interface UpdateMailingListPayload {
  mailing_list_id: string | number;
  mailing_list_name: string;
  status: string;
  emails: string[];
  package_name?: string;
}

export interface UpdateMailingListResponse {
  message?: string;
  status?: string;
}

export interface MailingListStatusUpdatePayload {
  mailing_list_id: string | number;
  status: string;
  package_name?: string;
}

export interface MailingListStatusUpdateResponse {
  message?: string;
}

export interface MailingListListItem {
  id: string | number;
  mailing_list_name: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  emails?: string[];
}

export interface MailingListListPayload {
  package_name?: string;
  mailing_list_name?: string;
  page_number?: number;
  record_limit?: number;
  occurance?: string;
}

export interface MailingListListResponse {
  mailing_lists: MailingListListItem[];
  total_pages: number;
  message?: string;
  total?: number;
  page?: number;
}

// API Base URL
const REPORT_API_BASE = process.env.NEXT_PUBLIC_APP_PERF + "reporting_tool";

/**
 * Fetch categories for report
 */
export const useGetCategories = (
  packageName?: string,
  enabled: boolean = false
) => {
  return useApi<CategoryOption[]>(
    `${REPORT_API_BASE}/get_category`,
    "POST",
    {
      package_name: packageName,
    },
    {
      queryKey: ["report-categories", packageName || ""] as const,
      enabled,
    }
  );
};

/**
 * Fetch templates for a specific category
 */
export const useGetTemplates = (
  packageName?: string,
  category?: string,
  enabled: boolean = false
) => {
  return useApi<string[]>(
    `${REPORT_API_BASE}/get_template`,
    "POST",
    {
      package_name: packageName,
      category: category,
    },
    {
      queryKey: ["report-templates", packageName || "", category || ""] as const,
      enabled,
    }
  );
};

/**
 * Fetch template fields (dimensions and metrics) for a template
 */
export const useGetTemplateFields = (
  template?: string,
  category?: string,
  packageName?: string,
  reportType?: string,
  enabled: boolean = false
) => {
  return useApi<TemplateFieldsResponse>(
    `${REPORT_API_BASE}/get_template_fields`,
    "POST",
    {
      template: template,
      category: category,
      package_name: packageName,
      report_type: reportType,
    },
    {
      queryKey: ["template-fields", template || "", category || "", packageName || "", reportType || ""] as const,
      enabled,
      staleTime: 0,
      cacheTime: 0,
    }
  );
};

/**
 * Fetch filter options for a dimension
 */
export const useGetDimensionFilters = (
  dimensionId?: string,
  packageName?: string,
  category?: string | string[],
  reportType?: string,
  search?: string,
  enabled: boolean = false
) => {
  const categoryParam = Array.isArray(category)
    ? category.join(",")
    : category || "";

  return useApi<FilterResponse>(
    `${REPORT_API_BASE}/fields/filters/${dimensionId || ""}/`,
    "POST",
    {
      package_name: packageName,
      category: categoryParam,
      report_type: reportType,
      search: search || "",
    },
    {
      queryKey: ["dimension-filters", dimensionId || "", packageName || "", categoryParam, reportType || "", search || ""] as const,
      enabled,
    }
  );
};

/**
 * Create a new report
 */
export const useCreateReport = (
  payload?: CreateReportPayload,
  enabled: boolean = false
) => {
  return useApi<CreateReportResponse>(
    `${REPORT_API_BASE}/create_report`,
    "POST",
    payload,
    {
      queryKey: ["create-report", payload ? JSON.stringify(payload) : ""] as const,
      enabled,
    }
  );
};

/**
 * View/Get an existing report
 */
export const useViewReport = (
  payload?: {
    doc_id?: string;
    package_name?: string;
  },
  enabled: boolean = false
) => {
  return useApi<ViewReportResponse>(
    `${REPORT_API_BASE}/view_report`,
    "POST",
    payload,
    {
      queryKey: ["view-report", payload?.doc_id || "", payload?.package_name || ""] as const,
      enabled,
      refetchOnMount: true, // Always refetch when component mounts to ensure fresh data
    }
  );
};

/**
 * Edit/Update an existing report
 */
export const useEditReport = (
  payload?: {
    doc_id?: string;
    package_name?: string;
    update_data?: any;
  },
  enabled: boolean = false
) => {
  return useApi<EditReportResponse>(
    `${REPORT_API_BASE}/edit_report`,
    "POST",
    payload,
    {
      queryKey: ["edit-report", payload?.doc_id || "", payload?.package_name || ""] as const,
      enabled,
    }
  );
};

/**
 * Fetch report list/summary table
 */
export const useGetReportList = (
  payload?: ReportListPayload,
  enabled: boolean = true
) => {
  return useApi<ReportListResponse>(
    `${REPORT_API_BASE}/summary-table`,
    "POST",
    payload,
    {
      queryKey: [
        "report-list",
        payload?.package_name || "",
        payload?.report_name || "",
        payload?.page_number?.toString() || "1",
        payload?.record_limit?.toString() || "10",
      ] as const,
      enabled,
      refetchInterval:3000
    }
  );
};

/**
 * Update report status
 */
export const useUpdateReportStatus = (
  payload?: StatusUpdatePayload,
  enabled: boolean = false
) => {
  return useApi<StatusUpdateResponse>(
    `${REPORT_API_BASE}/report_status_change`,
    "POST",
    payload,
    {
      queryKey: ["update-report-status", payload?.id?.toString() || "0", payload?.status || ""] as const,
      enabled,
      toast: {
        showToast: true,
        successMessage: (data: StatusUpdateResponse) => data?.message || "Status updated successfully!",
        successTitle: "Success",
        errorTitle: "Error",
        errorMessage: (error: Error) => error?.message || "Failed to update report status. Please try again.",
        variant: "default",
        successType: "success",
        errorType: "error",
      },
    }
  );
};

/**
 * Delete a report
 */
export const useDeleteReport = (
  payload?: DeleteReportPayload,
  enabled: boolean = false
) => {
  return useApi<DeleteReportResponse>(
    `${REPORT_API_BASE}/delete_report`,
    "POST",
    payload,
    {
      queryKey: ["delete-report", payload?.doc_id?.toString() || "0", payload?.package_name || ""] as const,
      enabled,
      toast: {
        showToast: true,
        successMessage: (data: DeleteReportResponse) => data?.message || "Report deleted successfully!",
        successTitle: "Success",
        errorTitle: "Error",
        errorMessage: (error: Error) => error?.message || "Failed to delete report. Please try again.",
        variant: "destructive" as const,
        successType: "success",
        errorType: "error",
      },
    }
  );
};

/**
 * Create a mailing list
 */
export const useCreateMailingList = (
  payload?: CreateMailingListPayload,
  enabled: boolean = false
) => {
  return useApi<CreateMailingListResponse>(
    `${REPORT_API_BASE}/create_mailing_list`,
    "POST",
    payload,
    {
      queryKey: ["create-mailing-list", payload?.package_name || "", payload?.mailing_list_name || ""] as const,
      enabled,
      toast: {
        showToast: true,
        successMessage: (data: CreateMailingListResponse) => data?.message || "Mailing list created successfully!",
        successTitle: "Success",
        errorTitle: "Error",
        errorMessage: (error: Error) => error?.message || "Failed to create mailing list. Please try again.",
        successType: "success",
        errorType: "error",
      },
    }
  );
};

/**
 * Update a mailing list
 */
export const useUpdateMailingList = (
  payload?: UpdateMailingListPayload,
  enabled: boolean = false
) => {
  return useApi<UpdateMailingListResponse>(
    `${REPORT_API_BASE}/edit_mailing_list`,
    "POST",
    payload,
    {
      queryKey: ["update-mailing-list", payload?.mailing_list_id?.toString() || "0", payload?.package_name || ""] as const,
      enabled,
      toast: {
        showToast: true,
        successMessage: (data: UpdateMailingListResponse) => data?.message || "Mailing list updated successfully!",
        successTitle: "Success",
        errorTitle: "Error",
        errorMessage: (error: Error) => error?.message || "Failed to update mailing list. Please try again.",
        successType: "success",
        errorType: "error",
      },
    }
  );
};

/**
 * Update mailing list status
 */
export const useUpdateMailingListStatus = (
  payload?: MailingListStatusUpdatePayload,
  enabled: boolean = false
) => {
  return useApi<MailingListStatusUpdateResponse>(
    `${REPORT_API_BASE}/status_change`,
    "POST",
    payload,
    {
      queryKey: ["update-mailing-list-status", payload?.mailing_list_id?.toString() || "0", payload?.status || ""] as const,
      enabled,
      toast: {
        showToast: true,
        successMessage: (data: MailingListStatusUpdateResponse) => data?.message || "Status updated successfully!",
        successTitle: "Success",
        errorTitle: "Error",
        errorMessage: (error: Error) => error?.message || "Failed to update status. Please try again.",
        successType: "success",
        errorType: "error",
      },
    }
  );
};

/**
 * Get mailing list list
 */
export const useGetMailingListList = (
  payload?: MailingListListPayload,
  enabled: boolean = true
) => {
  return useApi<MailingListListResponse>(
    `${REPORT_API_BASE}/list_all_mailing_lists`,
    "POST",
    payload,
    {
      queryKey: [
        "mailing-list-list",
        payload?.package_name || "",
        payload?.mailing_list_name || "",
        payload?.page_number?.toString() || "1",
        payload?.record_limit?.toString() || "10",
      ] as const,
      enabled,
    }
  );
};

/**
 * Get occurrence options for schedule
 */
export interface OccurrenceOption {
  value: string;
  label: string;
}

export const useGetScheduleOccurrence = (
  packageName?: string,
  enabled: boolean = false
) => {
  return useApi<OccurrenceOption[]>(
    `${REPORT_API_BASE}/scheduler/occurance`,
    "POST",
    packageName ? { package_name: packageName } : undefined,
    {
      queryKey: ["schedule-occurrence", packageName || ""] as const,
      enabled,
    }
  );
};

/**
 * Get occurrence options for download
 */
export const useGetDownloadOccurrence = (
  packageName?: string,
  enabled: boolean = false
) => {
  return useApi<OccurrenceOption[]>(
    `${REPORT_API_BASE}/download/occurance`,
    "POST",
    packageName ? { package_name: packageName } : undefined,
    {
      queryKey: ["download-occurrence", packageName || ""] as const,
      enabled,
    }
  );
};
