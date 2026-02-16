"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import MultipleSelect from "@/components/ui/multiple-select";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import { ToggleButton } from "@/components/mf/ToggleButton";
import { usePackage } from "@/components/mf/PackageContext";
import { useDateRange } from "@/components/mf/DateRangeContext";
import {
  useVtaEnablesPublishers,
  useGetAttributionWindow,
  useGetPayoutDetails,
  useGetCountryCodes,
  useGetConfiguredCountries,
  useSaveConfiguration,
} from "../hooks/useConfiguration";
import ToastContent, { ToastType } from "@/components/mf/ToastContent";

const Configuration = () => {
  const { selectedPackage, isPackageLoading } = usePackage();
  const { startDate, endDate } = useDateRange();
  const [clickToInstallWindow, setClickToInstallWindow] = useState(0);
  const [installToEventWindow, setInstallToEventWindow] = useState(0);
  const [frequencyCap, setFrequencyCap] = useState(0);
  const [vtaPublishersList, setVtaPublishersList] = useState<string[]>([]);
  const [selectedVtaPublishers, setSelectedVtaPublishers] = useState<string[]>([]);
  const [selectedRiskTolerance, setSelectedRiskTolerance] = useState<string>("");
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [selectedPublishersByType, setSelectedPublishersByType] = useState<{
    Impression: string[];
    Click: string[];
    Conversion: string[];
    Event: string[];
  }>({
    Impression: [],
    Click: [],
    Conversion: [],
    Event: [],
  });
  const [selectedGeos, setSelectedGeos] = useState<string[]>([]);
  const [selectedPayoutType, setSelectedPayoutType] = useState("Impression");
  // Add a ref to track if we're in the middle of a payout type change
  const isChangingPayoutType = useRef(false);
  // Add a ref to track if we've initialized from API data
  const hasInitializedFromAPI = useRef(false);

  // Base payload for API calls
  const basePayload = useMemo(() => {
    if (!selectedPackage || !startDate || !endDate || isPackageLoading) {
      return undefined;
    }
    return {
      package_name: selectedPackage,
      start_date: startDate,
      end_date: endDate,
    };
  }, [selectedPackage, startDate, endDate, isPackageLoading]);

  // Package-only payload for APIs that don't need dates
  const packagePayload = useMemo(() => {
    if (!selectedPackage || isPackageLoading) {
      return undefined;
    }
    return {
      package_name: selectedPackage,
    };
  }, [selectedPackage, isPackageLoading]);

  // API Hooks - destructure data directly
  const { data: vtaEnablesPublishersList = [], isLoading: isVtaEnablesPublishersLoading } = useVtaEnablesPublishers(
    basePayload,
    !!basePayload
  );

  const { data: attributionWindowData, isLoading: isAttributionWindowLoading } = useGetAttributionWindow(
    packagePayload,
    !!packagePayload
  );

  const { data: payoutDetailsData, isLoading: isPayoutDetailsLoading } = useGetPayoutDetails(
    packagePayload,
    !!packagePayload
  );

  const { data: countryCodesList = [], isLoading: isCountryCodesLoading } = useGetCountryCodes(
    packagePayload,
    !!packagePayload
  );

  const { data: configuredCountriesList = [], isLoading: isConfiguredCountriesLoading } = useGetConfiguredCountries(
    packagePayload,
    !!packagePayload
  );

  // Save Configuration API - mutation hook
  const saveConfigurationMutation = useSaveConfiguration();

  // Toast state for success/error messages
  const [toastData, setToastData] = useState<{
    type: ToastType;
    title: string;
    description?: string;
    variant?: "default" | "destructive" | null;
  } | null>(null);

  // Success and error handling for save operation
  useEffect(() => {
    if (saveConfigurationMutation.isSuccess) {
      setToastData({
        type: "success",
        title: "Success",
        description: "Configuration saved successfully",
        variant: "default",
      });
    }
  }, [saveConfigurationMutation.isSuccess]);

  useEffect(() => {
    if (saveConfigurationMutation.isError) {
      setToastData({
        type: "error",
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    }
  }, [saveConfigurationMutation.isError]);

  // Clear toast after 5 seconds
  useEffect(() => {
    if (toastData) {
      const timer = setTimeout(() => {
        setToastData(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastData]);

  // Payout publishers options - use the same VTA publishers list
  const payoutPublishersOptions = vtaPublishersList;

  // Filter selected publishers to only include those that are available in the options
  const validSelectedPublishers = useMemo(() => 
    selectedPublishers.filter(publisher => payoutPublishersOptions.includes(publisher)),
    [selectedPublishers, payoutPublishersOptions]
  );

  // Filter selected VTA publishers to only include those that are available in the options
  const validSelectedVtaPublishers = useMemo(() =>
    selectedVtaPublishers.filter(publisher => vtaPublishersList.includes(publisher)),
    [selectedVtaPublishers, vtaPublishersList]
  );

  const riskToleranceOptions = ["Low", "Medium", "High"];

  // Handle VTA Enables Publishers API data
  useEffect(() => {
    if (Array.isArray(vtaEnablesPublishersList) && vtaEnablesPublishersList.length > 0) {
      setVtaPublishersList(vtaEnablesPublishersList);
    }
  }, [vtaEnablesPublishersList]);

  // Handle Attribution Window API data
  useEffect(() => {
    if (attributionWindowData) {
      setClickToInstallWindow(attributionWindowData["Click to Open Window (in Days)"] || 0);
      setInstallToEventWindow(attributionWindowData["Inactivity Window"] || 0);
      setFrequencyCap(attributionWindowData["Frequency Cap"] || 0);
      
      // Only set VTA publishers if we have the publishers list
      if (vtaPublishersList.length > 0) {
        const vtaPublishers = attributionWindowData["VTA Enables Publishers"];
        if (Array.isArray(vtaPublishers)) {
          const validPublishers = vtaPublishers.filter((publisher) =>
            vtaPublishersList.includes(publisher)
          );
          setSelectedVtaPublishers(validPublishers);
        } else {
          setSelectedVtaPublishers([]);
        }
      }
      setSelectedRiskTolerance(
        attributionWindowData["Risk Tolerence"] ? attributionWindowData["Risk Tolerence"] : ""
      );
    }
  }, [attributionWindowData, vtaPublishersList]);

  // Handle Payout Details API data
  useEffect(() => {
    if (payoutDetailsData?.payout_details && !hasInitializedFromAPI.current) {
      // Initialize selectedPublishersByType with data from API
      const publishersByType = {
        Impression: payoutDetailsData.payout_details.Impression || [],
        Click: payoutDetailsData.payout_details.Click || [],
        Conversion: payoutDetailsData.payout_details.Conversion || [],
        Event: payoutDetailsData.payout_details.Event || [],
      };
      setSelectedPublishersByType(publishersByType);

      // Set selected publishers based on current payout type, but filter against available options
      const currentPayoutPublishers =
        payoutDetailsData.payout_details[
          selectedPayoutType as keyof typeof payoutDetailsData.payout_details
        ] || [];
      
      // Only set selected publishers if we have the publishers list loaded
      if (vtaPublishersList.length > 0) {
        const filteredPublishers = currentPayoutPublishers.filter((publisher) =>
          vtaPublishersList.includes(publisher)
        );
        setSelectedPublishers(filteredPublishers);
      }

      // Mark as initialized to prevent future overrides
      hasInitializedFromAPI.current = true;
    }
  }, [payoutDetailsData, selectedPayoutType, vtaPublishersList]);

  // Load stored publishers when switching payout types
  useEffect(() => {
    // Skip if we're in the middle of changing payout type or if vtaPublishersList is empty
    if (isChangingPayoutType.current || vtaPublishersList.length === 0) {
      return;
    }

    // Load publishers for the current payout type
    const storedPublishers =
      selectedPublishersByType[
        selectedPayoutType as keyof typeof selectedPublishersByType
      ] || [];

    // Filter stored publishers to only include those that are available in the current options
    const validStoredPublishers = storedPublishers.filter(publisher =>
      vtaPublishersList.includes(publisher)
    );

    // Only update if the valid stored publishers are different from current selection
    if (
      JSON.stringify(validStoredPublishers.sort()) !==
      JSON.stringify(selectedPublishers.sort())
    ) {
      setSelectedPublishers(validStoredPublishers);
    }
  }, [selectedPayoutType, vtaPublishersList, selectedPublishersByType, selectedPublishers]);

  // Clear selected publishers when publishers list is empty or loading
  useEffect(() => {
    if (vtaPublishersList.length === 0 && !isVtaEnablesPublishersLoading) {
      setSelectedPublishers([]);
      setSelectedVtaPublishers([]);
    }
  }, [vtaPublishersList, isVtaEnablesPublishersLoading]);

  // Validate selected publishers when publishers list changes
  useEffect(() => {
    if (vtaPublishersList.length > 0) {
      validateSelectedPublishers();
      validateSelectedVtaPublishers();
    }
  }, [vtaPublishersList]);

  // Handle payout type change - save current publishers and switch type
  const handlePayoutTypeChange = (newPayoutType: string) => {
    // Set flag to prevent the loading useEffect from running during transition
    isChangingPayoutType.current = true;

    // Save current publishers for the current type
    setSelectedPublishersByType((prev) => ({
      ...prev,
      [selectedPayoutType]: [...selectedPublishers],
    }));

    // Change the payout type
    setSelectedPayoutType(newPayoutType);

    // Load publishers for the new type
    const publishersForNewType =
      selectedPublishersByType[
        newPayoutType as keyof typeof selectedPublishersByType
      ] || [];
    setSelectedPublishers(publishersForNewType);

    // Reset flag after a brief delay to ensure all state updates are processed
    setTimeout(() => {
      isChangingPayoutType.current = false;
    }, 100);
  };

  // Handle Configured Countries API data
  useEffect(() => {
    if (Array.isArray(configuredCountriesList) && configuredCountriesList.length > 0) {
      // Set the configured countries as selected geos
      setSelectedGeos(configuredCountriesList);
    }
  }, [configuredCountriesList]);

  const removePublisher = (publisher: string) => {
    const newPublishers = selectedPublishers.filter((p) => p !== publisher);
    setSelectedPublishers(newPublishers);

    // Also update the stored publishers for current type
    setSelectedPublishersByType((prev) => ({
      ...prev,
      [selectedPayoutType]: newPublishers,
    }));
  };

  // Validate and clean up selected publishers to ensure they are all valid
  const validateSelectedPublishers = () => {
    const availablePublishers = payoutPublishersOptions;
    const validPublishers = selectedPublishers.filter(publisher =>
      availablePublishers.includes(publisher)
    );
    
    if (validPublishers.length !== selectedPublishers.length) {
      setSelectedPublishers(validPublishers);
      setSelectedPublishersByType((prev) => ({
        ...prev,
        [selectedPayoutType]: validPublishers,
      }));
    }
  };

  // Validate and clean up selected VTA publishers to ensure they are all valid
  const validateSelectedVtaPublishers = () => {
    const availablePublishers = vtaPublishersList;
    const validPublishers = selectedVtaPublishers.filter(publisher =>
      availablePublishers.includes(publisher)
    );
    
    if (validPublishers.length !== selectedVtaPublishers.length) {
      setSelectedVtaPublishers(validPublishers);
    }
  };

  const removeGeo = (geo: string) => {
    setSelectedGeos((prev) => prev.filter((g) => g !== geo));
  };

  // Handle MultipleSelect changes
  const handlePublisherSelectionChange = (newPublishers: string[]) => {
    // Only allow selection of publishers that are actually available in the options
    const availablePublishers = payoutPublishersOptions;
    const validPublishers = newPublishers.filter(publisher => 
      availablePublishers.includes(publisher)
    );
    setSelectedPublishers(validPublishers);
  };

  const handlePublisherApply = (newPublishers: string[]) => {
    // Only allow selection of publishers that are actually available in the options
    const availablePublishers = payoutPublishersOptions;
    const validPublishers = newPublishers.filter(publisher => 
      availablePublishers.includes(publisher)
    );
    
    // Update both current selection and stored selection for the current type
    setSelectedPublishers(validPublishers);
    setSelectedPublishersByType((prev) => ({
      ...prev,
      [selectedPayoutType]: validPublishers,
    }));
  };

  const handleSaveConfiguration = () => {
    if (!selectedPackage) {
      return;
    }

    // Make sure we have the latest publishers for current type saved
    const finalPublishersByType = {
      ...selectedPublishersByType,
      [selectedPayoutType]: validSelectedPublishers,
    };

    const payload = {
      package_name: selectedPackage,
      update_data: {
        "Threshold Window": {
          "Click to Open Window (in Days)": clickToInstallWindow,
          "Inactivity Window": installToEventWindow,
          "Frequency Cap": frequencyCap,
          "VTA Enables Publishers": validSelectedVtaPublishers,
          "Risk Tolerence":
            selectedRiskTolerance
              ? selectedRiskTolerance.toLowerCase()
              : "low",
        },
        "Payout Details": {
          Impression: finalPublishersByType.Impression,
          Click: finalPublishersByType.Click,
          Conversion: finalPublishersByType.Conversion,
          Event: finalPublishersByType.Event,
        },
        "Geo Selection": selectedGeos,
      },
    };

    saveConfigurationMutation.mutate(payload);
  };

  return (
    <div className=" py-2 flex flex-col gap-6 w-full ">
      {/* Toast for success/error messages */}
      {toastData && (
        <ToastContent
          type={toastData.type}
          title={toastData.title}
          description={toastData.description}
          variant={toastData.variant}
        />
      )}

      
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 dark:text-white">
            {/* Left Column - Configuration Settings */}
            <div className="space-y-2">
              <div className="space-y-2 border border-gray-200 rounded-lg p-2 bg-gray-200 dark:bg-background">
                <div>
                  <Label
                    htmlFor="clickToInstall"
                    className="text-body font-semibold dark:text-white pl-1"
                  >
                    Click to Install Window (in Days)
                  </Label>
                  <Input
                    id="clickToInstall"
                    type="number"
                    value={clickToInstallWindow}
                    onChange={(e) =>
                      setClickToInstallWindow(Number(e.target.value))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="installToEvent"
                    className="text-body font-semibold dark:text-white pl-1"
                  >
                    Inactivity Window
                  </Label>
                  <Input
                    id="installToEvent"
                    type="number"
                    value={installToEventWindow}
                    onChange={(e) =>
                      setInstallToEventWindow(Number(e.target.value))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="frequencyCap"
                    className="text-body font-semibold dark:text-white pl-1"
                  >
                    Frequency Cap
                  </Label>
                  <Input
                    id="frequencyCap"
                    type="number"
                    value={frequencyCap}
                    onChange={(e) => setFrequencyCap(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="vtaEnables"
                    className="text-body font-semibold dark:text-white pl-1"
                  >
                    VTA Enables Publishers
                  </Label>
                  <MultipleSelect
                    key="vta-publishers"
                    options={
                      vtaPublishersList.length > 0 ? vtaPublishersList : []
                    }
                    selectedValues={validSelectedVtaPublishers}
                    onSelectionChange={setSelectedVtaPublishers}
                    onApply={setSelectedVtaPublishers}
                    placeholder={
                      isVtaEnablesPublishersLoading ||
                      isAttributionWindowLoading
                        ? "Loading..."
                        : vtaPublishersList.length === 0
                        ? "No publishers available"
                        : "Select publishers"
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="riskTolerance"
                      className="text-body font-semibold dark:text-white pl-1"
                    >
                      Risk Tolerance
                    </Label>
                  </div>
                  <MFSingleSelect
                    items={riskToleranceOptions.map(option => ({
                      title: option,
                      value: option
                    }))}
                    value={selectedRiskTolerance}
                    onValueChange={setSelectedRiskTolerance}
                    placeholder={
                      isAttributionWindowLoading
                        ? "Loading..."
                        : "Select risk tolerance"
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Middle Column - Payout Details & Geo Selection */}
            <div className="space-y-2 ">
              {/* Payout Details Card */}
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-200 dark:bg-background ">
                <Label className="text-body font-semibold">
                  Payout Details
                </Label>
                <div className="mt-3 space-y-2 text-body">
                  <ToggleButton
                    options={[
                      { label: "Impression", value: "Impression" },
                      { label: "Click", value: "Click" },
                      { label: "Conversion", value: "Conversion" },
                      { label: "Event", value: "Event" },
                    ]}
                    selectedValue={selectedPayoutType}
                    onChange={handlePayoutTypeChange}
                    className="w-full"
                  />
                  <div className="space-y-3">
                    <MultipleSelect
                      options={payoutPublishersOptions}
                      selectedValues={validSelectedPublishers}
                      onSelectionChange={handlePublisherSelectionChange}
                      onApply={handlePublisherApply}
                      placeholder={
                        isVtaEnablesPublishersLoading ||
                        isPayoutDetailsLoading
                          ? "Loading..."
                          : payoutPublishersOptions.length === 0
                          ? "No publishers available"
                          : "Select publishers"
                      }
                      className="mt-1"
                    />
                    {validSelectedPublishers.length > 0 && payoutPublishersOptions.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50 dark:bg-card">
                        <div className="flex flex-wrap gap-2">
                          {validSelectedPublishers.map((publisher, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 text-white p-2"
                            >
                              {publisher}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removePublisher(publisher)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Geo Selection Card */}
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-200 space-y-2 dark:bg-background">
                <Label className="text-body font-semibold">Geo Selection</Label>
                <MultipleSelect
                  options={countryCodesList}
                  selectedValues={selectedGeos}
                  onSelectionChange={setSelectedGeos}
                  onApply={setSelectedGeos}
                  placeholder={
                    isCountryCodesLoading || isConfiguredCountriesLoading
                      ? "Loading..."
                      : "Select geos"
                  }
                />
                {selectedGeos.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50 dark:bg-card">
                    <div className="flex flex-wrap gap-2 ">
                      {selectedGeos.map((geo, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 p-2 text-white"
                        >
                          {geo}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeGeo(geo)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
       
      <div className="flex justify-center">
        <Button
          size="sm"
          className="w-24"
          onClick={handleSaveConfiguration}
          disabled={saveConfigurationMutation.isPending}
        >
          {saveConfigurationMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default Configuration;