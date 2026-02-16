"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

// Donut Chart Skeleton
export const DonutChartSkeleton = ({ height = "200px" }: { height: string }) => {
  return (
    <div className="w-full h-full animate-fade-in flex items-center justify-center" style={{ height: height }}>
      <div className="grid grid-cols-2 h-full w-full gap-4">
        {/* Left Column: Circular Chart Skeleton */}
        <div className="h-full w-full flex justify-center items-center">
          <div className="relative">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 md:w-32 md:h-32 rounded-full animate-pulse-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Skeleton className="h-5 w-12 sm:h-6 sm:w-14 md:h-8 md:w-16 mx-auto rounded" />
                <Skeleton className="h-3 w-16 sm:h-3 sm:w-20 md:h-4 md:w-24 mx-auto rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Legend Skeleton */}
        <div className="h-full w-full flex flex-col justify-center space-y-2 sm:space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <Skeleton className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" />
              <Skeleton className="h-3 w-20 sm:h-4 sm:w-24 md:w-32 rounded flex-1" />
              <Skeleton className="h-3 w-10 sm:h-4 sm:w-12 md:w-16 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Stacked Bar Chart with Line Skeleton
export const StackedBarChartSkeleton = ({ height = "210px" }: { height: string }) => {
  return (
    <div className="w-full animate-fade-in" style={{ height: height }}>
      <div className="relative w-full h-full p-4">
        {/* Y-Axis Labels Skeleton */}
        <div className="absolute left-0 top-4 bottom-12 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-12 rounded" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>

        {/* Chart Bars Skeleton */}
        <div className="ml-16 mr-4 h-full flex items-end justify-between gap-3">
          {Array.from({ length: 7 }).map((_, index) => {
            const barHeights = [85, 62, 48, 70, 58, 42, 55];
            const currentHeight = barHeights[index % barHeights.length];

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="relative w-full h-[150px] flex items-end">
                  <Skeleton
                    className="w-full rounded-t-lg origin-bottom animate-bar-rise"
                    style={{
                      height: `${currentHeight}%`,
                      width: '50px',
                      minHeight: '20px'
                    }}
                  />
                </div>
                {/* X-Axis Label */}
                <Skeleton className="h-3 w-14 rounded" />
              </div>
            );
          })}
        </div>

        {/* Legend Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Area Chart Skeleton
export const AreaChartSkeleton = ({ height = "400px" }: { height: string }) => {
  // Smooth curve data points (percentage from bottom)
  const dataPoints = [75, 60, 45, 55, 35, 25, 20, 15, 18, 12, 10, 8, 5];
  const pointCount = dataPoints.length;

  return (
    <div className="w-full animate-fade-in" style={{ height: height }}>
      <div className="relative w-full h-full">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-4 bottom-12 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-12 rounded" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>

        {/* Chart Area with Gradient Effect */}
        <div className="ml-16 mr-4 h-full relative">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="border-t border-gray-200 dark:border-gray-700 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>

          {/* Area Chart Path Skeleton with Smooth Curves */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4 animate-area-wave">
            <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.25">
                    <animate attributeName="stop-opacity" values="0.25;0.35;0.25" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="currentColor" stopOpacity="0.15">
                    <animate attributeName="stop-opacity" values="0.15;0.25;0.15" dur="3s" repeatCount="indefinite" begin="0.5s" />
                  </stop>
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.05">
                    <animate attributeName="stop-opacity" values="0.05;0.15;0.05" dur="3s" repeatCount="indefinite" begin="1s" />
                  </stop>
                </linearGradient>
              </defs>
              {/* Smooth area path using bezier curves */}
              <path
                d={`M 0,${dataPoints[0]} ${dataPoints.slice(1).map((y, i) => {
                  const prevY = dataPoints[i];
                  const x = ((i + 1) / (pointCount - 1)) * 1000;
                  const prevX = (i / (pointCount - 1)) * 1000;
                  // Use smooth bezier curves for natural flow
                  const cp1x = prevX + (x - prevX) * 0.3;
                  const cp1y = prevY;
                  const cp2x = prevX + (x - prevX) * 0.7;
                  const cp2y = y;
                  return `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
                }).join(' ')} L 1000,100 L 0,100 Z`}
                fill="url(#skeletonGradient)"
                className="animate-area-pulse"
                opacity="0.4"
              />
            </svg>
          </div>

          {/* Data Points - Aligned with path */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4">
            {dataPoints.map((point, index) => {
              const leftPosition = (index / (pointCount - 1)) * 100;
              return (
                <div
                  key={index}
                  className="absolute animate-point-float"
                  style={{
                    left: `${leftPosition}%`,
                    bottom: `${point}%`,
                    transform: 'translateX(-50%)',
                    animationDelay: `${index * 150}ms`
                  }}
                >
                  <Skeleton className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-400 shadow-sm" />
                </div>
              );
            })}
          </div>
        </div>


      </div>
    </div>
  );
};

// Line Chart Skeleton (for double line charts)
export const LineChartSkeleton = ({ height = "280px" }: { height: string }) => {
  return (
    <div className="w-full animate-fade-in overflow-hidden" style={{ height }}>
      <div className="relative w-full h-full p-4">
        <div className="absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-t border-gray-200 dark:border-gray-700" />
          ))}
        </div>

        <svg className="w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.5">
                <animate attributeName="stopOpacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="currentColor" stopOpacity="1">
                <animate attributeName="stopOpacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
              </stop>
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.5">
                <animate attributeName="stopOpacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" begin="1s" />
              </stop>
            </linearGradient>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.4">
                <animate attributeName="stopOpacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
              </stop>
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.8">
                <animate attributeName="stopOpacity" values="0.8;0.5;0.8" dur="2.5s" repeatCount="indefinite" begin="1s" />
              </stop>
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.4">
                <animate attributeName="stopOpacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite" begin="1.5s" />
              </stop>
            </linearGradient>
          </defs>
          <g className="animate-line-updown" style={{ animationDelay: "0s", transformOrigin: "center" }}>
            <polyline
              points="0,180 60,150 120,160 180,110 240,140 300,90 360,120 420,70 480,90 540,50 600,60"
              fill="none"
              stroke="url(#lineGradient1)"
              strokeWidth={3}
              className="text-gray-300 dark:text-gray-600 animate-line-pulse"
              style={{
                transformOrigin: "center",
                animationDelay: "0s"
              }}
            />
            {/* Animated dots along the line */}
            {[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((x, i) => {
              const yValues = [180, 150, 160, 110, 140, 90, 120, 70, 90, 50, 60];
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={yValues[i]}
                  r="3"
                  fill="currentColor"
                  className="text-gray-300 dark:text-gray-600 animate-line-glow"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    opacity: 0.6
                  }}
                >
                  <animate
                    attributeName="r"
                    values="2;4;2"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.2}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.2}s`}
                  />
                </circle>
              );
            })}
          </g>
          <g className="animate-line-updown" style={{ animationDelay: "0.5s", transformOrigin: "center" }}>
            <polyline
              points="0,200 60,190 120,170 180,150 240,160 300,140 360,130 420,120 480,110 540,100 600,90"
              fill="none"
              stroke="url(#lineGradient2)"
              strokeWidth={3}
              strokeDasharray="6 4"
              className="text-gray-400 dark:text-gray-500 animate-line-pulse"
              style={{
                transformOrigin: "center",
                animationDelay: "0.5s"
              }}
            />
            {/* Animated dots along the dashed line */}
            {[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((x, i) => {
              const yValues = [200, 190, 170, 150, 160, 140, 130, 120, 110, 100, 90];
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={yValues[i]}
                  r="2.5"
                  fill="currentColor"
                  className="text-gray-400 dark:text-gray-500 animate-line-glow"
                  style={{
                    animationDelay: `${0.5 + i * 0.2}s`,
                    opacity: 0.5
                  }}
                >
                  <animate
                    attributeName="r"
                    values="1.5;3.5;1.5"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${0.5 + i * 0.2}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0.9;0.3"
                    dur="2s"
                    repeatCount="indefinite"
                    begin={`${0.5 + i * 0.2}s`}
                  />
                </circle>
              );
            })}
          </g>
        </svg>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-12 rounded" style={{ animationDelay: `${index * 60}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Horizontal stacked bar skeleton
