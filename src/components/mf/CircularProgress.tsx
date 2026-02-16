"use client"
import { cn } from "@/lib/utils"

interface ProgressSegment {
  label: string
  value: number
  color: string
  maxValue?: number
}

interface CircularProgressProps {
  segments: ProgressSegment[]
  centerCount?: number
  centerLabel?: string
  size?: number
  strokeWidth?: number
  className?: string
}

export default function CircularProgress({
  segments,
  centerCount = 0,
  centerLabel = "Total",
  size = 200,
  strokeWidth = 8,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Calculate total value for percentage calculations
  const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0)
  const maxValue = segments.reduce((max, segment) => Math.max(max, segment.maxValue || 100), 0)

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress segments */}
          {segments.map((segment, index) => {
            const segmentMaxValue = segment.maxValue || maxValue
            const segmentPercentage = Math.min((segment.value / segmentMaxValue) * 100, 100)
            
            // Calculate cumulative progress for proper positioning
            let cumulativeProgress = 0
            for (let i = 0; i < index; i++) {
              const prevSegment = segments[i]
              const prevMaxValue = prevSegment.maxValue || maxValue
              cumulativeProgress += Math.min((prevSegment.value / prevMaxValue) * 100, 100)
            }
            
            const strokeDasharray = circumference
            const strokeDashoffset = circumference - (segmentPercentage / 100) * circumference

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out"
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${cumulativeProgress * 3.6}deg)` // 3.6 = 360/100 for percentage to degrees
                }}
              />
            )
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{centerCount.toLocaleString()}</div>
          <div className="text-subBody text-gray-500 dark:text-gray-400">{centerLabel}</div>
        </div>
      </div>
    </div>
  )
}