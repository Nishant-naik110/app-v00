import { Button } from "@/components/ui/buttonRule";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: "cloud" | "email" | "download") => void;
}

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Report</DialogTitle>
          <DialogDescription>
            Would you like to save the report to cloud or send via email? Or do
            you wish to continue downloading without exporting the report?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            {/* <Button
              onClick={() => onConfirm('cloud')}
              className="text-white bg-primary hover:bg-primary"
            >
              Save to Cloud
            </Button> */}
            <Button
              onClick={() => onConfirm("cloud")}
              variant="outline"
              className="text-primary hover:text-primary"
            >
              Send via Email or Save to Cloud
            </Button>
            {/* <Button
              onClick={() => onConfirm("download")}
              variant="outline"
              className="text-primary hover:text-primary"
            >
              Download Without Export
            </Button> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ConfirmationDialog;