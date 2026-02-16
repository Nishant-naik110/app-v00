
"use client";
 
import * as React from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { DateRange } from "react-day-picker";
 
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDateRange } from "./DateRangeContext";
 
interface MFDateRangePickerProps {
  className?: string;
  onDateChange?: (range: DateRange | undefined) => void;
  hideButton?: boolean; // If true, only show the calendar content without the button
  hideSelectedRangeText?: boolean; // If true, hide the "Selected Range" header text
}
 
export function MFDateRangePicker({
  className,
  onDateChange,
  hideButton = false,
  hideSelectedRangeText = false,
}: MFDateRangePickerProps) {
  const { setDateRange, minDate, maxDate, isDateDisabled } = useDateRange();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [calendarSelection, setCalendarSelection] = React.useState<DateRange | undefined>(undefined);
  const [open, setOpen] = React.useState(false);
  const [calendarKey, setCalendarKey] = React.useState(0);
 
  const handleDateSelect = (newDateRange: DateRange | undefined) => {
    console.log('handleDateSelect called with:', newDateRange);
    console.log('current date state:', date);
    
    if (!newDateRange) {
      // User cleared the selection
      setDate(undefined);
      setCalendarSelection(undefined);
      return;
    }
    
    // If user clicks a new date when we already have a complete range, reset and start fresh
    if (date?.from && date?.to && newDateRange?.from && !newDateRange?.to) {
      console.log('Resetting for new selection');
      setCalendarSelection({ from: newDateRange.from, to: undefined });
      setDate({ from: newDateRange.from, to: undefined });
      return;
    }
    
    if (newDateRange?.from && !newDateRange?.to) {
      // User clicked a single date - start new selection
      console.log('Setting single date:', newDateRange.from);
      setCalendarSelection({ from: newDateRange.from, to: undefined });
      setDate({ from: newDateRange.from, to: undefined });
    } else if (newDateRange?.from && newDateRange?.to) {
      // User has selected both dates - complete the range
      console.log('Setting complete range:', newDateRange);
      setCalendarSelection(newDateRange);
      setDate(newDateRange); // Update the button display
      setOpen(false);
      setDateRange(
        format(newDateRange.from, 'yyyy-MM-dd'),
        format(newDateRange.to, 'yyyy-MM-dd')
      );
      onDateChange?.(newDateRange);
    }
  };
 
  const handlePresetSelect = (value: string) => {
    let newDateRange: DateRange | undefined;
    
    switch (value) {
      case "l_month":
        newDateRange = {
          from: startOfMonth(subMonths(new Date(), 1)),
          to: endOfMonth(subMonths(new Date(), 1)),
        };
        break;
      case "l_week":
        newDateRange = {
          from: startOfWeek(subWeeks(new Date(), 1)),
          to: endOfWeek(subWeeks(new Date(), 1)),
        };
        break;
      case "90":
        // Select full previous 3 months, excluding current month
        newDateRange = {
          from: startOfMonth(subMonths(new Date(), 3)),
          to: endOfMonth(subMonths(new Date(), 1)),
        };
        break;
      default:
        newDateRange = {
          from: subDays(new Date(), parseInt(value)),
          to: new Date(),
        };
        break;
    }
    
    setDate(newDateRange);
    setOpen(false);
    
    if (newDateRange?.from && newDateRange?.to) {
      setDateRange(
        format(newDateRange.from, 'yyyy-MM-dd'),
        format(newDateRange.to, 'yyyy-MM-dd')
      );
      onDateChange?.(newDateRange);
    }
  };
 
  const resetCalendar = () => {
    setCalendarKey(prev => prev + 1);
    setCalendarSelection(undefined); // Clear calendar visual selection for fresh start
  };
 
  // Get the final selected range for display
  const getSelectedRange = (): DateRange | undefined => {
    return calendarSelection?.from && calendarSelection?.to ? calendarSelection : undefined;
  };
 
  // Calendar content component (preset selector + calendar grid)
  const calendarContent = (
    <>
      {/* Beautiful Preset Selector */}
      <div className="px-4 py-4 bg-gradient-to-br from-muted/30 to-background border-b border-border/50">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
          Quick Select
        </label>
        <Select onValueChange={handlePresetSelect}>
          <SelectTrigger className="w-full h-11 bg-background/80 backdrop-blur-sm border-border/60 hover:border-primary/50 hover:bg-background transition-all duration-200 shadow-sm hover:shadow-md">
            <SelectValue placeholder="Choose a preset range..." />
          </SelectTrigger>
          <SelectContent position="popper" className="w-full">
            <SelectItem value="7" className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30">
              <div className="flex items-center gap-3 py-1">
                <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"></div>
                <span className="font-medium">Last 7 days</span>
              </div>
            </SelectItem>
            <SelectItem value="l_week" className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
              <div className="flex items-center gap-3 py-1">
                <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-sm"></div>
                <span className="font-medium">Last week</span>
              </div>
            </SelectItem>
            <SelectItem value="30" className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30">
              <div className="flex items-center gap-3 py-1">
                <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm"></div>
                <span className="font-medium">Last 30 days</span>
              </div>
            </SelectItem>
            <SelectItem value="l_month" className="cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950/30">
              <div className="flex items-center gap-3 py-1">
                <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 shadow-sm"></div>
                <span className="font-medium">Last month</span>
              </div>
            </SelectItem>
            <SelectItem value="90" className="cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/30">
              <div className="flex items-center gap-3 py-1">
                <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-sm"></div>
                <span className="font-medium">Last 3 months</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
 
      {/* Calendar Grid */}
      <div className="p-3 overflow-x-auto scrollbar-hide">
        <Calendar
          key={calendarKey}
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={calendarSelection}
          onSelect={handleDateSelect}
          numberOfMonths={2}
          disabled={(date) => isDateDisabled(date)}
          className="rounded-md"
        />
      </div>
    </>
  );
 
  // If hideButton is true, return calendar content with selected date display (beautiful UI)
  if (hideButton) {
    return (
      <div className={cn("w-auto max-w-[calc(100vw-100px)] md:max-w-[calc(100vw-120px)] overflow-hidden rounded-lg shadow-lg", className)}>
        {/* Beautiful Header with Selected Date Range */}
        <div className="px-5 py-4 bg-blue-50 dark:bg-blue-950/30 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
                Selected Range
              </p>
              <p className="text-subBody font-semibold text-foreground">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "MMM dd, yyyy")} - {format(date.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(date.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span className="text-muted-foreground font-normal">Pick a date range</span>
                )}
              </p>
            </div>
          </div>
        </div>
 
        {calendarContent}
      </div>
    );
  }
 
  // Otherwise, return the full component with button trigger
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          // Reset calendar when opening
          resetCalendar();
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="ghost"
            className={cn(
              "w-fit max-w-60   h-8 text-subBody justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-lg shadow-lg" align="start">
          {/* Beautiful Header with Selected Date Range */}
          {!hideSelectedRangeText && (
            <div className="px-5 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
                    Selected Range
                  </p>
                  <p className="text-subBody font-semibold text-foreground">
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "MMM dd, yyyy")} - {format(date.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(date.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span className="text-muted-foreground font-normal">Pick a date range</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          {calendarContent}
        </PopoverContent>
      </Popover>
    </div>
  );
}
 