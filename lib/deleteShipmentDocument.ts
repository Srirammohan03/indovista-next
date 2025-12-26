import fs from "fs/promises";
import path from "path";

export async function deleteShipmentDocument(
  shipmentId: string,
  fileUrl: string
) {
  /* =========================
     ✅ VERCEL (Blob delete)
     ========================= */
  if (process.env.BLOB_READ_WRITE_TOKEN && fileUrl.startsWith("http")) {
    const { del } = await import("@vercel/blob");
    await del(fileUrl);
    return;
  }

  /* =========================
     ✅ VPS / LOCAL filesystem
     ========================= */
  if (!fileUrl.startsWith("/uploads/")) return;

  const abs = path.join(process.cwd(), "public", fileUrl);

  const safeRoot = path.join(
    process.cwd(),
    "public",
    "uploads",
    "shipments",
    shipmentId
  );

  if (!abs.startsWith(safeRoot)) return;

  try {
    await fs.unlink(abs);
  } catch {
    // ignore missing file
  }
}
