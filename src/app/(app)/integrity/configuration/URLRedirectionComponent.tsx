"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Copy, ArrowRight, Trash2, Loader2, Check } from "lucide-react";
import ResizableTable from "@/components/mf/ReportingToolTable";
import { usePackage } from "@/components/mf/PackageContext";
import { MdEdit } from "react-icons/md";
import {
  useGetUrlRedirection,
  generateUrlApi,
  generateShortenedUrlApi,
  updateUrlRedirectionApi,
  checkRedirectionApi,
  type RedirectionResult,
} from "../hooks/useUrlRedirection";

const URLRedirectionComponent = () => {
  const { selectedPackage } = usePackage();
  
  const [targetUrl, setTargetUrl] = useState("");
  const [targetBlockUrl, setTargetBlockUrl] = useState("");
  const [redirectionCheckUrl, setRedirectionCheckUrl] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: number]: boolean}>({});
  const [copiedShortenedStates, setCopiedShortenedStates] = useState<{[key: number]: boolean}>({});

  // Copy states for URL fields
  const [copiedTargetUrl, setCopiedTargetUrl] = useState(false);
  const [copiedBlockUrl, setCopiedBlockUrl] = useState(false);

  // Edit states for URL fields
  const [isEditingTargetUrl, setIsEditingTargetUrl] = useState(false);
  const [isEditingBlockUrl, setIsEditingBlockUrl] = useState(false);

  // Temporary values for editing
  const [tempTargetUrl, setTempTargetUrl] = useState("");
  const [tempTargetBlockUrl, setTempTargetBlockUrl] = useState("");

  // Loading states for mutations
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const [isCheckingRedirection, setIsCheckingRedirection] = useState(false);

  // Query hook for URL redirection data
  const { data: urlRedirectionData, isLoading: isLoadingUrlRedirection } = 
    useGetUrlRedirection(selectedPackage, !!selectedPackage);

  // Update state when data is fetched
  useEffect(() => {
    if (urlRedirectionData?.data && Array.isArray(urlRedirectionData.data)) {
      const data = urlRedirectionData.data;
      const targetUrlData = data.find(item => item?.["Target URL"]);
      const blockUrlData = data.find(item => item?.["Target Block URL"]);
      
      if (targetUrlData?.["Target URL"]) {
        const targetUrl = targetUrlData["Target URL"] || "";
        setTargetUrl(targetUrl);
        setTempTargetUrl(targetUrl);
      }
      
      if (blockUrlData?.["Target Block URL"]) {
        const blockUrl = blockUrlData["Target Block URL"] || "";
        setTargetBlockUrl(blockUrl);
        setTempTargetBlockUrl(blockUrl);
      }
      
      setApiError(null);
    }
  }, [urlRedirectionData]);

  // Generate URL rows management
  const [generateUrlRows, setGenerateUrlRows] = useState([
    { id: 1, inputUrl: "", generatedUrl: "", isLoading: false },
  ]);

  // Shortened URL rows management
  const [shortenedUrlRows, setShortenedUrlRows] = useState([
    { id: 1, inputUrl: "", generatedUrl: "", isLoading: false },
  ]);

  // Redirection check results
  const [redirectionResults, setRedirectionResults] = useState<
    RedirectionResult[]
  >([]);

  // Table column definitions
  const redirectionCheckColumns = [
    { title: "URL", key: "URL" },
    { title: "Status", key: "status" },
    { title: "Status Code", key: "status_code" },
  ];

  const handleAddUrlRow = () => {
    if (!generateUrlRows?.length) {
      setGenerateUrlRows([{ id: 1, inputUrl: "", generatedUrl: "", isLoading: false }]);
      return;
    }
    const newId = Math.max(...generateUrlRows.map((row) => row?.id || 0), 0) + 1;
    setGenerateUrlRows((prev) => [
      ...prev,
      { id: newId, inputUrl: "", generatedUrl: "", isLoading: false },
    ]);
  };

  const handleRemoveUrlRow = (id: number) => {
    if (generateUrlRows?.length && generateUrlRows.length > 1) {
      setGenerateUrlRows((prev) => prev.filter((row) => row?.id !== id));
    }
  };

  const handleInputUrlChange = (id: number, value: string) => {
    setGenerateUrlRows((prev) =>
      prev.map((row) => (row?.id === id ? { ...row, inputUrl: value || "" } : row))
    );
  };

  const handleGenerateUrl = async (id: number) => {
    if (!selectedPackage) return;
    const row = generateUrlRows?.find(r => r?.id === id);
    if (!row?.inputUrl) return;

    // Set loading state for this specific row
    setGenerateUrlRows((prev) =>
      prev.map((r) =>
        r?.id === id ? { ...r, isLoading: true } : r
      )
    );

    try {
      const response = await generateUrlApi({
        package_name: selectedPackage,
        urls: [row.inputUrl]
      });

      // Update the row with the generated URL
      setGenerateUrlRows((prev) =>
        prev.map((r) =>
          r?.id === id
            ? {
                ...r,
                generatedUrl: response?.[0]?.wrapped_url || "",
                isLoading: false,
              }
            : r
        )
      );
      setApiError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate URL";
      setApiError(errorMessage);
      // Stop loading on error
      setGenerateUrlRows((prev) =>
        prev.map((r) =>
          r?.id === id ? { ...r, isLoading: false } : r
        )
      );
    }
  };

  const handleCopyUrl = async (generatedUrl: string, rowId: number) => {
    if (!generatedUrl) return;

    try {
      // Try modern clipboard API first
      if (navigator?.clipboard && window?.isSecureContext) {
        await navigator.clipboard.writeText(generatedUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = generatedUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        if (document?.body) {
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          if (document.execCommand) {
            document.execCommand('copy');
          }
          textArea.remove();
        }
      }

      // Set copied state for visual feedback
      setCopiedStates(prev => ({ ...prev, [rowId]: true }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [rowId]: false }));
      }, 2000);

    } catch (error) {
      // Silently fail - user can manually copy if needed
    }
  };

  const handleCopyUrlField = async (urlValue: string, field: 'target' | 'block') => {
    if (!urlValue) return;

    try {
      // Try modern clipboard API first
      if (navigator?.clipboard && window?.isSecureContext) {
        await navigator.clipboard.writeText(urlValue);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = urlValue;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        if (document?.body) {
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          if (document.execCommand) {
            document.execCommand('copy');
          }
          textArea.remove();
        }
      }

      // Set copied state for visual feedback
      if (field === 'target') {
        setCopiedTargetUrl(true);
        setTimeout(() => setCopiedTargetUrl(false), 2000);
      } else {
        setCopiedBlockUrl(true);
        setTimeout(() => setCopiedBlockUrl(false), 2000);
      }

    } catch (error) {
      // Silently fail - user can manually copy if needed
    }
  };

  const handleCheckRedirection = async () => {
    if (!redirectionCheckUrl || !selectedPackage) return;

    setIsCheckingRedirection(true);
    try {
      const results = await checkRedirectionApi({
        package_name: selectedPackage,
        url: redirectionCheckUrl
      });
      setRedirectionResults(results || []);
      setApiError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to check redirection";
      setApiError(errorMessage);
      setRedirectionResults([]);
    } finally {
      setIsCheckingRedirection(false);
    }
  };

  // URL field save handlers
  const handleSaveTargetUrl = async () => {
    if (!selectedPackage) return;
    setIsUpdatingUrl(true);
    try {
      await updateUrlRedirectionApi({
        package_name: selectedPackage,
        forward_url: tempTargetUrl || ""
      });
      
      // Only update state if API call was successful
      setTargetUrl(tempTargetUrl || "");
      setIsEditingTargetUrl(false);
      setApiError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update target URL";
      setApiError(errorMessage);
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const handleCancelTargetUrl = () => {
    setTempTargetUrl(targetUrl || "");
    setIsEditingTargetUrl(false);
  };

  const handleSaveBlockUrl = async () => {
    if (!selectedPackage) return;
    setIsUpdatingUrl(true);
    try {
      await updateUrlRedirectionApi({
        package_name: selectedPackage,
        block_url: tempTargetBlockUrl || ""
      });
      
      // Only update state if API call was successful
      setTargetBlockUrl(tempTargetBlockUrl || "");
      setIsEditingBlockUrl(false);
      setApiError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update block URL";
      setApiError(errorMessage);
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const handleCancelBlockUrl = () => {
    setTempTargetBlockUrl(targetBlockUrl || "");
    setIsEditingBlockUrl(false);
  };

  const handleMoveToChecker = (generatedUrl: string) => {
    if (generatedUrl) {
      setRedirectionCheckUrl(generatedUrl);
      // Optionally scroll to the URL Redirection Checker section
      const checkerSection = document?.querySelector('[data-checker-section]');
      if (checkerSection) {
        checkerSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Shortened URL handlers
  const handleAddShortenedUrlRow = () => {
    if (!shortenedUrlRows?.length) {
      setShortenedUrlRows([{ id: 1, inputUrl: "", generatedUrl: "", isLoading: false }]);
      return;
    }
    const newId = Math.max(...shortenedUrlRows.map((row) => row?.id || 0), 0) + 1;
    setShortenedUrlRows((prev) => [
      ...prev,
      { id: newId, inputUrl: "", generatedUrl: "", isLoading: false },
    ]);
  };

  const handleRemoveShortenedUrlRow = (id: number) => {
    if (shortenedUrlRows?.length && shortenedUrlRows.length > 1) {
      setShortenedUrlRows((prev) => prev.filter((row) => row?.id !== id));
    }
  };

  const handleInputShortenedUrlChange = (id: number, value: string) => {
    setShortenedUrlRows((prev) =>
      prev.map((row) => (row?.id === id ? { ...row, inputUrl: value || "" } : row))
    );
  };

  const handleGenerateShortenedUrl = async (id: number) => {
    if (!selectedPackage) return;
    const row = shortenedUrlRows?.find(r => r?.id === id);
    if (!row?.inputUrl) return;

    // Set loading state for this specific row
    setShortenedUrlRows((prev) =>
      prev.map((r) =>
        r?.id === id ? { ...r, isLoading: true } : r
      )
    );

    try {
      const response = await generateShortenedUrlApi({
        package_name: selectedPackage,
        urls: [row.inputUrl]
      });

      // Update the row with the generated shortened URL
      setShortenedUrlRows((prev) =>
        prev.map((r) =>
          r?.id === id
            ? {
                ...r,
                generatedUrl: response?.[0]?.shortend_url || "",
                isLoading: false,
              }
            : r
        )
      );
      setApiError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate shortened URL";
      setApiError(errorMessage);
      // Stop loading on error
      setShortenedUrlRows((prev) =>
        prev.map((r) =>
          r?.id === id ? { ...r, isLoading: false } : r
        )
      );
    }
  };

  const handleCopyShortenedUrl = async (generatedUrl: string, rowId: number) => {
    if (!generatedUrl) return;

    try {
      // Try modern clipboard API first
      if (navigator?.clipboard && window?.isSecureContext) {
        await navigator.clipboard.writeText(generatedUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = generatedUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        if (document?.body) {
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          if (document.execCommand) {
            document.execCommand('copy');
          }
          textArea.remove();
        }
      }

      // Set copied state for visual feedback
      setCopiedShortenedStates(prev => ({ ...prev, [rowId]: true }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedShortenedStates(prev => ({ ...prev, [rowId]: false }));
      }, 2000);

    } catch (error) {
      // Silently fail - user can manually copy if needed
    }
  };

  const handleMoveShortenedToChecker = (generatedUrl: string) => {
    if (generatedUrl) {
      setRedirectionCheckUrl(generatedUrl);
      // Scroll to checker section
      const checkerSection = document?.querySelector('[data-checker-section]');
      if (checkerSection) {
        checkerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Add state for search term
  const [searchTerm, setSearchTerm] = useState("");

const SectionHeader = ({ title }: {title:String}) => (
  <div className="flex items-center justify-center gap-2 mb-2">
        <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full dark:from-primary dark:to-white" />
        <h2 className="text-subHeader font-bold text-foreground gradient-text dark:!text-white dark:bg-none dark:[-webkit-text-fill-color:white]">
      {title}
    </h2>
        <div className="h-8 w-1 bg-gradient-to-b from-secondary to-primary rounded-full dark:from-white dark:to-primary" />
  </div>
);
  return (
    <div>
     
       <div className="w-full backdrop-blur-lg bg-background/80 dark:bg-card/80 border border-border/40 rounded-xl shadow-lg p-2 transition-all duration-300">
        <SectionHeader 
        title=" URL Redirection & Generate URL" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-1 sm:gap-2">
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* URL Redirection */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <CardTitle className="text-subBody font-semibold text-gray-900">
                    URL Redirection
                  </CardTitle>
                </div>
                <div className="space-y-3">
                  {/* Target URL */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2 sm:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                      <span className="text-subBody font-medium text-gray-700 sm:w-32 whitespace-nowrap dark:text-white">
                        Target URL :
                      </span>
                      {isEditingTargetUrl ? (
                        <Input
                          value={tempTargetUrl}
                          onChange={(e) => setTempTargetUrl(e.target.value)}
                          placeholder="Enter target URL"
                          className="flex-1 text-subBody"
                        />
                      ) : (
                        <div className="flex-1 bg-gray-50 p-2 rounded border flex items-center">
                          {isLoadingUrlRedirection ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <span className="text-subBody text-gray-900 break-all sm:truncate">
                              {targetUrl || "No URL configured"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end sm:justify-start">
                      {isEditingTargetUrl ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSaveTargetUrl}
                            className="text-xs"
                            disabled={isUpdatingUrl}
                          >
                            {isUpdatingUrl ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1 text-primary" />
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleCancelTargetUrl}
                            className="text-xs"
                            disabled={isUpdatingUrl}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyUrlField(targetUrl || "", 'target')}
                            disabled={!targetUrl}
                            className={`border-gray-200 hover:bg-gray-50 ${
                              copiedTargetUrl ? 'bg-green-50 border-green-200' : ''
                            }`}
                            title="Copy Target URL"
                          >
                            {copiedTargetUrl ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setTempTargetUrl(targetUrl || "");
                              setIsEditingTargetUrl(true);
                            }}
                          >
                            <MdEdit className="h-4 w-4 text-primary" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Target Block URL */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2 sm:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                      <span className="text-subBody font-medium text-gray-700 sm:w-32 whitespace-nowrap dark:text-white">
                        Target Block URL :
                      </span>
                      {isEditingBlockUrl ? (
                        <Input
                          value={tempTargetBlockUrl}
                          onChange={(e) =>
                            setTempTargetBlockUrl(e.target.value)
                          }
                          placeholder="Enter target block URL"
                          className="flex-1 text-subBody"
                        />
                      ) : (
                        <div className="flex-1 bg-gray-50 p-2 rounded border flex items-center">
                          {isLoadingUrlRedirection ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <span className="text-subBody text-gray-900 break-all sm:truncate">
                              {targetBlockUrl || "No URL configured"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end sm:justify-start">
                      {isEditingBlockUrl ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSaveBlockUrl}
                            className="text-xs"
                            disabled={isUpdatingUrl}
                          >
                            {isUpdatingUrl ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1 text-primary" />
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelBlockUrl}
                            className="text-xs"
                            disabled={isUpdatingUrl}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyUrlField(targetBlockUrl || "", 'block')}
                            disabled={!targetBlockUrl}
                            className={`border-gray-200 hover:bg-gray-50 ${
                              copiedBlockUrl ? 'bg-green-50 border-green-200' : ''
                            }`}
                            title="Copy Target Block URL"
                          >
                            {copiedBlockUrl ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setTempTargetBlockUrl(targetBlockUrl || "");
                              setIsEditingBlockUrl(true);
                            }}
                          >
                            <MdEdit className="h-4 w-4 text-primary" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate URL */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  <CardTitle className="text-subBody font-semibold text-gray-900">
                    Generate URL
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddUrlRow}
                    className="w-fit self-end sm:self-auto"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {generateUrlRows?.map((row) => (
                    <div key={row?.id || Math.random()} className="space-y-2">
                      {/* Mobile Layout */}
                      <div className="sm:hidden space-y-2">
                        <Input
                          value={row?.inputUrl || ""}
                          onChange={(e) =>
                            handleInputUrlChange(row?.id || 0, e.target.value || "")
                          }
                          placeholder="Enter URL"
                          className="w-full text-subBody"
                        />

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateUrl(row.id)}
                            className="flex-1 text-subBody dark:text-white"
                            size="sm"
                            disabled={row?.isLoading || !row?.inputUrl}
                          >
                            {row?.isLoading ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-2 text-primary" />
                              </>
                            ) : (
                              "Generate →"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-fit self-end sm:self-auto"
                            onClick={() => handleMoveToChecker(row?.generatedUrl || "")}
                            disabled={!row?.generatedUrl}
                            title="Move to URL Checker"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            value={row?.generatedUrl || ""}
                            placeholder="Generated URL"
                            readOnly
                            className="flex-1 text-subBody"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUrl(row?.generatedUrl || "", row?.id || 0)}
                            disabled={!row?.generatedUrl}
                            className={`border-gray-200 hover:bg-gray-50 ${
                              copiedStates?.[row?.id || 0] ? 'bg-green-50 border-green-200' : ''
                            }`}
                            title="Copy Generated URL"
                          >
                            {copiedStates?.[row?.id || 0] ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                          {generateUrlRows?.length && generateUrlRows.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveUrlRow(row?.id || 0)}
                              className=""
                            >
                              <Trash2 className="h-3 w-3 text-primary" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center gap-2">
                        <Input
                          value={row?.inputUrl || ""}
                          onChange={(e) =>
                            handleInputUrlChange(row?.id || 0, e.target.value || "")
                          }
                          placeholder="Enter URL"
                          className="flex-1 min-w-[150px]"
                        />

                        <Button
                          onClick={() => handleGenerateUrl(row?.id || 0)}
                          className="whitespace-nowrap dark:text-white"
                          size="sm"
                          disabled={row?.isLoading || !row?.inputUrl}
                        >
                          {row?.isLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-2 text-primary" />
                              Generating...
                            </>
                          ) : (
                            "Generate →"
                          )}
                        </Button>

                        <div className="flex items-center gap-1 flex-1 min-w-[150px]">
                          <Input
                            value={row?.generatedUrl || ""}
                            placeholder="Generated URL"
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUrl(row?.generatedUrl || "", row?.id || 0)}
                            disabled={!row?.generatedUrl}
                            className={`border-gray-200 hover:bg-gray-50 ${
                              copiedStates?.[row?.id || 0] ? 'bg-green-50 border-green-200' : ''
                            }`}
                            title="Copy Generated URL"
                          >
                            {copiedStates?.[row?.id || 0] ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          className="border-primary"
                          onClick={() => handleMoveToChecker(row?.generatedUrl || "")}
                          disabled={!row?.generatedUrl}
                          title="Move to URL Checker"
                        >
                          <ArrowRight className="h-3 w-3"  />
                        </Button>

                        {generateUrlRows?.length && generateUrlRows?.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveUrlRow(row?.id || 0)}
                            className=""
                          >
                            <Trash2 className="h-3 w-3 text-primary" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shortened URL Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  <CardTitle className="text-subBody font-semibold text-gray-900">
                    Shortened URL
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddShortenedUrlRow}
                    className="w-fit self-end sm:self-auto"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {shortenedUrlRows?.map((row) => (
                    <div key={row?.id || Math.random()} className="space-y-2">
                      {/* Mobile Layout */}
                      <div className="sm:hidden space-y-2">
                        <Input
                          value={row?.inputUrl || ""}
                          onChange={(e) =>
                            handleInputShortenedUrlChange(row?.id || 0, e.target.value || "")
                          }
                          placeholder="Enter URL"
                          className="w-full text-subBody"
                        />

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateShortenedUrl(row.id)}
                            className="flex-1 text-subBody dark:text-white"
                            size="sm"
                            disabled={row?.isLoading || !row?.inputUrl}
                          >
                            {row?.isLoading ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-2 text-primary" />
                              </>
                            ) : (
                              "Generate →"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-fit self-end sm:self-auto"
                            onClick={() => handleMoveShortenedToChecker(row?.generatedUrl || "")}
                            disabled={!row?.generatedUrl}
                            title="Move to URL Checker"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            value={row?.generatedUrl || ""}
                            placeholder="Shortened URL"
                            readOnly
                            className="flex-1 text-subBody"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyShortenedUrl(row?.generatedUrl || "", row?.id || 0)}
                            disabled={!row?.generatedUrl}
                            className={`border-gray-200 hover:bg-gray-50 ${
                              copiedShortenedStates?.[row?.id || 0] ? 'bg-green-50 border-green-200' : ''
                            }`}
                            title="Copy Shortened URL"
                          >
                            {copiedShortenedStates?.[row?.id || 0] ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                          {shortenedUrlRows?.length && shortenedUrlRows.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveShortenedUrlRow(row?.id || 0)}
                              className=""
                            >
                              <Trash2 className="h-3 w-3 text-primary" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center gap-2">
                        <Input
                          value={row?.inputUrl || ""}
                          onChange={(e) =>
                            handleInputShortenedUrlChange(row?.id || 0, e.target.value || "")
                          }
                          placeholder="Enter URL"
                          className="flex-1 min-w-[150px]"
                        />

                        <Button
                          onClick={() => handleGenerateShortenedUrl(row?.id || 0)}
                          className="whitespace-nowrap dark:text-white"
                          size="sm"
                          disabled={row?.isLoading || !row?.inputUrl}
                        >
                          {row?.isLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-2 text-primary" />
                              Generating...
                            </>
                          ) : (
                            "Generate →"
                          )}
                        </Button>

                        <div className="flex items-center gap-1 flex-1 min-w-[150px]">
                          <Input
                            value={row?.generatedUrl || ""}
                            placeholder="Shortened URL"
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyShortenedUrl(row?.generatedUrl || "", row?.id || 0)}
                            disabled={!row?.generatedUrl}
                            className={`border-gray-200 hover:bg-gray-50 ${
                              copiedShortenedStates?.[row?.id || 0] ? 'bg-green-50 border-green-200' : ''
                            }`}
                            title="Copy Shortened URL"
                          >
                            {copiedShortenedStates?.[row?.id || 0] ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          className="border-primary"
                          onClick={() => handleMoveShortenedToChecker(row?.generatedUrl || "")}
                          disabled={!row?.generatedUrl}
                          title="Move to URL Checker"
                        >
                          <ArrowRight className="h-3 w-3"  />
                        </Button>

                        {shortenedUrlRows?.length && shortenedUrlRows?.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveShortenedUrlRow(row?.id || 0)}
                            className=""
                          >
                            <Trash2 className="h-3 w-3 text-primary" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm" data-checker-section>
          <CardContent className="p-0">
            <div className="p-3 sm:p-6 ">
              <CardTitle className="text-subBody font-semibold mb-2 text-gray-900">
                URL Redirection Checker
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                <Input
                  value={redirectionCheckUrl}
                  onChange={(e) => setRedirectionCheckUrl(e.target.value)}
                  placeholder="Enter URL"
                  className="flex-1 text-subBody"
                />
                <Button
                  onClick={handleCheckRedirection}
                  className="whitespace-nowrap w-full sm:w-auto dark:text-white"
                  size="sm"
                  disabled={isCheckingRedirection || !redirectionCheckUrl}
                >
                  {isCheckingRedirection ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    "Check Redirection"
                  )}
                </Button>
              </div>
            </div>

            {/* Redirection Results Table */}
            {redirectionResults?.length > 0 && (
              <div className="p-2 sm:p-4 ">
                <ResizableTable
                  columns={redirectionCheckColumns}
                  data={redirectionResults as unknown as Record<string, string | number>[]}
                  isPaginated={false}
                  isSearchable={true}
                  onSearch={(term) => setSearchTerm(term || "")}
                  headerColor="#f8f9fa"
                  height={150}
                />
              </div>
            )}
          </CardContent>
        </Card>
        </div>
        </div>
        
      </div>
  );
};

export default URLRedirectionComponent; 