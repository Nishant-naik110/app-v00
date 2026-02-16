// "use client";

// import React, { createContext, useContext, useState } from 'react';
// import { subDays, format } from 'date-fns';

// interface DateRangeContextType {
//   startDate: string;
//   endDate: string;
//   setDateRange: (start: string, end: string) => void;
// }

// const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

// export function DateRangeProvider({ children }: { children: React.ReactNode }) {
//   const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
//   const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

//   const setDateRange = (start: string, end: string) => {
//     setStartDate(start);
//     setEndDate(end);
//   };

//   return (
//     <DateRangeContext.Provider value={{ startDate, endDate, setDateRange }}>
//       {children}
//     </DateRangeContext.Provider>
//   );
// }

// export function useDateRange() {
//   const context = useContext(DateRangeContext);
//   if (context === undefined) {
//     throw new Error('useDateRange must be used within a DateRangeProvider');
//   }
//   return context;
// } 




"use client";

import React, { createContext, useContext, useState } from 'react';
import { subDays, format, subMonths } from 'date-fns';

interface DateRangeContextType {
  startDate: string;
  endDate: string;
  setDateRange: (start: string, end: string) => void;
  minDate: string;
  maxDate: string;
  isDateDisabled: (date: Date) => boolean;
}
const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const minDate = format(new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth(), 1), 'yyyy-MM-dd');
  const maxDate = format(today, 'yyyy-MM-dd');

  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dateStr < minDate || dateStr > maxDate;
  };

  return (
    <DateRangeContext.Provider value={{ 
      startDate, 
      endDate, 
      setDateRange, 
      minDate, 
      maxDate, 
      isDateDisabled 
    }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
} 