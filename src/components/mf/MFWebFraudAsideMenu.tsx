 
"use client";
import clsx from "clsx";
import {
  ChevronDown,
  Dot,
  Globe,
  LayoutDashboard,
  Settings,
  Download,
  NotebookPen,
  NotepadText,
  Mails,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useRef, useEffect, useState } from "react";
import { Button } from "../ui/button";
 
import ToastContent, { ToastType } from "./ToastContent";
import { usePackage } from "./PackageContext";
import { useMenu } from "./MenuContext";
import { fetchMenuWithPackage } from "@/lib/menu-utils";
 
type MenuItem = {
  title: string;
  icon: React.ReactNode;
  subMenu?: MenuItem[];
  route?: string;
  embeddedMenu?: boolean;
  url?: string;
};
 
type ApiMenuItem = {
  Name: string;
  Route: string;
  Icon: string;
  Permission: string[];
  SubMenus: ApiMenuItem[];
  EmbeddedMenu?: boolean;
  Url?: string;
};
 
const convertApiResponseToMenu = (apiMenu: ApiMenuItem[]): MenuItem[] => {
  return apiMenu.map((item) => {
    const parseSvgString = (svgString: string) => {
      if (!svgString) return <Dot size={18} />;
      const cleanSvg = svgString
        .replace(/\\"/g, '"')
        .replace(/class=/g, "className=");
      const div = document.createElement("div");
      div.innerHTML = cleanSvg;
      const svgElement = div.firstChild as SVGElement;
 
      if (svgElement) {
        const attributes: { [key: string]: string } = {};
        Array.from(svgElement.attributes).forEach((attr) => {
          const reactAttr = attr.name.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase()
          );
          attributes[reactAttr] = attr.value;
        });
 
        return (
          <svg {...attributes}>
            {Array.from(svgElement.children).map((child, index) => {
              const TagName = child.tagName;
              const props = Object.fromEntries(
                Array.from(child.attributes).map((attr) => [
                  attr.name,
                  attr.value,
                ])
              );
              return React.createElement(TagName, { ...props, key: index });
            })}
          </svg>
        );
      }
 
      return <Dot size={18} />;
    };
 
    return {
      title: item.Name,
      icon: parseSvgString(item.Icon),
      route: item?.Route || undefined,
      subMenu: item?.SubMenus
        ? convertApiResponseToMenu(item?.SubMenus)
        : undefined,
    };
  });
};
 
