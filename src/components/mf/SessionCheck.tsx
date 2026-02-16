
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UnauthorizedError } from '@/common/errors';
import { useSignOut } from "@/queries";
import React from 'react';

interface SessionCheckProps {
  children: React.ReactNode;
}

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Config: Add routes here to skip protection
const skipProtectedRoutes: string[] = [
  // Example: '/webfraud/Dashboard/overall-summary',
  // Add more routes as needed
];

export const SessionCheck = ({ children }: SessionCheckProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionDuration, setSessionDuration] = useState(0);
  const [idleDuration, setIdleDuration] = useState(0);
  
  // Get the base URL from window.location.origin (e.g., http://localhost:3000 or https://uat-dashboard.mfilterit.net)
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const sessionStart = useRef<number>(0);
  const lastActivityTime = useRef<number>(Date.now());
  const isSigningOut = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate } = useSignOut(
    // onError callback
    (error) => {
      console.log("Session check sign out error:", error);
      // For any error, clean up session and redirect to base URL
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = getBaseUrl();
      }
    },
    // onSuccess callback
    (data) => {
      console.log("Session check sign out success:", data);
      // Clear session and redirect to base URL on success
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = getBaseUrl();
      }
    }
  );   

  const triggerSignOutApi = () => {
    if (isSigningOut.current) {
      console.log("Sign out already in progress, skipping...");
      return;
    }
    
    isSigningOut.current = true;
    const token = localStorage.getItem("AccessToken") || "";
    console.log("Triggering sign out API call...");
    mutate(token);
  };

  const handleSessionExpired = (reason = 'Session expired') => {
    if (isSigningOut.current) {
      console.log("Already signing out, skipping...");
      return;
    }
    
    console.warn(`Session expired: ${reason}`);
    if (pathname !== '/') {
      localStorage.setItem('redirectPath', pathname);
    }
    
    // Clear the interval to prevent multiple calls
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    triggerSignOutApi();
  };

  const checkTokenSession = () => {
    const accessToken = localStorage.getItem('AccessToken');
    const idToken = localStorage.getItem('IdToken') || localStorage.getItem('IDToken');

    if (!accessToken || !idToken) {
      throw new UnauthorizedError('Missing tokens');
    }

    try {
      // Check if token has the expected format (3 parts separated by dots)
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) {
        throw new UnauthorizedError('Invalid token format');
      }

      const tokenData = JSON.parse(atob(tokenParts[1]));
      
      // Check if token has expiration
      if (!tokenData.exp) {
        throw new UnauthorizedError('Token missing expiration');
      }

      // Check if token is expired (with 5 minute buffer)
      const currentTime = Date.now();
      const tokenExpiration = tokenData.exp * 1000;
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

      if (tokenExpiration - bufferTime < currentTime) {
        throw new UnauthorizedError('Token expired or expiring soon');
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      // If JSON parsing fails or other errors, treat as invalid token
      throw new UnauthorizedError('Invalid token');
    }
  };

  const handleActivity = () => {
    lastActivityTime.current = Date.now();
    setIdleDuration(0);
  };

  // Skip protection for configured routes
  if (skipProtectedRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (pathname === '/') return;

    // Reset sign out flag when component mounts
    isSigningOut.current = false;

    // Initial token check - enable this to check tokens on component mount
    try {
      checkTokenSession();
    } catch {
      handleSessionExpired('Initial token/session check failed');
      return;
    }

    if (!localStorage.getItem('loginTimestamp')) {
      localStorage.setItem('loginTimestamp', Date.now().toString());
    }
    sessionStart.current = parseInt(localStorage.getItem('loginTimestamp') || `${Date.now()}`, 10);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setSessionDuration(Math.floor((now - sessionStart.current) / 1000));
      setIdleDuration(Math.floor((now - lastActivityTime.current) / 1000));

      try {
        checkTokenSession();
      } catch {
        handleSessionExpired('Token expired during interval check');
        return;
      }

      if (now - lastActivityTime.current > IDLE_TIMEOUT) {
        console.warn('🚨 Idle timeout triggered');
        handleSessionExpired('Idle timeout');
      }
    }, 1000);

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => document.addEventListener(event, handleActivity));

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        try {
          checkTokenSession();
        } catch {
          handleSessionExpired('Token expired on tab focus');
        }
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [pathname]);

  return (
    <>
      {/* <div> 
       ⏱ Session: {sessionDuration}s | 💤 Idle: {idleDuration}s
      </div> */}
      {children}
    </>
  );
};