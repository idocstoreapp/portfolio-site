export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'replied'
  | 'diagnostic_completed'
  | 'proposal_sent'
  | 'negotiating'
  | 'won'
  | 'lost'
  | 'converted';

export interface Lead {
  id: string;
  name: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  category: string | null;
  google_maps_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  score: number | null;
  status: LeadStatus | string;
  source: string | null;
  diagnostic_id: string | null;
  proposal_id: string | null;
  /** URL del PDF de la propuesta (viene del backend cuando el lead tiene proposal_id) */
  pdf_url?: string | null;
  created_at: string;
}
