"use client";
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import ResizableTable from "@/components/mf/ReportingToolTable";
import type { Ticket } from "./types";
import ToastContent, { ToastType } from "@/components/mf/ToastContent";
import { usePackage } from "@/components/mf/PackageContext";

// Hooks (API calls only)
import {
  useCreateTicket,
  useUpdateTicket,
  useGetTicketLog,
  useFetchProjects,
  useGetTickets,
  useFetchUsers,
  useFetchStatusOptions,
  useTicketOverview,
} from "./hooks/useTicket";
import type {
  User,
  StatusOption,
  StatusListingResponse,
  TicketData,
  TicketsResponse,
  TicketLogData,
  CreateTicketForm,
  CreateTicketRequest,
} from "./types";
import type {
  UsersResponse,
  CreateTicketResponse,
  TicketLogResponse,
} from "./hooks/useTicket";

// Components
import CreateTicketModal from "./components/CreateTicketModal";
import EditTicketModal from "./components/EditTicketModal";
import { ViewTicketModal } from "./components/ViewTicketModal";
import { TicketStatsCards } from "./components/TicketStatsCards";
import { TicketingTableSkeleton } from "@/components/mf/charts/ChartSkeletons";

// Utils
import { getTicketTableColumns } from "./utils/tableColumns";
import { useTicketStats } from "./utils/stats";
import { getInitialCreateForm, mapPriorityToFormValue } from "./utils/helpers";
import { validateCreateForm, validateEditForm } from "./utils/validation";
import {
  DEFAULT_CATEGORY,
  DEFAULT_SUB_PROJECTS_OF,
  DEFAULT_TICKET_TRACKER,
  TICKET_API_BASE,
} from "./utils/constants";

