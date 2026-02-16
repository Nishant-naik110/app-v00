// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Deep equality check for arrays
 */
export const deepEqual = (arr1: any[], arr2: any[]): boolean => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every(
    (item, index) =>
      item.checked === arr2[index].checked && item.label === arr2[index].label
  );
};

/**
 * Check if object has mutate function (type guard)
 */
export function isMutation(obj: any): obj is { mutate: Function } {
  return obj && typeof obj.mutate === "function";
}

/**
 * Download CSV from URL
 */
export const downloadCsvFromUrl = (url: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Process array response (handles both array and object with data property)
 */
export const processArrayResponse = <T>(response: T | { data: T } | T[]): T[] => {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === "object" && "data" in response && Array.isArray((response as any).data)) {
    return (response as any).data;
  }
  return [];
};

