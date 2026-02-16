import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import type React from "react";
import { Sector } from "recharts";
import domToImage from "dom-to-image";
import { onExpand as libOnExpand } from "@/lib/utils";
import { format } from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const session = {
  set: (k: string, d: object) => {
    const b = Buffer.from(JSON.stringify(d));
    localStorage.setItem(k, b.toString("base64"));
  },
  get: (k: string) => {
    const b = localStorage.getItem(k);
    if (!b) return {};
    return JSON.parse(Buffer.from(b ?? "", "base64").toString() ?? "{}");
  },
};

export function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "-";
  try {
    const parsedDate = new Date(dateString.replace(" ", "T"));
    return isNaN(parsedDate.getTime())
      ? "-"
      : format(parsedDate, "yyyy-MM-dd HH:mm:ss");
  } catch {
    return "-";
  }
};

export const getXAxisAngle = (data: string[]): number => {
  if (data.length === 0) {
    return 0; // or handle this case however you prefer
  }
  return data.length > 10 ? 1 : 0;
};
export const formatNumber = (value: number): string => {
  if (value >= 1e9) {
    const formatted = (value / 1e9).toFixed(1);
    // Remove trailing zero (e.g., "1.0" becomes "1", but "1.5" stays "1.5")
    return formatted.replace(/\.0$/, "") + "B";
  }
  if (value >= 1e6) {
    const formatted = (value / 1e6).toFixed(1);
    // Remove trailing zero (e.g., "1.0" becomes "1", but "1.5" stays "1.5")
    return formatted.replace(/\.0$/, "") + "M";
  }
  if (value >= 1e3) {
    const formatted = (value / 1e3).toFixed(1);
    // Remove trailing zero (e.g., "1.0" becomes "1", but "1.5" stays "1.5")
    return formatted.replace(/\.0$/, "") + "K";
  }
  return value.toString();
};

export const onExpand = (
  key: string,
  cardRefs: React.MutableRefObject<Record<string, HTMLElement | null>>,
  expandedCard: string | null,
  setExpandedCard: Dispatch<SetStateAction<string | null>>
) => {
  const card = cardRefs.current[key];

  if (card) {
    if (!document.fullscreenElement) {
      card.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error attempting to exit fullscreen mode:", err);
      });
    }

    setExpandedCard(expandedCard === key ? null : key);
  }
};

