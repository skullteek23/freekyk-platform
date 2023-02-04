export enum OrderTypes {
  season = 0,
  match = 1
}

export interface userOrder {
  by: string;
  amount: number;
  amountDue?: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  date: number,
  type: OrderTypes,
  refId: string; // will contain document id for type of purchase
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
  notes: any[];
  offer_id: string;
  receipt: string;
  status: string;
}