const TicketingDashboard = () => {
  const { selectedPackage } = usePackage();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Ticket overview state
  const [ticketOverview, setTicketOverview] = useState<any>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Fetch projects from API
  const [projectsPayload, setProjectsPayload] = useState<
    { product_name?: string } | undefined
  >(undefined);
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    isFetching: isFetchingProjects,
    refetch: refetchProjects,
    error: projectsError,
  } = useFetchProjects(projectsPayload, !!projectsPayload);
  const [projects, setProjects] = useState<string[]>([]);
  const hasCalledApi = useRef(false);

  // Fetch tickets from API - use state to manage payload so it triggers refetch
  const [ticketsPayload, setTicketsPayload] = useState<
    | {
        page_number?: number;
        record_limit?: number;
        project?: string;
        sub_projects_of?: string;
        ticket_tracker?: string;
      }
    | undefined
  >(undefined);
  const {
    data: ticketsData,
    isLoading: isLoadingTicketsApi,
    isFetching: isFetchingTickets,
    refetch: refetchTicketsApi,
    error: ticketsError,
  } = useGetTickets(ticketsPayload, !!ticketsPayload && !!selectedPackage);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isLoadingTickets =
    isInitialLoading || isLoadingTicketsApi || isFetchingTickets;

  // Fetch users from API
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    refetch: refetchUsers,
    error: usersError,
  } = useFetchUsers(true);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch status options from API
  const {
    data: statusApi,
    isLoading: isLoadingStatus,
    isFetching: isFetchingStatus,
    refetch: refetchStatus,
    error: statusError,
  } = useFetchStatusOptions(true);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);

  // Ticket overview API - use state to manage payload
  const [overviewPayload, setOverviewPayload] = useState<
    | {
        project?: string;
        ticket_tracker?: string;
        project_id?: string;
      }
    | undefined
  >(undefined);
  const {
    data: overviewData,
    isLoading: isLoadingOverviewApi,
    isFetching: isFetchingOverview,
    refetch: refetchOverviewApi,
    error: overviewError,
  } = useTicketOverview(overviewPayload, !!overviewPayload && !!selectedPackage);

  // Transform API ticket data to Ticket type
  const transformTicketData = useCallback((apiTicket: TicketData): Ticket => {
    return {
      id: apiTicket.ticket_id,
      title: apiTicket.subject,
      description: apiTicket.description,
      environment: `${apiTicket.project} / ${apiTicket.category}`,
      project: apiTicket.project,
      status: apiTicket.status,
      priority: apiTicket.priority,
      author_name: apiTicket.author_name,
      caller: apiTicket.author_name,
      assignee: apiTicket.assignee,
      lastUpdated: new Date(apiTicket.created_at).toLocaleString(),
      createdAt: new Date(apiTicket.created_at).toLocaleString(),
      eta:
        !apiTicket.estimate_time ||
        apiTicket.estimate_time === 0 ||
        String(apiTicket.estimate_time) === "NA"
          ? "NA"
          : `${apiTicket.estimate_time} hours`,
      diagnosis: `${apiTicket.percent_done} complete`,
      attachments: 0,
      tags: [],
      percent_done: apiTicket.percent_done,
      start_date: apiTicket.start_date,
      due_date: apiTicket.due_date,
      comments: [],
      activityHistory: [
        {
          id: Date.now().toString(),
          type: "ticket_created" as const,
          description: `Ticket created by ${apiTicket.author_name}`,
          author: apiTicket.author_name,
          timestamp: new Date(apiTicket.created_at).toLocaleString(),
          metadata: {
            project: apiTicket.project,
            tracker: apiTicket.tracker,
            category: apiTicket.category,
          },
        },
      ],
    };
  }, []);

  // Refetch tickets
  const refetchTickets = useCallback(async () => {
    if (selectedPackage) {
      setTicketsPayload({
        page_number: currentPage,
        record_limit: itemsPerPage,
        project: selectedPackage,
        sub_projects_of: DEFAULT_SUB_PROJECTS_OF,
        ticket_tracker: DEFAULT_TICKET_TRACKER,
      });
      await refetchTicketsApi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, selectedPackage, refetchTicketsApi]);

  // Refetch ticket overview
  const refetchTicketOverview = useCallback(async () => {
    if (selectedPackage) {
      setOverviewPayload({
        project: selectedPackage,
        ticket_tracker: DEFAULT_TICKET_TRACKER,
        project_id: "App_Performance" + "_" + selectedPackage,
      });
      await refetchOverviewApi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackage, refetchOverviewApi]);

  // Fetch projects on mount
  useEffect(() => {
    if (!hasCalledApi.current) {
      hasCalledApi.current = true;
      setProjectsPayload({ product_name: "App Performance" });
    }
  }, []);

  // Handle projects API response
  useEffect(() => {
    if (projectsData) {
      let projectNames: string[] = [];
      const data = projectsData;
      if (Array.isArray(data)) {
        projectNames = data
          .map((item: any) => {
            if (typeof item === "string") {
              return item;
            } else if (item && typeof item === "object" && item.PackageName) {
              return item.PackageName;
            }
            return null;
          })
          .filter(Boolean);
      }
      setProjects(projectNames);
    }
    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
    }
  }, [projectsData, projectsError]);

  // Fetch tickets when pagination or package changes
  useEffect(() => {
    if (selectedPackage) {
      setIsInitialLoading(false);
      setTicketsPayload({
        page_number: currentPage,
        record_limit: itemsPerPage,
        project: selectedPackage,
        sub_projects_of: DEFAULT_SUB_PROJECTS_OF,
        ticket_tracker: DEFAULT_TICKET_TRACKER,
      });
    } else {
      setIsInitialLoading(true);
      setTicketsPayload(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, selectedPackage]);

  // Handle tickets API response
  useEffect(() => {
    if (ticketsData) {
      const response = ticketsData as TicketsResponse;
      const ticketsDataArray = response.result?.data || [];
      const transformedTickets = ticketsDataArray.map(transformTicketData);
      setTickets(transformedTickets);
      setTotalRecords(response.result?.total_records || 0);
      setTotalPages(response.result?.total_pages || 1);
    }
    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
    }
  }, [ticketsData, ticketsError, transformTicketData]);

  // Fetch ticket overview
  useEffect(() => {
    if (selectedPackage) {
      setIsLoadingOverview(true);
      setOverviewPayload({
        project: selectedPackage,
        ticket_tracker: DEFAULT_TICKET_TRACKER,
        project_id: "App_Performance" + "_" + selectedPackage,
      });
    } else {
      setOverviewPayload(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackage]);

  // Handle ticket overview API response
  useEffect(() => {
    if (overviewData && overviewData.result) {
      setTicketOverview(overviewData.result);
    }
    setIsLoadingOverview(isLoadingOverviewApi || isFetchingOverview);
    if (overviewError) {
      console.error("Error fetching ticket overview:", overviewError);
    }
  }, [overviewData, overviewError, isLoadingOverviewApi, isFetchingOverview]);

  // Handle users API response
  const previousUsersData = useRef<any>(null);
  useEffect(() => {
    if (usersData) {
      const response = usersData as UsersResponse;
      const usersDataArray = response.data || [];
      // Only update if data actually changed
      if (
        JSON.stringify(previousUsersData.current) !==
        JSON.stringify(usersDataArray)
      ) {
        setUsers(usersDataArray);
        previousUsersData.current = usersDataArray;
      }
    }
    if (usersError) {
      console.error("Error fetching users:", usersError);
    }
  }, [usersData, usersError]);

  // Handle status API response
  const previousStatusData = useRef<any>(null);
  useEffect(() => {
    if (statusApi) {
      const response = statusApi as StatusListingResponse;
      const statusList = response.result?.status_list || [];

      const transformedStatusOptions: StatusOption[] = statusList.map(
        (status) => ({
          value: status,
          label: status.charAt(0).toUpperCase() + status.slice(1),
        })
      );

      // Only update if data actually changed
      if (
        JSON.stringify(previousStatusData.current) !==
        JSON.stringify(transformedStatusOptions)
      ) {
        setStatusOptions(transformedStatusOptions);
        previousStatusData.current = transformedStatusOptions;
      }
    } else if (statusError && !previousStatusData.current) {
      const fallbackStatusOptions: StatusOption[] = [
        { value: "new", label: "New" },
        { value: "open", label: "Open" },
        { value: "in progress", label: "In progress" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
        { value: "cancelled", label: "Cancelled" },
      ];
      setStatusOptions(fallbackStatusOptions);
      previousStatusData.current = fallbackStatusOptions;
    }
  }, [statusApi, statusError]);

  // Toast state
  const [toastData, setToastData] = useState<{
    type: ToastType;
    title: string;
    description?: string;
    variant?: "default" | "destructive" | null;
  } | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Ticket selection state
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [isLoadingTicketById, setIsLoadingTicketById] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [selectedTicketLogs, setSelectedTicketLogs] = useState<TicketLogData[]>(
    []
  );
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Form state
  const [createForm, setCreateForm] = useState<CreateTicketForm>(
    getInitialCreateForm()
  );
  const [editForm, setEditForm] = useState<CreateTicketForm>(
    getInitialCreateForm()
  );
  const [createFormErrors, setCreateFormErrors] = useState<any>({});
  const [editFormErrors, setEditFormErrors] = useState<any>({});

  // API hooks - use state to manage payloads for mutations
  const [createTicketPayload, setCreateTicketPayload] = useState<
    CreateTicketRequest | undefined
  >(undefined);
  const [createTicketEnabled, setCreateTicketEnabled] = useState(false);
  const {
    data: createTicketData,
    isLoading: isCreatingTicket,
    isFetching: isFetchingCreateTicket,
    refetch: refetchCreateTicket,
    error: createTicketError,
  } = useCreateTicket(createTicketPayload, createTicketEnabled);

  const [updateTicketPayload, setUpdateTicketPayload] = useState<
    CreateTicketRequest | undefined
  >(undefined);
  const [updateTicketEnabled, setUpdateTicketEnabled] = useState(false);
  const {
    data: updateTicketData,
    isLoading: isUpdatingTicket,
    isFetching: isFetchingUpdateTicket,
    refetch: refetchUpdateTicket,
    error: updateTicketError,
  } = useUpdateTicket(editingTicketId || "", updateTicketPayload, updateTicketEnabled);

  const {
    data: ticketLogData,
    isLoading: isLoadingTicketLog,
    isFetching: isFetchingTicketLog,
    refetch: refetchTicketLog,
    error: ticketLogError,
  } = useGetTicketLog(currentTicketId || undefined);

  // Helper functions
  const findUserDisplayName = useCallback(
    (email: string) => {
      if (!email) return undefined;
      const user = users.find((u) => u.email === email);
      return user ? user.name || user.email : email;
    },
    [users]
  );

  // Handle create ticket
  const handleCreateTicket = useCallback(async () => {
    const errors = validateCreateForm(createForm);
    if (Object.keys(errors).length > 0) {
      setCreateFormErrors(errors);
      return;
    }

    const ticketPayload: CreateTicketRequest = {
      project: createForm.project,
      tracker: createForm.tracker,
      subject: createForm.subject,
      description: createForm.description,
      status: createForm.status,
      priority: createForm.priority,
      category: createForm.category || DEFAULT_CATEGORY,
      start_date: createForm.start_date,
      due_date: createForm.due_date,
      estimate_time: createForm.estimate_time,
      percent_done: createForm.percent_done,
      sub_projects_of: DEFAULT_SUB_PROJECTS_OF,
      ticket_tracker: DEFAULT_TICKET_TRACKER,
      file_path: createForm.file_path,
      file_url: createForm.file_url,
    };

    try {
      setCreateTicketPayload(ticketPayload);
      setCreateTicketEnabled(true);
    } catch (error: any) {
      setToastData({
        type: "error",
        title: error?.response?.data?.title || "Error",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create ticket. Please try again.",
        variant: "default",
      });
    }
  }, [createForm, users, findUserDisplayName]);

  // Handle create ticket response
  useEffect(() => {
    if (createTicketData && createTicketEnabled && !isCreatingTicket) {
      const response = createTicketData as CreateTicketResponse;

      const newTicket: Ticket = {
        id: response.ticket_id,
        title: createForm.subject,
        description: createForm.description,
        environment: `${createForm.project} / ${createForm.category}`,
        project: createForm.project,
        status: createForm.status,
        priority: createForm.priority,
        author_name: "Current User",
        caller: "Current User",
        assignee: findUserDisplayName(createForm.assignee),
        lastUpdated: new Date().toLocaleString(),
        createdAt: new Date().toLocaleString(),
        eta: `${createForm.estimate_time} hours`,
        diagnosis: `${createForm.percent_done} complete`,
        attachments: 0,
        tags: [],
        percent_done: createForm.percent_done,
        comments: [],
        activityHistory: [
          {
            id: Date.now().toString(),
            type: "ticket_created",
            description: "Ticket created",
            author: "Current User",
            timestamp: new Date().toLocaleString(),
            metadata: {
              project: createForm.project,
              tracker: createForm.tracker,
              category: createForm.category,
            },
          },
        ],
      };

      setTickets((prev) => [newTicket, ...prev]);
      setCreateForm(getInitialCreateForm());
      setIsCreateModalOpen(false);
      setCreateTicketEnabled(false);
      setCreateTicketPayload(undefined);

      setToastData({
        type: "success",
        title: "Success",
        description: response.message || "Ticket created successfully!",
        variant: "default",
      });

      refetchTickets();
      refetchTicketOverview();
    } else if (createTicketError && createTicketEnabled) {
      setToastData({
        type: "error",
        title: "Error",
        description:
          createTicketError?.message ||
          "Failed to create ticket. Please try again.",
        variant: "default",
      });
      setCreateTicketEnabled(false);
      setCreateTicketPayload(undefined);
    }
  }, [
    createTicketData,
    createTicketError,
    isCreatingTicket,
    createTicketEnabled,
    createForm,
    findUserDisplayName,
    refetchTickets,
    refetchTicketOverview,
  ]);

  // Handle update ticket
  const handleUpdateTicket = useCallback(async () => {
    if (!editingTicket) return;

    const errors = validateEditForm(editForm);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    const getProjectIdFromLogs = () => {
      if (selectedTicketLogs && selectedTicketLogs.length > 0) {
        const creationLog = selectedTicketLogs.find(
          (log) => log.action_type === "Ticket Created"
        );
        if (creationLog?.new_state?.project_id) {
          return creationLog.new_state.project_id;
        }
        for (const log of selectedTicketLogs) {
          if (log.new_state?.project_id) {
            return log.new_state.project_id;
          }
        }
      }
      return "NA";
    };

    const ticketPayload: CreateTicketRequest = {
      project: editForm.project,
      tracker: editForm.tracker,
      subject: editForm.subject,
      description: editForm.description,
      status: editForm.status,
      priority: editForm.priority,
      category: editForm.category || DEFAULT_CATEGORY,
      start_date: editForm.start_date,
      due_date: editForm.due_date,
      estimate_time: editForm.estimate_time,
      percent_done: editForm.percent_done,
      sub_projects_of: DEFAULT_SUB_PROJECTS_OF,
      project_id: getProjectIdFromLogs(),
      file_path: editForm.file_path,
      file_url: editForm.file_url,
    };

    try {
      setUpdateTicketPayload(ticketPayload);
      setUpdateTicketEnabled(true);
    } catch (error: any) {
      setToastData({
        type: "error",
        title: error?.response?.data?.title || "Error",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    }
  }, [editingTicket, editForm, users, findUserDisplayName, selectedTicketLogs]);

  // Handle update ticket response
  useEffect(() => {
    if (updateTicketData && updateTicketEnabled && !isUpdatingTicket) {
      const response = updateTicketData as CreateTicketResponse;

      setTickets((prev) => {
        return prev.map((ticket) =>
          ticket.id === editingTicket?.id
            ? {
                ...ticket,
                title: editForm.subject,
                description: editForm.description,
                status: editForm.status,
                priority: editForm.priority,
                assignee: findUserDisplayName(editForm.assignee),
                lastUpdated: new Date().toLocaleString(),
                percent_done: editForm.percent_done,
                due_date: editForm.due_date,
                eta:
                  editForm.estimate_time > 0
                    ? `${editForm.estimate_time} hours`
                    : "NA",
              }
            : ticket
        );
      });

      setEditForm(getInitialCreateForm());
      setEditingTicket(null);
      setIsEditModalOpen(false);
      setCurrentTicketId(null);
      setUpdateTicketEnabled(false);
      setUpdateTicketPayload(undefined);

      setToastData({
        type: "success",
        title: "Success",
        description:
          response.message ||
          `Ticket "${editForm.subject}" updated successfully!`,
        variant: "default",
      });

      refetchTickets();
      refetchTicketOverview();
    } else if (updateTicketError && updateTicketEnabled) {
      setToastData({
        type: "error",
        title: "Error",
        description:
          updateTicketError?.message ||
          "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
      setUpdateTicketEnabled(false);
      setUpdateTicketPayload(undefined);
    }
  }, [
    updateTicketData,
    updateTicketError,
    isUpdatingTicket,
    updateTicketEnabled,
    editingTicket,
    editForm,
    findUserDisplayName,
    refetchTickets,
    refetchTicketOverview,
  ]);

  // Handle edit ticket
  const handleEditTicket = useCallback(
    async (ticket: Ticket) => {
      setEditingTicket(ticket);
      setEditingTicketId(ticket.id);

      const findUserEmail = (displayName: string | undefined) => {
        if (!displayName) return "unassigned";
        const user = users.find(
          (u) => u.name === displayName || u.email === displayName
        );
        return user ? user.email : "unassigned";
      };

      const initialFormData: CreateTicketForm = {
        project: "Identity Scan",
        tracker: "Bug",
        subject: ticket.title,
        description: "",
        status: ticket.status,
        priority: ticket.priority
          ? mapPriorityToFormValue(ticket.priority)
          : "Normal",
        assignee: findUserEmail(ticket.assignee),
        category: DEFAULT_CATEGORY,
        start_date: new Date().toISOString().slice(0, 16),
        due_date: "",
        estimate_time: 0,
        percent_done: "0%",
        file_path: "",
        file_url: "",
      };

      setEditForm(initialFormData);
      setIsEditModalOpen(true);

      // Fetch ticket logs for activity history
      try {
        setCurrentTicketId(null);
        await new Promise((resolve) => setTimeout(resolve, 100));
        setCurrentTicketId(ticket.id);
        await new Promise((resolve) => setTimeout(resolve, 200));

        const result = await refetchTicketLog();
        if (result.data) {
          const logData = (result.data as TicketLogResponse).result || [];
          setSelectedTicketLogs(logData);
        }
      } catch (error: any) {
        console.error("Error fetching ticket log:", error);
        setSelectedTicketLogs([]);
      }
    },
    [users, refetchTicketLog]
  );

  // Handle view ticket
  const openingViewRef = useRef(false);
  const [isOpeningView, setIsOpeningView] = useState(false);
  const handleViewTicket = useCallback(
    async (ticket: Ticket) => {
      if (openingViewRef.current || isOpeningView || isViewModalOpen) return;
      openingViewRef.current = true;
      setIsOpeningView(true);

      const latestTicket = tickets.find((t) => t.id === ticket.id) || ticket;
      setSelectedTicket(latestTicket);

      try {
        setCurrentTicketId(null);
        await new Promise((resolve) => setTimeout(resolve, 100));
        setCurrentTicketId(ticket.id);
        await new Promise((resolve) => setTimeout(resolve, 200));

        const result = await refetchTicketLog();
        if (result.data) {
          const logData = (result.data as TicketLogResponse).result || [];
          setSelectedTicketLogs(logData);
        }

        setIsViewModalOpen(true);
      } catch (error: any) {
        setToastData({
          type: "error",
          title: "Error",
          description: "Failed to fetch ticket activity. Please try again.",
          variant: "default",
        });
        setSelectedTicketLogs([]);
        setIsViewModalOpen(true);
      } finally {
        setIsOpeningView(false);
        setTimeout(() => {
          openingViewRef.current = false;
        }, 300);
      }
    },
    [refetchTicketLog, tickets, isViewModalOpen]
  );

  // Close view modal handler
  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedTicket(null);
    setCurrentTicketId(null);
    setSelectedTicketLogs([]);
    openingViewRef.current = false;
    setIsOpeningView(false);
  }, []);

  // Close edit modal handler
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setCurrentTicketId(null);
    setEditingTicket(null);
    setEditingTicketId(null);
    setSelectedTicketLogs([]);
  }, []);

  // Fetch ticket data when editingTicketId changes
  useEffect(() => {
    if (editingTicketId) {
      setIsLoadingTicketById(true);
      const fetchTicketData = async () => {
        try {
          const token = localStorage.getItem("IDToken") || "";
          const url = `${TICKET_API_BASE}/tickets/${editingTicketId}`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const ticketData = await response.json();
          const actualTicketData = ticketData.result || ticketData;

          const findUserEmail = (displayName: string | undefined) => {
            if (!displayName) return "unassigned";
            const user = users.find(
              (u) => u.name === displayName || u.email === displayName
            );
            return user ? user.email : "unassigned";
          };

          setEditForm({
            project: actualTicketData.project || "Identity Scan",
            tracker: actualTicketData.tracker || "Bug",
            subject: actualTicketData.subject || "",
            description: "",
            status: actualTicketData.status || "new",
            priority: actualTicketData.priority
              ? (mapPriorityToFormValue(actualTicketData.priority) as any)
              : "Normal",
            assignee: actualTicketData.assignee || "",
            category: actualTicketData.category || DEFAULT_CATEGORY,
            start_date: actualTicketData.start_date
              ? actualTicketData.start_date.substring(0, 16)
              : "",
            due_date: actualTicketData.due_date
              ? actualTicketData.due_date.split("T")[0]
              : "",
            estimate_time: actualTicketData.estimate_time || 0,
            percent_done: actualTicketData.percent_done
              ? actualTicketData.percent_done.includes("%")
                ? actualTicketData.percent_done
                : `${actualTicketData.percent_done}%`
              : "0%",
            file_path: actualTicketData.file_path || "",
            file_url: actualTicketData.file_url || "",
          });
        } catch (error) {
          if (editingTicket) {
            const findUserEmail = (displayName: string | undefined) => {
              if (!displayName) return "unassigned";
              const user = users.find(
                (u) => u.name === displayName || u.email === displayName
              );
              return user ? user.email : "unassigned";
            };

            setEditForm({
              project: editingTicket.project,
              tracker: "Bug",
              subject: editingTicket.title,
              description: "",
              status: editingTicket.status,
              priority: editingTicket.priority
                ? (mapPriorityToFormValue(editingTicket.priority) as any)
                : "Normal",
              assignee: findUserEmail(editingTicket.assignee),
              category: DEFAULT_CATEGORY,
              start_date: new Date().toISOString().slice(0, 16),
              due_date: editingTicket.due_date
                ? editingTicket.due_date.split("T")[0]
                : "",
              estimate_time: 0,
              percent_done: "0%",
              file_path: "",
              file_url: "",
            });
          }
        } finally {
          setIsLoadingTicketById(false);
        }
      };

      fetchTicketData();
    }
  }, [editingTicketId, users, editingTicket]);

  // Handle ticket log data
  const previousTicketLogData = useRef<any>(null);
  useEffect(() => {
    if (ticketLogData && currentTicketId) {
      const logData = (ticketLogData as TicketLogResponse).result || [];
      // Only update if data actually changed
      if (
        JSON.stringify(previousTicketLogData.current) !==
        JSON.stringify(logData)
      ) {
        setSelectedTicketLogs(logData);
        previousTicketLogData.current = logData;
      }
    } else if (
      ticketLogError &&
      currentTicketId &&
      previousTicketLogData.current !== null
    ) {
      setSelectedTicketLogs([]);
      previousTicketLogData.current = null;
      console.error("Error fetching ticket log:", ticketLogError);
    }
  }, [ticketLogData, ticketLogError, currentTicketId]);

  // Stats
  const stats = useTicketStats(tickets, ticketOverview);

  // Table columns
  const columns = useMemo(() => getTicketTableColumns(), []);

  // Error handling effects
  useEffect(() => {
    if (toastData) {
      const timer = setTimeout(() => {
        setToastData(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastData]);

  // Set default assignee when users load (only once)
  const hasSetDefaultAssignee = useRef(false);
  useEffect(() => {
    if (users?.length > 0 && !hasSetDefaultAssignee.current) {
      const firstUser = users[0];
      const assigneeEmail =
        typeof firstUser === "string" ? firstUser : firstUser?.email;
      if (assigneeEmail) {
        setCreateForm((prev) => {
          if (!prev.assignee) {
            hasSetDefaultAssignee.current = true;
            return { ...prev, assignee: assigneeEmail };
          }
          return prev;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  // Set default project when projects load (only once)
  const hasSetDefaultProject = useRef(false);
  useEffect(() => {
    if (projects?.length > 0 && !hasSetDefaultProject.current) {
      const firstProject = projects[0];
      if (typeof firstProject === "string") {
        setCreateForm((prev) => {
          if (!prev.project) {
            hasSetDefaultProject.current = true;
            return { ...prev, project: firstProject };
          }
          return prev;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return (
      tickets?.filter((ticket) => {
        const matchesSearch =
          ticket?.title
            ?.toLowerCase()
            .includes(searchTerm?.toLowerCase() || "") ||
          ticket?.id?.toLowerCase().includes(searchTerm?.toLowerCase() || "") ||
          ticket?.caller
            ?.toLowerCase()
            .includes(searchTerm?.toLowerCase() || "") ||
          ticket?.author_name
            ?.toLowerCase()
            .includes(searchTerm?.toLowerCase() || "") ||
          ticket?.description
            ?.toLowerCase()
            .includes(searchTerm?.toLowerCase() || "");

        const matchesStatus =
          filterStatus === "all" || ticket?.status === filterStatus;
        const matchesPriority =
          filterPriority === "all" || ticket?.priority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
      }) || []
    );
  }, [tickets, searchTerm, filterStatus, filterPriority]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  // Clear validation errors
  const clearCreateFormErrors = () => {
    setCreateFormErrors({});
  };

  const clearEditFormErrors = () => {
    setEditFormErrors({});
  };

  // Prepare filter items for table component
  const statusFilterItems = useMemo(() => {
    const items = [{ title: "All Status", value: "all" }];
    if (statusOptions.length > 0) {
      statusOptions.forEach((option) => {
        items.push({ title: option.label, value: option.value });
      });
    } else {
      // Fallback options
      items.push(
        { title: "New", value: "new" },
        { title: "Open", value: "open" },
        { title: "In Progress", value: "in progress" },
        { title: "Resolved", value: "resolved" },
        { title: "Closed", value: "closed" },
        { title: "Cancelled", value: "cancelled" }
      );
    }
    return items;
  }, [statusOptions]);

  const priorityFilterItems = useMemo(
    () => [
      { title: "All Priority", value: "all" },
      { title: "Low", value: "Low" },
      { title: "Normal", value: "Normal" },
      { title: "Medium", value: "Medium" },
      { title: "High", value: "High" },
      { title: "Urgent", value: "Urgent" },
      { title: "Immediate", value: "Immediate" },
    ],
    []
  );

  return (
    <div className=" bg-gray-50 dark:bg-gray-900 p-2 mt-2 rounded-lg">
      {toastData && (
        <ToastContent
          type={toastData.type}
          title={toastData.title}
          description={toastData.description}
          variant={toastData.variant}
        />
      )}


      {/* Summary Section */}
      <TicketStatsCards stats={stats} isLoadingOverview={isLoadingOverview} />

      {/* Professional Ticketing Table */}
      {isLoadingTickets ? (
        <TicketingTableSkeleton />
      ) : (
        <ResizableTable
          data={filteredTickets}
          columns={columns}
          isLoading={isLoadingTickets}
          isView={true}
          isEdit={true}
          onView={handleViewTicket}
          onEdit={handleEditTicket}
          isSearchable={true}
          onSearch={setSearchTerm}
          onStatusFilter={setFilterStatus}
          onPriorityFilter={setFilterPriority}
          onCreate={() => setIsCreateModalOpen(true)}
          showCreateButton={true}
          statusFilter={filterStatus}
          priorityFilter={filterPriority}
          statusFilterItems={statusFilterItems}
          priorityFilterItems={priorityFilterItems}
          emptyStateMessage="No tickets found!"
          isPaginated={true}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          pageNo={currentPage}
          limit={itemsPerPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          isCheckbox={true}
          ischeckboxbody={true}
          buttonTextName="Create Ticket"
        />
      )}

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onCreateTicket={handleCreateTicket}
        isLoading={isCreatingTicket || isFetchingCreateTicket}
        projects={projects}
        isLoadingProjects={isLoadingProjects}
        users={users}
        isLoadingUsers={isLoadingUsers}
        statusOptions={statusOptions}
        isLoadingStatus={isLoadingStatus}
        errors={createFormErrors}
        clearErrors={clearCreateFormErrors}
      />

      <EditTicketModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        editForm={editForm}
        setEditForm={setEditForm}
        onUpdateTicket={handleUpdateTicket}
        editingTicket={editingTicket}
        projects={projects}
        isLoadingProjects={isLoadingProjects}
        users={users}
        isLoadingUsers={isLoadingUsers}
        statusOptions={statusOptions}
        isLoadingStatus={isLoadingStatus}
        isLoadingTicketData={isLoadingTicketById}
        selectedTicketLogs={selectedTicketLogs}
        ticketLogApi={{
          data: ticketLogData,
          isLoading: isLoadingTicketLog,
          isFetching: isFetchingTicketLog,
          refetch: refetchTicketLog,
          error: ticketLogError,
        }}
        currentTicketId={currentTicketId}
        errors={editFormErrors}
        clearErrors={clearEditFormErrors}
      />

      <ViewTicketModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        selectedTicket={selectedTicket}
        selectedTicketLogs={selectedTicketLogs}
        ticketLogApi={{
          data: ticketLogData,
          isLoading: isLoadingTicketLog,
          isFetching: isFetchingTicketLog,
          refetch: refetchTicketLog,
          error: ticketLogError,
        }}
        currentTicketId={currentTicketId}
        editingTicket={selectedTicket}
      />
    </div>
  );
};

export default TicketingDashboard;

