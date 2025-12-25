"use client";
import React from "react";
import { FileText } from "lucide-react";

type Props = {
  shipmentId: string;
};

export const CreateInvoiceButton: React.FC<Props> = ({ shipmentId }) => {
  const handleCreateInvoice = () => {
    // Open global CreateInvoiceModal with pre-selected shipment
    // Since modal is in BillingPage, we can use a simple redirect or event
    // For simplicity, redirect to billing with pre-select
    window.location.href = `/billing?createForShipment=${shipmentId}`;
  };

  return (
    <button
      onClick={handleCreateInvoice}
      className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-2"
    >
      <FileText className="w-4 h-4" />
      Create Invoice
    </button>
  );
};