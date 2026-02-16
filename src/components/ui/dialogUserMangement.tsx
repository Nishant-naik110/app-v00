"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import PasswordInput from "@/components/ui/PasswordInput"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { MultiSelect } from "@/components/ui/multi-select"
import { Loader2 } from "lucide-react"

type FieldType = "input" | "select" | "password" | "delete" | "switch";

interface Field {
  name: string;
  label: string;
  type: FieldType;
  disabled?: boolean;
  dependsOn?: string;
  onDependencyChange?: (value: string) => void;
  options?: SelectOption[];
  className?: string;
  validation?: {
    pattern?: {
      value: RegExp;
      message: string;
    };
    required?: string;
  };
  isMultiple?: boolean;
  description?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  open?: boolean;
  setOpen: (val: boolean) => void;
  fields?: Field[];
  onSubmit: (data: Record<string, string>) => void;
  DialogTitles?: string;
  defaultValues?: Record<string, string>;
  dialogMode?: string;
  isViewMode: boolean;
  onDelete?: () => void;
  viewProduct?: boolean;
  setViewProduct?: (val: boolean) => void;
  isSubmitting?: boolean;
  buttonClass?: string;
  saveButtonText?: string;
}

const ReusableDialog = ({
  open,
  setOpen,
  fields = [],
  onSubmit,
  DialogTitles,
  defaultValues,
  dialogMode,
  isViewMode,
  onDelete,
  viewProduct = false,
  setViewProduct,
  isSubmitting,
  buttonClass = "bg-primary text-white hover:bg-primary/90",
  saveButtonText = "Save"
}:Props) => {
  // Create schema from fields
  const schema = z.object(
    fields.reduce(
      (acc, field) => {
        if (field.type === "select" || field.type === "input" || field.type === "password") {
          let fieldSchema = z.string();
          
          if (field.validation?.required) {
            fieldSchema = fieldSchema.min(1, field.validation.required);
          }
          
          if (field.validation?.pattern && !field.isMultiple) {
            fieldSchema = fieldSchema.regex(
              field.validation.pattern.value,
              field.validation.pattern.message
            );
          }
          
          acc[field.name] = fieldSchema;
        }
        return acc;
      },
      {} as Record<string, z.ZodTypeAny>,
    ),
  )

  // Create default values
  const computedDefaultValues = useMemo(() => {
    return fields.reduce(
      (acc, field) => {
        acc[field.name] = defaultValues?.[field.name] || ""
        return acc
      },
      {} as Record<string, string>,
    )
  }, [fields, defaultValues])

  // Set up form
  type FormData = Record<string, string>;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: computedDefaultValues,
  })

  useEffect(() => {
  if (defaultValues) {
    reset(defaultValues); // <- this ensures it updates when dialog is reopened with new data
  }
}, [defaultValues, reset]);

