'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PackageContextType {
  selectedPackage: string;
  setSelectedPackage: (pkg: string | { PackageName: string }) => void;
  isPackageLoading: boolean;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export function PackageProvider({ children }: { children: React.ReactNode }) {
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [isPackageLoading, setIsPackageLoading] = useState(true);

  useEffect(() => {
    // Load saved package on mount
    const savedPackage = localStorage.getItem('selectedPackage');
    if (savedPackage) {
      // Ensure savedPackage is a string, not an object
      try {
        const parsed = JSON.parse(savedPackage);
        if (typeof parsed === 'string') {
          setSelectedPackage(parsed);
        } else if (parsed && typeof parsed === 'object' && parsed.PackageName) {
          setSelectedPackage(parsed.PackageName);
        }
      } catch {
        // If it's not JSON, treat it as a string
        if (typeof savedPackage === 'string') {
          setSelectedPackage(savedPackage);
        }
      }
    }
    setIsPackageLoading(false);
  }, []);

  const updateSelectedPackage = (pkg: string | { PackageName: string }) => {
    // Ensure pkg is a string
    let packageString = '';
    
    if (typeof pkg === 'string') {
      packageString = pkg;
    } else if (pkg && typeof pkg === 'object' && pkg.PackageName) {
      packageString = pkg.PackageName;
    }
    
    // Only update if we have a valid string
    if (packageString) {
      console.log('Setting selected package to:', packageString);
      setSelectedPackage(packageString);
      localStorage.setItem('selectedPackage', packageString);
    }
  };

  return (
    <PackageContext.Provider value={{ selectedPackage, setSelectedPackage: updateSelectedPackage, isPackageLoading }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackage() {
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error('usePackage must be used within a PackageProvider');
  }
  return context;
} 