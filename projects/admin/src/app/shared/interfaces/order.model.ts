import { Timestamp } from '@firebase/firestore-types';
import { cartItem } from './product.model';
export type DELIVERED = 'order is delivered';
export type TRANSIT = 'order in transit';
export type PLACED = 'order is placed';
export type FAILED = 'order error';
export type CARD = 'payment with card';
export type UPI = 'payment with upi';
export type NETBANKING = 'payment with netbanking';
export interface OrderBasic {
  orderedByUID: string;
  orderStatus: DELIVERED | TRANSIT | PLACED | FAILED;
  total: number;
  placedOn: Timestamp;
  prodCount: number;
  lastProduct: cartItem;
  paymentId?: string;
  order_ID?: string;
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
  dateAdded: Timestamp;
  phoneNum: number;
  addressId: string;
  paymentMethod?: CARD | UPI | NETBANKING;
  OID?: string;
  id?: string;
}
