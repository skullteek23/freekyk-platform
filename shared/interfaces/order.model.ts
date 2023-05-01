export enum OrderTypes {
  season = 0,
  match = 1
}

export interface IOrderNotes {
  associatedEntityID: string;
  associatedEntityName: string;
  purchaseQty: number;
  cancelledQty: number;
  qtyEntityID: string;
  logs: string[];
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
  notes?: Partial<IOrderNotes>;
  offers?: any[];
  offer_id?: string;
  receipt?: string;
  description?: string;
}

export interface IRefundOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: any[];
  receipt: string;
  acquirer_data: any;
  created_at: number;
  batch_id: string;
  status: string;
  speed_processed: string;
  speed_requested: string;
}
