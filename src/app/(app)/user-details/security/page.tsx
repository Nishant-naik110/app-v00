"use client";
import React from "react";
import { MFACard, ChangePassword } from "./components";

const SecurityPage = () => {
  console.log("SecurityPage rendering");
  
  return (
    <div className=" p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cards Container */}
        <div className="grid gap-6 lg:gap-8 xl:grid-cols-2 max-w-5xl mx-auto">
          <div className="border  shadow-lg border-gray-200 bg-white dark:bg-card  rounded-lg p-4">
            <h2 className="text-body font-semibold text-foreground">MFA </h2>
            <MFACard />
          </div>
          <div className="border shadow-lg border-gray-200 bg-white dark:bg-card  rounded-lg p-4">
            <h2 className="text-body font-semibold text-foreground">Reset Password</h2>
            <ChangePassword />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
