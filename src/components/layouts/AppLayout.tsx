"use client";
import React, { useState } from "react";
import { useTheme } from "@/components/mf/theme-context";
import MFWebFraudAsideMenu from "@/components/mf/MFWebFraudAsideMenu";
import { MFTopBar } from "@/components/mf";
import { SessionCheck } from "@/components/mf/SessionCheck";
import { ScrollProgress } from "@/components/mf/ScrollProgress";
import { ScrollToTop } from "@/components/mf/ScrollToTop";

interface AppLayoutProps {
  children: React.ReactNode;
  scrollContainerId?: string;
  showScrollProgress?: boolean;
  showScrollToTop?: boolean;
  contentClassName?: string;
}

export default function AppLayout({
  children,
  scrollContainerId = "app-scroll-container",
  showScrollProgress = false,
  showScrollToTop = false,
  contentClassName = "flex-1 overflow-auto bg-gray-100 px-2 dark:bg-background",
}: AppLayoutProps) {
  const { isDarkMode } = useTheme();
  const [isHover, setIsHover] = useState(false);
  const [toggle, setToggle] = useState(false);

  const currentTheme = isDarkMode ? "dark" : "light";

  return (
    <div className="flex h-screen flex-col w-full dark:bg-black">
      {/* Scroll Progress Bar */}
      {showScrollProgress && (
        <ScrollProgress
          scrollContainer={`#${scrollContainerId}`}
          height={3}
          color="bg-primary dark:bg-primary"
          position="top"
          showPercentage={true}
        />
      )}

      {/* Header */}
      <MFTopBar
        isExpanded={toggle || isHover}
        onToggle={() => setToggle(!toggle)}
        isCalender={true}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        <MFWebFraudAsideMenu
          isExpanded={toggle || isHover}
          onHover={setIsHover}
          theme={currentTheme}
        />
        <SessionCheck>
          <div id={scrollContainerId} className={contentClassName}>
            {children}
          </div>
          {showScrollToTop && (
            <ScrollToTop
              threshold={100}
              position="bottom-right"
              scrollContainer={`#${scrollContainerId}`}
            />
          )}
        </SessionCheck>
      </div>
    </div>
  );
}




