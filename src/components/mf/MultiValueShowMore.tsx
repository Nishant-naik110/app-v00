import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MultiValueShowMoreProps {
  values: string[];
  maxVisible?: number;
  showSearch?: boolean;
}

const MultiValueShowMore = ({ 
  values, 
  maxVisible = 5, 
  showSearch = false 
}: MultiValueShowMoreProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!Array.isArray(values) || values.length === 0) return null;

  const visible = values.slice(0, maxVisible);
  const hidden = values.length > maxVisible ? values.slice(maxVisible) : [];

  // Filter hidden values based on search term
  const filteredHidden = showSearch 
    ? hidden.filter(val => 
        val.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : hidden;

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Badge clicked, hidden values:', hidden);
    setOpen(!open);
  };

  return (
    <div className="flex flex-wrap gap-1 relative">
      {visible.map((val, idx) => (
        <Badge
          key={idx}
          variant="secondary"
          className="bg-white text-black border border-gray-200"
        >
          {val}
        </Badge>
      ))}
      {hidden.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="h-6 px-2 text-xs bg-primary text-primary-foreground hover:bg-primary hover:text-white cursor-pointer"
              onClick={handleBadgeClick}
              type="button"
            >
              +{hidden.length} more
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-4 z-[9999]" 
            side="bottom" 
            align="start"
            sideOffset={5}
          >
            {showSearch && (
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
              {filteredHidden.length > 0 ? (
                filteredHidden.map((val, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-white text-black border border-gray-200"
                  >
                    {val}
                  </Badge>
                ))
              ) : showSearch && searchTerm ? (
                <div className="text-subBody text-muted-foreground">
                  No packages found matching "{searchTerm}"
                </div>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
export default MultiValueShowMore; 