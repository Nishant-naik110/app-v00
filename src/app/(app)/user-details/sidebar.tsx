"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type SidebarProps = Partial<{
  buttonNames: string[];
  activeButton: string;
  activeButtonStyle: React.CSSProperties;
  buttonClasses: string;
  handleButtonClick: (buttonName: string) => void;
}>;

const Sidebar = ({
  // buttonNames = ["Profile", "Team", "Billing", "Notification", "Security"],
  buttonNames = ["Security"],
  activeButton = "",
  activeButtonStyle = {
    backgroundColor: "hsl(var(--primary))",
    color: "white",
  },
  buttonClasses = "w-full md:py-2 px-4 md:mb-4 text-center text-body",
  handleButtonClick = () => {},
}:SidebarProps ) => {
  const router = useRouter();

  // Filter out the active button to hide it
  const filteredButtonNames = buttonNames.filter(name => name !== activeButton);

  useEffect(() => {
    if (activeButton === "Profile") {
      router.push("/user-details/profile");
    }
    if (activeButton === "Team") {
      router.push("/user-details/teams");
    }
    if (activeButton === "Billing") {
      router.push("/user-details/billing");
    }
    if (activeButton === "Notification") {
      router.push("/user-details/notification");
    }
    if (activeButton === "Security") {
      router.push("/user-details/security");
    }
  }, [activeButton]);

  return (
    <>
      {/* Sidebar for medium screens and above */}
      <div className="max-w-xs fixed z-0 hidden h-screen  p-4 dark:bg-card md:block flex flex-col items-center">
        <ul className="w-full flex flex-col items-center">
          {filteredButtonNames.map((buttonName) => (
            <li key={buttonName} className="w-full flex justify-center mb-2">
              <Button
                variant={activeButton === buttonName ? "default" : "secondary"}
                style={activeButton === buttonName ? activeButtonStyle : {}}
                className="px-4 py-2 rounded-[20px] border border-gray-300 text-subBody w-auto min-w-[100px] text-center"
                onClick={() => handleButtonClick(buttonName)}
              >
                {buttonName}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Buttons as a row in mobile view, hiding the sidebar */}
      <div className="mb-4 flex w-full justify-center md:hidden">
        {filteredButtonNames.map((buttonName) => (
          <button
            key={buttonName}
            style={activeButton === buttonName ? activeButtonStyle : {}}
            className={`${buttonClasses} mx-1 text-xs`}
            onClick={() => handleButtonClick(buttonName)}
          >
            {buttonName}
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
