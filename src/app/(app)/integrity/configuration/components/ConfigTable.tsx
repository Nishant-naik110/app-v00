import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ResizableTable from "@/components/mf/ReportingToolTable";
import { TABLE_HEIGHT, TABLE_HEADER_COLOR } from "../constants";

interface ConfigTableProps {
  title: string;
  columns: readonly { title: string; key: string }[];
  data: any[];
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  limit?: number;
  isLoading: boolean;
  onSearch: (term: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onAdd: () => void;
  onEdit: (item: Record<string, string | number>) => void;
  onDelete: (item: Record<string, string | number>) => void;
}

export const ConfigTable = ({
  title,
  columns,
  data,
  searchTerm,
  currentPage,
  totalPages,
  limit = 10,
  isLoading,
  onSearch,
  onPageChange,
  onLimitChange,
  onAdd,
  onEdit,
  onDelete,
}: ConfigTableProps) => {
  const firstWord = title?.split(" ")?.[0] || "Item";

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 gap-3 sm:gap-0">
          <CardTitle className="text-subBody font-semibold text-gray-900">
            {title}
          </CardTitle>
          <Button onClick={onAdd} size="sm" className="flex items-center gap-2" disabled={!onAdd}>
            <Plus className="h-4 w-4" />
            Add {firstWord}
          </Button>
        </div>
        <div className="p-2 sm:p-4 flex flex-col">
          <div className="flex-1">
            <ResizableTable
              columns={(columns || []) as any}
              data={data || []}
              onSearch={onSearch || (() => {})}
              isSearchable={true}
              headerColor={TABLE_HEADER_COLOR}
              totalPages={totalPages || 1}
              pageNo={currentPage || 1}
              limit={limit}
              onPageChange={onPageChange || (() => {})}
              onLimitChange={onLimitChange || (() => {})}
              isTableDownload={false}
              isPaginated={true}
              isEdit={true}
              isDelete={true}
              onEdit={onEdit || (() => {})}
              onDelete={onDelete || (() => {})}
              height={TABLE_HEIGHT}
              isLoading={isLoading || false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