function MFWebFraudAsideMenuContent({
  isExpanded = false,
  onHover = (e: boolean) => console.log(e),
  theme = "light",
}) {
  const router = useRouter();
  const pathName = usePathname();
 
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [toastData, setToastData] = useState<{
    type: ToastType;
    title: string;
    description?: string;
    variant?: "default" | "destructive" | null;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
 
  const { selectedPackage } = usePackage();
  const { setMenuData: setContextMenuData } = useMenu();
 
  // API call to fetch menu data with package name
  const fetchMenuData = async () => {
    try {
      const token = localStorage.getItem("IDToken");
      if (!token) {
        console.error("No token available");
        return;
      }
        // Get the current product name from the pathname
       let productName = "App Performance";
       if (pathName.startsWith("")) {
         productName = "App Performance";
       } else if (pathName.startsWith("/web")) {
         productName = "Web Performance";
       } else if (pathName.startsWith("/brand-infringement")) {
        productName = "Brand Infringement";
      }
     
 
      const menuData = await fetchMenuWithPackage(
        token,
        productName,
        selectedPackage
      );
      // Store raw API menu data in context for other components to use
      setContextMenuData(menuData);
      const convertedMenu = convertApiResponseToMenu(menuData);
      setMenuData(convertedMenu);
    } catch (error) {
      console.error("Error fetching menu:", error);
     
    }
  };
 
  useEffect(() => {
    if (!isInitialized) {
      fetchMenuData();
      setIsInitialized(true);
    }
  }, [isInitialized]);
 
  // now i want to implement when i open keyword monitor menu it should open the submenu and when i click on the submenu it should open the route
 
  // ✅ Display hardcoded menu + API menu
  const displayMenu = React.useMemo(
    () => [...menuData],
    [menuData]
  );
 
  // Only call API when selectedPackage changes
  useEffect(() => {
    if (isInitialized && selectedPackage) {
      fetchMenuData();
    }
  }, [selectedPackage]);
 
  // Helper function to find which parent menu contains the current route
  const findMenuIndexWithActiveRoute = React.useCallback(
    (menus: MenuItem[]): number | null => {
      if (!pathName) return null;
 
      // Helper to check if any submenu (including nested) matches
      const hasActiveSubmenu = (subMenus: MenuItem[]): boolean => {
        return subMenus.some((sub) => {
          // Check if this submenu route matches
          if (sub.route) {
            if (pathName === sub.route || pathName.startsWith(sub.route + "/")) {
              return true;
            }
          }
          // Check nested submenus recursively
          if (sub.subMenu && sub.subMenu.length > 0) {
            return hasActiveSubmenu(sub.subMenu);
          }
          return false;
        });
      };
 
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
 
        // Priority 1: Check if any submenu matches (this takes highest priority)
        if (menu.subMenu && menu.subMenu.length > 0) {
          if (hasActiveSubmenu(menu.subMenu)) {
            return i;
          }
        }
 
        // Priority 2: Check if the menu route itself matches
        // Only if no submenu matched, or if this is an exact match
        if (menu.route) {
          const isExactMatch = pathName === menu.route;
          const isPrefixMatch = pathName.startsWith(menu.route + "/");
         
          if (isExactMatch || isPrefixMatch) {
            // If there are submenus, only return if it's an exact match
            // (otherwise submenu check above would have caught it)
            if (!menu.subMenu || menu.subMenu.length === 0 || isExactMatch) {
              return i;
            }
          }
        }
      }
      return null;
    },
    [pathName]
  );
 
  // Auto-open menu that contains the active route on page load/refresh and route changes
  useEffect(() => {
    if (displayMenu.length > 0 && pathName) {
      const activeMenuIndex = findMenuIndexWithActiveRoute(displayMenu);
      if (activeMenuIndex !== null) {
        // Always set the open menu index when route matches
        // This ensures the menu opens on page load, refresh, and navigation
        setOpenMenuIndex(activeMenuIndex);
      }
    }
  }, [pathName, displayMenu, findMenuIndexWithActiveRoute]);
 
  // Also run on initial mount after menu data is loaded
  useEffect(() => {
    if (isInitialized && displayMenu.length > 0 && pathName) {
      const activeMenuIndex = findMenuIndexWithActiveRoute(displayMenu);
      if (activeMenuIndex !== null) {
        setOpenMenuIndex(activeMenuIndex);
      }
    }
  }, [
    isInitialized,
    displayMenu.length,
    pathName,
    findMenuIndexWithActiveRoute,
  ]);
 
  // Use fallback menu if API data is empty or failed
  // const displayMenu = menuData;
 
  const getAllRoutes = (menu: MenuItem[]): string[] => {
    let routes: string[] = [];
    menu.forEach((item) => {
      if (item.route) {
        routes.push(item.route);
      }
      if (item.subMenu) {
        routes = routes.concat(getAllRoutes(item.subMenu));
      }
    });
    return routes;
  };
 
  useEffect(() => {
    if (pathName === "/webfraud/DashboardPage/NotFound") return;
 
    const skipMenuValidationRoutes = [
      "/web-analytics/reportingtool/generate",
      "/webfraud/User-Management/Product_Mapping",
    ];
    if (
      skipMenuValidationRoutes.some(
        (route) => pathName === route || pathName.startsWith(route + "/")
      )
    ) {
      return;
    }
 
    if (displayMenu.length > 0 && pathName.startsWith("/webfraud/")) {
      const allRoutes = getAllRoutes(displayMenu);
      const isValidRoute = allRoutes.some(
        (route) =>
          route && (pathName === route || pathName.startsWith(route + "/"))
      );
      if (!isValidRoute) {
        router.push("/dashboard/overall-summary");
      }
    }
 
    if (
      displayMenu.length > 0 &&
      getAllRoutes(displayMenu).length === 0 &&
      pathName.startsWith("/webfraud/")
    ) {
      router.push("/web-analytics/dashboardPage/NotFound");
    }
  }, [displayMenu, pathName, router]);
 
  return (
    <div
      className={clsx(
        "z-[60] sm:z-[60] md:z-[40] lg:z-[40]  flex h-full flex-col bg-clip-border text-gray-300 shadow-xl transition-all md:mt-0 lg:mt-0 mt-4",
        {
          "bg-gray-900": theme === "dark",
          "bg-secondary": theme === "light",
          "fixed bottom-0 left-0 top-14 w-[14rem] max-w-[14rem] p-2 md:mt-0 md:relative md:top-auto lg:mt-0":
            isExpanded,
          "w-0 max-w-[4rem] md:w-full md:p-1 md:mt-0": !isExpanded,
        }
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {toastData && (
        <ToastContent
          type={toastData.type}
          title={toastData.title}
          description={toastData.description}
          variant={toastData.variant}
        />
      )}
 
      <nav className="text-blue-gray-700 flex flex-col gap-1 overflow-auto font-sans text-base font-normal">
        {displayMenu.map((v, i) => (
          <MenuItem
            key={i}
            {...v}
            isExpanded={isExpanded}
            theme={theme}
            isOpen={openMenuIndex === i}
            isSubMenu={false}
            onToggle={() => {
              // If clicking the same menu, close it. Otherwise, open the clicked menu and close others
              if (openMenuIndex === i) {
                setOpenMenuIndex(null);
              } else {
                setOpenMenuIndex(i);
              }
            }}
          />
        ))}
      </nav>
 
      <div className="relative z-50 mx-auto mt-auto">
        <h5 className="text-blue-gray-900 block font-sans text-xl font-semibold leading-snug tracking-normal antialiased delay-300">
          {isExpanded ? (
            <Image
              src={`https://infringementportalcontent.mfilterit.com/images/media/logos/mfilterit-white-logo.png`}
              alt="logo"
              width={200}
              height={30}
            />
          ) : (
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
 
function MFWebFraudAsideMenu(props: {
  isExpanded?: boolean;
  onHover?: (e: boolean) => void;
  theme?: string;
}) {
  return (
    <MFWebFraudAsideMenuContent {...props} />
  );
}
 
export default MFWebFraudAsideMenu;
 
type MenuItemProps = MenuItem & {
  isExpanded?: boolean;
  theme?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  isSubMenu?: boolean;
};
 
function MenuItem({
  title = "Dashboard",
  icon = "",
  route,
  subMenu = [],
  isExpanded,
  theme,
  embeddedMenu = false,
  url,
  isOpen = false,
  isSubMenu = false,
  onToggle,
}: MenuItemProps & { embeddedMenu?: boolean; url?: string }) {
  const pathName = usePathname();
  const router = useRouter();
  const [openChildIndex, setOpenChildIndex] = useState<number | null>(null);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
 
  // Reset nested submenu state when parent menu closes
  useEffect(() => {
    if (!isOpen && !isSubmenuOpen) {
      setOpenChildIndex(null);
      setIsSubmenuOpen(false);
    }
  }, [isOpen]);
 
  // Auto-open nested submenu if any of its children match the current route
  // Only auto-open if the parent menu is open
  useEffect(() => {
    if (subMenu && subMenu.length > 0 && pathName && isOpen) {
      const activeChildIndex = subMenu.findIndex((sub) => {
        if (sub.route && (pathName === sub.route || pathName.startsWith(sub.route + "/"))) {
          return true;
        }
        // Check nested submenus
        if (sub.subMenu && sub.subMenu.length > 0) {
          return sub.subMenu.some((subSub) =>
            subSub.route && (pathName === subSub.route || pathName.startsWith(subSub.route + "/"))
          );
        }
        return false;
      });
     
      if (activeChildIndex !== -1) {
        setOpenChildIndex(activeChildIndex);
        setIsSubmenuOpen(true);
      }
    } else if (!isOpen) {
      // Reset when parent closes
      setOpenChildIndex(null);
      setIsSubmenuOpen(false);
    }
  }, [pathName, subMenu, isOpen]);
 
  // Helper to check if this menu or any of its submenus is active
  const isRouteActive = React.useMemo(() => {
    // Check if current route matches this menu's route
    if (route && (pathName === route || pathName.startsWith(route + "/"))) {
      return true;
    }
    // Check if any submenu matches
    if (subMenu && subMenu.length > 0) {
      return subMenu.some((sub) => {
        if (
          sub.route &&
          (pathName === sub.route || pathName.startsWith(sub.route + "/"))
        ) {
          return true;
        }
        // Check nested submenus
        if (sub.subMenu && sub.subMenu.length > 0) {
          return sub.subMenu.some(
            (subSub) =>
              subSub.route &&
              (pathName === subSub.route ||
                pathName.startsWith(subSub.route + "/"))
          );
        }
        return false;
      });
    }
    return false;
  }, [pathName, route, subMenu]);
 
  // Check if this menu has a currently active descendant
const isDescendantActive = React.useMemo(() => {
  const checkNested = (menus?: MenuItem[]): boolean => {
    if (!menus) return false;
    return menus.some(
      (sub) =>
        (sub.route && (pathName === sub.route || pathName.startsWith(sub.route + "/"))) ||
        checkNested(sub.subMenu)
    );
  };
  return checkNested(subMenu);
}, [pathName, subMenu]);
 
 
 
  // Check if this specific menu item route is active (for highlighting)
  const isCurrentRouteActive =
    route && (pathName === route || pathName.startsWith(route + "/"));
 
 
   
 
  return (
    <div className="relative my- block w-full">
      <div
        role="button"
        className="flex overflow-hidden rounded-lg p-0 text-start leading-tight outline-none transition-all hover:bg-opacity-80"
      >
        <button
          type="button"
          className={clsx(
            "relative flex w-full select-none items-center border-b-0 py-0.5 px-1 text-left font-sans text-base font-semibold leading-snug antialiased rounded-md group",
            { "justify-start": isExpanded },
            { "justify-center": !isExpanded },
            {
              // 🌟 Active leaf item (no submenu, current route is active)
              "bg-primary text-white":
                theme === "light" && isCurrentRouteActive && !subMenu.length,
           
              // 🌿 Active parent (has submenu and descendant is active) - with animated line
              "relative text-gray-200 hover:text-white transition-colors duration-300 before:absolute before:left-0 before:bottom-0s before:w-full before:bg-primary  before:duration-300":
                theme === "light" &&
                subMenu.length > 0 &&
                (isDescendantActive || isCurrentRouteActive),
           
              // 🌫️ Normal inactive state - with animated line on hover
              "relative text-gray-200 hover:text-white transition-colors duration-300 before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-primary before:transition-all before:duration-300 hover:before:w-full":
                theme === "light" &&
                !isCurrentRouteActive &&
                !isDescendantActive,
           
              // 🌙 Dark mode - Active leaf item
              "bg-gray-700 text-white":
                theme === "dark" && isCurrentRouteActive && !subMenu.length,
           
              // 🌙 Dark mode - Active parent
              "bg-gray-700/50 text-white":
                theme === "dark" &&
                subMenu.length > 0 &&
                (isDescendantActive || isCurrentRouteActive),
           
              // 🌙 Dark mode - Inactive
              "text-gray-300 hover:text-white":
                theme === "dark" &&
                !isCurrentRouteActive &&
                !isDescendantActive,
            }
          )}
          onClick={(e) => {
            if (subMenu.length > 0) {
              e.stopPropagation();
 
              // ✅ If top-level → use parent state
              if (onToggle) {
                onToggle();
              } else {
                // ✅ If nested submenu → handle locally
                setIsSubmenuOpen((prev) => !prev);
              }
            } else {
              if (embeddedMenu && url && route) {
                router.push(`${route}?url=${encodeURIComponent(url)}`);
              } else if (route) {
                router.push(route);
              }
            }
          }}
        >
          {/* Left highlight bar */}
          <span
            className={clsx(
              "absolute left-0 top-0 h-full w-[3px] rounded-r-md transition-all duration-300",
              isCurrentRouteActive || isDescendantActive
                ? "bg-primary"
                : "bg-transparent group-hover:bg-primary/60"
            )}
          ></span>
 
          {/* Icon */}
          <div className="mr-2 grid w-[20px] place-items-center">
            {icon || <Dot size={18} />}
          </div>
 
          {/* Title */}
          {isExpanded && (
            <p
              title={title}
              className={clsx(
                "mr-auto block overflow-hidden text-ellipsis whitespace-nowrap font-semibold font-sans leading-relaxed antialiased p-1 transition-all duration-300 group-hover:translate-x-[2px]",
                isSubMenu ? "text-[11px] opacity-80" : "text-[13px]"
              )}
            >
              {title}
            </p>
          )}
          {/* Chevron icon */}
          {subMenu.length > 0 && isExpanded && (
            <span
              className={clsx("ml-4 transition-transform duration-300", {
                "rotate-180": !isOpen,
              })}
            >
              <ChevronUp size={18} />
            </span>
          )}
 
          {/* Bottom divider line (soft, subtle) */}
          <span className="absolute bottom-0 left-2 right-2 border-b border-gray-500/20"></span>
        </button>
      </div>
 
      {subMenu.length > 0 && isExpanded && (
        <div
          className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            {
              "max-h-0 opacity-0": !(isOpen || isSubmenuOpen),
              "max-h-[1000px] opacity-100": isOpen || isSubmenuOpen,
            }
          )}
        >
          <div className="relative ml-4 py-1 font-sans text-subBody font-light leading-normal antialiased">
         
 
            {/* Submenu items */}
            <div className="ml-3 flex flex-col gap-[2px]">
              {subMenu.map((v, i) => {
                const isSubMenuActive =
                  v.route &&
                  (pathName === v.route || pathName.startsWith(v.route + "/"));
 
                return (
                  <div
                    key={i}
                    className={clsx("rounded-lg transition-colors", {
                      "bg-primary/20": isSubMenuActive && theme === "light",
                      "bg-gray-700/50": isSubMenuActive && theme === "dark",
                    })}
                  >
                    <MenuItem
                      {...v}
                      isExpanded={isExpanded}
                      theme={theme}
                      isOpen={openChildIndex === i}
                      isSubMenu={true}
                      onToggle={() =>
                        setOpenChildIndex(openChildIndex === i ? null : i)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
 
 