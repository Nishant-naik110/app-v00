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
} from "../../hooks/useReport";

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
const formatDate = (dateString: string): string => {
  try {
    const parsedDate = new Date(dateString.replace(" ", "T"));
    return isNaN(parsedDate.getTime())
      ? "-"
      : format(parsedDate, "yyyy-MM-dd HH:mm:ss");
  } catch {
    return "-";
  }
};

const downloadFile = (url: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const isStatusActive = (status: string | boolean): boolean => {
  if (typeof status === "boolean") return status;
  return status === "True" || status === "true";
};

const CampaignOverviewPage = () => {
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
  const reportListPayload: ReportListPayload = useMemo(
    () => ({
      package_name: selectedPackage,
      report_name: searchTermReport,
      page_number: currentPage,
      record_limit: limit,
    }),
    [selectedPackage, searchTermReport, currentPage, limit]
  );

  // API Hooks
  const {
    data: reportListData,
    isLoading: reportLoading,
    refetch: refetchReportList,
  } = useGetReportList(reportListPayload, !!selectedPackage);

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
    debounce((term: string) => {
      setSearchTermReport(term);
      setCurrentPage(DEFAULT_PAGE); // Reset to first page on search
    }, DEBOUNCE_DELAY),
    []
  );

  // Handlers
  const handleSearchChange = useCallback((term: string) => {
    debouncedSearch(term);
  }, [debouncedSearch]);

  const handleStatusChange = useCallback((
    id: number,
    checked: boolean
  ) => {
    setStatusToUpdate({ id, checked });
    setStatusDialogOpen(true);
  }, []);

  const confirmStatusUpdate = useCallback(() => {
    if (!statusToUpdate) return;

    const payload: StatusUpdatePayload = {
      id: statusToUpdate.id,
      status: statusToUpdate.checked ? "True" : "False",
      package_name: selectedPackage,
    };

    setStatusUpdatePayload(payload);
    setStatusDialogOpen(false);
    setStatusToUpdate(null);
  }, [statusToUpdate]);

  const handleDelete = useCallback((item: ReportListItem) => {
    setRowToDelete(item.id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!rowToDelete) return;

    setDeleteReportPayload({
      doc_id: rowToDelete,
      package_name: selectedPackage,
    });
  }, [rowToDelete, selectedPackage]);

  const handleDownload = useCallback((item: ReportListItem) => {
    if (item.report_s3_link) {
      downloadFile(item.report_s3_link);
    }
  }, []);

  const handleView = useCallback((item: ReportListItem) => {
    router.push(`/re-engagement/reportingtool/generate?id=${item.id}&mode=view`);
  }, [router]);

  const handleEdit = useCallback((item: ReportListItem) => {
    router.push(`/re-engagement/reportingtool/generate?id=${item.id}&mode=edit`);
  }, [router]);

  const handleClone = useCallback((item: ReportListItem) => {
    router.push(`/re-engagement/reportingtool/generate?id=${item.id}&mode=clone`);
  }, [router]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(DEFAULT_PAGE);
  }, []);

  const handleRefetch = useCallback(() => {
    refetchReportList();
  }, [refetchReportList]);

  // Memoized columns
  const columns: Column<ReportListItem>[] = useMemo(
    () => [
      {
        title: "Report Name",
        key: "report_name",
        render: (data: ReportListItem) => (
          <EllipsisTooltip content={data.report_name} />
        ),
      },
      {
        title: "Created Date",
        key: "created_date",
        render: (data: ReportListItem) => (
          <EllipsisTooltip content={formatDate(data.created_date)} />
        ),
      },
      {
        title: "Frequency",
        key: "frequency",
        render: (data: ReportListItem) => (
          <div className="text-left">{data.frequency || "-"}</div>
        ),
      },
      {
        title: "Category",
        key: "category",
        render: (data: ReportListItem) => (
          <div className="text-left">{data.category || "-"}</div>
        ),
      },
      {
        title: "Report Category",
        key: "report_type",
        render: (data: ReportListItem) => (
          <div className="text-left">{data.report_type || "-"}</div>
        ),
      },
      {
        title: "Report Date",
        key: "report_date",
        render: (data: ReportListItem) => (
          <EllipsisTooltip content={data.report_date || "-"} />
        ),
      },
      {
        title: "Report Differentiator",
        key: "report_differentiator",
        render: (data: ReportListItem) => (
          <div className="text-left">{data.report_differentiator || "-"}</div>
        ),
      },
      {
        title: "Last Run",
        key: "last_run",
        render: (data: ReportListItem) => (
          <EllipsisTooltip content={data.last_run || "-"} />
        ),
      },
      {
        title: "Next Run",
        key: "next_run",
        render: (data: ReportListItem) => (
          <EllipsisTooltip content={data.next_run || "-"} />
        ),
      },
      {
        title: "Status",
        key: "status",
        render: (data: ReportListItem) => {
          if (data.report_differentiator === "Download") {
            return <div className="flex justify-center">-</div>;
          }
          return (
            <div className="flex justify-center">
              <Switch
                className="h-4 w-8 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                checked={isStatusActive(data.status)}
                onCheckedChange={(checked) =>
                  handleStatusChange(data.id, checked)
                }
              />
            </div>
          );
        },
      },
    ],
    [handleStatusChange]
  );

  // Effects
  // Handle status update success - refetch list and reset payload
  useEffect(() => {
    if (isStatusUpdateSuccess) {
      setStatusUpdatePayload(undefined);
      refetchReportList();
    }
  }, [isStatusUpdateSuccess, refetchReportList]);

  // Handle delete success - refetch list and close dialog
  useEffect(() => {
    if (isDeleteSuccess) {
      setDeleteReportPayload(undefined);
      refetchReportList();
      setDeleteDialogOpen(false);
      setRowToDelete(null);
    }
  }, [isDeleteSuccess, refetchReportList]);

  // Polling effect
  useEffect(() => {
    if (!selectedPackage) return;

    const interval = setInterval(() => {
      refetchReportList();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedPackage, refetchReportList]);

  const handleCreateReport = useCallback(() => {
    router.push("/re-engagement/reportingtool/generate");
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
            onDownload={handleDownload}
            onSearch={handleSearchChange}
            onLimitChange={handleLimitChange}
            onPageChange={handlePageChange}
            pageNo={currentPage}
            totalPages={totalPages}
            isRefetch={false}
            onRefetch={handleRefetch}
            isEdit={true}
            onEdit={handleEdit}
            isView={true}
            onView={handleView}
            isClone={true}
            onClone={handleClone}
            isDelete={true}
            onDelete={handleDelete}
            containerHeight={670}
            buttonTextName="Create Report"
            onCreate={handleCreateReport}
            showCreateButton={true}
            totalRecords={reportListData?.total}
          />
        </div>

        {/* Delete Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Confirm Delete"
          description="Are you sure you want to delete this report?"
          confirmText="Delete"
          isLoading={deleteLoading}
          variant="default"
        />

        {/* Status Dialog */}
        <ConfirmDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          onConfirm={confirmStatusUpdate}
          title="Confirm Status Change"
          description={`Are you sure you want to ${statusToUpdate?.checked ? "enable" : "disable"} this report?`}
          confirmText="Confirm"
          isLoading={statusUpdateLoading}
        />
      </div>
  );
};

export default CampaignOverviewPage;
