"use client";

import React from "react";
import URLRedirectionComponent from "./URLRedirectionComponent";
import RuleGeoConfigurationComponent from "./RuleGeoConfigurationComponent";

const URLRedirectionConfiguration = () => {
  return (
    <div className="w-full p-2 sm:p-4 lg:p-0">
      <URLRedirectionComponent />
      <RuleGeoConfigurationComponent />
    </div>
  );
};

export default URLRedirectionConfiguration;
