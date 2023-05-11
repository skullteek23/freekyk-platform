export enum OrderTypes {
  season = 0,
  match = 1
}

export interface ICheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: () => Promise<any>;
  description?: string;
  image?: string;
  partial_payment?: boolean;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: string;
    partial_payment?: boolean;
  },
  notes?: Partial<IOrderNotes>;
  theme?: {
    hide_topbar?: boolean;
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    backdropclose?: boolean;
    escape?: boolean;
    handleback?: boolean;
    confirm_close?: boolean;
    ondismiss?: () => {};
    animation?: boolean;
  };
  customer_id?: string;
  timeout?: number;
  remember_customer?: boolean;
  send_sms_hash?: boolean;
  allow_rotation?: boolean;
  retry?: {
    enabled?: boolean;
  };
}

export enum IItemType {
  pickupSlot = 0,
  pointsPurchase = 1,
  leagueOrKnockout = 2,
  pickupSlotWaiting = 3,
}

export interface IOrderNotes {
  itemID: string;
  itemName: string;
  itemQty: number;
  itemCancelledQty: number;
  itemType: IItemType;
  logs: string[];
  pointsUsed?: number;
  cashPending?: number;
  seasonID?: string;
  seasonName?: string;
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
