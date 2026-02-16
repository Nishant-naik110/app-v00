import type { CreateTicketForm, CreateTicketFormErrors, EditTicketFormErrors } from "../types";

export const validateCreateForm = (form: CreateTicketForm): CreateTicketFormErrors => {
  const errors: CreateTicketFormErrors = {};
  
  if (!form.project?.trim()) {
    errors.project = "Package is required";
  }
  if (!form.tracker?.trim()) {
    errors.tracker = "Tracker is required";
  }
  if (!form.subject?.trim()) {
    errors.subject = "Subject is required";
  }
  if (!form.description?.trim()) {
    errors.description = "Description is required";
  }
  if (!form.status?.trim()) {
    errors.status = "Status is required";
  }
  if (!form.priority?.trim()) {
    errors.priority = "Priority is required";
  }
  if (!form.assignee?.trim()) {
    errors.assignee = "Assignee is required";
  }
  
  // Enhanced due date validation
  if (!form.due_date?.trim()) {
    errors.due_date = "Due date is required";
  } else {
    const dueDate = new Date(form.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (isNaN(dueDate.getTime())) {
      errors.due_date = "Please enter a valid date";
    } else if (dueDate < today) {
      errors.due_date = "Due date cannot be in the past";
    }
  }
  
  if (form.estimate_time === undefined || form.estimate_time <= 0) {
    errors.estimate_time = "Estimate time must be greater than 0";
  }
  if (!form.percent_done?.trim()) {
    errors.percent_done = "Percent done is required";
  }
  
  return errors;
};

export const validateEditForm = (form: CreateTicketForm): EditTicketFormErrors => {
  const errors: EditTicketFormErrors = {};
  
  if (!form.project?.trim()) {
    errors.project = "Package is required";
  }
  if (!form.tracker?.trim()) {
    errors.tracker = "Tracker is required";
  }
  if (!form.subject?.trim()) {
    errors.subject = "Subject is required";
  }
  if (!form.description?.trim()) {
    errors.description = "Description is required";
  }
  if (!form.status?.trim()) {
    errors.status = "Status is required";
  }
  if (!form.priority?.trim()) {
    errors.priority = "Priority is required";
  }
  
  // Enhanced due date validation for editing
  if (!form.due_date?.trim()) {
    errors.due_date = "Due date is required";
  } else {
    const dueDate = new Date(form.due_date);
    
    if (isNaN(dueDate.getTime())) {
      errors.due_date = "Please enter a valid date";
    }
    // Remove the past date validation for editing - allow existing past dates to be preserved
  }
  
  if (form.estimate_time === undefined || form.estimate_time <= 0) {
    errors.estimate_time = "Estimate time must be greater than 0";
  }
  if (!form.percent_done?.trim()) {
    errors.percent_done = "Percent done is required";
  }
  
  return errors;
};

