import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, FileUp, Maximize } from "lucide-react";
import React from "react";

type MFChartDropdown = {
  items: string[];
  onClick: (s: string) => void;
  onExport: (type: "csv" | "png") => void;
  onExpand: () => void;
};

export default function MFChartDropdown({
  items = [],
  onClick,
  onExpand,
  onExport,
}: MFChartDropdown) {
  const [position, setPosition] = React.useState(items.at(0) ?? "");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={position}
          onValueChange={(v) => {
            setPosition(v);
            onClick(v);
          }}
        >
          {items.map((v, i) => (
            <DropdownMenuRadioItem key={i} value={v}>
              {v}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onExpand()}>
            <Maximize size={20} className="mr-2" />
            <span>Expand</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileUp size={20} className="mr-2" />
            <span>Export</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onExport("csv")}>
                <span>CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("png")}>
                <span>PNG</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