export const handleExportData = (
  headers: string[],
  rows: (string | number)[][],
  fileName: string
) => {
  const escapeCSV = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      fileName.endsWith(".csv") ? fileName : `${fileName}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatValue = (value: number, labelType: string) => {
  if (labelType === "Percentage") {
    return `${Math.round((value * 100) / 1000) * 10}%`;
  }
  return value.toLocaleString();
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

export const parsePercentage = (percentage: string | number): number => {
  // Check if it's a string and has the percentage sign
  if (typeof percentage === "string") {
    return parseFloat(percentage.replace("%", "").trim());
  }
  // If it's already a number, return it as is
  if (typeof percentage === "number") {
    return percentage;
  }
  // If it's not a valid type, return NaN or handle as needed
  return NaN;
};

export const formatBlacklistLabel = (value: string) => {
  if (!value) return "";

  // Split by underscores
  const words = value.split("_");

  // Capitalize first letter of each word
  const formattedWords = words.map((word) =>
    word.length === 2 && word === word.toLowerCase()
      ? word.toUpperCase() // If it's 2-letter lowercase (like "ip"), uppercase it
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  // Join with space
  return formattedWords.join(" ");
};

// Right Y-axis tick formatter based on type
export const getRightAxisTickFormatter = (
  value: number,
  rightAxisType: string
) => {
  switch (rightAxisType) {
    case "price":
      return `₹${formatNumber(value)}`; // Use Indian Rupee symbol
    case "percentage":
      const percentageValue = Number.parseFloat(value.toString());
      if (percentageValue === 100) {
        return "100%";
      }
      return `${percentageValue.toFixed(2)}%`;
    case "number":
      return formatNumber(value);
    default:
      const defaultValue = Number.parseFloat(value.toString());
      // If value is 100, show without decimal places
      if (defaultValue === 100) {
        return "100%";
      }
      return `${defaultValue.toFixed(2)}%`;
  }
};

// Custom tick component with tooltip
export const CustomXAxisTick = ({ x, y, payload, angle = 0, textlimit = 11 }: any) => {
  const originalLabel = payload.value;
  const isLabelTruncated = originalLabel && originalLabel.length > textlimit;
  const displayLabel = isLabelTruncated
    ? originalLabel?.substring(0, 5) + "..."
    : originalLabel;

  // Adjust text anchor based on angle
  const getTextAnchor = () => {
    if (angle === 0) return "middle";
    if (angle < 0) return "end";
    return "start";
  };

  // Adjust vertical offset based on angle
  const getDy = () => {
    if (angle === 0) return 16;
    if (Math.abs(angle) >= 45) return 8;
    return 12;
  };

  return (
    <g transform={`translate(${x},${y})`} pointerEvents="all">
      <title>{originalLabel}</title>
      <text
        x={0}
        y={0}
        dy={getDy()}
        textAnchor={getTextAnchor()}
        fontSize={12}
        className="cursor-pointer"
        transform={angle !== 0 ? `rotate(${angle})` : undefined}
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {displayLabel}
      </text>
    </g>
  );
};

/**
 * Clickable X-axis tick component with data click functionality
 * @param x - X position
 * @param y - Y position
 * @param payload - Tick payload with value
 * @param angle - Rotation angle for text
 * @param textlimit - Maximum text length before truncation
 * @param chartData - Chart data array to find matching data item
 * @param onDataClick - Callback function when tick is clicked
 */
export const ClickableXAxisTick = ({ 
  x, 
  y, 
  payload, 
  angle = 0, 
  textlimit = 11,
  chartData = [],
  onDataClick
}: any) => {
  const originalLabel = payload.value;
  const isLabelTruncated = originalLabel && originalLabel.length > textlimit;
  const displayLabel = isLabelTruncated
    ? originalLabel?.substring(0, 5) + "..."
    : originalLabel;
  const dataIndex = chartData.findIndex((item: any) => item.label === originalLabel);
  const dataItem = dataIndex !== -1 ? chartData[dataIndex] : null;

  const handleClick = () => {
    if (dataItem && dataIndex !== -1) {
      console.log("X-axis label clicked:", { 
        label: originalLabel, 
        data: dataItem, 
        index: dataIndex 
      });
      if (onDataClick) {
        onDataClick(dataItem, dataIndex, "label");
      }
    }
  };

  const getTextAnchor = () => {
    if (angle === 0) return "middle";
    if (angle < 0) return "end";
    return "start";
  };

  const getDy = () => {
    if (angle === 0) return 16;
    if (Math.abs(angle) >= 45) return 8;
    return 12;
  };

  return (
    <g transform={`translate(${x},${y})`} pointerEvents="all">
      <title>{originalLabel}</title>
      <text
        x={0}
        y={0}
        dy={getDy()}
        textAnchor={getTextAnchor()}
        fontSize={12}
        className="cursor-pointer hover:fill-blue-600 transition-colors"
        transform={angle !== 0 ? `rotate(${angle})` : undefined}
        onClick={handleClick}
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {displayLabel}
      </text>
    </g>
  );
};

/**
 * Clickable Y-axis tick component with data click functionality
 * @param x - X position
 * @param y - Y position
 * @param payload - Tick payload with value
 * @param yAxisId - Y-axis identifier ("left" or "right")
 * @param rightAxisType - Type of right axis ("percentage" | "price" | "number")
 * @param onDataClick - Callback function when tick is clicked
 */
export const ClickableYAxisTick = ({ 
  x, 
  y, 
  payload, 
  yAxisId,
  rightAxisType = "percentage",
  onDataClick
}: any) => {
  const rawValue = payload.value;
  
  // Format the value based on axis type
  const formattedValue = yAxisId === "right" 
    ? getRightAxisTickFormatter(rawValue, rightAxisType)
    : formatNumber(rawValue);
  
  const handleClick = () => {
    console.log("Y-axis label clicked:", { 
      value: rawValue, 
      formattedValue: formattedValue,
      yAxisId: yAxisId 
    });
    // For Y-axis, we can pass the value and axis info
    if (onDataClick) {
      onDataClick({ value: rawValue, formattedValue, yAxisId }, -1, yAxisId === "right" ? "rightAxis" : "leftAxis");
    }
  };

  // Set text anchor based on axis orientation
  const textAnchor = yAxisId === "right" ? "start" : "end";
  
  return (
    <g transform={`translate(${x},${y})`} pointerEvents="all">
      <title>{formattedValue}</title>
      <text
        x={0}
        y={0}
        dy={3}
        textAnchor={textAnchor}
        fontSize={12}
        className="cursor-pointer hover:fill-blue-600 transition-colors"
        onClick={handleClick}
      >
        {formattedValue}
      </text>
    </g>
  );
};

export const CustomLegendContent = ({
  labels,
  colors,
}: {
  labels: string[];
  colors: string[];
}) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {labels.map((labelText: string, index) => (
        <div className="flex items-center space-x-2" key={index}>
          <span
            style={{ backgroundColor: colors[index] }}
            className="w-3 h-3 rounded-full"
          ></span>
          <span className="text-subBody">{labelText}</span>
        </div>
      ))}
    </div>
  );
};

// Function to format numbers
export const formatTickValue = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return value.toString();
};

export const noDataFound = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <span className="text-subBody font-medium  dark:text-white">
        No Data Found!
      </span>
    </div>
  );
};

/**
 * Formats a number using international number format (locale-aware).
 * @param value - The number to format
 * @param locale - The locale string (default: "en-US")
 * @param options - Intl.NumberFormatOptions for customization
 * @returns Formatted number string (e.g., "1,234" or "1.234" depending on locale)
 */
export const formatInternationalNumber = (
  value: number,
  locale: string = "en-US",
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Custom hook for progressive reveal animation in charts
 * Reveals data points one by one from left to right
 * 
 * @param data - The data array to animate
 * @param delayPerPoint - Delay in milliseconds between each point appearing (default: 200ms)
 * @param initialDelay - Initial delay before animation starts (default: 200ms)
 * @returns The number of visible data points (starts at 0 and increases progressively)
 * 
 * @example
 * const visiblePoints = useProgressiveReveal(chartData, 150, 100);
 * const animatedData = useMemo(() => chartData.slice(0, visiblePoints), [chartData, visiblePoints]);
 */
export const useProgressiveReveal = <T,>(
  data: T[] | undefined,
  delayPerPoint: number = 200,
  initialDelay: number = 200
): number => {
  const [visibleDataPoints, setVisibleDataPoints] = useState(0);

  useEffect(() => {
    if (!data?.length) {
      setVisibleDataPoints(0);
      return;
    }

    setVisibleDataPoints(0); // Reset when data changes

    const totalPoints = data.length;
    let timer: NodeJS.Timeout | null = null;

    // Initial delay before starting animation
    const startTimer = setTimeout(() => {
      let currentPoint = 0;
      timer = setInterval(() => {
        currentPoint++;
        if (currentPoint <= totalPoints) {
          setVisibleDataPoints(currentPoint);
        } else {
          if (timer) clearInterval(timer);
        }
      }, delayPerPoint);
    }, initialDelay);

    return () => {
      clearTimeout(startTimer);
      if (timer) clearInterval(timer);
    };
  }, [data, delayPerPoint, initialDelay]);

  return visibleDataPoints;
};

/**
 * Creates padded chart data for progressive reveal animation
 * Pads visible data with placeholder values to maintain consistent chart width and prevent centering
 * 
 * @param visibleData - The currently visible data points (from slice)
 * @param fullData - The complete dataset
 * @param visibleDataPoints - Number of visible data points
 * @param chartConfig - Chart configuration object with keys and colors
 * @param lineKey - The key used for the line series (to exclude from bar placeholders)
 * @returns Padded data array with visible data + placeholder data
 * 
 * @example
 * const paddedData = createPaddedChartData(
 *   visibleData,
 *   cleanedChartData,
 *   visibleDataPoints,
 *   chartConfig,
 *   lineKey
 * );
 */
export const createPaddedChartData = <T extends Record<string, any>>(
  visibleData: T[],
  fullData: T[],
  visibleDataPoints: number,
  chartConfig: { [key: string]: { label: string; color: string } },
  lineKey: string
): T[] => {
  if (!fullData?.length) return [];
  
  const totalPoints = fullData.length;
  
  if (visibleDataPoints >= totalPoints) {
    return visibleData;
  }
  
  // Create placeholder data with zero values for remaining points
  const barKeys = Object.keys(chartConfig).filter((key) => key !== lineKey);
  const lastVisibleItem = visibleData[visibleData.length - 1];
  const lastVisibleLineValue = lastVisibleItem 
    ? (lastVisibleItem as any)[lineKey] ?? null
    : null;
  
  const placeholderData = Array.from({ length: totalPoints - visibleDataPoints }, (_, index) => {
    const placeholder: any = {
      label: fullData[visibleDataPoints + index]?.label || "",
    };
    // Set all bar values to 0 for placeholders (bars won't show)
    barKeys.forEach((key) => {
      placeholder[key] = 0;
    });
    // Use last visible line value to extend line smoothly
    if (lineKey) {
      placeholder[lineKey] = lastVisibleLineValue;
    }
    return placeholder;
  });
  
  return [...visibleData, ...placeholderData];
};

/**
 * Reusable chart animation styles component
 * Provides smooth bar growth animation from bottom to top with staggered delays
 */
export const ChartAnimations = () => {
  return (
    <style>{`
      @keyframes barGrowUp {
        from {
          transform: scaleY(0);
          opacity: 0;
        }
        to {
          transform: scaleY(1);
          opacity: 1;
        }
      }
    `}</style>
  );
};

/**
 * Hook to calculate animation delay for staggered bar animations
 * @param dataIndex - Index of the data point (0-based, left to right)
 * @param delayPerPoint - Delay in milliseconds between each point (default: 120ms)
 * @returns Animation delay in milliseconds
 */
export const useBarAnimationDelay = (
  dataIndex: number,
  delayPerPoint: number = 120
): number => {
  return dataIndex >= 0 ? dataIndex * delayPerPoint : 0;
};

/**
 * Get bar animation style with proper transform origin
 * @param x - X position of the bar
 * @param y - Y position of the bar (top)
 * @param width - Width of the bar
 * @param height - Height of the bar
 * @param animationDelay - Delay in milliseconds before animation starts
 * @param animationDuration - Duration of animation in milliseconds (default: 800ms)
 * @param additionalStyles - Additional CSS styles to merge
 * @returns Style object for the bar
 */
export const getBarAnimationStyle = (
  x: number,
  y: number,
  width: number,
  height: number,
  animationDelay: number = 0,
  animationDuration: number = 800,
  additionalStyles: React.CSSProperties = {}
): React.CSSProperties => {
  const bottomY = y + height;
  const centerX = x + width / 2;

  return {
    cursor: "pointer",
    transition: "fill-opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: `barGrowUp ${animationDuration}ms ease-out ${animationDelay}ms both`,
    transformOrigin: `${centerX}px ${bottomY}px`,
    ...additionalStyles,
  };
};

/**
 * Calculate hover effect dimensions for bars
 * @param x - Original X position
 * @param width - Original width
 * @param isHovered - Whether the bar is currently hovered
 * @param hoverScale - Scale factor when hovered (default: 1.12)
 * @returns Object with adjusted x position and width
 */
export const getBarHoverDimensions = (
  x: number,
  width: number,
  isHovered: boolean,
  hoverScale: number = 1.12
): { x: number; width: number } => {
  if (!isHovered) {
    return { x, width };
  }
  
  const scaledWidth = width * hoverScale;
  const adjustedX = x - (scaledWidth - width) / 2;
  
  return {
    x: adjustedX,
    width: scaledWidth,
  };
};

/**
 * Get hover effect styles for bars with attractive visual effects
 * @param isHovered - Whether the bar is currently hovered
 * @param barColor - Color of the bar (for glow effect)
 * @param x - X position of the bar
 * @param y - Y position of the bar (top)
 * @param width - Width of the bar
 * @param height - Height of the bar
 * @param hoverScale - Scale factor when hovered (default: 1.12)
 * @param hoverTransitionDuration - Transition duration in ms (default: 300)
 * @param hoverGlowIntensity - Glow intensity multiplier (default: 1.0)
 * @param hoverBrightness - Brightness increase on hover (default: 1.15)
 * @param hoverSaturation - Saturation increase on hover (default: 1.1)
 * @returns CSS properties for hover effect
 */
export const getBarHoverStyle = (
  isHovered: boolean,
  barColor: string,
  x: number,
  y: number,
  width: number,
  height: number,
  hoverScale: number = 1.12,
  hoverTransitionDuration: number = 300,
  hoverGlowIntensity: number = 1.0,
  hoverBrightness: number = 1.15,
  hoverSaturation: number = 1.1
): React.CSSProperties => {
  if (!isHovered) {
    return {};
  }

  const { x: hoverX, width: hoverWidth } = getBarHoverDimensions(x, width, true, hoverScale);
  const bottomY = y + height;
  const centerX = hoverX + hoverWidth / 2;

  // Calculate glow shadow sizes based on intensity
  const glowSize = 6 * hoverGlowIntensity;
  const glowBlur = 20 * hoverGlowIntensity;
  const shadowBlur = 8 * hoverGlowIntensity;

  // Convert hex color to rgba for glow effect (40 = 25% opacity)
  const colorWithOpacity = barColor.includes('#') 
    ? `${barColor}40` 
    : barColor.replace('rgb', 'rgba').replace(')', ', 0.25)');

  return {
    filter: `drop-shadow(0 ${glowSize}px ${glowBlur}px ${colorWithOpacity}) drop-shadow(0 2px ${shadowBlur}px rgba(0, 0, 0, 0.2)) brightness(${hoverBrightness}) saturate(${hoverSaturation})`,
    transform: `scaleY(${hoverScale})`,
    transformOrigin: `${centerX}px ${bottomY}px`,
    transition: `all ${hoverTransitionDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
    stroke: barColor,
    strokeWidth: 2,
    zIndex: 10,
  };
};

