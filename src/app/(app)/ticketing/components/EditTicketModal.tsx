"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Clock } from "lucide-react";
import { useGetPresignedUpload } from "@/app/(app)/ticketing/hooks/useTicket";
import type { CreateTicketForm, EditTicketFormErrors, StatusOption, User as ApiUser, TicketLogData } from "../types";
import type { Ticket } from "@/components/mf/ReportingToolTable";
import { TicketOverview } from "./TicketOverview";
import { ActivityHistory } from "./ActivityHistory";
import { normalizeStatus } from "../utils/helpers";
import { EditTicketModalSkeleton } from "./EditTicketModalSkeleton";

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  editForm: CreateTicketForm;
  setEditForm: React.Dispatch<React.SetStateAction<CreateTicketForm>>;
  onUpdateTicket: () => void;
  editingTicket: Ticket | null;
  projects: string[];
  isLoadingProjects: boolean;
  users: ApiUser[];
  isLoadingUsers: boolean;
  statusOptions: StatusOption[];
  isLoadingStatus: boolean;
  isLoadingTicketData?: boolean;
  selectedTicketLogs: TicketLogData[];
  ticketLogApi: any;
  currentTicketId: string | null;
  errors: EditTicketFormErrors;
  clearErrors: () => void;
}

const EditTicketModal = React.memo(
  ({
    isOpen,
    onClose,
    editForm,
    setEditForm,
    onUpdateTicket,
    editingTicket,
    projects,
    isLoadingProjects,
    users,
    isLoadingUsers,
    statusOptions,
    isLoadingStatus,
    isLoadingTicketData = false,
    selectedTicketLogs,
    ticketLogApi,
    currentTicketId,
    errors,
    clearErrors,
  }: EditTicketModalProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [presignPayload, setPresignPayload] = useState<{ filename?: string; content_type?: string } | undefined>(undefined);
    const presignMutation = useGetPresignedUpload(presignPayload, !!presignPayload);

    const handleFormChange = useCallback(
      (field: keyof CreateTicketForm, value: any) => {
        if (typeof value === "object" && value !== null) {
          return;
        }
        setEditForm((prev) => ({ ...prev, [field]: value }));
        if (errors?.[field as keyof EditTicketFormErrors]) {
          clearErrors();
        }
      },
      [setEditForm, errors, clearErrors]
    );

    // Handle presigned upload response
    const fileToUploadRef = useRef<File | null>(null);
    useEffect(() => {
      if (presignMutation.data && presignPayload && !presignMutation.isLoading && fileToUploadRef.current) {
        const file = fileToUploadRef.current;
        const data = (presignMutation.data as any)?.result || presignMutation.data;
        const uploadUrl = data?.upload_url as string | undefined;
        const filePath = data?.file_path || data?.key || file.name;
        const publicUrl = data?.file_url || data?.url || "";
        
        if (uploadUrl) {
          fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type":
                data?.content_type || "application/octet-stream",
            },
            body: file,
          })
            .then((putRes) => {
              if (putRes.ok) {
                setEditForm((prev) => ({
                  ...prev,
                  file_path: filePath,
                  file_url: publicUrl,
                }));
              } else {
                setEditForm((prev) => ({
                  ...prev,
                  file_path: "",
                  file_url: "",
                }));
              }
              setIsUploading(false);
              setPresignPayload(undefined);
              fileToUploadRef.current = null;
            })
            .catch(() => {
              setEditForm((prev) => ({
                ...prev,
                file_path: "",
                file_url: "",
              }));
              setIsUploading(false);
              setPresignPayload(undefined);
              fileToUploadRef.current = null;
            });
        }
      }
    }, [presignMutation.data, presignMutation.isLoading, presignPayload, setEditForm]);

    const handleFileSelected = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setEditForm((prev) => ({ ...prev, file_path: "", file_url: "" }));
        setIsUploading(true);
        fileToUploadRef.current = file;

        try {
          // Set payload which will trigger the query (queryKey changes, so React Query refetches)
          setPresignPayload({
            filename: file.name,
            content_type: file.type || "application/octet-stream",
          });
        } catch (err) {
          setIsUploading(false);
          setPresignPayload(undefined);
          fileToUploadRef.current = null;
        }
      },
      [setEditForm]
    );

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6"
          aria-describedby="edit-ticket-description"
        >
          <DialogHeader>
            <DialogTitle className="text-base sm:text-body md:text-xl text-gray-900 dark:text-white">
              {isLoadingTicketData
                ? "Loading ticket data..."
                : `Edit Ticket ${editingTicket?.id}`}
            </DialogTitle>
          </DialogHeader>
          <div id="edit-ticket-description" className="sr-only">
            Form to edit ticket details including project, subject, description,
            and other fields
          </div>
          <div className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto pr-1 sm:pr-2 relative">
            {isLoadingTicketData ? (
              <EditTicketModalSkeleton />
            ) : (
              <>
                {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="edit-project" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Package *</Label>
                <Select
                  value={
                    typeof editForm?.project === "string" ? editForm.project : ""
                  }
                  onValueChange={(value: any) =>
                    handleFormChange("project", value)
                  }
                  disabled={true}
                >
                  <SelectTrigger
                    className={`${errors?.project ? "border-red-500" : ""} dark:text-gray-100`}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingProjects
                          ? "Loading projects..."
                          : "Select package"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingProjects ? (
                      <SelectItem value="loading" disabled>
                        Loading projects...
                      </SelectItem>
                    ) : projects?.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-projects" disabled>
                        No projects available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors?.project && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">{errors.project}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-tracker" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Tracker *</Label>
                <Select
                  value={editForm.tracker}
                  onValueChange={(value: any) =>
                    handleFormChange("tracker", value)
                  }
                  disabled={isLoadingTicketData}
                >
                  <SelectTrigger
                    className={`${errors.tracker ? "border-red-500" : ""} dark:text-gray-100`}
                  >
                    <SelectValue placeholder="Select tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Feature">Feature</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tracker && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">{errors.tracker}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="edit-subject" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Subject *</Label>
                <Input
                  id="edit-subject"
                  placeholder="Enter ticket subject"
                  value={editForm.subject}
                  onChange={(e) => handleFormChange("subject", e.target.value)}
                  disabled={true}
                  className={`${errors.subject ? "border-red-500" : ""} dark:text-gray-100`}
                />
                {errors.subject && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">{errors.subject}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-status" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Status *</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: any) =>
                    handleFormChange("status", value)
                  }
                  disabled={isLoadingStatus || isLoadingTicketData}
                >
                  <SelectTrigger
                    className={`${errors.status ? "border-red-500" : ""} dark:text-gray-100`}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingStatus
                          ? "Loading status options..."
                          : "Select status"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingStatus ? (
                      <SelectItem value="loading" disabled>
                        Loading status options...
                      </SelectItem>
                    ) : statusOptions?.length > 0 ? (
                      statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-status" disabled>
                        No status options available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">{errors.status}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="edit-priority" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Priority *</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(value: any) =>
                    handleFormChange("priority", value)
                  }
                >
                  <SelectTrigger
                    className={`${errors.priority ? "border-red-500" : ""} dark:text-gray-100`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">{errors.priority}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-due_date" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Due Date *</Label>
                <Input
                  id="edit-due_date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={editForm.due_date}
                  onChange={(e) => handleFormChange("due_date", e.target.value)}
                  className={`${errors.due_date ? "border-red-500" : ""} dark:text-gray-100`}
                />
                {errors.due_date && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">{errors.due_date}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="edit-percent_done" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Percent Done *</Label>
                <Select
                  value={editForm.percent_done}
                  onValueChange={(value) =>
                    handleFormChange("percent_done", value)
                  }
                >
                  <SelectTrigger
                    className={`${errors.percent_done ? "border-red-500" : ""} dark:text-gray-100`}
                  >
                    <SelectValue placeholder="Select progress" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0%">0%</SelectItem>
                    <SelectItem value="25%">25%</SelectItem>
                    <SelectItem value="50%">50%</SelectItem>
                    <SelectItem value="75%">75%</SelectItem>
                    <SelectItem value="100%">100%</SelectItem>
                  </SelectContent>
                </Select>
                {errors.percent_done && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">
                    {errors.percent_done}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-estimate_time" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">
                  Estimate Time (hours) *
                </Label>
                <Input
                  id="edit-estimate_time"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="8"
                  value={editForm.estimate_time}
                  onChange={(e) =>
                    handleFormChange(
                      "estimate_time",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={`${errors.estimate_time ? "border-red-500" : ""} dark:text-gray-100`}
                />
                {errors.estimate_time && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">
                    {errors.estimate_time}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="edit-description" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Description *</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe the issue in detail"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  className={`${errors.description ? "border-red-500" : ""} dark:text-gray-100`}
                />
                {errors.description && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="file_upload" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">File Upload</Label>
                <div className="space-y-2">
                  {(editForm.file_url || editForm.file_path) && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-subBody">
                      <a
                        href={editForm.file_url || "#"}
                        target={editForm.file_url ? "_blank" : undefined}
                        rel={editForm.file_url ? "noreferrer" : undefined}
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {(() => {
                          const fromPath =
                            (editForm.file_path || "").split("/").pop() || "";
                          const fromUrl =
                            (editForm.file_url || "").split("/").pop() || "";
                          return fromPath || fromUrl || "Current attachment";
                        })()}
                      </a>
                      <Button
                        type="button"
                        variant="default"
                        className="h-7 px-2 py-1 text-xs flex-shrink-0"
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            file_path: "",
                            file_url: "",
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  <Input
                    id="file_upload"
                    type="file"
                    onChange={handleFileSelected}
                    disabled={isUploading}
                    className="text-xs sm:text-subBody"
                  />
                  {errors.file_path && (
                    <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">
                      {errors.file_path}
                    </p>
                  )}
                  {isUploading && (
                    <div className="text-xs sm:text-subBody text-gray-500 dark:text-gray-400 mt-1">
                      Uploading file...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-2">
              <Button onClick={onClose} disabled={isLoadingTicketData} variant="default" size="sm">
                Cancel
              </Button>
              <Button
                onClick={onUpdateTicket}
                disabled={isLoadingTicketData || isUploading}
                variant="default"
                size="sm"
              >
                Update Ticket
              </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4 sm:my-6"></div>

            {/* Ticket Overview and History Section */}
            {editingTicket && (
              <div className="space-y-4 sm:space-y-6">
                <TicketOverview
                  editingTicket={editingTicket}
                  selectedTicketLogs={selectedTicketLogs}
                  normalizeStatus={normalizeStatus}
                />

                {/* History Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-body sm:text-xl font-bold text-gray-900 dark:text-white">
                        Activity History
                      </h3>
                      <p className="text-xs sm:text-subBody text-gray-600 dark:text-gray-400">
                        Track all changes and updates to this ticket
                      </p>
                    </div>
                  </div>
                </div>

                <ActivityHistory
                  ticketLogApi={ticketLogApi}
                  currentTicketId={currentTicketId}
                  selectedTicketLogs={selectedTicketLogs}
                />
              </div>
            )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

EditTicketModal.displayName = "EditTicketModal";

export default EditTicketModal;

