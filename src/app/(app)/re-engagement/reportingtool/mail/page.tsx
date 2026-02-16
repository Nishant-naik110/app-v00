"use client";

import ResizableTable, { type Column } from "@/components/mf/ReportingToolTable";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { debounce } from "@/lib/utils";
import { usePackage } from "@/components/mf/PackageContext";
import { ConfirmDialog } from "../report/components/ConfirmDialog";
import {
  useGetMailingListList,
  useCreateMailingList,
  useUpdateMailingList,
  useUpdateMailingListStatus,
  type MailingListListItem,
  type MailingListListPayload,
  type CreateMailingListPayload,
  type UpdateMailingListPayload,
  type MailingListStatusUpdatePayload,
} from "../../hooks/useReport";
import { useFormik, FormikProvider, FieldArray, getIn } from "formik";
import * as Yup from "yup";

const queryClient = new QueryClient();

// Constants
const DEBOUNCE_DELAY = 1000;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;
const MAILING_LIST_NAME_REGEX = /^[a-zA-Z _-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Types
type ModalMode = "create" | "view" | "edit";
type ModalState = { mode: ModalMode; data?: MailingListListItem } | null;

interface EmailListModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalState: ModalState;
  onRefresh: () => void;
}

// Validation Schema
const validationSchema = Yup.object({
  mailing_list_name: Yup.string()
    .trim()
    .min(3, "Mailing list name must be at least 3 characters")
    .max(50, "Mailing list name cannot exceed 50 characters")
    .matches(MAILING_LIST_NAME_REGEX, "Mailing list name can only contain letters, numbers, spaces, dashes, and underscores")
    .required("Mailing list name is required"),
  emails: Yup.array()
    .of(Yup.string().trim().matches(EMAIL_REGEX, "Invalid email address").required("Email is required"))
    .min(1, "At least one email is required"),
});

