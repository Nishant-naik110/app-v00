'use client'
import React, { useCallback,  useState } from 'react';
import  { type Column } from '@/components/mf/ReportingToolTable';
import { debounce } from "@/lib/utils";
import { useDateRange } from '@/components/mf/DateRangeContext';
import ResizableTable from '@/components/mf/ReportingToolTable';
import { usePackage } from "@/components/mf/PackageContext";
import { ToggleButton } from '@/components/mf/ToggleButton';
import { useContributingPublisherOriginal} from '../../hooks/useDashboard';
const columns: Column<any>[] = [
  { title: 'Publisher Name', key: 'publisher_name' },
  { title: 'Total Installs', key: 'total_installs' },
  { title: 'Contributing Count', key: 'contributing_count' },
  { title: 'Percentage', key: 'percentage' },
  { title: 'Final Count', key: 'final_count' },
];

const columnsEvents: Column<any>[] = [
  { title: 'Publisher Name', key: 'publisher_name' },
  { title: 'Total Events', key: 'total_events' },
  { title: 'Contributing Count', key: 'contributing_count' },
  { title: 'Percentage', key: 'percentage' },
  { title: 'Final Count', key: 'final_count' },
];

const Original = () => {
  const { selectedPackage } = usePackage();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'install' | 'event'>('install');
  const { startDate, endDate } = useDateRange();

  // Toggle options
  const toggleOptions = [
    { label: 'Install', value: 'install' },
    { label: 'Events', value: 'event' }
  ];

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
      setCurrentPage(1);
    }, 1000),
    []
  );

  // API Payload
  const contributingPublisherPayload =  {
      start_date: startDate,
      end_date: endDate,
      package_name: selectedPackage,
      page_number: currentPage,
      record_limit: limit,
      search_term: debouncedSearchTerm,
    };

  // API Hook
  const { data: apiData, isLoading: loading } = useContributingPublisherOriginal(
    selectedType,
    contributingPublisherPayload,
    !!contributingPublisherPayload
  );


  // Handle search input
  const handleSearchChange = (term: string) => {
    debouncedSearch(term);
  };

  // Get current columns based on selected type
  const getCurrentColumns = () => {
    return selectedType === 'install' ? columns : columnsEvents;
  };

  return (
    <div className="overflow-x-auto space-y-2">
      <div className="flex items-center justify-end mt-1">
       
        <ToggleButton
          options={toggleOptions}
          selectedValue={selectedType}
          onChange={(value) => setSelectedType(value as 'install' | 'event')}
          className="w-[180px]"
        />
      </div>
     
      <div>
        <ResizableTable
          columns={getCurrentColumns()}
          isTableDownload={false}
          data={apiData?.data || []}
          isPaginated={true}
          isDelete={false}
          isView={false}
          headerColor="#DCDCDC"
          isSearchable={true}
          isLoading={loading}
          onSearch={handleSearchChange}
          onLimitChange={(newLimit: number) => {
            setLimit(newLimit);
            setCurrentPage(1);
          }}
          onPageChange={(newPage: number) => {
            setCurrentPage(newPage);
          }}
          pageNo={currentPage}
          totalPages={apiData?.Total_pages || 1}
          totalRecords={apiData?.Total_records || 0}
          containerHeight={635}
        />
      </div>
    </div>
  );
};

export default Original;