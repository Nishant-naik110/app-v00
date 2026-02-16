// ============================================================================
// Form Types
// ============================================================================

export interface CreateTicketForm {
  project: string;
  tracker: string;
  subject: string;
  description: string;
  status:
    | "new"
    | "open"
    | "in_progress"
    | "resolved"
    | "closed"
    | "cancelled"
    | "draft";
  priority: "Low" | "Normal" | "Medium" | "High" | "Urgent" | "Immediate";
  assignee: string;
  category: string;
  start_date: string;
  due_date: string;
  estimate_time: number;
  percent_done: string;
  file_path: string;
  file_url: string;
}

export interface CreateTicketFormErrors {
  project?: string;
  tracker?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  due_date?: string;
  estimate_time?: string;
  percent_done?: string;
  file_path?: string;
}

export interface EditTicketFormErrors {
  project?: string;
  tracker?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  due_date?: string;
  estimate_time?: string;
  percent_done?: string;
  file_path?: string;
}

// ============================================================================
// Common Type Definitions
// ============================================================================

export type TicketStatus = 
  | "new"
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "cancelled"
  | "draft";

export type Priority = 
  | "Low"
  | "Normal"
  | "Medium"
  | "High"
  | "Urgent"
  | "Immediate";

export type Tracker = "Bug" | "Feature" | "Support";

// ============================================================================
// API Request/Response Types (from useTicket.ts)
// ============================================================================

export interface CreateTicketRequest {
  project_id?: string;
  project: string;
  tracker: string;
  subject: string;
  email?: string[];
  author_name?: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
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

export interface CreateTicketResponse {
  ticket_id: string;
  message: string;
  status: string;
}

export interface TicketData {
  _id: string;
  author_name: string;
  email: string[];
  email_flag: boolean;
  project: string;
  tracker: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
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

// ============================================================================
// User Types
// ============================================================================

export interface User {
  email: string;
  name: string;
}

export interface UsersResponse {
  message: string;
  status: string;
  data: User[];
}

// ============================================================================
// Ticket Log Types
// ============================================================================

export interface TicketLogDetails {
  title?: string;
  priority?: string;
  category?: string;
  assignee?: string;
  tracker?: string;
  status?: string;
  description?: string | { old?: string; new?: string };
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
  percent_done?: {
    old: string;
    new: string;
  } | string;
  assignee_update_message?: {
    old: string | null;
    new: string | null;
  } | string | null;
  priority_change?: {
    old: string;
    new: string;
  };
  [key: string]: any;
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

// ============================================================================
// Status Options
// ============================================================================

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

// ============================================================================
// Presigned Upload Types
// ============================================================================

export interface PresignedUploadRequest {
  filename: string;
  content_type: string;
}

export interface PresignedUploadResponse {
  upload_url?: string;
  url?: string;
  key?: string;
  message?: string;
  status?: string;
  file_path?: string;
  file_url?: string;
  content_type?: string;
  [key: string]: any;
}

// ============================================================================
// Ticket Type (for UI/Table display)
// ============================================================================

export interface Ticket {
  id: string;
  title: string;
  description: string;
  environment: string;
  project: string;
  status: TicketStatus;
  priority: Priority;
  author_name: string;
  caller: string;
  assignee?: string;
  lastUpdated: string;
  createdAt: string;
  eta: string;
  diagnosis: string;
  attachments: number;
  tags: string[];
  percent_done: string;
  start_date?: string;
  due_date?: string;
  comments: any[];
  activityHistory: Array<{
    id: string;
    type: "ticket_created" | "ticket_updated" | "comment_added" | "status_changed" | "assignee_changed";
    description: string;
    author: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
}

