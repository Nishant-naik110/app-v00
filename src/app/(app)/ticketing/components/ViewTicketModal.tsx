"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Clock } from "lucide-react";
import type { Ticket } from "@/components/mf/ReportingToolTable";
import type { TicketLogData } from "../types";
import { TicketOverview } from "./TicketOverview";
import { ActivityHistory } from "./ActivityHistory";
import { normalizeStatus } from "../utils/helpers";

interface ViewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: Ticket | null;
  selectedTicketLogs: TicketLogData[];
  ticketLogApi: any;
  currentTicketId: string | null;
  editingTicket: Ticket | null;
}

export const ViewTicketModal = ({
  isOpen,
  onClose,
  selectedTicket,
  selectedTicketLogs,
  ticketLogApi,
  currentTicketId,
  editingTicket,
}: ViewTicketModalProps) => {
  if (!selectedTicket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden p-0 sm:p-6"
        aria-describedby="view-ticket-description"
      >
        <div id="view-ticket-description" className="sr-only">
          View ticket activity history
        </div>

        <div className="w-full flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
            <div className="space-y-6 sm:space-y-8">
              {/* Ticket Overview Section */}
              <TicketOverview
                editingTicket={selectedTicket}
                selectedTicketLogs={selectedTicketLogs}
                normalizeStatus={normalizeStatus}
              />

              {/* History Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-body sm:text-xl font-bold text-gray-900 dark:text-white">
                      Activity History
                    </h3>
                    <p className="text-xs sm:text-subBody text-gray-600 dark:text-gray-400">
                      Track all changes and updates to this ticket
                    </p>
                  </div>
                </div>
              </div>

              <ActivityHistory
                ticketLogApi={ticketLogApi}
                currentTicketId={currentTicketId}
                selectedTicketLogs={selectedTicketLogs}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

