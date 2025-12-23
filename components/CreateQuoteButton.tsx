"use client";

import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateQuoteButton({ shipmentId }: { shipmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId }),
      });

      if (!res.ok) {
        alert(await res.text());
        return;
      }

      const data = await res.json(); // { id }
      router.push(`/quotes?open=${encodeURIComponent(data.id)}`); // opens edit modal automatically
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={createQuote}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
      Create Quote
    </button>
  );
}
