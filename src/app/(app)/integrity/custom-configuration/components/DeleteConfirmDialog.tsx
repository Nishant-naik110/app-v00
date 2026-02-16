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
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={isOpen || false} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Are you sure you want to delete the configuration item?
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            onClick={onCancel || (() => {})}
            className="text-white bg-primary hover:bg-primary rounded-md"
            disabled={!onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm || (() => {})}
            className="text-white bg-primary hover:bg-primary"
            disabled={!onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

