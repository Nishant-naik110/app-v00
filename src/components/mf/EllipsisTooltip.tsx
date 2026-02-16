"use client";
import React, { useRef, useEffect, useState } from "react";

interface EllipsisTooltipProps {
  content: string | number;
  className?: string;
}

const EllipsisTooltip = ({ content, className }: EllipsisTooltipProps) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    // Allow time for layout
    const checkTruncation = () => {
      if (el.scrollWidth > el.clientWidth) {
        setShowTooltip(true);
      } else {
        setShowTooltip(false);
      }
    };
    // Small timeout to allow layout
    const timeout = setTimeout(checkTruncation, 0);
    return () => clearTimeout(timeout);
  }, [content]);

  return (
    <span
      ref={spanRef}
      className={`block overflow-hidden text-ellipsis whitespace-nowrap ${className || ""}`}
      title={showTooltip ? String(content) : undefined}
    >
      {content}
    </span>
  );
};

export default EllipsisTooltip;
