import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePackage } from './PackageContext';

interface PackageSelectorProps {
  packages: string[];
  className?: string;
}

export function PackageSelector({ packages, className }: PackageSelectorProps) {
  const { selectedPackage, setSelectedPackage } = usePackage();
  
  return (
    <Select
      value={selectedPackage}
      onValueChange={(value) => {
        setSelectedPackage(value);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue className="text-subBody" placeholder="Select a package" />
      </SelectTrigger>
      <SelectContent className='w-32 ' >
        {packages.map((pkg) => (
          <SelectItem  className="text-subBody" key={pkg} value={pkg}>
            {pkg} 
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 