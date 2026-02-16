"use client"
import { useState, useEffect } from 'react';

/**
 * Custom hook to detect and track fullscreen state
 * Safe for SSR - returns false on server side
 * @returns {boolean} Current fullscreen state
 */
export function useFullscreen(): boolean {
  // Initialize with false for SSR safety
  const [fullscreenState, setFullscreenState] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Function to check fullscreen state
    const checkFullscreen = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setFullscreenState(isFullscreen);
    };

    // Set initial state
    checkFullscreen();

    // Listen for changes
    const handleFullscreenChange = () => {
      checkFullscreen();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return fullscreenState;
} 