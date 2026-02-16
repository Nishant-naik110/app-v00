"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import CircularProgress from "@/components/mf/CircularProgress";
import { TicketStatsCardsSkeleton } from "./TicketStatsCardsSkeleton";

interface TicketStatsCardsProps {
  stats: {
    total: number;
    active: number;
    closed: number;
    activeBreakdown?: {
      in_progress?: number;
      pending?: number;
      percentage?: {
        in_progress?: number;
        pending?: number;
      };
    };
    closedBreakdown?: {
      completed_on_time?: number;
      completed_late?: number;
      percentage?: {
        completed_on_time?: number;
        completed_late?: number;
      };
    };
    percentage?: {
      active?: number;
      closed?: number;
    };
  };
  isLoadingOverview: boolean;
}

export const TicketStatsCards = ({
  stats,
  isLoadingOverview,
}: TicketStatsCardsProps) => {
  if (isLoadingOverview) {
    return <TicketStatsCardsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overall Stats */}
      <div>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-emerald-50 dark:from-orange-900/20 dark:to-emerald-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <CircularProgress
                segments={[
                  {
                    label: "Active",
                    value: isLoadingOverview ? 0 : stats.active || 0,
                    color: "#3b82f6",
                    maxValue: isLoadingOverview ? 0 : stats.total || 1,
                  },
                  {
                    label: "Closed",
                    value: isLoadingOverview ? 0 : stats.closed || 0,
                    color: "#22c55e",
                    maxValue: isLoadingOverview ? 0 : stats.total || 1,
                  },
                ]}
                centerCount={isLoadingOverview ? 0 : stats.total || 0}
                centerLabel="Total Tickets"
                size={120}
                strokeWidth={8}
                className="mx-auto"
              />
            </div>
            <div className="text-right ml-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="text-blue-500 text-subBody dark:text-gray-300">
                    {isLoadingOverview ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      `${stats.active} Active (${stats.percentage?.active || 0}%)`
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-green-700 text-subBody dark:text-gray-300">
                    {isLoadingOverview ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      `${stats.closed} Closed (${stats.percentage?.closed || 0}%)`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Tickets Breakdown */}
      <div>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <CircularProgress
                segments={[
                  {
                    label: "In Progress",
                    value:
                      isLoadingOverview ? 0 : stats.activeBreakdown?.in_progress || 0,
                    color: "#3b82f6",
                    maxValue: isLoadingOverview ? 0 : stats.active || 1,
                  },
                  {
                    label: "Pending",
                    value: isLoadingOverview ? 0 : stats.activeBreakdown?.pending || 0,
                    color: "#ef4444",
                    maxValue: isLoadingOverview ? 0 : stats.active || 1,
                  },
                ]}
                centerCount={isLoadingOverview ? 0 : stats.active || 0}
                centerLabel="Active Tickets"
                size={120}
                strokeWidth={8}
                className="mx-auto"
              />
            </div>
            <div className="text-right ml-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="text-blue-500 text-subBody dark:text-gray-300">
                    {isLoadingOverview ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      `${stats.activeBreakdown?.in_progress || 0} In Progress (${stats.activeBreakdown?.percentage?.in_progress || 0}%)`
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></div>
                  <span className="text-red-700 text-subBody dark:text-gray-300">
                    {isLoadingOverview ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      `${stats.activeBreakdown?.pending || 0} Pending (${stats.activeBreakdown?.percentage?.pending || 0}%)`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Closed Tickets Breakdown */}
      <div>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <CircularProgress
                segments={[
                  {
                    label: "Completed On Time",
                    value:
                      isLoadingOverview
                        ? 0
                        : stats.closedBreakdown?.completed_on_time || 0,
                    color: "#22c55e",
                    maxValue: isLoadingOverview ? 0 : stats.closed || 1,
                  },
                  {
                    label: "Completed Late",
                    value:
                      isLoadingOverview ? 0 : stats.closedBreakdown?.completed_late || 0,
                    color: "#f97316",
                    maxValue: isLoadingOverview ? 0 : stats.closed || 1,
                  },
                ]}
                centerCount={isLoadingOverview ? 0 : stats.closed || 0}
                centerLabel="Closed Tickets"
                size={120}
                strokeWidth={8}
                className="mx-auto"
              />
            </div>
            <div className="text-right ml-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-green-700 text-subBody dark:text-gray-300">
                    {isLoadingOverview ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      `${stats.closedBreakdown?.completed_on_time || 0} Completed In time (${stats.closedBreakdown?.percentage?.completed_on_time || 0}%)`
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm"></div>
                  <span className="text-orange-700 text-subBody dark:text-gray-300">
                    {isLoadingOverview ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      `${stats.closedBreakdown?.completed_late || 0} Completed Late (${stats.closedBreakdown?.percentage?.completed_late || 0}%)`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