/**
 * Creates a path string for a rectangle with only top corners rounded.
 * @param x - X position
 * @param y - Y position (top edge)
 * @param width - Width of rectangle
 * @param height - Height of rectangle
 * @param radius - Radius for top corners only
 * @returns SVG path string
 */
export const createRoundedTopRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string => {
  if (radius <= 0) {
    // No radius, return simple rectangle
    return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
  }
  
  // Clamp radius to half of width or height (whichever is smaller)
  const maxRadius = Math.min(width / 2, height / 2);
  const r = Math.min(radius, maxRadius);
  
  // Path with only top corners rounded
  return `M ${x + r} ${y} 
          L ${x + width - r} ${y} 
          Q ${x + width} ${y} ${x + width} ${y + r} 
          L ${x + width} ${y + height} 
          L ${x} ${y + height} 
          L ${x} ${y + r} 
          Q ${x} ${y} ${x + r} ${y} 
          Z`;
};


// Custom label formatter to make the date/label prominent
export const labelFormatter = (label: string) => {
  return (
    <div className="text-subBody dark:text-white mb-1">
      {label}
    </div>
  );
};



export const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
 
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10} // <-- pop out by increasing outer radius
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* Optional: label inside the segment */}
      {/* <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#000">
        {payload.label}
      </text> */}
    </g>
  );
};



