"use client";
import clsx from "clsx";
import { ChevronDown, Dot, Globe } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "../ui/button";

type MenuItem = {
  title: string;
  icon: React.ReactNode;
  subMenu?: MenuItem[];
  route?: string;
};

const menu: MenuItem[] = [
  {
    title: "Rules Configuration",
    icon: <Globe size={18} />,
    subMenu: [
      // {
      //   title: "Campaign Creation",
      //   icon: "",
      //   subMenu: [],
      //   route: "/unified-ad-manager/campaign",
      // },
      // {
      //   title: "Campaign Optimisation",
      //   icon: "",
      //   subMenu: [],
      //   route: "/unified-ad-manager/optimisation",
      // },
      // {
      //   title: "Insights And Performance",
      //   icon: "",
      //   subMenu: [
      //     {
      //       title: "Campaign Overview",
      //       icon: "",
      //       subMenu: [],
      //       route:
      //         "/unified-ad-manager/insights-and-performance/campaign-overview",
      //     },
      //     {
      //       title: "Ad Group Overview",
      //       icon: "",
      //       subMenu: [],
      //       route:
      //         "/unified-ad-manager/insights-and-performance/ad-group-overview",
      //     },
      //     {
      //       title: "Keyword Overview",
      //       icon: "",
      //       subMenu: [],
      //       route:
      //         "/unified-ad-manager/insights-and-performance/keyword-overview",
      //     },
      //     {
      //       title: "Product Overview",
      //       icon: "",
      //       subMenu: [],
      //       route:
      //         "/unified-ad-manager/insights-and-performance/product-overview",
      //     },
      //   ],
      // },
      // {
      //   title: "ECOM Analysis",
      //   icon: "",
      //   subMenu: [
      //     {
      //       title: "Keyword Analysis",
      //       icon: "",
      //       subMenu: [],
      //       route: "/unified-ad-manager/CampaignAnalytics",
      //     },
      //     {
      //       title: "Ecom Signals",
      //       icon: "",
      //       subMenu: [],
      //       route: "/unified-ad-manager/EcomSignals",
      //     },
      //   ],
      // },
      // {
      //   title: "Rule Engine",
      //   icon: "",
      //   subMenu: [
      //     {
      //       title: "Rules",
      //       icon: "",
      //       subMenu: [],
      //       route: "/unified-ad-manager/rule-engine",
      //     },
      //     {
      //       title: "Workflow",
      //       icon: "",
      //       subMenu: [],
      //       route: "/unified-ad-manager/workflow",
      //     },
      //   ],
      // },
      {
        title: "Rules",
        icon: "",
        route: "/rules-configuration/rules",
      },
      {
        title: "Home",
        icon: "",
        route: "/unified-ad-manager/campaign"
      },
    ],
  },
];

function MFRulesAsideMenu({
  isExpanded = true,
  onHover = (e: boolean) => console.log(e),
  theme = "light", // Default theme
}) {

  const router = useRouter();

  return (
    <div
      className={clsx(
        "z-10 flex h-full flex-col bg-clip-border text-gray-300 shadow-xl transition-all",
        {
          "bg-gray-900": theme === "dark",
          "bg-secondary": theme === "light",
          "absolute bottom-0 left-0 top-14 w-[14rem] max-w-[14rem] p-2 md:relative md:top-auto":
            isExpanded,
          "w-0 max-w-[4rem] md:w-full md:p-1": !isExpanded,
        },
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <nav className="text-blue-gray-700 flex flex-col gap-1 overflow-auto font-sans text-base font-normal">
        {menu.map((v, i) => (
          <MenuItem key={i} {...v} isExpanded={isExpanded} theme={theme} />
        ))}
      </nav>

      <div className="mx-auto mt-auto">
        {/* {isExpanded && <Button className="mb-4" onClick={() => router.push('/unified-ad-manager/campaign')}>Unified Ad Manager</Button>} */}
        <h5 className="text-blue-gray-900 block font-sans text-xl font-semibold leading-snug tracking-normal antialiased delay-300">
          {isExpanded && (
            <Image
              src="https://infringementportalcontent.mfilterit.com/images/media/logos/mfilterit-white-logo.png"
              alt="logo"
              width={200}
              height={30}
            />
          )}
          {!isExpanded && (
            <Image
              src="https://infringementportalcontent.mfilterit.com/images/Icon.png"
              alt="logo"
              width={50}
              height={30}
            />
          )}
        </h5>
      </div>
    </div>
  );
}

export default MFRulesAsideMenu;

type MenuItemProps = MenuItem & { isExpanded?: boolean; theme?: string };

function MenuItem({
  title = "Dashboard",
  icon = "",
  route,
  subMenu = [],
  isExpanded,
  theme,
}: MenuItemProps) {
  const [Open, setOpen] = useState(true);
  const pathName = usePathname();
  const router = useRouter();

  return (
    <div className="relative my-1 block w-full">
      <div
        role="button"
        className="flex overflow-hidden rounded-lg p-0 text-start leading-tight outline-none transition-all hover:bg-primary hover:bg-opacity-80"
      >
        <button
          type="button"
          className={clsx(
            "flex w-full select-none items-center border-b-0 p-1 text-left font-sans text-xl font-semibold leading-snug antialiased transition-colors",
            { "justify-start": isExpanded },
            { "justify-center": !isExpanded },
            {
              "bg-gray-700 hover:bg-primary": theme === "dark",
              "bg-secondary hover:bg-primary": theme === "light",
            },
            { "bg-primary": pathName === route },
          )}
          onClick={() => {
            if (route) router.push(route);
            setOpen(!Open);
          }}
        >
          <div className="mr-2 grid w-[18px] place-items-center">
            {icon && icon}
            {!icon && <Dot size={18} />}
          </div>
          {isExpanded && (
            <p
              title={title}
              className="mr-auto block overflow-hidden text-ellipsis whitespace-nowrap font-sans text-base font-normal leading-relaxed antialiased"
            >
              {title}
            </p>
          )}
          {subMenu.length > 0 && isExpanded && (
            <span
              className={clsx("ml-4 transition-all", { "rotate-180": !Open })}
            >
              <ChevronDown size={18} />
            </span>
          )}
        </button>
      </div>
      {subMenu.length > 0 && isExpanded && (
        <div
          className={clsx("overflow-hidden transition-all", { "h-0": Open })}
        >
          <div className="ml-2 block py-1 font-sans text-subBody font-light leading-normal antialiased">
            {subMenu.map((v, i) => (
              <MenuItem key={i} {...v} isExpanded={isExpanded} theme={theme} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
