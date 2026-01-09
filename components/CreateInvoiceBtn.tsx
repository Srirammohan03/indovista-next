// components/CreateInvoiceBtn.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateInvoiceModal } from "@/components/CreateInvoiceModal";

export const CreateInvoiceBtn = ({ shipmentId }: { shipmentId: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        Create Invoice
      </Button>

      <CreateInvoiceModal
        isOpen={open}
        mode="create"
        shipmentId={shipmentId}
        onClose={() => setOpen(false)}
        onSaved={() => setOpen(false)}
      />
    </>
  );
};
