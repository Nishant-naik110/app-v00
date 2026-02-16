"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import type { Ticket } from "@/components/mf/ReportingToolTable";
import type { TicketLogData } from "../types";
import { normalizeStatus } from "../utils/helpers";

interface TicketOverviewProps {
  editingTicket: Ticket | null;
  selectedTicketLogs: TicketLogData[];
  normalizeStatus: (status: string) => string;
}

export const TicketOverview = ({
  editingTicket,
  selectedTicketLogs,
  normalizeStatus: normalizeStatusFn,
}:TicketOverviewProps) => {
  if (!editingTicket) return null;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl sm:rounded-2xl border border-gray-200/60 dark:border-gray-600/60 shadow-lg overflow-hidden w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-body font-bold text-white truncate">
                {(() => {
                  if (selectedTicketLogs && selectedTicketLogs.length > 0) {
                    const firstLog = selectedTicketLogs[0];
                    if (firstLog.details && firstLog.details.title) {
                      return firstLog.details.title;
                    }
                  }
                  return "Ticket Overview";
                })()}
              </h3>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 sm:px-3 py-1 flex-shrink-0">
            #{editingTicket.id}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* First Row - Three Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Column 1 - Created By */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                Created By:
              </div>
              <div className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                {(() => {
                  const sortedLogs = [...selectedTicketLogs].sort(
                    (a, b) =>
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime()
                  );
                  const firstLog = sortedLogs[0];
                  if (
                    firstLog &&
                    firstLog.action_type === "Ticket Created"
                  ) {
                    return (
                      firstLog.action_by ||
                      editingTicket?.author_name ||
                      "Unknown"
                    );
                  }
                  return editingTicket?.author_name || "Unknown";
                })()}
              </div>
            </div>

            {/* Column 2 - Current Assignee */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                Assignee:
              </div>
              <div className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                {(() => {
                  const sortedLogs = [...selectedTicketLogs].sort(
                    (a, b) =>
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime()
                  );
                  const firstLog = sortedLogs[0];
                  if (
                    firstLog &&
                    firstLog.action_type === "Ticket Created"
                  ) {
                    return (
                      firstLog.new_state?.assignee ||
                      firstLog.details?.assignee ||
                      editingTicket?.assignee ||
                      "Unassigned"
                    );
                  }
                  return editingTicket?.assignee || "Unassigned";
                })()}
              </div>
            </div>

            {/* Column 3 - Status */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                Status:
              </div>
              <div className="text-xs sm:text-subBody text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                {(() => {
                  const sortedLogs = [...selectedTicketLogs].sort(
                    (a, b) =>
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime()
                  );
                  const firstLog = sortedLogs[0];
                  if (
                    firstLog &&
                    firstLog.action_type === "Ticket Created"
                  ) {
                    return (
                      firstLog.new_state?.status ||
                      editingTicket?.status ||
                      "new"
                    );
                  }
                  return typeof editingTicket?.status === "string"
                    ? normalizeStatusFn(editingTicket.status).replace("_", " ")
                    : "new";
                })()}
              </div>
            </div>
          </div>

          {/* Second Row - Additional Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Column 1 - Percent Done */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                Percent Done:
              </div>
              <div className="text-xs sm:text-subBody font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                {(() => {
                  const sortedLogs = [...selectedTicketLogs].sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  );
                  for (const log of sortedLogs) {
                    if (log.new_state?.percent_done !== undefined) {
                      return log.new_state.percent_done;
                    }
                  }
                  return editingTicket?.percent_done || "0%";
                })()}
              </div>
            </div>

            {/* Column 2 - Start Date */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                Start Date:
              </div>
              <div className="text-xs sm:text-subBody font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                {(() => {
                  if (!editingTicket?.start_date) return "Not set";
                  try {
                    const date = new Date(editingTicket.start_date);
                    return date.toLocaleDateString();
                  } catch {
                    return editingTicket.start_date;
                  }
                })()}
              </div>
            </div>

            {/* Column 3 - Due Date */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                Due Date:
              </div>
              <div className="text-xs sm:text-subBody font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                {(() => {
                  if (!editingTicket?.due_date) return "Not set";
                  try {
                    const date = new Date(editingTicket.due_date);
                    return date.toLocaleDateString();
                  } catch {
                    return editingTicket.due_date;
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Third Row - Additional Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Column 1 - Priority */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                Priority:
              </div>
              <div className="text-xs sm:text-subBody font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                {editingTicket?.priority || "Medium"}
              </div>
            </div>

            {/* Column 2 - Tracker */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                Tracker:
              </div>
              <div className="text-xs sm:text-subBody font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                {(() => {
                  const sortedLogs = [...selectedTicketLogs].sort(
                    (a, b) =>
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime()
                  );
                  const firstLog = sortedLogs[0];
                  if (
                    firstLog &&
                    firstLog.action_type === "Ticket Created"
                  ) {
                    return (
                      firstLog.new_state?.tracker ||
                      firstLog.details?.tracker ||
                      "Not set"
                    );
                  }
                  return "Not set";
                })()}
              </div>
            </div>

            {/* Column 3 - Estimate Time */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                Estimate Time:
              </div>
              <div className="text-xs sm:text-subBody font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                {(() => {
                  const sortedLogs = [...selectedTicketLogs].sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  );
                  for (const log of sortedLogs) {
                    if (log.new_state?.estimate_time !== undefined) {
                      return `${log.new_state.estimate_time} hours`;
                    }
                  }
                  return editingTicket?.eta || "Not set";
                })()}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="flex flex-col gap-2 sm:gap-2">
            <div className="text-xs sm:text-subBody font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
              Description:
            </div>
            <div className="text-xs sm:text-subBody font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3 break-words w-full">
              {(() => {
                const sortedLogs = [...selectedTicketLogs].sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                );
                for (const log of sortedLogs) {
                  if (log.new_state?.description) {
                    return log.new_state.description;
                  }
                  if (log.details?.description) {
                    if (typeof log.details.description === 'string') {
                      return log.details.description;
                    } else if (typeof log.details.description === 'object' && log.details.description && 'new' in log.details.description) {
                      return (log.details.description as any).new;
                    }
                  }
                }
                return editingTicket?.description || "No description available";
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

