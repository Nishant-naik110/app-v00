import { useMemo } from "react";
import type { Ticket } from "@/components/mf/ReportingToolTable";

export const useTicketStats = (
  tickets: Ticket[],
  ticketOverview: any
) => {
  return useMemo(() => {
    if (ticketOverview) {
      return {
        total: ticketOverview.total_records || 0,
        active: ticketOverview.active || 0,
        closed: ticketOverview.closed || 0,
        completionRate: ticketOverview.percentage?.closed || 0,
        new: 0,
        open: 0,
        inProgress: ticketOverview.active_breakdown?.in_progress || 0,
        unassigned: 0,
        activeBreakdown: ticketOverview.active_breakdown || {},
        closedBreakdown: ticketOverview.closed_breakdown || {},
        percentage: ticketOverview.percentage || {},
      };
    }

    const total = tickets.length;
    const active = tickets.filter(
      (t) => !["closed", "cancelled", "resolved"].includes(t.status)
    ).length;
    const closed = tickets.filter((t) => t.status === "closed").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const completionRate =
      total > 0 ? Math.round(((closed + resolved) / total) * 100) : 0;

    return {
      total: tickets.length,
      active,
      closed: closed + resolved,
      completionRate,
      new: tickets.filter((t) => t.status === "new").length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress").length,
      unassigned: tickets.filter((t) => !t.assignee).length,
      activeBreakdown: {},
      closedBreakdown: {},
      percentage: {},
    };
  }, [tickets, ticketOverview]);
};

