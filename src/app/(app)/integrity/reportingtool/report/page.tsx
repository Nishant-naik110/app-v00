"use client";

import ResizableTable, { type Column } from "@/components/mf/ReportingToolTable";
import type React from "react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { debounce } from "@/lib/utils";
import { usePackage } from "@/components/mf/PackageContext";
import EllipsisTooltip from "@/components/mf/EllipsisTooltip";
import {
  useGetReportList,
  useUpdateReportStatus,
  useDeleteReport,
  type ReportListItem,
  type ReportListPayload,
  type StatusUpdatePayload,
  type DeleteReportPayload,
} from "../../hooks/useIntegrityReport";

// Constants
const POLLING_INTERVAL = 5000; // 5 seconds
const DEBOUNCE_DELAY = 1000; // 1 second
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

// Create a client
const queryClient = new QueryClient();

// Types
interface StatusUpdateState {
  id: number;
  checked: boolean;
}

// Utility functions
const formatDate = (dateString: string | undefined | null): string =>
  dateString ? format(new Date(dateString), "MMM dd, yyyy HH:mm") : "-";

const isStatusActive = (status: string | boolean): boolean => {
  if (typeof status === "boolean") {
    return status;
  }
  return status === "True" || status === "true";
};

const IntegrityReportPage = () => {
  // State
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [searchTermReport, setSearchTermReport] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<number | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<StatusUpdateState | null>(null);
  const [statusUpdatePayload, setStatusUpdatePayload] = useState<StatusUpdatePayload | undefined>(undefined);
  const [deleteReportPayload, setDeleteReportPayload] = useState<DeleteReportPayload | undefined>(undefined);

  // Context
  const { selectedPackage } = usePackage();
  const router = useRouter();

  // Memoized payload
  const reportListPayload: ReportListPayload | undefined = useMemo(() => {
    if (!selectedPackage) {
      return undefined;
    }
    return {
      package_name: selectedPackage,
      report_name: searchTermReport || "",
      page_number: currentPage,
      record_limit: limit,
    };
  }, [selectedPackage, searchTermReport, currentPage, limit]);

  // API Hooks
  const {
    data: reportListData,
    isLoading: reportLoading,
    refetch: refetchReportList,
  } = useGetReportList(reportListPayload, !!reportListPayload);

  const {
    isLoading: statusUpdateLoading,
    isSuccess: isStatusUpdateSuccess,
  } = useUpdateReportStatus(statusUpdatePayload, !!statusUpdatePayload);

  const {
    isLoading: deleteLoading,
    isSuccess: isDeleteSuccess,
  } = useDeleteReport(deleteReportPayload, !!deleteReportPayload);

  // Derived data
  const tableData = useMemo(() => reportListData?.reports || [], [reportListData?.reports]);
  const totalPages = useMemo(() => reportListData?.total_pages || 0, [reportListData?.total_pages]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => setSearchTermReport(value || ""), DEBOUNCE_DELAY),
    []
  );

  // Handlers
  const handleStatusChange = useCallback((id: number, checked: boolean) => {
    setStatusToUpdate({ id: id || 0, checked: checked || false });
    setStatusDialogOpen(true);
  }, []);

  // Table column definitions
  const columns: Column<ReportListItem>[] = useMemo(
    () => [
      {
        title: "Report Name",
        key: "report_name",
        render: (row) => (
          <EllipsisTooltip content={row?.report_name || ""} />
        ),
      },
      
      {
        title: "Created Date",
        key: "created_date",
        render: (row) => formatDate(row?.created_date),
      },
      {
        title: "Frequency",
        key: "frequency",
        render: (row) => row?.frequency || "-",
      },

      {
        title: "Category",
        key: "category",
        render: (row) => row?.category || "-",
      },
      {
        title: "Report Type",
        key: "report_type",
        render: (row) => (
          <EllipsisTooltip content={row?.report_type || ""} />
        ),
      },
      {
        title: "Report Differentiator",
        key: "report_differentiator",
        render: (row) => row?.report_differentiator || "-",
      },
      {
        title: "Last Run",
        key: "last_run",
        render: (row) => (row?.last_run ? formatDate(row.last_run) : "-"),
      },
      
      {
        title: "Next Run",
        key: "next_run",
        render: (row) => (row?.next_run ? formatDate(row.next_run) : "-"),
      },
      {
        title: "Status",
        key: "status",
        render: (data: ReportListItem) => {
          if (data?.report_differentiator === "Download") {
            return <div className="flex justify-center">-</div>;
          }
          return (
            <div className="flex justify-center">
              <Switch
                checked={isStatusActive(data?.status)}
                onCheckedChange={(checked) =>
                  handleStatusChange(data?.id || 0, checked || false)
                }
              />
            </div>
          //   <div className="flex justify-center">
          //   <button
          //     type="button"
          //     onClick={() =>
          //       handleStatusChange(data?.id || 0, !isStatusActive(data?.status))
          //     }
          //     className="relative flex items-center w-7 h-4"
          //     role="switch"
          //     aria-checked={isStatusActive(data?.status)}
          //   >
          
          //     <span
          //       className={`
          //         absolute left-0 right-0 top-1/2 -translate-y-1/2
          //         h-1 rounded-full
          //         ${
          //           isStatusActive(data?.status)
          //             ? "bg-emerald-500/50"
          //             : "bg-muted-foreground/30"
          //         }
          //       `}
          //     />
          
          //     <span
          //       className={`
          //         absolute top-1/2 -translate-y-1/2
          //         h-3.5 w-3.5 rounded-full
          //         z-10
          //         transition-all duration-200
          //         ${
          //           isStatusActive(data?.status)
          //             ? "right-0 bg-emerald-500"
          //             : "left-0 bg-muted-foreground"
          //         }
          //       `}
          //     />
          //   </button>
          // </div>



            
          );
        },
      },
    
    ],
    [statusUpdateLoading, handleStatusChange]
  );

  // Effect to refetch on status update success
  useEffect(() => {
    if (isStatusUpdateSuccess) {
      refetchReportList?.();
      setStatusUpdatePayload(undefined);
      setStatusDialogOpen(false);
      setStatusToUpdate(null);
    }
  }, [isStatusUpdateSuccess, refetchReportList]);

  // Effect to refetch on delete success
  useEffect(() => {
    if (isDeleteSuccess) {
      refetchReportList?.();
      setDeleteReportPayload(undefined);
      setDeleteDialogOpen(false);
      setRowToDelete(null);
    }
  }, [isDeleteSuccess, refetchReportList]);

  // Polling effect
  useEffect(() => {
    if (!selectedPackage) return;

    const interval = setInterval(() => {
      refetchReportList?.();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedPackage, refetchReportList]);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    debouncedSearch(value || "");
  }, [debouncedSearch]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit || DEFAULT_PAGE_SIZE);
    setCurrentPage(DEFAULT_PAGE);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page || DEFAULT_PAGE);
  }, []);

  const confirmStatusChange = useCallback(() => {
    if (!statusToUpdate) return;
    
    setStatusUpdatePayload({
      id: statusToUpdate?.id || 0,
      status: statusToUpdate?.checked ? "True" : "False",
      package_name: selectedPackage || "",
    });
  }, [statusToUpdate]);

  const handleRefetch = useCallback(() => {
    refetchReportList?.();
  }, [refetchReportList]);

  const handleDownload = useCallback(async (row: ReportListItem) => {
    if (!row?.report_s3_link) {
      return;
    }

    try {
      const response = await fetch(row.report_s3_link || "");
      const blob = await response.blob();
      
      const url = window?.URL?.createObjectURL(blob);
      if (!url) return;
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${row?.report_name || "report"}_${formatDate(row?.created_date)}.zip`;
      document.body.appendChild(a);
      a.click();
      window?.URL?.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // Error handling
    }
  }, []);

  const handleEdit = useCallback((row: ReportListItem) => {
    if (!row?.id || !router) return;
    router.push(`/integrity/reportingtool/generate?id=${row.id}&mode=edit`);
  }, [router]);

  const handleView = useCallback((row: ReportListItem) => {
    if (!row?.id || !router) return;
    router.push(`/integrity/reportingtool/generate?id=${row.id}&mode=view`);
  }, [router]);

  const handleClone = useCallback((row: ReportListItem) => {
    if (!row?.id || !router) return;
    router.push(`/integrity/reportingtool/generate?id=${row.id}&mode=clone`);
  }, [router]);

  const handleDelete = useCallback((row: ReportListItem) => {
    setRowToDelete(row?.id || null);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (rowToDelete === null || !selectedPackage) return;

    setDeleteReportPayload({
      doc_id: rowToDelete,
      package_name: selectedPackage,
    });
  }, [rowToDelete, selectedPackage]);

  const handleCreateReport = useCallback(() => {
    router?.push("/integrity/reportingtool/generate");
  }, [router]);

  return (
  
      <div className="relative bg-card mt-2 rounded-md">
        <div className="p-2">
          <ResizableTable<ReportListItem>
            isPaginated={true}
            columns={columns}
            data={tableData}
            isLoading={reportLoading}
            isDownload={true}
            headerColor="#DCDCDC"
            isSearchable={true}
            onDownload={handleDownload || (() => {})}
            onSearch={handleSearchChange || (() => {})}
            onLimitChange={handleLimitChange || (() => {})}
            onPageChange={handlePageChange || (() => {})}
            pageNo={currentPage}
            totalPages={totalPages || 1}
            isRefetch={false}
            onRefetch={handleRefetch || (() => {})}
            isEdit={true}
            onEdit={handleEdit || (() => {})}
            isView={true}
            onView={handleView || (() => {})}
            isClone={true}
            onClone={handleClone || (() => {})}
            isDelete={true}
            onDelete={handleDelete || (() => {})}
            containerHeight={670}
            buttonTextName="Create Report"
            onCreate={handleCreateReport}
            showCreateButton={true}
            totalRecords={reportListData?.total || 0}
          />
        </div>

        {/* Delete Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen || false}
          onOpenChange={setDeleteDialogOpen || (() => {})}
          onConfirm={confirmDelete || (() => {})}
          title="Confirm Delete"
          description="Are you sure you want to delete this report?"
          confirmText="Delete"
          isLoading={deleteLoading || false}
          variant="default"
        />

        {/* Status Dialog */}
        <ConfirmDialog
          open={statusDialogOpen || false}
          onOpenChange={setStatusDialogOpen || (() => {})}
          onConfirm={confirmStatusChange || (() => {})}
          title="Confirm Status Change"
          description={`Are you sure you want to ${
            statusToUpdate?.checked ? "enable" : "disable"
          } this report?`}
          confirmText="Confirm"
          isLoading={statusUpdateLoading || false}
          variant="default"
        />
      </div>
  );
};

export default IntegrityReportPage;
