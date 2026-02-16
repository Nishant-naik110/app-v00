"use client";
import { useApi } from "@/hooks/api/api_base";
export interface CreateTicketResponse {
  ticket_id: string;
  message: string;
  status: string;
}

// Ticket data structure from API
export interface TicketData {
  _id: string;
  author_name: string;
  email: string[];
  email_flag: boolean;
  project: string;
  tracker: string;
  subject: string;
  description: string;
  status: "new" | "open" | "in_progress" | "resolved" | "closed" | "cancelled" | "draft";
  priority: "Low" | "Normal" | "Medium" | "High" | "Urgent" | "Immediate";
  assignee: string;
  category: string;
  start_date: string;
  due_date: string;
  estimate_time: number;
  percent_done: string;
  meta: Record<string, any>;
  batch_id?: string;
  ticket_id: string;
  created_at: string;
}

// Tickets API response
export interface TicketsResponse {
  message: string;
  result: {
    data: TicketData[];
    total_records: number;
    total_pages: number;
    current_page: number;
  };
  status: string;
}

export interface CreateTicketRequest {
  project_id?: string;
  project: string;
  tracker: string;
  subject: string;
  email?: string[];
  author_name?: string;
  description: string;
  status: "new" | "open" | "in_progress" | "resolved" | "closed" | "cancelled" | "draft";
  priority: "Low" | "Normal" | "Medium" | "High" | "Urgent" | "Immediate";
  category: string;
  start_date: string;
  due_date: string;
  estimate_time: number;
  percent_done: string;
  sub_projects_of?: string;
  ticket_tracker?: string;
  file_path?: string;
  file_url?: string;
}


// Users API types
export interface User {
    email: string;
    name: string;
  }
  
  export interface UsersResponse {
    message: string;
    status: string;
    data: User[];
  }

// Ticket log types
export interface TicketLogDetails {
  title?: string;
  priority?: string;
  category?: string;
  assignee?: string;
  tracker?: string;
  status?: string;
  // New fields for detailed change tracking
  assignee_change?: {
    old: string;
    new: string;
  };
  status_change?: {
    old: string;
    new: string;
  };
  email?: {
    old: string[];
    new: string[];
  } | string[];
  author_name?: {
    old: string;
    new: string;
  } | string;
  subject?: {
    old: string;
    new: string;
  } | string;
  description?: {
    old: string;
    new: string;
  } | string;
  percent_done?: {
    old: string;
    new: string;
  } | string;
  assignee_update_message?: {
    old: string | null;
    new: string | null;
  } | string | null;
}

