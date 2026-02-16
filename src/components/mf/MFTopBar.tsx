"use client";
import { useTheme } from "./theme-context";
import {
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Settings,
  PackageSearch,
  Bell,
  HelpCircle,
  Check,
  Loader2,
  Calendar,
  Package,
  PackageOpen,
  Layers2,
  List,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Link from "next/link";
import { Button } from "../ui/button";
import { MFSingleSelect } from "./MFSingleSelect";
import { MFDateRangePicker } from "./MFDateRangePicker";
import SignOutButton from "./SignOut";
import { usePathname } from "next/navigation";
import { getToken, getIDToken } from "@/lib/token";
import { useEffect, useState, } from "react";
// import { useApiCall } from "@/app/(main)/webfraud/queries/api_base";
import { usePackage } from "@/components/mf/PackageContext";
import { useMenu } from "@/components/mf/MenuContext";
import { useRouter } from "next/navigation";
import Endpoint from "@/common/endpoint";
import { fetchMenuWithPackage, findFirstSubMenuRoute, findMenuNameByRoute, doesRouteExistInMenu } from "@/lib/menu-utils";
type ErrorResponse = {
  message: string;
};
 
type PackageResponse = string[];
 
type MFTopBarType = {
  isExpanded: boolean;
  onToggle: () => void;
  isCalender?: boolean;
  isToggle?:boolean;
};
const enable: string[] = [
  "app/dashboard/install",
  "/webfraud/Dashboard/overall-summary",
  "/webfraud/Dashboard/analysis-insights",
  "/webfraud/Dashboard/traffic-insights",
  "/webfraud/Dashboard/actionable-insights",
  "/webfraud/Configuration/WhiteListing-IVT-Category",
  "/webfraud/Configuration/Real-Time-Protection",
  "/webfraud/Download-Ivt-Report/LandingPage-wise",
  "/webfraud/Download-Ivt-Report/Campaign-wise",
  "/webfraud/Configuration/Call-Recommendation",
 
  "/web-analytics/reportingtool/report",
  "/web-analytics/reportingtool/generate",
  "/app-analytics/Publisher",
  "/app-analytics/dashboard/overall-summary",
  "/app-analytics/analytics",
  "/app-analytics/contributing-publishers/original",
  "/app-analytics/contributing-publishers/reattribution",
 
  "/web-analytics/configuration/ad-manager-apiAccess",
 
  "/app-analytics/reportingrool/generate",
  "/app-analytics/reportingtool/report",
  "/app-analytics/reportingtool/mail",
  "/app-analytics/configuration",
  "/app-analytics/extended-metrics",
  "/app-analytics/post-back",
  "/integrity/reportingtool/report",
  "/integrity/reportingtool/mail",
  "/integrity/dashboard/overall-summary",
  "/integrity/configuration",
  "/integrity/custom-configuration",
  "/integrity/customConfiguration",
  "/re-engagement/dashboard/overall-summary",
  "/re-engagement/reportingtool/generate",
  "/re-engagement/reportingtool/report",
  "/re-engagement/reportingtool/mail",
  "/re-engagement/configuration",
  "/re-engagement/post-back",
  "/ticketing",
  "/user-details",
];
 
export function MFTopBar({
  isExpanded,
  onToggle,
  isCalender = true,
  isToggle=true
}: MFTopBarType) {
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const { selectedPackage } = usePackage();
  const { menuData } = useMenu();
  const [pageTitle, setPageTitle] = useState<string>("");
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [persistentActive, setPersistentActive] = useState<string | null>(null);

  // Set persistent active state based on theme (light mode shows border by default)
  useEffect(() => {
    if (!isDarkMode) {
      setPersistentActive('theme');
    } else {
      if (persistentActive === 'theme') {
        setPersistentActive(null);
      }
    }
  }, [isDarkMode]);

  // Check specifically for WhiteListing-IVT-Category page
  const isWhiteListingPage =
    pathname === "/webfraud/Configuration/WhiteListing-IVT-Category";
  const isRealtimeProtection =
    pathname === "/webfraud/Configuration/Real-Time-Protection";
  const isCallRecommendationPage =
    pathname === "/webfraud/Configuration/Call-Recommendation";
  const isGeneratePage = pathname === "/web-analytics/reportingtool/generate";
  const isAppAnalyticsPage = pathname === "/app-analytics/reportingtool/report";
  const isIntegrityPage = pathname === "/integrity/reportingtool/report";
  const isReEngagementPage = pathname === "/re-engagement/reportingtool/report";

  const isTicketingPage = pathname === "/ticketing/dashboard/overall-summary";
  const isUserDetailsPage = pathname.includes("/user-details");
  
  // Check if the current path is enabled
  const isEnabled = enable.some((path) => pathname.includes(path));
 
  // Get page title from menu data in context
  useEffect(() => {
    if (isEnabled && pathname && menuData.length > 0) {
      const title = findMenuNameByRoute(menuData, pathname);
      if (title) {
        setPageTitle(title);
      } else {
        setPageTitle("");
      }
    } else {
      setPageTitle("");
    }
  }, [pathname, menuData, isEnabled]);
 
  return (
    <div className="shadow-blue-gray-900/5 col-span-2 h-auto bg-secondary md:bg-background md:dark:bg-gray-900 w-full border-b-4 border-gray-300 md:border-border shadow-md">
      {/* Main TopBar Row */}
      <div className="flex flex-row items-center gap-2 w-full overflow-x-auto scrollbar-hide p-2">
        {/* Toggle Menu Button */}
        <div className="relative pb-1 flex flex-col items-center" data-menu-toggle>
          <Button
            title="Toggle Menu"
            variant="ghost"
            className="md:w-14 rounded-md text-white md:text-foreground hover:bg-primary-foreground/10 md:hover:bg-accent flex-shrink-0"
            size="icon"
            onClick={onToggle}
            data-menu-toggle
          >
            {/* Show List icon on sm/md, PanelLeft icons on lg+ */}
            <span className="lg:hidden" data-menu-toggle>
              <List className="h-5 w-5 text-white md:text-foreground" />
            </span>
            <span className="hidden lg:block" data-menu-toggle>
              {isExpanded ? <PanelLeftClose className="text-foreground" /> : <PanelLeftOpen  className="text-foreground" />}
            </span>
          </Button>
          <span className="text-[10px] text-white md:text-foreground mt-0.5 lg:hidden" data-menu-toggle>Menu</span>
        </div>

        {isEnabled && (
          <>
            {/* Package Select - Hide for user-details pages */}
            {!isUserDetailsPage && (
              <>
                <div className="hidden lg:block lg:w-auto">
                  <PackageSelect />
                </div>
                <Popover open={activePopover === 'package'} onOpenChange={(open) => {
                  setActivePopover(open ? 'package' : null);
                  // Close menu on sm/md when package popover opens
                  if (open && isExpanded && window.innerWidth < 1024) {
                    onToggle();
                  }
                }}>
                  <PopoverTrigger asChild className="lg:hidden">
                    <div className="relative pb-1 flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Select Package"
                        className="rounded-md text-white md:text-foreground hover:bg-primary-foreground/10 md:hover:bg-accent flex-shrink-0"
                      >
                        <Layers2  className="h-5 w-5 text-white md:text-foreground" />
                      </Button>
                      <span className="text-[10px] text-white md:text-foreground mt-0.5">Package</span>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                        <div
                          className={`h-full bg-white md:bg-primary rounded-full transition-transform duration-300 ease-out origin-right ${
                            activePopover === 'package' ? 'scale-x-100' : 'scale-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-[70vh] p-0 rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" align="start" side="bottom">
                    <div className="flex flex-col">
                      {/* Beautiful Header */}
                      <div className="px-6 py-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-primary/10 ring-1 ring-primary/20 shadow-sm">
                            <Layers2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
                              Package Selection
                            </p>
                            <h4 className="text-subBody font-bold text-foreground">Choose Your Package</h4>
                          </div>
                        </div>
                      </div>

                      {/* Package Selector Content */}
                      <div className="p-6 overflow-y-auto scrollbar max-h-[calc(70vh-100px)]">
                        <PackageSelect />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            )}

            {/* Date Range Picker - Hide for specific pages */}
            {!isWhiteListingPage && !isCallRecommendationPage && !isGeneratePage && !isRealtimeProtection && !isTicketingPage && !isAppAnalyticsPage  && !isIntegrityPage &&  !isReEngagementPage && !isUserDetailsPage && (
              <>
                {/* Desktop: Show full date picker */}
                <div className="hidden lg:block lg:w-auto">
                  <MFDateRangePicker className="rounded-full  border text-body dark:bg-background  w-full" hideSelectedRangeText={true} />
                </div>

                {/* Mobile/Tablet: Show calendar icon */}
                <Popover open={activePopover === 'calendar'} onOpenChange={(open) => {
                  setActivePopover(open ? 'calendar' : null);
                  // Close menu on sm/md when calendar popover opens
                  if (open && isExpanded && window.innerWidth < 1024) {
                    onToggle();
                  }
                }}>
                  <PopoverTrigger asChild className="lg:hidden">
                    <div className="relative pb-1 flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Select Date Range"
                        className="rounded-md text-white md:text-foreground hover:bg-primary-foreground/10 md:hover:bg-accent flex-shrink-0"
                      >
                        <Calendar className="h-5 w-5 text-white md:text-foreground" />
                      </Button>
                      <span className="text-[10px] text-white md:text-foreground mt-0.5">Calendar</span>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                        <div
                          className={`h-full bg-white md:bg-primary rounded-full transition-transform duration-300 ease-out origin-right ${
                            activePopover === 'calendar' ? 'scale-x-100' : 'scale-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto max-w-[95vw] p-0 md:ml-20"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                  >
                    <MFDateRangePicker hideButton={true} />
                  </PopoverContent>
                </Popover>
              </>
            )}

           {/* Page Title - Show on md and lg screens only */}
           <div className="hidden md:flex flex-grow text-black justify-center items-center font-semibold text-header dark:text-white">
             {pageTitle || ""}
           </div>

          {/* Right side icons - always in a row */}
          <div className="ml-auto flex items-center gap-2">
            {/* Support Button */}
            <div className="relative pb-1 flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                title="Support"
                className="rounded-md text-white md:text-foreground hover:bg-primary-foreground/10 md:hover:bg-accent flex-shrink-0"
                onClick={() => {
                  setActivePopover('support');
                  // Close menu on sm/md when support is clicked
                  if (isExpanded && window.innerWidth < 1024) {
                    onToggle();
                  }
                  router.push("/ticketing");
                }}
              >
                <HelpCircle className="text-white md:text-foreground" />
              </Button>
              <span className="text-[10px] text-white md:text-foreground mt-0.5 lg:hidden">Support</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                <div
                  className={`h-full bg-white md:bg-primary rounded-full transition-transform duration-300 ease-out origin-right ${
                    activePopover === 'support' ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Theme Toggle Button */}
            <div className="relative pb-1 flex flex-col items-center">
              <Button
                onClick={() => {
                  toggleTheme();
                  // Close menu on sm/md when theme is toggled
                  if (isExpanded && window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                variant="ghost"
                size="icon"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="rounded-md text-white md:text-foreground hover:bg-primary-foreground/10 md:hover:bg-accent flex-shrink-0"
              >
                {isDarkMode ? <Moon className="text-white md:text-foreground" /> : <Sun className="text-white md:text-foreground" />}
              </Button>
              <span className="text-[10px] text-white md:text-foreground mt-0.5 lg:hidden">Theme</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                <div
                  className={`h-full bg-white md:bg-primary rounded-full transition-transform duration-300 ease-out origin-right ${
                    persistentActive === 'theme' || (!isDarkMode) ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </div>
            </div>

            <KebabMenu
              activePopover={activePopover}
              setActivePopover={setActivePopover}
              persistentActive={persistentActive}
              setPersistentActive={setPersistentActive}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />

            {/* User PopUp */}
            <UserPopUp
              activePopover={activePopover}
              setActivePopover={setActivePopover}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          </div>
          </>
        )}
      </div>
    </div>
  );
}
 
function UserPopUp({ activePopover, setActivePopover, isExpanded, onToggle }: {
  activePopover: string | null;
  setActivePopover: (value: string | null) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [Uname, setUname] = useState("");
const [username, setUsername] = useState<string | null>(null);
const [securityUrl, setSecurityUrl] = useState<string>("");
  useEffect(() => {

  }, []);
  useEffect(() => {
    const {name} = getIDToken();
    setUname(name);
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);

    // Set securityUrl only on client side
    if (typeof window !== "undefined") {
      setSecurityUrl(window.location.origin);
    }

  }, []);


  return (
    <Popover open={activePopover === 'user'} onOpenChange={(open) => {
      setActivePopover(open ? 'user' : null);
      // Close menu on sm/md when user popover opens
      if (open && isExpanded && window.innerWidth < 1024) {
        onToggle();
      }
    }}>
      <PopoverTrigger asChild>
        <div className="relative pb-1 flex flex-col items-center">
          <Button
            className="ml-auto mr-2 rounded-md text-white md:text-foreground hover:bg-primary-foreground/10 md:hover:bg-accent"
            variant="ghost"
            size="icon"
            title="User"
          >
            <User className="text-white md:text-foreground" />
          </Button>
          <span className="text-[10px] text-white md:text-foreground mt-0.5 lg:hidden">User</span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
            <div
              className={`h-full bg-white md:bg-primary rounded-full transition-transform duration-300 ease-out origin-right ${
                activePopover === 'user' ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="mr-4 w-auto max-w-[350px] overflow-hidden p-0 border shadow-xl rounded-xl backdrop-blur-sm">
        <div className="flex flex-col relative">
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent dark:from-white/20 dark:via-white/5 dark:to-transparent pointer-events-none rounded-xl"></div>
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none rounded-t-xl"></div>

          {/* User Info Header */}
          <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-5 border-b dark:border-slate-600 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center ring-2 ring-primary/20 shadow-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground mb-1 drop-shadow-sm text-nowrap">Hello, {Uname}</p>
                <p className="text-subBody text-muted-foreground break-all text-nowrap">{username}</p>
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative flex justify-between items-center px-4 py-2 bg-background/80 backdrop-blur-sm border-t dark:border-slate-600">
            <Link href={`${securityUrl}/user-details/security`} title="Settings">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 shadow-md hover:shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
            </Link>

            <SignOutButton />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
 
interface PackageType {
  PackageName: string;
  PackageTitle: string;
}
 
function PackageSelect({ compact = false }: { compact?: boolean }) {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedPackage, setSelectedPackage } = usePackage();
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
 
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("IDToken");
       
        // Get the current product name from the pathname
        let productName = "App Performance"; // fallback
        if (pathname.startsWith("/app")) {
          productName = "App Performance";
        } else if (pathname.startsWith("/web")) {
          productName = "Web Performance";
        } else if (pathname.startsWith("/brand-infringement")) {
          productName = "Brand Infringement";
        }
       
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PRODUCT}access_control/user_packages?product_name=${encodeURIComponent(productName)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token || "",
            },
            body: JSON.stringify({
              "product_name": productName
            }),
          }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          // Filter out packages with empty PackageName values
          const validPackages = data.filter((pkg: PackageType) => pkg.PackageName && pkg.PackageName.trim() !== "");
 
          setPackages(validPackages);
 
          if (!selectedPackage) {
            const savedPackage = localStorage.getItem("selectedPackage");
            const packageToSelect = savedPackage && validPackages.some(pkg => pkg.PackageName === savedPackage)
              ? savedPackage
              : validPackages[0]?.PackageName;
 
            if (packageToSelect) {
              setSelectedPackage(packageToSelect);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchPackages();
  }, [pathname, selectedPackage]);
 
 
  const items = packages.map((pkg) => ({
    title: pkg.PackageTitle || pkg.PackageName,
    value: pkg.PackageName,
  }));
 
  const handlePackageChange = async (value: string) => {
    setSelectedPackage(value);
    localStorage.setItem("selectedPackage", value);
   
    // Add a small delay to ensure the package context is updated
    await new Promise(resolve => setTimeout(resolve, 100));
   
    // After package change, fetch menu and navigate to first submenu
    try {
      const token = localStorage.getItem("IDToken");
      if (!token) {
        console.error("No token available");
        return;
      }
     
      // Get the current product name from the pathname
      let productName = "App Performance"; // fallback
      let productRoute = "/app"; // fallback
      if (pathname.startsWith("/app")) {
        productName = "App Performance";
        productRoute = "/app";
      } else if (pathname.startsWith("/web")) {
        productName = "Web Performance";
        productRoute = "/web";
      } else if (pathname.startsWith("/brand-infringement")) {
        productName = "Brand Infringement";
        productRoute = "/brand-infringement";
      }
     
     
      // Fetch menu with the new package
      const menuData = await fetchMenuWithPackage(token, productName, value);
      
      // Check if current route exists in the menu
      const currentRouteExists = doesRouteExistInMenu(menuData, pathname);
      
      if (currentRouteExists) {
        // Current route exists in menu, stay on the same route
        console.log("Current route exists in menu, staying on:", pathname);
        return;
      }
      
      // Current route doesn't exist, redirect to first route
      const firstSubMenuRoute = findFirstSubMenuRoute(menuData);
      
      if (firstSubMenuRoute) {
        // Construct the final route by combining product route with first submenu route
        let finalRoute;
        
        // For App Performance, keep the route exactly as it comes from the API
        if (productName === "App Performance") {
          // Use the route exactly as it comes from the API, without any modifications
          finalRoute = firstSubMenuRoute;
        } else {
          // For other products, use the original logic
          if (firstSubMenuRoute.startsWith("/")) {
            // If the submenu route starts with /, combine directly
            finalRoute = `${productRoute}${firstSubMenuRoute}`;
          } else {
            // If the submenu route doesn't start with /, add it
            finalRoute = `${productRoute}/${firstSubMenuRoute}`;
          }
        }
        
        try {
          router.push(finalRoute);
          console.log("Navigation triggered with router to:", finalRoute);
        } catch (error) {
          console.log("Router navigation failed, using window.location.href");
          window.location.href = finalRoute;
        }
      } else {
        console.log("No first submenu route found");
      }
    } catch (error) {
      console.error("Error fetching menu after package change:", error);
    }
  };
 
  const selectedPackageTitle = packages.find(pkg => pkg.PackageName === selectedPackage)?.PackageTitle || selectedPackage;
 
  return (
    <MFSingleSelect
      items={items}
      placeholder={isLoading ? "Loading..." : "Select Package"}
      className="max-w-40 h-[34px] rounded-full"
      value={selectedPackage}
      onValueChange={handlePackageChange}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      showSearch={true}
      leadingIcon={<Layers2  className="w-4 h-4 dark:text-white text-black ms-2"/>}
    />
  );
}
 
function KebabMenu({ activePopover, setActivePopover, persistentActive, setPersistentActive, isExpanded, onToggle }: {
  activePopover: string | null;
  setActivePopover: (value: string | null) => void;
  persistentActive: string | null;
  setPersistentActive: (value: string | null) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {

  function findFirstSubMenuRoute(menus: any[]): string | null {
  for (const menu of menus) {
    if (menu.Route && menu.Route !== "") {
      return menu.Route;
    }
    if (menu.SubMenus && menu.SubMenus.length > 0) {
      const subRoute = findFirstSubMenuRoute(menu.SubMenus);
      if (subRoute)
        return subRoute;
    }
  }
  return null;
}
 
  // Function to handle more products redirection
  const handleMoreProductClick = (product: any) => {
    if (product.redirect_link) {
      window.open(product.redirect_link, '_blank');
    }
  };
 
  // Simulated API response (replace with actual API call in production)
  const [availableProducts, setAvailableProducts] = useState<Array<{
    icon: string;
    label: string;
    display_name?: string;
    route: string;
    name?: string;
  }>>([]);
  const [moreProducts, setMoreProducts] = useState<Array<{
    icon: string;
    label: string;
    display_name?: string;
    route?: string;
    name?: string;
    redirect_link?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [selectedProductIdx, setSelectedProductIdx] = useState<number>(0); // Track selected product index
  const router = useRouter();
  const pathname = usePathname();
 
  // Function to fetch menu data and redirect with first submenu route
  const fetchMenuAndRedirect = async (productRoute: string, productName: string) => {
    setIsMenuLoading(true);
   
    try {
      const token = localStorage.getItem("IDToken");
     
     
      // Use the new utility function that fetches package name first
      const menuData = await fetchMenuWithPackage(token || "", productName);
      let firstSubMenuRoute = findFirstSubMenuRoute(menuData) || "";
     
      // Remove the first segment if it starts with a slash and has more than one segment
      if (firstSubMenuRoute.startsWith("/")) {
        const parts = firstSubMenuRoute.split("/");
        // if (parts.length > 2) {
        //   // parts[0] is '', parts[1] is the first segment to remove
        //   firstSubMenuRoute = "/" + parts.slice(2).join("/");
        // }
      }
 
      const finalRoute = firstSubMenuRoute
        ? `${productRoute}${firstSubMenuRoute.startsWith("/") ? "" : "/"}${firstSubMenuRoute}`
        : productRoute;
     
      window.location.href =`${finalRoute}`
      // router.push(finalRoute);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      console.log("Final route to navigate:", error);
      // fallback to just the product route if menu API fails
     
      // router.push(productRoute);
    } finally {
      // setIsMenuLoading(false);
    }
  };
 
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("IDToken");
        // Replace with your actual API endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PRODUCT}${Endpoint.PRODUCT}?config=true`,
          {
            method: "GET",
            headers: {
              Authorization: token || "",
            },
          }
        );
        const data = await response.json();
       
        // Expecting data to have available_products and more_products arrays
        setAvailableProducts(Array.isArray(data.available_products) ? data.available_products : []);
        setMoreProducts(Array.isArray(data.more_products) ? data.more_products : []);
        const index = data?.available_products?.findIndex((item: any) => item.label === "App Performance");
        setSelectedProductIdx(index); // Always select the first product after fetch
      } catch (error) {
        setAvailableProducts([]);
        setMoreProducts([]);
        // setSelectedProductIdx(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    // Find the index of the product whose route matches the current pathname
    const idx = availableProducts.findIndex((app) =>
      pathname.startsWith(app.route)
    );
    if (idx !== -1) {
      if (idx !== selectedProductIdx) {
        setSelectedProductIdx(idx);
      }
      // Set persistent active state when on a product page
      setPersistentActive('kebab');
    }
    // Optionally, if you have a context for selected product, update it here too
  }, [pathname, availableProducts]);
 
  // Helper to render SVG from string
  const renderSVG = (svgString: string) => (
    <span
      className="mb-1"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
 
  const fetchPackages1 = async (productName: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("IDToken");
      if (!token) {
        console.error("No token available");
        return;
      }
     
      // Get the product name from the available products
      const product = availableProducts.find(p => p.name === productName || p.label === productName);
      if (!product) {
        console.error("Product not found:", productName);
        return;
      }
 
      const packageResponse = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT}access_control/user_packages?product_name=${encodeURIComponent(product.label)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
          body: JSON.stringify({
            "product_name": product.label
          }),
        }
      );
     
      const packageData = await packageResponse.json();
       if (Array.isArray(packageData) && packageData.length === 0) {
         router.push("/contact-admin");
         return;
       }
     
      // Use the new utility function that fetches package name first
      const menuData = await fetchMenuWithPackage(token, product.label);
      const firstSubMenuRoute = findFirstSubMenuRoute(menuData) || "";
      const productRoute = product.route ;
     
      const finalRoute = firstSubMenuRoute
        ? `${productRoute}${firstSubMenuRoute.startsWith("/") ? "" : "/"}${firstSubMenuRoute}`
        : productRoute;
 
      window.location.href = finalRoute;
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setIsLoading(false);
    }
  };
 
const [activeTab, setActiveTab] = useState('subscriptions');
return (


  <Popover open={activePopover === 'kebab'} onOpenChange={(open) => {
    setActivePopover(open ? 'kebab' : null);
    // Close menu on sm/md when kebab popover opens
    if (open && isExpanded && window.innerWidth < 1024) {
      onToggle();
    }
  }}>
    <PopoverTrigger asChild>
      <div className="relative pb-1 flex flex-col items-center">
        <Button
          className="rounded-full text-white md:text-foreground hover:bg-primary-foreground/10 md:hover:bg-accent"
          variant="ghost"
          size="icon"
          title="Select Product"
        >
          <PackageSearch className="text-white md:text-foreground" />
        </Button>
        <span className="text-[10px] text-white md:text-foreground mt-0.5 lg:hidden">Products</span>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
          <div
            className={`h-full bg-white md:bg-primary rounded-full transition-transform duration-300 ease-out origin-right ${
              activePopover === 'kebab' || persistentActive === 'kebab' ? 'scale-x-100' : 'scale-x-0'
            }`}
          />
        </div>
      </div>
    </PopoverTrigger>
    <PopoverContent className="w-[calc(100vw-40px)] sm:w-[380px] max-h-[600px] overflow-hidden p-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border-0">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 px-6 py-4 text-subBody font-semibold transition-all duration-300 relative ${
            activeTab === 'subscriptions'
              ? 'text-secondary dark:text-white dark:bg-gray-900 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center  justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Subscriptions</span>
            {availableProducts.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'subscriptions'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-secondary dark:text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {availableProducts.length}
              </span>
            )}
          </div>
          {activeTab === 'subscriptions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-gray-300 dark:text-gray-300"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`flex-1 px-6 py-4 text-subBody font-semibold transition-all duration-300 relative ${
            activeTab === 'addons'
              ? 'text-orange-600 dark:text-orange-400 dark:bg-gray-900 dark:text-gray-100'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add-ons</span>
            {moreProducts.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'addons'
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {moreProducts.length}
              </span>
            )}
          </div>
          {activeTab === 'addons' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500"></div>
          )}
        </button>
      </div>
 
      {/* Page Content */}
      <div className="p-6 overflow-y-auto scrollbar max-h-[520px]">
        {/* Page 1: Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="animate-in  fade-in-50 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-1 bg-secondary rounded-full"></div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Your Subscriptions
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your active products</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-subBody text-gray-500 dark:text-gray-400">No subscriptions available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {availableProducts.map((app, idx) => {
                  const isSelected = idx === selectedProductIdx;
                  return (
                    <div
                      key={idx}
                      className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                        isSelected
                          ? 'dark:border-gray-700 border dark:border-gray-700 dark:bg-gray-800 shadow-xl scale-105 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 dark:hover:from-gray-700 dark:hover:to-gray-700 cursor-pointer hover:scale-105 border border-gray-200 dark:border-gray-700'
                      } ${isMenuLoading ? 'opacity-50' : ''}`}
                      style={isSelected ? { pointerEvents: 'none' } : {}}
                      onClick={async () => {
                        if (!isSelected && app.route && !isMenuLoading) {
                          setSelectedProductIdx(idx);
                          const productName = app?.name || app?.label;
                          await fetchPackages1(productName);
                        }
                      }}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`mb-3 transform transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {renderSVG(app.icon)}
                      </div>
                      <span className={`text-xs font-semibold text-center transition-colors ${
                        isSelected
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-700 dark:text-gray-300 '
                      }`}>
                        {app.display_name || app?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
 
        {/* Page 2: Add-ons */}
        {activeTab === 'addons' && (
          <div className="animate-in fade-in-50 duration-300">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-1 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Available Add-ons
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Discover new features and tools</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
              </div>
            ) : moreProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-subBody text-gray-500 dark:text-gray-400">No add-ons available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {moreProducts.map((app, idx) => (
                  <div
                    key={idx}
                    className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                      app.redirect_link
                        ? 'bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-orange-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-700 cursor-pointer hover:shadow-xl hover:scale-105 border border-gray-200 dark:border-gray-700'
                        : 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                    } ${isMenuLoading ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (app.redirect_link) {
                        handleMoreProductClick(app);
                      }
                    }}
                  >
                    {app.redirect_link && (
                      <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center shadow-lg">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    )}
                    <div className={`mb-3 transform transition-transform duration-300 ${app.redirect_link ? 'group-hover:scale-110' : ''}`}>
                      {renderSVG(app.icon)}
                    </div>
                    <span className={`text-xs font-semibold text-center transition-colors ${
                      app.redirect_link
                        ? 'text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {app.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
      </div>
    </PopoverContent>
  </Popover>
 
);
}
 
