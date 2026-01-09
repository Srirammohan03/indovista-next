"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddQuoteModal } from "@/components/AddQuoteModal";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  shipmentId: string;
  onCreated?: () => void; // optional refetch
};

export function CreateQuoteBtn({ shipmentId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <Button
        className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Quote
      </Button>

      <AddQuoteModal
        isOpen={open}
        shipmentId={shipmentId} // ✅ NEW
        onClose={() => setOpen(false)}
        onSave={async (payload) => {
          const res = await fetch("/api/quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            throw new Error(await res.text());
          }

          toast({
            title: "Quote created",
            description: "Quote generated successfully.",
          });

          setOpen(false);
          onCreated?.();
        }}
      />
    </>
  );
}
