"use client";
 
import { useEffect, useState, useRef } from "react";
 
interface ScrollProgressProps {
  scrollContainer?: string; // CSS selector for scroll container (defaults to window)
  height?: number; // Height of progress bar in pixels (default: 3)
  color?: string; // Color of progress bar (default: primary color)
  position?: "top" | "bottom"; // Position of progress bar (default: "top")
  className?: string; // Additional CSS classes
  topOffset?: number; // Top offset in pixels (for positioning below fixed headers)
  showPercentage?: boolean; // Show percentage text (default: false)
}
 
export const ScrollProgress = ({
  scrollContainer,
  height = 3,
  color,
  position = "top",
  className = "",
  topOffset = 0,
  showPercentage = false,
}: ScrollProgressProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 
  useEffect(() => {
    const container = scrollContainer
      ? document.querySelector(scrollContainer)
      : window;
 
    if (!container) return;
 
    const calculateScrollProgress = () => {
      let scrollTop: number;
      let scrollHeight: number;
      let clientHeight: number;

      if (scrollContainer) {
        const element = container as HTMLElement;
        scrollTop = element.scrollTop;
        scrollHeight = element.scrollHeight;
        clientHeight = element.clientHeight;
      } else {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      }

      const totalScroll = scrollHeight - clientHeight;
      const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      
      // Show percentage when scrolling
      if (showPercentage) {
        setIsScrolling(true);
        
        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // Hide percentage after scrolling stops (500ms delay)
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 500);
      }
    };
 
    // Initial calculation
    calculateScrollProgress();
 
    // Add scroll event listener
    container.addEventListener("scroll", calculateScrollProgress, { passive: true });
 
    // Also listen for resize events to recalculate
    window.addEventListener("resize", calculateScrollProgress, { passive: true });
 
    return () => {
      container.removeEventListener("scroll", calculateScrollProgress);
      window.removeEventListener("resize", calculateScrollProgress);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollContainer]);
 
  const progressColor = color || "bg-primary";
 
  // Use sticky if className contains "sticky", otherwise use fixed
  const isSticky = className.includes("sticky");
  const positionClass = isSticky
    ? `sticky ${position === "top" ? "top-0" : "bottom-0"}`
    : `fixed ${position === "top" ? "top-0" : "bottom-0"}`;
 
  // Calculate top position with offset for fixed positioning
  const topPosition = !isSticky && position === "top" && topOffset > 0
    ? `${topOffset}px`
    : position === "top" ? "0" : "auto";
 
  return (
    <div
      ref={progressRef}
      className={`${positionClass} left-0 right-0 z-[9998] ${className.replace("sticky", "").trim()}`}
      style={{
        height: showPercentage ? `${height + 20}px` : `${height}px`,
        top: topPosition,
      }}
    >
      <div className="relative w-full h-full">
        <div
          className={`transition-all duration-150 ease-out ${progressColor}`}
          style={{ 
            width: `${scrollProgress}%`,
            height: `${height}px`,
          }}
        />
        {showPercentage && isScrolling && (
          <div 
            className="absolute top-0 flex items-center transition-all duration-150 ease-out"
            style={{ 
              left: `${scrollProgress}%`,
              height: `${height}px`,
              transform: "translateX(-50%)",
              marginTop: `${height + 4}px`,
            }}
          >
            <span className="text-xs font-semibold text-foreground bg-background/90 dark:bg-background/90 px-1.5 py-0.5 rounded shadow-sm">
              {Math.round(scrollProgress)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
 
 
 