export interface TicketLogState {
  project_id?: string;
  author_name?: string;
  email?: string[];
  project?: string;
  tracker?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  category?: string;
  start_date?: string;
  due_date?: string;
  estimate_time?: number;
  percent_done?: string;
  ticket_id?: string;
  created_at?: string;
  _id?: string;
  // Additional fields from new API response
  email_flag?: boolean;
  meta?: Record<string, any>;
  assignee_update_message?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface TicketLogData {
  project_id?: string;
  _id: string;
  ticket_id: string;
  action_by: string;
  action_type: string;
  action_description?: string;
  timestamp: string;
  details: TicketLogDetails;
  previous_state: TicketLogState | null;
  new_state: TicketLogState;
}

export interface TicketLogResponse {
  message: string;
  result: TicketLogData[];
  status: string;
}

// API endpoints
const TICKET_API_BASE = `${process.env.NEXT_PUBLIC_TICKET_SYSTEM}v1/support_system/support_system`;

// Helper to generate queryKey from dependencies
const generateQueryKey = (baseKey: string, ...dependencies: any[]): string[] => {
  return [
    baseKey,
    ...dependencies.map((dep) => {
      if (dep === null || dep === undefined) return "";
      if (typeof dep === "object") return JSON.stringify(dep);
      return String(dep);
    }),
  ];
};

// Create ticket API hook
export const useCreateTicket = (payload?: CreateTicketRequest, enabled: boolean = false) => {
  return useApi<CreateTicketResponse>(
    `${TICKET_API_BASE}/create_tickets`,
    "POST",
    payload,
    {
      queryKey: generateQueryKey("create-ticket", payload),
      enabled,
    }
  );
};

// Get tickets API hook with pagination
export const useGetTickets = (
  payload?: {
    page_number?: number;
    record_limit?: number;
    project?: string;
    sub_projects_of?: string;
    ticket_tracker?: string;
  },
  enabled: boolean = false
) => {
  return useApi<TicketsResponse>(
    `${TICKET_API_BASE}/tickets`,
    "POST",
    payload,
    {
      queryKey: generateQueryKey(
        "tickets",
        payload?.page_number,
        payload?.record_limit,
        payload?.project,
        payload?.sub_projects_of,
        payload?.ticket_tracker
      ),
      enabled,
    }
  );
};

// Update ticket API hook
export const useUpdateTicket = (
  ticketId?: string,
  payload?: CreateTicketRequest,
  enabled: boolean = false
) => {
  const url = ticketId ? `${TICKET_API_BASE}/tickets/${ticketId}` : `${TICKET_API_BASE}/tickets/`;
  return useApi<CreateTicketResponse>(
    url,
    "PUT",
    payload,
    {
      queryKey: generateQueryKey("update-ticket", ticketId, payload),
      enabled,
    }
  );
};

// Delete ticket API hook (for future use)
export const useDeleteTicket = (ticketId?: string, enabled: boolean = false) => {
  return useApi<{ message: string; status: string }>(
    `${TICKET_API_BASE}/delete_ticket`,
    "DELETE",
    ticketId ? { ticket_id: ticketId } : undefined,
    {
      queryKey: generateQueryKey("delete-ticket", ticketId),
      enabled,
    }
  );
};

// Get ticket log API hook
export const useGetTicketLog = (ticketId?: string, enabled: boolean = true) => {
  const url = ticketId ? `${TICKET_API_BASE}/ticket_log/${ticketId}` : "";
  
  if (!ticketId || !url) {
    return useApi<TicketLogResponse>(
      "",
      "GET",
      undefined,
      {
        queryKey: generateQueryKey("ticket-log", ""),
        enabled: false,
      }
    );
  }

  return useApi<TicketLogResponse>(
    url,
    "GET",
    undefined,
    {
      queryKey: generateQueryKey("ticket-log", ticketId),
      enabled: enabled && !!ticketId,
    }
  );
};

// package api
export const useFetchProjects = (
  payload?: { product_name?: string },
  enabled: boolean = false
) => {
  return useApi<string[]>(
    `${process.env.NEXT_PUBLIC_PRODUCT}access_control/user_packages`,
    "POST",
    payload,
    {
      queryKey: generateQueryKey("fetch-projects", payload?.product_name),
      enabled,
    }
  );
};

// Fetch users API hook
export const useFetchUsers = (enabled: boolean = true) => {
  return useApi<UsersResponse>(
    `${process.env.NEXT_PUBLIC_TICKET_SYSTEM}v1/support_system/support_system/users`,
    "GET",
    undefined,
    {
      queryKey: generateQueryKey("fetch-users"),
      enabled,
    }
  );
};

// Ticket overview API hook
export const useTicketOverview = (
  payload?: {
    project?: string;
    ticket_tracker?: string;
    project_id?: string;
  },
  enabled: boolean = false
) => {
  return useApi(
    `${process.env.NEXT_PUBLIC_TICKET_SYSTEM}v1/support_system/support_system/tickets/ticket_overview`,
    "POST",
    payload,
    {
      queryKey: generateQueryKey(
        "ticket-overview",
        payload?.project,
        payload?.ticket_tracker,
        payload?.project_id
      ),
      enabled,
    }
  );
};

// Presigned upload (file) API hook
export interface PresignedUploadResponse {
  upload_url?: string;
  url?: string;
  key?: string;
  message?: string;
  status?: string;
  [key: string]: any;
}

export const useGetPresignedUpload = (
  payload?: { filename?: string; content_type?: string },
  enabled: boolean = false
) => {
  return useApi<PresignedUploadResponse>(
    `${TICKET_API_BASE}/presigned_upload`,
    "POST",
    payload,
    {
      queryKey: generateQueryKey("presigned-upload", payload?.filename, payload?.content_type),
      enabled,
    }
  );
};

// Status listing API types
export interface StatusOption {
  value: string;
  label: string;
}

export interface StatusListingResponse {
  message: string;
  status: string;
  result: {
    _id: string;
    priority_list: string[];
    category_list: string[];
    tracker_list: string[];
    assignee_list: string[];
    status_list: string[];
    project_list: string[];
    users_list: string[];
  };
}

// Fetch status options API hook
export const useFetchStatusOptions = (enabled: boolean = true) => {
  return useApi<StatusListingResponse>(
    `${process.env.NEXT_PUBLIC_TICKET_SYSTEM}v1/support_system/support_system/listing`,
    "GET",
    undefined,
    {
      queryKey: generateQueryKey("fetch-status-options"),
      enabled,
    }
  );
};





 