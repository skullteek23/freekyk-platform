import { cartItem } from './product.model';
export type SUCCESS = 'SUCCESS';
export type PROCESSING = 'PROCESSING';
export type DELIVERED = 'DELIVERED';
export type TRANSIT = 'TRANSIT';
export type PLACED = 'PLACED';
export type FAILED = 'FAILED';
export type CARD = 'CARD';
export type UPI = 'UPI';
export type NETBANKING = 'NETBANKING';
export interface OrderBasic {
  by: string;
  status: SUCCESS | FAILED | PROCESSING;
  payableTotal: number;
  placedOn: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  itemsDescSnap?: cartItem;
  id?: string;
}
// export interface ProductOrder {
//   pid: string;
//   name: string;
//   imgpath: string;
//   price: number;
//   category: string;
//   color: string;
//   size: number;
// }
export interface OrderAdditionalDetails {
  dateAdded: number;
  phoneNum: number;
  addressId: string;
  paymentMethod?: CARD | UPI | NETBANKING;
  OID?: string;
  id?: string;
}
