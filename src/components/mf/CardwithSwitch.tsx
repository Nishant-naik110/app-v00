"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent, SelectGroup } from "../ui/select";
import { Loader2 } from "lucide-react";

interface CardSwitchProps {
  Title?: string;
  Sub_title?: string[];
  Placeholder?: string;
  value?: {
    title: string;
    options: {
      label: string;
      value: string;
      checked?: boolean;
    }[];
  }[];
  isSelect?: boolean;
  direction?: "rows" | "cols";
  isLoading?: boolean;
  enabledStates?: boolean[];
  onSwitchChange?: (index: number, checked: boolean) => void;
  loadingIndex?: number;
}

const CardwithSwitch = ({
  Title,
  Sub_title = [],
  Placeholder = "",
  value = [],
  isSelect = false,
  direction = "cols",
  isLoading = false,
  enabledStates = [],
  onSwitchChange,
  loadingIndex,
}: CardSwitchProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(300);
//console.log("option values:",value);
  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        const height = Math.max(contentRef.current.scrollHeight, 300);
        setContentHeight(height);
      }
    };

    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [Sub_title, value]);

  return (
    <Card className='border-none w-full h-full p-2'>
      <CardTitle className='text-body font-semibold p-2'>
        {Title}
      </CardTitle>
      <div className="border-secondary border-b-2 ml-3 mr-3 mt-2"></div>
      <CardContent className="relative min-h-[200px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div 
            ref={contentRef}
            className={`grid lg:grid-${direction}-2 md:grid-${direction}-2 sm:grid-${direction}-1 gap-4 w-full`}
          >
            {Sub_title.map((title, index) => (
              <div key={index} className='flex flex-col gap-4 w-full'>
                <div className="flex flex-row items-center w-full">
                  <div className="text-body text-subBody w-full">
                    {title}
                  </div>
                  <div className="relative inline-flex items-center p-3">
                    <Switch
                      checked={enabledStates[index]}
                      onCheckedChange={(checked) => onSwitchChange?.(index, checked)}
                      disabled={loadingIndex === index}
                    />
                    {loadingIndex === index && (
                      <div className="absolute left-[-1.5rem]">
                        <Loader2 className="animate-spin h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                  {isSelect && (
                    <Select>
                      <SelectTrigger className="h-[30px] outline-none focus:ring-0 text-subBody dark:text-white">
                        <SelectValue placeholder={Placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {value.find(v => v.title === title)?.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CardwithSwitch;