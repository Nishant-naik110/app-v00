import React, { useEffect, useState, useCallback } from "react";
import {
  useGetScheduleOccurrence as useGetScheduleOccurrenceAnalytics,
  useGetDownloadOccurrence as useGetDownloadOccurrenceAnalytics,
  useGetMailingListList as useGetMailingListListAnalytics,
  type MailingListListPayload,
} from "@/app/(app)/app-analytics/hooks/useReport";
import {
  useGetScheduleOccurrence as useGetScheduleOccurrenceIntegrity,
  useGetDownloadOccurrence as useGetDownloadOccurrenceIntegrity,
  useGetMailingListList as useGetMailingListListIntegrity,
} from "@/app/(app)/integrity/hooks/useIntegrityReport";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Minus, Plus, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePackage } from "@/components/mf/PackageContext";
import { MFDateRangePicker } from "@/components/mf/MFDateRangePicker";
import { DateRangeProvider, useDateRange } from "@/components/mf/DateRangeContext";
import { MFSingleSelect } from "@/components/mf/MFSingleSelect";

interface DeliveryOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "schedule" | "download";
  onSubmit: (payload: any) => void;
  defaultData?: any;
  mode?: any;
  frequency?: string;
  onFrequencyChange?: (value: string) => void;
  categories?: string[]; // Dynamic list of categories
  module?: "app-analytics" | "integrity";
  isSubmitting?: boolean; // Prevent closing during submission
}

interface MailingList {
  id: string | number;
  mailing_list_name: string;
}

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface CategoryEmailData {
  emails: string[];
  emailErrors: string[];
  selectedMailingLists: string[];
  isDropdownOpen: boolean;
}