useEffect(() => {
  console.log("Received new defaultValues:", defaultValues);
}, [defaultValues]);
  // Watch all fields for dependencies
  const formValues = watch()

 const handleFieldChange = (field: Field, e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value;
  
  // Let react-hook-form handle the value change first
  register(field.name).onChange(e);

  // Check if this field has any dependents
  const hasDependents = fields.some(f => f.dependsOn === field.name);
  
  if (hasDependents) {
    // Find all fields that depend on this field
    const dependentFields = fields.filter(f => f.dependsOn === field.name);
    
    // Create an object with current values
    const newValues = { ...formValues, [field.name]: value };
    
    // Clear only dependent fields
    dependentFields.forEach(depField => {
      newValues[depField.name] = "";
      
      // If the dependent field itself has dependents, clear those too
      const nestedDependents = fields.filter(f => f.dependsOn === depField.name);
      nestedDependents.forEach(nestedDep => {
        newValues[nestedDep.name] = "";
      });
    });
    
    // Update form with new values
    reset(newValues);
  }

  // Call the dependency change handler if it exists
  if (field.onDependencyChange) {
    field.onDependencyChange(value);
  }
}
  // Handle dialog close
  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset(computedDefaultValues);
    }
    setOpen(newOpen);
  }

  // Reset form only when dialog opens initially
  useEffect(() => {
    if (open && Object.values(formValues).every(v => !v)) {
      reset(computedDefaultValues);
    }
  }, [open, reset, computedDefaultValues, formValues])

  // Handle form submission
  const onFormSubmit = async (data: Record<string, string>) => {
    if (isSubmitting) return; // Prevent multiple submissions
    onSubmit(data);
  }

  const renderField = (field: Field) => {
    const isFieldDisabled = field.disabled || isViewMode;
    const error = errors[field.name];

    // Common input styles for view mode
    const viewModeStyles = isViewMode 
      ? "text-foreground bg-muted cursor-default hover:cursor-default focus:outline-none border-none" 
      : "";

    switch (field.type) {
      case "password":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: passwordField }) => (
              <PasswordInput
                id={passwordField.name}
                value={passwordField.value || ""}
                onChange={passwordField.onChange}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                readOnly={isFieldDisabled}
              />
            )}
          />
        )
      case "input":
        return (
          <Input
            id={field.name}
            {...register(field.name)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            disabled={isFieldDisabled}
            className={cn(
              "w-full h-10",
              viewModeStyles,
              isViewMode && "text-foreground opacity-100",
              field.className,
              error && "border-destructive"
            )}
          />
        )
      case "select":
        if (field.isMultiple === true) {
          return (
            <div className="space-y-1">
              <Controller
                name={field.name}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <MultiSelect
                    options={field.options?.map(opt => ({
                      label: opt.label,
                      value: opt.value
                    })) || []}
                    onValueChange={(values) => {
                      onChange(values.join(','));
                      if (field.onDependencyChange) {
                        field.onDependencyChange(values.join(','));
                      }
                    }}
                    defaultValue={value ? value.split(',') : []}
                    placeholder={`Select ${field.label}`}
                    className={cn(
                      "w-full",
                      viewModeStyles,
                      isViewMode && "text-foreground opacity-100",
                      field.className,
                      error && "border-destructive"
                    )}
                    disabled={isFieldDisabled}
                  />
                )
              }
              />
              {field.description && (
                <p className="text-subBody text-muted-foreground">{field.description}</p>
              )}
            </div>
          )
        }
        return (
         <div className="space-y-1">
  <select
    id={field.name}
    value={formValues[field.name] ?? ""} // ✅ watch() value ensures it reflects current state
    {...register(field.name)}
    disabled={isFieldDisabled}
    onChange={(e) => {
      // Let react-hook-form handle it first
      register(field.name).onChange(e);

      // Custom handler for field dependencies
      handleFieldChange(field, e);
    }}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-subBody ring-offset-background file:border-0 file:bg-transparent file:text-subBody file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      viewModeStyles,
      isViewMode && "text-foreground opacity-100",
      field.className,
      error && "border-destructive"
    )}
  >
    <option value="">Select {field.label}</option>
    {field.options?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>

  {field.description && (
    <p className="text-subBody text-muted-foreground">{field.description}</p>
  )}
</div>

        )
      case "switch":
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Switch
                id={field.name}
                {...register(field.name)}
                disabled={isFieldDisabled}
                className={cn(
                  isViewMode && "data-[state=checked]:bg-muted-foreground",
                  field.className
                )}
              />
              {field.description && (
                <Label htmlFor={field.name} className="text-subBody font-normal">
                  {field.description || ""}
                </Label>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className={cn(
        "rounded-lg",
        fields.length > 6 ? "sm:max-w-[1000px]" : "sm:max-w-[500px]"
      )}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {DialogTitles}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid gap-6 py-4">
            <div className={cn(
              "grid gap-x-8 gap-y-4",
              fields.length > 6 ? "grid-cols-2" : "grid-cols-1"
            )}>
              {fields.map((field) => {
                const isFieldDisabled = field.disabled || isViewMode;
                return (
                  <div key={field.name} className="flex flex-col space-y-2">
                    <Label htmlFor={field.name} className="text-left font-medium">
                      {field.label}
                    </Label>
                    <div className="w-full">
                      {field.type === "switch" ? (
                        <div className="flex items-center space-x-2 h-10">
                          <Switch
                            id={field.name}
                            {...register(field.name)}
                            disabled={isFieldDisabled}
                            className={cn(
                              isViewMode && "data-[state=checked]:bg-muted-foreground",
                              field.className
                            )}
                          />
                          <Label htmlFor={field.name} className="text-subBody font-normal">
                            {field.description || ""}
                          </Label>
                        </div>
                      ) : (
                        renderField(field)
                      )}
                      {errors[field.name] && (
                        <span className="text-subBody font-medium text-destructive mt-1">
                          {errors[field.name]?.message}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {!isViewMode && (
              <Button 
                type="submit" 
                className={cn(
                  buttonClass,
                  "min-w-[100px] bg-primary text-white hover:bg-primary/300"
                )}
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  saveButtonText
                )}
              </Button>
            )}
            <Button
              type="button"
              variant={isViewMode ? "default" : "default"}
              onClick={() => setOpen(false)}
              className="min-w-[100px]"
              disabled={isSubmitting}
            >
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {onDelete && !isViewMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                className="min-w-[100px]"
                disabled={isSubmitting}
              >
                Delete
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReusableDialog