export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
export type TransportMode = "SEA" | "AIR" | "ROAD";

export type QuoteListRow = {
  id: string;
  reference: string;
  customer: string;
  origin: { city: string; country: string };
  destination: { city: string; country: string };
  mode: TransportMode;
  commodity: string;
  estValue: number;
  currency: string;
  validTill: string;
  status: QuoteStatus;
};

export type QuoteCharge = {
  id?: string;
  name: string;
  chargeType: "FLAT" | "PER_UNIT";
  currencyCode: string;
  quantity?: number;
  unitLabel?: string | null;
  amount: number;
};

export type QuoteDetail = {
  id: string;
  shipmentId?: string | null;

  quoteDate: string;
  validTill: string;
  validityDays?: number | null;
  status: QuoteStatus;
  preparedBy?: string | null;

  customerName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  country: string;

  originCity: string;
  originCountry: string;
  originPortCode?: string | null;

  destCity: string;
  destCountry: string;
  destPortCode?: string | null;

  mode: TransportMode;
  commodity: string;
  incotermCode?: string | null;

  containerTypeCode?: string | null;
  containersCount?: number | null;

  temperatureRange?: string | null;

  totalWeightKg?: number | null;
  totalVolumeCbm?: number | null;
  packagesCount?: number | null;
  packagingType?: string | null;

  currencyCode: string;
  taxesIncluded: boolean;
  taxPercent: number;
  taxAmount: number;
  subtotal: number;
  total: number;

  notesIncluded?: string | null;
  notesExcluded?: string | null;
  disclaimer?: string | null;

  charges: QuoteCharge[];
};
