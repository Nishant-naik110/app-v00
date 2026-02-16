import React from "react";
import {
  TrendingUp,
  File,
  CircleX,
  CheckCircleIcon,
} from "lucide-react";
import type { CreateTicketForm } from "../types";

export const statusMap: Record<string, "raised" | "new" | "closed" | "resolved"> = {
  raised: "raised",
  new: "new",
  close: "closed",
  closed: "closed",
  resolved: "resolved",
};

export const statusColors = {
  raised:
    "bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200",
  new: "bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200",
  closed:
    "bg-red-500 text-white hover:bg-red-600 transition-colors duration-200",
  resolved:
    "bg-green-500 text-white hover:bg-green-600 transition-colors duration-200",
};

export const assigneeColors = {
  assigned:
    "bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200",
  unassigned:
    "bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-200",
};

export const normalizeStatus = (status: string): keyof typeof statusColors => {
  const key = status.trim()?.toLowerCase();
  return statusMap[key] || "new"; // default fallback to 'new'
};

export const getAssigneeColor = (assignee: string | undefined) => {
  return assignee && assignee !== "Unassigned"
    ? assigneeColors.assigned
    : assigneeColors.unassigned;
};

export const getStatusColor = (status: string) =>
  statusColors[normalizeStatus(status)];

export const getStatusIcon = (status: string) => {
  const normalizedStatus = normalizeStatus(status);
  switch (normalizedStatus) {
    case 'raised':
      return <TrendingUp className="w-3 h-3" />;
    case 'new':
      return <File className="w-3 h-3" />;
    case 'closed':
      return <CircleX className="w-3 h-3" />;
    case 'resolved':
      return <CheckCircleIcon size={14} />;
    default:
      return <File className="w-3 h-3" />;
  }
};

export const mapPriorityToFormValue = (
  priority: string
): "Low" | "Normal" | "Medium" | "High" | "Urgent" | "Immediate" => {
  const normalizedPriority = priority.toLowerCase();
  if (normalizedPriority === "high") return "High";
  if (normalizedPriority === "medium") return "Medium";
  if (normalizedPriority === "low") return "Low";
  if (normalizedPriority === "normal") return "Normal";
  if (normalizedPriority === "urgent") return "Urgent";
  if (normalizedPriority === "immediate") return "Immediate";
  return "Normal"; // default fallback
};

export const getInitialCreateForm = (): CreateTicketForm => ({
  project: "",
  tracker: "Bug",
  subject: "",
  description: "",
  status: "new",
  priority: "Normal",
  assignee: "",
  category: "",
  start_date: new Date().toISOString().slice(0, 16),
  due_date: new Date().toISOString().split('T')[0],
  estimate_time: 0,
  percent_done: "0%",
  file_path: "",
  file_url: "",
});

export const getInitialEditForm = (): CreateTicketForm => ({
  project: "",
  tracker: "Bug",
  subject: "",
  description: "",
  status: "new",
  priority: "Normal",
  assignee: "",
  category: "",
  start_date: new Date().toISOString().slice(0, 16),
  due_date: "",
  estimate_time: 0,
  percent_done: "0%",
  file_path: "",
  file_url: "",
});