export const HorizontalStackedBarSkeleton = ({ rows = 6 }: { rows: number }) => {
  const leftWidths = [55, 45, 60, 35, 50, 40];
  const rightWidths = [25, 35, 20, 45, 30, 40];

  return (
    <div className="w-full p-4 space-y-4 animate-fade-in">
      {Array.from({ length: rows }).map((_, index) => {
        const baseDelay = index * 80;
        const leftWidth = leftWidths[index % leftWidths.length];
        const rightWidth = rightWidths[index % rightWidths.length];

        return (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="w-20 h-3 rounded" />
            <div className="flex-1">
              <div className="relative h-5 rounded-full border border-dashed border-gray-200/80 dark:border-gray-700/70 bg-white/60 dark:bg-gray-900/40 shadow-inner overflow-hidden">
                <div className="absolute inset-1 flex gap-1">
                  <Skeleton
                    className="h-full rounded-full origin-left animate-bar-swipe"
                    style={{
                      width: `${leftWidth}%`,
                      minWidth: "25%",
                      animationDelay: `${baseDelay}ms`,
                    }}
                  />
                  <Skeleton
                    className="h-full rounded-full origin-left animate-bar-swipe"
                    style={{
                      width: `${rightWidth}%`,
                      minWidth: "15%",
                      animationDelay: `${baseDelay + 120}ms`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Progress bar chart skeleton
export const ProgressBarChartSkeleton = ({ rows = 6 }: { rows: number }) => {
  return (
    <div className="w-full h-full p-4 space-y-5 animate-fade-in">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="w-32 h-3 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-12 h-3 rounded" />
              <Skeleton className="w-10 h-3 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton
              className="h-4 flex-1 rounded-full animate-progress-updown"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
            <Skeleton
              className="w-8 h-4 rounded-full animate-progress-updown"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Stats Cards Skeleton
export interface StatsCardsSkeletonProps {

  cardCount?: number;

  cardHeight?: number | string;

  gridCols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

export const StatsCardsSkeleton = ({
  cardCount = 3,
  cardHeight = 100,
  gridCols = {
    mobile: 1,
    tablet: 1,
    desktop: 3,
  },
  className = '',
}: StatsCardsSkeletonProps) => {

  const getGridColsClass = () => {
    const mobile = gridCols.mobile ?? 1;
    const tablet = gridCols.tablet ?? gridCols.mobile ?? 1;
    const desktop = gridCols.desktop ?? 3;

    // Map to Tailwind classes
    const colsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    };

    const mobileClass = colsMap[mobile] || 'grid-cols-1';
    const tabletClass = colsMap[tablet] || 'grid-cols-1';
    const desktopClass = colsMap[desktop] || 'grid-cols-3';

    return `${mobileClass} sm:${tabletClass} md:${desktopClass} lg:${desktopClass} xl:${desktopClass}`;
  };

  const getCardHeightStyle = (): string => {
    if (typeof cardHeight === 'number') {
      return `${cardHeight}px`;
    }
    return cardHeight;
  };

  return (
    <div className={`grid ${getGridColsClass()} w-full gap-2 ${className}`}>
      {Array.from({ length: cardCount }).map((_, index) => (
        <div key={index} className="flex-1">
          <div
            className="card border-0 relative overflow-hidden bg-white dark:bg-card rounded-lg"
            style={{
              height: getCardHeightStyle(),
              borderRight: '5px solid',
              borderColor: 'rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="p-3 px-4 h-full flex flex-col justify-center items-center">
              <div className="flex flex-col gap-1 items-center w-full">
                <div className="flex flex-row gap-2 items-center justify-center">
                  {/* Count skeleton */}
                  <Skeleton
                    className="h-9 w-24 rounded animate-pulse"
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                  {/* Percentage badge skeleton - show for cards after first */}
                  {index > 0 && (
                    <Skeleton
                      className="h-6 w-16 rounded-md animate-pulse"
                      style={{ animationDelay: `${index * 100 + 50}ms` }}
                    />
                  )}
                </div>
                {/* Label skeleton */}
                <Skeleton
                  className="h-4 w-32 rounded animate-pulse"
                  style={{ animationDelay: `${index * 100 + 100}ms` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Ticketing Table Skeleton
export const TicketingTableSkeleton = ({ height }: { height?: number | string }) => {
  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in w-full" style={{ height: height ? `${height}px` : "auto" }}>
      {/* Search and Filter Bar Skeleton */}
      <div className="mb-6 animate-slide-in">
        <div className="flex flex-col md:flex-row gap-2 w-full">
          {/* Left Side: Search and Filters */}
          <div className="flex flex-col md:flex-row flex-1 gap-2">
            {/* Search Bar */}
            <div className="flex-1">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-2">
              <Skeleton className="h-10 w-full md:w-[140px] rounded-lg" style={{ animationDelay: "100ms" }} />
              <Skeleton className="h-10 w-full md:w-[140px] rounded-lg" style={{ animationDelay: "150ms" }} />
              <Skeleton className="h-10 w-full md:w-[140px] rounded-lg" style={{ animationDelay: "200ms" }} />
            </div>
          </div>
          {/* Right Side: Create Button */}
          <Skeleton className="h-10 w-full md:w-32 rounded-lg" style={{ animationDelay: "250ms" }} />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-t-lg overflow-hidden border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
              <TableHead>
                <Skeleton className="h-4 w-16 rounded" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20 rounded" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24 rounded" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16 rounded" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20 rounded" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24 rounded" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20 rounded" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16 rounded" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow
                key={index}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 animate-fade-in"
                style={{
                  animationDelay: `${index * 80}ms`,
                  animationFillMode: "both"
                }}
              >
                <TableCell>
                  <Skeleton className="h-4 w-12 rounded" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in" style={{ animationDelay: "600ms" }}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 w-9 rounded-md"
              style={{ animationDelay: `${700 + i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

