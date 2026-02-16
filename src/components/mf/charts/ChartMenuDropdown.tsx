"use client";

import React from "react";
import { Ellipsis, Maximize } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";

interface ChartMenuDropdownProps {
  handleExportCsv?: () => void; // CSV export handler
  handleExportPng?: (title: string, key: string) => void; // PNG export handler
  handleExpand?: () => void; // Expand handler
  title?: string; // Chart title for export
  exportKey?: string; // Key for export identification
}

export function ChartMenuDropdown({
  handleExportCsv,
  handleExportPng,
  handleExpand,
  title = "Chart",
  exportKey,
}: ChartMenuDropdownProps) {
  const handlePngExport = React.useCallback(() => {
    handleExportPng?.(title, exportKey || "");
  }, [handleExportPng, title, exportKey]);

  const handleExpandClick = React.useCallback(() => {
    handleExpand?.();
  }, [handleExpand]);

  return (
    <div className="p-2 flex justify-center items-center">
      <TooltipProvider>
        <Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TooltipTrigger>
                <div className="group">
                  <Ellipsis className=" cursor-pointer" />
                </div>
              </TooltipTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-background text-subBody dark:text-white">
              <DropdownMenuGroup>
                {handleExportCsv && (
                  <DropdownMenuItem onClick={handleExportCsv}>
                    Export to CSV
                  </DropdownMenuItem>
                )}
                {handleExportPng && (
                  <DropdownMenuItem onClick={handlePngExport}>
                    Export to PNG
                  </DropdownMenuItem>
                )}
                {handleExpand && (
                  <DropdownMenuItem onClick={handleExpandClick}>
                    <span>Expand Full Screen</span>
                    {/* <Maximize size={20} className="ml-3" /> */}
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent className="text-subBody">
            Select
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

