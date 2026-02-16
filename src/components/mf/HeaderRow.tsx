import React, { useEffect, useState} from 'react';
import {
  Card,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Maximize } from 'lucide-react';
import { RadioButtons } from './RadioButton';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from '@/components/ui/multi-select';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';

interface HeaderRowProps {
  heading?: string;
  sub_heading?: string;
  handleExport?: () => void;
  onExport?: (format: string, title: string, key: string) => void;
  onExpand?: (key: string) => void;
  visitEventOptions?: { value: string; label: string }[];
  exportKey?: string;
  handleTypeChange?: (value: string) => void;
  selectedType?: string;
  handleFrequencyChange?: (value: string) => void; 
  handleMultiSelectChange?: (values: string[]) => void;
  selectedFrequency?: string;
  selectedMultiValues?: string[];
  selectoptions?: string[];
  multiSelectOptions?: { label: string; value: string }[];
  title?: string;
  isSelect?: boolean;
  isRadioButton?: boolean;
  isMultiSelect?: boolean;
  placeholder?: string;
  multiSelectPlaceholder?: string;
  width?: string;
  textcolors?:string;
  showMenu?: boolean;
}

const HeaderRow = ({
  handleTypeChange,
  visitEventOptions,
  selectoptions = [],
  multiSelectOptions = [],
  selectedType,
  exportKey="",
  selectedFrequency,
  selectedMultiValues = [],
  handleFrequencyChange,
  handleMultiSelectChange,
  handleExport,
  onExport,
  onExpand,
  title,
  width = "120px",
  isSelect = false,
  isRadioButton = false,
  isMultiSelect = false,
  placeholder = "",
  multiSelectPlaceholder = "",
  textcolors,
  showMenu = true,
}: HeaderRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandClick = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpand(exportKey); // Notify the parent for expansion change
  };

  // useEffect(() => {
  //   const handleEsc = (event: KeyboardEvent) => {
  //     if (event.key === "Escape" && isExpanded) {
  //       setIsExpanded(false); // ✅ Locally collapse
  //     }
  //   };
  
  //   window.addEventListener("keydown", handleEsc);
  //   return () => window.removeEventListener("keydown", handleEsc);
  // }, [isExpanded]);

  return (
    <Card className='border-none w-full'>
      <div className="flex flex-wrap justify-between">

          <>
            {/* Title and expandable menu when collapsed */}
            <CardTitle className="flex justify-center items-center text-sub-header font-semibold sm:text-body p-1" style={{ color: textcolors }}>
              {title}
            </CardTitle>
            <CardTitle className="flex flex-wrap space-x-4 sm:space-x-2 justify-between w-full sm:w-auto p-1">
              {isRadioButton && (
                <div className="flex justify-center items-center">
                  <RadioButtons
                    options={visitEventOptions || []}
                    defaultValue={selectedType}
                    onValueChange={handleTypeChange || (() => {})}
                  />
                </div>
              )}

              {isSelect && selectoptions.length>0 && (
                <div className="flex justify-center items-center">
                 <Select onValueChange={handleFrequencyChange} >
                                    <SelectTrigger className={`w-[90px] h-[30px]`}>
                                        <SelectValue placeholder={placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup className="relative z-100">
                                            {selectoptions.map((option, index) => (
                                                <SelectItem key={index} value={option} selected={option === selectedFrequency}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                </div>
              )}

              {isMultiSelect && (
                <div className="flex justify-center items-center">
                  <MultiSelect
                    options={multiSelectOptions}
                    selected={selectedMultiValues}
                    onValueChange={handleMultiSelectChange}
                    placeholder={multiSelectPlaceholder}
                    className={`w-${width}`}
                  />
                </div>
              )}

              {showMenu && (
                <div className="p-2 flex justify-center items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <TooltipTrigger>
                            <div className="group">
                              <Ellipsis className="group-hover:text-blue-500" />
                            </div>
                          </TooltipTrigger>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="dark:bg-background">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handleExport}>Export to CSV</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport?.("png", title ?? "Untitled", exportKey)}>
                              Export to PNG
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExpandClick}>
                              <span>Expand</span>
                              <Maximize size={20} className="ml-3" />
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <TooltipContent className="text-subBody">Select Options</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </CardTitle>
          </>
      </div>
    </Card>
  );
};

export default HeaderRow;
