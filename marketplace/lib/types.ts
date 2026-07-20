export type CarStatus = "draft" | "published" | "sold" | "archived";
export type SubmissionStatus =
  | "new"
  | "reviewing"
  | "offer_made"
  | "accepted"
  | "declined"
  | "settled";
export type EnquiryKind = "enquiry" | "book_look";
export type EnquiryStatus = "new" | "contacted" | "closed";
export type ServiceHistory = "full" | "partial" | "none" | "unknown";

export interface CarPhoto {
  url: string;
  alt?: string;
}

export interface Car {
  id: string;
  slug: string;
  make: string;
  model: string;
  badge: string | null;
  year: number;
  price: number;
  odometer_km: number;
  body_type: string;
  transmission: string;
  fuel: string;
  drivetrain: string | null;
  colour: string | null;
  seats: number | null;
  description: string | null;
  adams_take: string | null;
  video_url: string | null;
  ppsr_clear: boolean;
  service_history: ServiceHistory;
  inspection_summary: string | null;
  photos: CarPhoto[];
  status: CarStatus;
  published_at: string | null;
  sold_at: string | null;
  source_submission_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  token: string;
  rego: string | null;
  rego_state: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  odometer_km: number | null;
  service_history: ServiceHistory | null;
  had_accidents: boolean | null;
  accident_notes: string | null;
  tyres_condition: string | null;
  interior_condition: string | null;
  mechanical_issues: string | null;
  condition_notes: string | null;
  seller_name: string;
  phone: string;
  email: string;
  suburb: string | null;
  asking_price: number | null;
  sell_timeframe: string | null;
  trade_target_car_id: string | null;
  status: SubmissionStatus;
  offer_amount: number | null;
  offer_sent_at: string | null;
  declined_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionPhoto {
  id: string;
  submission_id: string;
  path: string;
  kind: string | null;
  created_at: string;
}

export interface Valuation {
  submission_id: string;
  offer_amount: number | null;
  expected_retail: number | null;
  expected_recon: number | null;
  margin: number | null;
  notes: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  car_id: string;
  kind: EnquiryKind;
  name: string;
  phone: string;
  preferred_time: string | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
  cars?: Pick<Car, "slug" | "make" | "model" | "year" | "badge">;
}

export const CHECKLIST_ITEMS = [
  { key: "ppsr", label: "PPSR check clear" },
  { key: "payout_letter", label: "Payout letter received" },
  { key: "id_verified", label: "Seller ID verified" },
  { key: "rego_transfer", label: "Rego transfer lodged" },
  { key: "funds_cleared", label: "Funds cleared to seller" },
] as const;
export type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]["key"];

export interface SettlementChecklist {
  submission_id: string;
  ppsr_done: boolean;
  ppsr_at: string | null;
  ppsr_by: string | null;
  payout_letter_done: boolean;
  payout_letter_at: string | null;
  payout_letter_by: string | null;
  id_verified_done: boolean;
  id_verified_at: string | null;
  id_verified_by: string | null;
  rego_transfer_done: boolean;
  rego_transfer_at: string | null;
  rego_transfer_by: string | null;
  funds_cleared_done: boolean;
  funds_cleared_at: string | null;
  funds_cleared_by: string | null;
}

export interface StatusEvent {
  id: string;
  entity_type: "submission" | "car" | "enquiry";
  entity_id: string;
  from_status: string | null;
  to_status: string;
  actor: string;
  note: string | null;
  created_at: string;
}

export interface WatchlistAlert {
  id: string;
  email: string;
  make: string;
  model: string | null;
  max_price: number | null;
  active: boolean;
  last_notified_at: string | null;
  created_at: string;
}

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  offer_made: "Offer made",
  accepted: "Accepted",
  declined: "Declined",
  settled: "Settled",
};

export const SUBMISSION_STATUS_FLOW: SubmissionStatus[] = [
  "new",
  "reviewing",
  "offer_made",
  "accepted",
  "declined",
  "settled",
];
