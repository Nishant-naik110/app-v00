"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "@/components/mf/Filters/Filter";
import ResizableTable from "@/components/mf/ReportingToolTable";
import { usePackage } from "@/components/mf/PackageContext";
import { useDateRange } from "@/components/mf/DateRangeContext";
import { 
  usePublishersFilter,
  useEventTypeFilter,
  type PublisherApiResponse 
} from "../hooks/useDashboard";
import {
  buildSimpleFilter,
  buildPublisherFilter,
  extractSelectedValues,
} from "../hooks/useFilterHelpers";
import { usePostBackTable } from "../hooks/usePostBack";

interface PostbackEventData {
  Date: string;
  "Publisher Name": string;
  "Event Type": string;
  "Total Counts": number;
  "Invalid Events": number;
  "Valid Events": number;
  "Postback Triggered Events": number;
  [key: string]: string | number;
}

const PostTracking = () => {
  const { selectedPackage, isPackageLoading } = usePackage();
  const { startDate, endDate } = useDateRange();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordLimit, setRecordLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Filter selections
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>(["all"]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(["all"]);

  const baseFilterPayload = useMemo(() => {
    if (!selectedPackage || !startDate || !endDate || isPackageLoading) {
      return undefined;
    }
    return {
      package_name: selectedPackage,
      start_date: startDate,
      end_date: endDate,
    };
  }, [selectedPackage, startDate, endDate, isPackageLoading]);

  // Filter API calls
  const { data: publishersData, isLoading: isLoadingPublishers } = 
    usePublishersFilter("event", baseFilterPayload, !!baseFilterPayload);
  
  const { data: eventTypesData, isLoading: isLoadingEventTypes } = 
    useEventTypeFilter("event", baseFilterPayload, !!baseFilterPayload);

  // Build filter UI state
  const publishersFilter = useMemo(
    () => buildPublisherFilter(publishersData, selectedPublishers, isLoadingPublishers),
    [publishersData, selectedPublishers, isLoadingPublishers]
  );

  const otherFilters = useMemo(() => ({
    "Event Types": buildSimpleFilter(eventTypesData, selectedEventTypes, isLoadingEventTypes),
  }), [eventTypesData, selectedEventTypes, isLoadingEventTypes]);

  // Filter change handlers
  const handlePublisherFilterChange = (newState: any) => {
    if (newState.Publishers) {
      setSelectedPublishers(extractSelectedValues(newState.Publishers));
    }
  };

  const handleOtherFiltersChange = (newState: any) => {
    if (newState["Event Types"]) {
      setSelectedEventTypes(extractSelectedValues(newState["Event Types"]));
    }
  };

  const postbackPayload = useMemo(() => {
    if (!selectedPackage || !startDate || !endDate || isPackageLoading) {
      return undefined;
    }

    return {
      package_name: selectedPackage,
      start_date: startDate,
      end_date: endDate,
      publisher: selectedPublishers,
      event_type: selectedEventTypes,
      record_limit: recordLimit,
      page_number: currentPage,
      search_term: debouncedSearchTerm,
    };
  }, [
    selectedPackage,
    startDate,
    endDate,
    isPackageLoading,
    selectedPublishers,
    selectedEventTypes,
    recordLimit,
    currentPage,
    debouncedSearchTerm,
  ]);

  const { data: postbackEventsData, isLoading: postbackEventsLoading } =
    usePostBackTable(postbackPayload, !!postbackPayload);

  // Reset on package/date change
  useEffect(() => {
    setSelectedPublishers(["all"]);
    setSelectedEventTypes(["all"]);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
  }, [selectedPackage, startDate, endDate]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, [selectedPublishers, selectedEventTypes]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setRecordLimit(limit);
    setCurrentPage(1);
  };

  const tableColumns = useMemo(() => {
    const data = Array.isArray(postbackEventsData)
      ? postbackEventsData
      : postbackEventsData?.data || [];

    if (!data?.length) return [];

    const firstRow = data?.[0];
    if (!firstRow) return [];

    return Object.keys(firstRow).map((key) => ({
      title: key,
      key: key,
    }));
  }, [postbackEventsData]);

  const tableData = useMemo(() => {
    return Array.isArray(postbackEventsData)
      ? postbackEventsData
      : postbackEventsData?.data || [];
  }, [postbackEventsData]);

  const totalPages = useMemo(() => {
    return postbackEventsData?.Total_pages || 1;
  }, [postbackEventsData]);

  const totalRecords = useMemo(() => {
    return postbackEventsData?.Total_records || 0;
  }, [postbackEventsData]);

  return (
    <div className="space-y-2">
      {/* Filters */}
      <div className="sticky top-0 z-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-md bg-background px-4 py-3 border border-gray-200 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <Filter
            key={`publishers-${selectedPackage}`}
            filter={{ Publishers: publishersFilter }}
            onChange={handlePublisherFilterChange}
            grouped={true}
            publisherGroups={{ Publishers: publishersData || {} }}
          />
          <Filter
            key="other-filters"
            filter={otherFilters}
            onChange={handleOtherFiltersChange}
            grouped={false}
          />
        </div>
      </div>

      <ResizableTable
        columns={tableColumns}
        data={tableData}
        headerColor="#f3f4f6"
        isPaginated={true}
        isSearchable={true}
        onSearch={setSearchTerm}
        isLoading={
          postbackEventsLoading || isPackageLoading || isLoadingPublishers || isLoadingEventTypes
        }
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        pageNo={currentPage}
        totalPages={totalPages}
        limit={recordLimit}
        totalRecords={totalRecords}
        emptyStateMessage="No Data Found!"
      />
    </div>
  );
};

export default PostTracking;
