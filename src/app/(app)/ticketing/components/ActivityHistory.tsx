"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  FileText,
  RefreshCw,
  AlertCircle,
  User,
  Edit,
  MessageCircle,
  Paperclip,
  Loader2,
} from "lucide-react";
import type { TicketLogData } from "../types";

interface ActivityHistoryProps {
  ticketLogApi: any;
  currentTicketId: string | null;
  selectedTicketLogs: TicketLogData[];
}

export const ActivityHistory = ({
  ticketLogApi,
  currentTicketId,
  selectedTicketLogs,
}:ActivityHistoryProps) => {
  if (
    ticketLogApi.type === "query" &&
    ticketLogApi.loading &&
    currentTicketId
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
          Loading activity history...
        </p>
      </div>
    );
  }

  if (selectedTicketLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg">
            <Clock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
          </div>
        </div>
        <h3 className="mt-6 text-body font-semibold text-gray-900 dark:text-white">
          No Activity Found
        </h3>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline container */}
      <div className="absolute left-4 sm:left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700"></div>

      <div className="space-y-6 sm:space-y-8">
        {selectedTicketLogs
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() -
              new Date(a.timestamp).getTime()
          )
          .map((log) => (
            <div key={log._id} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-2 sm:left-4 md:left-6 top-4 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 sm:border-4 border-white dark:border-gray-800 shadow-lg z-10"></div>

              {/* Activity card */}
              <div className="ml-6 sm:ml-10 md:ml-12 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Card header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        {log.action_type === "Ticket Created" && (
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                        {log.action_type === "Status Changed" && (
                          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                        {log.action_type === "Priority Changed" && (
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                        {log.action_type === "Assignee Changed" && (
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                        {log.action_type === "Ticket Updated" && (
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                        {log.action_type === "Comment Added" && (
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                        {log.action_type === "Attachment Added" && (
                          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                        {![
                          "Ticket Created",
                          "Status Changed",
                          "Priority Changed",
                          "Assignee Changed",
                          "Ticket Updated",
                          "Comment Added",
                          "Attachment Added",
                        ].includes(log.action_type) && (
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-subBody sm:text-base text-gray-900 dark:text-white truncate">
                            {log.action_by}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 flex-shrink-0"
                          >
                            {log.action_type}
                          </Badge>
                        </div>
                        {log.details.assignee && (
                          <div className="mt-1">
                            <span className="text-xs sm:text-subBody text-gray-500 dark:text-gray-400 font-medium">
                              Assignee:
                            </span>
                            <span className="ml-2 text-xs sm:text-subBody text-gray-900 dark:text-white">
                              {log.details.assignee}
                            </span>
                          </div>
                        )}
                        <p className="text-xs sm:text-subBody text-gray-600 dark:text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-3 sm:p-4 md:p-6">
                  {log.action_type === "Ticket Created" && log.details && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
                      <h4 className="text-xs sm:text-subBody font-semibold text-blue-700 dark:text-blue-300 mb-2 sm:mb-3 flex items-center">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="truncate">Ticket Details</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-subBody">
                        {log.details.status && (
                          <div>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Status:
                            </span>
                            <span className="ml-2 text-blue-900 dark:text-blue-100">
                              {log.details.status}
                            </span>
                          </div>
                        )}
                        {log.details.priority && (
                          <div>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Priority:
                            </span>
                            <span className="ml-2 text-blue-900 dark:text-blue-100">
                              {log.details.priority}
                            </span>
                          </div>
                        )}
                        {log.details.tracker && (
                          <div>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Tracker:
                            </span>
                            <span className="ml-2 text-blue-900 dark:text-blue-100">
                              {log.details.tracker}
                            </span>
                          </div>
                        )}
                        {log.new_state && log.new_state.description && (
                          <div className="sm:col-span-2">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Description:
                            </span>
                            <div className="mt-1 text-blue-900 dark:text-blue-100 whitespace-pre-wrap leading-relaxed break-words">
                              {log.new_state.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {log.action_type === "Ticket Updated" && log.new_state && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
                      <h4 className="text-xs sm:text-subBody font-semibold text-blue-700 dark:text-blue-300 mb-2 sm:mb-3 flex items-center">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="truncate">Current Ticket Information</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-subBody">
                        {log.new_state.status && (
                          <div>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Status:
                            </span>
                            <span className="ml-2 text-blue-900 dark:text-blue-100">
                              {log.new_state.status}
                            </span>
                          </div>
                        )}
                        {log.new_state.priority && (
                          <div>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Priority:
                            </span>
                            <span className="ml-2 text-blue-900 dark:text-blue-100">
                              {log.new_state.priority}
                            </span>
                          </div>
                        )}
                        {log.new_state.percent_done && (
                          <div>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Progress:
                            </span>
                            <span className="ml-2 text-blue-900 dark:text-blue-100">
                              {log.new_state.percent_done}
                            </span>
                          </div>
                        )}
                      </div>
                      {log.new_state.description && (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-2 sm:col-span-2 lg:col-span-3">
                          <span className="text-blue-600 dark:text-blue-400 font-medium flex-shrink-0">
                            Description:
                          </span>
                          <div className="mt-1 sm:mt-0 text-blue-900 dark:text-blue-100 whitespace-pre-wrap leading-relaxed break-words">
                            {log.new_state.description}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {log.action_type !== "Ticket Created" &&
                    log.action_type !== "Ticket Updated" &&
                    log.details && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs sm:text-subBody font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          <span className="truncate">Action Details</span>
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(log.details).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0"
                            >
                              <span className="text-xs sm:text-subBody font-medium text-gray-600 dark:text-gray-400 capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <span className="text-xs sm:text-subBody text-gray-900 dark:text-white break-words sm:text-right">
                                {typeof value === "string"
                                  ? value
                                  : typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

