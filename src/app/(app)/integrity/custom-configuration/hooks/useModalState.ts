// Custom hook for managing modal states

import { useState, useCallback } from 'react';

export const useModalState = () => {
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);

  const openRuleModal = useCallback(() => {
    setIsRuleModalOpen(true);
  }, []);

  const closeRuleModal = useCallback(() => {
    setIsRuleModalOpen(false);
  }, []);

  const openViewModal = useCallback(() => {
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
  }, []);

  const openMappingModal = useCallback(() => {
    setIsMappingModalOpen(true);
  }, []);

  const closeMappingModal = useCallback(() => {
    setIsMappingModalOpen(false);
  }, []);

  return {
    // State
    isRuleModalOpen,
    isViewModalOpen,
    isMappingModalOpen,
    // Direct setters (for onOpenChange handlers)
    setIsRuleModalOpen,
    setIsViewModalOpen,
    setIsMappingModalOpen,
    // Convenience methods
    openRuleModal,
    closeRuleModal,
    openViewModal,
    closeViewModal,
    openMappingModal,
    closeMappingModal,
  };
};

