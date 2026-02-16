"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const TicketStatsCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overall Stats Skeleton */}
      <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-emerald-50 dark:from-orange-900/20 dark:to-emerald-900/20 border-orange-200 dark:border-orange-800 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              {/* Circular Progress Skeleton */}
              <div className="mx-auto w-[120px] h-[120px] relative flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-full absolute animate-pulse-slow" />
                <div className="relative z-10 text-center animate-scale-in">
                  <Skeleton className="h-7 w-14 mx-auto mb-2 rounded animate-pulse-slow" style={{ animationDelay: "200ms" }} />
                  <Skeleton className="h-3 w-24 mx-auto rounded animate-pulse-slow" style={{ animationDelay: "400ms" }} />
                </div>
              </div>
            </div>
            <div className="text-right ml-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Tickets Breakdown Skeleton */}
      <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-blue-200 dark:border-blue-800 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              {/* Circular Progress Skeleton */}
              <div className="mx-auto w-[120px] h-[120px] relative flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-full absolute animate-pulse-slow" />
                <div className="relative z-10 text-center animate-scale-in">
                  <Skeleton className="h-7 w-14 mx-auto mb-2 rounded animate-pulse-slow" style={{ animationDelay: "200ms" }} />
                  <Skeleton className="h-3 w-24 mx-auto rounded animate-pulse-slow" style={{ animationDelay: "400ms" }} />
                </div>
              </div>
            </div>
            <div className="text-right ml-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Closed Tickets Breakdown Skeleton */}
      <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              {/* Circular Progress Skeleton */}
              <div className="mx-auto w-[120px] h-[120px] relative flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-full absolute animate-pulse-slow" />
                <div className="relative z-10 text-center animate-scale-in">
                  <Skeleton className="h-7 w-14 mx-auto mb-2 rounded animate-pulse-slow" style={{ animationDelay: "200ms" }} />
                  <Skeleton className="h-3 w-24 mx-auto rounded animate-pulse-slow" style={{ animationDelay: "400ms" }} />
                </div>
              </div>
            </div>
            <div className="text-right ml-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