const EmailListModal = ({ isOpen, onClose, modalState, onRefresh }: EmailListModalProps) => {
  const { selectedPackage } = usePackage();
  const mode = modalState?.mode || "create";
  const isViewMode = mode === "view";
  const initialData = modalState?.data;

  const [createPayload, setCreatePayload] = useState<CreateMailingListPayload | undefined>(undefined);
  const [updatePayload, setUpdatePayload] = useState<UpdateMailingListPayload | undefined>(undefined);

  const { isLoading: createLoading, isSuccess: isCreateSuccess } = useCreateMailingList(createPayload, !!createPayload);
  const { isLoading: updateLoading, isSuccess: isUpdateSuccess } = useUpdateMailingList(updatePayload, !!updatePayload);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      mailing_list_name: initialData?.mailing_list_name || "",
      emails: initialData?.emails?.length ? initialData.emails : [""],
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isViewMode) {
        onClose();
        return;
      }

      const basePayload = {
        mailing_list_name: values.mailing_list_name.trim(),
        status: "True" as const,
        emails: values.emails,
        package_name: selectedPackage,
      };

      if (mode === "edit" && initialData?.id) {
        setUpdatePayload({
          ...basePayload,
          mailing_list_id: initialData.id,
        } as UpdateMailingListPayload);
      } else {
        setCreatePayload(basePayload as CreateMailingListPayload);
      }
    },
  });

  // Handle success
  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      setCreatePayload(undefined);
      setUpdatePayload(undefined);
      onClose();
      onRefresh();
    }
  }, [isCreateSuccess, isUpdateSuccess, onClose, onRefresh]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      formik.resetForm({
        values: {
          mailing_list_name: initialData?.mailing_list_name || "",
          emails: initialData?.emails?.length ? initialData.emails : [""],
        },
      });
    }
  }, [isOpen, initialData]);

  const isLoading = createLoading || updateLoading;
  const title = isViewMode ? "View Mailing List" : mode === "edit" ? "Edit Mailing List" : "Create Mailing List";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] rounded-lg bg-white p-6 dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold dark:text-white">{title}</DialogTitle>
        </DialogHeader>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block dark:text-white">Mailing List Name</Label>
                <Input
                  name="mailing_list_name"
                  placeholder="Enter Mailing List Name"
                  disabled={isViewMode}
                  value={formik.values.mailing_list_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`dark:text-white ${formik.touched.mailing_list_name && formik.errors.mailing_list_name ? "border-red-500" : ""}`}
                />
                {formik.touched.mailing_list_name && formik.errors.mailing_list_name && (
                  <p className="mt-1 text-subBody text-red-600">{formik.errors.mailing_list_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="mb-2 block dark:text-white">Email Addresses</Label>
              <FieldArray
                name="emails"
                render={(arrayHelpers) => (
                  <>
                    {formik.values.emails.map((email, index) => {
                      const emailError = getIn(formik.errors, `emails[${index}]`);
                      const isLastItem = index === formik.values.emails.length - 1;
                      const hasValue = email && email.trim() !== "";
                      const emailTouched = getIn(formik.touched, `emails[${index}]`);
                      return (
                        <div key={index} className="flex gap-2 items-center">
                          <div className="w-full">
                            <Input
                              name={`emails.${index}`}
                              type="email"
                              placeholder="Enter Email"
                              disabled={isViewMode}
                              value={email}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className={`dark:text-white ${emailTouched && emailError ? "border-red-500" : ""}`}
                            />
                            {emailTouched && emailError && <p className="ml-2 text-subBody text-red-600">{emailError}</p>}
                          </div>
                          {!isViewMode && (
                            <div className="flex gap-2 shrink-0">
                              {isLastItem && (
                               
                                  <Plus
                                   onClick={() => arrayHelpers.push("")}
                                  className={`h-6 w-6 bg-primary p-1 text-white rounded-full flex items-center justify-center hover:border-primary/30 transition-colors ${hasValue ? "" : "border border-primary"
                                    }`} />
                             
                              )}
                              {formik.values.emails.length > 1 && (
                               
                                  <Minus 
                                  onClick={() => arrayHelpers.remove(index)}
                                  className="h-6 w-6 bg-primary p-1 text-white border border-primary rounded-full flex items-center justify-center hover:border-primary/30 transition-colors"
                               />
                          
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              />
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button variant="default" size="sm" onClick={onClose} className="">
                {isViewMode ? "Close" : "Cancel"}
              </Button>
              {!isViewMode && (
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  className=""
                  disabled={isLoading || !formik.isValid || !formik.dirty}
                >
                  {isLoading ? (mode === "edit" ? "Updating..." : "Submitting...") : mode === "edit" ? "Update" : "Submit"}
                </Button>
              )}
            </div>
          </form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  );
};

const mailingList = () => {
  const { selectedPackage } = usePackage();
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState<ModalState>(null);
  const [statusDialog, setStatusDialog] = useState<{ id: string | number; checked: boolean } | null>(null);
  const [statusPayload, setStatusPayload] = useState<MailingListStatusUpdatePayload | undefined>(undefined);

  // Payload
  const payload = useMemo<MailingListListPayload>(
    () => ({
      package_name: selectedPackage,
      mailing_list_name: searchTerm,
      page_number: currentPage,
      record_limit: limit,
    }),
    [selectedPackage, searchTerm, currentPage, limit]
  );

  // API Hooks
  const { data, isLoading, refetch } = useGetMailingListList(payload, !!selectedPackage);
  const { isLoading: statusLoading, isSuccess: statusSuccess } = useUpdateMailingListStatus(statusPayload, !!statusPayload);

  // Derived data
  const tableData = data?.mailing_lists || [];
  const totalPages = data?.total_pages || 0;

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setCurrentPage(DEFAULT_PAGE);
    }, DEBOUNCE_DELAY),
    []
  );

  // Handlers
  const handleSearch = useCallback((term: string) => debouncedSearch(term), [debouncedSearch]);
  const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
  const handleLimitChange = useCallback((limit: number) => {
    setLimit(limit);
    setCurrentPage(DEFAULT_PAGE);
  }, []);

  const handleStatusChange = useCallback((id: string | number, checked: boolean) => {
    setStatusDialog({ id, checked });
  }, []);

  const confirmStatusUpdate = useCallback(() => {
    if (!statusDialog) return;
    setStatusPayload({
      mailing_list_id: statusDialog.id,
      status: statusDialog.checked ? "True" : "False",
      package_name: selectedPackage,
    });
    setStatusDialog(null);
  }, [statusDialog, selectedPackage]);

  const handleView = useCallback((data: MailingListListItem) => {
    setModalState({ mode: "view", data });
  }, []);

  const handleEdit = useCallback((data: MailingListListItem) => {
    setModalState({ mode: "edit", data });
  }, []);

  const handleCreate = useCallback(() => {
    setModalState({ mode: "create" });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  // Columns
  const columns: Column<MailingListListItem>[] = useMemo(
    () => [
      { title: "Mailing List Name", key: "mailing_list_name" },
      { title: "Created By", key: "created_by" },
      {
        title: "Created Date",
        key: "created_at",
        render: (data: MailingListListItem) => <div className="text-left">{format(new Date(data.created_at), "yyyy-MM-dd HH:mm:ss")}</div>,
      },
      { title: "Updated By", key: "updated_by" },
      {
        title: "Updated Date",
        key: "updated_at",
        render: (data: MailingListListItem) => <div className="text-left">{format(new Date(data.updated_at), "yyyy-MM-dd HH:mm:ss")}</div>,
      },
      {
        title: "Status",
        key: "status",
        render: (data: MailingListListItem) => {
          const isActive = typeof data.status === "boolean" ? data.status : data.status === "True" || data.status === "true";
          return (
            <div className="flex justify-center">
              <Switch
                className="h-4 w-8 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                checked={isActive}
                onCheckedChange={(checked) => handleStatusChange(data.id, checked)}
              />
            </div>
          );
        },
      },
    ],
    [handleStatusChange]
  );

  // Effects
  useEffect(() => {
    if (statusSuccess) {
      setStatusPayload(undefined);
      refetch();
    }
  }, [statusSuccess, refetch]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative bg-card rounded-md mt-2">
        <div className="p-4">
          <ResizableTable<MailingListListItem>
            isPaginated
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            headerColor="#DCDCDC"
            isSearchable
            onSearch={handleSearch}
            onLimitChange={handleLimitChange}
            onPageChange={handlePageChange}
            pageNo={currentPage}
            totalPages={totalPages}
            isEdit
            isView
            onView={handleView}
            onEdit={handleEdit}
            showCreateButton
            buttonTextName="Create Mailing List"
            onCreate={handleCreate}
            totalRecords={data?.total}
            containerHeight={670}
          />
          <EmailListModal isOpen={!!modalState} onClose={closeModal} modalState={modalState} onRefresh={refetch} />
        </div>
        <ConfirmDialog
          open={!!statusDialog}
          onOpenChange={(open) => !open && setStatusDialog(null)}
          onConfirm={confirmStatusUpdate}
          title="Confirm Status Change"
          description={`Are you sure you want to ${statusDialog?.checked ? "enable" : "disable"} this mailing list?`}
          confirmText="Confirm"
          isLoading={statusLoading}
        />
      </div>
    </QueryClientProvider>
  );
};

export default mailingList;
