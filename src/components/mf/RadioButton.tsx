import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupDemoProps {
  // title: string;
  options: RadioOption[];
  defaultValue?: string;
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function RadioButtons({ options, defaultValue, value, onValueChange, className }: RadioGroupDemoProps) {
  // Ensure options is not empty and has valid values
  if (!options || options.length === 0) {
    return null; // Or return a placeholder/error message
  }

  return (
    <div>
      {/* <h3 className="mb-4 text-lg font-medium">{title}</h3> */}
      <RadioGroup 
        value={value !== undefined ? value : defaultValue || (options[0]?.value || '')}
        defaultValue={value === undefined ? (defaultValue || (options[0]?.value || '')) : undefined}
        className={`flex md:space-x-4 space-x-1 ${className}`}
        onValueChange={onValueChange}
      >
        {options.map((option, index) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`r${index + 1}`} />
            <Label htmlFor={`r${index + 1}`} className="text-subBody">{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

