export type ContactMessageStatus = "new" | "processing" | "resolved";

export interface ContactMessage {
  id: number;
  name: string;
  country: string | null;
  contact: string;
  service_type: string | null;
  preferred_date: string | null;
  message: string;
  status: ContactMessageStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContactMessageRequest {
  name: string;
  country?: string;
  contact: string;
  service_type?: string;
  preferred_date?: string;
  message: string;
}
