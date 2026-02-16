"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Item {
  title: string;
  value: string;
}

interface MFSingleSelectProps {
  items: Item[];
  placeholder?: string;
  className?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  /* search state may be controlled by the parent, or we keep it internally */
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  leadingIcon?: React.ReactNode;
  showSearch?: boolean;
}

export function MFSingleSelect({
  items,
  placeholder = "Select…",
  className,
  value,
  onValueChange,
  searchQuery,
  setSearchQuery,
  leadingIcon,
  showSearch = false,
}: MFSingleSelectProps) {
  /* Uncontrolled (internal) search state when the parent doesn’t pass one */
  const [innerQuery, setInnerQuery] = React.useState("");
  const q = searchQuery ?? innerQuery;
  const setQ = setSearchQuery ?? setInnerQuery;

  /* Filter the list by the query */
  const filtered = items.filter((i) =>
    (i?.title ?? "").toLowerCase().includes(q.toLowerCase()));

  /* Make sure the currently‑selected item is always present */
  const selected = items.find((i) => i.value === value);
  const displayItems =
    selected && !filtered.some((i) => i.value === selected.value)
      ? [selected, ...filtered]
      : filtered;

  const searchRef = React.useRef<HTMLInputElement>(null);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onValueChange?.(v);
        setQ("");
      }}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        requestAnimationFrame(() => searchRef.current?.focus());
      }}
    >
      <SelectTrigger className={`flex items-center gap-3 ${className}`}>
  {leadingIcon && (
    <span className="flex-shrink-0 text-muted-foreground">
      {leadingIcon}
    </span>
  )}

  <SelectValue placeholder={placeholder} />
</SelectTrigger>
 
      <SelectContent>
        {
          (displayItems?.length > 10 || showSearch) && (
            <div className="px-2 pb-2">
              <Input
                ref={searchRef}
                placeholder="Search…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="h-8"
              />
            </div>
          )
        }


        {displayItems.length ? (
          displayItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.title}
            </SelectItem>
          ))
        ) : (
          <div className="px-2 py-1 text-subBody text-muted-foreground">No results</div>
        )}
      </SelectContent>
    </Select>
  );
}

