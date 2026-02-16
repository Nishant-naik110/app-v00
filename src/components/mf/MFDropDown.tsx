import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, FileImage, FileSpreadsheet } from "lucide-react";

const list = [
  {
    icon: <FileSpreadsheet className="mr-2" size={15} />,
    label: "CSV",
    onClick: () => downloadCsv(),
  },
  { icon: <FileImage className="mr-2" size={15} />, label: "PNG" },
];

export function MFDropDown({ items: [] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Export</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {list.map((v, i) => (
          <DropdownMenuItem
            key={i}
            className="flex items-center"
            onClick={v.onClick}
          >
            {v.icon}
            <span>{v.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function downloadCsv() {
  const s = `Month,Clean,Fraud,
  Jan,186,80,
  Feb,305,200,
  Mar,237,120,
  Apr,73,120,
  May,209,130,
  Jun,214,140`;

  const csvBlob = new Blob([s], { type: "text/csv" });

  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(csvBlob);
  downloadLink.download = "data.csv";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
