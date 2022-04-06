export type MEMBERSHIP = 'membership';
export type EQUIPMENT = 'equipment';
export type CONTEST = 'freestyle contest';
export type DISCOUNT_ON_CART = 'discount in percentage';
export type DISCOUNT_OFF = 'discount in exact amount';

export interface ProdBasicInfo {
  pUID: string;
  name: string;
  brand: string;
  type: string;
  price: string;
  imgpath: string;
  id?: string;
}
export interface ProdMoreInfo {
  size: number[];
  color: string[];
  desc: string;
  warrantyInfo: string;
  seller: string;
}
export interface sellerInfo {
  name: string;
  locCity: string;
  locState: string;
  licNo: string;
  addr: string;
  pincode: string;
  sUID: string;
  phNo: string;
  id?: string;
}
export interface cartItem {
  prodName: string;
  prodImgpath: string;
  prodPrice: string;
  prodId: string;
}
export interface coupon {
  code: string;
  type: DISCOUNT_ON_CART | DISCOUNT_OFF;
  discount: number;
  id?: string;
}
