"use client";
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
import { useGetPresignedUpload } from "@/app/(app)/ticketing/hooks/useTicket";
import type { CreateTicketForm, CreateTicketFormErrors, StatusOption, User as ApiUser } from "../types";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  createForm: CreateTicketForm;
  setCreateForm: React.Dispatch<React.SetStateAction<CreateTicketForm>>;
  onCreateTicket: () => void;
  isLoading?: boolean;
  projects: string[];
  isLoadingProjects: boolean;
  users: ApiUser[];
  isLoadingUsers: boolean;
  statusOptions: StatusOption[];
  isLoadingStatus: boolean;
  errors: CreateTicketFormErrors;
  clearErrors: () => void;
}

const CreateTicketModal = 
  ({
    isOpen,
    onClose,
    createForm,
    setCreateForm,
    onCreateTicket,
    isLoading = false,
    projects,
    isLoadingProjects,
    users,
    isLoadingUsers,
    statusOptions,
    isLoadingStatus,
    errors,
    clearErrors,
  }: CreateTicketModalProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [presignPayload, setPresignPayload] = useState<{ filename?: string; content_type?: string } | undefined>(undefined);
    const presignMutation = useGetPresignedUpload(presignPayload, !!presignPayload);

    const handleFormChange = useCallback(
      (field: keyof CreateTicketForm, value: any) => {
        setCreateForm((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors?.[field as keyof CreateTicketFormErrors]) {
          clearErrors();
        }
      },
      [setCreateForm, errors, clearErrors]
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
                setCreateForm((prev) => ({
                  ...prev,
                  file_path: filePath,
                  file_url: publicUrl,
                }));
              } else {
                setCreateForm((prev) => ({
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
              setCreateForm((prev) => ({
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
    }, [presignMutation.data, presignMutation.isLoading, presignPayload, setCreateForm]);

    const handleFileSelected = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        // Reset file fields optimistically while uploading
        setCreateForm((prev) => ({ ...prev, file_path: "", file_url: "" }));
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
      [setCreateForm]
    );

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6"
          aria-describedby="create-ticket-description"
        >
          <DialogHeader>
            <DialogTitle className="text-base sm:text-body md:text-xl text-gray-900 dark:text-white">Create New Ticket</DialogTitle>
          </DialogHeader>
          <div id="create-ticket-description" className="sr-only">
            Form to create a new ticket with project, subject, description, and
            other details
          </div>
          <div className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto p-1 sm:p-2">
            {/* Project and Tracker Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="project" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Package *</Label>
                <Select
                  value={
                    typeof createForm?.project === "string"
                      ? createForm.project
                      : ""
                  }
                  onValueChange={(value: any) =>
                    handleFormChange("project", value)
                  }
                  disabled={isLoadingProjects}
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
                <Label htmlFor="tracker" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Tracker *</Label>
                <Select
                  value={createForm?.tracker}
                  onValueChange={(value: any) =>
                    handleFormChange("tracker", value)
                  }
                >
                  <SelectTrigger
                    className={`${errors?.tracker ? "border-red-500" : ""} dark:text-gray-100`}
                  >
                    <SelectValue placeholder="Select tracker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Feature">Feature</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
                {errors?.tracker && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">{errors.tracker}</p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="subject" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter ticket subject"
                  value={createForm?.subject}
                  onChange={(e) => handleFormChange("subject", e.target.value)}
                  className={`${errors?.subject ? "border-red-500" : ""} dark:text-gray-100`}
                />
                {errors?.subject && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">{errors.subject}</p>
                )}
              </div>
              <div>
                <Label htmlFor="status" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Status *</Label>
                <Select
                  value={createForm?.status}
                  onValueChange={(value: any) =>
                    handleFormChange("status", value)
                  }
                  disabled={isLoadingStatus}
                >
                  <SelectTrigger
                    className={`${errors?.status ? "border-red-500" : ""} dark:text-gray-100`}
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
                {errors?.status && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">{errors.status}</p>
                )}
              </div>
            </div>

            {/* Status and Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="priority" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Priority *</Label>
                <Select
                  value={createForm?.priority}
                  onValueChange={(value: any) =>
                    handleFormChange("priority", value)
                  }
                >
                  <SelectTrigger
                    className={`${errors?.priority ? "border-red-500" : ""} dark:text-gray-100`}
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
                {errors?.priority && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">
                    {errors.priority}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="due_date" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={createForm?.due_date}
                  onChange={(e) => handleFormChange("due_date", e.target.value)}
                  className={`${errors?.due_date ? "border-red-500" : ""} dark:text-gray-100`}
                />
                {errors?.due_date && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">
                    {errors.due_date}
                  </p>
                )}
              </div>
            </div>

            {/* Date Range Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="percent_done" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Percent Done *</Label>
                <Select
                  value={createForm?.percent_done}
                  onValueChange={(value) =>
                    handleFormChange("percent_done", value)
                  }
                >
                  <SelectTrigger
                    className={`${errors?.percent_done ? "border-red-500" : ""} dark:text-gray-100`}
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
                {errors?.percent_done && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">
                    {errors.percent_done}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="estimate_time" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Estimate Time (hours) *</Label>
                <Input
                  id="estimate_time"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="8"
                  value={createForm?.estimate_time}
                  onChange={(e) =>
                    handleFormChange(
                      "estimate_time",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={`${errors?.estimate_time ? "border-red-500" : ""} dark:text-gray-100`}
                />
                {errors?.estimate_time && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">
                    {errors.estimate_time}
                  </p>
                )}
              </div>
            </div>

            {/* Estimate Time and Percent Done Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="description" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail"
                  rows={4}
                  value={createForm?.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  className={`${errors?.description ? "border-red-500" : ""} dark:text-gray-100`}
                />
                {errors?.description && (
                  <p className="text-xs sm:text-subBody text-red-500 dark:text-red-400 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description" className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300">File Upload</Label>

                <Input
                  id="file_upload"
                  type="file"
                  onChange={handleFileSelected}
                  disabled={isUploading}
                  className="text-xs sm:text-subBody"
                />
                {errors?.file_path && (
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

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-2">
              <Button onClick={onClose} disabled={isLoading || isUploading} variant="default" size="sm">
                Cancel
              </Button>
              <Button onClick={onCreateTicket} disabled={isLoading || isUploading} variant="default" size="sm">
                Create Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }


CreateTicketModal.displayName = "CreateTicketModal";

export default CreateTicketModal;

