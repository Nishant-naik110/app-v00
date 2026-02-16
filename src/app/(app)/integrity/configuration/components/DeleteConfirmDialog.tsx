import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog = ({
  isOpen,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()} >
      <DialogContent className="dark:text-white">
        <DialogHeader>
          <DialogTitle >{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{message}</div>
        <DialogFooter>
          <Button
            onClick={onCancel}
            disabled={isDeleting}
            size="sm"
            
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            size="sm"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

