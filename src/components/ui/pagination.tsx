import React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "./select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPage?: boolean;
  totalRecords?: number;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = false,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 200],
  showItemsPerPage = false,
  totalRecords,
}:PaginationProps) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 6) {
      // Show all pages if total pages are 6 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first 2 pages
      pages.push(1, 2);
      
      if (currentPage > 4) {
        pages.push("...");
      }
      
      // Show current page and surrounding pages
      if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push(currentPage);
      }
      
      if (currentPage < totalPages - 3) {
        pages.push("...");
      }
      
      // Always show last 2 pages
      pages.push(totalPages - 1, totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex justify-between items-center flex-wrap gap-2 w-full">
      {/* Left Side: Items Per Page */}
      <div className="flex items-center gap-2">
        {showItemsPerPage && itemsPerPage !== undefined && onItemsPerPageChange && (
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-[70px] h-[30px] outline-none focus:ring-0 text-subBody dark:text-white">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent className="border-none outline-none focus:ring-0">
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {totalRecords !== undefined && itemsPerPage !== undefined && (
          <span className="text-subBody dark:text-gray-300 whitespace-nowrap">
            {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              totalRecords
            )} of ${totalRecords} records`}
          </span>
        )}
      </div>

      {/* Right Side: Pagination Controls */}
      <div className="flex items-center flex-wrap space-x-2">
        <Button
          variant="outline"
          size="xs"
          className="text-subBody"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-2 w-2" />
        </Button>

        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === "string" ? (
              <span className="px-2">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="xs"
                className={`text-subBody ${currentPage === page ? 'text-white' : 'text-black'}`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="xs"
          className="text-subBody"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-2 w-2" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;