"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import EllipsisTooltip from "@/components/mf/EllipsisTooltip"

// Generic types for dynamic configuration
interface FieldConfig {
  name: string
  label: string
  placeholder: string
  required: boolean
  disabled?: boolean
  dependsOn?: string
  width?: string
  showOnlyForFirstRow?: boolean
}

interface OptionData {
  value: string
  label: string
  disabled?: boolean
}

interface DynamicSelectData {
  [fieldName: string]: {
    [rowIndex: number]: OptionData[]
  }
}

interface LoadingStates {
  [rowIndex: number]: boolean
}

interface ValidationConfig {
  userField: {
    name: string
    message: string
  }
  dynamicFields: {
    name: string
    minItems: number
    message: string
    fields: {
      [key: string]: {
        message: string
      }
    }
  }
}

interface DynamicFieldValues {
  [key: string]: string;
}

interface FormValues {
  [key: string]: string | DynamicFieldValues[];
}

interface DynamicFormDialogProps {
  // Dialog configuration
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string

  // Form configuration
  userFieldConfig: FieldConfig
  dynamicFieldsConfig: FieldConfig[]
  validationConfig: ValidationConfig

  // Data
  staticData: {
    [fieldName: string]: OptionData[]
  }
  dynamicData: DynamicSelectData
  loadingStates: LoadingStates
  globalLoading?: boolean

  // Callbacks
  onSubmit: (data: any) => void
  onFieldChange: (fieldName: string, value: string, rowIndex: number, formSetValue: any) => void
  onUserSelect?: (value: string) => void
  handleAddField?: () => void

  // UI Configuration
  labels: {
    cancel: string
    submit: string
    loading: string
    noDataFound: string
    actions: string
  }

  // Button configuration
  addButtonConfig?: {
    icon?: React.ReactNode
    className?: string
  }
  removeButtonConfig?: {
    icon?: React.ReactNode
    className?: string
  }
}

