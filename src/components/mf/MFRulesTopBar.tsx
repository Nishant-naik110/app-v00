"use client";
import { useTheme } from "./theme-context";
import {
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Settings,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Link from "next/link";
import { Button } from "../ui/button";
import { MFSingleSelect } from "./MFSingleSelect";
import { MFDateRangePicker } from "./MFDateRangePicker";
import SignOutButton from "./SignOut";
import { usePathname } from "next/navigation";
import { getToken } from "@/lib/token";
import { useEffect, useState } from "react";

type MFRulesTopBarType = {
  isExpanded: boolean;
  onToggle: () => void;
};

const enable: string[] = [
  "app/dashboard/install",
  "webfraud/Dashboard/overall-summary",
  
];

function MFRulesTopBar({ isExpanded, onToggle }: MFRulesTopBarType) {
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="shadow-blue-gray-900/5 col-span-2 h-14 bg-background dark:bg-gray-900 dark:text-white">
      <div className="mx-2 flex h-full grow items-center gap-2">
        <Button
          title="Toggle Menu"
          variant="ghost"
          className="w-14 rounded-md border text-center dark:bg-gray-900 dark:text-white"
          size="icon"
          onClick={onToggle}
        >
          {isExpanded ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
        {enable.includes(pathname) && (
          <>
            <PackageSelect />
            <DashboardSelect />
            <MFDateRangePicker className="rounded-md border" />
          </>
         )} 
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="rounded-md border"
          >
            {isDarkMode ? <Moon /> : <Sun />}
          </Button>
          <UserPopUp />
        </div>
      </div>
    </div>
  );
}


export default MFRulesTopBar;

function UserPopUp() {
  const [Uname, setUname] = useState("");

  useEffect(() => {
    const { username } = getToken();
    setUname(username);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="ml-auto mr-2 rounded-md border"
          variant="ghost"
          size="icon"
          title="User"
        >
          <User />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mr-4 w-fit overflow-clip p-0">
        <div className="flex flex-col">
          <div className="bg-slate-200 p-4 dark:bg-slate-700">
            <p className="text-header">{Uname}</p>
            <p className="">mail@mfilterit.com</p>
          </div>
          <ul className="flex justify-between gap-2 px-4 py-2">
            <li>
              <Link href="/user-details">
                <Button title="Settings" variant="ghost" size="icon">
                  <Settings />
                </Button>
              </Link>
            </li>
            <li className="hover:text-red-500">
              <SignOutButton />
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PackageSelect() {
  const items = [
    { title: "Test", value: "test" },
    { title: "ITC", value: "ITC" },
    { title: "demo package demo package", value: "demo" },
    { title: "Test 1", value: "test1" },
    { title: "ITC 1", value: "ITC1" },
    { title: "demo package 1", value: "demo1" },
  ];
  return (
    <MFSingleSelect
      items={items}
      placeholder="Select Package"
      title="Package"
      className="max-w-40"
    />
  );
}

function DashboardSelect() {
  const items = [
    { title: "Install", value: "Install" },
    { title: "Event", value: "Event" },
  ];
  return (
    <MFSingleSelect
      items={items}
      placeholder="Select Type"
      title="Type"
      className="max-w-40"
    />
  );
}
