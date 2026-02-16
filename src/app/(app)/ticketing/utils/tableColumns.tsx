import React from "react";
import { Badge } from "@/components/ui/badge";
import type { Column } from "@/components/mf/ReportingToolTable";
import type { Ticket } from "../types";
import EllipsisTooltip from "@/components/mf/EllipsisTooltip";
import { getStatusColor, getStatusIcon } from "./helpers";

export const getTicketTableColumns = (): Column<Ticket>[] => [
  {
    title: "Ticket ID",
    key: "id",
    width: 120,
    render: (ticket: Ticket) => <EllipsisTooltip content={ticket.id} />,
  },
  {
    title: "Title",
    key: "title",
    width: 250,
    render: (ticket: Ticket) => <EllipsisTooltip content={ticket.title} />,
  },
  {
    title: "Status",
    key: "status",
    width: 140,
    render: (ticket: Ticket) => (
      <Badge className={getStatusColor(ticket.status)}>
        {getStatusIcon(ticket.status)}
        <span className="ml-1 capitalize">
          {ticket.status.replace("_", " ")}
        </span>
      </Badge>
    ),
  },
  {
    title: "Priority",
    key: "priority",
    width: 120,
    render: (ticket: Ticket) => (
      <div className="flex items-center gap-2">
        <span className="text-subBody capitalize">{ticket.priority}</span>
      </div>
    ),
  },
  {
    title: "Author",
    key: "author_name",
    width: 150,
    render: (ticket: Ticket) => (
      <EllipsisTooltip content={ticket.author_name} />
    ),
  },
  {
    title: "Assignee",
    key: "assignee",
    width: 150,
    render: (ticket: Ticket) => (
      <div className="flex items-center">
        {ticket.assignee ? (
          <EllipsisTooltip content={ticket.assignee} />
        ) : (
          <span className="text-subBody text-gray-500">Unassigned</span>
        )}
      </div>
    ),
  },
  {
    title: "Created",
    key: "createdAt",
    width: 180,
    render: (ticket: Ticket) => (
      <EllipsisTooltip content={ticket.createdAt} />
    ),
  },
  {
    title: "Last Updated",
    key: "lastUpdated",
    width: 180,
    render: (ticket: Ticket) => (
      <EllipsisTooltip content={ticket.lastUpdated} />
    ),
  },
  {
    title: "ETA",
    key: "eta",
    width: 120,
    render: (ticket: Ticket) => <EllipsisTooltip content={ticket.eta} />,
  },
];

