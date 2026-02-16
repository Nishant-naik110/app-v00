"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import MultipleSelect from "@/components/ui/multiple-select";
import { ToggleButton } from "@/components/mf/ToggleButton";
import { RadioButtons } from "@/components/mf/RadioButton";
import ResizableTable from "@/components/mf/ReportingToolTable";
import { usePackage } from "@/components/mf/PackageContext";
import { useDateRange } from "@/components/mf/DateRangeContext";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";
import {
  useVtaEnablesPublishers,
  useVtaEnablesAgency,
  useGetThresholdWindow,
  useGetRuleSelection,
  useGetPayoutDetails,
  useGetCountryCodes,
  useGetConfiguredCountries,
  useGetEventTypes,
  useGetEventsToProcess,
  useSaveConfiguration,
  type FilterPayload,
  type SaveConfigurationPayload,
  type ThresholdWindowResponse,
  type RuleSelectionResponse,
  type PayoutDetailsResponse,
  type EventToProcess,
} from "../hooks/useConfiguration";
import ToastContent, { ToastType } from "@/components/mf/ToastContent";

// Constants - Configuration Keys
const CONFIG_KEYS = {
  THRESHOLD_WINDOW: "Threshold Window",
  RULE_SELECTION: "Rule Selection",
  PAYOUT_DETAILS: "Payout Deatils",
  GEO_SELECTION: "Geo Selection",
  EVENT_TO_PROCESS: "Event to Process",
} as const;

const THRESHOLD_WINDOW_KEYS = {
  CLICK_TO_INSTALL: "Click to Install Window (in Days)",
  INSTALL_TO_EVENT: "Install to Event Window (in Days)",
  VTA_ENABLES_PUBLISHERS: "VTA Enables Publishers",
  VTA_ENABLES_AGENCY: "VTA Enables Agency",
  RISK_TOLERANCE: "Risk Tolerence",
} as const;

const RULE_SELECTION_KEYS = {
  FAKE_DEVICE: "Fake Device",
  NON_PLAYSTORE: "Non Playstore",
  VIRTUAL_NETWORK: "Virtual Network",
  CLICK_SPAM: "Click Spam",
} as const;

const PAYOUT_TYPES = {
  IMPRESSION: "Impression",
  CLICK: "Click",
  INSTALL: "Install",
  EVENT: "Event",
} as const;

const EVENT_PROCESS_KEYS = {
  EVENT_NAME: "Event Name",
  SDK_S2S: "SDK/S2S",
} as const;

const SDK_S2S_OPTIONS = {
  SDK: "SDK",
  S2S: "S2S",
} as const;

const RISK_TOLERANCE_OPTIONS = ["Strict", "Average", "Basic"] as const;

const DEFAULT_RISK_TOLERANCE = "Basic";
const DEFAULT_SDK_S2S = SDK_S2S_OPTIONS.SDK;
const DEFAULT_PAYOUT_TYPE = PAYOUT_TYPES.IMPRESSION;
const DEFAULT_WINDOW_VALUE = 0;

// Types
type PayoutType = typeof PAYOUT_TYPES[keyof typeof PAYOUT_TYPES];
type RiskTolerance = typeof RISK_TOLERANCE_OPTIONS[number];
type SdkS2s = typeof SDK_S2S_OPTIONS[keyof typeof SDK_S2S_OPTIONS];
type RuleKey = keyof RuleSelections;

interface PublishersByType {
  [PAYOUT_TYPES.IMPRESSION]: string[];
  [PAYOUT_TYPES.CLICK]: string[];
  [PAYOUT_TYPES.INSTALL]: string[];
  [PAYOUT_TYPES.EVENT]: string[];
}

interface RuleSelections {
  fakeDevice: boolean;
  nonPlaystore: boolean;
  virtualNetwork: boolean;
  clickSpam: boolean;
}

const Configuration = () => {
  const { selectedPackage, isPackageLoading } = usePackage();
  const { startDate, endDate } = useDateRange();

  const [clickToInstallWindow, setClickToInstallWindow] = useState<number>(DEFAULT_WINDOW_VALUE);
  const [installToEventWindow, setInstallToEventWindow] = useState<number>(DEFAULT_WINDOW_VALUE);
  const [selectedVtaPublishers, setSelectedVtaPublishers] = useState<string[]>([]);
  const [selectedVtaAgency, setSelectedVtaAgency] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [selectedPublishersByType, setSelectedPublishersByType] = useState<PublishersByType>({
    [PAYOUT_TYPES.IMPRESSION]: [],
    [PAYOUT_TYPES.CLICK]: [],
    [PAYOUT_TYPES.INSTALL]: [],
    [PAYOUT_TYPES.EVENT]: [],
  });
  const [selectedGeos, setSelectedGeos] = useState<string[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [selectedRadio, setSelectedRadio] = useState<SdkS2s>(DEFAULT_SDK_S2S);
  const [selectedPayoutType, setSelectedPayoutType] = useState<PayoutType>(DEFAULT_PAYOUT_TYPE);
  const [selectedOsType, setSelectedOsType] = useState<"android" | "ios">("android");

  // Base payload for API calls
  const basePayload = useMemo<FilterPayload | undefined>(() => {
    if (!selectedPackage || !startDate || !endDate || isPackageLoading) {
      return undefined;
    }
    return {
      package_name: selectedPackage,
      start_date: startDate,
      end_date: endDate,
      os_type: selectedOsType,
    };
  }, [selectedPackage, startDate, endDate, isPackageLoading, selectedOsType]);

  // Package-only payload for APIs that don't need dates
  const packagePayload = useMemo(() => {
    if (!selectedPackage || isPackageLoading) {
      return undefined;
    }
    return {
      package_name: selectedPackage,
      os_type: selectedOsType,
    };
  }, [selectedPackage, isPackageLoading, selectedOsType]);

  // API Hooks - destructure data directly
  const { data: vtaEnablesPublishersList = [], isLoading: isVtaEnablesPublishersLoading } = useVtaEnablesPublishers(
    basePayload,
    !!basePayload
  );

  const { data: vtaAgencyList = [], isLoading: isVtaEnablesAgencyLoading } = useVtaEnablesAgency(basePayload, !!basePayload);

  const { data: thresholdWindowData, isLoading: isThresholdWindowLoading } = useGetThresholdWindow(
    packagePayload,
    !!packagePayload
  );

  const { data: ruleSelectionData, isLoading: isRuleSelectionLoading } = useGetRuleSelection(
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

  const { data: eventTypesList = [], isLoading: isEventTypesLoading } = useGetEventTypes(basePayload, !!basePayload);

  const { data: eventsToProcessData, isLoading: isEventsToProcessLoading } = useGetEventsToProcess(
    packagePayload,
    !!packagePayload
  );

  const saveConfigurationMutation = useSaveConfiguration();

  // Toast state for success/error messages
  const [toastData, setToastData] = useState<{
    type: ToastType;
    title: string;
    description?: string;
    variant?: "default" | "destructive" | null;
  } | null>(null);

  // Add refs to track state changes
  const isChangingPayoutType = useRef(false);
  const hasInitializedFromAPI = useRef(false);
  const lastPublishersByTypeRef = useRef<string>('');
  const lastSelectedPublishersRef = useRef<string>('');
  const lastVtaPublishersRef = useRef<string>('');

  // Rule selection toggles
  const [ruleSelections, setRuleSelections] = useState<RuleSelections>({
    fakeDevice: false,
    nonPlaystore: false,
    virtualNetwork: false,
    clickSpam: false,
  });



  // Events to process state - initialized from API but can be modified locally
  const [eventsToProcessList, setEventsToProcessList] = useState<any[]>([]);

  // Derived values
  const payoutDetails: PayoutDetailsResponse["payout_details"] = payoutDetailsData?.payout_details || {
    [PAYOUT_TYPES.IMPRESSION]: [],
    [PAYOUT_TYPES.CLICK]: [],
    [PAYOUT_TYPES.INSTALL]: [],
    [PAYOUT_TYPES.EVENT]: [],
  };

  // Table columns for events
  const eventColumns = [
    { title: EVENT_PROCESS_KEYS.EVENT_NAME, key: "eventName" },
    { title: EVENT_PROCESS_KEYS.SDK_S2S, key: "sdkS2s" },
  ];

  // Transform events to process data for table
  const eventsTableData = useMemo(() => {
    if (eventsToProcessList?.length > 0) {
      return eventsToProcessList.map((event: EventToProcess, index: number) => ({
        id: index + 1,
        eventName: event?.[EVENT_PROCESS_KEYS.EVENT_NAME],
        sdkS2s: event?.[EVENT_PROCESS_KEYS.SDK_S2S],
        status: "Active",
        action: "Edit",
      }));
    }
    return [];
  }, [eventsToProcessList]);

  // Add edit mode state for events table
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingEventRadio, setEditingEventRadio] = useState<SdkS2s>(DEFAULT_SDK_S2S);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  const handleRuleToggle = (rule: RuleKey) => {
    setRuleSelections((prev) => ({
      ...prev,
      [rule]: !prev[rule],
    }));
  };

  const removePublisher = (publisher: string) => {
    const newPublishers = selectedPublishers.filter((p) => p !== publisher);
    setSelectedPublishers(newPublishers);
    setSelectedPublishersByType((prev) => ({
      ...prev,
      [selectedPayoutType]: newPublishers,
    }));
  };

  const removeGeo = (geo: string) => {
    setSelectedGeos((prev) => prev.filter((g) => g !== geo));
  };

  // Add edit event handlers
  const handleEditEvent = (eventId: number) => {
    const event = eventsTableData.find((e) => e.id === eventId);
    if (event) {
      setEditingEventId(eventId);
      setEditingEventRadio(event.sdkS2s as SdkS2s);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEventEdit = () => {
    if (editingEventId === null) return;

    const tableEvent = eventsTableData.find((e) => e.id === editingEventId);
    if (!tableEvent) return;

    // Update events to process list
    const updatedEventsList = eventsToProcessList.map((event: EventToProcess) => {
      if (event?.[EVENT_PROCESS_KEYS.EVENT_NAME] === tableEvent.eventName) {
        return { ...event, [EVENT_PROCESS_KEYS.SDK_S2S]: editingEventRadio };
      }
      return event;
    });
    setEventsToProcessList(updatedEventsList);

    // Call save configuration API with only events to process
    if (selectedPackage) {
      const eventsToProcessFormatted: Record<string, string> = {};
      updatedEventsList.forEach((event: EventToProcess) => {
        const eventName = event?.[EVENT_PROCESS_KEYS.EVENT_NAME];
        if (eventName) {
          eventsToProcessFormatted[eventName] = event?.[EVENT_PROCESS_KEYS.SDK_S2S] || "";
        }
      });

      const payload: SaveConfigurationPayload = {
        package_name: selectedPackage,
        update_data: {
          [CONFIG_KEYS.THRESHOLD_WINDOW]: {
            [THRESHOLD_WINDOW_KEYS.CLICK_TO_INSTALL]: clickToInstallWindow,
            [THRESHOLD_WINDOW_KEYS.INSTALL_TO_EVENT]: installToEventWindow,
            [THRESHOLD_WINDOW_KEYS.VTA_ENABLES_PUBLISHERS]: selectedVtaPublishers,
            [THRESHOLD_WINDOW_KEYS.VTA_ENABLES_AGENCY]: selectedVtaAgency,
            [THRESHOLD_WINDOW_KEYS.RISK_TOLERANCE]: riskTolerance[0] || DEFAULT_RISK_TOLERANCE,
          },
          [CONFIG_KEYS.RULE_SELECTION]: {
            [RULE_SELECTION_KEYS.FAKE_DEVICE]: ruleSelections.fakeDevice,
            [RULE_SELECTION_KEYS.NON_PLAYSTORE]: ruleSelections.nonPlaystore,
            [RULE_SELECTION_KEYS.VIRTUAL_NETWORK]: ruleSelections.virtualNetwork,
            [RULE_SELECTION_KEYS.CLICK_SPAM]: ruleSelections.clickSpam,
          },
          [CONFIG_KEYS.PAYOUT_DETAILS]: {
            [PAYOUT_TYPES.INSTALL]: selectedPublishersByType[PAYOUT_TYPES.INSTALL] || [],
            [PAYOUT_TYPES.EVENT]: selectedPublishersByType[PAYOUT_TYPES.EVENT] || [],
            [PAYOUT_TYPES.IMPRESSION]: selectedPublishersByType[PAYOUT_TYPES.IMPRESSION] || [],
            [PAYOUT_TYPES.CLICK]: selectedPublishersByType[PAYOUT_TYPES.CLICK] || [],
          },
          [CONFIG_KEYS.GEO_SELECTION]: selectedGeos,
          [CONFIG_KEYS.EVENT_TO_PROCESS]: eventsToProcessFormatted,
        },
      };

      saveConfigurationMutation.mutate(payload, {
        onSuccess: () => {
          setToastData({
            type: "success",
            title: "Success",
            description: "Configuration saved successfully",
            variant: "default",
          });
        },
        onError: () => {
          setToastData({
            type: "error",
            title: "Error",
            description: "Failed to save configuration. Please try again.",
            variant: "destructive",
          });
        },
      });
    }

    // Reset edit mode
    setEditingEventId(null);
    setEditingEventRadio(DEFAULT_SDK_S2S);
    setIsEditModalOpen(false);
  };

  const handleCancelEventEdit = () => {
    setEditingEventId(null);
    setEditingEventRadio(DEFAULT_SDK_S2S);
    setIsEditModalOpen(false);
  };

  const handleRemoveEvent = (eventId: number) => {
    // Set the event to delete and open confirmation dialog
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = () => {
    if (eventToDelete === null) return;

    // Remove from API data (find by event name and SDK/S2S)
    const eventToRemove = eventsTableData.find(
      (event) => event.id === eventToDelete
    );
    if (eventToRemove) {
      const updatedEventsList = eventsToProcessList.filter(
        (event: EventToProcess) =>
          !(
            event?.[EVENT_PROCESS_KEYS.EVENT_NAME] === eventToRemove.eventName &&
            event?.[EVENT_PROCESS_KEYS.SDK_S2S] === eventToRemove.sdkS2s
          )
      );
      setEventsToProcessList(updatedEventsList);

      // Call save configuration API with only events to process
      if (selectedPackage) {
        const eventsToProcessFormatted: Record<string, string> = {};
        updatedEventsList.forEach((event: EventToProcess) => {
          const eventName = event?.[EVENT_PROCESS_KEYS.EVENT_NAME];
          if (eventName) {
            eventsToProcessFormatted[eventName] = event?.[EVENT_PROCESS_KEYS.SDK_S2S] || "";
          }
        });

        const payload: SaveConfigurationPayload = {
          package_name: selectedPackage,
          update_data: {
            [CONFIG_KEYS.THRESHOLD_WINDOW]: {
              [THRESHOLD_WINDOW_KEYS.CLICK_TO_INSTALL]: clickToInstallWindow,
              [THRESHOLD_WINDOW_KEYS.INSTALL_TO_EVENT]: installToEventWindow,
              [THRESHOLD_WINDOW_KEYS.VTA_ENABLES_PUBLISHERS]: selectedVtaPublishers,
              [THRESHOLD_WINDOW_KEYS.VTA_ENABLES_AGENCY]: selectedVtaAgency,
              [THRESHOLD_WINDOW_KEYS.RISK_TOLERANCE]: riskTolerance[0] || DEFAULT_RISK_TOLERANCE,
            },
            [CONFIG_KEYS.RULE_SELECTION]: {
              [RULE_SELECTION_KEYS.FAKE_DEVICE]: ruleSelections.fakeDevice,
              [RULE_SELECTION_KEYS.NON_PLAYSTORE]: ruleSelections.nonPlaystore,
              [RULE_SELECTION_KEYS.VIRTUAL_NETWORK]: ruleSelections.virtualNetwork,
              [RULE_SELECTION_KEYS.CLICK_SPAM]: ruleSelections.clickSpam,
            },
            [CONFIG_KEYS.PAYOUT_DETAILS]: {
              [PAYOUT_TYPES.INSTALL]: selectedPublishersByType[PAYOUT_TYPES.INSTALL] || [],
              [PAYOUT_TYPES.EVENT]: selectedPublishersByType[PAYOUT_TYPES.EVENT] || [],
              [PAYOUT_TYPES.IMPRESSION]: selectedPublishersByType[PAYOUT_TYPES.IMPRESSION] || [],
              [PAYOUT_TYPES.CLICK]: selectedPublishersByType[PAYOUT_TYPES.CLICK] || [],
            },
            [CONFIG_KEYS.GEO_SELECTION]: selectedGeos,
            [CONFIG_KEYS.EVENT_TO_PROCESS]: eventsToProcessFormatted,
          },
        };

        saveConfigurationMutation.mutate(payload, {
          onSuccess: () => {
            setToastData({
              type: "success",
              title: "Success",
              description: "Event deleted successfully",
              variant: "default",
            });
          },
          onError: () => {
            setToastData({
              type: "error",
              title: "Error",
              description: "Failed to delete event. Please try again.",
              variant: "destructive",
            });
          },
        });
      }
    }

    // Close dialog and reset state
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  // Handle table edit action
  const handleTableEdit = (item: any) => {
    handleEditEvent(item.id);
  };

  // Handle table delete action
  const handleTableDelete = (item: any) => {
    handleRemoveEvent(item.id);
  };

  // Get valid selected publishers for current payout type, filtering against available publishers list
  const validSelectedPublishers = useMemo(() => {
    const publishersForCurrentType = selectedPublishersByType[selectedPayoutType] || [];
    return publishersForCurrentType.filter((publisher) => 
      vtaEnablesPublishersList.includes(publisher)
    );
  }, [selectedPublishersByType, selectedPayoutType, vtaEnablesPublishersList]);

  // Handle Threshold Window API success
  useEffect(() => {
    if (!thresholdWindowData) return;

    const clickToInstall = thresholdWindowData[THRESHOLD_WINDOW_KEYS.CLICK_TO_INSTALL] || DEFAULT_WINDOW_VALUE;
    const installToEvent = thresholdWindowData[THRESHOLD_WINDOW_KEYS.INSTALL_TO_EVENT] || DEFAULT_WINDOW_VALUE;
    const riskTolValue = thresholdWindowData[THRESHOLD_WINDOW_KEYS.RISK_TOLERANCE];
    const riskTol: RiskTolerance[] = riskTolValue ? [riskTolValue as RiskTolerance] : [];

    setClickToInstallWindow((prev) => prev !== clickToInstall ? clickToInstall : prev);
    setInstallToEventWindow((prev) => prev !== installToEvent ? installToEvent : prev);
    setRiskTolerance((prev) => {
      const prevKey = prev.sort().join(',');
      const newKey = riskTol.sort().join(',');
      return prevKey !== newKey ? riskTol : prev;
    });

    // Set VTA publishers
    const vtaPublishers = thresholdWindowData[THRESHOLD_WINDOW_KEYS.VTA_ENABLES_PUBLISHERS];
    if (Array.isArray(vtaPublishers) && vtaEnablesPublishersList.length > 0) {
      const validPublishers = vtaPublishers.filter((publisher) => vtaEnablesPublishersList.includes(publisher));
      const vtaKey = validPublishers.sort().join(',');
      
      if (lastVtaPublishersRef.current !== vtaKey) {
        setSelectedVtaPublishers(validPublishers);
        lastVtaPublishersRef.current = vtaKey;
      }
    }

    // Set VTA agency
    const vtaAgency = thresholdWindowData[THRESHOLD_WINDOW_KEYS.VTA_ENABLES_AGENCY];
    if (Array.isArray(vtaAgency) && vtaAgencyList.length > 0) {
      setSelectedVtaAgency((prev) => {
        const validAgency = vtaAgency.filter((agency) => vtaAgencyList.includes(agency));
        const agencyKey = validAgency.sort().join(',');
        const prevKey = prev.sort().join(',');
        return prevKey !== agencyKey ? validAgency : prev;
      });
    }
  }, [thresholdWindowData, vtaEnablesPublishersList, vtaAgencyList]);

  // Handle Rule Selection API success
  useEffect(() => {
    if (ruleSelectionData?.[CONFIG_KEYS.RULE_SELECTION]) {
      const ruleData = ruleSelectionData[CONFIG_KEYS.RULE_SELECTION];
      setRuleSelections({
        fakeDevice: ruleData[RULE_SELECTION_KEYS.FAKE_DEVICE] || false,
        nonPlaystore: ruleData[RULE_SELECTION_KEYS.NON_PLAYSTORE] || false,
        virtualNetwork: ruleData[RULE_SELECTION_KEYS.VIRTUAL_NETWORK] || false,
        clickSpam: ruleData[RULE_SELECTION_KEYS.CLICK_SPAM] || false,
      });
    }
  }, [ruleSelectionData]);

  // Reset initialization flag when package changes
  useEffect(() => {
    hasInitializedFromAPI.current = false;
    lastPublishersByTypeRef.current = '';
    lastSelectedPublishersRef.current = '';
  }, [selectedPackage]);

  // Handle Payout Details API success - set publishersByType
  useEffect(() => {
    if (!payoutDetailsData?.payout_details) return;
    
    // Always update from API data, even if already initialized (to handle package changes)
    const payoutData = payoutDetailsData.payout_details as Record<string, string[]>;
    
    // Handle both direct property access and potential case variations
    const getPublishers = (key: string): string[] => {
      // Try exact match first
      if (payoutData[key] && Array.isArray(payoutData[key])) {
        return payoutData[key];
      }
      // Try case-insensitive match
      const foundKey = Object.keys(payoutData).find(
        k => k.toLowerCase() === key.toLowerCase()
      );
      if (foundKey && Array.isArray(payoutData[foundKey])) {
        return payoutData[foundKey];
      }
      return [];
    };
    
    const publishersByType: PublishersByType = {
      [PAYOUT_TYPES.IMPRESSION]: getPublishers(PAYOUT_TYPES.IMPRESSION),
      [PAYOUT_TYPES.CLICK]: getPublishers(PAYOUT_TYPES.CLICK),
      [PAYOUT_TYPES.INSTALL]: getPublishers(PAYOUT_TYPES.INSTALL),
      [PAYOUT_TYPES.EVENT]: getPublishers(PAYOUT_TYPES.EVENT),
    };

    const publishersKey = JSON.stringify(publishersByType);
    
    // Always update from API, don't check hasInitializedFromAPI here
    // This ensures we always have the latest data from the API
    setSelectedPublishersByType(publishersByType);
    lastPublishersByTypeRef.current = publishersKey;
    hasInitializedFromAPI.current = true;
  }, [payoutDetailsData]);

  // Set selected publishers when both payout details and publishers list are available
  // This syncs selectedPublishers with selectedPublishersByType for the current payout type
  useEffect(() => {
    if (!hasInitializedFromAPI.current) return;

    // Get publishers from selectedPublishersByType (which should already be set from payout details)
    const currentPayoutPublishers = selectedPublishersByType[selectedPayoutType] || [];
    
    // If publishers list is available, filter; otherwise show all from API
    const validPublishers = vtaEnablesPublishersList.length > 0
      ? currentPayoutPublishers.filter((publisher) => 
          vtaEnablesPublishersList.includes(publisher)
        )
      : currentPayoutPublishers;
    
    const validKey = `${selectedPayoutType}-${validPublishers.sort().join(',')}`;
    
    // Only update if different to avoid unnecessary re-renders
    if (lastSelectedPublishersRef.current !== validKey) {
      setSelectedPublishers(validPublishers);
      lastSelectedPublishersRef.current = validKey;
    }
  }, [selectedPayoutType, vtaEnablesPublishersList, selectedPublishersByType]);

  // Handle Configured Countries API success
  useEffect(() => {
    if (configuredCountriesList.length > 0) {
      const geosKey = configuredCountriesList.sort().join(',');
      setSelectedGeos((prev) => {
        const prevKey = prev.sort().join(',');
        return prevKey !== geosKey ? configuredCountriesList : prev;
      });
    }
  }, [configuredCountriesList]);

  // Reset selectedEventType when package changes
  useEffect(() => {
    setSelectedEventType("");
  }, [selectedPackage]);

  // Handle Event Types API success
  useEffect(() => {
    if (eventTypesList.length > 0) {
      setSelectedEventType(eventTypesList[0]);
    } else {
      setSelectedEventType("");
    }
  }, [eventTypesList]);

  // Handle Events to Process API success
  useEffect(() => {
    if (eventsToProcessData?.[CONFIG_KEYS.EVENT_TO_PROCESS]) {
      setEventsToProcessList(eventsToProcessData[CONFIG_KEYS.EVENT_TO_PROCESS]);
    }
  }, [eventsToProcessData]);

  // Clear toast after 5 seconds
  useEffect(() => {
    if (toastData) {
      const timer = setTimeout(() => {
        setToastData(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastData]);

  // Load stored publishers when switching payout types - use ref to avoid circular dependency
  const selectedPublishersByTypeRef = useRef(selectedPublishersByType);
  useEffect(() => {
    selectedPublishersByTypeRef.current = selectedPublishersByType;
  }, [selectedPublishersByType]);

  // Load stored publishers when switching payout types
  useEffect(() => {
    if (isChangingPayoutType.current || !hasInitializedFromAPI.current) return;

    const storedPublishers = selectedPublishersByType[selectedPayoutType] || [];
    
    // If publishers list is available, filter; otherwise show all from API
    const validStoredPublishers = vtaEnablesPublishersList.length > 0
      ? storedPublishers.filter((publisher) =>
          vtaEnablesPublishersList.includes(publisher)
        )
      : storedPublishers;

    const storedKey = `${selectedPayoutType}-${validStoredPublishers.sort().join(',')}`;
    
    // Only update if the stored publishers are different from what we have
    setSelectedPublishers((prev) => {
      const prevKey = `${selectedPayoutType}-${[...prev].sort().join(',')}`;
      if (prevKey !== storedKey) {
        lastSelectedPublishersRef.current = storedKey;
        return validStoredPublishers;
      }
      return prev;
    });
  }, [selectedPayoutType, vtaEnablesPublishersList, selectedPublishersByType]);

  // Validate selected publishers (only when publishers list changes AND after API data is loaded)
  useEffect(() => {
    if (vtaEnablesPublishersList.length === 0 || !hasInitializedFromAPI.current) return;

    // Validate publishersByType for ALL payout types, but only filter invalid ones
    // Don't clear valid publishers that are in the API response
    setSelectedPublishersByType((prevByType) => {
      const updated: PublishersByType = {
        [PAYOUT_TYPES.IMPRESSION]: (prevByType[PAYOUT_TYPES.IMPRESSION] || []).filter((publisher) =>
          vtaEnablesPublishersList.includes(publisher)
        ),
        [PAYOUT_TYPES.CLICK]: (prevByType[PAYOUT_TYPES.CLICK] || []).filter((publisher) =>
          vtaEnablesPublishersList.includes(publisher)
        ),
        [PAYOUT_TYPES.INSTALL]: (prevByType[PAYOUT_TYPES.INSTALL] || []).filter((publisher) =>
          vtaEnablesPublishersList.includes(publisher)
        ),
        [PAYOUT_TYPES.EVENT]: (prevByType[PAYOUT_TYPES.EVENT] || []).filter((publisher) =>
          vtaEnablesPublishersList.includes(publisher)
        ),
      };
      
      const byTypeKey = JSON.stringify(updated);
      if (lastPublishersByTypeRef.current !== byTypeKey) {
        lastPublishersByTypeRef.current = byTypeKey;
        return updated;
      }
      return prevByType;
    });

    // Validate current selectedPublishers for the current payout type
    setSelectedPublishers((prev) => {
      const validPublishers = prev.filter((publisher) =>
        vtaEnablesPublishersList.includes(publisher)
      );

      if (validPublishers.length !== prev.length) {
        const validKey = `${selectedPayoutType}-${validPublishers.sort().join(',')}`;
        lastSelectedPublishersRef.current = validKey;
        return validPublishers;
      }
      return prev;
    });

    // Validate VTA publishers
    setSelectedVtaPublishers((prev) => {
      const validVtaPublishers = prev.filter((publisher) =>
        vtaEnablesPublishersList.includes(publisher)
      );
      const vtaKey = validVtaPublishers.sort().join(',');
      
      if (lastVtaPublishersRef.current !== vtaKey && validVtaPublishers.length !== prev.length) {
        lastVtaPublishersRef.current = vtaKey;
        return validVtaPublishers;
      }
      return prev;
    });
  }, [vtaEnablesPublishersList, selectedPayoutType]);

  // Handle payout type change - save current publishers and switch type
  const handlePayoutTypeChange = (newPayoutType: string) => {
    const payoutType = newPayoutType as PayoutType;
    // Set flag to prevent the loading useEffect from running during transition
    isChangingPayoutType.current = true;

    // Create a local copy of the current state and update it
    const currentPublishersByType: PublishersByType = { ...selectedPublishersByType };
    currentPublishersByType[selectedPayoutType] = [...selectedPublishers];

    // Update the stored publishers
    setSelectedPublishersByType(currentPublishersByType);

    // Change the payout type
    setSelectedPayoutType(payoutType);

    // Load publishers for the new type
    const publishersForNewType = currentPublishersByType[payoutType] || [];
    setSelectedPublishers(publishersForNewType);

    // Reset flag after a brief delay to ensure all state updates are processed
    setTimeout(() => {
      isChangingPayoutType.current = false;
    }, 100);
  };

  // Handle MultipleSelect changes
  const handlePublisherSelectionChange = (newPublishers: string[]) => {
    setSelectedPublishers(
      newPublishers.filter((publisher) => vtaEnablesPublishersList.includes(publisher))
    );
  };

  const handlePublisherApply = (newPublishers: string[]) => {
    const validPublishers = newPublishers.filter((publisher) =>
      vtaEnablesPublishersList.includes(publisher)
    );
    setSelectedPublishers(validPublishers);
    setSelectedPublishersByType((prev) => ({
      ...prev,
      [selectedPayoutType]: validPublishers,
    }));
  };

  const handleAddEvent = () => {
    // Only add event if we have a selected event type
    if (!selectedEventType) {
      console.warn("No event type selected");
      return;
    }

    // Add to the events to process list (eventsTableData is derived from this)
    const newEventForAPI: EventToProcess = {
      [EVENT_PROCESS_KEYS.EVENT_NAME]: selectedEventType,
      [EVENT_PROCESS_KEYS.SDK_S2S]: selectedRadio,
    };
    setEventsToProcessList((prev) => [...prev, newEventForAPI]);

    // Call save configuration API with only events to process
    if (selectedPackage) {
      const eventsToProcessFormatted: Record<string, string> = {};
      const updatedEventsList = [...eventsToProcessList, newEventForAPI];
      updatedEventsList.forEach((event: EventToProcess) => {
        const eventName = event[EVENT_PROCESS_KEYS.EVENT_NAME];
        eventsToProcessFormatted[eventName] = event[EVENT_PROCESS_KEYS.SDK_S2S];
      });

      const payload: SaveConfigurationPayload = {
        package_name: selectedPackage,
        update_data: {
          [CONFIG_KEYS.THRESHOLD_WINDOW]: {
            [THRESHOLD_WINDOW_KEYS.CLICK_TO_INSTALL]: clickToInstallWindow,
            [THRESHOLD_WINDOW_KEYS.INSTALL_TO_EVENT]: installToEventWindow,
            [THRESHOLD_WINDOW_KEYS.VTA_ENABLES_PUBLISHERS]: selectedVtaPublishers,
            [THRESHOLD_WINDOW_KEYS.VTA_ENABLES_AGENCY]: selectedVtaAgency,
            [THRESHOLD_WINDOW_KEYS.RISK_TOLERANCE]: riskTolerance[0] || DEFAULT_RISK_TOLERANCE,
          },
          [CONFIG_KEYS.RULE_SELECTION]: {
            [RULE_SELECTION_KEYS.FAKE_DEVICE]: ruleSelections.fakeDevice,
            [RULE_SELECTION_KEYS.NON_PLAYSTORE]: ruleSelections.nonPlaystore,
            [RULE_SELECTION_KEYS.VIRTUAL_NETWORK]: ruleSelections.virtualNetwork,
            [RULE_SELECTION_KEYS.CLICK_SPAM]: ruleSelections.clickSpam,
          },
          [CONFIG_KEYS.PAYOUT_DETAILS]: {
            [PAYOUT_TYPES.INSTALL]: selectedPublishersByType[PAYOUT_TYPES.INSTALL] || [],
            [PAYOUT_TYPES.EVENT]: selectedPublishersByType[PAYOUT_TYPES.EVENT] || [],
            [PAYOUT_TYPES.IMPRESSION]: selectedPublishersByType[PAYOUT_TYPES.IMPRESSION] || [],
            [PAYOUT_TYPES.CLICK]: selectedPublishersByType[PAYOUT_TYPES.CLICK] || [],
          },
          [CONFIG_KEYS.GEO_SELECTION]: selectedGeos,
          [CONFIG_KEYS.EVENT_TO_PROCESS]: eventsToProcessFormatted,
        },
      };

      saveConfigurationMutation.mutate(payload, {
        onSuccess: () => {
          setToastData({
            type: "success",
            title: "Success",
            description: "Event added successfully",
            variant: "default",
          });
        },
        onError: () => {
          setToastData({
            type: "error",
            title: "Error",
            description: "Failed to add event. Please try again.",
            variant: "destructive",
          });
        },
      });
    }
  };

  // Handle save configuration
  const handleSaveConfiguration = async () => {
    if (!selectedPackage) {
      console.error("No package selected");
      return;
    }

    // Transform events to process data to the required format
    const eventsToProcessFormatted: Record<string, string> = {};
    eventsToProcessList.forEach((event: EventToProcess) => {
      const eventName = event[EVENT_PROCESS_KEYS.EVENT_NAME];
      eventsToProcessFormatted[eventName] = event[EVENT_PROCESS_KEYS.SDK_S2S];
    });

    const payload: SaveConfigurationPayload = {
      package_name: selectedPackage,
      update_data: {
        [CONFIG_KEYS.THRESHOLD_WINDOW]: {
          [THRESHOLD_WINDOW_KEYS.CLICK_TO_INSTALL]: clickToInstallWindow,
          [THRESHOLD_WINDOW_KEYS.INSTALL_TO_EVENT]: installToEventWindow,
          [THRESHOLD_WINDOW_KEYS.VTA_ENABLES_PUBLISHERS]: selectedVtaPublishers,
          [THRESHOLD_WINDOW_KEYS.VTA_ENABLES_AGENCY]: selectedVtaAgency,
          [THRESHOLD_WINDOW_KEYS.RISK_TOLERANCE]: riskTolerance[0] || DEFAULT_RISK_TOLERANCE,
        },
        [CONFIG_KEYS.RULE_SELECTION]: {
          [RULE_SELECTION_KEYS.FAKE_DEVICE]: ruleSelections.fakeDevice,
          [RULE_SELECTION_KEYS.NON_PLAYSTORE]: ruleSelections.nonPlaystore,
          [RULE_SELECTION_KEYS.VIRTUAL_NETWORK]: ruleSelections.virtualNetwork,
          [RULE_SELECTION_KEYS.CLICK_SPAM]: ruleSelections.clickSpam,
        },
        [CONFIG_KEYS.PAYOUT_DETAILS]: {
          [PAYOUT_TYPES.INSTALL]: selectedPublishersByType[PAYOUT_TYPES.INSTALL] || [],
          [PAYOUT_TYPES.EVENT]: selectedPublishersByType[PAYOUT_TYPES.EVENT] || [],
          [PAYOUT_TYPES.IMPRESSION]: selectedPublishersByType[PAYOUT_TYPES.IMPRESSION] || [],
          [PAYOUT_TYPES.CLICK]: selectedPublishersByType[PAYOUT_TYPES.CLICK] || [],
        },
        [CONFIG_KEYS.GEO_SELECTION]: selectedGeos,
        [CONFIG_KEYS.EVENT_TO_PROCESS]: eventsToProcessFormatted,
      },
    };

    saveConfigurationMutation.mutate(payload, {
      onSuccess: () => {
        setToastData({
          type: "success",
          title: "Success",
          description: "Configuration saved successfully",
          variant: "default",
        });
      },
      onError: () => {
        setToastData({
          type: "error",
          title: "Error",
          description: "Failed to save configuration. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const finalPublishersByType = {
    ...selectedPublishersByType,
    [selectedPayoutType]: validSelectedPublishers,
  };

  return (
    <div className="py-2 flex flex-col gap-4 w-full  dark:text-white">
      {/* Toast for success/error messages */}
      {toastData && (
        <ToastContent
          type={toastData.type}
          title={toastData.title}
          description={toastData.description}
          variant={toastData.variant}
        />
      )}

      {/* OS Type Filter */}
      
        <div className="flex flex-col gap-2">
          <RadioButtons
            options={[
              { label: "Android", value: "android" },
              { label: "iOS", value: "ios" },
            ]}
            className="dark:text-white"
            
            defaultValue={selectedOsType}
            onValueChange={(value: string) => setSelectedOsType(value as "android" | "ios")}
          />
        </div>
     

      {/* Main Content Area */}
     
          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-2">
            {/* Left Column - Configuration Settings */}

            <div className="  border border-gray-200 rounded-lg p-2 bg-gray-200 dark:bg-background">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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
                      Install to Event Window (in Days)
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
                      htmlFor="vtaEnables"
                      className="text-body font-semibold dark:text-white pl-1"
                    >
                      VTA Enables Publishers
                    </Label>
                    <MultipleSelect
                      key="vta-publishers"
                      options={vtaEnablesPublishersList}
                      selectedValues={selectedVtaPublishers}
                      onSelectionChange={setSelectedVtaPublishers}
                      onApply={setSelectedVtaPublishers}
                      placeholder={
                        isVtaEnablesPublishersLoading
                          ? "Loading..."
                          : "Select publishers"
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="vtaEnablesAgency"
                      className="text-body font-semibold dark:text-white pl-1"
                    >
                      VTA Enables Agency
                    </Label>
                    <MultipleSelect
                      key="vta-agency"
                      options={vtaAgencyList.length > 0 ? vtaAgencyList : []}
                      selectedValues={selectedVtaAgency}
                      onSelectionChange={setSelectedVtaAgency}
                      onApply={setSelectedVtaAgency}
                      placeholder={
                        isVtaEnablesAgencyLoading
                          ? "Loading..."
                          : "Select agency"
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
                      {/* <Info className="h-4 w-4 text-primary " /> */}
                    </div>
                    <MFSingleSelect
                      items={RISK_TOLERANCE_OPTIONS.map((option) => ({
                        title: option,
                        value: option,
                      }))}
                      value={riskTolerance[0] || ""}
                      onValueChange={(value) => setRiskTolerance([value as RiskTolerance])}
                      placeholder="Select risk tolerance"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Rule Selection Section - Visual Sub-card */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-100 space-y-3 dark:bg-background">
                  <div className="flex items-center gap-2 ">
                    <Label className="text-body font-semibold dark:text-white">
                      Rule Selection
                    </Label>
                    {/* <Info className="h-4 w-4 text-primary" /> */}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-1">
                      <Label className="text-body dark:text-white">
                        Fake Device
                      </Label>
                      <Switch
                        checked={ruleSelections.fakeDevice}
                        onCheckedChange={() => handleRuleToggle("fakeDevice")}
                      />
                    </div>
                    <div className="flex items-center justify-between p-1">
                      <Label className="text-body dark:text-white">
                        {RULE_SELECTION_KEYS.NON_PLAYSTORE}
                      </Label>
                      <Switch
                        checked={ruleSelections.nonPlaystore}
                        onCheckedChange={() => handleRuleToggle("nonPlaystore")}
                      />
                    </div>
                    <div className="flex items-center justify-between p-1">
                      <Label className="text-body dark:text-white">
                        {RULE_SELECTION_KEYS.VIRTUAL_NETWORK}
                      </Label>
                      <Switch
                        checked={ruleSelections.virtualNetwork}
                        onCheckedChange={() =>
                          handleRuleToggle("virtualNetwork")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-1">
                      <Label className="text-body dark:text-white">
                        {RULE_SELECTION_KEYS.CLICK_SPAM}
                      </Label>
                      <Switch
                        checked={ruleSelections.clickSpam}
                        onCheckedChange={() => handleRuleToggle("clickSpam")}
                      />
                    </div>
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
                  <div className=" space-y-2 text-body">
                    <ToggleButton
                      options={Object.values(PAYOUT_TYPES).map((type) => ({
                        label: type,
                        value: type,
                      }))}
                      selectedValue={selectedPayoutType}
                      onChange={handlePayoutTypeChange}
                      className="w-full"
                    />
                    <div className="space-y-2">
                      <MultipleSelect
                        options={vtaEnablesPublishersList}
                        selectedValues={validSelectedPublishers}
                        onSelectionChange={handlePublisherSelectionChange}
                        onApply={handlePublisherApply}
                        placeholder={
                          isVtaEnablesPublishersLoading ||
                          isPayoutDetailsLoading
                            ? "Loading..."
                            : vtaEnablesPublishersList.length === 0
                              ? "No publishers available"
                              : "Select publishers"
                        }
                        className="mt-1"
                      />
                      {validSelectedPublishers.length > 0 &&
                        vtaEnablesPublishersList.length > 0 && (
                          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50 dark:bg-card">
                            <div className="flex flex-wrap gap-2">
                              {validSelectedPublishers.map(
                                (publisher, index) => (
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
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                {/* Geo Selection Card */}
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-200 space-y-2 dark:bg-background">
                  <Label className="text-body font-semibold">
                    Geo Selection
                  </Label>
                  <MultipleSelect
                    options={countryCodesList}
                    selectedValues={selectedGeos}
                    onSelectionChange={setSelectedGeos}
                    onApply={setSelectedGeos}
                    placeholder={
                      isCountryCodesLoading ||
                      isConfiguredCountriesLoading
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
              <div className="flex justify-end">
        <Button
          size="sm"
          className="w-24"
          onClick={handleSaveConfiguration}
          disabled={saveConfigurationMutation.isPending}
        >
          {saveConfigurationMutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
            </div>

            <div className="space-y-2 ">
              {/* Events to Process Card */}
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-200 space-y-3 dark:bg-background">
                <Label className="text-body font-semibold dark:text-white">
                  Events to Process
                </Label>
                <div className="flex items-center gap-2">
                  <MFSingleSelect
                    items={eventTypesList.map((eventType) => ({
                      title: eventType,
                      value: eventType,
                    }))}
                    value={selectedEventType}
                    onValueChange={(value) => setSelectedEventType(value)}
                    placeholder={
                      isEventTypesLoading
                        ? "Loading..."
                        : "Select event type"
                    }
                    className="w-32"
                  />
                  <RadioGroup
                    value={selectedRadio}
                    onValueChange={(value) => setSelectedRadio(value as SdkS2s)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={SDK_S2S_OPTIONS.SDK} id="sdk" />
                      <Label htmlFor="sdk" className="text-body">
                        {SDK_S2S_OPTIONS.SDK}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={SDK_S2S_OPTIONS.S2S} id="s2s" />
                      <Label htmlFor="s2s" className="text-body">
                        {SDK_S2S_OPTIONS.S2S}
                      </Label>
                    </div>
                  </RadioGroup>
                  <Button
                    size="sm"
                    className="text-white dark:text-white h-8 w-16"
                    onClick={handleAddEvent}
                    disabled={!selectedEventType || isEventTypesLoading}
                  >
                    Add
                  </Button>
                </div>

                {/* Events Table Card */}
                {/* <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 dark:bg-background"> */}
                <ResizableTable
                  columns={eventColumns}
                  data={eventsTableData}
                  isTableDownload={false}
                  isSearchable={false}
                  isPaginated={true}
                  onPageChange={() => {}}
                  onLimitChange={() => {}}
                  pageNo={1}
                  limit={10}
                  totalPages={1}
                  totalRecords={eventsTableData.length}
                  containerHeight={530}
                  emptyStateMessage={"No Data Found!"}
                  isEdit={true}
                  isDelete={true}
                  onEdit={handleTableEdit}
                  onDelete={handleTableDelete}
                  isLoading={isEventsToProcessLoading}
                />
              </div>
            </div>
          </div>
    

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Event Configuration</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eventName" className="text-right">
                Event Type:
              </Label>
              <div className="col-span-3">
                {editingEventId !== null &&
                  eventsTableData.find((e) => e.id === editingEventId)
                    ?.eventName}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-3">
                <RadioGroup
                  value={editingEventRadio}
                  onValueChange={(value) => setEditingEventRadio(value as SdkS2s)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={SDK_S2S_OPTIONS.SDK} id="modal-sdk" />
                    <Label htmlFor="modal-sdk">{SDK_S2S_OPTIONS.SDK}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={SDK_S2S_OPTIONS.S2S} id="modal-s2s" />
                    <Label htmlFor="modal-s2s">{SDK_S2S_OPTIONS.S2S}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCancelEventEdit}>Cancel</Button>
            <Button onClick={handleSaveEventEdit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this event?
          </div>
          <DialogFooter>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              className="text-white bg-primary hover:bg-primary"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteEvent}
              className="text-white bg-primary hover:bg-primary"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Configuration;
