"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React,{useEffect} from 'react';
import { cn } from "@/lib/utils"


type DeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  button_yes?: string;
  button_no?: string;
  description?: string;
  isSubmitting?: boolean;
  buttonClass?:string;
};

const DeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
  button_yes = 'Delete',
  button_no = 'Cancel',
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item?",
  isSubmitting,
  buttonClass
}:DeleteDialogProps) => {
  //   useEffect(() => {
  //   if (open) {
  //     // 🔁 Reset logic when dialog opens
  //     // For example, reset form states or temporary values here
  //     console.log("Dialog opened, reset if needed.");
  //   }
  // }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={cn(
                              buttonClass,
                              "min-w-[100px] bg-primary rounded-full text-white hover:bg-primary/300"
                            )}
            disabled={isSubmitting}
          >
            {button_no}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className={cn(
                              buttonClass,
                              "min-w-[100px] rounded-full bg-primary text-white hover:bg-primary/300"
                            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 {button_yes}...
              </>
            ) : (
              button_yes
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;