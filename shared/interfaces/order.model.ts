export enum OrderTypes {
  season = 0,
  match = 1
}

export interface RazorPayOrder {
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  created_at: number;
  currency: string;
  entity: string;
  id: string;
  status: string;
  razorpay_payment_id: string;
  seasonID: string;
  notes?: any[];
  offers?: any[];
  offer_id?: string;
  receipt?: string;
  type?: OrderTypes;
}