export interface CardRefs {
  current: Record<string, HTMLElement | null>;
}

export interface ExpandParams {
  key: string;
  cardRefs: CardRefs;
  expandedCard: string | null;
  setExpandedCard: Dispatch<SetStateAction<string | null>>;
}

export interface ExportPngParams {
  element: HTMLElement | null;
  filename: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export interface ExportPngByKeyParams {
  cardRefs: CardRefs;
  key: string;
  filename: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export interface ExportCsvFromUrlParams {
  url: string;
  filename: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export interface ExportCsvFromApiParams {
  apiCall: () => Promise<{ url?: string } | { data?: { url?: string } }>;
  filename: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  onLoading?: (loading: boolean) => void;
}

export interface ExportCsvWithPayloadParams {
  payload: any;
  apiHook: {
    refetch: () => Promise<{ url?: string } | { data?: { url?: string } }>;
  };
  filename: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  onLoading?: (loading: boolean) => void;
}


export const handleExpand = (params: ExpandParams): void => {
  const { key, cardRefs, expandedCard, setExpandedCard } = params;
  libOnExpand(key, cardRefs, expandedCard, setExpandedCard);
};

export const exportPng = async (params: ExportPngParams): Promise<void> => {
  const { element, filename, onError, onSuccess } = params;

  if (!element) {
    const error = new Error(`Export failed: Element is null`);
    onError?.(error);
    console.error(error.message);
    return;
  }

  try {
    const screenshot = await domToImage.toPng(element);
    downloadURI(screenshot, `${filename}.png`);
    onSuccess?.();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    console.error("Error exporting PNG:", err);
  }
};


export const exportPngByKey = async (params: ExportPngByKeyParams): Promise<void> => {
  const { cardRefs, key, filename, onError, onSuccess } = params;

  const element = cardRefs.current?.[key];

  if (!element) {
    const error = new Error(`Export failed: No element found for key "${key}"`);
    onError?.(error);
    console.error(error.message);
    return;
  }

  await exportPng({ element, filename, onError, onSuccess });
};

export const exportCsvFromUrl = (params: ExportCsvFromUrlParams): void => {
  const { url, filename, onError, onSuccess } = params;

  try {
    if (!url) {
      throw new Error("URL is required for CSV export");
    }

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onSuccess?.();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    console.error("Error downloading CSV:", err);
  }
};


export const exportCsvFromApi = async (params: ExportCsvFromApiParams): Promise<void> => {
  const { apiCall, filename, onError, onSuccess, onLoading } = params;

  try {
    onLoading?.(true);
    const response = await apiCall();
    
    // Handle different response structures
    const url = (response as any)?.url || (response as any)?.data?.url;
    
    if (!url) {
      throw new Error("API response does not contain a URL");
    }

    exportCsvFromUrl({ url, filename, onError, onSuccess });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    console.error("Error exporting CSV from API:", err);
  } finally {
    onLoading?.(false);
  }
};


export const exportCsvWithPayload = async (params: ExportCsvWithPayloadParams): Promise<void> => {
  const { payload, apiHook, filename, onError, onSuccess, onLoading } = params;

  try {
    onLoading?.(true);
    
    // Add export_type to payload
    const exportPayload = {
      ...payload,
      export_type: "csv",
    };

    // Call API with modified payload
    const response = await apiHook.refetch();
    
    // Handle different response structures
    const url = (response as any)?.url || (response as any)?.data?.url;
    
    if (!url) {
      throw new Error("API response does not contain a URL");
    }

    exportCsvFromUrl({ url, filename, onError, onSuccess });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    console.error("Error exporting CSV with payload:", err);
  } finally {
    onLoading?.(false);
  }
};


export const createCsvExportHandler = (params: ExportCsvFromApiParams) => {
  return () => exportCsvFromApi(params);
};

export const createCsvExportWithPayloadHandler = (params: ExportCsvWithPayloadParams) => {
  return () => exportCsvWithPayload(params);
};


export const createPngExportHandler = (params: ExportPngByKeyParams) => {
  return () => exportPngByKey(params);
};

export const createExpandHandler = (params: ExpandParams) => {
  return () => handleExpand(params);
};


 
 
 