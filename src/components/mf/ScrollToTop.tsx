"use client";
 
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
 
export interface ScrollToTopProps {
  /**
   * Minimum scroll position (in pixels) before button appears
   * @default 400
   */
  threshold?: number;
  /**
   * Position of the button
   * @default "bottom-right"
   */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom scroll container selector (for scrolling within a specific container)
   * If not provided, scrolls the window
   */
  scrollContainer?: string;
  /**
   * Smooth scroll behavior
   * @default true
   */
  smooth?: boolean;
  /**
   * Scroll animation duration (in milliseconds)
   * @default 500
   */
  scrollDuration?: number;
  /**
   * Custom scroll easing function
   * @default cubic easing
   */
  easingFunction?: (t: number) => number;
}
 
/**
 * ScrollToTop Button Component
 *
 * A floating button that appears when user scrolls down and allows them to quickly scroll back to the top.
 *
 * @example
 * ```tsx
 * <ScrollToTop
 *   threshold={300}
 *   position="bottom-right"
 * />
 * ```
 */
export function ScrollToTop({
  threshold = 400,
  position = 'bottom-right',
  className,
  scrollContainer,
  smooth = true,
  scrollDuration = 500,  // Default scroll duration
  easingFunction = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,  // Default easing function
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollElement, setScrollElement] = useState<HTMLElement | Window | null>(null);
 
  useEffect(() => {
    // Determine scroll element
    let element: HTMLElement | Window = window;
   
    if (scrollContainer) {
      // Wait a bit for DOM to be ready
      const findContainer = () => {
        const container = document.querySelector(scrollContainer) as HTMLElement;
        if (container) {
          element = container;
          setScrollElement(element);
        } else {
          // Container not found, fallback to window
          console.warn(`ScrollToTop: Container "${scrollContainer}" not found, using window scroll`);
          setScrollElement(window);
        }
      };
     
      // Try immediately and also after a delay
      findContainer();
      const timeoutId = setTimeout(findContainer, 200);
     
      return () => clearTimeout(timeoutId);
    } else {
      setScrollElement(window);
    }
  }, [scrollContainer]);
 
  useEffect(() => {
    if (!scrollElement) return;
 
    const handleScroll = () => {
      let scrollTop = 0;
     
      if (scrollElement === window) {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      } else {
        scrollTop = (scrollElement as HTMLElement).scrollTop || 0;
      }
 
      const shouldBeVisible = scrollTop > threshold;
      setIsVisible(shouldBeVisible);
     
    };
 
    // Better performance with requestAnimationFrame
    const handleScrollWithRAF = () => {
      requestAnimationFrame(handleScroll);
    };
 
    // Initial check with requestAnimationFrame to ensure it's performed at the right time
    requestAnimationFrame(handleScrollWithRAF);
 
    // Add scroll listener
    scrollElement.addEventListener('scroll', handleScrollWithRAF, { passive: true });
 
    // Also check on resize in case content changes
    window.addEventListener('resize', handleScrollWithRAF, { passive: true });
 
    return () => {
      scrollElement.removeEventListener('scroll', handleScrollWithRAF);
      window.removeEventListener('resize', handleScrollWithRAF);
    };
  }, [threshold, scrollElement]);
 
  const scrollToTop = () => {
    if (!scrollElement) return;
 
    const startPosition = scrollElement === window
      ? window.pageYOffset || document.documentElement.scrollTop
      : (scrollElement as HTMLElement).scrollTop;
 
    const startTime = performance.now();
    const duration = scrollDuration;
 
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easingFunction(progress);
      const position = startPosition * (1 - eased);
 
      if (scrollElement === window) {
        window.scrollTo(0, position);
      } else {
        (scrollElement as HTMLElement).scrollTop = position;
      }
 
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
 
    requestAnimationFrame(animateScroll);
  };
 
  if (!isVisible) {
    return null;
  }
 
  const positionClasses = {
    'bottom-right': 'bottom-8 right-10',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };
 
  return (
    <Button
      onClick={scrollToTop}
      tabIndex={0}  // Make button focusable
      aria-label="Scroll to top"  // Label for accessibility
      title="Scroll to top"
      aria-live="polite"  // Announce visibility to screen readers
      className={cn(
        'p-2',
        'fixed z-[9999] h-8 w-8 shadow-2xl',
        'bg-primary text-white',
        'transition-all duration-300 ease-in-out',
        'opacity-50 hover:opacity-100',
        'hover:scale-110 active:scale-95',
        'hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]',
        'rounded-md',
        positionClasses[position],
        className
      )}
      style={{ pointerEvents: 'auto' }}
    >
      <ArrowUp className="h-4 w-4" size={20} />
    </Button>
  );
}