const DynamicFormDialog = ({
  open,
  onOpenChange,
  title,
  userFieldConfig,
  dynamicFieldsConfig,
  validationConfig,
  staticData,
  dynamicData,
  loadingStates,
  globalLoading = false,
  onSubmit,
  onFieldChange,
  onUserSelect,
  handleAddField,
  labels,
  addButtonConfig,
  removeButtonConfig,
}: DynamicFormDialogProps) => {
  // Create dynamic validation schema
  const createValidationSchema = () => {
    const fieldsSchema: { [key: string]: z.ZodType<any> } = {}

    dynamicFieldsConfig.forEach((field) => {
      fieldsSchema[field.name] = field.required
        ? z.string().min(1, validationConfig.dynamicFields.fields[field.name]?.message || `${field.label} is required`)
        : z.string().optional()
    })

    return z.object({
      [userFieldConfig.name]: z.string().min(1, validationConfig.userField.message),
      [validationConfig.dynamicFields.name]: z
        .array(z.object(fieldsSchema))
        .min(validationConfig.dynamicFields.minItems, validationConfig.dynamicFields.message),
    })
  }

  const formSchema = createValidationSchema()

  // Create default values
  const createDefaultValues = () => {
    const defaultFieldValues: DynamicFieldValues = {}
    dynamicFieldsConfig.forEach((field) => {
      defaultFieldValues[field.name] = ""
    })

    return {
      [userFieldConfig.name]: "",
      [validationConfig.dynamicFields.name]: [defaultFieldValues],
    }
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(),
  })

  const { control, watch, reset, setValue, getValues, trigger } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: validationConfig.dynamicFields.name as keyof FormValues,
  })

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset(createDefaultValues())
    }
  }, [open, reset])

  const handleAddNewField = () => {
    const defaultFieldValues: DynamicFieldValues = {}
    dynamicFieldsConfig.forEach((field) => {
      defaultFieldValues[field.name] = ""
    })
    append(defaultFieldValues)
    if (handleAddField) {
      handleAddField()
    }
  }

  const handleRemoveField = (index: number) => {
    if (fields.length > 1) remove(index)
  }

  const userSelected = watch(userFieldConfig.name as any) ? true : false

  const isRowComplete = (index: number) => {
    const fieldsData = getValues(validationConfig.dynamicFields.name) as DynamicFieldValues[]
    if (!fieldsData?.[index]) return false

    return dynamicFieldsConfig.every((fieldConfig) => {
      if (!fieldConfig.required) return true
      return fieldsData[index][fieldConfig.name] !== ""
    })
  }

  const areAllRowsComplete = () => {
    const fieldsData = getValues(validationConfig.dynamicFields.name) as DynamicFieldValues[]
    if (!fieldsData || fieldsData.length === 0) return false

    return fieldsData.every((field: DynamicFieldValues, index: number) => isRowComplete(index))
  }

  const isFormValid = userSelected && areAllRowsComplete()
  const lastRowIndex = watch(validationConfig.dynamicFields.name as any)?.length - 1 || 0
  const isLastRowComplete = isRowComplete(lastRowIndex)

  // Watch for field changes to trigger validation
  watch(validationConfig.dynamicFields.name as any)

  const handleSubmit = (data: FormValues) => {

    if (!data[userFieldConfig.name] || !areAllRowsComplete()) {
      trigger()
      return
    }

    onSubmit(data)

    // Reset form after successful submission
    reset(createDefaultValues())
  }

  const handleFieldChange = (fieldName: string, value: string, index: number) => {
    // Clear dependent fields only, not the current field
    const dependentFields = dynamicFieldsConfig.filter((field) => field.dependsOn === fieldName)
    dependentFields.forEach((depField) => {
      setValue(`${validationConfig.dynamicFields.name}.${index}.${depField.name}` as any, "")
    })

    // Call the parent's field change handler
    onFieldChange(fieldName, value, index, setValue)
  }

  const handleUserChange = (value: string) => {
    if (onUserSelect) {
      onUserSelect(value)
    }
  }

  const getFieldWidth = (fieldConfig: FieldConfig, isFirstField: boolean) => {
    if (fieldConfig.width) return fieldConfig.width
    if (isFirstField) return "w-full pl-2 md:w-1/5 md:mr-4 "
    return "w-full  md:flex-1 md:mx-2"
  }

  const renderSelectField = (fieldConfig: FieldConfig, index: number, isUserField = false) => {
    const fieldName = isUserField
      ? userFieldConfig.name
      : `${validationConfig.dynamicFields.name}.${index}.${fieldConfig.name}`

    // Get the parent field's value if this field depends on another
    const dependsOnValue = fieldConfig.dependsOn
      ? watch(`${validationConfig.dynamicFields.name}.${index}.${fieldConfig.dependsOn}` as any)
      : null

    // For non-user fields that depend on user, check if user is selected
    const dependsOnUser = !isUserField && fieldConfig.dependsOn === "user"
    const userValue = dependsOnUser ? watch(userFieldConfig.name) : null

    // Determine if field should be disabled
    const isDisabled = 
      fieldConfig.disabled || // Explicitly disabled via config
      (!isUserField && !userValue && fieldConfig.dependsOn === "user") || // Non-user field depending on user selection
      (fieldConfig.dependsOn && !dependsOnValue && fieldConfig.dependsOn !== "user") // Field depending on another field's value

    const options = isUserField ? staticData[userFieldConfig.name] || [] : dynamicData[fieldConfig.name]?.[index] || []
    const isLoading = !isUserField && loadingStates[index]

    // Add debug logging
    // console.log(`Rendering field ${fieldConfig.name}:`, {
    //   isUserField,
    //   dependsOnUser,
    //   userValue,
    //   dependsOnValue,
    //   isDisabled,
    //   fieldConfig
    // })

    return (
      <FormField
        control={control}
        name={fieldName as any}
        render={({ field }) => (
          <FormItem className=" pl-2 mb-0.5">
            <FormControl>
              <Select
                onValueChange={(value) => {
                  // Set the field value immediately
                  field.onChange(value)
                  
                  // Then handle the field change logic
                  if (isUserField) {
                    handleUserChange(value)
                  } else {
                    // Use setTimeout to ensure the field value is set before clearing dependent fields
                    setTimeout(() => {
                      handleFieldChange(fieldConfig.name, value, index)
                    }, 0)
                  }
                }}
                value={field.value}
                disabled={isDisabled}
              >
                <SelectTrigger className="text-subBody h-7">
                  <SelectValue placeholder={fieldConfig.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {(globalLoading && isUserField) || isLoading ? (
                    <div className="px-2 py-0.5 text-subBody text-muted-foreground ">{labels.loading}</div>
                  ) : options.length > 0 ? (
                    options.map((option, idx) => (
                      <SelectItem key={idx} value={option.value} disabled={option.disabled}>
                        {isUserField ? (
                          <EllipsisTooltip content={option.label} className="max-w-[180px]" />
                        ) : (
                          option.label
                        )}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="_no_data" disabled>
                      {labels.noDataFound}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-4">
        <DialogHeader className="font-semibold pb-1">{title}</DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="">
            <div className="hidden md:flex">
              <div className={getFieldWidth(userFieldConfig, true)}>
                <FormLabel className="font-semibold block  ml-4 text-xs">{userFieldConfig.label}</FormLabel>
              </div>
              {dynamicFieldsConfig.map((fieldConfig, idx) => (
                <div key={fieldConfig.name} className={getFieldWidth(fieldConfig, false)}>
                  <FormLabel className="font-semibold block ml-4 text-xs">{fieldConfig.label}</FormLabel>
                </div>
              ))}
              <div className="w-24 ">
                <span className="text-subBody text-transparent">{labels.actions}</span>
              </div>
            </div>

            {/* Dynamic Form Fields */}
            {fields.map((field, index, array) => (
              <div key={field.id} className="flex flex-col md:flex-row md:items-center  md:space-y-0">
                {/* User Selection Field */}
                <div className={getFieldWidth(userFieldConfig, true)}>
                  {(index === 0 || !userFieldConfig.showOnlyForFirstRow) && (
                    <div>
                      <FormLabel className="md:hidden  ml-2 text-subBody font-semibold block">
                        {userFieldConfig.label}
                      </FormLabel>
                      {renderSelectField(userFieldConfig, index, true)}
                    </div>
                  )}
                </div>

                {/* Dynamic Fields */}
                {dynamicFieldsConfig.map((fieldConfig) => (
                  <div key={fieldConfig.name} className={getFieldWidth(fieldConfig, false)}>
                    <FormLabel className="md:hidden text-subBody font-semibold block">{fieldConfig.label}</FormLabel>
                    {renderSelectField(fieldConfig, index)}
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="flex w-full justify-end md:justify-start md:w-24 md:ml-2 md:mt-0">
                  <div className="flex space-x-1">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className={removeButtonConfig?.className || "h-5 w-5"}
                        onClick={() => handleRemoveField(index)}
                        disabled={array.length <= 1 || !userSelected}
                      >
                        {removeButtonConfig?.icon || <Trash2 className="h-4 w-4" />}
                      </Button>
                    )}
                    {index === array.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={addButtonConfig?.className || "h-5 w-5 hover:text-white"}
                        onClick={handleAddNewField}
                        disabled={!userSelected || !isLastRowComplete}
                      >
                        {addButtonConfig?.icon || <Plus className="h-5 w-5 text-primary" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <DialogFooter className="mt-6 space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="default" className="bg-primary text-white hover:bg-secondary">
                  {labels.cancel}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="default"
                className="bg-primary text-white hover:bg-secondary"
                disabled={!isFormValid}
              >
                {labels.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DynamicFormDialog