const DeliveryOptionsModalContent = ({
  isOpen,
  onClose,
  type,
  onSubmit,
  defaultData,
  mode,
  frequency,
  onFrequencyChange,
  categories = [],
  module = "app-analytics",
  isSubmitting = false,
}: DeliveryOptionsModalProps) => {
  const { startDate, endDate } = useDateRange();
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const [saveToCloud, setSaveToCloud] = useState(true);
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<"AWS">("AWS");

  // Dynamic category-based email data
  const [categoryEmailData, setCategoryEmailData] = useState<Record<string, CategoryEmailData>>({});

  const [cloudConfigs, setCloudConfigs] = useState({
    AWS: { accessKey: "", secretKey: "", bucketName: "" },
  });

  const [mailinglist, setMailinglist] = useState<MailingList[]>([]);
  const { selectedPackage } = usePackage();
  const [occurrenceOptions, setOccurrenceOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [occurrenceError, setOccurrenceError] = useState<string>("");
  const [cloudError, setCloudError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  // Initialize category data when categories change
  useEffect(() => {
    if (categories.length > 0) {
      setCategoryEmailData((prev) => {
        const newData = { ...prev };
        categories.forEach((cat) => {
          if (!newData[cat]) {
            newData[cat] = {
              emails: [""],
              emailErrors: [""],
              selectedMailingLists: [],
              isDropdownOpen: false,
            };
          }
        });
        return newData;
      });
    }
  }, [categories]);

  // Conditionally use hooks based on module
  const useGetScheduleOccurrence = module === "integrity" ? useGetScheduleOccurrenceIntegrity : useGetScheduleOccurrenceAnalytics;
  const useGetDownloadOccurrence = module === "integrity" ? useGetDownloadOccurrenceIntegrity : useGetDownloadOccurrenceAnalytics;
  const useGetMailingListList = module === "integrity" ? useGetMailingListListIntegrity : useGetMailingListListAnalytics;

  // API hooks for occurrence
  const scheduleOccurrence = useGetScheduleOccurrence(selectedPackage || undefined, isOpen && type === "schedule");
  const downloadOccurrence = useGetDownloadOccurrence(selectedPackage || undefined, isOpen && type === "download");

  const occurrenceData = type === "schedule" ? scheduleOccurrence.data : downloadOccurrence.data;
  const occurrenceLoading = type === "schedule" ? scheduleOccurrence.isLoading : downloadOccurrence.isLoading;

  useEffect(() => {
    if (occurrenceData && Array.isArray(occurrenceData)) {
      setOccurrenceOptions(occurrenceData);
    }
  }, [occurrenceData]);

  // API hook for mailing lists
  const [mailingListPayload, setMailingListPayload] = useState<MailingListListPayload | undefined>(undefined);
  const { data: mailingListData, isLoading: mailingListLoading, refetch: refetchMailingList } = useGetMailingListList(
    mailingListPayload,
    !!mailingListPayload
  );

  useEffect(() => {
    if (mailingListData?.mailing_lists && Array.isArray(mailingListData.mailing_lists)) {
      setMailinglist(mailingListData.mailing_lists);
    }
  }, [mailingListData]);

  const refreshMailingList = useCallback(() => {
    if (selectedPackage && sendViaEmail && frequency) {
      setMailingListPayload({
        package_name: selectedPackage,
        page_number: 1,
        record_limit: 100,
        occurance: frequency,
      });
    } else if (selectedPackage && sendViaEmail) {
      // Call API even without frequency if sendViaEmail is true
      setMailingListPayload({
        package_name: selectedPackage,
        page_number: 1,
        record_limit: 100,
      });
    }
  }, [selectedPackage, frequency, sendViaEmail]);

  // Call mailing list API when modal opens, sendViaEmail is enabled, or frequency changes
  useEffect(() => {
    if (isOpen && sendViaEmail && selectedPackage) {
      refreshMailingList();
    }
  }, [isOpen, sendViaEmail, selectedPackage, frequency, refreshMailingList]);

  // Helper to map mailing list names to IDs
  const mapMailingListNamesToIds = useCallback((names: string[]): string[] => {
    return names
      .map((name) => {
        const found = mailinglist.find((ml) => ml.mailing_list_name === name);
        return found ? String(found.id) : null;
      })
      .filter((id): id is string => Boolean(id));
  }, [mailinglist]);

  // Initialize form data from defaultData
  useEffect(() => {
    if (!defaultData || categories.length === 0) return;

    // Handle AWS configuration
    const { aws } = defaultData;
    if (aws?.status) {
      setSelectedCloudProvider("AWS");
      setSaveToCloud(true);
      setCloudConfigs({
        AWS: {
          accessKey: aws.aws_access_key_id || "",
          secretKey: aws.aws_secret_access_key || "",
          bucketName: aws.bucket_name || "",
        },
      });
    }

    // Handle email configuration dynamically for each category
    categories.forEach((category) => {
      const categoryKey = category.toLowerCase();
      const categoryData = defaultData[categoryKey];

      // Check category-specific email first, then fallback to root-level email
      const emailData = categoryData?.email || defaultData?.email;

      if (emailData?.status) {
        setSendViaEmail(true);
        const emailAddresses = emailData.to || [""];
        const mailingListNames = emailData.mail_id_list || [];

        setCategoryEmailData((prev) => ({
          ...prev,
          [category]: {
            emails: emailAddresses.length > 0 ? emailAddresses : [""],
            emailErrors: new Array(emailAddresses.length > 0 ? emailAddresses.length : 1).fill(""),
            selectedMailingLists: mapMailingListNamesToIds(mailingListNames),
            isDropdownOpen: false,
          },
        }));
      }
    });
  }, [defaultData, categories, mailinglist, mapMailingListNamesToIds]);

  useEffect(() => {
    if (isOpen) {
      setSaveToCloud(false);
    }
  }, [isOpen, type]);

  useEffect(() => {
    setShowDatePicker(type === "download" && frequency === "Custom Range");
  }, [type, frequency]);

  // Dynamic handler for mailing list toggle
  const handleMailingListToggle = useCallback((category: string, listId: string | number) => {
    if (mode === "view") return;
    const idStr = String(listId);

    setCategoryEmailData((prev) => {
      const categoryData = prev[category];
      if (!categoryData) return prev;

      const isCurrentlySelected = categoryData.selectedMailingLists.includes(idStr);
      const newSelection = isCurrentlySelected
        ? categoryData.selectedMailingLists.filter((id: string) => id !== idStr)
        : [...categoryData.selectedMailingLists, idStr];

      if (newSelection.length > 0) {
        setEmailError("");
      }

      return {
        ...prev,
        [category]: {
          ...categoryData,
          selectedMailingLists: newSelection,
        },
      };
    });
  }, [mode]);

  // Dynamic handler for email change with validation
  const handleEmailChange = useCallback((category: string, index: number, value: string) => {
    setCategoryEmailData((prev) => {
      const categoryData = prev[category];
      if (!categoryData) return prev;

      const newEmails = [...categoryData.emails];
      newEmails[index] = value;

      const newErrors = [...categoryData.emailErrors];
      if (value.trim() === "") {
        newErrors[index] = "";
      } else {
        newErrors[index] = isValidEmail(value) ? "" : "Please enter a valid email address";
      }

      if (value.trim() !== "") {
        setEmailError("");
      }

      return {
        ...prev,
        [category]: {
          ...categoryData,
          emails: newEmails,
          emailErrors: newErrors,
        },
      };
    });
  }, []);

  // Dynamic handler for adding email field
  const handleAddEmail = useCallback((category: string) => {
    setCategoryEmailData((prev) => {
      const categoryData = prev[category];
      if (!categoryData) return prev;

      return {
        ...prev,
        [category]: {
          ...categoryData,
          emails: [...categoryData.emails, ""],
          emailErrors: [...categoryData.emailErrors, ""],
        },
      };
    });
  }, []);

  // Dynamic handler for removing email field
  const handleRemoveEmail = useCallback((category: string, index: number) => {
    setCategoryEmailData((prev) => {
      const categoryData = prev[category];
      if (!categoryData) return prev;

      return {
        ...prev,
        [category]: {
          ...categoryData,
          emails: categoryData.emails.filter((_, i) => i !== index),
          emailErrors: categoryData.emailErrors.filter((_, i) => i !== index),
        },
      };
    });
  }, []);

  // Dynamic handler for dropdown toggle
  const handleDropdownToggle = useCallback((category: string) => {
    if (mode === "view") return;
    setCategoryEmailData((prev) => {
      const categoryData = prev[category];
      if (!categoryData) return prev;

      return {
        ...prev,
        [category]: {
          ...categoryData,
          isDropdownOpen: !categoryData.isDropdownOpen,
        },
      };
    });
  }, [mode]);

  // Function to copy data from one category to another
  const copyCategoryData = useCallback((fromCategory: string, toCategory: string) => {
    setCategoryEmailData((prev) => {
      const fromData = prev[fromCategory];
      if (!fromData) return prev;

      return {
        ...prev,
        [toCategory]: {
          ...fromData,
          isDropdownOpen: false,
        },
      };
    });
    setEmailError("");
  }, []);

  // Function to clear category data
  const clearCategoryData = useCallback((category: string) => {
    setCategoryEmailData((prev) => ({
      ...prev,
      [category]: {
        emails: [""],
        emailErrors: [""],
        selectedMailingLists: [],
        isDropdownOpen: false,
      },
    }));
  }, []);

  // Check if category has data
  const hasCategoryData = useCallback((category: string) => {
    const data = categoryEmailData[category];
    if (!data) return false;
    return data.selectedMailingLists.length > 0 || data.emails.some(email => email.trim() !== "");
  }, [categoryEmailData]);



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const anyDropdownOpen = Object.values(categoryEmailData).some(data => data.isDropdownOpen);

      if (anyDropdownOpen && !target.closest(".relative")) {
        setCategoryEmailData((prev) => {
          const newData = { ...prev };
          Object.keys(newData).forEach((key) => {
            newData[key] = { ...newData[key], isDropdownOpen: false };
          });
          return newData;
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoryEmailData]);

  const getSelectedMailingListNames = useCallback((selectedIds: string[]) => {
    return selectedIds
      .map((id) => {
        const found = mailinglist.find((ml) => String(ml.id) === id);
        return found?.mailing_list_name;
      })
      .filter(Boolean) as string[];
  }, [mailinglist]);

  const handleConfirm = () => {
    // Clear any previous errors
    setOccurrenceError("");
    setCloudError("");
    setEmailError("");

    // Validate occurrence
    if (!frequency || frequency.trim() === "") {
      setOccurrenceError("Please select occurrence");
      return;
    }

    // For download type, at least one delivery option must be selected
    if (type === "schedule") {
      if (!sendViaEmail && !saveToCloud) {
        setEmailError("Please select at least one delivery option (Send via Email or Save to Cloud)");
        setCloudError("Please select at least one delivery option (Send via Email or Save to Cloud)");
        return;
      }
    }

    // Validate cloud configuration if save to cloud is enabled
    if (saveToCloud) {
      const config = cloudConfigs[selectedCloudProvider];
      if (!config.accessKey || !config.secretKey || !config.bucketName) {
        setCloudError("Please fill all cloud configuration fields");
        return;
      }
    }

    // Validate email configuration if send via email is enabled
    if (sendViaEmail && categories.length > 0) {
      let hasValidEmailConfig = false;

      // Check if any category has email configuration
      for (const category of categories) {
        const data = categoryEmailData[category];
        if (data) {
          const hasMailingLists = data.selectedMailingLists.length > 0;
          const hasEmails = data.emails.some(email => email.trim() !== "");
          if (hasMailingLists || hasEmails) {
            hasValidEmailConfig = true;
            break;
          }
        }
      }

      if (!hasValidEmailConfig) {
        setEmailError("Please select mailing lists or enter email addresses for at least one category");
        return;
      }
    }
    const cloudOptions = saveToCloud ? {
      aws: {
        status: true,
        aws_access_key_id: cloudConfigs.AWS.accessKey,
        aws_secret_access_key: cloudConfigs.AWS.secretKey,
        bucket_name: cloudConfigs.AWS.bucketName,
      },
    } : {};

    // Create delivery configurations dynamically for all categories
    const deliveryPayload: any = {};

    categories.forEach((category) => {
      const data = categoryEmailData[category];
      if (!data) return;

      const mailingListNames = getSelectedMailingListNames(data.selectedMailingLists);
      const filteredEmails = data.emails.filter((email: string) => email.trim() !== "");
      const hasMailingLists = mailingListNames.length > 0;

      const emailSection = {
        status: sendViaEmail,
        mail_type: hasMailingLists ? "group" : "individual",
        mail_id_list: mailingListNames,
        email_group: mailingListNames,
        to: filteredEmails,
        subject: "",
        name: ""
      };

      deliveryPayload[category.toLowerCase()] = {
        ...cloudOptions,
        email: emailSection
      };
    });

    if (startDate && endDate) {
      deliveryPayload.dateRange = {
        startDate: startDate,
        endDate: endDate,
      };
    }
    onSubmit(deliveryPayload);
    // Don't close modal here - let parent component close it on success
  };


  return (
   
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing during submission
      if (!open && isSubmitting) return;
      onClose();
    }}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold dark:text-white">
            {type === "schedule" ? "Schedule Report" : "Download Report"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 w-full">
          {/* Occurrence Dropdown */}
          <div className="space-y-2 mb-4 w-[95%] mx-auto">
            <Label className="dark:text-white">Occurrence</Label>
            {occurrenceLoading ? (
              <div className="flex items-center justify-center p-2 border border-input rounded-md h-10">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : (
              <MFSingleSelect
                items={occurrenceOptions.map((option) => ({
                  title: option.label,
                  value: option.value,
                }))}
                placeholder="Select Occurrence"
                value={frequency}
                onValueChange={(value) => {
                  if (onFrequencyChange) {
                    onFrequencyChange(value);
                  }
                  // Clear error when user selects a frequency
                  setOccurrenceError("");
                }}
                className={mode === "view" ? "opacity-50 pointer-events-none" : ""}
              />
            )}
            {showDatePicker && (
              <div className="mt-2">
                <MFDateRangePicker />
              </div>
            )}
            {occurrenceError && (
              <div className="text-red-500 text-subBody mt-1">
                {occurrenceError}
              </div>
            )}
          </div>

          <div className="">
            <div className="flex">
              <div className="flex items-center gap-2 min-w-[150px] px-4 py-2">
                <Checkbox
                  id="save-cloud"
                  checked={saveToCloud}
                  onCheckedChange={(checked) => {
                    setSaveToCloud(checked as boolean);
                    // Clear cloud error when checkbox is toggled
                    if (checked) {
                      setCloudError("");
                      setEmailError("");
                    }
                  }}
                  disabled={mode === "view"}
                />
                <Label htmlFor="save-cloud" className="text-subBody font-medium dark:text-white">
                  Save to Cloud{type === "schedule" && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
              <div className="flex items-center gap-2 min-w-[150px] px-4 py-2">
                <Checkbox
                  id="send-email"
                  checked={sendViaEmail}
                  onCheckedChange={(checked) => {
                    setSendViaEmail(checked as boolean);
                    // Clear email error when checkbox is toggled
                    if (checked) {
                      setEmailError("");
                      setCloudError("");
                    }
                  }}
                  disabled={mode === "view"}
                />
                <Label htmlFor="send-email" className="text-subBody font-medium dark:text-white">
                  Send via Email{type === "schedule" && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
            </div>
            {/* Show error if download type and neither option is selected */}
            {type === "schedule" && !sendViaEmail && !saveToCloud && (cloudError || emailError) && (
              <div className="text-red-500 text-subBody mt-2 ml-4">
                Please select at least one delivery option (Send via Email or Save to Cloud)
              </div>
            )}
          </div>


          {sendViaEmail && categories.length > 0 && (
            <div className="">
              {/* Dynamic Category Sections */}
              {categories.map((category, categoryIndex) => {
                const data = categoryEmailData[category];
                if (!data) return null;

                const firstCategory = categories[0];
                const showCopyButton = categoryIndex > 0 && hasCategoryData(firstCategory);

                return (
                  <div key={category} className="space-y-6 rounded-lg border p-2 mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-body font-semibold text-primary capitalize dark:text-white">{category}</h3>

                        {/* Copy from first category functionality */}
                        {showCopyButton && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copyCategoryData(firstCategory, category)}
                            disabled={mode === "view"}
                            className="text-xs"
                          >
                            📋 Copy from {firstCategory}
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Selected mailing lists display */}
                        {data.selectedMailingLists.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {data.selectedMailingLists.map((listId) => {
                              const mailingListItem = mailinglist.find(ml => String(ml.id) === listId);
                              if (!mailingListItem) return null;

                              return (
                                <div key={listId} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-subBody dark:text-white">
                                  <span>{mailingListItem.mailing_list_name}</span>
                                  {mode !== "view" && (
                                    <X
                                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMailingListToggle(category, listId);
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Custom dropdown for selecting mailing lists */}
                        <div className="relative">
                          <div
                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-subBody ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${mode === "view" ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => handleDropdownToggle(category)}
                          >
                            <span className="flex-1 dark:text-white">
                              {data.selectedMailingLists.length === 0
                                ? `Choose ${category} Mailing Lists`
                                : `${data.selectedMailingLists.length} mailing list${data.selectedMailingLists.length > 1 ? 's' : ''} selected`
                              }
                            </span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${data.isDropdownOpen ? 'rotate-180' : ''}`} />
                          </div>

                          {data.isDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto dark:text-white">
                              {mailingListLoading ? (
                                <div className="flex justify-center items-center p-4">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                              ) : mailinglist.length === 0 ? (
                                <p className="p-4 text-center text-muted-foreground">
                                  No mailing lists available
                                </p>
                              ) : (
                                mailinglist.map((list) => {
                                  const isSelected = data.selectedMailingLists.includes(String(list.id));

                                  return (
                                    <div
                                      key={list.id}
                                      className="flex items-center gap-2 p-2 hover:bg-accent"
                                    >
                                      <Checkbox
                                        id={`${category}-mailing-list-checkbox-${list.id}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          if (mode !== "view") {
                                            handleMailingListToggle(category, list.id);
                                          }
                                        }}
                                        disabled={mode === "view"}
                                      />
                                      <Label
                                        htmlFor={`${category}-mailing-list-checkbox-${list.id}`}
                                        className="flex-1 cursor-pointer"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (mode !== "view") {
                                            handleMailingListToggle(category, list.id);
                                          }
                                        }}
                                      >
                                        {list.mailing_list_name}
                                      </Label>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {data.emails.map((email, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex gap-2">
                              <Input
                                type="email"
                                placeholder={`Enter ${category} Email`}
                                value={email}
                                onChange={(e) => handleEmailChange(category, index, e.target.value)}
                                className={`flex-1 ${data.emailErrors[index] ? 'border-red-500 focus:ring-red-500' : ''}`}
                                disabled={mode === "view"}
                              />
                              {mode !== "view" && (
                                <div className="flex gap-2 shrink-0 items-center">
                                  {index === data.emails.length - 1 && (
                                    <Plus
                                      onClick={() => handleAddEmail(category)}
                                      className="h-6 w-6 p-1 text-white bg-primary rounded-full flex items-center justify-center hover:border-primary/30 transition-colors" />
                                  )}
                                  {data.emails.length > 1 && (

                                    <Minus
                                      onClick={() => handleRemoveEmail(category, index)}
                                      className="h-6 w-6 p-1 text-white bg-primary border border-primary rounded-full flex items-center justify-center hover:border-primary/30 transition-colors"
                                    />
                                  )}
                                </div>
                              )}

                            </div>
                            {data.emailErrors[index] && (
                              <div className="text-red-500 text-xs ml-2">
                                {data.emailErrors[index]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Email configuration error message */}
              {emailError && (
                <div className="text-red-500 text-subBody mt-2 ml-4">
                  {emailError}
                </div>
              )}

            </div>
          )}

          {saveToCloud && (
            <div className="space-y-4 rounded-lg border p-4 mt-4">
              <div className="border-b">
                <div className="flex">
                  {["AWS"].map((provider) => (
                    <button
                      disabled={mode === "view"}
                      key={provider}
                      onClick={() =>
                        setSelectedCloudProvider(
                          provider as "AWS"
                        )
                      }
                      className={`relative min-w-[100px] border-b-2 px-4 py-2 text-subBody font-medium transition-colors hover:text-primary ${selectedCloudProvider === provider
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground"
                        }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-white">Secret Key</Label>
                <Input
                  value={cloudConfigs.AWS.secretKey}
                  onChange={(e) => {
                    setCloudConfigs((prev) => ({
                      ...prev,
                      AWS: { ...prev.AWS, secretKey: e.target.value },
                    }));
                    if (e.target.value.trim() !== "") setCloudError("");
                  }}
                  placeholder="Enter AWS Secret Key"
                  disabled={mode === "view"}
                  className="dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-white">Access Key</Label>
                <Input
                  value={cloudConfigs.AWS.accessKey}
                  onChange={(e) => {
                    setCloudConfigs((prev) => ({
                      ...prev,
                      AWS: { ...prev.AWS, accessKey: e.target.value },
                    }));
                    if (e.target.value.trim() !== "") setCloudError("");
                  }}
                  placeholder="Enter AWS Access Key"
                  disabled={mode === "view"}
                  className="dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-white">Bucket Name</Label>
                <Input
                  value={cloudConfigs.AWS.bucketName}
                  onChange={(e) => {
                    setCloudConfigs((prev) => ({
                      ...prev,
                      AWS: { ...prev.AWS, bucketName: e.target.value },
                    }));
                    if (e.target.value.trim() !== "") setCloudError("");
                  }}
                  placeholder="Enter Bucket Name"
                  disabled={mode === "view"}
                  className="dark:text-white"
                />
              </div>

              {/* Cloud configuration error message */}
              {cloudError && (
                <div className="text-red-500 text-subBody mt-2">
                  {cloudError}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            onClick={onClose}
            variant="default"
            size="sm"
          
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="default"
            size="sm"
            disabled={mode === "view" || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {type === "schedule" ? "Scheduling..." : "Downloading..."}
              </>
            ) : (
              type === "schedule" ? "Schedule" : "Download"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};



export default DeliveryOptionsModalContent;
